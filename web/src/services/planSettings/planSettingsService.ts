// src/services/planSettings/planSettingsService.ts
import axios from "axios";
import {
  PlanSettings,
  PlanSettingsRequest,
  ApiResponse,
} from "@/type/planSettings/planSettings";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const ENDPOINT = `${API_BASE_URL}/api/v1`;

const apiClient = axios.create({
  baseURL: ENDPOINT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if(token) {
      config.headers["Authorization"] = token;
    }
    const browserLang = navigator.language || navigator.userLanguage;
    if(browserLang && !config.headers["Accept-Language"]) {
      config.headers["Accept-Language"] = browserLang;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export const getAllPlanSettings = async () => {
  const response =
    await apiClient.get<ApiResponse<PlanSettings[]>>("/plan-settings");
  return response.data;
};

export const getAllPlanSettingsPaginated = async (
  page = 0,
  size = 10,
  search = "",
  sortBy = "modifiedDate",
  sortDirection = "desc",
) => {
  const queryParams = [
    `page=${page}`,
    `size=${size}`,
    `sortBy=${sortBy}`,
    `sortDirection=${sortDirection}`,
    ...(search ? [`keyword=${encodeURIComponent(search)}`] : []),
  ];
  const queryString = `?${queryParams.join("&")}`;
  const response = await apiClient.get<ApiResponse<PlanSettings[]>>(
    `/plan-settings${queryString}`,
  );
  return response.data;
};

export const getPlanSettingsByUuid = async (uuid: string) => {
  if(!uuid) {
    return null;
  }
  const response = await apiClient.get<ApiResponse<PlanSettings>>(
    `/plan-settings/${uuid}`,
  );
  return response.data;
};

export const getPlanSettingsByOrganization = async (organizationId: string) => {
  const orgId = organizationId;
  if(!orgId) {
    throw new Error("Organization ID is required");
  }
  const queryParams = [`orgId=${orgId}`];
  const queryString = `?${queryParams.join("&")}`;
  const response = await apiClient.get<ApiResponse<PlanSettings>>(
    `/plan-settings${queryString}`,
  );
  return response.data;
};

export const getPlanSettingsByOrganizationPaginated = async (
  organizationId: string,
  page = 0,
  size = 10,
  search = "",
  sortBy = "modifiedDate",
  sortDirection = "desc",
) => {
  const queryParams = [
    `orgId=${organizationId}`,
    `page=${page}`,
    `size=${size}`,
    `sortBy=${sortBy}`,
    `sortDirection=${sortDirection}`,
    ...(search ? [`keyword=${encodeURIComponent(search)}`] : []),
  ];
  const queryString = `?${queryParams.join("&")}`;
  const response = await apiClient.get<ApiResponse<PlanSettings[]>>(
    `/plan-settings${queryString}`,
  );
  return response.data;
};

export const createPlanSettings = async (planSettings: PlanSettingsRequest) => {
  const orgId =
    localStorage.getItem("selectedOrganizationId") ||
    planSettings.organizationId;
  const payload = {
    ...planSettings,
    organizationId: orgId ? orgId.toString() : "",
  };
  const response = await apiClient.post<ApiResponse<PlanSettings>>(
    "/plan-settings",
    payload,
  );
  return response.data;
};

export const updatePlanSettings = async (
  uuid: string,
  planSettings: PlanSettingsRequest,
) => {
  if(!uuid) {
    return null;
  }
  const orgId =
    localStorage.getItem("selectedOrganizationId") ||
    planSettings.organizationId;
  const payload = {
    ...planSettings,
    organizationId: orgId ? orgId.toString() : "",
  };
  const response = await apiClient.put<ApiResponse<PlanSettings>>(
    `/plan-settings/${uuid}`,
    payload,
  );
  return response.data;
};

export const deletePlanSettings = async (uuid: string) => {
  if(!uuid) {
    return null;
  }
  const response = await apiClient.delete<ApiResponse<void>>(
    `/plan-settings/${uuid}`,
  );
  return response.data;
};
