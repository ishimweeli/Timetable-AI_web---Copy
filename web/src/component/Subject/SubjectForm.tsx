import React, { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/component/Ui/input";
import { Label } from "@/component/Ui/label";
import { Button } from "@/component/Ui/button";
import { Textarea } from "@/component/Ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/component/Ui/radio-group";
import { Checkbox } from "@/component/Ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { cn } from "@/util/util";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/component/Ui/form";
import {
  Ban,
  Check,
  CircleCheck,
  FileBox,
  Link,
  Trash2,
  Loader2,
  CheckCheck,
  X
} from "lucide-react";
import { Subject, SubjectFormData } from "@/type/subject";
import { useTranslation } from "react-i18next";
import { useToast } from "@/component/Ui/use-toast";
import { useSubjects } from "@/hook/subject/useSubjects";
import {
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/services/subject/subjectService";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/component/Ui/alert-dialog";
import axios from "axios";
import { useI18n } from "@/hook/useI18n";

// Helper function to get authentication headers
const getAuthHeaders = () => {
  const authToken = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Authorization: authToken ? `${authToken}` : "",
  };
};

// Mock subjects for conflict selection
const MOCK_SUBJECTS = [
  { id: "MTH", name: "Mathematics", initials: "MTH" },
  { id: "PHY", name: "Physics", initials: "PHY" },
  { id: "ENG", name: "English", initials: "ENG" },
  { id: "CHE", name: "Chemistry", initials: "CHE" },
  { id: "BIO", name: "Biology", initials: "BIO" },
  { id: "HIS", name: "History", initials: "HIS" },
  { id: "GEO", name: "Geography", initials: "GEO" },
  { id: "ART", name: "Art", initials: "ART" },
  { id: "MUS", name: "Music", initials: "MUS" },
];

// Subject groups
const SUBJECT_GROUPS = [
  { id: "normal", name: "Normal" },
  { id: "science", name: "Science" },
  { id: "languages", name: "Languages" },
  { id: "humanities", name: "Humanities" },
  { id: "arts", name: "Arts" },
  { id: "physical", name: "Physical Education" },
];

// Define the form schema with Zod
const formSchema = z.object({
  uuid: z.string().optional(),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  initials: z
    .string()
    .min(1, { message: "Initials are required" })
    .max(10, { message: "Initials must be less than 10 characters" }),
  description: z.string().optional(),
  durationInMinutes: z.coerce
    .number()
    .min(1, { message: "Duration must be at least 1 minute" }),
  repetitionType: z.enum(["red", "blue"]),
  conflictSubjectId: z.number().optional(),
  group: z.string(),
  autoConflictHandling: z.boolean().default(false),
  organizationId: z.number().min(1, { message: "Organization is required" }),
  statusId: z.number().min(0, { message: "Status is required" }),
  color: z.string().min(1, { message: "Color is required" }),
});

type SubjectFormValues = z.infer<typeof formSchema>;

interface SubjectFormProps {
  initialData?: SubjectFormData;
  onSave: (data: SubjectFormData) => void;
  onCancel: () => void;
  onDelete?: (uuid: string) => void;
  isLoading: boolean;
  isDeleting?: boolean;
  subjects?: Subject[];
  onRefresh?: () => void;
}

const SubjectForm: React.FC<SubjectFormProps> = ({
  initialData,
  onSave,
  onCancel,
  onDelete,
  isLoading,
  isDeleting: isParentDeleting = false,
  subjects = [],
  onRefresh,
}) => {
  const { toast } = useToast();
  const { subjects: subjectsData, isLoadingSubjects } = useSubjects();
  const { t } = useI18n();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingLocal, setIsDeletingLocal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const previousInitialDataRef = useRef<SubjectFormData | undefined>(undefined);
  const subjectUuidRef = useRef<string | null>(null);
  const [repetitionType, setRepetitionType] = useState<"red" | "blue">("red");
  const [fetchedSubject, setFetchedSubject] = useState<any>(null);
  const [subjectUuid, setSubjectUuid] = useState<string | null>(
    initialData?.uuid || null,
  );
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [deletionComplete, setDeletionComplete] = useState(false);
  const [subjectDataLoaded, setSubjectDataLoaded] = useState(false);

  console.log("FULL INITIAL DATA:", initialData);

  // Set default values for new subjects
  const defaultValues: SubjectFormData = {
    initials: "",
    name: "",
    description: "",
    durationInMinutes: 60,
    repetitionType: "red", // Default to red repetition
    group: "Normal",
    autoConflictHandling: true, // Default to enabled
    conflictSubjectId: 0,
    organizationId: 1,
    statusId: 1,
    color: "#6E56CF", // Default color
  };

  // Set repetition type based on red/blue values
  const getRepetitionType = (red?: boolean, blue?: boolean) => {
    console.log("Getting repetition type from:", { red, blue });
    if(blue === true) {
      console.log("Setting to BLUE repetition");
      return "blue";
    }
    console.log("Setting to RED repetition");
    return "red";
  };

  const form = useForm<SubjectFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uuid: initialData?.uuid || "",
      name: initialData?.name || "",
      initials: initialData?.initials || "",
      description: initialData?.description || "",
      durationInMinutes: initialData?.durationInMinutes || 60,
      repetitionType: initialData?.repetitionType || "red",
      conflictSubjectId: initialData?.conflictSubjectId || 0,
      group: initialData?.group || "normal",
      autoConflictHandling: initialData?.autoConflictHandling || false,
      organizationId: initialData?.organizationId || 1,
      statusId: initialData?.statusId || 1,
      color: initialData?.color || "#6E56CF", // Default purple color if none provided
    },
    shouldUnregister: false,
  });

  // Prevent browser's default unsaved changes alert
  useEffect(() => {
    const disableBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", disableBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", disableBeforeUnload);
    };
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if(initialData) {
      console.log("Setting form data from initialData:", initialData.uuid);
      setSubjectUuid(initialData.uuid || null);
      form.reset({
        uuid: initialData.uuid,
        name: initialData.name || "",
        initials: initialData.initials || "",
        description: initialData.description || "",
        durationInMinutes: initialData.durationInMinutes || 60,
        repetitionType: getRepetitionType(
          initialData.redRepetition,
          initialData.blueRepetition,
        ),
        autoConflictHandling: initialData.autoConflictHandling ?? true,
        conflictSubjectId: initialData.conflictSubjectId || 0,
        organizationId: initialData.organizationId || 1,
        statusId: initialData.statusId || 1,
        group: initialData.group || "Normal",
        color: initialData.color || "#6E56CF",
      });
    } else if(!isFirstRender.current) {
      console.log("Resetting form for new subject (initialData is undefined)");
      setSubjectUuid(null);
      form.reset(defaultValues);
    }
    isFirstRender.current = false;
  }, [initialData, form]);

  useEffect(() => {
    if(initialData) {
      console.log("DETAILED INITIAL DATA:", {
        uuid: initialData.uuid,
        name: initialData.name,
        redRepetition: initialData.redRepetition,
        blueRepetition: initialData.blueRepetition,
      });

      let repetitionValue = "red";
      if(initialData.blueRepetition === true) {
        repetitionValue = "blue";
        console.log("🔵 Setting BLUE repetition for:", initialData.name);
      } else if(initialData.redRepetition === true) {
        repetitionValue = "red";
        console.log("🔴 Setting RED repetition for:", initialData.name);
      }

      form.setValue("repetitionType", repetitionValue, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      console.log(
        "Current form values after setting repetition:",
        form.getValues(),
      );
    }
  }, [initialData, form]);

  useEffect(() => {
    if(subjects && subjects.length > 0 && initialData && initialData.name) {
      console.log("Searching for subject in subjects list:", initialData.name);
      const foundSubject = subjects.find(
        (s) =>
          s.name === initialData.name ||
          (s.name && s.name.toLowerCase() === initialData.name.toLowerCase()),
      );

      if(foundSubject) {
        console.log("Found subject in subjects list:", foundSubject);
        console.log("Subject repetition type:", foundSubject.repetitionType);
        const updatedInitialData = {
          ...initialData,
          uuid: foundSubject.uuid,
          repetitionType: foundSubject.repetitionType,
          redRepetition: foundSubject.redRepetition,
          blueRepetition: foundSubject.blueRepetition,
        };
        console.log("Updating initialData with:", updatedInitialData);
        form.setValue("uuid", foundSubject.uuid);
        if(foundSubject.repetitionType) {
          console.log(
            "Setting repetition type to:",
            foundSubject.repetitionType,
          );
          setRepetitionType(foundSubject.repetitionType);
          form.setValue("repetitionType", foundSubject.repetitionType);
        } else if(foundSubject.blueRepetition === true) {
          console.log("Setting BLUE repetition based on blueRepetition flag");
          setRepetitionType("blue");
          form.setValue("repetitionType", "blue");
        }else {
          console.log("Setting RED repetition as default");
          setRepetitionType("red");
          form.setValue("repetitionType", "red");
        }
      }
    }
  }, [subjects, initialData?.name, form]);

  useEffect(() => {
    if(initialData) {
      console.log("Setting repetition type from initialData");
      if(initialData.repetitionType === "blue") {
        console.log(
          "Setting to BLUE repetition from initialData.repetitionType",
        );
        setRepetitionType("blue");
        form.setValue("repetitionType", "blue");
      } else if(initialData.blueRepetition === true) {
        console.log(
          "Setting to BLUE repetition from initialData.blueRepetition",
        );
        setRepetitionType("blue");
        form.setValue("repetitionType", "blue");
      }else {
        console.log("Setting to RED repetition as default");
        setRepetitionType("red");
        form.setValue("repetitionType", "red");
      }
    }
  }, [initialData, form]);

  useEffect(() => {
    if(initialData) {
      console.log("Initial data received:", initialData);
      if(initialData.uuid) {
        console.log("Using UUID from initialData:", initialData.uuid);
        setSelectedSubject(initialData);
        setSubjectUuid(initialData.uuid);
        return;
      }
      if(initialData.name && subjects && subjects.length > 0) {
        const foundSubject = subjects.find(
          (s) =>
            s.name === initialData.name ||
            (s.name && s.name.toLowerCase() === initialData.name.toLowerCase()),
        );
        if(foundSubject) {
          console.log("Found subject in subjects list:", foundSubject);
          setSelectedSubject(foundSubject);
          setSubjectUuid(foundSubject.uuid);
          form.reset({
            ...foundSubject,
            repetitionType:
              foundSubject.repetitionType ||
              (foundSubject.blueRepetition ? "blue" : "red"),
          });
        }
      }
    }
  }, [initialData, subjects, form]);

  // Function to fetch a subject by UUID with auth headers
  const fetchSubjectByUuid = async (uuid: string) => {
    if(!uuid) return null;
    try {
      console.log("Fetching subject by UUID:", uuid);
      const response = await axios.get(`/api/v1/subjects/${uuid}`, {
        headers: getAuthHeaders(),
      });
      if(response.data && response.data.data) {
        console.log("Fetched subject data:", response.data.data);
        return response.data.data;
      }
    }catch(error) {
      console.error("Error fetching subject by UUID:", error);
    }
    return null;
  };

  useEffect(() => {
    const handleSubjectSelection = (event: CustomEvent) => {
      if(event.detail && event.detail.subject) {
        console.log("Subject selection event received:", event.detail.subject);
        setSelectedSubject(event.detail.subject);
        setSubjectUuid(event.detail.subject.uuid);
        form.reset({
          ...event.detail.subject,
          repetitionType:
            event.detail.subject.repetitionType ||
            (event.detail.subject.blueRepetition ? "blue" : "red"),
        });
      }
    };
    window.addEventListener(
      "subjectSelected",
      handleSubjectSelection as EventListener,
    );
    return () => {
      window.removeEventListener(
        "subjectSelected",
        handleSubjectSelection as EventListener,
      );
    };
  }, [form]);

  const onSubmit = async (data: SubjectFormData) => {
    console.log("Form submitted with data:", data);
    setIsSubmitting(true);
    try {
      const formValues = form.getValues();
      console.log("Current form values:", formValues);
      const subjectUuid = selectedSubject?.uuid || formValues.uuid;
      if(subjectUuid) {
        console.log(`Using UUID for update: ${subjectUuid}`);
        const isBlueRepetition = formValues.repetitionType === "blue";
        const isRedRepetition = formValues.repetitionType === "red";
        console.log(
          `Setting repetition: blue=${isBlueRepetition}, red=${isRedRepetition}`,
        );
        const completeData: SubjectFormData = {
          ...formValues,
          uuid: subjectUuid,
          redRepetition: isRedRepetition,
          blueRepetition: isBlueRepetition,
          color: data.color,
        };
        console.log("Complete data for update:", completeData);
        await onSave(completeData);
      }else {
        const isBlueRepetition = formValues.repetitionType === "blue";
        const isRedRepetition = formValues.repetitionType === "red";
        const newSubjectData: SubjectFormData = {
          ...formValues,
          redRepetition: isRedRepetition,
          blueRepetition: isBlueRepetition,
          color: data.color,
        };
        console.log("Data for new subject:", newSubjectData);
        await onSave(newSubjectData);
      }
    }catch(error) {
      console.error("Error submitting subject form:", error);
      toast({
        title: t("error"),
        description: t("subject.errorSubmitting"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("Subjects data:", subjectsData);
  }, [subjectsData]);

  const validSubjects = subjects.filter(
    (subject) => subject && subject.uuid !== undefined,
  );

  const extractUuidFromSubjectList = () => {
    console.log("Extracting UUID from subject list");
    console.log("Raw subjects data:", subjects);
    if(subjects && subjects.length > 0 && initialData?.name) {
      const subject = subjects.find((s) => s.name === initialData.name);
      if(subject?.uuid) {
        console.log("Found UUID in subjects list:", subject.uuid);
        subjectUuidRef.current = subject.uuid;
        return subject.uuid;
      }
      const subjectCaseInsensitive = subjects.find(
        (s) => s.name.toLowerCase() === initialData.name.toLowerCase(),
      );
      if(subjectCaseInsensitive?.uuid) {
        console.log(
          "Found UUID with case-insensitive match:",
          subjectCaseInsensitive.uuid,
        );
        subjectUuidRef.current = subjectCaseInsensitive.uuid;
        return subjectCaseInsensitive.uuid;
      }
    }
    return null;
  };

  const findSubjectUuidByName = (
    subjectName: string,
    subjectsList: any[],
  ): string | null => {
    console.log("Finding UUID for subject by name:", subjectName);
    console.log("Available subjects:", subjectsList);
    if(!subjectName || !subjectsList || subjectsList.length === 0) {
      console.log("No subjects available to search");
      return null;
    }
    const exactMatch = subjectsList.find((s) => s.name === subjectName);
    if(exactMatch && exactMatch.uuid) {
      console.log(
        "Found UUID by exact match:",
        exactMatch.uuid,
        "for subject:",
        subjectName,
      );
      return exactMatch.uuid;
    }
    const caseInsensitiveMatch = subjectsList.find(
      (s) => s.name && s.name.toLowerCase() === subjectName.toLowerCase(),
    );
    if(caseInsensitiveMatch && caseInsensitiveMatch.uuid) {
      console.log(
        "Found UUID by case-insensitive match:",
        caseInsensitiveMatch.uuid,
        "for subject:",
        subjectName,
      );
      return caseInsensitiveMatch.uuid;
    }
    console.log("Could not find UUID for subject:", subjectName);
    return null;
  };

  useEffect(() => {
    if(
      subjects &&
      subjects.length > 0 &&
      initialData &&
      initialData.name &&
      !initialData.uuid
    ) {
      console.log("Attempting to find UUID for initialData from subjects list");
      const uuid = findSubjectUuidByName(initialData.name, subjects);
      if(uuid) {
        console.log("Found UUID for initialData:", uuid);
        // Update the initialData with the UUID (if needed)
        form.setValue("uuid", uuid);
      }
    }
  }, [subjects, initialData?.name]);

  const deleteUuidRef = useRef<string | null>(null);

  const extractUuidFromApiResponse = (response: any) => {
    if(response && response.data && response.data.data) {
      const data = response.data.data;
      if(initialData && initialData.name && data.name === initialData.name) {
        console.log(
          "Found matching subject in API response with UUID:",
          data.uuid,
        );
        deleteUuidRef.current = data.uuid;
        return data.uuid;
      }
    }
    return null;
  };

  // Add an Axios response interceptor to capture UUIDs (auth headers are not needed for response interceptors)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => {
        if(response.config.url && response.config.url.includes("/subjects/")) {
          console.log("Intercepted subject API response:", response.config.url);
          extractUuidFromApiResponse(response);
        }
        return response;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [initialData]);

  useEffect(() => {
    const fetchSubjectUuid = async () => {
      if(initialData && initialData.name && !deleteUuidRef.current) {
        try {
          console.log(
            "Fetching all subjects to find UUID for:",
            initialData.name,
          );
          const response = await axios.get("/api/v1/subjects?page=0&size=100", {
            headers: getAuthHeaders(),
          });
          if(
            response.data &&
            response.data.data &&
            Array.isArray(response.data.data.content)
          ) {
            const subjects = response.data.data.content;
            const foundSubject = subjects.find(
              (s: any) =>
                s.name === initialData.name ||
                (s.name &&
                  s.name.toLowerCase() === initialData.name.toLowerCase()),
            );
            if(foundSubject && foundSubject.uuid) {
              console.log("Found UUID for subject:", foundSubject.uuid);
              deleteUuidRef.current = foundSubject.uuid;
            }
          }
        }catch(error) {
          console.error("Error fetching subjects:", error);
        }
      }
    };
    fetchSubjectUuid();
  }, [initialData]);

  const getSubjectUuidForDeletion = async (
    subjectName: string,
  ): Promise<string | null> => {
    if(deleteUuidRef.current) {
      console.log("Using cached UUID for deletion:", deleteUuidRef.current);
      return deleteUuidRef.current;
    }
    if(subjects && subjects.length > 0) {
      const foundSubject = subjects.find(
        (s) =>
          s.name === subjectName ||
          (s.name && s.name.toLowerCase() === subjectName.toLowerCase()),
      );
      if(foundSubject && foundSubject.uuid) {
        console.log("Found UUID in subjects list:", foundSubject.uuid);
        deleteUuidRef.current = foundSubject.uuid;
        return foundSubject.uuid;
      }
    }
    try {
      console.log("Making direct API call to find UUID for:", subjectName);
      const response = await axios.get(`/api/v1/subjects?page=0&size=100`, {
        headers: getAuthHeaders(),
      });
      if(
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data.content)
      ) {
        const allSubjects = response.data.data.content;
        const foundSubject = allSubjects.find(
          (s: any) =>
            s.name === subjectName ||
            (s.name && s.name.toLowerCase() === subjectName.toLowerCase()),
        );
        if(foundSubject && foundSubject.uuid) {
          console.log("Found UUID via API call:", foundSubject.uuid);
          deleteUuidRef.current = foundSubject.uuid;
          return foundSubject.uuid;
        }
      }
    }catch(error) {
      console.error("Error finding UUID via API:", error);
    }
    console.error("Could not find UUID for subject:", subjectName);
    return null;
  };

  const fetchUuidBySubjectName = async (
    subjectName: string,
  ): Promise<string | null> => {
    if(!subjectName) return null;
    try {
      console.log("Directly fetching UUID for subject name:", subjectName);
      if(subjects && subjects.length > 0) {
        const foundSubject = subjects.find(
          (s) =>
            s.name === subjectName ||
            (s.name && s.name.toLowerCase() === subjectName.toLowerCase()),
        );
        if(foundSubject && foundSubject.uuid) {
          console.log("Found UUID in subjects list:", foundSubject.uuid);
          return foundSubject.uuid;
        }
      }
      console.log("Making API call to get all subjects");
      const response = await axios.get("/api/v1/subjects?page=0&size=100", {
        headers: getAuthHeaders(),
      });
      if(response.data && response.data.data && response.data.data.content) {
        const allSubjects = response.data.data.content;
        console.log("Received all subjects:", allSubjects);
        const foundSubject = allSubjects.find(
          (s: any) =>
            s.name === subjectName ||
            (s.name && s.name.toLowerCase() === subjectName.toLowerCase()),
        );
        if(foundSubject && foundSubject.uuid) {
          console.log("Found UUID in API response:", foundSubject.uuid);
          return foundSubject.uuid;
        }
      }
    }catch(error) {
      console.error("Error fetching UUID by subject name:", error);
    }
    return null;
  };

  const extractUuidFromLogs = () => {
    console.log("Attempting to extract UUID from console logs...");
    // This approach is not reliable, return null
    return null;
  };

  if(!(window as any).capturedUuids) {
    (window as any).capturedUuids = {};
  }

  const originalConsoleLog = console.log;
  console.log = function (...args) {
    originalConsoleLog.apply(console, args);
    const logStr = args.join(" ");
    if(logStr.includes("UUID:") || logStr.includes("uuid:")) {
      const uuidMatch = logStr.match(
        /(?:UUID|uuid):\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
      );
      if(uuidMatch && uuidMatch[1] && initialData && initialData.name) {
        const uuid = uuidMatch[1];
        (window as any).capturedUuids[initialData.name] = uuid;
        console.log(`Associated UUID ${uuid} with subject ${initialData.name}`);
      }
    }
  };

  const currentSubjectUuidRef = useRef<string | null>(null);
  const subjectUuidMapRef = useRef<Map<string, string>>(new Map());

  const getSubjectUuidByName = async (name: string) => {
    if(!name) return null;
    if(subjectUuidMapRef.current.has(name)) {
      const uuid = subjectUuidMapRef.current.get(name);
      console.log(`Using cached UUID ${uuid} for subject ${name}`);
      return uuid;
    }
    try {
      console.log("Directly fetching UUID for subject:", name);
      const response = await axios.get("/api/v1/subjects?page=0&size=100", {
        headers: getAuthHeaders(),
      });
      let subjects: any[] = [];
      if(response.data && response.data.content) {
        subjects = response.data.content;
      } else if(
        response.data &&
        response.data.data &&
        response.data.data.content
      ) {
        subjects = response.data.data.content;
      }
      if(subjects.length > 0) {
        for(const subject of subjects) {
          if(subject.name && subject.uuid) {
            subjectUuidMapRef.current.set(subject.name, subject.uuid);
            console.log(
              `Associated UUID ${subject.uuid} with subject ${subject.name}`,
            );
            if(
              subject.name === name ||
              subject.name.toLowerCase() === name.toLowerCase()
            ) {
              console.log(
                `Found matching subject in API response with UUID: ${subject.uuid}`,
              );
            }
          }
        }
        if(subjectUuidMapRef.current.has(name)) {
          return subjectUuidMapRef.current.get(name);
        }
      }
    }catch(error) {
      console.error("Error fetching UUID for subject:", error);
    }
    return null;
  };

  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = function (...args) {
      originalConsoleLog.apply(console, args);
      const logStr = args.join(" ");
      if(logStr.includes("Fetching subject with UUID:")) {
        const uuidMatch = logStr.match(
          /UUID:\s*([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
        );
        if(uuidMatch && uuidMatch[1] && initialData && initialData.name) {
          const uuid = uuidMatch[1];
          currentSubjectUuidRef.current = uuid;
          subjectUuidMapRef.current.set(initialData.name, uuid);
          console.log(
            `Associated UUID ${uuid} with subject ${initialData.name}`,
          );
        }
      }
    };
    return () => {
      console.log = originalConsoleLog;
    };
  }, [initialData]);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const [resource, config] = args;
      const response = await originalFetch.apply(this, args);
      const responseClone = response.clone();
      if(typeof resource === "string" && resource.includes("/subjects/")) {
        try {
          const text = await responseClone.text();
          try {
            const data = JSON.parse(text);
            console.log("Intercepted subject API response:", resource, data);
            if(data && data.data && data.data.uuid && data.data.name) {
              console.log(
                `🔑 Captured UUID ${data.data.uuid} for subject ${data.data.name}`,
              );
              (window as any).capturedUuids[data.data.name] = data.data.uuid;
            } else if(data && data.uuid && data.name) {
              console.log(
                `🔑 Captured UUID ${data.uuid} for subject ${data.name}`,
              );
              (window as any).capturedUuids[data.name] = data.uuid;
            }
            if(data && data.data && Array.isArray(data.data.content)) {
              data.data.content.forEach((subject: any) => {
                if(subject.uuid && subject.name) {
                  console.log(
                    `🔑 Captured UUID ${subject.uuid} for subject ${subject.name}`,
                  );
                  (window as any).capturedUuids[subject.name] = subject.uuid;
                }
              });
            } else if(data && Array.isArray(data.content)) {
              data.content.forEach((subject: any) => {
                if(subject.uuid && subject.name) {
                  console.log(
                    `🔑 Captured UUID ${subject.uuid} for subject ${subject.name}`,
                  );
                  (window as any).capturedUuids[subject.name] = subject.uuid;
                }
              });
            }
          }catch(e) {
            // Not JSON, ignore
          }
        }catch(e) {
          // Ignore errors reading the response
        }
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      this._url = url;
      return originalOpen.apply(this, [method, url, ...rest]);
    };
    XMLHttpRequest.prototype.send = function (...args) {
      this.addEventListener("load", function () {
        if(
          this._url &&
          typeof this._url === "string" &&
          this._url.includes("/subjects/")
        ) {
          try {
            const data = JSON.parse(this.responseText);
            console.log(
              "Intercepted XHR subject API response:",
              this._url,
              data,
            );
            if(data && data.data && data.data.uuid && data.data.name) {
              console.log(
                `🔑 Captured UUID ${data.data.uuid} for subject ${data.data.name}`,
              );
              (window as any).capturedUuids[data.data.name] = data.data.uuid;
            } else if(data && data.uuid && data.name) {
              console.log(
                `🔑 Captured UUID ${data.uuid} for subject ${data.name}`,
              );
              (window as any).capturedUuids[data.name] = data.uuid;
            }
            if(data && data.data && Array.isArray(data.data.content)) {
              data.data.content.forEach((subject: any) => {
                if(subject.uuid && subject.name) {
                  console.log(
                    `🔑 Captured UUID ${subject.uuid} for subject ${subject.name}`,
                  );
                  (window as any).capturedUuids[subject.name] = subject.uuid;
                }
              });
            } else if(data && Array.isArray(data.content)) {
              data.content.forEach((subject: any) => {
                if(subject.uuid && subject.name) {
                  console.log(
                    `🔑 Captured UUID ${subject.uuid} for subject ${subject.name}`,
                  );
                  (window as any).capturedUuids[subject.name] = subject.uuid;
                }
              });
            }
          }catch(e) {
            // Not JSON, ignore
          }
        }
      });
      return originalSend.apply(this, args);
    };
    return () => {
      XMLHttpRequest.prototype.open = originalOpen;
      XMLHttpRequest.prototype.send = originalSend;
    };
  }, []);

  const loadAllSubjects = async () => {
    try {
      console.log("Loading all subjects to build UUID map");
      const response = await axios.get("/api/v1/subjects?page=0&size=1000", {
        headers: getAuthHeaders(),
      });
      let subjects: any[] = [];
      if(response.data && response.data.content) {
        subjects = response.data.content;
      } else if(
        response.data &&
        response.data.data &&
        response.data.data.content
      ) {
        subjects = response.data.data.content;
      } else if(Array.isArray(response.data)) {
        subjects = response.data;
      }
      if(subjects.length > 0) {
        subjects.forEach((subject: any) => {
          if(subject.uuid && subject.name) {
            console.log(
              `📋 Loaded UUID ${subject.uuid} for subject ${subject.name}`,
            );
            (window as any).capturedUuids[subject.name] = subject.uuid;
          }
        });
        setSubjectDataLoaded(true);
      }
    }catch(error) {
      console.error("Error loading subjects:", error);
    }
  };

  useEffect(() => {
    loadAllSubjects();
  }, []);

  useEffect(() => {
    if(
      initialData &&
      initialData.name &&
      !(window as any).capturedUuids[initialData.name]
    ) {
      const loadSubject = async () => {
        try {
          console.log(`Loading specific subject data for ${initialData.name}`);
          if(!subjectDataLoaded) {
            await loadAllSubjects();
          }
          if(!(window as any).capturedUuids[initialData.name]) {
            console.log(
              `Still missing UUID for ${initialData.name}, trying direct search`,
            );
            const response = await axios.get(
              "/api/v1/subjects?page=0&size=1000",
              { headers: getAuthHeaders() },
            );
            let subjects: any[] = [];
            if(response.data && response.data.content) {
              subjects = response.data.content;
            } else if(
              response.data &&
              response.data.data &&
              response.data.data.content
            ) {
              subjects = response.data.data.content;
            } else if(Array.isArray(response.data)) {
              subjects = response.data;
            }
            const foundSubject = subjects.find(
              (s) =>
                s.name === initialData.name ||
                (s.name &&
                  s.name.toLowerCase() === initialData.name.toLowerCase()),
            );
            if(foundSubject && foundSubject.uuid) {
              console.log(
                `🔍 Found UUID ${foundSubject.uuid} for subject ${initialData.name} via direct search`,
              );
              (window as any).capturedUuids[initialData.name] =
                foundSubject.uuid;
            }
          }
        }catch(error) {
          console.error(
            `Error loading subject data for ${initialData.name}:`,
            error,
          );
        }
      };
      loadSubject();
    }
  }, [initialData, subjectDataLoaded]);

  const handleDeleteClick = async () => {
    if(isDeletingLocal) return;
    try {
      setIsDeletingLocal(true);

      let uuid = initialData?.uuid || subjectUuid;

      if(!uuid) {
        const formValues = form.getValues();
        uuid = formValues.uuid;
      }

      if(!uuid) {
        toast({
          title: "Error",
          description: "Cannot delete: Subject UUID not found",
          variant: "destructive",
        });
        setIsDeletingLocal(false);
        return;
      }

      console.log("Deleting subject with UUID:", uuid);

      try {
        await deleteSubject(uuid);
        toast({
          title: "Success",
          description: `Subject "${initialData?.name}" has been deleted successfully`,
        });
        if(onDelete) {
          onDelete(uuid);
        }
        if(onRefresh) {
          onRefresh();
        }
        if(onCancel) {
          setTimeout(onCancel, 100);
        }
      }catch(error) {
        console.error("Error deleting subject:", error);
        toast({
          title: "Error",
          description: "Failed to delete subject. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeletingLocal(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="initials"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="istui-timetable__main_form_input_label">
                      {t("subject.form.initials")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="istui-timetable__main_form_input"
                        placeholder={t("subject.form.initialsPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A short code for the subject
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="istui-timetable__main_form_input_label">
                      {t("subject.form.name")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="istui-timetable__main_form_input"
                        placeholder="E.g., Mathematics"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("subject.form.color")}</FormLabel>
                  <FormControl>
                    <Input
                      type="color"
                      {...field}
                      className="w-full h-10 p-1 cursor-pointer"
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
                  <FormLabel className="istui-timetable__main_form_input_label">
                    {t("subject.form.comment")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="istui-timetable__main_form_input_textarea"
                      placeholder={t("subject.form.commentPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("subject.form.commentPlaceholder")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationInMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="istui-timetable__main_form_input_label">
                    {t("subject.form.duration")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="istui-timetable__main_form_input"
                      type="number"
                      placeholder="E.g., 45"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    {t("subject.form.durationHelper")}
                  </FormDescription>
                </FormItem>
              )}
            />
            <div className="space-y-4 pt-2">
              <div className="font-medium text-sm">
                {t("subject.form.repetitionSettings")}
              </div>
              <FormField
                control={form.control}
                name="repetitionType"
                render={({ field }) => (
                  <FormItem>
                    <div className="space-y-2">
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col space-y-3 istui-timetable__main_form_radio_group"
                      >
                        <div
                          className={cn(
                            "flex items-start space-x-3 border rounded-md p-3",
                            field.value === "red"
                              ? "border-red-500 bg-red-50"
                              : "border-muted",
                          )}
                        >
                          <RadioGroupItem
                            value="red"
                            id="repetition-red"
                            className="border-red-500 text-red-500 mt-1 istui-timetable__main_form_radio_item"
                          />
                          <div className="space-y-1">
                            <Label
                              htmlFor="repetition-red"
                              className="flex items-center gap-2 istui-timetable__main_form_radio_label"
                            >
                              <Ban className="h-4 w-4 text-red-500 istui-timetable__main_form_radio_icon" />
                              <span className="font-medium">
                                {t("subject.repetition.red")}
                              </span>
                            </Label>
                            <div className="text-sm text-muted-foreground">
                              {t("subject.repetition.redDescription")}
                            </div>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "flex items-start space-x-3 border rounded-md p-3",
                            field.value === "blue"
                              ? "border-blue-500 bg-blue-50"
                              : "border-muted",
                          )}
                        >
                          <RadioGroupItem
                            value="blue"
                            id="repetition-blue"
                            className="border-blue-500 text-blue-500 mt-1 istui-timetable__main_form_radio_item"
                          />
                          <div className="space-y-1">
                            <Label
                              htmlFor="repetition-blue"
                              className="flex items-center gap-2 istui-timetable__main_form_radio_label"
                            >
                              <Check className="h-4 w-4 text-blue-500 istui-timetable__main_form_radio_icon" />
                              <span className="font-medium">
                                {t("subject.repetition.blue")}
                              </span>
                            </Label>
                            <div className="text-sm text-muted-foreground">
                              {t("subject.repetition.blueDescription")}
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-3 pt-2">
              <div className="font-medium text-sm">
                {t("subject.form.conflictAndGroupSettings")}
              </div>
              <FormField
                control={form.control}
                name="conflictSubjectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 istui-timetable__main_form_input_label">
                      <Link className="h-4 w-4" />
                      {t("subject.form.conflictSubject")}
                    </FormLabel>
                    <Select
                      value={field.value?.toString() || "0"}
                      onValueChange={(value) => field.onChange(Number(value))}
                      className="istui-timetable__main_form_input_select"
                    >
                      <FormControl>
                        <SelectTrigger className="istui-timetable__main_form_input_select_trigger">
                          <SelectValue placeholder="Select a subject for conflict handling" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="istui-timetable__main_form_input_select_content">
                        <SelectItem value="0">None</SelectItem>
                        {validSubjects.map((subject) => (
                          <SelectItem key={subject.uuid} value={subject.uuid}>
                            {subject.name} ({subject.initials})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("subject.form.conflictSubjectHelper")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="group"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 istui-timetable__main_form_input_label">
                      <FileBox className="h-4 w-4" />
                      {t("subject.form.subjectGroup")}
                    </FormLabel>
                    <Select
                      value={field.value || "normal"}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="istui-timetable__main_form_input_select">
                          <SelectValue placeholder="Select a subject group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="languages">Languages</SelectItem>
                        <SelectItem value="humanities">Humanities</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="physical">
                          Physical Education
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("subject.form.subjectGroupHelper")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="autoConflictHandling"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="flex items-center gap-2 istui-timetable__main_form_input_label">
                        <CircleCheck className="h-4 w-4" />
                        {t("subject.form.automaticConflictHandling")}
                      </FormLabel>
                      <FormDescription>
                        {t("subject.form.automaticConflictHandlingHelper")}
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end mt-6">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading || isSubmitting || isDeletingLocal}
              className="w-full sm:w-auto order-2 sm:order-1 istui-timetable__main_form_cancel_button"
            >
              <X/>
              {t("subject.form.cancel")}
            </Button>

            {initialData && onDelete && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={onDelete}
                disabled={isLoading || isSubmitting || isDeletingLocal}
                className="w-full sm:w-auto order-1 sm:order-2 istui-timetable__main_form_delete_button"
              >
                {isDeletingLocal ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("common.deleting")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    {t("subject.form.delete")}
                  </span>
                )}
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={isLoading || isSubmitting || isDeletingLocal}
              className="w-full sm:w-auto order-3 istui-timetable__main_form_save_button"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                 
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("common.saving")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {initialData ?<><Check/> {t("common.update") }</> : <><CheckCheck/>{t("subject.form.create")}</> }
                </span>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SubjectForm;
