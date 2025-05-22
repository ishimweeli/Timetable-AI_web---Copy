export type PreferenceType = "cannot" | "prefers" | "must" | null;

export interface TimeSlot {
  period: number;
  time: string;
}

export interface SchedulePreference {
  day: string;
  period: number;
  preference: PreferenceType;
}

export const TIME_SLOTS: TimeSlot[] = [
  { period: 1, time: "8:00 - 8:45" },
  { period: 2, time: "9:00 - 9:45" },
  { period: 3, time: "10:00 - 10:45" },
  { period: 4, time: "11:00 - 11:45" },
  { period: 5, time: "12:30 - 13:15" },
  { period: 6, time: "13:15 - 14:00" },
  { period: 7, time: "14:15 - 15:00" },
  { period: 8, time: "15:00 - 15:45" },
];

export const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"];
