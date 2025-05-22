import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  ArrowUpDown,
  ShieldCheck,
  Loader2,
  Trash2,
  Building,
  RefreshCw,
  CheckCheck,
  Check,
  X,
  Settings,
  GraduationCap
} from "lucide-react";
import { Input } from "@/component/Ui/input.tsx";
import { Button } from "@/component/Ui/button.tsx";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card.tsx";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/component/Ui/tabs.tsx";
import { Separator } from "@/component/Ui/separator.tsx";
import { Switch } from "@/component/Ui/switch.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/component/Ui/dropdown-menu.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/Ui/popover";
import { Checkbox } from "@/component/Ui/checkbox";
import { Label } from "@/component/Ui/label";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs.tsx";
import { useToast } from "@/hook/useToast.ts";
import { useI18n } from "@/hook/useI18n.ts";
import {
  useGetRulesQuery,
  useGetOrganizationsQuery,
  useCreateRuleMutation,
  useUpdateRuleMutation,
  useDeleteRuleMutation,
  useGetRuleQuery,
  useImportRulesCsvMutation,
  Rule,
} from "@/store/Rule/ApiRule.ts";
import RuleScheduleTab from "@/component/Rule/RuleScheduleTab";
import { useAppDispatch } from "@/hook/useAppRedux";
import { setSelectedRuleUuid } from "@/store/Rule/sliceRulePreference";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { useParams, useNavigate } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { Progress } from "@/component/Ui/progress.tsx";
import CsvImport from "@/component/Common/CsvImport.tsx";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/component/Ui/radio-group";
import EmptyState from "@/component/Common/EmptyState";
import DetailCardHeader from "@/component/Common/DetailCardHeader";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const PageRule = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "priority" | "modifiedDate">(
      "name",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rules, setRules] = useState<Rule[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [autoLoadingInProgress, setAutoLoadingInProgress] = useState(false);
  const [totalRules, setTotalRules] = useState(0);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPlanSettingsId, setSelectedPlanSettingsId] = useState<number | null>(null);
  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);
  const fetchPlanSettingsByOrganizationPaginated = usePlanSettingsStore((state) => state.fetchPlanSettingsByOrganizationPaginated);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    initials: "",
    data: "",
    priority: 2,
    enabled: true,
    organizationId: 1,
    statusId: 1,
    planSettingsId: null as number | null,
  });
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    rootMargin: "200px",
    triggerOnce: false,
  });
  const listContainerRef = useRef<HTMLDivElement>(null);
  const { data: organizationsResponse, isLoading: isLoadingOrganizations } =
      useGetOrganizationsQuery();
  const organizations = organizationsResponse?.data || [];
  const {
    data: rulesResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetRulesQuery({
    page,
    size: pageSize,
    keyword: debouncedKeyword,
    sortBy,
    sortDirection,
    orgId: selectedOrgId,
    planSettingsId: selectedPlanSettingsId,
  });
  const {
    data: singleRuleData,
    isLoading: isLoadingSingleRule,
    refetch: refetchSelectedRule,
  } = useGetRuleQuery(uuid || "", {
    skip: !uuid || uuid === "new" || rules.some((rule) => rule.uuid === uuid),
  });
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [activeTab, setActiveTab] = useState<string>("details");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  useEffect(() => {
    if(rulesResponse?.data) {
      if(page === 0) {
        // Reset the list when we're on the first page
        setRules(rulesResponse.data);
      } else {
        // For subsequent pages, filter out duplicates and append
        const newRules = rulesResponse.data.filter(
            (newRule) =>
                !rules.some((existingRule) => existingRule.uuid === newRule.uuid),
        );
        setRules((prev) => [...prev, ...newRules]);
      }

      // Update total count
      setTotalRules(rulesResponse.totalItems || 0);

      // Determine if there are more items to load using the API's hasNext field
      // This is more reliable than checking the length of the current page
      if (rulesResponse.hasNext !== undefined) {
        setHasMore(rulesResponse.hasNext);
      } else if (rulesResponse.totalItems !== undefined && rules.length < rulesResponse.totalItems) {
        // Fallback: If we don't have hasNext but we do have totalItems, compare with current count
        setHasMore(true);
      } else if (!rulesResponse.data || rulesResponse.data.length < pageSize) {
        // Last resort: Use the page size check
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      // Reset loading states
      setIsLoadingMore(false);
      setAutoLoadingInProgress(false);

      // Log for debugging
      console.log(`Loaded ${rulesResponse.data.length} rules, total: ${rules.length}/${rulesResponse.totalItems}, hasMore: ${rulesResponse.hasNext}`);
    }
  }, [rulesResponse, page, pageSize, rules.length]);

  const handleLoadMore = useCallback(() => {
    if(hasMore && !isFetching && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, isFetching, isLoadingMore]);

  // Initialize scrollbar visibility
  useEffect(() => {
    const timer = setTimeout(() => {
      if (listContainerRef.current) {
        listContainerRef.current.style.overflow = 'hidden';
        setTimeout(() => {
          if (listContainerRef.current) {
            listContainerRef.current.style.overflow = 'scroll';
          }
        }, 10);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Add scroll event listener to handle infinite scroll
  useEffect(() => {
    // Create a variable to track if a request is pending
    let isRequestPending = false;

    const handleScroll = () => {
      // Only proceed if we have more data to load and no request is in progress
      if (
        listContainerRef.current &&
        hasMore &&
        !isFetching &&
        !isLoadingMore &&
        !autoLoadingInProgress &&
        !isRequestPending
      ) {
        const { scrollTop, clientHeight, scrollHeight } = listContainerRef.current;

        // Check if we're near the bottom (within 150px)
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 150;

        if (isNearBottom) {
          // Set local flag to prevent multiple calls during scroll events
          isRequestPending = true;

          // Set state to indicate loading is in progress
          setAutoLoadingInProgress(true);

          // Small delay to debounce rapid scroll events
          setTimeout(() => {
            // Only proceed if we still have more data and no other request started
            if (hasMore && !isFetching && !isLoadingMore) {
              handleLoadMore();
            } else {
              // Reset flags if conditions changed
              isRequestPending = false;
              setAutoLoadingInProgress(false);
            }
          }, 100);
        }
      }
    };

    // Throttled version of the scroll handler to prevent too many calls
    const throttledScrollHandler = () => {
      // Use requestAnimationFrame for smoother scrolling
      window.requestAnimationFrame(() => {
        handleScroll();
      });
    };

    const listElement = listContainerRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', throttledScrollHandler);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', throttledScrollHandler);
      }
    };
  }, [hasMore, isFetching, isLoadingMore, autoLoadingInProgress, handleLoadMore]);

  // Also handle the case when the InView component triggers loading
  useEffect(() => {
    // Only proceed if the element is in view, we have more data, and no request is in progress
    if(inView && hasMore && !isFetching && !isLoadingMore && !autoLoadingInProgress) {
      // Set a small delay to prevent race conditions with scroll events
      const timer = setTimeout(() => {
        // Double-check conditions before proceeding
        if(hasMore && !isFetching && !isLoadingMore && !autoLoadingInProgress) {
          setAutoLoadingInProgress(true);
          handleLoadMore();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [inView, hasMore, isFetching, isLoadingMore, autoLoadingInProgress, handleLoadMore]);
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setIsLoadingMore(false);
    setAutoLoadingInProgress(false);
  }, [debouncedKeyword, sortBy, sortDirection, selectedOrgId, selectedPlanSettingsId]);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if(userData) {
      try {
        const user = JSON.parse(userData);
        setIsAdmin(user.roleName === "ADMIN");
        if(user.organizationId) {
          setOrganizationId(Number(user.organizationId));
          // Fetch plan settings for the user's organization
          fetchPlanSettingsByOrganizationPaginated(user.organizationId.toString(), 0, 100);
        }
      }catch(e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, [fetchPlanSettingsByOrganizationPaginated]);

  // Fetch plan settings when organization changes
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

  // Set default plan setting when plan settings list is loaded
  useEffect(() => {
    if (planSettingsList && planSettingsList.length > 0 && !selectedPlanSettingsId) {
      console.log("Setting default planSetting:", planSettingsList[0]);
      setSelectedPlanSettingsId(planSettingsList[0].id);
    }
  }, [planSettingsList, selectedPlanSettingsId]);
  useEffect(() => {
    const intervalId = setInterval(() => {
      refetch();
      if(selectedRule?.uuid) {
        refetchSelectedRule();
      }
    }, 30000);
    return () => clearInterval(intervalId);
  }, [refetch, refetchSelectedRule, selectedRule?.uuid]);
  useEffect(() => {
    const handleWindowFocus = () => {
      refetch();
      if(selectedRule?.uuid) {
        refetchSelectedRule();
      }
    };
    window.addEventListener("focus", handleWindowFocus);
    return () => window.removeEventListener("focus", handleWindowFocus);
  }, [refetch, refetchSelectedRule, selectedRule?.uuid]);
  useEffect(() => {
    if(uuid && uuid !== "new") {
      const ruleFromList = rules.find((rule) => rule.uuid === uuid);
      if(ruleFromList) {
        setSelectedRule(ruleFromList);
        setIsCreating(false);
      } else if(singleRuleData && typeof singleRuleData === "object") {
        const ruleObject = singleRuleData.data || singleRuleData;
        setSelectedRule(ruleObject as Rule);
        setIsCreating(false);
      } else if(!isLoadingSingleRule) {
        navigate("/rules", { replace: true });
      }
    } else if(uuid === "new" && !isCreating) {
      setSelectedRule(null);
      setIsCreating(true);
      setFormData({
        name: "",
        initials: "",
        data: "",
        priority: 2,
        enabled: true,
        organizationId: organizationId || 1,
        statusId: 1,
        planSettingsId: selectedPlanSettingsId,
      });
    }
  }, [
    uuid,
    rules,
    singleRuleData,
    isLoadingSingleRule,
    navigate,
    organizationId,
    isCreating,
    selectedPlanSettingsId
  ]);
  useEffect(() => {
    if(selectedRule && isEditMode) {
      setFormData({
        name: selectedRule.name || "",
        initials: selectedRule.initials || "",
        data: selectedRule.data || "",
        priority: selectedRule.priority || 2,
        enabled: selectedRule.enabled || false,
        organizationId: selectedRule.organizationId || organizationId || 1,
        statusId: selectedRule.statusId || 1,
        planSettingsId: selectedRule.planSettingsId || selectedPlanSettingsId,
      });
    }
  }, [selectedRule, isEditMode, organizationId, selectedPlanSettingsId]);
  const handleSelectRule = (rule: Rule) => {
    setSelectedRule(rule);
    setIsCreating(false);
    setIsEditMode(false);
    dispatch(setSelectedRuleUuid(rule.uuid));
    navigate(`/rules/${rule.uuid}`);
  };
  const handleAddNewRule = () => {
    setSelectedRule(null);
    setIsCreating(true);
    setIsEditMode(false);
    dispatch(setSelectedRuleUuid(""));
    setFormData({
      name: "",
      initials: "",
      data: "",
      priority: 2,
      enabled: true,
      organizationId: organizationId || 1,
      statusId: 1,
      planSettingsId: selectedPlanSettingsId,
    });
    navigate("/rules/new", { replace: true });
  };
  const handleEditRule = () => {
    if(selectedRule) {
      setIsEditMode(true);
      setFormData({
        name: selectedRule.name || "",
        initials: selectedRule.initials || "",
        data: selectedRule.data || "",
        priority: selectedRule.priority || 2,
        enabled: selectedRule.enabled || false,
        organizationId: selectedRule.organizationId || organizationId || 1,
        statusId: selectedRule.statusId || 1,
        planSettingsId: selectedRule.planSettingsId || selectedPlanSettingsId,
      });
    }
  };
  const handleCancel = () => {
    if(isCreating) {
      setSelectedRule(null);
      setIsCreating(false);
      dispatch(setSelectedRuleUuid(""));
      navigate("/rules", { replace: true });
    } else if(isEditMode) {
      setIsEditMode(false);
      if(selectedRule) {
        setFormData({
          name: selectedRule.name || "",
          initials: selectedRule.initials || "",
          data: selectedRule.data || "",
          priority: selectedRule.priority || 2,
          enabled: selectedRule.enabled || false,
          organizationId: selectedRule.organizationId || 1,
          statusId: selectedRule.statusId || 1,
          planSettingsId: selectedRule.planSettingsId || selectedPlanSettingsId,
        });
      }
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
    setSelectedPlanSettingsId(null);
    setSortDirection("asc");
    setSortBy("name");
    setPage(0);
    setIsOrgPopoverOpen(false);
  };

  const getPlanSettingName = (id: number | null) => {
    if(!id || !planSettingsList) return "";
    const planSetting = planSettingsList.find((ps) => ps.id === id);
    return planSetting ? planSetting.name : "";
  };

  const getOrganizationName = (id: number | null) => {
    if(!id) return "";
    const org = organizations.find((org) => org.id === id);
    return org ? org.name : "";
  };
  const [createRule, { isLoading: isCreatingRule }] = useCreateRuleMutation();
  const [updateRule, { isLoading: isUpdatingRule }] = useUpdateRuleMutation();
  const [deleteRule, { isLoading: isDeletingRule }] = useDeleteRuleMutation();
  const isSubmitting = isCreatingRule || isUpdatingRule;
  const isDeleting = isDeletingRule;

  const [importRulesCsv] = useImportRulesCsvMutation();

  const handleImportCsv = async (file: File, options: { skipHeaderRow: boolean, organizationId?: number | null }) => {
    if (!file) {
      return {
        success: false,
        message: t("import.noFile"),
        data: {
          totalProcessed: 0,
          successCount: 0,
          errorCount: 0,
          errors: []
        }
      };
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("skipHeaderRow", options.skipHeaderRow.toString());

      // Always include organizationId, defaulting to 1 if not provided
      const orgId = options.organizationId || organizationId || 1;
      formData.append("organizationId", orgId.toString());

      // Include planSettingsId if available
      if (selectedPlanSettingsId) {
        formData.append("planSettingsId", selectedPlanSettingsId.toString());
      }

      const response = await importRulesCsv(formData).unwrap();

      setPage(0);
      refetch();

      return {
        success: true,
        message: response.message || t("import.success"),
        data: {
          totalProcessed: response.data?.totalProcessed || 0,
          successCount: response.data?.successCount || 0,
          errorCount: response.data?.errorCount || 0,
          errors: response.data?.errors || []
        }
      };
    } catch (error) {
      console.error("CSV Import Error:", error);
      return {
        success: false,
        message: error.data?.message || t("import.failed"),
        data: {
          totalProcessed: error.data?.data?.totalProcessed || 0,
          successCount: error.data?.data?.successCount || 0,
          errorCount: error.data?.data?.errorCount || 0,
          errors: error.data?.data?.errors || []
        }
      };
    }
  };

  const extractErrorMessage = (error: any) => {
    if(!error) return t("common.error");
    if(typeof error === "string") return error;
    const checkForRuleExists = (obj: any) => {
      if(!obj) return false;
      if(typeof obj === "string") {
        return (
            obj.includes("Rule already exists") ||
            obj.includes("[Rule already exists]") ||
            obj.includes("rule.exists")
        );
      }
      return false;
    };
    const findErrorRecursively = (obj: any): string | null => {
      if(!obj || typeof obj !== "object") return null;
      for(const key in obj) {
        const value = obj[key];
        if(checkForRuleExists(value)) {
          return (
              t("rules.errors.alreadyExists") ||
              "Rule with this name or initials already exists"
          );
        }
        if(value && typeof value === "object") {
          const result = findErrorRecursively(value);
          if(result) return result;
        }
      }
      return null;
    };
    const ruleExistsError = findErrorRecursively(error);
    if(ruleExistsError) return ruleExistsError;
    if(error.message) return error.message;
    if(error.data?.message) return error.data.message;
    if(error.data?.error) return error.data.error;
    if(error.error) return error.error;
    if(error.status === "FETCH_ERROR")
      return (
          t("common.networkError") ||
          "Network error. Please check your connection."
      );
    return t("common.error");
  };
  const handleInputChange = (
      e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, enabled: checked });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      enabled: Boolean(formData.enabled),
      isEnabled: Boolean(formData.enabled),
      planSettingsId: selectedPlanSettingsId,
    };

    try {
      if(isCreating) {
        const result = await createRule(submitData).unwrap();
        if(result.success) {
          toast({
            description: result.message || t("common.success"),
            variant: "default",
          });
          setIsCreating(false);
          setSelectedRule(null);
          dispatch(setSelectedRuleUuid(""));
          navigate("/rules", { replace: true });
          refetch();
        }else {
          const errorMessage =
              result.error || result.message || t("common.error");
          toast({ variant: "destructive", description: errorMessage });
        }
      } else if(selectedRule?.uuid) {
        const result = await updateRule({
          uuid: selectedRule.uuid,
          ruleData: submitData,
        }).unwrap();
        if(result.success) {
          toast({
            description: result.message || t("common.success"),
            variant: "default",
          });
          setIsEditMode(false);
          setSelectedRule(null);
          dispatch(setSelectedRuleUuid(""));
          navigate("/rules", { replace: true });
          refetch();
        }else {
          toast({
            variant: "destructive",
            description: result.error || result.message || t("common.error"),
          });
        }
      }
    }catch(error) {
      const errorMessage = extractErrorMessage(error);
      toast({ variant: "destructive", description: errorMessage });
    }
  };
  const handleDeleteRule = (uuid: string) => {
    setRuleToDelete(uuid);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteConfirm = async () => {
    if(!ruleToDelete) return;
    try {
      const deletingRuleUuid = ruleToDelete;
      const result = await deleteRule(deletingRuleUuid).unwrap();
      if(result.success) {
        toast({
          description: result.message || t("common.success"),
          variant: "default",
        });
        if(selectedRule?.uuid === deletingRuleUuid) {
          setSelectedRule(null);
          dispatch(setSelectedRuleUuid(""));
          navigate("/rules", { replace: true });
        }
        setRules((prevRules) =>
            prevRules.filter((rule) => rule.uuid !== deletingRuleUuid),
        );
      }else {
        const errorMessage =
            result.error || result.message || t("common.error");
        toast({ variant: "destructive", description: errorMessage });
      }
      refetch();
    }catch(error) {
      const errorMessage = extractErrorMessage(error);
      toast({ variant: "destructive", description: errorMessage });
    } finally {
      setIsDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
      case 2:
        return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
      case 3:
        return "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300";
    }
  };
  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return t("rules.priorityLevels.high");
      case 2:
        return t("rules.priorityLevels.medium");
      case 3:
        return t("rules.priorityLevels.low");
      default:
        return t("rules.priorityLevels.unknown");
    }
  };
  const renderForm = () => (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-0 shadow-none">
            <h3 className="text-md font-medium mb-3">
              {t("rules.ruleInformation")}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium istui-timetable__main_form_input_label">
                  {t("rules.ruleName")}
                </label>
                <Input
                    name="name"
                    placeholder={t("rules.placeholders.name")}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="istui-timetable__main_form_input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium istui-timetable__main_form_input_label">
                  {t("rules.initials")}
                </label>
                <Input
                    name="initials"
                    placeholder={t("rules.placeholders.initials")}
                    value={formData.initials}
                    onChange={handleInputChange}
                    required
                    maxLength={10}
                    className="istui-timetable__main_form_input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium istui-timetable__main_form_input_label">
                  {t("rules.comment")}
                </label>
                <textarea
                    name="data"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-1 min-h-24 bg-background istui-timetable__main_form_input_textarea"
                    placeholder={t("rules.placeholders.comment")}
                    value={formData.data}
                    onChange={handleInputChange}
                    required
                />
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-0 shadow-none">
            <h3 className="text-md font-medium mb-3">
              {t("rules.ruleConfiguration")}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium istui-timetable__main_form_input_label">
                  {t("rules.priority")}
                </label>
                <select
                    name="priority"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-1 bg-background istui-timetable__main_form_input_select"
                    value={formData.priority}
                    onChange={handleInputChange}
                >
                  <option value={1}>{t("rules.priorityLevels.high")}</option>
                  <option value={2}>{t("rules.priorityLevels.medium")}</option>
                  <option value={3}>{t("rules.priorityLevels.low")}</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-md bg-background">
              <span className="font-medium istui-timetable__main_form_input_label">
                {t("rules.enabled")}
              </span>
                <Switch
                    checked={Boolean(formData.enabled)}
                    onCheckedChange={(checked) => handleSwitchChange(checked)}
                    className="istui-timetable__main_form_input_switch"
                />
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {t("rules.currentStatus")}:{" "}
                <span
                    className={
                      formData.enabled
                          ? "text-green-600 dark:text-green-400 font-medium"
                          : "text-red-600 dark:text-red-400 font-medium"
                    }
                >
                {formData.enabled ? t("rules.enabled") : t("rules.disabled")}
              </span>
              </div>
              {isAdmin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("rules.organization")}
                    </label>
                    <select
                        name="organizationId"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-1 bg-background"
                        value={formData.organizationId}
                        onChange={handleInputChange}
                    >
                      {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                      ))}
                    </select>
                  </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("rules.planSettings")}
                </label>
                <select
                    name="planSettingsId"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-ring focus:ring-offset-1 bg-background"
                    value={formData.planSettingsId || ""}
                    onChange={handleInputChange}
                >
                  <option value="">{t("rules.selectPlanSettings")}</option>
                  {planSettingsList && planSettingsList.map((ps) => (
                    <option key={ps.id} value={ps.id}>
                      {ps.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        </div>
        <div className="flex justify-end space-x-2">
          <Button size="sm" type="button" variant="outline" onClick={handleCancel}>
            <X/>
            {t("rules.actions.cancel")}
          </Button>
          <Button
          size="sm"
              className="istui-timetable__main_form_save_button"
              type="submit"
              disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? t("common.saving") : <><CheckCheck/> {t("common.update")}</> }
          </Button>
        </div>
      </form>
  );
  const renderDetails = () => {
    if(!selectedRule) {
      return (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <ShieldCheck className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t("rules.empty.title")}</h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              {t("rules.empty.description")}
            </p>
            <Button onClick={handleAddNewRule} className="mb-4">
              <Plus className="h-4 w-4 mr-2" />
              {t("actions.add")}
            </Button>
          </div>
      );
    }
    if(isEditMode) {
      return renderForm();
    }
    const ruleName = selectedRule.name || "";
    const ruleInitials = selectedRule.initials || "";
    const ruleData = selectedRule.data || "";
    const rulePriority = selectedRule.priority || 2;
    const ruleEnabled = Boolean(selectedRule.enabled);
    return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-0 shadow-none">
              <h3 className="text-md font-medium mb-3">
                {t("rules.ruleInformation")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {t("rules.ruleName")}
                  </label>
                  <p className="p-2 bg-background border rounded-md">
                    {ruleName}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {t("rules.initials")}
                  </label>
                  <p className="p-2 bg-background border rounded-md">
                    {ruleInitials}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {t("rules.comment")}
                  </label>
                  <p className="p-2 bg-background border rounded-md min-h-24">
                    {ruleData}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4 bg-slate-50 dark:bg-slate-900 border-0 shadow-none">
              <h3 className="text-md font-medium mb-3">
                {t("rules.ruleConfiguration")}
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">
                    {t("rules.priority")}
                  </label>
                  <p className="p-2 bg-background border rounded-md">
                    {getPriorityLabel(rulePriority)}
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md bg-background">
                  <span className="font-medium">{t("rules.status")}</span>
                  <span
                      className={`px-2 py-1 rounded-full text-xs ${ruleEnabled ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"}`}
                  >
                  {ruleEnabled ? t("rules.enabled") : t("rules.disabled")}
                </span>
                </div>
                {selectedRule.organizationId && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        {t("rules.organization")}
                      </label>
                      <div className="flex items-center p-2 bg-background border rounded-md">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        {getOrganizationName(selectedRule.organizationId) ||
                            `${t("rules.organizationId")}: ${selectedRule.organizationId}`}
                      </div>
                    </div>
                )}
                {selectedRule.planSettingsId && (
                    <div className="space-y-1">
                      <label className="text-sm font-medium">
                        {t("rules.planSettings")}
                      </label>
                      <div className="flex items-center p-2 bg-background border rounded-md">
                        <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
                        {getPlanSettingName(selectedRule.planSettingsId) ||
                            `${t("rules.planSettingsId")}: ${selectedRule.planSettingsId}`}
                      </div>
                    </div>
                )}
              </div>
            </Card>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
            size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedRule(null);
                  dispatch(setSelectedRuleUuid(""));
                  navigate("/rules", { replace: true });
                }}
            >
              <X/>
              {t("common.close")}
            </Button>
            <Button size="sm" variant="outline" onClick={handleEditRule}>
              <Check/>
              {t("rules.actions.edit")}
            </Button>
            <Button
            size="sm"
                variant="destructive"
                onClick={() => handleDeleteRule(selectedRule.uuid)}
                className="flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              {t("common.deleteButton")}
            </Button>
          </div>
        </div>
    );
  };
  return (
      <div className="flex h-screen bg-background-main">
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-hidden istui-timetable__main_content">
            {isLoading && (
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
                      { label: t("navigation.rules"), href: "" },
                    ]}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                  <Card className="flex-1 overflow-hidden">
                    <div className="">
                      <CardHeader className="pb-1 bg-secondary">
                        <div className="flex items-center justify-between mb-1">
                          <div className={""}>
                            <CardTitle>
                              {t("navigation.rules")}
                              {typeof totalRules === "number" && rules.length > 0 && (
                                <span className="text-muted-foreground text-sm font-normal ml-2">
                                  ({rules.length})
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                                className="istui-timetable__main_list_card_button"
                                size="sm"
                                onClick={handleAddNewRule}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t("actions.add")}
                            </Button>
                            <CsvImport
                              onImport={handleImportCsv}
                              buttonVariant="outline"
                              buttonSize="sm"
                              organizations={organizations}
                              selectedOrgId={selectedOrgId}
                              organizationId={organizationId}
                              isAdmin={isAdmin}
                            />
                          </div>
                        </div>
                        <CardDescription></CardDescription>
                        <div className="mb-2 flex items-center gap-2">
                      
                          <select
                            id="planSettingsId"
                            className="p-2 border rounded-md min-w-[200px]"
                            value={selectedPlanSettingsId || ""}
                            onChange={e => setSelectedPlanSettingsId(e.target.value ? Number(e.target.value) : null)}
                          >
                            <option value="">{t("rules.selectPlanSettings")}</option>
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
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={t("rules.placeholders.search")}
                                className="pl-8"
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
                                  className={
                                    selectedOrgId
                                        ? "bg-primary text-primary-foreground"
                                        : ""
                                  }
                                  aria-label={t("rules.filterByOrganization")}
                              >
                                <Building className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" align="end">
                              <div className="space-y-2">
                                <div className="font-medium text-sm">
                                  {t("rules.filterByOrganization")}
                                </div>
                                <div className="h-px bg-border" />
                                {isLoadingOrganizations ? (
                                    <div className="py-2 flex items-center justify-center">
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      <span className="text-sm">{t("common.loading")}</span>
                                    </div>
                                ) : (
                                    <RadioGroup value={selectedOrgId === null ? "all" : String(selectedOrgId)} onValueChange={value => handleOrganizationSelect(value === "all" ? null : Number(value))}>
                                      <div className="flex items-center space-x-2 py-1">
                                        <RadioGroupItem value="all" id="all-orgs" />
                                        <Label htmlFor="all-orgs" className="text-sm font-normal cursor-pointer">
                                          {t("rules.allOrganizations")}
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
                                    {t("rules.resetFilters")}
                                  </Button>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1 h-10"
                              >
                                <ArrowUpDown className="h-4 w-4" />
                                <span>{t("rules.sort.title")}</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                              <DropdownMenuLabel>
                                {t("rules.sort.label")}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                  onClick={() => {
                                    setSortBy("name");
                                    setSortDirection(
                                        sortDirection === "asc" ? "desc" : "asc",
                                    );
                                  }}
                              >
                                {t("rules.sort.name")}{" "}
                                {sortBy === "name" &&
                                    (sortDirection === "asc" ? "↑" : "↓")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                  onClick={() => {
                                    setSortBy("priority");
                                    setSortDirection(
                                        sortDirection === "asc" ? "desc" : "asc",
                                    );
                                  }}
                              >
                                {t("rules.sort.priority")}{" "}
                                {sortBy === "priority" &&
                                    (sortDirection === "asc" ? "↑" : "↓")}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                  onClick={() => {
                                    setSortBy("modifiedDate");
                                    setSortDirection(
                                        sortDirection === "asc" ? "desc" : "asc",
                                    );
                                  }}
                              >
                                {t("rules.sort.lastModified")}{" "}
                                {sortBy === "modifiedDate" &&
                                    (sortDirection === "asc" ? "↑" : "↓")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      {(selectedOrgId || debouncedKeyword || selectedPlanSettingsId) && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {selectedPlanSettingsId && (
                                <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                  <GraduationCap className="h-3 w-3" />
                                  <span>
                                    {t("rules.planSettings")}: {getPlanSettingName(selectedPlanSettingsId)}
                                  </span>
                                </div>
                            )}
                            {selectedOrgId && (
                                <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                  <Building className="h-3 w-3" />
                                  <span>
                                    {t("rules.filterLabel")}: {getOrganizationName(selectedOrgId)}
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
                      <Separator className="my-2" />
                      <div
                          className="overflow-y-auto"
                          ref={listContainerRef}
                          style={{
                            height: "calc(100vh - 280px)",
                            scrollBehavior: "auto"
                          }}
                      >
                        <div className="p-4 space-y-1" style={{ minHeight: 'calc(100vh - 280px + 50px)' }}>
                        {isLoading && page === 0 ? (
                            <div className="flex justify-center items-center py-8">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : rules.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              {debouncedKeyword || selectedOrgId
                                  ? t("rules.no_results")
                                  : t("rules.emptyList")}
                              {(selectedOrgId || debouncedKeyword) && (
                                  <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleResetFilters}
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      {t("rules.resetFilters")}
                                    </Button>
                                  </div>
                              )}
                            </div>
                        ) : (
                            <>
                              {rules.map((rule) => (
                                  <div
                                      key={rule.uuid}
                                      className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                                          selectedRule?.uuid === rule.uuid
                                              ? "bg-primary/10 border-l-4 border-primary"
                                              : "hover:bg-accent border-l-4 border-transparent"
                                      }`}
                                      onClick={() => handleSelectRule(rule)}
                                  >
                                    <div
                                        className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-primary font-medium ${selectedRule?.uuid === rule.uuid ? "bg-primary/20" : "bg-primary/10"}`}
                                    >
                                      {rule.initials?.charAt(0) ||
                                          rule.name.charAt(0)}
                                    </div>
                                    <div className="ml-3 flex-1">
                                      <p
                                          className={`text-sm ${selectedRule?.uuid === rule.uuid ? "font-semibold text-primary" : "font-medium"}`}
                                      >
                                        {rule.name}
                                      </p>
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span>
                                    {t("rules.initials")}: {rule.initials}
                                  </span>
                                        <span className="text-slate-300">•</span>
                                        <span
                                            className={`px-1.5 py-0.5 rounded-full text-xs ${getPriorityColor(rule.priority)}`}
                                        >
                                    {getPriorityLabel(rule.priority)}
                                  </span>
                                        <span className="text-slate-300">•</span>
                                        <span
                                            className={
                                              rule.enabled
                                                  ? "text-green-600"
                                                  : "text-red-600"
                                            }
                                        >
                                    {rule.enabled
                                        ? t("rules.enabled")
                                        : t("rules.disabled")}
                                  </span>
                                      </div>
                                      {rule.organizationId &&
                                          organizations.length > 0 && (
                                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                                <Building className="h-3 w-3 mr-1" />
                                                {getOrganizationName(
                                                        rule.organizationId,
                                                    ) ||
                                                    `${t("rules.organizationId")}: ${rule.organizationId}`}
                                              </div>
                                          )}
                                      {rule.planSettingsId && (
                                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                                            <GraduationCap className="h-3 w-3 mr-1" />
                                            {getPlanSettingName(rule.planSettingsId) ||
                                                `${t("rules.planSettingsId")}: ${rule.planSettingsId}`}
                                          </div>
                                      )}
                                    </div>
                                  </div>
                              ))}
                              {isFetching || isLoadingMore || autoLoadingInProgress ? (
                                  <div className="text-center py-4">
                                    <div className="flex flex-col items-center">
                                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                      <p className="text-sm">
                                        {t("rules.loadingMore")}
                                      </p>
                                    </div>
                                  </div>
                              ) : hasMore ? (
                                  <div className="text-center py-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleLoadMore}
                                        disabled={isFetching || isLoadingMore || autoLoadingInProgress}
                                    >
                                      {t("rules.loadMore")}
                                    </Button>
                                  </div>
                              ) : (
                                  <div className="text-center py-3 text-xs text-muted-foreground">
                                    {t("rules.endOfList")}
                                  </div>
                              )}
                              {hasMore && (
                                  <div
                                      ref={loadMoreRef}
                                      className="h-20 -mt-10"
                                  ></div>
                              )}

                              {/* Simple padding to ensure scrollbar appears */}
                              <div className="h-20" aria-hidden="true"></div>
                            </>
                        )}
                      </div>
                    </div>
                    </div>
                  </Card>
                  <div className="text-xs text-muted-foreground px-2">
                    <p>{t("rules.legend.title")}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-950"></div>
                      <span>{t("rules.legend.high")}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-amber-100 dark:bg-amber-950"></div>
                      <span>{t("rules.legend.medium")}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-cyan-100 dark:bg-cyan-950"></div>
                      <span>{t("rules.legend.low")}</span>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
                  <Card className="h-full overflow-hidden">
                    {selectedRule || isCreating || isEditMode ? (
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <DetailCardHeader
                          tabs={[
                            { id: "details", label: t("rules.ruleDetails") },
                            { id: "schedule", label: t("classBand.schedulePreferences") }
                          ]}
                          activeTab={activeTab}
                          onTabChange={setActiveTab}
                        />
                        <TabsContent
                          value="details"
                          className="p-4 focus-visible:outline-none focus-visible:ring-0"
                        >
                          {(isLoading && !selectedRule) || isLoadingSingleRule ? (
                              <div className="flex justify-center items-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                              </div>
                          ) : isCreating || isEditMode ? (
                              renderForm()
                          ) : (
                              renderDetails()
                          )}
                        </TabsContent>
                        <TabsContent
                          value="schedule"
                          className="p-4 focus-visible:outline-none focus-visible:ring-0"
                        >
                          {selectedRule ? (
                              <RuleScheduleTab selectedRule={selectedRule} />
                          ) : (
                              <div className="flex justify-center items-center py-8">
                                <p className="text-muted-foreground">
                                  {t("rules.selectRuleFirst")}
                                </p>
                              </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <EmptyState
                        icon={<Settings />}
                        title={t("rules.emptyState.title")}
                        description={t("rules.emptyState.description")}
                        onAdd={handleAddNewRule}
                        showImport={true}
                        onImport={handleImportCsv}
                        organizations={organizations}
                        selectedOrgId={selectedOrgId}
                        organizationId={organizationId}
                        isAdmin={isAdmin}
                        hasPermission={true}
                      />
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
            onConfirm={handleDeleteConfirm}
            isDeleting={isDeleting}
            title={t("common.deleteConfirmTitle")}
            description={`${t("common.deleteConfirmMessage").replace("{moduleName}", t("rules.module"))} ${ruleToDelete ? `(${rules.find((r) => r.uuid === ruleToDelete)?.name || ""})` : ""}`}
            showTrigger={false}
        />
        <div className="hidden">
          <CsvImport
            onImport={handleImportCsv}
            buttonVariant="outline"
            buttonSize="sm"
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            organizationId={organizationId}
            isAdmin={isAdmin}
          />
        </div>
      </div>
  );
};

export default PageRule;
