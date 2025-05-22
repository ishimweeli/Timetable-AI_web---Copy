import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiNotification } from "@/services/Notification/ApiNotification";

interface NotificationState {
  unreadCount: number;
  lastUpdated: number;
}

const initialState: NotificationState = {
  unreadCount: 0,
  lastUpdated: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
      state.lastUpdated = Date.now();
    },
  },
  extraReducers: (builder) => {
    // Update state when the unread count query succeeds
    builder.addMatcher(
      apiNotification.endpoints.getUnreadCount.matchFulfilled,
      (state, { payload }) => {
        if (payload?.data !== undefined) {
          state.unreadCount = payload.data;
          state.lastUpdated = Date.now();
        }
      }
    );
  },
});

export const { setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;