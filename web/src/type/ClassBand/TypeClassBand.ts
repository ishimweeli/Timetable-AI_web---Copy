import { TypeClass } from "../Class/TypeClass";

export interface TypeClassBand {
  id: number;
  uuid: string;
  organizationId: number;
  name: string;
  description?: string;
  controlNumber?: number;
  minLessonsPerDay?: number;
  maxLessonsPerDay?: number;
  latestStartPosition?: number;
  earliestEnd?: number;
  maxFreePeriods?: number;
  presentEveryDay?: boolean;
  statusId: number;
  createdBy: string;
  modifiedBy: string;
  createdDate: string;
  modifiedDate: string;
  participatingClasses?: TypeClass[];
  planSettingsId?: number;
}

export interface CreateClassBandRequest {
  organizationId: number;
  name: string;
  description?: string;
  controlNumber: number;
  minLessonsPerDay?: number;
  maxLessonsPerDay?: number;
  latestStartPosition?: number;
  earliestEnd?: number;
  maxFreePeriods?: number;
  presentEveryDay?: boolean;
  participatingClassUuids?: string[];
  planSettingsId?: number;
}

export interface UpdateClassBandRequest {
  organizationId?: number;
  name?: string;
  description?: string;
  minLessonsPerDay?: number;
  maxLessonsPerDay?: number;
  latestStartPosition?: number;
  earliestEnd?: number;
  maxFreePeriods?: number;
  presentEveryDay?: boolean;
  participatingClassUuids?: string[];
  planSettingsId?: number;
  statusId?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  [key: string]: any;
}
