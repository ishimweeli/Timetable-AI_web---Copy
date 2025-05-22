import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hook/useAppRedux";
import { useI18n } from "@/hook/useI18n";
import { useToast } from "@/component/Ui/use-toast";
import { useNavigate } from "react-router-dom";

// Layout components
import Header from "@/component/Core/layout/Header";
import Sidebar from "@/component/Core/layout/Sidebar";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import OrganizationSelector, {
  getCurrentOrganizationInfo,
} from "@/component/Binding/OrganizationSelector";

// UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/component/Ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { Input } from "@/component/Ui/input";
import { Button } from "@/component/Ui/button";
import { Progress } from "@/component/Ui/progress";
import { Checkbox } from "@/component/Ui/checkbox";
import { Label } from "@/component/Ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/component/Ui/dialog";
import { 
  Search, 
  RefreshCw, 
  Plus, 
  Grid, 
  List, 
  School,
  Building,
  MapPin,
  Replace,
  GraduationCap
} from "lucide-react";

// Binding-specific components
import BindingForm from "@/component/Binding/BindingForm";
import BindingList from "@/component/Binding/BindingList";
import BindingGrid from "@/component/Binding/BindingGrid";
import BindingWorkload from "@/component/Binding/BindingWorkload";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";

// API hooks
import {
  useGetBindingsQuery,
  useGetTeachersQuery,
  useGetSubjectsQuery,
  useGetClassesQuery,
  useGetRoomsQuery,
  useGetRulesQuery,
  useCreateBindingMutation,
  useUpdateBindingMutation,
  useDeleteBindingMutation,
  useGetClassBindingsQuery,
} from "@/store/Binding/ApiBinding";
import {
  useGetTeacherWorkloadQuery,
  useGetClassWorkloadQuery,
  useGetSubjectWorkloadQuery,
  useGetRoomWorkloadQuery,
} from "@/store/Workload/ApiWorkload";
import { useGetClassBandsQuery } from "@/store/ClassBand/ApiClassBand";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";

// Redux slice
import { setSelectedBinding } from "@/store/Binding/SliceBinding";

// Type definitions to fix linter errors
type SortDirection = "asc" | "desc";
type Organization = {
  uuid: string;
  id: number;
  name: string;
  address?: string;
  district?: string;
};

// Add Teacher type definition with organizationName
interface Teacher {
  uuid: string;
  id: number;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  // Add other properties as needed
}

// Add API parameter types
interface TeacherWorkloadParams {
  teacherUuid: string | undefined;
}

interface ClassWorkloadParams {
  classUuid: string | undefined;
}

interface SubjectWorkloadParams {
  subjectUuid: string | undefined;
}

interface RoomWorkloadParams {
  roomUuid: string | undefined;
}

// School area component
const SchoolArea = ({ schoolName, address, district }) => {
  const { t } = useI18n();
  
  return (
    <Card className="mb-4 border-l-4 border-l-indigo-500">
      <CardContent className="p-4">
        <div className="flex items-start">
          <div className="mr-4">
            <School className="h-8 w-8 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{schoolName}</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Building className="h-4 w-4 mr-2" />
                <span>{district}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{address}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const OrganizationHeader = ({
  organizationName,
  onClick,
  className = ""
}) => {
  const { t } = useI18n();
  return (
    <div className={`flex items-center ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="text-sm flex items-center w-full max-w-[300px] justify-between"
      > 
        <div className="flex items-center overflow-hidden">
          <span className="truncate">
            {t("common.organization")}: {organizationName || t("binding.create")}
          </span>
        </div>
        <span className="ml-2 text-xs text-muted-foreground whitespace-nowrap">
          ({t("common.edit")})
        </span>
      </Button>
    </div>
  );
};

const PageBinding = () => {
  // Inject local z-index override for toast viewport
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `.toast-viewport, .sonner-toaster, [data-sonner-toast-viewport], .shadcn-toast-viewport { z-index: 9999 !important; }`;
    document.body.appendChild(style);
    return () => { document.body.removeChild(style); };
  }, []);

  const { t } = useI18n();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Current organization from localStorage
  const {
    uuid: initialOrgUuid,
    id: initialOrgId,
    name: initialOrgName,
    address: initialOrgAddress,
    district: initialOrgDistrict
  } = getCurrentOrganizationInfo() as Organization;

  // Pagination & sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sortBy, setSortBy] = useState("teacher_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // UI state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [currentView, setCurrentView] = useState("list");
  const [showFixedOnly, setShowFixedOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("bindings");

  // Dialog & form state
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBindingUuid, setSelectedBindingUuid] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [bindingToDelete, setBindingToDelete] = useState(null);

  // Organization selector
  const [selectedOrganizationUuid, setSelectedOrganizationUuid] = useState(
    initialOrgUuid
  );
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(
    initialOrgId
  );
  const [selectedOrganizationName, setSelectedOrganizationName] = useState(
    initialOrgName || ""
  );
  const [isOrgSelectorOpen, setIsOrgSelectorOpen] = useState(!initialOrgUuid);

  // Plan Settings
  const [selectedPlanSettingsId, setSelectedPlanSettingsId] = useState<number | null>(null);
  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);
  const fetchPlanSettingsByOrganizationPaginated = usePlanSettingsStore((state) => state.fetchPlanSettingsByOrganizationPaginated);

  // Workload filters
  const [selectedTeacherUuid, setSelectedTeacherUuid] = useState(null);
  const [allTeachersWorkload, setAllTeachersWorkload] = useState(true);
  const [selectedClassUuid, setSelectedClassUuid] = useState<string | null>(null);
  const [allClassesWorkload, setAllClassesWorkload] = useState(true);
  const [selectedSubjectUuid, setSelectedSubjectUuid] = useState(null);
  const [allSubjectsWorkload, setAllSubjectsWorkload] = useState(true);
  const [selectedRoomUuid, setSelectedRoomUuid] = useState(null);
  const [allRoomsWorkload, setAllRoomsWorkload] = useState(true);

  // Teachers array typing
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Form error state
  const [formError, setFormError] = useState<string | null>(null);

  // ===== API QUERIES =====
  const {
    data: bindingsResponse,
    isLoading: isLoadingBindings,
    refetch: refetchBindings,
  } = useGetBindingsQuery(
    {
      page,
      size,
      sortBy,
      sortDirection: sortDirection as "asc" | "desc",
      keyword: searchKeyword,
      orgId: selectedOrganizationId ?? undefined,
      planSettingsId: selectedPlanSettingsId ?? undefined,
    },
    { skip: !selectedOrganizationId }
  );

  // Add class bindings query with proper skip condition
  const {
    data: classBindingsResponse,
    isLoading: isLoadingClassBindings,
    refetch: refetchClassBindings,
  } = useGetClassBindingsQuery(
    {
      classUuid: selectedClassUuid!,
      orgId: selectedOrganizationId
    },
    {
      // Skip the query when no class is selected or when viewing all classes
      skip: !selectedClassUuid || allClassesWorkload || !selectedOrganizationId
    }
  );

  const {
    data: teachersResponse,
    isFetching: isLoadingTeachers,
    refetch: refetchTeachers,
  } = useGetTeachersQuery({ 
    orgId: selectedOrganizationId, 
    planSettingsId: selectedPlanSettingsId || undefined 
  });

  const {
    data: subjectsResponse,
    isFetching: isLoadingSubjects,
    refetch: refetchSubjects,
  } = useGetSubjectsQuery({ 
    orgId: selectedOrganizationId, 
    planSettingsId: selectedPlanSettingsId || undefined 
  });

  const {
    data: classesResponse,
    isFetching: isLoadingClasses,
    refetch: refetchClasses,
  } = useGetClassesQuery({ 
    orgId: selectedOrganizationId, 
    planSettingsId: selectedPlanSettingsId || undefined 
  });

  const {
    data: roomsResponse,
    isFetching: isLoadingRooms,
    refetch: refetchRooms,
  } = useGetRoomsQuery({ 
    orgId: selectedOrganizationId, 
    planSettingsId: selectedPlanSettingsId || undefined 
  });

  const {
    data: rulesResponse,
    isLoading: isLoadingRules,
    refetch: refetchRules,
  } = useGetRulesQuery(
    { page: 0, size: 100, sortDirection: "asc", orgId: selectedOrganizationId },
    { skip: !selectedOrganizationId }
  );

  const {
    data: teacherWorkloadResponse,
    isLoading: isLoadingTeacherWorkload,
    refetch: refetchTeacherWorkload,
  } = useGetTeacherWorkloadQuery(
    {
      teacherUuid: selectedTeacherUuid || undefined,
    } as TeacherWorkloadParams,
    {
      skip: !selectedOrganizationId || (allTeachersWorkload && !selectedTeacherUuid),
    }
  );

  const {
    data: classWorkloadResponse,
    isLoading: isLoadingClassWorkload,
    refetch: refetchClassWorkload,
  } = useGetClassWorkloadQuery(
    {
      classUuid: selectedClassUuid || undefined,
    } as ClassWorkloadParams,
    {
      skip: !selectedOrganizationId || (allClassesWorkload && !selectedClassUuid),
    }
  );

  const {
    data: subjectWorkloadResponse,
    isLoading: isLoadingSubjectWorkload,
    refetch: refetchSubjectWorkload,
  } = useGetSubjectWorkloadQuery(
    {
      subjectUuid: selectedSubjectUuid || undefined,
    } as SubjectWorkloadParams,
    {
      skip: !selectedOrganizationId || (allSubjectsWorkload && !selectedSubjectUuid),
    }
  );

  const {
    data: roomWorkloadResponse,
    isLoading: isLoadingRoomWorkload,
    refetch: refetchRoomWorkload,
  } = useGetRoomWorkloadQuery(
    {
      roomUuid: selectedRoomUuid || undefined,
    } as RoomWorkloadParams,
    {
      skip: !selectedOrganizationId || (allRoomsWorkload && !selectedRoomUuid),
    }
  );

  const {
    data: classBandsResponse,
    isFetching: isLoadingClassBands,
    refetch: refetchClassBands,
  } = useGetClassBandsQuery({ 
    orgId: selectedOrganizationId, 
    planSettingsId: selectedPlanSettingsId || undefined 
  });

  const [createBinding, { isLoading: isCreating }] =
    useCreateBindingMutation();
  const [updateBinding, { isLoading: isUpdating }] =
    useUpdateBindingMutation();
  const [deleteBinding, { isLoading: isDeleting }] =
    useDeleteBindingMutation();

  const isDataLoading =
    isLoadingBindings ||
    isLoadingTeachers ||
    isLoadingSubjects ||
    isLoadingClasses ||
    isLoadingRooms ||
    isLoadingRules;

  // ===== DATA EXTRACT =====
  const bindings = bindingsResponse?.data || [];
  const teachersResponseData = teachersResponse?.data || [];
  const subjectsResponseData = subjectsResponse?.data || [];
  const classesResponseData = classesResponse?.data || [];
  const roomsResponseData = roomsResponse?.data || [];
  const rulesResponseData = rulesResponse?.data || [];
  const classBandsResponseData = classBandsResponse?.data || [];

  // Filtered & selected
  const filteredBindings = React.useMemo(() => {
    let list = bindings;

    // Only show bindings for the selected planSettingsId
    if (selectedPlanSettingsId != null) {
      list = list.filter((b) => b.planSettingsId === selectedPlanSettingsId);
    }

    if(searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      list = list.filter(
        (b) =>
          b.teacher_name?.toLowerCase().includes(q) ||
          b.subject_name?.toLowerCase().includes(q) ||
          b.class_name?.toLowerCase().includes(q) ||
          b.room_name?.toLowerCase().includes(q)
      );
    }

    if(showFixedOnly) {
      list = list.filter((b) => b.isFixed);
    }

    return list;
  }, [bindings, searchKeyword, showFixedOnly, selectedPlanSettingsId]);

  const selectedBinding = selectedBindingUuid
    ? filteredBindings.find((b) => b.uuid === selectedBindingUuid) || null
    : null;

  // ===== EFFECTS =====
  useEffect(() => {
    if(
      teachersResponseData.length &&
      teachersResponseData[0] && 
      'organizationName' in teachersResponseData[0] &&
      !selectedOrganizationName
    ) {
      const orgName = teachersResponseData[0].organizationName as string;
      setSelectedOrganizationName(orgName);
      localStorage.setItem(
        "selectedOrganizationName",
        orgName
      );
    }
  }, [teachersResponseData, selectedOrganizationName]);

  // Fetch plan settings when organization is selected
  useEffect(() => {
    if(selectedOrganizationId) {
      console.log("Fetching plan settings for organization:", selectedOrganizationId);
      usePlanSettingsStore.getState().lastOrganizationSearch = null;
      fetchPlanSettingsByOrganizationPaginated(selectedOrganizationId.toString(), 0, 100)
        .then(result => {
          console.log("Fetched plan settings:", result);
        })
        .catch(error => {
          console.error("Error fetching plan settings:", error);
        });
    }
  }, [selectedOrganizationId, fetchPlanSettingsByOrganizationPaginated]);

  // Set default plan setting when plan settings list is loaded
  useEffect(() => {
    if (planSettingsList && planSettingsList.length > 0 && !selectedPlanSettingsId) {
      console.log("Setting default planSetting:", planSettingsList[0]);
      setSelectedPlanSettingsId(planSettingsList[0].id);
    }
  }, [planSettingsList, selectedPlanSettingsId]);

  // Refetch data when plan settings change
  useEffect(() => {
    if (selectedPlanSettingsId && selectedOrganizationId) {
      refetchBindings();
      refetchTeachers();
      refetchSubjects();
      refetchClasses();
      refetchRooms();
      refetchClassBands();
    }
  }, [selectedPlanSettingsId]);

  // ===== HANDLERS =====
  const refetchAll = () => {
    refetchBindings();
    refetchTeachers();
    refetchSubjects();
    refetchClasses();
    refetchRooms();
    refetchRules();
    if(!allTeachersWorkload && selectedTeacherUuid) refetchTeacherWorkload();
    if(!allClassesWorkload && selectedClassUuid) refetchClassWorkload();
    if(!allSubjectsWorkload && selectedSubjectUuid) refetchSubjectWorkload();
    if(!allRoomsWorkload && selectedRoomUuid) refetchRoomWorkload();
    refetchClassBands();
  };

  const handleOrganizationChange = (
    orgUuid,
    orgId,
    orgName
  ) => {
    setSelectedOrganizationUuid(orgUuid);
    setSelectedOrganizationId(orgId);
    if(orgName) {
      setSelectedOrganizationName(orgName);
      localStorage.setItem("selectedOrganizationName", orgName);
    }
    localStorage.setItem("selectedOrganizationUuid", orgUuid);
    localStorage.setItem("selectedOrganizationId", orgId ? orgId.toString() : "");

    // reset selections & filters
    setSelectedBindingUuid(null);
    setSearchKeyword("");
    setShowFixedOnly(false);

    setSelectedTeacherUuid(null);
    setAllTeachersWorkload(true);
    setSelectedClassUuid(null);
    setAllClassesWorkload(true);
    setSelectedSubjectUuid(null);
    setAllSubjectsWorkload(true);
    setSelectedRoomUuid(null);
    setAllRoomsWorkload(true);

    // Reset plan settings when organization changes
    setSelectedPlanSettingsId(null);

    refetchAll();
  };

  const handleCreateBinding = async (data) => {
    // Reset any previous form errors
    setFormError(null);
    
    try {
      // Add plan settings ID to the binding data
      if (selectedPlanSettingsId) {
        data.planSettingsId = selectedPlanSettingsId;
      }
      
      await createBinding({ ...data, organizationUuid: selectedOrganizationUuid }).unwrap();
      toast({ title: t("common.success"), description: t("binding.message.created") });
      resetForm();
      refetchAll();
    } catch(err) {
      const errorMessage = err?.data?.error?.error || t("binding.message.error");
      setFormError(errorMessage);
    }
  };

  const handleUpdateBinding = async (uuid, data) => {
    // Reset any previous form errors
    setFormError(null);
    
    try {
      // Add plan settings ID to the binding data
      if (selectedPlanSettingsId) {
        data.planSettingsId = selectedPlanSettingsId;
      }
      
      await updateBinding({ uuid, ...data }).unwrap();
      toast({ title: t("common.success"), description: t("binding.message.updated") });
      resetForm();
      refetchAll();
    } catch(err) {
      const errorMessage = err?.data?.error?.error || t("binding.message.error");
      setFormError(errorMessage);
    }
  };

  const handleDeleteBinding = async () => {
    if(!bindingToDelete) return;
    
    try {
      await deleteBinding(bindingToDelete).unwrap();
      toast({ title: t("common.success"), description: t("binding.message.deleted") });
      refetchAll();
    }catch(err) {
      toast({ variant: "destructive", title: t("common.error"), description: err.message || t("binding.message.error") });
    } finally {
      setIsDeleteDialogOpen(false);
      setBindingToDelete(null);
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setSelectedBindingUuid(null);
    setFormError(null);
    dispatch(setSelectedBinding(null));
  };

  const handleEditClick = (uuid) => {
    setSelectedBindingUuid(uuid);
    setIsEditMode(true);
    dispatch(setSelectedBinding(uuid));
  };

  const handleDeleteClick = (uuid) => {
    setBindingToDelete(uuid);
    setIsDeleteDialogOpen(true);
  };

  const handleSearchChange = (e) =>
    setSearchKeyword(e.target.value);

  const handleRefresh = () => {
    refetchAll();
    toast({ title: t("common.success"), description: t("common.status.actionSuccess", { action: t("common.actions.regenerate") }) });
  };

  const handleToggleView = (view) => setCurrentView(view);

  const handleCreateClick = () => {
    if(
      teachersResponseData.length &&
      subjectsResponseData.length &&
      classesResponseData.length &&
      roomsResponseData.length &&
      selectedOrganizationUuid
    ) {
      setIsEditMode(false);
      const dummy = {
        uuid: "new",
        teacherUuid: teachersResponseData[0].uuid,
        subjectUuid: subjectsResponseData[0].uuid,
        classUuid: classesResponseData[0].uuid,
        roomUuid: roomsResponseData[0].uuid,
        periodsPerWeek: 1,
        isFixed: false,
        priority: 0,
        notes: "",
        ruleUuids: [],
        statusId: 1, // Add this to fix type error
      };
      setSelectedBindingUuid("new");
      dispatch(setSelectedBinding(dummy));
    }else {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: selectedOrganizationUuid
          ? t("binding.message.noData")
          : t("organization.not.found"),
      });
    }
  };

  // Workload selectors
  const handleTeacherSelect = (uuid) => {
    setSelectedTeacherUuid(uuid);
    setAllTeachersWorkload(false);
  };
  const handleToggleAllTeachers = () => {
    setSelectedTeacherUuid(null);
    setAllTeachersWorkload(true);
  };

  const handleClassSelect = (uuid) => {
    setSelectedClassUuid(uuid);
    setAllClassesWorkload(false);
    // Ensure we refetch bindings with the new class UUID
    refetchBindings();
  };
  const handleToggleAllClasses = () => {
    setSelectedClassUuid(null);
    setAllClassesWorkload(true);
  };

  const handleSubjectSelect = (uuid) => {
    setSelectedSubjectUuid(uuid);
    setAllSubjectsWorkload(false);
  };
  const handleToggleAllSubjects = () => {
    setSelectedSubjectUuid(null);
    setAllSubjectsWorkload(true);
  };

  const handleRoomSelect = (uuid) => {
    setSelectedRoomUuid(uuid);
    setAllRoomsWorkload(false);
  };
  const handleToggleAllRooms = () => {
    setSelectedRoomUuid(null);
    setAllRoomsWorkload(true);
  };

  // Helper function to get plan setting name
  const getPlanSettingName = (id: number | null) => {
    if(!id || !planSettingsList) return "";
    const planSetting = planSettingsList.find((ps) => ps.id === id);
    return planSetting ? planSetting.name : "";
  };

  const handleClearServerError = () => setFormError(null);

  // If no org selected, show selector
  if(!selectedOrganizationUuid && !isOrgSelectorOpen) {
    return (
      <div className="flex h-screen bg-background">
        {/* <Sidebar /> */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* <Header /> */}
          <main className="flex-1 overflow-y-auto p-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("organization.actions.new")}</CardTitle>
                <CardDescription>
                  {t("organization.empty.selectPrompt")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setIsOrgSelectorOpen(true)}>
                  {t("organization.actions.new")}
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* <Sidebar /> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Header /> */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto">
            <Breadcrumbs
              items={[
                { label: t("navigation.resources"), href: "/resources" },
                { label: t("binding.title"), href: "" },
              ]}
            />

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold">{t("binding.title")}</h1>
                {selectedOrganizationUuid && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-gray-600 truncate max-w-[220px] sm:max-w-xs md:max-w-md">{t("common.organization")}: {selectedOrganizationName}</span>
                    <Button
                      variant="link"
                      className="text-primary p-0 h-auto text-sm"
                      onClick={() => setIsOrgSelectorOpen(true)}
                    >
                      ({t("common.edit")})
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap space-x-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isDataLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isDataLoading ? "animate-spin" : ""}`} />
                  {t("common.actions.regenerate")}
                </Button>
                <div className="flex space-x-1">
                  <Button
                    variant={currentView === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleView("list")}
                  >
                    <List className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{t("common.list")}</span>
                  </Button>
                  <Button
                    variant={currentView === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleView("grid")}
                  >
                    <Grid className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{t("common.grid")}</span>
                  </Button>
                </div>
              </div>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Building className="h-6 w-6 text-primary" />
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold truncate">{initialOrgName}</h2>
                    {initialOrgDistrict && (
                      <div className="text-muted-foreground text-sm">
                        {initialOrgDistrict}
                      </div>
                    )}
                    {initialOrgAddress && (
                      <div className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{initialOrgAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Organization Selector Dialog */}
            <Dialog
              open={isOrgSelectorOpen}
              onOpenChange={(open) => {
                if(!open && !selectedOrganizationUuid) return;
                setIsOrgSelectorOpen(open);
              }}
            >
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("organization.actions.new")}</DialogTitle>
                </DialogHeader>
                <OrganizationSelector
                  value={selectedOrganizationUuid}
                  currentOrganizationUuid={selectedOrganizationUuid}
                  onChange={(u, i, n) => {
                    handleOrganizationChange(u, i, n);
                    setIsOrgSelectorOpen(false);
                  }}
                />
              </DialogContent>
            </Dialog>

            {/* Plan Settings Selector & Filter Chip (move above Add button row) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
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
              </div>
              {selectedPlanSettingsId && (
                <div className="flex flex-wrap gap-1">
                  <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                    <GraduationCap className="h-3 w-3" />
                    <span>
                      {t("class.form.planSettings")}: {getPlanSettingName(selectedPlanSettingsId)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              <Button
                onClick={handleCreateClick}
                disabled={
                  !teachersResponseData.length ||
                  !subjectsResponseData.length ||
                  !classesResponseData.length ||
                  !roomsResponseData.length ||
                  isDataLoading
                }
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("actions.add")}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/bindings/search-replace")}
              >
                <Replace className="h-4 w-4 mr-2" />
                {t("binding.search.title")}
              </Button>
            </div>

            {/* Binding Form Dialog */}
            <Dialog
              open={isEditMode || selectedBindingUuid === "new"}
              onOpenChange={(open) => {
                if(!open) resetForm();
              }}
              modal={true}
            >
              <DialogContent className="sm:max-w-[1200px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    {isEditMode ? t("binding.edit") : t("binding.create")}
                  </DialogTitle>
                </DialogHeader>
                {isDataLoading ? (
                  <div className="mb-4">
                    <Progress value={80} className="h-1" />
                    <p className="text-sm text-muted-foreground mt-2">
                      {t("common.loading")}
                    </p>
                  </div>
                ) : (
                  <BindingForm
                    teachers={teachersResponseData}
                    subjects={subjectsResponseData}
                    classes={classesResponseData}
                    classBands={classBandsResponseData}
                    rooms={roomsResponseData}
                    rules={rulesResponseData}
                    initialData={selectedBinding}
                    onSave={handleCreateBinding}
                    onUpdate={handleUpdateBinding}
                    onCancel={resetForm}
                    isEditing={isEditMode}
                    isLoading={isCreating || isUpdating}
                    organizationUuid={selectedOrganizationUuid}
                    organizationId={selectedOrganizationId}
                    existingBindings={bindings}
                    planSettingsList={planSettingsList}
                    selectedPlanSettingsId={selectedPlanSettingsId}
                    serverError={formError}
                    onClearServerError={handleClearServerError}
                  />
                )}
              </DialogContent>
            </Dialog>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 overflow-x-auto flex-nowrap w-full">
                <TabsTrigger value="bindings">{t("binding.title")}</TabsTrigger>
                <TabsTrigger value="workload">{t("resource.allocation")}</TabsTrigger>
              </TabsList>

              {/* Bindings Tab */}
              <TabsContent value="bindings">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t("common.search")}
                      className="pl-8"
                      value={searchKeyword}
                      onChange={handleSearchChange}
                      disabled={isDataLoading}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fixed-only"
                      checked={showFixedOnly}
                      onCheckedChange={(checked) => {
                        if (typeof checked === 'boolean') {
                          setShowFixedOnly(checked);
                        }
                      }}
                      className="h-5 w-5 rounded"
                    />
                    <label htmlFor="fixed-only" className="text-sm">
                      {t("binding.form.isFixed")}
                    </label>
                  </div>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>{t("binding.title")}</CardTitle>
                    <CardDescription>
                      {(bindingsResponse?.totalItems ?? bindings.length) + " " + t("binding.total")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-auto">
                    {currentView === "list" ? (
                      <BindingList
                        bindings={filteredBindings}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        isLoading={isLoadingBindings}
                      />
                    ) : (
                      <BindingGrid
                        bindings={filteredBindings}
                        onEdit={handleEditClick}
                        onDelete={handleDeleteClick}
                        isLoading={isLoadingBindings}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Workload Tab */}
              <TabsContent value="workload">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("resource.allocation")}</CardTitle>
                    <CardDescription>
                      {t("common.teachers")} / {t("common.classes")} / {t("common.subjects")} / {t("common.rooms")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="overflow-auto">
                    <BindingWorkload
                      selectedOrganizationId={selectedOrganizationId}
                      viewType={currentView}
                      planSettingsId={selectedPlanSettingsId}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmation
              isOpen={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
              onConfirm={handleDeleteBinding}
              isDeleting={isDeleting}
              title={t("common.deleteConfirmTitle")}
              description={t("common.deleteConfirmMessage", { moduleName: t("binding.title") })}
              showTrigger={false}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageBinding;
