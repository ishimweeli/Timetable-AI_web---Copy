import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Student } from "@/type/student/student";
import { apiStudent } from "./ApiStudent";
import { ImportResult } from "@/component/Common/CsvImport";

interface StudentState {
  selectedStudentUuid: string | null;
  isDetailsOpen: boolean;
  isNewStudentOpen: boolean;
  students: Student[];
  selectedStudent: Student | null;
  isLoading: boolean;
  error: string | null;
  importResult: ImportResult | null;
  isImporting: boolean;
}

const initialState: StudentState = {
  selectedStudentUuid: null,
  isDetailsOpen: false,
  isNewStudentOpen: false,
  students: [],
  selectedStudent: null,
  isLoading: false,
  error: null,
  importResult: null,
  isImporting: false,
};

const sliceStudent = createSlice({
  name: "student",
  initialState,
  reducers: {
    setSelectedStudent: (state, action: PayloadAction<string | null>) => {
      state.selectedStudentUuid = action.payload;
      state.isDetailsOpen = !!action.payload;
      state.isNewStudentOpen = false;
      state.selectedStudent =
        state.students.find((c) => c.uuid === action.payload) || null;
    },
    openNewStudentForm: (state) => {
      state.selectedStudentUuid = null;
      state.isDetailsOpen = false;
      state.isNewStudentOpen = true;
      state.selectedStudent = null;
    },
    closeStudentPanel: (state) => {
      state.selectedStudentUuid = null;
      state.isDetailsOpen = false;
      state.isNewStudentOpen = false;
      state.selectedStudent = null;
    },
    setStudents: (state, action: PayloadAction<Student[]>) => {
      state.students = action.payload;
    },
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.push(action.payload);
    },
    updateStudent: (state, action: PayloadAction<Student>) => {
      const index = state.students.findIndex(
        (c) => c.uuid === action.payload.uuid,
      );
      if(index !== -1) {
        state.students[index] = action.payload;
        if(state.selectedStudentUuid === action.payload.uuid) {
          state.selectedStudent = action.payload;
        }
      }
    },
    removeStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter((c) => c.uuid !== action.payload);
      if(state.selectedStudentUuid === action.payload) {
        state.selectedStudentUuid = null;
        state.selectedStudent = null;
        state.isDetailsOpen = false;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setImporting: (state, action: PayloadAction<boolean>) => {
      state.isImporting = action.payload;
    },
    setImportResult: (state, action: PayloadAction<ImportResult | null>) => {
      state.importResult = action.payload;
    },
    clearImportResult: (state) => {
      state.importResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(apiStudent.endpoints.getStudents.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        apiStudent.endpoints.getStudents.matchFulfilled,
        (state, { payload }) => {
          state.isLoading = false;
          state.students = payload.data;
          state.error = null;
        },
      )
      .addMatcher(
        apiStudent.endpoints.getStudents.matchRejected,
        (state, { error }) => {
          state.isLoading = false;
          state.error = error.message || "Failed to fetch students";
        },
      )
      .addMatcher(
        apiStudent.endpoints.getStudentByUuid.matchFulfilled,
        (state, { payload }) => {
          if(payload.data) {
            state.selectedStudent = payload.data;
            const index = state.students.findIndex(
              (c) => c.uuid === payload.data.uuid,
            );
            if(index !== -1) {
              state.students[index] = payload.data;
            }
          }
        },
      )
      .addMatcher(
        apiStudent.endpoints.createStudent.matchFulfilled,
        (state, { payload }) => {
          if(payload.data) {
            state.students.push(payload.data);
          }
          state.isNewStudentOpen = false;
        },
      )
      .addMatcher(
        apiStudent.endpoints.updateStudent.matchFulfilled,
        (state, { payload }) => {
          if(payload.data) {
            const index = state.students.findIndex(
              (c) => c.uuid === payload.data.uuid,
            );
            if(index !== -1) {
              state.students[index] = payload.data;
              if(state.selectedStudentUuid === payload.data.uuid) {
                state.selectedStudent = payload.data;
              }
            }
          }
          state.isDetailsOpen = false;
        },
      )
      .addMatcher(
        apiStudent.endpoints.deleteStudent.matchFulfilled,
        (state, { meta }) => {
          const uuid = meta.arg.originalArgs;
          state.students = state.students.filter((c) => c.uuid !== uuid);
          if(state.selectedStudentUuid === uuid) {
            state.selectedStudentUuid = null;
            state.selectedStudent = null;
            state.isDetailsOpen = false;
          }
        },
      )
      // Import CSV actions
      .addMatcher(
        apiStudent.endpoints.importStudentsCsv.matchPending,
        (state) => {
          state.isImporting = true;
          state.error = null;
        }
      )
      .addMatcher(
        apiStudent.endpoints.importStudentsCsv.matchFulfilled,
        (state, { payload }) => {
          state.isImporting = false;
          state.importResult = payload;
        }
      )
      .addMatcher(
        apiStudent.endpoints.importStudentsCsv.matchRejected,
        (state, { error }) => {
          state.isImporting = false;
          state.error = error.message || "Failed to import students";
        }
      );
  },
});

export const {
  setSelectedStudent,
  openNewStudentForm,
  closeStudentPanel,
  setStudents,
  addStudent,
  updateStudent,
  removeStudent,
  setLoading,
  setError,
  setImporting,
  setImportResult,
  clearImportResult,
} = sliceStudent.actions;

export default sliceStudent.reducer;
