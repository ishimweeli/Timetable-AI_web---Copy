import React, { useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { useGetUnreadCountQuery } from "@/services/Notification/ApiNotification";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { refetch: refetchNotifications } = useGetUnreadCountQuery(
    user?.uuid || "",
    { skip: !user?.uuid }
  );

  useEffect(() => {
    if (user?.uuid) {
      refetchNotifications();
    }
  }, [user?.uuid, refetchNotifications]);

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-background-main">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 