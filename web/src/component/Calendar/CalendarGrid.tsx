import React, { useState, useEffect } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  addHours,
  startOfDay,
  areIntervalsOverlapping,
  eachDayOfInterval,
  differenceInMinutes,
  getHours,
  getMinutes,
} from "date-fns";
import { useTheme } from "@/hook/useTheme";
import { cn } from "@/util/util";
import { useI18n } from "@/hook/useI18n";
import { formatTimeSimple } from "@/util/dateUtils";
import { PlusCircle, BookOpen, School, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/component/Ui/dialog";

const SUBJECT_COLORS = {
  "PHYS": "#7E22CE",
  "ENG": "#16A34A",
  "MATH": "#0369A1",
  "HIST": "#EA580C",
  "CS": "#0891B2",
  "BIO": "#65A30D",
  "CHEM": "#DC2626",
  "default": "#2563EB"
};

const LUNCH_PERIODS = [12, 13];
interface CalendarEvent {
  uuid: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  classUuid?: string;
  className?: string;
  teacherUuid?: string;
  teacherName?: string;
  roomUuid?: string;
  roomName?: string;
  subjectUuid?: string;
  subjectName?: string;
  subjectColor?: string;
  description?: string;
  status?: string;
  hasConflict?: boolean;
  periodType?: string;
  dayOfWeek?: number;
  _timetableSource?: string;
}

interface CalendarGridProps {
  view: "day" | "week" | "month";
  currentDate: Date;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
  onAddEvent?: (startDateTime: Date) => void;
  roomFilter?: string;
  planStartDate?: string | null;
  planEndDate?: string | null;
  eventDuration?: number;
}

function expandRecurringEvents(events, planStartDate, planEndDate) {
  if (!planStartDate || !planEndDate) return events;
  const expanded = [];
  const start = new Date(planStartDate);
  const end = new Date(planEndDate);

  events.forEach(event => {
    if (event.isRecurring && event.recurringPattern === "WEEKLY") {
      let eventStart = new Date(event.startDateTime);
      let eventEnd = new Date(event.endDateTime);
      let current = new Date(start);
      current.setDate(current.getDate() + ((eventStart.getDay() - current.getDay() + 7) % 7));
      while (current <= end) {
        const newStart = new Date(current);
        newStart.setHours(eventStart.getHours(), eventStart.getMinutes(), 0, 0);
        const newEnd = new Date(newStart);
        newEnd.setHours(eventEnd.getHours(), eventEnd.getMinutes(), 0, 0);
        expanded.push({
          ...event,
          startDateTime: newStart.toISOString(),
          endDateTime: newEnd.toISOString(),
        });
        current.setDate(current.getDate() + 7);
      }
    } else {
      expanded.push(event);
    }
  });
  return expanded;
}

export function CalendarGrid({
  view,
  currentDate,
  events,
  onEventSelect,
  onAddEvent,
  roomFilter,
  planStartDate,
  planEndDate,
  eventDuration = 30,
}: CalendarGridProps) {
  const { colorScheme } = useTheme();
  const { t } = useI18n();
  const isDarkMode = colorScheme === "dark";
  const [now, setNow] = useState(new Date());
  const [expandedDate, setExpandedDate] = useState<string | null>(null);
  const [agendaDay, setAgendaDay] = useState<{date: Date, events: CalendarEvent[]} | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const expandedEvents = expandRecurringEvents(events, planStartDate, planEndDate);

  const isOutOfPlanRange = (() => {
    if (!planStartDate || !planEndDate) return false;
    const planStart = new Date(planStartDate);
    const planEnd = new Date(planEndDate);
    if (view === 'day') {
      return currentDate < planStart || currentDate > planEnd;
    }
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return weekEnd < planStart || weekStart > planEnd;
    }
    if (view === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return monthEnd < planStart || monthStart > planEnd;
    }
    return false;
  })();

  const filteredEvents = isOutOfPlanRange ? [] : expandedEvents;

 

  const isCurrentHour = (date: Date) => {
    const now = new Date();
    return isToday(date) && getHours(date) === getHours(now);
  };

  const sortEventsByDateTime = (events: CalendarEvent[]): CalendarEvent[] => {
    return [...events].sort((a, b) => {
      const startTimeA = new Date(a.startDateTime).getTime();
      const startTimeB = new Date(b.startDateTime).getTime();
      
      if (startTimeA === startTimeB) {
        if (a.periodType === "Break" || a.title?.toLowerCase().includes('break')) return -1;
        if (b.periodType === "Break" || b.title?.toLowerCase().includes('break')) return 1;
        if (a.periodType === "Lunch" || a.title?.toLowerCase().includes('lunch')) return -1;
        if (b.periodType === "Lunch" || b.title?.toLowerCase().includes('lunch')) return 1;
        
        if (a.roomName && b.roomName) return a.roomName.localeCompare(b.roomName);
      }
      
      return startTimeA - startTimeB;
    });
  };

  const sortEventsChronologically = (events: CalendarEvent[]): CalendarEvent[] => {
    return [...events].sort((a, b) => {
      const startA = new Date(a.startDateTime).getTime();
      const startB = new Date(b.startDateTime).getTime();
      if (startA !== startB) return startA - startB;
      const endA = new Date(a.endDateTime).getTime();
      const endB = new Date(b.endDateTime).getTime();
      return endA - endB;
    });
  };

  const deduplicateEvents = sortEventsByDateTime;

  const DAY_START_HOUR = 0;
  const DAY_END_HOUR = 23;
  const MINUTES_IN_DAY = (DAY_END_HOUR - DAY_START_HOUR + 1) * 60;
  const HOUR_HEIGHT = 80; 
  const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
  const GRID_HEIGHT = HOUR_HEIGHT * (DAY_END_HOUR - DAY_START_HOUR + 1);
  const HOUR_LABEL_WIDTH = 63;
  const EVENT_RIGHT_MARGIN = 2;
  const EVENT_MIN_WIDTH = 80;

  function assignStickyColumns(events) {
    type EventWithColumns = CalendarEvent & { _column?: number; _totalColumns?: number; _slotGroup?: string };
    const sorted = [...events].sort((a, b) => +new Date(a.startDateTime) - +new Date(b.startDateTime));

    const slotGroups: Record<string, EventWithColumns[]> = {};
    let currentSlotGroupId = 0;

    for (let i = 0; i < sorted.length; i++) {
      const event = sorted[i] as EventWithColumns;
      const eventStart = new Date(event.startDateTime).getTime();
      const eventEnd = new Date(event.endDateTime).getTime();
      let foundGroup = false;
      Object.keys(slotGroups).forEach(groupId => {
        if (foundGroup) return;
        const groupHasOverlap = slotGroups[groupId].some(groupEvent => {
          const groupEventStart = new Date(groupEvent.startDateTime).getTime();
          const groupEventEnd = new Date(groupEvent.endDateTime).getTime();
          return (
            (eventStart < groupEventEnd && eventEnd > groupEventStart)
          );
        });
        if (groupHasOverlap) {
          slotGroups[groupId].push(event);
          event._slotGroup = groupId;
          foundGroup = true;
        }
      });
      if (!foundGroup) {
        const groupId = `group_${currentSlotGroupId++}`;
        slotGroups[groupId] = [event];
        event._slotGroup = groupId;
      }
    }

    let mergeOccurred = true;
    while (mergeOccurred) {
      mergeOccurred = false;
      const groupIds = Object.keys(slotGroups);
      for (let i = 0; i < groupIds.length; i++) {
        if (mergeOccurred) break;
        for (let j = i + 1; j < groupIds.length; j++) {
          const group1 = slotGroups[groupIds[i]];
          const group2 = slotGroups[groupIds[j]];
          const hasOverlap = group1.some(event1 => {
            const event1Start = new Date(event1.startDateTime).getTime();
            const event1End = new Date(event1.endDateTime).getTime();
            return group2.some(event2 => {
              const event2Start = new Date(event2.startDateTime).getTime();
              const event2End = new Date(event2.endDateTime).getTime();
              return (
                event1Start < event2End && event1End > event2Start
              );
            });
          });
          if (hasOverlap) {
            group2.forEach(event => {
              if (!group1.includes(event)) {
                group1.push(event);
                event._slotGroup = groupIds[i];
              }
            });
            delete slotGroups[groupIds[j]];
            mergeOccurred = true;
            break;
          }
        }
      }
    }

    Object.keys(slotGroups).forEach(groupId => {
      const group = slotGroups[groupId];
      group.sort((a, b) => +new Date(a.startDateTime) - +new Date(b.startDateTime));
      const columnEndTimes: number[] = [];
      group.forEach(ev => {
        const evStart = new Date(ev.startDateTime).getTime();
        const evEnd = new Date(ev.endDateTime).getTime();
        if (
          ev.periodType === 'Lunch' ||
          ev.periodType === 'Break' ||
          (ev.title && (ev.title.toLowerCase().includes('lunch') || ev.title.toLowerCase().includes('break')))
        ) {
          ev._column = columnEndTimes.length;
          columnEndTimes.push(evEnd);
        } else {
          let assignedCol = 0;
          for (; assignedCol < columnEndTimes.length; assignedCol++) {
            if (evStart >= columnEndTimes[assignedCol]) {
              break;
            }
          }
          ev._column = assignedCol;
          columnEndTimes[assignedCol] = evEnd;
        }
      });
      const totalColumns = columnEndTimes.length;
      group.forEach(ev => { ev._totalColumns = totalColumns; });
    });
    return sorted;
  }

  const renderDayView = () => {
    const dayStart = new Date(currentDate);
    dayStart.setHours(DAY_START_HOUR, 0, 0, 0);
    const hoursOfDay = Array.from({ length: (DAY_END_HOUR - DAY_START_HOUR + 1) }, (_, i) => i + DAY_START_HOUR);
    
    const quarterHours = [];
    for (let hour = DAY_START_HOUR; hour <= DAY_END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        quarterHours.push({ hour, minute });
      }
    }
    let dayEvents = filteredEvents.filter(event => {
      if (!event.startDateTime || !event.endDateTime) {
        return false;
      }
      
      const eventDate = new Date(event.startDateTime);
      const eventDayOfWeek = eventDate.getDay(); // 0-6, Sunday-Saturday
      const currentDayOfWeek = currentDate.getDay(); // 0-6, Sunday-Saturday
      
      const isSameDayOfWeek = eventDayOfWeek === currentDayOfWeek;
      return isSameDayOfWeek;
    });
    
    dayEvents = sortEventsChronologically(dayEvents);
    
    const groupOverlappingEvents = (events: CalendarEvent[]) => {
      if (events.length <= 1) return [events];
      
      events = sortEventsChronologically(events);
      
      const allFromSingleTimetable = events.every(event => (event as any)._timetableSource === "single");
      
      
      if (allFromSingleTimetable) {
        const groups: CalendarEvent[][] = [];
        let currentGroup: CalendarEvent[] = [events[0]];
        
        for (let i = 1; i < events.length; i++) {
          const event = events[i];
          const eventStart = new Date(event.startDateTime).getTime();
          const eventEnd = new Date(event.endDateTime).getTime();
          
          
          const hasOverlap = currentGroup.some(groupEvent => {
            const groupEventStart = new Date(groupEvent.startDateTime).getTime();
            const groupEventEnd = new Date(groupEvent.endDateTime).getTime();
            
            return (
              (eventStart < groupEventEnd && eventEnd > groupEventStart)
            );
          });
          
          if (hasOverlap) {
            currentGroup.push(event);
          } else {
            groups.push(currentGroup);
            currentGroup = [event];
          }
        }
        
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        
        return groups;
      }
      
      const groups: CalendarEvent[][] = [];
      let currentGroup: CalendarEvent[] = [events[0]];
      
      for (let i = 1; i < events.length; i++) {
        const event = events[i];
        const eventStart = new Date(event.startDateTime).getTime();
        const eventEnd = new Date(event.endDateTime).getTime();
        
        const hasOverlap = currentGroup.some(groupEvent => {
          const groupEventStart = new Date(groupEvent.startDateTime).getTime();
          const groupEventEnd = new Date(groupEvent.endDateTime).getTime();
          
          return (
            (eventStart >= groupEventStart && eventStart < groupEventEnd) || // Event starts during group event
            (eventEnd > groupEventStart && eventEnd <= groupEventEnd) || // Event ends during group event
            (eventStart <= groupEventStart && eventEnd >= groupEventEnd) // Event contains group event
          );
        });
        
        if (hasOverlap) {
          currentGroup.push(event);
        } else {
          groups.push(currentGroup);
          currentGroup = [event];
        }
      }
      
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      
      return groups;
    };
    
    const regularEventGroups = groupOverlappingEvents(dayEvents);
    
    dayEvents = assignStickyColumns(dayEvents);

    const MAX_VISIBLE_COLUMNS = 6;

    return (
      <div className="h-full overflow-y-auto">
        <div className="relative border-t border-border" style={{ height: `${GRID_HEIGHT}px` }}>
          {/* Render quarter-hour grid lines */}
          {quarterHours.map(({ hour, minute }, idx) => {
            const minutesSinceMidnight = hour * 60 + minute;
            const top = minutesSinceMidnight * MINUTE_HEIGHT;
            const isHourStart = minute === 0;
            
            return (
              <div
                key={`${hour}-${minute}`}
                className={`absolute left-0 right-0 border-b ${isHourStart ? 'border-solid' : 'border-dashed'} ${isHourStart ? 'border-gray-300/60' : 'border-gray-300/30'}`}
                style={{ 
                  top: `${top}px`, 
                  height: 0, 
                  zIndex: 0
                }}
              />
            );
          })}
          
          {/* Render hour labels positioned at the TOP of each hour block */}
          {hoursOfDay.map(hour => {
            const top = hour * HOUR_HEIGHT;
            return (
              <div
                key={hour}
                className="absolute left-0 w-16 text-xs text-muted-foreground font-medium"
                style={{ 
                  top: `${top}px`, 
                  height: `${HOUR_HEIGHT}px`, 
                  zIndex: 1,
                  borderRight: '1px solid rgba(128,128,128,0.15)'
                }}
              >
                <div className="absolute top-0 -translate-y-1/2 w-full text-center">
                  <span className="font-bold text-foreground bg-background px-1">
                    {format(new Date(0, 0, 0, hour), 'HH:mm')}
                  </span>
                </div>
              </div>
            );
          })}
          
          {/* Render regular events squeezed into columns */}
          {(() => {
            const slotGroups: Record<string, CalendarEvent[]> = {};
            dayEvents.forEach(ev => {
              const groupId = (ev as any)._slotGroup || 'default';
              if (!slotGroups[groupId]) slotGroups[groupId] = [];
              slotGroups[groupId].push(ev);
            });
            const rendered: any[] = [];
            Object.entries(slotGroups).forEach(([groupId, groupEvents]) => {
              const visibleColumns = Math.min(MAX_VISIBLE_COLUMNS, groupEvents.length);
              groupEvents.sort((a, b) => ((a as any)._column ?? 0) - ((b as any)._column ?? 0));
              groupEvents.forEach((event, idx) => {
                if (((event as any)._column ?? 0) < visibleColumns) {
                  const eventStart = new Date(event.startDateTime);
                  const eventEnd = new Date(event.endDateTime);
                  const startHour = eventStart.getHours();
                  const startMinute = eventStart.getMinutes();
                  const endHour = eventEnd.getHours();
                  const endMinute = eventEnd.getMinutes();
                  const startMinutesSinceMidnight = (startHour * 60) + startMinute;
                  const endMinutesSinceMidnight = (endHour * 60) + endMinute;
                  const top = startMinutesSinceMidnight * MINUTE_HEIGHT;
                  const height = Math.max((endMinutesSinceMidnight - startMinutesSinceMidnight) * MINUTE_HEIGHT, 36);
                  const totalColumns = visibleColumns; 
                  const column = (event as any)._column ?? 0;
                  const columnWidth = 100 / totalColumns;
                  const eventKey = event.subjectName || event.title?.split(' ')[0] || 'default';
                  const color = event.subjectColor || SUBJECT_COLORS[eventKey as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.default;
                  const isActive = activeEventId === event.uuid;
                  rendered.push(
                    <div
                      key={`regular-${event.uuid}-${groupId}`}
                      style={{
                        position: 'absolute',
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `calc(${HOUR_LABEL_WIDTH}px + ${column * columnWidth}% - ${column === 0 ? 0 : 8}px)`,
                        width: `calc(${columnWidth}% + ${column === 0 ? 0 : 8}px)`,
                        minWidth: `${EVENT_MIN_WIDTH}px`,
                        zIndex: isActive ? 100 : 2,
                        overflow: 'hidden',
                        margin: '1px',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        setActiveEventId(event.uuid);
                        onEventSelect(event);
                      }}
                    >
                      <div
                        className="h-full w-full rounded-sm overflow-hidden flex flex-col relative"
                        style={{
                          borderLeft: `2px solid ${color}`,
                          background: `${color}22`,
                          backgroundClip: 'padding-box',
                          boxShadow: column !== (totalColumns - 1) ? '2px 0 2px -2px rgba(0,0,0,0.08)' : undefined,
                          borderRight: column !== (totalColumns - 1) ? '1px solid #e5e7eb' : undefined,
                        }}
                      >
                        <div
                          className="flex flex-col justify-center h-full w-full px-1"
                          style={{overflow: 'hidden'}}
                          title={`Subject: ${event.title}\nTeacher: ${event.teacherName || ''}\nRoom: ${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}-${eventEnd.getHours().toString().padStart(2, '0')}:${eventEnd.getMinutes().toString().padStart(2, '0')}`}
                        >
                          {differenceInMinutes(eventEnd, eventStart) <= 15 ? (
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <span style={{fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                {event.title}
                              </span>
                              <span style={{fontSize: 11, color: '#555', marginLeft: 4, whiteSpace: 'nowrap'}}>
                                {`${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`}
                              </span>
                            </div>
                          ) : (
                            <>
                              <span style={{fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '2px 0'}}>
                                {event.title}
                              </span>
                              <span style={{fontSize: 11, color: '#555', marginTop: '2px'}}>
                                {`${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`}
                                -
                                {`${eventEnd.getHours().toString().padStart(2, '0')}:${eventEnd.getMinutes().toString().padStart(2, '0')}`}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                } else if (((event as any)._column ?? 0) === visibleColumns) {
                  const additionalEvents = groupEvents.length - visibleColumns;
                  
                  if (additionalEvents > 0) {
                    const eventStart = new Date(event.startDateTime);
                    const eventEnd = new Date(event.endDateTime);
                    const startHour = eventStart.getHours();
                    const startMinute = eventStart.getMinutes();
                    const endHour = eventEnd.getHours();
                    const endMinute = eventEnd.getMinutes();
                    const startMinutesSinceMidnight = (startHour * 60) + startMinute;
                    const endMinutesSinceMidnight = (endHour * 60) + endMinute;
                    const top = startMinutesSinceMidnight * MINUTE_HEIGHT;
                    
                    rendered.push(
                      <div
                        key={`more-${groupId}`}
                        style={{
                          position: 'absolute',
                          top: `${top}px`,
                          height: '22px',
                          left: `calc(${HOUR_LABEL_WIDTH}px + ${(visibleColumns * (100 / (visibleColumns + 1)))}%)`,
                          width: 'auto',
                          zIndex: 3,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f3f4f6',
                          borderRadius: 4,
                          border: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          fontSize: 11,
                          padding: '0 6px',
                          minWidth: 0,
                        }}
                        onClick={() => setAgendaDay({ date: eventStart, events: groupEvents })}
                      >
                        +{additionalEvents} {t("calendar.moreEvents")}
                      </div>
                    );
                  }
                }
              });
            });
            return rendered;
          })()}
          
          {/* Current time indicator line with precise positioning */}
          {isToday(currentDate) && (
            <div className="absolute left-0 right-0 flex items-center z-10" 
              style={{ 
                top: `${(now.getHours() * 60 + now.getMinutes()) * MINUTE_HEIGHT}px`,
              }}>
              <div className="w-3 h-3 rounded-full bg-red-500 ml-6 -translate-x-1.5"></div>
              <div className="flex-1 h-0.5 bg-red-500"></div>
            </div>
          )}
        </div>
      </div>
    );
  };

  function renderDayEventView(event: CalendarEvent, index: number, hideTime?: boolean) {
    if (!event || !event.startDateTime || !event.endDateTime) {
      return null;
    }

    const subjectCode = event.title?.split(' ')[0] || 'default';
    const isBreak = event.periodType === "Break" || 
                   (subjectCode === 'default' && event.title?.toLowerCase().includes('break')) ||
                   (event.subjectName?.toLowerCase().includes('break'));
    const isLunch = event.periodType === "Lunch" || 
                   (subjectCode === 'default' && event.title?.toLowerCase().includes('lunch')) ||
                   (event.subjectName?.toLowerCase().includes('lunch'));
    let baseColor = event.subjectColor || SUBJECT_COLORS[subjectCode as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.default;
    let bgColor = isDarkMode ? `${baseColor}20` : `${baseColor}15`;
    let borderStyle = `2px solid ${baseColor}`;
    if (isBreak) {
      baseColor = '#3399cc';
      bgColor = isDarkMode ? 'rgba(51, 153, 204, 0.2)' : '#e3f2fd';
      borderStyle = '2px solid #3399cc';
    }
    if (isLunch) {
      baseColor = '#ff9933';
      bgColor = isDarkMode ? 'rgba(255, 153, 51, 0.2)' : '#fff3e0';
      borderStyle = '2px solid #ff9933';
    }
    const hasConflict = event.hasConflict;
    const classTeacherDisplay = event.teacherName ?
      `${event.className || ''} - ${event.teacherName}` :
      event.className || '';
    const eventStart = new Date(event.startDateTime);
    const eventEnd = new Date(event.endDateTime);
    const startTime = format(eventStart, 'HH:mm');
    const endTime = format(eventEnd, 'HH:mm');
    const timeDisplay = `${startTime}-${endTime}`;
    const subjectDisplay = isBreak ? "Break" : 
                         isLunch ? "LUNCH" : 
                         event.subjectName || event.title || '';
    return (
      <div
        className={`h-full w-full rounded-sm overflow-hidden cursor-pointer transition-all
                   hover:ring-1 hover:ring-primary/30
                   ${hasConflict ? 'ring-1 ring-red-500' : ''}`}
        style={{
          backgroundColor: bgColor,
          borderLeft: borderStyle,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
        title={`${event.title || event.subjectName || ''} (${timeDisplay})${hasConflict ? ' (CONFLICT)' : ''}`}
      >
        <div className="flex flex-col h-full p-1">
          <div className="flex justify-between items-center px-1 py-0.5 text-xs font-semibold">
            <span className="truncate flex items-center">
              {subjectDisplay}
              {isBreak && <span className="text-[#3399cc] ml-1">•</span>}
            </span>
            {!hideTime && (
              <span className="text-[10px] bg-black/10 dark:bg-white/10 px-1 rounded ml-2 whitespace-nowrap">{timeDisplay}</span>
            )}
          </div>
          {classTeacherDisplay && (
            <div className="text-xs mt-0.5 text-gray-700 dark:text-gray-300">
              {classTeacherDisplay}
            </div>
          )}
          {event.roomName && !isBreak && !isLunch && (
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
              Room {event.roomName}
            </div>
          )}
          {hasConflict && (
            <div className="absolute top-0 right-0 w-0 h-0 border-t-8 border-t-red-500 border-l-8 border-l-transparent" title="Time conflict with another event"></div>
          )}
        </div>
      </div>
    );
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);
    const rowHeight = 80;

    const eventsByDay: Record<string, CalendarEvent[]> = {};
    daysOfWeek.forEach(day => {
      const jsDay = day.getDay() === 0 ? 7 : day.getDay(); // 1=Monday, 7=Sunday
      eventsByDay[format(day, 'yyyy-MM-dd')] = filteredEvents.filter(ev => ev.dayOfWeek === jsDay);
    });

    const groupOverlappingEvents = (events: CalendarEvent[]) => {
      if (events.length <= 1) return [events];
      
      events = sortEventsByDateTime(events);
      
      const allFromSingleTimetable = events.every(event => (event as any)._timetableSource === "single");
      
      if (allFromSingleTimetable) {
        const groups: CalendarEvent[][] = [];
        let currentGroup: CalendarEvent[] = [events[0]];
        
        for (let i = 1; i < events.length; i++) {
          const event = events[i];
          const eventStart = new Date(event.startDateTime).getTime();
          const eventEnd = new Date(event.endDateTime).getTime();
          
          const hasOverlap = currentGroup.some(groupEvent => {
            const groupEventStart = new Date(groupEvent.startDateTime).getTime();
            const groupEventEnd = new Date(groupEvent.endDateTime).getTime();
            
            return (
              (eventStart < groupEventEnd && eventEnd > groupEventStart) // Real overlap
            );
          });
          
          if (hasOverlap) {
            currentGroup.push(event);
          } else {
            groups.push(currentGroup);
            currentGroup = [event];
          }
        }
        
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        
        return groups;
      }
      
      const groups: CalendarEvent[][] = [];
      let currentGroup: CalendarEvent[] = [events[0]];
      
      for (let i = 1; i < events.length; i++) {
        const event = events[i];
        const eventStart = new Date(event.startDateTime).getTime();
        const eventEnd = new Date(event.endDateTime).getTime();
        
        const hasOverlap = currentGroup.some(groupEvent => {
          const groupEventStart = new Date(groupEvent.startDateTime).getTime();
          const groupEventEnd = new Date(groupEvent.endDateTime).getTime();
          
          return (
            (eventStart >= groupEventStart && eventStart < groupEventEnd) || // Event starts during group event
            (eventEnd > groupEventStart && eventEnd <= groupEventEnd) || // Event ends during group event
            (eventStart <= groupEventStart && eventEnd >= groupEventEnd) // Event contains group event
          );
        });
        
        if (hasOverlap) {
          currentGroup.push(event);
        } else {
          groups.push(currentGroup);
          currentGroup = [event];
        }
      }
      
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      
      return groups;
    };

    return (
      <div
        className="flex overflow-x-auto border-t border-border"
        style={{
          background: '#f5f5f5',
          position: 'relative',
          minHeight: `${hoursOfDay.length * rowHeight}px`,
          overflowY: 'auto',
        }}
      >
        <div className="w-14 sm:w-20 flex-shrink-0" style={{background: 'lightgray'}}>
          {hoursOfDay.map(hour => (
            <div 
              key={hour} 
              className="h-[48px] sm:h-[80px] border-b border-r px-1 sm:px-2 text-xs sm:text-sm text-muted-foreground font-medium" 
              style={{ 
                borderColor: 'rgba(128,128,128,0.1)',
                background: 'white',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                paddingRight: '8px',
                paddingTop: '4px'
              }}
            >
              <span style={{ color: '#666', fontSize: '12px' }}>{hour}:00</span>
            </div>
          ))}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '63px',
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            zIndex: 2,
            height: '100%',
          }}
        >
          {hoursOfDay.map((hour, hIdx) => {
            const hourHeight = 80;
            const baseTop = hIdx * hourHeight;
            return [15, 30, 45].map((min, i) => (
              <div
                key={`dashed-${hour}-${min}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${baseTop + (min / 60) * hourHeight}px`,
                  borderTop: '1px dashed #90a4ae',
                  opacity: 0.3,
                  width: '100%',
                }}
              />
            ));
          })}
        </div>
        {daysOfWeek.map((day, idx) => (
          <div
            key={day.toISOString()}
            className="flex-1 min-w-[180px] sm:min-w-0 relative"
            style={{
              borderColor: '#90a4ae',
              background: 'white',
              borderRight: idx < daysOfWeek.length - 1 ? '1px solid #90a4ae' : 'none',
            }}
          >
            {/* Hour blocks */}
            {hoursOfDay.map(hour => (
              <div key={hour} className="h-[48px] sm:h-[80px] border-b flex items-center justify-center" style={{ borderColor: 'rgba(128,128,128,0.1)', position: 'relative' }}>
              </div>
            ))}
            <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10}}>
              {(() => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const dayEvents = assignStickyColumns(eventsByDay[dayKey] || []);
                const MAX_VISIBLE_COLUMNS = 5;
                const rendered = [];
                const columnHeight = hoursOfDay.length * rowHeight;
                const slotGroups: Record<string, CalendarEvent[]> = {};
                dayEvents.forEach(ev => {
                  const groupId = (ev as any)._slotGroup || 'default';
                  if (!slotGroups[groupId]) slotGroups[groupId] = [];
                  slotGroups[groupId].push(ev);
                });
                Object.entries(slotGroups).forEach(([groupId, groupEvents]) => {
                  const visibleColumns = groupEvents.length > MAX_VISIBLE_COLUMNS ? MAX_VISIBLE_COLUMNS : groupEvents.length;
                  groupEvents.sort((a, b) => ((a as any)._column ?? 0) - ((b as any)._column ?? 0));
                  groupEvents.forEach((event, idx) => {
                    if (((event as any)._column ?? 0) < visibleColumns) {
                      const eventStart = new Date(event.startDateTime);
                      const eventEnd = new Date(event.endDateTime);
                      const startMinutes = eventStart.getHours() * 60 + eventStart.getMinutes();
                      const endMinutes = eventEnd.getHours() * 60 + eventEnd.getMinutes();
                      const top = (startMinutes / (24 * 60)) * columnHeight;
                      const height = Math.max(((endMinutes - startMinutes) / (24 * 60)) * columnHeight, 2);
                      const totalColumns = visibleColumns;
                      const column = (event as any)._column ?? 0;
                      const columnWidth = 100 / totalColumns;
                      const isLastColumn = column === totalColumns - 1;
                      const eventKey = event.subjectName || event.title?.split(' ')[0] || 'default';
                      const color = event.subjectColor || SUBJECT_COLORS[eventKey] || SUBJECT_COLORS.default;
                      const isActive = activeEventId === event.uuid;
                      rendered.push(
                        <div
                          key={`regular-${event.uuid}-${groupId}`}
                          style={{
                            position: 'absolute',
                            top: `${top}px`,
                            height: `${height}px`,
                            left: `${column * columnWidth}%`,
                            width: `calc(${columnWidth}% - 4px)`,
                            minWidth: '80px',
                            zIndex: isActive ? 100 : 2,
                            borderLeft: `3px solid ${color}`,
                            background: `${color}15`,
                            backgroundClip: 'padding-box',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            setActiveEventId(event.uuid);
                            onEventSelect(event);
                          }}
                          title={event.title}
                        >
                          <div className="h-full w-full rounded-sm overflow-hidden flex flex-col relative">
                            <div
                              className="flex flex-col justify-center h-full w-full px-1"
                              style={{overflow: 'hidden'}}
                              title={`Subject: ${event.title}\nTeacher: ${event.teacherName || ''}\nRoom: ${event.roomName || ''}\nTime: ${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}-${eventEnd.getHours().toString().padStart(2, '0')}:${eventEnd.getMinutes().toString().padStart(2, '0')}`}
                            >
                              {differenceInMinutes(eventEnd, eventStart) <= 15 ? (
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                  <span style={{fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                                    {event.title}
                                  </span>
                                  <span style={{fontSize: 11, color: '#555', marginLeft: 4, whiteSpace: 'nowrap'}}>
                                    {`${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`}
                                  </span>
                                </div>
                              ) : (
                                <>
                                  <span style={{fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '2px 0'}}>
                                    {event.title}
                                  </span>
                                  <span style={{fontSize: 11, color: '#555', marginTop: '2px'}}>
                                    {`${eventStart.getHours().toString().padStart(2, '0')}:${eventStart.getMinutes().toString().padStart(2, '0')}`}
                                    -
                                    {`${eventEnd.getHours().toString().padStart(2, '0')}:${eventEnd.getMinutes().toString().padStart(2, '0')}`}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else if (groupEvents.length > MAX_VISIBLE_COLUMNS && ((event as any)._column ?? 0) === visibleColumns) {
                      const additionalEvents = groupEvents.length - visibleColumns;
                      if (additionalEvents > 0) {
                        const eventStart = new Date(event.startDateTime);
                        const top = (eventStart.getHours() * 60 + eventStart.getMinutes()) / (24 * 60) * columnHeight;
                        rendered.push(
                          <div
                            key={`more-${groupId}`}
                            style={{
                              position: 'absolute',
                              top: `${top}px`,
                              height: '22px',
                              left: `calc(${visibleColumns * (100 / (visibleColumns + 1))}%)`,
                              width: 'auto',
                              zIndex: 3,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#e1efff',
                              borderRadius: 4,
                              border: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                              fontSize: 11,
                              padding: '0 6px',
                              minWidth: 0,
                            }}
                            onClick={() => setAgendaDay({ date: eventStart, events: groupEvents })}
                          >
                            +{additionalEvents} {t("calendar.moreEvents")}
                          </div>
                        );
                      }
                    }
                  });
                });
                return rendered;
              })()}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const allDates = [];
    let iterDate = startDate;
    while (iterDate <= endDate) {
      allDates.push(iterDate);
      iterDate = addDays(iterDate, 1);
    }

    const allMonthEvents = filteredEvents.filter(event => {
      if (!event.startDateTime || !event.endDateTime) {
        return false;
      }
      
      return true;
    });

    const sortedMonthEvents = [...allMonthEvents].sort((a, b) => {
      const startTimeA = new Date(a.startDateTime).getTime();
      const startTimeB = new Date(b.startDateTime).getTime();
      
      if (startTimeA === startTimeB) {
        if (a.periodType === "Break" || a.title?.toLowerCase().includes('break')) return -1;
        if (b.periodType === "Break" || b.title?.toLowerCase().includes('break')) return 1;
        if (a.periodType === "Lunch" || a.title?.toLowerCase().includes('lunch')) return -1;
        if (b.periodType === "Lunch" || b.title?.toLowerCase().includes('lunch')) return 1;
        
        if (a.roomName && b.roomName) return a.roomName.localeCompare(b.roomName);
      }
      
      return startTimeA - startTimeB;
    });

    const rows = [];
    let days = [];
    let day = startDate;

    const maxEvents = typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 3;

    const eventsByDayOfWeek = {};
    sortedMonthEvents.forEach(event => {
      const eventDate = new Date(event.startDateTime);
      const dayOfWeek = eventDate.getDay(); // 0-6
      if (!eventsByDayOfWeek[dayOfWeek]) {
        eventsByDayOfWeek[dayOfWeek] = [];
      }
      eventsByDayOfWeek[dayOfWeek].push(event);
    });

    while (day <= endDate) {
      for(let i = 0; i < 7; i++) {
        const dayOfWeek = day.getDay();
        const dayEvents = eventsByDayOfWeek[dayOfWeek] || [];

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "min-h-[56px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-border relative group",
              !isSameMonth(day, currentDate) ? "bg-muted/30" : "",
              isToday(day) ? "bg-primary/10" : ""
            )}
            style={{
              borderBottomColor: 'rgba(128, 128, 128, 0.15)',
              borderRightColor: 'rgba(128, 128, 128, 0.15)'
            }}
          >
            <div className="text-xs sm:text-sm mb-1 flex justify-between items-center">
              <span
                className={cn(
                  "inline-block rounded-full w-5 h-5 sm:w-6 sm:h-6 text-center leading-5 sm:leading-6 text-base sm:text-lg",
                  isToday(day) ? "bg-primary text-primary-foreground" : ""
                )}
              >
                {format(day, "d")}
              </span>

              {onAddEvent && (
                <PlusCircle
                  className="w-4 h-4 text-primary/70 opacity-0 group-hover:opacity-100 cursor-pointer"
                  onClick={() => onAddEvent(day)}
                />
              )}
            </div>
            <div className="space-y-0.5 sm:space-y-1 max-h-16 overflow-y-auto sm:max-h-none sm:overflow-visible">
              {(() => {
                const dayKey = format(day, 'yyyy-MM-dd');
                const isExpanded = expandedDate === dayKey;
                const toShow = isExpanded || dayEvents.length <= maxEvents
                  ? dayEvents
                  : dayEvents.slice(0, maxEvents);
                return (
                  <>
                    {toShow.map((ev, idx) => (
                      <div style={{ fontSize: 13 }} key={ev.uuid || idx}>
                        {renderEventPill(ev, idx, maxEvents, dayEvents.length > maxEvents && !isExpanded)}
                      </div>
                    ))}
                    {dayEvents.length > maxEvents && !isExpanded && (
                      <div
                        className="text-[10px] sm:text-xs text-muted-foreground text-center px-1.5 sm:px-2 py-0.5 bg-muted/20 rounded cursor-pointer"
                        onClick={() => setAgendaDay({ date: day, events: dayEvents })}
                      >
                        {`+${dayEvents.length - maxEvents} ${t("calendar.moreEvents")}`}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day.toString()} className="grid grid-cols-1 sm:grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }

    return (
      <div className="h-full overflow-y-auto border-t border-border">
        {rows}
      </div>
    );
  };

  const handleEventSelect = (event: CalendarEvent) => {
    onEventSelect(event);
  };

  function renderContinuousEvent(hour: number, subjectCode: string, startTime: string, endTime: string) {
    const event = filteredEvents.find(e =>
      e.title?.includes(subjectCode) &&
      format(new Date(e.startDateTime), 'HH:mm') === startTime
    );

    if(!event) return null;

    const isBreak = subjectCode === 'default' && event.title?.toLowerCase().includes('break');
    const isLunch = subjectCode === 'default' && event.title?.toLowerCase().includes('lunch');

    let baseColor = event.subjectColor || SUBJECT_COLORS[subjectCode as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.default;
    let lighterColor = `${baseColor}15`;
    let headerColor = `${baseColor}20`;
    let borderStyle = `2px solid ${baseColor}`;
    let additionalHeaderStyles: React.CSSProperties = {};
    let icon = '';

    if(isBreak) {
      baseColor = '#3399cc';
      lighterColor = '#cceeff';
      headerColor = '#b2e0ff';
      borderStyle = '1px dashed #3399cc';
      additionalHeaderStyles = {
        fontStyle: 'italic',
        fontWeight: 500
      };
      icon = '☕ ';
    }

    if(isLunch) {
      baseColor = '#ff9933';
      lighterColor = '#ffe0b2';
      headerColor = '#ffcc80';
      borderStyle = '2px solid #ff9933';
      additionalHeaderStyles = {
        fontWeight: 'bold',
        textTransform: 'uppercase'
      };
      icon = '🍽️ ';
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    let top = '0%';
    let height = '0%';
    let zIndex = 100;
    const additionalStyles: React.CSSProperties = {};

    if(hour === startHour) {
      const minutesFromHourStart = startMinute;
      const minutesInFirstHour = 60 - startMinute;
      const percentFromTop = (minutesFromHourStart / 60) * 100;

      top = `${percentFromTop}%`;
      const heightPercent = (minutesInFirstHour / 60) * 100;
      height = `calc(${heightPercent}% + 1px)`; 

      zIndex = 110;
    } else if(hour === endHour) {
      const minutesInLastHour = endMinute;
      const percentHeight = (minutesInLastHour / 60) * 100;

      top = '-1px'; 
      height = `calc(${percentHeight}% + 1px)`;
    } else if(hour > startHour && hour < endHour) {
      top = '-1px';
      height = 'calc(100% + 2px)';
    }else {
      return null;
    }

    const classTeacherDisplay = event.teacherName ?
      `${event.className || ''} - ${event.teacherName}` :
      event.className || '';

    return (
      <div
        className={`absolute w-full overflow-visible cursor-pointer rounded-none hover:ring-1 hover:ring-primary/30`}
        style={{
          top,
          height,
          backgroundColor: lighterColor,
          borderLeft: borderStyle,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          zIndex,
          ...additionalStyles
        }}
        onClick={() => handleEventSelect(event)}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex justify-between items-center px-2 py-1 text-xs"
            style={{ backgroundColor: headerColor, ...additionalHeaderStyles }}
          >
            <span className="font-bold flex items-center">
              {icon}{subjectCode === 'default' ? (isBreak ? 'Break' : isLunch ? 'Lunch' : subjectCode) : subjectCode}
              {event.roomName && (
                <span className="ml-1 bg-black/10 dark:bg-white/10 px-1 rounded text-[9px]">
                  {event.roomName}
                </span>
              )}
            </span>
            <span className="text-[9px] bg-black/10 dark:bg-white/10 px-1 rounded">
              {startTime}-{endTime}
            </span>
          </div>

          {hour === startHour && (
            <div className="flex flex-col px-2 mt-auto pb-1">
              <div className="text-[10px] truncate">
                {classTeacherDisplay}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderEvent(
    event: CalendarEvent,
    index: number,
    dayViewIndex?: number,
    hourSlotStart?: Date,
    _allEventsCount?: number
  ) {

    const subjectCode = event.title?.split(' ')[0] || 'default';

    const isBreak = event.periodType === "Break" || 
                   (subjectCode === 'default' && event.title?.toLowerCase().includes('break'));
    const isLunch = event.periodType === "Lunch" || 
                   (subjectCode === 'default' && event.title?.toLowerCase().includes('lunch'));

    let baseColor = event.subjectColor || SUBJECT_COLORS[subjectCode as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.default;
    let lighterColor = `${baseColor}15`;
    let headerColor = `${baseColor}20`;
    let borderStyle = `2px solid ${baseColor}`;
    let additionalHeaderStyles: React.CSSProperties = {};
    let icon = '';

    if(isBreak) {
      baseColor = '#3399cc';
      lighterColor = '#cceeff';
      headerColor = '#b2e0ff';
      borderStyle = '1px dashed #3399cc';
      additionalHeaderStyles = {
        fontStyle: 'italic',
        fontWeight: 500
      };
      icon = '☕ ';
    }

    if(isLunch) {
      baseColor = '#ff9933';
      lighterColor = '#ffe0b2';
      headerColor = '#ffcc80';
      borderStyle = '2px solid #ff9933';
      additionalHeaderStyles = {
        fontWeight: 'bold',
        textTransform: 'uppercase'
      };
      icon = '🍽️ ';
    }

    const hasConflict = event.hasConflict;
    const classTeacherDisplay = event.teacherName ?
      `${event.className || ''} - ${event.teacherName}` :
      event.className || '';

    const eventStart = new Date(event.startDateTime);
    const eventEnd = new Date(event.endDateTime);
    const startTime = format(eventStart, 'HH:mm');
    const endTime = format(eventEnd, 'HH:mm');

    const standardPeriods = [
      { start: '08:00', end: '08:45' },
      { start: '09:00', end: '09:45' },
      { start: '10:00', end: '10:45' },
      { start: '11:00', end: '11:45' },
      { start: '12:30', end: '13:15' },
      { start: '13:30', end: '14:15' },
      { start: '14:15', end: '15:00' },
      { start: '15:00', end: '15:45' },
    ];

    const matchingPeriod = standardPeriods.find(period => period.start === startTime && period.end === endTime);

    const timeDisplay = matchingPeriod ?
      `${matchingPeriod.start}-${matchingPeriod.end}` :
      `${startTime}-${endTime}`;

    const slotStartHour = getHours(hourSlotStart);
    const eventStartHour = getHours(eventStart);
    const eventStartMinute = getMinutes(eventStart);
    const eventEndHour = getHours(eventEnd);
    const eventEndMinute = getMinutes(eventEnd);

    const zIndex = 10;

    let top = '0%';
    let height = '100%';
    let shouldRender = true;

    if(eventStartMinute === 0 && eventEndMinute === 45 && eventStartHour === slotStartHour) {
      top = '0%';
      height = '75%';
    } else if(eventEndHour > eventStartHour) {
      if (!hourSlotStart) {
        shouldRender = true;
        top = '0';
        height = '100%';
      } else {
        shouldRender = false;
      }
    } else {
      if(slotStartHour === eventStartHour) {
        top = `${(eventStartMinute / 60) * 100}%`;

        if(eventEndHour === eventStartHour) {
          height = `${((eventEndMinute - eventStartMinute) / 60) * 100}%`;
        }else {
          height = `${((60 - eventStartMinute) / 60) * 100}%`;
        }
      } else if(slotStartHour === eventEndHour) {
        top = '0%';
        height = `${(eventEndMinute / 60) * 100}%`;
      } else if(slotStartHour > eventStartHour && slotStartHour < eventEndHour) {
        top = '0%';
        height = '100%';
      }else {
        shouldRender = false;
      }
    }

    if(!shouldRender) return null;

    const borderStyles: React.CSSProperties = {};

    return (
      <div
        key={`${event.uuid}-${index}${dayViewIndex !== undefined ? `-${dayViewIndex}` : ''}`}
        onClick={() => handleEventSelect(event)}
        className={`absolute rounded-sm overflow-hidden cursor-pointer
                   hover:ring-1 hover:ring-primary/30
                   ${hasConflict ? 'ring-1 ring-red-500' : ''}`}
        style={{
          top,
          height,
          width: '100%',
          left: 0,
          backgroundColor: lighterColor,
          borderLeft: borderStyle,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          zIndex,
          ...borderStyles
        }}
        title={`${event.title} - ${event.className || ''}: ${timeDisplay}${hasConflict ? ' (CONFLICT)' : ''}`}
      >
        <div className="flex flex-col h-full">
          <div
            className="flex justify-between items-center px-2 py-1 text-xs"
            style={{ backgroundColor: headerColor, ...additionalHeaderStyles }}
          >
            <span className="font-bold flex items-center truncate max-w-[70%]">
              {icon}{subjectCode === 'default' ? (isBreak ? 'Break' : isLunch ? 'Lunch' : subjectCode) : subjectCode}
              {event.roomName && !isBreak && !isLunch && (
                <span className="ml-1 bg-black/10 dark:bg-white/10 px-1 rounded text-[9px]">
                  {event.roomName}
                </span>
              )}
            </span>
            <span className="text-[9px] bg-black/10 dark:bg-white/10 px-1 rounded">{startTime}-{endTime}</span>
          </div>
          <div className="flex flex-col px-2 mt-auto pb-1 flex-1 justify-between">
            <div className="text-xs font-medium truncate mt-1">
              {classTeacherDisplay}
            </div>
          </div>
          {hasConflict && (
            <div className="absolute top-0 right-0 w-0 h-0
                          border-t-8 border-t-red-500
                          border-l-8 border-l-transparent"
              title="Time conflict with another event">
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderEventPill(event: CalendarEvent, index: number, maxEvents: number = 3, isSqueezed: boolean = false) {
    const subjectCode = event.title?.split(' ')[0] || 'default';
    const isBreak = event.periodType === "Break" || 
                  (subjectCode === 'default' && event.title?.toLowerCase().includes('break')) ||
                  (event.subjectName?.toLowerCase().includes('break'));
    const isLunch = event.periodType === "Lunch" || 
                  (subjectCode === 'default' && event.title?.toLowerCase().includes('lunch')) ||
                  (event.subjectName?.toLowerCase().includes('lunch'));
    let baseColor = event.subjectColor || SUBJECT_COLORS[subjectCode as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.default;
    let lighterColor = `${baseColor}15`;
    let headerColor = `${baseColor}20`;
    let borderStyle = `2px solid ${baseColor}`;
    let additionalHeaderStyles: React.CSSProperties = {};
    let icon = '';
    if(isBreak) {
      baseColor = '#3399cc';
      lighterColor = '#cceeff';
      headerColor = '#b2e0ff';
      borderStyle = '1px dashed #3399cc';
      additionalHeaderStyles = {
        fontStyle: 'italic',
        fontWeight: 500
      };
      icon = '☕ ';
    }
    if(isLunch) {
      baseColor = '#ff9933';
      lighterColor = '#ffe0b2';
      headerColor = '#ffcc80';
      borderStyle = '2px solid #ff9933';
      additionalHeaderStyles = {
        fontWeight: 'bold',
        textTransform: 'uppercase'
      };
      icon = '🍽️ ';
    }
    const startTime = format(new Date(event.startDateTime), 'HH:mm');
    const endTime = format(new Date(event.endDateTime), 'HH:mm');
    const standardPeriods = [
      { start: '08:00', end: '08:45' },
      { start: '09:00', end: '09:45' },
      { start: '10:00', end: '10:45' },
      { start: '11:00', end: '11:45' },
      { start: '12:30', end: '13:15' },
      { start: '13:30', end: '14:15' },
      { start: '14:15', end: '15:00' },
      { start: '15:00', end: '15:45' },
    ];
    const matchingPeriod = standardPeriods.find(period => period.start === startTime);
    const timeDisplay = matchingPeriod ?
      `${matchingPeriod.start}-${matchingPeriod.end}` :
      `${startTime}-${endTime}`;
    const hasConflict = event.hasConflict;
    const classTeacherDisplay = event.teacherName ?
      `${event.className || ''} - ${event.teacherName}` :
      event.className || '';
    const isMobileFull = maxEvents === 1;
    const pillStyle: React.CSSProperties = isSqueezed ? {
      minHeight: 18,
      height: 18,
      fontSize: 10,
      padding: '0 2px',
      marginBottom: 1,
      lineHeight: 1.1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    } : {};
    return (
      <div
        key={`pill-${event.uuid}-${index}`}
        onClick={() => handleEventSelect(event)}
        className={`flex flex-col mb-1 rounded-sm cursor-pointer hover:ring-1 hover:ring-primary/30 \
          ${hasConflict ? 'ring-1 ring-red-500' : ''} \
          max-w-full overflow-hidden \
          ${isMobileFull ? 'h-full min-h-[80px] justify-center sm:min-h-0 sm:h-auto sm:justify-start' : ''}`}
        style={{
          backgroundColor: lighterColor,
          borderLeft: borderStyle,
          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
          ...pillStyle,
        }}
      >
        <div
          className="flex justify-between items-center px-2 py-1 text-xs"
          style={{ backgroundColor: headerColor, ...additionalHeaderStyles, ...(isSqueezed ? {padding: '0 2px', fontSize: 10, minHeight: 0, height: 16, lineHeight: 1.1} : {}) }}
        >
          <span className="font-bold flex items-center truncate" style={isSqueezed ? {fontSize: 10, maxWidth: '60%'} : {}}>
            {icon}{subjectCode === 'default' ? (isBreak ? 'Break' : isLunch ? 'Lunch' : subjectCode) : subjectCode}
          </span>
          <span className="text-[9px] bg-black/10 dark:bg-white/10 px-1 rounded" style={isSqueezed ? {fontSize: 9, padding: '0 2px'} : {}}>{timeDisplay}</span>
        </div>
        {!isSqueezed && (
          <div className="flex flex-col px-2 pb-1">
            <div className="text-[10px] truncate">
              {classTeacherDisplay}
            </div>
          </div>
        )}
        {hasConflict && (
          <div className="absolute top-0 right-0 w-0 h-0 border-t-8 border-t-red-500 border-l-8 border-l-transparent" title="Time conflict with another event"></div>
        )}
      </div>
    );
  }

  const renderAgendaModal = () => {
    if (!agendaDay) return null;
    
    const { date, events } = agendaDay;
    const formattedDate = format(date, 'EEEE, MMMM d, yyyy');
    const sortedEvents = sortEventsByDateTime(events);
    
    return (
      <Dialog open={Boolean(agendaDay)} onOpenChange={() => setAgendaDay(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{formattedDate}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              {sortedEvents.map((event, index) => (
                <div 
                  key={`agenda-${event.uuid}-${index}`}
                  onClick={() => {
                    onEventSelect(event);
                    setAgendaDay(null);
                  }}
                  className="cursor-pointer rounded-md border border-border p-2 hover:bg-muted/50"
                >
                  {renderDayEventView(event, index, false)}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div>
      {view === "day" && renderDayView()}
      {view === "week" && renderWeekView()}
      {view === "month" && renderMonthView()}
      {renderAgendaModal()}
    </div>
  );
}

export default CalendarGrid;