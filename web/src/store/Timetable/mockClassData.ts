import { TimetableClass, TypeClassGroup, TypeTimetable } from '@/type/Timetable/TypeTimetable';

export const mockClasses: TimetableClass[] = [
  {
    id: 1,
    uuid: "class-1a",
    name: "Class 1A",
    initial: "1A",
    section: "First Grade",
    individualTimetableId: 101,
    color: "#3b82f6"
  },
  {
    id: 2,
    uuid: "class-1b",
    name: "Class 1B",
    initial: "1B",
    section: "First Grade",
    individualTimetableId: 102,
    color: "#10b981"
  },
  {
    id: 3,
    uuid: "class-1c",
    name: "Class 1C",
    initial: "1C",
    section: "First Grade",
    individualTimetableId: 103,
    color: "#f59e0b"
  },
  {
    id: 4,
    uuid: "class-2a",
    name: "Class 2A",
    initial: "2A",
    section: "Second Grade",
    individualTimetableId: 104,
    color: "#a855f7"
  },
  {
    id: 5,
    uuid: "class-2b",
    name: "Class 2B",
    initial: "2B",
    section: "Second Grade",
    individualTimetableId: 105,
    color: "#ec4899"
  }
];

export const mockClassGroups: TypeClassGroup[] = [
  {
    id: "group-1",
    uuid: "group-first-grade",
    name: "First Grade Group",
    description: "All First Grade Classes",
    classes: ["class-1a", "class-1b", "class-1c"]
  },
  {
    id: "group-2",
    uuid: "group-second-grade",
    name: "Second Grade Group",
    description: "All Second Grade Classes",
    classes: ["class-2a", "class-2b"]
  },
  {
    id: "group-3",
    uuid: "group-special",
    name: "Special Activities Group",
    description: "Classes for special activities",
    classes: ["class-1a", "class-2a"]
  }
];

// Sample individual timetables for each class
export const mockIndividualTimetables: Record<string, TypeTimetable> = {
  "class-1a": {
    id: 101,
    uuid: "timetable-class-1a",
    name: "Class 1A Schedule",
    academicYear: "2023-2024",
    semester: "First Semester",
    generatedBy: "Manual",
    organizationId: 1,
    schoolStartTime: "08:00",
    schoolEndTime: "16:00",
    statusId: 1,
    description: "Individual schedule for Class 1A",
    isPublished: true,
    startDay: 1,
    endDay: 5,
    createdDate: "2023-09-01T08:00:00Z",
    modifiedDate: "2023-09-15T14:30:00Z",
    classId: 1,
    entries: [
      {
        id: 1001,
        uuid: "entry-1001",
        timetableId: 101,
        dayOfWeek: 1,
        period: 1,
        subjectId: 1,
        subjectUuid: "subj-math",
        subjectName: "Mathematics",
        subjectColor: "#3b82f6",
        subjectInitials: "MATH",
        teacherId: 1,
        teacherUuid: "teach-js1",
        teacherName: "John Smith",
        teacherInitials: "JS",
        roomId: 1,
        roomUuid: "room-a101",
        roomName: "Room A101",
        roomInitials: "A101",
        durationMinutes: 45,
        periodType: "Regular",
        status: "Active",
        classGroupId: null
      },
      {
        id: 1002,
        uuid: "entry-1002",
        timetableId: 101,
        dayOfWeek: 1,
        period: 2,
        subjectId: 2,
        subjectUuid: "subj-eng",
        subjectName: "English",
        subjectColor: "#10b981",
        subjectInitials: "ENG",
        teacherId: 2,
        teacherUuid: "teach-mc1",
        teacherName: "Maria Carter",
        teacherInitials: "MC",
        roomId: 1,
        roomUuid: "room-a101",
        roomName: "Room A101",
        roomInitials: "A101",
        durationMinutes: 45,
        periodType: "Regular",
        status: "Active",
        classGroupId: null
      }
      // Add more entries as needed
    ]
  },

  "class-1b": {
    id: 102,
    uuid: "timetable-class-1b",
    name: "Class 1B Schedule",
    academicYear: "2023-2024",
    semester: "First Semester",
    generatedBy: "Manual",
    organizationId: 1,
    schoolStartTime: "08:00",
    schoolEndTime: "16:00",
    statusId: 1,
    description: "Individual schedule for Class 1B",
    isPublished: true,
    startDay: 1,
    endDay: 5,
    createdDate: "2023-09-01T08:00:00Z",
    modifiedDate: "2023-09-15T14:30:00Z",
    classId: 2,
    entries: [
      {
        id: 2001,
        uuid: "entry-2001",
        timetableId: 102,
        dayOfWeek: 1,
        period: 1,
        subjectId: 3,
        subjectUuid: "subj-phys",
        subjectName: "Physics",
        subjectColor: "#a855f7",
        subjectInitials: "PHYS",
        teacherId: 3,
        teacherUuid: "teach-ae1",
        teacherName: "Alan Edison",
        teacherInitials: "AE",
        roomId: 2,
        roomUuid: "room-b201",
        roomName: "Room B201",
        roomInitials: "B201",
        durationMinutes: 45,
        periodType: "Regular",
        status: "Active",
        classGroupId: null
      }
      // Add more entries as needed
    ]
  }
  // Add more individual timetables for other classes
};

// Sample group timetables
export const mockGroupTimetables: Record<string, TypeTimetable> = {
  "group-first-grade": {
    id: 201,
    uuid: "timetable-group-first-grade",
    name: "First Grade Group Schedule",
    academicYear: "2023-2024",
    semester: "First Semester",
    generatedBy: "Manual",
    organizationId: 1,
    schoolStartTime: "08:00",
    schoolEndTime: "16:00",
    statusId: 1,
    description: "Schedule for all First Grade classes",
    isPublished: true,
    startDay: 1,
    endDay: 5,
    createdDate: "2023-09-01T08:00:00Z",
    modifiedDate: "2023-09-15T14:30:00Z",
    classGroupId: "group-1",
    entries: [
      {
        id: 3001,
        uuid: "entry-3001",
        timetableId: 201,
        dayOfWeek: 2,
        period: 3,
        subjectId: 4,
        subjectUuid: "subj-hist",
        subjectName: "History",
        subjectColor: "#f59e0b",
        subjectInitials: "HIST",
        teacherId: 4,
        teacherUuid: "teach-js2",
        teacherName: "Jane Stevens",
        teacherInitials: "JS",
        roomId: 3,
        roomUuid: "room-c301",
        roomName: "Room C301",
        roomInitials: "C301",
        durationMinutes: 45,
        periodType: "Regular",
        status: "Active",
        classGroupId: "group-1"
      }
      // Add more group entries as needed
    ]
  }
  // Add more group timetables
};

// Function to merge individual and group timetable entries for a class
export const getMergedTimetableForClass = (classUuid: string): TypeTimetable | null => {
  // Get individual timetable
  const individualTimetable = mockIndividualTimetables[classUuid];
  if (!individualTimetable) return null;
  
  // Find all groups the class belongs to
  const relevantGroups = mockClassGroups.filter(group => 
    group.classes.includes(classUuid)
  );
  
  if (relevantGroups.length === 0) {
    return individualTimetable;
  }
  
  // Start with a copy of the individual timetable
  const mergedTimetable: TypeTimetable = {
    ...individualTimetable,
    entries: [...individualTimetable.entries]
  };
  
  // Add entries from all relevant group timetables
  relevantGroups.forEach(group => {
    const groupTimetable = mockGroupTimetables[group.uuid];
    if (groupTimetable && groupTimetable.entries) {
      // Add entries from this group, ensuring we don't have conflicting periods
      groupTimetable.entries.forEach(groupEntry => {
        // Check if there's a conflicting individual entry
        const conflictingEntryIndex = mergedTimetable.entries.findIndex(entry => 
          entry.dayOfWeek === groupEntry.dayOfWeek && entry.period === groupEntry.period
        );
        
        if (conflictingEntryIndex >= 0) {
          // If the conflicting entry is not from a group, replace it
          if (!mergedTimetable.entries[conflictingEntryIndex].classGroupId) {
            mergedTimetable.entries[conflictingEntryIndex] = {...groupEntry};
          }
          // If both entries are from groups, keep the most recent one based on ID
          else if (groupEntry.id > mergedTimetable.entries[conflictingEntryIndex].id) {
            mergedTimetable.entries[conflictingEntryIndex] = {...groupEntry};
          }
        } else {
          // No conflict, just add the entry
          mergedTimetable.entries.push({...groupEntry});
        }
      });
    }
  });
  
  return mergedTimetable;
}; 