import React from "react";
import RuleScheduleCalendarCell from "./RuleScheduleCalendarCell";
import {
  Period,
  SchedulePreference,
  CellInfo,
  PendingChange,
} from "@/type/Calendar/TypeCalendar";

interface RuleScheduleCalendarRowProps {
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
}

const RuleScheduleCalendarRow: React.FC<RuleScheduleCalendarRowProps> = ({
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
}) => {
  // Get periodId safely, checking for both id and schedules first day's periodId
  const periodId = period.id || (period.schedules && period.schedules[0]?.periodId) || null;
  
  // Log to debug what values we're working with
  console.log('Period data:', { 
    id: period.id, 
    uuid: period.uuid, 
    hasSchedules: !!period.schedules,
    scheduleCount: period.schedules?.length,
    periodId
  });
  
  const findPreferenceForTimeSlot = (periodId: string | number, dayOfWeek: number) => {
    if (!periodId) return undefined;
    
    return schedulePreferences.find((sp) => {
      // Only use period ID for matching
      const matchesPeriod = 
        (typeof periodId === "number" && sp.periodId === periodId) ||
        (typeof periodId === "string" && sp.periodId === Number(periodId));
      
      return matchesPeriod && sp.dayOfWeek === Number(dayOfWeek) && !sp.isDeleted;
    });
  };

  // If periodId is still null, don't render
  if (periodId === null) {
    console.error("Missing periodId for period:", period);
    return null;
  }

  return (
    <>
      <div className="p-3 border border-gray-200 text-center font-medium">
        {rowIndex}
      </div>
      <div className="p-3 border border-gray-200 text-center font-medium whitespace-nowrap">
        {period.time}
      </div>
      {days.map((dayNumber) => {
        const cellIndex = `${periodId}-${dayNumber}`;
        const existingPref = findPreferenceForTimeSlot(periodId, dayNumber);
        const pendingChange = pendingChanges.find(
          (change) => change.cellIndex === cellIndex,
        );
        const isSelected =
          currentCell && periodId
            ? currentCell.periodId === periodId && currentCell.day === dayNumber
            : false;
        console.log('Render cell in row', { periodId, day: dayNumber });

        return (
          <div
            key={`${periodId}-${dayNumber}`}
            className="border border-gray-200 h-12 group"
          >
            <RuleScheduleCalendarCell
              periodId={periodId}
              scheduleId={selectedScheduleIds[0] || ""}
              day={dayNumber}
              onCellClick={onCellClick}
              preference={existingPref}
              isSelected={isSelected}
              isUpdating={isUpdating}
              pendingChange={pendingChange}
              updatingCells={updatingCells}
            />
          </div>
        );
      })}
    </>
  );
};

export default RuleScheduleCalendarRow;
