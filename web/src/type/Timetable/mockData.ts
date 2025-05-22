import { 
  Timetable, 
  TimetableEntry, 
  Binding, 
  Teacher, 
  Subject, 
  ClassGroup, 
  Room, 
  ScheduleSlot, 
  SchedulePreference 
} from './types';

// Mock data
export const mockTeachers: Teacher[] = [
  { id: 't1', name: 'Mrs. Johnson', color: '#3b82f6' },
  { id: 't2', name: 'Mr. Smith', color: '#10b981' },
  { id: 't3', name: 'Ms. Davis', color: '#8b5cf6' },
  { id: 't4', name: 'Dr. Wilson', color: '#f59e0b' },
  { id: 't5', name: 'Mrs. Brown', color: '#ef4444' },
];

export const mockSubjects: Subject[] = [
  { id: 's1', name: 'Mathematics', code: 'MATH', color: '#3b82f6' },
  { id: 's2', name: 'Science', code: 'SCI', color: '#10b981' },
  { id: 's3', name: 'Literature', code: 'LIT', color: '#8b5cf6' },
  { id: 's4', name: 'History', code: 'HIST', color: '#f59e0b' },
  { id: 's5', name: 'Art', code: 'ART', color: '#ec4899' },
  { id: 's6', name: 'Physical Education', code: 'PE', color: '#14b8a6' },
  { id: 's7', name: 'Music', code: 'MUS', color: '#6366f1' },
  { id: 's8', name: 'Language', code: 'LANG', color: '#f97316' },
];

export const mockClasses: ClassGroup[] = [
  { id: 'c1', name: '9A', grade: '9' },
  { id: 'c2', name: '9B', grade: '9' },
  { id: 'c3', name: '10A', grade: '10' },
  { id: 'c4', name: '10B', grade: '10' },
  { id: 'c5', name: '11A', grade: '11' },
];

export const mockRooms: Room[] = [
  { id: 'r1', name: '101', capacity: 30 },
  { id: 'r2', name: '102', capacity: 25 },
  { id: 'r3', name: '103', capacity: 35 },
  { id: 'r4', name: '104', capacity: 20 },
  { id: 'r5', name: 'Gym', capacity: 60 },
  { id: 'r6', name: 'Art Studio', capacity: 25 },
  { id: 'r7', name: 'Music Room', capacity: 30 },
  { id: 'r8', name: 'Lab', capacity: 25 },
];

export const mockBindings: Binding[] = [
  {
    id: 'b1',
    teacherId: 't1',
    subjectId: 's1',
    classId: 'c1',
    roomId: 'r1',
    teacher: mockTeachers[0],
    subject: mockSubjects[0],
    class: mockClasses[0],
    room: mockRooms[0],
  },
  {
    id: 'b2',
    teacherId: 't2',
    subjectId: 's2',
    classId: 'c1',
    roomId: 'r8',
    teacher: mockTeachers[1],
    subject: mockSubjects[1],
    class: mockClasses[0],
    room: mockRooms[7],
  },
  {
    id: 'b3',
    teacherId: 't3',
    subjectId: 's3',
    classId: 'c2',
    roomId: 'r2',
    teacher: mockTeachers[2],
    subject: mockSubjects[2],
    class: mockClasses[1],
    room: mockRooms[1],
  },
  {
    id: 'b4',
    teacherId: 't4',
    subjectId: 's4',
    classId: 'c2',
    roomId: 'r3',
    teacher: mockTeachers[3],
    subject: mockSubjects[3],
    class: mockClasses[1],
    room: mockRooms[2],
  },
  {
    id: 'b5',
    teacherId: 't5',
    subjectId: 's5',
    classId: 'c3',
    roomId: 'r6',
    teacher: mockTeachers[4],
    subject: mockSubjects[4],
    class: mockClasses[2],
    room: mockRooms[5],
  },
  {
    id: 'b6',
    teacherId: 't2',
    subjectId: 's6',
    classId: 'c3',
    roomId: 'r5',
    teacher: mockTeachers[1],
    subject: mockSubjects[5],
    class: mockClasses[2],
    room: mockRooms[4],
  },
  {
    id: 'b7',
    teacherId: 't3',
    subjectId: 's7',
    classId: 'c4',
    roomId: 'r7',
    teacher: mockTeachers[2],
    subject: mockSubjects[6],
    class: mockClasses[3],
    room: mockRooms[6],
  },
  {
    id: 'b8',
    teacherId: 't1',
    subjectId: 's8',
    classId: 'c4',
    roomId: 'r4',
    teacher: mockTeachers[0],
    subject: mockSubjects[7],
    class: mockClasses[3],
    room: mockRooms[3],
  },
  {
    id: 'b9',
    teacherId: 't4',
    subjectId: 's1',
    classId: 'c5',
    roomId: 'r1',
    teacher: mockTeachers[3],
    subject: mockSubjects[0],
    class: mockClasses[4],
    room: mockRooms[0],
  },
  {
    id: 'b10',
    teacherId: 't5',
    subjectId: 's2',
    classId: 'c5',
    roomId: 'r8',
    teacher: mockTeachers[4],
    subject: mockSubjects[1],
    class: mockClasses[4],
    room: mockRooms[7],
  },
];

export const mockTimetables: Timetable[] = [
  {
    uuid: 't1',
    name: 'Fall Semester 2025',
    description: 'Regular timetable for Fall 2025',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
  },
  {
    uuid: 't2',
    name: 'Spring Semester 2026',
    description: 'Regular timetable for Spring 2026',
    startDate: '2026-01-10',
    endDate: '2026-05-30',
  },
];

export const mockTimetableEntries: TimetableEntry[] = [
  {
    id: 'e1',
    timetableId: 't1',
    bindingId: 'b1',
    day: 1,
    period: 1,
    binding: mockBindings[0],
  },
  {
    id: 'e2',
    timetableId: 't1',
    bindingId: 'b2',
    day: 1,
    period: 2,
    binding: mockBindings[1],
  },
  {
    id: 'e3',
    timetableId: 't1',
    bindingId: 'b3',
    day: 2,
    period: 1,
    binding: mockBindings[2],
  },
];

export const mockScheduleSlots: ScheduleSlot[] = [
  { id: 'p1', day: 1, period: 1, label: 'Period 1', startTime: '08:00', endTime: '08:50' },
  { id: 'p2', day: 1, period: 2, label: 'Period 2', startTime: '09:00', endTime: '09:50' },
  { id: 'p3', day: 1, period: 3, label: 'Period 3', startTime: '10:00', endTime: '10:50' },
  { id: 'p4', day: 1, period: 4, label: 'Period 4', startTime: '11:00', endTime: '11:50' },
  { id: 'p5', day: 1, period: 5, label: 'Period 5', startTime: '12:00', endTime: '12:50' },
  { id: 'p6', day: 1, period: 6, label: 'Period 6', startTime: '13:00', endTime: '13:50' },
  { id: 'p7', day: 1, period: 7, label: 'Period 7', startTime: '14:00', endTime: '14:50' },
  { id: 'p8', day: 2, period: 1, label: 'Period 1', startTime: '08:00', endTime: '08:50' },
  { id: 'p9', day: 2, period: 2, label: 'Period 2', startTime: '09:00', endTime: '09:50' },
  { id: 'p10', day: 2, period: 3, label: 'Period 3', startTime: '10:00', endTime: '10:50' },
  { id: 'p11', day: 2, period: 4, label: 'Period 4', startTime: '11:00', endTime: '11:50' },
  { id: 'p12', day: 2, period: 5, label: 'Period 5', startTime: '12:00', endTime: '12:50' },
  { id: 'p13', day: 2, period: 6, label: 'Period 6', startTime: '13:00', endTime: '13:50' },
  { id: 'p14', day: 2, period: 7, label: 'Period 7', startTime: '14:00', endTime: '14:50' },
  { id: 'p15', day: 3, period: 1, label: 'Period 1', startTime: '08:00', endTime: '08:50' },
  { id: 'p16', day: 3, period: 2, label: 'Period 2', startTime: '09:00', endTime: '09:50' },
  { id: 'p17', day: 3, period: 3, label: 'Period 3', startTime: '10:00', endTime: '10:50' },
  { id: 'p18', day: 3, period: 4, label: 'Period 4', startTime: '11:00', endTime: '11:50' },
  { id: 'p19', day: 3, period: 5, label: 'Period 5', startTime: '12:00', endTime: '12:50' },
  { id: 'p20', day: 3, period: 6, label: 'Period 6', startTime: '13:00', endTime: '13:50' },
  { id: 'p21', day: 3, period: 7, label: 'Period 7', startTime: '14:00', endTime: '14:50' },
  { id: 'p22', day: 4, period: 1, label: 'Period 1', startTime: '08:00', endTime: '08:50' },
  { id: 'p23', day: 4, period: 2, label: 'Period 2', startTime: '09:00', endTime: '09:50' },
  { id: 'p24', day: 4, period: 3, label: 'Period 3', startTime: '10:00', endTime: '10:50' },
  { id: 'p25', day: 4, period: 4, label: 'Period 4', startTime: '11:00', endTime: '11:50' },
  { id: 'p26', day: 4, period: 5, label: 'Period 5', startTime: '12:00', endTime: '12:50' },
  { id: 'p27', day: 4, period: 6, label: 'Period 6', startTime: '13:00', endTime: '13:50' },
  { id: 'p28', day: 4, period: 7, label: 'Period 7', startTime: '14:00', endTime: '14:50' },
  { id: 'p29', day: 5, period: 1, label: 'Period 1', startTime: '08:00', endTime: '08:50' },
  { id: 'p30', day: 5, period: 2, label: 'Period 2', startTime: '09:00', endTime: '09:50' },
  { id: 'p31', day: 5, period: 3, label: 'Period 3', startTime: '10:00', endTime: '10:50' },
  { id: 'p32', day: 5, period: 4, label: 'Period 4', startTime: '11:00', endTime: '11:50' },
  { id: 'p33', day: 5, period: 5, label: 'Period 5', startTime: '12:00', endTime: '12:50' },
  { id: 'p34', day: 5, period: 6, label: 'Period 6', startTime: '13:00', endTime: '13:50' },
  { id: 'p35', day: 5, period: 7, label: 'Period 7', startTime: '14:00', endTime: '14:50' },
];

export const mockPreferences: SchedulePreference[] = [
  { id: 'pref1', entityType: 'TEACHER', entityId: 't1', day: 5, period: 6, preferenceType: 'UNAVAILABLE' },
  { id: 'pref2', entityType: 'TEACHER', entityId: 't1', day: 5, period: 7, preferenceType: 'UNAVAILABLE' },
  { id: 'pref3', entityType: 'TEACHER', entityId: 't2', day: 1, period: 1, preferenceType: 'PREFERRED' },
  { id: 'pref4', entityType: 'CLASS', entityId: 'c1', day: 3, period: 7, preferenceType: 'UNAVAILABLE' },
  { id: 'pref5', entityType: 'ROOM', entityId: 'r5', day: 2, period: 4, preferenceType: 'UNAVAILABLE' },
];

// Mock API functions
export const api = {
  // Timetable APIs
  getTimetables: async (): Promise<Timetable[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTimetables), 300);
    });
  },

  getTimetable: async (uuid: string): Promise<Timetable | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTimetables.find((t) => t.uuid === uuid)), 200);
    });
  },

  getTimetableEntries: async (timetableId: string): Promise<TimetableEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTimetableEntries.filter((e) => e.timetableId === timetableId)), 300);
    });
  },

  getTimetableEntriesByDay: async (timetableId: string, day: number): Promise<TimetableEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockTimetableEntries.filter((e) => e.timetableId === timetableId && e.day === day)), 200);
    });
  },

  // Binding APIs
  getBindings: async (): Promise<Binding[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockBindings), 300);
    });
  },

  getBinding: async (id: string): Promise<Binding | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockBindings.find((b) => b.id === id)), 200);
    });
  },

  // Schedule APIs
  getScheduleSlots: async (): Promise<ScheduleSlot[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockScheduleSlots), 300);
    });
  },

  // Preference APIs
  getPreferences: async (): Promise<SchedulePreference[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPreferences), 200);
    });
  },

  // Manual scheduling APIs
  addTimetableEntry: async (entry: Omit<TimetableEntry, 'id'>): Promise<TimetableEntry> => {
    return new Promise((resolve) => {
      const newEntry = {
        ...entry,
        id: `e${mockTimetableEntries.length + 1}`,
      } as TimetableEntry;
      mockTimetableEntries.push(newEntry);
      setTimeout(() => resolve(newEntry), 300);
    });
  },

  updateTimetableEntry: async (entry: TimetableEntry): Promise<TimetableEntry> => {
    return new Promise((resolve) => {
      const index = mockTimetableEntries.findIndex((e) => e.id === entry.id);
      if (index !== -1) {
        mockTimetableEntries[index] = entry;
      }
      setTimeout(() => resolve(entry), 300);
    });
  },

  deleteTimetableEntry: async (entryId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const index = mockTimetableEntries.findIndex((e) => e.id === entryId);
      if (index !== -1) {
        mockTimetableEntries.splice(index, 1);
        setTimeout(() => resolve(true), 300);
      } else {
        setTimeout(() => resolve(false), 300);
      }
    });
  },

  // Helper methods for manual scheduling
  checkForConflicts: async (
    timetableId: string,
    day: number,
    period: number,
    binding: Binding
  ): Promise<{ hasConflict: boolean; conflicts: string[] }> => {
    return new Promise((resolve) => {
      const conflicts: string[] = [];
      
      // Check if teacher is already scheduled
      const teacherConflict = mockTimetableEntries.find(
        (e) => 
          e.timetableId === timetableId && 
          e.day === day && 
          e.period === period && 
          e.binding.teacherId === binding.teacherId &&
          e.id !== (binding as any).entryId // Skip the current entry if it's an update
      );
      
      if (teacherConflict) {
        conflicts.push(`Teacher ${binding.teacher.name} is already scheduled at this time`);
      }
      
      // Check if class is already scheduled
      const classConflict = mockTimetableEntries.find(
        (e) => 
          e.timetableId === timetableId && 
          e.day === day && 
          e.period === period && 
          e.binding.classId === binding.classId &&
          e.id !== (binding as any).entryId
      );
      
      if (classConflict) {
        conflicts.push(`Class ${binding.class.name} is already scheduled at this time`);
      }
      
      // Check if room is already scheduled
      const roomConflict = mockTimetableEntries.find(
        (e) => 
          e.timetableId === timetableId && 
          e.day === day && 
          e.period === period && 
          e.binding.roomId === binding.roomId &&
          e.id !== (binding as any).entryId
      );
      
      if (roomConflict) {
        conflicts.push(`Room ${binding.room.name} is already scheduled at this time`);
      }
      
      // Check for preference conflicts
      const teacherPreference = mockPreferences.find(
        (p) => 
          p.entityType === 'TEACHER' && 
          p.entityId === binding.teacherId && 
          p.day === day && 
          p.period === period && 
          p.preferenceType === 'UNAVAILABLE'
      );
      
      if (teacherPreference) {
        conflicts.push(`Teacher ${binding.teacher.name} is unavailable at this time`);
      }
      
      const classPreference = mockPreferences.find(
        (p) => 
          p.entityType === 'CLASS' && 
          p.entityId === binding.classId && 
          p.day === day && 
          p.period === period && 
          p.preferenceType === 'UNAVAILABLE'
      );
      
      if (classPreference) {
        conflicts.push(`Class ${binding.class.name} is unavailable at this time`);
      }
      
      const roomPreference = mockPreferences.find(
        (p) => 
          p.entityType === 'ROOM' && 
          p.entityId === binding.roomId && 
          p.day === day && 
          p.period === period && 
          p.preferenceType === 'UNAVAILABLE'
      );
      
      if (roomPreference) {
        conflicts.push(`Room ${binding.room.name} is unavailable at this time`);
      }
      
      setTimeout(() => resolve({
        hasConflict: conflicts.length > 0,
        conflicts,
      }), 200);
    });
  },
};
