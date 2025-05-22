import React, { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import {SchedulePreference,CellInfo,PreferenceType,ChangeOperationType} from "@/type/Calendar/TypeCalendar";
import ScheduleCalendarHeader from "./ScheduleCalendarHeader";
import ScheduleCalendarRow from "./ScheduleCalendarRow";
import PreferenceToolbar from "./PreferenceToolbar";
import { countActivePreferences } from "@/util/calendar";
import {setSelectedPreferenceType,addPendingChange,clearPendingChanges} from "@/store/Calendar/SliceCalendar";
import { useGetPeriodsQuery, useCreateSchedulePreferenceMutation, useUpdateSchedulePreferenceMutation, useDeleteSchedulePreferenceMutation } from "@/store/Calendar/ApiCalendar";
import { Button } from "@/component/Ui/button";
import { useI18n } from "@/hook/useI18n";

interface ScheduleCalendarProps {
  selectedScheduleIds?: string[];
  onCellClick?: (cellInfo: CellInfo) => void;
  selectedPlanSettingsId?: number | null;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
                                                             selectedScheduleIds = [],
                                                             onCellClick,
                                                             selectedPlanSettingsId,
                                                           }) => {
  const dispatch = useAppDispatch();
  const { selectedTeacherUuid } = useAppSelector((state) => state.teacher);
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
  const [selectedTeacherData, setSelectedTeacherData] = useState<any>(null);

  const { data: periodsData, isLoading: isLoadingPeriods, refetch: refetchPeriods } =
      useGetPeriodsQuery(
          selectedTeacherData?.planSettingsId || selectedPlanSettingsId
              ? {
                planSettingsId: selectedTeacherData?.planSettingsId || selectedPlanSettingsId,
                organizationId: selectedTeacherData?.organizationId
              }
              : undefined
      );

  const [createPreference] = useCreateSchedulePreferenceMutation();
  const [updatePreference] = useUpdateSchedulePreferenceMutation();
  const [deletePreference] = useDeleteSchedulePreferenceMutation();

  const { t } = useI18n();

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

    console.log("Filtering periods based on planSettingsId:", selectedTeacherData?.planSettingsId || selectedPlanSettingsId);

    // Filter periods to only include those matching the selected plan settings ID
    const filteredPeriods = periodsData.data.filter(period => {
      if (!selectedTeacherData?.planSettingsId && !selectedPlanSettingsId) return true;
      return period.planSettingsId === (selectedTeacherData?.planSettingsId || selectedPlanSettingsId);
    });

    console.log(`Found ${filteredPeriods.length} of ${periodsData.data.length} periods matching planSettingsId ${selectedTeacherData?.planSettingsId || selectedPlanSettingsId}`);

    return filteredPeriods;
  }, [periodsData, selectedTeacherData, selectedPlanSettingsId]);

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
    return countActivePreferences(schedulePreferences);
  }, [schedulePreferences]);

  useEffect(() => {
    if (selectedTeacherUuid) {
      fetchTeacherDetails();
      fetchTeacherPreferences();
    }
  }, [selectedTeacherUuid]);

  // Add this useEffect to refetch periods when teacher data is loaded
  useEffect(() => {
    if (selectedTeacherData?.planSettingsId || selectedPlanSettingsId) {
      refetchPeriods();
    }
  }, [selectedTeacherData, selectedPlanSettingsId, refetchPeriods]);

  // Add effect to reload data when selectedPlanSettingsId changes
  useEffect(() => {
    if (selectedPlanSettingsId) {
      console.log("ScheduleCalendar: Plan settings changed to:", selectedPlanSettingsId);
      refetchPeriods();
      // We also need to refetch teacher preferences because they might be filtered by plan settings
      if (selectedTeacherUuid) {
        fetchTeacherPreferences();
      }
    }
  }, [selectedPlanSettingsId]);

  const fetchTeacherDetails = async () => {
    if (!selectedTeacherUuid) {
      setSelectedTeacherData(null);
      return;
    }

    try {
      const response = await fetch(
          `http://localhost:8080/api/v1/teachers/${selectedTeacherUuid}`,
          {
            headers: {
              Authorization: localStorage.getItem("authToken") || "",
              "Content-Type": "application/json",
            },
          }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch teacher details");
      }

      const data = await response.json();
      if (data.success && data.data) {
        console.log("Fetched teacher details:", data.data);
        setSelectedTeacherData(data.data);
      }
    } catch (error: any) {
      console.error("Error fetching teacher details:", error);
      setError(error.message || "Failed to fetch teacher details");
    }
  };

  const fetchTeacherPreferences = async () => {
    if(!selectedTeacherUuid) {
      setSchedulePreferences([]);
      return;
    }

    try {
      const response = await fetch(
          `http://localhost:8080/api/v1/teachers/${selectedTeacherUuid}`,
          {
            headers: {
              Authorization: localStorage.getItem("authToken") || "",
              "Content-Type": "application/json",
            },
          },
      );

      if(!response.ok) {
        throw new Error("Failed to fetch teacher preferences");
      }

      const data = await response.json();
      if(
          data.success &&
          data.data &&
          Array.isArray(data.data.schedulePreferences)
      ) {
        console.log(
            `Loaded ${data.data.schedulePreferences.length} preferences for teacher ${selectedTeacherUuid}`,
        );
        setSchedulePreferences(data.data.schedulePreferences);
      }else {
        console.log(`No preferences found for teacher ${selectedTeacherUuid}`);
        setSchedulePreferences([]);
      }
    }catch(error: any) {
      console.error("Error fetching teacher preferences:", error);
      setError(error.message || "Failed to load teacher preferences");
    }
  };

  const handleCellClick = (cellInfo: CellInfo) => {
    if(!selectedTeacherUuid || isUpdating) return;

    console.log("Cell clicked:", cellInfo);
    setCurrentCell(cellInfo);

    if(selectedPreferenceType === null && !cellInfo.currentPreference) {
      return;
    }

    const cellIndex = `${cellInfo.periodId}-${cellInfo.day}`;

    if(selectedPreferenceType !== null) {
      if(cellInfo.currentPreference) {
        dispatch(
            addPendingChange({
              operationType: ChangeOperationType.UPDATE,
              scheduleId: cellInfo.scheduleId,
              preferenceUuid: cellInfo.currentPreference.uuid,
              newPreferenceType: selectedPreferenceType,
              cellIndex,
              preferenceType: PreferenceType.CANNOT_TEACH
            }),
        );
      }else {
        dispatch(
            addPendingChange({
              operationType: ChangeOperationType.CREATE,
              scheduleId: cellInfo.scheduleId,
              newPreferenceType: selectedPreferenceType,
              cellIndex,
              preferenceType: PreferenceType.CANNOT_TEACH
            }),
        );
      }
    } else if(cellInfo.currentPreference) {
      dispatch(
          addPendingChange({
            operationType: ChangeOperationType.DELETE,
            scheduleId: cellInfo.scheduleId,
            preferenceUuid: cellInfo.currentPreference.uuid,
            cellIndex,
            preferenceType: PreferenceType.CANNOT_TEACH
          }),
      );
    }

    if(onCellClick) {
      onCellClick(cellInfo);
    }
  };

  const handleSaveChanges = async () => {
    if(!selectedTeacherUuid || pendingChanges.length === 0) return;

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
            teacherUuid: selectedTeacherUuid,
            scheduleUuid: change.scheduleId,
            preferenceType: change.newPreferenceType as PreferenceType,
            preferenceValue: true,
          }).unwrap();

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
            scheduleUuid: change.scheduleId as string,
          }).unwrap();

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
          await deletePreference(change.preferenceUuid as string).unwrap();

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

      await fetchTeacherPreferences();
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
                fetchTeacherPreferences();
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold">
          {t("teacher.preferences.title")}
          {activePreferencesCount > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({activePreferencesCount} active)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <PreferenceToolbar
            selectedPreferenceType={selectedPreferenceType}
            onSelect={handlePreferenceSelect}
          />
          {pendingChanges.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardChanges}
                disabled={isUpdating}
              >
                {t("calendar.preferences.discard")}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveChanges}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("calendar.preferences.saving")}{" "}
                    ({updatingCells.length}/{pendingChanges.length})
                  </>
                ) : (
                  t("calendar.preferences.saveChanges")
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {isLoadingPeriods ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <p>{t("calendar.loading")}</p>
        </div>
      ) : uniqueDays.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg">{t("calendar.noDaysFound")}</p>
          <p className="text-sm mt-2">{t("calendar.checkPlanSettings")}</p>
          {selectedPlanSettingsId && (
            <p className="text-xs mt-4">
              Plan Settings ID: {selectedPlanSettingsId}
            </p>
          )}
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <div className="flex">
            <div className="w-32 p-2 font-medium bg-secondary text-secondary-foreground border-b border-r">
              {t("calendar.period")}
            </div>
            <div
              className="flex-1 grid text-center bg-secondary text-secondary-foreground"
              style={{ gridTemplateColumns: `repeat(${uniqueDays.length}, 1fr)` }}
            >
              {uniqueDays.map((dayNumber) => (
                <div key={dayNumber} className="p-2 font-medium border-b">
                  {DAY_NAMES[dayNumber] || `Day ${dayNumber}`}
                </div>
              ))}
            </div>
          </div>

          <div className="max-h-[500px] overflow-y-auto">
            {periods.map((period, index) => (
              <ScheduleCalendarRow
                key={period.uuid}
                period={period}
                days={uniqueDays}
                schedulePreferences={schedulePreferences}
                onCellClick={handleCellClick}
                updatingCells={updatingCells}
                selectedScheduleIds={selectedScheduleIds}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;