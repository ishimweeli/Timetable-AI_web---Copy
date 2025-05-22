import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiResponse, WorkloadItem } from '@/type/Workload/TypeWorkload';

export interface BindingsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  keyword?: string;
  orgId?: number | null;
  teacherUuid?: string;
  classUuid?: string;
  subjectUuid?: string;
  roomUuid?: string;
  classBandUuid?: string;
  planSettingsId?: number;
}

export const workloadApi = createApi({
  reducerPath: 'workloadApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if(token) {
        headers.set('Authorization', `${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Bindings', 'TeacherWorkload', 'ClassWorkload', 'SubjectWorkload', 'RoomWorkload', 'ClassBandWorkload'],
  endpoints: (builder) => ({
    // Main endpoint to get all bindings
    getAllBindings: builder.query<ApiResponse<WorkloadItem[]>, BindingsParams>({
      query: (params) => {
        // Set reasonable defaults for pagination
        const queryParams = {
          page: params.page ?? 0,
          size: params.size ?? 1000,
          sortBy: params.sortBy ?? 'teacher_name',
          sortDirection: params.sortDirection ?? 'asc',
          keyword: params.keyword ?? '',
          ...params
        };
        
        return {
          url: '/bindings',
          params: queryParams,
        };
      },
      providesTags: (result) => 
        result
          ? [
              // Use ids from the results to tag individual resources
              ...(result.data || []).map(item => ({
                type: 'Bindings' as const, 
                id: item.uuid
              })),
              // Tag the entire list
              'Bindings'
            ]
          : ['Bindings'],
    }),
    
    // Specific workload queries using the proper endpoints
    getTeacherWorkload: builder.query<ApiResponse<WorkloadItem[]>, { teacherUuid: string, planSettingsId?: number }>({
      query: ({ teacherUuid, planSettingsId }) => {
        let url = `/bindings/teachers/${teacherUuid}`;
        let params: any = {};
        if (planSettingsId !== undefined && planSettingsId !== null) {
          params.planSettingsId = planSettingsId;
        }
        return {
          url,
          params,
        };
      },
      providesTags: (result, error, { teacherUuid }) => [
        { type: 'TeacherWorkload', id: teacherUuid },
        'Bindings'
      ],
    }),
    
    getClassWorkload: builder.query<ApiResponse<WorkloadItem[]>, { classUuid: string, planSettingsId?: number }>({
      query: ({ classUuid, planSettingsId }) => {
        let url = `/bindings/classes/${classUuid}`;
        let params: any = {};
        if (planSettingsId !== undefined && planSettingsId !== null) {
          params.planSettingsId = planSettingsId;
        }
        return { url, params };
      },
      providesTags: (result, error, { classUuid }) => [
        { type: 'ClassWorkload', id: classUuid },
        'Bindings'
      ],
    }),
    
    getSubjectWorkload: builder.query<ApiResponse<WorkloadItem[]>, { subjectUuid: string, planSettingsId?: number }>({
      query: ({ subjectUuid, planSettingsId }) => {
        let url = `/bindings/subjects/${subjectUuid}`;
        let params: any = {};
        if (planSettingsId !== undefined && planSettingsId !== null) {
          params.planSettingsId = planSettingsId;
        }
        return { url, params };
      },
      providesTags: (result, error, { subjectUuid }) => [
        { type: 'SubjectWorkload', id: subjectUuid },
        'Bindings'
      ],
    }),
    
    getRoomWorkload: builder.query<ApiResponse<WorkloadItem[]>, { roomUuid: string, planSettingsId?: number }>({
      query: ({ roomUuid, planSettingsId }) => {
        let url = `/bindings/rooms/${roomUuid}`;
        let params: any = {};
        if (planSettingsId !== undefined && planSettingsId !== null) {
          params.planSettingsId = planSettingsId;
        }
        return { url, params };
      },
      providesTags: (result, error, { roomUuid }) => [
        { type: 'RoomWorkload', id: roomUuid },
        'Bindings'
      ],
    }),
    
    getBindingsByStatus: builder.query<ApiResponse<WorkloadItem[]>, { statusId: number, page?: number, size?: number }>({
      query: ({ statusId, page, size }) => {
        let url = `/bindings/status/${statusId}`;
        let params = {};
        
        if(page !== undefined) {
          params = { ...params, page };
        }
        
        if(size !== undefined) {
          params = { ...params, size };
        }
        
        return {
          url,
          params
        };
      },
      providesTags: ['Bindings'],
    }),
    
    searchBindings: builder.query<ApiResponse<WorkloadItem[]>, any>({
      query: (params) => ({
        url: '/bindings/search',
        params,
      }),
      providesTags: ['Bindings'],
    }),
    
    getClassBandWorkload: builder.query<ApiResponse<WorkloadItem[]>, { classBandUuid: string, planSettingsId?: number }>({
      query: ({ classBandUuid, planSettingsId }) => {
        let url = `/bindings/class-bands/${classBandUuid}`;
        let params: any = {};
        if (planSettingsId !== undefined && planSettingsId !== null) {
          params.planSettingsId = planSettingsId;
        }
        return { url, params };
      },
      providesTags: (result, error, { classBandUuid }) => [
        { type: 'ClassBandWorkload', id: classBandUuid },
        'Bindings'
      ],
    }),
  }),
});

export const {
  useGetAllBindingsQuery,
  useGetTeacherWorkloadQuery,
  useGetClassWorkloadQuery,
  useGetSubjectWorkloadQuery,
  useGetRoomWorkloadQuery,
  useGetBindingsByStatusQuery,
  useSearchBindingsQuery,
  useGetClassBandWorkloadQuery,
} = workloadApi;
