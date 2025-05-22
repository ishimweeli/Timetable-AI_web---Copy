/**
 * Utility functions for the Timetable components
 */

// Generate a unique ID for entries
export const generateEntryId = (): string => {
  return `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Convert string to deterministic color
export const stringToColor = (str: string): string => {
  if (!str) return 'hsl(0, 0%, 85%)';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Generate pastel color
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 85%)`;
};

// Map of day numbers to day names
export const DAY_NAME_MAP = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday'
};

// Format time string
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // If the timeString is already in HH:MM format, return it
  if (/^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Try to parse and format
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      return timeString; // Return original if parsing fails
    }
    
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch (error) {
    return timeString; // Return original on error
  }
};

// Filter periods by availability
export const filterPeriods = (periods: any[], includeBreaks = false): any[] => {
  if (!Array.isArray(periods)) return [];
  
  return periods.filter(period => 
    period && 
    (period.allowScheduling !== false) && 
    (period.showInTimetable !== false) && 
    (includeBreaks || (period.periodType !== 'BREAK' && period.periodType !== 'LUNCH'))
  );
};

// Get unique days from periods
export const getUniqueDays = (periods: any[]): number[] => {
  if (!Array.isArray(periods) || periods.length === 0) return [];
  
  return Array.from(
    new Set(
      periods.flatMap(period => 
        Array.isArray(period.days) ? period.days : []
      )
    )
  ).sort((a, b) => a - b);
};

// Format periods for the timetable grid
export const formatPeriods = (periodsData: any[]): any[] => {
  if (!Array.isArray(periodsData)) return [];
  
  return periodsData.map(period => ({
    id: period.periodNumber || period.id,
    name: period.name,
    startTime: period.startTime ? period.startTime.slice(0, 5) : '',
    endTime: period.endTime ? period.endTime.slice(0, 5) : '',
    days: period.days || [],
    planSettingsId: period.planSettingsId
  }));
};