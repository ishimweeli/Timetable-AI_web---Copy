// Existing binding types
export interface Binding {
  uuid: string;
  organizationUuid?: string;
  teacherUuid: string;
  teacher_name?: string;
  subjectUuid: string;
  subject_name?: string;
  classUuid: string;
  class_name?: string;
  roomUuid: string;
  room_name?: string;
  periodsPerWeek: number;
  isFixed: boolean;
  priority: number;
  notes?: string;
  statusId: number;
  ruleUuids?: string[];
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
  orgUuid?: string;
  teacherUuid?: string;
}

// Moving workload types here
export interface BindingWorkloadItem {
  uuid: string;
  name: string;
  workload: number;
}

export interface BindingApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface BindingWorkloadParams {
  orgId: number | null;
  uuid?: string;
}

import * as Yup from 'yup';

// Validation schema for binding form
export const BindingValidationSchema = Yup.object().shape({
  organizationUuid: Yup.string()
    .required('Organization is required'),
  
  teacherUuid: Yup.string()
    .nullable(),
  
  subjectUuid: Yup.string()
    .nullable(),
  
  classUuid: Yup.string()
    .nullable(),
  
  roomUuid: Yup.string()
    .nullable(),
  
  ClassBandUuid: Yup.string()
    .nullable(),
  
  periodsPerWeek: Yup.number()
    .required('Number of periods per week is required')
    .min(1, 'Minimum 1 period per week is required')
    .max(20, 'Maximum 20 periods per week are allowed'),
  
  isFixed: Yup.boolean()
    .default(false),
  
  priority: Yup.number()
    .min(0, 'Priority must be at least 0')
    .max(10, 'Priority cannot exceed 10')
    .default(0),
  
  notes: Yup.string()
    .nullable(),
  
  statusId: Yup.number()
    .default(1),
  
  ruleUuids: Yup.array()
    .of(Yup.string())
    .nullable()
});