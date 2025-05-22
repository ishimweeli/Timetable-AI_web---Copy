import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowUpDown,
  Filter,
  Loader2,
  Building,
  RefreshCw,
  DoorOpen,
  GraduationCap,
  ChevronDown,
  Check
} from "lucide-react";
import { Input } from "@/component/Ui/input.tsx";
import { Button } from "@/component/Ui/button.tsx";
import {
  Card,
  CardContent,
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
import { useToast } from "@/hook/useToast.ts";
import { Spinner } from "@/component/Ui/spinner.tsx";
import { useAppDispatch, useAppSelector } from "@/hook/useAppRedux.ts";
import { RootState } from "@/store";
import RoomForm from "@/component/Room/RoomForm.tsx";
import NewRoomModal from "@/component/Room/NewRoomModal.tsx";
import SchedulePreferences from "@/component/Room/SchedulePreferences.tsx";
import Header from "@/component/Core/layout/Header.tsx";
import Sidebar from "@/component/Core/layout/Sidebar.tsx";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs.tsx";
import { Progress } from "@/component/Ui/progress.tsx";
import { useI18n } from "@/hook/useI18n.ts";
import { LanguageSelector } from "@/component/Ui/language-selector.tsx";
import {
  setSelectedRoom,
  openNewRoomForm,
  closeRoomPanel,
  addDeletedRoom,
} from "@/store/Room/SliceRoom.ts";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/component/Ui/alert-dialog.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/Ui/popover";
import { Checkbox } from "@/component/Ui/checkbox";
import { Label } from "@/component/Ui/label";
import {
  useGetRoomsQuery,
  useGetRoomQuery,
  useCreateRoomMutation,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
  useGetOrganizationsQuery,
  useImportRoomsFromCsvMutation,
} from "@/store/Room/ApiRoom.ts";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { useInView } from "react-intersection-observer";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/component/Ui/dialog.tsx";
import { apiRoom } from "@/store/Room/ApiRoom.ts";
import CsvImport from "@/component/Common/CsvImport";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/component/Ui/radio-group";
import EmptyState from "@/component/Common/EmptyState";
import DetailCardHeader from "@/component/Common/DetailCardHeader";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/component/Ui/command";
import { cn } from "@/lib/utils";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const PageRoom = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [selectedPlanSettingsId, setSelectedPlanSettingsId] = useState<number | null>(null);
  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "capacity" | "modifiedDate">(
      "name",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);

  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [localDeletedRoomIds, setLocalDeletedRoomIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [allLoadedRooms, setAllLoadedRooms] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const listContainerRef = useRef<HTMLDivElement>(null);

  const roomState = useAppSelector((state: RootState) => state.room);
  const { selectedRoomUuid, isDetailsOpen, isNewRoomOpen, deletedRoomIds } =
      roomState;

  const { data: organizationsResponse, isLoading: isLoadingOrganizations } =
      useGetOrganizationsQuery();
  const organizations = organizationsResponse?.data || [];

  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);
  const fetchPlanSettingsByOrganizationPaginated = usePlanSettingsStore((state) => state.fetchPlanSettingsByOrganizationPaginated);

  const {
    data: roomsData,
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
    isFetching,
  } = useGetRoomsQuery({
    page,
    size: pageSize,
    keyword: debouncedKeyword,
    sortBy,
    sortOrder,
    ...(selectedOrgId && { orgId: selectedOrgId }),
    ...(selectedPlanSettingsId && { planSettingsId: selectedPlanSettingsId }),
  });

  const {
    data: selectedRoomData,
    isLoading: isLoadingSelectedRoom,
    refetch: refetchSelectedRoom,
  } = useGetRoomQuery(selectedRoomUuid || "", {
    skip: !selectedRoomUuid,
    refetchOnMountOrArgChange: true,
  });

  const [createRoom, { isLoading: isCreating }] = useCreateRoomMutation();
  const [updateRoom, { isLoading: isUpdating }] = useUpdateRoomMutation();
  const [deleteRoom, { isLoading: isDeleting }] = useDeleteRoomMutation();
  const [importRoomsFromCsv, { isLoading: isImporting }] = useImportRoomsFromCsvMutation();

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const rooms = useMemo(() => {
    const roomsList = page > 0 ? allLoadedRooms : (roomsData?.data || []);
    return roomsList.filter(room => !deletedRoomIds.includes(room.uuid));
  }, [allLoadedRooms, roomsData?.data, deletedRoomIds, page]);
  
  const totalRooms = roomsData?.totalItems || rooms.length;

  const isLoadingAny =
      isLoadingRooms ||
      isCreating ||
      isUpdating ||
      isDeleting ||
      isLoadingSelectedRoom;

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if(userData) {
      try {
        const user = JSON.parse(userData);
        setIsAdmin(user.roleName === "ADMIN");
        if(user.organizationId) {
          setOrganizationId(Number(user.organizationId));
          fetchPlanSettingsByOrganizationPaginated(user.organizationId.toString(), 0, 100);
        }
      }catch(e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, [fetchPlanSettingsByOrganizationPaginated]);

  useEffect(() => {
    if(uuid && uuid !== selectedRoomUuid) {
      dispatch(setSelectedRoom(uuid));
    }
  }, [uuid, selectedRoomUuid, dispatch]);

  useEffect(() => {
    if(roomsData?.data) {
      if(page === 0) {
        setAllLoadedRooms(roomsData.data);
      } else if(page > 0) {
        setAllLoadedRooms(prev => {
          const existingRoomMap = new Map(prev.map(room => [room.uuid, room]));
          
          roomsData.data.forEach(room => {
            if(!existingRoomMap.has(room.uuid)) {
              existingRoomMap.set(room.uuid, room);
            }
          });
          
          return Array.from(existingRoomMap.values());
        });
      }
    }
  }, [roomsData?.data, page]);

  useEffect(() => {
    if(roomsData) {
      setIsLoadingMore(false);
      setHasMore(roomsData.data && roomsData.data.length === pageSize);
    }
  }, [roomsData, pageSize]);

  useEffect(() => {
    setPage(0);
    setAllLoadedRooms([]);
    setHasMore(true);
  }, [debouncedKeyword, sortBy, sortOrder, selectedOrgId, selectedPlanSettingsId]);

  useEffect(() => {
    if(selectedRoomUuid && deletedRoomIds.includes(selectedRoomUuid)) {
      dispatch(closeRoomPanel());
    }
  }, [deletedRoomIds, selectedRoomUuid, dispatch]);

  useEffect(() => {
    if(selectedRoomUuid) {
      refetchSelectedRoom();
    }
  }, [selectedRoomUuid, refetchSelectedRoom]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      refetchRooms();
      if(selectedRoomUuid) {
        refetchSelectedRoom();
      }
    }, 30000);
    const handleWindowFocus = () => {
      refetchRooms();
      if(selectedRoomUuid) {
        refetchSelectedRoom();
      }
    };
    window.addEventListener("focus", handleWindowFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [refetchRooms, refetchSelectedRoom, selectedRoomUuid]);

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
    if (planSettingsList && planSettingsList.length > 0) {
      console.log("Setting default planSetting:", planSettingsList[0]);
      if (!selectedPlanSettingsId) {
        setSelectedPlanSettingsId(planSettingsList[0].id);
      }
    }
  }, [planSettingsList, selectedPlanSettingsId]);

  useEffect(() => {
    if (selectedPlanSettingsId !== null && selectedPlanSettingsId !== undefined) {
      console.log("Plan settings ID changed to:", selectedPlanSettingsId);
      setPage(0);
      refetchRooms();
    }
  }, [selectedPlanSettingsId, refetchRooms]);

  useEffect(() => {
    console.log("QUERY PARAMS for Rooms API:", {
      page,
      size: pageSize,
      keyword: debouncedKeyword,
      sortBy,
      sortOrder,
      orgId: selectedOrgId,
      planSettingsId: selectedPlanSettingsId
    });
    
    if (selectedPlanSettingsId) {
      console.log(`Expected planSettingsId ${selectedPlanSettingsId} to be included in params`);
    }
  }, [page, pageSize, debouncedKeyword, sortBy, sortOrder, selectedOrgId, selectedPlanSettingsId]);

  const handleLoadMore = () => {
    if(hasMore && !isFetching && !isLoadingMore) {
      setIsLoadingMore(true);
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleSelectRoom = (uuid: string) => {
    dispatch(setSelectedRoom(uuid));
    navigate(`/rooms/${uuid}`);
  };

  const handleOpenNewRoom = () => {
    if(selectedRoomUuid) {
      dispatch(closeRoomPanel());
    }
    dispatch(openNewRoomForm());
    setActiveTab("details");
    navigate(`/rooms`);
  };

  const handleClosePanel = () => {
    dispatch(closeRoomPanel());
    navigate("/rooms");
  };

  const handleDeleteRoom = (uuid: string, event?: React.MouseEvent) => {
    if(event) {
      event.preventDefault();
      event.stopPropagation();
    }
    setRoomToDelete(uuid);
    setIsDeleteDialogOpen(true);
    navigate(`/rooms`);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleToggleSortDirection = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    setPage(0);
  };

  const handleChangeSortBy = (field: "name" | "capacity" | "modifiedDate") => {
    if(sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    }else {
      setSortBy(field);
      setSortOrder("asc");
    }
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
    setSortOrder("asc");
    setSortBy("name");
    setPage(0);
    setIsOrgPopoverOpen(false);
    setIsFilterPopoverOpen(false);
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

  const handleApiError = (error: any, defaultMessage: string) => {
    let errorMessage = defaultMessage;
    if(error?.data?.error) {
      errorMessage = error.data.error;
    } else if(error?.message) {
      errorMessage = error.message;
    } else if(error?.error) {
      errorMessage = error.error;
    }
    if(errorMessage.includes("Room with this code already exists")) {
      errorMessage = t("room.errors.duplicateCode");
    }
    toast({
      title: t("common.error"),
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleDeleteConfirm = async () => {
    if(!roomToDelete) return;
    try {
      const response = await deleteRoom(roomToDelete).unwrap();
      if(response.success) {
        toast({
          title: t("common.success"),
          description: response.message || t("room.success.deleted"),
        });
        dispatch(addDeletedRoom(roomToDelete));
        dispatch(closeRoomPanel());
        navigate("/rooms");
        setRoomToDelete(null);
        
        setAllLoadedRooms(prev => prev.filter(room => room.uuid !== roomToDelete));
        
        if(roomsData && roomsData.data) {
          const updatedRooms = {
            ...roomsData,
            data: roomsData.data.filter((room) => room.uuid !== roomToDelete),
          };
          dispatch(
            apiRoom.util.updateQueryData(
              "getRooms",
              {
                page,
                size: pageSize,
                keyword: debouncedKeyword,
                sortBy,
                sortOrder,
                ...(selectedOrgId && { orgId: selectedOrgId }),
                ...(selectedPlanSettingsId && { planSettingsId: selectedPlanSettingsId }),
              },
              () => updatedRooms,
            ),
          );
        }
        refetchRooms();
        setRefreshKey((prev) => prev + 1);
      }
    }catch(error: any) {
      handleApiError(error, t("room.errors.deleteFailed"));
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleSaveNewRoom = async (data: any) => {
    try {
      console.log("Original data received:", data);
      
      // Make sure organizationId is set
      if(isAdmin && selectedOrgId) {
        data.organizationId = selectedOrgId;
      } else if(organizationId) {
        data.organizationId = organizationId;
      }
      
      // Make sure planSettingsId is properly included when selected
      if (selectedPlanSettingsId) {
        data.planSettingsId = selectedPlanSettingsId;
      }
      
      // Ensure locationNumber is a number, not a string
      if (data.locationNumber) {
        data.locationNumber = Number(data.locationNumber);
      }
      
      console.log("Data after modifications:", data);
      
      const response = await createRoom(data).unwrap();
      console.log("API response:", response);
      
      if(response && response.success === false) {
        let createErrorMessage = t("room.errors.createFailed");
        if(response.error) {
          if(response.error.includes("Room with this code already exists")) {
            createErrorMessage = t("room.errors.duplicateCode");
          }else {
            createErrorMessage = response.error;
          }
        }
        toast({
          title: t("common.error"),
          description: createErrorMessage,
          variant: "destructive",
        });
        return;
      }
      if(response.success) {
        toast({
          title: t("common.success"),
          description: response.message || t("room.success.created"),
        });
        dispatch(closeRoomPanel());
        refetchRooms();
        setRefreshKey((prev) => prev + 1);
      }
    }catch(error: any) {
      console.error("Error creating room:", error);
      handleApiError(error, t("room.errors.createFailed"));
    }
  };

  const handleUpdateRoom = async (uuid: string, data: any) => {
    try {
      if (selectedPlanSettingsId) {
        data.planSettingsId = selectedPlanSettingsId;
      }
      
      const response = await updateRoom({ uuid, data }).unwrap();
      if(response && response.success === false) {
        let updateErrorMessage = t("room.errors.updateFailed");
        if(response.error) {
          if(response.error.includes("Room with this code already exists")) {
            updateErrorMessage = t("room.errors.duplicateCode");
          }else {
            updateErrorMessage = response.error;
          }
        }
        toast({
          title: t("common.error"),
          description: updateErrorMessage,
          variant: "destructive",
        });
        return;
      }
      if(response.success) {
        toast({
          title: t("common.success"),
          description: response.message || t("room.success.updated"),
        });
        await refetchRooms();
        if(selectedRoomUuid === uuid) {
          dispatch(setSelectedRoom(""));
          setTimeout(() => {
            dispatch(setSelectedRoom(uuid));
            refetchSelectedRoom();
          }, 100);
        }
        setRefreshKey((prev) => prev + 1);
      }
    }catch(error: any) {
      handleApiError(error, t("room.errors.updateFailed"));
    }
  };

  return (
      <div className="flex h-screen bg-background-main">
        {/* <Sidebar /> */}
        <div className="flex-1 flex flex-col">
          {/* <Header /> */}
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
                      { label: t("navigation.resources"), href: "/resources" },
                      { label: t("navigation.rooms"), href: "" },
                    ]}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                <Card className="overflow-hidden h-full flex flex-col border-0 shadow-md">
                    <div className="sticky top-0 z-10 bg-background border-b">
                      <CardHeader className="pb-1 bg-secondary">
                        <div className="flex items-center justify-between mb-1">
                          <div className={""}>
                            <CardTitle>
                              {t("common.rooms")}
                              {typeof totalRooms === "number" && rooms.length > 0 && (
                                <span className="text-muted-foreground text-sm font-normal ml-2">
                                  ({rooms.length})
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={handleOpenNewRoom}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              {t("actions.add")}
                            </Button>
                            <CsvImport
                              onImport={(file, options) => {
                                return importRoomsFromCsv({
                                  file,
                                  organizationId: options.organizationId || undefined,
                                  skipHeaderRow: options.skipHeaderRow
                                }).unwrap().then(response => {
                                  // Transform the response to match the ImportResult interface
                                  return {
                                    success: response.success,
                                    data: {
                                      totalProcessed: response.data.totalProcessed,
                                      successCount: response.data.successCount,
                                      errorCount: response.data.errorCount,
                                      errors: response.data.errors || []
                                    },
                                    message: response.message
                                  };
                                });
                              }}
                              organizations={organizations}
                              selectedOrgId={selectedOrgId}
                              organizationId={organizationId}
                              isAdmin={isAdmin}
                              buttonVariant="outline"
                              buttonSize="sm"
                            />
                          </div>
                        </div>
                        <CardDescription></CardDescription>
                        
                        <div className="mt-2 mb-2 flex items-center gap-2">

                          <select
                            id="planSettingsId"
                            className="p-2 border rounded-md min-w-[200px]"
                            value={selectedPlanSettingsId || ""}
                            onChange={e => setSelectedPlanSettingsId(e.target.value ? Number(e.target.value) : null)}
                          >
                            <option value="">{t("room.filter.selectPlanSettings")}</option>
                            {planSettingsList && planSettingsList.map((ps) => (
                              <option key={ps.id} value={ps.id}>
                                {ps.name} {selectedPlanSettingsId === ps.id ? '(Active)' : ''}
                              </option>
                            ))}
                          </select>
                          {selectedPlanSettingsId && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {getPlanSettingName(selectedPlanSettingsId)}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={t("room.search.placeholder")}
                                className="pl-8 istui-timetable__main_list_card_search_input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <ArrowUpDown className="h-4 w-4 mr-1" />
                                  {t("common.sort")}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-48 p-2">
                                <div className="space-y-2">
                                  <div className="font-medium text-sm">
                                    {t("room.sort.title")}
                                  </div>
                                  <div className="h-px bg-border" />
                                  <div className="space-y-1">
                                    <div
                                        className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted cursor-pointer"
                                        onClick={() => handleChangeSortBy("name")}
                                    >
                                      <span>{t("room.sort.name")}</span>
                                      {sortBy === "name" && (
                                          <span>
                                        {sortOrder === "asc" ? "↑" : "↓"}
                                      </span>
                                      )}
                                    </div>
                                    <div
                                        className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted cursor-pointer"
                                        onClick={() =>
                                            handleChangeSortBy("capacity")
                                        }
                                    >
                                      <span>{t("room.sort.capacity")}</span>
                                      {sortBy === "capacity" && (
                                          <span>
                                        {sortOrder === "asc" ? "↑" : "↓"}
                                      </span>
                                      )}
                                    </div>
                                    <div
                                        className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted cursor-pointer"
                                        onClick={() =>
                                            handleChangeSortBy("modifiedDate")
                                        }
                                    >
                                      <span>{t("room.sort.lastModified")}</span>
                                      {sortBy === "modifiedDate" && (
                                          <span>
                                        {sortOrder === "asc" ? "↑" : "↓"}
                                      </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Popover
                                open={isFilterPopoverOpen}
                                onOpenChange={setIsFilterPopoverOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className={
                                      selectedOrgId
                                          ? "bg-primary text-primary-foreground"
                                          : ""
                                    }
                                >
                                  <Building className="h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-56 p-2" align="end">
                                <div className="space-y-2">
                                  <div className="font-medium text-sm">
                                    {t("room.filter.byOrganization")}
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
                                      <div className="flex items-center gap-2 mb-4">
                                        <Popover
                                          open={isOrgPopoverOpen}
                                          onOpenChange={setIsOrgPopoverOpen}
                                        >
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="outline"
                                              role="combobox"
                                              aria-expanded={isOrgPopoverOpen}
                                              className="justify-between"
                                            >
                                              {selectedOrgId
                                                ? getOrganizationName(selectedOrgId)
                                                : t("room.filter.selectOrganization")}
                                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-[250px] p-0">
                                            <Command>
                                              <CommandInput
                                                placeholder={t("room.filter.searchOrganizations")}
                                                className="h-9"
                                              />
                                              <CommandEmpty>
                                                {t("room.filter.noOrganizationsFound")}
                                              </CommandEmpty>
                                              <CommandGroup>
                                                <CommandItem
                                                  onSelect={() => handleOrganizationSelect(null)}
                                                  className="flex items-center"
                                                >
                                                  <Check
                                                    className={cn(
                                                      "mr-2 h-4 w-4",
                                                      !selectedOrgId ? "opacity-100" : "opacity-0"
                                                    )}
                                                  />
                                                  {t("room.filter.allOrganizations")}
                                                </CommandItem>
                                                {organizations.map((org) => (
                                                  <CommandItem
                                                    key={org.id}
                                                    onSelect={() => handleOrganizationSelect(org.id)}
                                                    className="flex items-center"
                                                  >
                                                    <Check
                                                      className={cn(
                                                        "mr-2 h-4 w-4",
                                                        selectedOrgId === org.id
                                                          ? "opacity-100"
                                                          : "opacity-0"
                                                      )}
                                                    />
                                                    {org.name}
                                                  </CommandItem>
                                                ))}
                                              </CommandGroup>
                                            </Command>
                                          </PopoverContent>
                                        </Popover>

                                        <div className="ml-auto flex items-center gap-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleResetFilters}
                                            className="h-8 gap-1"
                                          >
                                            <RefreshCw className="h-3.5 w-3.5" />
                                            {t("room.filter.reset")}
                                          </Button>
                                        </div>
                                      </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        {(selectedOrgId || debouncedKeyword || selectedPlanSettingsId) && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedPlanSettingsId && (
                                  <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                    <GraduationCap className="h-3 w-3" />
                                    <span>
                                      {t("room.filter.planSettingsLabel", { defaultValue: "Plan Settings:" })}{" "}
                                      {getPlanSettingName(selectedPlanSettingsId)}
                                    </span>
                                  </div>
                              )}
                              {selectedOrgId && (
                                  <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                    <Building className="h-3 w-3" />
                                    <span>
                                {t("room.filter.label")}:{" "}
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
                    <CardContent className="p-0">
                      <div
                          className="overflow-y-auto"
                          ref={listContainerRef}
                          style={{
                            maxHeight: "calc(100vh - 250px)",
                            scrollBehavior: "smooth",
                          }}
                      >
                        <div className="p-4">
                          {isLoadingRooms && page === 0 ? (
                              <div className="flex justify-center items-center py-10">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                                <p>{t("room.loading.list")}</p>
                              </div>
                          ) : rooms.length === 0 ? (
                              <div className="text-center py-10 text-muted-foreground">
                                <p>
                                  {debouncedKeyword || selectedOrgId
                                      ? t("room.empty.noResults")
                                      : t("room.empty.noRooms")}
                                </p>
                                {(selectedOrgId || debouncedKeyword) && (
                                    <div className="mt-4">
                                      <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={handleResetFilters}
                                      >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        {t("room.filter.resetFilters")}
                                      </Button>
                                    </div>
                                )}
                              </div>
                          ) : (
                              <>
                                {rooms.map((room) => (
                                    <div
                                        key={`${room.uuid}-${refreshKey}`}
                                        className={`p-3 rounded-md cursor-pointer transition-colors mb-2 ${selectedRoomUuid === room.uuid ? "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800" : "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800"}`}
                                        onClick={() => handleSelectRoom(room.uuid)}
                                    >
                                      <div className="flex items-center">
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-xs font-medium ${selectedRoomUuid === room.uuid ? "bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200" : "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"}`}
                                        >
                                          {room.initials ||
                                              room.code?.substring(0, 2) ||
                                              "R"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h3 className="font-medium text-sm truncate">
                                            {room.name}
                                          </h3>
                                          <div className="text-xs text-muted-foreground truncate">
                                            {t("room.capacity")}: {room.capacity}
                                            {room.locationNumber && (
                                              <> · {t("room.locationNumber")}: {room.locationNumber}</>
                                            )}
                                          </div>
                                          {room.organization && (
                                              <div className="text-xs text-muted-foreground mt-1 flex items-center">
                                                <Building className="h-3 w-3 mr-1 inline" />
                                                {room.organization.name ||
                                                    getOrganizationName(
                                                        room.organizationId,
                                                    ) ||
                                                    `${t("room.organizationId")}: ${room.organizationId}`}
                                              </div>
                                          )}
                                        </div>
                                        <div className="ml-2 text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 whitespace-nowrap">
                                          {room.code}
                                        </div>
                                      </div>
                                    </div>
                                ))}
                                {isFetching || isLoadingMore ? (
                                    <div className="text-center py-4">
                                      <div className="flex flex-col items-center">
                                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                                        <p className="text-sm">
                                          {t("room.loading.more")}
                                        </p>
                                      </div>
                                    </div>
                                ) : hasMore ? (
                                    <div className="w-full text-center py-4">
                                      <Button
                                          variant="outline"
                                          size="sm"
                                          className="h-8 text-xs"
                                          onClick={handleLoadMore}
                                          disabled={isLoadingRooms || isLoadingMore}
                                      >
                                        {t("common.loadMore")}
                                      </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-3 text-xs text-muted-foreground">
                                      {t("room.endOfList")}
                                    </div>
                                )}
                                {hasMore && (
                                    <div
                                        ref={loadMoreRef}
                                        className="h-10 opacity-0"
                                        aria-hidden="true"
                                    />
                                )}
                              </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <div className="p-4 border-t text-xs text-muted-foreground">
                      <div className="font-medium mb-1">
                        {t("room.legend.title")}:
                      </div>
                      <div className="flex items-center mb-1">
                        <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-800 mr-2"></div>
                        <span>{t("room.legend.available")}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-100 dark:bg-blue-800 mr-2"></div>
                        <span>{t("room.legend.selected")}</span>
                      </div>
                    </div>
                  </Card>
                </div>
                <div className="lg:col-span-6 xl:col-span-7 flex flex-col">
                  <Card className="overflow-hidden h-full border-0 shadow-md">
                    {isDetailsOpen && selectedRoomData?.data ? (
                        <Tabs
                            value={activeTab}
                            onValueChange={handleTabChange}
                            className="h-full flex flex-col"
                        >
                          <DetailCardHeader 
                            tabs={[
                              { id: "details", label: t("room.tabs.details") },
                              { id: "preferences", label: t("room.tabs.schedulePreferences") }
                            ]}
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                          />
                          
                          <TabsContent
                            value="details"
                            className="flex-1 overflow-auto p-6"
                          >
                            {isLoadingSelectedRoom ? (
                                <div className="flex justify-center items-center py-10">
                                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                                  <p>{t("room.loading.details")}</p>
                                </div>
                            ) : selectedRoomData?.data ? (
                                <RoomForm
                                    key={`${selectedRoomData.data.uuid}-${refreshKey}`}
                                    roomData={selectedRoomData.data}
                                    onCancel={handleClosePanel}
                                    onDelete={(uuid, event) =>
                                        handleDeleteRoom(uuid, event)
                                    }
                                    onUpdate={(data) =>
                                        handleUpdateRoom(selectedRoomData.data.uuid, data)
                                    }
                                    isUpdating={isUpdating}
                                />
                            ) : (
                                <div className="flex justify-center items-center py-10">
                                  <p>{t("room.errors.loadingFailed")}</p>
                                </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent
                            value="preferences"
                            className="flex-1 overflow-auto p-6"
                          >
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground mb-4">
                                {t("room.schedulePreferences.description", {
                                  defaultValue:
                                      "Set when this room is available for scheduling classes and activities.",
                                })}
                              </p>
                            </div>
                            <SchedulePreferences
                                roomId={selectedRoomData.data.id}
                                planSettingsId={selectedPlanSettingsId}
                            />
                          </TabsContent>
                        </Tabs>
                    ) : isNewRoomOpen ? (
                        <>
                          <DetailCardHeader 
                            label={t("common.details")}
                          />
                          <div className="p-6">
                            <RoomForm
                                roomData={{}}
                                onCancel={handleClosePanel}
                                onDelete={() => {}}
                                onUpdate={handleSaveNewRoom}
                                isUpdating={isCreating}
                                isNewRoom={true}
                            />
                          </div>
                        </>
                    ) : (
                        <EmptyState
                          icon={<DoorOpen />}
                          title={t("room.emptyState.title", { defaultValue: "No room selected" })}
                          description={t("room.emptyState.description", { defaultValue: "Select a room to view its details or create a new one to get started" })}
                          onAdd={handleOpenNewRoom}
                          onImport={(file, options) => {
                            return importRoomsFromCsv({
                              file,
                              organizationId: options.organizationId || undefined,
                              skipHeaderRow: options.skipHeaderRow
                            }).unwrap().then(response => {
                              return {
                                success: response.success,
                                data: {
                                  totalProcessed: response.data.totalProcessed,
                                  successCount: response.data.successCount,
                                  errorCount: response.data.errorCount,
                                  errors: response.data.errors || []
                                },
                                message: response.message
                              };
                            });
                          }}
                          showImport={true}
                          organizations={organizations}
                          selectedOrgId={selectedOrgId}
                          organizationId={organizationId}
                          isAdmin={isAdmin}
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
            description={`${t("common.deleteConfirmMessage").replace("{moduleName}", t("room.module"))} ${roomToDelete ? `(${rooms.find((r) => r.uuid === roomToDelete)?.name || ""})` : ""}`}
            showTrigger={false}
        />
      </div>
  );
};

export default PageRoom;
