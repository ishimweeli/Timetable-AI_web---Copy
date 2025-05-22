import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import { Label } from "@/component/Ui/label";
import { Input } from "@/component/Ui/input";
import { Button } from "@/component/Ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/component/Ui/tooltip";
import {
  Plus,
  Trash2,
  Clock,
  Settings,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
  Check,
  CheckCheck
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/component/Ui/table";
import { useToast } from "@/hook/useToast";
import { cn } from "@/util/util";
import {
  TimeBlockType,
  PlanSettingsRequest,
} from "@/type/planSettings/planSettings";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { Spinner } from "@/component/Ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/component/Ui/alert";
import { useI18n } from "@/hook/useI18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";

interface PlanSettingsProps {
  organizationId: string;
  onSaveComplete?: () => void;
  isEditMode?: boolean;
  uuid?: string | null;
  onCancel?: () => void;
}

interface TimeBlockTypeWithId {
  id: string;
  uuid?: string;
  name: string;
  durationMinutes: number;
  occurrences: number;
}

const PlanSettings: React.FC<PlanSettingsProps> = ({
  organizationId,
  onSaveComplete,
  isEditMode = false,
  uuid = null,
  onCancel,
}) => {
  const { t } = useI18n();
  // Always get organization ID from localStorage if available
  const getOrganizationId = () => {
    return (
      localStorage.getItem("selectedOrganizationId") || organizationId || "1"
    );
  };

  const safeOrganizationId = getOrganizationId();
  const { toast } = useToast();

  // Get store state and actions
  const planSettings = usePlanSettingsStore((state) => state.planSettings);
  const loading = usePlanSettingsStore((state) => state.loading);
  const error = usePlanSettingsStore((state) => state.error);
  const createPlanSettings = usePlanSettingsStore(
    (state) => state.createPlanSettings,
  );
  const updatePlanSettings = usePlanSettingsStore(
    (state) => state.updatePlanSettings,
  );
  const fetchPlanSettingsByUuid = usePlanSettingsStore(
    (state) => state.fetchPlanSettingsByUuid,
  );
  const deletePlanSettings = usePlanSettingsStore(
    (state) => state.deletePlanSettings,
  );

  const [activeStep, setActiveStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("15:00");
  const [periodsPerDay, setPeriodsPerDay] = useState(8);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [timeBlockTypes, setTimeBlockTypes] = useState<TimeBlockTypeWithId[]>([
    { id: "1", name: "Regular", durationMinutes: 45, occurrences: 5 },
    { id: "2", name: "Break", durationMinutes: 15, occurrences: 3 },
    { id: "3", name: "Lunch", durationMinutes: 45, occurrences: 1 },
  ]);

  const [validationErrors, setValidationErrors] = useState<{
    timeConstraint?: string;
    timeBlockError?: string;
    generalError?: string;
  }>({});

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [planStartDate, setPlanStartDate] = useState<string>("");
  const [planEndDate, setPlanEndDate] = useState<string>("");
  const [includeWeekends, setIncludeWeekends] = useState<boolean>(true);

  // Fetch plan settings when in edit mode
  useEffect(() => {
    if(isEditMode && uuid) {
      // First check if we have it in sessionStorage
      const cachedSettings = sessionStorage.getItem("currentPlanSettings");
      if(cachedSettings) {
        try {
          const parsedSettings = JSON.parse(cachedSettings);
          if(parsedSettings.uuid === uuid) {
            setTimeBlockTypes(parsedSettings.timeBlockTypes || []);
            setName(parsedSettings.name || "");
            setDescription(parsedSettings.description || "");
            setCategory(parsedSettings.category || "");
            setStartTime(parsedSettings.startTime?.substring(0, 5) || "08:00");
            setEndTime(parsedSettings.endTime?.substring(0, 5) || "15:00");
            setPeriodsPerDay(Number(parsedSettings.periodsPerDay) || 8);
            setDaysPerWeek(Number(parsedSettings.daysPerWeek) || 5);
            setPlanStartDate(
              parsedSettings.planStartDate
                ? typeof parsedSettings.planStartDate === "number"
                  ? new Date(parsedSettings.planStartDate).toISOString().slice(0, 10)
                  : String(parsedSettings.planStartDate)
                : ""
            );
            setPlanEndDate(
              parsedSettings.planEndDate
                ? typeof parsedSettings.planEndDate === "number"
                  ? new Date(parsedSettings.planEndDate).toISOString().slice(0, 10)
                  : String(parsedSettings.planEndDate)
                : ""
            );
            setIncludeWeekends(parsedSettings.includeWeekends || true);
            return;
          }
        }catch(e) {
          console.error("Error parsing cached settings:", e);
        }
      }
      
      // If not in cache or uuid doesn't match, fetch from API
      fetchPlanSettingsByUuid(uuid);
    } else if(!isEditMode) {
      // In create mode, reset to default values
      resetForm();
    }
  }, [isEditMode, uuid, fetchPlanSettingsByUuid]);

  const handleTimeChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string,
  ) => {
    setter(value);
    if(validationErrors.timeConstraint) {
      setValidationErrors((prev) => ({ ...prev, timeConstraint: undefined }));
    }
  };

  const handleTimeBlockChange = (
    id: string,
    field: keyof TimeBlockType,
    value: string | number,
  ) => {
    if(validationErrors.timeBlockError) {
      setValidationErrors((prev) => ({ ...prev, timeBlockError: undefined }));
    }

    setTimeBlockTypes((prev) =>
      prev.map((block) => {
        if(block.id === id) {
          let newValue = value;

          // Handle number fields
          if(field === "durationMinutes" || field === "occurrences") {
            const numValue = parseInt(value.toString());
            newValue = isNaN(numValue) ? 1 : Math.max(1, numValue);
          }

          return { ...block, [field]: newValue };
        }
        return block;
      }),
    );

    if(field === "name" && typeof value === "string") {
      const updatedBlocks = timeBlockTypes.map((block) =>
        block.id === id ? { ...block, name: value } : block,
      );

      const names = updatedBlocks.map((block) =>
        block.name.trim().toLowerCase(),
      );
      const duplicates = names.filter(
        (name, index) => names.indexOf(name) !== index,
      );

      if(duplicates.length > 0) {
        setValidationErrors((prev) => ({
          ...prev,
          timeBlockError: t("error.duplicateTimeBlockNames"),
        }));
        toast({
          title: t("validation.error"),
          description: t("error.uniqueTimeBlockNames"),
          variant: "destructive",
        });
      }
    }
  };

  const handleAddTimeBlockType = () => {
    const newBlock: TimeBlockTypeWithId = {
      id: crypto.randomUUID(),
      name: "New Block",
      durationMinutes: 45,
      occurrences: 1,
    };

    setTimeBlockTypes((prev) => [...prev, newBlock]);
  };

  const handleDeleteTimeBlockType = (id: string) => {
    if(timeBlockTypes.length <= 1) {
      toast({
        title: t("validation.error"),
        description: t("error.minimumOneBlock"),
        variant: "destructive",
      });
      return;
    }

    setTimeBlockTypes((prev) => prev.filter((block) => block.id !== id));
  };

  const checkDuplicateTimeBlockNames = (): boolean => {
    const names = timeBlockTypes.map((block) =>
      block.name.trim().toLowerCase(),
    );
    const duplicates = names.filter(
      (name, index) => names.indexOf(name) !== index,
    );

    if(duplicates.length > 0) {
      setValidationErrors((prev) => ({
        ...prev,
        timeBlockError: t("error.duplicateTimeBlockNames"),
      }));
      toast({
        title: t("validation.error"),
        description: t("error.uniqueTimeBlockNames"),
        variant: "destructive",
      });
      return true;
    }

    return false;
  };

  const calculateAvailableMinutes = (start: string, end: string): number => {
    const [startHours, startMinutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    return endTotalMinutes - startTotalMinutes;
  };

  const calculateTotalBlockMinutes = (
    blocks: TimeBlockTypeWithId[],
  ): number => {
    return blocks.reduce((total, block) => {
      return total + block.durationMinutes * block.occurrences;
    }, 0);
  };

  const calculateTimeBlockSummary = (
    timeBlocks: TimeBlockTypeWithId[],
    startTime: string,
    endTime: string,
  ) => {
    const availableMinutes = calculateAvailableMinutes(startTime, endTime);
    const totalBlockMinutes = calculateTotalBlockMinutes(timeBlocks);
    const percentageUsed = Math.min(
      100,
      (totalBlockMinutes / availableMinutes) * 100,
    );
    const remainingMinutes = availableMinutes - totalBlockMinutes;
    const totalHours = Math.floor(availableMinutes / 60);
    const totalMinutes = availableMinutes % 60;
    const blocksCount = timeBlocks.reduce(
      (sum, block) => sum + block.occurrences,
      0,
    );

    return {
      availableMinutes,
      totalBlockMinutes,
      percentageUsed,
      remainingMinutes,
      totalHours,
      totalMinutes,
      blocksCount,
    };
  };

  const validateTimeConstraints = (): boolean => {
    if(!startTime || !endTime) {
      setValidationErrors((prev) => ({
        ...prev,
        timeConstraint: t("validation.required"),
      }));
      return false;
    }

    const availableMinutes = calculateAvailableMinutes(startTime, endTime);
    const totalBlockMinutes = calculateTotalBlockMinutes(timeBlockTypes);

    if(totalBlockMinutes > availableMinutes) {
      setValidationErrors((prev) => ({
        ...prev,
        timeConstraint: t("error.timeBlocksExceedAvailable", {
          total: String(totalBlockMinutes),
          available: String(availableMinutes),
        }),
      }));
      toast({
        title: t("validation.error"),
        description: t("error.timeBlocksExceedAvailable"),
        variant: "destructive",
      });
      return false;
    }

    if(totalBlockMinutes < availableMinutes) {
      setValidationErrors((prev) => ({
        ...prev,
        timeConstraint: t("error.timeBlocksLessThanAvailable"),
      }));
      toast({
        title: t("validation.error"),
        description: t("error.timeBlocksLessThanAvailable"),
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const errors: {
      timeConstraint?: string;
      timeBlockError?: string;
      generalError?: string;
    } = {};

    // Check if time blocks exceed available time
    const availableMinutes = calculateAvailableMinutes(startTime, endTime);
    const totalBlockMinutes = calculateTotalBlockMinutes(timeBlockTypes);

    if(totalBlockMinutes > availableMinutes) {
      errors.timeConstraint = t("planSettings.timeBlocksExceedAvailable", {
        total: String(totalBlockMinutes),
        available: String(availableMinutes),
      });
    }

    // Check if there are time blocks
    if(timeBlockTypes.length === 0) {
      errors.timeBlockError = t("planSettings.noTimeBlocks");
    }

    // Check if name is provided
    if(!name.trim()) {
      errors.generalError = t("planSettings.nameRequired");
    }

    if(Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setIsSaving(true);

    try {
      // Create plan settings data
      const planSettingsData: PlanSettingsRequest = {
        name: name.trim(),
        description: description.trim(),
        periodsPerDay,
        daysPerWeek,
        startTime,
        endTime,
        organizationId: safeOrganizationId,
        category: category || "DEFAULT",
        timeBlockTypes: timeBlockTypes.map(({ id, uuid, ...rest }) => rest),
        planStartDate,
        planEndDate,
        includeWeekends,
      };

      // Update or create plan settings
      if(isEditMode && uuid) {
        await updatePlanSettings(uuid, planSettingsData);

        // Clear the cached settings after successful update
        sessionStorage.removeItem("currentPlanSettings");
      }else {
        await createPlanSettings(planSettingsData);
      }

      setShowSuccessMessage(true);

      // Call onSaveComplete callback
      if(onSaveComplete) {
        onSaveComplete();
      }

      // Clear form after successful save
      if(!isEditMode) {
        resetForm();
      }

      toast({
        title: t("common.success"),
        description: isEditMode
          ? t("planSettings.updateSuccess")
          : t("planSettings.createSuccess"),
      });
    }catch(error) {
      console.error("Error saving plan settings:", error);

      let errorMessage = "";

      if(
        error?.response?.data?.error &&
        error.response.data.error.includes("[planning.settings.exists]")
      ) {
        errorMessage = t("planSettings.errors.alreadyExists");
      } else if(
        error?.error &&
        error.error.includes("[planning.settings.exists]")
      ) {
        errorMessage = t("planSettings.errors.alreadyExists");
      } else if(error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if(error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if(error?.message) {
        errorMessage = error.message;
      }else {
        errorMessage = t("planSettings.errors.createFailed");
      }

      toast({
        variant: "destructive",
        title: t("common.error"),
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setActiveStep((prev) => Math.max(1, prev - 1));
  };

  const resetForm = () => {
    setName("Default Timetable Settings");
    setDescription("");
    setCategory("DEFAULT");
    setStartTime("08:00");
    setEndTime("15:00");
    setPeriodsPerDay(8);
    setDaysPerWeek(5);
    setTimeBlockTypes([
      { id: "1", name: "Regular", durationMinutes: 45, occurrences: 5 },
      { id: "2", name: "Break", durationMinutes: 15, occurrences: 3 },
      { id: "3", name: "Lunch", durationMinutes: 45, occurrences: 1 },
    ]);
    setPlanStartDate("");
    setPlanEndDate("");
    setIncludeWeekends(true);
  };

  const handleDelete = async () => {
    if(!isEditMode || !uuid) return;

    try {
      setIsSaving(true);
      await deletePlanSettings(uuid);

      toast({
        title: t("common.success"),
        description: t("planSettings.deleteSuccess"),
      });

      // Clear the cached settings
      sessionStorage.removeItem("currentPlanSettings");

      // Call onSaveComplete to navigate back to the list
      if(onSaveComplete) {
        onSaveComplete();
      }
    }catch(error) {
      console.error("Error deleting plan settings:", error);
      toast({
        title: t("validation.error"),
        description: error.response?.data?.message || t("error.unexpected"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to calculate period length in days
  const calculatePeriodLength = (start: string, end: string, includeWeekends: boolean) => {
    if(!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if(isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) return 0;
    let days = 0;
    let current = new Date(startDate);
    while (current <= endDate) {
      const day = current.getDay();
      if(includeWeekends || (day !== 0 && day !== 6)) {
        days++;
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  };
  const periodLength = calculatePeriodLength(planStartDate, planEndDate, includeWeekends);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {showSuccessMessage && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>{t("common.success")}</AlertTitle>
          <AlertDescription>
            {isEditMode
              ? t("planSettings.updateSuccess")
              : t("planSettings.createSuccess")}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {activeStep === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                <CardTitle>{t("planSettings.generalSettings")}</CardTitle>
              </div>
              <CardDescription>
                {t("planSettings.generalSettingsDesc")}
              </CardDescription>
              {validationErrors.generalError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    {validationErrors.generalError}
                  </AlertDescription>
                </Alert>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      className="istui-timetable__main_form_input_label"
                      htmlFor="name"
                    >
                      {t("planSettings.name")}
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("planSettings.name")}
                      className={
                        validationErrors.generalError
                          ? "border-destructive"
                          : "istui-timetable__main_form_input"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="istui-timetable__main_form_input_label"
                    >
                      {t("planSettings.description")}
                    </Label>
                    <Input
                      className="istui-timetable__main_form_input"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t("planSettings.descriptionPlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="istui-timetable__main_form_input_label"
                    >
                      {t("planSettings.category")}
                    </Label>
                    <Input
                      className="istui-timetable__main_form_input"
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder={t("planSettings.category")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="planStartDate"
                      className="istui-timetable__main_form_input_label"
                    >
                      {t("planSettings.planStartDate")}
                    </Label>
                    <Input
                      id="planStartDate"
                      type="date"
                      value={planStartDate}
                      onChange={e => setPlanStartDate(e.target.value)}
                      className="istui-timetable__main_form_input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="planEndDate"
                      className="istui-timetable__main_form_input_label"
                    >
                      {t("planSettings.planEndDate")}
                    </Label>
                    <Input
                      id="planEndDate"
                      type="date"
                      value={planEndDate}
                      onChange={e => setPlanEndDate(e.target.value)}
                      className="istui-timetable__main_form_input"
                    />
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      id="includeWeekends"
                      type="checkbox"
                      checked={includeWeekends}
                      onChange={e => setIncludeWeekends(e.target.checked)}
                    />
                    <Label htmlFor="includeWeekends">
                      {t("planSettings.includeWeekends")}
                    </Label>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {t("planSettings.periodLength")}: {periodLength} {t("planSettings.days")}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="startTime"
                      className="istui-timetable__main_form_input_label"
                    >
                      {t("planSettings.startTime")}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-1 cursor-help text-muted-foreground">
                              <AlertCircle className="inline h-3 w-3 " />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("planSettings.startTimeTooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) =>
                        handleTimeChange(setStartTime, e.target.value)
                      }
                      className={
                        validationErrors.timeConstraint
                          ? "border-destructive"
                          : "istui-timetable__main_form_input"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="endTime"
                      className="istui-timetable__main_form_input_label"
                    >
                      {t("planSettings.endTime")}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="ml-1 cursor-help text-muted-foreground">
                              <AlertCircle className="inline h-3 w-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("planSettings.endTimeTooltip")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) =>
                        handleTimeChange(setEndTime, e.target.value)
                      }
                      className={
                        validationErrors.timeConstraint
                          ? "border-destructive"
                          : "istui-timetable__main_form_input"
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        className="istui-timetable__main_form_input_label"
                        htmlFor="periodsPerDay"
                      >
                        {t("planSettings.periodsPerDay")}
                      </Label>
                      <Input
                        id="periodsPerDay"
                        type="number"
                        min={1}
                        max={20}
                        value={String(periodsPerDay)}
                        onChange={(e) =>
                          setPeriodsPerDay(Number(e.target.value))
                        }
                        className="istui-timetable__main_form_input"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        className="istui-timetable__main_form_input_label"
                        htmlFor="daysPerWeek"
                      >
                        {t("planSettings.daysPerWeek")}
                      </Label>
                      <Input
                        id="daysPerWeek"
                        type="number"
                        min={1}
                        max={7}
                        value={String(daysPerWeek)}
                        onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                        className="istui-timetable__main_form_input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button type="button" onClick={nextStep}>
                  {t("common.next")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <>
            <div className="space-y-4 p-4">
              <Card className="bg-slate-50 border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    Time Block Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const summary = calculateTimeBlockSummary(
                      timeBlockTypes,
                      startTime,
                      endTime,
                    );

                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Available Time
                            </p>
                            <p className="text-2xl font-bold">
                              {summary.availableMinutes} minutes
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {summary.totalHours}h {summary.totalMinutes}m
                              total
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Time Blocks
                            </p>
                            <p className="text-2xl font-bold">
                              {summary.totalBlockMinutes} minutes
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {summary.blocksCount} blocks defined
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-300",
                                summary.percentageUsed > 100
                                  ? "bg-red-500"
                                  : summary.percentageUsed === 100
                                    ? "bg-green-500"
                                    : "bg-blue-500",
                              )}
                              style={{ width: `${summary.percentageUsed}%` }}
                            />
                          </div>
                          <div className="mt-2 flex justify-between text-sm">
                            <span
                              className={cn(
                                "font-medium",
                                summary.percentageUsed > 100
                                  ? "text-red-600"
                                  : summary.percentageUsed === 100
                                    ? "text-green-600"
                                    : "text-muted-foreground",
                              )}
                            >
                              Time allocated:{" "}
                              {Math.round(summary.percentageUsed)}%
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                summary.remainingMinutes < 0
                                  ? "text-red-600"
                                  : summary.remainingMinutes === 0
                                    ? "text-green-600"
                                    : "text-muted-foreground",
                              )}
                            >
                              {Math.abs(summary.remainingMinutes)} minutes{" "}
                              {summary.remainingMinutes >= 0
                                ? "remaining"
                                : "over"}
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">
                      Time Block Definitions
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={handleAddTimeBlockType}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("actions.add")}
                    </Button>
                  </div>
                  <CardDescription>
                    Define the types of time blocks in your timetable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                    {timeBlockTypes.map((block, index) => (
                      <div
                        key={block.id}
                        className="flex items-center gap-4 p-3 bg-white rounded-lg border"
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-medium",
                            index === 0
                              ? "bg-blue-100 text-blue-600"
                              : index === 1
                                ? "bg-green-100 text-green-600"
                                : index === 2
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-gray-100 text-gray-600",
                          )}
                        >
                          {block.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow grid grid-cols-3 gap-4">
                          <Input
                            type="text"
                            value={block.name}
                            onChange={(e) => {
                              e.preventDefault();
                              handleTimeBlockChange(
                                block.id,
                                "name",
                                e.target.value,
                              );
                            }}
                            placeholder="Name"
                            className="h-8"
                          />
                          <Input
                            type="number"
                            value={block.durationMinutes}
                            onChange={(e) => {
                              e.preventDefault();
                              handleTimeBlockChange(
                                block.id,
                                "durationMinutes",
                                e.target.value,
                              );
                            }}
                            min={1}
                            placeholder="Duration (min)"
                            className="h-8"
                          />
                          <Input
                            type="number"
                            value={block.occurrences}
                            onChange={(e) => {
                              e.preventDefault();
                              handleTimeBlockChange(
                                block.id,
                                "occurrences",
                                e.target.value,
                              );
                            }}
                            min={1}
                            placeholder="Occurrences"
                            className="h-8"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteTimeBlockType(block.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <div className="flex justify-between mt-6 p-5">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    {t("common.back")}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                    size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if(onCancel) onCancel();
                      }}
                    >
                      <X/>
                      {t("common.cancel")}
                    </Button>
                    <Button size="sm" type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          {t("common.saving")}
                        </>
                      ) : isEditMode ? (
                        <>
                        <Check/>
                        { t("common.update")}
                        </>
                       
                      ) : (
                        <>
                        
                          <CheckCheck/>
                        { t("common.create")}
                        
                        </>
                       
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </form>
  );
};

export default PlanSettings;
