import React from "react";
import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
};

type DetailCardHeaderProps = {
  label?: string;
  className?: string;
  active?: boolean;
  children?: React.ReactNode;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
};

const DetailCardHeader: React.FC<DetailCardHeaderProps> = ({
  label = "Details",
  className,
  active = true,
  children,
  tabs,
  activeTab,
  onTabChange,
}) => (
  <div className="bg-secondary p-3">
    <div
      className={cn(
        "flex w-full rounded-none bg-transparent h-10",
        className
      )}
    >
      {tabs && tabs.length > 1 ? (
        <div className="flex w-full">
          {tabs.map((tab) => (
            <span
              key={tab.id}
              className={cn(
                "flex-1 rounded-none font-medium text-gray-900",
                "border-b-2 h-10 cursor-pointer",
                activeTab === tab.id 
                  ? "border-primary" 
                  : "border-transparent hover:border-primary/30",
                "flex items-center justify-center transition-all duration-200",
                activeTab === tab.id ? "text-primary" : "text-gray-500"
              )}
              onClick={() => onTabChange?.(tab.id)}
            >
              {tab.label}
            </span>
          ))}
          {children}
        </div>
      ) : (
        <span
          className={cn(
            "flex-1 rounded-none font-medium text-gray-900",
            "data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none h-10",
            "flex items-center justify-center"
          )}
          data-state={active ? "active" : "inactive"}
        >
          {label}
        </span>
      )}
      {!tabs && children}
    </div>
  </div>
);

export default DetailCardHeader; 