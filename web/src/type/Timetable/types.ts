// Types for the timetable system
export interface Timetable {
  uuid: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface TimetableEntry {
  id: string;
  timetableId: string;
  bindingId: string;
  day: number;
  period: number;
  binding: Binding;
}

export interface Binding {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  roomId: string;
  teacher: Teacher;
  subject: Subject;
  class: ClassGroup;
  room: Room;
}

export interface Teacher {
  id: string;
  name: string;
  color?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  grade: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
}

export interface ScheduleSlot {
  id: string;
  day: number;
  period: number;
  label: string;
  startTime: string;
  endTime: string;
}

export interface SchedulePreference {
  id: string;
  entityType: 'TEACHER' | 'CLASS' | 'ROOM';
  entityId: string;
  day: number;
  period: number;
  preferenceType: 'AVAILABLE' | 'PREFERRED' | 'UNAVAILABLE';
}

// UI-specific types
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
