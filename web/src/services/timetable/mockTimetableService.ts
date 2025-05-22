import { 
  Timetable, 
  TimetableEntry, 
  Binding, 
  Teacher, 
  Subject, 
  ClassGroup, 
  Room, 
  ScheduleSlot, 
  SchedulePreference 
} from '../../type/Timetable/types';

// Import the mock data
import { 
  mockTimetables, 
  mockTimetableEntries, 
  mockBindings, 
  mockTeachers, 
  mockSubjects, 
  mockClasses, 
  mockRooms, 
  mockScheduleSlots, 
  mockPreferences,
  api
} from '../../type/Timetable/mockData';

// Create a service to manage the mock data
export const MockTimetableService = {
  // Internal state to track changes
  _timetables: [...mockTimetables],
  _entries: [...mockTimetableEntries],
  _bindings: [...mockBindings],
  _teachers: [...mockTeachers],
  _subjects: [...mockSubjects],
  _classes: [...mockClasses],
  _rooms: [...mockRooms],
  _slots: [...mockScheduleSlots],
  _preferences: [...mockPreferences],

  // Initialize from localStorage if available
  initialize() {
    try {
      const savedData = localStorage.getItem('manualScheduleData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.entries && Array.isArray(parsedData.entries)) {
          // Convert the saved entries to the format expected by the mock API
          this._entries = parsedData.entries.map(entry => ({
            id: entry.uuid,
            timetableId: 't1', // Default timetable ID
            bindingId: entry.bindingId,
            day: entry.dayOfWeek,
            period: entry.periodId,
            binding: this._bindings.find(b => b.id === entry.bindingId) || mockBindings[0]
          }));
          console.log('Initialized mock data service with', this._entries.length, 'entries from localStorage');
        }
      }
    } catch (error) {
      console.error('Error initializing mock data service:', error);
    }
  },

  // Save current state to localStorage
  saveToLocalStorage() {
    try {
      const dataToSave = {
        entries: this._entries.map(entry => ({
          id: entry.id,
          timetableId: entry.timetableId,
          bindingId: entry.bindingId,
          day: entry.day,
          period: entry.period,
          binding: entry.binding
        })),
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('mockTimetableData', JSON.stringify(dataToSave));
      console.log('Saved mock data to localStorage:', dataToSave.entries.length, 'entries');
      return true;
    } catch (error) {
      console.error('Error saving mock data to localStorage:', error);
      return false;
    }
  },

  // Update the mock data with entries from UI
  updateFromUIEntries(uiEntries: any[]) {
    if (!Array.isArray(uiEntries)) {
      console.error('Invalid entries format provided to updateFromUIEntries');
      return false;
    }

    try {
      // Convert UI entries to the format expected by the mock API
      this._entries = uiEntries.map(entry => ({
        id: entry.uuid,
        timetableId: 't1', // Default timetable ID
        bindingId: entry.bindingId,
        day: entry.dayOfWeek,
        period: entry.periodId,
        binding: this._bindings.find(b => b.id === entry.bindingId) || mockBindings[0]
      }));

      // Save the updated entries
      this.saveToLocalStorage();
      console.log('Updated mock data from UI entries:', this._entries.length, 'entries');
      return true;
    } catch (error) {
      console.error('Error updating mock data from UI entries:', error);
      return false;
    }
  },

  // Add a new entry
  addEntry(entry: Omit<TimetableEntry, 'id'>) {
    const newEntry = {
      ...entry,
      id: `e${this._entries.length + 1}`
    } as TimetableEntry;
    
    this._entries.push(newEntry);
    this.saveToLocalStorage();
    return newEntry;
  },

  // Update an existing entry
  updateEntry(entry: TimetableEntry) {
    const index = this._entries.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      this._entries[index] = entry;
      this.saveToLocalStorage();
    }
    return entry;
  },

  // Delete an entry
  deleteEntry(entryId: string) {
    const index = this._entries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      this._entries.splice(index, 1);
      this.saveToLocalStorage();
      return true;
    }
    return false;
  },

  // Get all entries
  getAllEntries() {
    return [...this._entries];
  },

  // Get entries for a specific timetable
  getEntriesByTimetable(timetableId: string) {
    return this._entries.filter(e => e.timetableId === timetableId);
  },

  // Get entries for a specific day
  getEntriesByDay(timetableId: string, day: number) {
    return this._entries.filter(e => e.timetableId === timetableId && e.day === day);
  }
};

// Initialize the service
MockTimetableService.initialize();

// Override the mock API functions to use our service
const originalApi = { ...api };

// Override the API functions to use our service
export const enhancedApi = {
  ...originalApi,
  
  // Timetable APIs
  getTimetables: async (): Promise<Timetable[]> => {
    return MockTimetableService._timetables;
  },

  getTimetable: async (uuid: string): Promise<Timetable | undefined> => {
    return MockTimetableService._timetables.find(t => t.uuid === uuid);
  },

  getTimetableEntries: async (timetableId: string): Promise<TimetableEntry[]> => {
    return MockTimetableService.getEntriesByTimetable(timetableId);
  },

  getTimetableEntriesByDay: async (timetableId: string, day: number): Promise<TimetableEntry[]> => {
    return MockTimetableService.getEntriesByDay(timetableId, day);
  },

  // Manual scheduling APIs
  addTimetableEntry: async (entry: Omit<TimetableEntry, 'id'>): Promise<TimetableEntry> => {
    return MockTimetableService.addEntry(entry);
  },

  updateTimetableEntry: async (entry: TimetableEntry): Promise<TimetableEntry> => {
    return MockTimetableService.updateEntry(entry);
  },

  deleteTimetableEntry: async (entryId: string): Promise<boolean> => {
    return MockTimetableService.deleteEntry(entryId);
  }
};
