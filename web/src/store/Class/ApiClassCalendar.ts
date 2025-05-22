import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Period, PreferenceType } from "@/type/Calendar/TypeCalendar";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const classSchedulePreferenceApi = createApi({
  reducerPath: "classSchedulePreferenceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1/`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if(token) {
        headers.set("Authorization", token);
      }
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["ClassPreferences"],
  endpoints: (builder) => ({
    getClassPreferences: builder.query<any, string>({
      query: (classUuid) => `classes/${classUuid}/preferences`,
      providesTags: ["ClassPreferences"],
    }),

    createClassSchedulePreference: builder.mutation<
      any,
      {
        classUuid: string;
        scheduleUuid: string;
        preferenceType: PreferenceType;
        preferenceValue: boolean;
      }
    >({
      query: ({
        classUuid,
        scheduleUuid,
        preferenceType,
        preferenceValue,
      }) => ({
        url: `classes/${classUuid}/schedules/${scheduleUuid}/preferences`,
        method: "POST",
        body: { preferenceType, preferenceValue },
      }),
      invalidatesTags: ["ClassPreferences"],
    }),

    updateClassSchedulePreference: builder.mutation<
      any,
      { uuid: string; preferenceType: PreferenceType; preferenceValue: boolean }
    >({
      query: ({ uuid, preferenceType, preferenceValue }) => ({
        url: `classes/schedule-preference/${uuid}`,
        method: "PUT",
        body: { preferenceType, preferenceValue },
      }),
      invalidatesTags: ["ClassPreferences"],
    }),

    deleteClassSchedulePreference: builder.mutation<any, string>({
      query: (uuid) => ({
        url: `classes/schedule-preference/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ClassPreferences"],
    }),
  }),
});

export const {
  useGetClassPreferencesQuery,
  useCreateClassSchedulePreferenceMutation,
  useUpdateClassSchedulePreferenceMutation,
  useDeleteClassSchedulePreferenceMutation,
} = classSchedulePreferenceApi;
