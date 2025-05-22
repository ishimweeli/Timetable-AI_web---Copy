import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Rule } from "./ApiRule.ts";
import {
  TimeSlotPreference,
  getDefaultTimeSlotPreferences,
} from "./ServiceRule";

interface RuleState {
  selectedRule: Rule | null;
  rules: Rule[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  conditionsView: "grid" | "list";
  timeSlotPreferences: TimeSlotPreference[];
}

const initialState: RuleState = {
  selectedRule: null,
  rules: [],
  status: "idle",
  error: null,
  conditionsView: "grid",
  timeSlotPreferences: getDefaultTimeSlotPreferences(),
};

export const sliceRule = createSlice({
  name: "rule",
  initialState,
  reducers: {
    setSelectedRule: (state, action: PayloadAction<string | null>) => {
      state.selectedRule = action.payload;
    },
    setRules: (state, action: PayloadAction<Rule[]>) => {
      state.rules = action.payload;
    },
    addRule: (state, action: PayloadAction<Rule>) => {
      state.rules.push(action.payload);
    },
    updateRuleInList: (state, action: PayloadAction<Rule>) => {
      const index = state.rules.findIndex(
        (rule) => rule.uuid === action.payload.uuid,
      );
      if(index !== -1) {
        state.rules[index] = action.payload;
      }
    },
    removeRule: (state, action: PayloadAction<string>) => {
      state.rules = state.rules.filter((rule) => rule.uuid !== action.payload);
      if(state.selectedRule && state.selectedRule.uuid === action.payload) {
        state.selectedRule = null;
      }
    },
    setStatus: (
      state,
      action: PayloadAction<"idle" | "loading" | "succeeded" | "failed">,
    ) => {
      state.status = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setConditionsView: (state, action: PayloadAction<"grid" | "list">) => {
      state.conditionsView = action.payload;
    },
    setTimeSlotPreferences: (
      state,
      action: PayloadAction<TimeSlotPreference[]>,
    ) => {
      state.timeSlotPreferences = action.payload;
    },
    updateTimeSlotPreference: (
      state,
      action: PayloadAction<{
        day: string;
        time: string;
        preference: "apply" | "none";
      }>,
    ) => {
      const { day, time, preference } = action.payload;
      state.timeSlotPreferences = state.timeSlotPreferences.map((pref) =>
        pref.day === day && pref.time === time ? { ...pref, preference } : pref,
      );
    },
    resetTimeSlotPreferences: (state) => {
      state.timeSlotPreferences = state.timeSlotPreferences.map((pref) => ({
        ...pref,
        preference: "none",
      }));
    },
    setSelectedRuleUuid: (state, action: PayloadAction<string>) => {
    },
  },
});

export const {
  setSelectedRule,
  setRules,
  addRule,
  updateRuleInList,
  removeRule,
  setStatus,
  setError,
  setConditionsView,
  setTimeSlotPreferences,
  updateTimeSlotPreference,
  resetTimeSlotPreferences,
  setSelectedRuleUuid,
} = sliceRule.actions;

export default sliceRule.reducer;
