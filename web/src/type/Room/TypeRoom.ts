export interface ApiResponse<T> {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message?: string;
  error?: string;
  data?: T;
  totalItems?: number;
}

export interface TypeRoom {
  id: number;
  uuid: string;
  name: string;
  code: string;
  capacity: number;
  description: string;
  statusId: number;
  createdBy: number;
  modifiedBy: number;
  createdDate: string;
  modifiedDate: string;
  initials: string;
  controlNumber: number;
  priority: string;
  location: string;
}

export interface CreateRoomRequest {
  name: string;
  code: string;
  capacity: number;
  description?: string;
  statusId: number;
  initials: string;
  controlNumber: number;
  priority: string;
  location: string;
}

export interface RoomSchedulePreference {
  id?: number;
  day: number;
  periodId: number;
  isAvailable: boolean;
}

export interface RoomSchedulePreferenceRequest {
  roomId: number;
  preferences: RoomSchedulePreference[];
}

export interface RoomAvailabilityRequest {
  roomId: number;
  isAvailable: boolean;
}

export interface RoomGroup {
  id: number;
  name: string;
  rooms: TypeRoom[];
}

export interface TypePeriod {
  id: number;
  uuid: string;
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
  periodNumber: number;
  formattedTime?: string;
}

export enum WeekDay {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}

export const DAY_NAMES: { [key: number]: string } = {
  [WeekDay.MONDAY]: "Monday",
  [WeekDay.TUESDAY]: "Tuesday",
  [WeekDay.WEDNESDAY]: "Wednesday",
  [WeekDay.THURSDAY]: "Thursday",
  [WeekDay.FRIDAY]: "Friday",
  [WeekDay.SATURDAY]: "Saturday",
  [WeekDay.SUNDAY]: "Sunday",
};

export const getDayName = (day: number): string => {
  return DAY_NAMES[day] || "Unknown";
};
