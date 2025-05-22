import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  ArrowDown,
  ArrowUp,
  Building,
  RefreshCw,
  Loader2,
  Upload,
  AlertCircle,
  CheckCircle2,
  X,
  GraduationCap,
} from "lucide-react";
import { Input } from "@/component/Ui/input";
import { Button } from "@/component/Ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/component/Ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/component/Ui/alert-dialog";
import { Spinner } from "@/component/Ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/Ui/popover";
import { Checkbox } from "@/component/Ui/checkbox";
import { Label } from "@/component/Ui/label";
import ClassForm from "@/component/Class/ClassForm";
import ClassScheduleCalendar from "@/component/Class/ClassScheduleCalendar";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import NewClassModal from "@/component/Class/NewClassModal";
import { useToast } from "@/hook/useToast";
import { useI18n } from "@/hook/useI18n";
import { useAppDispatch, useAppSelector } from "@/hook/useAppRedux";
import {
  useGetClassesQuery,
  useGetOrganizationsQuery,
  useCreateClassMutation,
  useGetClassQuery,
  useDeleteClassMutation,
  useImportClassesFromCsvMutation,
} from "@/store/Class/ApiClass";
import type { CreateClassRequest } from "@/type/Class/TypeClass";
import {
  setSelectedClass,
  closeClassPanel,
  setSelectedScheduleIds,
  openNewClassForm,
  setClasses,
  appendClasses,
  updateClass,
  removeClass,
  resetImportStatus,
  selectImportStatus,
} from "@/store/Class/SliceClass";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { Progress } from "@/component/Ui/progress.tsx";
import { useInView } from "react-intersection-observer";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/component/Ui/dialog";
import { ScrollArea } from "@/component/Ui/scroll-area";
import CsvImport from "@/component/Common/CsvImport";
import { RadioGroup, RadioGroupItem } from "@/component/Ui/radio-group";
import EmptyState from "@/component/Common/EmptyState";
import DetailCardHeader from "@/component/Common/DetailCardHeader";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const PageClass = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const {t} = useI18n();
  const {toast} = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "preferences">(
      "details",
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClassUuid, setSelectedClassUuid] = useState<string | null>(
      null,
  );
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [allLoadedClasses, setAllLoadedClasses] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalClasses, setTotalClasses] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const {user} = useAppSelector((state) => state.auth);
  const {isDetailsOpen, isNewClassOpen} = useAppSelector(
      (state) => state.class,
  ) || {isDetailsOpen: false, isNewClassOpen: false};
  const classes = useAppSelector((state) => state.class.classes);
  const selectedScheduleIds = useAppSelector(
      (state) => state.class.selectedScheduleIds || [],
  );

  const {data: organizationsResponse, isLoading: isLoadingOrganizations} =
      useGetOrganizationsQuery();
  const organizations = organizationsResponse?.data || [];

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [selectedPlanSettingsId, setSelectedPlanSettingsId] = useState<number | null>(null);
  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);
  const fetchPlanSettingsByOrganizationPaginated = usePlanSettingsStore((state) => state.fetchPlanSettingsByOrganizationPaginated);

  const queryParams = {
    page,
    size: pageSize,
    sortDirection: "asc" as "asc" | "desc",
    ...(debouncedSearchTerm && {keyword: debouncedSearchTerm}),
    ...(selectedOrgId && {orgId: selectedOrgId}),
    ...(selectedPlanSettingsId && {planSettingsId: selectedPlanSettingsId}),
  };

  const {
    data: classesResponse,
    isLoading: isLoadingClasses,
    refetch: refetchClasses,
    isFetching,
  } = useGetClassesQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  });

  const {
    data: selectedClassData,
    isLoading: isLoadingSelectedClass,
    refetch: refetchSelectedClass,
  } = useGetClassQuery(selectedClassUuid || "", {
    skip: !selectedClassUuid,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });

  const [createClass, {isLoading: isCreating}] = useCreateClassMutation();
  const [deleteClass, {isLoading: isDeleting}] = useDeleteClassMutation();
  const [importClassesFromCsv, { isLoading: isImporting }] = useImportClassesFromCsvMutation();

  const planSettings = usePlanSettingsStore((state) => state.planSettings);
  const fetchPlanSettingsByOrganization = usePlanSettingsStore(
      (state) => state.fetchPlanSettingsByOrganization,
  );

  const listContainerRef = useRef<HTMLDivElement>(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Add a loading state indicator
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setPageSize(10);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    let orgId = null;
    if(userData) {
      try {
        const user = JSON.parse(userData);
        orgId = user.organizationId;
      }catch(e) {/* ignore parse error */}
    }
    if(orgId) {
      fetchPlanSettingsByOrganization(orgId)
          .then(() => {
          })
          .catch((error) => {
          });
    }
  }, [fetchPlanSettingsByOrganization]);

  useEffect(() => {
    if(user) {
      setIsAdmin(user.roleName === "ADMIN");
      if(user.organizationId) {
        setOrganizationId(Number(user.organizationId));
      }
    }
  }, [user]);

  useEffect(() => {
    if(classesResponse?.data) {
      if(page === 0) {
        dispatch(setClasses(classesResponse.data || []));
        setAllLoadedClasses(classesResponse.data || []);
      } else if(page > 0) {
        setAllLoadedClasses(prev => {
          const existingClassMap = new Map(prev.map(cls => [cls.uuid, cls]));
          classesResponse.data.forEach(cls => {
            if(!existingClassMap.has(cls.uuid)) {
              existingClassMap.set(cls.uuid, cls);
            }
          });

          return Array.from(existingClassMap.values());
        });

        dispatch(setClasses(Array.from(new Map(
          [...allLoadedClasses, ...classesResponse.data]
            .map(cls => [cls.uuid, cls])
        ).values())));
      }
      setIsLoadingMore(false);
      setTotalClasses((classesResponse.totalItems ) || 0);
      setHasMore(classesResponse.data && classesResponse.data.length === pageSize);
    }
  }, [classesResponse, dispatch, page, pageSize, allLoadedClasses]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchClasses();
      if(selectedClassUuid) {
        refetchSelectedClass();
      }
    }, 30000);
    return () => clearInterval(intervalId);
  }, [refetchClasses, refetchSelectedClass, selectedClassUuid]);

  useEffect(() => {
    const handleWindowFocus = () => {
      refetchClasses();
      if(selectedClassUuid) {
        refetchSelectedClass();
      }
    };
    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [refetchClasses, refetchSelectedClass, selectedClassUuid]);

  useEffect(() => {
    const {pathname} = location;
    const match = pathname.match(/\/classes\/([^/]+)/);
    if(match && match[1]) {
      const uuidFromUrl = match[1];
      setSelectedClassUuid(uuidFromUrl);
    } else if(pathname === "/classes") {
      setSelectedClassUuid(null);
    }
  }, [location]);

  useEffect(() => {
    if(inView && hasMore && !isFetching && !isLoadingMore) {
      handleLoadMore();
    }
  }, [inView, hasMore, isFetching, isLoadingMore]);

  useEffect(() => {
    if(selectedOrgId) {
      console.log("Fetching plan settings for organization:", selectedOrgId);
      usePlanSettingsStore.getState().lastOrganizationSearch = null;
      fetchPlanSettingsByOrganizationPaginated(selectedOrgId.toString(), 0, 100)
        .then(result => {
          console.log("Fetched plan settings:", result);
        })
        .catch(error => {
          console.error("Error fetching plan settings:", error);
        });
    }
  }, [selectedOrgId, fetchPlanSettingsByOrganizationPaginated]);

  useEffect(() => {
    if (user && user.organizationId && !selectedOrgId) {
      setSelectedOrgId(Number(user.organizationId));
      fetchPlanSettingsByOrganizationPaginated(user.organizationId.toString(), 0, 100);
    }
  }, [user, selectedOrgId, fetchPlanSettingsByOrganizationPaginated]);

  useEffect(() => {
    if (planSettingsList && planSettingsList.length > 0) {
      console.log("Setting default planSetting:", planSettingsList[0]);
      if (!selectedPlanSettingsId) {
        setSelectedPlanSettingsId(planSettingsList[0].id);
      }
    }
  }, [planSettingsList, selectedPlanSettingsId]);

  const isPlanSettingsLoading = !planSettingsList || planSettingsList.length === 0;

  // Improve data loading sequence on initial page load
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        // 1. Get user organization ID if available
        let orgId = null;
        if (user && user.organizationId) {
          orgId = Number(user.organizationId);
          setSelectedOrgId(orgId);
          console.log("Initial load: Using organization ID from user:", orgId);
        }

        // 2. Fetch plan settings for this organization
        if (orgId) {
          console.log("Initial load: Fetching plan settings for organization:", orgId);
          try {
            const result = await fetchPlanSettingsByOrganizationPaginated(orgId.toString(), 0, 100);
            console.log("Initial load: Fetched plan settings:", result);
            
            // 3. Set default plan setting if available
            if (result && Array.isArray(result) && result.length > 0) {
              console.log("Initial load: Setting default plan setting:", result[0]);
              setSelectedPlanSettingsId(result[0].id);
            } else {
              console.warn("Initial load: No plan settings found for organization", orgId);
            }
          } catch (error) {
            console.error("Initial load: Error fetching plan settings:", error);
          }
        }

        // 4. Now fetch classes with appropriate filters
        setPage(0);
        await refetchClasses();
      } catch (error) {
        console.error("Error during initial data load:", error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadInitialData();
  }, [user, fetchPlanSettingsByOrganizationPaginated, refetchClasses]);

  const handleSaveNewClass = async (formData: CreateClassRequest) => {
    try {
      const enhancedFormData = {
        ...formData,
        planSettingsId: selectedPlanSettingsId
      };
      const response = await createClass(enhancedFormData).unwrap();
      if(response.success) {
        toast({
          description: t("class.success.created", {name: formData.name}),
        });
        await refetchClasses();
        
        // Instead of closing the form, keep it open for creating another class
        handleCreateClassSuccess();
        
        setRefreshKey((prev) => prev + 1);
      } else {
        const errorMessage = extractErrorMessage(response);
        toast({variant: "destructive", description: errorMessage});
      }
    } catch(error: any) {
      const errorMessage = extractErrorMessage(error);
      toast({variant: "destructive", description: errorMessage});
    }
  };

  const extractErrorMessage = (error: any): string => {
    if(!error) return t("class.errors.createFailed");
    if(typeof error === "string") return error;
    const checkForClassExists = (value: any): boolean => {
      if(typeof value !== "string") return false;
      return (
          value.includes("Class already exists") ||
          value.includes("[Class already exists]")
      );
    };
    const findErrorRecursively = (obj: any): string | null => {
      if(!obj || typeof obj !== "object") return null;
      for(const key in obj) {
        const value = obj[key];
        if(checkForClassExists(value)) {
          return t("class.errors.alreadyExists");
        }
        if(value && typeof value === "object") {
          const result = findErrorRecursively(value);
          if(result) return result;
        }
      }
      return null;
    };
    const classExistsError = findErrorRecursively(error);
    if(classExistsError) return classExistsError;
    if(error.message) return error.message;
    if(error.data?.message) return error.data.message;
    if(error.data?.error) return error.data.error;
    if(error.error) return error.error;
    return t("class.errors.createFailed");
  };

  const handleSelectClass = (uuid: string) => {
    setSelectedClassUuid(uuid);
    navigate(`/classes/${uuid}`, {replace: true});
  };

  const handleAddNewClass = () => {
    dispatch(closeClassPanel());
    setSelectedClassUuid(null);
    navigate("/classes", {replace: true});
    dispatch(openNewClassForm());
    setActiveTab("details");
  };

  const handleClosePanel = () => {
    dispatch(closeClassPanel());
    setSelectedClassUuid(null);
    dispatch(setSelectedScheduleIds([]));
    setActiveTab("details");
    navigate("/classes", {replace: true});
    refetchClasses();
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if(!selectedClassUuid) return;
    try {
      const response = await deleteClass(selectedClassUuid).unwrap();
      if(response.success) {
        toast({description: response.message || t("class.classDeleted")});
        dispatch(closeClassPanel());
        dispatch(removeClass(selectedClassUuid));
        navigate("/classes", {replace: true});
        setSelectedClassUuid(null);
        await refetchClasses();
        setRefreshKey((prev) => prev + 1);
      }else {
        toast({
          variant: "destructive",
          description: response.message || t("common.errors.operationFailed"),
        });
      }
    }catch(error: any) {
      const errorMessage =
          error?.data?.message || error.message || t("common.errors.operationFailed");
      toast({variant: "destructive", description: errorMessage});
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleTabChange = (value: "details" | "preferences") => {
    setActiveTab(value);
  };

  const handleCalendarCellClick = (cellInfo: any) => {
    if(
        cellInfo.scheduleId &&
        !selectedScheduleIds.includes(cellInfo.scheduleId)
    ) {
      dispatch(
          setSelectedScheduleIds([...selectedScheduleIds, cellInfo.scheduleId]),
      );
    }
  };

  const handleClassUpdated = async () => {
    await refetchClasses();
    if(selectedClassUuid) {
      await refetchSelectedClass();
    }
    setRefreshKey((prev) => prev + 1);
  };

  const handleLoadMore = () => {
    if(hasMore && !isFetching && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleToggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    setPage(0);
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
    setSelectedPlanSettingsId(null);
    setSortDirection("asc");
    setPage(0);
    setIsOrgPopoverOpen(false);
  };

  const getOrganizationName = (id: number | null) => {
    if(!id) return "";
    const org = organizations.find((org) => org.id === id);
    return org ? org.name : "";
  };

  const getPlanSettingName = (id: number | null) => {
    if(!id || !planSettingsList) return "";
    const planSetting = planSettingsList.find((ps) => ps.id === id);
    return planSetting ? planSetting.name : "";
  };

  useEffect(() => {
    console.log("QUERY PARAMS SENT TO API:", queryParams);
    if (selectedPlanSettingsId) {
      console.log(`Expected planSettingsId ${selectedPlanSettingsId} to be included in params`);
    }
  }, [queryParams, selectedPlanSettingsId]);

  useEffect(() => {
    console.log("PlanSettingsList updated:", planSettingsList);
  }, [planSettingsList]);

  useEffect(() => {
    if (selectedClassUuid && isNewClassOpen) {
      console.log("A class is selected and new class form is open, closing new class form.");
      dispatch(closeClassPanel());
    }
  }, [selectedClassUuid, isNewClassOpen, dispatch]);

  useEffect(() => {
    if (selectedPlanSettingsId !== null && selectedPlanSettingsId !== undefined) {
      setPage(0);
      refetchClasses();
    }
  }, [selectedPlanSettingsId, refetchClasses]);

  const getFilteredAndSortedClasses = () => {
    console.log("Filtering classes with planSettingsId:", selectedPlanSettingsId);
    console.log("Total classes before filtering:", classes.length);
    
    if (!classes || classes.length === 0) {
      console.log("No classes available to filter");
      return [];
    }
    
    const result = [...classes];
    
    if (selectedPlanSettingsId) {
      console.log(`Filtering ${result.length} classes by planSettingsId: ${selectedPlanSettingsId}`);
      const filtered = result.filter(cls => {
        const matches = cls && Number(cls.planSettingsId) === Number(selectedPlanSettingsId);
        return matches;
      });
      console.log(`After filtering: ${filtered.length} classes match planSettingsId ${selectedPlanSettingsId}`);
      return filtered;
    }
    
    return result;
  };

  useEffect(() => {
    if (location.pathname === "/classes" && !location.pathname.includes("/classes/")) {
      console.log("Direct navigation to /classes detected - resetting relevant state");
      dispatch(setSelectedScheduleIds([]));
      
      if (planSettingsList && planSettingsList.length > 0 && !selectedPlanSettingsId) {
        setSelectedPlanSettingsId(planSettingsList[0].id);
      }
    }
  }, [location.pathname, dispatch, planSettingsList, selectedPlanSettingsId]);

  // Prevent auto-closing of the form
  const handleCreateClassSuccess = () => {
    console.log("Class created successfully, keeping form open for potentially another new class.");
    // Don't automatically close the form - let user decide.
    // The form is already open via isNewClassOpen from Redux.
    // We might want to clear the form fields in NewClassModal itself after successful save.
    dispatch(openNewClassForm()); // Ensure it STAYS open if multiple additions are desired.
  };

  return (
      <div className="flex h-screen bg-background-main">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-hidden istui-timetable__main_content">
            {isLoadingClasses && (
                <div className="fixed top-0 left-0 w-full z-50">
                  <Progress
                      value={100}
                      className="h-1"
                      indicatorColor="animate-pulse bg-blue-500"
                  />
                </div>
            )}
            <div
                className="container-main mx-auto py-4 px-4 sm:px-6 h-full flex flex-col istui-timetable__main_content">
              <div className="flex justify-between items-center mb-4 istui-timetable__main_breadcrumbs_wrapper">
                <Breadcrumbs
                    className="istui-timetable__main_breadcrumbs"
                    items={[
                      {label: t("navigation.resources"), href: "/resources"},
                      {label: t("navigation.classes"), href: ""},
                    ]}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                  <Card className="overflow-hidden h-full flex flex-col border-0 shadow-md">
                    <div className="sticky top-0 z-10 bg-background border-b">
                      <CardHeader className="pb-2 bg-secondary">
                        <div className="flex items-center justify-between mb-1">
                          <div className={""}>
                            <CardTitle>
                              {t("common.classes")}
                              {typeof totalClasses === "number" && classes.length > 0 && (
                                <span className="text-muted-foreground text-sm font-normal ml-2">
                                  ({classes.length})
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                                onClick={handleAddNewClass}
                                size="sm"
                                disabled={isLoadingClasses}
                            >
                              {isLoadingClasses ? (
                                  <Spinner className="h-4 w-4 mr-2"/>
                              ) : (
                                  <Plus className="h-4 w-4 mr-2"/>
                              )}
                              {t("actions.add")}
                            </Button>
                            <CsvImport
                                onImport={(file, options) =>
                                    importClassesFromCsv({
                                        file,
                                        organizationId: options.organizationId || undefined,
                                        skipHeaderRow: options.skipHeaderRow,
                                        planSettingsId: selectedPlanSettingsId || undefined,
                                    }).unwrap()
                                }
                                buttonVariant="outline"
                                buttonSize="sm"
                                organizations={organizations}
                                selectedOrgId={selectedOrgId}
                                isAdmin={isAdmin}
                                organizationId={user?.organizationId ? Number(user.organizationId) : null}
                            />
                          </div>
                        </div>
                        <div className="mb-2 flex items-center gap-2">
        
                          <select
                            id="planSettingsId"
                            className="p-2 border rounded-md min-w-[200px]"
                            value={selectedPlanSettingsId || ""}
                            onChange={e => setSelectedPlanSettingsId(e.target.value ? Number(e.target.value) : null)}
                          >
                            <option value="">{t("class.form.selectPlanSettings")}</option>
                            {planSettingsList && planSettingsList.map((ps) => (
                              <option key={ps.id} value={ps.id}>
                                {ps.name} {selectedPlanSettingsId === ps.id ? '(Active)' : ''}
                              </option>
                            ))}
                          </select>
                          {selectedPlanSettingsId && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              Filtering by: {getPlanSettingName(selectedPlanSettingsId)}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <div className="p-4 border-b">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                              placeholder={t("class.searchClasses")}
                              className="pl-9 w-full istui-timetable__main_list_card_search_input"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <Popover
                            open={isOrgPopoverOpen}
                            onOpenChange={setIsOrgPopoverOpen}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className={selectedOrgId ? "bg-primary text-primary-foreground" : ""}
                                aria-label={t("organization.filterByOrganization")}
                              >
                                <Building className="h-4 w-4"/>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="end">
                              <div className="space-y-2">
                                <div className="font-medium text-sm">
                                  {t("organization.filterByOrganization")}
                                </div>
                                <div className="h-px bg-border"/>
                                <div className="h-px bg-border"/>
                                <div className="flex justify-between">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="w-full"
                                  >
                                    <RefreshCw className="h-3 w-3 mr-2"/>
                                    {t("common.resetFilters")}
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={handleToggleSortDirection}
                              aria-label={t(sortDirection === "asc" ? "common.sortAscending" : "common.sortDescending")}
                            >
                              {sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4"/>
                              ) : (
                                <ArrowDown className="h-4 w-4"/>
                              )}
                            </Button>
                          </div>
                        </div>
                        {(selectedOrgId || debouncedKeyword || selectedPlanSettingsId) && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {selectedPlanSettingsId && (
                                  <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                    <GraduationCap className="h-3 w-3"/>
                                    <span>
                                      {t("class.form.planSettings")}: {getPlanSettingName(selectedPlanSettingsId)}
                                    </span>
                                  </div>
                              )}
                              {selectedOrgId && (
                                  <div
                                      className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                    <Building className="h-3 w-3"/>
                                    <span>
                                {t("common.filter")}: {getOrganizationName(selectedOrgId)}
                              </span>
                                  </div>
                              )}
                              {debouncedKeyword && (
                                  <div
                                      className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                    <Search className="h-3 w-3"/>
                                    <span>"{debouncedKeyword}"</span>
                                  </div>
                              )}
                            </div>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                      <div
                          className="overflow-y-auto"
                          ref={listContainerRef}
                          style={{
                            maxHeight: "calc(100vh - 250px)",
                            scrollBehavior: "smooth",
                            overscrollBehavior: "contain"
                          }}
                      >
                        <div className="p-4">
                          {isInitialLoading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                              <Spinner className="h-8 w-8 mb-4" />
                              <p className="text-sm text-muted-foreground">Loading classes and settings...</p>
                            </div>
                          ) : isPlanSettingsLoading ? (
                            <div className="flex justify-center py-8">
                              <Spinner className="mr-2" />
                              <p>Loading plan settings...</p>
                            </div>
                          ) : isLoadingClasses && page === 0 ? (
                            <div className="flex justify-center py-8">
                              <Spinner />
                            </div>
                          ) : getFilteredAndSortedClasses().length > 0 ? (
                              <div className="space-y-2 mt-4">
                                {getFilteredAndSortedClasses().map((classItem) => (
                                    <div
                                        key={`${classItem.uuid}-${refreshKey}`}
                                        className={`p-3 rounded-md cursor-pointer flex items-center ${selectedClassUuid === classItem.uuid ? "bg-primary/10" : "hover:bg-muted"}`}
                                        onClick={() =>
                                            handleSelectClass(classItem.uuid)
                                        }
                                    >
                                      <div
                                          className="w-8 h-8 rounded-full flex items-center justify-center mr-3 text-white text-sm font-medium"
                                          style={{
                                            backgroundColor:
                                                classItem.color || "#6b7280",
                                          }}
                                      >
                                        {classItem.initial}
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-medium">
                                          {classItem.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {classItem.section} • {classItem.capacity}{" "}
                                          {t("class.students")}
                                        </div>
                                        {classItem.organizationId && (
                                            <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                              <Building className="h-3 w-3 mr-1 inline"/>
                                              {getOrganizationName(classItem.organizationId)}
                                            </div>
                                        )}
                                        {classItem.planSettingsId && (
                                          <div className="flex items-center">
                                            <GraduationCap className="h-3 w-3 mr-1 inline"/>
                                            {getPlanSettingName(classItem.planSettingsId)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                ))}
                                {(isFetching || isLoadingMore) && (
                                    <div className="text-center py-4 transition-opacity duration-300 ease-in-out">
                                      <div className="flex flex-col items-center">
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        <p className="text-sm mt-2 text-muted-foreground">
                                          {t("class.loadingMoreClasses")}
                                        </p>
                                      </div>
                                    </div>
                                )}
                                {!isLoadingMore &&
                                    hasMore &&
                                    getFilteredAndSortedClasses().length > 0 && (
                                        <div className="mt-4 mb-6 flex justify-center">
                                          <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={handleLoadMore}
                                              disabled={isLoadingClasses || isLoadingMore}
                                              className="min-w-[200px]"
                                          >
                                            {t("class.loadMoreClasses")}
                                          </Button>
                                        </div>
                                    )}
                                {hasMore && (
                                    <div
                                        ref={loadMoreRef}
                                        className="h-10 opacity-0"
                                        aria-hidden="true"
                                    />
                                )}
                              </div>
                          ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>{t("class.noClassesFound")}</p>
                                <p className="text-sm mt-1">
                                  {t("class.adjustSearch")}
                                </p>
                                {(selectedOrgId || debouncedKeyword) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetFilters}
                                        className="mt-4"
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2"/>
                                      {t("common.resetFilters")}
                                    </Button>
                                )}
                              </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-4 border-t text-xs text-muted-foreground">
                      <div className="font-medium mb-1">
                        {t("class.legend.title")}:
                      </div>
                      <div className="flex items-center mb-1">
                        <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-800 mr-2"></div>
                        <span>{t("class.legend.available")}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-800 mr-2"></div>
                        <span>{t("class.legend.selected")}</span>
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
                  <Card className="overflow-hidden h-full border-0 shadow-md">
                    {(selectedClassUuid || isNewClassOpen) ? (
                      <Tabs
                          value={activeTab}
                          onValueChange={handleTabChange}
                          className="h-full flex flex-col"
                      >
                        <DetailCardHeader 
                              tabs={[
                                { id: "details", label: t("teacher.tabs.details") },
                                { id: "preferences", label: t("teacher.tabs.schedulePreferences") }
                              ]}
                              activeTab={activeTab}
                              onTabChange={(tabId) => setActiveTab(tabId as "details" | "preferences")}
                            />
                        <TabsContent
                            value="details"
                            className="p-6 flex-1- flex flex-col "
                            key={`details-${refreshKey}`}
                        >
                          {isNewClassOpen ? (
                              <NewClassModal
                                  onSave={handleSaveNewClass}
                                  onClose={handleClosePanel}
                                  isLoading={isCreating}
                                  inlineMode={true}
                              />
                          ) : selectedClassUuid ? (
                              isLoadingSelectedClass ? (
                                  <div className="flex justify-center items-center py-10">
                                    <Spinner className="h-8 w-8 animate-spin text-primary mr-2"/>
                                    <p>{t("class.loading.details")}</p>
                                  </div>
                              ) : (
                                  <ClassForm
                                      classData={selectedClassData?.data}
                                      onCancel={handleClosePanel}
                                      isCreating={false}
                                      onUpdate={handleClassUpdated}
                                  />
                              )
                          ) : null}
                        </TabsContent>
                        <TabsContent
                            value="preferences"
                            className="p-6 flex-1 overflow-auto"
                        >
                          {selectedClassUuid ? (
                              <ClassScheduleCalendar
                                  selectedClassUuid={selectedClassUuid}
                                  selectedScheduleIds={selectedScheduleIds}
                                  onCellClick={handleCalendarCellClick}
                              />
                          ) : (
                              <div className="text-center py-10 text-muted-foreground">
                                <p>{t("class.empty.selectSchedulePrompt")}</p>
                              </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <EmptyState
                          icon={<GraduationCap />}
                          title={t("class.emptyState.title")}
                          description={t("class.emptyState.description")}
                          onAdd={handleAddNewClass}
                          showImport={true}
                          onImport={(file, options) => 
                            importClassesFromCsv({
                              file,
                              organizationId: options.organizationId || undefined,
                              skipHeaderRow: options.skipHeaderRow,
                              planSettingsId: selectedPlanSettingsId || undefined,
                            }).unwrap()
                          }
                          organizations={organizations}
                          selectedOrgId={selectedOrgId}
                          organizationId={user?.organizationId ? Number(user.organizationId) : null}
                          isAdmin={isAdmin}
                          hasPermission={true}
                        />
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
        <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("class.deleteClass.title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("class.deleteClass.description")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Spinner className="h-4 w-4 mr-2"/>}
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="hidden">
          <CsvImport
            onImport={(file, options) =>
              importClassesFromCsv({
                file,
                organizationId: options.organizationId || undefined,
                skipHeaderRow: options.skipHeaderRow,
                planSettingsId: selectedPlanSettingsId || undefined,
              }).unwrap()
            }
            buttonVariant="outline"
            buttonSize="sm"
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            isAdmin={isAdmin}
            organizationId={user?.organizationId ? Number(user.organizationId) : null}
          />
        </div>
      </div>
  );

}

export default PageClass;