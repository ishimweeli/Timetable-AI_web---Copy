import { UserProfile as BaseUser } from "../User/TypeUser.ts";

export interface TimeValue {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface TypeTeacher extends BaseUser {
  id: number;
  uuid: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  organizationId?: number;
  planSettingsId?: number;
  department?: string;
  statusId: number;
  isActive: boolean;
  isDeleted: boolean;
  role: "teacher";
  createdDate: string;
  modifiedDate: string;
  initials?: string;
  qualification?: string;
  contractType?: string;
  controlNumber?: number;
  notes?: string;
  bio?: string;
  maxDailyHours?: number;
  preferredStartTime?: TimeValue;
  preferredEndTime?: TimeValue;
  // Optionally, add a birth date property if needed.
  birthDate?: string;
}

export interface TeacherFormData extends TypeTeacher {
  // Force initials and controlNumber to be required for the form
  initials: string;
  controlNumber?: number;
  qualification?: string;
  contractType?: string;
  notes?: string;
  bio?: string;
  maxDailyHours?: number;
  planSettingsId?: number;
  emailError?: string;
  serverError?: string;
}

export interface TeacherPreference {
  teacherId: string;
  preferences: string[];
}

export interface TeacherApiResponse {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  error?: string;
  data: TypeTeacher;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentPage?: number;
}

export interface TeacherListApiResponse {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  error?: string;
  data: TypeTeacher[];
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  currentPage: number;
}
