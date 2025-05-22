export interface Period {
  id: number;
  uuid: string;
  name?: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  duration?: number;
  periodNumber?: number;
  allowScheduling?: boolean;
  showInTimetable?: boolean;
  allowConflicts?: boolean;
  days?: number[];
  schedules?: {
    day: number;
    periodId: number;
  }[];
  planSettingsId?: number;
  organizationId?: number;
}

// Change from 'type' to 'enum' for better type safety
export enum PreferenceType {
  // Teacher-specific preferences
  CANNOT_TEACH = "CANNOT_TEACH",
  PREFERS_TO_TEACH = "PREFERS_TO_TEACH",
  MUST_TEACH = "MUST_TEACH",
  DONT_PREFER_TO_TEACH = "DONT_PREFER_TO_TEACH",

  // Class-specific preferences
  MUST_SCHEDULE_CLASS = "MUST_SCHEDULE_CLASS",
  MUST_NOT_SCHEDULE_CLASS = "MUST_NOT_SCHEDULE_CLASS",
  PREFERS_TO_SCHEDULE_CLASS = "PREFERS_TO_SCHEDULE_CLASS",
  PREFER_NOT_TO_SCHEDULE_CLASS = "PREFER_NOT_TO_SCHEDULE_CLASS",

  // Generic preferences for backward compatibility
  PREFERRED = "PREFERRED",
  ACCEPTABLE = "ACCEPTABLE",
  NOT_PREFERRED = "NOT_PREFERRED",
  UNAVAILABLE = "UNAVAILABLE",
}

export enum ChangeOperationType {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export interface PendingChange {
  id?: string;
  uuid?: string;
  cellIndex: string;
  preferenceType?: PreferenceType;
  operationType: ChangeOperationType;
  resourceId?: string;
  resourceType?: string;
  scheduleId?: string;
  preferenceUuid?: string;
  newPreferenceType?: PreferenceType;
  appliesValue?: boolean;
  periodId?: number;
  dayOfWeek?: number;
  planSettingsId?: number | null;
  cellInfo?: CellInfo;
  existingPreference?: SchedulePreference;
}

export interface CellInfo {
  periodId: string | number;
  periodUuid?: string;
  day: number;
  dayOfWeek?: number;
  scheduleId?: string;
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

export interface ResourcePreference {
  uuid: string;
  preferenceType: PreferenceType;
  resourceId: string;
  scheduleId: string;
}

export interface CalendarPreference {
  uuid: string;
  preferenceType: PreferenceType;
  scheduleId: string;
  resourceId: string;
  resourceType: string;
}

export interface SchedulePreference {
  id?: number;
  uuid: string;
  periodId?: number;
  dayOfWeek?: number;
  // Teacher-specific preference flags
  cannotTeach?: boolean;
  prefersToTeach?: boolean;
  mustTeach?: boolean;
  dontPreferToTeach?: boolean;
  // Class-specific preference flags
  mustScheduleClass?: boolean;
  mustNotScheduleClass?: boolean;
  prefersToScheduleClass?: boolean;
  prefersNotToScheduleClass?: boolean;
  // Rule-specific
  applies?: boolean;
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

export interface RulePreferenceState {
  selectedRuleUuid: string | null;
  rulePendingChanges: PendingChange[];
  schedulePreferences: SchedulePreference[];
  isLoading: boolean;
  error: string | null;
}

export interface Preference {
  uuid: string;
  name: string;
  type: PreferenceType;
  description?: string;
}

export interface PreferenceFields {
  mustScheduleClass: string; // Corresponds to backend 'mustTeach'
  mustNotScheduleClass: string; // Corresponds to backend 'cannotTeach'
  prefersToScheduleClass: string; // Corresponds to backend 'prefersToTeach'
  prefersNotToScheduleClass: string; // Corresponds to backend 'dontPreferToTeach'
}
