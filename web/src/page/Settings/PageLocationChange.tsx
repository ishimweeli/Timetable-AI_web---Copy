import React, { useEffect, useState } from "react";
import { useI18n } from "../../hook/useI18n";
import { useAppSelector } from "@/hook/useAppRedux";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { usePeriods } from "@/store/Period/periodStore";
import { Card } from "../../component/Ui/card";
import { Button } from "../../component/Ui/button";
import { useToast } from "../../component/Ui/use-toast";
import { Select, SelectTrigger, SelectContent, SelectItem } from "../../component/Ui/select";
import { Checkbox } from "../../component/Ui/checkbox";
import { Skeleton } from "../../component/Ui/skeleton";
import { Badge } from "../../component/Ui/badge";
import { 
  Clock, 
  MapPin, 
  ChevronRight, 
  Settings, 
  AlertCircle,
  ArrowRightLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "../../component/Ui/separator";

const PageLocationChange: React.FC = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const [isLoading, setIsLoading] = useState(false);
  const [isPeriodLoading, setIsPeriodLoading] = useState(false);

  const allowedRoles = ["ADMIN", "MANAGER"];
  if (!user || !allowedRoles.includes(user.roleName)) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center text-red-600">
          {t("locationChange.accessDenied")}
        </Card>
      </div>
    );
  }

  const fetchPlanSettingsByOrganization = usePlanSettingsStore(
    (s) => s.fetchPlanSettingsByOrganization
  );
 
  const [localPlanSettings, setLocalPlanSettings] = useState([]);



  useEffect(() => {
    const fetchPlans = async () => {
      if (user?.organizationId) {
        setIsLoading(true);
        try {
          const plans = await fetchPlanSettingsByOrganization(user.organizationId);
          setLocalPlanSettings(plans);
          
          if (plans && plans.length > 0) {
            const firstPlan = plans[0];
            setSelectedPlanUuid(firstPlan.uuid);
            setSelectedPlanId(firstPlan.id);
            setSelectedPlanName(`${firstPlan.name} - ${firstPlan.category}`);
          }
        } catch (error) {
          console.error("Error fetching plan settings:", error);
          toast({ 
            variant: "destructive", 
            title: t("common.error"), 
            description: t("locationChange.errorFetchingPlans") 
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchPlans();
  }, [user, fetchPlanSettingsByOrganization, toast, t]);

  const [selectedPlanUuid, setSelectedPlanUuid] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [selectedPlanName, setSelectedPlanName] = useState<string>("");


  const periods = usePeriods((s) => s.periods);
  const fetchPeriods = usePeriods((s) => s.fetchPeriods);
  const updateAllowLocationChangeBulk = usePeriods((s) => s.updateAllowLocationChangeBulk);


  const [selectedPeriods, setSelectedPeriods] = useState<number[]>([]);
  const [allPeriods, setAllPeriods] = useState(false);

  useEffect(() => {
    if (selectedPlanUuid && periods.length > 0) {
      setSelectedPeriods(
        periods.filter(p => p.allowLocationChange).map(p => p.periodNumber)
      );

      setAllPeriods(periods.every(p => p.allowLocationChange));
    } else {
      setSelectedPeriods([]);
      setAllPeriods(false);
    }
  }, [selectedPlanUuid, periods]);


  const handlePlanSelect = (uuid: string) => {
    setSelectedPlanUuid(uuid);
    const plan = localPlanSettings.find((ps) => ps.uuid === uuid);
    setSelectedPlanId(plan ? plan.id : null);
    setSelectedPlanName(plan ? `${plan.name} - ${plan.category}` : "");
  };


  useEffect(() => {
    const loadPeriods = async () => {
      if (selectedPlanId && user?.organizationId) {
        setIsPeriodLoading(true);
        try {
          await fetchPeriods(user.organizationId, selectedPlanId);
        } catch (error) {
          toast({ 
            variant: "destructive", 
            title: t("common.error"), 
            description: t("locationChange.errorFetchingPeriods") 
          });
        } finally {
          setIsPeriodLoading(false);
        }
      }
    };
    
    loadPeriods();
  }, [selectedPlanId, user, fetchPeriods, toast, t]);

  const handleCheckboxChange = (periodNumber: number, checked: boolean) => {
    if (allPeriods) {
      setAllPeriods(false);
    }
    
    setSelectedPeriods(prev =>
      checked ? [...prev, periodNumber] : prev.filter(n => n !== periodNumber)
    );
  };


  const handleAllPeriodsChange = (checked: boolean) => {
    setAllPeriods(!!checked);
    if (checked) {
      setSelectedPeriods([]);
    } else if (periods.length > 0) {
      setSelectedPeriods(
        periods.filter(p => p.allowLocationChange).map(p => p.periodNumber)
      );
    }
  };


  const handleSaveAllowedPeriods = async () => {
    if (!selectedPlanUuid) {
      toast({ 
        variant: "destructive", 
        title: t("common.error"), 
        description: t("locationChange.selectPlanError") 
      });
      return;
    }
    
    try {
      setIsLoading(true);
      

      const periodsToUpdate = periods.filter(period => {
        const shouldBeAllowed = allPeriods || selectedPeriods.includes(period.periodNumber);
        return period.allowLocationChange !== shouldBeAllowed;
      });
      
      const periodsToAllow = periodsToUpdate
        .filter(p => allPeriods || selectedPeriods.includes(p.periodNumber))
        .map(p => p.uuid);
        
      const periodsToDisallow = periodsToUpdate
        .filter(p => !allPeriods && !selectedPeriods.includes(p.periodNumber))
        .map(p => p.uuid);
      

      const updatePromises = [];
      
      if (periodsToAllow.length > 0) {
        updatePromises.push(updateAllowLocationChangeBulk(periodsToAllow, true));
      }
      
      if (periodsToDisallow.length > 0) {
        updatePromises.push(updateAllowLocationChangeBulk(periodsToDisallow, false));
      }
      
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        toast({ 
          title: t("common.success"), 
          description: t("locationChange.updateSuccess", { count: periodsToAllow.length + periodsToDisallow.length }) 
        });
        
     
        if (user?.organizationId && selectedPlanId) {
          await fetchPeriods(user.organizationId, selectedPlanId);
        }
      } else {
        toast({ 
          title: t("common.info"), 
          description: t("locationChange.noChanges") 
        });
      }
    } catch (err) {
      console.error("Error updating location change permissions:", err);
      toast({ 
        variant: "destructive", 
        title: t("common.error"), 
        description: t("locationChange.updateError") 
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container mx-auto py-6 px-4 flex flex-col min-h-screen">
      <nav className="flex items-center text-sm mb-4 text-muted-foreground">
        <Link to="/settings" className="flex items-center hover:text-primary transition-colors">
          <Settings className="h-4 w-4 mr-1" />
          {t("navigation.settings")}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="font-medium text-foreground">{t("locationChange.title")}</span>
      </nav>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t("locationChange.title")}</h1>
        <p className="text-muted-foreground">{t("locationChange.description")}</p>
      </div>
      
      <div className="space-y-6 flex-grow">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">{t("locationChange.selectPlan")}</h3>
          
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedPlanUuid || undefined}
              onValueChange={handlePlanSelect}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                {selectedPlanName || t("locationChange.selectPlan")}
              </SelectTrigger>
              <SelectContent>
                {localPlanSettings.length === 0 ? (
                  <div className="px-4 py-2 text-muted-foreground">
                    {t("locationChange.noPlanSettings")}
                  </div>
                ) : (
                  localPlanSettings.map((ps) => (
                    <SelectItem key={ps.uuid} value={ps.uuid}>
                      {ps.name} – {ps.category}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </Card>
        

        {selectedPlanUuid && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{t("locationChange.selectPeriods")}</h3>
              
              {periods.length > 0 && (
                <div className="flex items-center">
                  <Checkbox
                    id="all-periods"
                    checked={allPeriods}
                    onCheckedChange={handleAllPeriodsChange}
                    disabled={isPeriodLoading}
                  />
                  <label htmlFor="all-periods" className="ml-2 text-sm font-medium">
                    {t("locationChange.allPeriods")}
                  </label>
                </div>
              )}
            </div>
            
            <Separator className="mb-4" />
            
            {isPeriodLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                {periods.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-md">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">{t("locationChange.noPeriods")}</p>
                  </div>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto pr-2 mb-4">
                    <div className="space-y-3">
                      {periods.map((period) => (
                        <div 
                          key={period.id}
                          className={`border rounded-md p-4 transition-colors ${
                            allPeriods || selectedPeriods.includes(period.periodNumber) 
                              ? 'bg-primary/5 border-primary/20' 
                              : 'border-muted hover:border-muted-foreground/20'
                          }`}
                        >
                          <div className="flex items-start">
                            {!allPeriods && (
                              <Checkbox
                                checked={selectedPeriods.includes(period.periodNumber)}
                                onCheckedChange={checked => handleCheckboxChange(period.periodNumber, !!checked)}
                                className="mt-1 mr-3"
                              />
                            )}
                            <div className="flex-grow">
                              <div className="flex items-center justify-between">
                                <div className="font-medium flex items-center">
                                  {period.name} 
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    #{period.periodNumber}
                                  </Badge>
                                </div>
                                
                                {(allPeriods || period.allowLocationChange) && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {t("locationChange.allowed")}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground mt-1">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                <span>{period.startTime?.slice(0, 5)} - {period.endTime?.slice(0, 5)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            
            {periods.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start mb-4">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mr-3" />
                <div className="text-sm text-amber-700">
                  <p>{t("locationChange.permissionInfo", {
                    periods: allPeriods ? "all" : "selected",
                  })}</p>
                </div>
              </div>
            )}
            
            {periods.length > 0 && (
              <div className="pt-4 border-t mt-4">
                <Button 
                  onClick={handleSaveAllowedPeriods} 
                  className="w-full"
                  disabled={isLoading || isPeriodLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      {t("common.saving")}
                    </div>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      {t("locationChange.save")}
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default PageLocationChange; 