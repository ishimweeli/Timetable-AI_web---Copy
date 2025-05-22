// src/type/Binding/TypeBinding.ts
export interface Binding {
  uuid: string;
  organizationUuid?: string;
  teacherUuid: string;
  teacher_name?: string;
  subjectUuid: string;
  subject_name?: string;
  classUuid?: string;
  class_name?: string;
  classBandUuid?: string;
  classBand_name?: string;
  roomUuid: string;
  room_name?: string;
  periodsPerWeek: number;
  isFixed: boolean;
  priority: number;
  notes?: string;
  statusId: number;
  ruleUuids?: string[];
  planSettingsId?: number;
  createdDate?: string;
  modifiedDate?: string;
}

// Legacy alias for backward compatibility
export type Assignment = Binding;

export interface GetBindingsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  keyword?: string;
  orgId?: number;
  orgUuid?: string;
  teacherUuid?: string;
  planSettingsId?: number;
}

export interface CreateBindingRequest {
  organizationUuid?: string;
  teacherUuid: string;
  subjectUuid: string;
  classUuid?: string;
  classBandUuid?: string;
  roomUuid: string;
  periodsPerWeek?: number;
  isFixed?: boolean;
  priority?: number;
  notes?: string;
  statusId?: number;
  ruleUuids?: string[];
  planSettingsId?: number;
}

export interface UpdateBindingRequest {
  uuid: string;
  teacherUuid: string;
  subjectUuid: string;
  classUuid: string;
  roomUuid: string;
  periodsPerWeek?: number;
  isFixed?: boolean;
  priority?: number;
  notes?: string;
  statusId?: number;
  ruleUuids?: string[];
  planSettingsId?: number;
}

export interface Teacher {
  uuid: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: number;
  organizationUuid?: string;
}

export interface Subject {
  uuid: string;
  name: string;
  code?: string;
  description?: string;
  organizationUuid?: string;
}

export interface Class {
  uuid: string;
  name: string;
  grade?: string;
  section?: string;
  description?: string;
  organizationUuid?: string;
}

export interface TypeClassBand {
  uuid: string;
  name: string;
  description?: string;
  classes?: string[];
  organizationUuid?: string;
}

export interface Room {
  uuid: string;
  name: string;
  capacity?: number;
  building?: string;
  floor?: number;
  description?: string;
  organizationUuid?: string;
}

export interface Rule {
  uuid: string;
  name: string;
  description?: string;
  type?: string;
  organizationUuid?: string;
}

export interface Organization {
  uuid: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  status?: number;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  error?: string;
  data: T;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentPage?: number;
}
