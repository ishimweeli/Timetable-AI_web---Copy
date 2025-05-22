import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/component/Ui/button";
import { Spinner } from "@/component/Ui/spinner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/component/Ui/alert-dialog";
import { useI18n } from "@/hook/useI18n";

interface DeleteConfirmationProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title?: string;
  description?: string;
  moduleName?: string;
  showTrigger?: boolean;
  confirmText?: string;
  cancelText?: string;
}

const DeleteConfirmation = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting,
  title,
  description,
  moduleName = "record",
  showTrigger = true,
  confirmText,
  cancelText,
}: DeleteConfirmationProps) => {
  const { t } = useI18n();

  const confirmButtonText = confirmText || t("common.confirmYes");
  const cancelButtonText = cancelText || t("common.confirmNo");

  const dialogTitle = title || t("common.deleteConfirmTitle");
  const dialogDescription =
    description ||
    t("common.deleteConfirmMessage").replace("{moduleName}", moduleName);

  const defaultTrigger = (
    <Button variant="destructive" size="sm" type="button">
      <Trash2 className="h-4 w-4 mr-2" />
      {t("common.delete")}
    </Button>
  );

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {showTrigger && (
        <AlertDialogTrigger asChild>{defaultTrigger}</AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelButtonText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                {t("common.deleting")}
              </>
            ) : (
              confirmButtonText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmation;
