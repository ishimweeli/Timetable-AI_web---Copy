import axios from "axios";

import { API_URL } from "../baseUrl";

const entriesCache = {};
const CACHE_TIMEOUT = 5 * 60 * 1000;

export interface TimetableParams {
  organizationId: number;
  classId?: string;
  planSettingId: number;
  academicYear: string;
  semester: string;
}

export interface TimetableEntry {
  uuid?: string;
  timetableId: number; 
  bindingId: number;
  subjectId: number;
  teacherId: number;
  classId: number;
  roomId: number;
  dayOfWeek: number;
  period: number;
  periodId?: number;
  durationMinutes?: number;
  periodType?: string;
  status?: string;
  isManuallyScheduled?: boolean;
  classBandId?: number;
  isClassBandEntry?: boolean;
  subjectName?: string;
  teacherName?: string;
  roomName?: string;
  className?: string;
}

export interface Timetable {
  id: number;
  uuid: string;
  name?: string;
  description?: string;
  organizationId: number;
  planSettingId: number;
  academicYear: string;
  semester: string;
  isActive: boolean;
  isPublished: boolean;
  createdDate: string;
  modifiedDate: string;
  entries?: TimetableEntry[];
}

export interface Period {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  days: number[];
  planSettingsId: number;
  allowScheduling?: boolean;
  showInTimetable?: boolean;
  periodType?: string;
  periodNumber?: number;
}

export interface Binding {
  id: number;
  uuid: string;
  classId: number;
  classUuid: string;
  teacherId: number;
  teacherName: string;
  teacherFullName?: string;
  className: string;
  classBandId: string;
  classBandName: string;
  classSection?: string;
  subjectId: number;
  subjectName: string;
  roomId: number;
  roomName: string;
  periodsPerWeek: number;
  isFixed: boolean;
}

export interface ClassInfo {
  id: string;
  uuid?: string;
  name: string;
  initial: string;
}

export interface PlanSetting {
  id: number;
  name: string;
}

class TimetableGenerationService {
  findOrCreateTimetable = async (params: TimetableParams): Promise<Timetable> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.post(
        `${API_URL}/timetables/find-or-create`, 
        params,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          params: {
            createIfNotFound: true
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getTimetableEntries = async (timetableId: number | string): Promise<TimetableEntry[]> => {
    try {
      const cacheKey = String(timetableId);
      const cachedData = entriesCache[cacheKey];
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp) < CACHE_TIMEOUT) {
        return cachedData.data;
      }
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(
        `${API_URL}/manual-scheduling/entries/${timetableId}`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      let entries = [];
      
      if (response.data && typeof response.data === 'object') {
        if (Object.prototype.hasOwnProperty.call(response.data, 'data')) {
          entries = response.data.data || [];
        } else if (Array.isArray(response.data)) {
          entries = response.data;
        } else if (Object.prototype.hasOwnProperty.call(response.data, 'entries')) {
          entries = response.data.entries || [];
        }
      }
      
      entriesCache[cacheKey] = {
        data: entries,
        timestamp: now
      };
      
      return entries;
    } catch (error) {
      return [];
    }
  };

  saveTimetableEntries = async (timetableId: number, entries: TimetableEntry[]): Promise<any> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const validEntries = entries.filter(entry => {
        if (!entry.bindingId) {
          return false;
        }
        if (!entry.dayOfWeek) {
          return false;
        }
        if (!entry.period && entry.period !== 0) {
          return false;
        }
        
        return true;
      });
      
      if (validEntries.length !== entries.length) {
        if (validEntries.length === 0) {
          throw new Error("No valid entries to save");
        }
      }
      
      const response = await axios.post(
        `${API_URL}/manual-scheduling/entries/${timetableId}`,
        validEntries,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const cacheKey = String(timetableId);
      delete entriesCache[cacheKey];
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  mapBindingToEntry = (
    binding: any, 
    timetableId: number, 
    dayOfWeek: number, 
    periodId: number
  ): TimetableEntry => {
    return {
      timetableId,
      bindingId: binding.id,
      subjectId: binding.subjectId,
      teacherId: binding.teacherId,
      classId: binding.classId,
      roomId: binding.roomId,
      dayOfWeek,
      period: periodId,
      durationMinutes: 45,
      periodType: "Regular",
      status: "Active",
      isManuallyScheduled: true
    };
  };

  deleteEntry = async (entryId: string | number): Promise<any> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const entryIdStr = String(entryId);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entryIdStr);
      
      let url;
      if (isUuid) {
        url = `${API_URL}/manual-scheduling/entry/${entryIdStr}`;
      } else {
        const numericId = parseInt(entryIdStr, 10);
        if (isNaN(numericId)) {
          throw new Error(`Invalid entry ID format: ${entryIdStr}.`);
        }
        url = `${API_URL}/manual-scheduling/entry/${numericId}`;
      }
      
      const response = await axios.delete(
        url,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        }
      );
      
      Object.keys(entriesCache).forEach(key => {
        delete entriesCache[key];
      });
      
      try {
        return response.data;
      } catch (e) {
        return { success: true };
      }
    } catch (error) {
      let userErrorMessage = 'Failed to delete entry';
      
      if (error instanceof Error && error.message) {
        userErrorMessage += `: ${error.message}`;
      }
      
      throw new Error(userErrorMessage);
    }
  };

  getTimetableById = async (id: number): Promise<Timetable> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(
        `${API_URL}/timetables/${id}`,
        {
          headers: {
            'Authorization': token
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getTimetablesByOrganization = async (organizationId: number): Promise<Timetable[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(
        `${API_URL}/timetables/organization/${organizationId}`,
        {
          headers: {
            'Authorization': token
          }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      return [];
    }
  };

  generateAndSaveEntries = async (
    params: TimetableParams,
    entries: any[],
    bindings: any[]
  ): Promise<{timetable: Timetable, savedEntries: TimetableEntry[]}> => {
    try {
      const timetable = await this.findOrCreateTimetable(params);
      
      const mappedEntries = entries.map(entry => {
        let binding;
        if (typeof entry.bindingId === 'number') {
          binding = bindings.find(b => b.id === entry.bindingId);
        } else {
          binding = bindings.find(b => b.uuid === entry.bindingId);
        }
        if (!binding) {
          throw new Error(`No binding found for entry with bindingId: ${entry.bindingId}`);
        }
        return {
          timetableId: timetable.id,
          bindingId: binding.id,
          dayOfWeek: entry.dayOfWeek,
          period: entry.periodId,
          roomId: binding.roomId,
          subjectId: binding.subjectId,
          teacherId: binding.teacherId,
          classId: binding.classId,
          status: entry.status || "Active",
          durationMinutes: entry.durationMinutes || 45,
          periodType: entry.periodType || "Regular",
          subjectName: binding.subjectName,
          teacherName: binding.teacherFullName,
          roomName: binding.roomName
        };
      });
      
      await this.saveTimetableEntries(timetable.id, mappedEntries);
      
      const savedEntries = await this.getTimetableEntries(timetable.id);
      
      return {
        timetable,
        savedEntries
      };
    } catch (error) {
      throw error;
    }
  };

  getPeriods = async (orgId: number, planSettingsId?: number): Promise<Period[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      if (!planSettingsId) {
        const storedPlanSettingsId = localStorage.getItem("selectedPlanSettingsId");
        if (storedPlanSettingsId) {
          planSettingsId = parseInt(storedPlanSettingsId, 10);
          if (isNaN(planSettingsId)) {
            planSettingsId = undefined;
          }
        }
      }

      if (planSettingsId) {
        localStorage.setItem("selectedPlanSettingsId", planSettingsId.toString());
      }
      
      const url = planSettingsId
          ? `${API_URL}/periods?page=0&size=90&sortBy=startTime&sortDirection=asc&keyword=&orgId=${orgId}&planSettingsId=${planSettingsId}`
          : `${API_URL}/periods?page=0&size=90&sortBy=startTime&sortDirection=asc&keyword=&orgId=${orgId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      
      if (!response.data || !response.data.data) {
        return [];
      }
      
      return response.data.data;
    } catch (error) {
      return [];
    }
  };

  getBindingsForClass = async (classUuid: string, orgId: number): Promise<Binding[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/bindings/classes/${classUuid}?orgId=${orgId}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      
      if (!response.data || !response.data.data) {
        return [];
      }
      
      return response.data.data;
    } catch (error) {
      return [];
    }
  };

  getClasses = async (orgId: number): Promise<ClassInfo[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/classes?sortDirection=asc&orgId=${orgId}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      
      if (!response.data || !response.data.data) {
        return [];
      }
      
      return response.data.data;
    } catch (error) {
      return [];
    }
  };
  
  getPlanSettings = async (orgId: number): Promise<PlanSetting[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await axios.get(`${API_URL}/plan-settings?orgId=${orgId}&sortDirection=asc`, {
        headers: {
          'Authorization': token,
          'Accept': '*/*',
        }
      });
      
      if (!response.data || !response.data.data) {
        return [];
      }
      
      return response.data.data;
    } catch (error) {
      return [];
    }
  };

  getClassBands = async (orgId: number, page: number = 0, size: number = 10): Promise<any[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await axios.get(`${API_URL}/class-bands?page=${page}&size=${size}&sortDirection=asc&orgId=${orgId}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      if (!response.data || !response.data.data) {
        return [];
      }
      return response.data.data;
    } catch (error) {
      return [];
    }
  };

  getBindingsForClassBand = async (classBandUuid: string): Promise<Binding[]> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }
      const response = await axios.get(`${API_URL}/bindings/class-bands/${classBandUuid}`, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      if (!response.data || !response.data.data) {
        return [];
      }
      return response.data.data;
    } catch (error) {
      return [];
    }
  };

  getClassTimetableEntries = async (classId) => {
    const token = localStorage.getItem("authToken");
    
    let numericClassId = classId;
    
    if (typeof classId === 'object' && classId !== null) {
      numericClassId = classId.id || null;
    } else if (typeof classId === 'string' && classId.includes('-')) {
      try {
        const parsedId = parseInt(classId.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsedId)) {
          numericClassId = parsedId;
        }
      } catch (e) {
        console.error("Error parsing class ID:", e);
      }
    } else if (typeof classId === 'string') {
      const parsedId = parseInt(classId, 10);
      if (!isNaN(parsedId)) {
        numericClassId = parsedId;
      }
    }
    
    if (!numericClassId) {
      console.error("Failed to extract valid class ID from:", classId);
      return [];
    }
    
    try {
      const response = await axios.get(`${API_URL}/manual-scheduling/entries/class/${numericClassId}`, {
        headers: { 'Authorization': token }
      });
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching timetable entries for class ${numericClassId}:`, error);
      return [];
    }
  };

  getClassBandTimetableEntries = async (classBandId) => {
    const token = localStorage.getItem("authToken");
    
    let numericClassBandId = classBandId;
    
    if (typeof classBandId === 'object' && classBandId !== null) {
      numericClassBandId = classBandId.id || null;
    } else if (typeof classBandId === 'string' && classBandId.includes('-')) {
      try {
        const parsedId = parseInt(classBandId.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(parsedId)) {
          numericClassBandId = parsedId;
        } else {
          const details = await this.getClassBandDetails(classBandId);
          if (details && details.data && details.data.id) {
            numericClassBandId = details.data.id;
          }
        }
      } catch (e) {
        console.error("Error parsing class band ID:", e);
      }
    } else if (typeof classBandId === 'string') {
      const parsedId = parseInt(classBandId, 10);
      if (!isNaN(parsedId)) {
        numericClassBandId = parsedId;
      }
    }
    
    if (!numericClassBandId) {
      console.error("Failed to extract valid class band ID from:", classBandId);
      return [];
    }
    
    try {
      const response = await axios.get(`${API_URL}/manual-scheduling/entries/class-band/${numericClassBandId}`, {
        headers: { 'Authorization': token }
      });
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching timetable entries for class band ${numericClassBandId}:`, error);
      return [];
    }
  };

  getClassBandDetails = async (classBandUuid: string): Promise<any> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await axios.get(
        `${API_URL}/class-bands/${classBandUuid}`,
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  saveSingleTimetableEntry = async (timetableId: number, entry: TimetableEntry): Promise<any> => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required");
      }

      const sanitizedEntry = {
        uuid: entry.uuid,
        timetableId: timetableId,
        bindingId: entry.bindingId,
        dayOfWeek: entry.dayOfWeek,
        period: entry.period || entry.periodId,
        roomId: entry.roomId,
        classId: entry.classId && typeof entry.classId === 'string' ? 
          ((entry.classId as string).includes('-') ? 
            parseInt((entry.classId as string).replace(/[^0-9]/g, ''), 10) || null : 
            parseInt(entry.classId as string, 10) || null) : 
          entry.classId,
        classBandId: entry.classBandId && typeof entry.classBandId === 'string' ? 
          ((entry.classBandId as string).includes('-') ? 
            parseInt((entry.classBandId as string).replace(/[^0-9]/g, ''), 10) || null : 
            parseInt(entry.classBandId as string, 10) || null) : 
          entry.classBandId,
        subjectId: entry.subjectId,
        teacherId: entry.teacherId,
        durationMinutes: entry.durationMinutes || 45,
        periodType: entry.periodType || "Regular",
        status: entry.status || "Active",
        isClassBandEntry: entry.isClassBandEntry || false,
        subjectName: entry.subjectName,
        teacherName: entry.teacherName,
        roomName: entry.roomName
      };
      
      const response = await axios.post(
        `${API_URL}/manual-scheduling/entries/${timetableId}`,
        [sanitizedEntry],
        {
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const cacheKey = String(timetableId);
      delete entriesCache[cacheKey];
      
      return response.data;
    } catch (error) {
      console.error('Error saving single entry:', error);
      throw error;
    }
  };

  handleSaveTimetableAndEntries = async (pendingEntries, bindings, params) => {
    if (pendingEntries.length === 0) {
      return { success: false, message: 'No pending entries to save' };
    }
    
    try {
      for (const entry of pendingEntries) {
        const binding = bindings.find(b => b.uuid === entry.bindingId);
        if (!binding) {
          throw new Error(`Invalid binding reference in entry: ${entry.subjectName || 'Unknown subject'}`);
        }
        if (!binding.id) {
          throw new Error(`Binding has missing integer ID for: ${binding.subjectName || 'Unknown subject'}`);
        }
      }

      const timetableResult = await this.findOrCreateTimetable(params);
      
      let allProcessedEntries = [];
      
      if (params.selectionType === 'classBand' && params.selectedClassBand) {
        let selectedClassBandId = params.selectedClassBand;
        
        if (typeof selectedClassBandId === 'object' && selectedClassBandId !== null) {
          selectedClassBandId = selectedClassBandId.uuid || selectedClassBandId.id;
        }
        
        const classBandResponse = await this.getClassBandDetails(selectedClassBandId);
        if (!classBandResponse?.data?.participatingClasses) {
          throw new Error('Failed to retrieve class band details');
        }
        
        const participatingClasses = classBandResponse.data.participatingClasses || [];
        if (participatingClasses.length === 0) {
          throw new Error('No participating classes found in the class band');
        }
        
        let classBandId;
        if (classBandResponse.data?.id) {
          classBandId = classBandResponse.data.id;
        } else if (classBandResponse.data?.data?.id) {
          classBandId = classBandResponse.data.data.id;
        } else {
          throw new Error('Could not determine class band ID');
        }
        
        for (const entry of pendingEntries) {
          let binding = bindings.find(b => b.uuid === entry.bindingId);
          if (!binding) binding = bindings.find(b => b.id === entry.bindingId) || {};
          
          for (const participatingClass of participatingClasses) {
            allProcessedEntries.push({
              ...entry,
              uuid: entry.uuid + '-' + participatingClass.uuid,
              timetableId: timetableResult.id,
              bindingId: binding.id,
              dayOfWeek: entry.dayOfWeek,
              period: entry.periodId,
              roomId: binding.roomId,
              classId: participatingClass.id,
              className: participatingClass.name,
              classSection: participatingClass.section,
              classBandId: classBandId,
              isClassBandEntry: true,
              subjectId: binding.subjectId,
              teacherId: binding.teacherId,
              durationMinutes: entry.durationMinutes || 45,
              periodType: entry.periodType || "Regular",
              status: entry.status || "Active",
              subjectName: binding.subjectName,
              teacherName: binding.teacherFullName || binding.teacherName || 
                (binding.teacherFirstName && binding.teacherLastName ? 
                  `${binding.teacherFirstName} ${binding.teacherLastName}` : 'No Teacher'),
              roomName: binding.roomName
            });
          }
        }
      } else {
        let selectedClassId = params.selectedClass;
        
        if (typeof selectedClassId === 'object' && selectedClassId !== null) {
          selectedClassId = selectedClassId.uuid || selectedClassId.id;
        }
        
        allProcessedEntries = pendingEntries.map(entry => {
          const binding = bindings.find(b => b.uuid === entry.bindingId) || {};
          
          let classIdValue;
          if (typeof entry.classId === 'number') {
            classIdValue = entry.classId;
          } else if (binding && typeof binding.classId === 'number') {
            classIdValue = binding.classId;
          } else {
            const classBinding = bindings.find(b => b.classUuid === selectedClassId);
            if (classBinding && typeof classBinding.classId === 'number') {
              classIdValue = classBinding.classId;
            } else {
              const parsedId = parseInt(selectedClassId, 10);
              if (!isNaN(parsedId)) {
                classIdValue = parsedId;
              }
            }
          }
          
          return {
            id: entry.id,
            uuid: entry.uuid,
            timetableId: timetableResult.id,
            bindingId: binding.id,
            dayOfWeek: entry.dayOfWeek,
            period: entry.periodId,
            roomId: binding.roomId,
            classId: classIdValue,
            subjectId: binding.subjectId,
            teacherId: binding.teacherId,
            durationMinutes: entry.durationMinutes || 45,
            periodType: entry.periodType || "Regular",
            status: entry.status || "Active",
            subjectName: binding.subjectName,
            teacherName: binding.teacherFullName || binding.teacherName || 
              (binding.teacherFirstName && binding.teacherLastName ? 
                `${binding.teacherFirstName} ${binding.teacherLastName}` : 'No Teacher'),
            roomName: binding.roomName
          };
        });
      }
      
      let successCount = 0;
      let failureCount = 0;
      
      for (let i = 0; i < allProcessedEntries.length; i++) {
        try {
          await this.saveSingleTimetableEntry(timetableResult.id, allProcessedEntries[i]);
          successCount++;
        } catch (error) {
          console.error(`Failed to save entry ${i+1}:`, error, allProcessedEntries[i]);
          failureCount++;
        }
      }
      
      return { 
        success: true, 
        timetable: timetableResult,
        successCount,
        failureCount,
        total: allProcessedEntries.length
      };
    } catch (error) {
      return { success: false, message: error.message || 'Unknown error' };
    }
  };
  
  handleManualSave = async (pendingEntries, bindings, timetableId, selectedClass, selectedClassBand, selectionType) => {
    if (pendingEntries.length === 0) {
      return { success: false, message: 'No pending entries to save' };
    }
    
    try {
      let entriesMapped = [];
      
      const hasClassBandEntries = pendingEntries.some(entry => 
        entry.isClassBandEntry && entry.classBandId && !entry.classId
      );

      if (hasClassBandEntries && selectionType === 'classBand' && selectedClassBand) {
        let selectedClassBandId = selectedClassBand;
        
        if (typeof selectedClassBandId === 'object' && selectedClassBandId !== null) {
          selectedClassBandId = selectedClassBandId.uuid || selectedClassBandId.id;
        }
        
        const classBandResponse = await this.getClassBandDetails(selectedClassBandId);
        if (!classBandResponse?.data?.participatingClasses) {
          throw new Error('Failed to retrieve class band details');
        }
        
        const participatingClasses = classBandResponse.data.participatingClasses || [];
        if (participatingClasses.length === 0) {
          throw new Error('No participating classes found in the class band');
        }
        
        const classBandId = classBandResponse.data?.id;
                
        for (const entry of pendingEntries) {
          if (entry.isClassBandEntry && entry.classBandId && !entry.classId) {
            let binding = bindings.find(b => b.uuid === entry.bindingId);
            if (!binding && typeof entry.bindingId === 'number') {
              binding = bindings.find(b => b.id === entry.bindingId);
            }
            binding = binding || {};
            
            for (const participatingClass of participatingClasses) {
              entriesMapped.push({
                ...entry,
                uuid: entry.uuid + '-' + participatingClass.uuid,
                classId: participatingClass.id,
                className: participatingClass.name,
                classSection: participatingClass.section,
                classBandId: classBandId,
                bindingId: binding.id,
                timetableId,
                period: entry.periodId,
                durationMinutes: entry.durationMinutes || 45,
                periodType: entry.periodType || "Regular",
                status: entry.status || "Active",
                subjectId: binding.subjectId,
                subjectName: binding.subjectName,
                teacherId: binding.teacherId,
                teacherName: entry.teacherName || binding.teacherFullName || binding.teacherName || 
                  (binding.teacherFirstName && binding.teacherLastName ? 
                    `${binding.teacherFirstName} ${binding.teacherLastName}` : 'No Teacher'),
                roomId: binding.roomId,
                roomName: binding.roomName
              });
            }
          } else {
            // Regular entry, just add it
            let binding = bindings.find(b => b.uuid === entry.bindingId);
            if (!binding && typeof entry.bindingId === 'number') {
              binding = bindings.find(b => b.id === entry.bindingId);
            }
            binding = binding || {};
            
            entriesMapped.push({
              ...entry,
              timetableId,
              bindingId: binding.id,
              period: entry.periodId,
              durationMinutes: entry.durationMinutes || 45,
              periodType: entry.periodType || "Regular",
              status: entry.status || "Active",
              teacherName: entry.teacherName || binding.teacherFullName || binding.teacherName || 
                (binding.teacherFirstName && binding.teacherLastName ? 
                  `${binding.teacherFirstName} ${binding.teacherLastName}` : 'No Teacher')
            });
          }
        }
              } else {
                // No class band entries to expand, map all entries
                entriesMapped = pendingEntries.map(entry => {
                  // First try to find binding by UUID, then by ID
                  let binding = bindings.find(b => b.uuid === entry.bindingId);
                  if (!binding && typeof entry.bindingId === 'number') {
                    binding = bindings.find(b => b.id === entry.bindingId);
                  }
                  binding = binding || {};
                  
                  // Ensure we have a valid numeric classId for normal class entries
                  let classIdValue = entry.classId;
                  if (!entry.isClassBandEntry && (classIdValue === undefined || classIdValue === null || typeof classIdValue === 'string')) {
                    if (binding && typeof binding.classId === 'number') {
                      classIdValue = binding.classId;
                    } else {
                      let selectedClassId = selectedClass;
                      if (typeof selectedClassId === 'object' && selectedClassId !== null) {
                        selectedClassId = selectedClassId.uuid || selectedClassId.id;
                      }
                      
                      const classBinding = bindings.find(b => b.classUuid === selectedClassId);
                      if (classBinding && typeof classBinding.classId === 'number') {
                        classIdValue = classBinding.classId;
                      } else {
                        const parsedId = parseInt(selectedClassId, 10);
                        if (!isNaN(parsedId)) {
                          classIdValue = parsedId;
                        }
                      }
                    }
                  }
                  
                  // Ensure we have a valid teacher name
                  const teacherName = 
                    entry.teacherName || 
                    binding.teacherFullName || 
                    binding.teacherName || 
                    (binding.teacherFirstName && binding.teacherLastName ? 
                      `${binding.teacherFirstName} ${binding.teacherLastName}` : 'No Teacher');
                  
                  return {
                    id: entry.id,
                    uuid: entry.uuid,
                    timetableId,
                    bindingId: binding.id,
                    dayOfWeek: entry.dayOfWeek,
                    period: entry.periodId,
                    roomId: binding.roomId,
                    classId: entry.isClassBandEntry ? undefined : classIdValue,
                    classBandId: entry.classBandId,
                    isClassBandEntry: entry.isClassBandEntry || (selectionType === 'classBand' ? true : false),
                    subjectId: binding.subjectId,
                    teacherId: binding.teacherId,
                    durationMinutes: entry.durationMinutes || 45,
                    periodType: entry.periodType || "Regular",
                    status: entry.status || "Active",
                    subjectName: binding.subjectName,
                    teacherName,
                    roomName: binding.roomName
                  };
                });
              }
              
              // Save entries one by one for better error handling
              let successCount = 0;
              let failureCount = 0;
              
              for (let i = 0; i < entriesMapped.length; i++) {
                try {
                  await this.saveSingleTimetableEntry(timetableId, entriesMapped[i]);
                  successCount++;
                } catch (error) {
                  console.error(`Failed to save entry ${i+1}:`, error, entriesMapped[i]);
                  failureCount++;
                }
              }
              
              // Return success info
              return { 
                success: true, 
                successCount,
                failureCount,
                total: entriesMapped.length
              };
            } catch (error) {
              return { success: false, message: error.message || 'Unknown error' };
            }
          };
          
          loadAndPrepareEntries = async (timetableId, selectionType, selectedClass, selectedClassBand, bindings) => {
            try {
              if (!timetableId) {
                return { success: false, message: 'No timetable ID available' };
              }
              
              // Fetch all entries for the timetable at once
              const allTimetableEntries = await this.getTimetableEntries(timetableId);
              
              let filteredEntries = [];
              
              if (selectionType === 'class' && selectedClass) {
                let numericClassId;
                
                if (typeof selectedClass === 'object' && selectedClass !== null) {
                  numericClassId = selectedClass.id;
                } else {
                  const classBinding = bindings.find(b => b.classUuid === selectedClass);
                  numericClassId = classBinding?.classId || parseInt(selectedClass, 10);
                }
                
                // Filter by classId
                filteredEntries = allTimetableEntries.filter(entry => {
                  // Convert both values to strings for comparison to avoid type mismatches
                  const entryClassId = String(entry.classId);
                  const targetClassId = String(numericClassId);
                  return entryClassId === targetClassId;
                });
              } 
              else if (selectionType === 'classBand' && selectedClassBand) {
                let numericClassBandId;
                
                if (typeof selectedClassBand === 'object' && selectedClassBand !== null) {
                  numericClassBandId = selectedClassBand.id;
                } else {
                  const classBandBinding = bindings.find(b => b.classBandUuid === selectedClassBand);
                  numericClassBandId = classBandBinding?.classBandId || parseInt(selectedClassBand, 10);
                }
                
                // Filter by classBandId
                filteredEntries = allTimetableEntries.filter(entry => {
                  // Convert both values to strings for comparison to avoid type mismatches
                  const entryClassBandId = String(entry.classBandId);
                  const targetClassBandId = String(numericClassBandId);
                  return entryClassBandId === targetClassBandId;
                });
              }
              
              return {
                success: true,
                allEntries: allTimetableEntries,
                filteredEntries,
                timestamp: new Date()
              };
            } catch (error) {
              return {
                success: false,
                message: error.message || 'Unknown error'
              };
            }
          };
        }
        
        export default new TimetableGenerationService();