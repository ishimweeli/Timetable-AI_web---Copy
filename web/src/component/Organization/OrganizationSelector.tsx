import React, { useEffect, useState } from "react";
import { useAppSelector } from "@/hook/useAppRedux";
import { Building, Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/component/Ui/tooltip";
import { useGetOrganizationsQuery } from "@/store/Organization/ApiOrganization";
import { TypeOrganization } from "@/type/Organization/TypeOrganization";

interface OrganizationSelectorProps {
  onOrganizationChange: (organizationId: number) => void;
  selectedOrganizationId?: number;
  className?: string;
}

export const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  onOrganizationChange,
  selectedOrganizationId,
  className,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const [organizations, setOrganizations] = useState<TypeOrganization[]>([]);
  
  // Fetch organizations from API
  const { data: organizationsData, isLoading: isLoadingOrgs } = useGetOrganizationsQuery({
    size: 100 // Fetch up to 100 organizations
  });
  
  useEffect(() => {
    if(organizationsData?.data) {
      // Filter organizations based on user role
      // Only admins (roleId === 1) see all organizations
      // Managers and other roles only see their assigned organization
      if(user?.roleId === 1) {
        setOrganizations(organizationsData.data);
      } else if(user?.organizationId) {
        // For non-admins, only show their organization
        const userOrg = organizationsData.data.find(
          (org) => org.id === Number(user.organizationId)
        );
        if(userOrg) {
          setOrganizations([userOrg]);
        }
      }
    }
  }, [organizationsData, user]);

  // Default to user's organization if none selected
  const currentOrganizationId = selectedOrganizationId || 
    (user?.organizationId ? Number(user.organizationId) : undefined);

  const handleOrganizationChange = (value: string) => {
    const organizationId = parseInt(value, 10);
    if(!isNaN(organizationId)) {
      onOrganizationChange(organizationId);
    }
  };

  // If user only has access to one organization and is not an admin, don't show the selector
  if(organizations.length <= 1 && user?.roleId !== 1) {
    return null;
  }

  return (
    <div className={className}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Select
              value={currentOrganizationId?.toString()}
              onValueChange={handleOrganizationChange}
              disabled={isLoadingOrgs}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select organization">
                  <div className="flex items-center">
                    <Building className="mr-2 h-4 w-4" />
                    <span>
                      {organizations.find(
                        (org) => org.id === currentOrganizationId
                      )?.name || "Select organization"}
                    </span>
                    {user?.roleId === 1 && currentOrganizationId !== Number(user.organizationId) && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Preview)
                      </span>
                    )}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Organizations</SelectLabel>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id.toString()}>
                      <div className="flex items-center">
                        {org.id === Number(user?.organizationId) && (
                          <Check className="mr-2 h-4 w-4 text-primary" />
                        )}
                        {org.id !== Number(user?.organizationId) && (
                          <span className="mr-2 w-4"></span>
                        )}
                        {org.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {user?.roleId === 1
              ? "Preview settings from different organizations"
              : "Your organization"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// Add default export to fix import in TeacherForm.tsx
export default OrganizationSelector;
