import { create } from "zustand";
import * as periodService from "@/services/Period/periodService";
import { Period, PeriodRequest } from "@/type/Period/index";
import { toast } from "@/component/Ui/use-toast";
import { updateAllowLocationChangeBulk } from "@/services/Period/periodService";

interface PeriodsState {
  periods: Period[];
  selectedPeriod: Period | null;
  loading: boolean;
  error: string | null;
  setPeriods: (periods: Period[]) => void;
  setSelectedPeriod: (period: Period | null) => void;
  fetchPeriods: (orgId?: number, planSettingsId?: number, page?: number, size?: number) => Promise<void>;
  fetchPeriodByUuid: (uuid: string, planSettingsId?: number) => Promise<void>;
  createPeriod: (period: PeriodRequest) => Promise<Period>;
  updatePeriod: (uuid: string, period: PeriodRequest) => Promise<Period>;
  deletePeriod: (uuid: string) => Promise<void>;
  selectPeriod: (period: Period | null) => void;
  updateAllowLocationChangeBulk: (periodUuids: string[], allowLocationChange: boolean) => Promise<void>;
}

export const usePeriods = create<PeriodsState>((set, get) => ({
  periods: [],
  selectedPeriod: null,
  loading: false,
  error: null,

  setPeriods: (periods) => set({ periods }),
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  
  // Add a debounce mechanism to prevent multiple rapid API calls
  fetchPeriods: (() => {
    let fetchPeriodsDebounceTimer: NodeJS.Timeout | null = null;
    
    return async (orgId?: number, planSettingsId?: number, page?: number, size?: number) => {
      // Clear any pending timer
      if (fetchPeriodsDebounceTimer) {
        clearTimeout(fetchPeriodsDebounceTimer);
      }
      
      // Create a new debounce timer (300ms delay)
      return new Promise<void>((resolve) => {
        fetchPeriodsDebounceTimer = setTimeout(async () => {
          set({ loading: true, error: null });
          try {
            // Get the effective planSettingsId
            const storedPlanSettingsId = localStorage.getItem("selectedPlanSettingsId");
            const effectivePlanSettingsId = planSettingsId || 
              (storedPlanSettingsId ? parseInt(storedPlanSettingsId, 10) : undefined);
            
            // If we have no planSettingsId, we can't fetch periods
            if (!effectivePlanSettingsId) {
              set({ 
                loading: false, 
                error: "Plan Settings ID is required",
                periods: []
              });
              resolve();
              return;
            }
            
            console.log(`Fetching periods with: orgId=${orgId}, planSettingsId=${effectivePlanSettingsId}`);
            
            let response;
            if (orgId) {
              try {
                // Pass the planSettingsId to getPeriodsByOrganization
                response = await periodService.getPeriodsByOrganization(
                  orgId, 
                  page || 0, 
                  size || 1000, 
                  effectivePlanSettingsId
                );
              } catch (err) {
                console.warn("Error fetching periods by organization, falling back to getAllPeriods:", err);
                // If organization-specific query fails, fall back to all periods
                response = await periodService.getAllPeriods(effectivePlanSettingsId);
              }
            } else {
              response = await periodService.getAllPeriods(effectivePlanSettingsId);
            }

            if (response && response.data) {
              set({ periods: response.data, loading: false });
            } else {
              set({ loading: false, error: "No data returned" });
            }
          } catch(error) {
            console.error("Error in fetchPeriods:", error);
            set({ 
              loading: false, 
              error: error instanceof Error ? error.message : "An unknown error occurred",
              periods: []
            });
            toast({
              variant: "destructive",
              title: "Error",
              description: "Failed to fetch periods. Please try again.",
            });
          }
          resolve();
        }, 300);
      });
    };
  })(),

  fetchPeriodByUuid: async (uuid: string, planSettingsId?: number) => {
    set({ loading: true, error: null });
    try {
      const effectivePlanSettingsId = planSettingsId || 
        parseInt(localStorage.getItem("selectedPlanSettingsId") || "0", 10);
      
      const response = await periodService.getPeriodByUuid(uuid, effectivePlanSettingsId);
      
      if(response && response.data) {
        set({ selectedPeriod: response.data, loading: false });
      } else {
        set({ loading: false, error: "Period not found or no data returned" });
      }
    } catch(err) {
      set({ loading: false, error: "Failed to fetch period details" });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch period details. Please try again.",
      });
    }
  },

  createPeriod: async (period: PeriodRequest) => {
    set({ loading: true, error: null });
    try {
      // Log what we received - don't modify it
      console.log("periodStore.createPeriod received:", period);
      
      // Basic validation to inform users rather than silently filling defaults
      if (!period.name) {
        throw new Error("Period name is required");
      }
      if (!period.startTime) {
        throw new Error("Start time is required");
      }
      if (!period.endTime) {
        throw new Error("End time is required");
      }
      if (!period.periodType) {
        throw new Error("Period type is required");
      }
      if (!period.days || period.days.length === 0) {
        throw new Error("At least one day must be selected");
      }
      
      // Check if period already exists WITHIN THIS SPECIFIC PLAN SETTING
      const periodExists = await periodService.checkPeriodExistsInPlanSettings(
        period.name,
        period.periodNumber,
        period.planSettingsId,
        period.organizationId
      );
      
      if (periodExists) {
        throw new Error(`A period with name "${period.name}" or number "${period.periodNumber}" already exists in this timetable plan.`);
      }
      
      // CRITICAL CHANGE: Don't create a new object, pass received data directly
      // This ensures planSettingsId is preserved
      const response = await periodService.createPeriod(period);
      
      if(response && response.data) {
        set((state) => ({
          periods: [...state.periods, response.data],
          loading: false
        }));
        
        toast({
          title: "Success",
          description: "Period created successfully",
        });
        
        return response.data;
      } else {
        throw new Error("Failed to create period or no data returned");
      }
    } catch(err) {
      console.error("Error creating period:", err);
      set({ loading: false, error: err instanceof Error ? err.message : "Failed to create period" });
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create period. Please try again.",
      });
      throw err;
    }
  },

  updatePeriod: async (uuid: string, period: PeriodRequest) => {
    set({ loading: true, error: null });
    try {
      if(!uuid) {
        throw new Error("Period UUID is required for update");
      }
      
      // Log what we received - don't modify it
      console.log("periodStore.updatePeriod received:", period);
      
      // Basic validation to inform users rather than silently filling defaults
      if (!period.name) {
        throw new Error("Period name is required");
      }
      if (!period.startTime) {
        throw new Error("Start time is required");
      }
      if (!period.endTime) {
        throw new Error("End time is required");
      }
      if (!period.periodType) {
        throw new Error("Period type is required");
      }
      if (!period.days || period.days.length === 0) {
        throw new Error("At least one day must be selected");
      }
      
      // Check if period already exists WITHIN THIS SPECIFIC PLAN SETTING (excluding this period)
      const periodExists = await periodService.checkPeriodExistsInPlanSettings(
        period.name,
        period.periodNumber,
        period.planSettingsId,
        period.organizationId,
        uuid // Exclude current period from the check
      );
      
      if (periodExists) {
        throw new Error(`Another period with name "${period.name}" or number "${period.periodNumber}" already exists in this timetable plan.`);
      }
      
      // CRITICAL CHANGE: Don't create a new object, pass received data directly
      // This ensures planSettingsId is preserved
      const response = await periodService.updatePeriod(uuid, period);
      
      if(response && response.data) {
        set((state) => ({
          periods: state.periods.map((p) => (p.uuid === uuid ? response.data : p)),
          selectedPeriod: response.data,
          loading: false
        }));
        
        toast({
          title: "Success",
          description: "Period updated successfully",
        });
        
        return response.data;
      } else {
        throw new Error("Failed to update period or no data returned");
      }
    } catch(err) {
      set({ loading: false, error: "Failed to update period" });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update period. Please try again.",
      });
      throw err;
    }
  },

  deletePeriod: async (uuid: string) => {
    set({ loading: true, error: null });
    try {
      if(!uuid) {
        throw new Error("Period UUID is required for deletion");
      }
      
      // Get the currently selected plan settings ID
      const planSettingsId = 
        parseInt(localStorage.getItem("selectedPlanSettingsId") || "0", 10);
        
      if (!planSettingsId) {
        throw new Error("Plan Settings ID is required to delete a period");
      }
      
      await periodService.deletePeriod(uuid, planSettingsId);
      
      set((state) => ({
        periods: state.periods.filter((p) => p.uuid !== uuid),
        selectedPeriod: state.selectedPeriod?.uuid === uuid ? null : state.selectedPeriod,
        loading: false
      }));
      
      toast({
        title: "Success",
        description: "Period deleted successfully",
      });
    } catch(err) {
      set({ loading: false, error: "Failed to delete period" });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete period. Please try again.",
      });
      throw err;
    }
  },

  selectPeriod: (period: Period | null) => {
    set({ selectedPeriod: period });
  },

  updateAllowLocationChangeBulk: async (periodUuids: string[], allowLocationChange: boolean) => {
    set({ loading: true, error: null });
    try {
      const response = await updateAllowLocationChangeBulk(periodUuids, allowLocationChange);
      if (response && response.data) {
        set((state) => ({
          periods: state.periods.map((p) =>
            periodUuids.includes(p.uuid)
              ? { ...p, allowLocationChange }
              : p
          ),
          loading: false
        }));
        toast({
          title: "Success",
          description: "Permissions updated successfully"
        });
        return response.data;
      } else {
        throw new Error("No data returned");
      }
    } catch (err) {
      set({ loading: false, error: "Failed to update permissions" });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update permissions. Please try again."
      });
      throw err;
    }
  }
}));

// Helper function to initialize periods for a specific organization
export const initializePeriodsForOrg = (organizationId: number, planSettingsId?: number, page?: number, size?: number) => {
  const store = usePeriods.getState();
  store.fetchPeriods(organizationId, planSettingsId, page, size);
};
