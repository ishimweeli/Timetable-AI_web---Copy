import { TypeTimetable, TypeScheduleData, TypeTimeSlot, TypeCell, TimetableEntry } from '@/type/Timetable/TypeTimetable';
import { TimetableData } from '@/type/timetable';

export const getDayName = (dayNumber: number): string => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return days[dayNumber - 1] || `Day ${dayNumber}`;
};

export const addMinutes = (timeString: string, minutes: number): string => {
  const [hours, mins] = timeString.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
};

export const ensureTimetableMetadata = (timetable: TypeTimetable, apiResponse: any): TypeTimetable => {
  if (!timetable) return timetable;
  
  return {
    ...timetable,
    modifiedDate: apiResponse?.modifiedDate || timetable.modifiedDate,
    createdDate: apiResponse?.createdDate || timetable.createdDate,
    generatedDate: apiResponse?.generatedDate || timetable.generatedDate,
    name: apiResponse?.name || timetable.name,
    academicYear: apiResponse?.academicYear || timetable.academicYear,
    semester: apiResponse?.semester || timetable.semester,
    generatedBy: apiResponse?.generatedBy || timetable.generatedBy,
    description: apiResponse?.description || timetable.description,
    isPublished: apiResponse?.isPublished ?? timetable.isPublished
  };
};

export const transformApiTimetableData = (timetableData) => {
  if (!timetableData || !timetableData.entries) {
    return null;
  }

  const days = [];
  const timeSlots = [];
  const dayMap = new Map();
  const timeSlotMap = new Map();

  // Get days per week and periods per day from plan settings or use defaults
  const daysPerWeek = timetableData.planSettings?.daysPerWeek || 
    (timetableData.endDay - timetableData.startDay + 1) || 5;
  
  const periodsPerDay = timetableData.planSettings?.periodsPerDay || 
    (timetableData.entries ? Math.max(...timetableData.entries.map(entry => entry.period)) : 8);
  
  // Create days
  for (let i = 0; i < daysPerWeek; i++) {
    const dayNumber = timetableData.startDay + i;
    const dayName = getDayName(dayNumber);
    const day = {
      id: dayNumber.toString(),
      name: dayName,
      classes: {}
    };
    days.push(day);
    dayMap.set(dayNumber, day);
  }
  
  // Create a map to store time calculations for each day and period
  const timeCalculations = new Map();
  
  // First pass: Group entries by day and period
  const entriesByDayAndPeriod = new Map();
  timetableData.entries.forEach(entry => {
    const key = `${entry.dayOfWeek}-${entry.period}`;
    if (!entriesByDayAndPeriod.has(key)) {
      entriesByDayAndPeriod.set(key, []);
    }
    entriesByDayAndPeriod.get(key).push(entry);
  });
  
  // Second pass: Calculate time slots for each day
  for (let dayNumber = timetableData.startDay; dayNumber <= timetableData.endDay; dayNumber++) {
    let currentTime = timetableData.schoolStartTime || "08:00";
    
    for (let periodNum = 1; periodNum <= periodsPerDay; periodNum++) {
      const key = `${dayNumber}-${periodNum}`;
      const entries = entriesByDayAndPeriod.get(key) || [];
      
      // Get duration for this period (use first entry's duration or default to 45 minutes)
      let periodDuration = 45; // Default
      let periodType = 'Regular'; // Default
      
      if (entries.length > 0) {
        periodDuration = entries[0].durationMinutes || 45;
        periodType = entries[0].periodType || 'Regular';
      }
      
      const startTime = currentTime;
      const endTime = addMinutes(startTime, periodDuration);
      
      // Store time calculation for this day and period
      timeCalculations.set(key, {
        startTime,
        endTime,
        duration: periodDuration,
        periodType
      });
      
      // Update current time for next period
      currentTime = endTime;
      
      // Create time slot if it doesn't exist yet
      if (!timeSlotMap.has(periodNum)) {
        const timeSlot = {
          id: periodNum.toString(),
          period: periodNum,
          startTime: startTime,
          endTime: endTime,
          durationMinutes: periodDuration
        };
        timeSlots.push(timeSlot);
        timeSlotMap.set(periodNum, timeSlot);
      }
    }
  }
  
  // Process all entries
  timetableData.entries.forEach(entry => {
    // Skip entries that are outside our period range
    if (entry.period > periodsPerDay) return;
    
    // Skip entries that are outside our day range
    if (entry.dayOfWeek < timetableData.startDay || 
        entry.dayOfWeek > timetableData.startDay + daysPerWeek - 1) return;
    
    // Get or create the day
    let day = dayMap.get(entry.dayOfWeek);
    if (!day) return;
    
    // Get the time calculation for this specific day and period
    const key = `${entry.dayOfWeek}-${entry.period}`;
    const timeCalc = timeCalculations.get(key);
    
    if (!timeCalc) return;
    
    // Create class info for this entry
    const classInfo = {
      subject: entry.subjectId ? {
        id: entry.subjectId.toString(),
        name: entry.subjectName || '',
        code: entry.subjectInitials || '',
        color: entry.subjectColor || '#3b82f6'
      } : null,
      teacher: entry.teacherId ? {
        id: entry.teacherId.toString(),
        name: entry.teacherName || '',
        initials: entry.teacherInitials || ''
      } : null,
      room: entry.roomId ? {
        id: entry.roomId.toString(),
        name: entry.roomName || '',
        code: entry.roomInitials || ''
      } : null,
      class: entry.classId ? {
        id: entry.classId.toString(),
        name: entry.className || '',
        code: entry.classInitials || ''
      } : null,
      periodType: entry.periodType || 'Regular',
      entryId: entry.id,
      entryUuid: entry.uuid,
      isLocked: entry.isLocked || false,
      isEmpty: false,
      startTime: timeCalc.startTime,
      endTime: timeCalc.endTime,
      color: entry.subjectColor || (
        entry.periodType === 'Break' ? '#f3f4f6' : 
        entry.periodType === 'Lunch' ? '#fef3c7' : '#e5e7eb'
      )
    };
    
    // Add this class info to the day's classes
    day.classes[entry.period] = classInfo;
  });
  
  // Fill in empty slots
  days.forEach(day => {
    const dayNumber = parseInt(day.id);
    
    for (let periodNum = 1; periodNum <= periodsPerDay; periodNum++) {
      if (!day.classes[periodNum]) {
        const key = `${dayNumber}-${periodNum}`;
        const timeCalc = timeCalculations.get(key);
        
        if (!timeCalc) continue; // Skip if no time calculation found
        
        day.classes[periodNum] = {
          subject: null,
          teacher: null,
          room: null,
          class: null,
          periodType: timeCalc.periodType,
          entryId: null,
          entryUuid: `empty-${day.id}-${periodNum}`,
          isLocked: false,
          isEmpty: true,
          startTime: timeCalc.startTime,
          endTime: timeCalc.endTime,
          color: timeCalc.periodType === 'Break' ? '#f3f4f6' : 
                 timeCalc.periodType === 'Lunch' ? '#fef3c7' : null
        };
      }
    }
  });

  // Sort days by their numeric ID
  days.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  
  // Sort time slots by period
  timeSlots.sort((a, b) => a.period - b.period);
  
  return {
    days,
    timeSlots,
    cachedData: {
      subjects: extractSubjects(timetableData.entries),
      teachers: extractTeachers(timetableData.entries),
      rooms: extractRooms(timetableData.entries),
      classes: extractClasses(timetableData.entries)
    },
    modifiedDate: timetableData.modifiedDate,
    createdDate: timetableData.createdDate,
    generatedDate: timetableData.generatedDate
  };
};

// Helper functions to extract unique entities
const extractSubjects = (entries) => {
  const subjectsMap = new Map();
  
  entries.forEach(entry => {
    if (entry.subjectId && !subjectsMap.has(entry.subjectId)) {
      subjectsMap.set(entry.subjectId, {
        id: entry.subjectId.toString(),
        uuid: entry.subjectUuid,
        name: entry.subjectName,
        code: entry.subjectInitials,
        color: entry.subjectColor || '#3b82f6'
      });
    }
  });
  
  return Array.from(subjectsMap.values());
};

const extractTeachers = (entries) => {
  const teachersMap = new Map();
  
  entries.forEach(entry => {
    if (entry.teacherId && !teachersMap.has(entry.teacherId)) {
      teachersMap.set(entry.teacherId, {
        id: entry.teacherId.toString(),
        uuid: entry.teacherUuid,
        name: entry.teacherName,
        initials: entry.teacherInitials
      });
    }
  });
  
  return Array.from(teachersMap.values());
};

const extractRooms = (entries) => {
  const roomsMap = new Map();
  
  entries.forEach(entry => {
    if (entry.roomId && !roomsMap.has(entry.roomId)) {
      roomsMap.set(entry.roomId, {
        id: entry.roomId.toString(),
        uuid: entry.roomUuid,
        name: entry.roomName,
        code: entry.roomInitials
      });
    }
  });
  
  return Array.from(roomsMap.values());
};

const extractClasses = (entries) => {
  const classesMap = new Map();
  
  entries.forEach(entry => {
    if (entry.classId && !classesMap.has(entry.classId)) {
      classesMap.set(entry.classId, {
        id: entry.classId.toString(),
        uuid: entry.classUuid,
        name: entry.className,
        initial: entry.classInitials
      });
    }
  });
  
  return Array.from(classesMap.values());
};

export const processApiTimetableData = (timetable: TypeTimetable): TypeScheduleData => {
  if (!timetable || !timetable.entries || timetable.entries.length === 0) {
    return { days: [], timeSlots: [] };
  }
  
  // Use plan settings values if available, otherwise use defaults or values from timetable
  const periodsPerDay = timetable.planSettings?.periodsPerDay || 
    (timetable.entries ? Math.max(...timetable.entries.map(entry => entry.period)) : 8);
  
  const daysPerWeek = timetable.planSettings?.daysPerWeek || 
    (timetable.endDay - timetable.startDay + 1) || 5;
  
  // Ensure startDay and endDay are set correctly based on daysPerWeek
  const startDay = timetable.startDay || 1;
  const endDay = startDay + daysPerWeek - 1;
  
  const days = [];
  for (let i = startDay; i <= endDay; i++) {
    days.push({
      dayNumber: i,
      name: getDayName(i),
      cells: []
    });
  }
  
  // Create time slots based on school start time and period durations
  const timeSlots = [];
  
  // Group entries by day and period for easier access
  const entriesByDayAndPeriod = new Map();
  timetable.entries.forEach(entry => {
    const key = `${entry.dayOfWeek}-${entry.period}`;
    if (!entriesByDayAndPeriod.has(key)) {
      entriesByDayAndPeriod.set(key, []);
    }
    entriesByDayAndPeriod.get(key).push(entry);
  });
  
  // Calculate time slots for each day separately
  const dayTimeSlots = new Map();
  
  for (let dayNumber = startDay; dayNumber <= endDay; dayNumber++) {
    let currentTime = timetable.schoolStartTime || "08:00";
    const daySlots = [];
    
    for (let period = 1; period <= periodsPerDay; period++) {
      const key = `${dayNumber}-${period}`;
      const entries = entriesByDayAndPeriod.get(key) || [];
      
      // Get duration for this period (use first entry's duration or default to 45 minutes)
      let periodDuration = 45; // Default
      let periodType = 'Regular'; // Default
      
      if (entries.length > 0) {
        periodDuration = entries[0].durationMinutes || 45;
        periodType = entries[0].periodType || 'Regular';
      }
      
      const startTime = currentTime;
      const endTime = addMinutes(startTime, periodDuration);
      
      daySlots.push({
        period,
        startTime,
        endTime,
        duration: periodDuration,
        type: periodType
      });
      
      // Update current time for next period
      currentTime = endTime;
    }
    
    dayTimeSlots.set(dayNumber, daySlots);
  }
  
  // Create common time slots for display
  for (let period = 1; period <= periodsPerDay; period++) {
    // Find all time slots for this period across all days
    const periodSlots = [];
    for (let dayNumber = startDay; dayNumber <= endDay; dayNumber++) {
      const daySlots = dayTimeSlots.get(dayNumber) || [];
      const slot = daySlots.find(s => s.period === period);
      if (slot) {
        periodSlots.push(slot);
      }
    }
    
    // Use the most common start/end time for display
    if (periodSlots.length > 0) {
      timeSlots.push({
        period,
        startTime: periodSlots[0].startTime,
        endTime: periodSlots[0].endTime
      });
    }
  }
  
  // Process cells for each day and period
  days.forEach(day => {
    const daySlots = dayTimeSlots.get(day.dayNumber) || [];
    
    daySlots.forEach(slot => {
      const entries = entriesByDayAndPeriod.get(`${day.dayNumber}-${slot.period}`) || [];
      
      if (entries.length > 0) {
        // Use the actual time slot for this specific day/period
        const entry = entries[0];
        
        day.cells.push({
          ...entry,
          period: slot.period,
          startTime: slot.startTime,
          endTime: slot.endTime,
          subjectColor: entry.subjectColor || (
            entry.periodType === 'Break' ? '#f3f4f6' : 
            entry.periodType === 'Lunch' ? '#fef3c7' : '#e5e7eb'
          )
        });
      } else {
        // Add empty cell
        day.cells.push({
          period: slot.period,
          dayOfWeek: day.dayNumber,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isEmpty: true,
          periodType: slot.type
        });
      }
    });
  });
  
  return { days, timeSlots };
};

export const filterTimetableData = (
  timetableData: TypeScheduleData,
  filters: {
    teacherId?: string | number | null;
    roomId?: string | number | null;
    subjectId?: string | number | null;
    classId?: string | number | null;
  }
): TypeScheduleData => {
  if (!timetableData || !timetableData.days || !timetableData.timeSlots) {
    return timetableData;
  }

  const { teacherId, roomId, subjectId, classId } = filters;
  
  if (!teacherId && !roomId && !subjectId && !classId) {
    return timetableData;
  }

  const filteredData = JSON.parse(JSON.stringify(timetableData));

  for (const timeSlot of filteredData.timeSlots) {
    if (timeSlot.cells) {
      timeSlot.cells = timeSlot.cells.map(cell => {
        // Always keep Break and Lunch cells visible regardless of filters
        if (cell.type === 'Break' || cell.type === 'Lunch') {
          return {
            ...cell,
            visible: true
          };
        }
        
        let visible = true;
        
        if (teacherId && teacherId !== 'all') {
          if (!cell.teacherId || cell.teacherId.toString() !== teacherId.toString()) {
            visible = false;
          }
        }
        
        if (roomId && roomId !== 'all') {
          if (!cell.roomId || cell.roomId.toString() !== roomId.toString()) {
            visible = false;
          }
        }
        
        if (subjectId && subjectId !== 'all') {
          if (!cell.subjectId || cell.subjectId.toString() !== subjectId.toString()) {
            visible = false;
          }
        }
        
        if (classId && classId !== 'all') {
          if (!cell.classId || cell.classId.toString() !== classId.toString()) {
            visible = false;
          }
        }
        
        return {
          ...cell,
          visible: visible
        };
      });
    }
  }
  
  return filteredData;
};

export const processFilteredEntries = (
  timetable: TypeTimetable,
  filteredEntries: TimetableEntry[]
): TypeTimetable => {
  if (!timetable || !filteredEntries) {
    return timetable;
  }

  // Create a map of all possible day-period combinations
  const allSlots = new Map();
  
  // Initialize with all possible day-period combinations
  for (let day = timetable.startDay; day <= timetable.endDay; day++) {
    const periods = [...new Set(timetable.entries.map(entry => entry.period))].sort((a, b) => a - b);
    
    for (const period of periods) {
      const key = `${day}-${period}`;
      allSlots.set(key, null);
    }
  }
  
  // Fill in the filtered entries
  filteredEntries.forEach(entry => {
    const key = `${entry.dayOfWeek}-${entry.period}`;
    allSlots.set(key, entry);
  });
  
  // Create a new entries array with filtered entries and empty placeholders
  const combinedEntries = Array.from(allSlots.entries()).map(([key, entry]) => {
    if (entry) return entry;
    
    // If no entry exists for this slot, create an empty placeholder
    const [dayOfWeek, period] = key.split('-').map(Number);
    
    // Find a template entry with the same period to copy structure
    const templateEntry = timetable.entries.find(e => e.period === period);
    
    if (!templateEntry) return null;
    
    // Create an empty entry placeholder
    return {
      ...templateEntry,
      uuid: `empty-${key}`,
      dayOfWeek,
      period,
      teacherId: null,
      teacherUuid: null,
      teacherName: null,
      teacherInitials: null,
      roomId: null,
      roomUuid: null,
      roomName: null,
      roomInitials: null,
      subjectId: null,
      subjectUuid: null,
      subjectName: null,
      subjectInitials: null,
      classId: null,
      classUuid: null,
      className: null,
      classInitials: null,
      isEmpty: true
    };
  }).filter(Boolean);
  
  return {
    ...timetable,
    entries: combinedEntries
  };
};

export const mergeTimetableEntries = (timetable: TypeTimetable, newEntries: TimetableEntry[]): TypeTimetable => {
  if (!timetable || !newEntries) return timetable;
  
  // Create a map of existing entries by UUID for quick lookup
  const existingEntriesMap = new Map();
  timetable.entries.forEach(entry => {
    existingEntriesMap.set(entry.uuid, entry);
  });
  
  // Merge new entries with existing ones, replacing if UUID matches
  const combinedEntries = newEntries.map(newEntry => {
    const existingEntry = existingEntriesMap.get(newEntry.uuid);
    if (existingEntry) {
      // Keep existing entry's properties that aren't in the new entry
      return {
        ...existingEntry,
        ...newEntry
      };
    }
    return newEntry;
  }).filter(Boolean);
  
  return {
    ...timetable,
    entries: combinedEntries
  };
};