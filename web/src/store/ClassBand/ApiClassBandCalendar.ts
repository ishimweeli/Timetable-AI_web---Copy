import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Period, PreferenceType } from "@/type/Calendar/TypeCalendar";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const classBandCalendarApi = createApi({
  reducerPath: "classBandCalendarApi",
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
  tagTypes: ["ClassBandPreferences", "Periods"],
  endpoints: (builder) => ({
    // Add periods query
    getPeriods: builder.query<{ data: Period[] }, void>({
      query: () => "periods/schedules",
      providesTags: ["Periods"],
    }),

    getClassBandPreferences: builder.query<any, string>({
      query: (classBandUuid) => `class-bands/${classBandUuid}/preferences`,
      providesTags: ["ClassBandPreferences"],
    }),

    getClassBandPreferenceForSchedule: builder.query<
      any,
      { classBandUuid: string; scheduleUuid: string }
    >({
      query: ({ classBandUuid, scheduleUuid }) =>
        `class-bands/${classBandUuid}/schedules/${scheduleUuid}/preferences`,
      providesTags: ["ClassBandPreferences"],
    }),

    createClassBandSchedulePreference: builder.mutation<
      any,
      {
        classBandUuid: string;
        scheduleUuid: string;
        preferenceType: PreferenceType;
        preferenceValue: boolean;
      }
    >({
      query: ({
        classBandUuid,
        scheduleUuid,
        preferenceType,
        preferenceValue,
      }) => ({
        url: `class-bands/${classBandUuid}/schedules/${scheduleUuid}/preferences`,
        method: "POST",
        body: { preferenceType, preferenceValue },
      }),
      invalidatesTags: ["ClassBandPreferences"],
    }),

    updateClassBandSchedulePreference: builder.mutation<
      any,
      { uuid: string; preferenceType: PreferenceType; preferenceValue: boolean }
    >({
      query: ({ uuid, preferenceType, preferenceValue }) => ({
        url: `class-bands/schedule-preference/${uuid}`,
        method: "PUT",
        body: { preferenceType, preferenceValue },
      }),
      invalidatesTags: ["ClassBandPreferences"],
    }),

    deleteClassBandSchedulePreference: builder.mutation<any, string>({
      query: (uuid) => ({
        url: `class-bands/schedule-preference/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["ClassBandPreferences"],
    }),

    clearClassBandPreferencesForSchedule: builder.mutation<
      any,
      { classBandUuid: string; scheduleUuid: string }
    >({
      query: ({ classBandUuid, scheduleUuid }) => ({
        url: `class-bands/${classBandUuid}/schedules/${scheduleUuid}/preferences`,
        method: "DELETE",
      }),
      invalidatesTags: ["ClassBandPreferences"],
    }),
  }),
});

export const {
  useGetPeriodsQuery,
  useGetClassBandPreferencesQuery,
  useGetClassBandPreferenceForScheduleQuery,
  useCreateClassBandSchedulePreferenceMutation,
  useUpdateClassBandSchedulePreferenceMutation,
  useDeleteClassBandSchedulePreferenceMutation,
  useClearClassBandPreferencesForScheduleMutation,
} = classBandCalendarApi;
