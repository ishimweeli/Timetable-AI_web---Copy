// src/component/Teacher/TeacherScheduleCalendarCell.tsx
import React from "react";
import { Loader2, Check, X, PinIcon, Circle } from "lucide-react";
import { 
  SchedulePreference, 
  CellInfo, 
  PreferenceType, 
  PendingChange,
  PreferenceFields,
  ChangeOperationType
} from "@/type/Calendar/TypeCalendar";
import { 
  getPreferenceColor,
  getPreferenceIconName,
  getActiveTeacherPreferenceType,
  getPreferenceDisplayName
} from "@/util/teacherCalendar";

interface TeacherScheduleCalendarCellProps {
  periodUuid: string | number;
  periodId?: string | number;
  day: number;
  dayOfWeek?: number;
  rowIndex?: number;
  currentPreference?: SchedulePreference;
  onCellClick: (cellInfo: CellInfo) => void;
  isSelected: boolean;
  isPending?: boolean;
  isUpdating: boolean;
  preferenceFields: PreferenceFields;
  pendingChanges?: PendingChange[];
  updatingCells?: string[];
}

// Create a function to render the icon based on the icon name - updated with standardized icons
const renderIcon = (iconName: string) => {
  switch (iconName) {
    case "pin":
      return <PinIcon className="h-4 w-4 text-white" />;
    case "check":
      return <Check className="h-4 w-4 text-white" />;
    case "x":
      return <X className="h-4 w-4 text-white" />;
    case "circle":
      return <Circle className="h-4 w-4 text-white" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

const TeacherScheduleCalendarCell: React.FC<TeacherScheduleCalendarCellProps> = ({
  periodUuid,
  periodId,
  day,
  dayOfWeek,
  rowIndex = 0,
  currentPreference,
  onCellClick,
  isSelected,
  isPending = false,
  isUpdating,
  preferenceFields,
  pendingChanges = [],
  updatingCells = [],
}) => {
  // Ensure we have valid period IDs
  const actualPeriodId = periodId || periodUuid;
  const actualDayOfWeek = dayOfWeek || day;
  
  // Create a unique cell index for this cell
  const cellIndex = `${actualPeriodId}-${actualDayOfWeek}`;
  const isCellUpdating = updatingCells.includes(cellIndex);
  
  // Get pending change for this cell if any
  const pendingChange = pendingChanges.find(change => 
    change.cellIndex === cellIndex || 
    (change.periodId === actualPeriodId && Number(change.dayOfWeek) === Number(actualDayOfWeek))
  );

  // Determine the current preference type
  let activePreferenceType = currentPreference
    ? getActiveTeacherPreferenceType(currentPreference, preferenceFields)
    : null;

  // Apply pending change if exists
  if (pendingChange) {
    if (pendingChange.operationType === ChangeOperationType.DELETE) {
      activePreferenceType = null;
    } else if (pendingChange.newPreferenceType) {
      activePreferenceType = pendingChange.newPreferenceType;
    }
  }

  // Handle cell click
  const handleClick = () => {
    if (isUpdating) return;
    
    onCellClick({
      periodId: actualPeriodId,
      periodUuid: typeof periodUuid === 'number' ? periodUuid.toString() : periodUuid,
      day,
      dayOfWeek: actualDayOfWeek,
      currentPreference,
    });
  };

  // Get display properties
  const bgColorClass = getPreferenceColor(activePreferenceType);
  const iconName = getPreferenceIconName(activePreferenceType);
  const displayName = getPreferenceDisplayName(activePreferenceType);

  return (
    <div
      className={`
        relative h-full w-full flex items-center justify-center 
        border border-gray-200 bg-white
        cursor-pointer transition-all duration-150 hover:bg-gray-50
        ${rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
        ${isSelected ? "ring-2 ring-blue-500" : ""}
        ${isPending ? "opacity-70" : ""}
        ${pendingChange ? "ring-1 ring-blue-400" : ""}
      `}
      onClick={handleClick}
      data-period-id={actualPeriodId}
      data-period-uuid={periodUuid}
      data-day={day}
      data-cell-index={cellIndex}
      data-preference-uuid={currentPreference?.uuid}
    >
      {isCellUpdating || isUpdating ? (
        <div className="flex items-center justify-center h-full min-h-[60px]">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-2 h-full min-h-[60px]">
          {activePreferenceType && (
            <>
              <div className={`flex items-center justify-center rounded-full w-8 h-8 ${bgColorClass}`}>
                {renderIcon(iconName)}
              </div>
            </>
          )}
          {pendingChange && (
            <div className="absolute top-1 right-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeacherScheduleCalendarCell;