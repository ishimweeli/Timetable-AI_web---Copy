import React from "react";
import { cn } from "@/util/util.ts";
import { Button } from "@/component/Ui/button";
import { RadioGroup, RadioGroupItem } from "@/component/Ui/radio-group";
import {
  PreferenceType,
  SchedulePreference,
  TIME_SLOTS,
  DAYS,
} from "@/type/Schedule/TypeSchedule";
import { useI18n } from "@/hook/useI18n";

interface ScheduleGridProps {
  preferences: SchedulePreference[];
  onPreferenceChange: (preference: SchedulePreference) => void;
  onSave: () => void;
  onReset: () => void;
  onAdd?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  onEnd?: () => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  preferences,
  onPreferenceChange,
  onSave,
  onReset,
  onAdd,
  onCancel,
  onDelete,
  onEnd,
}) => {
  const { t } = useI18n();
  const [selectedPreference, setSelectedPreference] =
    React.useState<PreferenceType>("prefers");

  const getPreference = (day: string, period: number): PreferenceType => {
    const preference = preferences.find(
      (p) => p.day === day && p.period === period,
    );
    return preference ? preference.preference : null;
  };

  const handleCellClick = (day: string, period: number) => {
    onPreferenceChange({
      day,
      period,
      preference: selectedPreference,
    });
  };

  const renderPreferenceIcon = (preference: PreferenceType) => {
    switch (preference) {
      case "cannot":
        return (
          <div className="flex items-center justify-center text-red-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "prefers":
        return (
          <div className="flex items-center justify-center text-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      case "must":
        return (
          <div className="flex items-center justify-center text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <circle
                cx="10"
                cy="10"
                r="7"
                className="stroke-current fill-none"
                strokeWidth="2"
              />
              <path
                fillRule="evenodd"
                d="M13.707 8.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 11.586l3.293-3.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <RadioGroup
          defaultValue="prefers"
          value={selectedPreference || "prefers"}
          onValueChange={(value) =>
            setSelectedPreference(value as PreferenceType)
          }
          className="flex items-center space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="cannot" id="cannot" />
            <label
              htmlFor="cannot"
              className="flex items-center space-x-1 cursor-pointer text-sm font-medium"
            >
              <span className="text-red-500">✕</span>
              <span>{t("classBand.schedulePreferences.cannotTeach")}</span>
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="prefers" id="prefers" />
            <label
              htmlFor="prefers"
              className="flex items-center space-x-1 cursor-pointer text-sm font-medium"
            >
              <span className="text-blue-500">✓</span>
              <span>{t("classBand.schedulePreferences.prefersToTeach")}</span>
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="must" id="must" />
            <label
              htmlFor="must"
              className="flex items-center space-x-1 cursor-pointer text-sm font-medium"
            >
              <span className="text-green-500">◯</span>
              <span>{t("classBand.schedulePreferences.mustTeach")}</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-3 text-center font-semibold text-sm">
                #
              </th>
              <th className="border p-3 text-center font-semibold text-sm">
                {t("classBand.schedulePreferences.time")}
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="border p-3 text-center font-semibold text-sm"
                >
                  {t(`classBand.schedulePreferences.days.${day}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map(({ period, time }) => (
              <tr key={period}>
                <td className="border p-3 text-center text-sm">{period}</td>
                <td className="border p-3 text-center text-sm">{time}</td>
                {DAYS.map((day) => (
                  <td
                    key={`${day}-${period}`}
                    className="border p-3 text-center cursor-pointer"
                    onClick={() => handleCellClick(day, period)}
                  >
                    {renderPreferenceIcon(getPreference(day, period))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <div className="flex justify-end gap-2">
          {onAdd && (
            <Button variant="outline" onClick={onAdd} className="font-medium">
              {t("common.add")}
            </Button>
          )}
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="font-medium"
            >
              {t("common.cancel")}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              onClick={onDelete}
              className="font-medium"
            >
              {t("common.deleteButton")}
            </Button>
          )}
          {onEnd && (
            <Button variant="outline" onClick={onEnd} className="font-medium">
              {t("common.end")}
            </Button>
          )}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onReset}
            className="text-gray-600 font-medium"
          >
            {t("classBand.schedulePreferences.resetToDefault")}
          </Button>
          <Button
            onClick={onSave}
            className="bg-progress hover:bg-violet-600 text-white font-medium"
          >
            {t("classBand.schedulePreferences.savePreferences")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleGrid;
