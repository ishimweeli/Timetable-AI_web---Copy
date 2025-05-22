import React from "react";
import { X, Save, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/component/Ui/button";
import { getRulePreferenceColor } from "@/util/ruleCalendar";

interface RulePreferenceToolbarProps {
  pendingChangesCount: number;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
  isSaving: boolean;
  hasDeleteChanges: boolean;
}

const RulePreferenceToolbar: React.FC<RulePreferenceToolbarProps> = ({
  pendingChangesCount,
  onSaveChanges,
  onDiscardChanges,
  isSaving,
  hasDeleteChanges,
}) => {
  // Get the standardized green color for rule applies
  const applyColor = getRulePreferenceColor(true);

  return (
    <div className="flex flex-col space-y-4 mb-4">
      <div className="flex flex-wrap items-center justify-between mb-2">
        <div className="font-medium text-gray-700">
          <div className="flex items-center">
            <div className={`flex items-center justify-center rounded-full w-6 h-6 mr-2 ${applyColor}`}>
              <Check className="h-4 w-4 text-white" />
            </div>
            Click on cells to toggle where this rule applies
          </div>
        </div>

        {pendingChangesCount > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDiscardChanges}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-1" />
              {hasDeleteChanges ? "Cancel Deletions" : "Discard"}
            </Button>
            <Button
              variant={hasDeleteChanges ? "destructive" : "default"}
              size="sm"
              onClick={onSaveChanges}
              disabled={isSaving}
            >
              {hasDeleteChanges ? (
                <AlertTriangle className="h-4 w-4 mr-1" />
              ) : (
                <Save className="h-4 w-4 mr-1" />
              )}
              {hasDeleteChanges ? "Confirm Changes" : "Save Changes"} ({pendingChangesCount})
            </Button>
          </div>
        )}
      </div>

      <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center rounded-full w-6 h-6 ${applyColor}`}>
            <Check className="h-4 w-4 text-white" />
          </div>
          <span>
            Cells with green circles indicate time slots where this rule applies
          </span>
        </div>
      </div>

      {hasDeleteChanges && (
        <div className="py-2 px-3 bg-amber-50 border border-amber-200 rounded text-amber-700 text-sm">
          <div className="flex items-start">
            <AlertTriangle className="h-4 w-4 mr-1 mt-0.5 text-amber-600" />
            <div>
              <strong>Note:</strong> You have pending deletion changes. Click
              "Confirm Changes" to apply them or "Cancel Deletions" to discard.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RulePreferenceToolbar;
