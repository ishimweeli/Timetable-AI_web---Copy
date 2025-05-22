import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { TeacherFormData } from "@/type/Teacher/TypeTeacher.ts";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Textarea } from "@/component/Ui/textarea";
import { Label } from "@/component/Ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/component/Ui/form";
import { useI18n } from "@/hook/useI18n";
import { Loader2, AlertCircle, X, Check, CheckCheck, Trash2 } from "lucide-react";
import { useAppSelector } from "@/hook/useAppRedux";
import OrganizationSelector from "@/component/Organization/OrganizationSelector";
import { Alert, AlertDescription } from "@/component/Ui/alert";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/style/Auth/phone-input.css";
import { useMaxControlNumber } from "@/hook/useMaxControlNumber";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";

interface TeacherFormProps {
  teacherData: TeacherFormData | null;
  isNewTeacher?: boolean;
  onSave: (data: TeacherFormData) => void;
  onDelete?: () => void;
  onCancel?: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  selectedPlanSettingsId?: number | null;
  planSettingsList?: any[];
}

function TeacherForm({
  teacherData,
  isNewTeacher = false,
  onSave,
  onDelete,
  onCancel,
  isLoading = false,
  isDeleting = false,
  selectedPlanSettingsId = null,
  planSettingsList = [],
}: TeacherFormProps) {
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roleName === "ADMIN";
  const { maxControlNumber } = useMaxControlNumber();
  const { fetchPlanSettingsByOrganizationPaginated } = usePlanSettingsStore();
  const [availablePlanSettings, setAvailablePlanSettings] = useState<any[]>(planSettingsList || []);

  const defaultValues: Partial<TeacherFormData> = {
    initials: "",
    firstName: "",
    lastName: "",
    department: "",
    email: "",
    phone: "",
    qualification: "",
    contractType: "Full-time",
    notes: "",
    bio: "",
    statusId: 1,
    role: "teacher",
    isActive: true,
    isDeleted: false,
    maxDailyHours: 6,
    controlNumber: 1,
    organizationId: user?.organizationId ? Number(user.organizationId) : undefined,
    planSettingsId: undefined,
  };

  // If creating a new teacher and selectedPlanSettingsId is passed from parent,
  // use it as the default plan settings
  const newDefaultValues = { ...defaultValues };
  if (selectedPlanSettingsId && isNewTeacher) {
    newDefaultValues.planSettingsId = selectedPlanSettingsId;
  }

  const form = useForm<TeacherFormData>({
    defaultValues: isNewTeacher ? newDefaultValues : teacherData || newDefaultValues,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
    setError,
    clearErrors,
  } = form;

  // Reset form when teacherData or isNewTeacher changes
  useEffect(() => {
    if(isNewTeacher) {
      const initialValues = { ...defaultValues };
      if (selectedPlanSettingsId) {
        initialValues.planSettingsId = selectedPlanSettingsId;
      }
      reset(initialValues);
    } else if(teacherData) {
      reset({
        ...teacherData,
        controlNumber: teacherData.controlNumber || 1
      });

      if(teacherData.emailError) {
        setError("email", {
          type: "server",
          message: teacherData.emailError,
        });
      }
      
      // If teacherData has organization ID, load plan settings
      if (teacherData.organizationId) {
        loadPlanSettings(teacherData.organizationId);
      }
    }
  }, [teacherData, isNewTeacher, reset, setError, selectedPlanSettingsId]);

  // Apply parent's selectedPlanSettingsId to form if provided and not already set
  useEffect(() => {
    if (selectedPlanSettingsId && !watch("planSettingsId")) {
      setValue("planSettingsId", selectedPlanSettingsId);
    }
  }, [selectedPlanSettingsId, setValue, watch]);

  // Set availablePlanSettings when planSettingsList changes
  useEffect(() => {
    if (planSettingsList && planSettingsList.length > 0) {
      setAvailablePlanSettings(planSettingsList);
    }
  }, [planSettingsList]);

  // Load plan settings function to avoid code duplication
  const loadPlanSettings = (organizationId: number) => {
    if (!organizationId) return;
    
    console.log("Loading plan settings for organization:", organizationId);
    fetchPlanSettingsByOrganizationPaginated(organizationId.toString(), 0, 100)
      .then((result: any) => {
        console.log("Plan settings response:", result);
        
        // Handle different response formats
        let planSettingsData = [];
        
        if (result?.data) {
          // API format: { data: [...], totalItems: N }
          planSettingsData = result.data;
        } else if (result?.content) {
          // Store format: { content: [...] }
          planSettingsData = result.content;
        } else if (Array.isArray(result)) {
          // Direct array format
          planSettingsData = result;
        }
        
        console.log("Processed plan settings data:", planSettingsData);
        
        // Update available plan settings
        setAvailablePlanSettings(planSettingsData);
        
        // Set plan settings if available
        if (Array.isArray(planSettingsData) && planSettingsData.length > 0) {
          // If no plan settings selected yet, select the first one or use parent's selection
          const currentPlanSettingsId = watch("planSettingsId");
          if (!currentPlanSettingsId) {
            // If parent provided a selectedPlanSettingsId, use that instead of the first one
            if (selectedPlanSettingsId && planSettingsData.some(ps => ps.id === selectedPlanSettingsId)) {
              setValue("planSettingsId", selectedPlanSettingsId);
            } else {
              setValue("planSettingsId", planSettingsData[0].id);
            }
          } else {
            // Verify if current plan settings ID exists in the loaded list
            const planSettingExists = planSettingsData.some(ps => ps.id === currentPlanSettingsId);
            if (!planSettingExists) {
              if (selectedPlanSettingsId && planSettingsData.some(ps => ps.id === selectedPlanSettingsId)) {
                setValue("planSettingsId", selectedPlanSettingsId);
              } else if (planSettingsData.length > 0) {
                setValue("planSettingsId", planSettingsData[0].id);
              }
            }
          }
        } else {
          setAvailablePlanSettings([]);
          setValue("planSettingsId", undefined);
        }
      })
      .catch(error => {
        console.error("Error fetching plan settings:", error);
        setAvailablePlanSettings([]);
      });
  };

  // Load plan settings when organization changes
  useEffect(() => {
    const organizationId = watch("organizationId");
    if (organizationId) {
      loadPlanSettings(organizationId);
    } else {
      setValue("planSettingsId", undefined);
      setAvailablePlanSettings([]);
    }
  }, [watch("organizationId")]);

  const onSubmit = (data: TeacherFormData) => {
    if(!data.organizationId) {
      setError("organizationId", {
        type: "required",
        message: t("teacher.validation.organizationRequired"),
      });
      return;
    }

    if(data.controlNumber && (data.controlNumber < 1 || data.controlNumber > maxControlNumber)) {
      setError("controlNumber", {
        type: "manual",
        message: `Control number must be between 1 and ${maxControlNumber}`,
      });
      return;
    }

    if(data.emailError) {
      data.emailError = undefined;
    }
    if(data.serverError) {
      data.serverError = undefined;
    }

    if(!data.planSettingsId) {
      setError("planSettingsId", {
        type: "required",
        message: t("teacher.validation.planSettingsRequired"),
      });
      return;
    }

    onSave(data);
  };

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const fullName = `${firstName || ""} ${lastName || ""}`.trim();

  const handleOrganizationChange = (orgId: number) => {
    setValue("organizationId", orgId);
    // Clear plan settings when organization changes
    setValue("planSettingsId", undefined);
    if(orgId) {
      clearErrors("organizationId");
      // Load plan settings for the selected organization
      loadPlanSettings(orgId);
    }
  };

  const handlePlanSettingsChange = (planSettingsId: number | undefined) => {
    setValue("planSettingsId", planSettingsId);
    if(planSettingsId) {
      clearErrors("planSettingsId");
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 flex flex-col h-full"
      >
        {teacherData?.serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{teacherData.serverError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4 flex-grow overflow-y-auto pr-1">
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("teacher.form.firstName")}
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("teacher.form.firstNamePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("teacher.form.lastName")}
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("teacher.form.lastNamePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teacher.form.department")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("teacher.form.departmentPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teacher.form.qualification")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("teacher.form.qualificationPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teacher.form.contractType")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("teacher.form.selectContractType")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Full-time">{t("teacher.form.contractTypes.fullTime")}</SelectItem>
                      <SelectItem value="Part-time">{t("teacher.form.contractTypes.partTime")}</SelectItem>
                      <SelectItem value="Contract">{t("teacher.form.contractTypes.contract")}</SelectItem>
                      <SelectItem value="Temporary">{t("teacher.form.contractTypes.temporary")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <Label
                htmlFor="controlNumber"
                className="text-sm font-medium istui-timetable__main_form_input_label"
              >
                {t("teacher.form.controlNumber")}
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxControlNumber})
                </span>
              </Label>
              <Input
                id="controlNumber"
                type="number"
                {...register("controlNumber", {
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "Control number must be at least 1"
                  },
                  max: {
                    value: maxControlNumber,
                    message: `Control number cannot exceed ${maxControlNumber}`
                  }
                })}
                className="mt-1 istui-timetable__main_form_input"
                min={1}
                max={maxControlNumber}
              />
              {errors.controlNumber && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {errors.controlNumber.message}
                </p>
              )}
            </div>

            <div>
              <OrganizationSelector
                selectedOrganizationId={watch("organizationId") || undefined}
                onOrganizationChange={handleOrganizationChange}
                error={errors.organizationId?.message}
              />
            </div>

            {/* Plan Settings Selector */}
            <div className="space-y-1.5">
              <Label htmlFor="planSettingsId" className={errors.planSettingsId ? "text-destructive" : ""}>
                {t("teacher.form.planSettings")}
                <span className="text-destructive"> *</span>
              </Label>
              <select
                id="planSettingsId"
                className="p-2 border rounded-md w-full"
                value={watch("planSettingsId")?.toString() || ""}
                onChange={(e) => handlePlanSettingsChange(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">{t("teacher.form.selectPlanSettings")}</option>
                {availablePlanSettings && availablePlanSettings.length > 0 ? (
                  availablePlanSettings.map((planSetting) => (
                    <option
                      key={planSetting.id}
                      value={planSetting.id.toString()}
                    >
                      {planSetting.name}
                    </option>
                  ))
                ) : (
                  <option value="no-options" disabled>
                    {t("teacher.form.noPlanSettingsAvailable")}
                  </option>
                )}
              </select>
              {errors.planSettingsId && (
                <p className="text-destructive text-sm">{errors.planSettingsId.message}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("teacher.form.email")}
                    <span className="text-destructive"> *</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder={t("teacher.form.emailPlaceholder")} 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teacher.form.phone")}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      international
                      value={field.value}
                      onChange={field.onChange}
                      defaultCountry="US"
                      placeholder={t("teacher.form.phonePlaceholder")}
                      className="phone-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxDailyHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teacher.form.maxDailyHours")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={24}
                      step={1}
                      placeholder={t("teacher.form.maxDailyHoursPlaceholder")}
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (isNaN(value)) field.onChange("");
                        else if (value < 1) field.onChange(1);
                        else if (value > 24) field.onChange(24);
                        else field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teacher.form.notes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("teacher.form.notesPlaceholder")}
                      {...field}
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("teacher.form.bio")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("teacher.form.bioPlaceholder")}
                      {...field}
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white z-10 flex justify-end space-x-3 pt-2 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              {t("common.cancel")}
            </Button>
          )}

          {!isNewTeacher && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading || isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t("common.delete")}
            </Button>
          )}

          <Button
            type="submit"
            disabled={isLoading || isDeleting || !fullName}
            variant={"default"}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4 mr-2" />
            )}
            {isNewTeacher
              ? t("common.create")
              : t("common.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default TeacherForm;
