import React from "react";
import {
  SchedulePreference,
  CellInfo,
  PreferenceType,
  PendingChange,
} from "@/type/Calendar/TypeCalendar";
import {
  getPreferenceColor,
  getPreferenceIcon,
  getActiveClassPreferenceType,
  getPreferenceDisplayName,
} from "@/util/classCalendar";

interface PreferenceFields {
  mustScheduleClass: string;
  mustNotScheduleClass: string;
  prefersToScheduleClass: string;
  prefersNotToScheduleClass: string;
}

interface ClassScheduleCalendarCellProps {
  periodId: number;
  dayOfWeek: number;
  onCellClick: (cellInfo: CellInfo) => void;
  preference?: SchedulePreference;
  isSelected?: boolean;
  isUpdating: boolean;
  pendingChange?: PendingChange;
  updatingCells?: string[];
  preferenceFields: PreferenceFields;
}

const ClassScheduleCalendarCell: React.FC<ClassScheduleCalendarCellProps> = ({
  periodId,
  dayOfWeek,
  onCellClick,
  preference,
  isSelected,
  isUpdating,
  pendingChange,
  updatingCells = [],
  preferenceFields,
}) => {
  if(preference?.isDeleted) {
    preference = undefined;
  }

  const cellIndex = `${periodId}-${dayOfWeek}`;
  const isUpdatingThisCell = updatingCells.includes(cellIndex);

  // Use the class-specific active preference type function
  let activePreferenceType = preference
    ? getActiveClassPreferenceType(preference, preferenceFields)
    : null;

  if(pendingChange) {
    if(pendingChange.newPreferenceType) {
      activePreferenceType = pendingChange.newPreferenceType;
    }else {
      activePreferenceType = null;
    }
  }

  const handleClick = () => {
    if(isUpdating) return;

    if(onCellClick) {
      onCellClick({
        periodId,
        day: dayOfWeek,
        dayOfWeek: dayOfWeek,
        scheduleId: '',
        currentPreference: preference,
      });
    }
  };

  const bgColor = getPreferenceColor(activePreferenceType);
  const icon = getPreferenceIcon(activePreferenceType);
  const displayName = getPreferenceDisplayName(activePreferenceType);

  return (
    <div
      onClick={handleClick}
      className={`
        relative h-full w-full flex items-center justify-center 
        cursor-pointer transition-colors duration-200
        border border-gray-200 bg-white hover:bg-gray-50
        ${isUpdating ? "cursor-not-allowed opacity-60" : ""}
        ${isUpdatingThisCell ? "animate-pulse" : ""}
        group 
        ${isSelected ? "ring-2 ring-indigo-500" : ""}
        ${pendingChange ? "ring-1 ring-blue-400" : ""}
      `}
      data-period-id={periodId}
      data-day-of-week={dayOfWeek}
      data-cell-index={cellIndex}
      data-preference-uuid={preference?.uuid}
    >
      {activePreferenceType && (
        <div className={`flex items-center justify-center rounded-full w-8 h-8 ${bgColor}`}>
          {icon}
        </div>
      )}

      {pendingChange && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
      )}
    </div>
  );
};

export default ClassScheduleCalendarCell;
