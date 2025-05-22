import {
  SchedulePreference,
  PreferenceType,
  Preference,
  ChangeOperationType,
  PendingChange,
} from "@/type/Calendar/TypeCalendar";
import { Check, X, PinIcon, Circle } from "lucide-react";
import React from "react";

/**
 * Count the number of active preferences in a list of schedule preferences
 */
export const countActivePreferences = (
  preferences: SchedulePreference[],
): number => {
  if(!preferences || !Array.isArray(preferences) || preferences.length === 0) {
    return 0;
  }

  return preferences.filter((pref) => {
    // For teacher preferences
    if(
      pref.cannotTeach ||
      pref.prefersToTeach ||
      pref.mustTeach ||
      pref.dontPreferToTeach
    ) {
      return true;
    }

    // For class preferences
    if(
      pref.mustScheduleClass ||
      pref.mustNotScheduleClass ||
      pref.prefersToScheduleClass ||
      pref.preferNotToScheduleClass ||
      pref.prefersNotToScheduleClass
    ) {
      return true;
    }

    return false;
  }).length;
};

/**
 * Get preference color based on type
 */
export const getPreferenceColor = (
  preferenceType: PreferenceType | null,
): string => {
  if(!preferenceType) return "bg-gray-300"; // No preference - grey

  // Class-specific preferences
  if(preferenceType === PreferenceType.MUST_SCHEDULE_CLASS)
    return "bg-amber-400"; // Must - yellow
  if(preferenceType === PreferenceType.MUST_NOT_SCHEDULE_CLASS)
    return "bg-red-600"; // Blocked - red
  if(preferenceType === PreferenceType.PREFERS_TO_SCHEDULE_CLASS)
    return "bg-green-500"; // Preferred - green
  if(preferenceType === PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS)
    return "bg-red-600"; // Blocked - red

  // Teacher-specific preferences
  if(preferenceType === PreferenceType.MUST_TEACH) 
    return "bg-amber-400"; // Must - yellow
  if(preferenceType === PreferenceType.CANNOT_TEACH) 
    return "bg-red-600"; // Blocked - red
  if(preferenceType === PreferenceType.PREFERS_TO_TEACH) 
    return "bg-green-500"; // Preferred - green
  if(preferenceType === PreferenceType.DONT_PREFER_TO_TEACH)
    return "bg-red-600"; // Blocked - red

  return "bg-gray-300"; // Default - grey
};

/**
 * Get preference icon based on type
 */
export const getPreferenceIcon = (
  preferenceType: PreferenceType | null,
): React.ReactNode => {
  if(!preferenceType) return <Circle className="text-gray-400 h-4 w-4" />;

  // Class-specific preferences
  if(preferenceType === PreferenceType.MUST_SCHEDULE_CLASS)
    return <PinIcon className="text-white h-4 w-4" />;
  if(preferenceType === PreferenceType.MUST_NOT_SCHEDULE_CLASS)
    return <X className="text-white h-4 w-4" />;
  if(preferenceType === PreferenceType.PREFERS_TO_SCHEDULE_CLASS)
    return <Check className="text-white h-4 w-4" />;
  if(preferenceType === PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS)
    return <X className="text-white h-4 w-4" />;

  // Teacher-specific preferences
  if(preferenceType === PreferenceType.MUST_TEACH)
    return <PinIcon className="text-white h-4 w-4" />;
  if(preferenceType === PreferenceType.CANNOT_TEACH)
    return <X className="text-white h-4 w-4" />;
  if(preferenceType === PreferenceType.PREFERS_TO_TEACH)
    return <Check className="text-white h-4 w-4" />;
  if(preferenceType === PreferenceType.DONT_PREFER_TO_TEACH)
    return <X className="text-white h-4 w-4" />;

  return <Circle className="text-gray-400 h-4 w-4" />;
};

/**
 * Format time string (e.g., "08:00" to "8:00 AM")
 */
export const formatTime = (timeString: string): string => {
  try {
    const [hours, minutes] = timeString.split(":").map(Number);
    if(isNaN(hours) || isNaN(minutes)) return timeString;

    const period = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }catch(e) {
    return timeString;
  }
};


export const getActivePreferenceType = (
  preference: SchedulePreference | undefined,
): PreferenceType | null => {
  if(!preference) return null;

  // Class-specific preferences
  if(preference.mustScheduleClass) return PreferenceType.MUST_SCHEDULE_CLASS;
  if(preference.mustNotScheduleClass)
    return PreferenceType.MUST_NOT_SCHEDULE_CLASS;
  if(preference.prefersToScheduleClass)
    return PreferenceType.PREFERS_TO_SCHEDULE_CLASS;
  // Check both variations of the prefer not field name (with and without 's')
  if(
    preference.prefersNotToScheduleClass ||
    preference.preferNotToScheduleClass
  )
    return PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS;

  // Teacher-specific preferences
  if(preference.mustTeach) return PreferenceType.MUST_TEACH;
  if(preference.cannotTeach) return PreferenceType.CANNOT_TEACH;
  if(preference.prefersToTeach) return PreferenceType.PREFERS_TO_TEACH;
  if(preference.dontPreferToTeach) return PreferenceType.DONT_PREFER_TO_TEACH;

  return null;
};

/**
 * Get display name for a preference type
 */
export const getPreferenceDisplayName = (
  preferenceType: PreferenceType | null,
): string => {
  if(!preferenceType) return "No Preference";

  switch (preferenceType) {
    case PreferenceType.MUST_SCHEDULE_CLASS:
      return "Fixed Requirement";
    case PreferenceType.MUST_NOT_SCHEDULE_CLASS:
      return "Unavailable Slot";
    case PreferenceType.PREFERS_TO_SCHEDULE_CLASS:
      return "Preferred Slot";
    case PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS:
      return "Unavailable Slot";
    case PreferenceType.MUST_TEACH:
      return "Fixed Requirement";
    case PreferenceType.CANNOT_TEACH:
      return "Unavailable Slot";
    case PreferenceType.PREFERS_TO_TEACH:
      return "Preferred Slot";
    case PreferenceType.DONT_PREFER_TO_TEACH:
      return "Unavailable Slot";
    default:
      return "No Preference";
  }
};

/**
 * Get default preferences for the toolbar - Teacher specific
 */
export const getDefaultPreferences = (): Preference[] => {
  return [
    {
      uuid: "1",
      name: "Fixed Requirement",
      type: PreferenceType.MUST_TEACH,
      description: "Fixed teaching requirement for this time slot",
    },
    {
      uuid: "2",
      name: "Unavailable Slot",
      type: PreferenceType.CANNOT_TEACH,
      description: "Teacher is unavailable during this time slot",
    },
    {
      uuid: "3",
      name: "Preferred Slot",
      type: PreferenceType.PREFERS_TO_TEACH,
      description: "Teacher prefers to teach during this time slot",
    },
    {
      uuid: "4",
      name: "Unavailable Slot",
      type: PreferenceType.DONT_PREFER_TO_TEACH,
      description: "Teacher is unavailable during this time slot",
    },
  ];
};

/**
 * Get default class preferences for the toolbar
 */
export const getDefaultClassPreferences = (): Preference[] => {
  return [
    {
      uuid: "1",
      name: "Fixed Requirement",
      type: PreferenceType.MUST_SCHEDULE_CLASS,
      description: "Class must be scheduled during this time slot",
    },
    {
      uuid: "2",
      name: "Unavailable Slot",
      type: PreferenceType.MUST_NOT_SCHEDULE_CLASS,
      description: "Class cannot be scheduled during this time slot",
    },
    {
      uuid: "3",
      name: "Preferred Slot",
      type: PreferenceType.PREFERS_TO_SCHEDULE_CLASS,
      description: "Class is preferred during this time slot",
    },
    {
      uuid: "4",
      name: "Unavailable Slot",
      type: PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
      description: "Class is unavailable during this time slot",
    },
  ];
};

/**
 * Count pending changes by type
 */
export const countPendingChangesByType = (
  pendingChanges: PendingChange[],
  operationType: ChangeOperationType,
): number => {
  return pendingChanges.filter(
    (change) => change.operationType === operationType,
  ).length;
};
