import React from "react";
import { Manager } from "@/type/Manager/TypeManager";
import { cn } from "@/util/util";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/component/Ui/button";

interface ManagerListProps {
  managers: Manager[];
  selectedManagerId: string | null;
  onSelectManager: (id: string) => void;
  isLoading: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement> | ((node?: Element) => void);
  currentUserEmail?: string;
  canCreateManagers?: boolean;
  isAdmin?: boolean;
  onDeleteManager?: (id: string) => void;
}

const ManagerList: React.FC<ManagerListProps> = ({
  managers,
  selectedManagerId,
  onSelectManager,
  isLoading,
  loadMoreRef,
  currentUserEmail,
  canCreateManagers,
  isAdmin,
  onDeleteManager,
}) => {
  return (
    <div className="space-y-2">
      {managers.map((manager) => {
        const isCurrentUser = currentUserEmail && manager.email === currentUserEmail;
        const canDelete = (isAdmin || canCreateManagers) && !isCurrentUser;

        return (
          <div
            key={manager.uuid}
            className={cn(
              "flex items-center p-3 rounded-md cursor-pointer transition-colors",
              selectedManagerId === manager.uuid
                ? "bg-primary/10 border-l-4 border-primary"
                : "hover:bg-accent border-l-4 border-transparent",
            )}
            onClick={() => onSelectManager(manager.uuid)}
          >
            <div className="flex-1">
              <p className="font-medium">
                {manager.firstName} {manager.lastName}
              </p>
              <p className="text-sm text-muted-foreground">{manager.email}</p>
            </div>

            {onDeleteManager && canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteManager(manager.uuid);
                }}
                className="opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div className="text-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        </div>
      )}

      <div
        ref={typeof loadMoreRef === 'function' ? loadMoreRef : loadMoreRef}
        className="h-10 opacity-0"
        aria-hidden="true"
      />
    </div>
  );
};

export default ManagerList;
