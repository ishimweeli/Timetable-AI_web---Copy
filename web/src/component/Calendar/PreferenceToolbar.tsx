import React from "react";
import { X, Save } from "lucide-react";
import { PreferenceType } from "@/type/Calendar/TypeCalendar";
import {
  getDefaultPreferences,
  getPreferenceIcon,
  getPreferenceColor,
  getPreferenceDisplayName,
  countPendingChangesByType,
} from "@/util/calendar";

interface PreferenceToolbarProps {
  selectedPreferenceType: PreferenceType | null;
  onSelectPreference: (preferenceType: PreferenceType | null) => void;
  pendingChangesCount: number;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
  isSaving: boolean;
}

const PreferenceToolbar: React.FC<PreferenceToolbarProps> = ({
  selectedPreferenceType,
  onSelectPreference,
  pendingChangesCount,
  onSaveChanges,
  onDiscardChanges,
  isSaving,
}) => {
  const preferences = getDefaultPreferences();

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-md">
      <div className="flex justify-between items-center mb-3">
        <div className="font-medium text-gray-700 istui-timetable__main_preferences_selected">
          Select a preference to apply:
        </div>

        {pendingChangesCount > 0 && (
          <div className="flex space-x-2">
            <button
              onClick={onDiscardChanges}
              disabled={isSaving}
              className="text-sm px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors flex items-center"
            >
              <X className="h-4 w-4 mr-1 text-gray-500 " />
              Discard
            </button>
            <button
              onClick={onSaveChanges}
              disabled={isSaving}
              className="text-sm px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-1" />
              Save Changes ({pendingChangesCount})
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {preferences.map((pref) => (
          <button
            key={pref.uuid}
            onClick={() => onSelectPreference(pref.type)}
            className={`
              flex items-center px-3 py-2 rounded-md transition-colors istui-timetable_main_preferences_options
              ${
                selectedPreferenceType === pref.type
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-100"
              }
            `}
            title={pref.description}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${getPreferenceColor(pref.type)}`}
            >
              {getPreferenceIcon(pref.type)}
            </div>
            <span>{pref.name}</span>
          </button>
        ))}

        {/* Clear option */}
        <button
          onClick={() => onSelectPreference(null)}
          className={`
            flex items-center px-3 py-2 rounded-md transition-colors istui-timetable_main_preferences_clear
            ${
              selectedPreferenceType === null
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-100"
            }
          `}
          title="Clear any existing preference"
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2 bg-gray-300">
            <X className="h-4 w-4 text-gray-600" />
          </div>
          <span>Clear</span>
        </button>
      </div>

      {selectedPreferenceType !== null && (
        <div className="mt-3 text-sm text-gray-600">
          Selected:{" "}
          <span className="font-medium">
            {getPreferenceDisplayName(selectedPreferenceType)}
          </span>
          <span className="ml-2 text-gray-500">
            (Click on a cell to apply this preference)
          </span>
        </div>
      )}
    </div>
  );
};

export default PreferenceToolbar;
