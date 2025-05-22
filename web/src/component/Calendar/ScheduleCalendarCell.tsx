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
  getActivePreferenceType,
  getPreferenceDisplayName,
} from "@/util/calendar";

interface ScheduleCalendarCellProps {
  scheduleId: string;
  periodId: string;
  day: number;
  onCellClick: (cellInfo: CellInfo) => void;
  preference?: SchedulePreference;
  isSelected?: boolean;
  isUpdating: boolean;
  pendingChange?: PendingChange;
  updatingCells?: string[];
}

const ScheduleCalendarCell: React.FC<ScheduleCalendarCellProps> = ({
  scheduleId,
  periodId,
  day,
  onCellClick,
  preference,
  isSelected,
  isUpdating,
  pendingChange,
  updatingCells = [],
}) => {
  if(preference?.isDeleted) {
    preference = undefined;
  }

  const cellIndex = `${periodId}-${day}`;
  const isUpdatingThisCell = updatingCells.includes(cellIndex);

  let activePreferenceType = preference
    ? getActivePreferenceType(preference)
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

    if(onCellClick && scheduleId) {
      onCellClick({
        scheduleId,
        periodId,
        day,
        currentPreference: preference,
      });
    }
  };

  const bgColor = getPreferenceColor(activePreferenceType);
  const icon = getPreferenceIcon(activePreferenceType);

  return (
    <div
      onClick={handleClick}
      className={`
        relative h-full w-full flex items-center justify-center 
        cursor-pointer transition-colors duration-200
        ${isUpdating ? "cursor-not-allowed opacity-60" : ""}
        ${isUpdatingThisCell ? "animate-pulse" : ""}
        ${scheduleId ? (activePreferenceType ? bgColor : "hover:bg-gray-50") : "hover:bg-gray-50"} 
        group 
        ${isSelected ? "ring-2 ring-indigo-500" : ""}
        ${pendingChange ? "ring-1 ring-blue-400" : ""}
      `}
      data-schedule-id={scheduleId}
      data-cell-index={cellIndex}
      data-preference-uuid={preference?.uuid}
    >
      {scheduleId && activePreferenceType && (
        <div
          className={`flex items-center justify-center rounded-full w-8 h-8 ${bgColor}`}
        >
          {icon}
        </div>
      )}

      {pendingChange && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      {scheduleId && (
        <div
          className="
            absolute bottom-full left-1/2 transform -translate-x-1/2 
            bg-black text-white text-xs rounded px-2 py-1 
            opacity-0 group-hover:opacity-100 pointer-events-none 
            transition-opacity z-10 whitespace-nowrap
          "
        >
          {`${scheduleId.substring(0, 8)}... - ${getPreferenceDisplayName(activePreferenceType)}`}
          {pendingChange && " (Pending)"}
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendarCell;
