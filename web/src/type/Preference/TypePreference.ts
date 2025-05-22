import { PreferenceType } from "@/type/Calendar/TypeCalendar";

export interface Preference {
  uuid: string;
  name: string;
  type: PreferenceType;
  label: string;
  color: string;
  description: string;
}
