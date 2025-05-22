import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import {
  PendingChange,
  SchedulePreference,
  RulePreferenceState,
  ChangeOperationType,
} from "@/type/Calendar/TypeCalendar";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const initialState: RulePreferenceState = {
  selectedRuleUuid: null,
  rulePendingChanges: [],
  schedulePreferences: [],
  isLoading: false,
  error: null,
};

const processPreferences = (
  preferences: SchedulePreference[],
): SchedulePreference[] => {
  if(!preferences || !Array.isArray(preferences)) return [];
  return preferences.map((pref) => pref);
};

export const fetchRulePreferences = createAsyncThunk(
  "rulePreference/fetchRulePreferences",
  async (
    ruleUuid: string,
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/rules/${ruleUuid}`,
        {
          headers: {
            Authorization: localStorage.getItem("authToken") || "",
            "Content-Type": "application/json",
          },
        },
      );
      if(!response.ok) {
        throw new Error("Failed to fetch rule preferences");
      }
      const data = await response.json();
      if(
        data.success &&
        data.data &&
        Array.isArray(data.data.schedulePreferences)
      ) {
        return data.data.schedulePreferences;
      }
      return [];
    }catch(error: any) {
      return rejectWithValue(
        error.message || "Failed to load rule preferences",
      );
    }
  },
);

export const saveRulePreferenceChanges = createAsyncThunk(
  "rulePreference/saveChanges",
  async (
    {
      ruleUuid,
      pendingChanges,
      planSettingsId,
    }: {
      ruleUuid: string;
      pendingChanges: PendingChange[];
      planSettingsId?: number | null;
    },
    { rejectWithValue },
  ) => {
    if(!ruleUuid || pendingChanges.length === 0) {
      return { success: true, changes: [] };
    }
    const results: Array<{
      success: boolean;
      change: PendingChange;
      message?: string;
      error?: any;
    }> = [];
    const creates = pendingChanges.filter(
      (c) => c.operationType === ChangeOperationType.CREATE,
    );
    const updates = pendingChanges.filter(
      (c) => c.operationType === ChangeOperationType.UPDATE,
    );
    const deletes = pendingChanges.filter(
      (c) => c.operationType === ChangeOperationType.DELETE,
    );
    const toastMessages: Array<{ type: "success" | "error"; message: string }> =
      [];
    try {
      for(const change of creates) {
        try {
          // Create request body with planSettingsId if available
          const requestBody: any = {
            periodId: change.periodId,
            dayOfWeek: change.dayOfWeek,
            preferenceType: "applies",
            preferenceValue: true,
          };

          // Include planSettingsId if it exists in the change or from the parent
          if (change.planSettingsId !== undefined) {
            requestBody.planSettingsId = change.planSettingsId;
          } else if (planSettingsId) {
            requestBody.planSettingsId = planSettingsId;
          }

          const response = await fetch(
            `http://localhost:8080/api/v1/rules/${ruleUuid}/preferences`,
            {
              method: "POST",
              headers: {
                Authorization: localStorage.getItem("authToken") || "",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            },
          );
          if(!response.ok) {
            throw new Error("Failed to create preference");
          }
          const data = await response.json();
          results.push({
            success: true,
            change,
            message: data.message || "rule.schedule.preference.created",
          });
          toastMessages.push({
            type: "success",
            message: data.message || "rule.schedule.preference.created",
          });
        }catch(error) {
          results.push({ success: false, change, error });
          toastMessages.push({
            type: "error",
            message: "Failed to create preference",
          });
        }
      }
      for(const change of updates) {
        try {
          // Create request body with planSettingsId if available
          const requestBody: any = {
            periodId: change.periodId,
            dayOfWeek: change.dayOfWeek,
            preferenceType: "applies",
            preferenceValue:
              change.appliesValue !== undefined
                ? change.appliesValue
                : true,
          };

          // Include planSettingsId if it exists in the change or from the parent
          if (change.planSettingsId !== undefined) {
            requestBody.planSettingsId = change.planSettingsId;
          } else if (planSettingsId) {
            requestBody.planSettingsId = planSettingsId;
          }

          const response = await fetch(
            `http://localhost:8080/api/v1/rules/schedule-preference/${change.preferenceUuid}`,
            {
              method: "PUT",
              headers: {
                Authorization: localStorage.getItem("authToken") || "",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            },
          );
          if(!response.ok) {
            throw new Error("Failed to update preference");
          }
          const data = await response.json();
          results.push({
            success: true,
            change,
            message: data.message || "rule.schedule.preference.updated",
          });
          toastMessages.push({
            type: "success",
            message: data.message || "rule.schedule.preference.updated",
          });
        }catch(error) {
          results.push({ success: false, change, error });
          toastMessages.push({
            type: "error",
            message: "Failed to update preference",
          });
        }
      }
      for(const change of deletes) {
        try {
          // Create request body with planSettingsId if available
          const requestBody: any = {
            periodId: change.periodId,
            dayOfWeek: change.dayOfWeek,
          };

          // Include planSettingsId if it exists in the change or from the parent
          if (change.planSettingsId !== undefined) {
            requestBody.planSettingsId = change.planSettingsId;
          } else if (planSettingsId) {
            requestBody.planSettingsId = planSettingsId;
          }

          const response = await fetch(
            `http://localhost:8080/api/v1/rules/schedule-preference/${change.preferenceUuid}`,
            {
              method: "DELETE",
              headers: {
                Authorization: localStorage.getItem("authToken") || "",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            },
          );
          if(!response.ok) {
            throw new Error("Failed to delete preference");
          }
          const data = await response.json();
          results.push({
            success: true,
            change,
            message: data.message || "rule.schedule.preference.deleted",
          });
          toastMessages.push({
            type: "success",
            message: data.message || "rule.schedule.preference.deleted",
          });
        }catch(error) {
          results.push({ success: false, change, error });
          toastMessages.push({
            type: "error",
            message: "Failed to delete preference",
          });
        }
      }
      return { success: true, changes: results, toastMessages };
    }catch(error: any) {
      return rejectWithValue(error.message || "Failed to save changes");
    }
  },
);

const sliceRulePreference = createSlice({
  name: "rulePreference",
  initialState,
  reducers: {
    setSelectedRuleUuid: (state, action: PayloadAction<string | null>) => {
      state.selectedRuleUuid = action.payload;
      if(state.selectedRuleUuid !== action.payload) {
        state.schedulePreferences = [];
      }
    },

    addRulePendingChange: (state, action: PayloadAction<PendingChange>) => {
      const cellIndex = action.payload.cellIndex;
      const existingIndex = state.rulePendingChanges.findIndex(
        (c) => c.cellIndex === cellIndex,
      );

      if(existingIndex !== -1) {
        state.rulePendingChanges[existingIndex] = action.payload;
      }else {
        state.rulePendingChanges.push(action.payload);
      }
    },

    clearRulePendingChanges: (state) => {
      state.rulePendingChanges = [];
    },

    setSchedulePreferences: (
      state,
      action: PayloadAction<SchedulePreference[]>,
    ) => {
      state.schedulePreferences = processPreferences(action.payload);
    },

    resetRulePreferenceState: (state) => {
      state.selectedRuleUuid = null;
      state.rulePendingChanges = [];
      state.schedulePreferences = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchRulePreferences.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRulePreferences.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedulePreferences = processPreferences(action.payload);
      })
      .addCase(fetchRulePreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      .addCase(saveRulePreferenceChanges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveRulePreferenceChanges.fulfilled, (state) => {
        state.isLoading = false;
        state.rulePendingChanges = [];
      })
      .addCase(saveRulePreferenceChanges.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload && typeof action.payload === "object"
            ? (action.payload as any).message
            : (action.payload as string);
      });
  },
});

export const {
  setSelectedRuleUuid,
  addRulePendingChange,
  clearRulePendingChanges,
  setSchedulePreferences,
  resetRulePreferenceState,
} = sliceRulePreference.actions;

export default sliceRulePreference.reducer;
