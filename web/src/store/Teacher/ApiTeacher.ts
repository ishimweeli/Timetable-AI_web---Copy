import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { TypeTeacher } from "@/type/Teacher/TypeTeacher";
import i18next from "i18next";

// Define the base URL from environment variables
const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface GetTeachersParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  keyword?: string;
  orgId?: number | null;
  planSettingsId?: number | null;
}

export interface ApiResponse<T> {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  error?: string;
  data: T;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentPage?: number;
}

export interface CreateTeacherRequest {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  statusId: number;
  password?: string;
  bio?: string;
  initials?: string;
  department?: string;
  qualification?: string;
  contractType?: string;
  notes?: string;
  maxDailyHours?: number;
  preferredStartTime?: string;
  preferredEndTime?: string;
  controlNumber?: number;
  organizationId?: number;
  planSettingsId?: number;
}

export interface UpdateTeacherRequest {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  statusId?: number;
  password?: string;
  bio?: string;
  initials?: string;
  department?: string;
  qualification?: string;
  contractType?: string;
  notes?: string;
  maxDailyHours?: number;
  preferredStartTime?: string;
  preferredEndTime?: string;
  controlNumber?: number;
  organizationId?: number;
  planSettingsId?: number;
}

export interface ImportTeachersResponse {
  createdTeachers: TypeTeacher[];
  errors: {
    rowNumber: number;
    errorMessage: string;
    originalData?: string;
  }[];
  totalProcessed: number;
  successCount: number;
  errorCount: number;
}

// Define the base query with auth token and language settings
const baseQuery = fetchBaseQuery({
  baseUrl: `${API_BASE_URL}/api/v1`,
  prepareHeaders: (headers, { endpoint }) => {
    const token = localStorage.getItem("authToken");
    if(token) {
      headers.set("Authorization", token);
    }

    headers.set("Accept-Language", i18next.language || "en");
    
    // Only set Content-Type for non-form-data requests
    // For FormData requests, let the browser set the Content-Type with proper boundary
    if(endpoint !== 'importTeachers') {
      headers.set("Content-Type", "application/json");
    }else {
      // For importTeachers, ensure Content-Type is not set so browser can set it correctly for multipart/form-data
      headers.delete("Content-Type");
    }
    
    return headers;
  },
});

export const apiTeacher = createApi({
  reducerPath: "teacherApi",
  baseQuery,
  tagTypes: ["Teacher"],
  endpoints: (builder) => ({
    getTeachers: builder.query<ApiResponse<TypeTeacher[]>, GetTeachersParams>({
      query: (params = {}) => {
        const {
          page,
          size,
          sortBy,
          sortDirection = "asc",
          keyword,
          orgId,
          planSettingsId,
        } = params;

        // Start with basic query parameters
        const queryParams = [];

        // Only add parameters that have values
        if(page !== undefined) {
          queryParams.push(`page=${page}`);
        }

        if(size !== undefined) {
          queryParams.push(`size=${size}`);
        }

        if(sortBy) {
          queryParams.push(`sortBy=${sortBy}`);
        }

        // Always include sortDirection if sortBy is provided
        if(sortBy) {
          queryParams.push(`sortDirection=${sortDirection}`);
        }

        if(keyword) {
          queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
        }

        if(orgId) {
          queryParams.push(`orgId=${orgId}`);
        }

        if(planSettingsId) {
          queryParams.push(`planSettingsId=${planSettingsId}`);
        }

        // Construct the final query string
        const queryString = queryParams.length
          ? `?${queryParams.join("&")}`
          : "";

        return `teachers${queryString}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ uuid }) => ({
                type: "Teacher" as const,
                id: uuid,
              })),
              { type: "Teacher", id: "LIST" },
            ]
          : [{ type: "Teacher", id: "LIST" }],
      transformResponse: (response: ApiResponse<TypeTeacher[]>) => response,
      transformErrorResponse: (response: any) => {
        // Extract error from backend response
        if(response.data) {
          return response.data;
        }
        if(response.error) {
          return { error: response.error, success: false };
        }
        return { error: "Failed to fetch teachers", success: false };
      },
    }),

    getOrganizations: builder.query<
      ApiResponse<{ id: number; name: string }[]>,
      void
    >({
      query: () => "organizations",
      transformResponse: (
        response: ApiResponse<{ id: number; name: string }[]>,
      ) => response,
      transformErrorResponse: (response: any) => {
        if(response.data) {
          return response.data;
        }
        if(response.error) {
          return { error: response.error, success: false };
        }
        return { error: "Failed to fetch organizations", success: false };
      },
    }),

    getTeacher: builder.query<ApiResponse<TypeTeacher>, string>({
      query: (uuid) => `teachers/${uuid}`,
      providesTags: (result, error, uuid) => [{ type: "Teacher", id: uuid }],
      transformResponse: (response: ApiResponse<TypeTeacher>) => response,
      transformErrorResponse: (response: any) => {
        if(response.data) {
          return response.data;
        }
        if(response.error) {
          return { error: response.error, success: false };
        }
        return { error: "Failed to fetch teacher details", success: false };
      },
    }),

    createTeacher: builder.mutation<
      ApiResponse<TypeTeacher>,
      CreateTeacherRequest
    >({
      query: (data) => ({
        url: "teachers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Teacher", id: "LIST" }],
      transformResponse: (response: ApiResponse<TypeTeacher>) => response,
      transformErrorResponse: (response: any) => {
        // Return specific backend error if available
        if(response.data?.error) {
          return response.data;
        }
        if(response.error) {
          return { error: response.error, success: false };
        }
        return { error: "Failed to create teacher", success: false };
      },
    }),

    updateTeacher: builder.mutation<
      ApiResponse<TypeTeacher>,
      { uuid: string; teacherData: UpdateTeacherRequest }
    >({
      query: ({ uuid, teacherData }) => ({
        url: `teachers/${uuid}`,
        method: "PUT",
        body: teacherData,
      }),
      invalidatesTags: (result, error, { uuid }) => [
        { type: "Teacher", id: uuid },
        { type: "Teacher", id: "LIST" },
      ],
      transformResponse: (response: ApiResponse<TypeTeacher>) => response,
      transformErrorResponse: (response: any) => {
        if(response.data?.error) {
          return response.data;
        }
        if(response.error) {
          return { error: response.error, success: false };
        }
        return { error: "Failed to update teacher", success: false };
      },
    }),

    deleteTeacher: builder.mutation<ApiResponse<void>, string>({
      query: (uuid) => ({
        url: `teachers/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, uuid) => [
        { type: "Teacher", id: uuid },
        { type: "Teacher", id: "LIST" },
      ],
      transformResponse: (response: ApiResponse<void>) => response,
      transformErrorResponse: (response: any) => {
        if(response.data?.error) {
          return response.data;
        }
        if(response.error) {
          return { error: response.error, success: false };
        }
        return { error: "Failed to delete teacher", success: false };
      },
    }),

    // Teacher preferences endpoints could be added here
    getTeacherPreferences: builder.query<
      ApiResponse<any>, 
      { teacherUuid: string; planSettingsId?: number | null }
    >({
      query: ({ teacherUuid, planSettingsId }) => {
        let url = `teachers/${teacherUuid}/preferences`;
        if (planSettingsId !== undefined && planSettingsId !== null) {
          url += `?planSettingsId=${planSettingsId}`;
        }
        return url;
      },
      providesTags: (result, error, { teacherUuid }) => [
        { type: "Teacher", id: `${teacherUuid}-preferences` },
      ],
    }),

    getTeacherPreferenceForPeriodAndDay: builder.query<
      ApiResponse<any>,
      { teacherUuid: string; periodId: number; dayOfWeek: number; planSettingsId?: number | null }
    >({
      query: ({ teacherUuid, periodId, dayOfWeek, planSettingsId }) => {
        let url = `teachers/${teacherUuid}/preferences/period?periodId=${periodId}&dayOfWeek=${dayOfWeek}`;
        if (planSettingsId !== undefined && planSettingsId !== null) {
          url += `&planSettingsId=${planSettingsId}`;
        }
        return url;
      },
      providesTags: (result, error, { teacherUuid, periodId, dayOfWeek }) => [
        { type: "Teacher", id: `${teacherUuid}-period-${periodId}-day-${dayOfWeek}` },
      ],
    }),

    addSchedulePreferenceToTeacher: builder.mutation<
      ApiResponse<TypeTeacher>,
      {
        teacherUuid: string;
        periodId: number;
        dayOfWeek: number;
        preferenceType: string;
        preferenceValue: boolean;
        planSettingsId?: number | null;
      }
    >({
      query: ({
        teacherUuid,
        periodId,
        dayOfWeek,
        preferenceType,
        preferenceValue,
        planSettingsId,
      }) => {
        let url = `teachers/${teacherUuid}/preferences?periodId=${periodId}&dayOfWeek=${dayOfWeek}`;
        if (planSettingsId !== undefined && planSettingsId !== null) {
          url += `&planSettingsId=${planSettingsId}`;
        }
        return {
          url,
          method: "POST",
          body: { preferenceType, preferenceValue },
        };
      },
      invalidatesTags: (result, error, { teacherUuid, periodId, dayOfWeek }) => [
        { type: "Teacher", id: teacherUuid },
        { type: "Teacher", id: `${teacherUuid}-preferences` },
        { type: "Teacher", id: `${teacherUuid}-period-${periodId}-day-${dayOfWeek}` },
      ],
    }),

    updateSchedulePreference: builder.mutation<
      ApiResponse<TypeTeacher>,
      {
        preferenceUuid: string;
        preferenceType: string;
        preferenceValue: boolean;
        planSettingsId?: number | null;
      }
    >({
      query: ({ preferenceUuid, preferenceType, preferenceValue, planSettingsId }) => ({
        url: `teachers/schedule-preference/${preferenceUuid}`,
        method: "PUT",
        body: { 
          preferenceType, 
          preferenceValue,
          ...(planSettingsId !== undefined && planSettingsId !== null && { planSettingsId })
        },
      }),
      invalidatesTags: (result) =>
        result
          ? [
              { type: "Teacher", id: result.data.uuid },
              { type: "Teacher", id: `${result.data.uuid}-preferences` },
            ]
          : [{ type: "Teacher", id: "LIST" }],
    }),

    deleteSchedulePreference: builder.mutation<ApiResponse<void>, string>({
      query: (uuid) => ({
        url: `teachers/schedule-preference/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Teacher", id: "LIST" }],
    }),

    clearTeacherPreferencesForPeriodAndDay: builder.mutation<
      ApiResponse<void>,
      { teacherUuid: string; periodId: number; dayOfWeek: number; planSettingsId?: number | null }
    >({
      query: ({ teacherUuid, periodId, dayOfWeek, planSettingsId }) => {
        let url = `teachers/${teacherUuid}/preferences/period?periodId=${periodId}&dayOfWeek=${dayOfWeek}`;
        if (planSettingsId !== undefined && planSettingsId !== null) {
          url += `&planSettingsId=${planSettingsId}`;
        }
        return {
          url,
          method: "DELETE",
        };
      },
      invalidatesTags: (result, error, { teacherUuid, periodId, dayOfWeek }) => [
        { type: "Teacher", id: teacherUuid },
        { type: "Teacher", id: `${teacherUuid}-preferences` },
        { type: "Teacher", id: `${teacherUuid}-period-${periodId}-day-${dayOfWeek}` },
      ],
    }),

    importTeachers: builder.mutation<
      ApiResponse<ImportTeachersResponse>,
      { file: File; options: { skipHeaderRow: boolean; organizationId?: number | null; planSettingsId?: number | null } }
    >({
      query: ({ file, options }) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('skipHeaderRow', String(options.skipHeaderRow));
        
        if(options.organizationId !== undefined && options.organizationId !== null) {
          formData.append('organizationId', String(options.organizationId));
        }
        
        if(options.planSettingsId !== undefined && options.planSettingsId !== null) {
          formData.append('planSettingsId', String(options.planSettingsId));
        }
        
        return {
          url: 'teachers/import/csv',
          method: 'POST',
          body: formData,
          // Do not set Content-Type when using FormData
          prepareHeaders: (headers) => {
            headers.delete('Content-Type');
            return headers;
          },
        };
      },
      invalidatesTags: [{ type: "Teacher", id: "LIST" }],
      transformErrorResponse: (response: any) => {
        // Special case: HTTP 400 but with success:true and detailed error data
        // This is when the import was processed but had validation errors
        if (response.status === 400 && response.data?.success === true) {
          return response.data;
        }
        return response;
      }
    }),

    getAllTeacherProfiles: builder.query<ApiResponse<TypeTeacher[]>, {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDirection?: string;
    }>({
      query: (params = {}) => {
        const {
          page = 0,
          size = 100,
          sortBy = "firstName",
          sortDirection = "asc",
        } = params;
        
        return `teachers/profiles?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
      },
      providesTags: [{ type: "Teacher", id: "PROFILES" }]
    }),
  }),
});

export const {
  useGetTeachersQuery,
  useLazyGetTeachersQuery,
  useGetOrganizationsQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetTeacherPreferencesQuery,
  useLazyGetTeacherPreferencesQuery,
  useGetTeacherPreferenceForPeriodAndDayQuery,
  useLazyGetTeacherPreferenceForPeriodAndDayQuery,
  useAddSchedulePreferenceToTeacherMutation,
  useUpdateSchedulePreferenceMutation,
  useDeleteSchedulePreferenceMutation,
  useClearTeacherPreferencesForPeriodAndDayMutation,
  useImportTeachersMutation,
  useGetAllTeacherProfilesQuery,
  useLazyGetAllTeacherProfilesQuery,
} = apiTeacher;
