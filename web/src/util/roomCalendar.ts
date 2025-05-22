import { Check, X } from "lucide-react";
import React from "react";

// Room-specific preference types
export const ROOM_PREFERENCE_TYPES = {
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
};

/**
 * Get preference color based on room preference type
 */
export const getRoomPreferenceColor = (preferenceType: string | null): string => {
  if (!preferenceType) return "bg-gray-300"; // Default - grey

  switch (preferenceType) {
    case ROOM_PREFERENCE_TYPES.AVAILABLE:
      return "bg-green-500"; // Available - green (matching standardized colors)
    case ROOM_PREFERENCE_TYPES.UNAVAILABLE:
      return "bg-red-600"; // Unavailable - red (matching standardized colors)
    default:
      return "bg-gray-300"; // Default - grey
  }
};

/**
 * Get preference icon name based on room preference type
 */
export const getRoomPreferenceIconName = (preferenceType: string | null): string => {
  switch (preferenceType) {
    case ROOM_PREFERENCE_TYPES.AVAILABLE:
      return "check"; // Available - check icon
    case ROOM_PREFERENCE_TYPES.UNAVAILABLE:
      return "x"; // Unavailable - X icon
    default:
      return ""; // No icon
  }
};

/**
 * Get preference display name based on room preference type
 */
export const getRoomPreferenceDisplayName = (preferenceType: string | null): string => {
  switch (preferenceType) {
    case ROOM_PREFERENCE_TYPES.AVAILABLE:
      return "Available";
    case ROOM_PREFERENCE_TYPES.UNAVAILABLE:
      return "Unavailable";
    default:
      return "No Preference";
  }
};

/**
 * Get cell background style based on room preference type
 */
export const getRoomCellStyle = (preferenceType: string | null): string => {
  switch (preferenceType) {
    case ROOM_PREFERENCE_TYPES.AVAILABLE:
      return "bg-green-100 hover:bg-green-200";
    case ROOM_PREFERENCE_TYPES.UNAVAILABLE:
      return "bg-red-100 hover:bg-red-200";
    default:
      return "bg-gray-100 hover:bg-gray-200";
  }
};

/**
 * Get room preference toolbar options
 */
export const getRoomPreferenceOptions = () => [
  {
    type: ROOM_PREFERENCE_TYPES.AVAILABLE,
    label: "Available",
    color: "bg-green-500 text-white border-green-600",
    description: "Room is available during this time slot",
    icon: "check",
  },
  {
    type: ROOM_PREFERENCE_TYPES.UNAVAILABLE,
    label: "Unavailable",
    color: "bg-red-600 text-white border-red-700",
    description: "Room is unavailable during this time slot",
    icon: "x",
  },
]; 