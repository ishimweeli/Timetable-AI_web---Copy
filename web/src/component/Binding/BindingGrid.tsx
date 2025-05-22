import React from "react";
import { Card, CardContent } from "@/component/Ui/card";
import { Button } from "@/component/Ui/button";
import { Edit, Trash2, User, Book, School, Home } from "lucide-react";
import { Binding } from "@/type/Binding/TypeBinding";
import { Badge } from "@/component/Ui/badge";
import { ScrollArea } from "@/component/Ui/scroll-area";
import { useI18n } from "@/hook/useI18n";

interface BindingGridProps {
  bindings: Binding[];
  onEdit: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  isLoading: boolean;
}

const BindingGrid: React.FC<BindingGridProps> = ({
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
    <ScrollArea className="h-[calc(100vh-400px)]">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
        {bindings.map((binding) => (
          <Card key={binding.uuid} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-3">
                {/* Teacher */}
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium">{binding.teacherFullName || binding.teacher_name}</span>
                </div>
                
                {/* Subject */}
                <div className="flex items-center">
                  <Book className="h-5 w-5 mr-2 text-green-600" />
                  <span>{binding.subjectName || binding.subject_name}</span>
                </div>

                {/* Class */}
                <div className="flex items-center">
                  <School className="h-5 w-5 mr-2 text-purple-600" />
                  <span>{binding.className || binding.classBandName || binding.class_name}</span>
                </div>

                {/* Room */}
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-orange-600" />
                  <span>{binding.roomName || binding.room_name}</span>
                </div>

                {/* Additional Info */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={binding.isFixed ? "default" : "outline"}>
                    {binding.periodsPerWeek} {t("binding.form.periodsPerWeek")}
                  </Badge>
                  {binding.isFixed && (
                    <Badge variant="secondary">{t("binding.form.isFixed")}</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(binding.uuid)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t("common.edit")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(binding.uuid)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t("common.delete")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export default BindingGrid;
