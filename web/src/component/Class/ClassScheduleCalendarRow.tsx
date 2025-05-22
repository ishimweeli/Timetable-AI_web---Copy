import React from "react";
import ClassScheduleCalendarCell from "./ClassScheduleCalendarCell";
import {
  Period,
  SchedulePreference,
  CellInfo,
  PendingChange,
} from "@/type/Calendar/TypeCalendar";

interface PreferenceFields {
  mustScheduleClass: string;
  mustNotScheduleClass: string;
  prefersToScheduleClass: string;
  prefersNotToScheduleClass: string;
}

interface ClassScheduleCalendarRowProps {
  period: Period;
  days: number[];
  rowIndex: number;
  onCellClick: (cellInfo: CellInfo) => void;
  schedulePreferences: SchedulePreference[];
  currentCell: CellInfo | null;
  selectedScheduleIds?: string[];
  isUpdating: boolean;
  pendingChanges: PendingChange[];
  updatingCells: string[];
  preferenceFields: PreferenceFields;
}

const ClassScheduleCalendarRow: React.FC<ClassScheduleCalendarRowProps> = ({
  period,
  days,
  rowIndex,
  onCellClick,
  schedulePreferences,
  currentCell,
  selectedScheduleIds = [],
  isUpdating,
  pendingChanges,
  updatingCells,
  preferenceFields,
}) => {
  return (
    <>
      <div className="p-3 border border-gray-200 text-center font-medium">
        {rowIndex}
      </div>
      <div className="p-3 border border-gray-200 text-center font-medium whitespace-nowrap">
        {period.time}
      </div>
      {days.map((dayNumber) => {
        // Find the schedule for this day
        const schedule = period.schedules?.find((s) => s.day === dayNumber);

        if(!schedule && !period.days?.includes(dayNumber)) {
          return (
            <div
              key={`${period.uuid}-${dayNumber}`}
              className="border border-gray-200 h-12 group bg-gray-50"
            />
          );
        }

        // Generate cell index for this cell
        const cellIndex = `${period.id}-${dayNumber}`;

        // Find any preference for this cell (by periodId and dayOfWeek)
        const existingPref = schedulePreferences.find(
          (sp) => sp.periodId === period.id && sp.dayOfWeek === dayNumber && !sp.isDeleted,
        );

        // Find any pending change for this cell
        const pendingChange = pendingChanges.find(
          (change) => change.cellIndex === cellIndex,
        );

        const isSelected =
          currentCell && (schedule || period.days?.includes(dayNumber))
            ? currentCell.periodId === period.id && currentCell.dayOfWeek === dayNumber
            : false;

        return (
          <div
            key={`${period.uuid}-${dayNumber}`}
            className="border border-gray-200 h-12 group"
          >
            <ClassScheduleCalendarCell
              periodId={period.id}
              dayOfWeek={dayNumber}
              onCellClick={onCellClick}
              preference={existingPref}
              isSelected={isSelected}
              isUpdating={isUpdating}
              pendingChange={pendingChange}
              updatingCells={updatingCells}
              preferenceFields={preferenceFields}
            />
          </div>
        );
      })}
    </>
  );
};

export default ClassScheduleCalendarRow;
