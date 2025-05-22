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
import ClassScheduleCalendarRow from "@/component/Class/ClassScheduleCalendarRow";
import ClassPreferenceToolbar from "@/component/Class/ClassPreferenceToolbar";

import {
  countActiveClassPreferences,
  getClassPreferenceOptions,
  getActiveClassPreferenceType,
} from "@/util/classCalendar";

import {
  setSelectedPreferenceType,
  addPendingChange,
  clearPendingChanges,
} from "@/store/Class/SliceClassCalendar";

import { useGetPeriodsQuery } from "@/store/Calendar/ApiCalendar";

interface ClassScheduleCalendarProps {
  selectedClassUuid?: string;
  selectedScheduleIds?: string[];
  onCellClick?: (cellInfo: CellInfo) => void;
}

const ClassScheduleCalendar: React.FC<ClassScheduleCalendarProps> = ({
  selectedClassUuid,
  selectedScheduleIds = [],
  onCellClick,
}) => {
  const dispatch = useAppDispatch();
  const { selectedPreferenceType, pendingChanges } = useAppSelector(
    (state) => state.classCalendar,
  );

  const [schedulePreferences, setSchedulePreferences] = useState<
    SchedulePreference[]
  >([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatingCells, setUpdatingCells] = useState<string[]>([]);
  const [currentCell, setCurrentCell] = useState<CellInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const [selectedClassData, setSelectedClassData] = useState<any>(null);

  const {
    data: periodsData,
    isLoading: isLoadingPeriods,
    refetch: refetchPeriods
  } = useGetPeriodsQuery(
    selectedClassData?.planSettingsId 
      ? { planSettingsId: selectedClassData.planSettingsId, organizationId: selectedClassData.organizationId } 
      : undefined
  );

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
    
    console.log("Filtering periods based on planSettingsId:", selectedClassData?.planSettingsId);
    
    // Filter periods to only include those matching the selected class's planSettingsId
    const filteredPeriods = periodsData.data.filter(period => {
      if (!selectedClassData?.planSettingsId) return true; // If no planSettingsId is selected, show all periods
      return period.planSettingsId === selectedClassData.planSettingsId;
    });
    
    console.log(`Found ${filteredPeriods.length} of ${periodsData.data.length} periods matching planSettingsId ${selectedClassData?.planSettingsId}`);
    
    return filteredPeriods.map((period) => ({
      ...period,
   time: `${period.startTime} - ${period.endTime}`,

    }));
  }, [periodsData, selectedClassData]);

  const uniqueDays = useMemo(() => {
    if(!periods || periods.length === 0) return [];
    const usedDays = new Set<number>();
    periods.forEach((period) => {
      if(period.days && Array.isArray(period.days)) {
        period.days.forEach((day) => usedDays.add(day));
      } 
      if(period.schedules && Array.isArray(period.schedules)) {
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
    return countActiveClassPreferences(activePreferences);
  }, [schedulePreferences]);

  const preferenceOptions = useMemo(() => getClassPreferenceOptions(), []);

  console.log("Selected preference type:", selectedPreferenceType);
  console.log("Schedule preferences:", schedulePreferences);

  const defaultPreferenceFields = {
    mustScheduleClass: "mustScheduleClass",
    mustNotScheduleClass: "mustNotScheduleClass",
    prefersToScheduleClass: "prefersToScheduleClass",
    prefersNotToScheduleClass: "prefersNotToScheduleClass",
  };

  useEffect(() => {
    if(selectedClassUuid) {
      fetchClassPreferences();
    }
  }, [selectedClassUuid]);

  useEffect(() => {
    const fetchClassDetails = async () => {
      if (!selectedClassUuid) {
        setSelectedClassData(null);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/classes/${selectedClassUuid}`,
          {
            headers: {
              Authorization: localStorage.getItem("authToken") || "",
              "Content-Type": "application/json",
            },
          }
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch class details");
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          console.log("Fetched class details:", data.data);
          setSelectedClassData(data.data);
        }
      } catch (error: any) {
        console.error("Error fetching class details:", error);
        setError(error.message || "Failed to fetch class details");
      }
    };

    fetchClassDetails();
  }, [selectedClassUuid]);

  useEffect(() => {
    if (selectedClassData?.planSettingsId) {
      refetchPeriods();
    }
  }, [selectedClassData, refetchPeriods]);

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

  const fetchClassPreferences = async () => {
    if(!selectedClassUuid) {
      setSchedulePreferences([]);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/classes/${selectedClassUuid}/preferences`,
        {
          headers: {
            Authorization: localStorage.getItem("authToken") || "",
            "Content-Type": "application/json",
          },
        },
      );
      if(!response.ok) {
        throw new Error("Failed to fetch class preferences");
      }
      const data = await response.json();
      if(data.success && data.data && data.data.length > 0) {
        console.log(`Loaded class with preferences:`, data.data[0]);
        const classData = data.data[0];
        if(
          classData.schedulePreferences &&
          Array.isArray(classData.schedulePreferences)
        ) {
          const mappedPreferences = mapPreferencesToScheduleFormat(
            classData.schedulePreferences,
          );
          console.log("Mapped preferences:", mappedPreferences);
          setSchedulePreferences(mappedPreferences);
        }else {
          console.log(`No preferences found for class ${selectedClassUuid}`);
          setSchedulePreferences([]);
        }
      }else {
        console.log(`No data returned for class ${selectedClassUuid}`);
        setSchedulePreferences([]);
      }
    }catch(error: any) {
      setError(error.message || "Failed to load class preferences");
    }
  };

  const handleCellClick = (cellInfo: CellInfo) => {
    if(!selectedClassUuid || isUpdating) return;
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
      const activePreferenceType = getActiveClassPreferenceType(cellInfo.currentPreference, defaultPreferenceFields);
      
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
    setUnsavedChanges(true);
    if(onCellClick) {
      onCellClick(cellInfo);
    }
  };

  const createPreference = async (data: any) => {
    let preferenceType = data.preferenceType;
    if(data.preferenceType === PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS) {
      preferenceType = "prefers_not_to_schedule_class";
    }
    const response = await fetch(
      `http://localhost:8080/api/v1/classes/${data.classUuid}/preferences`,
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
      mustScheduleClass: null,
      mustNotScheduleClass: null,
      prefersToScheduleClass: null,
      prefersNotToScheduleClass: null,
    };

    if (data.preferenceType === PreferenceType.MUST_SCHEDULE_CLASS) {
      preferenceFields.mustScheduleClass = true;
    } else if (data.preferenceType === PreferenceType.MUST_NOT_SCHEDULE_CLASS) {
      preferenceFields.mustNotScheduleClass = true;
    } else if (data.preferenceType === PreferenceType.PREFERS_TO_SCHEDULE_CLASS) {
      preferenceFields.prefersToScheduleClass = true;
    } else if (data.preferenceType === PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS) {
      preferenceFields.prefersNotToScheduleClass = true;
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
      `http://localhost:8080/api/v1/classes/schedule-preference/${data.uuid}`,
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
      `http://localhost:8080/api/v1/classes/schedule-preference/${uuid}`,
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

  const handleSaveChanges = async () => {
    if(!selectedClassUuid || pendingChanges.length === 0) return;
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
            classUuid: selectedClassUuid,
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
      await fetchClassPreferences();
      dispatch(clearPendingChanges());
      setUnsavedChanges(false);
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;
      if(failCount > 0) {
        setError(
          `${successCount} changes saved, but ${failCount} changes failed.`,
        );
      }else {
        console.log(`Successfully saved all ${successCount} changes`);
      }
    }catch(error: any) {
      console.error("Error saving changes:", error);
      setError(`Error saving changes: ${error.message}`);
    } finally {
      setIsUpdating(false);
      setUpdatingCells([]);
    }
  };

  const handleDiscardChanges = () => {
    dispatch(clearPendingChanges());
    setUnsavedChanges(false);
  };

  const handlePreferenceSelect = (preferenceType: PreferenceType | null) => {
    console.log("Setting preference type to:", preferenceType);
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
            fetchClassPreferences();
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
      {selectedClassUuid && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-gray-600 istui-timetable__main_preferences_title">
            Active Schedule Preferences: {activePreferencesCount}
            {selectedClassData?.planSettingsId && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Plan Settings ID: {selectedClassData.planSettingsId}
              </span>
            )}
          </p>
        </div>
      )}
      <ClassPreferenceToolbar
        selectedPreferenceType={selectedPreferenceType}
        onSelectPreference={handlePreferenceSelect}
        pendingChangesCount={pendingChanges.length}
        onSaveChanges={handleSaveChanges}
        onDiscardChanges={handleDiscardChanges}
        isSaving={isUpdating}
        preferenceOptions={preferenceOptions}
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
          <ClassScheduleCalendarRow
            key={period.uuid || period.id}
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

export default ClassScheduleCalendar;
