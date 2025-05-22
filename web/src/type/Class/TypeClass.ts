export interface TypeClass {
  id: number;
  uuid: string;
  organizationId: number;
  name: string;
  section: string;
  initial: string;
  color: string;
  capacity: number;
  minLessonsPerDay: number;
  maxLessonsPerDay: number;
  earliestEnd: number;
  latestStartPosition: number;
  maxFreePeriods: number;
  mainTeacher: string;
  comment: string;
  presentEveryDay: boolean;
  statusId: number;
  createdBy: string;
  modifiedBy: string;
  createdDate: string;
  modifiedDate: string;
  controlNumber?: number;
  planSettingsId?: number;
}

export interface CreateClassRequest {
  organizationId: number;
  name: string;
  section: string;
  initial: string;
  color: string;
  capacity: number;
  minLessonsPerDay: number;
  maxLessonsPerDay: number;
  earliestEnd: number;
  latestStartPosition: number;
  maxFreePeriods: number;
  mainTeacher?: string;
  comment?: string;
  presentEveryDay: boolean;
  planSettingsId?: number;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  data: T;
  totalItems?: number;
}
