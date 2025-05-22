export interface OrganizationManager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  department?: string;
}

export interface TypeOrganization {
  id: number;
  uuid: string;
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  statusId: number;
  createdBy?: string;
  modifiedBy?: string;
  createdDate?: string;
  modifiedDate?: string;
}

export interface OrganizationFormData {
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  statusId?: number;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  time: number;
  language?: string;
  message: string | null;
  error?: string;
  data: T;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
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
    createdOrganizations?: TypeOrganization[];
    errors: ImportError[];
    totalProcessed: number;
    successCount: number;
    errorCount: number;
  };
  message?: string;
}
