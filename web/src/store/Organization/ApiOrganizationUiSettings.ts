import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TypeOrganizationUiSettings } from '@/type/Organization/TypeOrganizationUiSettings';

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
  timestamp: string;
}

export const apiOrganizationUiSettings = createApi({
  reducerPath: 'apiOrganizationUiSettings',
  baseQuery: fetchBaseQuery({ 
    baseUrl: import.meta.env.VITE_API_URL || '/api/v1',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken');
      if(token) {
        headers.set('Authorization', token);
      }
      return headers;
    },
  }),
  tagTypes: ['OrganizationUiSettings'],
  endpoints: (builder) => ({
    getOrganizationUiSettings: builder.query<ApiResponse<TypeOrganizationUiSettings>, number>({
      query: (organizationId) => `/settings/organization/${organizationId}`,
      providesTags: ['OrganizationUiSettings'],
    }),
    
    createOrUpdateOrganizationUiSettings: builder.mutation<ApiResponse<TypeOrganizationUiSettings>, TypeOrganizationUiSettings>({
      query: (settings) => ({
        url: '/settings/organization',
        method: 'POST',
        body: settings,
      }),
      invalidatesTags: ['OrganizationUiSettings'],
    }),
  }),
});

export const {
  useGetOrganizationUiSettingsQuery,
  useCreateOrUpdateOrganizationUiSettingsMutation,
} = apiOrganizationUiSettings; 
