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
  selectedClassUuid: null,
};

const classCalendarSlice = createSlice({
  name: "classCalendar",
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

    setSelectedClassUuid: (state, action: PayloadAction<string | null>) => {
      state.selectedClassUuid = action.payload;
    },

    addPendingChange: (state, action: PayloadAction<PendingChange>) => {
      // Validate that the preference type is not null before adding for create/update operations
      if(
        action.payload.operationType === ChangeOperationType.CREATE ||
        action.payload.operationType === ChangeOperationType.UPDATE
      ) {
        if(!action.payload.newPreferenceType) {
          console.error(
            "Attempted to add pending change with null preference type:",
            action.payload,
          );
          return; // Don't add invalid changes
        }
      }

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
      state.selectedClassUuid = null;
    },

    setPreferenceType: (state, action: PayloadAction<PreferenceType>) => {
      state.preferenceType = action.payload;
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
  setSelectedClassUuid,
  setPreferenceType,
} = classCalendarSlice.actions;

export default classCalendarSlice.reducer;
