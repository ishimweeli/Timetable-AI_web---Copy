import { LoginRequest, RegisterRequest, VerificationRequest } from "@/type/Auth/TypeAuth";
import { apiAuth } from "./ApiAuth";

/**
 * Authentication service with business logic related to authentication
 */
export const ServiceAuth = {
  /**
   * Login a user
   * @param credentials The user credentials
   * @returns The login response
   */
  login: async (credentials: LoginRequest) => {
    return await apiAuth.endpoints.login.initiate(credentials, { forceRefetch: true });
  },

  /**
   * Register a new user
   * @param userData The user data
   * @returns The registration response
   */
  register: async (userData: RegisterRequest) => {
    return await apiAuth.endpoints.register.initiate(userData, { forceRefetch: true });
  },

  /**
   * Verify a verification code
   * @param verificationData The verification data
   * @returns The verification response
   */
  verifyCode: async (verificationData: VerificationRequest) => {
    return await apiAuth.endpoints.verifyCode.initiate(verificationData, { forceRefetch: true });
  },

  /**
   * Resend a verification code
   * @param email The user's email
   * @returns The verification response
   */
  resendCode: async (email: string) => {
    return await apiAuth.endpoints.resendCode.initiate({ email }, { forceRefetch: true });
  }
};