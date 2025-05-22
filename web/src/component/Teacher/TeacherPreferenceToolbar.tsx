// src/component/Teacher/TeacherPreferenceToolbar.tsx
import React from "react";
import { Button } from "@/component/Ui/button";
import { Loader2, Save, X, Check, PinIcon, Circle, Trash } from "lucide-react";
import { PreferenceType } from "@/type/Calendar/TypeCalendar";
import { useI18n } from "@/hook/useI18n";

interface TeacherPreferenceToolbarProps {
  selectedPreferenceType: PreferenceType | null;
  onSelectPreference: (preferenceType: PreferenceType | null) => void;
  pendingChangesCount: number;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
  isSaving: boolean;
  preferenceOptions: { type: PreferenceType; label: string; color: string; description: string }[];
}

const TeacherPreferenceToolbar: React.FC<TeacherPreferenceToolbarProps> = ({
  selectedPreferenceType,
  onSelectPreference,
  pendingChangesCount,
  onSaveChanges,
  onDiscardChanges,
  isSaving,
  preferenceOptions,
}) => {
  const { t } = useI18n();

  // Function to get icon for preference type - updated with standardized icons
  const getPreferenceIcon = (preferenceType: PreferenceType) => {
    switch (preferenceType) {
      case PreferenceType.MUST_SCHEDULE_CLASS:
        return <PinIcon className="mr-2 h-4 w-4" />;
      case PreferenceType.MUST_NOT_SCHEDULE_CLASS:
        return <X className="mr-2 h-4 w-4" />;
      case PreferenceType.PREFERS_TO_SCHEDULE_CLASS:
        return <Check className="mr-2 h-4 w-4" />;
      case PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS:
        return <Circle className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  // Function to get button styles based on preference type - updated with standardized colors
  const getButtonStyle = (preferenceType: PreferenceType) => {
    if (selectedPreferenceType !== preferenceType) {
      return "";
    }
    
    // Apply specific color based on preference type - match standardized colors
    switch (preferenceType) {
      case PreferenceType.MUST_SCHEDULE_CLASS:
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case PreferenceType.PREFERS_TO_SCHEDULE_CLASS:
        return "bg-green-500 hover:bg-green-600 text-white";
      case PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS:
        return "bg-amber-500 hover:bg-amber-600 text-white";
      case PreferenceType.MUST_NOT_SCHEDULE_CLASS:
        return "bg-red-600 hover:bg-red-700 text-white";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex flex-wrap items-center justify-between mb-2">
        <h3 className="text-lg font-medium">
          {t("teacher.preferences.title", { defaultValue: "Teacher Preferences" })}
        </h3>
        
        {pendingChangesCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscardChanges}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" />
              {t("actions.discard", { defaultValue: "Discard" })}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onSaveChanges}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {t("actions.save", { defaultValue: "Save" })} ({pendingChangesCount})
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2 bg-muted p-3 rounded-md">
        <div className="mr-2 font-medium text-sm flex items-center">
          {t("calendar.preferences.selectPreference", { defaultValue: "Select preference" })}:
        </div>
        
        {preferenceOptions.map((option) => (
          <Button
            key={option.type}
            variant={selectedPreferenceType === option.type ? "default" : "outline"}
            className={`${getButtonStyle(option.type)}`}
            onClick={() => onSelectPreference(option.type)}
          >
            {getPreferenceIcon(option.type)}
            {option.label}
          </Button>
        ))}
        
        <Button
          variant="ghost"
          className="ml-auto"
          onClick={() => onSelectPreference(null)}
        >
          <Trash className="mr-2 h-4 w-4" />
          {t("actions.clear", { defaultValue: "Clear" })}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground p-2 bg-gray-50 rounded border border-gray-100">
        <span className="font-medium">
          {t("teacher.preferences.instructions", { defaultValue: "Instructions" })}:
        </span>{" "}
        {t("teacher.preferences.instructionsDetail", { 
          defaultValue: "Click on a preference type above, then click on time slots in the calendar to set or update preferences."
        })}
      </div>
    </div>
  );
};

export default TeacherPreferenceToolbar;