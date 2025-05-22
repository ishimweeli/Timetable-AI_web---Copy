import { format, addWeeks, isAfter, differenceInWeeks, addDays, isSameDay, isBefore, isEqual } from 'date-fns';

interface CalendarEvent {
  uuid: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  description?: string;
  location?: string;
  teacherName?: string;
  className?: string;
  subjectName?: string;
  dayOfWeek?: number;
  planStartDate?: string;
  planEndDate?: string;
  isRecurring?: boolean;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month - 1, day);
}

function formatDateTimeForICS(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function createEventTitle(event: CalendarEvent): string {
  const parts = [];
  
  parts.push(event.title || event.subjectName || "Class");
  
  if (event.teacherName) {
    parts.push(`- ${event.teacherName}`);
  }
  
  if (event.className) {
    parts.push(`(${event.className})`);
  }
  
  return parts.join(' ');
}

function generateOccurrences(event: CalendarEvent, planStart: Date, planEnd: Date): Date[] {
  const occurrences: Date[] = [];
  
  if (!event.dayOfWeek) return occurrences;
  
  const targetDayOfWeek = event.dayOfWeek === 7 ? 0 : event.dayOfWeek;
  
  let currentDate = new Date(planStart);
  
  while (currentDate.getDay() !== targetDayOfWeek) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  while (currentDate <= planEnd) {
    occurrences.push(new Date(currentDate));
    
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return occurrences;
}

function adjustStartDateToMatchDayOfWeek(startDate: Date, dayOfWeek: number): Date {
  const date = new Date(startDate);
  const targetDayOfWeek = dayOfWeek === 7 ? 0 : dayOfWeek;
  
  while (date.getDay() !== targetDayOfWeek) {
    date.setDate(date.getDate() + 1);
  }
  
  return date;
}

export function generateICS(events: CalendarEvent[], calendarName: string = 'School Timetable'): string {
  
  const icsEvents = events.map(event => {
    try {
      const originalStart = new Date(event.startDateTime);
      const originalEnd = new Date(event.endDateTime);
      let start = new Date(originalStart);
      let end = new Date(originalEnd);
      
      if (event.isRecurring && event.dayOfWeek) {
        const planStart = event.planStartDate ? parseDate(event.planStartDate) : null;
        if (planStart) {
          const adjustedDate = adjustStartDateToMatchDayOfWeek(planStart, event.dayOfWeek);
          
          const hours = start.getHours();
          const minutes = start.getMinutes();
          
          start = new Date(adjustedDate);
          start.setHours(hours, minutes, 0, 0);
          
          const duration = originalEnd.getTime() - originalStart.getTime();
          end = new Date(start.getTime() + duration);
        }
      }
      
      const startStr = formatDateTimeForICS(start);
      const endStr = formatDateTimeForICS(end);
      
      const enhancedTitle = createEventTitle(event);
      
      const description = [
        event.description || "",
        `Teacher: ${event.teacherName || 'N/A'}`,
        `Class: ${event.className || 'N/A'}`,
        `Subject: ${event.subjectName || 'N/A'}`
      ].join('\\n').replace(/[\\;,]/g, '\\$&'); 
      
      const eventData = [
        'BEGIN:VEVENT',
        `UID:${event.uuid}@timetable.ist-legal.rw`,
        `DTSTAMP:${formatDateTimeForICS(new Date())}`,
        `CREATED:${formatDateTimeForICS(new Date())}`,
        `LAST-MODIFIED:${formatDateTimeForICS(new Date())}`,
        `DTSTART:${startStr}`,
        `DTEND:${endStr}`,
        `SUMMARY:${enhancedTitle.replace(/[\\;,]/g, '\\$&')}`, 
        `DESCRIPTION:${description}`,
        'TRANSP:OPAQUE',
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
      ];
      
      if (event.location) {
        eventData.push(`LOCATION:${event.location.replace(/[\\;,]/g, '\\$&')}`);
      }
      
      if (event.isRecurring && event.dayOfWeek) {
        const icsDayOfWeek = event.dayOfWeek === 7 ? 'SU' : 
                          event.dayOfWeek === 1 ? 'MO' :
                          event.dayOfWeek === 2 ? 'TU' :
                          event.dayOfWeek === 3 ? 'WE' :
                          event.dayOfWeek === 4 ? 'TH' :
                          event.dayOfWeek === 5 ? 'FR' :
                          'SA';
        
        if (event.planEndDate) {
          const planEnd = parseDate(event.planEndDate);
          if (planEnd) {
            planEnd.setHours(23, 59, 59, 999);
            const untilStr = formatDateTimeForICS(planEnd);
            
            eventData.push(`RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${icsDayOfWeek};UNTIL=${untilStr}`);
          } else {
            eventData.push(`RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${icsDayOfWeek}`);
          }
        } else {
          eventData.push(`RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${icsDayOfWeek}`);
        }
      }
      
      eventData.push('END:VEVENT');
      
      return eventData.join('\r\n');
    } catch (error) {
      console.error("Error generating ICS event:", error);
      return ''; 
    }
  }).filter(Boolean).join('\r\n');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IST-LEGAL//Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:UTC',
    'BEGIN:VTIMEZONE',
    'TZID:UTC',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000Z',
    'TZOFFSETFROM:+0000',
    'TZOFFSETTO:+0000',
    'END:STANDARD',
    'END:VTIMEZONE',
    icsEvents,
    'END:VCALENDAR'
  ].join('\r\n');


  return icsContent;
}

export function downloadICS(events: CalendarEvent[], filename: string = 'timetable.ics'): void {
  const icsContent = generateICS(events, filename);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
} 