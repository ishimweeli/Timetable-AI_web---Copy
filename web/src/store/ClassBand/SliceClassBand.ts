import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ClassBandState {
  selectedClassBandUuid: string | null;
  isDetailsOpen: boolean;
  isNewClassBandOpen: boolean;
  selectedScheduleIds: string[]; // Added for schedule preferences
}

const initialState: ClassBandState = {
  selectedClassBandUuid: null,
  isDetailsOpen: false,
  isNewClassBandOpen: false,
  selectedScheduleIds: [], // Initialize as empty array
};

const classBandSlice = createSlice({
  name: "classBand",
  initialState,
  reducers: {
    setSelectedClassBand: (state, action: PayloadAction<string | null>) => {
      state.selectedClassBandUuid = action.payload;
      state.isDetailsOpen = !!action.payload;
    },
    openNewClassBandForm: (state) => {
      state.isNewClassBandOpen = true;
    },
    closeClassBandPanel: (state) => {
      state.isNewClassBandOpen = false;
      state.isDetailsOpen = false;
    },
    // Add the following reducers for schedule IDs
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
  },
});

export const {
  setSelectedClassBand,
  openNewClassBandForm,
  closeClassBandPanel,
  setSelectedScheduleIds,
  addSelectedScheduleId,
  removeSelectedScheduleId,
  clearSelectedScheduleIds,
} = classBandSlice.actions;

export const selectSelectedClassBandUuid = (state: {
  classBand: ClassBandState;
}) => state.classBand.selectedClassBandUuid;
export const selectIsNewClassBandOpen = (state: {
  classBand: ClassBandState;
}) => state.classBand.isNewClassBandOpen;
export const selectSelectedScheduleIds = (state: {
  classBand: ClassBandState;
}) => state.classBand.selectedScheduleIds;

export default classBandSlice.reducer;
