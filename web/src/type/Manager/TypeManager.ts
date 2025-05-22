export interface Manager {
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organizationId: number;
  statusId: number;
  canGenerateTimetable: boolean;
  canManageTeachers: boolean;
  canManageStudents: boolean;
  canCreateManagers: boolean;
}

export interface ManagerFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password?: string;
  organizationId: number;
  statusId: number;
  canGenerateTimetable: boolean;
  canManageTeachers: boolean;
  canManageStudents: boolean;
  canCreateManagers: boolean;
}

export interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
  totalItems?: number;
  totalPages?: number;
  currentPage?: number;
}

export interface ImportError {
  rowNumber: number;
  errorMessage: string;
  originalData?: string;
}

export interface ImportResult {
  success: boolean;
  data?: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors: ImportError[];
    createdManagers?: Manager[];
  };
  message?: string;
}