import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import i18next from "i18next";
import { DashboardStats, OrgStatistics, ApiResponse } from "@/type/dashboard/DashboardTypes";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiDashboard = createApi({
  reducerPath: "dashboardApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if(token) {
        headers.set("Authorization", token);
      }

      headers.set("Accept-Language", i18next.language || "en");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getDashboardStats: builder.query<ApiResponse<DashboardStats[]>, void>({
      query: () => "core/dashboard/statistics",
      transformResponse: (response: ApiResponse<DashboardStats[]>) => response,
      transformErrorResponse: (response: any) => {
        if(response.data) {
          return response.data;
        }
        if(response.error) {
          return { error: response.error, success: false };
        }
        return { error: "Failed to fetch dashboard statistics", success: false };
      },
    }),
    getOrgStatistics: builder.query<ApiResponse<OrgStatistics>, void>({
      query: () => "core/dashboard/organization-statistics",
      transformResponse: (response: ApiResponse<OrgStatistics>) => response,
      transformErrorResponse: (response: any) => {
        if(response.data) {
          return response.data;
        }
        if(response.error) {
          return { error: response.error, success: false };
        }
        return { error: "Failed to fetch organization statistics", success: false };
      },
    }),
  }),
});

export const { useGetDashboardStatsQuery, useGetOrgStatisticsQuery } = apiDashboard;
