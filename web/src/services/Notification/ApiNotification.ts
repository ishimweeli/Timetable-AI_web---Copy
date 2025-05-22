import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const apiNotification = createApi({
  reducerPath: "apiNotification",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("Authorization", token);
      }
      headers.set("Content-Type", "application/json");
      headers.set("Accept-Language", localStorage.getItem("i18nextLng") || "en");
      return headers;
    },
  }),
  tagTypes: ["Notification"],
  endpoints: (builder) => ({
    getUserNotifications: builder.query({
      query: ({ userUuid, unreadOnly = false }) => ({
        url: `/api/v1/notifications/user/${userUuid}?unreadOnly=${unreadOnly}`,
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
    getUnreadCount: builder.query({
      query: (userUuid) => ({
        url: `/api/v1/notifications/unread-count/${userUuid}`,
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/api/v1/notifications/${notificationId}/mark-read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
    getUserUnreadNotifications: builder.query({
      query: ({ userUuid, unreadOnly = true }) => ({
        url: `/api/v1/notifications/unread-user/${userUuid}?unreadOnly=${unreadOnly}`,
        method: "GET",
      }),
      providesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useGetUserUnreadNotificationsQuery,
} = apiNotification;