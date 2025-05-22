import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PreferenceType } from "@/type/Calendar/TypeCalendar";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface ApiResponse {
  status: number;
  success: boolean;
  message: string;
  data?: any;
}

export const apiRulePreference = createApi({
  reducerPath: "apiRuleSchedule",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if(token) {
        headers.set("Authorization", token);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["RulePreferences", "Periods"],
  endpoints: (builder) => ({
    getPeriods: builder.query<{ data: any[] }, { planSettingsId?: number; organizationId?: number } | void>({
      query: (params) => {
        const url = "periods/schedules";
        const queryParams: Record<string, string> = {};

        if (params) {
          if (params.planSettingsId) {
            queryParams.planSettingsId = params.planSettingsId.toString();
          }
          if (params.organizationId) {
            queryParams.organizationId = params.organizationId.toString();
          }
        }

        // Add query parameters if they exist
        const queryString = Object.keys(queryParams).length
          ? `?${new URLSearchParams(queryParams).toString()}`
          : '';

        return `${url}${queryString}`;
      },
      providesTags: ["Periods"],
    }),

    getRuleWithPreferences: builder.query<ApiResponse, string>({
      query: (ruleUuid) => `rules/${ruleUuid}`,
      providesTags: ["RulePreferences"],
    }),

    createRulePreference: builder.mutation<
      ApiResponse,
      { ruleUuid: string; periodId: number; dayOfWeek: number }
    >({
      query: ({ ruleUuid, periodId, dayOfWeek }) => ({
        url: `rules/${ruleUuid}/preferences`,
        method: "POST",
        body: {
          periodId,
          dayOfWeek,
          preferenceType: "applies",
          preferenceValue: true,
        },
      }),
      invalidatesTags: ["RulePreferences"],
    }),

    updateRulePreference: builder.mutation<
      ApiResponse,
      { uuid: string; periodId: number; dayOfWeek: number; preferenceValue: boolean }
    >({
      query: ({ uuid, periodId, dayOfWeek, preferenceValue }) => ({
        url: `rules/schedule-preference/${uuid}`,
        method: "PUT",
        body: {
          periodId,
          dayOfWeek,
          preferenceType: "applies",
          preferenceValue,
        },
      }),
      invalidatesTags: ["RulePreferences"],
    }),

    deleteRulePreference: builder.mutation<ApiResponse, { uuid: string; periodId: number; dayOfWeek: number }>({
      query: ({ uuid, periodId, dayOfWeek }) => ({
        url: `rules/schedule-preference/${uuid}`,
        method: "DELETE",
        body: { periodId, dayOfWeek },
      }),
      invalidatesTags: ["RulePreferences"],
    }),
  }),
});

export const {
  useGetPeriodsQuery,
  useGetRuleWithPreferencesQuery,
  useCreateRulePreferenceMutation,
  useUpdateRulePreferenceMutation,
  useDeleteRulePreferenceMutation,
} = apiRulePreference;
