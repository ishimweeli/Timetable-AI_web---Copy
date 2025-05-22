// src/store/Binding/ApiSearchReplace.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiResponse, Binding } from "@/type/Binding/TypeBinding";
import i18next from "i18next";
import { getCurrentOrganizationInfo } from "./ApiBinding";

// Types for search and replace operations
export interface SearchBindingsParams {
  fieldType: "teacher" | "subject" | "room";
  fieldUuid: string;
  orgId?: number | null;
}

export interface ReplaceBindingsParams {
  fieldType: "teacher" | "subject" | "room";
  searchUuid: string;
  replaceUuid: string;
  mode: "all" | "single" | "selected";
  bindingUuids?: string[]; // Required when mode is "selected"
  orgId?: number | null;
}

export interface ReplaceBindingsResult {
  count: number;
  message: string;
}

// Custom error handling
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

// API for search and replace operations
export const apiSearchReplace = createApi({
  reducerPath: "searchReplaceApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/v1`,
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
  tagTypes: ["Binding"],
  endpoints: (builder) => ({
    // Search for bindings with a specific field value
    searchBindings: builder.mutation<ApiResponse<Binding[]>, SearchBindingsParams>({
      query: (params) => {
        // Get current organization ID if not provided
        const { id: orgId } = getCurrentOrganizationInfo();
        
        return {
          url: 'bindings/search',
          method: 'POST',
          body: {
            fieldType: params.fieldType,
            fieldUuid: params.fieldUuid,
            orgId: params.orgId || orgId
          },
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      }
    }),
    
    // Replace field values in bindings
    replaceBindings: builder.mutation<ApiResponse<ReplaceBindingsResult>, ReplaceBindingsParams>({
      query: (params) => {
        // Get current organization ID if not provided
        const { id: orgId } = getCurrentOrganizationInfo();
        
        return {
          url: 'bindings/replace',
          method: 'POST',
          body: {
            fieldType: params.fieldType,
            searchUuid: params.searchUuid,
            replaceUuid: params.replaceUuid,
            mode: params.mode,
            bindingUuids: params.bindingUuids,
            orgId: params.orgId || orgId
          },
          headers: {
            Authorization: localStorage.getItem("authToken") || ""
          }
        };
      },
      invalidatesTags: ["Binding"]
    })
  })
});

export const {
  useSearchBindingsMutation,
  useReplaceBindingsMutation
} = apiSearchReplace;
