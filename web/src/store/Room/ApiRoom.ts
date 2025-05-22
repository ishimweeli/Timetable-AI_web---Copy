import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  ApiResponse,
  TypeRoom
} from "@/type/Room/TypeRoom.ts";
import i18next from "i18next";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// Define room interfaces
export interface GetRoomsParams {
  page?: number;
  size?: number;
  keyword?: string;
  sortBy?: string;
  sortOrder?: string;
  orgId?: number | null;
  planSettingsId?: number | null;
}

// First update the Room interface
export interface Room {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  code: string;
  initials: string;
  statusId: number;
  organizationId: number;
  planSettingsId?: number | null;
  capacity: number;
  locationNumber: number;
  controlNumber: string;
  priority: string;
  createdBy: string;
  modifiedBy: string;
  createdDate: string;
  modifiedDate: string;
  isDeleted: boolean;
}

// Then update the CreateRoomRequest interface 
export interface CreateRoomRequest {
  name: string;
  code: string;
  initials: string;
  capacity: number;
  description?: string;
  statusId: number;
  organizationId: number;
  planSettingsId?: number | null;
  locationNumber: number;
  controlNumber: string;
  priority: string;
}

export const apiRoom = createApi({
  reducerPath: "roomApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1/`,
    prepareHeaders: (headers, { endpoint }) => {
      const token = localStorage.getItem("authToken");
      if(token) {
        headers.set("Authorization", token);
      }
      headers.set("Accept-Language", i18next.language);
      
      // Only set Content-Type to application/json for endpoints that don't use FormData
      if(!endpoint.includes('import')) {
        headers.set("Content-Type", "application/json");
      }
      
      return headers;
    },
    credentials: "include",
  }),

  tagTypes: ["Room", "RoomSchedulePreference", "Period", "Organization"],
  endpoints: (builder) => ({
    getRooms: builder.query<ApiResponse<TypeRoom[]>, GetRoomsParams>({
      query: (params = {}) => {
        const {
          page = 0,
          size = 10,
          keyword,
          sortBy = "name",
          sortOrder = "asc",
          orgId,
          planSettingsId,
        } = params;

        let queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        queryParams.append('size', size.toString());
        
        if (keyword) queryParams.append('keyword', keyword);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (sortOrder) queryParams.append('sortDirection', sortOrder);
        if (orgId !== null && orgId !== undefined) queryParams.append('orgId', String(orgId));
        if (planSettingsId !== null && planSettingsId !== undefined) queryParams.append('planSettingsId', String(planSettingsId));
        
        return {
          url: `rooms?${queryParams.toString()}`,
        };
      },
      providesTags: ["Room"],
    }),

    getRoom: builder.query<ApiResponse<TypeRoom>, string>({
      query: (uuid) => `rooms/${uuid}`,
      providesTags: (result, error, uuid) => [{ type: "Room", id: uuid }],
    }),

    getOrganizations: builder.query<
      ApiResponse<{ id: number; name: string }[]>,
      void
    >({
      query: () => `organizations`,
      providesTags: ["Organization"],
    }),

    createRoom: builder.mutation<ApiResponse<TypeRoom>, CreateRoomRequest>({
      query: (data) => ({
        url: `rooms`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Room"],
    }),

    updateRoom: builder.mutation<
      ApiResponse<TypeRoom>,
      { uuid: string; data: any }
    >({
      query: ({ uuid, data }) => ({
        url: `rooms/${uuid}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { uuid }) => [
        "Room",
        { type: "Room", id: uuid },
      ],
    }),

    deleteRoom: builder.mutation<ApiResponse<void>, string>({
      query: (uuid) => ({
        url: `rooms/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),

    getRoomSchedulePreferences: builder.query<ApiResponse<any>, number>({
      query: (roomId) => `rooms/${roomId}/schedule-preferences`,
      providesTags: (result, error, roomId) => [
        { type: "RoomSchedulePreference", id: roomId },
        "RoomSchedulePreference",
      ],
    }),

    updateRoomSchedulePreferences: builder.mutation<
      ApiResponse<any>,
      {
        roomId: number;
        preferences: Array<{
          day: number;
          periodId: number;
          isAvailable: boolean;
          planSettingsId?: number;
        }>;
      }
    >({
      query: ({ roomId, preferences }) => ({
        url: `rooms/${roomId}/schedule-preferences`,
        method: "PUT",
        body: { preferences },
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: "RoomSchedulePreference", id: roomId },
        "RoomSchedulePreference",
      ],
    }),

    setRoomAvailability: builder.mutation<
      ApiResponse<any>,
      { roomId: number; isAvailable: boolean }
    >({
      query: ({ roomId, isAvailable }) => ({
        url: `rooms/${roomId}/availability`,
        method: "PUT",
        body: { isAvailable },
      }),
      invalidatesTags: (result, error, { roomId }) => [
        { type: "RoomSchedulePreference", id: roomId },
        "RoomSchedulePreference",
      ],
    }),

    getAllPeriods: builder.query<ApiResponse<any>, { planSettingsId?: number } | void>({
      query: (params) => {
        if (params && typeof params === 'object' && 'planSettingsId' in params && params.planSettingsId) {
          return `periods?planSettingsId=${params.planSettingsId}`;
        }
        return `periods`;
      },
      providesTags: ["Period"],
    }),

    getPeriodsByOrganization: builder.query<ApiResponse<any>, { planSettingsId?: number } | number | void>({
      query: (params) => {
        const orgId = typeof params === 'number' ? params : 
          (params && typeof params === 'object') ? 
          localStorage.getItem("selectedOrganizationId") : 
          localStorage.getItem("selectedOrganizationId");

        if (params && typeof params === 'object' && 'planSettingsId' in params && params.planSettingsId) {
          return `periods/organization/${orgId}?planSettingsId=${params.planSettingsId}`;
        }

        return `periods/organization/${orgId}`;
      },
      providesTags: ["Period"],
    }),

    importRoomsFromCsv: builder.mutation<
      {
        status: number;
        success: boolean;
        time: number;
        language: string;
        message?: string;
        error?: string;
        data?: {
          createdRooms: Array<{
            id: number;
            uuid: string;
            name: string;
            code: string;
            capacity: number;
            description: string;
            statusId: number;
            initials: string;
            controlNumber: string;
            priority: string;
            location: string;
            createdBy: number;
            modifiedBy: number;
            createdDate: string;
            modifiedDate: string;
            organizationId: number;
          }>;
          errors: Array<{
            rowNumber: number;
            errorMessage: string;
            originalData?: string;
          }>;
          totalProcessed: number;
          successCount: number;
          errorCount: number;
        };
      },
      {
        file: File;
        organizationId?: number;
        skipHeaderRow: boolean;
      }
    >({
      query: (data) => {
        const formData = new FormData();
        formData.append('file', data.file);
        if(data.organizationId) {
          formData.append('organizationId', String(data.organizationId));
        }
        formData.append('skipHeaderRow', String(data.skipHeaderRow));
        
        return {
          url: `rooms/import/csv`,
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      invalidatesTags: ["Room"],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomQuery,
  useGetOrganizationsQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetRoomSchedulePreferencesQuery,
  useUpdateRoomSchedulePreferencesMutation,
  useSetRoomAvailabilityMutation,
  useGetAllPeriodsQuery,
  useGetPeriodsByOrganizationQuery,
  useImportRoomsFromCsvMutation,
} = apiRoom;
