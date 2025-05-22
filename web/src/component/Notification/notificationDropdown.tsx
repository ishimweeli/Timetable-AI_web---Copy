import React from "react";
import { Bell } from "lucide-react";
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
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { useGetUserNotificationsQuery, useGetUnreadCountQuery, useMarkAsReadMutation, useGetUserUnreadNotificationsQuery } from "@/services/Notification/ApiNotification";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { setUnreadCount } from "@/store/Notification/SliceNotification";

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [markAsRead] = useMarkAsReadMutation();
  
  const { data: unreadNotificationsData, refetch: refetchUnreadNotifications } = useGetUserUnreadNotificationsQuery(
    { userUuid: user?.uuid || "", unreadOnly: true },
    { skip: !user?.uuid, pollingInterval: 5000 }
  );
  
  const { data: unreadCountData, refetch: refetchUnreadCount } = useGetUnreadCountQuery(
    user?.uuid || "",
    { skip: !user?.uuid, pollingInterval: 5000 }
  );
  
  const unreadCount = unreadCountData?.data || 0;
  const unreadNotifications = unreadNotificationsData?.data || [];
  
  React.useEffect(() => {
    if (unreadCountData?.data !== undefined) {
      dispatch(setUnreadCount(unreadCountData.data));
    }
  }, [unreadCountData?.data, dispatch]);
  
  React.useEffect(() => {
    if (user?.uuid) {
      refetchUnreadCount();
      refetchUnreadNotifications();
    }
  }, [user?.uuid, refetchUnreadCount, refetchUnreadNotifications]);
  
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId).unwrap();
      refetchUnreadCount();
      refetchUnreadNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };
  
  const handleViewAll = () => {
    navigate("/notifications");
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative istui-timetable__nav-header_button istui-timetable__nav-header_button-notification"
        >
          <Bell className="h-5 w-5 istui-timetable__nav-header_button-icon" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 istui-timetable__nav-header_notification-badge">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 istui-timetable__notification-dropdown">
        <DropdownMenuLabel className="istui-timetable__notification-dropdown_label">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="istui-timetable__notification-dropdown_separator" />
        
        {unreadNotifications.length === 0 ? (
          <div className="py-4 px-2 text-center text-muted-foreground">
            No unread notifications
          </div>
        ) : (
          <>
            {unreadNotifications.slice(0, 3).map((notification) => (
              <DropdownMenuItem
                key={notification.uuid}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                onClick={() => handleMarkAsRead(notification.notificationId)}
              >
                <div className="flex justify-between w-full">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(notification.createdDate), 'MMM d, h:mm a')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))}
          </>
        )}
        
        <DropdownMenuSeparator className="istui-timetable__notification-dropdown_separator" />
        <DropdownMenuItem 
          className="text-center text-primary cursor-pointer py-2"
          onClick={handleViewAll}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;