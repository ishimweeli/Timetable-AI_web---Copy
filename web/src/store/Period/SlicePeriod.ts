import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Period } from "../../type/Period/Period";
import * as PeriodAPI from "./ApiPeriod";

interface PeriodState {
  selectedPeriodId: number | null;
  isDetailsOpen: boolean;
  isNewPeriodOpen: boolean;
  periods: Period[];
  loading: boolean;
  error: string | null;
  currentPeriod: Period | null;
  planSettingsId: number | null;
}

const initialState: PeriodState = {
  selectedPeriodId: null,
  isDetailsOpen: false,
  isNewPeriodOpen: false,
  periods: [],
  loading: false,
  error: null,
  currentPeriod: null,
  planSettingsId: null
};

// Async thunks
export const fetchPeriodsByPlanSettingsId = createAsyncThunk(
  'period/fetchPeriodsByPlanSettingsId',
  async (planSettingsId: number, { rejectWithValue }) => {
    try {
      return await PeriodAPI.getPeriodsByPlanSettingsId(planSettingsId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch periods');
    }
  }
);

export const createPeriod = createAsyncThunk(
  'period/createPeriod',
  async (period: any, { rejectWithValue }) => {
    try {
      return await PeriodAPI.createPeriod(period);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create period');
    }
  }
);

export const updatePeriod = createAsyncThunk(
  'period/updatePeriod',
  async ({ id, period }: { id: number, period: any }, { rejectWithValue }) => {
    try {
      return await PeriodAPI.updatePeriod(id, period);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update period');
    }
  }
);

export const deletePeriod = createAsyncThunk(
  'period/deletePeriod',
  async (id: number, { rejectWithValue }) => {
    try {
      await PeriodAPI.deletePeriod(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete period');
    }
  }
);

const periodSlice = createSlice({
  name: "period",
  initialState,
  reducers: {
    setSelectedPeriodId: (state, action: PayloadAction<number | null>) => {
      state.selectedPeriodId = action.payload;
      state.isDetailsOpen = action.payload !== null;
    },
    openNewPeriodForm: (state) => {
      state.isNewPeriodOpen = true;
      state.isDetailsOpen = false;
    },
    closePeriodPanel: (state) => {
      state.isDetailsOpen = false;
      state.isNewPeriodOpen = false;
    },
    setPlanSettingsId: (state, action: PayloadAction<number | null>) => {
      state.planSettingsId = action.payload;
    },
    clearPeriodError: (state) => {
      state.error = null;
    },
    setCurrentPeriod: (state, action: PayloadAction<Period | null>) => {
      state.currentPeriod = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch periods by plan settings ID
      .addCase(fetchPeriodsByPlanSettingsId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPeriodsByPlanSettingsId.fulfilled, (state, action) => {
        state.loading = false;
        state.periods = action.payload;
      })
      .addCase(fetchPeriodsByPlanSettingsId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create period
      .addCase(createPeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.periods.push(action.payload);
        state.currentPeriod = action.payload;
        state.isNewPeriodOpen = false;
      })
      .addCase(createPeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update period
      .addCase(updatePeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePeriod.fulfilled, (state, action) => {
        state.loading = false;
        const updatedPeriod = action.payload;
        state.periods = state.periods.map(period => 
          period.id === updatedPeriod.id ? updatedPeriod : period
        );
        state.currentPeriod = updatedPeriod;
      })
      .addCase(updatePeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete period
      .addCase(deletePeriod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePeriod.fulfilled, (state, action) => {
        state.loading = false;
        state.periods = state.periods.filter(period => period.id !== action.payload);
        if (state.currentPeriod?.id === action.payload) {
          state.currentPeriod = null;
        }
        state.selectedPeriodId = null;
        state.isDetailsOpen = false;
      })
      .addCase(deletePeriod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  setSelectedPeriodId, 
  openNewPeriodForm, 
  closePeriodPanel,
  setPlanSettingsId,
  clearPeriodError,
  setCurrentPeriod
} = periodSlice.actions;

export default periodSlice.reducer;
