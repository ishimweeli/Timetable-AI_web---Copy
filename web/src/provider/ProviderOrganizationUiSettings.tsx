import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hook/useAppRedux";
import { useGetOrganizationUiSettingsQuery } from "@/store/Organization/ApiOrganizationUiSettings";
import { setOrganizationUiSettings, loadStoredSettings } from "@/store/Organization/SliceOrganizationUiSettings";

const captureSidebarColor = () => {
  const storedColor = localStorage.getItem('originalSidebarColor');
  if(storedColor) {
    return;
  }
  
  setTimeout(() => {
    const sidebar = document.querySelector('.istui-timetable__nav-sidebar');
    if(sidebar) {
      const sidebarColor = window.getComputedStyle(sidebar).backgroundColor;
      localStorage.setItem('originalSidebarColor', sidebarColor);
    }
  }, 500);
};

export const ProviderOrganizationUiSettings: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [initialFetchAttempted, setInitialFetchAttempted] = useState(false);

  useEffect(() => {
    captureSidebarColor();
  }, []);
  
  const organizationId = user?.organizationId ? Number(user.organizationId) : 0;
  const { data, isSuccess, isError, isLoading } = useGetOrganizationUiSettingsQuery(organizationId, {
    skip: !organizationId, 
  });

  useEffect(() => {
    if(isLoading || !organizationId) {
        return; 
    }

    setInitialFetchAttempted(true);

    if(isSuccess && data?.data) {
      console.log("[Provider] Initial fetch successful. Dispatching server settings.");
      dispatch(setOrganizationUiSettings(data.data));
    } else if(isError) {
      console.error("[Provider] Initial fetch failed. Attempting to load from localStorage.");
      try {
          const storedSettingsJson = localStorage.getItem("organizationUiSettings");
          if(storedSettingsJson) {
              dispatch(loadStoredSettings()); 
          } 
      }catch(storageError) {
          console.error("[Provider] Failed to load settings from localStorage during fallback", storageError);
      }
    } else if(!isLoading && !data?.data) {
        console.log("[Provider] Fetch finished but no data returned. Consider setting defaults.");
    }
    
  }, [isSuccess, isError, isLoading, data, dispatch, organizationId]); 
  return <>{children}</>;
}; 
