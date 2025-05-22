import React, { useState, useEffect } from "react";
import {
  CheckCheck,
  X,
  Loader2,
  Trash2,
  Check
} from "lucide-react";
import { Input } from "@/component/Ui/input";
import { Button } from "@/component/Ui/button";
import { Label } from "@/component/Ui/label";
import { Checkbox } from "@/component/Ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { Card } from "@/component/Ui/card";
import { useToast } from "@/hook/useToast";
import { useI18n } from "@/hook/useI18n";
import { Period, PeriodRequest } from "@/type/Period/index";
import DetailCardHeader from "@/component/Common/DetailCardHeader";

interface PlanSettings {
  periodsPerDay: number;
  daysPerWeek: number;
  startTime: string;
  endTime: string;
  timeBlockTypes: Array<{
    id: number;
    name: string;
    durationMinutes: number;
    occurrences: number;
  }>;
  uuid?: string;
  name?: string;
  category?: string;
}

interface PeriodFormProps {
  selectedPeriod: Period | null;
  isCreatingNew: boolean;
  selectedPlanSetting: PlanSettings | null;
  existingPeriodNumbers: number[];
  isLoadingPlanSettings: boolean;
  isSaving: boolean;
  onSubmit: (data: PeriodRequest) => Promise<void>;
  onCancel: () => void;
  onDelete: () => void;
  onSwap?: (period: Period) => void;
  isDeleting?: boolean;
  existingPeriodEndTimes: Record<number, string>;
}

const PeriodForm: React.FC<PeriodFormProps> = ({
  selectedPeriod,
  isCreatingNew,
  selectedPlanSetting,
  existingPeriodNumbers,
  existingPeriodEndTimes,
  isLoadingPlanSettings,
  isSaving,
  onSubmit,
  onCancel,
  onDelete,
  onSwap,
  isDeleting = false
}) => {
  const { t } = useI18n();
  const { toast } = useToast();
  
  const [periodName, setPeriodName] = useState<string>("");
  const [periodType, setPeriodType] = useState<string>("Regular");
  const [periodNumber, setPeriodNumber] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<string>("45");
  const [allowScheduling, setAllowScheduling] = useState<boolean>(true);
  const [showInTimetable, setShowInTimetable] = useState<boolean>(true);
  const [allowConflicts, setAllowConflicts] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState("details");
  const [periodNumberError, setPeriodNumberError] = useState<string | null>(null);
  const [periodStartTime, setPeriodStartTime] = useState<string>("");
  const [periodEndTime, setPeriodEndTime] = useState<string>("");

  // Initialize form with selected period data or default values
  useEffect(() => {
    if(selectedPeriod) {
      setPeriodNumber(selectedPeriod.periodNumber || 1);
      setPeriodName(selectedPeriod.name || "");
      setPeriodType(selectedPeriod.periodType || "");
      setDurationMinutes(selectedPeriod.durationMinutes?.toString() || "45");
      setAllowScheduling(selectedPeriod.allowScheduling ?? true);
      setShowInTimetable(selectedPeriod.showInTimetable ?? true);
      setAllowConflicts(selectedPeriod.allowConflicts ?? false);
    } else if(isCreatingNew) {
      if(
        selectedPlanSetting &&
        selectedPlanSetting.timeBlockTypes &&
        selectedPlanSetting.timeBlockTypes.length > 0
      ) {
        setPeriodType(selectedPlanSetting.timeBlockTypes[0].name);
      }else {
        setPeriodType("");
      }
      findNextAvailablePeriodNumber();
    }
  }, [selectedPeriod, isCreatingNew, selectedPlanSetting]);

  useEffect(() => {
    if(periodType && selectedPlanSetting && selectedPlanSetting.timeBlockTypes) {
      const selectedTimeBlock = selectedPlanSetting.timeBlockTypes.find(
        (type) => type.name === periodType
      );
      if(selectedTimeBlock) {
        setDurationMinutes(selectedTimeBlock.durationMinutes.toString());
      }
    }
  }, [periodType, selectedPlanSetting]);

  // Calculate period times whenever period number or duration changes
  useEffect(() => {
    if(periodNumber) {
      calculatePeriodTimes(periodNumber);
    }
  }, [periodNumber, durationMinutes, selectedPlanSetting, existingPeriodEndTimes]);

  const handleFormChange = (field: string, value: any) => {
    if(field === "periodNumber") {
      const numValue = parseInt(value);
      if(isCreatingNew) {
        if(existingPeriodNumbers.includes(numValue)) {
          setPeriodNumberError(
            t("period.periodNumberError", { periodNumber: numValue.toString() })
          );
        }else {
          setPeriodNumberError(null);
        }
      }else {
        setPeriodNumberError(null);
      }
      setPeriodNumber(numValue);
    } else if(field === "name") {
      setPeriodName(value);
    } else if(field === "periodType") {
      setPeriodType(value);
      if(selectedPlanSetting && selectedPlanSetting.timeBlockTypes) {
        const selectedType = selectedPlanSetting.timeBlockTypes.find(
          (type) => type.name === value
        );
        if(selectedType) {
          setDurationMinutes(selectedType.durationMinutes.toString());
        }
      }
    } else if(field === "durationMinutes") {
      setDurationMinutes(value);
    } else if(field === "allowScheduling") {
      setAllowScheduling(value);
    } else if(field === "showInTimetable") {
      setShowInTimetable(value);
    } else if(field === "allowConflicts") {
      setAllowConflicts(value);
    }
  };

  const calculatePeriodTimes = (periodNum: number) => {
    const defaultStartTime = "08:00:00";
    const defaultEndTime = "08:45:00";
    const duration = parseInt(durationMinutes || "45");
    
    // Ensure duration is always a valid number
    const validDuration = isNaN(duration) ? 45 : duration;
    if(periodNum === 1) {
      const startTime = selectedPlanSetting?.startTime || defaultStartTime;
      const startMinutes = convertTimeToMinutes(startTime);
      const endMinutes = startMinutes + validDuration;
      const endTime = convertMinutesToTime(endMinutes);
      setPeriodStartTime(startTime);
      setPeriodEndTime(endTime);
      return { startTime, endTime };
    }else {
      const previousPeriodEndTime = existingPeriodEndTimes[periodNum - 1];
      if(previousPeriodEndTime) {
        const startTime = previousPeriodEndTime;
        const startMinutes = convertTimeToMinutes(startTime);
        const endMinutes = startMinutes + validDuration;
        const endTime = convertMinutesToTime(endMinutes);
        setPeriodStartTime(startTime);
        setPeriodEndTime(endTime);
        return { startTime, endTime };
      }else {
        const baseStartTime = selectedPlanSetting?.startTime || defaultStartTime;
        const startMinutes = convertTimeToMinutes(baseStartTime) + (periodNum - 1) * validDuration;
        const endMinutes = startMinutes + validDuration;
        const startTime = convertMinutesToTime(startMinutes);
        const endTime = convertMinutesToTime(endMinutes);
        setPeriodStartTime(startTime);
        setPeriodEndTime(endTime);
        return { startTime, endTime };
      }
    }
  };

  const convertTimeToMinutes = (timeString: string | undefined | null): number => {
    if(!timeString) return 480; // Default to 8:00 AM (480 minutes)
    try {
      const parts = timeString.toString().split(":");
      const hours = parseInt(parts[0] || "0", 10);
      const minutes = parseInt(parts[1] || "0", 10);
      return hours * 60 + minutes;
    }catch(error) {
      console.error("Error converting time to minutes:", error);
      return 480; // Default to 8:00 AM on error
    }
  };

  const convertMinutesToTime = (totalMinutes: number): string => {
    try {
      if (isNaN(totalMinutes) || totalMinutes < 0) {
        return "08:45:00"; // Default end time if invalid
      }
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
    }catch(error) {
      console.error("Error converting minutes to time:", error);
      return "08:45:00"; // Default end time on error
    }
  };

  const getPeriodNumbers = () => {
    if(!selectedPlanSetting) {
      return Array.from({ length: 6 }, (_, i) => i + 1);
    }
    const periodsPerDay = selectedPlanSetting.periodsPerDay || 6;
    return Array.from({ length: periodsPerDay }, (_, i) => i + 1);
  };

  const getDaysDisplay = () => {
    if(!selectedPlanSetting) {
      return t("period.allDays", { days: "5" });
    }
    const daysPerWeek = selectedPlanSetting.daysPerWeek || 5;
    return t("period.allDays", { days: daysPerWeek.toString() });
  };

  const getDaysArrayFromPlanSettings = () => {
    const daysPerWeek = selectedPlanSetting?.daysPerWeek || 5;
    // Ensure we always return an array with at least one day
    const days = Array.from({ length: daysPerWeek }, (_, i) => i + 1);
    return days.length > 0 ? days : [1, 2, 3, 4, 5];
  };

  const findNextAvailablePeriodNumber = () => {
    let nextNumber = 1;
    while (existingPeriodNumbers.includes(nextNumber)) {
      nextNumber++;
    }
    setPeriodNumber(nextNumber);
    return nextNumber;
  };

  const handleSubmit = async () => {
    if(periodNumberError) {
      toast({
        variant: "destructive",
        title: t("validation.error"),
        description: periodNumberError,
      });
      return;
    }

    // Get default values for required fields
    const days = getDaysArrayFromPlanSettings();
    const defaultName = `Period ${periodNumber}`;
    const defaultStartTime = "08:00:00";
    const defaultEndTime = "08:45:00";
    const defaultDuration = 45;
    const defaultPeriodType = "Regular";
    
    // Create period request with fallback values for all fields
    const periodRequest: PeriodRequest = {
      organizationId: 1, // Could be retrieved from localStorage if needed
      periodNumber: periodNumber,
      name: periodName || defaultName,
      startTime: periodStartTime || defaultStartTime,
      endTime: periodEndTime || defaultEndTime,
      durationMinutes: parseInt(durationMinutes) || defaultDuration,
      periodType: (periodType || defaultPeriodType) as "Regular" | "Break" | "Lunch" | "Assembly",
      days: days && days.length > 0 ? days : [1, 2, 3, 4, 5],
      allowScheduling: allowScheduling === false ? false : true,
      showInTimetable: showInTimetable === false ? false : true,
      allowConflicts: allowConflicts === true ? true : false,
    };

    console.log("PeriodForm - Submitting with complete data:", periodRequest);
    await onSubmit(periodRequest);
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <DetailCardHeader 
          tabs={[
            { id: "details", label: t("period.details") },
            { id: "settings", label: t("period.settings") }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <TabsContent
          value="details"
          className="p-4 focus-visible:outline-none focus-visible:ring-0"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="periodNumber"
                  className="block text-sm font-medium mb-1 istui-timetable__main_form_input_label"
                >
                  {t("period.periodNumber")}
                </label>
                <select
                  id="periodNumber"
                  className={`w-full rounded-md border istui-timetable__main_form_input ${periodNumberError ? "border-red-500" : "border-input"} bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`}
                  value={periodNumber}
                  onChange={(e) => {
                    handleFormChange(
                      "periodNumber",
                      parseInt(e.target.value),
                    );
                  }}
                  disabled={!isCreatingNew}
                >
                  {getPeriodNumbers().map((num) => (
                    <option
                      key={`period-number-${num}`}
                      value={num}
                      disabled={
                        isCreatingNew &&
                        existingPeriodNumbers.includes(num)
                      }
                    >
                      {num}{" "}
                      {isCreatingNew &&
                      existingPeriodNumbers.includes(num)
                        ? `(${t("period.alreadyExists")})`
                        : ""}
                    </option>
                  ))}
                </select>
                {periodNumberError && (
                  <p className="text-sm text-red-500 mt-1">
                    {periodNumberError}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="periodName"
                  className="block text-sm font-medium mb-1 istui-timetable__main_form_input_label"
                >
                  {t("period.periodName")}
                </label>
                <Input
                  id="periodName"
                  value={periodName}
                  onChange={(e) =>
                    handleFormChange("name", e.target.value)
                  }
                  placeholder={t("period.periodNamePlaceholder")}
                  className="istui-timetable__main_form_input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="periodType"
                  className="block text-sm font-medium mb-1 istui-timetable__main_form_input_label"
                >
                  {t("period.periodType")}
                </label>
                {isLoadingPlanSettings ? (
                  <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {t("period.loadingTypes")}
                    </span>
                  </div>
                ) : (
                  <select
                    id="periodType"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 istui-timetable__main_form_input"
                    value={periodType}
                    onChange={(e) =>
                      handleFormChange(
                        "periodType",
                        e.target.value,
                      )
                    }
                  >
                    {isLoadingPlanSettings ? (
                      <option key="loading" value="" disabled>
                        {t("period.loadingTypes")}
                      </option>
                    ) : selectedPlanSetting &&
                      selectedPlanSetting.timeBlockTypes &&
                      selectedPlanSetting.timeBlockTypes.length >
                        0 ? (
                      selectedPlanSetting.timeBlockTypes.map(
                        (type, index) => (
                          <option
                            key={
                              type.id
                                ? `period-type-${type.id}`
                                : `period-type-index-${index}`
                            }
                            value={type.name}
                          >
                            {type.name}
                          </option>
                        ),
                      )
                    ) : (
                      <option key="no-types" value="" disabled>
                        {t("period.noTypes")}
                      </option>
                    )}
                  </select>
                )}
              </div>
              <div>
                <label
                  htmlFor="days"
                  className="block text-sm font-medium mb-1 istui-timetable__main_form_input_label"
                >
                  {t("period.days")}
                </label>
                <Input
                  id="days"
                  value={getDaysDisplay()}
                  disabled
                  className="bg-gray-50 istui-timetable__main_form_input"
                />
              </div>
            </div>
            <div className="duration-minutes-field">
              <label
                htmlFor="durationMinutes"
                className="block text-sm font-medium mb-1 istui-timetable__main_form_input_label"
              >
                {t("period.duration")}
              </label>
              <div className="flex items-center">
                <Input
                  id="durationMinutes"
                  type="number"
                  value={durationMinutes}
                  onChange={(e) =>
                    handleFormChange(
                      "durationMinutes",
                      e.target.value,
                    )
                  }
                  className={
                    periodType
                      ? "bg-gray-50 istui-timetable__main_form_input"
                      : ""
                  }
                  disabled={
                    !!periodType &&
                    selectedPlanSetting &&
                    selectedPlanSetting.timeBlockTypes &&
                    selectedPlanSetting.timeBlockTypes.length > 0
                  }
                />
                <span className="ml-2 text-muted-foreground">
                  {t("period.minutes")}
                </span>
              </div>
              {periodType &&
                selectedPlanSetting &&
                selectedPlanSetting.timeBlockTypes &&
                selectedPlanSetting.timeBlockTypes.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("period.durationAutoSet")}
                  </p>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label
                  htmlFor="calculatedStartTime"
                  className="istui-timetable__main_form_input_label"
                >
                  {t("period.startTime")}
                </Label>
                <Input
                  id="calculatedStartTime"
                  value={periodStartTime}
                  disabled
                  className="bg-gray-50 istui-timetable__main_form_input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {periodNumber === 1
                    ? t("period.startTimeInfoFirst")
                    : t("period.startTimeInfoSubsequent")}
                </p>
              </div>
              <div>
                <Label
                  htmlFor="calculatedEndTime"
                  className="istui-timetable__main_form_input_label"
                >
                  {t("period.endTime")}
                </Label>
                <Input
                  id="calculatedEndTime"
                  value={periodEndTime}
                  disabled
                  className="bg-gray-50 istui-timetable__main_form_input"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t("period.endTimeInfo")}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              {selectedPeriod && !isCreatingNew && (
                <Button
                  variant="outline"
                  onClick={() => onSwap && onSwap(selectedPeriod)}
                  className="mr-auto"
                >
                  {t("period.swap")}
                </Button>
              )}
              <Button
                size="sm"
                className="istui-timetable__main_form_cancel_button"
                variant="outline"
                onClick={onCancel}
              >
                <X/>
                {t("period.cancel")}
              </Button>
              <Button
                size="sm"
                className="istui-timetable__main_form_save_button"
                onClick={handleSubmit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.saving")}
                  </>
                ) : (
                  <>
                    <CheckCheck/>
                    {isCreatingNew ? t("common.create") : t("common.update")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent
          value="settings"
          className="p-4 focus-visible:outline-none focus-visible:ring-0"
        >
          {selectedPeriod && !isCreatingNew ? (
            <div className="space-y-6">
              <Card className="p-4 bg-slate-50 border-0 shadow-none">
                <h3 className="text-md font-medium mb-3">
                  {t("period.advancedSettings")}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                    <div>
                      <span className="font-medium block">
                        {t("period.advanced.allowScheduling")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t("period.advanced.allowSchedulingDescription")}
                      </span>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        checked={allowScheduling}
                        onChange={(e) =>
                          handleFormChange(
                            "allowScheduling",
                            e.target.checked,
                          )
                        }
                        className="rounded text-primary w-4 h-4 focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                    <div>
                      <span className="font-medium block">
                        {t("period.advanced.showInTimetable")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t("period.advanced.showInTimetableDescription")}
                      </span>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        checked={showInTimetable}
                        onChange={(e) =>
                          handleFormChange(
                            "showInTimetable",
                            e.target.checked,
                          )
                        }
                        className="rounded text-primary w-4 h-4 focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                    <div>
                      <span className="font-medium block">
                        {t("period.advanced.allowConflicts")}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t("period.advanced.allowConflictsDescription")}
                      </span>
                    </div>
                    <div className="flex items-center h-6">
                      <input
                        type="checkbox"
                        checked={allowConflicts}
                        onChange={(e) =>
                          handleFormChange(
                            "allowConflicts",
                            e.target.checked,
                          )
                        }
                        className="rounded text-primary w-4 h-4 focus:ring-2 focus:ring-offset-0 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              </Card>
              <div className="flex justify-between space-x-2">
                <Button
                  size="sm"
                  className="istui-timetable__main_form_delete_button"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("common.deleting")}
                    </>
                  ) : (
                    <>
                      <Trash2/>
                      {t("period.delete")}
                    </>
                  )}
                </Button>
                <div className="flex space-x-2">
                  <Button
                    className="istui-timetable__main_form_cancel_button"
                    variant="outline"
                    onClick={onCancel}
                  >
                    <X/>
                    {t("period.cancel")}
                  </Button>
                  <Button
                    className="istui-timetable__main_form_save_button"
                    onClick={handleSubmit}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("common.saving")}
                      </>
                    ) : (
                      <>
                        <Check/>
                        {isCreatingNew ? t("period.actions.create") : t("common.update")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <p>
                {t("period.selectToEdit")}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PeriodForm;
