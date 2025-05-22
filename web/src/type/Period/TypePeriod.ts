export interface Period {
  id: number;
  uuid?: string;
  name: string;
  abbreviation: string;
  startTime: string;
  endTime: string;
  organizationId: number;
  planSettingsId?: number;
  statusId: number;
  createdDate?: string;
  modifiedDate?: string;
  createdBy?: number;
  modifiedBy?: number;
  orderIndex: number;
}

export interface PeriodResponse {
  id: number;
  uuid: string;
  name: string;
  periodNumber?: number;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  periodType?: string;
  days?: number[];
  allowScheduling?: boolean;
  showInTimetable?: boolean;
  allowConflicts?: boolean;
  organizationId: number;
  planSettingsId?: number;
  statusId?: number;
}

export interface PeriodCreateRequest {
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
  periodType?: string;
  periodNumber?: number;
  days?: number[];
  allowScheduling?: boolean;
  showInTimetable?: boolean;
  allowConflicts?: boolean;
  organizationId?: number;
  planSettingsId?: number;
}

export interface PeriodSchedule {
  uuid: string;
  time: string;
  days: number[];
  planSettingsId?: number;
  schedules: ScheduleItem[];
}

export interface ScheduleItem {
  day: number;
  scheduleUuid: string;
}
