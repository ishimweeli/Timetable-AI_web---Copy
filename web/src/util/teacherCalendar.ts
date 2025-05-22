// src/util/teacherCalendar.ts
import { PreferenceType } from "@/type/Calendar/TypeCalendar";

// Mapping of backend preference values (snake_case) to frontend PreferenceType enum
const backendToPreferenceTypeMap = {
  must_teach: PreferenceType.MUST_SCHEDULE_CLASS,
  prefers_to_teach: PreferenceType.PREFERS_TO_SCHEDULE_CLASS,
  dont_prefer_to_teach: PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
  cannot_teach: PreferenceType.MUST_NOT_SCHEDULE_CLASS,
  // Also include camelCase versions for compatibility with different API responses
  mustTeach: PreferenceType.MUST_SCHEDULE_CLASS,
  prefersToTeach: PreferenceType.PREFERS_TO_SCHEDULE_CLASS,
  dontPreferToTeach: PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
  cannotTeach: PreferenceType.MUST_NOT_SCHEDULE_CLASS
};

// Mapping of frontend PreferenceType enum to backend preference values (snake_case for API)
const preferenceTypeToBackendMap = {
  [PreferenceType.MUST_SCHEDULE_CLASS]: "must_teach",
  [PreferenceType.PREFERS_TO_SCHEDULE_CLASS]: "prefers_to_teach",
  [PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS]: "dont_prefer_to_teach",
  [PreferenceType.MUST_NOT_SCHEDULE_CLASS]: "cannot_teach",
};

// Helper function to determine which preference field is active in the response
// FIXED: use strict === true comparison to handle false/null values properly
export const getActivePreferenceField = (preference) => {
  // Check for exactly true values (to handle fields that can be false or null)
  if (preference.mustTeach === true) return 'mustTeach';
  if (preference.cannotTeach === true) return 'cannotTeach';
  if (preference.prefersToTeach === true) return 'prefersToTeach';
  if (preference.dontPreferToTeach === true) return 'dontPreferToTeach';
  
  // Also check old format with strict comparison
  if (preference.mustScheduleClass === true) return 'mustScheduleClass';
  if (preference.mustNotScheduleClass === true) return 'mustNotScheduleClass';
  if (preference.prefersToScheduleClass === true) return 'prefersToScheduleClass';
  if (preference.prefersNotToScheduleClass === true) return 'prefersNotToScheduleClass';
  
  return null;
};

// Teacher preference options with correct backend mapping and standardized display
export const getTeacherPreferenceOptions = () => [
  {
    type: PreferenceType.MUST_SCHEDULE_CLASS,
    label: "Fixed Requirement",
    color: "bg-blue-500 text-white border-blue-600",
    description: "Fixed teaching requirement for this time slot",
    icon: "pin",
    backendValue: "must_teach"
  },
  {
    type: PreferenceType.PREFERS_TO_SCHEDULE_CLASS,
    label: "Preferred Slot",
    color: "bg-green-500 text-white border-green-600",
    description: "Teacher prefers to teach during this time slot",
    icon: "check",
    backendValue: "prefers_to_teach"
  },
  {
    type: PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
    label: "Not Preferred",
    color: "bg-amber-500 text-white border-amber-600",
    description: "Teacher would prefer not to teach during this time slot",
    icon: "circle",
    backendValue: "dont_prefer_to_teach"
  },
  {
    type: PreferenceType.MUST_NOT_SCHEDULE_CLASS,
    label: "Unavailable Slot",
    color: "bg-red-500 text-white border-red-600",
    description: "Teacher is unavailable during this time slot",
    icon: "x",
    backendValue: "cannot_teach"
  }
];

// Get active preference type from a preference object - improved version
export const getActiveTeacherPreferenceType = (preference, fields = null) => {
  if (!preference) return null;
  
  // First, try to find the active field directly
  const activeField = getActivePreferenceField(preference);
  if (activeField) {
    // Map the active field to a preference type
    switch (activeField) {
      case 'mustTeach':
      case 'mustScheduleClass': // Handles frontend-consistent field
        return PreferenceType.MUST_SCHEDULE_CLASS;
      case 'cannotTeach':
      case 'mustNotScheduleClass': // Handles frontend-consistent field
        return PreferenceType.MUST_NOT_SCHEDULE_CLASS;
      case 'prefersToTeach':
      case 'prefersToScheduleClass': // Handles frontend-consistent field
        return PreferenceType.PREFERS_TO_SCHEDULE_CLASS;
      case 'dontPreferToTeach':
      case 'prefersNotToScheduleClass': // Handles frontend-consistent field
        return PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS;
    }
  }
  
  // Then try checking fields provided in the fields parameter (for backward compatibility or specific cases)
  if (fields) {
    if (preference[fields.mustScheduleClass] === true) { // Use frontend-consistent field from PreferenceFields
      return PreferenceType.MUST_SCHEDULE_CLASS;
    } else if (preference[fields.mustNotScheduleClass] === true) { // Use frontend-consistent field
      return PreferenceType.MUST_NOT_SCHEDULE_CLASS;
    } else if (preference[fields.prefersToScheduleClass] === true) { // Use frontend-consistent field
      return PreferenceType.PREFERS_TO_SCHEDULE_CLASS;
    } else if (preference[fields.prefersNotToScheduleClass] === true) { // Use frontend-consistent field
      return PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS;
    }
  }
  
  return null;
};

// Convert frontend preference type to backend value
export const getBackendPreferenceType = (frontendType) => {
  return preferenceTypeToBackendMap[frontendType] || null;
};

// Convert backend preference type to frontend type
export const getFrontendPreferenceType = (backendType) => {
  return backendToPreferenceTypeMap[backendType] || null;
};

// Map backend preference type to frontend type - legacy function kept for compatibility
export const mapBackendToFrontendPreferenceType = (backendType) => {
  return getFrontendPreferenceType(backendType);
};

// Get color for a preference type - updated to match standardized colors
export const getPreferenceColor = (preferenceType: PreferenceType | null): string => {
  switch (preferenceType) {
    case PreferenceType.MUST_SCHEDULE_CLASS:
      return "bg-blue-500"; // Fixed Requirement - blue
    case PreferenceType.MUST_NOT_SCHEDULE_CLASS:
      return "bg-red-600"; // Unavailable Slot - red
    case PreferenceType.PREFERS_TO_SCHEDULE_CLASS:
      return "bg-green-500"; // Preferred Slot - green
    case PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS:
      return "bg-amber-500"; // Not Preferred - amber
    default:
      return "bg-gray-300"; // No Preference - grey
  }
};

// Get icon name for a preference type (returns string instead of JSX)
export const getPreferenceIconName = (preferenceType: PreferenceType | null): string => {
  switch (preferenceType) {
    case PreferenceType.MUST_SCHEDULE_CLASS:
      return "pin"; // Fixed Requirement - pin icon
    case PreferenceType.MUST_NOT_SCHEDULE_CLASS:
      return "x"; // Unavailable Slot - X icon
    case PreferenceType.PREFERS_TO_SCHEDULE_CLASS:
      return "check"; // Preferred Slot - check icon
    case PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS:
      return "circle"; // Not Preferred - circle icon
    default:
      return "circle"; // No Preference - circle icon
  }
};

// Get display name for a preference type - updated to match standardized naming
export const getPreferenceDisplayName = (preferenceType: PreferenceType | null): string => {
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

// Count active preferences
export const countActiveTeacherPreferences = (preferences) => {
  if (!preferences || !Array.isArray(preferences)) return 0;
  return preferences.length;
};

// Function to inspect all preference fields in console
export const inspectPreference = (preference, message = "Preference inspection:") => {
  console.group(message);
  console.log("UUID:", preference.uuid);
  console.log("Period:", preference.periodId, "Day:", preference.dayOfWeek);
  
  console.log("Standard fields:");
  console.log("- mustTeach:", preference.mustTeach, typeof preference.mustTeach);
  console.log("- cannotTeach:", preference.cannotTeach, typeof preference.cannotTeach);
  console.log("- prefersToTeach:", preference.prefersToTeach, typeof preference.prefersToTeach);
  console.log("- dontPreferToTeach:", preference.dontPreferToTeach, typeof preference.dontPreferToTeach);
  
  console.log("Legacy fields:");
  console.log("- mustScheduleClass:", preference.mustScheduleClass, typeof preference.mustScheduleClass);
  console.log("- mustNotScheduleClass:", preference.mustNotScheduleClass, typeof preference.mustNotScheduleClass);
  console.log("- prefersToScheduleClass:", preference.prefersToScheduleClass, typeof preference.prefersToScheduleClass);
  console.log("- prefersNotToScheduleClass:", preference.prefersNotToScheduleClass, typeof preference.prefersNotToScheduleClass);
  
  const activeField = getActivePreferenceField(preference);
  console.log("Active field detected:", activeField);
  const preferenceType = getActiveTeacherPreferenceType(preference);
  console.log("Detected preference type:", preferenceType);
  console.groupEnd();
};

// Debug API payloads
export const debugApiPayload = (operation, payload) => {
  console.log(`API ${operation} Payload:`, JSON.stringify(payload, null, 2));
  return payload;
};