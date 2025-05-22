import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoomState {
  selectedRoomUuid: string | null;
  isDetailsOpen: boolean;
  isNewRoomOpen: boolean;
  deletedRoomIds: string[]; // Track deleted rooms
}

const initialState: RoomState = {
  selectedRoomUuid: null,
  isDetailsOpen: false,
  isNewRoomOpen: false,
  deletedRoomIds: [],
};

const sliceRoom = createSlice({
  name: "room",
  initialState,
  reducers: {
    setSelectedRoom: (state, action: PayloadAction<string>) => {
      state.selectedRoomUuid = action.payload;
      state.isDetailsOpen = true;
      state.isNewRoomOpen = false;
    },
    openNewRoomForm: (state) => {
      state.isNewRoomOpen = true;
      state.isDetailsOpen = false;
      state.selectedRoomUuid = null;
    },
    closeRoomPanel: (state) => {
      state.isDetailsOpen = false;
      state.isNewRoomOpen = false;
      state.selectedRoomUuid = null;
    },
    addDeletedRoom: (state, action: PayloadAction<string>) => {
      state.deletedRoomIds.push(action.payload);
    },
  },
});

export const {
  setSelectedRoom,
  openNewRoomForm,
  closeRoomPanel,
  addDeletedRoom,
} = sliceRoom.actions;

export default sliceRoom.reducer;
