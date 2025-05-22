import {
  SchedulePreference,
  PreferenceType,
  Preference,
} from "@/type/Calendar/TypeCalendar";
import { Check, X, PinIcon, Circle } from "lucide-react";
import React from "react";

interface PreferenceFields {
  mustScheduleClass: string;
  mustNotScheduleClass: string;
  prefersToScheduleClass: string;
  prefersNotToScheduleClass: string;
}

export const backendToTeacherUiPreferenceType: Record<string, PreferenceType> = {
  must_teach: PreferenceType.MUST_SCHEDULE_CLASS,
  prefers_to_teach: PreferenceType.PREFERS_TO_SCHEDULE_CLASS,
  dont_prefer_to_teach: PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
  cannot_teach: PreferenceType.MUST_NOT_SCHEDULE_CLASS,
};

/**
 * Count the number of active class band preferences in a list of schedule preferences
 */
export const countActiveClassBandPreferences = (
  preferences: SchedulePreference[],
): number => {
  if(!preferences || !Array.isArray(preferences) || preferences.length === 0) {
    return 0;
  }

  return preferences.filter((pref) => {
    // For class band preferences
    if(
      pref.mustScheduleClass ||
      pref.mustNotScheduleClass ||
      pref.prefersToScheduleClass ||
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

  if(preferenceType === PreferenceType.MUST_SCHEDULE_CLASS)
    return "bg-blue-500"; // Must - blue
  if(preferenceType === PreferenceType.MUST_NOT_SCHEDULE_CLASS)
    return "bg-red-600"; // Blocked - red
  if(preferenceType === PreferenceType.PREFERS_TO_SCHEDULE_CLASS)
    return "bg-green-500"; // Preferred - green
  if(preferenceType === PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS)
    return "bg-amber-500"; // Not preferred - orange/amber

  return "bg-gray-300"; // Default - grey
};

/**
 * Get preference icon based on type
 */
export const getPreferenceIcon = (
  preferenceType: PreferenceType | null,
): React.ReactNode => {
  if(!preferenceType) return <Circle className="text-gray-400 h-4 w-4" />;

  const displayName = getPreferenceDisplayName(preferenceType);

  if(preferenceType === PreferenceType.MUST_SCHEDULE_CLASS)
    return <span title={displayName}><PinIcon className="text-white h-4 w-4" /></span>;
  if(preferenceType === PreferenceType.PREFERS_TO_SCHEDULE_CLASS)
    return <span title={displayName}><Check className="text-white h-4 w-4" /></span>;
  if(preferenceType === PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS)
    return <span title={displayName}><Circle className="text-white h-4 w-4" /></span>;
  if(preferenceType === PreferenceType.MUST_NOT_SCHEDULE_CLASS)
    return <span title={displayName}><X className="text-white h-4 w-4" /></span>;

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

/**
 * Get the active preference type from a class band or teacher schedule preference
 * This is specific to class band and teacher preferences
 */
export const getActiveClassBandPreferenceType = (
  preference: SchedulePreference | undefined,
  preferenceFields: PreferenceFields,
): PreferenceType | null => {
  if(!preference) return null;

  // Teacher-specific preferences using backend keys
  const teacherBackendKeys = ["must_teach", "prefers_to_teach", "dont_prefer_to_teach", "cannot_teach"];
  const backendType = Object.keys(preference).find(key => 
    teacherBackendKeys.includes(key) && preference[key]
  );
  
  if (backendType) {
    return backendToTeacherUiPreferenceType[backendType];
  }

  // Class band-specific preferences using the provided field names
  if(preference[preferenceFields.mustScheduleClass])
    return PreferenceType.MUST_SCHEDULE_CLASS;
  if(preference[preferenceFields.mustNotScheduleClass])
    return PreferenceType.MUST_NOT_SCHEDULE_CLASS;
  if(preference[preferenceFields.prefersToScheduleClass])
    return PreferenceType.PREFERS_TO_SCHEDULE_CLASS;
  if(preference[preferenceFields.prefersNotToScheduleClass])
    return PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS;

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
      return "Not Preferred";
    default:
      return "No Preference";
  }
};

/**
 * Get class band preferences for the toolbar
 */
export const getClassBandPreferenceOptions = (): {
  type: PreferenceType;
  name: string;
  color: string;
  icon: string;
}[] => {
  return [
    {
      type: PreferenceType.MUST_SCHEDULE_CLASS,
      name: "Fixed Requirement",
      color: "bg-blue-500",
      icon: "pin",
    },
    {
      type: PreferenceType.PREFERS_TO_SCHEDULE_CLASS,
      name: "Preferred Slot",
      color: "bg-green-500",
      icon: "check",
    },
    {
      type: PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
      name: "Not Preferred",
      color: "bg-amber-500",
      icon: "circle",
    },
    {
      type: PreferenceType.MUST_NOT_SCHEDULE_CLASS,
      name: "Unavailable Slot",
      color: "bg-red-600",
      icon: "x",
    },
  ];
}; 