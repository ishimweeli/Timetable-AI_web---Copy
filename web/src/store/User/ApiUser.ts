import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserProfile } from "@/type/User/TypeUser";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiUser = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token =
        (getState() as any).auth.token || localStorage.getItem("authToken");
      if(token) {
        headers.set("Authorization", token);
      }
      return headers;
    },
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getCurrentUser: builder.query<UserProfile, void>({
      query: () => `/api/v1/users/current`,
      providesTags: ["User"],
    }),
    updateUserProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: (data) => ({
        url: `/api/v1/users/profile`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateUserSettings: builder.mutation<void, any>({
      query: (data) => ({
        url: `/api/v1/users/settings`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useUpdateUserSettingsMutation,
} = apiUser;
