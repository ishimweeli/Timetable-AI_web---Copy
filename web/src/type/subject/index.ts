export interface Subject {
  uuid: string;
  organizationId: number;
  initials: string;
  name: string;
  description: string;
  durationInMinutes: number;
  redRepetition: boolean;
  blueRepetition: boolean;
  conflictSubjectId: number;
  group: string;
  autoConflictHandling: boolean;
  createdBy: number;
  modifiedBy: number;
  createdDate: string;
  modifiedDate: string;
  statusId: number;
  isDeleted: boolean;
  color: string;
  id?: number;
}

export interface SubjectFormData {
  uuid?: string;
  initials: string;
  name: string;
  description: string;
  durationInMinutes: number;
  repetitionType: "red" | "blue";
  redRepetition?: boolean;
  blueRepetition?: boolean;
  conflictSubjectId: number;
  group: string;
  autoConflictHandling: boolean;
  organizationId?: number;
  statusId?: number;
  color: string;
}

export interface SubjectData {
  uuid?: string;
  id?: number;
  initials: string;
  name: string;
  description?: string;
  durationInMinutes: number;
  redRepetition: boolean;
  blueRepetition: boolean;
  conflictSubjectId?: number;
  group: string;
  autoConflictHandling: boolean;
  organizationId?: number;
  statusId?: number;
}

export interface SubjectsPageResponse {
  content: Subject[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  hasNext: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
  error?: string;
  time?: number;
  language?: string;
}
