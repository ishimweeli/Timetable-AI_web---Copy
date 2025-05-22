import {
  SchedulePreference,
  ChangeOperationType,
} from "@/type/Calendar/TypeCalendar";

// Rule preference types
export const RULE_PREFERENCE_TYPES = {
  APPLIES: "applies",
  DOES_NOT_APPLY: "doesNotApply",
};

export const getRulePreferenceStatus = (
  schedulePreference: SchedulePreference | undefined,
): boolean => {
  if(!schedulePreference) return false;

  return schedulePreference.applies === true;
};

/**
 * Get preference color based on rule preference status
 */
export const getRulePreferenceColor = (applies: boolean | null): string => {
  if (applies === true) {
    return "bg-green-500"; // Rule applies - green (matching standardized colors)
  }
  return "bg-gray-300"; // Default - grey
};

/**
 * Get preference icon name based on rule preference status
 */
export const getRulePreferenceIconName = (applies: boolean | null): string => {
  if (applies === true) {
    return "check"; // Rule applies - check icon
  }
  return ""; // No icon
};

/**
 * Get preference display name based on rule preference status
 */
export const getRulePreferenceDisplayName = (applies: boolean | null): string => {
  if (applies === true) {
    return "Rule Applies";
  }
  return "Rule Does Not Apply";
};

export const countActiveRulePreferences = (
  preferences: SchedulePreference[],
): number => {
  if(!preferences || !Array.isArray(preferences)) return 0;
  return preferences.filter((pref) => !pref.isDeleted && pref.applies === true)
    .length;
};

export const countRulePendingChangesByType = (
  pendingChanges: Array<{ operationType: ChangeOperationType }>,
) => {
  if(!pendingChanges || pendingChanges.length === 0) return { total: 0 };

  return {
    creates: pendingChanges.filter(
      (c) => c.operationType === ChangeOperationType.CREATE,
    ).length,
    updates: pendingChanges.filter(
      (c) => c.operationType === ChangeOperationType.UPDATE,
    ).length,
    deletes: pendingChanges.filter(
      (c) => c.operationType === ChangeOperationType.DELETE,
    ).length,
    total: pendingChanges.length,
  };
};
