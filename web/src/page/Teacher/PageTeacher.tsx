import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { useToast } from "@/hook/useToast";
import {
  Loader2,
  Plus,
  Search,
  ArrowUp,
  ArrowDown,
  Building,
  RefreshCw,
  Users,
  Upload,
  AlertCircle,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "@/component/Core/layout/Header";
import Sidebar from "@/component/Core/layout/Sidebar";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import TeacherForm from "@/component/Teacher/TeacherForm";
import { TeacherFormData, TypeTeacher } from "@/type/Teacher/TypeTeacher";
import {
  setFilter,
  setSelectedTeacher,
  setSort,
} from "@/store/Teacher/SliceTeacher";
import { useAppDispatch, useAppSelector } from "@/hook/useAppRedux";
import { useI18n } from "@/hook/useI18n";
import { Progress } from "@/component/Ui/progress";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/Ui/popover";
import { Checkbox } from "@/component/Ui/checkbox";
import { Label } from "@/component/Ui/label";
import { Spinner } from "@/component/Ui/spinner";
import {
  useLazyGetTeachersQuery,
  useGetTeacherQuery,
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
  useDeleteTeacherMutation,
  useGetOrganizationsQuery,
  useImportTeachersMutation,
  useGetTeacherPreferencesQuery,
  useAddSchedulePreferenceToTeacherMutation,
  useUpdateSchedulePreferenceMutation,
  useDeleteSchedulePreferenceMutation,
} from "@/store/Teacher/ApiTeacher";
import ScheduleCalendar from "@/component/Calendar/ScheduleCalendar";
import { setSelectedScheduleIds } from "@/store/Calendar/SliceCalendar";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import CsvImport from "@/component/Common/CsvImport";
import { ImportResult } from "@/component/Common/CsvImport";
import { RadioGroup, RadioGroupItem } from "@/component/Ui/radio-group";
import EmptyState from "@/component/Common/EmptyState";
import DetailCardHeader from "@/component/Common/DetailCardHeader";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import TeacherPreferenceToolbar from "@/component/Teacher/TeacherPreferenceToolbar";
import TeacherScheduleCalendarRow from "@/component/Teacher/TeacherScheduleCalendarRow";
import { useGetPeriodsQuery } from "@/store/Calendar/ApiCalendar";
import { setSelectedPreferenceType, addPendingChange, clearPendingChanges } from "@/store/Calendar/SliceCalendar";
import { countActiveClassPreferences, getClassPreferenceOptions, getActiveClassPreferenceType } from "@/util/classCalendar";
import { PreferenceType, ChangeOperationType } from "@/type/Calendar/TypeCalendar";
import TeacherScheduleCalendar from "@/component/Teacher/TeacherScheduleCalendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";

const PageTeacher = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { uuid } = useParams();
  const navigate = useNavigate();
  
  const { 
    selectedPlanSettingsId, 
    setSelectedPlanSettingsId, 
    planSettingsList,
    fetchPlanSettingsByOrganizationPaginated
  } = usePlanSettingsStore();
  
  const [selectedTeacherUuid, setSelectedTeacherUuid] = useState<string | null>(null);
  const selectedScheduleIds = useAppSelector(
      (state) => state.calendar.selectedScheduleIds,
  );
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roleName === "ADMIN";

  const [isCreatingNewTeacher, setIsCreatingNewTeacher] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [teacherFormData, setTeacherFormData] =
      useState<TeacherFormData | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [autoLoadingInProgress, setAutoLoadingInProgress] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const initialRequestMade = useRef(false);
  const isFirstRenderCycle = useRef(true);

  const { data: organizationsResponse, isLoading: isLoadingOrganizations } =
      useGetOrganizationsQuery();
  const organizations = organizationsResponse?.data || [];

  const [triggerGetTeachers, { data: teacherListData, isFetching }] =
      useLazyGetTeachersQuery();
  const {
    data: selectedTeacherData,
    isFetching: isTeacherFetching,
    refetch: refetchTeacher,
  } = useGetTeacherQuery(selectedTeacherUuid!, {
    skip: !selectedTeacherUuid,
  });
  const [createTeacher, { isLoading: isCreating }] = useCreateTeacherMutation();
  const [updateTeacher, { isLoading: isUpdating }] = useUpdateTeacherMutation();
  const [deleteTeacher, { isLoading: isDeleting }] = useDeleteTeacherMutation();

  const [importTeachers] = useImportTeachersMutation();

  const {
    data: periodsData,
    isLoading: isLoadingPeriods,
    refetch: refetchPeriods
  } = useGetPeriodsQuery(
    { planSettingsId: teacherFormData?.planSettingsId || selectedPlanSettingsId },
    { 
      skip: !(teacherFormData?.planSettingsId || selectedPlanSettingsId) || activeTab !== "preferences"
    }
  );

  const {
    data: teacherPreferencesData,
    isLoading: isLoadingPreferences,
    refetch: refetchPreferences,
  } = useGetTeacherPreferencesQuery(
    { teacherUuid: selectedTeacherUuid || '' },
    { 
      skip: !selectedTeacherUuid || activeTab !== "preferences",
      refetchOnMountOrArgChange: true
    }
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchTeachers = useCallback(async () => {
    const queryParams = {
      page,
      size,
      ...(sortBy && { sortBy }),
      sortDirection,
      ...(debouncedKeyword && { keyword: debouncedKeyword }),
      ...(selectedOrgId && { orgId: selectedOrgId }),
      ...(selectedPlanSettingsId && { planSettingsId: selectedPlanSettingsId }),
    };
    return triggerGetTeachers(queryParams);
  }, [
    page,
    size,
    sortBy,
    sortDirection,
    debouncedKeyword,
    selectedOrgId,
    selectedPlanSettingsId,
    triggerGetTeachers,
  ]);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      if(!initialRequestMade.current && isMounted) {
        initialRequestMade.current = true;
        try {
          await fetchTeachers();
          setIsInitialLoadComplete(true);
        }catch(error) {
          handleApiError(error, t("teacher.errors.loadFailed"));
        }
      }
    };
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, [fetchTeachers, t]);

  useEffect(() => {
    if (selectedPlanSettingsId !== null && selectedPlanSettingsId !== undefined) {
      setPage(0);
      setTeachers([]);
      initialRequestMade.current = false;
      fetchTeachers();
    }
  }, [selectedPlanSettingsId, fetchTeachers]);

  useEffect(() => {
    if(isInitialLoadComplete && !isFirstRenderCycle.current) {
      fetchTeachers();
    }

    if(isFirstRenderCycle.current && isInitialLoadComplete) {
      isFirstRenderCycle.current = false;
    }
  }, [
    page,
    size,
    sortBy,
    sortDirection,
    debouncedKeyword,
    selectedOrgId,
    isInitialLoadComplete,
    fetchTeachers,
  ]);

  useEffect(() => {
    const shouldAutoRefresh = isInitialLoadComplete && 
                             !isCreatingNewTeacher && 
                             !selectedTeacherUuid;
                             
    let intervalId: NodeJS.Timeout | null = null;
    
    if (shouldAutoRefresh) {
      intervalId = setInterval(() => {
        console.log("Running scheduled data refresh");
        fetchTeachers();
      }, 300000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [
    isInitialLoadComplete,
    selectedTeacherUuid,
    fetchTeachers,
    refetchTeacher,
    isCreatingNewTeacher,
  ]);

  useEffect(() => {
    if (uuid) {
      setSelectedTeacherUuid(uuid);
      // If we were creating a new teacher but now have a UUID, stop creation mode
      if (isCreatingNewTeacher && uuid !== "new") {
        setIsCreatingNewTeacher(false);
      }
    } else if (!isCreatingNewTeacher) {
      // Only clear selection if we're not in creation mode
      setSelectedTeacherUuid(null);
    }
  }, [uuid, isCreatingNewTeacher]);

  // New effect to keep URL in sync with selected teacher
  useEffect(() => {
    if (selectedTeacherUuid && (!uuid || uuid !== selectedTeacherUuid)) {
      // If we have a selected teacher but URL doesn't match, update the URL
      navigate(`/teachers/${selectedTeacherUuid}`, { replace: true });
    }
  }, [selectedTeacherUuid, uuid, navigate]);

  useEffect(() => {
    if(teacherListData) {
      if(page === 0) {
        setTeachers(teacherListData.data || []);
      }else {
        setTeachers((prev) => {
          const existingIds = new Set(prev.map((t) => t.uuid));
          const newTeachers = (teacherListData.data || []).filter(
              (t) => !existingIds.has(t.uuid),
          );
          return [...prev, ...newTeachers];
        });
      }
      setTotalTeachers(teacherListData.totalItems || 0);

      setHasMore(
          teacherListData.data &&
          teacherListData.data.length > 0 &&
          (teacherListData.totalItems ?
            teachers.length + (page === 0 ? 0 : teacherListData.data.length) < teacherListData.totalItems :
            teacherListData.data.length >= size)
      );

      setIsLoadingMore(false);
      setAutoLoadingInProgress(false);
    }
  }, [teacherListData, size, page, teachers.length]);

  useEffect(() => {
    if(selectedTeacherData?.data) {
      const teacherData = selectedTeacherData.data as TypeTeacher;
      setTeacherFormData({
        ...selectedTeacherData.data,
        initials:
            teacherData.initials ||
            `${teacherData.firstName?.[0] || ""}${teacherData.lastName?.[0] || ""}`,
      } as TeacherFormData);
    }else {
      setTeacherFormData(null);
    }
  }, [selectedTeacherData, teachers]);

  const handleLoadMore = useCallback(() => {
    if(hasMore && !isFetching && !isLoadingMore) {
      if (listContainerRef.current) {
        setScrollPosition(listContainerRef.current.scrollTop);
      }

      setIsLoadingMore(true);
      setAutoLoadingInProgress(true);

      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, isFetching, isLoadingMore]);

  useEffect(() => {
    if (listContainerRef.current) {
      listContainerRef.current.style.overflow = 'scroll';
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        listContainerRef.current &&
        hasMore &&
        !isFetching &&
        !isLoadingMore &&
        !autoLoadingInProgress
      ) {
        const { scrollTop, clientHeight, scrollHeight } = listContainerRef.current;
        const isBottom = scrollTop + clientHeight >= scrollHeight - 100;

        if (isBottom) {
          if (!autoLoadingInProgress) {
            setScrollPosition(scrollTop);
            setAutoLoadingInProgress(true);
            handleLoadMore();
          }
        }
      }
    };

    const listElement = listContainerRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, isFetching, isLoadingMore, autoLoadingInProgress, handleLoadMore]);

  useEffect(() => {
    if (listContainerRef.current && scrollPosition > 0 && teachers.length > 0) {
      const timer = setTimeout(() => {
        if (listContainerRef.current) {
          listContainerRef.current.scrollTop = scrollPosition;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [teachers.length, scrollPosition]);

  const handleApiError = (error: any, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if(error?.data?.error) {
      const errorText = error.data.error;
      if(
          errorText.includes("Duplicate entry") &&
          errorText.includes("for key")
      ) {
        if(
            errorText.includes("UK33uo7vet9c79ydfuwg1w848f") ||
            errorText.toLowerCase().includes("email")
        ) {
          errorMessage = t("teacher.errors.duplicateEmail");
        }else {
          errorMessage = t("teacher.errors.duplicateEntry");
        }
      } else if(errorText.includes("could not execute statement")) {
        errorMessage = t("teacher.errors.databaseError");
      }else {
        errorMessage = errorText;
      }
    } else if(error?.data?.message) {
      errorMessage = error.data.message;
    } else if(error?.message) {
      errorMessage = error.message;
    }
    toast({ description: errorMessage, variant: "destructive" });
    return errorMessage;
  };

  const handleTeacherSelect = useCallback(
      (uuid: string) => {
        setSelectedTeacherUuid(uuid);
        navigate(`/teachers/${uuid}`, { replace: true });
        
        const existingTeacher = teachers.find((t) => t.uuid === uuid);
        if (existingTeacher) {
          setTeacherFormData({
            ...existingTeacher,
            initials: existingTeacher.initials || `${existingTeacher.firstName?.[0] || ""}${existingTeacher.lastName?.[0] || ""}`,
            role: "teacher" as const,
          } as TeacherFormData);
        }
      },
      [navigate, teachers]
  );

  const handleNewTeacherClick = () => {
    setSelectedTeacherUuid(null);
    setTeacherFormData(null);
    setIsCreatingNewTeacher(true);
    navigate("/teachers/new");
    setActiveTab("details");
    dispatch(setSelectedScheduleIds([]));
  };

  const handleCancel = () => {
    if(isCreatingNewTeacher) {
      setIsCreatingNewTeacher(false);
    }
    setSelectedTeacherUuid(null);
    setTeacherFormData(null);
    navigate("/teachers");
  };

  const handleSaveTeacher = async (formData: TeacherFormData) => {
    if(isCreatingNewTeacher) {
      try {
        const teacherData = {
          email: formData.email,
          phone: formData.phone || "",
          firstName: formData.firstName,
          lastName: formData.lastName,
          statusId: formData.statusId || 1,
          password: "defaultPassword123",
          initials: formData.initials,
          department: formData.department || "",
          qualification: formData.qualification || "",
          contractType: formData.contractType || "",
          notes: formData.notes || "",
          bio: formData.bio || "",
          maxDailyHours: formData.maxDailyHours || 6,
          controlNumber: formData.controlNumber,
          ...(isAdmin && { organizationId: formData.organizationId }),
          planSettingsId: formData.planSettingsId || selectedPlanSettingsId,
        };
        const response = await createTeacher(teacherData).unwrap();
        const successMessage =
            response.message ??
            t("teacher.success.created", {
              name: `${response.data.firstName} ${response.data.lastName}`,
            });
        toast({ description: successMessage });
        setTeachers((prevTeachers) => [response.data, ...prevTeachers]);
        setTotalTeachers((prev) => prev + 1);
        setTeacherFormData(null);
        setIsCreatingNewTeacher(false);
        setSelectedTeacherUuid(response.data.uuid);
        navigate(`/teachers/${response.data.uuid}`);
        setPage(0);
        fetchTeachers();
      }catch(error: any) {
        const errorMessage = handleApiError(
            error,
            t("teacher.errors.createFailed"),
        );
        const updatedFormData = { ...formData };
        if(
            errorMessage.includes("email") ||
            (error?.data?.error &&
                error.data.error.toLowerCase().includes("email"))
        ) {
          updatedFormData.emailError = t("teacher.errors.duplicateEmail");
        }else {
          updatedFormData.serverError = errorMessage;
        }
        setTeacherFormData(updatedFormData);
      }
    } else if(selectedTeacherUuid) {
      try {
        const teacherData = {
          email: formData.email,
          phone: formData.phone || "",
          firstName: formData.firstName,
          lastName: formData.lastName,
          statusId: formData.statusId || 1,
          initials: formData.initials,
          department: formData.department || "",
          qualification: formData.qualification || "",
          contractType: formData.contractType || "",
          notes: formData.notes || "",
          bio: formData.bio || "",
          maxDailyHours: formData.maxDailyHours || 6,
          controlNumber: formData.controlNumber,
          ...(isAdmin && { organizationId: formData.organizationId }),
          planSettingsId: formData.planSettingsId || selectedPlanSettingsId,
        };
        const response = await updateTeacher({
          uuid: selectedTeacherUuid,
          teacherData,
        }).unwrap();
        const successMessage =
            response.message ||
            t("teacher.success.updated", {
              name: `${response.data.firstName} ${response.data.lastName}`,
            });
        toast({ description: successMessage });
        refetchTeacher();
        fetchTeachers();
      }catch(error: any) {
        const errorMessage = handleApiError(
            error,
            t("teacher.errors.updateFailed"),
        );
        const updatedFormData = { ...formData };
        if(
            errorMessage.includes("email") ||
            (error?.data?.error &&
                error.data.error.toLowerCase().includes("email"))
        ) {
          updatedFormData.emailError = t("teacher.errors.duplicateEmail");
        }else {
          updatedFormData.serverError = errorMessage;
        }
        setTeacherFormData(updatedFormData);
      }
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTeacher = async () => {
    if(!selectedTeacherUuid) return;
    try {
      const response = await deleteTeacher(selectedTeacherUuid).unwrap();
      const successMessage = response.message ?? t("teacher.success.deleted");
      toast({ description: successMessage });
      setTeachers((prevTeachers) =>
          prevTeachers.filter((teacher) => teacher.uuid !== selectedTeacherUuid),
      );
      setTotalTeachers((prev) => Math.max(0, prev - 1));
      setTimeout(() => {
        triggerGetTeachers({ page: 0, size });
      }, 300);
      
      // Clean up state after delete
      setSelectedTeacherUuid(null);
      setTeacherFormData(null);
      navigate("/teachers");
    }catch(error: any) {
      handleApiError(error, t("teacher.errors.deleteFailed"));
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleCalendarCellClick = (cellInfo: any) => {
    if (selectedScheduleIds.includes(cellInfo.scheduleId)) {
      dispatch(
        setSelectedScheduleIds(
          selectedScheduleIds.filter((id) => id !== cellInfo.scheduleId)
        )
      );
    } else {
      dispatch(setSelectedScheduleIds([...selectedScheduleIds, cellInfo.scheduleId]));
    }
  };

  const handleToggleSortDirection = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    setPage(0);
    dispatch(
        setSort({
          field: sortBy
              ? (sortBy as "name" | "department" | "createdAt")
              : "name",
          direction: newDirection,
        }),
    );
  };

  const handleOrganizationSelect = (orgId: number | null) => {
    setSelectedOrgId(orgId);
    setPage(0);
    setIsOrgPopoverOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedKeyword("");
    setSelectedOrgId(null);
    setSortDirection("asc");
    setSortBy(undefined);
    setPage(0);
    setIsOrgPopoverOpen(false);
    dispatch(setFilter({ department: "all" }));
    dispatch(setSort({ field: "name", direction: "asc" }));
  };

  const getOrganizationName = (id: number | null) => {
    if(!id) return "";
    const org = organizations.find((org) => org.id === id);
    return org ? org.name : "";
  };

  const isLoadingAny =
      isFetching || isCreating || isUpdating || isDeleting || isTeacherFetching;

  const handleImport = async (file: File, options: { skipHeaderRow: boolean, organizationId?: number | null }): Promise<ImportResult> => {
    try {
      const response = await importTeachers({
        file,
        options: {
          skipHeaderRow: options.skipHeaderRow,
          organizationId: options.organizationId || undefined,
          planSettingsId: selectedPlanSettingsId || undefined,
        }
      }).unwrap();

      setPage(0);
      fetchTeachers();

      return {
        success: true,
        message: response.message,
        data: {
          totalProcessed: response.data?.totalProcessed || 0,
          successCount: response.data?.successCount || 0,
          errorCount: response.data?.errorCount || 0,
          errors: response.data?.errors || []
        }
      };
    } catch (error: any) {
      console.error("Import error:", error.data);

      if (error.status === 400 && error.success === true && error.data) {
        console.log("Import error:***", error.data);
        return {
          success: false,
          message: error.message || t("import.noRecordsProcessed"),
          data: {
            totalProcessed: error.data.totalProcessed || 0,
            successCount: error.data.successCount || 0,
            errorCount: error.data.errorCount || 0,
            errors: error.data.errors || []
          }
        };
      }

      if (error.data?.data?.errors && Array.isArray(error.data.data.errors)) {
        return {
          success: false,
          message: error.data.message || t("import.failed"),
          data: {
            totalProcessed: error.data.data.totalProcessed || 0,
            successCount: error.data.data.successCount || 0,
            errorCount: error.data.data.errorCount || 0,
            errors: error.data.data.errors
          }
        };
      }

      return {
        success: false,
        message: error.message || t("import.failed"),
        data: {
          totalProcessed: 0,
          successCount: 0,
          errorCount: 0,
          errors: []
        }
      };
    }
  };

  const handlePassPlanSettingsToForm = () => {
    if (Array.isArray(planSettingsList) && planSettingsList.length > 0) {
      return planSettingsList;
    }
    return [];
  };

  const teacherPreferences = teacherPreferencesData?.data || [];

  const isTeacherNotFound = teacherPreferencesData && teacherPreferencesData.error && teacherPreferencesData.error.includes("not found");

  useEffect(() => {
    if (
      activeTab === "preferences" &&
      teacherFormData &&
      teacherFormData.planSettingsId &&
      teacherFormData.organizationId
    ) {
      refetchPeriods();
    }
  }, [activeTab, teacherFormData, refetchPeriods]);

  useEffect(() => {
    if (
      activeTab === "preferences" &&
      selectedTeacherUuid
    ) {
      refetchPreferences();
    }
  }, [activeTab, selectedTeacherUuid, refetchPreferences]);

  useEffect(() => {
    if (planSettingsList.length > 0 && !selectedPlanSettingsId) {
      setSelectedPlanSettingsId(planSettingsList[0].id);
    }
  }, [planSettingsList, selectedPlanSettingsId, setSelectedPlanSettingsId]);

  useEffect(() => {
    if (selectedTeacherUuid && teacherFormData) {
      if (!teacherFormData.planSettingsId && selectedPlanSettingsId) {
        setTeacherFormData({
          ...teacherFormData,
          planSettingsId: selectedPlanSettingsId
        });
      }
      
      if (selectedPlanSettingsId && 
          teacherFormData.planSettingsId && 
          teacherFormData.planSettingsId !== selectedPlanSettingsId) {
        if (activeTab === "preferences") {
          setTeacherFormData({
            ...teacherFormData,
            planSettingsId: selectedPlanSettingsId
          });
        }
      }
    }
  }, [selectedTeacherUuid, teacherFormData, selectedPlanSettingsId, activeTab]);

  useEffect(() => {
    if (
      activeTab === "preferences" &&
      selectedTeacherUuid && 
      teacherFormData
    ) {
      refetchPreferences();
      refetchPeriods();
    }
  }, [activeTab, selectedTeacherUuid, teacherFormData, selectedPlanSettingsId, refetchPreferences, refetchPeriods]);

  const { selectedPreferenceType, pendingChanges } = useAppSelector((state) => state.calendar);

  const preferenceFields = {
    mustScheduleClass: "mustScheduleClass",
    mustNotScheduleClass: "mustNotScheduleClass",
    prefersToScheduleClass: "prefersToScheduleClass",
    prefersNotToScheduleClass: "prefersNotToScheduleClass",
  };

  const processedPeriods = React.useMemo(() => {
    const allPeriods = periodsData?.data || [];

    const processed = allPeriods.map(period => ({
      ...period,
      days: Array.isArray(period.days) ? period.days : []
    }));

    return processed;
  }, [periodsData]);

  const uniqueDays = React.useMemo(() => {
    return Array.from(new Set(processedPeriods.flatMap(p => p.days || []))).sort((a, b) => a - b);
  }, [processedPeriods]);

  const handlePreferenceSelect = (preferenceType) => {
    dispatch(setSelectedPreferenceType(preferenceType));
  };

  const [addPreference] = useAddSchedulePreferenceToTeacherMutation();
  const [updatePreference] = useUpdateSchedulePreferenceMutation();
  const [deletePreference] = useDeleteSchedulePreferenceMutation();
  
  const handleSaveChanges = async () => {
    if (!selectedTeacherUuid || pendingChanges.length === 0) return;
    
    console.log('Saving teacher preferences:', pendingChanges);
    
    const results = [];
    for (const change of pendingChanges) {
      try {
        if (change.operationType === ChangeOperationType.CREATE) {
          const result = await addPreference({
            teacherUuid: selectedTeacherUuid,
            periodId: Number(change.periodId),
            dayOfWeek: Number(change.dayOfWeek),
            preferenceType: change.newPreferenceType as string,
            preferenceValue: true
          }).unwrap();
          results.push({ success: true, message: `Created preference for ${change.periodId}-${change.dayOfWeek}` });
        } 
        else if (change.operationType === ChangeOperationType.UPDATE) {
          const result = await updatePreference({
            preferenceUuid: change.preferenceUuid as string,
            preferenceType: change.newPreferenceType as string, 
            preferenceValue: true
          }).unwrap();
          results.push({ success: true, message: `Updated preference ${change.preferenceUuid}` });
        } 
        else if (change.operationType === ChangeOperationType.DELETE) {
          const result = await deletePreference(change.preferenceUuid as string).unwrap();
          results.push({ success: true, message: `Deleted preference ${change.preferenceUuid}` });
        }
      } catch (error) {
        console.error(`Error handling change ${change.operationType}:`, error);
        results.push({ 
          success: false, 
          message: `Failed to ${change.operationType.toLowerCase()} preference: ${error.message || 'Unknown error'}`
        });
      }
    }
    
    dispatch(clearPendingChanges());
    refetchPreferences();
    
    const successCount = results.filter(r => r.success).length;
    const errorCount = results.length - successCount;
    
    if (errorCount === 0) {
      toast({
        description: `Successfully saved all ${successCount} preference changes`,
        variant: "default",
      });
    } else {
      toast({
        description: `Saved ${successCount} changes, but encountered ${errorCount} errors`,
        variant: "destructive",
      });
    }
  };

  const handleDiscardChanges = () => {
    dispatch(clearPendingChanges());
  };

  const handleCellClick = (cellInfo) => {
    if (!selectedTeacherUuid || !selectedPreferenceType) return;
    
    const period = processedPeriods.find(p => p.id === Number(cellInfo.periodId));
    const cellIndex = period ? `${period.id}-${cellInfo.dayOfWeek}` : `${cellInfo.periodId}-${cellInfo.dayOfWeek}`;
    
    if (cellInfo.currentPreference) {
      const currentPrefType = getActiveClassPreferenceType(cellInfo.currentPreference, preferenceFields);
      
      if (currentPrefType === selectedPreferenceType) {
        dispatch(
          addPendingChange({
            operationType: ChangeOperationType.DELETE,
            periodId: cellInfo.periodId,
            dayOfWeek: cellInfo.dayOfWeek,
            preferenceUuid: cellInfo.currentPreference.uuid,
            cellIndex,
          })
        );
      } else {
        dispatch(
          addPendingChange({
            operationType: ChangeOperationType.UPDATE,
            periodId: cellInfo.periodId,
            dayOfWeek: cellInfo.dayOfWeek,
            preferenceUuid: cellInfo.currentPreference.uuid,
            newPreferenceType: selectedPreferenceType,
            cellIndex,
          })
        );
      }
    } else {
      dispatch(
        addPendingChange({
          operationType: ChangeOperationType.CREATE,
          periodId: cellInfo.periodId,
          dayOfWeek: cellInfo.dayOfWeek,
          newPreferenceType: selectedPreferenceType,
          cellIndex,
        })
      );
    }
  };

  const handleTabChange = (value: "details" | "preferences") => {
    setActiveTab(value);
    // We're NOT navigating or changing selectedTeacherUuid here
  };

  const preferenceOptions = [
    {
      type: "mustScheduleClass" as PreferenceType,
      label: t("teacher.preferences.mustTeach"),
      color: "bg-green-500 text-white border-green-600",
      description: t("teacher.preferences.mustTeachDescription")
    },
    {
      type: "prefersToScheduleClass" as PreferenceType,
      label: t("teacher.preferences.prefersTeach"),
      color: "bg-blue-500 text-white border-blue-600",
      description: t("teacher.preferences.prefersTeachDescription")
    },
    {
      type: "prefersNotToScheduleClass" as PreferenceType,
      label: t("teacher.preferences.prefersNotTeach"),
      color: "bg-yellow-500 text-white border-yellow-600",
      description: t("teacher.preferences.prefersNotTeachDescription")
    },
    {
      type: "mustNotScheduleClass" as PreferenceType,
      label: t("teacher.preferences.cannotTeach"),
      color: "bg-red-500 text-white border-red-600",
      description: t("teacher.preferences.cannotTeachDescription")
    }
  ];

  return (
    <div className="flex h-screen bg-background-main">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-hidden istui-timetable__main_content">
          {isLoadingAny && (
            <div className="fixed top-0 left-0 w-full z-50">
              <Progress
                value={100}
                className="h-1"
                indicatorColor="animate-pulse bg-blue-500"
              />
            </div>
          )}
          <div className="container-main mx-auto py-4 px-4 sm:px-6 h-full flex flex-col istui-timetable__main_content">
            <div className="flex justify-between items-center mb-4 istui-timetable__main_breadcrumbs_wrapper ">
              <Breadcrumbs
                  className="istui-timetable__main_breadcrumbs"
                  items={[
                    { label: t("navigation.resources"), href: "/resources" },
                    { label: t("navigation.teachers"), href: "" },
                  ]}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
              <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                <Card className="overflow-hidden h-full flex flex-col border-0 shadow-md">
                  <div className="sticky top-0 z-10 bg-background border-b">
                    <CardHeader className="pb-1 bg-secondary">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <CardTitle>
                            {t("common.teachers")}
                            {typeof totalTeachers === "number" && teachers.length > 0 && (
                              <span className="text-muted-foreground text-sm font-normal ml-2">
                                ({teachers.length})
                              </span>
                            )}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                              className="istui-timetable__main_list_card_button"
                              size="sm"
                              onClick={handleNewTeacherClick}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {t("actions.add")}
                          </Button>
                          <CsvImport
                            onImport={handleImport}
                            buttonVariant="outline"
                            buttonSize="sm"
                            organizations={organizations}
                            selectedOrgId={selectedOrgId}
                            isAdmin={isAdmin}
                            organizationId={user?.organizationId ? Number(user.organizationId) : null}
                            showOrganizationSelection={true}
                          />
                        </div>
                      </div>
                      <CardDescription></CardDescription>
                    </CardHeader>
                    <div className="p-4 space-y-3">
                      <div className="mb-2 flex items-center gap-2">
                        <select
                          id="planSettingsId"
                          className="p-2 border rounded-md min-w-[200px]"
                          value={selectedPlanSettingsId || ""}
                          onChange={e => {
                            const newValue = e.target.value ? Number(e.target.value) : null;
                            setSelectedPlanSettingsId(newValue);
                            setPage(0);
                            setTeachers([]);
                          }}
                        >
                          <option value="">{t("teacher.form.selectPlanSettings")}</option>
                          {planSettingsList && planSettingsList.length > 0 ? (
                            planSettingsList.map((ps) => (
                              <option key={ps.id} value={ps.id}>
                                {ps.name} {selectedPlanSettingsId === ps.id ? '(Active)' : ''}
                              </option>
                            ))
                          ) : (
                            <option value="no-options" disabled>
                              {t("teacher.form.noPlanSettingsAvailable")}
                            </option>
                          )}
                        </select>
                        {selectedPlanSettingsId && planSettingsList.length > 0 && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {t("teacher.form.filteringBy")}: {planSettingsList.find(ps => ps.id === selectedPlanSettingsId)?.name}
                          </span>
                        )}
                        {planSettingsList.length === 0 && (
                          <span className="text-xs text-amber-600 px-2 py-1 rounded">
                            {t("teacher.form.noPlanSettingsAvailable")}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                              placeholder={t("teacher.searchPlaceholder")}
                              className="pl-8"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        {isAdmin && (
                            <Popover
                                open={isOrgPopoverOpen}
                                onOpenChange={setIsOrgPopoverOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={
                                      selectedOrgId
                                          ? "bg-primary text-primary-foreground"
                                          : ""
                                    }
                                    aria-label={t("teacher.filterByOrganization")}
                                >
                                  <Building className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56 p-2" align="end">
                                <div className="space-y-2">
                                  <div className="font-medium text-sm">
                                    {t("teacher.filterByOrganization")}
                                  </div>
                                  <div className="h-px bg-border" />
                                  {isLoadingOrganizations ? (
                                      <div className="py-2 flex items-center justify-center">
                                        <Spinner className="h-4 w-4 mr-2" />
                                        <span className="text-sm">
                                    {t("common.loading")}
                                  </span>
                                      </div>
                                  ) : (
                                      <RadioGroup value={selectedOrgId === null ? "all" : String(selectedOrgId)} onValueChange={value => handleOrganizationSelect(value === "all" ? null : Number(value))}>
                                        <div className="flex items-center space-x-2 py-1">
                                          <RadioGroupItem value="all" id="all-orgs" />
                                          <Label htmlFor="all-orgs" className="text-sm font-normal cursor-pointer">
                                            {t("organization.allOrganizations")}
                                          </Label>
                                        </div>
                                        {organizations.map((org) => (
                                          <div key={org.id} className="flex items-center space-x-2 py-1">
                                            <RadioGroupItem value={String(org.id)} id={`org-${org.id}`} />
                                            <Label htmlFor={`org-${org.id}`} className="text-sm font-normal cursor-pointer">
                                              {org.name}
                                            </Label>
                                          </div>
                                        ))}
                                      </RadioGroup>
                                  )}
                                  <div className="h-px bg-border" />
                                  <div className="flex justify-between">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetFilters}
                                        className="w-full"
                                    >
                                      <RefreshCw className="h-3 w-3 mr-2" />
                                      {t("common.resetFilters")}
                                    </Button>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                        )}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleToggleSortDirection}
                            aria-label={
                              sortDirection === "asc"
                                  ? t("common.sortAscending")
                                  : t("common.sortDescending")
                            }
                        >
                          {sortDirection === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                          ) : (
                              <ArrowDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {(selectedOrgId || debouncedKeyword) && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {selectedOrgId && (
                                <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                  <Building className="h-3 w-3" />
                                  <span>
                                {t("teacher.filterByOrganization")}:{" "}
                                      {getOrganizationName(selectedOrgId)}
                                </span>
                                </div>
                            )}
                            {debouncedKeyword && (
                                <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                  <Search className="h-3 w-3" />
                                  <span>"{debouncedKeyword}"</span>
                                </div>
                            )}
                          </div>
                      )}
                    </div>
                  </div>
                  <div className="p-0 flex-1 overflow-hidden">
                    <div
                        className="overflow-y-scroll"
                        ref={listContainerRef}
                        style={{
                          height: "calc(100vh - 250px)",
                          scrollBehavior: "auto",
                        }}
                    >
                      {isFetching && page === 0 ? (
                          <div className="flex justify-center py-8">
                            <Spinner />
                          </div>
                      ) : teachers.length > 0 ? (
                          <div className="space-y-2 p-4">
                            {teachers.map((teacher) => (
                                <div
                                    key={`${teacher.uuid}-${refreshKey}`}
                                    className={`p-3 rounded-md cursor-pointer flex items-center ${
                                        selectedTeacherUuid === teacher.uuid
                                            ? "bg-primary/10"
                                            : "hover:bg-muted"
                                    }`}
                                    onClick={() => handleTeacherSelect(teacher.uuid)}
                                >
                                  <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm font-medium bg-primary">
                                    {teacher.initials ||
                                        `${teacher.firstName?.[0] || ""}${teacher.lastName?.[0] || ""}`}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {teacher.firstName} {teacher.lastName}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {teacher.email}
                                    </div>
                                    {teacher.department && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                          {teacher.department}
                                        </div>
                                    )}
                                  </div>
                                </div>
                            ))}
                            {teachers.length > 0 && (hasMore || isLoadingMore) && (
                              <div className="mt-4 mb-6 flex justify-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleLoadMore}
                                  disabled={isLoadingMore || isFetching}
                                  className="min-w-[200px]"
                                >
                                  <div className="flex items-center">
                                    {(isLoadingMore || isFetching) && (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {t("teacher.loadMoreTeachers")}
                                    {totalTeachers > 0 && (
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        ({teachers.length < totalTeachers ? teachers.length : totalTeachers}/{totalTeachers})
                                      </span>
                                    )}
                                  </div>
                                </Button>
                              </div>
                            )}

                            {!hasMore && teachers.length > 0 && (
                              <div className="text-center py-4 mt-2 mb-6 text-sm text-muted-foreground border-t border-dashed border-muted">
                                {t("teacher.endOfList", { count: String(teachers.length) })}
                              </div>
                            )}

                            {hasMore && (
                              <div className="h-20" aria-hidden="true"></div>
                            )}
                          </div>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="mb-6 p-6 rounded-full bg-muted/30 text-primary">
                              <Users size={64} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-medium mb-2">
                              {t("teacher.title", { defaultValue: "Teachers" })}
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md text-base leading-relaxed">
                              {t("teacher.emptyState.description")}
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={handleNewTeacherClick}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                {t("actions.add")}
                              </Button>
                            </div>
                          </div>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
                <Card className="flex flex-col h-full overflow-hidden">
                  <div className="flex-1 overflow-hidden">
                    {selectedTeacherUuid || isCreatingNewTeacher ? (
                      <Tabs
                        defaultValue="details"
                        value={activeTab}
                        onValueChange={handleTabChange}
                        className="flex flex-col flex-1 overflow-hidden"
                      >
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="details">
                            {t("teacher.tabs.details")}
                          </TabsTrigger>
                          <TabsTrigger value="preferences">
                            {t("teacher.tabs.preferences")}
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent
                          value="details"
                          className="p-6 flex-1 flex flex-col"
                        >
                          {isCreatingNewTeacher || selectedTeacherUuid ? (
                            isTeacherFetching && selectedTeacherUuid && !teacherFormData ? (
                              <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                                <p>{t("teacher.loading.details")}</p>
                              </div>
                            ) : (
                              <TeacherForm
                                teacherData={isCreatingNewTeacher ? null : teacherFormData}
                                isNewTeacher={isCreatingNewTeacher}
                                onSave={handleSaveTeacher}
                                onDelete={handleDeleteClick}
                                onCancel={handleCancel}
                                isLoading={isCreating || isUpdating}
                                isDeleting={isDeleting}
                                selectedPlanSettingsId={selectedPlanSettingsId}
                                planSettingsList={handlePassPlanSettingsToForm()}
                              />
                            )
                          ) : null}
                        </TabsContent>
                        <TabsContent
                          value="preferences"
                          className="p-6 flex-1 overflow-auto"
                        >
                          {selectedTeacherUuid ? (
                            isTeacherNotFound ? (
                              <div className="flex-1 flex flex-col items-center justify-center text-center">
                                <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
                                <h3 className="text-lg font-medium">
                                  {t("teacher.preferences.teacherNotFound.title")}
                                </h3>
                                <p className="text-muted-foreground mt-2 max-w-md">
                                  {t("teacher.preferences.teacherNotFound.description")}
                                </p>
                                <Button 
                                  className="mt-6" 
                                  onClick={() => {
                                    refetchTeacher();
                                    refetchPreferences();
                                  }}
                                >
                                  {t("teacher.preferences.teacherNotFound.action")}
                                </Button>
                              </div>
                            ) : isLoadingPreferences || isLoadingPeriods ? (
                              <div className="flex-1 flex items-center justify-center">
                                <Spinner size="lg" className="text-primary" />
                              </div>
                            ) : (
                              <TeacherScheduleCalendar
                                selectedTeacherUuid={selectedTeacherUuid}
                                onCellClick={handleCellClick}
                              />
                            )
                          ) : (
                            <div className="text-center py-10 text-muted-foreground">
                              <p>{t("teacher.empty.selectSchedulePrompt", { defaultValue: "Please select a teacher to view schedule preferences." })}</p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <EmptyState
                          icon={<Users />}
                          title={t("teacher.emptyState.title")}
                          description={t("teacher.emptyState.description")}
                          onAdd={handleNewTeacherClick}
                          onImport={handleImport}
                          showImport={true}
                          organizations={organizations}
                          selectedOrgId={selectedOrgId}
                          organizationId={user?.organizationId ? Number(user.organizationId) : null}
                          isAdmin={isAdmin}
                          hasPermission={true}
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteTeacher}
        isDeleting={isDeleting}
        title={t("common.deleteConfirmTitle")}
        description={`${t("common.deleteConfirmMessage").replace(
          "{moduleName}",
          "teacher",
        )} ${
          teacherFormData
            ? `(${teacherFormData?.firstName || ""} ${teacherFormData?.lastName || ""})`
            : ""
        }`}
        showTrigger={false}
      />
    </div>
  );
};

export default PageTeacher;