import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { format } from "date-fns";
import { Check, X, GraduationCap } from "lucide-react";
import { Button } from "@/component/Ui/button";
import { useToast } from "@/hook/useToast";
import {
  useGetRoomSchedulePreferencesQuery,
  useUpdateRoomSchedulePreferencesMutation,
  useSetRoomAvailabilityMutation,
  useGetPeriodsByOrganizationQuery,
} from "@/store/Room/ApiRoom";
import { TypePeriod, WeekDay, DAY_NAMES } from "@/type/Room/TypeRoom";
import { RoomSchedulePreference } from "@/type/Room/TypeRoom";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { useI18n } from "@/hook/useI18n";
import { 
  ROOM_PREFERENCE_TYPES, 
  getRoomPreferenceColor, 
  getRoomPreferenceIconName, 
  getRoomCellStyle,
  getRoomPreferenceDisplayName
} from "@/util/roomCalendar";

interface SchedulePreferencesProps {
  roomId: number;
  planSettingsId?: number | null;
}

const DEFAULT_ORGANIZATION_ID = 1;

const SchedulePreferences = ({ roomId, planSettingsId }: SchedulePreferencesProps) => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [selectedPreference, setSelectedPreference] = useState<string | null>(
    null,
  );
  const [periods, setPeriods] = useState<TypePeriod[]>([]);
  const [preferences, setPreferences] = useState<
    Record<number, Record<number, string>>
  >({});
  const [initialized, setInitialized] = useState(false);
  const hasUnsavedChanges = useRef(false);
  const lastLoadedPrefs = useRef<Record<number, Record<number, string>>>({});
  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);

  const {
    data: roomPreferences,
    isLoading: isLoadingPreferences,
    refetch: refetchPreferences,
  } = useGetRoomSchedulePreferencesQuery(roomId, {
    skip: !roomId,
  });

  const { data: periodsData, isLoading: isLoadingPeriods } =
    useGetPeriodsByOrganizationQuery(planSettingsId ? { planSettingsId } : DEFAULT_ORGANIZATION_ID);

  const [updatePreferences, { isLoading: isUpdating }] =
    useUpdateRoomSchedulePreferencesMutation();
  const [setAllAvailability, { isLoading: isSettingAvailability }] =
    useSetRoomAvailabilityMutation();

  const DAYS = useMemo(() => {
    if(!periodsData?.data || periodsData.data.length === 0) return [];

    const usedDays = new Set<number>();

    periodsData.data.forEach((period) => {
      if(period.days && Array.isArray(period.days)) {
        period.days.forEach((day) => usedDays.add(day));
      }else {
        period.schedules.forEach((schedule) => {
          usedDays.add(schedule.day);
        });
      }
    });

    return Array.from(usedDays).sort((a, b) => a - b);
  }, [periodsData]);

  useEffect(() => {
    if(periodsData?.data && Array.isArray(periodsData.data)) {
      const formattedPeriods = periodsData.data.map((period: TypePeriod) => {
        const startTime = period.startTime
          ? new Date(`1970-01-01T${period.startTime}`)
          : null;
        const endTime = period.endTime
          ? new Date(`1970-01-01T${period.endTime}`)
          : null;

        const formattedTime =
          startTime && endTime
            ? `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`
            : "";

        return {
          ...period,
          formattedTime,
        };
      });

      formattedPeriods.sort((a, b) => a.periodNumber - b.periodNumber);
      setPeriods(formattedPeriods);
    }
  }, [periodsData]);

  useEffect(() => {
    if(roomId && periods.length > 0 && !hasUnsavedChanges.current) {
      const newPreferences: Record<number, Record<number, string>> = {};

      DAYS.forEach((day) => {
        newPreferences[day] = {};
      });

      if(roomPreferences?.data && Array.isArray(roomPreferences.data)) {
        roomPreferences.data.forEach((pref: RoomSchedulePreference) => {
          const { day, periodId, isAvailable } = pref;
          if(!newPreferences[day]) {
            newPreferences[day] = {};
          }
          newPreferences[day][periodId] = isAvailable
            ? ROOM_PREFERENCE_TYPES.AVAILABLE
            : ROOM_PREFERENCE_TYPES.UNAVAILABLE;
        });
      }

      setPreferences(newPreferences);
      lastLoadedPrefs.current = JSON.parse(JSON.stringify(newPreferences));
      setInitialized(true);
    }
  }, [roomId, periods, roomPreferences, DAYS]);

  const handleCellClick = useCallback(
    (day: number, periodId: number) => {
      if(selectedPreference === null) return;

      setPreferences((prev) => {
        const currentPref = prev[day]?.[periodId] || ROOM_PREFERENCE_TYPES.AVAILABLE;
        let newPref;

        if(currentPref === selectedPreference) {
          newPref =
            selectedPreference === ROOM_PREFERENCE_TYPES.AVAILABLE
              ? ROOM_PREFERENCE_TYPES.UNAVAILABLE
              : ROOM_PREFERENCE_TYPES.AVAILABLE;
        }else {
          newPref = selectedPreference;
        }

        hasUnsavedChanges.current = true;

        return {
          ...prev,
          [day]: {
            ...prev[day],
            [periodId]: newPref,
          },
        };
      });
    },
    [selectedPreference],
  );

  const handleSavePreferences = useCallback(async () => {
    if(!roomId) return;

    try {
      const prefsToSave = Object.entries(preferences).flatMap(
        ([day, periodPrefs]) =>
          Object.entries(periodPrefs).map(([periodId, prefType]) => ({
            day: parseInt(day, 10),
            periodId: parseInt(periodId, 10),
            isAvailable: prefType === ROOM_PREFERENCE_TYPES.AVAILABLE,
            planSettingsId: planSettingsId || undefined,
          })),
      );

      const response = await updatePreferences({
        roomId,
        preferences: prefsToSave,
      }).unwrap();

      lastLoadedPrefs.current = JSON.parse(JSON.stringify(preferences));
      hasUnsavedChanges.current = false;

      toast({
        description: response.message || "Preferences saved successfully",
      });

      refetchPreferences();
    }catch(error: any) {
      toast({
        variant: "destructive",
        description: error?.data?.message || "Failed to save preferences",
      });
    }
  }, [roomId, preferences, updatePreferences, refetchPreferences, toast, planSettingsId]);

  const handleResetPreferences = useCallback(async () => {
    if(!roomId) return;

    try {
      const response = await setAllAvailability({
        roomId,
        isAvailable: true,
      }).unwrap();

      setPreferences({});
      lastLoadedPrefs.current = {};
      hasUnsavedChanges.current = false;

      toast({
        description: response.message || "All preferences reset to available",
      });

      refetchPreferences();
    }catch(error: any) {
      toast({
        variant: "destructive",
        description: error?.data?.message || "Failed to reset preferences",
      });
    }
  }, [roomId, setAllAvailability, refetchPreferences, toast]);

  const handleCancelChanges = useCallback(() => {
    if(Object.keys(lastLoadedPrefs.current).length > 0) {
      setPreferences(JSON.parse(JSON.stringify(lastLoadedPrefs.current)));
      hasUnsavedChanges.current = false;

      toast({
        description: "Changes discarded",
      });
    }
  }, [toast]);

  // Render icon based on preference type
  const renderPreferenceIcon = (preferenceType: string | null) => {
    const iconName = getRoomPreferenceIconName(preferenceType);
    
    switch (iconName) {
      case 'check':
        return <Check className="h-4 w-4 text-white" />;
      case 'x':
        return <X className="h-4 w-4 text-white" />;
      default:
        return null;
    }
  };

  if(isLoadingPreferences || isLoadingPeriods) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 istui-timetable__main_preferences_title">
          Room Schedule Preferences
        </h2>
        <p className="text-sm text-muted-foreground">
          Define when this room is available for scheduling classes. Click on
          the cells to toggle availability.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <Button
          variant={
            selectedPreference === ROOM_PREFERENCE_TYPES.AVAILABLE
              ? "default"
              : "outline"
          }
          size="sm"
          onClick={() => setSelectedPreference(ROOM_PREFERENCE_TYPES.AVAILABLE)}
          className={
            selectedPreference === ROOM_PREFERENCE_TYPES.AVAILABLE
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "istui-timetable_main_preferences_options"
          }
        >
          <Check className="h-4 w-4 mr-2" />
          <span>Available</span>
        </Button>

        <Button
          variant={
            selectedPreference === ROOM_PREFERENCE_TYPES.UNAVAILABLE
              ? "default"
              : "outline"
          }
          size="sm"
          onClick={() => setSelectedPreference(ROOM_PREFERENCE_TYPES.UNAVAILABLE)}
          className={
            selectedPreference === ROOM_PREFERENCE_TYPES.UNAVAILABLE
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "istui-timetable_main_preferences_options"
          }
        >
          <X className="h-4 w-4 mr-2" />
          <span>Unavailable</span>
        </Button>
      </div>

      {hasUnsavedChanges.current && (
        <div className="py-2 px-3 bg-amber-50 border border-main rounded-md mb-4 text-sm flex items-center justify-between">
          <p className="text-amber-700">
            You have unsaved changes that will be lost if you navigate away.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancelChanges}>
              Discard
            </Button>
            <Button
              size="sm"
              className="text-white"
              onClick={handleSavePreferences}
              disabled={isUpdating}
            >
              {isUpdating && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
              )}
              Save
            </Button>
          </div>
        </div>
      )}

      <div className="border rounded-md overflow-x-auto istui-timetable_main_preferences_calendar">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="py-2 px-4 text-left font-medium text-gray-600">
                Time Period
              </th>
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="py-2 px-4 text-center font-medium text-gray-600"
                >
                  {DAY_NAMES[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {periods.map((period) => (
              <tr key={period.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">
                  <div className="flex flex-col">
                    <span>{period.name}</span>
                    <span className="text-xs text-gray-500">
                      {period.formattedTime}
                    </span>
                    <span className="text-xs text-gray-400">
                      {period.periodType}
                    </span>
                  </div>
                </td>
                {DAYS.map((day) => {
                  const preference = preferences[day]?.[period.id];
                  if(preference === undefined) {
                    console.warn(
                      `Missing preference for day ${day}, period ${period.id}`,
                    );
                  }
                  return (
                    <td
                      key={`${day}-${period.id}`}
                      className="py-2 px-4 text-center cursor-pointer border bg-white hover:bg-gray-50"
                      onClick={() => handleCellClick(day, period.id)}
                    >
                      <div className="flex items-center justify-center h-full">
                        <div
                          className={`flex items-center justify-center rounded-full w-8 h-8 ${getRoomPreferenceColor(preference || ROOM_PREFERENCE_TYPES.AVAILABLE)}`}
                        >
                          {renderPreferenceIcon(preference || ROOM_PREFERENCE_TYPES.AVAILABLE)}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleResetPreferences}
            disabled={isSettingAvailability}
          >
            {isSettingAvailability && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2 istui-timetable_main_preferences_button"></div>
            )}
            Reset All to Available
          </Button>

          {hasUnsavedChanges.current && (
            <Button variant="outline" onClick={handleCancelChanges}>
              Discard Changes
            </Button>
          )}
        </div>

        <Button
          onClick={handleSavePreferences}
          className="text-white istui-timetable_main_preferences_button"
          disabled={isUpdating}
        >
          {isUpdating && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
};

export default SchedulePreferences;
