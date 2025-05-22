import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, Student, StudentRequest } from "@/type/student/student";
import { ImportResult } from "@/component/Common/CsvImport";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface GetStudentsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  keyword?: string;
  orgId?: number | null;
}

// Interface for CSV import options
export interface ImportCsvOptions {
  skipHeaderRow: boolean;
  organizationId?: number | null;
}

export const apiStudent = createApi({
  reducerPath: "apiStudent",
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
  tagTypes: ["Student"],
  endpoints: (builder) => ({
    getStudents: builder.query<ApiResponse<Student[]>, GetStudentsParams>({
      query: (params = {}) => {
        const {
          page,
          size,
          sortBy,
          sortDirection = "asc",
          keyword,
          orgId,
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
        if(sortDirection) {
          queryParams.push(`sortDirection=${sortDirection}`);
        }

        if(keyword) {
          queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
        }

        if(orgId) {
          queryParams.push(`orgId=${orgId}`);
        }

        // Construct the final query string
        const queryString = queryParams.length
          ? `?${queryParams.join("&")}`
          : "";

        return `students${queryString}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ uuid }) => ({
                type: "Student" as const,
                id: uuid,
              })),
              { type: "Student", id: "LIST" },
            ]
          : [{ type: "Student", id: "LIST" }],
    }),

    getStudentByUuid: builder.query<ApiResponse<Student>, string>({
      query: (uuid) => ({
        url: `/students/${uuid}`,
        headers: {
          Authorization: `${localStorage.getItem("authToken")}`,
        },
      }),
      providesTags: (result, error, uuid) => [{ type: "Student", id: uuid }],
    }),

    getStudentsByDepartment: builder.query<
      ApiResponse<Student[]>,
      {
        department: string;
        organizationId: number;
        page?: number;
        size?: number;
      }
    >({
      query: ({ department, organizationId, page = 0, size = 10 }) => ({
        url: `/students/department/${department}/organization/${organizationId}`,
        params: { page, size },
        headers: {
          Authorization: `${localStorage.getItem("authToken")}`,
        },
      }),
      providesTags: [{ type: "Student", id: "LIST" }],
    }),

    createStudent: builder.mutation<ApiResponse<Student>, StudentRequest>({
      query: (student) => ({
        url: "/students",
        method: "POST",
        body: student,
        headers: {
          Authorization: `${localStorage.getItem("authToken")}`,
        },
      }),
      invalidatesTags: [{ type: "Student", id: "LIST" }],
    }),

    updateStudent: builder.mutation<
      ApiResponse<Student>,
      { uuid: string; student: StudentRequest }
    >({
      query: ({ uuid, student }) => ({
        url: `/students/${uuid}`,
        method: "PUT",
        body: student,
        headers: {
          Authorization: `${localStorage.getItem("authToken")}`,
        },
      }),
      invalidatesTags: (result, error, { uuid }) => [
        { type: "Student", id: uuid },
        { type: "Student", id: "LIST" },
      ],
    }),

    deleteStudent: builder.mutation<ApiResponse<void>, string>({
      query: (uuid) => ({
        url: `/students/${uuid}/soft-delete`,
        method: "PUT",
        headers: {
          Authorization: `${localStorage.getItem("authToken")}`,
        },
      }),
      invalidatesTags: [{ type: "Student", id: "LIST" }],
    }),

    // Additional endpoint to get organizations
    getOrganizations: builder.query<ApiResponse<any[]>, void>({
      query: () => ({
        url: "/organizations",
        headers: {
          Authorization: `${localStorage.getItem("authToken")}`,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Student" as const,
                id: `ORG_${id}`,
              })),
              { type: "Student", id: "ORGANIZATION_LIST" },
            ]
          : [{ type: "Student", id: "ORGANIZATION_LIST" }],
    }),

    // New endpoint for CSV import
    importStudentsCsv: builder.mutation<
      ImportResult,
      { file: File; options: ImportCsvOptions }
    >({
      query: ({ file, options }) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("skipHeader", String(options.skipHeaderRow));
        
        if(options.organizationId) {
          formData.append("organizationId", String(options.organizationId));
        }
        
        return {
          url: "/students/import/csv",
          method: "POST",
          body: formData,
          formData: true,
        };
      },
      // Transform the error response to be more helpful for displaying to users
      transformErrorResponse: (response) => {
        // If the API returned a structured error response with JSON data
        if(response.status === 400 && response.data) {
          return {
            status: response.status,
            data: response.data
          };
        }
        
        // For other types of errors
        return {
          status: response.status,
          data: {
            success: false,
            message: "Failed to import students. Please try again.",
            data: {
              totalProcessed: 0,
              successCount: 0,
              errorCount: 0,
              errors: []
            }
          }
        };
      },
      invalidatesTags: [{ type: "Student", id: "LIST" }],
    }),

    assignStudentsToClass: builder.mutation<ApiResponse<Student[]>, { studentUuids: string[], classId: number | string }>({
      query: ({ studentUuids, classId }) => ({
        url: `/students/assign-class/${classId}`,
        method: "PUT",
        body: studentUuids,
        headers: {
          Authorization: `${localStorage.getItem("authToken")}`,
        },
      }),
      invalidatesTags: [{ type: "Student", id: "LIST" }],
    }),
  }),
});

export const {
  useGetStudentsQuery,
  useLazyGetStudentsQuery,
  useGetStudentByUuidQuery,
  useGetStudentsByDepartmentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetOrganizationsQuery,
  useImportStudentsCsvMutation,
  useAssignStudentsToClassMutation,
} = apiStudent;
