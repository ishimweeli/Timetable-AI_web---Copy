import { Period } from "@/type/Period/Period";
import { ScheduleConflict } from "./ManualSchedulingService";

// Types for our scheduling data
export interface DummyBinding {
  id: number;
  uuid: string;
  teacherId: number;
  teacherName: string;
  classId: number;
  className: string;
  classBandId?: number;
  classBandName?: string;
  subjectId: number;
  subjectName: string;
  roomId: number;
  roomName: string;
  periodsPerWeek: number;
  scheduledPeriods?: number;
  remainingPeriods?: number;
  isFixed?: boolean;
}

export interface DummyClass {
  id: number;
  uuid: string;
  name: string;
  classBandId?: number;
}

export interface DummyClassBand {
  id: number;
  uuid: string;
  name: string;
  classes: DummyClass[];
}

export interface DummyTeacher {
  id: number;
  uuid: string;
  name: string;
  subjects: number[]; // Subject IDs the teacher can teach
}

export interface DummySubject {
  id: number;
  uuid: string;
  name: string;
  color: string;
}

export interface DummyRoom {
  id: number;
  uuid: string;
  name: string;
  capacity: number;
}

export interface DummyEntry {
  uuid: string;
  dayOfWeek: number;
  periodId: number;
  bindingId: string;
  subjectName: string;
  teacherName: string;
  className: string;
  roomName: string;
  isManuallyScheduled: boolean;
}

export interface DummyBindingSummary {
  bindingId: string;
  scheduledPeriods: number;
  totalPeriods: number;
  remainingPeriods: number;
  isOverscheduled: boolean;
}

// Days of the week
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Periods
export const dummyPeriods: Period[] = [
  {
    id: 1,
    uuid: "period-1",
    name: "Period 1",
    startTime: "08:00",
    endTime: "09:00",
    orderIndex: 1
  },
  {
    id: 2,
    uuid: "period-2",
    name: "Period 2",
    startTime: "09:10",
    endTime: "10:10",
    orderIndex: 2
  },
  {
    id: 3,
    uuid: "period-3",
    name: "Period 3",
    startTime: "10:20",
    endTime: "11:20",
    orderIndex: 3
  },
  {
    id: 4,
    uuid: "period-4",
    name: "Period 4",
    startTime: "11:30",
    endTime: "12:30",
    orderIndex: 4
  },
  {
    id: 5,
    uuid: "period-5",
    name: "Period 5",
    startTime: "13:30",
    endTime: "14:30",
    orderIndex: 5
  }
];

// Teachers
export const dummyTeachers: DummyTeacher[] = [
  {
    id: 1,
    uuid: "teacher-1",
    name: "Mr. Smith",
    subjects: [1, 2] // Math and English
  },
  {
    id: 2,
    uuid: "teacher-2",
    name: "Mrs. Johnson",
    subjects: [3, 4] // Science and History
  },
  {
    id: 3,
    uuid: "teacher-3",
    name: "Dr. Williams",
    subjects: [5, 1, 3] // PE, Math, and Science
  }
];

// Subjects
export const dummySubjects: DummySubject[] = [
  {
    id: 1,
    uuid: "subject-1",
    name: "Mathematics",
    color: "#4285F4" // Blue
  },
  {
    id: 2,
    uuid: "subject-2",
    name: "English",
    color: "#34A853" // Green
  },
  {
    id: 3,
    uuid: "subject-3",
    name: "Science",
    color: "#FBBC05" // Yellow
  },
  {
    id: 4,
    uuid: "subject-4",
    name: "History",
    color: "#EA4335" // Red
  },
  {
    id: 5,
    uuid: "subject-5",
    name: "Physical Education",
    color: "#9C27B0" // Purple
  }
];

// Rooms
export const dummyRooms: DummyRoom[] = [
  {
    id: 1,
    uuid: "room-1",
    name: "Room 101",
    capacity: 30
  },
  {
    id: 2,
    uuid: "room-2",
    name: "Room 102",
    capacity: 25
  },
  {
    id: 3,
    uuid: "room-3",
    name: "Room 103",
    capacity: 35
  },
  {
    id: 4,
    uuid: "room-4",
    name: "Gym",
    capacity: 60
  },
  {
    id: 5,
    uuid: "room-5",
    name: "Science Lab",
    capacity: 20
  }
];

// Classes
export const dummyClasses: DummyClass[] = [
  {
    id: 1,
    uuid: "class-1",
    name: "Class 10A"
  },
  {
    id: 2,
    uuid: "class-2",
    name: "Class 10B"
  },
  {
    id: 3,
    uuid: "class-3",
    name: "Class 10C"
  }
];

// Class Bands (groups of classes that can be scheduled together)
export const dummyClassBands: DummyClassBand[] = [
  {
    id: 1,
    uuid: "classband-1",
    name: "10th Grade Science",
    classes: [dummyClasses[0], dummyClasses[1]] // 10A and 10B
  },
  {
    id: 2,
    uuid: "classband-2",
    name: "10th Grade PE",
    classes: dummyClasses // All classes
  }
];

// Generate bindings
export const dummyBindings: DummyBinding[] = [];

// Create bindings for individual classes
dummyClasses.forEach(cls => {
  // Each class gets all 5 subjects
  dummySubjects.forEach(subject => {
    // Find a teacher who can teach this subject
    const eligibleTeachers = dummyTeachers.filter(teacher => 
      teacher.subjects.includes(subject.id)
    );
    
    if (eligibleTeachers.length > 0) {
      // Pick a teacher (round-robin style)
      const teacher = eligibleTeachers[subject.id % eligibleTeachers.length];
      
      // Pick a suitable room
      let room = dummyRooms[0]; // Default room
      if (subject.id === 3) {
        // Science gets the lab
        room = dummyRooms.find(r => r.name === "Science Lab") || dummyRooms[0];
      } else if (subject.id === 5) {
        // PE gets the gym
        room = dummyRooms.find(r => r.name === "Gym") || dummyRooms[0];
      }
      
      dummyBindings.push({
        id: dummyBindings.length + 1,
        uuid: `binding-${dummyBindings.length + 1}`,
        teacherId: teacher.id,
        teacherName: teacher.name,
        classId: cls.id,
        className: cls.name,
        subjectId: subject.id,
        subjectName: subject.name,
        roomId: room.id,
        roomName: room.name,
        periodsPerWeek: 5, // Each subject has 5 periods per week
        scheduledPeriods: 0,
        remainingPeriods: 5,
        isFixed: false
      });
    }
  });
});

// Create bindings for class bands
dummyClassBands.forEach(band => {
  // For simplicity, we'll just create one binding per class band
  // In a real app, you might have multiple subjects per class band
  
  // Science class band gets Science subject
  if (band.id === 1) {
    const subject = dummySubjects.find(s => s.name === "Science") || dummySubjects[0];
    const teacher = dummyTeachers.find(t => t.subjects.includes(subject.id)) || dummyTeachers[0];
    const room = dummyRooms.find(r => r.name === "Science Lab") || dummyRooms[0];
    
    dummyBindings.push({
      id: dummyBindings.length + 1,
      uuid: `binding-${dummyBindings.length + 1}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      classId: band.classes[0].id, // Assign to first class in band for compatibility
      className: band.classes[0].name, // Assign to first class in band for compatibility
      classBandId: band.id,
      classBandName: band.name,
      subjectId: subject.id,
      subjectName: subject.name,
      roomId: room.id,
      roomName: room.name,
      periodsPerWeek: 3, // Class bands might have fewer periods
      scheduledPeriods: 0,
      remainingPeriods: 3,
      isFixed: false
    });
  }
  
  // PE class band gets PE subject
  if (band.id === 2) {
    const subject = dummySubjects.find(s => s.name === "Physical Education") || dummySubjects[0];
    const teacher = dummyTeachers.find(t => t.subjects.includes(subject.id)) || dummyTeachers[0];
    const room = dummyRooms.find(r => r.name === "Gym") || dummyRooms[0];
    
    dummyBindings.push({
      id: dummyBindings.length + 1,
      uuid: `binding-${dummyBindings.length + 1}`,
      teacherId: teacher.id,
      teacherName: teacher.name,
      classId: band.classes[0].id, // Assign to first class in band for compatibility
      className: band.classes[0].name, // Assign to first class in band for compatibility
      classBandId: band.id,
      classBandName: band.name,
      subjectId: subject.id,
      subjectName: subject.name,
      roomId: room.id,
      roomName: room.name,
      periodsPerWeek: 2, // PE has fewer periods
      scheduledPeriods: 0,
      remainingPeriods: 2,
      isFixed: false
    });
  }
});

// Generate some pre-populated entries for testing
export const generateDummyEntries = () => {
  const entries: DummyEntry[] = [];

  // Add some entries for Class 10A (first class)
  const class10A = dummyClasses.find(c => c.name === "Class 10A");
  
  if (class10A) {
    const mathBinding = dummyBindings.find(b => 
      b.classId === class10A.id && b.subjectName === "Mathematics"
    );
    
    const englishBinding = dummyBindings.find(b => 
      b.classId === class10A.id && b.subjectName === "English"
    );
    
    const scienceBinding = dummyBindings.find(b => 
      b.classId === class10A.id && b.subjectName === "Science"
    );
    
    // Monday
    if (mathBinding) {
      entries.push({
        uuid: `entry-math-10A-mon-1`,
        dayOfWeek: 1, // Monday
        periodId: 1, // First period
        bindingId: mathBinding.uuid,
        subjectName: mathBinding.subjectName,
        teacherName: mathBinding.teacherName,
        className: mathBinding.className,
        roomName: mathBinding.roomName,
        isManuallyScheduled: true
      });
    }
    
    if (englishBinding) {
      entries.push({
        uuid: `entry-eng-10A-mon-3`,
        dayOfWeek: 1, // Monday
        periodId: 3, // Third period
        bindingId: englishBinding.uuid,
        subjectName: englishBinding.subjectName,
        teacherName: englishBinding.teacherName,
        className: englishBinding.className,
        roomName: englishBinding.roomName,
        isManuallyScheduled: true
      });
    }
    
    // Tuesday
    if (scienceBinding) {
      entries.push({
        uuid: `entry-sci-10A-tue-2`,
        dayOfWeek: 2, // Tuesday
        periodId: 2, // Second period
        bindingId: scienceBinding.uuid,
        subjectName: scienceBinding.subjectName,
        teacherName: scienceBinding.teacherName,
        className: scienceBinding.className,
        roomName: scienceBinding.roomName,
        isManuallyScheduled: true
      });
    }
    
    if (mathBinding) {
      entries.push({
        uuid: `entry-math-10A-tue-4`,
        dayOfWeek: 2, // Tuesday
        periodId: 4, // Fourth period
        bindingId: mathBinding.uuid,
        subjectName: mathBinding.subjectName,
        teacherName: mathBinding.teacherName,
        className: mathBinding.className,
        roomName: mathBinding.roomName,
        isManuallyScheduled: true
      });
    }
  }

  // Add some entries for Class 10B (second class)
  const class10B = dummyClasses.find(c => c.name === "Class 10B");
  
  if (class10B) {
    const historyBinding = dummyBindings.find(b => 
      b.classId === class10B.id && b.subjectName === "History"
    );
    
    const peBinding = dummyBindings.find(b => 
      b.classId === class10B.id && b.subjectName === "Physical Education"
    );
    
    // Wednesday
    if (historyBinding) {
      entries.push({
        uuid: `entry-his-10B-wed-1`,
        dayOfWeek: 3, // Wednesday
        periodId: 1, // First period
        bindingId: historyBinding.uuid,
        subjectName: historyBinding.subjectName,
        teacherName: historyBinding.teacherName,
        className: historyBinding.className,
        roomName: historyBinding.roomName,
        isManuallyScheduled: true
      });
    }
    
    if (peBinding) {
      entries.push({
        uuid: `entry-pe-10B-wed-5`,
        dayOfWeek: 3, // Wednesday
        periodId: 5, // Fifth period
        bindingId: peBinding.uuid,
        subjectName: peBinding.subjectName,
        teacherName: peBinding.teacherName,
        className: peBinding.className,
        roomName: peBinding.roomName,
        isManuallyScheduled: true
      });
    }
  }

  return entries;
};

// Initialize pre-populated entries
export const prePopulatedEntries: DummyEntry[] = generateDummyEntries();

// Initial entries - use pre-populated for better testing
export const dummyEntries: DummyEntry[] = [...prePopulatedEntries];

// Initial empty conflicts
export const dummyConflicts: ScheduleConflict[] = [];

// Initial binding summaries
export const dummyBindingSummaries: DummyBindingSummary[] = dummyBindings.map(binding => ({
  bindingId: binding.uuid,
  scheduledPeriods: 0,
  totalPeriods: binding.periodsPerWeek,
  remainingPeriods: binding.periodsPerWeek,
  isOverscheduled: false
}));

// Function to check for conflicts when adding a new entry
export const checkForConflicts = (
  entries: DummyEntry[],
  newEntry: Omit<DummyEntry, 'uuid'>,
  bindings: DummyBinding[]
): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];
  const binding = bindings.find(b => b.uuid === newEntry.bindingId);
  
  if (!binding) return conflicts;
  
  // Check for existing entries in the same time slot
  const existingEntries = entries.filter(
    entry => entry.dayOfWeek === newEntry.dayOfWeek && entry.periodId === newEntry.periodId
  );
  
  // Check for teacher conflicts (teacher can't be in two places at once)
  const teacherConflicts = existingEntries.filter(entry => {
    const entryBinding = bindings.find(b => b.uuid === entry.bindingId);
    return entryBinding && entryBinding.teacherId === binding.teacherId;
  });
  
  if (teacherConflicts.length > 0) {
    conflicts.push({
      conflictType: "TEACHER_CONFLICT",
      resourceId: binding.teacherId.toString(),
      resourceName: binding.teacherName,
      bindingId: binding.uuid,
      dayOfWeek: newEntry.dayOfWeek,
      periodId: newEntry.periodId,
      conflictDescription: `Teacher ${binding.teacherName} is already scheduled at this time`
    });
  }
  
  // Check for class conflicts (class can't be in two places at once)
  const classConflicts = existingEntries.filter(entry => {
    const entryBinding = bindings.find(b => b.uuid === entry.bindingId);
    return entryBinding && entryBinding.classId === binding.classId;
  });
  
  if (classConflicts.length > 0) {
    conflicts.push({
      conflictType: "CLASS_CONFLICT",
      resourceId: binding.classId.toString(),
      resourceName: binding.className,
      bindingId: binding.uuid,
      dayOfWeek: newEntry.dayOfWeek,
      periodId: newEntry.periodId,
      conflictDescription: `Class ${binding.className} is already scheduled at this time`
    });
  }
  
  // Check for room conflicts (room can't have two classes at once)
  const roomConflicts = existingEntries.filter(entry => {
    const entryBinding = bindings.find(b => b.uuid === entry.bindingId);
    return entryBinding && entryBinding.roomId === binding.roomId;
  });
  
  if (roomConflicts.length > 0) {
    conflicts.push({
      conflictType: "ROOM_CONFLICT",
      resourceId: binding.roomId.toString(),
      resourceName: binding.roomName,
      bindingId: binding.uuid,
      dayOfWeek: newEntry.dayOfWeek,
      periodId: newEntry.periodId,
      conflictDescription: `Room ${binding.roomName} is already in use at this time`
    });
  }
  
  // Check for class band conflicts
  if (binding.classBandId) {
    const classBand = dummyClassBands.find(band => band.id === binding.classBandId);
    if (classBand) {
      const classIds = classBand.classes.map(c => c.id);
      
      const classBandConflicts = existingEntries.filter(entry => {
        const entryBinding = bindings.find(b => b.uuid === entry.bindingId);
        return entryBinding && classIds.includes(entryBinding.classId);
      });
      
      if (classBandConflicts.length > 0) {
        conflicts.push({
          conflictType: "CLASSBAND_CONFLICT",
          resourceId: binding.classBandId.toString(),
          resourceName: binding.classBandName || "Class Band",
          bindingId: binding.uuid,
          dayOfWeek: newEntry.dayOfWeek,
          periodId: newEntry.periodId,
          conflictDescription: `One or more classes in ${binding.classBandName || "this class band"} are already scheduled at this time`
        });
      }
    }
  }
  
  return conflicts;
};

// Function to add a new entry
export const addDummyEntry = (
  entries: DummyEntry[],
  bindings: DummyBinding[],
  bindingSummaries: DummyBindingSummary[],
  conflicts: ScheduleConflict[],
  newEntry: Omit<DummyEntry, 'uuid'>
): {
  entries: DummyEntry[],
  conflicts: ScheduleConflict[],
  bindingSummaries: DummyBindingSummary[],
  newConflicts: ScheduleConflict[]
} => {
  // Check for conflicts
  const newConflicts = checkForConflicts(entries, newEntry, bindings);
  
  // Create a new entry with a UUID
  const entryWithUuid: DummyEntry = {
    ...newEntry,
    uuid: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  };
  
  // Add the entry
  const updatedEntries = [...entries, entryWithUuid];
  
  // Update binding summaries
  const updatedBindingSummaries = [...bindingSummaries];
  const bindingSummaryIndex = updatedBindingSummaries.findIndex(
    summary => summary.bindingId === newEntry.bindingId
  );
  
  if (bindingSummaryIndex !== -1) {
    const summary = updatedBindingSummaries[bindingSummaryIndex];
    const binding = bindings.find(b => b.uuid === newEntry.bindingId);
    const totalPeriods = binding?.periodsPerWeek || 5;
    
    updatedBindingSummaries[bindingSummaryIndex] = {
      ...summary,
      scheduledPeriods: summary.scheduledPeriods + 1,
      remainingPeriods: Math.max(0, totalPeriods - (summary.scheduledPeriods + 1)),
      isOverscheduled: (summary.scheduledPeriods + 1) > totalPeriods
    };
  }
  
  // Update conflicts list
  const updatedConflicts = [...conflicts];
  newConflicts.forEach(conflict => {
    // Check if this conflict already exists
    const existingConflictIndex = updatedConflicts.findIndex(
      c => c.conflictType === conflict.conflictType &&
           c.resourceId === conflict.resourceId &&
           c.dayOfWeek === conflict.dayOfWeek &&
           c.periodId === conflict.periodId
    );
    
    if (existingConflictIndex === -1) {
      updatedConflicts.push(conflict);
    }
  });
  
  return {
    entries: updatedEntries,
    conflicts: updatedConflicts,
    bindingSummaries: updatedBindingSummaries,
    newConflicts
  };
};

// Function to remove an entry
export const removeDummyEntry = (
  entries: DummyEntry[],
  bindings: DummyBinding[],
  bindingSummaries: DummyBindingSummary[],
  conflicts: ScheduleConflict[],
  entryId: string
): {
  entries: DummyEntry[],
  conflicts: ScheduleConflict[],
  bindingSummaries: DummyBindingSummary[]
} => {
  // Find the entry to remove
  const entryToRemove = entries.find(entry => entry.uuid === entryId);
  
  if (!entryToRemove) {
    return { entries, conflicts, bindingSummaries };
  }
  
  // Remove the entry
  const updatedEntries = entries.filter(entry => entry.uuid !== entryId);
  
  // Update binding summaries
  const updatedBindingSummaries = [...bindingSummaries];
  const bindingSummaryIndex = updatedBindingSummaries.findIndex(
    summary => summary.bindingId === entryToRemove.bindingId
  );
  
  if (bindingSummaryIndex !== -1) {
    const summary = updatedBindingSummaries[bindingSummaryIndex];
    const binding = bindings.find(b => b.uuid === entryToRemove.bindingId);
    const totalPeriods = binding?.periodsPerWeek || 5;
    
    updatedBindingSummaries[bindingSummaryIndex] = {
      ...summary,
      scheduledPeriods: Math.max(0, summary.scheduledPeriods - 1),
      remainingPeriods: Math.min(totalPeriods, totalPeriods - (summary.scheduledPeriods - 1)),
      isOverscheduled: (summary.scheduledPeriods - 1) > totalPeriods
    };
  }
  
  // Recalculate conflicts
  // This is a simplified approach - in a real app, you'd need more sophisticated conflict resolution
  const updatedConflicts = conflicts.filter(conflict => {
    // Keep conflicts that aren't related to this entry's time slot
    return !(conflict.dayOfWeek === entryToRemove.dayOfWeek && 
             conflict.periodId === entryToRemove.periodId);
  });
  
  // Check remaining entries in this time slot for conflicts
  const entriesInSameSlot = updatedEntries.filter(
    entry => entry.dayOfWeek === entryToRemove.dayOfWeek && 
             entry.periodId === entryToRemove.periodId
  );
  
  // If there are still multiple entries in this time slot, we need to check for conflicts
  if (entriesInSameSlot.length > 1) {
    entriesInSameSlot.forEach(entry => {
      const binding = bindings.find(b => b.uuid === entry.bindingId);
      if (binding) {
        // For each entry, check conflicts with all other entries in the same slot
        const otherEntries = entriesInSameSlot.filter(e => e.uuid !== entry.uuid);
        otherEntries.forEach(otherEntry => {
          const otherBinding = bindings.find(b => b.uuid === otherEntry.bindingId);
          if (otherBinding) {
            // Check for teacher conflicts
            if (binding.teacherId === otherBinding.teacherId) {
              updatedConflicts.push({
                conflictType: "TEACHER_CONFLICT",
                resourceId: binding.teacherId.toString(),
                resourceName: binding.teacherName,
                bindingId: binding.uuid,
                dayOfWeek: entry.dayOfWeek,
                periodId: entry.periodId,
                conflictDescription: `Teacher ${binding.teacherName} is scheduled for multiple classes at this time`
              });
            }
            
            // Check for class conflicts
            if (binding.classId === otherBinding.classId) {
              updatedConflicts.push({
                conflictType: "CLASS_CONFLICT",
                resourceId: binding.classId.toString(),
                resourceName: binding.className,
                bindingId: binding.uuid,
                dayOfWeek: entry.dayOfWeek,
                periodId: entry.periodId,
                conflictDescription: `Class ${binding.className} is scheduled for multiple subjects at this time`
              });
            }
            
            // Check for room conflicts
            if (binding.roomId === otherBinding.roomId) {
              updatedConflicts.push({
                conflictType: "ROOM_CONFLICT",
                resourceId: binding.roomId.toString(),
                resourceName: binding.roomName,
                bindingId: binding.uuid,
                dayOfWeek: entry.dayOfWeek,
                periodId: entry.periodId,
                conflictDescription: `Room ${binding.roomName} is scheduled for multiple classes at this time`
              });
            }
          }
        });
      }
    });
  }
  
  return {
    entries: updatedEntries,
    conflicts: updatedConflicts,
    bindingSummaries: updatedBindingSummaries
  };
};

// Function to get class info for UI
export const getClassInfoForUI = () => {
  return dummyClasses.map(cls => ({
    id: cls.uuid,
    name: cls.name
  }));
};

// Function to get filtered bindings by class
export const getFilteredBindings = (classId: string) => {
  const cls = dummyClasses.find(c => c.uuid === classId);
  if (!cls) return [];
  
  return dummyBindings.filter(binding => 
    binding.classId === cls.id || 
    (binding.classBandId && dummyClassBands.some(
      band => band.id === binding.classBandId && band.classes.some(c => c.id === cls.id)
    ))
  );
};

// Generate binding summaries for pre-populated entries
export const generateBindingSummariesForEntries = (entries: DummyEntry[]) => {
  const summaries: DummyBindingSummary[] = [...dummyBindingSummaries];
  
  // Count entries per binding
  const entriesByBinding: Record<string, number> = {};
  
  entries.forEach(entry => {
    entriesByBinding[entry.bindingId] = (entriesByBinding[entry.bindingId] || 0) + 1;
  });
  
  // Update summaries
  Object.entries(entriesByBinding).forEach(([bindingId, count]) => {
    const summaryIndex = summaries.findIndex(s => s.bindingId === bindingId);
    
    if (summaryIndex !== -1) {
      const binding = dummyBindings.find(b => b.uuid === bindingId);
      const totalPeriods = binding?.periodsPerWeek || 5;
      
      summaries[summaryIndex] = {
        ...summaries[summaryIndex],
        scheduledPeriods: count,
        remainingPeriods: Math.max(0, totalPeriods - count),
        isOverscheduled: count > totalPeriods
      };
    }
  });
  
  return summaries;
};

// Initialize summaries based on pre-populated entries
export const prePopulatedBindingSummaries: DummyBindingSummary[] = 
  generateBindingSummariesForEntries(prePopulatedEntries);

// Function to generate some conflicts for testing
export const generateDummyConflicts = (entries: DummyEntry[]): ScheduleConflict[] => {
  const conflicts: ScheduleConflict[] = [];
  
  // Create an artificial conflict for demonstration
  // Find two entries on the same day and period to create a conflict
  const entriesByTimeSlot: Record<string, DummyEntry[]> = {};
  
  entries.forEach(entry => {
    const timeSlotKey = `${entry.dayOfWeek}-${entry.periodId}`;
    if (!entriesByTimeSlot[timeSlotKey]) {
      entriesByTimeSlot[timeSlotKey] = [];
    }
    entriesByTimeSlot[timeSlotKey].push(entry);
  });
  
  // Find a teacher who teaches multiple subjects
  const multiSubjectTeacher = dummyTeachers.find(t => t.subjects.length > 1);
  
  if (multiSubjectTeacher) {
    const teacherName = multiSubjectTeacher.name;
    
    // Create a teacher conflict for Wednesday, period 3
    conflicts.push({
      conflictType: "TEACHER_CONFLICT",
      resourceId: multiSubjectTeacher.id.toString(),
      resourceName: teacherName,
      bindingId: dummyBindings[0].uuid, // Just use first binding for demo
      dayOfWeek: 3, // Wednesday
      periodId: 3, // Third period
      conflictDescription: `Teacher ${teacherName} is scheduled for multiple classes at the same time`
    });
  }
  
  return conflicts;
};

// Get additional sample data for testing
export const getSampleData = (classId: string) => {
  // Return pre-populated entries for the selected class
  const entries = prePopulatedEntries.filter(entry => {
    const binding = dummyBindings.find(b => b.uuid === entry.bindingId);
    const cls = dummyClasses.find(c => c.uuid === classId);
    
    if (binding && cls) {
      return binding.classId === cls.id;
    }
    
    return false;
  });
  
  // Get binding summaries for these entries
  const bindingSummaries = generateBindingSummariesForEntries(entries);
  
  // Generate some conflicts
  const conflicts = generateDummyConflicts(entries);
  
  return {
    entries,
    bindingSummaries,
    conflicts
  };
};

// Extended helper function to generate a complete timetable
export const generateCompleteTimetable = (classId: string) => {
  const cls = dummyClasses.find(c => c.uuid === classId);
  if (!cls) return { entries: [], bindingSummaries: [], conflicts: [] };
  
  const classBindings = dummyBindings.filter(binding => binding.classId === cls.id);
  if (classBindings.length === 0) return { entries: [], bindingSummaries: [], conflicts: [] };
  
  const entries: DummyEntry[] = [];
  
  // Distribute each binding's classes across the week
  classBindings.forEach(binding => {
    const periodsToSchedule = binding.periodsPerWeek;
    let scheduledPeriods = 0;
    
    // Try to evenly distribute across days
    const daysToUse = Math.min(DAYS_OF_WEEK.length, periodsToSchedule);
    
    for (let day = 1; day <= daysToUse && scheduledPeriods < periodsToSchedule; day++) {
      // Determine which period to use (distribute by subject)
      const period = (binding.subjectId % dummyPeriods.length) + 1;
      
      entries.push({
        uuid: `generated-${binding.uuid}-${day}-${period}`,
        dayOfWeek: day,
        periodId: period,
        bindingId: binding.uuid,
        subjectName: binding.subjectName,
        teacherName: binding.teacherName,
        className: binding.className,
        roomName: binding.roomName,
        isManuallyScheduled: true
      });
      
      scheduledPeriods++;
    }
    
    // If we still have periods to schedule, add them to remaining days
    if (scheduledPeriods < periodsToSchedule) {
      for (let day = 1; day <= DAYS_OF_WEEK.length && scheduledPeriods < periodsToSchedule; day++) {
        // Skip days we've already used
        if (day <= daysToUse) continue;
        
        // Use a different period for variety
        const period = ((binding.subjectId + day) % dummyPeriods.length) + 1;
        
        entries.push({
          uuid: `generated-${binding.uuid}-${day}-${period}`,
          dayOfWeek: day,
          periodId: period,
          bindingId: binding.uuid,
          subjectName: binding.subjectName,
          teacherName: binding.teacherName,
          className: binding.className,
          roomName: binding.roomName,
          isManuallyScheduled: true
        });
        
        scheduledPeriods++;
      }
    }
  });
  
  // Generate summaries and check for conflicts
  const bindingSummaries = generateBindingSummariesForEntries(entries);
  const conflicts = checkForConflictsInEntries(entries, dummyBindings);
  
  return {
    entries,
    bindingSummaries,
    conflicts
  };
};

// Helper to check all conflicts in a set of entries
export const checkForConflictsInEntries = (entries: DummyEntry[], bindings: DummyBinding[]) => {
  const conflicts: ScheduleConflict[] = [];
  
  // Check each entry against all others
  entries.forEach(entry => {
    const entriesInSameSlot = entries.filter(e => 
      e.uuid !== entry.uuid && 
      e.dayOfWeek === entry.dayOfWeek && 
      e.periodId === entry.periodId
    );
    
    if (entriesInSameSlot.length > 0) {
      const entryBinding = bindings.find(b => b.uuid === entry.bindingId);
      
      entriesInSameSlot.forEach(otherEntry => {
        const otherBinding = bindings.find(b => b.uuid === otherEntry.bindingId);
        
        if (entryBinding && otherBinding) {
          // Check for teacher conflicts
          if (entryBinding.teacherId === otherBinding.teacherId) {
            conflicts.push({
              conflictType: "TEACHER_CONFLICT",
              resourceId: entryBinding.teacherId.toString(),
              resourceName: entryBinding.teacherName,
              bindingId: entryBinding.uuid,
              dayOfWeek: entry.dayOfWeek,
              periodId: entry.periodId,
              conflictDescription: `Teacher ${entryBinding.teacherName} is scheduled for multiple classes at this time`
            });
          }
          
          // Check for room conflicts
          if (entryBinding.roomId === otherBinding.roomId) {
            conflicts.push({
              conflictType: "ROOM_CONFLICT",
              resourceId: entryBinding.roomId.toString(),
              resourceName: entryBinding.roomName,
              bindingId: entryBinding.uuid,
              dayOfWeek: entry.dayOfWeek,
              periodId: entry.periodId,
              conflictDescription: `Room ${entryBinding.roomName} is scheduled for multiple classes at this time`
            });
          }
        }
      });
    }
  });
  
  return conflicts;
};
