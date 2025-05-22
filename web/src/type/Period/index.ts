export interface PeriodRequest {
  organizationId: number;
  periodNumber: number;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  periodType: "Regular" | "Break" | "Lunch" | "Assembly";
  days: number[];
  allowScheduling: boolean;
  showInTimetable: boolean;
  allowConflicts: boolean;
}

export interface Period {
  id: number;
  uuid: string;
  periodNumber: number;
  name: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  periodType: string;
  days: number[];
  allowScheduling: boolean;
  showInTimetable: boolean;
  allowConflicts: boolean;
  organizationId: number;
  statusId: number;
  isDeleted: boolean;
  createdDate: string;
  modifiedDate: string;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  data: T;
}
