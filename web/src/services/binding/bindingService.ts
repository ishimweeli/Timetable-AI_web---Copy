import axios from "axios";
import { API_URL } from "../baseUrl";

export interface Binding {
  id: number;
  uuid: string;
  teacherId: number;
  teacherUuid: string;
  teacherName: string;
  classId: number;
  classUuid: string;
  className: string;
  subjectId: number;
  subjectUuid: string;
  subjectName: string;
  roomId: number;
  roomUuid: string;
  roomName: string;
  organizationId: number;
  isDeleted: boolean;
  periodsPerWeek?: number;
  scheduledPeriods?: number; 
  remainingPeriods?: number;
  isFixed?: boolean;
  classBandUuid?: string;
  classBandName?: string;
  createdDate?: string;
  modifiedDate?: string;
  planSettingsId?: number;
}

class BindingService {
  /**
   * Get all bindings
   */
  getBindings = async (): Promise<Binding[]> => {
    try {
      const response = await axios.get(`${API_URL}/bindings`);
      return response.data;
    } catch (error) {
      console.error("Error fetching bindings:", error);
      return [];
    }
  };
  
  /**
   * Get bindings for a specific class
   */
  getBindingsByClass = async (classUuid: string): Promise<Binding[]> => {
    try {
      const response = await axios.get(`${API_URL}/bindings/class/${classUuid}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bindings for class ${classUuid}:`, error);
      return [];
    }
  };

  /**
   * Get binding by ID
   */
  getBindingById = async (id: string): Promise<Binding | null> => {
    try {
      const response = await axios.get(`${API_URL}/bindings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching binding with ID ${id}:`, error);
      return null;
    }
  };

  /**
   * Get bindings by plan settings ID
   */
  getBindingsByPlanSettings = async (planSettingsId: number): Promise<Binding[]> => {
    try {
      const response = await axios.get(`${API_URL}/bindings/plan-settings/${planSettingsId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bindings for plan settings ${planSettingsId}:`, error);
      return [];
    }
  };
}

export default new BindingService(); 