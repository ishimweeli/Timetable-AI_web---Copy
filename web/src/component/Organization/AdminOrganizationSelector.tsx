import React, { useEffect } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/util/util";
import { Button } from "@/component/Ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/component/Ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/Ui/popover";
import { useOrganizations } from "@/hook/useOrganizations";
import { Spinner } from "@/component/Ui/spinner";

interface AdminOrganizationSelectorProps {
  selectedOrganizationId: string | number | null;
  onOrganizationChange: (organizationId: string | number) => void;
  className?: string;
  placeholder?: string;
}

const AdminOrganizationSelector: React.FC<AdminOrganizationSelectorProps> = ({
  selectedOrganizationId,
  onOrganizationChange,
  className,
  placeholder = "Select organization...",
}) => {
  const { organizations, isLoading, error } = useOrganizations();
  const [open, setOpen] = React.useState(false);

  // Set the first organization as default if none is selected
  useEffect(() => {
    if(!selectedOrganizationId && organizations.length > 0 && !isLoading) {
      onOrganizationChange(organizations[0].uuid || organizations[0].id);
    }
  }, [organizations, selectedOrganizationId, isLoading, onOrganizationChange]);

  const selectedOrganization = organizations.find(
    (org) =>
      org.uuid === selectedOrganizationId || org.id === selectedOrganizationId,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <Spinner size="sm" className="mr-2" />
              Loading organizations...
            </div>
          ) : selectedOrganization ? (
            selectedOrganization.name
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 min-w-[240px]">
        <Command>
          <CommandInput placeholder="Search organization..." />
          <CommandEmpty>
            {isLoading
              ? "Loading..."
              : error
                ? "Error loading organizations"
                : "No organization found."}
          </CommandEmpty>
          <CommandGroup>
            {organizations.map((organization) => (
              <CommandItem
                key={organization.uuid || organization.id}
                value={organization.name}
                onSelect={() => {
                  onOrganizationChange(organization.uuid || organization.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedOrganizationId === organization.uuid ||
                      selectedOrganizationId === organization.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {organization.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default AdminOrganizationSelector;
