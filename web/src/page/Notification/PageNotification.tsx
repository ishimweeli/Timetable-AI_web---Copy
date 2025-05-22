import React, { useState } from "react";
import { useAppSelector } from "@/hook/useAppRedux";
import { useGetUserNotificationsQuery, useMarkAsReadMutation } from "@/services/Notification/ApiNotification";
import { format } from "date-fns";
import { Button } from "@/component/Ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/component/Ui/card";
import { Check, Bell, CheckSquare, Square, Trash } from "lucide-react";
import { Checkbox } from "@/component/Ui/checkbox";
import { ScrollArea } from "@/component/Ui/scroll-area";

const PageNotification = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("all");
  const [markAsRead] = useMarkAsReadMutation();
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  
  const { data: allNotificationsData, refetch: refetchAllNotifications } = useGetUserNotificationsQuery(
    { userUuid: user?.uuid || "", unreadOnly: false },
    { skip: !user?.uuid }
  );
  
  const { data: unreadNotificationsData, refetch: refetchUnreadNotifications } = useGetUserNotificationsQuery(
    { userUuid: user?.uuid || "", unreadOnly: true },
    { skip: !user?.uuid }
  );
  
  const allNotifications = allNotificationsData?.data || [];
  const unreadNotifications = unreadNotificationsData?.data || [];
  const readNotifications = allNotifications.filter(notification => notification.isRead);
  
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId).unwrap();
      refetchAllNotifications();
      refetchUnreadNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };
  
  const handleToggleSelect = (notificationId: number) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };
  
  const handleSelectAll = (notifications: any[]) => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.notificationId));
    }
  };
  
  const handleMarkSelectedAsRead = async () => {
    try {
      for (const notificationId of selectedNotifications) {
        await markAsRead(notificationId).unwrap();
      }
      setSelectedNotifications([]);
      refetchAllNotifications();
      refetchUnreadNotifications();
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };
  
  const getCurrentTabNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return unreadNotifications;
      case 'read':
        return readNotifications;
      default:
        return allNotifications;
    }
  };
  
  const renderNotificationList = (notifications: any[]) => {
    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No notifications to display</p>
        </div>
      );
    }
    
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="select-all"
              checked={selectedNotifications.length === notifications.length && notifications.length > 0}
              onCheckedChange={() => handleSelectAll(notifications)}
            />
            <label htmlFor="select-all" className="text-sm cursor-pointer">
              Select All
            </label>
          </div>
          
          {selectedNotifications.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
              onClick={handleMarkSelectedAsRead}
            >
              <Check className="h-4 w-4" />
              Mark {selectedNotifications.length} as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.uuid} className={!notification.isRead ? "border-primary/50" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={selectedNotifications.includes(notification.notificationId)}
                        onCheckedChange={() => handleToggleSelect(notification.notificationId)}
                      />
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(notification.createdDate), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <CardDescription>
                    {notification.type}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{notification.message}</p>
                  {!notification.isRead && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => handleMarkAsRead(notification.notificationId)}
                    >
                      <Check className="h-4 w-4" />
                      Mark as read
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </>
    );
  };
  
  return (
    <div className="container py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            All
            {allNotifications.length > 0 && (
              <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                {allNotifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadNotifications.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {unreadNotifications.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="read">
            Read
            {readNotifications.length > 0 && (
              <span className="ml-2 bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                {readNotifications.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderNotificationList(allNotifications)}
        </TabsContent>
        
        <TabsContent value="unread">
          {renderNotificationList(unreadNotifications)}
        </TabsContent>
        
        <TabsContent value="read">
          {renderNotificationList(readNotifications)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PageNotification;