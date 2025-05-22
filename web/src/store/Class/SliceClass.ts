import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { TypeClass } from "@/type/Class/TypeClass.ts";
import { apiClass } from "@/store/Class/ApiClass";
import { useAppSelector } from "@/hook/useAppRedux";
import type { PendingChange } from "@/type/Calendar/TypeCalendar";
import type { ImportClassCsvResponse } from "@/store/Class/ApiClass";

interface ClassState {
  selectedClassUuid: string | null;
  isDetailsOpen: boolean;
  isNewClassOpen: boolean;
  classes: TypeClass[];
  selectedClass: TypeClass | null;
  isLoading: boolean;
  error: string | null;
  selectedScheduleIds: string[]; // Added for schedule preferences
  importStatus: {
    isImporting: boolean;
    isImportSuccessful: boolean | null;
    importResult: ImportClassCsvResponse | null;
    errorMessage: string | null;
  };
}

const initialState: ClassState = {
  selectedClassUuid: null,
  isDetailsOpen: false,
  isNewClassOpen: false,
  classes: [],
  selectedClass: null,
  isLoading: false,
  error: null,
  selectedScheduleIds: [], // Initialize as empty array
  importStatus: {
    isImporting: false,
    isImportSuccessful: null,
    importResult: null,
    errorMessage: null,
  },
};

const sliceClass = createSlice({
  name: "class",
  initialState,
  reducers: {
    setSelectedClass: (state, action: PayloadAction<string | null>) => {
      state.selectedClassUuid = action.payload;
      state.isDetailsOpen = !!action.payload;
      state.isNewClassOpen = false;
      state.selectedClass =
        state.classes.find((c) => c.uuid === action.payload) || null;
    },
    openNewClassForm: (state) => {
      state.selectedClassUuid = null;
      state.isDetailsOpen = false;
      state.isNewClassOpen = true;
      state.selectedClass = null;
    },
    closeClassPanel: (state) => {
      state.selectedClassUuid = null;
      state.isDetailsOpen = false;
      state.isNewClassOpen = false;
      state.selectedClass = null;
    },
    setClasses: (state, action: PayloadAction<TypeClass[]>) => {
      state.classes = action.payload;
    },
    appendClasses: (state, action: PayloadAction<TypeClass[]>) => {
      // Filter out any duplicates before appending
      const newClasses = action.payload.filter(
        (newClass) =>
          !state.classes.some(
            (existingClass) => existingClass.uuid === newClass.uuid,
          ),
      );
      state.classes = [...state.classes, ...newClasses];
    },
    addClass: (state, action: PayloadAction<TypeClass>) => {
      state.classes.push(action.payload);
    },
    updateClass: (state, action: PayloadAction<TypeClass>) => {
      const index = state.classes.findIndex(
        (c) => c.uuid === action.payload.uuid,
      );
      if(index !== -1) {
        state.classes[index] = action.payload;
        if(state.selectedClassUuid === action.payload.uuid) {
          state.selectedClass = action.payload;
        }
      }
    },
    removeClass: (state, action: PayloadAction<string>) => {
      state.classes = state.classes.filter((c) => c.uuid !== action.payload);
      if(state.selectedClassUuid === action.payload) {
        state.selectedClassUuid = null;
        state.selectedClass = null;
        state.isDetailsOpen = false;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedScheduleIds: (state, action: PayloadAction<string[]>) => {
      state.selectedScheduleIds = action.payload;
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
    clearSelectedScheduleIds: (state) => {
      state.selectedScheduleIds = [];
    },
    resetImportStatus: (state) => {
      state.importStatus = {
        isImporting: false,
        isImportSuccessful: null,
        importResult: null,
        errorMessage: null,
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(apiClass.endpoints.getClasses.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        apiClass.endpoints.getClasses.matchFulfilled,
        (state, { payload }) => {
          state.isLoading = false;
          state.classes = payload.data;
          state.error = null;
        },
      )
      .addMatcher(
        apiClass.endpoints.getClasses.matchRejected,
        (state, { error }) => {
          state.isLoading = false;
          state.error = error.message || "Failed to fetch classes";
        },
      )
      .addMatcher(
        apiClass.endpoints.getClass.matchFulfilled,
        (state, { payload }) => {
          if(payload.data) {
            state.selectedClass = payload.data;
            const index = state.classes.findIndex(
              (c) => c.uuid === payload.data.uuid,
            );
            if(index !== -1) {
              state.classes[index] = payload.data;
            }
          }
        },
      )
      .addMatcher(
        apiClass.endpoints.createClass.matchFulfilled,
        (state, { payload }) => {
          if(payload.data) {
            state.classes.push(payload.data);
          }
        },
      )
      .addMatcher(
        apiClass.endpoints.updateClass.matchFulfilled,
        (state, { payload }) => {
          if(payload.data) {
            const index = state.classes.findIndex(
              (c) => c.uuid === payload.data.uuid,
            );
            if(index !== -1) {
              state.classes[index] = payload.data;
              if(state.selectedClassUuid === payload.data.uuid) {
                state.selectedClass = payload.data;
              }
            }
          }
          state.isDetailsOpen = false;
        },
      )
      .addMatcher(
        apiClass.endpoints.deleteClass.matchFulfilled,
        (state, { meta }) => {
          const uuid = meta.arg.originalArgs;
          state.classes = state.classes.filter((c) => c.uuid !== uuid);
          if(state.selectedClassUuid === uuid) {
            state.selectedClassUuid = null;
            state.selectedClass = null;
            state.isDetailsOpen = false;
          }
        },
      )
      .addMatcher(
        apiClass.endpoints.importClassesFromCsv.matchPending,
        (state) => {
          state.importStatus.isImporting = true;
          state.importStatus.isImportSuccessful = null;
          state.importStatus.importResult = null;
          state.importStatus.errorMessage = null;
        }
      )
      .addMatcher(
        apiClass.endpoints.importClassesFromCsv.matchFulfilled,
        (state, { payload }) => {
          state.importStatus.isImporting = false;
          state.importStatus.isImportSuccessful = payload.success;
          
          if(payload.success && payload.data) {
            state.importStatus.importResult = payload.data;
            
            // If there are successfully created classes, we can add them to the state
            if(payload.data.createdClasses && payload.data.createdClasses.length > 0) {
              // Filter out any duplicates before adding
              const newClasses = payload.data.createdClasses.filter(
                (newClass) => !state.classes.some(
                  (existingClass) => existingClass.uuid === newClass.uuid
                )
              );
              
              // Add new classes to the state
              state.classes = [...state.classes, ...newClasses];
            }
          }else {
            state.importStatus.errorMessage = payload.message || 'Import failed';
          }
        }
      )
      .addMatcher(
        apiClass.endpoints.importClassesFromCsv.matchRejected,
        (state, { error }) => {
          state.importStatus.isImporting = false;
          state.importStatus.isImportSuccessful = false;
          state.importStatus.importResult = null;
          state.importStatus.errorMessage = error.message || 'Failed to import classes from CSV';
        }
      );
  },
});

export const {
  setSelectedClass,
  openNewClassForm,
  closeClassPanel,
  setClasses,
  appendClasses,
  addClass,
  updateClass,
  removeClass,
  setLoading,
  setError,
  setSelectedScheduleIds,
  addSelectedScheduleId,
  removeSelectedScheduleId,
  clearSelectedScheduleIds,
  resetImportStatus,
} = sliceClass.actions;

export const selectClasses = (state: { class: ClassState }) =>
  state.class.classes;
export const selectSelectedClass = (state: { class: ClassState }) =>
  state.class.selectedClass;
export const selectIsLoading = (state: { class: ClassState }) =>
  state.class.isLoading;
export const selectError = (state: { class: ClassState }) => state.class.error;
export const selectIsDetailsOpen = (state: { class: ClassState }) =>
  state.class.isDetailsOpen;
export const selectIsNewClassOpen = (state: { class: ClassState }) =>
  state.class.isNewClassOpen;
export const selectSelectedScheduleIds = (state: { class: ClassState }) =>
  state.class.selectedScheduleIds;
export const selectImportStatus = (state: { class: ClassState }) => 
  state.class.importStatus;

export default sliceClass.reducer;

export const selectPendingChanges = (state: {
  calendar: { pendingChanges: PendingChange[] };
}) => state.calendar.pendingChanges;

export const usePendingChanges = () => {
  return useAppSelector(selectPendingChanges);
};
