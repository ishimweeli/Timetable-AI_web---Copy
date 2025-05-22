import axios from 'axios';
import { TypeTimetable, TimetableEntry } from '@/type/Timetable/TypeTimetable';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Helper function to get authentication headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');

    // Check if token already has 'Bearer' prefix
    const formattedToken = token?.startsWith('Bearer ')
        ? token
        : token ? `Bearer ${token}` : '';

    return {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': formattedToken
        }
    };
};

// Get all timetables for an organization with optional planSettingsId filter
const getAllTimetables = async (
    organizationId: number = 1,
    planSettingsId?: number
): Promise<TypeTimetable[]> => {
    try {
        let url = `${API_URL}/timetables?organizationId=${organizationId}`;
        if (planSettingsId) {
            url += `&planSettingsId=${planSettingsId}`;
        }

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching timetables:', error);
        throw error;
    }
};

// Get a timetable by UUID with plan settings
const getTimetableByUuid = async (uuid: string): Promise<TypeTimetable> => {
    try {
        const response = await axios.get(
            `${API_URL}/timetables/${uuid}`,
            getAuthHeaders()
        );
        
        const timetableData = response.data;
        
        // If timetable has planSettingUuid, fetch the plan settings
        if (timetableData.planSettingUuid) {
            try {
                const planSettingsResponse = await axios.get(
                    `${API_URL}/plan-settings/${timetableData.planSettingUuid}`,
                    getAuthHeaders()
                );
                
                // Add plan settings to timetable data
                if (planSettingsResponse.data && planSettingsResponse.data.data) {
                    timetableData.planSettings = planSettingsResponse.data.data;
                }
            } catch (planSettingsError) {
                console.error('Error fetching plan settings:', planSettingsError);
                // Continue with timetable data even if plan settings fetch fails
            }
        }
        
        return timetableData;
    } catch (error) {
        console.error('Error fetching timetable by UUID:', error);
        throw error;
    }
};

// Get timetable entries by UUID with pagination and filters
const getTimetableEntriesByUuid = async (
    uuid: string,
    params?: {
        page?: number;
        size?: number;
        day?: string;
        subject?: string;
        teacher?: string;
        room?: string;
        lockStatus?: string;
        keyword?: string;
        planSettingsId?: number;
    }
): Promise<{
    data: TimetableEntry[];
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    currentPage: number;
}> => {
    try {
        let url = `${API_URL}/timetables/${uuid}/entries`;
        
        // Add query parameters if provided
        if (params) {
            const queryParams = new URLSearchParams();
            
            if (params.page !== undefined) {
                queryParams.append('page', params.page.toString());
            }
            
            if (params.size !== undefined) {
                queryParams.append('size', params.size.toString());
            }
            
            if (params.day) {
                queryParams.append('day', params.day);
            }
            
            if (params.subject) {
                queryParams.append('subject', params.subject);
            }
            
            if (params.teacher) {
                queryParams.append('teacher', params.teacher);
            }
            
            if (params.room) {
                queryParams.append('room', params.room);
            }
            
            if (params.lockStatus) {
                queryParams.append('lockStatus', params.lockStatus);
            }
            
            if (params.keyword) {
                queryParams.append('keyword', params.keyword);
            }
            
            if (params.planSettingsId) {
                queryParams.append('planSettingsId', params.planSettingsId.toString());
            }
            
            const queryString = queryParams.toString();
            if (queryString) {
                url += `?${queryString}`;
            }
        }

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching timetable entries:', error);
        throw error;
    }
};

// Get timetable entries by day with optional planSettingsId
const getTimetableEntriesByDay = async (
    uuid: string,
    dayOfWeek: number,
    planSettingsId?: number
): Promise<TimetableEntry[]> => {
    try {
        let url = `${API_URL}/timetables/${uuid}/entries/day/${dayOfWeek}`;
        if (planSettingsId) {
            url += `?planSettingsId=${planSettingsId}`;
        }

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching timetable entries by day:', error);
        throw error;
    }
};

// Get timetable entries by subject with optional planSettingsId
const getTimetableEntriesBySubject = async (
    uuid: string,
    subjectUuid: string,
    planSettingsId?: number
): Promise<TimetableEntry[]> => {
    try {
        let url = `${API_URL}/timetables/${uuid}/entries/subject/${subjectUuid}`;
        if (planSettingsId) {
            url += `?planSettingsId=${planSettingsId}`;
        }

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching timetable entries by subject:', error);
        throw error;
    }
};

// Get timetable entries by room with optional planSettingsId
const getTimetableEntriesByRoom = async (
    uuid: string,
    roomUuid: string,
    planSettingsId?: number
): Promise<TimetableEntry[]> => {
    try {
        let url = `${API_URL}/timetables/${uuid}/entries/room/${roomUuid}`;
        if (planSettingsId) {
            url += `?planSettingsId=${planSettingsId}`;
        }

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching timetable entries by room:', error);
        throw error;
    }
};

// Get latest timetable with plan settings
const getLatestTimetable = async (
    organizationId: number = 1,
    planSettingsId?: number
): Promise<TypeTimetable> => {
    try {
        let url = `${API_URL}/timetables/latest?organizationId=${organizationId}`;
        if (planSettingsId) {
            url += `&planSettingsId=${planSettingsId}`;
        }

        const headers = getAuthHeaders();
        const response = await axios.get(url, headers);
        let processedData = response.data;

        if (response.data.modifiedDate) {
            processedData.modifiedDate = response.data.modifiedDate;
        }
        if (response.data.generatedDate) {
            processedData.generatedDate = response.data.generatedDate;
        }
        
        // If timetable has planSettingUuid, fetch the plan settings
        if (processedData.planSettingUuid) {
            try {
                const planSettingsResponse = await axios.get(
                    `${API_URL}/plan-settings/${processedData.planSettingUuid}`,
                    getAuthHeaders()
                );
                
                // Add plan settings to timetable data
                if (planSettingsResponse.data && planSettingsResponse.data.data) {
                    processedData.planSettings = planSettingsResponse.data.data;
                }
            } catch (planSettingsError) {
                // Continue with timetable data even if plan settings fetch fails
            }
        }

        return processedData;
    } catch (error) {
        if (axios.isAxiosError(error)) {
        }
        throw error;
    }
};

const filterTimetableEntries = async (
    uuid: string,
    subjectIds?: number[],
    roomIds?: number[],
    teacherIds?: number[],
    classIds?: number[],
    planSettingsId?: number
): Promise<TimetableEntry[]> => {
    try {
        let url = `${API_URL}/timetables/${uuid}/filter?`;

        if (subjectIds && subjectIds.length > 0 && subjectIds[0] !== -1) {
            url += `subjectIds=${subjectIds.join(',')}&`;
        }

        if (roomIds && roomIds.length > 0 && roomIds[0] !== -1) {
            url += `roomIds=${roomIds.join(',')}&`;
        }

        if (teacherIds && teacherIds.length > 0 && teacherIds[0] !== -1) {
            url += `teacherIds=${teacherIds.join(',')}&`;
        }

        if (classIds && classIds.length > 0 && classIds[0] !== -1) {
            url += `classIds=${classIds.join(',')}&`;
        }

        if (planSettingsId) {
            url += `planSettingsId=${planSettingsId}&`;
        }

        url = url.replace(/[&?]$/, '');

        const response = await axios.get(url, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error filtering timetable entries:', error);
        throw error;
    }
};

const updateTimetableEntryPositions = async (
    uuid: string,
    entryPositions: any[],
    operation: string = 'swap'
): Promise<any> => {
    try {
        const response = await axios.put(
            `${API_URL}/timetables/${uuid}/entry-positions?operation=${operation}`,
            entryPositions,
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error updating timetable entry positions:', error);
        throw error;
    }
};


const updateTimetableEntryLockStatus = async (
    entryUuid: string,
    isLocked: boolean
): Promise<TimetableEntry> => {
    try {
        const url = `${API_URL}/timetables/entries/${entryUuid}/lock?isLocked=${isLocked}`;
        const response = await axios.put(
            url,
            {},
            getAuthHeaders()
        );
        return response.data.data; 
    } catch (error) {
        throw error;
    }
};


const bulkUpdateTimetableEntriesLockStatus = async (
    timetableUuid: string,
    entryUuids: string[],
    isLocked: boolean
): Promise<any> => {
    try {
        const url = `${API_URL}/timetables/entries/bulk-lock`;
        const response = await axios.put(
            url,
            entryUuids,
            {
                params: {
                    timetableUuid,
                    isLocked
                },
                ...getAuthHeaders()
            }
        );
        return response.data.data;
    } catch (error) {
        console.error('Error updating timetable entries lock status:', error);
        throw error;
    }
};

// Restore a deleted timetable entry
const restoreTimetableEntry = async (
    uuid: string,
    dayOfWeek: number,
    period: number
): Promise<TimetableEntry[]> => {
    try {
        const response = await axios.put(
            `${API_URL}/timetables/${uuid}/restore-entry?dayOfWeek=${dayOfWeek}&period=${period}`,
            {},
            getAuthHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('Error restoring timetable entry:', error);
        throw error;
    }
};

export const TimetableService = {
    getAllTimetables,
    getTimetableByUuid,
    getTimetableEntriesByUuid,
    getTimetableEntriesByDay,
    getTimetableEntriesBySubject,
    getTimetableEntriesByRoom,
    getLatestTimetable,
    filterTimetableEntries,
    updateTimetableEntryPositions,
    updateTimetableEntryLockStatus,
    bulkUpdateTimetableEntriesLockStatus,
    restoreTimetableEntry,

    // Create a new timetable
    async createTimetable(timetable: Partial<TypeTimetable>): Promise<TypeTimetable> {
        try {
            const response = await axios.post(`${API_URL}/timetables`, timetable, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error creating timetable:', error);
            throw error;
        }
    },


    async updateTimetable(uuid: string, timetable: Partial<TypeTimetable>): Promise<TypeTimetable> {
        try {
            const response = await axios.put(`${API_URL}/timetables/${uuid}`, timetable, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error updating timetable:', error);
            throw error;
        }
    },


    async deleteTimetable(uuid: string): Promise<void> {
        try {
            await axios.delete(`${API_URL}/timetables/${uuid}`, getAuthHeaders());
        } catch (error) {
            console.error('Error deleting timetable:', error);
            throw error;
        }
    },

   
    async publishTimetable(uuid: string): Promise<TypeTimetable> {
        try {
            const response = await axios.put(`${API_URL}/timetables/${uuid}/publish`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error publishing timetable:', error);
            throw error;
        }
    },


    async unpublishTimetable(uuid: string): Promise<TypeTimetable> {
        try {
            const response = await axios.put(`${API_URL}/timetables/${uuid}/unpublish`, {}, getAuthHeaders());
            return response.data;
        } catch (error) {
            console.error('Error unpublishing timetable:', error);
            throw error;
        }
    }
};

export default TimetableService;