import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  CalendarState,
  CellInfo,
  PreferenceType,
  PendingChange,
  ChangeOperationType,
} from "@/type/Calendar/TypeCalendar";

const initialState: CalendarState = {
  selectedCell: null,
  selectedScheduleIds: [],
  selectedPreferenceType: null,
  pendingChanges: [],
  error: null,
  isLoading: false,
};

const classBandCalendarSlice = createSlice({
  name: "classBandCalendar",
  initialState,
  reducers: {
    setSelectedCell: (state, action: PayloadAction<CellInfo | null>) => {
      state.selectedCell = action.payload;
    },

    setSelectedPreferenceType: (
      state,
      action: PayloadAction<PreferenceType | null>,
    ) => {
      state.selectedPreferenceType = action.payload;
    },

    addPendingChange: (state, action: PayloadAction<PendingChange>) => {
      // Check if there's already a pending change for this cell
      const cellIndex = action.payload.cellIndex;
      const existingIndex = state.pendingChanges.findIndex(
        (c) => c.cellIndex === cellIndex,
      );

      if(existingIndex !== -1) {
        // Replace the existing change with the new one
        state.pendingChanges[existingIndex] = action.payload;
      }else {
        // Add new pending change
        state.pendingChanges.push(action.payload);
      }
    },

    clearPendingChanges: (state) => {
      state.pendingChanges = [];
    },

    addSelectedScheduleId: (state, action: PayloadAction<string>) => {
      if(!state.selectedScheduleIds.includes(action.payload)) {
        state.selectedScheduleIds.push(action.payload);
      }
    },

    removeSelectedScheduleId: (state, action: PayloadAction<string>) => {
      state.selectedScheduleIds = state.selectedScheduleIds.filter(
        (id) => id !== action.payload,
      );
    },

    setSelectedScheduleIds: (state, action: PayloadAction<string[]>) => {
      state.selectedScheduleIds = action.payload;
    },

    clearSelectedScheduleIds: (state) => {
      state.selectedScheduleIds = [];
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    resetCalendarState: (state) => {
      state.selectedCell = null;
      state.selectedScheduleIds = [];
      state.selectedPreferenceType = null;
      state.pendingChanges = [];
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setSelectedCell,
  setSelectedPreferenceType,
  addPendingChange,
  clearPendingChanges,
  addSelectedScheduleId,
  removeSelectedScheduleId,
  setSelectedScheduleIds,
  clearSelectedScheduleIds,
  setLoading,
  setError,
  resetCalendarState,
} = classBandCalendarSlice.actions;

export default classBandCalendarSlice.reducer;
