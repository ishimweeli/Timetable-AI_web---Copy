import React from "react";
import { useI18n } from "@/hook/useI18n";
import { Button } from "@/component/Ui/button";

interface ViewSelectorProps {
  view: "day" | "week" | "month";
  onChange: (view: "day" | "week" | "month") => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ view, onChange }) => {
  const { t } = useI18n();
  
  return (
    <div className="flex space-x-2">
      <Button
        variant={view === "day" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("day")}
      >
        {t("calendar.dayView")}
      </Button>
      
      <Button
        variant={view === "week" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("week")}
      >
        {t("calendar.weekView")}
      </Button>
      
      <Button
        variant={view === "month" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("month")}
      >
        {t("calendar.monthView")}
      </Button>
    </div>
  );
};

export default ViewSelector; 