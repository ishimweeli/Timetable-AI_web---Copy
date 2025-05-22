import React, { useEffect, useState, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/component/Ui/input";
import { Textarea } from "@/component/Ui/textarea";
import { Checkbox } from "@/component/Ui/checkbox";
import MultiSelect from "@/component/Ui/multi-select";
import {
  TypeClassBand,
  CreateClassBandRequest,
} from "@/type/ClassBand/TypeClassBand";
import { useGetClassesQuery } from "@/store/Class/ApiClass";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/component/Ui/form";
import { Alert, AlertDescription } from "@/component/Ui/alert";
import { AlertCircle } from "lucide-react";
import { useI18n } from "@/hook/useI18n";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { Trash2 } from "lucide-react";
import { Button } from "@/component/Ui/button";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { useAppSelector } from "@/hook/useAppRedux";
import { useMaxControlNumber } from "@/hook/useMaxControlNumber";
import { TypeClass } from "@/type/Class/TypeClass";
import type { GetClassesParams } from "@/store/Class/ApiClass";

interface ClassBandFormProps {
  onSubmit: (data: CreateClassBandRequest) => void;
  onDelete?: () => void;
  initialData?: TypeClassBand | Partial<TypeClassBand>;
  footer?: React.ReactNode;
  isCreateMode: boolean;
  apiError?: string;
  onClearError?: () => void;
  planSettingsList: Array<{id: number; name: string}>;
}

const defaultValues = {
  name: "",
  description: "",
  participatingClassUuids: [],
  minLessonsPerDay: 0,
  maxLessonsPerDay: 0,
  latestStartPosition: 0,
  earliestEnd: 0,
  maxFreePeriods: 0,
  presentEveryDay: false,
  organizationId: 1,
  controlNumber: 1,
  planSettingsId: undefined,
};

const DEFAULT_PERIODS_PER_DAY = 8;

const ClassBandForm: React.FC<ClassBandFormProps> = ({
  onSubmit,
  onDelete,
  initialData,
  footer,
  isCreateMode,
  apiError,
  onClearError,
  planSettingsList = [],
}) => {
  const { t } = useI18n();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const hasFetchedRef = useRef(false);
  const isMountedRef = useRef(true);

  const planSettings = usePlanSettingsStore((state) => state.planSettings);
  const fetchPlanSettingsByOrganization = usePlanSettingsStore(
    (state) => state.fetchPlanSettingsByOrganization,
  );
  const { user } = useAppSelector((state) => state.auth);
  const { maxControlNumber } = useMaxControlNumber();
 
  const maxPeriodsPerDayRef = useRef(DEFAULT_PERIODS_PER_DAY);

  const maxPeriodsPerDay = React.useMemo(() => {
    let value = DEFAULT_PERIODS_PER_DAY;

    if(Array.isArray(planSettings) && planSettings?.length > 0) {
      value = planSettings[0]?.periodsPerDay || DEFAULT_PERIODS_PER_DAY;
    } else if(planSettings?.periodsPerDay) {
      value = planSettings.periodsPerDay;
    }

    maxPeriodsPerDayRef.current = value;
    return value;
  }, [planSettings]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const orgId = user?.organizationId;

    if(orgId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;

      const currentOrgId = orgId.toString();

      const timeoutId = setTimeout(() => {
        if(isMountedRef.current) {
          fetchPlanSettingsByOrganization(currentOrgId).catch((error) => {
            console.log("Using default settings due to API error:", error);
          });
        }
      }, 300); 

      return () => clearTimeout(timeoutId);
    }
  }, [fetchPlanSettingsByOrganization, user]);

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    organizationId: z.number(),
    description: z.string().optional(),
    participatingClassUuids: z
      .array(z.string())
      .min(2, "At least 2 classes are required")
      .optional(),
    minLessonsPerDay: z.number().min(0).optional(),
    maxLessonsPerDay: z.number().min(0).optional(),
    latestStartPosition: z.number().min(0).optional(),
    earliestEnd: z.number().min(0).optional(),
    maxFreePeriods: z.number().min(0).optional(),
    presentEveryDay: z.boolean().optional(),
    controlNumber: z.number().int().min(1).max(maxControlNumber, `Control number cannot exceed ${maxControlNumber}`),
    planSettingsId: z.number().optional(),
  });

  const getPlanSettingsId = (data: any) => {
    if (data && typeof data === 'object' && 'planSettingsId' in data) {
      return typeof data.planSettingsId === 'number' ? data.planSettingsId : data.planSettingsId ? Number(data.planSettingsId) : undefined;
    }
    return undefined;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isCreateMode
      ? defaultValues
      : {
          name: initialData?.name || "",
          description: initialData?.description || "",
          participatingClassUuids:
            initialData?.participatingClasses?.map((c) => c.uuid) || [],
          minLessonsPerDay: initialData?.minLessonsPerDay || 0,
          maxLessonsPerDay: initialData?.maxLessonsPerDay || 0,
          latestStartPosition: initialData?.latestStartPosition || 0,
          earliestEnd: initialData?.earliestEnd || 0,
          maxFreePeriods: initialData?.maxFreePeriods || 0,
          presentEveryDay: initialData?.presentEveryDay || false,
          organizationId: initialData?.organizationId || 1,
          controlNumber: initialData?.controlNumber || 1,
          planSettingsId: getPlanSettingsId(initialData),
        },
  });

  const planSettingsId = useWatch({ control: form.control, name: "planSettingsId" });

  useEffect(() => {
    const scheduleFields = [
      { name: "minLessonsPerDay", label: t("classBand.form.minLessonsPerDay") },
      { name: "maxLessonsPerDay", label: t("classBand.form.maxLessonsPerDay") },
      {
        name: "latestStartPosition",
        label: t("classBand.form.latestStartPosition"),
      },
      { name: "earliestEnd", label: t("classBand.form.earliestEnd") },
      { name: "maxFreePeriods", label: t("classBand.form.maxFreePeriods") },
    ];

    for(const field of scheduleFields) {
      const value = form.getValues(field.name as any);
      if(value > maxPeriodsPerDay) {
        form.setValue(field.name as any, maxPeriodsPerDay);
      }
    }
  }, [maxPeriodsPerDay, form, t]);

  useEffect(() => {
    if(isCreateMode) {
      form.reset(defaultValues);
    } else if(initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        participatingClassUuids:
          initialData.participatingClasses?.map((c) => c.uuid) || [],
        minLessonsPerDay: initialData.minLessonsPerDay || 0,
        maxLessonsPerDay: initialData.maxLessonsPerDay || 0,
        latestStartPosition: initialData.latestStartPosition || 0,
        earliestEnd: initialData.earliestEnd || 0,
        maxFreePeriods: initialData.maxFreePeriods || 0,
        presentEveryDay: initialData.presentEveryDay || false,
        organizationId: initialData.organizationId || 1,
        controlNumber: initialData.controlNumber || 1,
        planSettingsId: getPlanSettingsId(initialData),
      });
    }
  }, [isCreateMode, initialData, form]);

  useEffect(() => {
    if(apiError && onClearError) {
      const subscription = form.watch(() => {
        onClearError();
      });
      return () => subscription.unsubscribe();
    }
  }, [apiError, onClearError, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const participatingClassUuids = values.participatingClassUuids || [];

    if(participatingClassUuids.length < 2) {
      form.setError("participatingClassUuids", {
        type: "manual",
        message: t("classBand.validation.minClassesRequired"),
      });
      return;
    }

    const scheduleFields = [
      { name: "minLessonsPerDay", label: t("classBand.form.minLessonsPerDay") },
      { name: "maxLessonsPerDay", label: t("classBand.form.maxLessonsPerDay") },
      {
        name: "latestStartPosition",
        label: t("classBand.form.latestStartPosition"),
      },
      { name: "earliestEnd", label: t("classBand.form.earliestEnd") },
      { name: "maxFreePeriods", label: t("classBand.form.maxFreePeriods") },
    ];

    for(const field of scheduleFields) {
      const val = Number(values[field.name as keyof typeof values]);
      if(val > maxPeriodsPerDayRef.current) {
        form.setError(field.name as any, {
          type: "manual",
          message: `${field.label} cannot exceed ${maxPeriodsPerDayRef.current} periods`,
        });
        return;
      }
    }

    const formData: CreateClassBandRequest = {
      name: values.name,
      organizationId: values.organizationId,
      description: values.description,
      participatingClassUuids: participatingClassUuids,
      minLessonsPerDay: values.minLessonsPerDay || 0,
      maxLessonsPerDay: values.maxLessonsPerDay || 0,
      latestStartPosition: values.latestStartPosition || 0,
      earliestEnd: values.earliestEnd || 0,
      maxFreePeriods: values.maxFreePeriods || 0,
      presentEveryDay: values.presentEveryDay || false,
      controlNumber: values.controlNumber,
      planSettingsId: values.planSettingsId,
    };
    onSubmit(formData);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if(onDelete) {
      setIsDeleting(true);
      await onDelete();
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const params: GetClassesParams = planSettingsId ? { planSettingsId: Number(planSettingsId) } : {};
  const { data: classesApiResponse } = useGetClassesQuery(params);
  const classes: TypeClass[] = classesApiResponse?.data || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {apiError && !apiError.includes("No changes") && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="planSettingsId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                    {t("class.form.planSettings")}
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      value={field.value ?? ''}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      className="max-w-md istui-timetable__main_form_input_select"
                    >
                      <option value="">{t("class.form.selectPlanSettings")}</option>
                      {planSettingsList.map((ps) => (
                        <option key={ps.id} value={ps.id}>
                          {ps.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                    {t("classBand.form.name")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="max-w-md istui-timetable__main_form_input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                    {t("classBand.form.description")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      className="max-w-md h-24 istui-timetable__main_form_input_textarea"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <FormField
                  control={form.control}
                  name="participatingClassUuids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                        {t("classBand.form.classes")}
                      </FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={classes}
                          value={classes.filter((c) =>
                            field.value?.includes(c.uuid),
                          )}
                          onChange={(selected) =>
                            field.onChange(selected.map((c) => c.uuid))
                          }
                          getOptionLabel={(option) => option.name}
                          getOptionValue={(option) => option.uuid}
                          className="max-w-md istui-timetable__main_form_input_select"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
                <FormField
                  control={form.control}
                  name="controlNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                        {t("classBand.form.controlNumber")}
                        <span className="text-xs text-gray-500 ml-1">
                          (Max: {maxControlNumber})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value <= maxControlNumber) {
                              field.onChange(value);
                            } else {
                              field.onChange(maxControlNumber);
                            }
                          }}
                          className={`max-w-[200px] istui-timetable__main_form_input_select ${
                            Number(field.value) > maxControlNumber ? "border-red-500" : ""
                          }`}
                          min={1}
                          max={maxControlNumber}
                        />
                      </FormControl>
                      {Number(field.value) > maxControlNumber && (
                        <p className="text-xs text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                          Cannot exceed {maxControlNumber}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">
              {t("classBand.schedulePreferences")}
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="minLessonsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                      {t("classBand.form.minLessonsPerDay")}
                      <span className="text-xs text-gray-500 ml-1">
                        (Max: {maxPeriodsPerDay})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if(value <= maxPeriodsPerDay) {
                            field.onChange(value);
                          }else {
                            field.onChange(maxPeriodsPerDay);
                          }
                        }}
                        className={`max-w-[200px] istui-timetable__main_form_input_select ${
                          field.value > maxPeriodsPerDay ? "border-red-500" : ""
                        }`}
                        min={0}
                        max={maxPeriodsPerDay}
                      />
                    </FormControl>
                    {field.value > maxPeriodsPerDay && (
                      <p className="text-xs text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                        Cannot exceed {maxPeriodsPerDay} periods
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxLessonsPerDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                      {t("classBand.form.maxLessonsPerDay")}
                      <span className="text-xs text-gray-500 ml-1">
                        (Max: {maxPeriodsPerDay})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if(value <= maxPeriodsPerDay) {
                            field.onChange(value);
                          }else {
                            field.onChange(maxPeriodsPerDay);
                          }
                        }}
                        className={`max-w-[200px] istui-timetable__main_form_input_select ${
                          field.value > maxPeriodsPerDay ? "border-red-500" : ""
                        }`}
                        min={0}
                        max={maxPeriodsPerDay}
                      />
                    </FormControl>
                    {field.value > maxPeriodsPerDay && (
                      <p className="text-xs text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                        Cannot exceed {maxPeriodsPerDay} periods
                      </p>
                    )}
                    <p className="text-xs text-primary mt-1 ">
                      Note: Breaks and lunch periods are excluded when
                      calculating this limit.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="latestStartPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                      {t("classBand.form.latestStartPosition")}
                      <span className="text-xs text-gray-500 ml-1">
                        (Max: {maxPeriodsPerDay})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if(value <= maxPeriodsPerDay) {
                            field.onChange(value);
                          }else {
                            field.onChange(maxPeriodsPerDay);
                          }
                        }}
                        className={`max-w-[200px] istui-timetable__main_form_input_select ${
                          field.value > maxPeriodsPerDay ? "border-red-500" : ""
                        }`}
                        min={0}
                        max={maxPeriodsPerDay}
                      />
                    </FormControl>
                    {field.value > maxPeriodsPerDay && (
                      <p className="text-xs text-red-500 mt-1 ">
                        Cannot exceed {maxPeriodsPerDay} periods
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="earliestEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                      {t("classBand.form.earliestEnd")}
                      <span className="text-xs text-gray-500 ml-1">
                        (Max: {maxPeriodsPerDay})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if(value <= maxPeriodsPerDay) {
                            field.onChange(value);
                          }else {
                            field.onChange(maxPeriodsPerDay);
                          }
                        }}
                        className={`max-w-[200px] istui-timetable__main_form_input_select ${
                          field.value > maxPeriodsPerDay ? "border-red-500" : ""
                        }`}
                        min={0}
                        max={maxPeriodsPerDay}
                      />
                    </FormControl>
                    {field.value > maxPeriodsPerDay && (
                      <p className="text-xs text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                        Cannot exceed {maxPeriodsPerDay} periods
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maxFreePeriods"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                      {t("classBand.form.maxFreePeriods")}
                      <span className="text-xs text-gray-500 ml-1">
                        (Max: {maxPeriodsPerDay})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if(value <= maxPeriodsPerDay) {
                            field.onChange(value);
                          }else {
                            field.onChange(maxPeriodsPerDay);
                          }
                        }}
                        className={`max-w-[200px] istui-timetable__main_form_input_select ${
                          field.value > maxPeriodsPerDay ? "border-red-500" : ""
                        }`}
                        min={0}
                        max={maxPeriodsPerDay}
                      />
                    </FormControl>
                    {field.value > maxPeriodsPerDay && (
                      <p className="text-xs text-red-500 mt-1 istui-timetable__main_form_input_error_message">
                        Cannot exceed {maxPeriodsPerDay} periods
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="presentEveryDay"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="istui-timetable__main_form_checkbox"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-medium istui-timetable__main_form_input_label">
                        {t("classBand.form.presentEveryDay")}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {!footer && !isCreateMode && initialData && onDelete && (
          <div className="flex justify-end space-x-2 mt-8 pt-6 border-t">
            <Button type="submit">{t("common.update")}</Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteClick}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("common.deleteButton")}
            </Button>
          </div>
        )}

        {footer && (
          <div className="flex justify-end space-x-2 mt-8 pt-6 border-t">
            {footer}
          </div>
        )}

        {!isCreateMode && initialData && onDelete && (
          <DeleteConfirmation
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
            title={t("common.deleteConfirmTitle")}
            description={`${t("common.deleteConfirmMessage")} ${initialData?.name ? `(${initialData.name})` : ""}`}
            showTrigger={false}
          />
        )}
      </form>
    </Form>
  );
};

export default ClassBandForm;
