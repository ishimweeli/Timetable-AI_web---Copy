import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import reducers
import teacherCalendarReducer from "./Teacher/SliceTeacherCalendar";
import classCalendarReducer from "./Class/SliceClassCalendar";
import planSettingsReducer from "./PlanSettings/SlicePlanSettings";

// Import APIs
import { calendarApi } from "./Calendar/ApiCalendar";
import { teacherApi } from "./Teacher/ApiTeacher";
import { classApi } from "./Class/ApiClass";

// Configure the store
export const store = configureStore({
  reducer: {
    // Add reducers
    teacherCalendar: teacherCalendarReducer,
    classCalendar: classCalendarReducer,
    planSettings: planSettingsReducer,
    
    // Add API reducers
    [calendarApi.reducerPath]: calendarApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [classApi.reducerPath]: classApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      calendarApi.middleware,
      teacherApi.middleware,
      classApi.middleware
    ),
});

// Set up listeners for RTK Query
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;