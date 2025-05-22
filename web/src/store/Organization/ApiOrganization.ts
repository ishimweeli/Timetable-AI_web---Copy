import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  ApiResponse,
  TypeOrganization,
  OrganizationFormData,
  ImportResult,
} from "@/type/Organization/TypeOrganization.ts";
import { i18n } from "@/i18n";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiOrganization = createApi({
  reducerPath: "organizationApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    prepareHeaders: (headers) => {
      const currentLanguage = i18n.getCurrentLanguage();
      const token = localStorage.getItem("authToken");

      if(token) {
        headers.set("Authorization", token);
      }

      headers.set("Accept-Language", currentLanguage);
      return headers;
    },
  }),
  tagTypes: ["Organization"],
  endpoints: (builder) => ({
    getOrganizations: builder.query<
      ApiResponse<TypeOrganization[]>,
      {
        page?: number;
        size: number;
        status?: number;
        search?: string;
      }
    >({
      query: (params) => ({
        url: "organizations",
        params: {
          page: params.page !== undefined ? params.page : 0,
          size: params.size,
          status: params.status,
          search: params.search,
        },
      }),
      providesTags: ["Organization"],
    }),

    getOrganization: builder.query<ApiResponse<TypeOrganization>, string>({
      query: (uuid) => `/organizations/${uuid}`,
      providesTags: ["Organization"],
    }),

    searchOrganizations: builder.query<ApiResponse<TypeOrganization[]>, string>(
      {
        query: (keyword) => `/organizations/search?keyword=${keyword}`,
        providesTags: ["Organization"],
      },
    ),

    getOrganizationsByStatus: builder.query<
      ApiResponse<TypeOrganization[]>,
      { status: number; page: number; size: number }
    >({
      query: ({ status, page, size }) =>
        `/organizations/status?status=${status}&page=${page}&size=${size}`,
      providesTags: ["Organization"],
    }),

    getOrganizationProjections: builder.query<
      ApiResponse<TypeOrganization[]>,
      { page: number; size: number }
    >({
      query: ({ page, size }) =>
        `/organizations/projections?page=${page}&size=${size}`,
      providesTags: ["Organization"],
    }),

    checkEmailExists: builder.query<
      ApiResponse<{ exists: boolean }>,
      { email: string; excludeUuid?: string }
    >({
      query: ({ email, excludeUuid }) => ({
        url: "/organizations/check-email",
        params: { email, excludeUuid },
      }),
    }),

    createOrganization: builder.mutation<
      ApiResponse<TypeOrganization>,
      OrganizationFormData
    >({
      query: (organizationData) => ({
        url: "/organizations",
        method: "POST",
        body: organizationData,
      }),
      invalidatesTags: ["Organization"],
    }),

    updateOrganization: builder.mutation<
      ApiResponse<TypeOrganization>,
      { uuid: string; organizationData: OrganizationFormData }
    >({
      query: ({ uuid, organizationData }) => ({
        url: `/organizations/${uuid}`,
        method: "PUT",
        body: organizationData,
      }),
      invalidatesTags: ["Organization"],
    }),

    deleteOrganization: builder.mutation<ApiResponse<{}>, string>({
      query: (uuid) => ({
        url: `/organizations/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Organization"],
    }),

    importOrganizationsCsv: builder.mutation<
      ImportResult,
      { file: File; options: { skipHeaderRow: boolean; organizationId?: number | null } }
    >({
      query: ({ file, options }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("skipHeaderRow", options.skipHeaderRow.toString());
        
        if(options.organizationId) {
          formData.append("organizationId", options.organizationId.toString());
        }
        
        return {
          url: "organizations/import/csv",
          method: "POST",
          body: formData,
          prepareHeaders: (headers) => {
            const token = localStorage.getItem("authToken");
            if(token) {
              headers.set("Authorization", token);
            }
            const currentLanguage = i18n.getCurrentLanguage();
            headers.set("Accept-Language", currentLanguage);
            headers.delete("Content-Type");
            return headers;
          },
        };
      },
      invalidatesTags: ["Organization"],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useLazyGetOrganizationsQuery,
  useGetOrganizationQuery,
  useLazyGetOrganizationQuery,
  useSearchOrganizationsQuery,
  useGetOrganizationsByStatusQuery,
  useGetOrganizationProjectionsQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useLazyCheckEmailExistsQuery,
  useImportOrganizationsCsvMutation,
} = apiOrganization;
