// src/store/Calendar/SliceCalendar.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PreferenceType, PendingChange } from "@/type/Calendar/TypeCalendar";

interface CalendarState {
  selectedPreferenceType: PreferenceType | null;
  pendingChanges: PendingChange[];
  selectedScheduleIds: string[];
  error: string | null;
  isLoading: boolean;
}

const initialState: CalendarState = {
  selectedPreferenceType: null,
  pendingChanges: [],
  selectedScheduleIds: [],
  error: null,
  isLoading: false,
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setSelectedPreferenceType: (state, action: PayloadAction<PreferenceType | null>) => {
      state.selectedPreferenceType = action.payload;
    },
    setSelectedScheduleIds: (state, action: PayloadAction<string[]>) => {
      state.selectedScheduleIds = action.payload;
    },
    addPendingChange: (state, action: PayloadAction<PendingChange>) => {
      // Check if we already have a pending change for this cell
      const existingChangeIndex = state.pendingChanges.findIndex(
        (change) => change.cellIndex === action.payload.cellIndex
      );
      
      if (existingChangeIndex >= 0) {
        // Replace the existing change
        state.pendingChanges[existingChangeIndex] = action.payload;
      } else {
        // Add a new change
        state.pendingChanges.push(action.payload);
      }
    },
    removePendingChange: (state, action: PayloadAction<string>) => {
      state.pendingChanges = state.pendingChanges.filter(
        (change) => change.cellIndex !== action.payload
      );
    },
    clearPendingChanges: (state) => {
      state.pendingChanges = [];
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setSelectedPreferenceType,
  setSelectedScheduleIds,
  addPendingChange,
  removePendingChange,
  clearPendingChanges,
  setError,
  setIsLoading,
} = calendarSlice.actions;

export default calendarSlice.reducer;