import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/hook/useAppRedux";

interface SidebarMenuItemProps {
  icon: React.ReactNode;
  title: string;
  path: string;
  isActive?: boolean;
  isDashboard?: boolean;
}

const SidebarMenuItem: React.FC<SidebarMenuItemProps> = ({
  icon,
  title,
  path,
  isActive = false,
  isDashboard = false,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  

  let finalPath = path;
  
 
  if(isDashboard && path === "/dashboard") {
    
    finalPath = "/dashboard";
  }
  
  return (
    <Link
      to={finalPath}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
      )}
    >
      {icon}
      <span>{title}</span>
    </Link>
  );
};

export default SidebarMenuItem; 
