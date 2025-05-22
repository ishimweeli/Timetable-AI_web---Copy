import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  TypeClassBand,
  CreateClassBandRequest,
  UpdateClassBandRequest,
} from "@/type/ClassBand/TypeClassBand";
import { ApiResponse } from "@/type/ClassBand/TypeClassBand";
import i18next from "i18next";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface GetClassBandsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  keyword?: string;
  orgId?: number;
  planSettingsId?: number;
}

export const classBandApi = createApi({
  reducerPath: "classBandApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if(token) {
        headers.set("authorization", token);
      }
      headers.set(
        "Accept-Language",
        localStorage.getItem("i18nextLng") || "en",
      );
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["ClassBand"],
  endpoints: (builder) => ({
    getClassBands: builder.query<
      ApiResponse<TypeClassBand[]>,
      GetClassBandsParams
    >({
      query: ({
        page = 0,
        size = 10,
        sortBy,
        sortDirection = "asc",
        keyword,
        orgId,
        planSettingsId,
      }) => {
        const queryParams: string[] = [];
        queryParams.push(`page=${page}`);
        queryParams.push(`size=${size}`);
        if(sortBy) {
          queryParams.push(`sortBy=${sortBy}`);
        }
        queryParams.push(`sortDirection=${sortDirection}`);
        if(keyword) {
          queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
        }
        if(orgId) {
          queryParams.push(`orgId=${orgId}`);
        }
        if(planSettingsId !== undefined && planSettingsId !== null) {
          queryParams.push(`planSettingsId=${planSettingsId}`);
        }
        const queryString = queryParams.length
          ? `?${queryParams.join("&")}`
          : "";
        return `/api/v1/class-bands${queryString}`;
      },
      transformResponse: (response: ApiResponse<TypeClassBand[]>) => response,
      providesTags: ["ClassBand"],
    }),
    getClassBand: builder.query<ApiResponse<TypeClassBand>, string>({
      query: (uuid) => `/api/v1/class-bands/${uuid}`,
      transformResponse: (response: ApiResponse<TypeClassBand>) => response,
      providesTags: ["ClassBand"],
    }),
    createClassBand: builder.mutation<
      ApiResponse<TypeClassBand>,
      CreateClassBandRequest
    >({
      query: (data) => ({
        url: "/api/v1/class-bands",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: ApiResponse<TypeClassBand>) => response,
      invalidatesTags: ["ClassBand"],
    }),
    updateClassBand: builder.mutation<
      ApiResponse<TypeClassBand>,
      { uuid: string; classBand: UpdateClassBandRequest }
    >({
      query: ({ uuid, classBand }) => ({
        url: `/api/v1/class-bands/${uuid}`,
        method: "PUT",
        body: classBand,
      }),
      transformResponse: (response: ApiResponse<TypeClassBand>) => response,
      invalidatesTags: ["ClassBand"],
    }),
    deleteClassBand: builder.mutation<ApiResponse<void>, string>({
      query: (uuid) => ({
        url: `/api/v1/class-bands/${uuid}`,
        method: "DELETE",
      }),
      transformResponse: (response: ApiResponse<void>) => response,
      invalidatesTags: ["ClassBand"],
    }),
    searchClassBands: builder.query<ApiResponse<TypeClassBand[]>, string>({
      query: (keyword) => ({
        url: `/api/v1/class-bands/search`,
        method: "GET",
        params: { keyword },
      }),
      transformResponse: (response: ApiResponse<TypeClassBand[]>) => response,
      providesTags: ["ClassBand"],
    }),
    getClassBandsByStatus: builder.query<
      ApiResponse<TypeClassBand[]>,
      { statusId: number; page?: number; size?: number }
    >({
      query: ({ statusId, page = 0, size = 10 }) => ({
        url: `/api/v1/class-bands/status`,
        method: "GET",
        params: { status: statusId, page, size },
      }),
      transformResponse: (response: ApiResponse<TypeClassBand[]>) => response,
      providesTags: ["ClassBand"],
    }),
  }),
});

export const {
  useGetClassBandsQuery,
  useGetClassBandQuery,
  useCreateClassBandMutation,
  useUpdateClassBandMutation,
  useDeleteClassBandMutation,
  useSearchClassBandsQuery,
  useGetClassBandsByStatusQuery,
} = classBandApi;
