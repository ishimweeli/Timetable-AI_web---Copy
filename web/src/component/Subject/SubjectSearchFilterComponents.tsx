import React, { useState } from "react";
import { Search, Building, ArrowUpDown, Filter, RefreshCw } from "lucide-react";
import { Input } from "@/component/Ui/input";
import { Button } from "@/component/Ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/component/Ui/popover";
import { Checkbox } from "@/component/Ui/checkbox";
import { Label } from "@/component/Ui/label";
import { Spinner } from "@/component/Ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/component/Ui/dropdown-menu";
import { RadioGroup, RadioGroupItem } from "@/component/Ui/radio-group";

interface SubjectSearchFilterHeaderProps {
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  organizations?: any[];
  selectedOrgId?: number | null;
  onSelectOrg?: (val: number | null) => void;
  isLoadingOrgs?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (newSortBy: string, newSortOrder: "asc" | "desc") => void;
  onResetFilters?: () => void;
  className?: string;
}

// Search component matching the design from the screenshot
export const SearchComponent = ({
  value = "",
  onChange,
  placeholder = "Search by subject name",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 h-10 pr-8"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-full"
        >
          <span className="sr-only">Clear</span>
          <span aria-hidden>×</span>
        </Button>
      )}
    </div>
  );
};

// Update OrganizationFilter props
type OrganizationFilterProps = {
  organizations?: any[];
  selectedOrgId?: number | null;
  onSelectOrg?: (val: number | null) => void;
  isLoading?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const OrganizationFilter = ({
  organizations = [],
  selectedOrgId = null,
  onSelectOrg = () => {},
  isLoading = false,
  isOpen = false,
  onOpenChange = () => {},
}: OrganizationFilterProps) => {
  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`h-10 w-10 ${selectedOrgId ? "bg-primary/10 border-primary/20" : ""}`}
          aria-label="Filter by organization"
        >
          <Building className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Filter by Organization</h4>
          <div className="h-px bg-border" />
          {isLoading ? (
            <div className="py-2 flex justify-center">
              <Spinner className="h-4 w-4" />
            </div>
          ) : (
            <RadioGroup value={selectedOrgId === null ? "all" : String(selectedOrgId)} onValueChange={value => onSelectOrg && onSelectOrg(value === "all" ? null : Number(value))}>
              <div className="flex items-center space-x-2 py-1">
                <RadioGroupItem value="all" id="all-orgs" />
                <Label htmlFor="all-orgs" className="text-sm cursor-pointer">
                  All Organizations
                </Label>
              </div>
              {organizations.map((org) => (
                <div key={org.id} className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value={String(org.id)} id={`org-${org.id}`} />
                  <Label htmlFor={`org-${org.id}`} className="text-sm cursor-pointer">
                    {org.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Update SortDropdown props
type SortDropdownProps = {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (newSortBy: string, newSortOrder: "asc" | "desc") => void;
};

export const SortDropdown = ({
  sortBy = "name",
  sortOrder = "asc",
  onSortChange = () => {},
}: SortDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 h-10"
        >
          <ArrowUpDown className="h-4 w-4" />
          <span>Sort</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            onSortChange && onSortChange(
              "name",
              sortBy === "name"
                ? sortOrder === "asc"
                  ? "desc"
                  : "asc"
                : "asc",
            )
          }
        >
          Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            onSortChange && onSortChange(
              "initials",
              sortBy === "initials"
                ? sortOrder === "asc"
                  ? "desc"
                  : "asc"
                : "asc",
            )
          }
        >
          Initials {sortBy === "initials" && (sortOrder === "asc" ? "↑" : "↓")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            onSortChange && onSortChange(
              "group",
              sortBy === "group"
                ? sortOrder === "asc"
                  ? "desc"
                  : "asc"
                : "asc",
            )
          }
        >
          Group {sortBy === "group" && (sortOrder === "asc" ? "↑" : "↓")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            onSortChange && onSortChange(
              "modifiedDate",
              sortBy === "modifiedDate"
                ? sortOrder === "asc"
                  ? "desc"
                  : "asc"
                : "asc",
            )
          }
        >
          Last Modified{" "}
          {sortBy === "modifiedDate" && (sortOrder === "asc" ? "↑" : "↓")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Filter button component
export const FilterButton = ({
  isOpen = false,
  onOpenChange = () => {},
  hasFilters = false,
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onOpenChange(!isOpen)}
      className={`flex items-center gap-1 h-10 ${hasFilters ? "bg-primary/10 border-primary/20" : ""}`}
    >
      <Filter className="h-4 w-4" />
      <span>Filter</span>
    </Button>
  );
};

// Combined search filter header
export const SubjectSearchFilterHeader = ({
  searchValue = "",
  onSearchChange = () => {},
  organizations = [],
  selectedOrgId = null,
  onSelectOrg = () => {},
  isLoadingOrgs = false,
  sortBy = "name",
  sortOrder = "asc",
  onSortChange = () => {},
  onResetFilters = () => {},
  className = "",
}: SubjectSearchFilterHeaderProps) => {
  const [isOrgFilterOpen, setIsOrgFilterOpen] = useState(false);

  // Check if there are active filters
  const hasActiveFilters = selectedOrgId !== null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main search and filter row */}
      <div className="flex items-center gap-2">
        <SearchComponent
          value={searchValue}
          onChange={onSearchChange}
          placeholder="Search subjects by name, code, or group..."
          className="flex-1"
        />

        <OrganizationFilter
          organizations={organizations}
          selectedOrgId={selectedOrgId}
          onSelectOrg={onSelectOrg}
          isLoading={isLoadingOrgs}
          isOpen={isOrgFilterOpen}
          onOpenChange={setIsOrgFilterOpen}
        />

        <SortDropdown
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />
      </div>

      {/* Active filters display */}
      {(hasActiveFilters || searchValue) && (
        <div className="flex flex-wrap gap-1">
          {selectedOrgId && (
            <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
              <Building className="h-3 w-3" />
              <span>
                {organizations.find((org) => org.id === selectedOrgId)?.name ||
                  `Organization: ${selectedOrgId}`}
              </span>
            </div>
          )}

          {searchValue && (
            <div className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground rounded px-2 py-1">
              <Search className="h-3 w-3" />
              <span>"{searchValue}"</span>
            </div>
          )}

          {(hasActiveFilters || searchValue) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
