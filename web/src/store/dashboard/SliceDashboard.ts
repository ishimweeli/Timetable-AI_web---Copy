import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiDashboard } from "@/services/dashboard/ApiDashboard";
import { DashboardStats, OrgStatistics } from "@/type/dashboard/DashboardTypes";

interface DashboardState {
  stats: {
    countOrganization: number;
    countUser: number;
    countAdmin: number;
    countManager: number;
    countTeacher: number;
    countStudent: number;
    countTimetable: number;
    systemHealth: string;
  };
  orgStats: {
    countUser: number;
    countTeacher: number;
    countStudent: number;
    countClass: number;
    countRoom: number;
    countSubject: number;
    countRule: number;
    countTimetable: number;
    countCalendar: number;
  };
  isLoading: boolean;
  isLoadingOrgStats: boolean;
  error: string | null;
  orgError: string | null;
}

const initialState: DashboardState = {
  stats: {
    countOrganization: 0,
    countUser: 0,
    countAdmin: 0,
    countManager: 0,
    countTeacher: 0,
    countStudent: 0,
    countTimetable: 0,
    systemHealth: "100%",
  },
  orgStats: {
    countUser: 0,
    countTeacher: 0,
    countStudent: 0,
    countClass: 0,
    countRoom: 0,
    countSubject: 0,
    countRule: 0,
    countTimetable: 0,
    countCalendar: 0,
  },
  isLoading: false,
  isLoadingOrgStats: false,
  error: null,
  orgError: null,
};

const sliceDashboard = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardStats: (state, action: PayloadAction<DashboardStats>) => {
      state.stats = {
        ...state.stats,
        countOrganization: action.payload.countOrganization,
        countUser: action.payload.countUser,
        countAdmin: action.payload.countAdmin,
        countManager: action.payload.countManager,
        countTeacher: action.payload.countTeacher,
        countStudent: action.payload.countStudent,
        countTimetable: action.payload.countTimetable,
      };
    },
    setOrgStats: (state, action: PayloadAction<OrgStatistics>) => {
      state.orgStats = {
        ...state.orgStats,
        countUser: action.payload.countUser,
        countTeacher: action.payload.countTeacher,
        countStudent: action.payload.countStudent,
        countClass: action.payload.countClass,
        countRoom: action.payload.countRoom,
        countSubject: action.payload.countSubject,
        countRule: action.payload.countRule,
        countTimetable: action.payload.countTimetable,
        countCalendar: action.payload.countCalendar,
      };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingOrgStats: (state, action: PayloadAction<boolean>) => {
      state.isLoadingOrgStats = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setOrgError: (state, action: PayloadAction<string | null>) => {
      state.orgError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard statistics API handlers
      .addMatcher(apiDashboard.endpoints.getDashboardStats.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        apiDashboard.endpoints.getDashboardStats.matchFulfilled,
        (state, { payload }) => {
          state.isLoading = false;
          if(payload.data && payload.data.length > 0) {
            const dashboardData = payload.data[0];
            state.stats = {
              ...state.stats,
              countOrganization: dashboardData.countOrganization,
              countUser: dashboardData.countUser,
              countAdmin: dashboardData.countAdmin,
              countManager: dashboardData.countManager,
              countTeacher: dashboardData.countTeacher,
              countStudent: dashboardData.countStudent,
              countTimetable: dashboardData.countTimetable,
            };
          }
          state.error = null;
        },
      )
      .addMatcher(
        apiDashboard.endpoints.getDashboardStats.matchRejected,
        (state, { error }) => {
          state.isLoading = false;
          state.error = error.message || "Failed to fetch dashboard statistics";
        },
      )

      // Organization statistics API handlers
      .addMatcher(apiDashboard.endpoints.getOrgStatistics.matchPending, (state) => {
        state.isLoadingOrgStats = true;
        state.orgError = null;
      })
      .addMatcher(
        apiDashboard.endpoints.getOrgStatistics.matchFulfilled,
        (state, { payload }) => {
          state.isLoadingOrgStats = false;
          if(payload.data) {
            const orgData = payload.data;
            state.orgStats = {
              ...state.orgStats,
              countUser: orgData.countUser,
              countTeacher: orgData.countTeacher,
              countStudent: orgData.countStudent,
              countClass: orgData.countClass,
              countRoom: orgData.countRoom,
              countSubject: orgData.countSubject,
              countRule: orgData.countRule,
              countTimetable: orgData.countTimetable,
              countCalendar: orgData.countCalendar,
            };
          }
          state.orgError = null;
        },
      )
      .addMatcher(
        apiDashboard.endpoints.getOrgStatistics.matchRejected,
        (state, { error }) => {
          state.isLoadingOrgStats = false;
          state.orgError = error.message || "Failed to fetch organization statistics";
        },
      );
  },
});

export const {
  setDashboardStats,
  setOrgStats,
  setLoading,
  setLoadingOrgStats,
  setError,
  setOrgError
} = sliceDashboard.actions;

// Selectors for global dashboard stats
export const selectDashboardStats = (state: { dashboard: DashboardState }) => state.dashboard.stats;
export const selectDashboardIsLoading = (state: { dashboard: DashboardState }) => state.dashboard.isLoading;
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;

// Selectors for organization stats
export const selectOrgStats = (state: { dashboard: DashboardState }) => state.dashboard.orgStats;
export const selectOrgStatsIsLoading = (state: { dashboard: DashboardState }) => state.dashboard.isLoadingOrgStats;
export const selectOrgStatsError = (state: { dashboard: DashboardState }) => state.dashboard.orgError;

export default sliceDashboard.reducer;
