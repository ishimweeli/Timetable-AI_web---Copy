import React from "react";
import {
  Check,
  X,
  PinIcon,
  Circle,
  Trash,
  Save,
  Loader2,
} from "lucide-react";
import { Button } from "@/component/Ui/button";
import { PreferenceType } from "@/type/Calendar/TypeCalendar";

interface PreferenceOption {
  type: PreferenceType;
  name: string;
  color: string;
  icon: string;
}

interface ClassPreferenceToolbarProps {
  selectedPreferenceType: PreferenceType | null;
  onSelectPreference: (type: PreferenceType | null) => void;
  pendingChangesCount: number;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
  isSaving: boolean;
  preferenceOptions?: PreferenceOption[];
}

const ClassPreferenceToolbar: React.FC<ClassPreferenceToolbarProps> = ({
  selectedPreferenceType,
  onSelectPreference,
  pendingChangesCount,
  onSaveChanges,
  onDiscardChanges,
  isSaving,
  preferenceOptions,
}) => {
  // Default class-specific preference options if none provided
  const defaultOptions: PreferenceOption[] = [
    {
      type: PreferenceType.MUST_SCHEDULE_CLASS,
      name: "Fixed Requirement",
      color: "bg-blue-500",
      icon: "pin",
    },
    {
      type: PreferenceType.MUST_NOT_SCHEDULE_CLASS,
      name: "Unavailable Slot",
      color: "bg-red-600",
      icon: "x",
    },
    {
      type: PreferenceType.PREFERS_TO_SCHEDULE_CLASS,
      name: "Preferred Slot",
      color: "bg-green-500",
      icon: "check",
    },
    {
      type: PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
      name: "Not Preferred",
      color: "bg-amber-500",
      icon: "circle",
    },
  ];

  const options = preferenceOptions || defaultOptions;

  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-md">
        <span className="text-sm font-medium mr-2 ">Preference:</span>

        {options.map((option) => (
          <Button
            key={option.type}
            variant={
              selectedPreferenceType === option.type ? "default" : "outline"
            }
            className={`flex items-center istui-timetable_main_preferences_options ${selectedPreferenceType === option.type ? option.color : ""}`}
            onClick={() => onSelectPreference(option.type)}
          >
            {option.icon === "check" && <Check className="mr-2 h-4 w-4" />}
            {option.icon === "x" && <X className="mr-2 h-4 w-4" />}
            {option.icon === "pin" && <PinIcon className="mr-2 h-4 w-4" />}
            {option.icon === "circle" && <Circle className="mr-2 h-4 w-4" />}
            {option.name}
          </Button>
        ))}

        <Button
          variant="ghost"
          className="ml-auto istui-timetable_main_preferences_options"
          onClick={() => onSelectPreference(null)}
        >
          <Trash className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>

      {pendingChangesCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md ">
          <span className="text-sm text-blue-700">
            {pendingChangesCount}{" "}
            {pendingChangesCount === 1 ? "change" : "changes"} pending
          </span>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscardChanges}
              disabled={isSaving}
            >
              Discard
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={onSaveChanges}
              disabled={isSaving}
              className=""
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassPreferenceToolbar;
