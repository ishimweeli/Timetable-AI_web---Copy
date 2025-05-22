import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Period, PreferenceType } from "@/type/Calendar/TypeCalendar";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface CalendarEvent {
  uuid: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  classUuid?: string;
  className?: string;
  teacherUuid?: string;
  teacherName?: string;
  roomUuid?: string;
  roomName?: string;
  subjectUuid?: string;
  subjectName?: string;
  subjectColor?: string;
  description?: string;
  status?: string;
  createdDate?: string;
  modifiedDate?: string;
}

interface PeriodsResponse {
  status: number;
  success: boolean;
  message: string;
  data: Period[];
  totalItems: number;
}

export const calendarApi = createApi({
  reducerPath: "calendarApi",
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
  tagTypes: ["Periods", "Preferences", "SchedulePreferences", "CalendarEvents"],
  endpoints: (builder) => ({
    getPeriods: builder.query<PeriodsResponse, { planSettingsId?: number, organizationId?: number } | void>({
      query: (params) => {
        if (params) {
          const { planSettingsId, organizationId } = params;
          let queryParams = '';
          
          if (planSettingsId) {
            queryParams += `planSettingsId=${planSettingsId}`;
          }
          
          if (organizationId) {
            if (queryParams) queryParams += '&';
            queryParams += `orgId=${organizationId}`;
          }
          
          console.log(`Fetching periods with params: ${queryParams}`);
          
          if (queryParams) {
            return `periods?page=0&size=1000&sortBy=startTime&sortDirection=asc&keyword=&${queryParams}`;
          }
        }
        
        return 'periods?page=0&size=1000&sortBy=startTime&sortDirection=asc';
      },
      providesTags: ["Periods"],
    }),

    getCalendarEvents: builder.query<
      { data: CalendarEvent[] },
      { view?: string; baseDate?: string; startDate?: string; endDate?: string }
    >({
      query: ({ view, baseDate, startDate, endDate }) => {
        let queryParams = new URLSearchParams();
        if(view) queryParams.append("view", view);
        if(baseDate) queryParams.append("baseDate", baseDate);
        if(startDate) queryParams.append("startDate", startDate);
        if(endDate) queryParams.append("endDate", endDate);
        
        const url = `calendars/events?${queryParams.toString()}`;
        console.log(`API Request: ${url}`);
        
        return {
          url,
          method: "GET",
        };
      },
      transformResponse: (response: any) => {
        console.log(`API Response: ${response.data?.length || 0} events received`);
        if (response.data?.length > 0) {
          console.log(`First event: ${response.data[0].title}, starts at ${response.data[0].startDateTime}`);
        }
        return response;
      },
      providesTags: ["CalendarEvents"],
    }),

    createSchedulePreference: builder.mutation<
      any,
      {
        teacherUuid: string;
        scheduleUuid: string;
        preferenceType: PreferenceType;
        preferenceValue: boolean;
      }
    >({
      query: ({
        teacherUuid,
        scheduleUuid,
        preferenceType,
        preferenceValue,
      }) => ({
        url: `teachers/${teacherUuid}/schedules/${scheduleUuid}/preferences`,
        method: "POST",
        body: { preferenceType, preferenceValue },
      }),
      invalidatesTags: ["SchedulePreferences"],
    }),

    updateSchedulePreference: builder.mutation<
      any,
      {
        uuid: string;
        scheduleUuid: string;
        preferenceType: PreferenceType;
        preferenceValue: boolean;
      }
    >({
      query: ({ uuid, scheduleUuid, preferenceType, preferenceValue }) => ({
        url: `teachers/schedule-preference/${uuid}`,
        method: "PUT",
        body: { scheduleUuid, preferenceType, preferenceValue },
      }),
      invalidatesTags: ["SchedulePreferences"],
    }),

    deleteSchedulePreference: builder.mutation<any, string>({
      query: (uuid) => ({
        url: `teachers/schedule-preference/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SchedulePreferences"],
    }),
  }),
});

export const {
  useGetPeriodsQuery,
  useGetCalendarEventsQuery,
  useCreateSchedulePreferenceMutation,
  useUpdateSchedulePreferenceMutation,
  useDeleteSchedulePreferenceMutation,
} = calendarApi;
