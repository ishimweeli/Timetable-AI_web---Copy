import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ImportResult } from '@/component/Common/CsvImport';

interface SubjectState {
  importStatus: {
    isImporting: boolean;
    importResult: ImportResult | null;
    error: string | null;
  };
}

const initialState: SubjectState = {
  importStatus: {
    isImporting: false,
    importResult: null,
    error: null
  }
};

const sliceSubject = createSlice({
  name: 'subject',
  initialState,
  reducers: {
    setImportingStatus: (state, action: PayloadAction<boolean>) => {
      state.importStatus.isImporting = action.payload;
      if(action.payload) {
        state.importStatus.error = null;
        state.importStatus.importResult = null;
      }
    },
    setImportResult: (state, action: PayloadAction<ImportResult>) => {
      state.importStatus.importResult = action.payload;
      state.importStatus.isImporting = false;
    },
    setImportError: (state, action: PayloadAction<string>) => {
      state.importStatus.error = action.payload;
      state.importStatus.isImporting = false;
    },
    resetImportState: (state) => {
      state.importStatus = initialState.importStatus;
    }
  }
});

export const { 
  setImportingStatus, 
  setImportResult, 
  setImportError, 
  resetImportState 
} = sliceSubject.actions;

export default sliceSubject.reducer;
