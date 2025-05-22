// src/component/Binding/OrganizationSelector.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Label } from "@/component/Ui/label";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { ScrollArea } from "@/component/Ui/scroll-area";
import { useToast } from "@/component/Ui/use-toast";
import { useI18n } from "@/hook/useI18n";
import { Building, Search, RefreshCw, Check } from "lucide-react";

// Types for the organization
interface Organization {
  uuid: string;
  id?: number;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  status?: number;
}

// Types for API response
interface ApiResponse<T> {
  status: number;
  success: boolean;
  time: number;
  language: string;
  message: string;
  error?: string;
  data: T;
  totalItems?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentPage?: number;
}

interface OrganizationSelectorProps {
  value: string | null;
  onChange: (organizationUuid: string, organizationId?: number, organizationName?: string) => void;
  onSelect?: (organizationUuid: string, organizationId?: number, organizationName?: string) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  id?: string;
  error?: boolean;
  errorMessage?: string;
  showLabel?: boolean;
  compact?: boolean;
  currentOrganizationUuid?: string | null;
  onClose?: () => void; // Added onClose prop
}

// Helper function to get organization info from localStorage - exported separately
export function getCurrentOrganizationInfo(): { uuid: string | null; id: number | null; name: string | null } {
  const uuid = localStorage.getItem("selectedOrganizationUuid");
  const idStr = localStorage.getItem("selectedOrganizationId");
  const name = localStorage.getItem("selectedOrganizationName");
  const id = idStr ? parseInt(idStr, 10) : null;
  
  return { uuid, id, name };
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  value,
  onChange,
  onSelect,
  disabled = false,
  required = true,
  label = "Organization",
  id = "organization",
  error = false,
  errorMessage = "Please select an organization",
  showLabel = true,
  compact = false,
  currentOrganizationUuid = null,
  onClose, // Using the onClose prop
}) => {
  const { t } = useI18n();
  const { toast } = useToast();
  
  // State
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedOrgUuid, setSelectedOrgUuid] = useState<string | null>(
    value || currentOrganizationUuid || localStorage.getItem("selectedOrganizationUuid")
  );

  // Debounce search timeout reference
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reference to input element to maintain focus
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch organizations from API with search parameter
  const fetchOrganizations = useCallback(async (search: string = "") => {
    setIsLoading(true);
    try {
      // API URL with search param
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const apiUrl = `${apiBaseUrl}/api/v1/organizations?page=0&size=15${search ? `&search=${encodeURIComponent(search)}` : ''}`;
      
      const token = localStorage.getItem("authToken");
      
      const response = await fetch(apiUrl, {
        headers: {
          "Authorization": token ? `${token}` : "",
          "Accept-Language": localStorage.getItem("language") || "en",
          "Content-Type": "application/json"
        },
      });
      
      if(!response.ok) {
        throw new Error(`Failed to fetch organizations: ${response.status}`);
      }
      
      const data: ApiResponse<Organization[]> = await response.json();
      
      if(data.success && Array.isArray(data.data)) {
        setOrganizations(data.data);
      }else {
        throw new Error("Invalid response format");
      }
    }catch(error) {
      console.error("Error fetching organizations:", error);
      toast({
        variant: "destructive",
        title: t("Error"),
        description: t("Failed to load organizations"),
      });
      
      // Reset to empty array on error
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  // Initial fetch
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Set initial value if available
  useEffect(() => {
    if(value && value !== selectedOrgUuid) {
      setSelectedOrgUuid(value);
    } else if(currentOrganizationUuid && !selectedOrgUuid) {
      setSelectedOrgUuid(currentOrganizationUuid);
    }
  }, [value, currentOrganizationUuid, selectedOrgUuid]);

  // Handle organization selection
  const handleSelectOrg = (orgUuid: string) => {
    const org = organizations.find(o => o.uuid === orgUuid);
    setSelectedOrgUuid(orgUuid);
    
    // Save to localStorage
    localStorage.setItem("selectedOrganizationUuid", orgUuid);
    if(org?.id) {
      localStorage.setItem("selectedOrganizationId", org.id.toString());
    }
    if(org?.name) {
      localStorage.setItem("selectedOrganizationName", org.name);
    }
    
    // Call onChange with uuid, id, and name if available
    onChange(orgUuid, org?.id, org?.name);
    
    // Also call onSelect if provided
    if(onSelect) {
      onSelect(orgUuid, org?.id, org?.name);
    }
  };

  const handleClose = () => {
    onClose?.();
  };
  

  // Get selected organization name
  const getSelectedOrgName = () => {
    if(!selectedOrgUuid) return t("Select an organization");
    const org = organizations.find(o => o.uuid === selectedOrgUuid);
    return org ? org.name : t("Select an organization");
  };

  // Handle search input change with focus preservation
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get cursor position
    const cursorPosition = e.target.selectionStart || 0;
    const query = e.target.value;
    
    // Update state
    setSearchKeyword(query);
    
    // Clear previous timeout
    if(searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Make sure input stays focused and cursor position is maintained
    // This is the key fix for the focus issue
    setTimeout(() => {
      if(inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, 0);
    
    // Set new timeout for API search
    searchTimeoutRef.current = setTimeout(() => {
      fetchOrganizations(query);
    }, 300);
  };

  // Clear timeout on component unmount
  useEffect(() => {
    return () => {
      if(searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setSearchKeyword("");
    fetchOrganizations();
    // Focus the input after refresh
    setTimeout(() => {
      if(inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  // Rendering logic for compact mode
  if(compact) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            // If there's only one organization, select it automatically
            if(organizations.length === 1) {
              handleSelectOrg(organizations[0].uuid);
            }
          }}
          disabled={disabled || isLoading}
          className="flex items-center"
        >
          <Building className="h-4 w-4 mr-2" />
          {isLoading ? (
            <span>{t("Loading...")}</span>
          ) : selectedOrgUuid ? (
            getSelectedOrgName()
          ) : (
            t("Select Organization")
          )}
        </Button>
      </div>
    );
  }

  // Standard rendering
  return (
    <div className="space-y-2">
      {showLabel && (
        <Label
          htmlFor={id}
          className={
            error ? "text-destructive" : "istui-timetable__main_form_input_label"
          }
        >
          {t(label)}
          {required && " *"}
        </Label>
      )}
      
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={t("Search organizations...")}
            className="pl-8 pr-8"
            value={searchKeyword}
            onChange={handleSearchChange}
            disabled={isLoading || disabled}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-9 w-9"
            onClick={handleRefresh}
            disabled={isLoading || disabled}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <ScrollArea className="h-60 border rounded-md">
          {isLoading ? (
            <div className="flex items-center justify-center h-full p-4">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              <span>{t("Loading organizations...")}</span>
            </div>
          ) : organizations.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4 text-muted-foreground">
              {t("No organizations found")}
            </div>
          ) : (
            <div className="p-1">
              {organizations.map((org) => (
                <div
                  key={org.uuid}
                  className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent ${
                    selectedOrgUuid === org.uuid ? "bg-accent" : ""
                  }`}
                  onClick={() => handleSelectOrg(org.uuid)}
                >
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{org.name}</div>
                      {org.description && (
                        <div className="text-xs text-muted-foreground">
                          {org.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedOrgUuid === org.uuid && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
      
      {error && errorMessage && (
        <p className="text-sm text-destructive istui-timetable__main_form_input_error_message">
          {t(errorMessage)}
        </p>
      )}
      
      {/* Close button for dialog */}
      <div className="flex justify-end pt-2">
        <Button
          size="sm"
          disabled={isLoading || disabled}
          onClick={handleClose}
        >
          {t("Close")}
        </Button>
      </div>
    </div>
  );
};

export default OrganizationSelector;
