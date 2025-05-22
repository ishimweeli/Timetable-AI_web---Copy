// src/store/PlanSettings/planSettingsStore.ts
import { create } from "zustand";
import * as planSettingsService from "@/services/planSettings/planSettingsService";
import {
  PlanSettings,
  PlanSettingsRequest,
  PlanSettingsResponse,
} from "@/type/planSettings/planSettings";

interface PlanSettingsStore {
  planSettings: PlanSettings | null;
  planSettingsList: PlanSettings[];
  selectedPlanSettingsId: number | null;
  totalPages: number;
  totalItems: number;
  loading: boolean;
  error: string | null;
  lastUuidFetched: string | null;
  lastOrganizationSearch: string | null;
  clearPlanSettings: () => void;
  setPlanSettings: (planSettings: PlanSettings) => void;
  setSelectedPlanSettingsId: (id: number | null) => void;
  fetchPlanSettingsByUuid: (uuid: string) => Promise<PlanSettings | undefined>;
  fetchPlanSettingsByOrganization: (organizationId: string) => Promise<PlanSettings[]>;
  fetchPlanSettingsByOrganizationPaginated: (
    organizationId?: string,
    page?: number,
    size?: number,
    search?: string,
    sortBy?: string,
    sortDirection?: string,
  ) => Promise<PlanSettingsResponse>;
  fetchAllPlanSettings: (
    page?: number,
    size?: number,
    search?: string,
    sortBy?: string,
    sortDirection?: string,
  ) => Promise<PlanSettingsResponse>;
  createPlanSettings: (settings: PlanSettingsRequest) => Promise<PlanSettings>;
  updatePlanSettings: (uuid: string, settings: PlanSettingsRequest) => Promise<PlanSettings>;
  deletePlanSettings: (uuid: string) => Promise<void>;
}

export const usePlanSettingsStore = create<PlanSettingsStore>((set, get) => {
  const extractErrorMessage = (err: any) => {
    if(!err) return "An unknown error occurred";
    const checkForSpecificError = (value: any) =>
      typeof value === "string" &&
      (value.includes("planning.settings.exists") ||
        value.includes("[planning.settings.exists]"));
    const findSpecificError = (obj: any): string | null => {
      if(!obj || typeof obj !== "object") return null;
      for(const key in obj) {
        const value = obj[key];
        if(checkForSpecificError(value)) {
          return "plan setting with this category already exists";
        }
        if(value && typeof value === "object") {
          const result = findSpecificError(value);
          if(result) return result;
        }
      }
      return null;
    };
    const specificError = findSpecificError(err);
    if(specificError) return specificError;
    if(err.response?.data?.message) return err.response.data.message;
    if(err.response?.data?.error) return err.response.data.error;
    if(err.message) return err.message;
    return "Failed to complete plan settings operation";
  };

  return {
    planSettings: null,
    planSettingsList: [],
    selectedPlanSettingsId: null,
    totalPages: 0,
    totalItems: 0,
    loading: false,
    error: null,
    lastUuidFetched: null,
    lastOrganizationSearch: null,
    clearPlanSettings: () => set({ planSettings: null }),
    setPlanSettings: (planSettings: PlanSettings) => set({ planSettings }),
    setSelectedPlanSettingsId: (id: number | null) => set({ selectedPlanSettingsId: id }),
    fetchPlanSettingsByUuid: async (uuid: string) => {
      if(!uuid) return;
      if(get().loading || get().lastUuidFetched === uuid) return;
      set({ loading: true, error: null });
      try {
        const response = await planSettingsService.getPlanSettingsByUuid(uuid);
        set({
          planSettings: response.data,
          loading: false,
          lastUuidFetched: uuid,
        });
        return response.data;
      }catch(err) {
        set({ error: extractErrorMessage(err), loading: false });
        throw err;
      }
    },
    fetchPlanSettingsByOrganization: async (organizationId: string) => {
      if(!organizationId) return [];
      set({ loading: true, error: null });
      try {
        const response = await planSettingsService.getPlanSettingsByOrganization(organizationId);
        const planSettingsList = Array.isArray(response.data) ? response.data : [];
        set({ planSettingsList, loading: false });
        return planSettingsList;
      }catch(err) {
        if(err.response?.status === 404) {
          set({ planSettingsList: [], loading: false });
          return [];
        }
        set({
          error: err.response?.data?.message || "Failed to fetch plan settings",
          loading: false,
        });
        throw err;
      }
    },
    fetchPlanSettingsByOrganizationPaginated: async (
      organizationId?: string,
      page = 0,
      size = 10,
      search = "",
      sortBy = "modifiedDate",
      sortDirection = "desc",
    ): Promise<any> => {
      const searchKey = `${organizationId || "all"}-${page}-${size}-${search}-${sortBy}-${sortDirection}`;
      if(get().loading || get().lastOrganizationSearch === searchKey) {
        return {
          content: get().planSettingsList,
          totalPages: get().totalPages,
          totalElements: get().totalItems,
          data: get().planSettingsList,
          totalItems: get().totalItems
        };
      }
      set({ loading: true, error: null });
      try {
        let response;
        if(!organizationId) {
          response = await planSettingsService.getAllPlanSettingsPaginated(
            page,
            size,
            search,
            sortBy,
            sortDirection,
          );
        }else {
          response =
            await planSettingsService.getPlanSettingsByOrganizationPaginated(
              organizationId,
              page,
              size,
              search,
              sortBy,
              sortDirection,
            );
        }
        
        console.log("Plan settings API response:", response);
        
        // Check for different response formats
        let planSettingsData = [];
        let totalPages = 0;
        let totalItems = 0;
        
        if (response.data) {
          // Format from user's JSON: { data: [...], totalItems: 2 }
          planSettingsData = response.data;
          totalItems = response.totalItems || 0;
          totalPages = Math.ceil(totalItems / size);
        } else if (response.content) {
          // Older format: { content: [...], totalPages: 1, totalElements: 2 }
          planSettingsData = response.content;
          totalPages = response.totalPages || 0;
          totalItems = response.totalElements || 0;
        }
        
        console.log("Processed plan settings data:", planSettingsData);
        
        set({
          planSettingsList: planSettingsData,
          totalPages,
          totalItems,
          loading: false,
          lastOrganizationSearch: searchKey,
        });
        
        // Return an object with both old and new format properties for maximum compatibility
        return {
          content: planSettingsData,
          totalPages,
          totalElements: totalItems,
          data: planSettingsData,
          totalItems
        };
      }catch(err) {
        console.error("Error fetching plan settings:", err);
        if(err.response?.status === 404) {
          const emptyResponse = {
            content: [],
            totalPages: 0,
            totalElements: 0,
            data: [],
            totalItems: 0
          };
          set({
            planSettingsList: [],
            totalPages: 0,
            totalItems: 0,
            loading: false,
            error: null,
            lastOrganizationSearch: searchKey,
          });
          return emptyResponse;
        }
        set({
          error:
            err.response?.data?.message || "Failed to fetch plan settings list",
          loading: false,
        });
        throw err;
      }
    },
    fetchAllPlanSettings: async (
      page = 0,
      size = 10,
      search = "",
      sortBy = "modifiedDate",
      sortDirection = "desc",
    ): Promise<PlanSettingsResponse> => {
      return get().fetchPlanSettingsByOrganizationPaginated(
        undefined,
        page,
        size,
        search,
        sortBy,
        sortDirection,
      );
    },
    createPlanSettings: async (settings: PlanSettingsRequest) => {
      set({ loading: true, error: null });
      try {
        const response = await planSettingsService.createPlanSettings({
          ...settings,
          organizationId: Number(settings.organizationId),
        });
        set({ loading: false });
        return response.data;
      }catch(err) {
        set({ error: extractErrorMessage(err), loading: false });
        throw err;
      }
    },
    updatePlanSettings: async (uuid: string, settings: PlanSettingsRequest) => {
      set({ loading: true, error: null });
      try {
        const response = await planSettingsService.updatePlanSettings(uuid, {
          ...settings,
          organizationId: Number(settings.organizationId),
        });
        set({ loading: false });
        return response.data;
      }catch(err) {
        set({ error: extractErrorMessage(err), loading: false });
        throw err;
      }
    },
    deletePlanSettings: async (uuid: string) => {
      set({ loading: true, error: null });
      try {
        await planSettingsService.deletePlanSettings(uuid);
        set({ loading: false });
      }catch(err) {
        set({ error: extractErrorMessage(err), loading: false });
        throw err;
      }
    },
  };
});
