import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TeacherPreference } from "@/type/Teacher/TypeTeacher.ts";

interface TeacherState {
  selectedTeacherUuid: string | null;
  isLoading: boolean;
  error: string | null;
  teacherPreferences: Record<string, string[]>;
  currentView: "list" | "grid" | "detail";
  filter: {
    department?: string;
    level?: string;
    subjects?: string[];
  };
  sort: {
    field?: "name" | "department" | "createdAt";
    direction: "asc" | "desc";
  };
}

const initialState: TeacherState = {
  selectedTeacherUuid: null,
  isLoading: false,
  error: null,
  teacherPreferences: {},
  currentView: "list",
  filter: {},
  sort: {
    field: "name",
    direction: "asc",
  },
};

const sliceTeacher = createSlice({
  name: "teacher",
  initialState,
  reducers: {
    setSelectedTeacher(state, action: PayloadAction<string | null>) {
      state.selectedTeacherUuid = action.payload;
    },
    setTeacherLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setTeacherError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setTeacherPreferences(state, action: PayloadAction<TeacherPreference>) {
      const { teacherId, preferences } = action.payload;
      state.teacherPreferences[teacherId] = preferences;
    },
    setCurrentView(state, action: PayloadAction<"list" | "grid" | "detail">) {
      state.currentView = action.payload;
    },
    setFilter(state, action: PayloadAction<Partial<TeacherState["filter"]>>) {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearFilter(state) {
      state.filter = {};
    },
    setSort(state, action: PayloadAction<Partial<TeacherState["sort"]>>) {
      state.sort = { ...state.sort, ...action.payload };
    },
    clearTeacherState(state) {
      return initialState;
    },
  },
});

export const {
  setSelectedTeacher,
  setTeacherLoading,
  setTeacherError,
  setTeacherPreferences,
  setCurrentView,
  setFilter,
  clearFilter,
  setSort,
  clearTeacherState,
} = sliceTeacher.actions;

export default sliceTeacher.reducer;
