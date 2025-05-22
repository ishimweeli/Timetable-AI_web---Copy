import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TimetableService } from '@/services/timetable/TimetableService';
import { TypeTimetable } from '@/type/Timetable/TypeTimetable';
import { TimetableEntry } from '@/type/Timetable/TypeTimetable';
import axios from 'axios';
import { RootState } from '@/store/index'; // Using your local import path

interface TimetableState {
    timetables: TypeTimetable[];
    currentTimetable: TypeTimetable | null;
    filteredEntries: TimetableEntry[] | null;
    loading: {
        timetables: boolean;
        currentTimetable: boolean;
        filteredEntries: boolean;
    };
    error: {
        timetables: string | null;
        currentTimetable: string | null;
        filteredEntries: string | null;
    };
}

const initialState: TimetableState = {
    timetables: [],
    currentTimetable: null,
    filteredEntries: null,
    loading: {
        timetables: false,
        currentTimetable: false,
        filteredEntries: false,
    },
    error: {
        timetables: null,
        currentTimetable: null,
        filteredEntries: null,
    },
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export const fetchAllTimetables = createAsyncThunk(
    'timetable/fetchAll',
    async (organizationId: number = 1, { rejectWithValue }) => {
        try {
            return await TimetableService.getAllTimetables(organizationId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch timetables');
        }
    }
);

export const fetchTimetableByUuid = createAsyncThunk(
    'timetable/fetchByUuid',
    async (uuid: string, { rejectWithValue }) => {
        try {
            return await TimetableService.getTimetableByUuid(uuid);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch timetable');
        }
    }
);

export const fetchLatestTimetable = createAsyncThunk(
    'timetable/fetchLatest',
    async (organizationId: number = 1, { rejectWithValue }) => {
        try {
            return await TimetableService.getLatestTimetable(organizationId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch latest timetable');
        }
    }
);

// Added from remote
export const fetchTimetableByPlanSettingUuid = createAsyncThunk(
    'timetable/fetchByPlanSettingUuid',
    async ({ planSettingUuid, organizationId = 1 }: { planSettingUuid: string, organizationId?: number }, { rejectWithValue }) => {
        try {
            const timetables = await TimetableService.getAllTimetables(organizationId);

            const matchingTimetable = timetables.find(t => t.planSettingUuid === planSettingUuid);

            if (matchingTimetable) {
                return await TimetableService.getTimetableByUuid(matchingTimetable.uuid);
            }

            return rejectWithValue(`No timetable found for plan setting UUID: ${planSettingUuid}`);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch timetable by plan setting');
        }
    }
);

export const filterTimetableEntries = createAsyncThunk(
    'timetable/filterEntries',
    async ({
        uuid,
        subjectIds,
        roomIds,
        teacherIds,
        classIds
    }: {
        uuid: string;
        subjectIds?: number[];
        roomIds?: number[];
        teacherIds?: number[];
        classIds?: number[];
    }, { rejectWithValue, getState }) => {
        try {
            // Get current timetable from state to use as fallback
            const state = getState() as RootState;
            const currentTimetable = state.timetable.currentTimetable;
            
            // Only send the API request if we have actual filters to apply
            if ((teacherIds && teacherIds.length > 0) || 
                (roomIds && roomIds.length > 0) || 
                (subjectIds && subjectIds.length > 0) || 
                (classIds && classIds.length > 0)) {
                
                try {
                    const response = await TimetableService.filterTimetableEntries(
                        uuid,
                        subjectIds,
                        roomIds,
                        teacherIds,
                        classIds
                    );
                    
                    if (currentTimetable) {
                        const daysPerWeek = currentTimetable.endDay - currentTimetable.startDay + 1;
                        const periodsPerDay = Math.max(...currentTimetable.entries.map(e => e.period), 0);
                        
                        if (response && Array.isArray(response)) {
                            const allSlots = new Map();
                            
                            // Create slots for all day/period combinations
                            for (const day of Array.from({ length: daysPerWeek }, (_, i) => currentTimetable.startDay + i)) {
                                const periods = Array.from({ length: periodsPerDay }, (_, i) => i + 1);
                                for (const period of periods) {
                                    const key = `${day}-${period}`;
                                    allSlots.set(key, null);
                                }
                            }
                            
                            // Fill in the filtered entries
                            response.forEach(entry => {
                                const key = `${entry.dayOfWeek}-${entry.period}`;
                                allSlots.set(key, entry);
                            });
                            
                            // Create a new entries array with filtered entries and empty placeholders
                            const combinedEntries = Array.from(allSlots.entries()).map(([key, entry]) => {
                                if (entry) return entry;
                                
                                // If no entry exists for this slot, create an empty placeholder
                                const [dayOfWeek, period] = key.split('-').map(Number);
                                
                                // Find a template entry with the same period to copy structure
                                const templateEntry = currentTimetable.entries.find(e => e.period === period);
                                
                                if (!templateEntry) return null;
                                
                                // Create an empty entry placeholder
                                return {
                                    id: null,
                                    uuid: `empty-${dayOfWeek}-${period}`,
                                    timetableId: currentTimetable.id,
                                    dayOfWeek,
                                    period,
                                    teacherId: null,
                                    teacherUuid: null,
                                    teacherName: null,
                                    teacherInitials: null,
                                    roomId: null,
                                    roomUuid: null,
                                    roomName: null,
                                    roomInitials: null,
                                    subjectId: null,
                                    subjectUuid: null,
                                    subjectName: null,
                                    subjectInitials: null,
                                    classId: null,
                                    classUuid: null,
                                    className: null,
                                    classInitials: null,
                                    periodType: 'Regular',
                                    isEmpty: true
                                };
                            }).filter(Boolean);
                            
                            return combinedEntries;
                        }
                    }
                    
                    return response;
                } catch (error) {
                    console.error('Error filtering timetable entries:', error);
                    return rejectWithValue('Failed to filter timetable entries');
                }
            } else {
                // If no filters are specified, just clear filtered entries
                return null;
            }
        } catch (error) {
            return rejectWithValue('Failed to filter timetable entries');
        }
    }
);

export const updateTimetableEntryPositions = createAsyncThunk(
    'timetable/updateEntryPositions',
    async ({ uuid, entryPositions, operation = 'swap' }, { rejectWithValue }) => {
        try {
            const response = await TimetableService.updateTimetableEntryPositions(
                uuid, 
                entryPositions, 
                operation
            );
            return response;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update entry positions'
            );
        }
    }
);

// Added from remote
export const updateTimetableEntryLockStatus = createAsyncThunk(
    'timetable/updateEntryLockStatus',
    async ({
               entryUuid,
               isLocked
           }: {
        entryUuid: string;
        isLocked: boolean;
    }, { rejectWithValue }) => {
        try {

            return await TimetableService.updateTimetableEntryLockStatus(
                entryUuid,
                isLocked
            );
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to update timetable entry lock status');
        }
    }
);

// Added from remote
export const bulkUpdateTimetableEntriesLockStatus = createAsyncThunk(
    'timetable/bulkUpdateEntriesLockStatus',
    async ({
               timetableUuid,
               entryUuids,
               isLocked
           }: {
        timetableUuid: string;
        entryUuids: string[];
        isLocked: boolean;
    }, { rejectWithValue }) => {
        try {
            return await TimetableService.bulkUpdateTimetableEntriesLockStatus(
                timetableUuid,
                entryUuids,
                isLocked
            );
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to bulk update timetable entries lock status');
        }
    }
);

export const restoreTimetableEntry = createAsyncThunk(
    'timetable/restoreEntry',
    async ({
        uuid,
        dayOfWeek,
        period
    }: {
        uuid: string;
        dayOfWeek: number;
        period: number;
    }, { rejectWithValue }) => {
        try {
            return await TimetableService.restoreTimetableEntry(
                uuid,
                dayOfWeek,
                period
            );
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : 'Failed to restore timetable entry');
        }
    }
);

const timetableSlice = createSlice({
    name: 'timetable',
    initialState,
    reducers: {
        clearFilteredEntries: (state) => {
            state.filteredEntries = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllTimetables.pending, (state) => {
                state.loading.timetables = true;
                state.error.timetables = null;
            })
            .addCase(fetchAllTimetables.fulfilled, (state, action) => {
                state.timetables = action.payload;
                state.loading.timetables = false;
            })
            .addCase(fetchAllTimetables.rejected, (state, action) => {
                state.loading.timetables = false;
                state.error.timetables = action.payload as string;
            });

        builder
            .addCase(fetchTimetableByUuid.pending, (state) => {
                state.loading.currentTimetable = true;
                state.error.currentTimetable = null;
            })
            .addCase(fetchTimetableByUuid.fulfilled, (state, action) => {
                state.currentTimetable = action.payload;
                state.loading.currentTimetable = false;
            })
            .addCase(fetchTimetableByUuid.rejected, (state, action) => {
                state.loading.currentTimetable = false;
                state.error.currentTimetable = action.payload as string;
            });

        builder
            .addCase(fetchLatestTimetable.pending, (state) => {
                state.loading.currentTimetable = true;
                state.error.currentTimetable = null;
            })
            .addCase(fetchLatestTimetable.fulfilled, (state, action) => {
                state.currentTimetable = action.payload;
                state.loading.currentTimetable = false;
            })
            .addCase(fetchLatestTimetable.rejected, (state, action) => {
                state.loading.currentTimetable = false;
                state.error.currentTimetable = action.payload as string;
            });

        // Added from remote
        builder
            .addCase(fetchTimetableByPlanSettingUuid.pending, (state) => {
                state.loading.currentTimetable = true;
                state.error.currentTimetable = null;
            })
            .addCase(fetchTimetableByPlanSettingUuid.fulfilled, (state, action) => {
                state.currentTimetable = action.payload;
                state.loading.currentTimetable = false;
            })
            .addCase(fetchTimetableByPlanSettingUuid.rejected, (state, action) => {
                state.loading.currentTimetable = false;
                state.error.currentTimetable = action.payload as string;
            });

        builder
            .addCase(filterTimetableEntries.pending, (state) => {
                state.loading.filteredEntries = true;
                state.error.filteredEntries = null;
            })
            .addCase(filterTimetableEntries.fulfilled, (state, action) => {
                state.filteredEntries = action.payload;
                state.loading.filteredEntries = false;
            })
            .addCase(filterTimetableEntries.rejected, (state, action) => {
                state.loading.filteredEntries = false;
                state.error.filteredEntries = action.payload as string;
            });

        builder
            .addCase(updateTimetableEntryPositions.pending, (state) => {
                state.loading.filteredEntries = true;
                state.error.filteredEntries = null;
            })
            .addCase(updateTimetableEntryPositions.fulfilled, (state, action) => {
                if (state.currentTimetable && state.currentTimetable.entries) {
                    const updatedEntries = action.payload;

                    updatedEntries.forEach(updatedEntry => {
                        const index = state.currentTimetable.entries.findIndex(
                            entry => entry.uuid === updatedEntry.uuid
                        );

                        if (index !== -1) {
                            state.currentTimetable.entries[index] = updatedEntry;
                        }
                    });
                }

                state.loading.filteredEntries = false;
            })
            .addCase(updateTimetableEntryPositions.rejected, (state, action) => {
                state.loading.filteredEntries = false;
                state.error.filteredEntries = action.payload as string;
            });

        builder
            .addCase(updateTimetableEntryLockStatus.pending, (state) => {
                state.loading.filteredEntries = true;
                state.error.filteredEntries = null;
            })
            .addCase(updateTimetableEntryLockStatus.fulfilled, (state, action) => {
                const updatedEntry = action.payload;

                if (state.currentTimetable && state.currentTimetable.entries) {
                    const index = state.currentTimetable.entries.findIndex(
                        entry => entry.id === updatedEntry.id
                    );

                    if (index !== -1) {
                        state.currentTimetable.entries[index] = updatedEntry;
                    }
                }

                if (state.filteredEntries) {
                    const index = state.filteredEntries.findIndex(
                        entry => entry.id === updatedEntry.id
                    );

                    if (index !== -1) {
                        state.filteredEntries[index] = updatedEntry;
                    }
                }

                state.loading.filteredEntries = false;
            })
            .addCase(updateTimetableEntryLockStatus.rejected, (state, action) => {
                state.loading.filteredEntries = false;
                state.error.filteredEntries = action.payload as string;
            });

        builder
            .addCase(bulkUpdateTimetableEntriesLockStatus.pending, (state) => {
                state.loading.filteredEntries = true;
                state.error.filteredEntries = null;
            })
            .addCase(bulkUpdateTimetableEntriesLockStatus.fulfilled, (state, action) => {
                const updatedEntries = action.payload;

                if (state.currentTimetable && state.currentTimetable.entries) {
                    updatedEntries.forEach(updatedEntry => {
                        const index = state.currentTimetable.entries.findIndex(
                            entry => entry.uuid === updatedEntry.uuid
                        );

                        if (index !== -1) {
                            state.currentTimetable.entries[index] = updatedEntry;
                        }
                    });
                }

                if (state.filteredEntries) {
                    updatedEntries.forEach(updatedEntry => {
                        const index = state.filteredEntries.findIndex(
                            entry => entry.uuid === updatedEntry.uuid
                        );

                        if (index !== -1) {
                            state.filteredEntries[index] = updatedEntry;
                        }
                    });
                }

                state.loading.filteredEntries = false;
            })
            .addCase(bulkUpdateTimetableEntriesLockStatus.rejected, (state, action) => {
                state.loading.filteredEntries = false;
                state.error.filteredEntries = action.payload as string;
            });

        builder
            .addCase(restoreTimetableEntry.pending, (state) => {
                state.loading.currentTimetable = true;
                state.error.currentTimetable = null;
            })
            .addCase(restoreTimetableEntry.fulfilled, (state, action) => {
                if (state.currentTimetable && action.payload) {
                    // Add restored entries to the current timetable
                    action.payload.forEach(restoredEntry => {
                        // Find if there's an existing entry at this position
                        const existingIndex = state.currentTimetable.entries.findIndex(
                            entry => entry.dayOfWeek === restoredEntry.dayOfWeek && 
                                   entry.period === restoredEntry.period
                        );
                        
                        // Replace the entry if it exists, otherwise add it
                        if (existingIndex !== -1) {
                            state.currentTimetable.entries[existingIndex] = restoredEntry;
                        } else {
                            state.currentTimetable.entries.push(restoredEntry);
                        }
                    });
                }
                state.loading.currentTimetable = false;
            })
            .addCase(restoreTimetableEntry.rejected, (state, action) => {
                state.loading.currentTimetable = false;
                state.error.currentTimetable = action.payload as string;
            });
    },
});

export const { clearFilteredEntries } = timetableSlice.actions;
export default timetableSlice.reducer;