import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import { Input } from "@/component/Ui/input";
import { Button } from "@/component/Ui/button";
import {
  Plus,
  Trash2,
  Search,
  Building,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Sliders
} from "lucide-react";
import { Spinner } from "@/component/Ui/spinner";
import { Shield } from "lucide-react";
import { useToast } from "@/hook/useToast";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import PlanSettings from "@/component/PlanSetting/PlanSettings";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import { useI18n } from "@/hook/useI18n";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/component/Ui/tabs";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { useNavigate, useParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { debounce } from "lodash";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/Ui/popover";
import { Checkbox } from "@/component/Ui/checkbox";
import { Label } from "@/component/Ui/label";
import { Progress } from "@/component/Ui/progress";
import { RadioGroup, RadioGroupItem } from "@/component/Ui/radio-group";
import DetailCardHeader from "@/component/Common/DetailCardHeader";

const PagePlanSettings = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedUuid, setSelectedUuid] = useState(uuid || null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [planSettings, setPlanSettings] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortBy, setSortBy] = useState("name");
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
    triggerOnce: false,
  });
  const listContainerRef = useRef(null);
  const planSettingsList = usePlanSettingsStore(
      (state) => state.planSettingsList,
  );
  const isFetching = usePlanSettingsStore((state) => state.loading);
  const totalItemsFromStore = usePlanSettingsStore((state) => state.totalItems);
  const fetchPlanSettingsByOrganizationPaginated = usePlanSettingsStore(
      (state) => state.fetchPlanSettingsByOrganizationPaginated,
  );
  const fetchPlanSettingsByUuid = usePlanSettingsStore(
      (state) => state.fetchPlanSettingsByUuid,
  );
  const deletePlanSettings = usePlanSettingsStore(
      (state) => state.deletePlanSettings,
  );
  const clearPlanSettings = usePlanSettingsStore(
      (state) => state.clearPlanSettings,
  );
  const formatErrorMessage = (err: any) => {
    if(!err) return t("common.error.unexpected");
    if(
        typeof err === "string" &&
        (err.includes("planning.settings.exists") ||
            err.includes("[planning.settings.exists]"))
    )
      return t("planSettings.errors.alreadyExists");
    if(err.response?.data?.message) return err.response.data.message;
    if(err.response?.data?.error) return err.response.data.error;
    if(err.message) return err.message;
    return t("common.error.unexpected");
  };
  const fetchOrganizations = async () => {
    setIsLoadingOrganizations(true);
    try {
      const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const url = `${API_BASE_URL}/api/v1/organizations`;
      const token = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if(token) headers["Authorization"] = token;
      const response = await fetch(url, { headers });
      if(!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setOrganizations(data.data || []);
    }catch(error) {
      toast({
        description: t("common.organizationFetchError"),
        variant: "destructive",
      });
    } finally {
      setIsLoadingOrganizations(false);
    }
  };
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  useEffect(() => {
    setIsLoading(true);
    setHasMore(true);
    setPlanSettings([]);
    setPage(0);
    fetchOrganizations();
    fetchPlanSettingsByOrganizationPaginated(
        selectedOrgId !== null ? selectedOrgId.toString() : undefined,
        0,
        pageSize,
        debouncedKeyword,
        sortBy,
        sortDirection,
    );
  }, [debouncedKeyword, sortDirection, sortBy, selectedOrgId]);
  useEffect(() => {
    if(planSettingsList) {
      if(page === 0) {
        setPlanSettings(planSettingsList || []);
      }else {
        setPlanSettings((prev) => {
          const existingIds = new Set(prev.map((s) => s.uuid));
          const newSettings = (planSettingsList || []).filter(
              (s) => !existingIds.has(s.uuid),
          );
          return [...prev, ...newSettings];
        });
      }
      setTotalItems(totalItemsFromStore || 0);
      if(!planSettingsList || planSettingsList.length < pageSize) {
        setHasMore(false);
      }else {
        setHasMore(true);
      }
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [planSettingsList, page, pageSize, totalItemsFromStore]);
  const [showForm, setShowForm] = useState(false);
  useEffect(() => {
    if(uuid) {
      if(uuid === "new") {
        clearPlanSettings();
        setSelectedUuid("new");
        setIsCreateMode(true);
        setShowForm(true);
        sessionStorage.removeItem("currentPlanSettingId");
        sessionStorage.removeItem("currentPlanSettings");
      }else {
        setSelectedUuid(uuid);
        setIsCreateMode(false);
        setShowForm(true);
        fetchPlanSettingsByUuid(uuid);
        sessionStorage.setItem("currentPlanSettingId", uuid);
      }
    }else {
      const storedUuid = sessionStorage.getItem("currentPlanSettingId");
      if(storedUuid) {
        setSelectedUuid(storedUuid);
        setIsCreateMode(false);
        setShowForm(true);
        fetchPlanSettingsByUuid(storedUuid);
        navigate(`/plansetting/${storedUuid}`, { replace: true });
      }else {
        setSelectedUuid(null);
        setIsCreateMode(false);
        setShowForm(false);
      }
    }
  }, [uuid, navigate, fetchPlanSettingsByUuid, clearPlanSettings]);
  const debouncedSearch = useCallback(
      debounce((value) => {
        setSearchTerm(value);
        setPage(0);
        setHasMore(true);
      }, 300),
      [],
  );
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlanSettingsByOrganizationPaginated(
        selectedOrgId !== null ? selectedOrgId.toString() : undefined,
        0,
        pageSize,
        debouncedKeyword,
        sortBy,
        sortDirection,
    );
  };
  const handleLoadMore = () => {
    if(hasMore && !isFetching && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
      fetchPlanSettingsByOrganizationPaginated(
          selectedOrgId !== null ? selectedOrgId.toString() : undefined,
          page + 1,
          pageSize,
          debouncedKeyword,
          sortBy,
          sortDirection,
      );
    }
  };
  const handleCreateNew = () => {
    setShowForm(true);

    clearPlanSettings();
    setSelectedUuid("new");
    setIsCreateMode(true);
    setActiveTab("general");

    sessionStorage.removeItem("currentPlanSettingId");
    sessionStorage.removeItem("currentPlanSettings");

    if(!window.location.pathname.includes('/plansetting/new')) {
      navigate("/plansetting/new", { replace: true });
    }
  };
  const handleCreateNewFromDetailPanel = () => {
    setShowForm(true);

    clearPlanSettings();
    setSelectedUuid("new");
    setIsCreateMode(true);
    setActiveTab("general");

    sessionStorage.removeItem("currentPlanSettingId");
    sessionStorage.removeItem("currentPlanSettings");

    if(!window.location.pathname.includes('/plansetting/new')) {
      navigate("/plansetting/new", { replace: true });
    }
  };
  const handleSelectItem = (uuid: string) => {
    setIsCreateMode(false);
    setSelectedUuid(uuid);
    setActiveTab("general");


    fetchPlanSettingsByUuid(uuid);


    sessionStorage.setItem("currentPlanSettingId", uuid);


    const selectedSetting = planSettings.find(setting => setting.uuid === uuid);
    if(selectedSetting) {

      sessionStorage.setItem("currentPlanSettings", JSON.stringify(selectedSetting));
    }

    navigate(`/plansetting/${uuid}`, { replace: true });
  };
  const handleCancel = () => {
    setSelectedUuid(null);
    setIsCreateMode(false);
    setShowForm(false);
    setActiveTab("general");
    navigate("/plansetting", { replace: true });
  };
  const handleSaveComplete = () => {
    fetchPlanSettingsByOrganizationPaginated(
        selectedOrgId !== null ? selectedOrgId.toString() : undefined,
        0,
        pageSize,
        debouncedKeyword,
        sortBy,
        sortDirection,
    );
    toast({
      description: isCreateMode
          ? t("planSettings.createSuccess")
          : t("planSettings.updateSuccess"),
    });
    setSelectedUuid(null);
    setIsCreateMode(false);
    setActiveTab("general");
    navigate("/plansetting", { replace: true });
    sessionStorage.removeItem("currentPlanSettings");
  };
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState<string | null>(null);
  const [isDeletingLocal, setIsDeleting] = useState(false);
  const handleDelete = (uuid: string) => {
    setSettingToDelete(uuid);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if(!settingToDelete) return;
    try {
      setIsDeleting(true);
      await deletePlanSettings(settingToDelete);
      toast({ description: t("planSettings.deleteSuccess") });
      if(selectedUuid === settingToDelete) {
        setSelectedUuid(null);
        setIsCreateMode(false);
        navigate("/plansetting", { replace: true });
      }
      fetchPlanSettingsByOrganizationPaginated(
          selectedOrgId !== null ? selectedOrgId.toString() : undefined,
          0,
          pageSize,
          debouncedKeyword,
          sortBy,
          sortDirection,
      );
    }catch(err) {
      toast({ variant: "destructive", description: formatErrorMessage(err) });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSettingToDelete(null);
    }
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
    setSortBy("name");
    setPage(0);
    setIsOrgPopoverOpen(false);
  };
  const handleToggleSortDirection = () => {
    const newDirection = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(newDirection);
    setPage(0);
  };
  const getOrganizationName = (id: number | null) => {
    if(!id) return "";
    const org = organizations.find((org) => org.id === id);
    return org ? org.name : "";
  };
  useEffect(() => {
    if(
        inView &&
        hasMore &&
        !isFetching &&
        !isLoadingMore &&
        planSettings.length > 0
    ) {
      handleLoadMore();
    }
  }, [inView, hasMore, isFetching, isLoadingMore, planSettings.length]);
  const isLoadingAny = isFetching || isDeletingLocal;
  useEffect(() => {
    return () => {

    };
  }, []);
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
              <div className="flex justify-between items-center mb-4 istui-timetable__main_breadcrumbs_wrapper">
                <Breadcrumbs
                    className="istui-timetable__main_breadcrumbs"
                    items={[
                      { label: t("navigation.schedule"), href: "/schedules" },
                      { label: t("navigation.planSettings"), href: "" },
                    ]}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                  <Card className="flex-1 overflow-hidden">
                    <div className="">
                      <div className="sticky top-0 z-10 bg-background border-b">
                        <CardHeader className="pb-1 bg-secondary">
                          <div className="flex items-center justify-between mb-1">
                            <div className={""}>
                              <CardTitle>
                                {t("planSettings.title")}
                                {typeof totalItems === "number" && planSettings.length > 0 && (
                                  <span className="text-muted-foreground text-sm font-normal ml-2">
                                    ({planSettings.length})
                                  </span>
                                )}
                              </CardTitle>
                            </div>
                            <Button
                                className="istui-timetable__main_list_card_button"
                                size="sm"
                                onClick={handleCreateNew}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t("actions.add")}
                            </Button>
                          </div>
                          <CardDescription></CardDescription>
                        </CardHeader>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="relative flex-1">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={t("planSettings.search")}
                                className="pl-8 h-10 border-gray-200 istui-timetable__main_list_card_search_input"
                                value={searchTerm}
                                onChange={handleSearchChange}
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
                                    selectedOrgId !== null
                                        ? "bg-primary text-primary-foreground"
                                        : ""
                                  }
                                  aria-label={t("organization.filterByOrganization")}
                              >
                                <Building className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="end">
                              <div className="space-y-2">
                                <div className="font-medium text-sm">
                                  {t("organization.filterByOrganization")}
                                </div>
                                <div className="h-px bg-border" />
                                {isLoadingOrganizations ? (
                                    <div className="py-2 flex items-center justify-center">
                                      <Spinner className="h-4 w-4 mr-2" />
                                      <span className="text-sm">{t("common.loading")}</span>
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
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={handleToggleSortDirection}
                              aria-label={t(
                                  sortDirection === "asc"
                                      ? "common.sortAscending"
                                      : "common.sortDescending"
                              )}
                          >
                            {sortDirection === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {(selectedOrgId !== null || debouncedKeyword) && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {selectedOrgId !== null && (
                                <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                  <Building className="h-3 w-3" />
                                  <span>
                              {t("common.filter")}: {getOrganizationName(selectedOrgId)}
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
                    <div className="overflow-auto h-[calc(100vh-300px)] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
                      {isLoading && page === 0 ? (
                          <div className="flex justify-center items-center h-32">
                            <Spinner size="lg" />
                          </div>
                      ) : planSettings.length === 0 ? (
                          <div className="text-center p-8">
                            <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-lg font-medium">
                              {t("planSettings.noItemsFound")}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {t("planSettings.createNew")}
                            </p>
                            <Button onClick={handleCreateNewFromDetailPanel}>
                              <Plus className="mr-2 h-4 w-4" />
                              {t("actions.add")}
                            </Button>
                          </div>
                      ) : (
                          <div className="space-y-2 p-2">
                            {planSettings.map((setting) => (
                                <div
                                    key={setting.uuid}
                                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg border istui-timetable__main_list_card_list_item ${selectedUuid === setting.uuid ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-accent border-l-4 border-transparent"}`}
                                    onClick={() => handleSelectItem(setting.uuid)}
                                >
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 mr-4">
                                      <div
                                          className={`w-12 h-12 rounded-full flex items-center justify-center text-primary font-medium text-lg ${selectedUuid === setting.uuid ? "bg-primary/20" : "bg-primary/10"}`}
                                      >
                                        {setting.name
                                            ? setting.name.charAt(0).toUpperCase()
                                            : "#"}
                                      </div>
                                    </div>
                                    <div className="flex-grow">
                                      <h3
                                          className={`font-semibold text-lg ${selectedUuid === setting.uuid ? "text-primary" : ""}`}
                                      >
                                        {setting.name || t("planSettings.defaultSettings")}
                                      </h3>
                                      <div className="flex flex-wrap items-center gap-1 mt-1">
                                  <span className="text-sm text-gray-500 font-medium">
                                    {setting.category || t("planSettings.primaryCategory")}
                                  </span>
                                        <span className="text-gray-400 mx-1">•</span>
                                        <span className="text-sm text-gray-500">
                                    {setting.startTime && setting.endTime
                                        ? `${setting.startTime.substring(0, 5)} - ${setting.endTime.substring(0, 5)}`
                                        : t("planSettings.noTimeSet")}
                                  </span>
                                      </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"

                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(setting.uuid);
                                        }}
                                        className="flex-shrink-0 ml-2 text-muted-foreground hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                            ))}
                            {(isFetching || isLoadingMore) && hasMore ? (
                                <div className="text-center py-4">
                                  <div className="flex flex-col items-center">
                                    <Spinner className="h-6 w-6 text-primary mb-2" />
                                    <p className="text-sm">
                                      {t("planSettings.loadingMoreSettings")}
                                    </p>
                                  </div>
                                </div>
                            ) : hasMore ? (
                                <div className="text-center py-4">
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={handleLoadMore}
                                      disabled={isFetching || isLoadingMore}
                                  >
                                    {t("common.loadMore")}
                                  </Button>
                                </div>
                            ) : (
                                <div className="text-center py-3 text-xs text-muted-foreground">
                                  {t("common.endOfList")}
                                </div>
                            )}
                            {hasMore && !isFetching && !isLoadingMore && (
                                <div ref={loadMoreRef} className="h-20 -mt-10"></div>
                            )}
                          </div>
                      )}
                    </div>
                  </Card>
                  <div className="text-xs text-muted-foreground px-2">
                    <p className="font-medium mt-1 mb-2">
                      {t("planSettings.timeBlockInfo")}
                    </p>
                    <p>{t("planSettings.timeBlockDescription")}</p>
                  </div>
                </div>
                <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
                  <Card className="overflow-hidden h-full">
                    <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full h-full"
                    >
                      {(selectedUuid || isCreateMode) && (
                        <DetailCardHeader 
                          label={isCreateMode
                            ? t("common.details")
                            : selectedUuid
                              ? t("common.details")
                              : t("common.details")}
                        />
                      )}
                      <TabsContent
                          value="general"
                          className="p-0 focus-visible:outline-none focus-visible:ring-0 h-full flex flex-col"
                      >
                        {isLoading && showForm ? (
                            <div className="flex justify-center items-center h-64">
                              <Spinner size="lg" />
                            </div>
                        ) : showForm ? (
                            <div className="p-4">
                              <PlanSettings
                                  organizationId={
                                    selectedOrgId !== null
                                        ? selectedOrgId.toString()
                                        : undefined
                                  }
                                  onSaveComplete={handleSaveComplete}
                                  isEditMode={!isCreateMode && selectedUuid !== "new"}
                                  uuid={selectedUuid !== "new" ? selectedUuid : null}
                                  onCancel={handleCancel}
                                  key={`plan-settings-${selectedUuid || "new"}-${isCreateMode}-${showForm}`}
                              />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 h-full">
                              <div className="mb-6 p-6 rounded-full bg-muted/30 text-primary">
                                <Sliders size={64} strokeWidth={1.5} />
                              </div>
                              <h3 className="text-xl font-medium mb-2">
                                {t("planSettings.emptyState.title")}
                              </h3>
                              <p className="text-muted-foreground mb-6 max-w-md text-base leading-relaxed">
                                {t("planSettings.emptyState.description")}
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  className="istui-timetable__main_list_card_button"
                                  size="sm"
                                  variant="default"
                                  onClick={handleCreateNewFromDetailPanel}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  {t("actions.add")}
                                </Button>
                              </div>
                            </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
        <DeleteConfirmation
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeletingLocal}
            title={t("common.deleteConfirmTitle")}
            description={`${t("common.deleteConfirmMessage").replace("{moduleName}", t("planSettings.moduleName"))} ${planSettings.find((s) => s.uuid === settingToDelete)?.name ? `(${planSettings.find((s) => s.uuid === settingToDelete)?.name})` : ""}`}
            showTrigger={false}
        />
      </div>
  );
};

export default PagePlanSettings;
