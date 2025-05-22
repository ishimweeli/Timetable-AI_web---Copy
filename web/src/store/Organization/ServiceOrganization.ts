import axios from "axios";
import {
  TypeOrganization,
  ApiResponse,
} from "@/type/Organization/TypeOrganization";

const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export const getOrganizations = async (): Promise<
  ApiResponse<TypeOrganization[]>
> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${API_URL}/organizations`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }catch(error) {
    console.error("Error fetching organizations:", error);
    throw error;
  }
};

export const getOrganization = async (
  uuid: string,
): Promise<ApiResponse<TypeOrganization>> => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await axios.get(`${API_URL}/organizations/${uuid}`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  }catch(error) {
    console.error("Error fetching organization:", error);
    throw error;
  }
};
