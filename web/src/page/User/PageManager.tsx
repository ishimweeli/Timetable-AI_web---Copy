import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  FileText,
  X,
  Check,
  CheckCheck,
  Trash2,
  ChevronUp,
  ChevronDown,
  Building,
  RefreshCw,
  Loader2,
  UserSquare2
} from "lucide-react";
import { Spinner } from "@/component/Ui/spinner";
import { Input } from "@/component/Ui/input.tsx";
import { Button } from "@/component/Ui/button.tsx";
import { Card, CardDescription, CardHeader, CardTitle } from "@/component/Ui/card.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs.tsx";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs.tsx";
import CsvImport from "@/component/Common/CsvImport";
import { useToast } from "@/hook/useToast.ts";
import { useI18n } from "@/hook/useI18n";
import { useGetManagersQuery, useGetManagerQuery, useUpdateManagerMutation, useDeleteManagerMutation, useCreateManagerMutation, useGetCurrentManagerQuery, useImportManagersCsvMutation } from "@/store/Manager/ApiManager";
import { useGetOrganizationsQuery } from "@/store/Organization/ApiOrganization";
import { useUserService } from "@/store/User/ServiceUser";
import { Manager, ManagerFormData } from "@/type/Manager/TypeManager";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/component/Ui/form";
import { useNavigate, useParams } from "react-router-dom";

import { debounce } from "lodash";
import { cn } from "@/util/util";
import { Progress } from "@/component/Ui/progress.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/component/Ui/popover.tsx";
import { Checkbox } from "@/component/Ui/checkbox.tsx";
import { Label } from "@/component/Ui/label.tsx";
import { t } from "i18next";
import { RadioGroup, RadioGroupItem } from "@/component/Ui/radio-group.tsx";
import EmptyState from "@/component/Common/EmptyState";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "@/style/Auth/phone-input.css";
import DetailCardHeader from "@/component/Common/DetailCardHeader";

const managerFormSchema = z.object({
  email: z.string().email(t("manager.validation.email")),
  firstName: z.string().min(2, t("manager.validation.firstName")),
  lastName: z.string().min(2, t("manager.validation.lastName")),
  phone: z.string().optional(),
  organizationId: z.coerce.number().min(1, t("manager.validation.organization")),
  statusId: z.coerce.number().min(1, t("manager.validation.status")),
  canGenerateTimetable: z.boolean(),
  canManageTeachers: z.boolean(),
  canManageStudents: z.boolean(),
  canCreateManagers: z.boolean()
});

type ManagerFormValues = z.infer<typeof managerFormSchema>;

const PageManager = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const { isAdmin } = useUserService();
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(uuid || null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [managerToDelete, setManagerToDelete] = useState<string | null>(null);
  const [originalManagerData, setOriginalManagerData] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [totalManagers, setTotalManagers] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const {
    data: managersResponse,
    isLoading: isLoadingManagers,
    isFetching,
    refetch,
    error: managersError
  } = useGetManagersQuery({
    page,
    size: 10,
    search: debouncedKeyword,
    orgId: selectedOrgId || undefined,
    sortDirection
  });

  const {
    data: selectedManagerData,
    isLoading: isLoadingSelectedManager,
    error: selectedManagerError,
    refetch: refetchSelectedManager
  } = useGetManagerQuery(selectedManagerId || "", {
    skip: !selectedManagerId || isCreatingNew,
    refetchOnMountOrArgChange: true
  });

  const {
    data: organizationsResponse,
    isLoading: isLoadingOrganizations,
    error: organizationsError
  } = useGetOrganizationsQuery({ size: 100 });
  const organizations = organizationsResponse?.data || [];

  const [updateManager, { isLoading: isUpdating, error: updateError }] = useUpdateManagerMutation();
  const [deleteManager, { isLoading: isDeleting, error: deleteError }] = useDeleteManagerMutation();
  const [createManager, { isLoading: isCreating, error: createError }] = useCreateManagerMutation();
  const [importManagersCsv, { isLoading: isImporting, error: importError }] = useImportManagersCsvMutation();

  const {
    data: currentManagerData,
    isLoading: isLoadingCurrentManager,
    error: currentManagerError
  } = useGetCurrentManagerQuery();

  const [currentUserPermissions, setCurrentUserPermissions] = useState({
    canCreateManagers: false,
    canManageTeachers: false,
    canManageStudents: false,
    canGenerateTimetable: false
  });

  const isLoading =
    isLoadingManagers ||
    isLoadingSelectedManager ||
    isUpdating ||
    isDeleting ||
    isCreating ||
    isImporting;

  const form = useForm<ManagerFormValues>({
    resolver: zodResolver(managerFormSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      organizationId: 1,
      statusId: 1,
      canGenerateTimetable: false,
      canManageTeachers: false,
      canManageStudents: false,
      canCreateManagers: false
    },
    mode: "onChange"
  });

  const selectedManager = selectedManagerData?.data || null;

  useEffect(() => {
    if(uuid && uuid !== selectedManagerId) {
      setSelectedManagerId(uuid);
    } else if(!uuid && selectedManagerId) {
      clearSelection();
    }
  }, [uuid, selectedManagerId]);

  const scrollToSelectedManager = useCallback(() => {
    if(selectedManagerId && listContainerRef.current && managers.length > 0) {
      const selectedElement = listContainerRef.current.querySelector(
        `[data-manager-id="${selectedManagerId}"]`
      );
      if(selectedElement) {
        setTimeout(() => {
          selectedElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 150);
      }
    }
  }, [selectedManagerId, managers.length]);

  useEffect(() => {
    scrollToSelectedManager();
  }, [scrollToSelectedManager, managersResponse]);

  const updateManagerInList = useCallback((updatedManager) => {
    if(!updatedManager) return;
    setManagers((prevManagers) =>
      prevManagers.map((manager) =>
        manager.uuid === updatedManager.uuid ? { ...manager, ...updatedManager } : manager
      )
    );
  }, []);

  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    let errorMessage = "An unexpected error occurred";
    if(error.data) {
      if(error.data.message) {
        errorMessage = error.data.message;
      } else if(error.data.error) {
        const code = error.data.error;
        if(code.includes("Duplicate entry") && code.includes("for key")) {
          const match = code.match(/'([^']+)'/);
          const email = match ? match[1] : "";
          errorMessage = `A user with email ${email} already exists`;
          form.setError("email", { type: "manual", message: "This email is already in use" });
          return;
        }
        if(code.includes("manager.email.exists")) {
          errorMessage = "A manager with this email already exists";
          form.setError("email", { type: "manual", message: "A manager with this email already exists" });
          return;
        }
        if(code.includes("manager.not.found")) {
          errorMessage = "Manager not found";
        }
        if(code.includes("could not execute statement")) {
          errorMessage = "Database error: Unable to save manager";
        }
      }
    } else if(error.status === "FETCH_ERROR") {
      errorMessage = "Network error. Please check your connection.";
    }
    toast({ title: "Error", description: errorMessage, variant: "destructive" });
  };

  useEffect(() => {
    [
      managersError,
      selectedManagerError,
      organizationsError,
      updateError,
      deleteError,
      createError,
      currentManagerError,
      importError
    ].forEach((err) => err && handleApiError(err));
  }, [managersError, selectedManagerError, organizationsError, updateError, deleteError, createError, currentManagerError, importError]);

  useEffect(() => {
    // Reset all state related to pagination and loading
    setPage(0);
    setManagers([]);
    setHasMore(true);
    setTotalManagers(0);
    setIsLoadingMore(false);
    setAutoLoadingInProgress(false);

    // Reset scroll position
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }

  }, [debouncedKeyword, selectedOrgId, sortDirection]);

  useEffect(() => {
    if(selectedManagerData?.data && !isCreatingNew) {
      setOriginalManagerData(selectedManagerData.data);
      setTimeout(() => {
        form.reset({
          email: selectedManagerData.data.email || "",
          firstName: selectedManagerData.data.firstName || "",
          lastName: selectedManagerData.data.lastName || "",
          phone: selectedManagerData.data.phone || "",
          organizationId: selectedManagerData.data.organizationId || 1,
          statusId: selectedManagerData.data.statusId || 1,
          canGenerateTimetable: selectedManagerData.data.canGenerateTimetable || false,
          canManageTeachers: selectedManagerData.data.canManageTeachers || false,
          canManageStudents: selectedManagerData.data.canManageStudents || false,
          canCreateManagers: selectedManagerData.data.canCreateManagers || false
        });
      }, 10);
    }
  }, [selectedManagerData, isCreatingNew, form]);

  useEffect(() => {
    console.log("Raw current manager data:", currentManagerData);

    if(currentManagerData?.success && currentManagerData.data) {
      const managerData = currentManagerData.data;
      console.log("Current manager permissions from API:", {
        canCreateManagers: managerData.canCreateManagers,
        email: managerData.email
      });


      const canCreateManagers = managerData.canCreateManagers === true;

      console.log("Setting permissions state:", {
        canCreateManagers: canCreateManagers
      });


      setCurrentUserPermissions({
        canCreateManagers: canCreateManagers,
        canManageTeachers: !!managerData.canManageTeachers,
        canManageStudents: !!managerData.canManageStudents,
        canGenerateTimetable: !!managerData.canGenerateTimetable
      });

      if(managerData.email) {
        setCurrentUserEmail(managerData.email);
        console.log("Set current user email to:", managerData.email);
      }
    }
  }, [currentManagerData]);

  const debouncedSearch = useCallback(
    debounce((v: string) => {
      setDebouncedKeyword(v);
      setPageSize(10);
      setHasMore(true);
      if(listContainerRef.current) {
        listContainerRef.current.scrollTop = 0;
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleOrganizationSelect = (orgId: number | null) => {
    setSelectedOrgId(orgId);
    setIsOrgPopoverOpen(false);
    setPageSize(10);
    setHasMore(true);
    if(listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  };

  const handleResetFilters = () => {
    setSelectedOrgId(null);
    setSearchTerm("");
    setDebouncedKeyword("");
    setIsOrgPopoverOpen(false);
    setPage(0);
    setManagers([]);
    setTotalManagers(0);
    setHasMore(true);
  };

  const handleToggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    setPage(0);
    setManagers([]);
  };

  const getOrganizationName = (id: number) => {
    const org = organizations.find((o) => o.id === id);
    return org ? org.name : "Unknown Organization";
  };

  const handleSelectManager = (id: string) => {
    if(id === selectedManagerId) return;
    setSelectedManagerId(id);
    setIsCreatingNew(false);
    navigate(`/managers/${id}`, { replace: true });
    setTimeout(() => {
      refetchSelectedManager();
    }, 50);
    if(window.innerWidth < 1024) {
      setTimeout(() => {
        document.querySelector(".lg\\:col-span-2")?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }, 100);
    }
  };

  const handleAddNewManager = () => {
    setSelectedManagerId(null);
    setIsCreatingNew(true);
    form.reset({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      organizationId: 1,
      statusId: 1,
      canGenerateTimetable: false,
      canManageTeachers: false,
      canManageStudents: false,
      canCreateManagers: false
    });
    navigate("/managers", { replace: true });
  };

  const handleCancel = () => {
    setSelectedManagerId(null);
    setIsCreatingNew(false);
    form.reset({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      organizationId: 1,
      statusId: 1,
      canGenerateTimetable: false,
      canManageTeachers: false,
      canManageStudents: false,
      canCreateManagers: false
    });
    navigate("/managers", { replace: true });
  };

  const clearSelection = () => {
    setSelectedManagerId(null);
    setIsCreatingNew(false);
  };

  const handleSubmit = async (data: ManagerFormValues) => {
    try {
      let result;
      if(selectedManager && !isCreatingNew) {
        result = await updateManager({
          uuid: selectedManager.uuid,
          managerData: { ...data }
        }).unwrap();
      }else {
        const createData: ManagerFormData = {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || "",
          organizationId: data.organizationId,
          statusId: data.statusId,
          canGenerateTimetable: data.canGenerateTimetable,
          canManageTeachers: data.canManageTeachers,
          canManageStudents: data.canManageStudents,
          canCreateManagers: data.canCreateManagers
        };
        result = await createManager(createData).unwrap();
      }
      if(result.success) {
        toast({ title: "Success", description: result.message || "Operation completed successfully" });
        if(selectedManager && !isCreatingNew) {
          const updatedManagerData = {
            ...selectedManager,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            organizationId: data.organizationId,
            statusId: data.statusId,
            canGenerateTimetable: data.canGenerateTimetable,
            canManageTeachers: data.canManageTeachers,
            canManageStudents: data.canManageStudents,
            canCreateManagers: data.canCreateManagers
          };
          updateManagerInList(updatedManagerData);
          refetchSelectedManager();
          refetch();
        }else {
          form.reset();
          setSelectedManagerId(null);
          setIsCreatingNew(false);
          navigate("/managers", { replace: true });
          refetch();
        }
      }else {
        handleApiError({ data: result });
      }
    }catch(err) {
      handleApiError(err);
    }
  };

  const handleDeleteConfirm = async () => {
    if(!selectedManager) return;
    try {
      const result = await deleteManager(selectedManager.uuid).unwrap();
      if(result.success) {
        toast({ title: "Success", description: result.message || "Deleted successfully" });
        setManagers((prevManagers) =>
          prevManagers.filter((manager) => manager.uuid !== selectedManager.uuid)
        );
        setSelectedManagerId(null);
        setIsCreatingNew(false);
        navigate("/managers", { replace: true });
        refetch();
        form.reset();
      }else {
        handleApiError({ data: result });
      }
    }catch(err) {
      handleApiError(err);
    }
    setIsDeleteDialogOpen(false);
  };

  const [autoLoadingInProgress, setAutoLoadingInProgress] = useState(false);

  const handleLoadMore = () => {
    if(!isLoadingMore && !isFetching && hasMore) {
      // Set loading state immediately to prevent multiple triggers
      setIsLoadingMore(true);

      // Load next page
      setPage((prevPage) => prevPage + 1);
    }
  };

  const loadMoreRef = useRef<HTMLDivElement>(null);

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
    if(managersResponse?.data) {
      const newItems = managersResponse.data;
      let updatedManagers: Manager[] = [];

      if(page === 0) {
        updatedManagers = newItems;
        setManagers(updatedManagers);
      } else {
        const existing = new Set(managers.map((m) => m.uuid));
        const newOnes = newItems.filter((m) => !existing.has(m.uuid));
        updatedManagers = [...managers, ...newOnes];
        setManagers(updatedManagers);
      }

      // Use the totalItems from the API response if available
      if (managersResponse.totalItems !== undefined) {
        setTotalManagers(managersResponse.totalItems);
        // Check if we've loaded all items by comparing current count with total
        setHasMore(updatedManagers.length < managersResponse.totalItems);
      } else {
        // Fallback to the old logic if totalItems is not available
        setHasMore(newItems.length === 10);

        if(newItems.length < 10) {
          setTotalManagers(updatedManagers.length);
        } else if (page === 0) {
          // Make a better estimate if we don't have totalItems
          setTotalManagers(newItems.length * 3); // Just an estimate
        }
      }

      // Reset loading states
      setIsLoadingMore(false);
      setAutoLoadingInProgress(false);

      // Log for debugging
      console.log("Managers loaded:", {
        page,
        newItemsCount: newItems.length,
        totalManagers: managersResponse.totalItems || "unknown",
        currentCount: updatedManagers.length,
        hasMore: updatedManagers.length < (managersResponse.totalItems || Infinity)
      });

    } else if(managersError) {
      // Reset loading states on error
      setIsLoadingMore(false);
      setAutoLoadingInProgress(false);
      setHasMore(false);
      toast({
        title: "Error",
        description: "Failed to load managers. Please try again.",
        variant: "destructive",
      });
    }
  }, [managersResponse, managersError, page, managers, toast]);

  useEffect(() => {
    try {
      const userDataString = localStorage.getItem("userData");
      if(userDataString) {
        const userData = JSON.parse(userDataString);

        if(userData && userData.email) {
          setCurrentUserEmail(userData.email);
        }
      }
    }catch(error) {
      console.error("Error getting user data from localStorage:", error);
    }
  }, []);


  const handleImportCSV = async (file: File, options: { skipHeaderRow: boolean, organizationId?: number | null }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if(options.skipHeaderRow) {
        formData.append('skipHeaderRow', options.skipHeaderRow.toString());
      }

      if(options.organizationId) {
        formData.append('organizationId', options.organizationId.toString());
      }

      const result = await importManagersCsv(formData).unwrap();


      if(result.success) {
        refetch();
      }

      return result;
    }catch(error) {
      console.error('Import error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to import managers',
        data: {
          totalProcessed: 0,
          successCount: 0,
          errorCount: 0,
          errors: []
        }
      };
    }
  };

  return (
    <div className="flex h-screen bg-background-main">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-hidden istui-timetable__main_content">
          {isLoading && (
            <div className="fixed top-0 left-0 w-full z-50">
              <Progress value={100} className="h-1" indicatorColor="animate-pulse bg-blue-500" />
            </div>
          )}
          <div className="container-main mx-auto py-4 px-4 sm:px-6 h-full flex flex-col istui-timetable__main_content">
            <div className="flex justify-between items-center mb-4 istui-timetable__main_breadcrumbs_wrapper">
              <Breadcrumbs
              className="istui-timetable__main_breadcrumbs"
              items={[
                { label: t("navigation.resources"), href: "/resources" },
                { label: t("navigation.managers"), href: "" }]} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
              <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                <Card className="h-full flex flex-col">
                  <div className="sticky top-0 z-10 bg-background border-b">
                    <CardHeader className="pb-1 bg-secondary">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <CardTitle>
                            {t("nav.managers")}
                            {typeof totalManagers === "number" && managers.length > 0 && (
                              <span className="text-muted-foreground text-sm font-normal ml-2">
                                ({managers.length})
                              </span>
                            )}
                          </CardTitle>
                        </div>
                        {(isAdmin || currentManagerData?.data?.canCreateManagers === true) && (
                          <div className="flex gap-2">

                            <Button
                              className="istui-timetable__main_list_card_button"
                              size="sm"
                              onClick={handleAddNewManager}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {t("actions.add")}
                            </Button>
                            <CsvImport
                              onImport={handleImportCSV}
                              buttonVariant="outline"
                              buttonSize="sm"
                              organizations={organizations}
                              selectedOrgId={selectedOrgId}
                              organizationId={currentManagerData?.data?.organizationId || null}
                              isAdmin={isAdmin}
                            />
                          </div>
                        )}
                      </div>
                      <CardDescription></CardDescription>
                    </CardHeader>
                  </div>
                  <div className="flex items-center gap-2 mb-2 p-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder={t("manager.search.placeholder")} className="pl-8 h-10 border-gray-200 istui-timetable__main_list_card_search_input" value={searchTerm} onChange={handleSearchChange} />
                    </div>
                    <Popover open={isOrgPopoverOpen} onOpenChange={setIsOrgPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className={selectedOrgId !== null ? "bg-primary text-primary-foreground" : ""} aria-label={t("organization.filterByOrganization")}>
                          <Building className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="end">
                        <div className="space-y-2">
                          <div className="font-medium text-sm">{t("organization.filterByOrganization")}</div>
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
                            <Button variant="outline" size="sm" onClick={handleResetFilters} className="w-full">
                              <RefreshCw className="h-3 w-3 mr-2" />
                              {t("common.resetFilters")}
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button variant="outline" size="icon" onClick={handleToggleSortDirection} aria-label={t(sortDirection === "asc" ? "common.sortAscending" : "common.sortDescending")}>
                      {sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  {(selectedOrgId !== null || debouncedKeyword) && (
                    <div className="flex flex-wrap gap-1 mb-2 px-4">
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
                  <div className="overflow-y-auto" ref={listContainerRef} style={{ maxHeight: "calc(100vh - 250px)", scrollBehavior: "smooth", overscrollBehavior: "contain" }}>
                    <div className="p-4">
                      {isLoadingManagers && managers.length === 0 ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                      ) : managers.length > 0 ? (
                        <div className="space-y-2">
                          {managers.map((manager) => (
                            <div
                              key={manager.uuid}
                              className={cn(
                                "flex items-center p-3 rounded-md cursor-pointer transition-all duration-200 ease-in-out istui-timetable__main_list_card_list_item",
                                selectedManagerId === manager.uuid
                                  ? "bg-primary/10 border-l-4 border-primary shadow-sm"
                                  : "hover:bg-accent border-l-4 border-transparent hover:translate-x-1"
                              )}
                              onClick={() => handleSelectManager(manager.uuid)}
                              data-manager-id={manager.uuid}
                            >
                              <div className="flex-1">
                                <p className="font-medium">
                                  {manager.firstName} {manager.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{manager.email}</p>
                                {getOrganizationName(manager.organizationId) && (
                                  <p className="text-xs text-muted-foreground mt-1">{getOrganizationName(manager.organizationId)}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>{searchTerm || selectedOrgId ? t("manager.noResults") : t("manager.noManagers")}</p>
                        </div>
                      )}
                      {isLoadingMore && (
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("common.loadingMore")}
                          </div>
                        </div>
                      )}
                      {!isLoadingMore && hasMore && managers.length > 0 && (
                        <div className="mt-4 mb-6 flex justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLoadMore}
                            disabled={isLoadingMore || isFetching}
                            className="min-w-[200px]"
                          >
                            {t("common.loadMore")}
                            {totalManagers > 0 && (
                              <span className="ml-1 text-xs">
                                ({managers.length}/{totalManagers})
                              </span>
                            )}
                          </Button>
                        </div>
                      )}
                      {!hasMore && managers.length > 0 && (
                        <div className="text-center py-2 text-xs text-muted-foreground mb-4">
                          {t("common.endOfList")}
                        </div>
                      )}
                      {hasMore && <div ref={loadMoreRef} className="h-10 opacity-0" aria-hidden="true" />}
                    </div>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
                <Card className="h-full">
                  <Tabs defaultValue="details" className="h-full flex flex-col">
                    {(selectedManagerId || isCreatingNew) && (
                      <DetailCardHeader
                        label={  t("common.details")}
                      />
                    )}
                    <TabsContent value="details" className="flex-1 p-0">
                      {selectedManagerId || isCreatingNew ? (
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("manager.form.firstName")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("manager.form.firstName")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("manager.form.lastName")}</FormLabel>
                                    <FormControl>
                                      <Input placeholder={t("manager.form.lastName")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("manager.form.email")}</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder={t("manager.form.email")} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("manager.form.phone")}</FormLabel>
                                    <FormControl>
                                      <PhoneInput
                                        international
                                        countryCallingCodeEditable={false}
                                        defaultCountry="US"
                                        placeholder={t("manager.form.phone")}
                                        value={field.value}
                                        onChange={field.onChange}
                                        className={form.formState.errors.phone ? "error" : ""}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="organizationId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("manager.form.organization")}</FormLabel>
                                    <FormControl>
                                      <select className="w-full p-2 border rounded-md" {...field}>
                                        <option value="1">Default Organization</option>
                                        {organizationsResponse?.data?.map((org) => (
                                          <option key={org.id} value={org.id}>
                                            {org.name}
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
                                name="statusId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>{t("manager.form.status")}</FormLabel>
                                    <FormControl>
                                      <select className="w-full p-2 border rounded-md" {...field}>
                                        <option value="1">{t("manager.form.status.active")}</option>
                                        <option value="2">{t("manager.form.status.inactive")}</option>
                                      </select>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="space-y-2">
                              <h3 className="text-lg font-medium">{t("manager.form.permissions")}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                  control={form.control}
                                  name="canGenerateTimetable"
                                  render={({ field }) => (
                                    <div
                                      className={cn(
                                        "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer transition",
                                        field.value ? "border-primary bg-primary/10" : "border"
                                      )}
                                      onClick={() => field.onChange(!field.value)}
                                      tabIndex={0}
                                      role="checkbox"
                                      aria-checked={field.value}
                                      onKeyDown={e => {
                                        if (e.key === " " || e.key === "Enter") {
                                          e.preventDefault();
                                          field.onChange(!field.value);
                                        }
                                      }}
                                    >
                                      <FormControl>
                                        <input
                                          type="checkbox"
                                          checked={field.value}
                                          onChange={e => field.onChange(e.target.checked)}
                                          onClick={e => e.stopPropagation()}
                                          className="mt-1"
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>{t("manager.form.permissions.timetable")}</FormLabel>
                                        <FormDescription>{t("manager.form.permissions.timetableDesc")}</FormDescription>
                                      </div>
                                    </div>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="canManageTeachers"
                                  render={({ field }) => (
                                    <div
                                      className={cn(
                                        "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer transition",
                                        field.value ? "border-primary bg-primary/10" : "border"
                                      )}
                                      onClick={() => field.onChange(!field.value)}
                                      tabIndex={0}
                                      role="checkbox"
                                      aria-checked={field.value}
                                      onKeyDown={e => {
                                        if (e.key === " " || e.key === "Enter") {
                                          e.preventDefault();
                                          field.onChange(!field.value);
                                        }
                                      }}
                                    >
                                      <FormControl>
                                        <input
                                          type="checkbox"
                                          checked={field.value}
                                          onChange={e => field.onChange(e.target.checked)}
                                          onClick={e => e.stopPropagation()}
                                          className="mt-1"
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>{t("manager.form.permissions.teachers")}</FormLabel>
                                        <FormDescription>{t("manager.form.permissions.teachersDesc")}</FormDescription>
                                      </div>
                                    </div>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="canManageStudents"
                                  render={({ field }) => (
                                    <div
                                      className={cn(
                                        "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer transition",
                                        field.value ? "border-primary bg-primary/10" : "border"
                                      )}
                                      onClick={() => field.onChange(!field.value)}
                                      tabIndex={0}
                                      role="checkbox"
                                      aria-checked={field.value}
                                      onKeyDown={e => {
                                        if (e.key === " " || e.key === "Enter") {
                                          e.preventDefault();
                                          field.onChange(!field.value);
                                        }
                                      }}
                                    >
                                      <FormControl>
                                        <input
                                          type="checkbox"
                                          checked={field.value}
                                          onChange={e => field.onChange(e.target.checked)}
                                          onClick={e => e.stopPropagation()}
                                          className="mt-1"
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>{t("manager.form.permissions.students")}</FormLabel>
                                        <FormDescription>{t("manager.form.permissions.studentsDesc")}</FormDescription>
                                      </div>
                                    </div>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="canCreateManagers"
                                  render={({ field }) => (
                                    <div
                                      className={cn(
                                        "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 cursor-pointer transition",
                                        field.value ? "border-primary bg-primary/10" : "border"
                                      )}
                                      onClick={() => field.onChange(!field.value)}
                                      tabIndex={0}
                                      role="checkbox"
                                      aria-checked={field.value}
                                      onKeyDown={e => {
                                        if (e.key === " " || e.key === "Enter") {
                                          e.preventDefault();
                                          field.onChange(!field.value);
                                        }
                                      }}
                                    >
                                      <FormControl>
                                        <input
                                          type="checkbox"
                                          checked={field.value}
                                          onChange={e => field.onChange(e.target.checked)}
                                          onClick={e => e.stopPropagation()}
                                          className="mt-1"
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel>{t("manager.form.permissions.managers")}</FormLabel>
                                        <FormDescription>{t("manager.form.permissions.managersDesc")}</FormDescription>
                                      </div>
                                    </div>
                                  )}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 pt-4 border-t mt-6">
                              {/* Delete button - only show if not viewing own profile */}
                              {selectedManager && !isCreatingNew && currentUserEmail !== selectedManager?.email && (
                                <Button
                                  variant="destructive"
                                  type="button"
                                  size="sm"
                                  onClick={() => setIsDeleteDialogOpen(true)}
                                  disabled={isLoading}
                                  className="mr-auto transition-all duration-150 ease-in-out hover:shadow-md"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span className="flex items-center">{t("manager.actions.delete")}</span>
                                </Button>
                              )}

                              {/* Cancel button - always show */}
                              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isLoading}>
                                <X className="mr-2 h-4 w-4" />
                                {t("manager.cancel")}
                              </Button>

                              {/* Update/Create button - only show if user has permission */}
                              {(isAdmin || currentManagerData?.data?.canCreateManagers === true) && (
                                <Button type="submit" size="sm" disabled={isLoading}>
                                  {isLoading ? (
                                    <span className="flex items-center">
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      {t("manager.saving")}
                                    </span>
                                  ) : selectedManager && !isCreatingNew ? (
                                    <>
                                      <Check className="mr-2 h-4 w-4" /> {t("common.update")}
                                    </>
                                  ) : (
                                    <>
                                      <CheckCheck className="mr-2 h-4 w-4" /> {t("manager.actions.create")}
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </form>
                        </Form>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <EmptyState
                            icon={<UserSquare2 />}
                            title={t("manager.emptyState.title")}
                            description={t("manager.emptyState.description")}
                            onAdd={handleAddNewManager}
                            showImport={isAdmin || currentManagerData?.data?.canCreateManagers === true}
                            onImport={handleImportCSV}
                            organizations={organizations}
                            selectedOrgId={selectedOrgId}
                            organizationId={currentManagerData?.data?.organizationId || null}
                            isAdmin={isAdmin}
                            hasPermission={isAdmin || currentManagerData?.data?.canCreateManagers === true}
                          />
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
        isDeleting={isDeleting}
        title={t("manager.delete.title")}
        description={t("manager.delete.message")}
        showTrigger={false}
      />
    </div>
  );
};

export default PageManager;
