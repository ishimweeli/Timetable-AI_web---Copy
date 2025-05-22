import axios from "axios";
import { API_URL } from "../baseUrl";
import { Period } from "@/type/Period/Period";

/**
 * Get all period schedules
 */
export const getPeriodSchedules = async (): Promise<Period[]> => {
  try {
    const response = await axios.get(`${API_URL}/periods/schedules`);
    return response.data;
  } catch (error) {
    console.error("Error fetching period schedules:", error);
    return [];
  }
};

/**
 * Get schedule preferences
 */
export const getSchedulePreferences = async () => {
  try {
    const response = await axios.get(`${API_URL}/periods/schedule-preferences`);
    return response.data;
  } catch (error) {
    console.error("Error fetching schedule preferences:", error);
    return [];
  }
}; 