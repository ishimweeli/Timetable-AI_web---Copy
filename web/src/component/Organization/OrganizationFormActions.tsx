import React, { useState } from "react";
import { Button } from "@/component/Ui/button";
import {Check, CheckCheck, Trash2, X, Loader2} from "lucide-react";
import { Spinner } from "@/component/Ui/spinner";
import { useI18n } from "@/hook/useI18n";
import DeleteConfirmation from "@/component/Ui/modal/DeleteConfirmation";

interface OrganizationFormActionsProps {
    isNewOrganization: boolean;
    onDelete: () => void;
    onCancel: () => void;
    isLoading: boolean;
    isDeleting: boolean;
    isAdmin: boolean;
    hasEditPermission: boolean;
}

const OrganizationFormActions: React.FC<OrganizationFormActionsProps> = ({
                                                                             isNewOrganization,
                                                                             onDelete,
                                                                             onCancel,
                                                                             isLoading,
                                                                             isDeleting,
                                                                             isAdmin,
                                                                             hasEditPermission,
                                                                         }) => {
    const { t } = useI18n();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const openDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    };

    return (
        <div className="flex justify-end space-x-2 pt-6 border-t istui-timetable__main_form_actions">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="istui-timetable__main_form_cancel_button"
            >
                <>
                    <X className="h-4 w-4" />
                    {t("common.cancel")}
                </>
            </Button>

            {!isNewOrganization && isAdmin && (
                <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={openDeleteDialog}
                    disabled={isDeleting}
                    className="flex items-center gap-1 istui-timetable__main_form_delete_button"
                >
                    {isDeleting ? (
                        <>
                            <Spinner className="mr-2 h-4 w-4" />
                            {t("common.deleting")}
                        </>
                    ) : (
                        <>
                            <Trash2 className="h-4 w-4" />
                            {t("common.deleteButton")}
                        </>
                    )}
                </Button>
            )}

            {/* Only show the Update/Create button if user has permission */}
            {hasEditPermission && (
                <Button
                    type="submit"
                    size="sm"
                    disabled={isLoading}
                    className="whitespace-nowrap istui-timetable__main_form_save_button"
                >
                    {isLoading ? (
                        <>
                            <Spinner className="mr-2 h-4 w-4" />
                            {t("common.saving")}
                        </>
                    ) : isNewOrganization ? (
                        <>
                            <CheckCheck className="h-4 w-4" />
                            {t("common.create")}
                        </>
                    ) : (
                        <>
                            <Check className="h-4 w-4" />
                            {t("common.update")}
                        </>
                    )}
                </Button>
            )}

            <DeleteConfirmation
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                onConfirm={onDelete}
                isDeleting={isDeleting}
                moduleName="organization"
                showTrigger={false}
            />
        </div>
    );
};

export default OrganizationFormActions;
