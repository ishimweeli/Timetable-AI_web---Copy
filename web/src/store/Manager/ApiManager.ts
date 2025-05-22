import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ApiResponse,
  Manager,
  ManagerFormData,
  ImportResult,
} from "../../type/Manager/TypeManager";
import { i18n } from "@/i18n";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiManager = createApi({
  reducerPath: "managerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    prepareHeaders: (headers) => {
      const currentLanguage = i18n.getCurrentLanguage();
      const token = localStorage.getItem("authToken");

      if(token) {
        headers.set("Authorization", `${token}`);
      }

      headers.set("Accept-Language", currentLanguage);
      return headers;
    },
  }),
  tagTypes: ["Manager"],
  endpoints: (builder) => ({
    getManagers: builder.query<
      ApiResponse<Manager[]>,
      { page?: number; size?: number; search?: string; orgId?: number; sortDirection?: string }
    >({
      query: ({ page = 0, size = 10, search = "", orgId, sortDirection = "asc" }) => {
        let url = `/managers?page=${page}&size=${size}&sortDirection=${sortDirection}`;
        
        if(search) {
          url += `&search=${encodeURIComponent(search)}`;
        }
        
        if(orgId) {
          url += `&orgId=${orgId}`;
        }
        
        return url;
      },
      providesTags: ["Manager"],
    }),

    getManager: builder.query<ApiResponse<Manager>, string>({
      query: (uuid) => `/managers/${uuid}`,
      providesTags: ["Manager"],
    }),

    createManager: builder.mutation<ApiResponse<Manager>, ManagerFormData>({
      query: (managerData) => ({
        url: "/managers",
        method: "POST",
        body: managerData,
      }),
      invalidatesTags: ["Manager"],
    }),

    updateManager: builder.mutation<
      ApiResponse<Manager>,
      { uuid: string; managerData: Partial<ManagerFormData> }
    >({
      query: ({ uuid, managerData }) => ({
        url: `/managers/${uuid}`,
        method: "PUT",
        body: managerData,
      }),
      invalidatesTags: ["Manager"],
    }),

    deleteManager: builder.mutation<ApiResponse<null>, string>({
      query: (uuid) => ({
        url: `/managers/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Manager"],
    }),

    getCurrentManager: builder.query<ApiResponse<Manager>, void>({
      query: () => `/managers/current`,
      providesTags: ["Manager"],
    }),

    importManagersCsv: builder.mutation<
      ImportResult,
      FormData
    >({
      query: (formData) => ({
        url: "/managers/import/csv",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Manager"],
    }),
  }),
});

export const {
  useGetManagersQuery,
  useLazyGetManagersQuery,
  useGetManagerQuery,
  useCreateManagerMutation,
  useUpdateManagerMutation,
  useDeleteManagerMutation,
  useGetCurrentManagerQuery,
  useImportManagersCsvMutation,
} = apiManager;
