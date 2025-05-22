import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  Loader2,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Input } from "@/component/Ui/input";
import { Button } from "@/component/Ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/component/Ui/dialog";
import Header from "@/component/Core/layout/Header";
import Sidebar from "@/component/Core/layout/Sidebar";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import { useToast } from "@/hook/useToast";
import { usePeriods } from "@/store/Period/periodStore";
import { Period, PeriodRequest } from "@/type/Period/index";
import { Label } from "@/component/Ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { DropResult } from "react-beautiful-dnd";
import PeriodList from "@/component/Period/PeriodList";
import PeriodForm from "@/component/Period/PeriodForm";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";
import { useI18n } from "@/hook/useI18n";
import * as periodService from "@/services/Period/periodService";
import { Progress } from "@/component/Ui/progress";
import { Checkbox } from "@/component/Ui/checkbox";
import axios from "axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/component/Ui/tabs";
import EmptyState from "@/component/common/EmptyState";

interface PlanSettings {
  id?: number;
  periodsPerDay: number;
  daysPerWeek: number;
  startTime: string;
  endTime: string;
  timeBlockTypes: Array<{
    id: number;
    name: string;
    durationMinutes: number;
    occurrences: number;
  }>;
  uuid?: string;
  name?: string;
  category?: string;
}


function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}


function getValidPlanSettingsId(selectedPlanSetting: PlanSettings | null, selectedPlanSettingId: string | null): number | undefined {
  if (selectedPlanSetting && typeof selectedPlanSetting.id === 'number') {
    return selectedPlanSetting.id;
  }
  if (selectedPlanSettingId && !isNaN(Number(selectedPlanSettingId))) {
    return Number(selectedPlanSettingId);
  }
  return undefined;
}

const PagePeriod: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { t } = useI18n();

  const {
    periods,
    setPeriods,
    selectedPeriod,
    loading,
    fetchPeriods,
    createPeriod,
    updatePeriod,
    deletePeriod,
    setSelectedPeriod,
  } = usePeriods();

  const [existingPeriodNumbers, setExistingPeriodNumbers] = useState<number[]>([]);
  const [isLoadingPlanSettings, setIsLoadingPlanSettings] = useState(true);
  const [existingPeriodEndTimes, setExistingPeriodEndTimes] = useState<Record<number, string>>({});


  const [planSettingsArray, setPlanSettingsArray] = useState<PlanSettings[]>([]);
  const [selectedPlanSetting, setSelectedPlanSetting] = useState<PlanSettings | null>(null);
  const [selectedPlanSettingId, setSelectedPlanSettingId] = useState<string | null>(null);

  const [showSwapDialog, setShowSwapDialog] = useState(false);
  const [swapSource, setSwapSource] = useState<Period | null>(null);
  const [swapTarget, setSwapTarget] = useState<Period | null>(null);
  const [updateSubsequent, setUpdateSubsequent] = useState(true);
  const [isSwapping, setIsSwapping] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [periodToDelete, setPeriodToDelete] = useState<string | null>(null);
  const [uuid, setUuid] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalPeriods, setTotalPeriods] = useState(0);

 
  const [scrollPosition, setScrollPosition] = useState(0);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [autoLoadingInProgress, setAutoLoadingInProgress] = useState(false);

  
  const listContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const uuidFromUrl = pathParts[pathParts.length - 1];

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuidFromUrl);

    if(isUuid) {
      setUuid(uuidFromUrl);
    }
  }, [location]);

  
  useEffect(() => {
    if(uuid && periods.length > 0 && !selectedPeriod) {
      const periodWithUuid = periods.find((period) => period.uuid === uuid);
      if(periodWithUuid) {
        setSelectedPeriod(periodWithUuid);
      }
    }
  }, [uuid, periods, selectedPeriod]);


  useEffect(() => {
    const fetchInitialPeriods = async () => {
      try {
        const organizationId = parseInt(localStorage.getItem("selectedOrganizationId") || "1", 10);


        const planSettingsIdNumber = getValidPlanSettingsId(selectedPlanSetting, selectedPlanSettingId);
        if (typeof planSettingsIdNumber !== 'number' || isNaN(planSettingsIdNumber)) {
          toast({
            title: t("common.error"),
            description: "No valid Plan Setting selected. Please select a valid plan setting.",
            variant: "destructive",
          });
          return;
        }


        localStorage.setItem("selectedPlanSettingsId", planSettingsIdNumber.toString());


        setCurrentPage(0);
        setHasMore(true);

        const apiResponse = await periodService.getPeriodsByOrganization(
          organizationId,
          0,
          pageSize, 
          planSettingsIdNumber
        );

       
        if (apiResponse && apiResponse.data) {
          setPeriods(apiResponse.data);
        }

        if (uuid && periods.length > 0) {
          const periodToSelect = periods.find((p) => p.uuid === uuid);
          if (periodToSelect) {
            setSelectedPeriod(periodToSelect);
          }
        }

        setHasMore(true);

        if (apiResponse && apiResponse.totalItems !== undefined) {
          const totalItems = apiResponse.totalItems;
          setTotalPeriods(totalItems);

          const shouldHaveMore = apiResponse.data.length >= pageSize;
          setHasMore(shouldHaveMore);

        } else if (apiResponse && apiResponse.pagination && apiResponse.pagination.totalItems !== undefined) {
         
          const totalItems = apiResponse.pagination.totalItems;
          setTotalPeriods(totalItems);

          const shouldHaveMore = apiResponse.data.length >= pageSize;
          setHasMore(shouldHaveMore);

        } else {
  
          const shouldHaveMore = apiResponse.data.length >= pageSize;
          setTotalPeriods(periods.length + (shouldHaveMore ? pageSize : 0));
          setHasMore(shouldHaveMore);

        }
      } catch (error) {
        console.error("Error fetching initial periods:", error);
        toast({
          title: t("common.error"),
          description: t("period.loadError"),
          variant: "destructive",
        });
      } finally {
        setIsLoadingMore(false);
        setAutoLoadingInProgress(false);
      }
    };

    if (selectedPlanSetting || selectedPlanSettingId) {
      fetchInitialPeriods();
    }
  }, [selectedPlanSetting, selectedPlanSettingId, uuid, pageSize]);

  useEffect(() => {
    if(selectedPeriod && periods.length > 0) {
      setIsCreatingNew(false);
    }
  }, [periods, selectedPeriod]);

  useEffect(() => {
    if(periods.length > 0) {
      const periodsInCurrentPlanSetting = periods.filter(period => {
        return period.planSettingsId === selectedPlanSetting?.id ||
               period.planSettingsId === parseInt(selectedPlanSettingId || "", 10);
      });

      const usedNumbers = periodsInCurrentPlanSetting.map((period) => period.periodNumber || 0);
      setExistingPeriodNumbers(usedNumbers);

      const endTimes: Record<number, string> = {};
      periodsInCurrentPlanSetting.forEach((period) => {
        if(period.periodNumber && period.endTime) {
          endTimes[period.periodNumber] = period.endTime;
        }
      });
      setExistingPeriodEndTimes(endTimes);
    }
  }, [periods, selectedPlanSetting, selectedPlanSettingId]);

  useEffect(() => {
    const fetchPlanSettings = async (organizationId = 1) => {
      const orgId = localStorage.getItem("selectedOrganizationId") || organizationId;
      try {
        setIsLoadingPlanSettings(true);
        const authToken = localStorage.getItem("authToken");
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}/api/v1/plan-settings/organization/${orgId}?organizationId=${orgId}`,
          {
            headers: {
              Authorization: `${authToken}`,
            },
          },
        );

        if(response.data && response.data.data) {
          setPlanSettingsArray(response.data.data);
          if(response.data.data.length > 0) {
            setSelectedPlanSetting(response.data.data[0]);
            setSelectedPlanSettingId(response.data.data[0].uuid || null);
          }
        }else {
          const defaultPlanSetting = {
            id: 1,
            uuid: "default-plan-setting",
            periodsPerDay: 6,
            daysPerWeek: 5,
            startTime: "08:00:00",
            endTime: "16:00:00",
            timeBlockTypes: [
              {
                id: 1,
                name: "Regular Studying",
                durationMinutes: 50,
                occurrences: 6,
              },
              {
                id: 2,
                name: "Break",
                durationMinutes: 30,
                occurrences: 1,
              },
              {
                id: 3,
                name: "Lunch",
                durationMinutes: 60,
                occurrences: 1,
              },
              {
                id: 4,
                name: "Assembly",
                durationMinutes: 15,
                occurrences: 1,
              },
            ],
          };
          setPlanSettingsArray([defaultPlanSetting]);
          setSelectedPlanSetting(defaultPlanSetting);
          setSelectedPlanSettingId(defaultPlanSetting.uuid || null);
        }
      }catch(error) {
        const defaultPlanSetting = {
          id: 1,
          uuid: "default-plan-setting",
          periodsPerDay: 6,
          daysPerWeek: 5,
          startTime: "08:00:00",
          endTime: "16:00:00",
          timeBlockTypes: [
            {
              id: 1,
              name: "Regular Studying",
              durationMinutes: 50,
              occurrences: 6,
            },
            {
              id: 2,
              name: "Break",
              durationMinutes: 30,
              occurrences: 1,
            },
            {
              id: 3,
              name: "Lunch",
              durationMinutes: 60,
              occurrences: 1,
            },
            {
              id: 4,
              name: "Assembly",
              durationMinutes: 15,
              occurrences: 1,
            },
          ],
        };
        setPlanSettingsArray([defaultPlanSetting]);
        setSelectedPlanSetting(defaultPlanSetting);
        setSelectedPlanSettingId(defaultPlanSetting.uuid || null);
      } finally {
        setIsLoadingPlanSettings(false);
      }
    };

    fetchPlanSettings();
  }, []);

  const sortPeriodsByStartTime = (periods: Period[]): Period[] => {
    return [...periods].sort((a, b) => {
 
      if(a.periodNumber !== b.periodNumber) {
        return (a.periodNumber || 0) - (b.periodNumber || 0);
      }
  
      if(a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
  };


  const filteredPeriods = sortPeriodsByStartTime(periods.filter(
    (period) => {
      const belongsToCurrentPlanSetting =
        period.planSettingsId === selectedPlanSetting?.id ||
        period.planSettingsId === parseInt(selectedPlanSettingId || "", 10);

      const matchesSearchTerm =
        period.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        period.periodType.toLowerCase().includes(searchTerm.toLowerCase());

      return belongsToCurrentPlanSetting && matchesSearchTerm;
    }
  ));

  const handleSelectPeriod = (period: Period) => {
    setSelectedPeriod(period);
    setIsCreatingNew(false);
    navigate(`/periods/${period.uuid}`);
  };

  const handleNewPeriod = () => {
    setIsCreatingNew(true);
    setSelectedPeriod(null);
    navigate("/periods", { replace: true });
    setUuid("");
  };

  const handleCancel = () => {
    setSelectedPeriod(null);
    setIsCreatingNew(false);
    navigate("/periods", { replace: true });
    setUuid("");
  };

  const handleDelete = () => {
    if(selectedPeriod && selectedPeriod.uuid) {
      setPeriodToDelete(selectedPeriod.uuid);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if(!periodToDelete) return;

    setIsDeleting(true);
    try {
      await deletePeriod(periodToDelete);
      toast({
        description: t("period.deleteSuccess"),
      });

      if(selectedPeriod?.uuid === periodToDelete) {
        setSelectedPeriod(null);
        navigate("/periods", { replace: true });
      }


      const updatedPeriods = periods.filter((period) => period.uuid !== periodToDelete);
      setPeriods(updatedPeriods);
    }catch(error) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("period.deleteError"),
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setPeriodToDelete(null);
    }
  };

  const handleSubmit = async (periodData: PeriodRequest) => {
    setIsSaving(true);
    try {
      const organizationId = parseInt(localStorage.getItem("selectedOrganizationId") || "1", 10);


      const planSettingsIdNumber = getValidPlanSettingsId(selectedPlanSetting, selectedPlanSettingId);
      if (typeof planSettingsIdNumber !== 'number' || isNaN(planSettingsIdNumber)) {
        throw new Error("Plan Settings ID is required");
      }


      if (isCreatingNew || (selectedPeriod && periodData.periodNumber !== selectedPeriod.periodNumber)) {
        const periodsInCurrentPlanSetting = periods.filter(period =>
          period.planSettingsId === planSettingsIdNumber
        );

        const periodNumberExists = periodsInCurrentPlanSetting.some(
          p => p.periodNumber === periodData.periodNumber && p.uuid !== selectedPeriod?.uuid
        );

        if (periodNumberExists) {
          throw new Error(`Period number ${periodData.periodNumber} already exists in this plan setting`);
        }
      }

      localStorage.setItem("selectedPlanSettingsId", planSettingsIdNumber.toString());


      const completeRequest = {
        name: periodData.name || `Period ${new Date().getTime()}`,
        startTime: periodData.startTime || "08:00:00",
        endTime: periodData.endTime || "08:45:00",
        durationMinutes: Number(periodData.durationMinutes || 45),
        periodNumber: Number(periodData.periodNumber || 1),
        periodType: periodData.periodType || "Regular",
        days: Array.isArray(periodData.days) && periodData.days.length > 0
          ? periodData.days
          : [1, 2, 3, 4, 5],
        organizationId: organizationId,

        allowScheduling: periodData.allowScheduling === false ? false : true,
        showInTimetable: periodData.showInTimetable === false ? false : true,
        allowConflicts: periodData.allowConflicts === true ? true : false,
        planSettingsId: planSettingsIdNumber
      };


      if(selectedPeriod && selectedPeriod.uuid && !isCreatingNew) {
        await updatePeriod(selectedPeriod.uuid, completeRequest);
        toast({
          description: t("period.save.success"),
        });
      } else {
        await createPeriod(completeRequest);
        toast({
          description: t("period.createSuccess"),
        });
      }

      await fetchPeriods(organizationId, planSettingsIdNumber);
    }catch(error) {
      console.error("Error saving period:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("period.saveError"),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getDaysArrayFromPlanSettings = (settings: any) => {
    const daysPerWeek =
      settings?.plan_setting_days_per_week ||
      settings?.planning_settings_days_per_week ||
      settings?.daysPerWeek ||
      6;
    return Array.from({ length: daysPerWeek }, (_, i) => i + 1);
  };

  const recalculateAllPeriodTimes = (
    periodsArray: Period[],
    planSetting: PlanSettings | null,
  ): Period[] => {
    if(!periodsArray || !periodsArray.length) return [];


    const periodsInCurrentPlanSetting = periodsArray.filter(
      p => p.planSettingsId === planSetting?.id ||
           p.planSettingsId === parseInt(selectedPlanSettingId || "", 10)
    );

    const periodsCopy = JSON.parse(JSON.stringify(periodsInCurrentPlanSetting));
    periodsCopy.sort(
      (a: Period, b: Period) => (a.periodNumber || 0) - (b.periodNumber || 0),
    );
    const start = (planSetting?.startTime || "08:00:00").toString();
    let currentStartTime = start;
    for(let i = 0; i < periodsCopy.length; i++) {
      const period = periodsCopy[i];
      const duration = period.durationMinutes || 45;
      period.startTime = currentStartTime;
      const startMinutes = convertTimeToMinutes(currentStartTime);
      const endMinutes = startMinutes + duration;
      period.endTime = convertMinutesToTime(endMinutes);
      currentStartTime = period.endTime;
    }
    return periodsCopy;
  };

  const saveUpdatedPeriodSequence = async (
    updatedPeriods: Period[],
  ): Promise<boolean> => {
    try {
      const updateRequests = updatedPeriods.map((period) => {
        return {
          uuid: period.uuid,
          request: {
            organizationId: 1,
            periodNumber: period.periodNumber,
            name: period.name,
            startTime: period.startTime.toString(),
            endTime: period.endTime.toString(),
            durationMinutes: period.durationMinutes,
            periodType: period.periodType,
            days: getDaysArrayFromPlanSettings(selectedPlanSetting),
            allowScheduling: period.allowScheduling,
            showInTimetable: period.showInTimetable,
            allowConflicts: period.allowConflicts,
          } as PeriodRequest,
        };
      });

      for(const update of updateRequests) {
        await updatePeriod(update.uuid, update.request);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      return true;
    }catch(error) {
      throw error;
    }
  };

  const handleSwapPeriods = async (period1: Period, period2: Period) => {
    try {
      setIsSwapping(true);
      const periodsInCurrentPlanSetting = periods.filter(
        p => p.planSettingsId === selectedPlanSetting?.id ||
             p.planSettingsId === parseInt(selectedPlanSettingId || "", 10)
      );

      const allPeriods = [...periodsInCurrentPlanSetting].sort(
        (a, b) => (a.periodNumber || 0) - (b.periodNumber || 0),
      );
      const period1Index = allPeriods.findIndex((p) => p.uuid === period1.uuid);
      const period2Index = allPeriods.findIndex((p) => p.uuid === period2.uuid);
      if(period1Index === -1 || period2Index === -1) {
        throw new Error("Could not find periods to swap");
      }
      const updatedPeriods = [...allPeriods];
      updatedPeriods[period1Index] = {
        ...updatedPeriods[period1Index],
        periodNumber: period2.periodNumber,
      };
      updatedPeriods[period2Index] = {
        ...updatedPeriods[period2Index],
        periodNumber: period1.periodNumber,
      };
      updatedPeriods.sort(
        (a, b) => (a.periodNumber || 0) - (b.periodNumber || 0),
      );
      const recalculatedPeriods = recalculateAllPeriodTimes(
        updatedPeriods,
        selectedPlanSetting,
      );
      await saveUpdatedPeriodSequence(recalculatedPeriods);
      toast({
        description: t("period.swap.success"),
      });
      const organizationId = 1;


      let planSettingsIdNumber: number | undefined;
      if (selectedPlanSettingId) {
        try {
          planSettingsIdNumber = parseInt(selectedPlanSettingId, 10);
          if (isNaN(planSettingsIdNumber)) {
            planSettingsIdNumber = undefined;
          }
        } catch (e) {
          console.error("Error parsing plan setting ID:", e);
        }
      }

      await fetchPeriods(organizationId, planSettingsIdNumber);
    }catch(error) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("period.swap.failed"),
      });
    } finally {
      setIsSwapping(false);
      setShowSwapDialog(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if(!result.destination) return;
    if(result.destination.index === result.source.index) return;

    try {
      setIsSwapping(true);
      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      const sortedPeriods = [...periods].sort((a, b) => {
        if(a.periodNumber !== b.periodNumber) {
          return (a.periodNumber || 0) - (b.periodNumber || 0);
        }
        if(a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return 0;
      });

      const sourcePeriod = sortedPeriods[sourceIndex];
      const targetPeriod = sortedPeriods[destinationIndex];

      if(sourcePeriod && targetPeriod) {
        await handleSwapPeriods(sourcePeriod, targetPeriod);
      }
    }catch(error) {
      console.error("Error swapping periods:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("period.swap.failed"),
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handlePlanSettingsChange = (planSettingsUuid: string) => {
    const chosen = planSettingsArray.find((ps) => ps.uuid === planSettingsUuid) || null;
    setSelectedPlanSetting(chosen);
    setSelectedPlanSettingId(chosen?.uuid || null);
    const planSettingsIdNumber = getValidPlanSettingsId(chosen, chosen?.uuid);
    if (typeof planSettingsIdNumber !== 'number' || isNaN(planSettingsIdNumber)) {
      toast({
        title: t("common.error"),
        description: "Selected plan setting is invalid. Please choose another.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem("selectedPlanSettingsId", planSettingsIdNumber.toString());
    const organizationId = parseInt(localStorage.getItem("selectedOrganizationId") || "1", 10);
    fetchPeriods(organizationId, planSettingsIdNumber);
  };


  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore) {
      if (listContainerRef.current) {
        setScrollPosition(listContainerRef.current.scrollTop);
      }


      setIsLoadingMore(true);
      setAutoLoadingInProgress(true);

  
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
   
      setHasMore(true);
    }
  }, [currentPage, isLoadingMore]);


  useEffect(() => {

    if (!selectedPlanSetting && !selectedPlanSettingId) return;
    
    const fetchData = async () => {
      try {
        const organizationId = parseInt(localStorage.getItem("selectedOrganizationId") || "1", 10);

        const planSettingsIdNumber = getValidPlanSettingsId(selectedPlanSetting, selectedPlanSettingId);
        if (typeof planSettingsIdNumber !== 'number' || isNaN(planSettingsIdNumber)) {
          console.error("Invalid plan settings ID");
          return;
        }

        const apiResponse = await periodService.getPeriodsByOrganization(
          organizationId,
          currentPage,
          pageSize,
          planSettingsIdNumber
        );


        if (!apiResponse || !apiResponse.data) {
          console.error("API response is missing data property");
          return;
        }

        const totalCount = apiResponse.totalItems;
        const receivedCount = apiResponse.data.length;

        const existingPeriodsMap = new Map<string, boolean>();
        periods.forEach(period => {
          existingPeriodsMap.set(period.uuid, true);
        });
        const newUniquePeriods = apiResponse.data.filter(period => !existingPeriodsMap.has(period.uuid));

        let updatedPeriods: Period[];
        
        if(currentPage === 0) {
          updatedPeriods = apiResponse.data;
          setPeriods(updatedPeriods);
          

          if(totalCount !== undefined) {
            setTotalPeriods(totalCount);
          } else {
            setTotalPeriods(receivedCount);
          }
        } else {
          updatedPeriods = [...periods, ...newUniquePeriods];
          setPeriods(updatedPeriods);
          
          if(totalCount !== undefined) {
            setTotalPeriods(totalCount);
          } else {
            setTotalPeriods(prev => prev + newUniquePeriods.length);
          }
        }
        
        if(apiResponse && apiResponse.data) {
          const receivedCount = apiResponse.data.length;

          if (apiResponse.totalItems !== undefined) {
            const totalItems = apiResponse.totalItems;
            setTotalPeriods(totalItems);
 
            if (currentPage > 0 && receivedCount === 0) {
              setHasMore(false);
            } else {
              setHasMore(true);
            }
          } else {
            const shouldHaveMore = receivedCount > 0;
            setHasMore(shouldHaveMore);
          }
        }
      } catch(error) {
        console.error("Error fetching periods:", error);
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: t("period.fetch.failed"),
        });
      } finally {
        setIsLoadingMore(false);
        setAutoLoadingInProgress(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize, selectedPlanSetting, selectedPlanSettingId]);


  useEffect(() => {
    const handleScroll = () => {
      if (
        listContainerRef.current &&
        !loading &&
        !isLoadingMore &&
        !autoLoadingInProgress &&
        hasMore 
      ) {
        const { scrollTop, clientHeight, scrollHeight } = listContainerRef.current;
        const isNearBottom =  scrollTop + clientHeight >= scrollHeight - 100;

        if (isNearBottom) {
          
          if (!autoLoadingInProgress) {
            setAutoLoadingInProgress(true);
            handleLoadMore();
          }
        }
      }
    };


    const checkInitialScroll = () => {
      if (listContainerRef.current && hasMore && !loading && !isLoadingMore) {
        const { scrollTop, clientHeight, scrollHeight } = listContainerRef.current;

        if (scrollHeight <= clientHeight + 100 && periods.length > 0) {
          setAutoLoadingInProgress(true);
          handleLoadMore();
        }
      }
    };
    

    const timer = setTimeout(checkInitialScroll, 300);

    const listElement = listContainerRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
      clearTimeout(timer);
    };
  }, [loading, isLoadingMore, handleLoadMore, hasMore, periods.length]);



  useEffect(() => {
    if (listContainerRef.current && scrollPosition > 0 && periods.length > 0) {
   
      const timer = setTimeout(() => {
        if (listContainerRef.current) {
          listContainerRef.current.scrollTop = scrollPosition;
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [periods.length, scrollPosition]);

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

  const handleOpenSwapDialog = (period: Period) => {
    setSwapSource(period);
    setSwapTarget(null);
    setShowSwapDialog(true);
  };

  const convertTimeToMinutes = (
    timeString: string | undefined | null,
  ): number => {
    if(!timeString) return 0;
    try {
      const parts = timeString.toString().split(":");
      const hours = parseInt(parts[0] || "0", 10);
      const minutes = parseInt(parts[1] || "0", 10);
      return hours * 60 + minutes;
    }catch(error) {
      return 0;
    }
  };

  const convertMinutesToTime = (totalMinutes: number): string => {
    try {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
    }catch(error) {
      return "00:00:00";
    }
  };


  const PeriodSequenceVisualization = ({
    periods,
    swapSource,
    swapTarget,
  }: {
    periods: Period[];
    swapSource: Period | null;
    swapTarget: Period | null;
  }) => {
    if(!periods.length || !swapSource || !swapTarget) return null;

    const simulateSwappedSequence = () => {
      const periodsInCurrentPlanSetting = periods.filter(
        p => p.planSettingsId === selectedPlanSetting?.id ||
             p.planSettingsId === parseInt(selectedPlanSettingId || "", 10)
      );

      const sortedPeriods = [...periodsInCurrentPlanSetting].sort(
        (a, b) => (a.periodNumber || 0) - (b.periodNumber || 0),
      );

      const simulatedPeriods = sortedPeriods.map((p) => ({ ...p }));
      const sourceIndex = simulatedPeriods.findIndex(
        (p) => p.uuid === swapSource.uuid,
      );
      const targetIndex = simulatedPeriods.findIndex(
        (p) => p.uuid === swapTarget.uuid,
      );
      if(sourceIndex !== -1 && targetIndex !== -1) {
        const tempNumber = simulatedPeriods[sourceIndex].periodNumber;
        simulatedPeriods[sourceIndex].periodNumber =
          simulatedPeriods[targetIndex].periodNumber;
        simulatedPeriods[targetIndex].periodNumber = tempNumber;
      }
      return simulatedPeriods.sort(
        (a, b) => (a.periodNumber || 0) - (b.periodNumber || 0),
      );
    };

    const swappedSequence = simulateSwappedSequence();

    return (
      <div className="space-y-3 pt-3">
        <Label>{t("period.swapPreview")}</Label>
        <div className="border rounded-md p-3 bg-slate-50">
          <div className="text-sm text-muted-foreground mb-2">
            {t("period.swapPreviewDescription")}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {swappedSequence.map((period, index) => {
              const isSwapSource = period.uuid === swapSource.uuid;
              const isSwapTarget = period.uuid === swapTarget.uuid;
              return (
                <div
                  key={period.uuid}
                  className={`flex items-center px-2 py-1 rounded-md text-xs ${
                    isSwapSource || isSwapTarget
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="font-medium mr-1">
                    {period.periodNumber}:
                  </span>
                  <span>{period.name}</span>
                  {index < swappedSequence.length - 1 && (
                    <span className="mx-1 text-gray-400">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (currentPage === 0 && periods.length > 0 && periods.length % pageSize === 0) {
      setHasMore(true);
    }
  }, [periods.length, currentPage, pageSize]);

  return (
    <div className="flex h-screen bg-background-main">
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-hidden istui-timetable__main_content">
          {isLoadingPlanSettings && (
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
                  { label: t("period.breadcrumbs"), href: "" },
                ]}
              />
            </div>

            {planSettingsArray.length > 1 && (
              <div className="mb-4">
                <label
                  htmlFor="planSettingSelect"
                  className="block text-sm font-medium"
                >
                  {t("period.choosePlanSetting")}
                </label>
                <select
                  id="planSettingSelect"
                  value={selectedPlanSetting?.uuid || ""}
                  onChange={(e) => handlePlanSettingsChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
                  {planSettingsArray.map((ps) => (
                    <option key={ps.uuid} value={ps.uuid}>
                      {ps.name} – {ps.category}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[calc(100vh-220px)] overflow-y-auto">
              <div className="lg:col-span-5 xl:col-span-5 flex flex-col istui-timetable__main_list_card">
                <Card className="flex-1 overflow-hidden">
                  <div className="sticky top-0 z-10 bg-background border-b">
                    <div className="">
                      <CardHeader className="pb-1 bg-secondary">
                        <div className="flex items-center justify-between mb-1">
                          <div className={""}>
                            <CardTitle>
                              {t("nav.periods")}
                              {typeof totalPeriods === "number" && periods.length > 0 && (
                                <span className="text-muted-foreground text-sm font-normal ml-2">
                                  ({periods.length})
                                </span>
                              )}
                            </CardTitle>
                          </div>
                          <Button
                            className="istui-timetable__main_list_card_button"
                            size="sm"
                            onClick={handleNewPeriod}
                            disabled={!selectedPlanSettingId}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {t("actions.add")}
                          </Button>
                        </div>
                        <CardDescription>
                          {selectedPlanSetting && (
                            <span className="text-xs text-muted-foreground">
                              {t("period.selectedPlanSetting")}: {selectedPlanSetting.name}
                            </span>
                          )}
                        </CardDescription>
                      </CardHeader>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="search"
                              placeholder={t("period.searchPlaceholder")}
                              className="pl-9 istui-timetable__main_list_card_search_input"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-0">
                    {!selectedPlanSettingId ? (
                      <div className="p-8 text-center">
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          {t("period.selectPlanSettingFirst")}
                        </p>
                      </div>
                    ) : periods.length === 0 && !isLoadingMore ? (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">
                          {t("period.noPeriods")}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={handleNewPeriod}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {t("period.createFirst")}
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="overflow-y-auto"
                        ref={listContainerRef}
                        style={{
                          height: "calc(100vh - 250px)",
                          scrollBehavior: "auto",
                        }}
                      >
                        <PeriodList
                          periods={filteredPeriods}
                          selectedPeriod={selectedPeriod}
                          onSelectPeriod={handleSelectPeriod}
                          onDragEnd={handleDragEnd}
                          isLoadingMore={isLoadingMore}
                          hasMore={hasMore}
                          onLoadMore={handleLoadMore}
                          searchTerm={debouncedSearchTerm}
                          onSearchChange={setSearchTerm}
                          count={totalPeriods}
                          isLoading={loading}
                          listContainerRef={listContainerRef}
                          loadMoreRef={loadMoreRef}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
                <div className="text-xs text-muted-foreground px-2">
                  <p>{t("period.legend.title")}</p>
                  {isLoadingPlanSettings ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                      <span>{t("period.legend.loading")}</span>
                    </div>
                  ) : selectedPlanSetting &&
                    selectedPlanSetting.timeBlockTypes &&
                    selectedPlanSetting.timeBlockTypes.length > 0 ? (
                    selectedPlanSetting.timeBlockTypes.map((type, index) => (
                      <div
                        key={`legend-${type.id || index}`}
                        className="flex items-center gap-2 mt-1"
                      >
                        <div className="w-3 h-3 rounded-full bg-gray-100"></div>
                        <span>
                          {type.name} ({type.durationMinutes} {t("period.minutes")})
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                      <span>{t("period.legend.none")}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
                <Card className="h-full overflow-hidden">
                  {!selectedPlanSettingId ? (
                    <div className="flex items-center justify-center h-full">
                      <EmptyState
                        icon={<AlertTriangle />}
                        title={t("period.noPlanSettingSelected.title")}
                        description={t("period.noPlanSettingSelected.description")}
                        showImport={false}
                        hasPermission={false}
                      />
                    </div>
                  ) : isCreatingNew ? (
                    <PeriodForm
                      selectedPeriod={null}
                      isCreatingNew={true}
                      selectedPlanSetting={selectedPlanSetting}
                      existingPeriodNumbers={existingPeriodNumbers}
                      existingPeriodEndTimes={existingPeriodEndTimes}
                      isLoadingPlanSettings={isLoadingPlanSettings}
                      isSaving={isSaving}
                      onSubmit={handleSubmit}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                      onSwap={handleOpenSwapDialog}
                      isDeleting={isDeleting}
                      planSettingsId={selectedPlanSettingId}
                    />
                  ) : selectedPeriod ? (
                    <PeriodForm
                      selectedPeriod={selectedPeriod}
                      isCreatingNew={false}
                      selectedPlanSetting={selectedPlanSetting}
                      existingPeriodNumbers={existingPeriodNumbers}
                      existingPeriodEndTimes={existingPeriodEndTimes}
                      isLoadingPlanSettings={isLoadingPlanSettings}
                      isSaving={isSaving}
                      onSubmit={handleSubmit}
                      onCancel={handleCancel}
                      onDelete={handleDelete}
                      onSwap={handleOpenSwapDialog}
                      isDeleting={isDeleting}
                      planSettingsId={selectedPlanSettingId}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <EmptyState
                        icon={<Clock />}
                        title={t("period.emptyState.title")}
                        description={t("period.emptyState.description")}
                        onAdd={handleNewPeriod}
                        showImport={false}
                        hasPermission={true}
                      />
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
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title={t("common.deleteConfirmTitle")}
        description={`${t("common.deleteConfirmMessage").replace("{moduleName}", t("period.title"))} ${selectedPeriod?.name ? `(${selectedPeriod.name})` : ""}`}
        showTrigger={false}
      />
      <Dialog open={showSwapDialog} onOpenChange={setShowSwapDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("period.swap")}</DialogTitle>
            <DialogDescription>
              {t("period.swapDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("common.sourcePeriod")}</Label>
              <Select
                value={swapSource?.uuid || ""}
                onValueChange={(value) =>
                  setSwapSource(periods.find((p) => p.uuid === value) || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("period.swapSourcePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.uuid} value={period.uuid}>
                      {period.name} ({t("period.periodNumber")} {period.periodNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("common.targetPeriod")}</Label>
              <Select
                value={swapTarget?.uuid || ""}
                onValueChange={(value) =>
                  setSwapTarget(periods.find((p) => p.uuid === value) || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("period.swapTargetPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {periods
                    .filter((p) => p.uuid !== swapSource?.uuid)
                    .map((period) => (
                      <SelectItem key={period.uuid} value={period.uuid}>
                        {period.name} ({t("period.periodNumber")} {period.periodNumber})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {(swapSource?.periodNumber === 1 ||
              swapTarget?.periodNumber === 1) && (
              <div className="bg-amber-50 border border-main rounded-md p-3 text-sm">
                <div className="flex gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">
                      {t("common.swappingWithFirstPeriod")}
                    </p>
                    <p className="text-amber-700 mt-1">
                      {t("common.swappingWithFirstPeriodDescription", {
                        startTime: selectedPlanSetting?.startTime?.substring(0, 5) || "08:00"
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <PeriodSequenceVisualization
              periods={periods}
              swapSource={swapSource}
              swapTarget={swapTarget}
            />
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="updateSubsequent"
                checked={updateSubsequent}
                onCheckedChange={(checked) => setUpdateSubsequent(!!checked)}
              />
              <Label htmlFor="updateSubsequent">
                {t("period.recalculateAll")}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSwapDialog(false)}
              disabled={isSwapping}
            >
              {t("period.actions.cancel")}
            </Button>
            <Button
              onClick={() => {
                if(swapSource && swapTarget) {
                  handleSwapPeriods(swapSource, swapTarget);
                }
              }}
              disabled={!swapSource || !swapTarget || isSwapping}
            >
              {isSwapping ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("common.swapping")}
                </>
              ) : (
                t("period.swap")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PagePeriod;