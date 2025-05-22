import axios from "axios";
import { Student, StudentRequest, ApiResponse } from "@/type/student/student";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API_URL = `${API_BASE_URL}/api/v1/students`;

const getAuthToken = () => {
  return localStorage.getItem("authToken") || "";
};

const getAuthHeaders = () => {
  return {
    Authorization: `${getAuthToken()}`,
    "Content-Type": "application/json",
  };
};

export const getStudents = async (
  page: number = 0,
  size: number = 10,
): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await axios.get<ApiResponse<Student[]>>(API_URL, {
      params: { page, size },
      headers: getAuthHeaders(),
    });
    return response.data;
  }catch(error) {
    console.error("Error fetching students:", error);
    throw error;
  }
};

export const getStudentsByOrganization = async (
  organizationId: number,
  page?: number,
  size?: number,
): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await axios.get<ApiResponse<Student[]>>(
      `${API_URL}/organization/${organizationId}`,
      {
        params: { page, size },
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  }catch(error) {
    console.error("Error fetching students by organization:", error);
    throw error;
  }
};

export const getStudentsByDepartment = async (
  department: string,
  organizationId: number,
  page?: number,
  size?: number,
): Promise<ApiResponse<Student[]>> => {
  try {
    const response = await axios.get<ApiResponse<Student[]>>(
      `${API_URL}/department/${department}/organization/${organizationId}`,
      {
        params: { page, size },
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  }catch(error) {
    console.error("Error fetching students by department:", error);
    throw error;
  }
};

export const getStudentByUuid = async (
  uuid: string,
): Promise<ApiResponse<Student>> => {
  try {
    const response = await axios.get<ApiResponse<Student>>(
      `${API_URL}/${uuid}`,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  }catch(error) {
    console.error("Error fetching student details:", error);
    throw error;
  }
};

export const createStudent = async (
  student: StudentRequest,
): Promise<ApiResponse<Student>> => {
  try {
    const response = await axios.post<ApiResponse<Student>>(API_URL, student, {
      headers: getAuthHeaders(),
    });
    return response.data;
  }catch(error: any) {
    console.error("Error creating student:", error);
    if(error.response && error.response.data) {
      return error.response.data as ApiResponse<Student>;
    }
    throw error;
  }
};

export const updateStudent = async (
  uuid: string,
  student: StudentRequest,
): Promise<ApiResponse<Student>> => {
  try {
    const response = await axios.put<ApiResponse<Student>>(
      `${API_URL}/${uuid}`,
      student,
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  }catch(error: any) {
    console.error("Error updating student:", error);
    if(error.response && error.response.data) {
      return error.response.data as ApiResponse<Student>;
    }

    throw error;
  }
};

export const deleteStudent = async (
  uuid: string,
): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.put<ApiResponse<any>>(
      `${API_URL}/${uuid}/soft-delete`,
      {},
      {
        headers: getAuthHeaders(),
      },
    );
    return response.data;
  }catch(error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};
