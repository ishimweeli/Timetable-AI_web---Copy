import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs.tsx";
import ClassBandList from "@/component/ClassBand/ClassBandList";
import ClassBandForm from "@/component/ClassBand/ClassBandForm";
import ClassBandScheduleCalendar from "@/component/ClassBand/ClassBandScheduleCalendar";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Building,
  RefreshCw,
  X,
  Check,
  CheckCheck,
  Trash2,
  Layers
} from "lucide-react";
import { Input } from "@/component/Ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/component/Ui/dropdown-menu";

import { Button } from "@/component/Ui/button";
import {
  selectSelectedClassBandUuid,
  selectIsNewClassBandOpen,
  setSelectedClassBand,
  openNewClassBandForm,
  closeClassBandPanel,
  setSelectedScheduleIds,
} from "@/store/ClassBand/SliceClassBand";

import {
  useGetClassBandsQuery,
  useGetClassBandQuery,
  useCreateClassBandMutation,
  useUpdateClassBandMutation,
  useDeleteClassBandMutation,
} from "@/store/ClassBand/ApiClassBand";

import { CreateClassBandRequest, TypeClassBand } from "@/type/ClassBand/TypeClassBand";
import { useToast } from "@/component/Ui/use-toast";
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { useI18n } from "@/hook/useI18n";
import { useDebounce } from "@/hook/useDebounce";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/Ui/popover";
import { Label } from "@/component/Ui/label";
import { Spinner } from "@/component/Ui/spinner";

import { useGetOrganizationsQuery } from "@/store/Class/ApiClass";
import { Progress } from "@/component/Ui/progress.tsx";
import { RadioGroup, RadioGroupItem } from "@/component/Ui/radio-group";
import EmptyState from "@/component/common/EmptyState";
import DetailCardHeader from "@/component/Common/DetailCardHeader";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";

const PageClassBand: React.FC = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { uuid } = useParams<{ uuid: string }>();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"info" | "preferences">("info");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const debouncedSearch = useDebounce(searchKeyword, 300);

  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [selectedPlanSettingsId, setSelectedPlanSettingsId] = useState<number | null>(null);

  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [allClassBands, setAllClassBands] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>();

  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);
  const fetchPlanSettingsByOrganizationPaginated = usePlanSettingsStore((state) => state.fetchPlanSettingsByOrganizationPaginated);

  const selectedClassBandUuid = useAppSelector(selectSelectedClassBandUuid);
  const isNewClassBandOpen = useAppSelector(selectIsNewClassBandOpen);
  const selectedScheduleIds = useAppSelector(
    (state) => state.classBand.selectedScheduleIds || [],
  );

  const { data: organizationsResponse, isLoading: isLoadingOrganizations } =
    useGetOrganizationsQuery();
  const organizations = organizationsResponse?.data || [];

  const queryParams = {
    page: page || 0,
    size: pageSize || 10,
    sortBy: "name",
    sortDirection: "asc" as "asc" | "desc",
    ...(debouncedSearch && { keyword: debouncedSearch }),
    ...(selectedOrgId && { orgId: selectedOrgId }),
    ...(selectedPlanSettingsId && { planSettingsId: selectedPlanSettingsId }),
  };

  const {
    data: classBandsResponse,
    isLoading,
    isFetching,
    refetch: refetchClassBands,
  } = useGetClassBandsQuery(queryParams, {
    refetchOnMountOrArgChange: false, // Prevent auto-refetching
  });

  const { data: selectedClassBand, refetch: refetchClassBand } =
    useGetClassBandQuery(selectedClassBandUuid || "", {
      skip: !selectedClassBandUuid,
    });

  const [createClassBand] = useCreateClassBandMutation();
  const [updateClassBand] = useUpdateClassBandMutation();
  const [deleteClassBand] = useDeleteClassBandMutation();

  const hasProcessedUrlRef = useRef(false);
  const initialLoadRef = useRef(true);
  const isNavigatingRef = useRef(false);

  const [isFormLoading, setIsFormLoading] = useState(true);

  const [totalClassBands, setTotalClassBands] = useState(0);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const hasInitialDataLoaded = useRef(false);

  // Add these state variables near the other state declarations
  const [autoLoadingInProgress, setAutoLoadingInProgress] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);

  // We don't need the forceRender state anymore

  // Make sure handleLoadMore is defined before any useEffect that depends on it
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isFetching && !isLoadingMore) {
      // Store current scroll position before loading more
      if (listContainerRef.current) {
        setScrollPosition(listContainerRef.current.scrollTop);
      }

      // Show loading state
      setIsLoadingMore(true);
      setAutoLoadingInProgress(true);

      // Load next page
      const nextPage = page + 1;
      setPage(nextPage);
    }
  }, [hasMore, isFetching, isLoadingMore, page]);

  // Add this effect to handle scroll events
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
            // Store current scroll position before loading more
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

  // Add this effect to restore scroll position
  useEffect(() => {
    if (listContainerRef.current && scrollPosition > 0 && allClassBands.length > 0) {
      // Use a small timeout to ensure the DOM has updated
      const timer = setTimeout(() => {
        if (listContainerRef.current) {
          listContainerRef.current.scrollTop = scrollPosition;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [allClassBands.length, scrollPosition]);

  // Fetch plan settings when organization is selected
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

  // Set default organization and fetch plan settings
  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if(userData) {
      try {
        const user = JSON.parse(userData);
        if(user.organizationId && !selectedOrgId) {
          setSelectedOrgId(Number(user.organizationId));
          fetchPlanSettingsByOrganizationPaginated(user.organizationId.toString(), 0, 100);
        }
      } catch(e) {
        /* ignore parse error */
      }
    }
  }, [selectedOrgId, fetchPlanSettingsByOrganizationPaginated]);

  // Set default plan setting when plan settings list is loaded
  useEffect(() => {
    if (planSettingsList && planSettingsList.length > 0 && !selectedPlanSettingsId) {
      console.log("Setting default planSetting:", planSettingsList[0]);
      setSelectedPlanSettingsId(planSettingsList[0].id);
    }
  }, [planSettingsList, selectedPlanSettingsId]);

  // Initialize scrollbar visibility
  useEffect(() => {
    if (listContainerRef.current) {
      listContainerRef.current.style.overflow = 'scroll';
    }
  }, []);

  // Handle form loading states
  useEffect(() => {
    if (selectedClassBandUuid) {
      setIsFormLoading(true);
    }
  }, [selectedClassBandUuid]);

  useEffect(() => {
    if (selectedClassBandUuid && selectedClassBand?.data) {
      setIsFormLoading(false);
    } else if (isNewClassBandOpen) {
      setIsFormLoading(false);
    }
  }, [selectedClassBandUuid, selectedClassBand, isNewClassBandOpen]);

  // Process URL parameters on initial load
  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;

      if (uuid && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid)) {
        dispatch(setSelectedClassBand(uuid));
        hasProcessedUrlRef.current = true;
      }
    }
  }, [uuid, dispatch]);

  // Handle navigation synchronization with selected class band
  useEffect(() => {
    if (selectedClassBandUuid && (!uuid || uuid !== selectedClassBandUuid) && !isNavigatingRef.current) {
      isNavigatingRef.current = true;
      navigate(`/classband/${selectedClassBandUuid}`, { replace: true });
      isNavigatingRef.current = false;
    } else if (!selectedClassBandUuid && uuid && location.pathname.includes(uuid) && !isNavigatingRef.current) {
      isNavigatingRef.current = true;
      navigate("/classband", { replace: true });
      isNavigatingRef.current = false;
    }
  }, [selectedClassBandUuid, uuid, navigate, location.pathname]);

  // Fetch selected class band data when needed
  useEffect(() => {
    if (selectedClassBandUuid && !selectedClassBand && !isLoadingMore) {
      refetchClassBand();
    }
  }, [selectedClassBandUuid, selectedClassBand, refetchClassBand, isLoadingMore]);

  // Refetch class bands if data is missing
  useEffect(() => {
    if (!classBandsResponse && !isLoading && !isFetching) {
      refetchClassBands();
    }
  }, [classBandsResponse, isLoading, isFetching, refetchClassBands]);

  // Update the data processing effect to match PageOrganization's approach
  useEffect(() => {
    if (classBandsResponse) {
      const newClassBands = classBandsResponse.data || [];
      const totalCount = classBandsResponse.totalItems;
      const receivedCount = newClassBands.length;

      // Get unique new class bands
      const getUniqueNewBands = () => {
        const existingBandsMap = new Map<string, boolean>();
        allClassBands.forEach((band: TypeClassBand) => {
          existingBandsMap.set(band.uuid, true);
        });
        return newClassBands.filter((band: TypeClassBand) => !existingBandsMap.has(band.uuid));
      };

      let updatedClassBands: TypeClassBand[];

      if (page === 0) {
        // First page - replace all data
        updatedClassBands = newClassBands;
        setAllClassBands(updatedClassBands);

        // Update total count
        if (totalCount !== undefined && totalCount !== null) {
          setTotalClassBands(totalCount);
        } else {
          setTotalClassBands(receivedCount);
        }
      } else {
        // Subsequent pages - append unique new data
        const newUniqueBands = getUniqueNewBands();
        updatedClassBands = [...allClassBands, ...newUniqueBands];
        setAllClassBands(updatedClassBands);

        // Update total count if available from API
        if (totalCount !== undefined && totalCount !== null) {
          setTotalClassBands(totalCount);
        } else {
          // If no total count, increment by the number of new unique items
          setTotalClassBands(prev => prev + newUniqueBands.length);
        }
      }

      // Determine if more items are available
      if (totalCount !== undefined) {
        // If we have a total count from the API, use it
        setHasMore(updatedClassBands.length < totalCount);
      } else {
        // If no total count, assume there are more if we received a full page
        setHasMore(receivedCount === pageSize);
      }

      setIsLoadingMore(false);
      setAutoLoadingInProgress(false);
      hasInitialDataLoaded.current = true;
    }
  }, [classBandsResponse, page, allClassBands, pageSize]);

  // Update the API call to reset loading states on completion
  useEffect(() => {
    refetchClassBands().finally(() => {
      setIsLoadingMore(false);
      setAutoLoadingInProgress(false);
    });
  }, [page, pageSize, debouncedSearch, selectedStatus, selectedOrgId, selectedPlanSettingsId, refetchClassBands]);

  // Reset page and refetch when plan settings change
  useEffect(() => {
    if (selectedPlanSettingsId !== null && selectedPlanSettingsId !== undefined) {
      setPage(0);
      setAllClassBands([]); // Clear existing data when plan settings change
      hasInitialDataLoaded.current = false;
      refetchClassBands();
    }
  }, [selectedPlanSettingsId, refetchClassBands]);

  // Function to handle search input changes
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
    setPage(0);
    setAllClassBands([]); // Clear existing data when search changes
    hasInitialDataLoaded.current = false;
    setAutoLoadingInProgress(false);
    setIsLoadingMore(false);
  };

  // Update the handleFilter function to reset loading states
  const handleFilter = (status: string) => {
    setSelectedStatus(status);
    setPage(0);
    setAllClassBands([]); // Clear existing data when filter changes
    hasInitialDataLoaded.current = false;
    setAutoLoadingInProgress(false);
    setIsLoadingMore(false);
  };

  // Update the handleOrganizationSelect function to reset loading states
  const handleOrganizationSelect = (orgId: number | null) => {
    setSelectedOrgId(orgId);
    setPage(0);
    setAllClassBands([]); // Clear existing data when organization changes
    hasInitialDataLoaded.current = false;
    setAutoLoadingInProgress(false);
    setIsLoadingMore(false);
    setIsOrgPopoverOpen(false);
  };

  // Update the handleResetFilters function to reset loading states
  const handleResetFilters = () => {
    setSelectedStatus("all");
    setSelectedOrgId(null);
    setSelectedPlanSettingsId(null);
    setSearchKeyword("");
    setPage(0);
    setAllClassBands([]); // Clear existing data when filters are reset
    hasInitialDataLoaded.current = false;
    setAutoLoadingInProgress(false);
    setIsLoadingMore(false);
    setIsOrgPopoverOpen(false);
  };

  const getPlanSettingName = (id: number | null) => {
    if(!id || !planSettingsList) return "";
    const planSetting = planSettingsList.find((ps) => ps.id === id);
    return planSetting ? planSetting.name : "";
  };

  const handleSelectClassBand = (uuid: string) => {
    if (uuid !== selectedClassBandUuid) {
      if (isNewClassBandOpen) {
        dispatch(closeClassBandPanel());
      }
      dispatch(setSelectedClassBand(uuid));
      navigate(`/classband/${uuid}`);
    }
  };

  const handleNewClassBand = () => {
    dispatch(openNewClassBandForm());
  };

  const handleSave = async (data: CreateClassBandRequest) => {
    try {
      setApiError(undefined);
      if (isNewClassBandOpen) {
        // Include planSettingsId in the create request
        const enhancedData = {
          ...data,
          planSettingsId: selectedPlanSettingsId || undefined
        };
        await createClassBand(enhancedData).unwrap();
        toast({
          title: t("common.success"),
          description: t("classBand.createSuccess"),
        });
      } else if (selectedClassBandUuid) {
        // Include planSettingsId in the update request
        const enhancedData = {
          ...data,
          planSettingsId: selectedPlanSettingsId || undefined
        };
        await updateClassBand({
          uuid: selectedClassBandUuid,
          classBand: enhancedData,
        }).unwrap();
        toast({
          title: t("common.success"),
          description: t("classBand.updateSuccess"),
        });
        refetchClassBand();
      }
      dispatch(closeClassBandPanel());
    } catch (error: any) {
      console.error("Error saving class band:", error);
      let errorMessage = t("classBand.errorSavingClassBand");

      if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (typeof error?.message === "string") {
        errorMessage = error.message;
      }

      if (errorMessage.includes("No changes")) {
        toast({
          title: t("common.info"),
          description: errorMessage,
        });
      } else {
        setApiError(errorMessage);
        toast({
          title: t("common.error"),
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  const handleCancel = () => {
    dispatch(setSelectedClassBand(null));
    dispatch(closeClassBandPanel());
    dispatch(setSelectedScheduleIds([]));
    setTimeout(() => {
      navigate("/classband", {
        replace: true,
        state: { refresh: Date.now() },
      });
    }, 100);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedClassBandUuid) return;
    try {
      setIsDeleting(true);
      await deleteClassBand(selectedClassBandUuid).unwrap();
      toast({
        title: t("common.success"),
        description: t("classBand.classBandDeleted"),
      });
      dispatch(setSelectedClassBand(null));
      dispatch(closeClassBandPanel());
      dispatch(setSelectedScheduleIds([]));
      setTimeout(() => {
        navigate("/classband", {
          replace: true,
          state: { refresh: Date.now() },
        });
        refetchClassBands();
      }, 100);
    } catch (error: any) {
      console.error("Error deleting class band:", error);
      let errorMessage = t("classBand.errorDeletingClassBand");

      if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (typeof error?.message === "string") {
        errorMessage = error.message;
      }

      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background-main">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-hidden istui-timetable__main_content">
          {(isLoading || isFormLoading) && (
            <div className="fixed top-0 left-0 w-full z-50">
              <Progress
                value={100}
                className="h-1"
                indicatorColor="animate-pulse bg-blue-500"
              />
            </div>
          )}
          <div className="container-main mx-auto py-4 px-4 sm:px-6 h-full flex flex-col istui-timetable__main_content">
            <div className="flex justify-between items-center mb-4 istui-timetable__main_breadcrumbs_wrapper">
              <Breadcrumbs
                className="istui-timetable__main_breadcrumbs"
                items={[
                  { label: t("navigation.resources"), href: "/resources" },
                  { label: t("common.classBands"), href: "" },
                  ...(selectedClassBandUuid && selectedClassBand
                    ? [
                      {
                        label: selectedClassBand.name,
                        href: `/classband/${selectedClassBandUuid}`,
                      },
                    ]
                    : []),
                ]}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
              <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                <Card className="overflow-hidden h-full flex flex-col border-0 shadow-md">
                  <div className="sticky top-0 z-10 bg-background border-b">
                    <CardHeader className="pb-2 bg-secondary">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>
                            {t("common.classBands")}
                            {typeof totalClassBands === "number" && allClassBands.length > 0 && (
                              <span className="text-muted-foreground text-sm font-normal ml-2">
                                ({allClassBands.length})
                              </span>
                            )}
                          </CardTitle>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            className="istui-timetable__main_list_card_button"
                            size="sm"
                            onClick={handleNewClassBand}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {t("actions.add")}
                          </Button>
                        </div>
                      </div>
                      <div className="mb-2 flex items-center gap-2">
                    
                        <select
                          id="planSettingsId"
                          className="p-2 border rounded-md min-w-[200px]"
                          value={selectedPlanSettingsId?.toString() || ""}
                          onChange={e => setSelectedPlanSettingsId(e.target.value ? Number(e.target.value) : null)}
                        >
                          <option value="">{t("class.form.selectPlanSettings")}</option>
                          {planSettingsList && planSettingsList.map((ps) => (
                            <option key={ps.id} value={ps.id?.toString()}>
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
                      <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="search"
                            placeholder={t("actions.search")}
                            className="pl-8"
                            value={searchKeyword}
                            onChange={handleSearchInputChange}
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
                              className={
                                selectedOrgId
                                  ? "bg-primary text-primary-foreground"
                                  : ""
                              }
                              aria-label={t("common.filterByOrganization")}
                            >
                              <Building className="h-4 w-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-2" align="end">
                            <div className="space-y-2">
                              <div className="font-medium text-sm">
                                {t("common.filterBy")}{" "}
                                {t("common.organization")}
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
                                      {t("common.all")} {t("common.organizations")}
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
                      </div>
                    </div>
                    <div className="p-2 border-b">
                      <div className="flex justify-between items-center px-2 py-1 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <span>{t("common.sortBy")}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                          >
                            <span>{t("common.name")}</span>
                            <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8">
                              <Filter className="h-3.5 w-3.5 mr-1" />
                              <span>{t("common.filter")}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>
                              {t("common.filterBy")}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleFilter("all")}
                              className={
                                selectedStatus === "all" ? "bg-accent" : ""
                              }
                            >
                              {t("common.all")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleFilter("active")}
                              className={
                                selectedStatus === "active" ? "bg-accent" : ""
                              }
                            >
                              {t("common.active")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleFilter("inactive")}
                              className={
                                selectedStatus === "inactive" ? "bg-accent" : ""
                              }
                            >
                              {t("common.inactive")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <div
                    ref={listContainerRef}
                    className="overflow-y-scroll"
                    style={{
                      height: "calc(100vh - 250px)",
                      scrollBehavior: "auto"
                    }}
                  >
                    <ClassBandList
                      classBands={allClassBands}
                      onSelectClassBand={handleSelectClassBand}
                      selectedClassBandUuid={selectedClassBandUuid}
                      isLoading={isLoading && page === 0}
                      isFetching={isFetching}
                      hasMore={hasMore}
                      isLoadingMore={isLoadingMore}
                      onLoadMore={handleLoadMore}
                      disableInfiniteScroll={true}
                      showEndOfList={!hasMore && allClassBands.length > 0}
                    />

                    {/* Load More button is now handled in ClassBandList component */}

                    {/* Empty state message */}
                    {!isLoading && !isFetching && allClassBands.length === 0 && (
                      <EmptyState
                        icon={<Layers className="h-10 w-10" />}
                        title={t("classBand.noClassBandsFound")}
                        description={t("classBand.tryAnotherSearch")}
                        customButtons={
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetFilters}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            {t("common.resetFilters")}
                          </Button>
                        }
                      />
                    )}
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col istui-timetable__main_form_card">
                <Card className="overflow-hidden h-full border-0 shadow-md istui-timetable__main_card">
                  {(selectedClassBandUuid || isNewClassBandOpen) ? (
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "info" | "preferences")} className="h-full flex flex-col">
                      <DetailCardHeader
                        tabs={[
                          { id: "info", label: t("teacher.tabs.details") },
                          { id: "preferences", label: t("teacher.tabs.schedulePreferences") }
                        ]}
                        activeTab={activeTab}
                        onTabChange={(value) => setActiveTab(value as "info" | "preferences")}
                      />
                      <div className="flex-1 overflow-y-auto p-4">
                        {activeTab === "info" ? (
                          isFormLoading && selectedClassBandUuid && !isNewClassBandOpen ? (
                            <div className="flex items-center justify-center h-full">
                              <Spinner className="h-8 w-8" />
                            </div>
                          ) : (
                            <ClassBandForm
                              initialData={isNewClassBandOpen ? { planSettingsId: selectedPlanSettingsId } : selectedClassBand?.data}
                              isCreateMode={isNewClassBandOpen}
                              onSubmit={handleSave}
                              footer={
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="istui-timetable__main_form_cancel_button"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    {t("common.cancel")}
                                  </Button>
                                  {!isNewClassBandOpen && selectedClassBandUuid && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      type="button"
                                      onClick={handleDeleteClick}
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
                                  >
                                    {isNewClassBandOpen
                                      ? <><CheckCheck className="h-4 w-4 mr-2" />{t("common.create")}</>
                                      : <><Check className="h-4 w-4 mr-2" />{t("common.update")}</>}
                                  </Button>
                                </div>
                              }
                              planSettingsList={planSettingsList || []}
                            />
                          )
                        ) : (
                          <ClassBandScheduleCalendar
                            classBandUuid={selectedClassBandUuid || ""}
                            selectedScheduleIds={selectedScheduleIds}
                            onScheduleSelect={(scheduleIds: string[]) => {
                              dispatch(setSelectedScheduleIds(scheduleIds));
                            }}
                          />
                        )}
                      </div>
                    </Tabs>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="mb-6 p-6 rounded-full bg-muted/30 text-primary">
                        <Layers className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">
                        {t("classBand.noClassBandSelected")}
                      </h3>
                      <p className="text-muted-foreground mb-6 max-w-md text-base leading-relaxed">
                        {t("classBand.description")}
                      </p>
                      <Button onClick={handleNewClassBand}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t("actions.add")}
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <DeleteConfirmation
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title={t("common.deleteConfirmTitle")}
        description={`${t("common.deleteConfirmMessage").replace("{moduleName}", t("common.classBand"))} ${selectedClassBand?.data?.name
            ? `(${selectedClassBand.data.name})`            : ""
          }`}
        showTrigger={false}
      />


    </div>
  );
};

export default PageClassBand;
