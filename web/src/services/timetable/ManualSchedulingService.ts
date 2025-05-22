import axios from "axios";
import { API_URL } from "../baseUrl";

export interface ManualScheduleEntry {
  timetableId: string;
  bindingId: string;
  dayOfWeek: number;
  periodId: number;
  isDraft?: boolean;
  isBreak?: boolean;
  isLunch?: boolean;
  isPreferred?: boolean;
  isUnavailable?: boolean;
  entryType?: string;
  entryColor?: string;
  organizationId?: number;
  planSettingsId?: number; // Add planSettingsId field for period context
}

export interface ScheduleConflict {
  conflictType: string;
  resourceId: string;
  resourceName: string;
  bindingId?: string;
  timetableEntryId?: string;
  dayOfWeek: number;
  periodId: number;
  conflictDescription: string;
}

export interface ScheduleValidation {
  isValid: boolean;
  bindingId: string;
  dayOfWeek: number;
  periodId: number;
  timetableId: string;
  conflicts: ScheduleConflict[];
  validationErrors: string[];
}

export interface BindingSchedulingSummary {
  bindingId: string;
  totalPeriods: number;
  scheduledPeriods: number;
  remainingPeriods: number;
  isOverscheduled: boolean;
}

export interface TimetableEntry {
  uuid: string;
  timetableId: number;
  bindingId: number;
  subjectId: number;
  subjectName: string;
  teacherId: number;
  teacherName: string;
  classId: number;
  className: string;
  roomId: number;
  roomName: string;
  dayOfWeek: number;
  periodId: number;
  isManuallyScheduled: boolean;
  isDraft: boolean;
  isBreak: boolean;
  isLunch: boolean;
  isPreferred: boolean;
  isUnavailable: boolean;
  entryType: string;
  entryColor?: string;
  organizationId?: number;
  planSettingsId?: number; // Add planSettingsId field
}

export interface TeacherAvailability {
  teacherId: number;
  teacherName: string;
  dayOfWeek: number;
  periodId: number;
  isAvailable: boolean;
  isPreferred: boolean;
}

export interface RoomAvailability {
  roomId: number;
  roomName: string;
  dayOfWeek: number;
  periodId: number;
  isAvailable: boolean;
  isPreferred: boolean;
}

export interface ClassAvailability {
  classId: number;
  className: string;
  dayOfWeek: number;
  periodId: number;
  isAvailable: boolean;
  isPreferred: boolean;
}

export interface Timetable {
  id: number;
  uuid: string;
  name: string;
  description?: string;
  organizationId: number;
  academicYear: string;
  isActive: boolean;
  isPublished: boolean;
  createdDate: string;
  modifiedDate: string;
  planSettingsId?: number; // Add planSettingsId field
}

class ManualSchedulingService {
  /**
   * Validates a manual schedule entry
   */
  validateScheduleEntry = async (
    entryData: ManualScheduleEntry
  ): Promise<ScheduleValidation> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    const response = await axios.post(
      `${API_URL}/manual-scheduling/validate`,
      entryData,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  };

  /**
   * Creates a timetable entry from a manual schedule entry
   */
  createScheduleEntry = async (
    entryData: ManualScheduleEntry
  ): Promise<void> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    // Add classBand handling - if the binding is for a class within a classband
    await axios.post(`${API_URL}/manual-scheduling/create`, {
      ...entryData,
      isDraft: true // Always create as draft initially
    }, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
  };

  /**
   * Get all conflicts for a timetable
   */
  getConflictsForTimetable = async (
    timetableId: string
  ): Promise<ScheduleConflict[]> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    const response = await axios.get(
      `${API_URL}/manual-scheduling/conflicts/${timetableId}`,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  };

  /**
   * Remove a timetable entry
   */
  removeEntry = async (entryId: string): Promise<void> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    await axios.delete(`${API_URL}/manual-scheduling/entry/${entryId}`, {
      headers: {
        'Authorization': token
      }
    });
  };
  
  /**
   * Get binding scheduling summary
   */
  getBindingSchedulingSummary = async (
    timetableId: string,
    bindingId: string
  ): Promise<BindingSchedulingSummary> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(
        `${API_URL}/manual-scheduling/binding-summary/${timetableId}/${bindingId}`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching binding summary:", error);
      // Return default summary if API fails
      return {
        bindingId,
        totalPeriods: 0,
        scheduledPeriods: 0,
        remainingPeriods: 0,
        isOverscheduled: false
      };
    }
  };
  
  /**
   * Get all binding summaries for a timetable
   */
  getAllBindingSummaries = async (
    timetableId: string
  ): Promise<BindingSchedulingSummary[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(
        `${API_URL}/manual-scheduling/binding-summaries/${timetableId}`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching binding summaries:", error);
      return [];
    }
  };
  
  /**
   * Publish a timetable (change from draft to published)
   */
  publishTimetable = async (timetableId: string): Promise<void> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    await axios.put(`${API_URL}/manual-scheduling/publish/${timetableId}`, {}, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
  };

  /**
   * Get all timetable entries for a specific timetable
   */
  getTimetableEntries = async (timetableId: string): Promise<TimetableEntry[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/timetable/${timetableId}/entries`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching entries for timetable ${timetableId}:`, error);
      return [];
    }
  };

  /**
   * Get all available timetables for an organization
   */
  getTimetables = async (organizationId: number, planSettingsId?: number): Promise<Timetable[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      let url = `${API_URL}/timetable/organization/${organizationId}`;
      if (planSettingsId) {
        url += `?planSettingsId=${planSettingsId}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching timetables for organization ${organizationId}:`, error);
      return [];
    }
  };

  /**
   * Get all periods for an organization with planSettingsId filter
   * Updated to use exact URL structure as requested
   */
  getPeriodsByOrganization = async (
    organizationId: number, 
    planSettingsId?: number,
    page: number = 0,
    size: number = 15  // Default page size changed to 15
  ): Promise<any[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // Build URL exactly as specified in the request
      const url = `${API_URL}/periods?page=${page}&size=${size}&sortBy=startTime&sortDirection=asc&keyword=&orgId=${organizationId}${planSettingsId ? `&planSettingsId=${planSettingsId}` : ''}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching periods:', error);
      return [];
    }
  };

  /**
   * Get plan settings for an organization
   */
  getPlanSettings = async (organizationId: number): Promise<any[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(
        `${API_URL}/plan-settings?orgId=${organizationId}&sortDirection=asc`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching plan settings for organization ${organizationId}:`, error);
      return [];
    }
  };

  /**
   * Get default or selected plan setting
   */
  getDefaultPlanSetting = async (organizationId: number): Promise<any | null> => {
    try {
      const planSettings = await this.getPlanSettings(organizationId);
      if (planSettings && planSettings.length > 0) {
        return planSettings[0]; // Return the first plan setting as default
      }
      return null;
    } catch (error) {
      console.error("Error fetching default plan setting:", error);
      return null;
    }
  };

  /**
   * Get teacher availability for scheduling
   */
  getTeacherAvailability = async (teacherId: number): Promise<TeacherAvailability[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/teacher/${teacherId}/availability`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching availability for teacher ${teacherId}:`, error);
      return [];
    }
  };

  /**
   * Get room availability for scheduling
   */
  getRoomAvailability = async (roomId: number): Promise<RoomAvailability[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/room/${roomId}/availability`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching availability for room ${roomId}:`, error);
      return [];
    }
  };

  /**
   * Get class availability for scheduling
   */
  getClassAvailability = async (classId: number): Promise<ClassAvailability[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/class/${classId}/availability`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching availability for class ${classId}:`, error);
      return [];
    }
  };

  /**
   * Create a break entry in the timetable
   */
  createBreakEntry = async (
    timetableId: string,
    dayOfWeek: number,
    periodId: number,
    breakName: string = "Break",
    color: string = "#FFD700",
    planSettingsId?: number
  ): Promise<void> => {
    const breakEntry: ManualScheduleEntry = {
      timetableId,
      bindingId: "0", // No binding for breaks
      dayOfWeek,
      periodId,
      isBreak: true,
      entryType: "Break",
      entryColor: color,
      planSettingsId // Include planSettingsId
    };
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    await axios.post(`${API_URL}/manual-scheduling/create-special`, breakEntry, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
  };

  /**
   * Create a lunch entry in the timetable
   */
  createLunchEntry = async (
    timetableId: string,
    dayOfWeek: number,
    periodId: number,
    lunchName: string = "Lunch",
    color: string = "#FFA500",
    planSettingsId?: number
  ): Promise<void> => {
    const lunchEntry: ManualScheduleEntry = {
      timetableId,
      bindingId: "0", // No binding for lunch
      dayOfWeek,
      periodId,
      isLunch: true,
      entryType: "Lunch",
      entryColor: color,
      planSettingsId // Include planSettingsId
    };
    
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    await axios.post(`${API_URL}/manual-scheduling/create-special`, lunchEntry, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
  };

  /**
   * Set preferred time slot
   */
  setPreferredTimeSlot = async (
    timetableId: string,
    resourceType: string, // "teacher", "room", or "class"
    resourceId: number,
    dayOfWeek: number,
    periodId: number,
    isPreferred: boolean = true
  ): Promise<void> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    await axios.post(`${API_URL}/availability/set-preferred`, {
      timetableId,
      resourceType,
      resourceId,
      dayOfWeek,
      periodId,
      isPreferred
    }, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
  };

  /**
   * Set unavailable time slot
   */
  setUnavailableTimeSlot = async (
    timetableId: string,
    resourceType: string, // "teacher", "room", or "class"
    resourceId: number,
    dayOfWeek: number,
    periodId: number,
    isUnavailable: boolean = true
  ): Promise<void> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    await axios.post(`${API_URL}/availability/set-unavailable`, {
      timetableId,
      resourceType,
      resourceId,
      dayOfWeek,
      periodId,
      isUnavailable
    }, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
  };

  /**
   * Create a new timetable
   */
  createTimetable = async (
    name: string,
    organizationId: number,
    academicYear: string,
    planSettingsId?: number,
    description?: string
  ): Promise<Timetable> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("Authentication required");
    }
    
    const response = await axios.post(`${API_URL}/timetable/create`, {
      name,
      organizationId,
      academicYear,
      description,
      isActive: true,
      isPublished: false,
      planSettingsId // Include planSettingsId
    }, {
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  };

  /**
   * Get bindings for a specific organization
   */
  getBindingsByOrganization = async (organizationId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/bindings/organization/${organizationId}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching bindings for organization ${organizationId}:`, error);
      return [];
    }
  };

  /**
   * Get a timetable by ID
   */
  getTimetableById = async (id: string): Promise<Timetable> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/timetable/${id}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching timetable by ID:', error);
      throw error;
    }
  };
}

export default new ManualSchedulingService(); 
