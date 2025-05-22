import React from "react";
import { formatTime } from "@/util/classBandCalendar";
import ClassBandScheduleCalendarCell from "@/component/ClassBand/ClassBandScheduleCalendarCell";
import {
  Period,
  SchedulePreference,
  CellInfo,
  PendingChange,
} from "@/type/Calendar/TypeCalendar";

interface ClassBandScheduleCalendarRowProps {
  period: Period;
  days: number[];
  rowIndex: number;
  onCellClick: (cellInfo: CellInfo) => void;
  schedulePreferences: SchedulePreference[];
  currentCell: CellInfo | null;
  selectedScheduleIds: string[];
  isUpdating: boolean;
  pendingChanges: PendingChange[];
  updatingCells: string[];
  preferenceFields: {
    mustScheduleClass: string;
    mustNotScheduleClass: string;
    prefersToScheduleClass: string;
    prefersNotToScheduleClass: string;
  };
}

const ClassBandScheduleCalendarRow: React.FC<ClassBandScheduleCalendarRowProps> = ({
  period,
  days,
  rowIndex,
  onCellClick,
  schedulePreferences,
  currentCell,
  selectedScheduleIds,
  isUpdating,
  pendingChanges,
  updatingCells,
  preferenceFields,
}) => {
  const getPreferenceForCell = (periodId: number, dayOfWeek: number) => {
    return schedulePreferences.find(
      (pref) =>
        pref.periodId === periodId &&
        pref.dayOfWeek === dayOfWeek &&
        !pref.isDeleted,
    );
  };

  const getPendingChangeForCell = (periodId: number, dayOfWeek: number) => {
    const cellIndex = `${periodId}-${dayOfWeek}`;
    return pendingChanges.find((change) => change.cellIndex === cellIndex);
  };

  return (
    <>
      {/* Time period label */}
      <div
        className={`px-2 py-1 flex items-center justify-center text-xs font-semibold border-r border-b ${
          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
        }`}
      >
        {rowIndex}
      </div>

      {/* Period name */}
      <div
        className={`px-4 py-2 text-sm border-r border-b ${
          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
        }`}
      >
        <div className="font-medium">{period.name}</div>
        <div className="text-xs opacity-70">
          {formatTime(period.startTime)} - {formatTime(period.endTime)}
        </div>
      </div>

      {/* Days of week */}
      {days.map((day) => {
        const preference = getPreferenceForCell(period.id, day);
        const pendingChange = getPendingChangeForCell(period.id, day);
        const schedule = period.schedules?.find((s) => s.day === day);
        const isSelected = schedule
          ? selectedScheduleIds.includes(schedule.id)
          : false;

        return (
          <ClassBandScheduleCalendarCell
            key={`${period.id}-${day}`}
            periodId={period.id}
            dayOfWeek={day}
            onCellClick={onCellClick}
            preference={preference}
            isSelected={isSelected}
            isUpdating={isUpdating}
            pendingChange={pendingChange}
            updatingCells={updatingCells}
            preferenceFields={preferenceFields}
          />
        );
      })}
    </>
  );
};

export default ClassBandScheduleCalendarRow; 