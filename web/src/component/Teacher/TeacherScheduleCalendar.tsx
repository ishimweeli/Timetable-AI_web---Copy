import React, { useEffect, useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { useToast } from "@/hook/useToast";
import { useI18n } from "@/hook/useI18n";

import {
  Period,
  SchedulePreference,
  CellInfo,
  PreferenceType,
  PendingChange,
  ChangeOperationType,
} from "@/type/Calendar/TypeCalendar";

import ScheduleCalendarHeader from "@/component/Calendar/ScheduleCalendarHeader";
import TeacherScheduleCalendarRow from "@/component/Teacher/TeacherScheduleCalendarRow";
import TeacherPreferenceToolbar from "@/component/Teacher/TeacherPreferenceToolbar";

import {
  countActiveTeacherPreferences,
  getTeacherPreferenceOptions,
  getActiveTeacherPreferenceType,
  getBackendPreferenceType,
  getFrontendPreferenceType,
  inspectPreference
} from "@/util/teacherCalendar";

import {
  setSelectedPreferenceType,
  addPendingChange,
  clearPendingChanges,
} from "@/store/Calendar/SliceCalendar";

import { useGetPeriodsQuery } from "@/store/Calendar/ApiCalendar";
import { useGetTeacherQuery } from "@/store/Teacher/ApiTeacher";
import { useGetTeacherPreferencesQuery } from "@/store/Teacher/ApiTeacher";
import { 
  useAddSchedulePreferenceToTeacherMutation, 
  useUpdateSchedulePreferenceMutation, 
  useDeleteSchedulePreferenceMutation 
} from "@/store/Teacher/ApiTeacher";

interface TeacherScheduleCalendarProps {
  selectedTeacherUuid?: string;
  selectedScheduleIds?: string[];
  onCellClick?: (cellInfo: CellInfo) => void;
}

const TeacherScheduleCalendar: React.FC<TeacherScheduleCalendarProps> = ({
  selectedTeacherUuid,
  selectedScheduleIds = [],
  onCellClick,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { t } = useI18n();
  
  // Use the same calendar slice as class calendar to maintain consistency
  const { selectedPreferenceType, pendingChanges } = useAppSelector(
    (state) => state.calendar
  );
  
  // Get the selected plan settings ID from the Zustand store
  const { selectedPlanSettingsId } = usePlanSettingsStore();

  const [schedulePreferences, setSchedulePreferences] = useState<SchedulePreference[]>([]);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatingCells, setUpdatingCells] = useState<string[]>([]);
  const [currentCell, setCurrentCell] = useState<CellInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch teacher data to get organizationId and planSettingsId
  const { data: teacherData, isLoading: isLoadingTeacher } = useGetTeacherQuery(
    selectedTeacherUuid || "", 
    { skip: !selectedTeacherUuid }
  );

  // Get teacher preferences
  const { 
    data: preferencesData, 
    isLoading: isLoadingPreferences,
    refetch: refetchPreferences 
  } = useGetTeacherPreferencesQuery(
    { teacherUuid: selectedTeacherUuid || '' },
    { 
      skip: !selectedTeacherUuid,
      refetchOnMountOrArgChange: true
    }
  );

  // API mutations for preferences
  const [addPreference, { isLoading: isAddingPreference }] = useAddSchedulePreferenceToTeacherMutation();
  const [updatePreference, { isLoading: isUpdatingPreference }] = useUpdateSchedulePreferenceMutation();
  const [deletePreference, { isLoading: isDeletingPreference }] = useDeleteSchedulePreferenceMutation();

  // Use the planSettingsId from the teacher data if available, otherwise use the selected one
  const effectivePlanSettingsId = teacherData?.data?.planSettingsId || selectedPlanSettingsId;

  // Fetch periods with the effective planSettingsId
  const {
    data: periodsData,
    isLoading: isLoadingPeriods,
    refetch: refetchPeriods
  } = useGetPeriodsQuery(
    { planSettingsId: effectivePlanSettingsId },
    {
      skip: !effectivePlanSettingsId,
      refetchOnMountOrArgChange: true
    }
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
    
    // Filter periods to only include those matching the effective planSettingsId
    const filteredPeriods = periodsData.data.filter(period => {
      if (!effectivePlanSettingsId) return true;
          console.log("Period object", period)

      return period.planSettingsId === effectivePlanSettingsId;
    });
    
    return filteredPeriods
      .map((period) => ({
        ...period,
        time: `${period.startTime} - ${period.endTime}`,
      }))
      .sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
  }, [periodsData, effectivePlanSettingsId]);

  const uniqueDays = useMemo(() => {
    if(!periods || periods.length === 0) return [];
    const usedDays = new Set<number>();
    
    // Extract days from periods in a standardized way
    periods.forEach((period) => {
      // Handle days array if it exists
      if(period.days && Array.isArray(period.days)) {
        period.days.forEach((day) => usedDays.add(day));
      }
      
      // Handle schedules array if it exists
      if(period.schedules && Array.isArray(period.schedules)) {
        period.schedules.forEach((schedule) => {
          usedDays.add(schedule.day);
        });
      }
    });
    
    // Sort days numerically
    return Array.from(usedDays).sort((a, b) => a - b);
  }, [periods]);

  // Get teacher preferences from API data
  useEffect(() => {
    if (preferencesData?.data && preferencesData.data.length > 0) {
      const teacherWithPreferences = preferencesData.data[0];
      // console.log("Teacher object with preferences:", teacherWithPreferences);

      if (teacherWithPreferences && Array.isArray(teacherWithPreferences.schedulePreferences)) {
        // console.log("Raw schedulePreferences from teacher:", teacherWithPreferences.schedulePreferences);
        
        const mappedPreferences = teacherWithPreferences.schedulePreferences.map(pref => {
          let periodId = pref.periodId;
          if (typeof periodId === 'string') periodId = parseInt(periodId);
          if (isNaN(periodId)) console.warn(`Invalid periodId for pref ${pref.uuid}: ${pref.periodId}`);

          let dayOfWeek = pref.dayOfWeek;
          if (typeof dayOfWeek === 'string') dayOfWeek = parseInt(dayOfWeek);
          if (isNaN(dayOfWeek)) console.warn(`Invalid dayOfWeek for pref ${pref.uuid}: ${pref.dayOfWeek}`);
          
          const mappedPref = {
            ...pref,
            periodId,
            dayOfWeek,
            // Initialize all frontend-consistent fields to false
            mustScheduleClass: false,
            mustNotScheduleClass: false,
            prefersToScheduleClass: false,
            prefersNotToScheduleClass: false,
            // Also carry over backend fields for direct checking if needed
            mustTeach: pref.mustTeach,
            cannotTeach: pref.cannotTeach,
            prefersToTeach: pref.prefersToTeach,
            dontPreferToTeach: pref.dontPreferToTeach,
          };
          
          // Determine active preference based on backend fields (which are booleans)
          if (pref.mustTeach === true) mappedPref.mustScheduleClass = true;
          else if (pref.cannotTeach === true) mappedPref.mustNotScheduleClass = true;
          else if (pref.prefersToTeach === true) mappedPref.prefersToScheduleClass = true;
          else if (pref.dontPreferToTeach === true) mappedPref.prefersNotToScheduleClass = true;
          
          // const activeType = getActiveTeacherPreferenceType(mappedPref); // Already uses the new logic
          // console.log(`Pref ${pref.uuid} (P:${periodId}, D:${dayOfWeek}) mapped to type: ${activeType}`);

          return mappedPref;
        });
        
        // console.log("Mapped teacher preferences for calendar:", mappedPreferences);
        setSchedulePreferences(mappedPreferences);
      } else {
        setSchedulePreferences([]);
      }
    } else {
      setSchedulePreferences([]);
    }
  }, [preferencesData]);

  // Refresh periods when plan settings change
  useEffect(() => {
    if (effectivePlanSettingsId) {
      refetchPeriods();
    }
  }, [effectivePlanSettingsId, refetchPeriods]);

  // Refresh preferences when selected teacher changes
  useEffect(() => {
    if (selectedTeacherUuid) {
      refetchPreferences();
    }
  }, [selectedTeacherUuid, refetchPreferences]);

  const activePreferencesCount = useMemo(() => {
    // Count only preferences that have an active type
    return schedulePreferences.filter(p => getActiveTeacherPreferenceType(p) !== null).length;
  }, [schedulePreferences]);

  const preferenceOptions = useMemo(() => getTeacherPreferenceOptions(), []);

  const handleCellClick = (cellInfo: CellInfo) => {
    if (!selectedTeacherUuid || !selectedPreferenceType) return;
    
    console.log("Cell click:", cellInfo);
    setCurrentCell(cellInfo);
    
    const periodObj = periods.find(p => 
      p.uuid === cellInfo.periodUuid || 
      p.id === cellInfo.periodId || 
      p.id === Number(cellInfo.periodId)
    );
    
    const periodId = periodObj ? periodObj.id : parseInt(cellInfo.periodId?.toString() || "0");
    
    if (!periodId || isNaN(periodId)) {
      console.error("Invalid period ID:", cellInfo.periodId, cellInfo.periodUuid);
      toast({
        description: "Error: Cannot identify the period. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    const dayOfWeek = Number(cellInfo.dayOfWeek || cellInfo.day);
    
    const existingPreference = schedulePreferences.find(
      (pref) => {
        const prefPeriodId = typeof pref.periodId === 'string' ? parseInt(pref.periodId) : pref.periodId;
        const prefDayOfWeek = Number(pref.dayOfWeek);
        return (prefPeriodId === periodId && prefDayOfWeek === dayOfWeek);
      }
    );
    
    const cellIndex = `${periodId}-${dayOfWeek}`;
    
    if (existingPreference) {
      const currentPrefType = getActiveTeacherPreferenceType(existingPreference);
      
      if (currentPrefType === selectedPreferenceType) {
        dispatch(
          addPendingChange({
            operationType: ChangeOperationType.DELETE,
            periodId: periodId,
            dayOfWeek: dayOfWeek,
            preferenceUuid: existingPreference.uuid,
            cellIndex,
          })
        );
      } else {
        dispatch(
          addPendingChange({
            operationType: ChangeOperationType.UPDATE,
            periodId: periodId,
            dayOfWeek: dayOfWeek,
            preferenceUuid: existingPreference.uuid,
            newPreferenceType: selectedPreferenceType,
            cellIndex,
          })
        );
      }
    } else {
      dispatch(
        addPendingChange({
          operationType: ChangeOperationType.CREATE,
          periodId: periodId,
          dayOfWeek: dayOfWeek,
          newPreferenceType: selectedPreferenceType,
          cellIndex,
        })
      );
    }
    
    if (onCellClick) {
      onCellClick({
        ...cellInfo,
        periodId: periodId,
        dayOfWeek: dayOfWeek
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedTeacherUuid || pendingChanges.length === 0) return;
    
    setIsUpdating(true);
    setUpdatingCells(pendingChanges.map(change => change.cellIndex || ''));
    
    const results = [];
    for (const change of pendingChanges) {
      try {
        if (change.operationType === ChangeOperationType.CREATE) {
          // Make sure we have valid period ID
          const periodId = Number(change.periodId);
          const dayOfWeek = Number(change.dayOfWeek);
          
          if (isNaN(periodId) || periodId <= 0) {
            console.error("Invalid period ID for create:", change);
            results.push({ 
              success: false, 
              message: `Failed to create preference: Invalid period ID` 
            });
            continue;
          }
          
          // Convert the frontend preference type to backend-compatible value
          const backendPreferenceType = getBackendPreferenceType(change.newPreferenceType);
          
          if (!backendPreferenceType) {
            console.error("Invalid preference type:", change.newPreferenceType);
            results.push({ 
              success: false, 
              message: `Failed to create preference: Invalid preference type` 
            });
            continue;
          }
          
          console.log("Creating preference:", {
            teacherUuid: selectedTeacherUuid,
            periodId: periodId,
            dayOfWeek: dayOfWeek,
            preferenceType: backendPreferenceType
          });
          
          // Debug the API payload
          const payload = {
            teacherUuid: selectedTeacherUuid,
            periodId: periodId,
            dayOfWeek: dayOfWeek,
            preferenceType: backendPreferenceType,
            preferenceValue: true
          };
          
          console.log(`API Create Preference Payload:`, JSON.stringify(payload, null, 2));
          
          const result = await addPreference(payload).unwrap();
          
          results.push({ 
            success: true, 
            message: `Created preference for ${periodId}-${dayOfWeek}` 
          });
        } 
        else if (change.operationType === ChangeOperationType.UPDATE) {
          if (!change.preferenceUuid) {
            console.error("Missing UUID for update:", change);
            results.push({ 
              success: false, 
              message: `Failed to update preference: Missing UUID` 
            });
            continue;
          }
          
          // Convert the frontend preference type to backend-compatible value
          const backendPreferenceType = getBackendPreferenceType(change.newPreferenceType);
          
          if (!backendPreferenceType) {
            console.error("Invalid preference type:", change.newPreferenceType);
            results.push({ 
              success: false, 
              message: `Failed to update preference: Invalid preference type` 
            });
            continue;
          }
          
          console.log("Updating preference:", {
            preferenceUuid: change.preferenceUuid,
            preferenceType: backendPreferenceType
          });
          
          // Debug the API payload
          const payload = {
            preferenceUuid: change.preferenceUuid as string,
            preferenceType: backendPreferenceType,
            preferenceValue: true
          };
          
          console.log(`API Update Preference Payload:`, JSON.stringify(payload, null, 2));
          
          const result = await updatePreference(payload).unwrap();
          
          results.push({ 
            success: true, 
            message: `Updated preference ${change.preferenceUuid}` 
          });
        } 
        else if (change.operationType === ChangeOperationType.DELETE) {
          if (!change.preferenceUuid) {
            console.error("Missing UUID for delete:", change);
            results.push({ 
              success: false, 
              message: `Failed to delete preference: Missing UUID` 
            });
            continue;
          }
          
          console.log("Deleting preference:", change.preferenceUuid);
          
          const result = await deletePreference(change.preferenceUuid as string).unwrap();
          
          results.push({ 
            success: true, 
            message: `Deleted preference ${change.preferenceUuid}` 
          });
        }
      } catch (error) {
        console.error(`Error handling change ${change.operationType}:`, error);
        results.push({ 
          success: false, 
          message: `Failed to ${change.operationType.toLowerCase()} preference: ${error.message || 'Unknown error'}`
        });
      }
    }
    
    // Clear pending changes regardless of success/failure
    dispatch(clearPendingChanges());
    
    // Refetch preferences to update the UI
    refetchPreferences();
    
    // Show success/error message
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;
    
    if (errorCount === 0) {
      toast({
        description: `Successfully saved all ${successCount} preference changes`,
        variant: "default",
      });
    } else {
      toast({
        description: `Saved ${successCount} changes, but encountered ${errorCount} errors`,
        variant: "destructive",
      });
    }
    
    setIsUpdating(false);
    setUpdatingCells([]);
  };

  // Discard all pending changes
  const handleDiscardChanges = () => {
    dispatch(clearPendingChanges());
  };

  // Handle preference type selection
  const handlePreferenceSelect = (preferenceType: PreferenceType | null) => {
    dispatch(setSelectedPreferenceType(preferenceType));
  };

  // Debug all preferences (for troubleshooting)
  const debugAllPreferences = () => {
    console.group("Debugging all preferences");
    schedulePreferences.forEach(pref => {
      inspectPreference(pref);
    });
    console.groupEnd();
  };

  // Loading state
  if(isLoadingTeacher || isLoadingPeriods || isLoadingPreferences) {
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
            refetchPreferences();
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
        <p>No schedule periods available for the selected plan settings.</p>
        <p className="text-sm mt-2">Plan Settings ID: {effectivePlanSettingsId || "None selected"}</p>
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
      {selectedTeacherUuid && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-gray-600 istui-timetable__main_preferences_title">
            {t("teacher.preferences.activeCount", "Active Schedule Preferences")}: {activePreferencesCount}
            {effectivePlanSettingsId && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {t("teacher.preferences.planSettingsId", "Plan Settings ID")}: {effectivePlanSettingsId}
              </span>
            )}
            <button 
              onClick={debugAllPreferences} 
              className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded"
              title="Debug preferences (only visible during development)"
            >
              Debug
            </button>
          </p>
        </div>
      )}
      <TeacherPreferenceToolbar
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
          <TeacherScheduleCalendarRow
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
              prefersNotToScheduleClass: "prefersNotToScheduleClass"
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherScheduleCalendar;