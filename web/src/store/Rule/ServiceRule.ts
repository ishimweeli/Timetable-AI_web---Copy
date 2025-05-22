import { Rule } from "./ApiRule";

export interface TimeSlotPreference {
  day: string;
  time: string;
  preference: "apply" | "none";
}

export interface RuleCondition {
  timeSlotPreferences: TimeSlotPreference[];
}

export const parseRuleConditions = (rule: Rule | null): RuleCondition => {
  if(!rule || !rule.data) {
    return { timeSlotPreferences: [] };
  }

  try {
    const parsedData = JSON.parse(rule.data);
    return {
      timeSlotPreferences: Array.isArray(parsedData.timeSlotPreferences)
        ? parsedData.timeSlotPreferences
        : [],
    };
  }catch(error) {
    console.error("Error parsing rule conditions:", error);
    return { timeSlotPreferences: [] };
  }
};

export const serializeRuleConditions = (conditions: RuleCondition): string => {
  return JSON.stringify(conditions);
};

export const getTimeSlots = (): string[] => [
  "8:00 - 8:45",
  "9:00 - 9:45",
  "10:00 - 10:45",
  "11:00 - 11:45",
  "12:30 - 13:15",
  "13:15 - 14:00",
  "14:15 - 15:00",
  "15:00 - 15:45",
];

export const getDays = (): string[] => [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export const getDefaultTimeSlotPreferences = (): TimeSlotPreference[] => {
  const timeSlots = getTimeSlots();
  const days = getDays();

  const preferences: TimeSlotPreference[] = [];

  for(const time of timeSlots) {
    for(const day of days) {
      preferences.push({
        day,
        time,
        preference: "none",
      });
    }
  }

  return preferences;
};

export const updateTimeSlotPreference = (
  preferences: TimeSlotPreference[],
  day: string,
  time: string,
  preference: "apply" | "none",
): TimeSlotPreference[] => {
  return preferences.map((pref) =>
    pref.day === day && pref.time === time ? { ...pref, preference } : pref,
  );
};

export const resetTimeSlotPreferences = (
  preferences: TimeSlotPreference[],
): TimeSlotPreference[] => {
  return preferences.map((pref) => ({ ...pref, preference: "none" }));
};
