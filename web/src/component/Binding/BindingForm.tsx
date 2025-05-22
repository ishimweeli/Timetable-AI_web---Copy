import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/component/Ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { ScrollArea } from "@/component/Ui/scroll-area";
import { Checkbox } from "@/component/Ui/checkbox";
import { useToast } from "@/component/Ui/use-toast";
import { useI18n } from "@/hook/useI18n";
import { Loader2, User, Book, School, Home, AlertCircle, ArrowRight, CheckCircle, ClipboardList, Calendar } from "lucide-react";
import { Teacher, Subject, Class, Room, Rule, Binding, TypeClassBand } from "@/type/Binding/TypeBinding";
import { Card, CardContent } from "@/component/Ui/card";
import ValidationMessage from "./ValidationMessage";
import WorkloadDisplay from "./WorkloadDisplay";
import debounce from "lodash/debounce";
import { createPortal } from "react-dom";
import { t } from "i18next";

// We'll move the formSchema inside the component to access translations

type FormValues = {
  teacherUuid: string;
  subjectUuid: string;
  classUuid?: string;
  classBandUuid?: string;
  roomUuid: string;
  ruleUuids: string[];
  periodsPerWeek: number;
  notes: string;
  isFixed: boolean;
  statusId: number;
  planSettingsId?: number | null;
};

interface BindingFormProps {
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  classBands: TypeClassBand[];
  rooms: Room[];
  rules?: Rule[];
  initialData?: Partial<Binding>;
  onSave: (data: any) => void;
  onUpdate: (uuid: string, data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  isLoading: boolean;
  organizationUuid?: string | null;
  organizationId?: number | null;
  existingBindings?: Binding[];
  planSettingsList?: any[];
  selectedPlanSettingsId?: number | null;
  serverError?: string | null;
  onClearServerError?: () => void;
}

const BindingForm: React.FC<BindingFormProps> = ({
  teachers,
  subjects,
  classes,
  classBands,
  rooms,
  rules = [],
  initialData,
  onSave,
  onUpdate,
  onCancel,
  isEditing,
  isLoading,
  organizationUuid,
  organizationId,
  existingBindings = [],
  planSettingsList = [],
  selectedPlanSettingsId,
  serverError,
  onClearServerError
}) => {
  const { t } = useI18n();
  const { toast } = useToast();
  
  // Custom Zod error map to translate error messages
  const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
    // Handle all common validation errors with translations
    if (issue.code === z.ZodIssueCode.too_small) {
      if (issue.type === "string") {
        return { message: t("binding.validation.emptyCell") };
      }
      if (issue.type === "number") {
        return { message: t("binding.validation.periodsRange") };
      }
    }
    
    if (issue.code === z.ZodIssueCode.invalid_type) {
      return { message: t("binding.validation.invalidInput") };
    }
    
    if (issue.code === z.ZodIssueCode.invalid_string) {
      return { message: t("binding.validation.invalidInput") };
    }
    
    if (issue.code === z.ZodIssueCode.custom) {
      return { message: t("binding.validation.invalidInput") };
    }
    
    // Default fallback error message
    return { message: t("binding.validation.invalidInput") };
  };

  // Set the custom error map as default for Zod
  z.setErrorMap(customErrorMap);

  // Define schema inside component to access translations
  const formSchema = z.object({
    teacherUuid: z.string().min(1),
    subjectUuid: z.string().min(1),
    classUuid: z.string().optional(),
    classBandUuid: z.string().optional(),
    roomUuid: z.string().min(1),
    ruleUuids: z.array(z.string()).optional().default([]),
    periodsPerWeek: z.number().min(1).max(20),
    notes: z.string().optional().default(""),
    isFixed: z.boolean().default(false),
    statusId: z.number().default(1),
    planSettingsId: z.number().optional(),
  })
  .refine(
    (data) => data.classUuid || data.classBandUuid,
    { message: t("binding.validation.classOrBandRequired"), path: ["classUuid"] }
  )
  .refine(
    (data) => !(data.classUuid && data.classBandUuid),
    { message: "binding.validation.notBothClassAndBand", path: ["classBandUuid"] }
  );
  
  const [formStep, setFormStep] = useState<"basic" | "fixed" | "rules">("basic");
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [stepsVisited, setStepsVisited] = useState<Set<string>>(new Set(["basic"]));
  const [showWorkloadPanel, setShowWorkloadPanel] = useState(false);

  // Function to clear all errors (both form and server errors)
  const clearAllErrors = useCallback(() => {
    setServerErrors({});
    onClearServerError?.();
  }, [onClearServerError]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherUuid: initialData?.teacherUuid || "",
      subjectUuid: initialData?.subjectUuid || "",
      classUuid: initialData?.classUuid === undefined ? "" : initialData.classUuid,
      classBandUuid: initialData?.classBandUuid === undefined ? "" : initialData.classBandUuid,
      roomUuid: initialData?.roomUuid || "",
      ruleUuids: initialData?.ruleUuids || [],
      periodsPerWeek: initialData?.periodsPerWeek || 1,
      notes: initialData?.notes || "",
      isFixed: initialData?.isFixed || false,
      statusId: initialData?.statusId || 1,
      planSettingsId: initialData?.planSettingsId || null,
    },
    mode: "onChange"
  });

  // Use watch instead of getValues for reactive updates
  const watchedValues = form.watch();
  const teacherUuid = form.watch("teacherUuid");
  const subjectUuid = form.watch("subjectUuid");
  const classUuid = form.watch("classUuid");
  const classBandUuid = form.watch("classBandUuid");
  const roomUuid = form.watch("roomUuid");

  // Debounced check for duplicates
  const debouncedCheckForDuplicates = useMemo(
    () => debounce(() => {
      setServerErrors({});
      
      if(classUuid && subjectUuid) {
        const duplicateBindingsForClass = existingBindings.filter(binding => 
          binding.classUuid === classUuid && 
          binding.subjectUuid === subjectUuid &&
          (initialData ? binding.uuid !== initialData.uuid : true)
        );
        
        if(duplicateBindingsForClass.length > 0) {
          const duplicateTeacher = teachers.find(t => t.uuid === duplicateBindingsForClass[0].teacherUuid);
          const duplicateTeacherName = duplicateTeacher 
            ? `${duplicateTeacher.firstName} ${duplicateTeacher.lastName}` 
            : 'another teacher';
            
          setServerErrors(prev => ({
            ...prev,
            duplicateAssignment: t("binding.validation.duplicateClassSubjectDetail", { teacher: duplicateTeacherName })
          }));
          return true;
        }
      }
      
      if(classBandUuid && subjectUuid) {
        const duplicateBindingsForClassBand = existingBindings.filter(binding => 
          binding.classBandUuid === classBandUuid && 
          binding.subjectUuid === subjectUuid &&
          (initialData ? binding.uuid !== initialData.uuid : true)
        );
        
        if(duplicateBindingsForClassBand.length > 0) {
          const duplicateTeacher = teachers.find(t => t.uuid === duplicateBindingsForClassBand[0].teacherUuid);
          const duplicateTeacherName = duplicateTeacher 
            ? `${duplicateTeacher.firstName} ${duplicateTeacher.lastName}` 
            : 'another teacher';
            
          setServerErrors(prev => ({
            ...prev,
            duplicateAssignment: t("binding.validation.duplicateClassBandSubjectDetail", { teacher: duplicateTeacherName })
          }));
          return true;
        }
      }
      
      if(teacherUuid && subjectUuid && !isEditing) {
        const similiarBindings = existingBindings.filter(binding => 
          binding.teacherUuid === teacherUuid && 
          binding.subjectUuid === subjectUuid &&
          binding.roomUuid === roomUuid &&
          binding.periodsPerWeek === watchedValues.periodsPerWeek
        );
        
        if(similiarBindings.length > 0) {
          const existingClass = classes.find(c => c.uuid === similiarBindings[0].classUuid);
          const existingClassBand = classBands.find(cb => cb.uuid === similiarBindings[0].classBandUuid);
          const entityName = existingClass?.name || existingClassBand?.name || 'another group';
          
          setServerErrors(prev => ({
            ...prev,
            similarAssignment: t("binding.validation.similarBindingWarning", { entity: entityName })
          }));
        }
      }
      
      return false;
    }, 300),
    [existingBindings, initialData, t, teachers, classes, classBands, isEditing]
  );

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      debouncedCheckForDuplicates.cancel();
    };
  }, [debouncedCheckForDuplicates]);

  // Update selected items with debounced effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const foundTeacher = teachers.find(t => t.uuid === teacherUuid);
      const foundSubject = subjects.find(s => s.uuid === subjectUuid);
      const foundClass = classes.find(c => c.uuid === classUuid);
      const foundRoom = rooms.find(r => r.uuid === roomUuid);
      const foundClassBand = classBands.find(cb => cb.uuid === classBandUuid);

      setSelectedTeacher(foundTeacher || null);
      setSelectedSubject(foundSubject || null);
      setSelectedClass(foundClass || null);
      setSelectedRoom(foundRoom || null);
      setSelectedClassBand(foundClassBand || null);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [teacherUuid, subjectUuid, classUuid, roomUuid, classBandUuid, teachers, subjects, classes, rooms, classBands]);

  // Check for duplicates when relevant fields change
  useEffect(() => {
    if(teacherUuid && subjectUuid && (classUuid || classBandUuid)) {
      debouncedCheckForDuplicates();
    }
  }, [teacherUuid, subjectUuid, classUuid, classBandUuid, debouncedCheckForDuplicates]);

  const getStepErrors = (step: string) => {
    const errors = form.formState.errors;
    const stepFields = {
      basic: ["teacherUuid", "subjectUuid", "classUuid", "classBandUuid", "roomUuid", "periodsPerWeek"],
      fixed: ["priority", "isFixed", "notes"],
      rules: ["ruleUuids"]
    };
    
    const fieldList = stepFields[step as keyof typeof stepFields] || [];
    return fieldList.filter(field => field in errors);
  };

  const hasStepErrors = () => {
    if(formStep === "basic") {
      return getStepErrors("basic").length > 0;
    }
    
    if(formStep === "fixed") {
      return getStepErrors("fixed").length > 0;
    }
    
    if(formStep === "rules") {
      return getStepErrors("rules").length > 0;
    }
    
    return false;
  };

  const markStepVisited = (step: string) => {
    setStepsVisited(prev => new Set(prev).add(step));
  };

  const getStepStatus = (step: string) => {
    if(formStep === step) return "current";
    if(stepsVisited.has(step)) return "complete";
    return "upcoming";
  };

  const goToNextStep = async () => {
    // Clear all errors first
    clearAllErrors();
    markStepVisited(formStep);
    
    let stepFields: string[] = [];
    if(formStep === "basic") {
      stepFields = ["teacherUuid", "subjectUuid", "classUuid", "classBandUuid", "roomUuid", "periodsPerWeek"];
    } else if(formStep === "fixed") {
      stepFields = ["priority", "isFixed", "notes"];
    }
    
    const isValid = await form.trigger(stepFields as any);
    
    if(!isValid) {
      setServerErrors(prev => ({
        ...prev,
        formValidation: t("binding.validation.fixErrorsBeforeContinuing")
      }));
      return;
    }
    
    if(formStep === "basic") {
      if(debouncedCheckForDuplicates()) {
        return;
      }

      const hasWorkloadWarnings = document.querySelector('.bg-red-50');
      if(hasWorkloadWarnings) {
        setServerErrors(prev => ({
          ...prev,
          workloadWarning: t("binding.workload.confirmOverallocation") || "There are workload warnings that should be addressed before proceeding."
        }));
        return;
      }

      markStepVisited("fixed");
      setFormStep("fixed");
    } else if(formStep === "fixed") {
      markStepVisited("rules");
      setFormStep("rules");
    }
  };

  const goToPreviousStep = () => {
    // Clear all errors when changing steps
    clearAllErrors();
    
    if(formStep === "rules") {
      setFormStep("fixed");
    } else if(formStep === "fixed") {
      setFormStep("basic");
    }
  };

  // Add a separate effect to handle clearing errors in individual form fields
  useEffect(() => {
    // Add onChange handlers to all form controls that clear errors
    const formControls = document.querySelectorAll('input, select, textarea');
    
    const clearErrorsHandler = () => {
      clearAllErrors();
    };

    formControls.forEach(control => {
      control.addEventListener('change', clearErrorsHandler);
    });

    return () => {
      formControls.forEach(control => {
        control.removeEventListener('change', clearErrorsHandler);
      });
    };
  }, [clearAllErrors]);

  // Handle final submit - separated from the form submission
  const handleFinalSubmit = async () => {
    if (formStep !== "rules") return;
    
    if (!validateForm()) {
      setServerErrors(prev => ({
        ...prev,
        formValidation: t("binding.validation.formHasErrors")
      }));
      return;
    }
    
    submitForm();
  };
  
  // Function to handle the actual form submission
  const submitForm = () => {
    if (!validateForm()) {
      return;
    }
    
    const formValues = form.getValues();
    const uuid = initialData?.uuid;

    if (isEditing && uuid) {
      onUpdate(uuid, formValues);
    } else {
      onSave(formValues);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center w-full max-w-xs">
          <div 
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              formStep === "basic" 
                ? "bg-blue-600 text-white" 
                : getStepStatus("basic") === "complete" 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-gray-200 text-gray-600"
            }`}
          >
            {getStepStatus("basic") === "complete" ? (
              <CheckCircle className="h-3 w-3" />
            ) : "1"}
          </div>
          
          <div className={`h-1 flex-1 ${
            getStepStatus("basic") === "complete" ? "bg-blue-600" : "bg-gray-300"
          }`}></div>
          
          <div 
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              formStep === "fixed" 
                ? "bg-blue-600 text-white" 
                : getStepStatus("fixed") === "complete" 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-gray-200 text-gray-600"
            }`}
          >
            {getStepStatus("fixed") === "complete" ? (
              <CheckCircle className="h-3 w-3" />
            ) : "2"}
          </div>
          
          <div className={`h-1 flex-1 ${
            getStepStatus("fixed") === "complete" ? "bg-blue-600" : "bg-gray-300"
          }`}></div>
          
          <div 
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              formStep === "rules" 
                ? "bg-blue-600 text-white" 
                : getStepStatus("rules") === "complete" 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-gray-200 text-gray-600"
            }`}
          >
            {getStepStatus("rules") === "complete" ? (
              <CheckCircle className="h-3 w-3" />
            ) : "3"}
          </div>
        </div>
      </div>
    );
  };

  const getStepTitle = () => {
    if(formStep === "basic") return t("binding.steps.basic");
    if(formStep === "fixed") return t("binding.steps.fixed");
    if(formStep === "rules") return t("binding.steps.rules");
    return "";
  };

  // Function to get display error message with translation
  const getErrorMessage = (key: string, error: any) => {
    if (!error) return "";
    if (typeof error.message === 'string') {
      // Check if message is a translation key
      if (error.message.startsWith("binding.validation.")) {
        return t(error.message);
      }
      return error.message;
    }
    return t("binding.validation.invalidInput");
  };

  // Get visible error count only for display purpose
  const getVisibleErrorCount = useCallback(() => {
    return Object.keys(form.formState.errors).length + Object.keys(serverErrors).length;
  }, [form.formState.errors, serverErrors]);

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedClassBand, setSelectedClassBand] = useState<TypeClassBand | null>(null);

  const toggleWorkloadPanel = () => {
    setShowWorkloadPanel(!showWorkloadPanel);
  };

  const roomOptions = React.useMemo(() => rooms, [rooms]);

  // Check for form validation in the form submit handler
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    // Validate required fields
    if (!form.watch("subjectUuid")) {
      newErrors.subjectUuid = t("binding.validation.subjectRequired");
      isValid = false;
    }

    // Validate that either a class or class band is selected
    if (!form.watch("classUuid") && !form.watch("classBandUuid")) {
      newErrors.classOrBand = t("binding.validation.classOrBandRequired");
      isValid = false;
    }

    // Validate that a room is selected
    if (!form.watch("roomUuid")) {
      newErrors.roomUuid = t("binding.validation.roomRequired");
      isValid = false;
    }

    setServerErrors(newErrors);
    return isValid;
  };

  // Select either a class or class band
  const classError = form.formState.errors.classUuid && (
    <div className="text-red-500 text-xs mt-1">
      {getErrorMessage("classUuid", form.formState.errors.classUuid)}
    </div>
  );

  // Update serverErrors when we receive a serverError from the parent
  useEffect(() => {
    if (serverError) {
      setServerErrors(prev => ({
        ...prev,
        apiError: serverError
      }));
    } else {
      // Clear the API error when serverError is null
      setServerErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.apiError;
        return newErrors;
      });
    }
  }, [serverError]);

  return (
    <div className="bg-white rounded-lg shadow-md mx-auto">
      {(getVisibleErrorCount() > 0 || serverError) && (
        <div className="p-3 border-b">
          <ValidationMessage 
            errors={{
              ...Object.entries(form.formState.errors).reduce(
                (acc, [key, error]) => ({
                  ...acc,
                  [key]: getErrorMessage(key, error)
                }), 
                {}
              ),
              ...serverErrors,
              ...(serverError ? { apiError: serverError } : {})
            }}
            variant="prominent"
          />
        </div>
      )}
      
      <div className="md:hidden p-3 border-b">
        <Button 
          variant="outline" 
          className="w-full text-sm h-9" 
          onClick={toggleWorkloadPanel}
        >
          {showWorkloadPanel ? t("binding.hideWorkload") : t("binding.showWorkload")}
        </Button>
      </div>
      
      <Form {...form}>
        <form 
          onSubmit={(e) => {
            // Always prevent default form submission
            e.preventDefault();
            
            // Only handle navigation between steps here, never submit
            if(formStep !== "rules") {
              goToNextStep();
            }
          }} 
          className="flex flex-col md:flex-row max-h-[80vh] overflow-auto w-full">
          <div className={`p-4 w-full ${showWorkloadPanel ? 'hidden' : 'block'} md:block md:w-1/2 bg-white`}>
            <div className="flex flex-col h-full">
              <div className="flex-none">
                {renderStepIndicator()}
                <h3 className="text-lg font-semibold mb-4 text-center">{getStepTitle()}</h3>
              </div>
              
              <div className="flex-grow overflow-auto">
                {formStep === "basic" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="teacherUuid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium flex items-center">
                              <User className="mr-2 h-4 w-4 text-blue-600" />
                              {t("binding.form.teacher")}
                            </FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.clearErrors('teacherUuid');
                                setServerErrors({});
                                onClearServerError?.();
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder={t("binding.placeholder.selectTeacher")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper" className="z-[9999]">
                                <ScrollArea className="h-40 md:h-48">
                                  {teachers.length > 0 ? (
                                    teachers.map(teacher => (
                                      <SelectItem 
                                        key={teacher.uuid} 
                                        value={teacher.uuid}
                                      >
                                        {teacher.firstName + " " + teacher.lastName}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem 
                                      disabled 
                                      value="no-results"
                                    >
                                      {t("teacher.noTeachersFound")}
                                    </SelectItem>
                                  )}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subjectUuid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium flex items-center">
                              <Book className="mr-2 h-4 w-4 text-green-600" />
                              {t("binding.form.subject")}
                            </FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.clearErrors('subjectUuid');
                                clearAllErrors();
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder={t("binding.placeholder.selectSubject")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper" className="z-[9999]">
                                <ScrollArea className="h-40 md:h-48">
                                  {subjects.length > 0 ? (
                                    subjects.map(subject => (
                                      <SelectItem 
                                        key={subject.uuid} 
                                        value={subject.uuid}
                                      >
                                        {subject.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem disabled value="no-results">
                                      {t("subject.noSubjectsFound")}
                                    </SelectItem>
                                  )}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="classUuid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium flex items-center">
                              <School className="mr-2 h-4 w-4 text-purple-600" />
                              {t("binding.form.class")}
                            </FormLabel>
                            <Select 
                              value={field.value || "none"} 
                              onValueChange={(value) => {
                                field.onChange(value === "none" ? "" : value);
                                if(value !== "none") {
                                  form.setValue("classBandUuid", "", { shouldValidate: true });
                                  form.clearErrors('classUuid');
                                  clearAllErrors();
                                }
                              }}
                              disabled={!!form.watch("classBandUuid")}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder={t("binding.placeholder.selectClass")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper" className="z-[9999]">
                                <ScrollArea className="h-40 md:h-48">
                                  <SelectItem value="none">{t("common.none") || "None"}</SelectItem>
                                  {classes.length > 0 ? (
                                    classes.map(cls => (
                                      <SelectItem 
                                        key={cls.uuid} 
                                        value={cls.uuid}
                                      >
                                        {cls.name}
                                        {cls.section && ` (${cls.section})`}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem disabled value="no-results">
                                      {t("class.noClassesFound")}
                                    </SelectItem>
                                  )}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              {t("binding.selectOneOf")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="classBandUuid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium flex items-center">
                              <School className="mr-2 h-4 w-4 text-indigo-600" />
                              {t("binding.form.classband")}
                            </FormLabel>
                            <Select 
                              value={field.value || "none"} 
                              onValueChange={(value) => {
                                field.onChange(value === "none" ? "" : value);
                                if(value !== "none") {
                                  form.setValue("classUuid", "", { shouldValidate: true });
                                  form.clearErrors('classBandUuid');
                                  clearAllErrors();
                                }
                              }}
                              disabled={!!form.watch("classUuid")}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder={t("binding.placeholder.selectClassBand")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper" className="z-[9999]">
                                <ScrollArea className="h-40 md:h-48">
                                  <SelectItem value="none">{t("common.none") || "None"}</SelectItem>
                                  {classBands.length > 0 ? (
                                    classBands.map(classBand => (
                                      <SelectItem 
                                        key={classBand.uuid} 
                                        value={classBand.uuid}
                                      >
                                        {classBand.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem disabled value="no-results">
                                      {t("classBand.noClassBands")}
                                    </SelectItem>
                                  )}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-xs">
                              {t("binding.selectOneOf")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.formState.errors.classUuid && !form.watch("classBandUuid") && (
                        <div className="text-red-500 text-xs col-span-2 mt-1">
                          {getErrorMessage("classUuid", form.formState.errors.classUuid)}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="roomUuid"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium flex items-center">
                              <Home className="mr-2 h-4 w-4 text-orange-600" />
                              {t("binding.form.room")}
                            </FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.clearErrors('roomUuid');
                                clearAllErrors();
                              }}
                            >
                              <FormControl>
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder={t("binding.placeholder.selectRoom")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper" className="z-[9999]">
                                <ScrollArea className="h-40 md:h-48">
                                  {roomOptions.length > 0 ? (
                                    roomOptions.map(room => (
                                      <SelectItem 
                                        key={room.uuid} 
                                        value={room.uuid}
                                      >
                                        {room.name}
                                        {room.capacity && ` (${t("room.capacity")}: ${room.capacity})`}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem disabled value="no-results">
                                      {t("room.list.noRooms")}
                                    </SelectItem>
                                  )}
                                </ScrollArea>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="periodsPerWeek"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-medium flex items-center">
                              <ClipboardList className="mr-2 h-4 w-4 text-blue-600" />
                              {t("binding.form.periodsPerWeek")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("binding.placeholder.enterPeriodsPerWeek")}
                                {...field}
                                type="number"
                                min={1}
                                max={20}
                                onChange={(e) => {
                                  // Validate max periods from selected plan settings if available
                                  const maxPeriods = 20; // Default max
                                  const planSetting = planSettingsList.find(ps => ps.id === selectedPlanSettingsId);
                                  const plannedPeriods = planSetting ? (planSetting.periodsPerDay * planSetting.daysPerWeek) : maxPeriods;
                                  
                                  const value = Math.min(Math.max(1, parseInt(e.target.value) || 1), plannedPeriods);
                                  field.onChange(value);
                                  form.clearErrors('periodsPerWeek');
                                  clearAllErrors();
                                }}
                              />
                            </FormControl>
                            <FormDescription>
                              {t("binding.help.periodsPerWeek")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Plan Settings Selection */}
                    <FormField
                      control={form.control}
                      name="planSettingsId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-purple-600" />
                            {t("binding.form.planSettings", { defaultValue: "Plan Settings" })}
                          </FormLabel>
                          <Select
                            value={field.value?.toString() || selectedPlanSettingsId?.toString() || ""}
                            onValueChange={(value) => {
                              field.onChange(value ? parseInt(value) : undefined);
                              form.clearErrors('planSettingsId');
                              clearAllErrors();
                            }}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder={t("binding.placeholder.selectPlanSettings", { defaultValue: "Select Plan Settings" })} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {planSettingsList.map((ps) => (
                                <SelectItem key={ps.id} value={ps.id.toString()}>
                                  {ps.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {t("binding.help.planSettings", { defaultValue: "Select a plan setting to define time periods" })}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {formStep === "fixed" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Regular priority input without FormField */}
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          {t("binding.form.priority")}
                        </FormLabel>
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            className="h-9"
                            value={0}
                            onChange={() => {}}
                            disabled={true}
                          />
                        </div>
                        <FormDescription className="text-xs">
                          {t("binding.description.priority")}
                        </FormDescription>
                      </FormItem>

                      <FormField
                        control={form.control}
                        name="isFixed"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-base font-medium mb-1">
                              {t("binding.form.fixedAssignment")}
                            </FormLabel>
                            <div className="flex items-center h-9 space-x-3 bg-white p-2 rounded-md border">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={(checked) => {
                                    field.onChange(checked);
                                    clearAllErrors();
                                  }}
                                  className="h-4 w-4 rounded border-gray-300"
                                />
                              </FormControl>
                              <label className="text-sm font-medium cursor-pointer">
                                {t("binding.form.isFixed")}
                              </label>
                            </div>
                            <FormDescription className="text-xs mt-1">
                              {t("binding.description.isFixed")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            {t("binding.form.notes")}
                          </FormLabel>
                          <FormControl>
                            <textarea
                              className="w-full min-h-[80px] text-base border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={t("binding.placeholder.enterNotes")}
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);
                                clearAllErrors();
                              }}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            {t("binding.description.notes")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {formStep === "rules" && (
                  <div className="space-y-4 min-h-[300px]">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h3 className="text-sm font-medium text-blue-800 mb-1">
                            {t("binding.rules.aboutTitle")}
                          </h3>
                          <p className="text-xs text-blue-700">
                            {t("binding.rules.aboutDescription")}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="ruleUuids"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium">
                            {t("binding.form.rules")}
                          </FormLabel>
                          {rules.length > 0 ? (
                            <div className="bg-white border rounded-lg overflow-hidden">
                              <div className="p-2 bg-gray-50 border-b">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium text-xs">
                                    {t("binding.rules.selected")}: {field.value?.length || 0} / {rules.length}
                                  </span>
                                  {field.value?.length > 0 && (
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => field.onChange([])}
                                      className="text-xs h-6 px-2"
                                    >
                                      {t("binding.rules.clearAll")}
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <ScrollArea className="h-[180px]">
                                <div className="divide-y">
                                  {rules.map(rule => (
                                    <div 
                                      key={rule.uuid} 
                                      className={`p-2 hover:bg-gray-50 transition-colors ${
                                        field.value?.includes(rule.uuid) ? 'bg-blue-50' : ''
                                      }`}
                                    >
                                      <div className="flex items-start space-x-3">
                                        <FormControl>
                                          <Checkbox
                                            id={`rule-${rule.uuid}`}
                                            checked={field.value?.includes(rule.uuid)}
                                            className="h-4 w-4 mt-0.5 rounded border-gray-300"
                                            onCheckedChange={(checked) => {
                                              if(checked) {
                                                if(!field.value?.includes(rule.uuid)) {
                                                  field.onChange([...(field.value || []), rule.uuid]);
                                                }
                                              }else {
                                                field.onChange(field.value?.filter(id => id !== rule.uuid) || []);
                                              }
                                              clearAllErrors();
                                            }}
                                          />
                                        </FormControl>
                                        <div>
                                          <label 
                                            htmlFor={`rule-${rule.uuid}`}
                                            className="text-sm font-medium cursor-pointer block text-gray-800"
                                          >
                                            {rule.name}
                                          </label>
                                          {rule.description && (
                                            <p className="text-xs text-gray-600 mt-1">
                                              {rule.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            </div>
                          ) : (
                            <div className="py-6 px-4 text-center bg-gray-50 border rounded-md">
                              <p className="text-gray-500 text-sm">
                                {t("binding.rules.noRulesAvailable")}
                              </p>
                            </div>
                          )}
                          <FormDescription className="text-xs">
                            {t("binding.rules.selectionHelp")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-3 border-t flex justify-between flex-none">
                {formStep !== "basic" ? (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={goToPreviousStep}
                    className="min-w-[90px] h-8 text-sm"
                  >
                    {t("common.back")}
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                    className="min-w-[90px] h-8 text-sm"
                  >
                    {t("common.cancel")}
                  </Button>
                )}
                
                {formStep !== "rules" ? (
                  <Button 
                    type="button" 
                    onClick={goToNextStep}
                    disabled={hasStepErrors() || isLoading || Object.keys(serverErrors).length > 0}
                    className="min-w-[90px] h-8 text-sm"
                  >
                    {t("common.next")}
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                ) : (
                  <Button 
                    type="button"
                    onClick={handleFinalSubmit}
                    disabled={isLoading || hasStepErrors() || Object.keys(serverErrors).length > 0}
                    className="min-w-[90px] h-8 text-sm"
                  >
                    {isLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    {isEditing ? t("common.update") : t("common.create")}
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className={`w-full ${!showWorkloadPanel ? 'hidden' : 'block'} md:block md:w-1/2 bg-gray-50 max-h-[80vh] overflow-auto`}>
            <div className="p-3">
              <div className="flex justify-between items-center mb-3 border-b pb-2">
                <h3 className="text-md font-semibold">{t("binding.workload.title")}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={toggleWorkloadPanel}
                >
                  {t("common.back")}
                </Button>
              </div>
              
              {getVisibleErrorCount() > 0 && (
                <div className="mb-3">
                  <div className="text-red-500 text-sm font-medium flex items-center p-2 bg-red-50 rounded border border-red-200 mb-3">
                    <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{t("binding.validation.fixErrorsBeforeContinuing")}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white border rounded-md shadow-sm p-3">
                  <h4 className="text-xs font-medium mb-2 text-blue-700 border-b pb-1">
                    {t("binding.workload.status")}
                  </h4>
                  
                  {(selectedTeacher || selectedRoom || selectedClass || selectedClassBand) ? (
                    <ScrollArea className="h-[300px]">
                      <WorkloadDisplay 
                        selectedTeacher={selectedTeacher}
                        selectedRoom={selectedRoom}
                        selectedClass={selectedClass}
                        selectedClassBand={selectedClassBand}
                        periodsPerWeek={form.watch("periodsPerWeek") || 0}
                        organizationId={organizationId}
                        totalAvailableSchedules={
                          selectedPlanSettingsId && planSettingsList
                            ? planSettingsList.find(ps => ps.id === selectedPlanSettingsId)
                              ? planSettingsList.find(ps => ps.id === selectedPlanSettingsId)!.periodsPerDay * 
                                planSettingsList.find(ps => ps.id === selectedPlanSettingsId)!.daysPerWeek
                              : 40
                            : 40
                        }
                        isEditing={isEditing}
                        existingPeriodsPerWeek={initialData?.periodsPerWeek || 0}
                        planSettingsId={selectedPlanSettingsId}
                      />
                    </ScrollArea>
                  ) : (
                    <div className="text-gray-500 text-xs py-3 italic">
                      {t("binding.workload.selectResources")}
                    </div>
                  )}
                </div>
                
                <div className="bg-white border rounded-md shadow-sm p-3">
                  <h4 className="text-xs font-medium mb-2 text-blue-700 border-b pb-1">
                    {t("binding.currentSelection")}
                  </h4>
                  
                  {(selectedTeacher || selectedSubject || selectedClass || selectedClassBand || selectedRoom) ? (
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {selectedTeacher && (
                          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border text-xs">
                            <User className="h-3 w-3 text-blue-600" />
                            <span className="truncate">
                              {selectedTeacher.firstName} {selectedTeacher.lastName}
                            </span>
                          </div>
                        )}
                        
                        {selectedSubject && (
                          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border text-xs">
                            <Book className="h-3 w-3 text-green-600" />
                            <span className="truncate">{selectedSubject.name}</span>
                          </div>
                        )}
                        
                        {selectedClass && (
                          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border text-xs">
                            <School className="h-3 w-3 text-purple-600" />
                            <span className="truncate">{selectedClass.name}</span>
                          </div>
                        )}
                        
                        {selectedClassBand && (
                          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border text-xs">
                            <School className="h-3 w-3 text-indigo-600" />
                            <span className="truncate">{selectedClassBand.name}</span>
                          </div>
                        )}
                        
                        {selectedRoom && (
                          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border text-xs">
                            <Home className="h-3 w-3 text-orange-600" />
                            <span className="truncate">{selectedRoom.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border text-xs">
                          <span className="font-medium">{t("binding.form.periodsPerWeek")}:</span>
                          <span>{form.watch("periodsPerWeek") || 0}</span>
                        </div>
                        
                        {(formStep === "fixed" || formStep === "rules") && (
                          <>
                            <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border text-xs">
                              <span className="font-medium">{t("binding.form.isFixed")}:</span>
                              <span>{form.watch("isFixed") ? t("common.yes") : t("common.no")}</span>
                            </div>
                          </>
                        )}
                        
                        {formStep === "rules" && (
                          <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border text-xs">
                            <span className="font-medium">{t("binding.form.rules")}:</span>
                            <span>{(form.watch("ruleUuids")?.length || 0) > 0 ? 
                              `${form.watch("ruleUuids")?.length} ${t("binding.rules.selected")}` : 
                              t("binding.rules.none")}
                            </span>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-gray-500 text-xs py-3 italic">
                      {t("binding.noSelection")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BindingForm;
