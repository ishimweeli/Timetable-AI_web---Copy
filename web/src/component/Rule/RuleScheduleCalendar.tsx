import React, { useEffect, useState, useMemo } from "react";
import { Loader2, GraduationCap } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { useToast } from "@/hook/useToast";

import {
  Period,
  CellInfo,
  ChangeOperationType,
} from "@/type/Calendar/TypeCalendar";

import RuleScheduleCalendarHeader from "./RuleScheduleCalendarHeader";
import RuleScheduleCalendarRow from "./RuleScheduleCalendarRow";
import RulePreferenceToolbar from "./RulePreferenceToolbar";

import { countActiveRulePreferences } from "@/util/ruleCalendar";
import {
  addRulePendingChange,
  clearRulePendingChanges,
  fetchRulePreferences,
  saveRulePreferenceChanges,
} from "@/store/Rule/sliceRulePreference";

import { useGetPeriodsQuery } from "@/store/Rule/apiRulePreference";
import { useI18n } from "@/hook/useI18n";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";

interface ScheduleCalendarProps {
  selectedScheduleIds?: string[];
  onCellClick?: (cellInfo: CellInfo) => void;
  selectedPlanSettingsId?: number | null;
}

const RuleScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  selectedScheduleIds = [],
  onCellClick,
  selectedPlanSettingsId,
}) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { t } = useI18n();
  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);

  const {
    selectedRuleUuid,
    rulePendingChanges,
    schedulePreferences,
    isLoading: isReduxLoading,
    error: reduxError,
  } = useAppSelector((state) => state.rulePreference);

  const [currentCell, setCurrentCell] = useState<CellInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingCells, setUpdatingCells] = useState<string[]>([]);

  // Use the planSettingsId in the periods query
  const {
    data: periodsData,
    isLoading: isLoadingPeriods,
    error: periodsError,
  } = useGetPeriodsQuery(selectedPlanSettingsId ? { planSettingsId: selectedPlanSettingsId } : undefined);

  const periods = useMemo(() => {
    // Filter periods by planSettingsId if provided
    const allPeriods = periodsData?.data || [];
    
    // Map the periods to ensure all required fields are set properly
    const mappedPeriods = allPeriods.map(period => {
      // Ensure each period has an id - if not explicitly set, use the first periodId from schedules
      const periodId = period.id || (period.schedules?.[0]?.periodId);
      
      return {
        ...period,
        // Set id from periodId in schedules if it doesn't exist
        id: periodId
      };
    });
    
    if (selectedPlanSettingsId) {
      return mappedPeriods.filter(period =>
        period.planSettingsId === selectedPlanSettingsId ||
        !period.planSettingsId // include periods without planSettingsId for backwards compatibility
      );
    }
    return mappedPeriods;
  }, [periodsData, selectedPlanSettingsId]);

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

  useEffect(() => {
    if(reduxError) {
      setError(reduxError);
    } else if(periodsError) {
      setError("Failed to load schedule periods");
    }
  }, [reduxError, periodsError]);

  const uniqueDays = useMemo(() => {
    if(!periods || periods.length === 0) return [];

    const usedDays = new Set<number>();

    periods.forEach((period) => {
      if(period.days && Array.isArray(period.days)) {
        period.days.forEach((day) => usedDays.add(day));
      } else if(period.schedules) {
        period.schedules.forEach((schedule) => {
          usedDays.add(schedule.day);
        });
      }
    });

    return Array.from(usedDays).sort((a, b) => a - b);
  }, [periods]);

  const activePreferences = useMemo(() => {
    return schedulePreferences.filter((pref) => !pref.isDeleted);
  }, [schedulePreferences]);

  const activePreferencesCount = useMemo(() => {
    return countActiveRulePreferences(activePreferences);
  }, [activePreferences]);

  const hasDeleteChanges = useMemo(() => {
    return rulePendingChanges.some(
      (change) => change.operationType === ChangeOperationType.DELETE,
    );
  }, [rulePendingChanges]);

  const getPlanSettingName = (id: number | null) => {
    if(!id || !planSettingsList) return "";
    const planSetting = planSettingsList.find((ps) => ps.id === id);
    return planSetting ? planSetting.name : "";
  };

  useEffect(() => {
    if(selectedRuleUuid) {
      dispatch(fetchRulePreferences(selectedRuleUuid));
    }
  }, [selectedRuleUuid, dispatch]);

  const handleCellClick = (cellInfo: CellInfo) => {
    if(!selectedRuleUuid || isReduxLoading) return;
    setCurrentCell(cellInfo);
    // Find the period for this cell to get its uuid
    const period = periods.find(p => p.id === Number(cellInfo.periodId));
    const cellIndex = period ? `${period.id}-${cellInfo.day}` : `${cellInfo.periodId}-${cellInfo.day}`;
    if(cellInfo.currentPreference) {
      dispatch(
        addRulePendingChange({
          operationType: ChangeOperationType.DELETE,
          periodId: cellInfo.periodId,
          dayOfWeek: cellInfo.day,
          preferenceUuid: cellInfo.currentPreference.uuid,
          cellIndex,
        }),
      );
    }else {
      dispatch(
        addRulePendingChange({
          operationType: ChangeOperationType.CREATE,
          periodId: cellInfo.periodId,
          dayOfWeek: cellInfo.day,
          appliesValue: true,
          cellIndex,
          planSettingsId: selectedPlanSettingsId,
        }),
      );
    }
    if(onCellClick) {
      onCellClick(cellInfo);
    }
  };

  const handleSaveChanges = async () => {
    if(!selectedRuleUuid || rulePendingChanges.length === 0) return;

    try {
      const cellsBeingUpdated = rulePendingChanges.map(
        (change) => change.cellIndex,
      );
      setUpdatingCells(cellsBeingUpdated);

      const result = await dispatch(
        saveRulePreferenceChanges({
          ruleUuid: selectedRuleUuid,
          pendingChanges: rulePendingChanges,
          planSettingsId: selectedPlanSettingsId,
        }),
      ).unwrap();

      if(result.toastMessages && Array.isArray(result.toastMessages)) {
        result.toastMessages.forEach((toastMsg) => {
          toast({
            variant: toastMsg.type === "error" ? "destructive" : "default",
            description: t(toastMsg.message) || toastMsg.message,
          });
        });
      }else {
        toast({
          description: t("rules.schedule.changes.saved"),
          variant: "default",
        });
      }

      dispatch(fetchRulePreferences(selectedRuleUuid));
    }catch(error: any) {
      setError(error?.message || "Error saving changes");

      toast({
        description: t(error?.message) || t("rules.schedule.changes.error"),
        variant: "destructive",
      });

      if(error?.toastMessages && Array.isArray(error.toastMessages)) {
        error.toastMessages.forEach((toastMsg) => {
          if(toastMsg.type === "success") {
            toast({
              description: t(toastMsg.message) || toastMsg.message,
              variant: "default",
            });
          }
        });
      }
    } finally {
      setUpdatingCells([]);
    }
  };

  const handleDiscardChanges = () => {
    dispatch(clearRulePendingChanges());

    toast({
      description: hasDeleteChanges
        ? t("rules.schedule.deletion.cancelled")
        : t("rules.schedule.changes.discarded"),
      variant: "default",
    });
  };

  const handleRetryFetch = () => {
    setError(null);
    if(selectedRuleUuid) {
      dispatch(fetchRulePreferences(selectedRuleUuid));
    }
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
          onClick={handleRetryFetch}
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
        {selectedPlanSettingsId && (
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <GraduationCap className="h-4 w-4 mr-1" />
            <span>Plan Settings: {getPlanSettingName(selectedPlanSettingsId)}</span>
          </div>
        )}
      </div>
    );
  }

  if(uniqueDays.length === 0) {
    return (
      <div className="p-4 text-gray-600 bg-gray-50 rounded border border-gray-200">
        <p>No schedule days available for the selected plan settings.</p>
        {selectedPlanSettingsId && (
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <GraduationCap className="h-4 w-4 mr-1" />
            <span>Plan Settings: {getPlanSettingName(selectedPlanSettingsId)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4">
      {selectedRuleUuid && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-gray-600 istui-timetable__main_preferences_title">
            Active Rule Preferences: {activePreferencesCount}
          </p>
          {selectedPlanSettingsId && (
            <div className="mt-2 flex items-center text-sm text-blue-600">
              <GraduationCap className="h-4 w-4 mr-1" />
              <span>Plan Settings: {getPlanSettingName(selectedPlanSettingsId)}</span>
            </div>
          )}
        </div>
      )}

      <RulePreferenceToolbar
        pendingChangesCount={rulePendingChanges.length}
        onSaveChanges={handleSaveChanges}
        onDiscardChanges={handleDiscardChanges}
        isSaving={isReduxLoading}
        hasDeleteChanges={hasDeleteChanges}
      />

      <div
        className="grid border border-gray-200 rounded overflow-hidden istui-timetable_main_preferences_calendar"
        style={{
          gridTemplateColumns: `60px minmax(120px,auto) repeat(${uniqueDays.length},1fr)`,
          width: "100%",
        }}
      >
        <RuleScheduleCalendarHeader days={uniqueDays} dayNames={DAY_NAMES} />

        {periods.map((period, idx) => (
          <RuleScheduleCalendarRow
            key={period.id}
            period={period}
            days={uniqueDays}
            rowIndex={idx + 1}
            onCellClick={handleCellClick}
            schedulePreferences={activePreferences}
            currentCell={currentCell}
            selectedScheduleIds={selectedScheduleIds}
            isUpdating={isReduxLoading}
            pendingChanges={rulePendingChanges}
            updatingCells={updatingCells}
          />
        ))}
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200"
          onClick={() =>
            alert(
              '1. Click on cells to toggle rule applicability\n2. Click "Save Changes" when done\n3. Cells that are highlighted show where the rule applies',
            )
          }
        >
          Help
        </button>
      </div>

      {isReduxLoading && updatingCells.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg flex items-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-3" />
          <p>Saving changes... ({updatingCells.length} remaining)</p>
        </div>
      )}
    </div>
  );
};

export default RuleScheduleCalendar;
