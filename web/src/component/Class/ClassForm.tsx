import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/component/Ui/input";
import { Label } from "@/component/Ui/label";
import { Checkbox } from "@/component/Ui/checkbox";
import { Button } from "@/component/Ui/button";
import { Textarea } from "@/component/Ui/textarea";
import {
  useUpdateClassMutation,
  useDeleteClassMutation,
} from "@/store/Class/ApiClass";
import { useToast } from "@/component/Ui/use-toast";
import type { TypeClass } from "@/type/Class/TypeClass.ts";
import { Spinner } from "@/component/Ui/spinner";
import { Trash2,Check,X } from "lucide-react";
import { useAppDispatch } from "@/hook/useAppRedux";
import { closeClassPanel, setSelectedClass } from "@/store/Class/SliceClass";
import { useI18n } from "@/hook/useI18n";
import OrganizationSelector from "@/component/Organization/OrganizationSelector";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { useNavigate } from "react-router-dom";
import { useMaxControlNumber } from "@/hook/useMaxControlNumber";

interface ClassFormProps {
  classData: TypeClass | null;
  onCancel: () => void;
  onSave?: (data: any) => Promise<void>;
  onUpdate?: () => void;
  isCreating?: boolean;
}

const ClassForm: React.FC<ClassFormProps> = ({
  classData,
  onCancel,
  onSave,
  onUpdate,
  isCreating = false,
}) => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const { maxControlNumber } = useMaxControlNumber();

  const planSettings = usePlanSettingsStore((state) => state.planSettings);
  const fetchPlanSettingsByOrganization = usePlanSettingsStore(
    (state) => state.fetchPlanSettingsByOrganization,
  );

  const maxPeriodsPerDay =
    planSettings?.length > 0 && planSettings[0]?.periodsPerDay
      ? planSettings[0].periodsPerDay
      : planSettings?.periodsPerDay || 6;

  console.log("ClassForm: Using max periods per day:", maxPeriodsPerDay);
  console.log("ClassForm: Plan settings data:", planSettings);

  const isLoading = isUpdating || isDeleting || isSubmitting;

  useEffect(() => {
    
    const userData = localStorage.getItem("userData");
    let orgId = classData?.organizationId || null;

    if(!orgId && userData) {
      try {
        const user = JSON.parse(userData);
        orgId = user.organizationId;
        console.log("ClassForm: Got organization ID from user data:", orgId);
      }catch(e) {
        console.error("ClassForm: Error parsing user data:", e);
      }
    }

    if(orgId) {
      console.log(
        "ClassForm: Fetching latest plan settings for organization ID:",
        orgId,
      );
      fetchPlanSettingsByOrganization(orgId)
        .then(() => {
          console.log("ClassForm: Plan settings fetch completed");
        })
        .catch((error) => {
          console.error("ClassForm: Error fetching plan settings:", error);
        });
    }else {
      console.warn(
        "ClassForm: No organization ID found, cannot fetch plan settings",
      );
    }
  }, [fetchPlanSettingsByOrganization, classData]);

 
  const formKey = `${classData?.uuid || "new-class"}-${maxPeriodsPerDay}`;

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    section: z.string().min(1, "Section is required"),
    initial: z.string().min(1, "Initial is required"),
    color: z.string().min(1, "Color is required"),
    capacity: z.coerce.number().min(1, "Capacity is required"),
    minLessonsPerDay: z.coerce
      .number()
      .min(0)
      .max(
        maxPeriodsPerDay,
        `Cannot exceed ${maxPeriodsPerDay} periods per day`,
      ),
    maxLessonsPerDay: z.coerce
      .number()
      .min(0)
      .max(
        maxPeriodsPerDay,
        `Cannot exceed ${maxPeriodsPerDay} periods per day`,
      ),
    latestStartPosition: z.coerce
      .number()
      .min(0)
      .max(
        maxPeriodsPerDay,
        `Cannot exceed ${maxPeriodsPerDay} periods per day`,
      ),
    earliestEnd: z.coerce
      .number()
      .min(0)
      .max(
        maxPeriodsPerDay,
        `Cannot exceed ${maxPeriodsPerDay} periods per day`,
      ),
    maxFreePeriods: z.coerce
      .number()
      .min(0)
      .max(
        maxPeriodsPerDay,
        `Cannot exceed ${maxPeriodsPerDay} periods per day`,
      ),
    controlNumber: z.coerce
      .number()
      .int()
      .min(1)
      .max(
        maxControlNumber,
        `Cannot exceed ${maxControlNumber}`,
      ),
    mainTeacher: z.string().optional(),
    comment: z.string().optional(),
    presentEveryDay: z.boolean().default(false),
    organizationId: z.number().min(1, "Organization is required"),
    planSettingsId: z.number().optional(),
  });

  type FormData = z.infer<typeof formSchema>;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: isCreating
      ? {
          name: "",
          section: "",
          initial: "",
          color: "#4f46e5",
          capacity: 1,
          minLessonsPerDay: 0,
          maxLessonsPerDay: maxPeriodsPerDay,
          latestStartPosition: 1, 
          earliestEnd: maxPeriodsPerDay,
          maxFreePeriods: 0,
          mainTeacher: "",
          comment: "",
          presentEveryDay: false,
          organizationId: 0,
          controlNumber: 1,
          planSettingsId: 0,
        }
      : {
          name: classData?.name || "",
          section: classData?.section || "",
          initial: classData?.initial || "",
          color: classData?.color || "#4f46e5",
          capacity: classData?.capacity || 1,
          minLessonsPerDay: Math.min(
            classData?.minLessonsPerDay || 0,
            maxPeriodsPerDay,
          ),
          maxLessonsPerDay: Math.min(
            classData?.maxLessonsPerDay || 0,
            maxPeriodsPerDay,
          ),
          latestStartPosition: Math.min(
            classData?.latestStartPosition || 0,
            maxPeriodsPerDay,
          ),
          earliestEnd: Math.min(classData?.earliestEnd || 0, maxPeriodsPerDay),
          maxFreePeriods: Math.min(
            classData?.maxFreePeriods || 0,
            maxPeriodsPerDay,
          ),
          controlNumber: classData?.controlNumber || 1,
          mainTeacher: classData?.mainTeacher || "",
          comment: classData?.comment || "",
          presentEveryDay: classData?.presentEveryDay || false,
          organizationId: classData?.organizationId || 0,
          planSettingsId: classData?.planSettingsId || 0,
        },
  });

  const createPeriodOptions = (startFrom = 0) => {
    return Array.from(
      { length: maxPeriodsPerDay - startFrom + 1 },
      (_, i) => i + startFrom,
    );
  };


  const optionsStartingFromZero = createPeriodOptions(0);

 
  const optionsStartingFromOne = createPeriodOptions(1);


  const watchedOrganizationId = watch("organizationId");
  const watchedMinLessons = watch("minLessonsPerDay");
  const watchedMaxLessons = watch("maxLessonsPerDay");

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if(userData) {
      try {
        const user = JSON.parse(userData);
        setIsAdmin(user.role === "admin");
      }catch(e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);


  useEffect(() => {
    console.log("ClassForm: Mode or class data changed", { isCreating, classData });
    
    // Reset form when switching between create/update or when class changes
    if (classData) {
      // Update mode with class data
      const safeMinLessonsPerDay = Math.min(
        classData.minLessonsPerDay || 0,
        maxPeriodsPerDay,
      );
      const safeMaxLessonsPerDay = Math.min(
        classData.maxLessonsPerDay || 0,
        maxPeriodsPerDay,
      );
      const safeLatestStartPosition = Math.min(
        classData.latestStartPosition || 0,
        maxPeriodsPerDay,
      );
      const safeEarliestEnd = Math.min(
        classData.earliestEnd || 0,
        maxPeriodsPerDay,
      );
      const safeMaxFreePeriods = Math.min(
        classData.maxFreePeriods || 0,
        maxPeriodsPerDay,
      );

      reset({
        name: classData.name,
        section: classData.section,
        initial: classData.initial,
        color: classData.color,
        capacity: classData.capacity,
        minLessonsPerDay: safeMinLessonsPerDay,
        maxLessonsPerDay: safeMaxLessonsPerDay,
        latestStartPosition: safeLatestStartPosition,
        earliestEnd: safeEarliestEnd,
        maxFreePeriods: safeMaxFreePeriods,
        controlNumber: classData.controlNumber || 1,
        mainTeacher: classData.mainTeacher || "",
        comment: classData.comment || "",
        presentEveryDay: classData.presentEveryDay || false,
        organizationId: classData.organizationId,
        planSettingsId: classData.planSettingsId || 0,
      });
      setOrganizationId(classData.organizationId);
    } else if (isCreating) {
      // Create mode with default values
      reset({
        name: "",
        section: "",
        initial: "",
        color: "#4f46e5",
        capacity: 1,
        minLessonsPerDay: 0,
        maxLessonsPerDay: maxPeriodsPerDay,
        latestStartPosition: 1,
        earliestEnd: maxPeriodsPerDay,
        maxFreePeriods: 0,
        controlNumber: 1,
        mainTeacher: "",
        comment: "",
        presentEveryDay: false,
        organizationId: 0,
        planSettingsId: 0,
      });

      // Set organization ID from user data if not admin
      if (!isAdmin) {
        const userData = localStorage.getItem("userData");
        if (userData) {
          try {
            const user = JSON.parse(userData);
            if (user.organizationId) {
              setValue("organizationId", Number(user.organizationId));
              setOrganizationId(Number(user.organizationId));
            }
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
      }
    }
  }, [classData, isCreating, reset, isAdmin, setValue, maxPeriodsPerDay]);

 
  useEffect(() => {
    const min = watchedMinLessons;
    const max = watchedMaxLessons;

    if(min > max && max !== 0) {
    
      setValue("maxLessonsPerDay", min);
      toast({
        variant: "default",
        description: "Maximum lessons per day updated to match minimum lessons",
      });
    }
  }, [watchedMinLessons, watchedMaxLessons, setValue, toast]);

  const handleOrganizationChange = (value: number) => {
    setValue("organizationId", value);
    setOrganizationId(value);

   
    if(value) {
      console.log(
        "ClassForm: Organization changed, fetching plan settings for:",
        value,
      );
      fetchPlanSettingsByOrganization(value);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if(isCreating) {
        if(onSave) {
          await onSave(data);
        }
      } else if(classData) {
        console.log("Updating class with data:", {
          uuid: classData.uuid,
          data: {
            ...data,
            modifiedBy: classData.modifiedBy || "system",
          },
        });

        try {
          const result = await updateClass({
            uuid: classData.uuid,
            data: {
              ...data,
              modifiedBy: classData.modifiedBy || "system",
            },
          }).unwrap();

          toast({
            description: t("class.success.updated", { name: data.name }),
          });

         
          if(result.data) {
            dispatch(setSelectedClass(result.data.uuid));

            
            if(onUpdate) {
              onUpdate();
            }
          }
        }catch(error: any) {
        
          if(error?.data?.message) {
        
            toast({
              variant: "destructive",
              description: error.data.message,
            });
          } else if(
            error?.status === 400 &&
            error?.error?.includes("No changes to class")
          ) {
         
            toast({
              description: `No changes detected for ${data.name}`,
              variant: "default",
            });
          } else if(
            (error?.status === 409 &&
              error?.error?.includes("already exists")) ||
            (error?.data?.error &&
              error.data.error.includes("[Class already exists]")) ||
            (typeof error?.error === "string" &&
              error.error.includes("[Class already exists]"))
          ) {
            toast({
              variant: "destructive",
              description: t("class.errors.alreadyExists", { name: data.name }),
            });
          }else {
    
            throw error;
          }
        }
      }
    }catch(error: any) {
      console.error("Form submission error:", error);

      let errorMessage = isCreating
        ? t("class.errors.createFailed")
        : t("class.errors.updateFailed");

      const checkForClassExists = (value: any): boolean => {
        if(typeof value !== "string") return false;
        return (
          value.includes("Class already exists") ||
          value.includes("[Class already exists]")
        );
      };

      const findErrorMessage = (obj: any): string | null => {
        if(!obj || typeof obj !== "object") return null;

        for(const key in obj) {
          const value = obj[key];

          if(checkForClassExists(value)) {
            return t("class.errors.alreadyExists", { name: data.name });
          }

          if(value && typeof value === "object") {
            const result = findErrorMessage(value);
            if(result) return result;
          }
        }

        return null;
      };

      const classExistsError = findErrorMessage(error);
      if(classExistsError) {
        errorMessage = classExistsError;
      } else if(error?.data?.message) {
        errorMessage = error.data.message;
      } else if(error?.data?.error) {
        errorMessage = error.data.error;
      } else if(typeof error?.error === "string") {
        errorMessage = error.error;
      }

      toast({
        variant: "destructive",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if(!classData?.uuid) return;

    try {
      console.log("Deleting class with UUID:", classData.uuid);

 
      const response = await deleteClass(classData.uuid).unwrap();

      if(response.success) {
  
        toast({
          description: `Class ${classData.name} deleted successfully`,
        });

        navigate("/classes", { replace: true });

       
        dispatch(closeClassPanel());
        dispatch(setSelectedClass(null));
        navigate("/classes", { replace: true });

        if(onUpdate) {
          onUpdate();
        }
       
        onCancel();
      }else {
        toast({
          variant: "destructive",
          description:
            response.error || `Failed to delete class: ${classData.name}`,
        });
      }

    
      setIsDeleteDialogOpen(false);
    }catch(error: any) {
      console.error("Error deleting class:", error);

      let errorMessage = `Failed to delete class: ${classData.name}`;

      if(error?.data?.message) {
        errorMessage = error.data.message;
      } else if(error?.data?.error) {
        errorMessage = error.data.error;
      } else if(error?.error) {
        errorMessage = error.error;
      } else if(error?.message) {
        errorMessage = error.message;
      }

      toast({
        variant: "destructive",
        description: errorMessage,
      });

      setIsDeleteDialogOpen(false);
    }
  };


  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  // Updated useEffect to handle mode changes
  useEffect(() => {
    const planSettingsArray = getPlanSettingsArray();
    if (isCreating && planSettingsArray.length > 0) {
      console.log("Setting default plan settings ID:", planSettingsArray[0].id);
      setValue("planSettingsId", planSettingsArray[0].id);
    }
  }, [isCreating, planSettings, setValue]);

  // Fix planSettings access to handle both array and single object formats
  const getPlanSettingsArray = () => {
    if (!planSettings) return [];
    if (Array.isArray(planSettings)) return planSettings;
    return [planSettings]; // Convert single object to array
  };

  // Add special effect for mode transitions
  useEffect(() => {
    console.log("CLASS FORM MODE CHANGE DETECTED:", { 
      isCreating, 
      hasClassData: !!classData,
      classDataId: classData?.uuid || 'none',
      formMode: isCreating ? "CREATE" : "UPDATE"
    });
  }, [isCreating, classData]);

  // Fix the formModeKey to not rely on the undefined refreshKey variable
  const formModeKey = `${isCreating ? 'create' : 'update'}-${classData?.uuid || 'new'}`;

  return (
    <div className="p-6">
     

      <form
        key={formModeKey}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="space-y-4">
       
          {isAdmin && (
            <OrganizationSelector
              value={organizationId}
              onChange={handleOrganizationChange}
              error={!!errors.organizationId}
              errorMessage={errors.organizationId?.message}
              disabled={!isCreating && !!classData}
            />
          )}

          {/* PlanSetting Dropdown */}
          <div>
            <Label className="istui-timetable__main_form_input_label" htmlFor="planSettingsId">
              {t("class.form.planSettings")}
            </Label>
            <select
              className="w-full p-2 border rounded-md istui-timetable__main_form_input_select"
              id="planSettingsId"
              value={watch("planSettingsId") || ""}
              onChange={e => setValue("planSettingsId", e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">{t("class.form.selectPlanSettings")}</option>
              {getPlanSettingsArray().map((ps) => (
                <option key={ps.id} value={ps.id}>
                  {ps.name}
                </option>
              ))}
            </select>
            {errors.planSettingsId && (
              <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                {errors.planSettingsId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="istui-timetable__main_form_input_label"
                htmlFor="initial"
              >
                {t("class.form.initial")}
              </Label>
              <Input
                className="istui-timetable__main_form_input"
                id="initial"
                {...register("initial")}
              />
              {errors.initial && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {errors.initial.message}
                </p>
              )}
            </div>
            <div>
              <Label
                className="istui-timetable__main_form_input_label"
                htmlFor="color"
              >
                {t("class.form.color")}
              </Label>
              <Input
                className="istui-timetable__main_form_input"
                id="color"
                type="color"
                {...register("color")}
              />
            </div>
          </div>

          <div>
            <Label
              className="istui-timetable__main_form_input_label"
              htmlFor="name"
            >
              {t("class.form.name")}
            </Label>
            <Input
              className="istui-timetable__main_form_input"
              id="name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label
              className="istui-timetable__main_form_input_label"
              htmlFor="section"
            >
              {t("class.form.section")}
            </Label>
            <Input
              className="istui-timetable__main_form_input"
              id="section"
              {...register("section")}
            />
            {errors.section && (
              <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                {errors.section.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="istui-timetable__main_form_input_label"
                htmlFor="capacity"
              >
                {t("class.form.capacity")}
              </Label>
              <Input
                className="istui-timetable__main_form_input"
                id="capacity"
                type="number"
                {...register("capacity")}
              />
              {errors.capacity && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {errors.capacity.message}
                </p>
              )}
            </div>
            <div>
              <Label
                className="istui-timetable__main_form_input_label"
                htmlFor="controlNumber"
              >
                {t("class.form.controlNumber")}
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxControlNumber})
                </span>
              </Label>
              <Input
                className="istui-timetable__main_form_input"
                id="controlNumber"
                type="number"
                min="1"
                max={maxControlNumber}
                {...register("controlNumber")}
              />
              {errors.controlNumber && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {errors.controlNumber.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="istui-timetable__main_form_input_label"
                htmlFor="minLessonsPerDay"
              >
                {t("class.form.minLessonsPerDay")}
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxPeriodsPerDay})
                </span>
              </Label>
              <select
                className="w-full p-2 border rounded-md istui-timetable__main_form_input_select"
                id="minLessonsPerDay"
                {...register("minLessonsPerDay")}
              >
                {optionsStartingFromZero.map((value) => (
                  <option key={`min-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.minLessonsPerDay && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {errors.minLessonsPerDay.message}
                </p>
              )}
            </div>
            <div>
              <Label
                className="istui-timetable__main_form_input_label"
                htmlFor="maxLessonsPerDay"
              >
                {t("class.form.maxLessonsPerDay")}
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxPeriodsPerDay})
                </span>
              </Label>
              <select
                className="w-full p-2 border rounded-md istui-timetable__main_form_input_select"
                id="maxLessonsPerDay"
                {...register("maxLessonsPerDay")}
              >
                {optionsStartingFromZero.map((value) => (
                  <option key={`max-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.maxLessonsPerDay && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {errors.maxLessonsPerDay.message}
                </p>
              )}
           
              <p className="text-xs text-blue-500 mt-1">
                Note: Breaks and lunch periods are excluded when calculating
                this limit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="istui-timetable__main_form_input_label"
                htmlFor="latestStartPosition"
              >
                {t("class.form.latestStartPosition")}
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxPeriodsPerDay})
                </span>
              </Label>
              <select
                className="w-full p-2 border rounded-md istui-timetable__main_form_input_select"
                id="latestStartPosition"
                {...register("latestStartPosition")}
              >
                {optionsStartingFromOne.map((value) => (
                  <option key={`latestStart-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.latestStartPosition && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {errors.latestStartPosition.message}
                </p>
              )}
            </div>
            <div>
              <Label
                className="istui-timetable__main_form_input_label"
                htmlFor="earliestEnd"
              >
                {t("class.form.earliestEnd")}
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxPeriodsPerDay})
                </span>
              </Label>
              <select
                className="w-full p-2 border rounded-md istui-timetable__main_form_input_select"
                id="earliestEnd"
                {...register("earliestEnd")}
              >
                {optionsStartingFromOne.map((value) => (
                  <option key={`earliestEnd-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.earliestEnd && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {errors.earliestEnd.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label
                className="istui-timetable__main_form_input_label"
                htmlFor="maxFreePeriods"
              >
                {t("class.form.maxFreePeriods")}
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxPeriodsPerDay})
                </span>
              </Label>
              <select
                className="w-full p-2 border rounded-md istui-timetable__main_form_input_select"
                id="maxFreePeriods"
                {...register("maxFreePeriods")}
              >
                {optionsStartingFromZero.map((value) => (
                  <option key={`maxFree-${value}`} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              {errors.maxFreePeriods && (
                <p className="text-sm text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                  {errors.maxFreePeriods.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="mainTeacher">{t("class.form.mainTeacher")}</Label>
              <select
                className="w-full p-2 border rounded-md istui-timetable__main_form_input_select"
                id="mainTeacher"
                {...register("mainTeacher")}
              >
                <option value="">Select a teacher</option>
                <option value="JD">John Doe (JD)</option>
                <option value="JS">Jane Smith (JS)</option>
                <option value="RJ">Robert Johnson (RJ)</option>
              </select>
            </div>
          </div>

          <div>
            <Label
              className="istui-timetable__main_form_input_label"
              htmlFor="comment"
            >
              {t("class.form.comment")}
            </Label>
            <Textarea
              className="istui-timetable__main_form_input_textarea"
              id="comment"
              {...register("comment")}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              className="istui-timetable__main_form_checkbox"
              id="presentEveryDay"
              checked={watch("presentEveryDay")}
              onCheckedChange={(checked) =>
                setValue("presentEveryDay", !!checked)
              }
            />
            <Label
              className="istui-timetable__main_form_input_label"
              htmlFor="presentEveryDay"
            >
              {t("class.form.presentEveryDay")}
            </Label>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
      
          <Button
            size="sm"
            className="istui-timetable__main_form_cancel_button"
            type="button"
            variant="outline"
            onClick={onCancel}
          >
              <X/>
            {t("common.cancel")}
          </Button>

          {!isCreating && classData && (

            <Button
              size="sm"
              type="button"
              variant="destructive"
              onClick={openDeleteDialog}
              disabled={isLoading}
              className="istui-timetable__main_form_delete_button"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("common.deleteButton")}
            </Button>
          )}

          <Button
            size="sm"
            className="istui-timetable__main_form_save_button"
            type="submit"
            disabled={isLoading}
          >
            <Check/>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {isCreating ? t("common.creating") : t("common.saving")}
              </>
            ) : isCreating ? (
              t("class.actions.create")
            ) : (
              t("common.update")
            )}
          </Button>
        </div>
      </form>

      {!isCreating && classData && (
        <DeleteConfirmation
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          moduleName="class"
          showTrigger={false}
        />
      )}
    </div>
  );
};

export default ClassForm;
