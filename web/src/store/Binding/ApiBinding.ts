// src/store/Binding/ApiBinding.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  Binding,
  CreateBindingRequest,
  UpdateBindingRequest,
  ApiResponse,
  GetBindingsParams,
  Teacher,
  Subject,
  Class,
  Room,
  Rule,
  TypeClassBand
} from "@/type/Binding/TypeBinding";
import i18next from "i18next";

// Interface for getting entities with pagination and filtering
export interface GetEntityParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  keyword?: string;
  orgId?: number | null;
  planSettingsId?: number | null;
}

// Type for query parameters
interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * Gets the current organization information from localStorage
 * @returns Organization information including both UUID and ID
 */
export const getCurrentOrganizationInfo = (): { uuid: string | null; id: number | null; name?: string | null; address?: string | null; district?: string | null; } => {
  const uuid = localStorage.getItem("selectedOrganizationUuid");
  const idStr = localStorage.getItem("selectedOrganizationId");
  const name = localStorage.getItem("selectedOrganizationName");
  const address = localStorage.getItem("selectedOrganizationAddress");
  const district = localStorage.getItem("selectedOrganizationDistrict");
  const id = idStr ? parseInt(idStr, 10) : null;
  
  return { uuid, id, name, address, district };
};

/**
 * Build query parameters object, removing undefined values
 */
const buildQueryParams = (params: Record<string, any>): QueryParams => {
  const queryParams: QueryParams = {};
  
  // Add params only if they are defined
  Object.entries(params).forEach(([key, value]) => {
    if(value !== undefined && value !== null) {
      queryParams[key] = value;
    }
  });
  
  return queryParams;
};

/**
 * Custom error handling to ensure backend errors are properly passed to components
 */
const customErrorHandler = async (response: Response) => {
  if(!response.ok) {
    // Parse the error response from the server
    const errorData = await response.json();
    console.log("Backend error response:", errorData);
    // Return the error in the RTK Query error format
    return { error: errorData };
  }
  return response.json();
};

export const apiBinding = createApi({
  reducerPath: "bindingApi",
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
    responseHandler: customErrorHandler,
  }),
  tagTypes: ["Binding", "Teacher", "Subject", "Class", "Room", "Rule", "ClassBand"],
  endpoints: (builder) => ({
    // Get all bindings with pagination and filtering
    getBindings: builder.query<ApiResponse<Binding[]>, GetBindingsParams>({
      query: (params = {}) => {
        // Get current organization ID if not provided
        const { id: orgId } = getCurrentOrganizationInfo();
        
        const queryParams = buildQueryParams({
          page: params.page,
          size: params.size,
          sortBy: params.sortBy,
          sortDirection: params.sortDirection || "asc",
          keyword: params.keyword,
          orgId: params.orgId || orgId, // Always include orgId
          teacherUuid: params.teacherUuid,
          planSettingsId: params.planSettingsId
        });

        return {
          url: 'bindings',
          params: queryParams,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ uuid }) => ({ 
                type: 'Binding' as const, 
                id: uuid 
              })),
              { type: 'Binding', id: 'LIST' }
            ]
          : [{ type: 'Binding', id: 'LIST' }],
    }),

    // Get a single binding by UUID
    getBinding: builder.query<ApiResponse<Binding>, string>({
      query: (uuid) => ({
        url: `bindings/${uuid}`,
        headers: {
          Authorization: localStorage.getItem("authToken") || ""
        }
      }),
      providesTags: (_result, _error, uuid) => [{ type: "Binding", id: uuid }],
    }),

    // Create a new binding
    createBinding: builder.mutation<ApiResponse<Binding>, CreateBindingRequest>({
      query: (data) => ({
        url: 'bindings',
        method: 'POST',
        body: {
          organizationUuid: data.organizationUuid,
          teacherUuid: data.teacherUuid,
          subjectUuid: data.subjectUuid,
          classUuid: data.classUuid,
          classBandUuid: data.classBandUuid,
          roomUuid: data.roomUuid,
          periodsPerWeek: data.periodsPerWeek || 1,
          isFixed: data.isFixed || false,
          priority: data.priority || 0,
          notes: data.notes,
          statusId: data.statusId || 1,
          ruleUuids: data.ruleUuids,
          planSettingsId: data.planSettingsId
        },
        headers: {
          Authorization: localStorage.getItem("authToken") || ""
        }
      }),
      // Invalidate binding cache on create
      invalidatesTags: [
        { type: "Binding", id: "LIST" }
      ]
    }),

    // Update a binding
    updateBinding: builder.mutation<ApiResponse<Binding>, UpdateBindingRequest>({
      query: ({ uuid, ...data }) => ({
        url: `bindings/${uuid}`,
        method: 'PUT',
        body: {
          teacherUuid: data.teacherUuid,
          subjectUuid: data.subjectUuid,
          classUuid: data.classUuid,
          classBandUuid: data.classBandUuid,
          roomUuid: data.roomUuid,
          periodsPerWeek: data.periodsPerWeek,
          isFixed: data.isFixed,
          priority: data.priority,
          notes: data.notes,
          statusId: data.statusId,
          ruleUuids: data.ruleUuids,
          planSettingsId: data.planSettingsId
        },
        headers: {
          Authorization: localStorage.getItem("authToken") || ""
        }
      }),
      // Invalidate binding cache on update
      invalidatesTags: (_result, _error, { uuid }) => [
        { type: "Binding", id: uuid },
        { type: "Binding", id: "LIST" }
      ]
    }),

    // Delete a binding
    deleteBinding: builder.mutation<ApiResponse<void>, string>({
      query: (uuid) => ({
        url: `bindings/${uuid}`,
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("authToken") || ""
        }
      }),
      // Invalidate binding cache on delete
      invalidatesTags: [
        { type: "Binding", id: "LIST" }
      ],
    }),

    // Get teachers with pagination and filtering
    getTeachers: builder.query<ApiResponse<Teacher[]>, GetEntityParams>({
      query: (params = {}) => {
        // Get current organization ID if not provided
        const { id: orgId } = getCurrentOrganizationInfo();
        
        const queryParams = buildQueryParams({
          page: params.page,
          size: params.size,
          sortBy: params.sortBy,
          sortDirection: params.sortDirection || "asc",
          keyword: params.keyword,
          orgId: params.orgId || orgId, // Always include orgId
          planSettingsId: params.planSettingsId // Include planSettingsId if available
        });

        return {
          url: 'teachers',
          params: queryParams,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ uuid }) => ({ 
                type: 'Teacher' as const, 
                id: uuid 
              })),
              { type: 'Teacher', id: 'LIST' }
            ]
          : [{ type: 'Teacher', id: 'LIST' }],
    }),

    // Get subjects with pagination and filtering
    getSubjects: builder.query<ApiResponse<Subject[]>, GetEntityParams>({
      query: (params = {}) => {
        // Get current organization ID if not provided
        const { id: orgId } = getCurrentOrganizationInfo();
        
        const queryParams = buildQueryParams({
          page: params.page,
          size: params.size,
          sortBy: params.sortBy,
          sortDirection: params.sortDirection || "asc",
          keyword: params.keyword,
          orgId: params.orgId || orgId, // Always include orgId
          planSettingsId: params.planSettingsId // Include planSettingsId if available
        });

        return {
          url: 'subjects',
          params: queryParams,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ uuid }) => ({ 
                type: 'Subject' as const, 
                id: uuid 
              })),
              { type: 'Subject', id: 'LIST' }
            ]
          : [{ type: 'Subject', id: 'LIST' }],
    }),

    // Get classes with pagination and filtering
    getClasses: builder.query<ApiResponse<Class[]>, GetEntityParams>({
      query: (params = {}) => {
        // Get current organization ID if not provided
        const { id: orgId } = getCurrentOrganizationInfo();
        
        const queryParams = buildQueryParams({
          page: params.page,
          size: params.size,
          sortBy: params.sortBy,
          sortDirection: params.sortDirection || "asc",
          keyword: params.keyword,
          orgId: params.orgId || orgId, // Always include orgId
          planSettingsId: params.planSettingsId // Include planSettingsId if available
        });

        return {
          url: 'classes',
          params: queryParams,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ uuid }) => ({ 
                type: 'Class' as const, 
                id: uuid 
              })),
              { type: 'Class', id: 'LIST' }
            ]
          : [{ type: 'Class', id: 'LIST' }],
    }),

    // Get rooms with pagination and filtering
    getRooms: builder.query<ApiResponse<Room[]>, GetEntityParams>({
      query: (params = {}) => {
        // Get current organization ID if not provided
        const { id: orgId } = getCurrentOrganizationInfo();
        
        const queryParams = buildQueryParams({
          page: params.page,
          size: params.size,
          sortBy: params.sortBy,
          sortDirection: params.sortDirection || "asc",
          keyword: params.keyword,
          orgId: params.orgId || orgId, // Always include orgId
          planSettingsId: params.planSettingsId // Include planSettingsId if available
        });

        return {
          url: 'rooms',
          params: queryParams,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ uuid }) => ({ 
                type: 'Room' as const, 
                id: uuid 
              })),
              { type: 'Room', id: 'LIST' }
            ]
          : [{ type: 'Room', id: 'LIST' }],
    }),

    // Get teacher bindings
    getTeacherBindings: builder.query<ApiResponse<Binding[]>, { teacherUuid: string, orgId?: number }>({
      query: (params) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        const orgId = params.orgId || currentOrgId;
        
        return {
          url: `bindings/teachers/${params.teacherUuid}`,
          params: orgId ? { orgId } : undefined,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (_result, _error, { teacherUuid }) => [
        { type: "Binding", id: `teacher-${teacherUuid}` },
        { type: "Binding", id: "LIST" },
      ],
    }),

    // Get class bindings
    getClassBindings: builder.query<ApiResponse<Binding[]>, { classUuid: string, orgId?: number }>({
      query: (params) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        const orgId = params.orgId || currentOrgId;
        
        return {
          url: `bindings/classes/${params.classUuid}`,
          params: orgId ? { orgId } : undefined,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (_result, _error, { classUuid }) => [
        { type: "Binding", id: `class-${classUuid}` },
        { type: "Binding", id: "LIST" },
      ],
    }),

    // Get room bindings
    getRoomBindings: builder.query<ApiResponse<Binding[]>, { roomUuid: string, orgId?: number }>({
      query: (params) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        const orgId = params.orgId || currentOrgId;
        
        return {
          url: `bindings/rooms/${params.roomUuid}`,
          params: orgId ? { orgId } : undefined,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (_result, _error, { roomUuid }) => [
        { type: "Binding", id: `room-${roomUuid}` },
        { type: "Binding", id: "LIST" },
      ],
    }),

    // Get subject bindings
    getSubjectBindings: builder.query<ApiResponse<Binding[]>, { subjectUuid: string, orgId?: number }>({
      query: (params) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        const orgId = params.orgId || currentOrgId;
        
        return {
          url: `bindings/subjects/${params.subjectUuid}`,
          params: orgId ? { orgId } : undefined,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (_result, _error, { subjectUuid }) => [
        { type: "Binding", id: `subject-${subjectUuid}` },
        { type: "Binding", id: "LIST" },
      ],
    }),

    // Get rules with pagination and filtering
    getRules: builder.query<ApiResponse<Rule[]>, GetEntityParams>({
      query: (params = {}) => {
        // Get current organization ID if not provided
        const { id: orgId } = getCurrentOrganizationInfo();
        
        const queryParams = buildQueryParams({
          page: params.page,
          size: params.size,
          sortBy: params.sortBy,
          sortDirection: params.sortDirection || "asc",
          keyword: params.keyword,
          orgId: params.orgId || orgId // Always include orgId
        });

        return {
          url: 'rules',
          params: queryParams,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ uuid }) => ({ 
                type: 'Rule' as const, 
                id: uuid 
              })),
              { type: 'Rule', id: 'LIST' }
            ]
          : [{ type: 'Rule', id: 'LIST' }],
    }),

    // Add rule to binding
    addRuleToBinding: builder.mutation<ApiResponse<Binding>, { bindingUuid: string, ruleUuid: string }>({
      query: ({ bindingUuid, ruleUuid }) => ({
        url: `bindings/${bindingUuid}/rules/${ruleUuid}`,
        method: 'PUT',
        headers: {
          Authorization: localStorage.getItem("authToken") || ""
        }
      }),
      invalidatesTags: (_result, _error, { bindingUuid }) => [
        { type: "Binding", id: bindingUuid },
        { type: "Binding", id: "LIST" }
      ]
    }),

    // Remove rule from binding
    removeRuleFromBinding: builder.mutation<ApiResponse<Binding>, { bindingUuid: string, ruleUuid: string }>({
      query: ({ bindingUuid, ruleUuid }) => ({
        url: `bindings/${bindingUuid}/rules/${ruleUuid}`,
        method: 'DELETE',
        headers: {
          Authorization: localStorage.getItem("authToken") || ""
        }
      }),
      invalidatesTags: (_result, _error, { bindingUuid }) => [
        { type: "Binding", id: bindingUuid },
        { type: "Binding", id: "LIST" }
      ]
    }),

    // Generate timetable based on bindings
    generateTimetable: builder.mutation<ApiResponse<any>, number | undefined>({
      query: (orgId) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        
        return {
          url: 'timetable/generate',
          method: 'POST',
          body: { organizationId: orgId || currentOrgId },
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      invalidatesTags: ["Binding"]
    }),

    // Export timetable
    exportTimetable: builder.query<Blob, { format: 'pdf' | 'excel' | 'csv', orgId?: number }>({
      query: ({ format, orgId }) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        
        return {
          url: `timetable/export/${format}`,
          params: { orgId: orgId || currentOrgId },
          responseHandler: response => response.blob(),
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
    }),

    // Import bindings
    importBindings: builder.mutation<ApiResponse<any>, { formData: FormData, orgId?: number }>({
      query: ({ formData, orgId }) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        
        // Add orgId to formData if available
        if(orgId || currentOrgId) {
          formData.append('orgId', String(orgId || currentOrgId));
        }
        
        return {
          url: 'bindings/import',
          method: 'POST',
          body: formData,
          formData: true,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      invalidatesTags: ["Binding"]
    }),

    // Get class bands with pagination and filtering
    getClassBands: builder.query<ApiResponse<TypeClassBand[]>, GetEntityParams>({
      query: (params = {}) => {
        // Get current organization ID if not provided
        const { id: orgId } = getCurrentOrganizationInfo();
        
        const queryParams = buildQueryParams({
          page: params.page,
          size: params.size,
          sortBy: params.sortBy,
          sortDirection: params.sortDirection || "asc",
          keyword: params.keyword,
          orgId: params.orgId || orgId, // Always include orgId
          planSettingsId: params.planSettingsId // Include planSettingsId if available
        });

        return {
          url: 'class-bands',
          params: queryParams,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result
          ? [
              ...result.data.map(({ uuid }) => ({ 
                type: 'ClassBand' as const, 
                id: uuid 
              })),
              { type: 'ClassBand', id: 'LIST' }
            ]
          : [{ type: 'ClassBand', id: 'LIST' }],
    }),
    
    // Get class band bindings
    getClassBandBindings: builder.query<ApiResponse<Binding[]>, { classBandUuid: string, orgId?: number }>({
      query: (params) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        const orgId = params.orgId || currentOrgId;
        
        return {
          url: `bindings/class-bands/${params.classBandUuid}`,
          params: orgId ? { orgId } : undefined,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (_result, _error, { classBandUuid }) => [
        { type: "Binding", id: `class-band-${classBandUuid}` },
        { type: "Binding", id: "LIST" },
      ],
    }),

    // Get classes by teacher ID
    getClassesByTeacherId: builder.query<ApiResponse<Class[]>, { teacherId: string | number, orgId?: number }>({
      query: ({ teacherId, orgId }) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        
        return {
          url: `bindings/teachers/${teacherId}/classes`,
          params: orgId ? { orgId } : currentOrgId ? { orgId: currentOrgId } : undefined,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Class' as const, id })),
              { type: 'Class', id: 'LIST' }
            ]
          : [{ type: 'Class', id: 'LIST' }],
    }),

    // Get classes by room ID
    getClassesByRoomId: builder.query<ApiResponse<Class[]>, { roomId: string | number, orgId?: number }>({
      query: ({ roomId, orgId }) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        
        return {
          url: `bindings/rooms/${roomId}/classes`,
          params: orgId ? { orgId } : currentOrgId ? { orgId: currentOrgId } : undefined,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Class' as const, id })),
              { type: 'Class', id: 'LIST' }
            ]
          : [{ type: 'Class', id: 'LIST' }],
    }),

    // Get classes by subject ID
    getClassesBySubjectId: builder.query<ApiResponse<Class[]>, { subjectId: string | number, orgId?: number }>({
      query: ({ subjectId, orgId }) => {
        // Get current organization ID if not provided
        const { id: currentOrgId } = getCurrentOrganizationInfo();
        
        return {
          url: `bindings/subjects/${subjectId}/classes`,
          params: orgId ? { orgId } : currentOrgId ? { orgId: currentOrgId } : undefined,
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      providesTags: (result) => 
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Class' as const, id })),
              { type: 'Class', id: 'LIST' }
            ]
          : [{ type: 'Class', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetBindingsQuery,
  useLazyGetBindingsQuery,
  useGetBindingQuery,
  useCreateBindingMutation,
  useUpdateBindingMutation,
  useDeleteBindingMutation,
  useGetTeachersQuery,
  useLazyGetTeachersQuery,
  useGetSubjectsQuery,
  useLazyGetSubjectsQuery,
  useGetClassesQuery,
  useLazyGetClassesQuery,
  useGetRoomsQuery,
  useLazyGetRoomsQuery,
  useGetTeacherBindingsQuery,
  useGetClassBindingsQuery,
  useGetRoomBindingsQuery,
  useGetSubjectBindingsQuery,
  useGetRulesQuery,
  useLazyGetRulesQuery,
  useAddRuleToBindingMutation,
  useRemoveRuleFromBindingMutation,
  useGenerateTimetableMutation,
  useLazyExportTimetableQuery,
  useImportBindingsMutation,
  useGetClassBandsQuery,
  useGetClassBandBindingsQuery,
  useGetClassesByTeacherIdQuery,
  useLazyGetClassesByTeacherIdQuery,
  useGetClassesByRoomIdQuery,
  useLazyGetClassesByRoomIdQuery,
  useGetClassesBySubjectIdQuery,
  useLazyGetClassesBySubjectIdQuery,
} = apiBinding;
