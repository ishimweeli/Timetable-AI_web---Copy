import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Manager } from "../../type/Manager/TypeManager";

interface ManagerState {
  selectedManagerUuid: string | null;
  isDetailsOpen: boolean;
  isNewManagerOpen: boolean;
  managers: Manager[];
  selectedManager: Manager | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ManagerState = {
  selectedManagerUuid: null,
  isDetailsOpen: false,
  isNewManagerOpen: false,
  managers: [],
  selectedManager: null,
  isLoading: false,
  error: null,
};

const sliceManager = createSlice({
  name: "manager",
  initialState,
  reducers: {
    setSelectedManager: (state, action: PayloadAction<string | null>) => {
      state.selectedManagerUuid = action.payload;
      state.isDetailsOpen = !!action.payload;
      state.isNewManagerOpen = false;
      state.selectedManager =
        state.managers.find((m) => m.uuid === action.payload) || null;
    },
    openNewManagerForm: (state) => {
      state.selectedManagerUuid = null;
      state.isDetailsOpen = false;
      state.isNewManagerOpen = true;
      state.selectedManager = null;
    },
    closeManagerPanel: (state) => {
      state.selectedManagerUuid = null;
      state.isDetailsOpen = false;
      state.isNewManagerOpen = false;
      state.selectedManager = null;
    },
    setManagers: (state, action: PayloadAction<Manager[]>) => {
      state.managers = action.payload;
    },
    addManager: (state, action: PayloadAction<Manager>) => {
      state.managers.push(action.payload);
    },
    updateManager: (state, action: PayloadAction<Manager>) => {
      const index = state.managers.findIndex(
        (m) => m.uuid === action.payload.uuid,
      );
      if(index !== -1) {
        state.managers[index] = action.payload;
        if(state.selectedManagerUuid === action.payload.uuid) {
          state.selectedManager = action.payload;
        }
      }
    },
    removeManager: (state, action: PayloadAction<string>) => {
      state.managers = state.managers.filter((m) => m.uuid !== action.payload);
      if(state.selectedManagerUuid === action.payload) {
        state.selectedManagerUuid = null;
        state.selectedManager = null;
        state.isDetailsOpen = false;
      }
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
  setSelectedManager,
  openNewManagerForm,
  closeManagerPanel,
  setManagers,
  addManager,
  updateManager,
  removeManager,
  setLoading,
  setError,
} = sliceManager.actions;

export const selectManagers = (state: { manager: ManagerState }) =>
  state.manager.managers;
export const selectSelectedManager = (state: { manager: ManagerState }) =>
  state.manager.selectedManager;
export const selectIsLoading = (state: { manager: ManagerState }) =>
  state.manager.isLoading;
export const selectError = (state: { manager: ManagerState }) =>
  state.manager.error;
export const selectIsDetailsOpen = (state: { manager: ManagerState }) =>
  state.manager.isDetailsOpen;
export const selectIsNewManagerOpen = (state: { manager: ManagerState }) =>
  state.manager.isNewManagerOpen;

export default sliceManager.reducer;
