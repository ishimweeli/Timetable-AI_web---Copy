export interface User {
  firstName: string;
  lastName: string;
  email: string;
  uuid: string;
  phone?: string;
  roleId: number;
  roleName: string;
  organizationId?: number | string;
  organization?: {
    id: string | number;
    name?: string;
  };
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  error: string;
  data: {
    firstName: string;
    lastName: string;
    email: string;
    uuid: string;
    phone: string;
    roleId: number;
    roleName: string;
    organizationId?: number | string;
    organization?: {
      id: string | number;
      name?: string;
    };
    token: string;
    refreshToken: string;
  };
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  currentPage: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  organizationName?: string;
  avatarUrl?: string;
}

export interface RegisterResponse {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  error?: string;
  errorType?: "EMAIL_EXISTS" | "ORGANIZATION_EXISTS" | string;
  registrationSuccessful?: boolean;
  readyForLogin?: boolean;
  needsVerification?: boolean;
  data: {
    id: number;
    uuid: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    isActive: boolean;
    roleId: number;
    roleName: string;
    needsVerification?: boolean;
  };
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message?: string;
  error?: string;
  data?: T;
}

export interface VerificationRequest {
  email?: string;
  code: string;
  type?: string;
}

export interface VerificationResponse {
  status?: number;
  success: boolean;
  time?: number;
  language?: string;
  message?: string;
  errorMessage?: string;
  error?: string;
}

export interface CheckEmailResponse {
  exists: boolean;
  message: string;
  isInactive?: boolean;
}
