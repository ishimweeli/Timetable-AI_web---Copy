import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse } from "@/type/student/student";
import { PeriodResponse, PeriodCreateRequest, PeriodSchedule } from "@/type/Period/TypePeriod";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiPeriod = createApi({
  reducerPath: "apiPeriod",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if(token) {
        headers.set("Authorization", `${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Period"],
  endpoints: (builder) => ({
    getPeriods: builder.query<
      ApiResponse<PeriodResponse[]>,
      {
        page?: number;
        size?: number;
        sortBy?: string;
        sortDirection?: string;
        keyword?: string;
        orgId?: number;
        planSettingsId: number; // Made mandatory
      }
    >({
      query: (params) => {
        const {
          page = 0,
          size = 10,
          sortBy,
          sortDirection,
          keyword,
          orgId,
          planSettingsId, // Required parameter
        } = params;

        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("size", size.toString());
        // Always include planSettingsId in query
        queryParams.append("planSettingsId", planSettingsId.toString());

        if(sortBy) queryParams.append("sortBy", sortBy);
        if(sortDirection) queryParams.append("sortDirection", sortDirection);
        if(keyword) queryParams.append("keyword", keyword);
        if(orgId) queryParams.append("orgId", orgId.toString());

        return {
          url: "/periods",
          params: queryParams,
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ uuid }) => ({
                type: "Period" as const,
                id: uuid,
              })),
              { type: "Period", id: "LIST" },
            ]
          : [{ type: "Period", id: "LIST" }],
    }),

    getPeriodByUuid: builder.query<
      ApiResponse<PeriodResponse>, 
      { uuid: string; planSettingsId: number } // Added planSettingsId
    >({
      query: ({ uuid, planSettingsId }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("planSettingsId", planSettingsId.toString());
        
        return {
          url: `/periods/${uuid}`,
          params: queryParams,
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        };
      },
      providesTags: (result, error, { uuid }) => [{ type: "Period", id: uuid }],
    }),

    getPeriodsByOrganization: builder.query<
      ApiResponse<PeriodResponse[]>,
      {
        organizationId: number;
        planSettingsId: number; // Made mandatory
        page?: number;
        size?: number;
        sortBy?: string;
        sortDirection?: string;
      }
    >({
      query: ({ organizationId, planSettingsId, page = 0, size = 10, sortBy, sortDirection }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("page", page.toString());
        queryParams.append("size", size.toString());
        
        // Always include planSettingsId in query
        queryParams.append("planSettingsId", planSettingsId.toString());
        if(sortBy) queryParams.append("sortBy", sortBy);
        if(sortDirection) queryParams.append("sortDirection", sortDirection);
        
        return {
          url: `/periods/organization/${organizationId}`,
          params: queryParams,
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        };
      },
      providesTags: [{ type: "Period", id: "LIST" }],
    }),

    getPeriodSchedules: builder.query<
      ApiResponse<PeriodSchedule[]>,
      { planSettingsId: number } // Made mandatory
    >({
      query: ({ planSettingsId }) => {
        const queryParams = new URLSearchParams();
        queryParams.append("planSettingsId", planSettingsId.toString());
        
        return {
          url: "/periods/schedules",
          params: queryParams,
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        };
      },
      providesTags: [{ type: "Period", id: "SCHEDULES" }],
    }),

    createPeriod: builder.mutation<
      ApiResponse<PeriodResponse>, 
      PeriodCreateRequest & { planSettingsId: number } // Added planSettingsId to request
    >({
      query: (data) => {
        // Ensure all required fields are included in the body
        return {
          url: "/periods",
          method: "POST",
          body: {
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
            durationMinutes: Number(data.durationMinutes),
            periodType: data.periodType,
            periodNumber: Number(data.periodNumber),
            days: Array.isArray(data.days) ? data.days : [1, 2, 3, 4, 5],
            organizationId: Number(data.organizationId),
            allowScheduling: Boolean(data.allowScheduling),
            showInTimetable: Boolean(data.showInTimetable),
            allowConflicts: Boolean(data.allowConflicts),
            planSettingsId: Number(data.planSettingsId)
          },
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json"
          },
        };
      },
      invalidatesTags: [{ type: "Period", id: "LIST" }],
    }),

    updatePeriod: builder.mutation<
      ApiResponse<PeriodResponse>,
      { 
        uuid: string; 
        period: PeriodCreateRequest;
        planSettingsId: number; // Added planSettingsId
      }
    >({
      query: ({ uuid, period, planSettingsId }) => {
        return {
          url: `/periods/${uuid}`,
          method: "PUT",
          body: {
            name: period.name,
            startTime: period.startTime,
            endTime: period.endTime,
            durationMinutes: Number(period.durationMinutes),
            periodType: period.periodType,
            periodNumber: Number(period.periodNumber),
            days: Array.isArray(period.days) ? period.days : [1, 2, 3, 4, 5],
            organizationId: Number(period.organizationId),
            allowScheduling: Boolean(period.allowScheduling),
            showInTimetable: Boolean(period.showInTimetable),
            allowConflicts: Boolean(period.allowConflicts),
            planSettingsId: Number(planSettingsId)
          },
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json"
          },
        };
      },
      invalidatesTags: (result, error, { uuid }) => [
        { type: "Period", id: uuid },
        { type: "Period", id: "LIST" },
      ],
    }),

    deletePeriod: builder.mutation<
      ApiResponse<void>, 
      { uuid: string; planSettingsId: number } // Added planSettingsId
    >({
      query: ({ uuid, planSettingsId }) => {
        return {
          url: `/periods/${uuid}`,
          method: "DELETE",
          body: {
            planSettingsId // Include planSettingsId in the body for consistency
          },
          headers: {
            Authorization: `${localStorage.getItem("authToken")}`,
          },
        };
      },
      invalidatesTags: [{ type: "Period", id: "LIST" }],
    }),

    updateAllowLocationChangeBulk: builder.mutation<
      ApiResponse<Period[]>,
      { periodUuids: string[]; allowLocationChange: boolean }
    >({
      query: ({ periodUuids, allowLocationChange }) => ({
        url: "/periods/allow-location-change",
        method: "PUT",
        body: { periodUuids, allowLocationChange },
        headers: {
          Authorization: `${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json"
        }
      }),
      invalidatesTags: [{ type: "Period", id: "LIST" }]
    }),
  }),
});

export const {
  useGetPeriodsQuery,
  useGetPeriodByUuidQuery,
  useGetPeriodsByOrganizationQuery,
  useGetPeriodSchedulesQuery,
  useCreatePeriodMutation,
  useUpdatePeriodMutation,
  useDeletePeriodMutation,
  useUpdateAllowLocationChangeBulkMutation,
} = apiPeriod;
