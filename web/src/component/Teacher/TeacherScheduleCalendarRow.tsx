// src/component/Teacher/TeacherScheduleCalendarRow.tsx
import React from "react";
import { SchedulePreference, CellInfo, PendingChange, PreferenceFields } from "@/type/Calendar/TypeCalendar";
import TeacherScheduleCalendarCell from "./TeacherScheduleCalendarCell";

interface TeacherScheduleCalendarRowProps {
  period: any;
  days: number[];
  rowIndex: number;
  onCellClick: (cellInfo: CellInfo) => void;
  schedulePreferences: SchedulePreference[];
  currentCell: CellInfo | null;
  selectedScheduleIds: string[];
  isUpdating: boolean;
  pendingChanges: PendingChange[];
  updatingCells: string[];
  preferenceFields: PreferenceFields;
}

const TeacherScheduleCalendarRow: React.FC<TeacherScheduleCalendarRowProps> = ({
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
  // Get the time column text
  const getTimeText = () => {
    if (period.startTime && period.endTime) {
      return `${period.startTime.substring(0, 5)} - ${period.endTime.substring(0, 5)}`;
    }
    return "";
  };

  // Determine if a cell is being updated
  const isCellUpdating = (periodId: string | number, day: number) => {
    // First check if we're in a general updating state
    if (isUpdating && !updatingCells.length) return true;
    
    // Then check if this specific cell is in the updating list
    return updatingCells.includes(`${periodId}-${day}`);
  };

  // Get preference for a specific cell
  const getCellPreference = (periodId: string | number, day: number) => {
    // We need to handle both string and number IDs
    const numericPeriodId = typeof periodId === 'string' ? parseInt(periodId) : periodId;
    
    if (isNaN(numericPeriodId)) {
      console.error("Invalid period ID:", periodId);
      return null;
    }
    
    // Look for preference in multiple ways (handle different data formats)
    return schedulePreferences.find((pref) => {
      // First check numerical periodId and exact day match (most reliable)
      if (pref.periodId === numericPeriodId && pref.dayOfWeek === day) {
        return true;
      }
      
      // Check string-based period ID if it exists
      if (pref.periodId && pref.periodId.toString() === periodId.toString() && pref.dayOfWeek === day) {
        return true;
      }
      
      // Additional check for any other variations in how the data might be stored
      if (pref.period && pref.period.id === numericPeriodId && pref.dayOfWeek === day) {
        return true;
      }
      
      return false;
    });
  };

  // Get unique ID for the period
  const getPeriodId = () => {
    if (period.id) return period.id;
    if (period.uuid) return period.uuid;
    return rowIndex; // Fallback to rowIndex if no id or uuid
  };

  return (
    <>
      {/* Row number */}
      <div
        className={`flex items-center justify-center border-r border-b border-gray-200 ${
          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
        }`}
      >
        <span className="text-xs font-medium text-gray-500">
          {period.periodNumber || rowIndex}
        </span>
      </div>

      {/* Time cell */}
      <div
        className={`flex flex-col justify-center px-3 py-2 border-r border-b border-gray-200 ${
          rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
        }`}
      >
        <div className="font-medium text-sm">{period.name}</div>
        <div className="text-xs text-gray-500">{getTimeText()}</div>
      </div>

      {/* Day cells */}
      {days.map((day) => {
        // Get the preference for this cell, if any
        const periodId = getPeriodId();
        const preference = getCellPreference(periodId, day);
        
        // Compose a unique cell key
        const cellKey = `${period.id || period.uuid}-${day}`;
        
        // Determine if this cell is currently selected
        const isSelected = selectedScheduleIds.includes(cellKey);
        
        // Determine if this cell is being updated
        const isUpdatingCell = isCellUpdating(periodId, day);

        // For debugging
        if (preference) {
          console.log(`Found preference for period ${periodId}, day ${day}:`, preference);
        }
        
        return (
          <TeacherScheduleCalendarCell
            key={cellKey}
            periodUuid={period.uuid || ""}
            periodId={period.id || getPeriodId()}
            day={day}
            dayOfWeek={day}
            rowIndex={rowIndex}
            currentPreference={preference}
            onCellClick={onCellClick}
            isSelected={isSelected}
            isUpdating={isUpdatingCell}
            preferenceFields={preferenceFields}
            pendingChanges={pendingChanges}
            updatingCells={updatingCells}
          />
        );
      })}
    </>
  );
};

export default TeacherScheduleCalendarRow;