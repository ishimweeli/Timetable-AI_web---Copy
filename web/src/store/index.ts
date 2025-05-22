import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { combineReducers } from "@reduxjs/toolkit";

import { apiAuth } from "@/store/Auth/ApiAuth.ts";
import { apiClass } from "@/store/Class/ApiClass.ts";
import { apiTeacher } from "@/store/Teacher/ApiTeacher.ts";
import { apiOrganization } from "@/store/Organization/ApiOrganization.ts";
import { apiOrganizationUiSettings } from "@/store/Organization/ApiOrganizationUiSettings.ts";
import { apiRule } from "@/store/Rule/ApiRule.ts";
import { classBandApi } from "@/store/ClassBand/ApiClassBand.ts";
import { apiRoom } from "@/store/Room/ApiRoom.ts";
import { calendarApi } from "./Calendar/ApiCalendar";
import { classSchedulePreferenceApi } from "./Class/ApiClassCalendar";
import { apiRulePreference } from "@/store/Rule/apiRulePreference";
import { apiUser } from "@/store/User/ApiUser";
import { apiStudent } from "./Student/ApiStudent";
import { apiManager } from "@/store/Manager/ApiManager.ts";
import { apiDashboard } from "@/services/dashboard/ApiDashboard.ts";
import { apiBinding } from "@/store/Binding/ApiBinding.ts";
import { apiSearchReplace } from "@/store/Binding/ApiSearchReplace.ts";
import { workloadApi } from "@/store/Workload/ApiWorkload";
import { apiNotification } from "@/services/Notification/ApiNotification.ts";
import { workloadInvalidationMiddleware } from "./middleware/workloadInvalidation";

import authReducer from "@/store/Auth/SliceAuth.ts";
import classReducer from "@/store/Class/SliceClass.ts";
import teacherReducer from "@/store/Teacher/SliceTeacher.ts";
import teacherCalendarReducer from "@/store/Teacher/SliceTeacherCalendar.ts";
import roomReducer from "@/store/Room/SliceRoom.ts";
import ruleReducer from "@/store/Rule/SliceRule.ts";
import organizationReducer from "@/store/Organization/SliceOrganization.ts";
import organizationUiSettingsReducer from "@/store/Organization/SliceOrganizationUiSettings.ts";
import classBandReducer from "@/store/ClassBand/SliceClassBand.ts";
import calendarReducer from "./Calendar/SliceCalendar";
import classCalendarReducer from "./Class/SliceClassCalendar";
import rulePreferenceReducer from "@/store/Rule/sliceRulePreference";
import studentReducer from "./Student/SliceStudent";
import managerReducer from "@/store/Manager/SliceManager.ts";
import dashboardReducer from "@/store/dashboard/SliceDashboard.ts";
import bindingReducer from "@/store/Binding/SliceBinding.ts";
import timetableReducer from "@/store/Timetable/timetableSlice";
import notificationReducer from "@/store/Notification/SliceNotification.ts";


// Combine the reducers
const rootReducer = {
  auth: authReducer,
  class: classReducer,
  teacher: teacherReducer,
  teacherCalendar: teacherCalendarReducer,
  organization: organizationReducer,
  organizationUiSettings: organizationUiSettingsReducer,
  room: roomReducer,
  rule: ruleReducer,
  classBand: classBandReducer,
  calendar: calendarReducer,
  classCalendar: classCalendarReducer,
  rulePreference: rulePreferenceReducer,
  student: studentReducer,
  manager: managerReducer,
  dashboard: dashboardReducer,
  timetable: timetableReducer,
  binding: bindingReducer,
  notification: notificationReducer,
  [apiAuth.reducerPath]: apiAuth.reducer,
  [apiClass.reducerPath]: apiClass.reducer,
  [apiTeacher.reducerPath]: apiTeacher.reducer,
  [apiOrganization.reducerPath]: apiOrganization.reducer,
  [apiRule.reducerPath]: apiRule.reducer,
  [apiRoom.reducerPath]: apiRoom.reducer,
  [classBandApi.reducerPath]: classBandApi.reducer,
  [calendarApi.reducerPath]: calendarApi.reducer,
  [classSchedulePreferenceApi.reducerPath]: classSchedulePreferenceApi.reducer,
  [apiRulePreference.reducerPath]: apiRulePreference.reducer,
  [apiUser.reducerPath]: apiUser.reducer,
  [apiStudent.reducerPath]: apiStudent.reducer,
  [apiManager.reducerPath]: apiManager.reducer,
  [apiDashboard.reducerPath]: apiDashboard.reducer,
  [apiBinding.reducerPath]: apiBinding.reducer,
  [apiSearchReplace.reducerPath]: apiSearchReplace.reducer,
  [workloadApi.reducerPath]: workloadApi.reducer,
  [apiOrganizationUiSettings.reducerPath]: apiOrganizationUiSettings.reducer,
  [apiNotification.reducerPath]: apiNotification.reducer,
};

// Create the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      apiAuth.middleware,
      apiClass.middleware,
      apiTeacher.middleware,
      apiOrganization.middleware,
      apiRoom.middleware,
      apiRule.middleware,
      classBandApi.middleware,
      calendarApi.middleware,
      classSchedulePreferenceApi.middleware,
      apiRulePreference.middleware,
      apiUser.middleware,
      apiStudent.middleware,
      apiManager.middleware,
      apiDashboard.middleware,
      apiBinding.middleware,
      apiSearchReplace.middleware,
      workloadApi.middleware,
      apiOrganizationUiSettings.middleware,
      apiNotification.middleware,
      workloadInvalidationMiddleware,
    ),
});

// Set up listeners for automatic refetching
setupListeners(store.dispatch);

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
