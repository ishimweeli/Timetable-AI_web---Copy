import React from "react";
import {
  Search,
  Bell,
  MessageSquare,
  LogOut,
  User,
  Settings,
  Menu,
} from "lucide-react";
import { Badge } from "@/component/Ui/badge.tsx";
import { Button } from "@/component/Ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/component/Ui/dropdown-menu.tsx";
import { HeaderActions } from "@/component/Ui/header-actions.tsx";
import { useAppDispatch, useAppSelector } from "@/hook/useAppRedux";
import { logOut } from "@/store/Auth/SliceAuth";
import { useNavigate } from "react-router-dom";
import { LanguageSelector } from "@/component/Ui/language-selector";
import { ThemeToggle } from "@/component/Ui/theme-toggle";
import NotificationDropdown from "@/component/Notification/notificationDropdown";

const Header = React.forwardRef(({ onMenuClick }: { onMenuClick?: () => void }, ref) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [showMobileSearch, setShowMobileSearch] = React.useState(false);

  React.useImperativeHandle(ref, () => ({
    closeMobileSearch: () => setShowMobileSearch(false)
  }));

  const handleLogout = () => {
    dispatch(logOut());
    navigate("/");
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMobileSearch(false);
    if (onMenuClick) {
      onMenuClick();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/90 pl-0 sm:pl-60 istui-timetable__nav-header">
      <div className="flex items-center justify-between h-12 sm:h-14 px-2 sm:px-5 istui-timetable__nav-header_container">
        <button
          className="sm:hidden p-2 mr-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-md z-50 relative"
          onClick={handleMenuClick}
          style={{ zIndex: 50 }}
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center justify-center sm:justify-start"></div>
        <div className="flex items-center gap-1 sm:gap-3">
          <div className="flex sm:hidden items-center gap-1">
            <LanguageSelector />
            <ThemeToggle />
            {isAuthenticated && <NotificationDropdown />}
            <Button
              variant="ghost"
              size="icon"
              className="istui-timetable__nav-header_button"
              onClick={() => setShowMobileSearch((v) => !v)}
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
          {showMobileSearch && (
            <div className="absolute top-14 left-0 w-full px-2 z-50 sm:hidden">
              <div className="bg-background rounded-md border border-input p-2 flex items-center gap-2 shadow-lg">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search"
                  className="w-full bg-transparent outline-none text-sm"
                  autoFocus
                  onBlur={() => setShowMobileSearch(false)}
                />
              </div>
            </div>
          )}
          <div className="hidden sm:flex items-center gap-3">
            <HeaderActions />
            <div className="flex-1 flex items-center max-w-md mx-4 istui-timetable__nav-header_search">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground istui-timetable__nav-header_search-icon" />
                <input
                  type="search"
                  placeholder="Search"
                  className="w-full bg-background rounded-md border border-input pl-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 istui-timetable__nav-header_search-input"
                />
              </div>
            </div>
            {isAuthenticated && <NotificationDropdown />}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full flex items-center justify-center bg-primary-light text-primary istui-timetable__nav-header_user-avatar"
                  >
                    {user.firstName && user.lastName
                      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                      : "U"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 istui-timetable__nav-header_user-menu"
                >
                  <DropdownMenuLabel className="istui-timetable__nav-header_user-menu_label">
                    <div className="flex flex-col space-y-1 istui-timetable__nav-header_user-menu_info">
                      <p className="text-sm font-medium leading-none istui-timetable__nav-header_user-menu_name">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground istui-timetable__nav-header_user-menu_email">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="istui-timetable__nav-header_user-menu_separator" />
                  <DropdownMenuItem
                    onClick={() => navigate("#/profile")}
                    className="istui-timetable__nav-header_user-menu_item istui-timetable__nav-header_user-menu_item-profile"
                  >
                    <User className="mr-2 h-4 w-4 istui-timetable__nav-header_user-menu_item-icon" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  {(user?.roleName === "ADMIN" || user?.roleName === "MANAGER") && (
                    <DropdownMenuItem
                      onClick={() => navigate("/settings/organization")}
                      className="istui-timetable__nav-header_user-menu_item istui-timetable__nav-header_user-menu_item-settings"
                    >
                      <Settings className="mr-2 h-4 w-4 istui-timetable__nav-header_user-menu_item-icon" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="istui-timetable__nav-header_user-menu_separator" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="istui-timetable__nav-header_user-menu_item istui-timetable__nav-header_user-menu_item-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4 istui-timetable__nav-header_user-menu_item-icon" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate("/auth")}
                className="istui-timetable__nav-header_button-secondary"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
