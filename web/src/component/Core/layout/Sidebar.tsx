import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Home,
  UserSquare2,
  DoorOpen,
  Users,
  Settings,
  Clock,
  GraduationCap,
  Book,
  User,
  Building,
  Layers,
  Sliders,
  Link as LinkIcon,
  SettingsIcon,
  ClipboardEdit,
  Lock,
} from "lucide-react";
import { cn } from "@/util/util.ts";
import { Separator } from "@/component/Ui/separator.tsx";
import { useI18n } from "@/hook/useI18n.ts";
import { useAppSelector } from "@/hook/useAppRedux.ts";
import { filterMenuItemsByRole } from "@/util/roleBasedAccess";
import { MenuItem as MenuItemType } from "@/type/Menu/TypeMenu";

interface SidebarProps {
  className?: string;
  open?: boolean;
  onClose?: () => void;
}

const MENU_ITEMS: MenuItemType[] = [
  {
    id: "dashboard",
    label: "navigation.dashboard",
    path: "/dashboard",
    isRoot: true,
    icon: Home,
  },
  {
    id: "teacherProfile",
    label: "navigation.teacherProfile",
    path: "/teacher-profile",
    isRoot: true,
    icon: User,
  },
  {
    id: "studentProfile",
    label: "navigation.studentProfile",
    path: "/student-profile",
    isRoot: true,
    icon: User,
  },
  {
    id: "resources",
    label: "navigation.resources",
    isRoot: true,
    icon: BookOpen,
    children: [
      {
        id: "organizations",
        label: "navigation.organizations",
        path: "/organizations",
        icon: Building,
      },
      {
        id: "classes",
        label: "navigation.classes",
        path: "/classes",
        icon: GraduationCap,
      },
      {
        id: "classBands",
        label: "common.classBands",
        path: "/classband",
        icon: Layers,
      },
      { id: "teachers", label: "navigation.teachers", path: "/teachers", icon: Users },
      { id: "students", label: "navigation.students", path: "/students", icon: User },
      { id: "subjects", label: "navigation.subjects", path: "/subjects", icon: Book },
      { id: "rooms", label: "navigation.rooms", path: "/rooms", icon: DoorOpen },
      {
        id: "managers",
        label: "nav.managers",
        path: "/managers",
        icon: UserSquare2,
      },
      { id: "rules", label: "navigation.rules", path: "/rules", icon: Settings },
      { id: "periods", label: "nav.periods", path: "/periods", icon: Clock },
      { id: "bindings", label: "nav.bindings", path: "/bindings", icon: LinkIcon },

    ],
  },
  {
    id: "schedule",
    label: "navigation.schedule",
    isRoot: true,
    icon: Calendar,
    children: [
      {
        id: "manualScheduling",
        label: "manualScheduling",
        path: "/manual-scheduling",
        icon: ClipboardEdit,
      },

      {
        id: "timetable",
        label: "navigation.timetable",
        path: "/timetable",
        icon: Calendar,
      },
  
      {
        id: "timetableLock",
        label: "timetable.lock.title",
        path: "/timetable/lock",
        icon: Lock,
      },
      {
        id: "calendar",
        label: "navigation.calendar",
        path: "/calendar",
        icon: Calendar,
      },
      {
        id: "planSettings",
        label: "navigation.planSettings",
        path: "/plansetting",
        icon: Sliders,
      },
    ],
  },
  {
    id: "settings",
    label: "navigation.settings",
    isRoot: true,
    icon: SettingsIcon,
    children: [
      {
        id: "organizationSettings",
        label: "navigation.organizationSettings",
        path: "/settings/organization",
        icon: Settings,
      },
      {
        id: "locationChangeSettings",
        label: "locationChange.title",
        path: "/settings/location-change",
        icon: Sliders,
      },
    ],
  },
];

const Sidebar = ({ className, open = false, onClose }: SidebarProps & { open?: boolean; onClose?: () => void }) => {
  
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>(() => {
  
    const savedState = localStorage.getItem('sidebarExpandedMenus');
    if(savedState) {
      try {
        return JSON.parse(savedState);
      }catch(e) {
        
      }
    }
    
   
    const initialExpanded: Record<string, boolean> = {};
    
    MENU_ITEMS.forEach(item => {
      if(item.children) {
        const shouldExpand = item.path === location.pathname || 
          item.children.some(child => child.path === location.pathname);
        
        if(shouldExpand) {
          initialExpanded[item.id] = true;
        }
      }
    });
    
    return initialExpanded;
  });
  

  const [, forceUpdate] = useState({});
  
  
  useEffect(() => {
    if(isAuthenticated && user) {
      forceUpdate({});
    }
  }, [isAuthenticated, user]);
  

  React.useEffect(() => {
    localStorage.setItem('sidebarExpandedMenus', JSON.stringify(expandedMenus));
  }, [expandedMenus]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  
  const filteredMenuItems = React.useMemo(() => {
    console.log("Filtering menu items for role:", user?.roleName);
    return filterMenuItemsByRole(MENU_ITEMS, user?.roleName);
  }, [user?.roleName]);

  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (onClose) onClose();
      }
      if (e.key === "Tab" && sidebarRef.current) {
        const focusableEls = sidebarRef.current.querySelectorAll<HTMLElement>(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];
        if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        } else if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    setTimeout(() => {
      if (sidebarRef.current) {
        const el = sidebarRef.current.querySelector<HTMLElement>(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (el) el.focus();
      }
    }, 100);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const MenuItemComponentWithSharedState = ({
    item,
    depth = 0,
    className,
  }: {
    item: MenuItemType;
    depth?: number;
    className?: string;
  }) => {
    const { t } = useI18n();
    
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path ? location.pathname === item.path : false;
    const isChildActive =
      hasChildren &&
      item.children?.some((child) => child.path === location.pathname);
    
   
    const isExpanded = expandedMenus[item.id] || false;

    const getActiveClass = () => {
      if(isActive || isChildActive) {
        return "bg-gray-800/50 text-white font-medium";
      }
      return "hover:bg-gray-800/30 text-gray-200";
    };

    const isDashboard = item.id === "dashboard";

    const handleNav = (e: React.MouseEvent) => {
      if (window.innerWidth < 640 && onClose) {
        onClose();
      }
    };

    return (
      <div className="w-full istui-timetable__sidebar_item_container">
        {item.path && !hasChildren ? (
          <Link to={item.path} className="block w-full" onClick={handleNav} tabIndex={0}>
            <div
              className={cn(
                "flex items-center py-2 px-3 text-sm rounded-md cursor-pointer transition-colors my-0.5",
                getActiveClass(),
                "istui-timetable__sidebar_link",
              )}
            >
              {item.icon && (
                <item.icon className="h-4 w-4 mr-3 text-current istui-timetable__sidebar_icon" />
              )}
              <span
                className={cn(
                  "istui-timetable__sidebar_label",
                  item.isRoot ? "text-lg" : "text-1xl ",
                )}
              >
                {t(item.label)}
              </span>
            </div>
          </Link>
        ) : (
          <>
            <div
              className={cn(
                "flex items-center py-2 px-3 text-sm rounded-md cursor-pointer transition-colors my-0.5",
                getActiveClass(),
                "istui-timetable__sidebar_group",
              )}
              onClick={() => toggleMenu(item.id)}
              tabIndex={0}
            >
              {item.icon && (
                <item.icon className="h-4 w-4 mr-3 text-current istui-timetable__sidebar_icon" />
              )}
              <span
                className={cn(
                  "istui-timetable__sidebar_label",
                  item.isRoot ? "text-lg" : "text-1xl ",
                )}
              >
                {t(item.label)}
              </span>
              {hasChildren &&
                (isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-current opacity-70 istui-timetable__sidebar_chevron istui-timetable__sidebar_chevron-down" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-current opacity-70 istui-timetable__sidebar_chevron istui-timetable__sidebar_chevron-right" />
                ))}
            </div>

            {isExpanded && hasChildren && (
              <div className="pl-4 ml-2 border-l border-gray-700/50 mt-1 mb-1 istui-timetable__sidebar_submenu">
                {item.children!.map((child) => (
                  <MenuItemComponentWithSharedState
                    key={child.id}
                    item={child}
                    depth={depth + 1}
                    className="istui-timetable__sidebar_subitem"
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const desktopSidebar = (
    <div
      className={cn(
        "hidden sm:flex w-60 h-screen bg-primary-dark flex-col istui-timetable__sidebar",
        className
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-gray-800 istui-timetable__sidebar_header">
        <div className="flex items-center justify-center gap-2 istui-timetable__sidebar_logo">
          <img
            src={"/public/logo.png"}
            className="w-10 h-10 rounded istui-timetable__sidebar_logo-img"
            alt={""}
          />
          <span className={"text-xl font-bold text-white"}>Timetabling</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto mt-6 py-0 istui-timetable__sidebar_content">
        <nav className="py-2 px-2 istui-timetable__sidebar_nav">
          {filteredMenuItems.map((item) => (
            <MenuItemComponentWithSharedState
              key={item.id}
              item={item}
              className="istui-timetable__sidebar_item"
            />
          ))}
        </nav>
      </div>
    </div>
  );

  const mobileSidebar = open ? (
    <div className="fixed inset-0 z-[9999] flex sm:hidden" data-sidebar="mobile">
      {(() => { console.log("Rendering mobile sidebar"); return null; })()}
      <div 
        className="absolute inset-0 bg-black/40 transition-opacity duration-300" 
        onClick={onClose}
        style={{ opacity: 1 }}
      ></div>
      <div 
        ref={sidebarRef}
        className="relative w-60 max-w-[80%] h-full bg-primary-dark flex flex-col shadow-lg transition-transform duration-300 transform-none focus:outline-none"
        style={{ transform: 'none', opacity: 1 }}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <button
          className="absolute top-2 right-2 p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary text-white z-50"
          onClick={(e) => {
            e.stopPropagation();
            console.log("Close button clicked");
            if (onClose) onClose();
          }}
          aria-label="Close sidebar menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="flex items-center justify-center h-16 border-b border-gray-800 istui-timetable__sidebar_header">
          <div className="flex items-center justify-center gap-2 istui-timetable__sidebar_logo">
            <img
              src={"/public/logo.png"}
              className="w-10 h-10 rounded istui-timetable__sidebar_logo-img"
              alt={""}
            />
            <span className={"text-xl font-bold text-white"}>Timetabling</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto mt-6 py-0 istui-timetable__sidebar_content">
          <nav className="py-2 px-2 istui-timetable__sidebar_nav">
            {filteredMenuItems.map((item) => (
              <MenuItemComponentWithSharedState
                key={item.id}
                item={item}
                className="istui-timetable__sidebar_item"
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
};

export default Sidebar;
