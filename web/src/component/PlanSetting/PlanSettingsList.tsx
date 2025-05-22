import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/component/Ui/card";
import { Input } from "@/component/Ui/input";
import { Button } from "@/component/Ui/button";
import { Plus, Trash2, Search, ArrowUpDown } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/component/Ui/pagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/component/Ui/alert-dialog";
import { Spinner } from "@/component/Ui/spinner";
import { Alert, AlertDescription } from "@/component/Ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hook/useToast";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { useI18n } from "@/hook/useI18n";
import { useInView } from "react-intersection-observer";
import { debounce } from "lodash";

const PlanSettingsList = ({
  organizationId,
  onCreateNew = null,
  onEdit = null,
}) => {
  const { toast } = useToast();
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [settingToDelete, setSettingToDelete] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortField, setSortField] = useState("name");
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [planSettings, setPlanSettings] = useState([]);
  const [selectedSettingId, setSelectedSettingId] = useState(null);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
    triggerOnce: false,
  });
  const dataFetchedRef = useRef(false);
  const lastFetchParamsRef = useRef(null);
  const storePlanSettings = usePlanSettingsStore(
    (state) => state.planSettingsList,
  );
  const totalPages = usePlanSettingsStore((state) => state.totalPages);
  const loading = usePlanSettingsStore((state) => state.loading);
  const error = usePlanSettingsStore((state) => state.error);
  const fetchPlanSettingsByOrganizationPaginated = usePlanSettingsStore(
    (state) => state.fetchPlanSettingsByOrganizationPaginated,
  );
  const fetchAllPlanSettings = usePlanSettingsStore(
    (state) => state.fetchAllPlanSettings,
  );
  const deletePlanSettings = usePlanSettingsStore(
    (state) => state.deletePlanSettings,
  );

  const loadData = () => {
    if(loading) return;
    const fetchParams = `${organizationId || "all"}-${currentPage}-${pageSize}-${searchTerm}-${sortField}-${sortOrder}`;
    if(lastFetchParamsRef.current === fetchParams) return;
    lastFetchParamsRef.current = fetchParams;
    if(organizationId) {
      fetchPlanSettingsByOrganizationPaginated(
        organizationId,
        currentPage - 1,
        pageSize,
        searchTerm,
        sortField,
        sortOrder,
      );
    }else {
      fetchAllPlanSettings(currentPage - 1, pageSize, searchTerm);
    }
  };

  useEffect(() => {
    if(dataFetchedRef.current) return;
    dataFetchedRef.current = true;
    loadData();
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, organizationId]);

  useEffect(() => {
    if(storePlanSettings) {
      if(currentPage === 1) {
        setPlanSettings(storePlanSettings || []);
      }else {
        setPlanSettings((prev) => {
          const existingIds = new Set(prev.map((s) => s.uuid));
          const newSettings = (storePlanSettings || []).filter(
            (s) => !existingIds.has(s.uuid),
          );
          if(newSettings.length === 0) setHasMore(false);
          return [...prev, ...newSettings];
        });
      }
      if(!storePlanSettings || storePlanSettings.length < 10) {
        setHasMore(false);
      }
      setTimeout(() => {
        setIsLoadingMore(false);
      }, 300);
    }
  }, [storePlanSettings, currentPage, pageSize]);

  useEffect(() => {
    setPageSize(10);
    setHasMore(true);
  }, [searchTerm]);

  const debouncedSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
      setPageSize(10);
      setHasMore(true);
      setCurrentPage(1);
    }, 300),
    [],
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  const handleLoadMore = () => {
    if(hasMore && !loading && !isLoadingMore) {
      setIsLoadingMore(true);
      setPageSize((prevSize) => prevSize + 10);
    }
  };

  useEffect(() => {
    if(
      inView &&
      hasMore &&
      !loading &&
      !isLoadingMore &&
      planSettings.length > 0
    ) {
      handleLoadMore();
    }
  }, [inView, hasMore, loading, isLoadingMore, planSettings.length]);

  const handleDeleteClick = (uuid) => {
    setSettingToDelete(uuid);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if(!settingToDelete) return;
    try {
      await deletePlanSettings(settingToDelete);
      toast({
        title: t("common.success"),
        description: t("planSettings.deleteSuccess"),
      });
      loadData();
    }catch(error) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description:
          error.response?.data?.message || t("planSettings.deleteError"),
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSettingToDelete(null);
    }
  };

  const handleEdit = (e, uuid) => {
    e.preventDefault();
    e.stopPropagation();
    
    const selectedSetting = planSettings.find(setting => setting.uuid === uuid);
    if(selectedSetting) {
      sessionStorage.setItem("currentPlanSettings", JSON.stringify(selectedSetting));
    }else {
      sessionStorage.setItem("currentPlanSettingId", uuid);
      
      if(organizationId) {
        const fetchSetting = usePlanSettingsStore.getState().fetchPlanSettingsByUuid;
        fetchSetting(uuid).catch(err => console.error("Error fetching setting:", err));
      }
    }
    
    if(onEdit) onEdit(uuid);
  };

  const handleCreateNew = () => {
    if(onCreateNew) onCreateNew();
  };

  const toggleSort = (field) => {
    if(sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedList = [...planSettings].sort((a, b) => {
    if(sortField === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  useEffect(() => {
    // Check if we have a selected setting ID in session storage
    const storedUuid = sessionStorage.getItem("currentPlanSettingId");
    if(storedUuid) {
      setSelectedSettingId(storedUuid);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {t("planSettings.plan")} ({planSettings.length})
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleSort("name")}
            className="h-10 w-10"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreateNew} className="h-10">
            <Plus className="mr-2 h-4 w-4" />
            {t("planSettings.new")}
          </Button>
        </div>
      </div>
      <div className="mb-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("planSettings.search")}
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 h-10 border-gray-200"
          />
        </form>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {loading && pageSize === 10 ? (
        <div className="flex justify-center items-center h-40">
          <Spinner size="lg" />
        </div>
      ) : planSettings.length === 0 ? (
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-muted-foreground mb-4">
              {t("planSettings.noSettings")}
            </p>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              {t("planSettings.createNew")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className="space-y-2 bg-white rounded-lg overflow-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400"
          style={{ maxHeight: "calc(100vh - 250px)", scrollBehavior: "smooth" }}
        >
          {sortedList.map((setting) => (
            <div
              key={setting.uuid}
              className={`p-3 cursor-pointer transition-colors border border-gray-100 rounded-lg ${
                setting.uuid === selectedSettingId || 
                setting.uuid === sessionStorage.getItem("currentPlanSettingId") 
                  ? "bg-primary/10 border-l-4 border-primary" 
                  : "hover:bg-gray-50 border-l-4 border-transparent"
              }`}
              onClick={(e) => {
                setSelectedSettingId(setting.uuid);
                handleEdit(e, setting.uuid);
              }}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-blue-600 font-medium text-lg ${selectedSettingId === setting.uuid ? "bg-primary/20" : "bg-blue-100"}`}
                  >
                    {setting.name ? setting.name.charAt(0).toUpperCase() : "#"}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3
                    className={`font-semibold text-lg ${selectedSettingId === setting.uuid ? "text-primary" : ""}`}
                  >
                    {setting.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1 mt-1">
                    <span className="text-sm text-gray-500 font-medium">
                      {setting.category || "primary"}
                    </span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span className="text-sm text-gray-500">
                      {setting.startTime?.substring(0, 5)} -{" "}
                      {setting.endTime?.substring(0, 5)}
                    </span>
                    <span className="text-gray-400 mx-1">•</span>
                    <span className="text-sm text-gray-500">
                      {setting.periodsPerDay} {t("planSettings.periods")} /{" "}
                      {setting.daysPerWeek} {t("planSettings.days")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {(loading || isLoadingMore) && hasMore ? (
            <div className="text-center py-4">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-6 w-6 text-primary mb-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-sm">Loading more settings...</p>
              </div>
            </div>
          ) : hasMore ? (
            <div className="text-center py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={loading || isLoadingMore}
              >
                Load More
              </Button>
            </div>
          ) : (
            <div className="text-center py-3 text-xs text-muted-foreground">
              End of list
            </div>
          )}
          {hasMore && !loading && !isLoadingMore && planSettings.length > 0 && (
            <div ref={loadMoreRef} className="h-20 -mt-10"></div>
          )}
        </div>
      )}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="max-w-[400px]">
          <div className="flex flex-col items-center text-center p-4">
            <AlertDialogTitle className="text-xl font-semibold mb-2">
              {t("planSettings.confirmDelete")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500 mb-6">
              {t("planSettings.deleteWarning")}
            </AlertDialogDescription>
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteConfirm}
              >
                {t("common.deleteButton")}
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlanSettingsList;
