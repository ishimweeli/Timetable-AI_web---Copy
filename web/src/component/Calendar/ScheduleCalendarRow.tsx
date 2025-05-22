import React, { useEffect } from "react";
import { useAppSelector } from "@/hook/useAppRedux";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/component/Ui/tooltip";
import { Button } from "@/component/Ui/button";
import { Check, X, ThumbsUp, ThumbsDown, InfoIcon } from "lucide-react";
import { SchedulePreference, PreferenceType } from "@/type/Calendar/TypeCalendar";
import { cn } from "@/lib/utils";
import { getPreferenceColor, getPreferenceIcon, getActivePreferenceType } from "@/util/calendar";

interface ScheduleCalendarRowProps {
  period: any;
  days: number[];
  schedulePreferences: SchedulePreference[];
  onCellClick: (cellInfo: any) => void;
  updatingCells: string[];
  selectedScheduleIds: string[];
}

const ScheduleCalendarRow: React.FC<ScheduleCalendarRowProps> = ({
  period,
  days,
  schedulePreferences,
  onCellClick,
  updatingCells,
  selectedScheduleIds,
}) => {
  // Debug logging for troubleshooting
  useEffect(() => {
    if (!period.schedules || !Array.isArray(period.schedules)) {
      console.warn(`Period ${period.uuid} has invalid or missing schedules:`, period);
    }
  }, [period]);

  const { pendingChanges } = useAppSelector((state) => state.calendar);

  const getPreferenceForCell = (periodId: string, dayNumber: number) => {
    // First try to find preferences based on periodId and dayOfWeek (new format)
    const periodDayPreference = schedulePreferences.find(
      (pref) => {
        // Handle both string and number types for comparison
        const prefPeriodId = typeof pref.periodId === 'string' ? pref.periodId : pref.periodId?.toString();
        const comparePeriodId = typeof periodId === 'string' ? periodId : periodId?.toString();
        
        const prefDayOfWeek = typeof pref.dayOfWeek === 'string' ? parseInt(pref.dayOfWeek) : pref.dayOfWeek;
        
        return prefPeriodId === comparePeriodId && prefDayOfWeek === dayNumber;
      }
    );
    
    if (periodDayPreference) return periodDayPreference;
    
    // Fallback to finding preference by schedule (old format)
    const schedule = (period.schedules || []).find((s) => s.day === dayNumber);
    if (!schedule) return null;

    // Find a preference for this schedule uuid
    return schedulePreferences.find((pref) => pref.scheduleUuid === schedule.uuid);
  };

  const getPendingChangeForCell = (periodId: string, dayNumber: number) => {
    const cellIndex = `${periodId}-${dayNumber}`;
    return pendingChanges.find((change) => change.cellIndex === cellIndex);
  };

  const renderPreferenceIcon = (preference: SchedulePreference | null) => {
    if (!preference) return null;
    
    // Use the utility function to get the active preference type
    const preferenceType = getActivePreferenceType(preference);
    
    // Return the appropriate icon using the utility function
    return getPreferenceIcon(preferenceType);
  };

  return (
    <div className="flex">
      <div className="w-32 p-1 flex items-center bg-secondary-foreground/5 text-xs font-medium border-b border-r">
        <span className="truncate">{period.name || "Unknown Period"}</span>
        {period.startTime && period.endTime && (
          <span className="ml-1 text-muted-foreground whitespace-nowrap">
            {period.startTime} - {period.endTime}
          </span>
        )}
      </div>
      <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
        {days.map((dayNumber) => {
          // Find the schedule for this day
          const schedule = (period.schedules || []).find((s) => s.day === dayNumber);

          if(!schedule) {
            return (
              <div
                key={`${period.uuid}-${dayNumber}`}
                className="border border-gray-200 h-12 group bg-gray-50"
              />
            );
          }

          const preference = getPreferenceForCell(period.uuid, dayNumber);
          const pendingChange = getPendingChangeForCell(period.uuid, dayNumber);
          const isUpdating = updatingCells.includes(`${period.uuid}-${dayNumber}`);
          const isSelected = selectedScheduleIds.includes(schedule.uuid);
          
          // Get the active preference type
          const preferenceType = preference ? getActivePreferenceType(preference) : null;
          const pendingPreferenceType = pendingChange?.newPreferenceType || null;
          
          // Get the preference color
          const bgColor = getPreferenceColor(preferenceType);
          const pendingBgColor = getPreferenceColor(pendingPreferenceType);

          let cellContent = null;
          let cellClassName = cn(
            "border border-gray-200 h-12 flex items-center justify-center group transition-colors",
            {
              "bg-gray-50 hover:bg-gray-100": !preference && !pendingChange && !isSelected,
              [`${bgColor} hover:${bgColor}`]: preferenceType && !pendingChange && !isSelected,
              [`${pendingBgColor} hover:${pendingBgColor}`]: pendingPreferenceType && !isSelected, 
              "opacity-50": isUpdating,
              "ring-2 ring-primary bg-primary/5": isSelected,
            }
          );

          if (pendingChange) {
            if (pendingChange.operationType === "DELETE") {
              cellContent = (
                <div className="line-through opacity-50">
                  {renderPreferenceIcon(preference)}
                </div>
              );
            } else {
              cellContent = (
                <div className="font-bold">
                  {getPreferenceIcon(pendingChange.newPreferenceType)}
                </div>
              );
            }
          } else if (preference) {
            cellContent = renderPreferenceIcon(preference);
          }

          return (
            <TooltipProvider key={`${period.uuid}-${dayNumber}`}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={cellClassName}
                    onClick={() => {
                      if (!isUpdating) {
                        onCellClick({
                          periodId: period.uuid,
                          day: dayNumber,
                          dayOfWeek: dayNumber,
                          scheduleId: schedule.uuid,
                          currentPreference: preference,
                        });
                      }
                    }}
                    disabled={isUpdating}
                  >
                    {cellContent}
                    {isUpdating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <div className="text-xs">
                    <div className="font-semibold">{period.name}</div>
                    {period.startTime && period.endTime && (
                      <div className="text-muted-foreground">
                        {period.startTime} - {period.endTime}
                      </div>
                    )}
                    <div>Day: {dayNumber}</div>
                    <div>Period ID: {period.uuid}</div>
                    {schedule && <div>Schedule: {schedule.uuid.substring(0, 8)}...</div>}
                    {preference && (
                      <div className="mt-1">
                        <div className="font-semibold">Current Preference:</div>
                        <div>{getActivePreferenceType(preference)}</div>
                      </div>
                    )}
                    {pendingChange && (
                      <div className="mt-1 text-primary">
                        <div className="font-semibold">Pending Change:</div>
                        <div>{pendingChange.operationType}</div>
                        {pendingChange.newPreferenceType && (
                          <div>New: {pendingChange.newPreferenceType}</div>
                        )}
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleCalendarRow;
