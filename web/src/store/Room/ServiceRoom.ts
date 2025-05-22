import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { ApiResponse } from "@/type/api";
import i18next from "i18next";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface Room {
  id: number;
  uuid: string;
  name: string;
  code: string;
  capacity: number;
  description: string;
  statusId: number;
  createdBy: number;
  modifiedBy: number;
  createdDate: string;
  modifiedDate: string;
  initials: string;
  controlNumber: string;
  priority: string;
  location: string;
}

export interface CreateRoomRequest {
  name: string;
  code: string;
  capacity: number;
  description?: string;
  statusId: number;
  initials: string;
  controlNumber: string;
  priority: string;
  location: string;
}

export const roomApi = createApi({
  reducerPath: "roomApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if(token) {
        headers.set("Authorization", `${token}`);
      }
      headers.set("Accept-Language", i18next.language || "en");
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Room"],
  endpoints: (builder) => ({
    getRooms: builder.query<ApiResponse<Room[]>, void>({
      query: () => "rooms",
      providesTags: ["Room"],
    }),
    getRoom: builder.query<ApiResponse<Room>, string>({
      query: (uuid) => `rooms/${uuid}`,
      providesTags: (_result, _error, uuid) => [{ type: "Room", id: uuid }],
    }),
    createRoom: builder.mutation<ApiResponse<Room>, CreateRoomRequest>({
      query: (data) => ({
        url: "rooms",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Room"],
    }),
    updateRoom: builder.mutation<
      ApiResponse<Room>,
      { uuid: string; data: Partial<CreateRoomRequest> }
    >({
      query: ({ uuid, data }) => ({
        url: `rooms/${uuid}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { uuid }) => [
        "Room",
        { type: "Room", id: uuid },
      ],
    }),
    deleteRoom: builder.mutation<ApiResponse<void>, string>({
      query: (uuid) => ({
        url: `rooms/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Room"],
    }),
  }),
});

export const {
  useGetRoomsQuery,
  useGetRoomQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomApi;
