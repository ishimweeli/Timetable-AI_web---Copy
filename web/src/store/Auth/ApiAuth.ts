import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerificationRequest,
  VerificationResponse,
  ApiResponse,
  CheckEmailResponse,
  AuthState,
} from "@/type/Auth/TypeAuth.ts";
import { i18n } from "@/i18n";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Define RootState type with auth property
interface RootState {
  auth: AuthState;
}

export const apiAuth = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const currentLanguage = i18n.getCurrentLanguage();
      const state = getState() as RootState;
      const token = state?.auth?.token || localStorage.getItem("authToken");

      const url = headers.get("x-request-url");
      if(
        url &&
        !url.includes("/verification/") &&
        !url.includes("/auth/login") &&
        !url.includes("/auth/register")
      ) {
        if(token) {
          headers.set("Authorization", token);
        }
      }

      headers.set("Accept-Language", currentLanguage);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    checkEmail: builder.query<CheckEmailResponse, string>({
      query: (email) => ({
        url: `/api/v1/auth/check-email?email=${encodeURIComponent(email)}`,
        method: "GET",
      }),
      transformResponse: (
        response: ApiResponse<{ exists: boolean; isInactive?: boolean }>,
      ) => {
        return {
          exists: response.data?.exists || false,
          isInactive: response.data?.isInactive || false,
          message: response.message || "",
        };
      },
    }),
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        body: credentials,
      }),
      transformErrorResponse: (response) => {
        if(response.data) {
          return response.data;
        }
        return { error: "" };
      },
    }),
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userData) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        body: userData,
      }),
      transformResponse: (response: ApiResponse<any>) => {
        return {
          status: response.status,
          success: response.success,
          time: response.time,
          language: response.language,
          message: response.message || response.error || "",
          error: response.error,
          registrationSuccessful: response.success,
          needsVerification: response.data?.needsVerification || false,
          data: response.data || {}
        };
      },
      transformErrorResponse: (error: any) => {
        if(error.status === 400 && error.data && error.data.error) {
          return {
            success: false,
            registrationSuccessful: false,
            error: error.data.error,
          };
        }

        if(error.status === 404) {
          return {
            success: false,
            registrationSuccessful: false,
            error:
              "Server endpoint not found. Please check your API configuration.",
          };
        }

        return {
          success: false,
          registrationSuccessful: false,
          error: "Registration failed. Please try again later.",
        };
      },
    }),
    verifyCode: builder.mutation<VerificationResponse, VerificationRequest>({
      query: (verificationData) => ({
        url: "/api/v1/auth/verification/verify-code",
        method: "POST",
        body: verificationData,
      }),
      transformResponse: (response: ApiResponse<null>) => {
        return {
          success: true,
          message: response.message || "Verification successful",
        };
      },
      transformErrorResponse: (error: any) => {
        if(error.status === 400 && error.data && error.data.error) {
          return {
            success: false,
            errorMessage: error.data.error,
          };
        }

        return {
          success: false,
          errorMessage: "Verification failed",
        };
      },
    }),
    resendCode: builder.mutation<VerificationResponse, { email: string }>({
      query: (data) => ({
        url: "/api/v1/auth/verification/resend-code",
        method: "POST",
        body: data,
      }),
      transformErrorResponse: (error: any) => {
        if(error.status === 400 && error.data && error.data.error) {
          return {
            success: false,
            errorMessage: error.data.error,
          };
        }

        return {
          success: false,
          errorMessage: "Resend code failed",
        };
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyCodeMutation,
  useResendCodeMutation,
  useCheckEmailQuery,
  useLazyCheckEmailQuery,
} = apiAuth;
