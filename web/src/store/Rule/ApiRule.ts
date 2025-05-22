import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import i18next from "i18next";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface Rule {
  id: number;
  uuid: string;
  name: string;
  organizationId: number;
  initials: string;
  data: string;
  priority: number;
  enabled?: boolean;
  isEnabled?: boolean;
  createdDate: string;
  modifiedDate: string;
  statusId: number;
  isDeleted: boolean;
  comment: string;
}

export interface RuleResponse {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  error?: string;
  data: Rule;
}

export interface RuleListResponse {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  error?: string;
  data: Rule[];
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  currentPage: number;
}

export interface CreateRuleRequest {
  name: string;
  initials: string;
  data: string;
  priority: number;
  enabled: boolean;
  organizationId: number;
  statusId: number;
}

export interface UpdateRuleRequest {
  name?: string;
  initials?: string;
  data?: string;
  priority?: number;
  enabled?: boolean;
  organizationId?: number;
  statusId?: number;
}

export interface GetRulesParams {
  page?: number;
  size?: number;
  keyword?: string;
  sortBy?: string;
  sortDirection?: string;
  orgId?: number | null;
  planSettingsId?: number | null;
}

export interface ImportResult {
  success: boolean;
  message?: string;
  data?: {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    errors: Array<{
      rowNumber: number;
      errorMessage: string;
      originalData?: string;
    }>;
  };
}

export const apiRule = createApi({
  reducerPath: "ruleApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_BASE_URL}/api/v1`,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("authToken");
      if(token) {
        headers.set("Authorization", token);
      }

      headers.set("Accept-Language", i18next.language || "en");
      headers.set("Content-Type", "application/json");
      return headers;
    },
    responseHandler: async (response) => {
      try {
        const data = await response.json();
        if(!response.ok) {
          return {
            error: {
              status: response.status,
              data: data,
            },
          };
        }

        return data;
      }catch(error) {
        console.error("Error parsing response JSON:", error);
        return {
          error: {
            status: response.status || 500,
            data: { error: "Failed to process response" },
          },
        };
      }
    },
  }),
  tagTypes: ["Rule"],
  endpoints: (builder) => ({
    getRules: builder.query<RuleListResponse, GetRulesParams>({
      query: (params = {}) => {
        const {
          page = 0,
          size = 10,
          keyword = "",
          sortBy = "name",
          sortDirection = "asc",
          orgId = null,
          planSettingsId = null,
        } = params;

        const queryParams = [];

        if(page !== undefined) {
          queryParams.push(`page=${page}`);
        }

        if(size !== undefined) {
          queryParams.push(`size=${size}`);
        }

        if(sortBy) {
          queryParams.push(`sortBy=${sortBy}`);
        }

        if(sortDirection) {
          queryParams.push(`sortDirection=${sortDirection}`);
        }

        if(keyword) {
          queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
        }

        if(orgId !== null) {
          queryParams.push(`orgId=${orgId}`);
        }
        
        if(planSettingsId !== null) {
          queryParams.push(`planSettingsId=${planSettingsId}`);
        }

        const queryString = queryParams.length
          ? `?${queryParams.join("&")}`
          : "";

        return `rules${queryString}`;
      },
      transformResponse: (response: any) => {
        if(response.data && Array.isArray(response.data)) {
          response.data = response.data.map((rule) => {
            const normalizedRule = {
              ...rule,
              enabled:
                rule.isEnabled !== undefined
                  ? rule.isEnabled
                  : rule.enabled !== undefined
                    ? rule.enabled
                    : false,
            };
            return normalizedRule;
          });
        }
        return response;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ uuid }) => ({
                type: "Rule" as const,
                id: uuid,
              })),
              { type: "Rule", id: "LIST" },
            ]
          : [{ type: "Rule", id: "LIST" }],
    }),
    getRule: builder.query<RuleResponse, string>({
      query: (uuid) => `rules/${uuid}`,
      providesTags: (result, error, uuid) => [{ type: "Rule", id: uuid }],
    }),
    getOrganizations: builder.query<
      {
        status: number;
        success: boolean;
        data: { id: number; name: string }[];
      },
      void
    >({
      query: () => "organizations",
      transformResponse: (response: any) => response,
    }),
    createRule: builder.mutation<RuleResponse, CreateRuleRequest>({
      query: (ruleData) => {
        return {
          url: "rules",
          method: "POST",
          body: ruleData,
        };
      },
      transformResponse: (response: any) => {
        if(response.data) {
          response.data = {
            ...response.data,
            enabled:
              response.data.isEnabled !== undefined
                ? response.data.isEnabled
                : response.data.enabled !== undefined
                  ? response.data.enabled
                  : false,
          };
        }
        return response;
      },
      invalidatesTags: [{ type: "Rule", id: "LIST" }],
    }),
    updateRule: builder.mutation<
      RuleResponse,
      { uuid: string; ruleData: UpdateRuleRequest }
    >({
      query: ({ uuid, ruleData }) => {
        return {
          url: `rules/${uuid}`,
          method: "PUT",
          body: ruleData,
        };
      },
      transformResponse: (response: any) => {
        if(response.data) {
          response.data = {
            ...response.data,
            enabled:
              response.data.isEnabled !== undefined
                ? response.data.isEnabled
                : response.data.enabled !== undefined
                  ? response.data.enabled
                  : false,
          };
        }
        return response;
      },
      invalidatesTags: (result, error, { uuid }) => [
        { type: "Rule", id: uuid },
        { type: "Rule", id: "LIST" },
      ],
    }),
    deleteRule: builder.mutation<
      {
        status: number;
        success: boolean;
        time: number;
        language: string;
        message?: string;
        error?: string;
        data: {};
      },
      string
    >({
      query: (uuid) => ({
        url: `rules/${uuid}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Rule", id: "LIST" }],
    }),
    importRulesCsv: builder.mutation<
      ImportResult,
      FormData
    >({
      queryFn: async (formData, { getState }, _, baseQuery) => {
        try {
          const token = localStorage.getItem("authToken");
          const language = i18next.language || "en";
          
          const response = await fetch(`${API_BASE_URL}/api/v1/rules/import/csv`, {
            method: 'POST',
            body: formData,
            headers: {
              'Authorization': token || '',
              'Accept-Language': language,
              // Let the browser set the Content-Type with boundary
            },
            credentials: 'include'
          });
          
          const data = await response.json();
          
          if (!response.ok) {
            return { 
              error: { 
                status: response.status, 
                data 
              } 
            };
          }
          
          return { data };
        } catch (error) {
          return { 
            error: { 
              status: 500, 
              data: { message: error.message || 'An unknown error occurred' } 
            } 
          };
        }
      },
      invalidatesTags: [{ type: "Rule", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRulesQuery,
  useLazyGetRulesQuery,
  useGetRuleQuery,
  useGetOrganizationsQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useImportRulesCsvMutation,
} = apiRule;
