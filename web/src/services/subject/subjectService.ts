import axios from "axios";
import { Subject, SubjectFormData } from "@/type/subject";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/v1/subjects`;

// Helper function to attach auth token to headers
const getAuthHeaders = () => {
  const authToken = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Authorization: authToken || "",
    "Accept-Language": localStorage.getItem("i18nextLng") || "en"
  };
};

// Get all subjects with pagination, search, sort and organization filter
export const getSubjects = async (
  page = 0,
  pageSize = 10,
  keyword = "",
  sortBy = "name",
  sortOrder = "asc",
  orgId: number | null = null
) => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", pageSize.toString());
  
  if(keyword) {
    params.append("keyword", keyword);
  }
  
  if(sortBy) {
    params.append("sortBy", sortBy);
  }
  
  if(sortOrder) {
    params.append("sortDirection", sortOrder);
  }
  
  if(orgId !== null) {
    params.append("orgId", orgId.toString());
  }
  
  const response = await axios.get(`${API_URL}?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Get a single subject by UUID
export const getSubject = async (uuid: string) => {
  const response = await axios.get(`${API_URL}/${uuid}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Create a new subject
export const createSubject = async (subjectData: SubjectFormData) => {
  const response = await axios.post(API_URL, subjectData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Update an existing subject
export const updateSubject = async (uuid: string, subjectData: SubjectFormData) => {
  const response = await axios.put(`${API_URL}/${uuid}`, subjectData, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Delete a subject (soft delete)
export const deleteSubject = async (uuid: string) => {
  const response = await axios.put(
    `${API_URL}/${uuid}/soft-delete`, 
    {},
    {
      headers: getAuthHeaders()
    }
  );
  return response.data;
};

// Get organizations for filters
export const getOrganizations = async () => {
  const response = await axios.get(`${API_BASE_URL}/api/v1/organizations`, {
    headers: getAuthHeaders()
  });
  return response.data;
};
