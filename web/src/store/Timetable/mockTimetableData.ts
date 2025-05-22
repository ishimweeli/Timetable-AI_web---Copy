import { TypeTimetableData, TypeScheduleData, ClassInfo } from '@/type/Timetable/TypeTimetable';

export const mockTimetableData: TypeTimetableData = {
  id: "timetable-2023-2024-sem1",
  name: "Timetable 2023-2024",
  academicYear: "2023-2024",
  semester: "First Semester",
  lastUpdated: "2023-09-15T14:30:00Z",
  generatedBy: "System",
  viewType: "class",
  viewId: "class-1a",
  viewName: "Class 1A",
  schoolStartTime: "08:00",
  schoolEndTime: "16:00",
  startDay: 1,
  endDay: 5,
  
  cachedData: {
    subjects: [
      { id: "subj-math", code: "MATH", name: "Mathematics", color: "#3b82f6" },
      { id: "subj-hist", code: "HIST", name: "History", color: "#f59e0b" },
      { id: "subj-phys", code: "PHYS", name: "Physics", color: "#a855f7" },
      { id: "subj-eng", code: "ENG", name: "English", color: "#10b981" }
    ],
    teachers: [
      { id: "teach-js1", initials: "JS", name: "John Smith" },
      { id: "teach-mc1", initials: "MC", name: "Maria Carter" },
      { id: "teach-ae1", initials: "AE", name: "Alan Edison" },
      { id: "teach-js2", initials: "JS", name: "Jane Stevens" }
    ],
    rooms: [
      { id: "room-a101", code: "A101", name: "Room A101", capacity: 30 },
      { id: "room-b201", code: "B201", name: "Room B201", capacity: 25 },
      { id: "room-c301", code: "C301", name: "Room C301", capacity: 35 },
      { id: "room-d401", code: "D401", name: "Room D401", capacity: 28 }
    ]
  },
  
  scheduleEntries: [
    { day: 1, periodNumber: 1, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-math", teacherId: "teach-js1", roomId:null },
    { day: 1, periodNumber: 2, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-eng", teacherId: "teach-mc1", roomId: "room-b201" },
    { day: 1, periodNumber: 5, durationInMinutes: 20, periodType: 'Break', subjectId: null, teacherId: null, roomId: null },
    { day: 1, periodNumber: 4, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-phys", teacherId: "teach-ae1", roomId: "room-c301" },
    { day: 1, periodNumber: 3, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-hist", teacherId: "teach-js2", roomId: "room-d401" },
    { day: 1, periodNumber: 6, durationInMinutes: 45, periodType: 'Lunch', subjectId: null, teacherId: null, roomId: null },
    { day: 1, periodNumber: 7, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-math", teacherId: "teach-js1", roomId: "room-a101" },
    { day: 1, periodNumber: 8, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-eng", teacherId: "teach-mc1", roomId: "room-b201" },
    
    { day: 2, periodNumber: 1, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-hist", teacherId: null, roomId: null },
    { day: 2, periodNumber: 2, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-math", teacherId: "teach-js1", roomId: "room-a101" },
    { day: 2, periodNumber: 4, durationInMinutes: 20, periodType: 'Break', subjectId: null, teacherId: null, roomId: null },
    { day: 2, periodNumber: 3, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-eng", teacherId: "teach-mc1", roomId: "room-b201" },
    { day: 2, periodNumber: 5, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-phys", teacherId: "teach-ae1", roomId: "room-c301" },
    { day: 2, periodNumber: 6, durationInMinutes: 45, periodType: 'Lunch', subjectId: null, teacherId: null, roomId: null },
    { day: 2, periodNumber: 7, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-math", teacherId: "teach-js1", roomId: "room-a101" },
    { day: 2, periodNumber: 8, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-hist", teacherId: "teach-js2", roomId: "room-d401" },
    
    { day: 3, periodNumber: 1, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-phys", teacherId: "teach-ae1", roomId: "room-c301" },
    { day: 3, periodNumber: 2, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-hist", teacherId: "teach-js2", roomId: "room-d401" },
    { day: 3, periodNumber: 3, durationInMinutes: 20, periodType: 'Break', subjectId: null, teacherId: null, roomId: null },
    { day: 3, periodNumber: 4, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-math", teacherId: "teach-js1", roomId: "room-a101" },
    { day: 3, periodNumber: 5, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-eng", teacherId: "teach-mc1", roomId: "room-b201" },
    { day: 3, periodNumber: 6, durationInMinutes: 45, periodType: 'Lunch', subjectId: null, teacherId: null, roomId: null },
    { day: 3, periodNumber: 7, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-phys", teacherId: "teach-ae1", roomId: "room-c301" },
    { day: 3, periodNumber: 8, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-hist", teacherId: "teach-js2", roomId: "room-d401" },
    { day: 3, periodNumber: 9, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-hist", teacherId: "teach-js2", roomId: "room-d401" },
    
    { day: 4, periodNumber: 1, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-eng", teacherId: "teach-mc1", roomId: "room-b201" },
    { day: 4, periodNumber: 2, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-phys", teacherId: "teach-ae1", roomId: "room-c301" },
    { day: 4, periodNumber: 3, durationInMinutes: 20, periodType: 'Break', subjectId: null, teacherId: null, roomId: null },
    { day: 4, periodNumber: 4, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-hist", teacherId: "teach-js2", roomId: "room-d401" },
    { day: 4, periodNumber: 5, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-math", teacherId: "teach-js1", roomId: "room-a101" },
    { day: 4, periodNumber: 6, durationInMinutes: 45, periodType: 'Lunch', subjectId: null, teacherId: null, roomId: null },
    { day: 4, periodNumber: 7, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-eng", teacherId: "teach-mc1", roomId: "room-b201" },
    { day: 4, periodNumber: 8, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-phys", teacherId: "teach-ae1", roomId: "room-c301" },
    
    { day: 5, periodNumber: 1, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-math", teacherId: "teach-js1", roomId: "room-a101" },
    { day: 5, periodNumber: 2, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-eng", teacherId: "teach-mc1", roomId: "room-b201" },
    { day: 5, periodNumber: 3, durationInMinutes: 20, periodType: 'Break', subjectId: null, teacherId: null, roomId: null },
    { day: 5, periodNumber: 4, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-phys", teacherId: "teach-ae1", roomId: "room-c301" },
    { day: 5, periodNumber: 5, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-hist", teacherId: "teach-js2", roomId: "room-d401" },
    { day: 5, periodNumber: 6, durationInMinutes: 45, periodType: 'Lunch', subjectId: null, teacherId: null, roomId: null },
    { day: 5, periodNumber: 7, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-math", teacherId: "teach-js1", roomId: "room-a101" },
    { day: 5, periodNumber: 8, durationInMinutes: 45, periodType: 'Regular', subjectId: "subj-eng", teacherId: "teach-mc1", roomId: "room-b201" }
  ]
};

const addMinutesToTime = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + mins + minutes;
  
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

const getDayName = (day: number): string => {
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return dayNames[day === 7 ? 0 : day];
};

export const transformToScheduleData = (timetableData: TypeTimetableData): TypeScheduleData => {
  if(!timetableData || !timetableData.scheduleEntries || !timetableData.cachedData) {
    console.error("Invalid timetable data provided to transformToScheduleData");
    // Return empty schedule data
    return {
      timeSlots: [],
      days: []
    };
  }

  const { 
    scheduleEntries, 
    cachedData, 
    schoolStartTime = "08:00", 
    startDay = 1, 
    endDay = 5    
  } = timetableData;
  
  // Helper function to add minutes to a time string (HH:MM)
  const addMinutesToTime = (time: string, minutes: number): string => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };
  
  // Helper function to get day name from day number
  const getDayName = (day: number): string => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[day - 1] || `Day ${day}`;
  };
  
  // Extract unique period numbers and sort them
  const uniquePeriodNumbers = Array.from(new Set(scheduleEntries.map(entry => entry.periodNumber)))
    .sort((a, b) => a - b);
  
  // Calculate time slots with start and end times based on durations
  const timeSlots = uniquePeriodNumbers.map(periodNumber => {
    // Find all entries for this period number (across all days)
    const entriesForPeriod = scheduleEntries.filter(e => e.periodNumber === periodNumber);
    
    // Use the first entry's duration (assuming all days have the same duration for a given period)
    const duration = entriesForPeriod[0]?.durationInMinutes || 45;
    
    // Determine the period type - if any day has a Break or Lunch for this period, use that
    const breakEntry = entriesForPeriod.find(e => e.periodType === 'Break');
    const lunchEntry = entriesForPeriod.find(e => e.periodType === 'Lunch');
    const periodType = lunchEntry ? 'Lunch' : (breakEntry ? 'Break' : 'Regular');
    
    // Calculate start time based on previous periods
    let accumulatedMinutes = 0;
    
    for(let i = 1; i < periodNumber; i++) {
      // Find the duration for this period
      const periodDuration = scheduleEntries.find(e => e.periodNumber === i)?.durationInMinutes || 45;
      accumulatedMinutes += periodDuration;
    }
    
    const startTime = addMinutesToTime(schoolStartTime, accumulatedMinutes);
    const endTime = addMinutesToTime(startTime, duration);
    
    return {
      id: `slot-${periodNumber}`,
      period: periodNumber,
      periodType: periodType,
      start: startTime,
      end: endTime
    };
  });
  
  // Extract days within the specified range and sort them
  const daysInRange = Array.from(
    { length: endDay - startDay + 1 }, 
    (_, i) => startDay + i
  ).filter(day => day >= 1 && day <= 7); // Ensure days are valid (1-7)
  
  // Group entries by day
  const entriesByDay = scheduleEntries.reduce((acc, entry) => {
    if(!acc[entry.day]) {
      acc[entry.day] = [];
    }
    acc[entry.day].push(entry);
    return acc;
  }, {} as Record<number, typeof scheduleEntries>);
  
  return {
    timeSlots,
    days: daysInRange.map(day => {
      const dayEntries = entriesByDay[day] || [];
      
      const classes: Record<string, ClassInfo> = {};
      
      dayEntries.forEach(entry => {
        const periodStr = entry.periodNumber.toString();
        
        const classInfo: ClassInfo = {
          periodType: entry.periodType
        };

        if(entry.periodType === 'Regular' && entry.subjectId) {
          const subject = cachedData.subjects.find(s => s.id === entry.subjectId);
          if(subject) {
            classInfo.subject = {
              name: subject.name,
              code: subject.code,
              id: subject.id,
              color: subject.color
            };
          }

          if(entry.teacherId) {
            const teacher = cachedData.teachers.find(t => t.id === entry.teacherId);
            if(teacher) {
              classInfo.teacher = {
                initials: teacher.initials,
                name: teacher.name
              };
            }
          }

          if(entry.roomId) {
            const room = cachedData.rooms.find(r => r.id === entry.roomId);
            if(room) {
              classInfo.room = {
                code: room.code,
                name: room.name
              };
            }
          }
        }

        classes[periodStr] = classInfo;
      });
      
      return {
        id: day.toString(),
        name: getDayName(day),
        classes
      };
    })
  };
};

export const mockScheduleData = transformToScheduleData(mockTimetableData);

export const filterTimetableData = (
  timetableData: TypeTimetableData, 
  filters: {
    teacherId?: string;
    classId?: string;
    roomId?: string;
    subjectId?: string;
  }
): TypeTimetableData => {
  const filteredData = JSON.parse(JSON.stringify(timetableData)) as TypeTimetableData;
  
  if(!filters.teacherId && !filters.roomId && !filters.subjectId && !filters.classId) {
    return filteredData;
  }
  
  filteredData.scheduleEntries = timetableData.scheduleEntries.filter(entry => {
    if(entry.periodType === 'Break' || entry.periodType === 'Lunch') {
      return true;
    }
    
    let matches = true;
    
    if(filters.teacherId && entry.teacherId !== filters.teacherId) {
      matches = false;
    }
    
    if(filters.roomId && entry.roomId !== filters.roomId) {
      matches = false;
    }
    
    if(filters.subjectId && entry.subjectId !== filters.subjectId) {
      matches = false;
    }
    
    return matches;
  });
  
  return filteredData;
};

export const getFilteredScheduleData = (filters: {
  teacherId?: string;
  classId?: string;
  roomId?: string;
  subjectId?: string;
}): TypeScheduleData => {
  
  const filteredData = filterTimetableData(mockTimetableData, filters);
  
  
  return transformToScheduleData(filteredData);
};
