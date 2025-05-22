import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card.tsx";
import { Progress } from "@/component/Ui/progress.tsx";
import { Loader2, Building, Plus, Upload } from "lucide-react";
import { useToast } from "@/hook/useToast.ts";
import { useParams, useNavigate } from "react-router-dom";

import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs.tsx";
import OrganizationForm from "@/component/Organization/OrganizationForm.tsx";
import OrganizationList from "@/component/Organization/OrganizationList.tsx";
import { OrganizationFormData, TypeOrganization } from "@/type/Organization/TypeOrganization.ts";
import {
  setFilter,
  setSelectedOrganization,
} from "@/store/Organization/SliceOrganization.ts";
import { useAppDispatch, useAppSelector } from "@/hook/useAppRedux.ts";
import { useI18n } from "@/hook/useI18n.ts";
import { LanguageSelector } from "@/component/Ui/language-selector.tsx";
import { useUserService } from "@/store/User/ServiceUser";
import CsvImport from "@/component/Common/CsvImport.tsx";


import {
  useLazyGetOrganizationsQuery,
  useLazyGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
  useImportOrganizationsCsvMutation,
} from "@/store/Organization/ApiOrganization.ts";
import { useGetCurrentManagerQuery } from "@/store/Manager/ApiManager";
import { Button } from "@/component/Ui/button.tsx";
import DetailCardHeader from "@/component/Common/DetailCardHeader";


function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const PageOrganization = () => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const selectedOrganizationUuid = useAppSelector(
      (state) => state.organization.selectedOrganizationUuid,
  );
  const filterState = useAppSelector((state) => state.organization.filter);
  const sortState = useAppSelector((state) => state.organization.sort);
  const { isAdmin } = useUserService();
  const { uuid } = useParams();
  const navigate = useNavigate();

  const [isCreatingNewOrganization, setIsCreatingNewOrganization] =
      useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserPermissions, setCurrentUserPermissions] = useState({
    canCreateManagers: false,
  });


  const {
    data: currentManagerData,
    isLoading: isLoadingCurrentManager,
    error: currentManagerError
  } = useGetCurrentManagerQuery();


  const handleSearchTermChange = (term: string) => {
    setCurrentPage(0);
    setSearchTerm(term);
  };
  const [orgFormData, setOrgFormData] = useState<OrganizationFormData | null>(
      null,
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [totalOrganizations, setTotalOrganizations] = useState(0);

  const [triggerGetOrganizations, { data: organizationListData, isFetching }] =
      useLazyGetOrganizationsQuery();

  const [fetchOrganizationRaw, {
    data: selectedOrganizationData,
    isFetching: isOrganizationFetching,
  }] = useLazyGetOrganizationQuery();

  const [importOrganizationsCsv] = useImportOrganizationsCsvMutation();

  const [lastFetchedOrgUuid, setLastFetchedOrgUuid] = useState<string | null>(null);


  const fetchOrganization = useCallback((uuid: string) => {

    if(uuid !== lastFetchedOrgUuid) {
      fetchOrganizationRaw(uuid);
      setLastFetchedOrgUuid(uuid);
    }
  }, [fetchOrganizationRaw, lastFetchedOrgUuid]);

  const [createOrganization, { isLoading: isCreating }] =
      useCreateOrganizationMutation();
  const [updateOrganization, { isLoading: isUpdating }] =
      useUpdateOrganizationMutation();
  const [deleteOrganization, { isLoading: isDeleting }] =
      useDeleteOrganizationMutation();

  const { toast } = useToast();

  const listContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Store scroll position for restoration
  const [scrollPosition, setScrollPosition] = useState(0);
  const [forceRender, setForceRender] = useState(0);
  const [autoLoadingInProgress, setAutoLoadingInProgress] = useState(false);


  useEffect(() => {
    if(currentManagerData?.success && currentManagerData.data) {
      const managerData = currentManagerData.data;
      console.log("Current manager permissions:", {
        canCreateManagers: managerData.canCreateManagers
      });


      setCurrentUserPermissions({
        canCreateManagers: !!managerData.canCreateManagers
      });
    }
  }, [currentManagerData]);


  const hasOrganizationManagementPermission = () => {
    if(isAdmin === true) {
      return true;
    }


    if(currentUserPermissions.canCreateManagers === true) {
      return true;
    }

    return false;
  };

  useEffect(() => {
    if(organizationListData?.data) {
      const totalCount = organizationListData.totalItems;
      const receivedCount = organizationListData.data.length;


      const getUniqueNewOrgs = () => {
        const existingOrgsMap = new Map<string, boolean>();
        organizations.forEach(org => {
          existingOrgsMap.set(org.uuid, true);
        });
        return organizationListData.data.filter(org => !existingOrgsMap.has(org.uuid));
      };

      let updatedOrganizations: TypeOrganization[];
      
      if(currentPage === 0) {

        updatedOrganizations = organizationListData.data;
        setOrganizations(updatedOrganizations);

        if(totalCount !== undefined) {
          setTotalOrganizations(totalCount);
        } else {
          setTotalOrganizations(receivedCount);
        }
      } else {
    
        const newUniqueOrgs = getUniqueNewOrgs();
        updatedOrganizations = [...organizations, ...newUniqueOrgs];
        setOrganizations(updatedOrganizations);
       
        if(totalCount !== undefined) {
          setTotalOrganizations(totalCount);
        } else {
          setTotalOrganizations(prev => prev + newUniqueOrgs.length);
        }
      }
      

      if(totalCount !== undefined) {
        setHasMore(updatedOrganizations.length < totalCount);
      } else {
        setHasMore(receivedCount === pageSize);
      }
      
      setIsLoadingMore(false);
    }
  }, [organizationListData, currentPage, organizations, pageSize]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    triggerGetOrganizations({
      page: currentPage,
      size: pageSize,
      ...(filterState.status ? { status: filterState.status } : {}),
      ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
    }).finally(() => {
      setIsLoadingMore(false);
      setAutoLoadingInProgress(false);
    });
  }, [currentPage, pageSize, filterState.status, debouncedSearchTerm]);


  useEffect(() => {
    if(selectedOrganizationUuid) {

      setIsCreatingNewOrganization(false);


      const selectedOrgFromList = organizations.find(
          (org) => org.uuid === selectedOrganizationUuid,
      );

      if(selectedOrgFromList) {
        setOrgFormData({
          name: selectedOrgFromList.name || "",
          address: selectedOrgFromList.address || "",
          contactEmail: selectedOrgFromList.contactEmail || "",
          contactPhone: selectedOrgFromList.contactPhone || "",
          statusId: selectedOrgFromList.statusId || 1,
        });
      }


      fetchOrganization(selectedOrganizationUuid);
    }
  }, [selectedOrganizationUuid, organizations, fetchOrganization]);

  useEffect(() => {

    if(selectedOrganizationData?.data && selectedOrganizationUuid) {
      const org = selectedOrganizationData.data;


      if(org.uuid === selectedOrganizationUuid) {

        const currentFormData = orgFormData;
        const needsUpdate = !currentFormData ||
          currentFormData.name !== org.name ||
          currentFormData.address !== org.address ||
          currentFormData.contactEmail !== org.contactEmail ||
          currentFormData.contactPhone !== org.contactPhone ||
          currentFormData.statusId !== org.statusId;

        if(needsUpdate) {

          setOrgFormData({
            name: org.name || "",
            address: org.address || "",
            contactEmail: org.contactEmail || "",
            contactPhone: org.contactPhone || "",
            statusId: org.statusId || 1,
          });


        }
      }
    } else if(!selectedOrganizationUuid && !isCreatingNewOrganization) {

      setOrgFormData(null);
    }
  }, [
    selectedOrganizationData,
    selectedOrganizationUuid,
    isCreatingNewOrganization,
    orgFormData,
  ]);


  useEffect(() => {
    if(uuid && uuid !== selectedOrganizationUuid) {
      dispatch(setSelectedOrganization(uuid));
      if(organizations.length === 0) {

        fetchOrganization(uuid);
      }
    }
  }, [uuid, selectedOrganizationUuid, organizations.length, dispatch, fetchOrganization]);



  const handleApiError = (error: any, defaultMessage: string) => {
    if(error?.data?.error && typeof error.data.error === "string") {
      try {
        const errorString = error.data.error;
        if(errorString.startsWith("[") && errorString.endsWith("]")) {
          const content = errorString.substring(1, errorString.length - 1);
          const errorParts = content.split(", ");
          const errorMessages = errorParts.map((part: string) => {
            const colonIndex = part.indexOf(":");
            if(colonIndex >= 0) {
              const translationKey = part.substring(colonIndex + 1).trim();
              return t(translationKey);
            }
            return part.trim();
          });

          const finalMessage = errorMessages.join("\n");

          toast({
            description: finalMessage,
            variant: "destructive",
          });
          return;
        }
      }catch(e) {
        console.error("Error parsing validation message:", e);
      }
    }

    const apiMessage =
        error?.data?.message || error?.message || error?.data?.error;
    const errorMessage = apiMessage || defaultMessage;

    toast({
      description: errorMessage,
      variant: "destructive",
    });
  };

  const handleLoadMore = useCallback(() => {
    if(hasMore && !isFetching && !isLoadingMore) {
  
      setIsLoadingMore(true);

  
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);

    }
  }, [hasMore, isFetching, isLoadingMore, currentPage]);

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
    if (listContainerRef.current && scrollPosition > 0 && organizations.length > 0) {
      const timer = setTimeout(() => {
        if (listContainerRef.current) {
          listContainerRef.current.scrollTop = scrollPosition;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [organizations.length, scrollPosition]);


  useEffect(() => {

    if(organizations.length === 0) {
      triggerGetOrganizations({
        page: 0,
        size: pageSize,
        ...(filterState.status ? { status: filterState.status } : {}),
        ...(searchTerm ? { search: searchTerm } : {}),
      });
    }


    if(uuid && !lastFetchedOrgUuid) {
      fetchOrganization(uuid);
    }

  }, []);

  const handleOrganizationSelect = useCallback(
      (uuid: string) => {
        dispatch(setSelectedOrganization(uuid));
        navigate(`/organizations/${uuid}`);
      },
      [dispatch, navigate],
  );


  const handleNewOrganizationClick = () => {
    if(!hasOrganizationManagementPermission()) {
      toast({
        description: t("organization.errors.permissionRequired"),
        variant: "destructive",
      });
      return;
    }
    dispatch(setSelectedOrganization(null));
    setOrgFormData(null);
    navigate("/organizations");
    setIsCreatingNewOrganization(true);
    setTimeout(() => {
      setOrgFormData({
        name: "",
        address: "",
        contactEmail: "",
        contactPhone: "",
        statusId: 1,
      });
    }, 0);
  };

  const handleImportCsv = async (file: File, options: { skipHeaderRow: boolean, organizationId?: number | null }) => {
    try {
      const result = await importOrganizationsCsv({
        file,
        options,
      }).unwrap();

  
      setCurrentPage(0);
      triggerGetOrganizations({
        page: 0,
        size: pageSize,
        ...(filterState.status ? { status: filterState.status } : {}),
        ...(searchTerm ? { search: searchTerm } : {}),
      });

      return result;
    }catch(error) {
      console.error("CSV import error:", error);
      handleApiError(
        error,
        t("organization.errors.importFailed")
      );

      return {
        success: false,
        message: error?.data?.message || t("organization.errors.importFailed"),
      };
    }
  };

  const handleSaveOrganization = async (formData: OrganizationFormData) => {
    try {
      if(isCreatingNewOrganization) {
        const response = await createOrganization(formData).unwrap();
        toast({
          description: t("organization.success.created", {
            name: formData.name,
          }),
        });

        setCurrentPage(0);

        if(response.data && response.data.uuid) {
          dispatch(setSelectedOrganization(response.data.uuid));
          navigate(`/organizations/${response.data.uuid}`, { replace: true });
        }

        triggerGetOrganizations({ page: 0, size: pageSize });
      } else if(selectedOrganizationUuid) {
        await updateOrganization({
          uuid: selectedOrganizationUuid,
          organizationData: formData,
        }).unwrap();

        toast({
          description: t("organization.success.updated", {
            name: formData.name,
          }),
        });

        setLastFetchedOrgUuid(null);

        fetchOrganization(selectedOrganizationUuid);
        triggerGetOrganizations({ page: currentPage, size: pageSize });
      }
    }catch(error) {
      handleApiError(
        error,
        isCreatingNewOrganization
          ? t("organization.errors.createFailed")
          : t("organization.errors.updateFailed"),
      );
    }
  };

  const handleDeleteOrganization = async () => {
    if(!selectedOrganizationUuid) return;

    try {
      const deletedUuid = selectedOrganizationUuid;
      await deleteOrganization(deletedUuid).unwrap();

      toast({ description: t("organization.success.deleted") });

      dispatch(setSelectedOrganization(null));
      setOrgFormData(null);
      setIsCreatingNewOrganization(false);

      setOrganizations((prevOrgs) =>
        prevOrgs.filter((org) => org.uuid !== deletedUuid),
      );
      setTotalOrganizations((prev) => Math.max(0, prev - 1));

      setForceRender((prev) => prev + 1);

      navigate("/organizations", { replace: true });
    }catch(error) {
      handleApiError(error, t("organization.errors.deleteFailed"));
    }
  };

  const handleFilter = (status?: number) => {
    setCurrentPage(0);
    dispatch(setFilter({ status }));
  };

  // Only show the global loading indicator for major operations, not for loading more
  const isLoadingAny = isFetching || isCreating || isUpdating || isDeleting;

  useEffect(() => {
    if(selectedOrganizationUuid === null) {
      setOrgFormData(null);
      setIsCreatingNewOrganization(false);
    }
  }, [selectedOrganizationUuid]);

  useEffect(() => {

    if(!uuid && selectedOrganizationUuid) {
      dispatch(setSelectedOrganization(null));
      setOrgFormData(null);
      setIsCreatingNewOrganization(false);
    }
  }, [uuid, selectedOrganizationUuid]);


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
                      { label: t("navigation.resources"), href: "/resources" },
                      { label: t("navigation.organizations"), href: "" },
                    ]}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                  <Card className="overflow-hidden h-full flex flex-col border-0 shadow-md ">
                    <div className="sticky top-0 z-10 bg-background border-b">
                      <CardHeader className="pb-2 bg-secondary">
                        <div className="flex items-center justify-between">
                          <div className={""}>
                            <CardTitle>
                              {t("common.organizations")}
                              {typeof totalOrganizations === "number" && organizations.length > 0 && (
                                <span className="text-muted-foreground text-sm font-normal ml-2">
                                  ({organizations.length})
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <div className="flex space-x-2">
                            {hasOrganizationManagementPermission() && (
                              <Button
                                className="istui-timetable__main_list_card_button"
                                size="sm"
                                variant="default"
                                onClick={handleNewOrganizationClick}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                {t("actions.add")}
                              </Button>
                            )}
                            {hasOrganizationManagementPermission() && (
                              <CsvImport
                                onImport={handleImportCsv}
                                buttonVariant="outline"
                                buttonSize="sm"
                                isAdmin={isAdmin}
                                showOrganizationSelection={false}
                              />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </div>
                    <OrganizationList
                        organizations={organizations}
                        onSelectOrganization={handleOrganizationSelect}
                        onNewOrganization={handleNewOrganizationClick}
                        selectedOrganizationUuid={selectedOrganizationUuid}
                        searchTerm={searchTerm}
                        onSearchTermChange={handleSearchTermChange}
                        onFilter={handleFilter}
                        count={totalOrganizations}
                        isLoading={isFetching}
                        onLoadMore={handleLoadMore}
                        hasMore={hasMore}
                        isLoadingMore={isLoadingMore}
                        listContainerRef={listContainerRef}
                        loadMoreRef={loadMoreRef}
                    />
                  </Card>
                </div>
                <div className="lg:col-span-7 xl:col-span-7 flex flex-col istui-timetable__main_form_card">
                  <Card className="overflow-hidden h-full border-0 shadow-md istui-timetable__main_card">
                    <div className="p-0 h-full flex flex-col istui-timetable__main_card_content">
                      {(isCreatingNewOrganization || selectedOrganizationUuid) ? (
                          isOrganizationFetching && !orgFormData ? (
                              <div className="flex justify-center items-center py-10 istui-timetable__main_loading">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                                <p>{t("organization.loading.details")}</p>
                              </div>
                          ) : (
                              <>
                                <DetailCardHeader label={t("common.details")} />
                                <OrganizationForm
                                    key={`org-form-${selectedOrganizationUuid || "new"}-${forceRender}`}
                                    organizationData={orgFormData || {
                                      name: "",
                                      address: "",
                                      contactEmail: "",
                                      contactPhone: "",
                                      statusId: 1,
                                    }}
                                    isNewOrganization={isCreatingNewOrganization}
                                    onSave={handleSaveOrganization}
                                    onDelete={handleDeleteOrganization}
                                    onCancel={() => {
                                      if(isCreatingNewOrganization) {
                                        setIsCreatingNewOrganization(false);
                                      }else {
                                        dispatch(setSelectedOrganization(null));
                                        setOrgFormData(null);
                                        navigate("/organizations", { replace: true });
                                      }
                                    }}
                                    isLoading={isCreating || isUpdating}
                                    isDeleting={isDeleting}
                                    className="istui-timetable__main_form"
                                    currentOrgUuid={selectedOrganizationUuid}
                                    isAdmin={isAdmin}
                                    hasEditPermission={hasOrganizationManagementPermission()}
                                />
                              </>
                          )
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <div className="mb-6 p-6 rounded-full bg-muted/30 text-primary">
                              <Building size={64} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-medium mb-2">
                              {t("organization.emptyState.title", {
                                defaultValue: "No organization selected"
                              })}
                            </h3>
                            <p className="text-muted-foreground mb-6 max-w-md text-base leading-relaxed">
                              {t("organization.emptyState.description", {
                                defaultValue: "Select an organization to get its details or create a new one to get started"
                              })}
                            </p>
                            <div className="flex gap-2">
                              {hasOrganizationManagementPermission() && (
                                <Button
                                  className="istui-timetable__main_list_card_button"
                                  size="sm"
                                  variant="default"
                                  onClick={handleNewOrganizationClick}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  {t("actions.add")}
                                </Button>
                              )}
                              {hasOrganizationManagementPermission() && (
                                <CsvImport
                                  onImport={handleImportCsv}
                                  buttonVariant="outline"
                                  buttonSize="sm"
                                  isAdmin={isAdmin}
                                  showOrganizationSelection={false}
                                />
                              )}
                            </div>
                          </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default PageOrganization;
