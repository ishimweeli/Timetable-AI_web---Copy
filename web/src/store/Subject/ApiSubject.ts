import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Subject, SubjectFormData, ApiResponse } from "@/type/subject";
import { ImportResult } from "@/component/Common/CsvImport";
import { i18n } from "@/i18n";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiSubject = createApi({
  reducerPath: "subjectApi",
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
  tagTypes: ["Subject"],
  endpoints: (builder) => ({
    getSubjects: builder.query<
      ApiResponse<Subject[]>,
      {
        page?: number;
        size?: number;
        keyword?: string;
        sortBy?: string;
        sortDirection?: string;
        orgId?: number | null;
      }
    >({
      query: (params) => ({
        url: "subjects",
        params: {
          page: params.page !== undefined ? params.page : 0,
          size: params.size || 10,
          keyword: params.keyword,
          sortBy: params.sortBy || "name",
          sortDirection: params.sortDirection || "asc",
          orgId: params.orgId,
        },
      }),
      providesTags: ["Subject"],
    }),

    getSubject: builder.query<ApiResponse<Subject>, string>({
      query: (uuid) => `/subjects/${uuid}`,
      providesTags: ["Subject"],
    }),

    createSubject: builder.mutation<ApiResponse<Subject>, SubjectFormData>({
      query: (subjectData) => ({
        url: "/subjects",
        method: "POST",
        body: subjectData,
      }),
      invalidatesTags: ["Subject"],
    }),

    updateSubject: builder.mutation<
      ApiResponse<Subject>,
      { uuid: string; data: SubjectFormData }
    >({
      query: ({ uuid, data }) => ({
        url: `/subjects/${uuid}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Subject"],
    }),

    deleteSubject: builder.mutation<ApiResponse<{}>, string>({
      query: (uuid) => ({
        url: `/subjects/${uuid}/soft-delete`,
        method: "PUT",
      }),
      invalidatesTags: ["Subject"],
    }),

    importSubjectsCsv: builder.mutation<
      ImportResult,
      { file: File; options: { skipHeaderRow: boolean; organizationId?: number | null } }
    >({
      query: ({ file, options }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("skipHeaderRow", options.skipHeaderRow.toString());
        
        if(options.organizationId !== undefined && options.organizationId !== null) {
          formData.append("organizationId", options.organizationId.toString());
        }
        
        return {
          url: "subjects/import/csv",
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
      invalidatesTags: ["Subject"],
    }),
  }),
});

export const {
  useGetSubjectsQuery,
  useLazyGetSubjectsQuery,
  useGetSubjectQuery,
  useLazyGetSubjectQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useImportSubjectsCsvMutation,
} = apiSubject; 
