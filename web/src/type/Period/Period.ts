export interface Period {
  id: number;
  uuid?: string;
  name: string;
  abbreviation?: string;
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
  statusId?: number;
  createdDate?: string;
  modifiedDate?: string;
  createdBy?: number;
  modifiedBy?: number;
  orderIndex?: number;
  isDeleted?: boolean;
} 
