export interface Schedule {
  day: number;
  scheduleUuid: string;
}

export interface Period {
  uuid: string;
  id?: number;
  time: string;
  startTime?: string;
  endTime?: string;
  schedules: Schedule[];
  days?: number[];
}

// Import PreferenceType from the main TypeCalendar.ts instead of redefining
import { PreferenceType, ChangeOperationType } from "../Calendar/TypeCalendar";
export { PreferenceType, ChangeOperationType };

export interface SchedulePreference {
  id?: number;
  uuid: string;
  periodId?: number;
  dayOfWeek?: number;
  // Class-specific preference flags
  mustScheduleClass?: boolean;
  mustNotScheduleClass?: boolean;
  prefersToScheduleClass?: boolean;
  prefersNotToScheduleClass?: boolean;
  reason?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  isRecurring?: boolean;
  organizationId?: number;
  createdBy?: number | string;
  modifiedBy?: number | string;
  createdDate?: string;
  modifiedDate?: string;
  statusId?: number;
  isDeleted?: boolean;
  [key: string]: any;
}

export interface PendingChange {
  operationType: ChangeOperationType;
  periodId: number;
  dayOfWeek: number;
  preferenceUuid?: string;
  newPreferenceType?: PreferenceType;
  cellIndex: string;
}

export interface CellInfo {
  periodId: number;
  dayOfWeek: number;
  currentPreference?: SchedulePreference;
}

export interface CalendarState {
  selectedCell: CellInfo | null;
  selectedScheduleIds: string[];
  selectedPreferenceType: PreferenceType | null;
  pendingChanges: PendingChange[];
  error: string | null;
  isLoading: boolean;
  selectedClassUuid?: string | null;
}

export interface PreferenceFields {
  mustScheduleClass: string;
  mustNotScheduleClass: string;
  prefersToScheduleClass: string;
  prefersNotToScheduleClass: string;
}
