import { api } from '../../type/Timetable/mockData';
import { MockTimetableService } from './mockTimetableService';

// Initialize the mock service
MockTimetableService.initialize();

// Export the enhanced API that uses our mock service
export const enhancedApi = {
  ...api,
  
  // Override the API functions to use our service
  getTimetableEntries: async (timetableId: string) => {
    return MockTimetableService.getEntriesByTimetable(timetableId);
  },

  getTimetableEntriesByDay: async (timetableId: string, day: number) => {
    return MockTimetableService.getEntriesByDay(timetableId, day);
  },

  // Manual scheduling APIs
  addTimetableEntry: async (entry: any) => {
    return MockTimetableService.addEntry(entry);
  },

  updateTimetableEntry: async (entry: any) => {
    return MockTimetableService.updateEntry(entry);
  },

  deleteTimetableEntry: async (entryId: string) => {
    return MockTimetableService.deleteEntry(entryId);
  }
};
