export interface TimeBlockType {
  uuid?: string;
  name: string;
  durationMinutes: number;
  occurrences: number;
  createdBy?: number;
  modifiedBy?: number;
  createdDate?: string;
  modifiedDate?: string;
}

export interface PlanSettings {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  periodsPerDay: number;
  daysPerWeek: number;
  startTime: string;
  endTime: string;
  organizationId: number;
  category: string;
  timeBlockTypes: TimeBlockType[];
  createdBy?: string;
  modifiedBy?: string;
  createdDate?: string;
  modifiedDate?: string;
  planStartDate?: string;
  planEndDate?: string;
  includeWeekends?: boolean;
  statusId?: number;
}

export interface PlanSettingsRequest {
  name: string;
  description?: string;
  periodsPerDay: number;
  daysPerWeek: number;
  startTime: string;
  endTime: string;
  organizationId: number;
  category?: string;
  timeBlockTypes: Omit<
    TimeBlockType,
    "createdBy" | "modifiedBy" | "createdDate" | "modifiedDate"
  >[];
  planStartDate?: string;
  planEndDate?: string;
  includeWeekends?: boolean;
}

export interface PlanSettingsResponse {
  content: PlanSettings[];
  totalPages: number;
  totalElements: number;
  data?: PlanSettings[];
  totalItems?: number;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
  errors?: string[];
}

export type PaginatedApiResponse<T> = ApiResponse<PagedResponse<T>>;
