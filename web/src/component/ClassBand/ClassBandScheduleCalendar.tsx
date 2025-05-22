import React, { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";

import {
  Period,
  SchedulePreference,
  CellInfo,
  PreferenceType,
  PendingChange,
  ChangeOperationType,
} from "@/type/Calendar/TypeCalendar";

import ScheduleCalendarHeader from "@/component/Calendar/ScheduleCalendarHeader";
import ScheduleCalendarRow from "@/component/Calendar/ScheduleCalendarRow";
import PreferenceToolbar from "@/component/Calendar/PreferenceToolbar";
import ClassPreferenceToolbar from "@/component/Class/ClassPreferenceToolbar";
import ClassBandScheduleCalendarRow from "@/component/ClassBand/ClassBandScheduleCalendarRow";
import ClassBandPreferenceToolbar from "@/component/ClassBand/ClassBandPreferenceToolbar";

import { 
  getClassBandPreferenceOptions, 
  countActiveClassBandPreferences,
  getActiveClassBandPreferenceType
} from "@/util/classBandCalendar";

import {
  setSelectedPreferenceType,
  addPendingChange,
  clearPendingChanges,
} from "@/store/Calendar/SliceCalendar";

import { useGetPeriodsQuery } from "@/store/Calendar/ApiCalendar";

interface ClassBandScheduleCalendarProps {
  selectedClassBandUuid?: string;
  classBandUuid?: string;
  selectedScheduleIds?: string[];
  onCellClick?: (cellInfo: CellInfo) => void;
  onScheduleSelect?: (scheduleIds: string[]) => void;
}

const ClassBandScheduleCalendar: React.FC<ClassBandScheduleCalendarProps> = ({
  selectedClassBandUuid,
  classBandUuid,
  selectedScheduleIds = [],
  onCellClick,
  onScheduleSelect,
}) => {
  const dispatch = useAppDispatch();

  // Create a unified variable that uses whichever prop is provided
  const actualClassBandUuid = selectedClassBandUuid || classBandUuid;

  // Use the existing calendar slice
  const { selectedPreferenceType, pendingChanges } = useAppSelector(
    (state) => state.calendar,
  );

  const [schedulePreferences, setSchedulePreferences] = useState<
    SchedulePreference[]
  >([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatingCells, setUpdatingCells] = useState<string[]>([]);
  const [currentCell, setCurrentCell] = useState<CellInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedClassBandData, setSelectedClassBandData] = useState<any>(null);

  const { data: periodsData, isLoading: isLoadingPeriods, refetch: refetchPeriods } =
    useGetPeriodsQuery(
      selectedClassBandData?.planSettingsId
      ? { planSettingsId: selectedClassBandData.planSettingsId, organizationId: selectedClassBandData.organizationId }
      : undefined
    );

  const createPreference = async (data: any) => {
    let preferenceType = data.preferenceType;
    if(data.preferenceType === PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS) {
      preferenceType = "prefers_not_to_schedule_class";
    }
    
    const response = await fetch(
      `http://localhost:8080/api/v1/class-bands/${data.classBandUuid}/preferences`,
      {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("authToken") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          periodId: data.periodId,
          dayOfWeek: data.dayOfWeek,
          preferenceType: preferenceType,
          preferenceValue: data.preferenceValue,
        }),
      },
    );

    if(!response.ok) {
      const errorText = await response.text();
      throw new Error("Failed to create preference: " + errorText);
    }

    return await response.json();
  };

  const updatePreference = async (data: any) => {
    // Set all preference fields to null except the selected one
    const preferenceFields = {
      cannotTeach: null,
      prefersToTeach: null,
      mustTeach: null,
      dontPreferToTeach: null,
    };

    if (data.preferenceType === PreferenceType.CANNOT_TEACH) {
      preferenceFields.cannotTeach = true;
    } else if (data.preferenceType === PreferenceType.PREFERS_TO_TEACH) {
      preferenceFields.prefersToTeach = true;
    } else if (data.preferenceType === PreferenceType.MUST_TEACH) {
      preferenceFields.mustTeach = true;
    } else if (data.preferenceType === PreferenceType.DONT_PREFER_TO_TEACH) {
      preferenceFields.dontPreferToTeach = true;
    }

    // Ensure periodId and dayOfWeek are present and log them
    const periodId = data.periodId;
    const dayOfWeek = data.dayOfWeek;
    console.log("Sending updatePreference request:", {
      ...preferenceFields,
      periodId,
      dayOfWeek,
      preferenceType: data.preferenceType,
      preferenceValue: true,
    });

    const response = await fetch(
      `http://localhost:8080/api/v1/class-bands/schedule-preference/${data.uuid}`,
      {
        method: "PUT",
        headers: {
          Authorization: localStorage.getItem("authToken") || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...preferenceFields,
          periodId,
          dayOfWeek,
          preferenceType: data.preferenceType,
          preferenceValue: true,
        }),
      },
    );

    if(!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error("Failed to update preference: " + errorText);
    }

    return await response.json();
  };

  const deletePreference = async (uuid: string) => {
    const response = await fetch(
      `http://localhost:8080/api/v1/class-bands/schedule-preference/${uuid}`,
      {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("authToken") || "",
          "Content-Type": "application/json",
        },
      },
    );

    if(!response.ok) {
      throw new Error("Failed to delete preference");
    }

    return await response.json();
  };

  const DAY_NAMES: { [key: number]: string } = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    7: "Sunday",
    8: "Monday (Week 2)",
    9: "Tuesday (Week 2)",
    10: "Wednesday (Week 2)",
    11: "Thursday (Week 2)",
    12: "Friday (Week 2)",
    13: "Saturday (Week 2)",
    14: "Sunday (Week 2)",
  };

  const periods = useMemo(() => {
    if(!periodsData?.data) return [];

    console.log("Filtering periods based on planSettingsId:", selectedClassBandData?.planSettingsId);

    // Filter periods to only include those matching the selected classBand's planSettingsId
    const filteredPeriods = periodsData.data.filter(period => {
      if (!selectedClassBandData?.planSettingsId) return true; // If no planSettingsId is selected, show all periods
      return period.planSettingsId === selectedClassBandData.planSettingsId;
    });

    console.log(`Found ${filteredPeriods.length} of ${periodsData.data.length} periods matching planSettingsId ${selectedClassBandData?.planSettingsId}`);

    return filteredPeriods;
  }, [periodsData, selectedClassBandData]);

  const uniqueDays = useMemo(() => {
    if(!periods || periods.length === 0) return [];

    const usedDays = new Set<number>();

    periods.forEach((period) => {
      if(period.days && Array.isArray(period.days)) {
        period.days.forEach((day) => usedDays.add(day));
      }else {
        period.schedules.forEach((schedule) => {
          usedDays.add(schedule.day);
        });
      }
    });

    return Array.from(usedDays).sort((a, b) => a - b);
  }, [periods]);

  const activePreferencesCount = useMemo(() => {
    const activePreferences = schedulePreferences.filter(
      (pref) => !pref.isDeleted,
    );
    return countActiveClassBandPreferences(activePreferences);
  }, [schedulePreferences]);

  useEffect(() => {
    if (actualClassBandUuid) {
      fetchClassBandDetails();
      fetchClassBandPreferences();
    }
  }, [actualClassBandUuid]);

  // Add this useEffect to refetch periods when classBand data is loaded
  useEffect(() => {
    if (selectedClassBandData?.planSettingsId) {
      refetchPeriods();
    }
  }, [selectedClassBandData, refetchPeriods]);

  const fetchClassBandDetails = async () => {
    if (!actualClassBandUuid) {
      setSelectedClassBandData(null);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/class-bands/${actualClassBandUuid}`,
        {
          headers: {
            Authorization: localStorage.getItem("authToken") || "",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch class band details");
      }

      const data = await response.json();
      if (data.success && data.data) {
        console.log("Fetched class band details:", data.data);
        setSelectedClassBandData(data.data);
      }
    } catch (error: any) {
      console.error("Error fetching class band details:", error);
      setError(error.message || "Failed to fetch class band details");
    }
  };

  const mapPreferencesToScheduleFormat = (preferences) => {
    if(!preferences || preferences.length === 0) return [];

    return preferences.map((pref) => {
      return {
        id: pref.id,
        uuid: pref.uuid,
        periodId: pref.periodId,
        dayOfWeek: pref.dayOfWeek,
        mustScheduleClass: pref.mustScheduleClass,
        mustNotScheduleClass: pref.mustNotScheduleClass,
        prefersToScheduleClass: pref.prefersToScheduleClass,
        prefersNotToScheduleClass: pref.prefersNotToScheduleClass,
        reason: pref.reason,
        effectiveFrom: pref.effectiveFrom,
        effectiveTo: pref.effectiveTo,
        isRecurring: pref.isRecurring,
        organizationId: pref.organizationId,
        createdBy: pref.createdBy,
        modifiedBy: pref.modifiedBy,
        createdDate: pref.createdDate,
        modifiedDate: pref.modifiedDate,
        statusId: pref.statusId,
        isDeleted: pref.isDeleted,
      };
    });
  };

  const fetchClassBandPreferences = async () => {
    if(!actualClassBandUuid) {
      setSchedulePreferences([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/class-bands/${actualClassBandUuid}/preferences`,
        {
          headers: {
            Authorization: localStorage.getItem("authToken") || "",
            "Content-Type": "application/json",
          },
        },
      );

      if(!response.ok) {
        throw new Error("Failed to fetch class band preferences");
      }

      const data = await response.json();
      if(data.success && data.data && data.data.length > 0) {
        console.log(`Loaded class band with preferences:`, data.data[0]);

        const classBand = data.data[0];
        if(
          classBand.schedulePreferences &&
          Array.isArray(classBand.schedulePreferences)
        ) {
          const mappedPreferences = mapPreferencesToScheduleFormat(
            classBand.schedulePreferences,
          );
          console.log("Mapped preferences:", mappedPreferences);
          setSchedulePreferences(mappedPreferences);
        }else {
          console.log(
            `No preferences found for class band ${actualClassBandUuid}`,
          );
          setSchedulePreferences([]);
        }
      }else {
        console.log(`No data returned for class band ${actualClassBandUuid}`);
        setSchedulePreferences([]);
      }
    }catch(error: any) {
      console.error("Error fetching class band preferences:", error);
      setError(
        `Failed to load preferences: ${error.message || "Unknown error"}`,
      );
    }
  };

  const handleCellClick = (cellInfo: CellInfo) => {
    if(!actualClassBandUuid || isUpdating) return;
    setCurrentCell(cellInfo);
    if(selectedPreferenceType === null && !cellInfo.currentPreference) {
      return;
    }
    const cellIndex = `${cellInfo.periodId}-${cellInfo.dayOfWeek || cellInfo.day}`;
    if(selectedPreferenceType !== null) {
      if(cellInfo.currentPreference) {
        dispatch(
          addPendingChange({
            operationType: ChangeOperationType.UPDATE,
            periodId: Number(cellInfo.periodId),
            dayOfWeek: cellInfo.dayOfWeek || cellInfo.day,
            preferenceUuid: cellInfo.currentPreference.uuid,
            newPreferenceType: selectedPreferenceType,
            cellIndex,
            preferenceType: selectedPreferenceType,
          }),
        );
      }else {
        dispatch(
          addPendingChange({
            operationType: ChangeOperationType.CREATE,
            periodId: Number(cellInfo.periodId),
            dayOfWeek: cellInfo.dayOfWeek || cellInfo.day,
            newPreferenceType: selectedPreferenceType,
            cellIndex,
            preferenceType: selectedPreferenceType,
          }),
        );
      }
    } else if(cellInfo.currentPreference) {
      const preferenceFields = {
        mustScheduleClass: "mustScheduleClass",
        mustNotScheduleClass: "mustNotScheduleClass",
        prefersToScheduleClass: "prefersToScheduleClass",
        prefersNotToScheduleClass: "prefersNotToScheduleClass",
      };
      
      const activePreferenceType = getActiveClassBandPreferenceType(cellInfo.currentPreference, preferenceFields);
      
      dispatch(
        addPendingChange({
          operationType: ChangeOperationType.DELETE,
          periodId: Number(cellInfo.periodId),
          dayOfWeek: cellInfo.dayOfWeek || cellInfo.day,
          preferenceUuid: cellInfo.currentPreference.uuid,
          cellIndex,
          preferenceType: activePreferenceType,
        }),
      );
    }
    if(onScheduleSelect) {
      onScheduleSelect([...selectedScheduleIds, cellInfo.scheduleId || '']);
    }
    if(onCellClick) {
      onCellClick(cellInfo);
    }
  };

  const handleSaveChanges = async () => {
    if(!actualClassBandUuid || pendingChanges.length === 0) return;

    try {
      setIsUpdating(true);

      const cellsBeingUpdated = pendingChanges.map(
        (change) => change.cellIndex,
      );
      setUpdatingCells(cellsBeingUpdated);

      const results = [];

      const creates = pendingChanges.filter(
        (c) => c.operationType === ChangeOperationType.CREATE,
      );
      const updates = pendingChanges.filter(
        (c) => c.operationType === ChangeOperationType.UPDATE,
      );
      const deletes = pendingChanges.filter(
        (c) => c.operationType === ChangeOperationType.DELETE,
      );

      console.log(
        `Processing ${creates.length} creates, ${updates.length} updates, and ${deletes.length} deletes`,
      );

      for(const change of creates) {
        try {
          await createPreference({
            classBandUuid: actualClassBandUuid,
            periodId: change.periodId,
            dayOfWeek: change.dayOfWeek,
            preferenceType: change.newPreferenceType as PreferenceType,
            preferenceValue: true,
          });

          results.push({ success: true, change });

          setUpdatingCells((prev) =>
            prev.filter((cell) => cell !== change.cellIndex),
          );
        }catch(error) {
          console.error(
            `Error creating preference for cell ${change.cellIndex}:`,
            error,
          );
          results.push({ success: false, change, error });
          setUpdatingCells((prev) =>
            prev.filter((cell) => cell !== change.cellIndex),
          );
        }
      }

      for(const change of updates) {
        try {
          await updatePreference({
            uuid: change.preferenceUuid as string,
            periodId: change.periodId,
            dayOfWeek: change.dayOfWeek,
            preferenceType: change.newPreferenceType as PreferenceType,
            preferenceValue: true,
          });

          results.push({ success: true, change });

          setUpdatingCells((prev) =>
            prev.filter((cell) => cell !== change.cellIndex),
          );
        }catch(error) {
          console.error(
            `Error updating preference for cell ${change.cellIndex}:`,
            error,
          );
          results.push({ success: false, change, error });
          setUpdatingCells((prev) =>
            prev.filter((cell) => cell !== change.cellIndex),
          );
        }
      }

      // Process each delete
      for(const change of deletes) {
        try {
          await deletePreference(change.preferenceUuid as string);

          results.push({ success: true, change });

          setUpdatingCells((prev) =>
            prev.filter((cell) => cell !== change.cellIndex),
          );
        }catch(error) {
          console.error(
            `Error deleting preference for cell ${change.cellIndex}:`,
            error,
          );
          results.push({ success: false, change, error });
          setUpdatingCells((prev) =>
            prev.filter((cell) => cell !== change.cellIndex),
          );
        }
      }

      const errors = results.filter((r) => !r.success);
      if(errors.length > 0) {
        setError(
          `Error updating some preferences (${errors.length} of ${pendingChanges.length} failed)`,
        );
      }else {
        console.log(
          `Successfully processed all ${pendingChanges.length} changes`,
        );
      }

      dispatch(clearPendingChanges());

      await fetchClassBandPreferences();
    }catch(error: any) {
      console.error("Error saving changes:", error);
      setError(`Error saving changes: ${error.message || "Unknown error"}`);
    } finally {
      setIsUpdating(false);
      setUpdatingCells([]);
    }
  };

  const handleDiscardChanges = () => {
    dispatch(clearPendingChanges());
  };

  const handlePreferenceSelect = (preferenceType: PreferenceType | null) => {
    dispatch(setSelectedPreferenceType(preferenceType));
  };

  if(isLoadingPeriods) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-2" />
        <p className="text-gray-700">Loading schedule data...</p>
      </div>
    );
  }

  if(error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded border border-red-200">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <button
          onClick={() => {
            setError(null);
            fetchClassBandPreferences();
          }}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if(!periods || periods.length === 0) {
    return (
      <div className="p-4 text-gray-600 bg-gray-50 rounded border border-gray-200">
        <p>No schedule periods available.</p>
      </div>
    );
  }

  if(uniqueDays.length === 0) {
    return (
      <div className="p-4 text-gray-600 bg-gray-50 rounded border border-gray-200">
        <p>No schedule days available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      {actualClassBandUuid && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-gray-600 istui-timetable__main_preferences_title">
            Active Schedule Preferences: {activePreferencesCount}
            {selectedClassBandData?.planSettingsId && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Plan Settings ID: {selectedClassBandData.planSettingsId}
              </span>
            )}
          </p>
        </div>
      )}

      <ClassBandPreferenceToolbar
        selectedPreferenceType={selectedPreferenceType}
        onSelectPreference={handlePreferenceSelect}
        pendingChangesCount={pendingChanges.length}
        onSaveChanges={handleSaveChanges}
        onDiscardChanges={handleDiscardChanges}
        isSaving={isUpdating}
        preferenceOptions={getClassBandPreferenceOptions()}
      />

      <div
        className="grid border border-gray-200 rounded overflow-hidden istui-timetable_main_preferences_calendar"
        style={{
          gridTemplateColumns: `60px minmax(120px,auto) repeat(${uniqueDays.length},1fr)`,
          width: "100%",
        }}
      >
        <ScheduleCalendarHeader days={uniqueDays} dayNames={DAY_NAMES} />

        {periods.map((period, idx) => (
          <ClassBandScheduleCalendarRow
            key={period.uuid}
            period={period}
            days={uniqueDays}
            rowIndex={idx + 1}
            onCellClick={handleCellClick}
            schedulePreferences={schedulePreferences || []}
            currentCell={currentCell}
            selectedScheduleIds={selectedScheduleIds}
            isUpdating={isUpdating}
            pendingChanges={pendingChanges}
            updatingCells={updatingCells}
            preferenceFields={{
              mustScheduleClass: "mustScheduleClass",
              mustNotScheduleClass: "mustNotScheduleClass",
              prefersToScheduleClass: "prefersToScheduleClass",
              prefersNotToScheduleClass: "prefersNotToScheduleClass",
            }}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200"
          onClick={() =>
            alert(
              '1. Select a preference type from the toolbar\n2. Click on cells to apply it\n3. Click "Save Changes" when done\n4. Use "Clear" to remove a preference',
            )
          }
        >
          Help
        </button>
      </div>

      {isUpdating && updatingCells.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg flex items-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-3" />
          <p>Saving changes... ({updatingCells.length} remaining)</p>
        </div>
      )}
    </div>
  );
};

export default ClassBandScheduleCalendar;
