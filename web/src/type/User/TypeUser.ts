export interface UserProfile {
  id?: number;
  uuid?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId: number;
  roleName?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  organizationId?: number | null;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  organizationId?: number | null;
  theme?: string;
  language?: string;
  notifications?: UserNotificationPreferences;
}

export interface UserNotificationPreferences {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId: number;
  organizationId?: number | null;
  password?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  organizationId?: number | null;
  isActive?: boolean;
}
