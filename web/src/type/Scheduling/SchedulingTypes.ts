// Types for the manual scheduling page

export interface ClassInfo {
  id: string;
  name: string;
}

export interface BindingSummary {
  bindingId: string;
  scheduledPeriods: number;
  totalPeriods: number;
  remainingPeriods: number;
  isOverscheduled: boolean;
}

export interface LocalEntry {
  uuid: string;
  dayOfWeek: number;
  periodId: number;
  subjectName: string;
  teacherName: string;
  className: string;
  roomName: string;
  isManuallyScheduled: boolean;
}
