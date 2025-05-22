export interface Student {
  uuid: string;
  fullName: string;
  studentIdNumber: string;
  department?: string;
  email?: string;
  phone?: string;
  address?: string;
  statusId: number;
  organizationId: number;
  classId: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface StudentRequest {
  fullName: string;
  firstName?: string;
  lastName?: string;
  studentIdNumber: string;
  department?: string;
  email: string;
  phone?: string;
  address?: string;
  statusId: number;
  organizationId: number;
  classId: number;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message?: string;
  error?: string;
  data: T;
  pagination?: {
    totalItems?: number;
    totalPages?: number;
    currentPage?: number;
    itemsPerPage?: number;
  };
}
