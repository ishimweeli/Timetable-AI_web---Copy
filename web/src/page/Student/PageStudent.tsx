import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Trash2,
  Loader2,
  Eye,
  Building,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  X,
  Check,
  CheckCheck,
  User,
  School
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import { Button } from "@/component/Ui/button";
import { useToast } from "@/component/Ui/use-toast";
import { Input } from "@/component/Ui/input";
import { Spinner } from "@/component/Ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/Ui/popover";
import { Checkbox } from "@/component/Ui/checkbox";
import { Label } from "@/component/Ui/label";
import StudentForm from "@/component/Student/StudentForm";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { useAppSelector } from "@/hook/useAppRedux";
import { useI18n } from "@/hook/useI18n";
import {
  apiStudent,
  useGetStudentByUuidQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetOrganizationsQuery,
  useImportStudentsCsvMutation,
  GetStudentsParams,
  useAssignStudentsToClassMutation
} from "@/store/Student/ApiStudent";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs.tsx";
import { Progress } from "@/component/Ui/progress.tsx";
import CsvImport from "@/component/Common/CsvImport";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/component/Ui/radio-group";
import { Badge } from "@/component/Ui/badge";
import EmptyState from "@/component/Common/EmptyState";
import DetailCardHeader from "@/component/Common/DetailCardHeader";
import { useGetClassesQuery } from "@/store/Class/ApiClass";


function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const EnhancedStudentClassAssignmentPanel = ({
  isOpen,
  onClose,
  students,
  classes,
  onAssign,
  isLoading
}) => {
  const [selectedStudentUuids, setSelectedStudentUuids] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [viewMode, setViewMode] = useState("all"); // "all", "assigned", "unassigned"
  const [filterKeyword, setFilterKeyword] = useState("");
  
  const unassignedStudents = students.filter(s => !s.classId || s.classId === 0 || s.classId === null);
  const assignedStudents = students.filter(s => s.classId && s.classId !== 0 && s.classId !== null);
  
  const filteredStudents = viewMode === "all" 
    ? students 
    : viewMode === "assigned" 
    ? assignedStudents 
    : unassignedStudents;
    
  const displayedStudents = filterKeyword 
    ? filteredStudents.filter(s => 
        s.fullName?.toLowerCase().includes(filterKeyword.toLowerCase()) || 
        s.studentIdNumber?.toLowerCase().includes(filterKeyword.toLowerCase())
      )
    : filteredStudents;

  const handleStudentToggle = (uuid) => {
    setSelectedStudentUuids((prev) =>
      prev.includes(uuid)
        ? prev.filter((id) => id !== uuid)
        : [...prev, uuid]
    );
  };
  
  const handleSelectAllVisible = () => {
    if (selectedStudentUuids.length === displayedStudents.length) {
      setSelectedStudentUuids([]);
    } else {
      setSelectedStudentUuids(displayedStudents.map(s => s.uuid));
    }
  };

  const handleAssign = () => {
    if(selectedStudentUuids.length && selectedClassId) {
      onAssign(selectedStudentUuids, selectedClassId);
    }
  };
  
  const getClassNameById = (classId) => {
    const foundClass = classes.find(c => c.id === classId);
    return foundClass ? foundClass.name : "Unknown";
  };

  if(!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-lg z-50 flex flex-col border-l border-gray-200">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="font-semibold text-lg">Assign Students to Class</div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="p-4 border-b">
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium">Target Class</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
          >
            <option value="">Choose a class</option>
            {classes.map(cls => (
              <option key={cls.uuid} value={cls.id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Button 
            size="sm" 
            variant={viewMode === "all" ? "default" : "outline"}
            onClick={() => setViewMode("all")}
          >
            All ({students.length})
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === "assigned" ? "default" : "outline"}
            onClick={() => setViewMode("assigned")}
            className="text-xs"
          >
            Assigned ({assignedStudents.length})
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === "unassigned" ? "default" : "outline"}
            onClick={() => setViewMode("unassigned")}
            className="text-xs"
          >
            Unassigned ({unassignedStudents.length})
          </Button>
        </div>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            value={filterKeyword}
            onChange={(e) => setFilterKeyword(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Select Students ({displayedStudents.length})</div>
          <Button 
            variant="link" 
            size="sm"
            onClick={handleSelectAllVisible}
          >
            {selectedStudentUuids.length === displayedStudents.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
        <div className="max-h-full overflow-y-auto border rounded">
          {displayedStudents.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No students match the current filters
            </div>
          ) : (
            displayedStudents.map(student => (
              <div key={student.uuid} className="flex items-center px-2 py-2 border-b last:border-b-0 hover:bg-muted/20">
                <Checkbox
                  checked={selectedStudentUuids.includes(student.uuid)}
                  onCheckedChange={() => handleStudentToggle(student.uuid)}
                  id={`student-${student.uuid}`}
                />
                <label htmlFor={`student-${student.uuid}`} className="ml-2 cursor-pointer flex-1">
                  <div>{student.fullName}</div>
                  <div className="flex items-center">
                    <span className="text-xs text-muted-foreground mr-2">{student.studentIdNumber}</span>
                    {student.classId ? (
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        {getClassNameById(student.classId)}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                        Unassigned
                      </span>
                    )}
                  </div>
                </label>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="p-4 border-t flex justify-between gap-2">
        <div className="text-sm">
          {selectedStudentUuids.length} students selected
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedStudentUuids.length || !selectedClassId || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
};

const PageStudent = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudentUuid, setSelectedStudentUuid] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isNewStudentOpen, setIsNewStudentOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [sortBy, setSortBy] = useState(undefined);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [isOrgPopoverOpen, setIsOrgPopoverOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState("directory");
  const [formMode, setFormMode] = useState("view");
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [autoLoadingInProgress, setAutoLoadingInProgress] = useState(false);
  const initialRequestMade = useRef(false);
  const listContainerRef = useRef(null);
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roleName === "ADMIN";
  const { data: organizationsResponse, isLoading: isLoadingOrganizations } =
      useGetOrganizationsQuery();
  const organizations = organizationsResponse?.data || [];
  const [triggerGetStudents, { data: studentListData, isFetching, isLoading }] =
      apiStudent.endpoints.getStudents.useLazyQuery();
  const {
    data: selectedStudentData,
    isFetching: isStudentFetching,
    refetch: refetchStudent,
  } = useGetStudentByUuidQuery(selectedStudentUuid, {
    skip: !selectedStudentUuid,
  });
  const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();
  const [importStudentsCsv, { isLoading: isImportingCsv }] = useImportStudentsCsvMutation();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const { data: classesResponse, isLoading: isLoadingClasses } = useGetClassesQuery({});
  const classes = classesResponse?.data || [];
  const [isAssignmentPanelOpen, setIsAssignmentPanelOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignStudentsToClass] = useAssignStudentsToClassMutation();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if(!initialRequestMade.current) {
      initialRequestMade.current = true;
      fetchStudents();
    }
  }, []);

  const fetchStudents = async () => {
    const queryParams: GetStudentsParams = {
      page,
      size,
      ...(sortBy && { sortBy }),
      ...(sortDirection && { sortDirection }),
      ...(debouncedKeyword && { keyword: debouncedKeyword }),
      ...(selectedOrgId && { orgId: selectedOrgId }),
      ...(selectedClassId === 'unassigned' ? {} : selectedClassId ? { classId: selectedClassId } : {}),
    };
    try {
      const response = await triggerGetStudents(queryParams);
      const apiResponse = response.data;
      if(!apiResponse) {
        const errorMessage = response.error || t("student.errors.fetchFailed");
        toast({
          title: t("common.error"),
          description: typeof errorMessage === 'string' ? errorMessage : t("student.errors.fetchFailed"),
          variant: "destructive",
        });
        setFormError(typeof errorMessage === 'string' ? errorMessage : t("student.errors.fetchFailed"));
        return null;
      }
      const newStudents = Array.isArray(apiResponse.data) ? apiResponse.data : [];
      if(page === 0) {
        setStudents(newStudents);
      } else {
        setStudents((prev) => {
          const prevArr = Array.isArray(prev) ? prev : [];
          const existingIds = new Set(prevArr.map((s) => s.uuid));
          const newArr = newStudents.filter((s) => !existingIds.has(s.uuid));
          return [...prevArr, ...newArr];
        });
      }
      if (selectedClassId === null || selectedClassId === "") {
        setFilteredStudents(newStudents);
      } else if (selectedClassId === "unassigned") {
        setFilteredStudents(newStudents.filter(s => !s.classId || s.classId === 0 || s.classId === null));
      } else {
        setFilteredStudents(newStudents.filter(s => String(s.classId) === String(selectedClassId)));
      }
      setTotalStudents(apiResponse?.totalItems ?? 0);
      if(!apiResponse.data || apiResponse.data.length < size) {
        setHasMore(false);
      }else {
        setHasMore(true);
      }
      setIsLoadingMore(false);
      setRequestInProgress(false);
      setAutoLoadingInProgress(false);
      return apiResponse;
    }catch(error) {
      handleApiError(error, t("student.errors.fetchFailed"));
      setIsLoadingMore(false);
      setRequestInProgress(false);
      setAutoLoadingInProgress(false);
      return null;
    }
  };

  useEffect(() => {
    if(initialRequestMade.current) {
      setStudents([]);
      fetchStudents();
    }
  }, [sortBy, sortDirection, debouncedKeyword, selectedOrgId]);

  useEffect(() => {
    if(initialRequestMade.current && page > 0) {
      fetchStudents();
    }
  }, [page, size]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if(initialRequestMade.current) {
        fetchStudents();
        if(selectedStudentUuid) {
          refetchStudent();
        }
      }
    }, 30000);
    return () => clearInterval(intervalId);
  }, [initialRequestMade.current, selectedStudentUuid]);

  useEffect(() => {
    if(studentListData) {
      if(page === 0) {
        setStudents(studentListData.data || []);
      }else {
        setStudents((prev) => {
          const existingIds = new Set(prev.map((s) => s.uuid));
          const newStudents = (studentListData.data || []).filter(
              (s) => !existingIds.has(s.uuid),
          );
          return [...prev, ...newStudents];
        });
      }
      setTotalStudents(Number(studentListData.pagination?.totalItems) || 0);
      if(!studentListData.data || studentListData.data.length < size) {
        setHasMore(false);
      }else {
        setHasMore(true);
      }
      setIsLoadingMore(false);
      setRequestInProgress(false);
      setAutoLoadingInProgress(false);
    }
  }, [studentListData, size, page]);

  useEffect(() => {
    if(uuid) {
      if(uuid === "new") {
        handleNewStudent();
      } else if(uuid !== selectedStudentUuid) {
        handleSelectStudent(uuid);
      }
    }else {
      handleClosePanel();
    }
  }, [uuid]);

  useEffect(() => {
    if(selectedStudentData?.data) {
      setSelectedStudent(selectedStudentData.data);
    }else {
      setSelectedStudent(null);
    }
  }, [selectedStudentData]);

  // Add scroll event listener to handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        listContainerRef.current &&
        hasMore &&
        !isFetching &&
        !isLoadingMore &&
        !requestInProgress &&
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
  }, [hasMore, isFetching, isLoadingMore, requestInProgress, autoLoadingInProgress]);

  // Initialize scroll behavior
  useEffect(() => {
    const timer = setTimeout(() => {
      if (listContainerRef.current) {
        listContainerRef.current.style.overflow = 'hidden';
        setTimeout(() => {
          if (listContainerRef.current) {
            listContainerRef.current.style.overflow = 'auto';
          }
        }, 10);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Restore scroll position when component mounts or when students change
  useEffect(() => {
    if (listContainerRef.current && scrollPosition > 0 && students.length > 0) {
      // Use a small timeout to ensure the DOM has updated
      const timer = setTimeout(() => {
        if (listContainerRef.current) {
          listContainerRef.current.scrollTop = scrollPosition;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [students.length, scrollPosition]);

  useEffect(() => {
    if (selectedClassId === null || selectedClassId === "") {
      setFilteredStudents(students);
    } else if (selectedClassId === "unassigned") {
      setFilteredStudents(students.filter(s => !s.classId || s.classId === 0 || s.classId === null));
    } else {
      setFilteredStudents(students.filter(s => String(s.classId) === String(selectedClassId)));
    }
  }, [students, selectedClassId]);

  const handleApiError = (error, defaultMessage) => {
    if(!error) return defaultMessage;
    if(error.isAxiosError && error.response?.data) {
      const errorData = error.response.data;
      if(errorData.error && typeof errorData.error === "string") {
        if(
            errorData.error.includes("Duplicate entry") &&
            errorData.error.includes("@")
        ) {
          return t("student.errors.emailExists");
        }
        if(errorData.error.includes("UK33uo7vet9c79ydfuwg1w848f")) {
          return t("student.errors.emailExists");
        }
        return errorData.error;
      }
      if(errorData.message) {
        return errorData.message;
      }
    }
    return defaultMessage;
  };

  const handleLoadMore = useCallback(() => {
    if(hasMore && !isFetching && !isLoadingMore && !requestInProgress) {
      // Save current scroll position before loading more
      if (listContainerRef.current) {
        setScrollPosition(listContainerRef.current.scrollTop);
      }

      // Show loading state
      setIsLoadingMore(true);
      setRequestInProgress(true);

      // Load next page
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore, isFetching, isLoadingMore, requestInProgress]);

  const handleSelectStudent = async (uuid) => {
    if(uuid === selectedStudentUuid) {
      handleClosePanel();
      navigate("/students", { replace: true });
    }else {
      try {

        setIsNewStudentOpen(false);
        setFormMode("view");
        setSelectedStudent(null);
        setSelectedStudentUuid(uuid);
        setIsDetailsOpen(true);
        navigate(`/students/${uuid}`);
      }catch(error) {
        console.error("Error fetching student details:", error);
        toast({
          title: t("common.error"),
          description: handleApiError(
              error,
              t("student.errors.fetchDetailsFailed"),
          ),
          variant: "destructive",
        });
      }
    }
  };

  const handleClosePanel = () => {
    setSelectedStudentUuid(null);
    setSelectedStudent(null);
    setIsDetailsOpen(false);
    setIsNewStudentOpen(false);
    setFormError(null);
    setFormMode("view");
    navigate("/students", { replace: true });
  };

  const handleNewStudent = () => {
    setSelectedStudentUuid(null);
    setSelectedStudent(null);
    setIsDetailsOpen(false);
    setFormError(null);
    setIsNewStudentOpen(true);
    setFormMode("new");
    setRefreshKey(prevKey => prevKey + 1);
    navigate("/students/new");
  };

  const handleCreateStudent = async (data) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await createStudent(data).unwrap();
      if(response.success === false) {
        const errorMessage = response.error || t("student.errors.createFailed");
        toast({
          title: t("common.error"),
          description: errorMessage,
          variant: "destructive",
        });
        setFormError(errorMessage);
        return;
      }
      toast({
        title: t("common.success"),
        description: t("student.success.created"),
      });
      setPage(0);
      await fetchStudents();
      handleClosePanel();
    }catch(error) {
      console.error("Error creating student:", error);
      const errorMessage = handleApiError(
          error,
          t("student.errors.createFailed"),
      );
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async (data) => {
    if(!selectedStudentUuid) return;

    const nameParts = data.fullName.split(/\s+/, 2);
    const updateData = {
      ...data,
      firstName: nameParts[0],
      lastName: nameParts.length > 1 ? nameParts[1] : "",
    };

    setIsSubmitting(true);
    setFormError(null);
    try {
      const response = await updateStudent({
        uuid: selectedStudentUuid,
        student: updateData,
      }).unwrap();
      if(response.success === false) {
        const errorMessage = response.error || t("student.errors.updateFailed");
        toast({
          title: t("common.error"),
          description: errorMessage,
          variant: "destructive",
        });
        setFormError(errorMessage);
        return;
      }
      toast({
        title: t("common.success"),
        description: t("student.success.updated"),
      });
      setPage(0);
      await fetchStudents();
      await refetchStudent();
    }catch(error) {
      console.error("Error updating student:", error);
      const errorMessage = handleApiError(
          error,
          t("student.errors.updateFailed"),
      );
      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDialogOpen = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteStudent = async () => {
    if(!selectedStudentUuid) return;
    try {
      await deleteStudent(selectedStudentUuid).unwrap();
      toast({
        title: t("common.success"),
        description: t("student.success.deleted"),
      });
      setStudents((prevStudents) =>
          prevStudents.filter((student) => student.uuid !== selectedStudentUuid),
      );
      setTotalStudents((prev) => Math.max(0, prev - 1));
      handleClosePanel();
      setPage(0);
      await fetchStudents();
    }catch(error) {
      console.error("Error deleting student:", error);
      toast({
        title: t("common.error"),
        description: handleApiError(error, t("student.errors.deleteFailed")),
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handleToggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    setPage(0);
    setStudents([]);
  };

  const handleOrganizationSelect = (orgId) => {
    setSelectedOrgId(orgId);
    setPage(0);
    setStudents([]);
    setIsOrgPopoverOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedKeyword("");
    setSelectedOrgId(null);
    setSortDirection("asc");
    setSortBy(undefined);
    setPage(0);
    setStudents([]);
    setIsOrgPopoverOpen(false);

    setTimeout(() => {
      fetchStudents();
    }, 0);
  };

  const getOrganizationName = (id) => {
    if(!id) return "";
    const org = organizations.find((org) => org.id === id);
    return org ? org.name : "";
  };

  const handleDeleteClick = () => {
    if(selectedStudentUuid) {
      setIsDeleteDialogOpen(true);
    }
  };

  const handleImportCsv = async (file: File, options: { skipHeaderRow: boolean, organizationId?: number | null }) => {
    try {
      const result = await importStudentsCsv({
        file,
        options: {
          skipHeaderRow: options.skipHeaderRow,
          organizationId: options.organizationId || selectedOrgId,
        },
      }).unwrap();

      if(result.success && result.data?.successCount === 0 && result.data?.errorCount > 0) {
        toast({
          title: t("common.warning"),
          description: result.message || t("student.errors.noStudentsImported"),
          variant: "destructive",
        });
      } else if(result.message?.includes("student.csv.import.failed") || result.message?.includes("No students were created")) {
        toast({
          title: t("common.error"),
          description: t("student.errors.importFailed"),
          variant: "destructive",
        });
      }
      setPage(0);
      await fetchStudents();

      return result;
    }catch(error) {

      if(error.status === 400 && error.data) {
        const errorData = error.data;
        if(errorData.message?.includes("student.csv.import.failed") ||
            errorData.message?.includes("No students were created")) {

          toast({
            title: t("common.error"),
            description: t("student.errors.importFailed"),
            variant: "destructive",
          });
          return {
            success: false,
            message: t("student.errors.importFailed"),
            data: {
              totalProcessed: errorData.data?.totalProcessed || 0,
              successCount: 0,
              errorCount: errorData.data?.totalProcessed || 0,
              errors: errorData.data?.errors || []
            }
          };
        }

        toast({
          title: t("common.error"),
          description: errorData.message || t("student.errors.importFailed"),
          variant: "destructive",
        });

        return {
          success: false,
          message: errorData.message || t("student.errors.importFailed"),
          data: errorData.data || {
            totalProcessed: 0,
            successCount: 0,
            errorCount: 0,
            errors: []
          }
        };
      }
      const errorMessage = handleApiError(error, t("student.errors.importFailed"));

      toast({
        title: t("common.error"),
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const handleBatchAssign = async (studentUuids, classId) => {
    setIsAssigning(true);
    try {
      await assignStudentsToClass({ studentUuids, classId: Number(classId) }).unwrap();
      toast({ title: t("common.success"), description: t("student.success.assigned") });
      setIsAssignmentPanelOpen(false);
      setPage(0);
      await fetchStudents();
    } catch (error) {
      toast({ title: t("common.error"), description: t("student.errors.assignFailed"), variant: "destructive" });
    } finally {
      setIsAssigning(false);
    }
  };

  const showRightPanel = isDetailsOpen || isNewStudentOpen;
  const isLoadingAny = isLoading || isCreating || isUpdating || isDeleting || isImportingCsv;

  const isFiltered = Boolean(
      debouncedKeyword || selectedOrgId || sortBy || sortDirection !== "asc",
  );

  const canImport = isAdmin && organizations.length > 0;

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
            <div
                className="container-main mx-auto py-4 px-4 sm:px-6 h-full flex flex-col istui-timetable__main_content">
              <div className="flex justify-between items-center mb-4 istui-timetable__main_breadcrumbs_wrapper">
                <Breadcrumbs
                    className="istui-timetable__main_breadcrumbs"
                    items={[
                      {label: t("navigation.resources"), href: "/resources"},
                      {label: t("navigation.students"), href: ""},
                    ]}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="lg:col-span-6 xl:col-span-7 flex flex-col istui-timetable__main_list_card">
                  <Card className="overflow-hidden h-full border-0 shadow-md">
                    <div className="sticky top-0 z-10 bg-background border-b">
                      <CardHeader className="pb-1 bg-secondary">
                        <div className="flex items-center justify-between mb-1">
                          <div className={""}>
                            <CardTitle>
                              {t("common.students")}
                              {typeof totalStudents === "number" && students.length > 0 && (
                                <span className="text-muted-foreground text-sm font-normal ml-2">
                                  ({students.length})
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                                className="istui-timetable__main_list_card_button"
                                size="sm"
                                onClick={handleNewStudent}
                            >
                              <Plus className="h-4 w-4 mr-1"/>
                              {t("actions.add")}
                            </Button>
                            <CsvImport
                              onImport={handleImportCsv}
                              buttonVariant="outline"
                              buttonSize="sm"
                              organizations={organizations}
                              selectedOrgId={selectedOrgId}
                              organizationId={user?.organizationId ? Number(user.organizationId) : null}
                              isAdmin={isAdmin}
                            />
                          </div>
                        </div>
                        <CardDescription></CardDescription>
                      </CardHeader>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-2 w-fit border rounded px-2 py-1">
                            <School className="h-4 w-4 text-muted-foreground" />
                            <select
                              className="border-none outline-none bg-transparent py-1 w-full"
                              value={selectedClassId || ''}
                              onChange={e => {
                                const newClassId = e.target.value || null;
                                setSelectedClassId(newClassId);
                                setPage(0);
                                setStudents([]);
                                setTimeout(() => {
                                  fetchStudents();
                                }, 0);
                              }}
                            >
                              <option value="">All Classes</option>
                              <option value="unassigned">Unassigned Students</option>
                              {classes.map(cls => (
                                <option key={cls.uuid} value={cls.id}>{cls.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                            <Input
                                type="search"
                                placeholder={t("student.list.searchPlaceholder")}
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
                                      aria-label={t("student.filter.byOrganization")}
                                  >
                                    <Building className="h-4 w-4"/>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-56 p-2" align="end">
                                  <div className="space-y-2">
                                    <div className="font-medium text-sm">
                                      {t("student.filter.byOrganization")}
                                    </div>
                                    <div className="h-px bg-border"/>
                                    {isLoadingOrganizations ? (
                                        <div className="py-2 flex items-center justify-center">
                                          <Spinner className="h-4 w-4 mr-2"/>
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
                          )}
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={handleToggleSortDirection}
                              aria-label={t(`common.sort.${sortDirection}`)}
                          >
                            {sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4"/>
                            ) : (
                                <ArrowDown className="h-4 w-4"/>
                            )}
                          </Button>
                        </div>
                        {(selectedOrgId || debouncedKeyword || selectedClassId) && (
                            <div className="flex flex-wrap gap-1 mt-2">
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
                              {selectedClassId && (
                                  <div
                                      className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
                                    <School className="h-3 w-3"/>
                                    <span>
                                      {selectedClassId === "unassigned" ? "Unassigned Students" : 
                                       classes.find(c => String(c.id) === String(selectedClassId))?.name || "Unknown Class"}
                                    </span>
                                  </div>
                              )}
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAssignmentPanelOpen(true)}
                            className="flex items-center gap-1"
                          >
                            <School className="h-4 w-4" />
                            Manage Class Assignments
                          </Button>
                        </div>
                      </div>
                      <div className="px-4 pb-2">
                        <div className="flex justify-between items-center">
                          <div
                              className="grid grid-cols-6 w-full text-sm font-medium text-muted-foreground"
                              style={{
                                gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 0.5fr",
                              }}
                          >
                            <div>{t("student.fields.studentId")}</div>
                            <div>{t("student.fields.fullName")}</div>
                            <div>{t("student.fields.department")}</div>
                            <div>{t("student.fields.status")}</div>
                            <div>Class</div>
                            <div className="text-right">{t("common.actions")}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-0">
                      <div
                          className="overflow-y-auto"
                          ref={listContainerRef}
                          style={{
                            maxHeight: "calc(100vh - 250px)",
                            scrollBehavior: "auto",
                            height: "calc(100vh - 250px)",
                          }}
                      >
                        <div className="px-4">
                          {(isLoading || isFetching) &&
                          students.length === 0 ? (
                              <div className="text-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2"/>
                                <p>{t("student.list.loading")}</p>
                              </div>
                          ) : students.length === 0 ? (
                              <EmptyState
                                icon={<User />}
                                title={t("student.emptyState.title")}
                                description={t("student.emptyState.description")}
                                onAdd={handleNewStudent}
                                showImport={canImport}
                                onImport={handleImportCsv}
                                organizations={organizations}
                                selectedOrgId={selectedOrgId}
                                organizationId={user?.organizationId ? Number(user.organizationId) : null}
                                isAdmin={isAdmin}
                                hasPermission={isAdmin}
                              />
                          ) : (
                              <>
                                <div className="w-full">
                                  {filteredStudents.map((student) => (
                                      <div
                                          key={`${student.uuid}-${refreshKey}`}
                                          className={`grid grid-cols-6 py-3 border-b cursor-pointer ${selectedStudentUuid === student.uuid ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-accent border-l-4 border-transparent"}`}
                                          style={{
                                            gridTemplateColumns: "1fr 1.5fr 1fr 1fr 1fr 0.5fr",
                                          }}
                                          onClick={() =>
                                              handleSelectStudent(student.uuid)
                                          }
                                      >
                                        <div className="pl-4 py-1 flex items-center">
                                          {student.studentIdNumber}
                                        </div>
                                        <div className="py-1 flex items-center">
                                            {student.fullName}
                                        </div>
                                        <div className="py-1 flex items-center">
                                          {student.department || "-"}
                                        </div>
                                        <div className="py-1 flex items-center">
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs ${student.statusId === 1 ? "bg-green-100 text-green-800" : student.statusId === 2 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                                      >
                                        {student.statusId === 1
                                            ? t("student.status.active")
                                            : student.statusId === 2
                                                ? t("student.status.pending")
                                                : t("student.status.inactive")}
                                      </span>
                                        </div>
                                        <div className="py-1 flex items-center">
                                          {student.classId ? (
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                              {classes.find(c => c.id === student.classId)?.name || `Class ${student.classId}`}
                                            </span>
                                          ) : (
                                            <span className="px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                                              Unassigned
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-right pr-4">
                                          <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedStudentUuid(student.uuid);
                                                setIsDeleteDialogOpen(true);
                                              }}
                                          >
                                            <Trash2 className="h-4 w-4"/>
                                          </Button>
                                        </div>
                                      </div>
                                  ))}
                                </div>
                                {isFetching || isLoadingMore ? (
                                    <div className="text-center py-4">
                                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        {t("student.list.loadingMore")}
                                      </div>
                                    </div>
                                ) : hasMore ? (
                                    <div className="text-center py-4">
                                      <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={handleLoadMore}
                                          disabled={isLoadingMore || isFetching || requestInProgress}
                                          className="min-w-[200px]"
                                      >
                                        <div className="flex items-center">
                                          {(isLoadingMore || isFetching || requestInProgress) &&
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                          }
                                          {t("student.list.loadMore")}
                                          {totalStudents > 0 && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                              ({filteredStudents.length < totalStudents ? filteredStudents.length : totalStudents}/{totalStudents})
                                            </span>
                                          )}
                                        </div>
                                      </Button>
                                    </div>
                                ) : (
                                    <div className="text-center py-3 text-xs text-muted-foreground">
                                      {t("common.endOfList")}
                                    </div>
                                )}
                                {/* Simple padding to ensure scrollbar appears */}
                                <div className="h-20" aria-hidden="true"></div>
                              </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
                  <Card className="overflow-hidden h-full border-0 shadow-md">
                    {showRightPanel ? (
                      <>
                        <DetailCardHeader
                          label={isNewStudentOpen ? t("common.details") : t("common.details")}
                        />
                        <CardContent className="p-6">
                          <StudentForm
                              key={isNewStudentOpen ? 'new-student' : `edit-${selectedStudentUuid}-${refreshKey}`}
                              onSubmit={
                                isNewStudentOpen
                                    ? handleCreateStudent
                                    : handleUpdateStudent
                              }
                              initialData={selectedStudent || undefined}
                              isSubmitting={isSubmitting}
                              onDelete={handleDeleteClick}
                              isDeleting={isDeleting}
                              error={formError}
                              footer={
                                <div className="flex justify-between">
                                  <Button
                                  size="sm"
                                      className="istui-timetable__main_form_cancel_button"
                                      variant="outline"
                                      type="button"
                                      onClick={handleClosePanel}
                                  >
                                    <X/>
                                    {t("common.cancel")}
                                  </Button>
                                  {!isNewStudentOpen && selectedStudent && (
                                      <Button
                                      size="sm"
                                          variant="destructive"
                                          type="button"
                                          onClick={handleDeleteClick}
                                          disabled={isDeleting}
                                      >
                                        {isDeleting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        ) : (
                                            <Trash2 className="mr-2 h-4 w-4"/>
                                        )}
                                        {t("common.delete")}
                                      </Button>
                                  )}
                                  <Button type="submit" disabled={isSubmitting}>
                                    {isNewStudentOpen

                                        ?<><CheckCheck/>{t("student.create")}</>
                                        :<><Check/> { t("common.update")}</>}
                                  </Button>
                                </div>
                              }
                          />
                        </CardContent>
                      </>
                    ) : (
                      <EmptyState
                        icon={<User />}
                        title={t("student.emptyState.title")}
                        description={t("student.emptyState.description")}
                        onAdd={handleNewStudent}
                        showImport={canImport}
                        onImport={handleImportCsv}
                        organizations={organizations}
                        selectedOrgId={selectedOrgId}
                        organizationId={user?.organizationId ? Number(user.organizationId) : null}
                        isAdmin={isAdmin}
                        hasPermission={isAdmin}
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
            onConfirm={handleDeleteStudent}
            isDeleting={isDeleting}
            title={t("common.deleteConfirmTitle")}
            description={t("common.deleteConfirmMessage", {
              moduleName: t("common.student"),
            })}
            showTrigger={false}
        />
        <EnhancedStudentClassAssignmentPanel
          isOpen={isAssignmentPanelOpen}
          onClose={() => setIsAssignmentPanelOpen(false)}
          students={students}
          classes={classes}
          onAssign={handleBatchAssign}
          isLoading={isAssigning}
        />
      </div>
  );
};

export default PageStudent;