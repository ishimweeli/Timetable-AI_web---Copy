import axios from "axios";
import { Period, PeriodRequest, ApiResponse } from "@/type/Period/index";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const ENDPOINT = `${API_URL}/api/v1/periods`;

const getAuthToken = () => {
  const token = localStorage.getItem("authToken");
  if(!token) {
    console.warn("No authentication token found in localStorage");
  }
  return token;
};

// Get period schedules based on plan settings
export const getPeriodSchedules = async (
  planSettingsId: number
): Promise<ApiResponse<any[]>> => {
  try {
    if (!planSettingsId) {
      throw new Error("Plan Settings ID is required to fetch period schedules");
    }
    
    const response = await axios.get<ApiResponse<any[]>>(
      `${ENDPOINT}/schedules`,
      {
        params: { planSettingsId },
        headers: createAuthHeaders(),
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching period schedules:", error);
    return {
      status: 200,
      success: true,
      time: Date.now(),
      language: "en",
      message: "No period schedules found",
      data: [],
    };
  }
};

// Get periods by day for a specific plan setting
export const getPeriodsByDay = async (
  day: string,
  planSettingsId: number,
  organizationId: number | string
): Promise<ApiResponse<Period[]>> => {
  try {
    if (!planSettingsId) {
      throw new Error("Plan Settings ID is required to fetch periods by day");
    }
    
    if (!day) {
      throw new Error("Day is required to fetch periods");
    }
    
    const response = await axios.get<ApiResponse<Period[]>>(
      `${ENDPOINT}/by-day/${day}`,
      {
        params: { 
          planSettingsId,
          organizationId
        },
        headers: createAuthHeaders(),
      },
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching periods for day ${day}:`, error);
    return {
      status: 200,
      success: true,
      time: Date.now(),
      language: "en",
      message: `No periods found for ${day}`,
      data: [],
    };
  }
};

const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: token ? token : "",
    "Content-Type": "application/json",
  };
};

export const getAllPeriods = async (planSettingsId: number): Promise<ApiResponse<Period[]>> => {
  try {
    const response = await axios.get<ApiResponse<Period[]>>(ENDPOINT, {
      params: { planSettingsId },
      headers: createAuthHeaders(),
    });
    return response.data;
  }catch(error) {
    console.error("Error fetching periods:", error);
    // Return empty data array instead of throwing
    return {
      status: 200,
      success: true,
      time: Date.now(),
      language: "en",
      message: "No periods found",
      data: [],
    };
  }
};

export const getPeriodByUuid = async (
  uuid: string,
  planSettingsId: number
): Promise<ApiResponse<Period>> => {
  try {
    const response = await axios.get<ApiResponse<Period>>(
      `${ENDPOINT}/${uuid}`,
      {
        params: { planSettingsId },
        headers: createAuthHeaders(),
      },
    );
    return response.data;
  }catch(error) {
    console.error("Error fetching period details:", error);
    throw error;
  }
};

export const getPeriodsByOrganization = async (
  organizationId: number | string,
  page: number = 0,
  size: number = 10,
  planSettingsId?: number,
  keyword: string = "",
  sortBy: string = "startTime",
  sortDirection: string = "asc", 
  periodType?: string
): Promise<ApiResponse<Period[]>> => {
  try {
    if(!organizationId) {
      throw new Error("Organization ID is required");
    }

    const orgId =
      localStorage.getItem("selectedOrganizationId") ||
      organizationId.toString();
      
    // If planSettingsId is not provided, try to get it from localStorage
    const planSettingId = planSettingsId || 
      parseInt(localStorage.getItem("selectedPlanSettingsId") || "0", 10);
      
    // Ensure we have a valid planSettingsId
    if (!planSettingId) {
      throw new Error("Plan Settings ID is required");
    }

    const response = await axios.get<ApiResponse<Period[]>>(
      `${API_URL}/api/v1/periods`,
      {
        params: { 
          page, 
          size, 
          sortBy, 
          sortDirection, 
          keyword, 
          orgId,
          planSettingsId: planSettingId,
          periodType: periodType // Add optional filter by period type
        },
        headers: createAuthHeaders(),
      },
    );

    return response.data;
  }catch(error) {
    console.error("Error fetching periods by organization:", error);
    return {
      status: 200,
      success: true,
      time: Date.now(),
      language: "en",
      message: "No periods found for this organization",
      data: [],
      pagination: {
        totalItems: 0,
        currentPage: page,
        pageSize: size,
        totalPages: 0,
      },
    };
  }
};

export const createPeriod = async (
  periodRequest: PeriodRequest & { planSettingsId?: number },
): Promise<ApiResponse<Period>> => {
  try {
    // Validate planSettingsId is present
    if (!periodRequest.planSettingsId) {
      throw new Error('Plan Settings ID is required to create a period');
    }
    
    // Validate required fields
    if (!periodRequest.name) {
      throw new Error('Period name is required');
    }
    
    if (!periodRequest.startTime || !periodRequest.endTime) {
      throw new Error('Period start and end times are required');
    }
    
    // Check if a period with the same name or number already exists in this plan setting
    const exists = await checkPeriodExistsInPlanSettings(
      periodRequest.name,
      periodRequest.periodNumber,
      periodRequest.planSettingsId,
      periodRequest.organizationId
    );
    
    if (exists) {
      throw new Error('A period with this name or number already exists in this plan setting');
    }
    
    // Log the exact data being sent to the API
    console.log("periodService.createPeriod sending to API:", periodRequest);
    
    // Directly pass the request data without modifying it
    const response = await axios.post(ENDPOINT, periodRequest, {
      headers: {
        ...createAuthHeaders(),
        "Content-Type": "application/json"
      },
    });
    
    return response.data;
  } catch(error) {
    console.error("Error creating period:", error);
    
    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      console.error("API Error Response:", error.response?.data);
      console.error("API Error Status:", error.response?.status);
      console.error("API Error Headers:", error.response?.headers);
      console.error("API Error Config:", error.config);
      
      // If we have validation errors, log them specifically
      if (error.response?.data?.errors) {
        console.error("Validation Errors:", error.response.data.errors);
      }
      
      throw new Error(error.response?.data?.message || error.message);
    }
    
    throw error;
  }
};

export const updatePeriod = async (
  uuid: string,
  period: PeriodRequest & { planSettingsId?: number },
): Promise<ApiResponse<Period>> => {
  try {
    if(!uuid) {
      throw new Error("Period UUID is required for update");
    }
    
    // Ensure planSettingsId is available
    const planSettingsId = period.planSettingsId || 
      parseInt(localStorage.getItem("selectedPlanSettingsId") || "0", 10);
      
    if (!planSettingsId) {
      throw new Error("Plan Settings ID is required to update a period");
    }

    // Validate required fields
    if (!period.name) {
      throw new Error('Period name is required');
    }
    
    if (!period.startTime || !period.endTime) {
      throw new Error('Period start and end times are required');
    }
    
 
    const exists = await checkPeriodExistsInPlanSettings(
      period.name,
      period.periodNumber,
      planSettingsId,
      period.organizationId,
      uuid // Exclude the current period from the check
    );
    
    if (exists) {
      throw new Error('Another period with this name or number already exists in this plan setting');
    }

    // Ensure all required fields are present and in the correct format
    const formattedRequest = {
      name: period.name,
      startTime: period.startTime,
      endTime: period.endTime,
      durationMinutes: period.durationMinutes,
      periodType: period.periodType,
      periodNumber: period.periodNumber,
      days: period.days,
      organizationId: Number(period.organizationId),
      allowScheduling: Boolean(period.allowScheduling),
      showInTimetable: Boolean(period.showInTimetable),
      allowConflicts: Boolean(period.allowConflicts),
      planSettingsId: Number(planSettingsId)
    };
    
    // Log the formatted request for debugging
    console.log("Period Service - Updating period with formatted data:", formattedRequest);

    const response = await axios.put(`${ENDPOINT}/${uuid}`, formattedRequest, {
      headers: createAuthHeaders(),
    });
    return response.data;
  }catch(error) {
    console.error("Error updating period:", error);
    
    // Provide more detailed error information
    if (axios.isAxiosError(error) && error.response) {
      console.error("API Error details:", error.response.data);
      
      // Log validation errors if available
      if (error.response.data?.error) {
        console.error("Validation errors:", error.response.data.error);
      }
      
      throw new Error(
        error.response.data?.message || 
        `API Error: ${error.response.status} - ${error.response.statusText}`
      );
    }
    throw error;
  }
};

/**
 * Check if a period already exists within a specific plan settings context
 * @param periodName - The name of the period to check
 * @param periodNumber - The number of the period to check
 * @param planSettingsId - The ID of the plan settings context to check within
 * @param orgId - The organization ID
 * @param excludeUuid - Optional UUID to exclude from the check (useful when updating)
 * @returns Promise<boolean> - True if the period exists in the specific plan settings, false otherwise
 */
export const checkPeriodExistsInPlanSettings = async (
  periodName: string,
  periodNumber: number | undefined,
  planSettingsId: number | undefined,
  orgId: number | string = 1,
  excludeUuid?: string
): Promise<boolean> => {
  try {
    // Validate required parameters
    if (!planSettingsId) {
      throw new Error('Plan Settings ID is required to check for period existence');
    }
    
    if (!orgId) {
      throw new Error('Organization ID is required to check for period existence');
    }
    
    // Construct the endpoint with query parameters
    let endpoint = `${API_URL}/api/v1/periods/check-exists`;
    
    // Make a direct API call to check existence
    const response = await axios.get(endpoint, {
      params: {
        name: periodName,
        periodNumber: periodNumber,
        planSettingsId: planSettingsId,
        organizationId: orgId,
        excludeUuid: excludeUuid
      },
      headers: createAuthHeaders(),
    });
    
    // The API should return a boolean or an object with a boolean property
    return response.data.exists || false;
  } catch (error) {
    console.error("Error checking if period exists:", error);
    
    // Fallback to manual check if the API endpoint fails
    try {
      // Get all periods for this organization and plan settings
      const response = await getPeriodsByOrganization(
        orgId,
        0,  // page
        1000, // size - get all periods
        planSettingsId
      );
      
      if (!response || !response.data || !Array.isArray(response.data)) {
        return false;
      }
      
      // Filter existing periods to check for duplicates
      const existingPeriod = response.data.find(period => {
        // Skip the current period if we're updating (using excludeUuid)
        if (excludeUuid && period.uuid === excludeUuid) {
          return false;
        }
        
        // Check for duplicate name or number within this plan setting
        return (
          (periodName && period.name.toLowerCase() === periodName.toLowerCase()) || 
          (periodNumber !== undefined && period.periodNumber === periodNumber)
        );
      });
      
      return !!existingPeriod;
    } catch (innerError) {
      console.error("Error in fallback period existence check:", innerError);
      // In case of error, return false to avoid blocking the operation
      return false;
    }
  }
};

export const deletePeriod = async (
  uuid: string,
  planSettingsId?: number,
): Promise<ApiResponse<void>> => {
  try {
    if(!uuid) {
      throw new Error("Period UUID is required for deletion");
    }
    
    // Ensure planSettingsId is available
    const planSettingId = planSettingsId || 
      parseInt(localStorage.getItem("selectedPlanSettingsId") || "0", 10);
      
    if (!planSettingId) {
      throw new Error("Plan Settings ID is required to delete a period");
    }

    // Check if the period is being used in any schedules before deletion
    try {
      const checkResponse = await axios.get<ApiResponse<{inUse: boolean, usageDetails?: string}>>(
        `${ENDPOINT}/${uuid}/check-usage`,
        {
          params: { planSettingsId: planSettingId },
          headers: createAuthHeaders(),
        }
      );
      
      if (checkResponse.data.data?.inUse) {
        throw new Error(`Cannot delete this period: ${checkResponse.data.data.usageDetails || 'It is being used in schedules'}`);
      }
    } catch (checkError) {
      // If the check endpoint doesn't exist or fails, continue with deletion
      console.warn("Period usage check failed, proceeding with deletion:", checkError);
    }

    const response = await axios.delete<ApiResponse<void>>(
      `${ENDPOINT}/${uuid}`,
      {
        params: { planSettingsId: planSettingId }, // Use params for DELETE requests
        headers: createAuthHeaders(),
      },
    );
    return response.data;
  }catch(error) {
    console.error("Error deleting period:", error);
    throw error;
  }
};

/**
 * Bulk update allowLocationChange for periods by UUIDs.
 * @param periodUuids Array of period UUIDs
 * @param allowLocationChange Boolean value to set
 * @returns ApiResponse<Period[]>
 */
export const updateAllowLocationChangeBulk = async (
  periodUuids: string[],
  allowLocationChange: boolean
): Promise<ApiResponse<Period[]>> => {
  try {
    const response = await axios.put<ApiResponse<Period[]>>(
      `${ENDPOINT}/allow-location-change`,
      { periodUuids, allowLocationChange },
      { headers: createAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating allowLocationChange for periods:", error);
    throw error;
  }
};
