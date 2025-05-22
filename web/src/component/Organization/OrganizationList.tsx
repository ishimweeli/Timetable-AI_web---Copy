import React, { useRef, useEffect } from "react";
import { Search, Building, Plus, Filter, Loader2 } from "lucide-react";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Spinner } from "@/component/Ui/spinner";
import { useI18n } from "@/hook/useI18n";
import { TypeOrganization } from "@/type/Organization/TypeOrganization";
import { useUserService } from "@/store/User/ServiceUser";

interface OrganizationListProps {
  organizations: TypeOrganization[];
  onSelectOrganization: (uuid: string) => void;
  onNewOrganization: () => void;
  selectedOrganizationUuid: string | null;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onFilter: (status?: number) => void;
  count: number;
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  listContainerRef: React.RefObject<HTMLDivElement>;
  loadMoreRef: React.RefObject<HTMLDivElement>;
}

const OrganizationList: React.FC<OrganizationListProps> = ({
  organizations,
  onSelectOrganization,
  onNewOrganization,
  selectedOrganizationUuid,
  searchTerm,
  onSearchTermChange,
  onFilter,
  count,
  isLoading,
  onLoadMore,
  hasMore,
  isLoadingMore,
  listContainerRef,
  loadMoreRef,
}) => {
  const { t } = useI18n();
  const { isAdmin } = useUserService();

  useEffect(() => {}, [selectedOrganizationUuid]);

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder={t("organization.search.placeholder")}
            className="pl-9 w-full istui-timetable__main_list_card_search_input"
          />
        </div>
      </div>

      <div
        className="overflow-y-auto" 
        ref={listContainerRef}
        style={{
          height: "calc(100vh - 250px)",
          scrollBehavior: "auto", 
        }}
      >
        <div className="p-4" style={{ minHeight: 'calc(100vh - 200px + 50px)' }}>
          {isLoading && organizations.length === 0 ? (
            <div className="flex justify-center items-center h-32">
              <Spinner size="lg" />
            </div>
          ) : organizations.length > 0 ? (
            organizations.map((organization) => {
              const isSelected = selectedOrganizationUuid === organization.uuid;
              return (
                <div
                  key={organization.uuid}
                  onClick={() => onSelectOrganization(organization.uuid)}
                  className={`flex items-center p-2 rounded-md cursor-pointer transition-colors istui-timetable__main_list_card_list_item ${
                    isSelected ? "bg-blue-100" : "hover:bg-accent"
                  }`}
                >
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    <Building className="h-5 w-5" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{organization.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {organization.contactEmail ||
                        organization.address ||
                        t("organization.noContact")}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-32 p-4">
              <Building className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-center">
                {searchTerm
                  ? t("organization.empty.searchNoResults")
                  : t("organization.empty.noOrganizations")}
              </p>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={onNewOrganization}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t("organization.actions.createFirst")}
                </Button>
              )}
            </div>
          )}

      
          {organizations.length > 0 && (hasMore || isLoadingMore) && (
            <div className="mt-4 mb-6 flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="min-w-[200px]"
              >
                <div className="flex items-center">
                  {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("organization.actions.loadMore")}
                  {count > 0 && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({organizations.length < count ? organizations.length : count}/{count})
                    </span>
                  )}
                </div>
              </Button>
            </div>
          )}

          {!hasMore && organizations.length > 0 && count > 0 && organizations.length >= count && (
            <div className="text-center py-3 text-xs text-muted-foreground">
              {t("organization.list.endOfList", { count: String(organizations.length) })}
            </div>
          )}

          <div className="h-20" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(OrganizationList);