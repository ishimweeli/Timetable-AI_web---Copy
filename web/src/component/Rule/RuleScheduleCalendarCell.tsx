import React from "react";
import { Check, CheckCircle } from "lucide-react";
import {
  SchedulePreference,
  CellInfo,
  PendingChange,
} from "@/type/Calendar/TypeCalendar";
import { 
  getRulePreferenceStatus, 
  getRulePreferenceColor,
  getRulePreferenceIconName 
} from "@/util/ruleCalendar";

interface RuleScheduleCalendarCellProps {
  scheduleId: string;
  periodId: string | number;
  day: number;
  onCellClick: (cellInfo: CellInfo) => void;
  preference?: SchedulePreference;
  isSelected?: boolean;
  isUpdating: boolean;
  pendingChange?: PendingChange;
  updatingCells?: string[];
}

const RuleScheduleCalendarCell: React.FC<RuleScheduleCalendarCellProps> = ({
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

  const ruleApplies = getRulePreferenceStatus(preference);

  let appliesAfterChange = ruleApplies;
  if(pendingChange) {
    appliesAfterChange =
      pendingChange.operationType === "CREATE"
        ? true
        : pendingChange.operationType === "DELETE"
          ? false
          : pendingChange.appliesValue !== undefined
            ? pendingChange.appliesValue
            : ruleApplies;
  }

  const handleClick = () => {
    if(isUpdating || !periodId) return;

    if(onCellClick) {
      onCellClick({
        periodId,
        day: day,
        scheduleId: scheduleId || "",
        currentPreference: preference,
      });
    }
  };

  // Don't render if there's no periodId
  if (!periodId) {
    return null;
  }
  
  // Get preference color and icon name
  const bgColorClass = getRulePreferenceColor(appliesAfterChange);
  const iconName = getRulePreferenceIconName(appliesAfterChange);

  // Function to render the appropriate icon
  const renderIcon = () => {
    if (iconName === "check") {
      return <Check className="h-4 w-4 text-white" />;
    }
    return null;
  };
  
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
      data-day-of-week={day}
      data-preference-id={preference?.id}
      data-preference-uuid={preference?.uuid}
    >
      {appliesAfterChange && (
        <div className={`flex items-center justify-center rounded-full w-8 h-8 ${bgColorClass}`}>
          {renderIcon()}
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
          {`${scheduleId.substring(0, 8)}... - ${appliesAfterChange ? "Rule Applies" : "Rule Does Not Apply"}`}
          {pendingChange && " (Pending)"}
        </div>
      )}
    </div>
  );
};

export default RuleScheduleCalendarCell;
