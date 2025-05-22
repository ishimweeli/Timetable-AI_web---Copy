import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { TypeClass, CreateClassRequest } from "@/type/Class/TypeClass.ts";
import type { ApiResponse } from "@/type/Class/TypeClass.ts";
import i18next from "i18next";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface GetClassesParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDirection?: "asc" | "desc";
    keyword?: string;
    orgId?: number | null;
    planSettingsId?: number | null; // Added planSettingsId from second file
}

export interface ImportClassCsvResponse {
    totalProcessed: number;
    successCount: number;
    errorCount: number;
    createdClasses: TypeClass[];
    errors: {
        rowNumber: number;
        originalData: string;
        errorMessage: string;
    }[];
}

export const apiClass = createApi({
    reducerPath: "classApi",
    baseQuery: fetchBaseQuery({
        baseUrl: `${API_BASE_URL}/api/v1`,
        prepareHeaders: (headers, api) => {
            const token = localStorage.getItem("authToken");
            if(token) {
                headers.set("Authorization", token);
            }

            headers.set("Accept-Language", i18next.language || "en");

            // Only set Content-Type for non-FormData requests
            // For FormData, let the browser set the proper multipart/form-data with boundary
            const url = typeof api.endpoint === 'string' ? api.endpoint : '';
            if(!url.includes('import')) {
                headers.set("Content-Type", "application/json");
            }

            return headers;
        },
    }),
    endpoints: (builder) => ({
        getClasses: builder.query<ApiResponse<TypeClass[]>, GetClassesParams>({
            query: (params = {}) => {
                const {
                    page,
                    size,
                    sortBy,
                    sortDirection = "asc",
                    keyword,
                    orgId,
                    planSettingsId // Added from second file
                } = params;

                // Start with basic query parameters
                const queryParams = [];

                // Only add parameters that have values
                if(page !== undefined) {
                    queryParams.push(`page=${page}`);
                }

                if(size !== undefined) {
                    queryParams.push(`size=${size}`);
                }

                if(sortBy) {
                    queryParams.push(`sortBy=${sortBy}`);
                }

                // Always include sortDirection
                queryParams.push(`sortDirection=${sortDirection}`);

                if(keyword) {
                    queryParams.push(`keyword=${encodeURIComponent(keyword)}`);
                }

                if(orgId !== undefined && orgId !== null) {
                    queryParams.push(`orgId=${orgId}`);
                }

                // Add planSettingsId to query parameters if it exists
                if(planSettingsId !== undefined && planSettingsId !== null) {
                    queryParams.push(`planSettingsId=${planSettingsId}`);
                }

                // Construct the final query string
                const queryString = queryParams.length
                    ? `?${queryParams.join("&")}`
                    : "";

                return `classes${queryString}`;
            },
            transformResponse: (response: ApiResponse<TypeClass[]>) => {
                // Filter out duplicate classes based on name and initial
                if (response.data) {
                    const uniqueClasses = new Map<string, TypeClass>();

                    response.data.forEach(classItem => {
                        const key = `${classItem.name}_${classItem.initial}`;
                        if (!uniqueClasses.has(key)) {
                            uniqueClasses.set(key, classItem);
                        }
                    });

                    response.data = Array.from(uniqueClasses.values());
                }

                return response;
            },
            transformErrorResponse: (response: any) => {
                // Extract error from backend response
                if(response.data) {
                    return response.data;
                }
                if(response.error) {
                    return { error: response.error, success: false };
                }
                return { error: "Failed to fetch classes", success: false };
            },
        }),
        getOrganizations: builder.query<
            ApiResponse<{ id: number; name: string }[]>,
            void
        >({
            query: () => "organizations",
            transformResponse: (
                response: ApiResponse<{ id: number; name: string }[]>,
            ) => response,
            transformErrorResponse: (response: any) => {
                if(response.data) {
                    return response.data;
                }
                if(response.error) {
                    return { error: response.error, success: false };
                }
                return { error: "Failed to fetch organizations", success: false };
            },
        }),
        getClass: builder.query<ApiResponse<TypeClass>, string>({
            query: (uuid) => `classes/${uuid}`,
            transformResponse: (response: ApiResponse<TypeClass>) => response,
            transformErrorResponse: (response: any) => {
                if(response.data) {
                    return response.data;
                }
                if(response.error) {
                    return { error: response.error, success: false };
                }
                return { error: "Failed to fetch class details", success: false };
            },
        }),
        createClass: builder.mutation<ApiResponse<TypeClass>, CreateClassRequest>({
            query: (data) => ({
                url: "classes",
                method: "POST",
                body: {
                    ...data,
                    ...(data.planSettingsId && { planSettingsId: data.planSettingsId }), // Added from second file
                },
            }),
            transformResponse: (response: ApiResponse<TypeClass>) => response,
            transformErrorResponse: (response: any) => {
                // Return specific backend error if available
                if(response.data?.error) {
                    return response.data;
                }
                if(response.error) {
                    return { error: response.error, success: false };
                }
                return { error: "Failed to create class", success: false };
            },
        }),
        updateClass: builder.mutation<
            ApiResponse<TypeClass>,
            { uuid: string; data: Partial<TypeClass> }
        >({
            query: ({ uuid, data }) => ({
                url: `classes/${uuid}`,
                method: "PUT",
                body: {
                    name: data.name,
                    initial: data.initial,
                    color: data.color,
                    section: data.section,
                    capacity: data.capacity,
                    minLessonsPerDay: data.minLessonsPerDay,
                    maxLessonsPerDay: data.maxLessonsPerDay,
                    latestStartPosition: data.latestStartPosition,
                    earliestEnd: data.earliestEnd,
                    maxFreePeriods: data.maxFreePeriods,
                    mainTeacher: data.mainTeacher,
                    comment: data.comment,
                    presentEveryDay: data.presentEveryDay,
                    modifiedBy: data.modifiedBy || "system",
                    ...(data.organizationId && { organizationId: data.organizationId }),
                    ...(data.planSettingsId && { planSettingsId: data.planSettingsId }), // Added from second file
                    // Ensure we don't send null or undefined values unnecessarily
                    ...Object.entries(data)
                        .filter(([key, value]) =>
                            !['name', 'initial', 'color', 'section', 'capacity', 'minLessonsPerDay',
                                'maxLessonsPerDay', 'latestStartPosition', 'earliestEnd', 'maxFreePeriods',
                                'mainTeacher', 'comment', 'presentEveryDay', 'modifiedBy', 'organizationId',
                                'planSettingsId'].includes(key) && value !== undefined && value !== null)
                        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
                },
            }),
            transformResponse: (response: ApiResponse<TypeClass>) => response,
            transformErrorResponse: (response: any) => {
                if(response.data?.error) {
                    return response.data;
                }
                if(response.error) {
                    return { error: response.error, success: false };
                }
                return { error: "Failed to update class", success: false };
            },
        }),
        deleteClass: builder.mutation<ApiResponse<void>, string>({
            query: (uuid) => ({
                url: `classes/${uuid}`,
                method: "DELETE",
            }),
            transformResponse: (response: ApiResponse<void>) => response,
            transformErrorResponse: (response: any) => {
                if(response.data?.error) {
                    return response.data;
                }
                if(response.error) {
                    return { error: response.error, success: false };
                }
                return { error: "Failed to delete class", success: false };
            },
        }),
        importClassesFromCsv: builder.mutation<
            ApiResponse<ImportClassCsvResponse>,
            { file: File; organizationId?: number; skipHeaderRow?: boolean; planSettingsId?: number } // Added planSettingsId
        >({
            query: ({ file, organizationId, skipHeaderRow = true, planSettingsId }) => { // Added planSettingsId
                const formData = new FormData();
                formData.append("file", file);

                if(organizationId !== undefined) {
                    formData.append("organizationId", organizationId.toString());
                }

                formData.append("skipHeaderRow", skipHeaderRow.toString());

                // Added from second file
                if(planSettingsId !== undefined) {
                    formData.append("planSettingsId", planSettingsId.toString());
                }

                return {
                    url: "classes/import/csv",
                    method: "POST",
                    body: formData,
                    // For FormData, do not set Content-Type header,
                    // browser will set it automatically with correct boundary
                    formData: true
                };
            },
            transformResponse: (response: ApiResponse<ImportClassCsvResponse>) => response,
            transformErrorResponse: (response: any) => {
                if(response.data?.error) {
                    return response.data;
                }
                if(response.error) {
                    return { error: response.error, success: false };
                }
                return { error: "Failed to import classes from CSV", success: false };
            },
        }),
    }),
});

export const {
    useGetClassesQuery,
    useGetOrganizationsQuery,
    useGetClassQuery,
    useCreateClassMutation,
    useUpdateClassMutation,
    useDeleteClassMutation,
    useImportClassesFromCsvMutation,
} = apiClass;