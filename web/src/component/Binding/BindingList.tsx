import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/component/Ui/table";
import { Button } from "@/component/Ui/button";
import { Edit, Trash2, User, Book, School, Home } from "lucide-react";
import { Binding } from "@/type/Binding/TypeBinding";
import { Badge } from "@/component/Ui/badge";
import { ScrollArea } from "@/component/Ui/scroll-area";
import { useI18n } from "@/hook/useI18n";

interface BindingListProps {
  bindings: Binding[];
  onEdit: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  isLoading: boolean;
}

const BindingList: React.FC<BindingListProps> = ({
  bindings,
  onEdit,
  onDelete,
  isLoading,
}) => {
  const { t } = useI18n();

  if(isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="mt-2 text-sm text-muted-foreground">
            {t("binding.message.loading")}
          </span>
        </div>
      </div>
    );
  }

  if(bindings.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 border rounded-md">
        <div className="text-center">
          <p className="text-muted-foreground">{t("binding.message.noData")}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t("binding.actions.new")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-md w-full">
      <ScrollArea className="h-[calc(100vh-400px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead>{t("binding.form.teacher")}</TableHead>
              <TableHead>{t("binding.form.subject")}</TableHead>
              <TableHead>{t("binding.form.class")}/{t("binding.form.classband")}</TableHead>
              <TableHead>{t("binding.form.room")}</TableHead>
              <TableHead>{t("binding.form.periodsPerWeek")}</TableHead>
              <TableHead>{t("common.status")}</TableHead>
              <TableHead className="text-right">{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bindings.map((binding) => (
              <TableRow key={binding.uuid} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    {binding.teacherFullName || binding.teacher_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Book className="h-4 w-4 mr-2 text-green-600" />
                    {binding.subjectName || binding.subject_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <School className="h-4 w-4 mr-2 text-purple-600" />
                    {binding.className || binding.classBandName || binding.class_name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-2 text-orange-600" />
                    {binding.roomName || binding.room_name}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-blue-50">
                    {binding.periodsPerWeek || 1}
                  </Badge>
                </TableCell>
                <TableCell>
                  {binding.isFixed ? (
                    <Badge variant="secondary">{t("binding.form.isFixed")}</Badge>
                  ) : (
                    <Badge variant="outline">{t("common.flexible")}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(binding.uuid)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t("common.edit")}</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(binding.uuid)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t("common.delete")}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default BindingList;
