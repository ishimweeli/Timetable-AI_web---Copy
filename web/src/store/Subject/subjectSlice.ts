import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Subject } from "@/type/subject";

interface SubjectState {
  subjects: Subject[];
  selectedSubject: Subject | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SubjectState = {
  subjects: [],
  selectedSubject: null,
  isLoading: false,
  error: null,
};

const subjectSlice = createSlice({
  name: "subject",
  initialState,
  reducers: {
    setSubjects: (state, action: PayloadAction<Subject[]>) => {
      state.subjects = action.payload;
    },
    addSubject: (state, action: PayloadAction<Subject>) => {
      state.subjects.push(action.payload);
    },
    updateSubjectInList: (state, action: PayloadAction<Subject>) => {
      const index = state.subjects.findIndex(
        (subject) => subject.uuid === action.payload.uuid,
      );
      if(index !== -1) {
        state.subjects[index] = action.payload;
      }
    },
    removeSubject: (state, action: PayloadAction<string>) => {
      state.subjects = state.subjects.filter(
        (subject) => subject.uuid !== action.payload,
      );
    },
    setSelectedSubject: (state, action: PayloadAction<Subject | null>) => {
      state.selectedSubject = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSubjects,
  addSubject,
  updateSubjectInList,
  removeSubject,
  setSelectedSubject,
  setLoading,
  setError,
} = subjectSlice.actions;

export default subjectSlice.reducer;
