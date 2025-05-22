import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Loader2, Upload, FileText,Book } from "lucide-react";
import { Button } from "@/component/Ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import SubjectForm from "@/component/Subject/SubjectForm";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import { useToast } from "@/component/Ui/use-toast";
import { SubjectFormData } from "@/type/subject";
import SubjectList from "@/component/Subject/SubjectList";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getOrganizations,
} from "@/services/subject/subjectService";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { useI18n } from "@/hook/useI18n";
import { useParams, useNavigate } from "react-router-dom";
import { SubjectSearchFilterHeader } from "@/component/Subject/SubjectSearchFilterComponents";
import { Progress } from "@/component/Ui/progress.tsx";
import CsvImport, { ImportResult } from "@/component/Common/CsvImport";
import * as ServiceSubject from "@/store/subject/ServiceSubject";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/component/Ui/tooltip";
import { Separator } from "@/component/Ui/separator";
import { UseQueryResult } from '@tanstack/react-query';
import DetailCardHeader from "@/component/Common/DetailCardHeader";

const SubjectModule = () => {
  const [selectedSubjectUuid, setSelectedSubjectUuid] = useState<string | null>(
      null,
  );
  const [isCreatingNewSubject, setIsCreatingNewSubject] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  // debouncedSearch is now handled by the useDebounce hook
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [subjects, setSubjects] = useState<SubjectFormData[]>([]);
  const [totalSubjects, setTotalSubjects] = useState<number | null>(null);

  // Refs for scroll handling
  const listContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Store scroll position for restoration
  const [scrollPosition, setScrollPosition] = useState(0);
  const [autoLoadingInProgress, setAutoLoadingInProgress] = useState(false);

  // Debounce hook function
  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = React.useState(value);
    React.useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  }

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if(page > 0) {
      setPage(0);
    }
  }, [debouncedSearchTerm, sortBy, sortOrder, selectedOrgId]);

  const {
    data: subjectsData,
    isLoading: isLoadingSubjects,
    isError: isSubjectsError,
    refetch: refetchSubjects,
    isFetching,
  } = useQuery<{ data: SubjectFormData[]; totalItems: number }>(
    {
      queryKey: [
        "subjects",
        page,
        pageSize,
        debouncedSearchTerm,
        sortBy,
        sortOrder,
        selectedOrgId,
      ],
      queryFn: () =>
        getSubjects(
          page,
          pageSize,
          debouncedSearchTerm,
          sortBy,
          sortOrder,
          selectedOrgId,
        ),
    }
  );

  // This effect is now handled in the useDebounce section above

  const { data: organizationsData, isLoading: isLoadingOrganizations } =
      useQuery<{ data: any[] }>(
        {
          queryKey: ["organizations"],
          queryFn: getOrganizations,
          staleTime: 5 * 60 * 1000,
        }
      );

  const organizations = React.useMemo(() => {
    if(!organizationsData) return [];
    if(organizationsData.data && Array.isArray(organizationsData.data)) {
      return organizationsData.data;
    } else if(Array.isArray(organizationsData)) {
      return organizationsData;
    }
    return [];
  }, [organizationsData]);

  const {
    data: selectedSubject,
    isLoading: isLoadingSelectedSubject,
    refetch: refetchSelectedSubject,
  } = useQuery({
    queryKey: ["subject", selectedSubjectUuid],
    queryFn: () =>
        selectedSubjectUuid ? getSubject(selectedSubjectUuid) : null,
    enabled: !!selectedSubjectUuid && !isCreatingNewSubject,
  });

  useEffect(() => {
    console.log("Selected subject data:", selectedSubject);
  }, [selectedSubject]);

  const formattedSubject = React.useMemo(() => {
    if(!selectedSubject) return null;

    const subjectData = selectedSubject.data || selectedSubject;

    return {
      uuid: selectedSubjectUuid,
      initials: subjectData.initials || "",
      name: subjectData.name || "",
      description: subjectData.description || "",
      durationInMinutes: subjectData.durationInMinutes || 60,
      repetitionType: subjectData.redRepetition
        ? "red"
        : subjectData.blueRepetition
          ? "blue"
          : "red",
      conflictSubjectId: subjectData.conflictSubjectId || 0,
      group: subjectData.group || "Normal",
      autoConflictHandling: !!subjectData.autoConflictHandling,
      organizationId: subjectData.organizationId || 1,
      statusId: subjectData.statusId || 1,
      color: subjectData.color || "#6E56CF",
    };
  }, [selectedSubject, selectedSubjectUuid]);

  const { mutate: createSubjectMutation, isPending: isCreating } = useMutation({
    mutationFn: (data: SubjectFormData) => createSubject(data),
    onSuccess: (data) => {
      if(data && data.success === false) {
        let createErrorMessage = t("subject.errors.createFailed");
        if(data.error) {
          if(data.error.includes("Subject with this code already exists")) {
            createErrorMessage = t("subject.errors.duplicateCode");
          }else {
            createErrorMessage = data.error;
          }
        }
        toast({
          title: t("common.error"),
          description: createErrorMessage,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: t("common.success"),
        description: t("subject.success.created"),
      });
      setIsCreatingNewSubject(false);
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      if(data && data.uuid) {
        setSelectedSubjectUuid(data.uuid);
        navigate(`/subjects/${data.uuid}`, { replace: true });
      }
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description:
            error.response?.data?.error || t("subject.errors.createFailed"),
        variant: "destructive",
      });
    },
  });

  const { mutate: updateSubjectMutation, isPending: isUpdating } = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: SubjectFormData }) =>
        updateSubject(uuid, data),
    onSuccess: (data) => {
      if(data && data.success === false) {
        let updateErrorMessage = t("subject.errors.updateFailed");
        if(data.error) {
          if(data.error.includes("Subject with this code already exists")) {
            updateErrorMessage = t("subject.errors.duplicateCode");
          }else {
            updateErrorMessage = data.error;
          }
        }
        toast({
          title: t("common.error"),
          description: updateErrorMessage,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: t("common.success"),
        description: t("subject.success.updated"),
      });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({
        queryKey: ["subject", selectedSubjectUuid],
      });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description:
            error.response?.data?.error || t("subject.errors.updateFailed"),
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteSubjectMutation, isPending: isDeleting } = useMutation({
    mutationFn: (uuid: string) => deleteSubject(uuid),
    onSuccess: (response) => {
      toast({
        title: t("common.success"),
        description: t("subject.success.deleted"),
      });
      setIsDeleteDialogOpen(false);
      setSelectedSubjectUuid(null);
      navigate("/subjects", { replace: true });
      const filteredSubjects = subjects.filter(
          (subject) => subject.uuid !== selectedSubjectUuid,
      );
      queryClient.setQueryData(["subjects"], (oldData: any) => {
        if(!oldData || !oldData.data) return oldData;
        return { ...oldData, data: filteredSubjects };
      });
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description:
            error.response?.data?.error || t("subject.errors.deleteFailed"),
        variant: "destructive",
      });
    },
  });

  const handleLoadMore = useCallback(() => {
    if(hasMore && !isFetching && !isLoadingMore) {
      // Show loading state
      setIsLoadingMore(true);

      // Load next page
      const nextPage = page + 1;
      setPage(nextPage);
    }
  }, [hasMore, isFetching, isLoadingMore, page]);

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

  // Restore scroll position when component mounts or when subjects change
  useEffect(() => {
    if (listContainerRef.current && scrollPosition > 0 && subjects.length > 0) {
      // Use a small timeout to ensure the DOM has updated
      const timer = setTimeout(() => {
        if (listContainerRef.current) {
          listContainerRef.current.scrollTop = scrollPosition;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [subjects.length, scrollPosition]);

  useEffect(() => {
    if(subjectsData) {
      const totalCount = subjectsData.totalItems;
      const receivedCount = subjectsData.data?.length || 0;

      // Get unique new subjects
      const getUniqueNewSubjects = () => {
        const existingSubjectsMap = new Map<string, boolean>();
        subjects.forEach(subject => {
          existingSubjectsMap.set(subject.uuid, true);
        });
        return (subjectsData.data || []).filter(subject => !existingSubjectsMap.has(subject.uuid));
      };

      let updatedSubjects: SubjectFormData[];

      if(page === 0) {
        // First page - replace all data
        updatedSubjects = subjectsData.data || [];
        setSubjects(updatedSubjects);

        // Update total count
        if(totalCount !== undefined) {
          setTotalSubjects(totalCount);
        } else {
          setTotalSubjects(receivedCount);
        }
      } else {
        // Subsequent pages - append unique new data
        const newUniqueSubjects = getUniqueNewSubjects();
        updatedSubjects = [...subjects, ...newUniqueSubjects];
        setSubjects(updatedSubjects);

        // Update total count if available from API
        if(totalCount !== undefined) {
          setTotalSubjects(totalCount);
        } else {
          // If no total count from API, increment by the number of new unique items
          setTotalSubjects(prev => (prev || 0) + newUniqueSubjects.length);
        }
      }

      // Determine if more items are available
      if(totalCount !== undefined) {
        // If we have a total count from the API, use it
        setHasMore(updatedSubjects.length < totalCount);
      } else {
        // If no total count, assume there are more if we received a full page
        setHasMore(receivedCount === pageSize);
      }

      setIsLoadingMore(false);
      setAutoLoadingInProgress(false);
    }
  }, [subjectsData, page, pageSize, subjects]);

  const handleSelectSubject = (uuid: string) => {
    if(isCreatingNewSubject) {
      if(
          window.confirm(
              t("subject.confirmUnsavedChanges")
          )
      ) {
        setSelectedSubjectUuid(uuid);
        setIsCreatingNewSubject(false);
        navigate(`/subjects/${uuid}`);
      }
    }else {
      setSelectedSubjectUuid(uuid);
      setIsCreatingNewSubject(false);
      navigate(`/subjects/${uuid}`);
    }
  };

  const handleNewSubject = () => {
    setSelectedSubjectUuid(null);
    setIsCreatingNewSubject(true);
    navigate("/subjects", { replace: true });
  };

  const handleSaveSubject = async (formData: SubjectFormData) => {
    const isDuplicateName = subjects.some(subject =>
      subject.name.toLowerCase() === formData.name.toLowerCase() &&
      subject.uuid !== formData.uuid
    );

    if(isDuplicateName) {
      toast({
        description: t("subject.errors.duplicateName") || "A subject with this name already exists",
        variant: "destructive",
      });
      return;
    }

    const isDuplicateInitials = subjects.some(subject =>
      subject.initials?.toLowerCase() === formData.initials?.toLowerCase() &&
      subject.uuid !== formData.uuid
    );

    if(isDuplicateInitials) {
      toast({
        title: t("common.error"),
        description: t("subject.errors.duplicateInitials") || "A subject with these initials already exists",
        variant: "destructive",
      });
      return;
    }

    if(selectedOrgId && t("subject.isAdmin")) {
      formData.organizationId = selectedOrgId;
    }
    if(isCreatingNewSubject) {
      const subjectData: SubjectFormData = {
        uuid: formData.uuid,
        name: formData.name,
        initials: formData.initials,
        description: formData.description,
        durationInMinutes: formData.durationInMinutes,
        repetitionType: formData.repetitionType,
        redRepetition: formData.repetitionType === "red",
        blueRepetition: formData.repetitionType === "blue",
        conflictSubjectId: formData.conflictSubjectId || 0,
        group: formData.group,
        autoConflictHandling: formData.autoConflictHandling,
        organizationId: formData.organizationId,
        statusId: formData.statusId,
        color: formData.color || "#6E56CF",
      };
      createSubjectMutation(subjectData);
    } else if(selectedSubjectUuid) {
      const subjectData: SubjectFormData = {
        uuid: selectedSubjectUuid,
        name: formData.name,
        initials: formData.initials,
        description: formData.description,
        durationInMinutes: formData.durationInMinutes,
        repetitionType: formData.repetitionType,
        redRepetition: formData.repetitionType === "red",
        blueRepetition: formData.repetitionType === "blue",
        conflictSubjectId: formData.conflictSubjectId || 0,
        group: formData.group,
        autoConflictHandling: formData.autoConflictHandling,
        organizationId: formData.organizationId,
        statusId: formData.statusId,
        color: formData.color || "#6E56CF",
      };
      updateSubjectMutation({ uuid: selectedSubjectUuid, data: subjectData });
    }
  };

  const handleCancelSubject = () => {
    if(isCreatingNewSubject) {
      setIsCreatingNewSubject(false);
      navigate("/subjects", { replace: true });
      setSelectedSubjectUuid(null);
    }else {
      setSelectedSubjectUuid(null);
      navigate("/subjects", { replace: true });
    }
  };

  const handleDeleteSubject = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if(selectedSubjectUuid) {
      deleteSubjectMutation(selectedSubjectUuid);
    }
  };

  const handleSortChange = (
      newSortBy: string,
      newSortOrder: "asc" | "desc",
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedOrgId(null);
    setSortBy("name");
    setSortOrder("asc");
    setPage(0);
  };

  const handleImportSubjects = async (
    file: File,
    options: { skipHeaderRow: boolean, organizationId?: number | null }
  ): Promise<ImportResult> => {
    try {
      const result = await ServiceSubject.importSubjectsFromCsv(file, options);


      if(result.success) {
        queryClient.invalidateQueries({ queryKey: ["subjects"] });
      }

      return result;
    }catch(error: any) {
      return {
        success: false,
        message: error.message || "Failed to import subjects"
      };
    }
  };

  const isLoading = isCreating || isUpdating;
  const isAdmin = true;
  useEffect(() => {
    if(uuid) {
      setSelectedSubjectUuid(uuid);
      setIsCreatingNewSubject(false);
    } else if(!isCreatingNewSubject) {
      setSelectedSubjectUuid(null);
    }
  }, [uuid, isCreatingNewSubject]);

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
                      { label: t("navigation.subjects"), href: "" },
                    ]}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                  <Card className="overflow-hidden border-0 shadow-md h-full flex flex-col">
                    <div className="sticky top-0 z-10 bg-background">
                      <CardHeader className="pb-1 bg-secondary">
                        <div className="flex items-center justify-between mb-1">
                          <div className={""}>
                            <CardTitle>
                              {t("common.subjects")}
                              {typeof totalSubjects === "number" && subjects.length > 0 && !isLoadingSubjects && !isFetching && (
                                <span className="text-muted-foreground text-sm font-normal ml-2">
                                  ({subjects.length})
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                                className="istui-timetable__main_list_card_button"
                                onClick={handleNewSubject}
                                size="sm"
                                disabled={isLoading}
                            >
                              {isLoading ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                  <Plus className="h-4 w-4 mr-2" />
                              )}
                              {t("actions.add")}
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <CsvImport
                                      onImport={handleImportSubjects}
                                      buttonVariant="outline"
                                      buttonSize="sm"
                                      organizations={organizations}
                                      selectedOrgId={selectedOrgId}
                                      isAdmin={isAdmin}
                                      showOrganizationSelection={true}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("import.importSubjectsFromCsv")}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                        <CardDescription></CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 border-b">
                         <SubjectSearchFilterHeader
                            searchValue={searchTerm}
                            onSearchChange={() => setSearchTerm("")}
                            organizations={organizations}
                            selectedOrgId={selectedOrgId}
                            onSelectOrg={(val: number | null) => setSelectedOrgId(val)}
                            isLoadingOrgs={isLoadingOrganizations}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortChange={(newSortBy: string, newSortOrder: "asc" | "desc") => handleSortChange(newSortBy, newSortOrder)}
                            onResetFilters={handleResetFilters}
                        />
                      </CardContent>
                    </div>
                    <CardContent className="p-0 flex-1 overflow-hidden">
                      <div
                          className="overflow-y-auto"
                          ref={listContainerRef}
                          style={{
                            height: "calc(100vh - 290px)",
                            scrollBehavior: "auto",
                            overflow: "scroll"
                          }}
                      >
                        <div className="p-4" style={{ minHeight: 'calc(100vh - 290px + 50px)' }}>
                          <SubjectList
                              subjects={subjects as any}
                              isLoading={isLoadingSubjects && subjects.length === 0}
                              onSelectSubject={handleSelectSubject}
                              selectedSubjectUuid={selectedSubjectUuid}
                              searchTerm={debouncedSearchTerm}
                              loadMoreRef={loadMoreRef}
                          />

                          {/* Loading state is now shown in the button itself */}

                          {/* Show the Load More button if there are subjects and hasMore is true */}
                          {subjects.length > 0 && (hasMore || isLoadingMore) && (
                            <div className="mt-4 mb-6 flex justify-center">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleLoadMore}
                                  disabled={isLoadingMore}
                                  className="min-w-[200px]"
                              >
                                <div className="flex items-center">
                                  {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  {t("subject.loadMoreSubjects")}
                                  {totalSubjects !== null && totalSubjects > 0 && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                      ({subjects.length < totalSubjects ? subjects.length : totalSubjects}/{totalSubjects})
                                    </span>
                                  )}
                                </div>
                              </Button>
                            </div>
                          )}

                          {/* Show end of list message only when we've loaded all items and there are no more */}
                          {!hasMore && subjects.length > 0 && totalSubjects !== null && totalSubjects > 0 && subjects.length >= totalSubjects && (
                            <div className="text-center py-3 text-xs text-muted-foreground">
                              {t("subject.list.endOfList", { count: String(subjects.length) })}
                            </div>
                          )}

                          {/* Simple padding to ensure scrollbar appears */}
                          <div className="h-20" aria-hidden="true"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-7 xl:col-span-7 flex flex-col h-full">
                  <Card className="h-full flex flex-col">
                    {(selectedSubjectUuid || isCreatingNewSubject) && (
                      <DetailCardHeader
                        label={isCreatingNewSubject
                          ? t("common.details")
                          : t("common.details")}
                      />
                    )}
                    <CardContent className="p-6 h-full flex flex-col">
                      {selectedSubjectUuid || isCreatingNewSubject ? (
                          isCreatingNewSubject ? (
                              <SubjectForm
                                  initialData={{
                                    uuid: "",
                                    initials: "",
                                    name: "",
                                    description: "",
                                    durationInMinutes: 60,
                                    repetitionType: "red",
                                    redRepetition: true,
                                    blueRepetition: false,
                                    conflictSubjectId: 0,
                                    group: "Normal",
                                    autoConflictHandling: true,
                                    organizationId: selectedOrgId || 1,
                                    statusId: 1,
                                    color: "#6E56CF",
                                  }}
                                  onSave={handleSaveSubject}
                                  onCancel={handleCancelSubject}
                                  isLoading={isLoading}
                                  isDeleting={isDeleting}
                              />
                          ) : isLoadingSelectedSubject ? (
                              <div className="flex-1 flex flex-col justify-center items-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                <p>{t("subject.loadingSubjectDetails")}</p>
                              </div>
                          ) : selectedSubject ? (
                              <SubjectForm
                                  initialData={{
                                    uuid: selectedSubjectUuid,
                                    initials: selectedSubject.data?.initials || selectedSubject.initials || "",
                                    name: selectedSubject.data?.name || selectedSubject.name || "",
                                    description: selectedSubject.data?.description || selectedSubject.description || "",
                                    durationInMinutes: selectedSubject.data?.durationInMinutes || selectedSubject.durationInMinutes || 60,
                                    repetitionType: (selectedSubject.data?.redRepetition || selectedSubject.redRepetition)
                                        ? "red"
                                        : (selectedSubject.data?.blueRepetition || selectedSubject.blueRepetition)
                                            ? "blue"
                                            : "red",
                                    redRepetition: selectedSubject.data?.redRepetition || selectedSubject.redRepetition || false,
                                    blueRepetition: selectedSubject.data?.blueRepetition || selectedSubject.blueRepetition || false,
                                    conflictSubjectId: selectedSubject.data?.conflictSubjectId || selectedSubject.conflictSubjectId || 0,
                                    group: selectedSubject.data?.group || selectedSubject.group || "Normal",
                                    autoConflictHandling: !!(selectedSubject.data?.autoConflictHandling || selectedSubject.autoConflictHandling),
                                    organizationId: selectedSubject.data?.organizationId || selectedSubject.organizationId || 1,
                                    statusId: selectedSubject.data?.statusId || selectedSubject.statusId || 1,
                                    color: selectedSubject.data?.color || selectedSubject.color || "#6E56CF",
                                  }}
                                  onSave={handleSaveSubject}
                                  onCancel={handleCancelSubject}
                                  onDelete={handleDeleteSubject}
                                  isLoading={isLoading}
                                  isDeleting={isDeleting}
                              />
                          ) : (
                              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="mb-6 p-6 rounded-full bg-muted/30 text-primary">
                                  <Book size={64} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-medium mb-2">
                                  {t("subject.emptyState.title")}
                                </h3>
                                <p className="text-muted-foreground mb-6 max-w-md text-base leading-relaxed">
                                  {t("subject.emptyState.description")}
                                </p>
                                <div className="flex gap-2">
                                  {isAdmin && (
                                    <Button
                                      className="istui-timetable__main_list_card_button"
                                      size="sm"
                                      variant="default"
                                      onClick={handleNewSubject}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      {t("actions.add")}
                                    </Button>
                                  )}
                                  {isAdmin && (
                                    <CsvImport
                                      onImport={handleImportSubjects}
                                      buttonVariant="outline"
                                      buttonSize="sm"
                                      organizations={organizations}
                                      selectedOrgId={selectedOrgId}
                                      isAdmin={isAdmin}
                                      showOrganizationSelection={true}
                                    />
                                  )}
                                </div>
                              </div>
                          )
                      ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                            <div className="mb-6 p-6 rounded-full bg-muted/30 text-primary">
                              <Book size={64} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-medium mb-2">
                              {t("subject.emptyState.title")}
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md text-base leading-relaxed">
                              {t("subject.emptyState.description")}
                            </p>
                            <div className="flex gap-2">
                              {isAdmin && (
                                <Button
                                  className="istui-timetable__main_list_card_button"
                                  size="sm"
                                  variant="default"
                                  onClick={handleNewSubject}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  {t("actions.add")}
                                </Button>
                              )}
                              {isAdmin && (
                                <CsvImport
                                  onImport={handleImportSubjects}
                                  buttonVariant="outline"
                                  buttonSize="sm"
                                  organizations={organizations}
                                  selectedOrgId={selectedOrgId}
                                  isAdmin={isAdmin}
                                  showOrganizationSelection={true}
                                />
                              )}
                            </div>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
        <DeleteConfirmation
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onConfirm={confirmDelete}
            isDeleting={isDeleting}
            title={t("common.deleteConfirmTitle")}
            description={`${t("common.deleteConfirmMessage").replace("{moduleName}", t("common.subject"))} ${selectedSubject?.name ? `(${selectedSubject.name})` : ""}`}
            showTrigger={false}
        />
      </div>
  );
};

export default SubjectModule;
