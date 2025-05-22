import React, { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { ShieldCheck, GraduationCap } from "lucide-react";

import RuleScheduleCalendar from "./RuleScheduleCalendar";
import { setSelectedRuleUuid } from "@/store/Rule/sliceRulePreference";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";

interface RuleScheduleTabProps {
  selectedRule: any | null;
}

const RuleScheduleTab: React.FC<RuleScheduleTabProps> = ({ selectedRule }) => {
  const dispatch = useAppDispatch();
  const { selectedRuleUuid } = useAppSelector((state) => state.rulePreference);
  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);

  useEffect(() => {
    if(selectedRule?.uuid && selectedRule.uuid !== selectedRuleUuid) {
      dispatch(setSelectedRuleUuid(selectedRule.uuid));
    }
  }, [selectedRule, dispatch, selectedRuleUuid]);

  const getPlanSettingName = (id: number | null) => {
    if(!id || !planSettingsList) return "";
    const planSetting = planSettingsList.find((ps) => ps.id === id);
    return planSetting ? planSetting.name : "";
  };

  if(!selectedRule) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Rule Selected</h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Please select a rule from the list to manage its schedule preferences.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <h3 className="text-lg font-medium text-blue-800 mb-1">
          Rule Schedule Preferences
        </h3>
        <p className="text-sm text-blue-600">
          Configure where <strong>{selectedRule.name}</strong> applies in the
          schedule by clicking on the time slots.
        </p>
        {selectedRule.planSettingsId && (
          <div className="mt-2 flex items-center text-sm text-blue-600">
            <GraduationCap className="h-4 w-4 mr-1" />
            <span>Using Plan Settings: {getPlanSettingName(selectedRule.planSettingsId)}</span>
          </div>
        )}
      </div>

      <RuleScheduleCalendar selectedPlanSettingsId={selectedRule.planSettingsId} />
    </div>
  );
};

export default RuleScheduleTab;
