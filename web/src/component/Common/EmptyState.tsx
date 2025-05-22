import React from "react";
import { Button } from "@/component/Ui/button";
import { useI18n } from "@/hook/useI18n";
import { Plus, Upload } from "lucide-react";
import CsvImport, { ImportResult } from "./CsvImport";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onAdd?: () => void;
  onImport?: (file: File, options: { skipHeaderRow: boolean, organizationId?: number | null }) => Promise<ImportResult>;
  addLabel?: string;
  importLabel?: string;
  showImport?: boolean;
  customButtons?: React.ReactNode;
  hasPermission?: boolean;
  organizations?: Array<{ id: number, name: string }>;
  selectedOrgId?: number | null;
  organizationId?: number | null;
  isAdmin?: boolean;
  showOrganizationSelection?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  onAdd,
  onImport,
  addLabel,
  importLabel,
  showImport = false,
  customButtons,
  hasPermission = true,
  organizations = [],
  selectedOrgId = null,
  organizationId = null,
  isAdmin = false,
  showOrganizationSelection = true,
}) => {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="mb-6 p-6 rounded-full bg-muted/30 text-primary">
        {React.cloneElement(icon as React.ReactElement, { size: 64, strokeWidth: 1.5 })}
      </div>
      <h3 className="text-xl font-medium mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md text-base leading-relaxed">
        {description}
      </p>
      {customButtons ? (
        customButtons
      ) : (
        <div className="flex gap-2">
          {hasPermission && onAdd && (
            <Button
              className="istui-timetable__main_list_card_button"
              size="sm"
              variant="default"
              onClick={onAdd}
            >
              <Plus className="h-4 w-4 mr-2" />
              {addLabel || t("actions.add")}
            </Button>
          )}
          {hasPermission && showImport && onImport && (
            <CsvImport
              onImport={onImport}
              buttonVariant="outline"
              buttonSize="sm"
              organizations={organizations}
              selectedOrgId={selectedOrgId}
              organizationId={organizationId}
              isAdmin={isAdmin}
              showOrganizationSelection={showOrganizationSelection}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState; 