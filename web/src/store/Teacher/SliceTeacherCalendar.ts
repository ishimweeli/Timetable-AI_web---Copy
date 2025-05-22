import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PreferenceType, PendingChange } from "@/type/Calendar/TypeCalendar";

interface TeacherCalendarState {
  selectedPreferenceType: PreferenceType | null;
  pendingChanges: PendingChange[];
  error: string | null;
  isLoading: boolean;
  selectedTeacherUuid?: string | null;
}

const initialState: TeacherCalendarState = {
  selectedPreferenceType: null,
  pendingChanges: [],
  error: null,
  isLoading: false,
  selectedTeacherUuid: null,
};

const teacherCalendarSlice = createSlice({
  name: "teacherCalendar",
  initialState,
  reducers: {
    setSelectedPreferenceType: (state, action: PayloadAction<PreferenceType | null>) => {
      state.selectedPreferenceType = action.payload;
    },
    setSelectedTeacherUuid: (state, action: PayloadAction<string | null>) => {
      state.selectedTeacherUuid = action.payload;
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
  setSelectedTeacherUuid,
  addPendingChange,
  removePendingChange,
  clearPendingChanges,
  setError,
  setIsLoading,
} = teacherCalendarSlice.actions;

export default teacherCalendarSlice.reducer;