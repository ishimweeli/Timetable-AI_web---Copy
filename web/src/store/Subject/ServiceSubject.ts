import axios from "axios";
import { ImportResult } from "@/component/Common/CsvImport";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/v1/subjects`;

// Helper function to attach auth token to headers
const getAuthHeaders = (isFormData = false) => {
  const authToken = localStorage.getItem("authToken");
  return {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Authorization: authToken || "",
    "Accept-Language": localStorage.getItem("i18nextLng") || "en"
  };
};

// Import subjects from CSV file
export const importSubjectsFromCsv = async (
  file: File, 
  options: { skipHeaderRow: boolean, organizationId?: number | null }
): Promise<ImportResult> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("skipHeaderRow", options.skipHeaderRow.toString());
    
    if(options.organizationId !== undefined && options.organizationId !== null) {
      formData.append("organizationId", options.organizationId.toString());
    }
    
    const response = await axios.post(`${API_URL}/import/csv`, formData, {
      headers: getAuthHeaders(true)
    });
    
    return {
      success: response.data.success,
      data: {
        totalProcessed: response.data.data.totalProcessed,
        successCount: response.data.data.successCount,
        errorCount: response.data.data.errorCount,
        errors: response.data.data.errors || []
      },
      message: response.data.message
    };
  }catch(error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to import subjects"
    };
  }
};
