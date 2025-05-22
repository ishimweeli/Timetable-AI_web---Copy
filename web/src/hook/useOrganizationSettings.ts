import { useAppSelector, useAppDispatch } from "./useAppRedux";
import { 
  useCreateOrUpdateOrganizationUiSettingsMutation
} from "@/store/Organization/ApiOrganizationUiSettings";
import { setOrganizationUiSettings } from "@/store/Organization/SliceOrganizationUiSettings";
import { TypeOrganizationUiSettings } from "@/type/Organization/TypeOrganizationUiSettings";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ColorPalette } from "@/provider/ProviderTheme";

const hexToHSL = (hex: string): string => {
  hex = hex.replace(/^#/, '');

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if(max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h = Math.round(h * 60);
  }
  
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
};

export const useOrganizationSettings = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.organizationUiSettings.settings);
  const { user } = useAppSelector((state) => state.auth);
  const [saveSettings, { isLoading: isSaving }] = useCreateOrUpdateOrganizationUiSettingsMutation();
  
  const [originalSidebarColor, setOriginalSidebarColor] = useState<string | null>(null);

  useEffect(() => {
    if(!originalSidebarColor) {
      const sidebar = document.querySelector('.istui-timetable__nav-sidebar');
      if(sidebar) {
        const sidebarColor = window.getComputedStyle(sidebar).backgroundColor;
        setOriginalSidebarColor(sidebarColor);
        
        localStorage.setItem('originalSidebarColor', sidebarColor);
      }else {
        const storedColor = localStorage.getItem('originalSidebarColor');
        if(storedColor) {
          setOriginalSidebarColor(storedColor);
        }
      }
    }
  }, [originalSidebarColor]);

  const updateSettings = async (newSettings: Partial<TypeOrganizationUiSettings>) => {
    if(!settings || !user?.organizationId) return false;
    
    try {
      if(!newSettings.organizationId) {
        console.error("Cannot update settings: Missing organizationId in settings object");
        toast.error("Missing organization ID in settings");
        return false;
      }
      
      const organizationId = newSettings.organizationId;
      console.log(`[useOrganizationSettings] updateSettings - Saving settings for org ID: ${organizationId}`, newSettings);
      
      const updatedSettings: TypeOrganizationUiSettings = {
        ...settings,
        ...newSettings,
        organizationId, 
      };
      
      console.log(`[useOrganizationSettings] updateSettings - Merged settings:`, updatedSettings);
      
      if(organizationId === Number(user.organizationId)) {
        dispatch(setOrganizationUiSettings(updatedSettings));
      }
      
      if(updatedSettings.colorPalette) {
        const persistKey = `org_palette_${organizationId}`;
        localStorage.setItem(persistKey, updatedSettings.colorPalette);        
        applyColorPalette(updatedSettings.colorPalette);
      }
      
      try {
        const response = await saveSettings(updatedSettings).unwrap();
        
        if(response.data) {
          toast.success("Settings updated successfully");
          return true;
        }
      }catch(serverError) {
        console.error("Failed to save settings to server, but they are saved locally", serverError);
        toast.warning("Settings saved locally. Some settings may not persist across devices.");
        return true;
      }
      
      return false;
    }catch(error) {
      console.error("Failed to update settings", error);
      toast.error("Failed to update settings");
      return false;
    }
  };

  const applyTheme = (theme: string) => {
    if(theme === "dark") {
      document.documentElement.classList.add("dark");
    }else {
      document.documentElement.classList.remove("dark");
    }
    
    const sidebar = document.querySelector('.istui-timetable__nav-sidebar');
    if(sidebar) {
      sidebar.classList.remove('theme-applied');
      setTimeout(() => {
        sidebar.classList.add('theme-applied');
      }, 10);
    }
    
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      if(button.classList.contains('bg-primary')) {
        button.classList.remove('theme-applied');
        setTimeout(() => {
          button.classList.add('theme-applied');
        }, 10);
      }
    });
  };

  const applyColorPalette = (colorPalette: ColorPalette) => {
    document.documentElement.setAttribute("data-color", colorPalette);
    document.documentElement.setAttribute("data-theme", colorPalette);
    
   
    try {
      const linkId = 'dynamic-palette-stylesheet';
      let styleLink = document.getElementById(linkId) as HTMLLinkElement;
      
      if(!styleLink) {
        styleLink = document.createElement('link');
        styleLink.id = linkId;
        styleLink.rel = 'stylesheet';
        document.head.appendChild(styleLink);
      }
      
      styleLink.href = `/styles/palettes/pallete-${colorPalette}.css`;
      
    }catch(error) {
      console.error(`Failed to load palette: ${colorPalette}`, error);
    }
    
    const sidebar = document.querySelector('.istui-timetable__nav-sidebar');
    if(sidebar) {
      sidebar.classList.remove('palette-applied');
      setTimeout(() => {
        sidebar.classList.add('palette-applied');
      }, 10);
    }
    
    document.querySelectorAll('.istui-timetable__sidebar_link, .istui-timetable__sidebar_icon, .istui-timetable__sidebar_label, .istui-timetable__sidebar_item_container, .istui-timetable__nav-sidebar').forEach(element => {
      element.classList.remove('palette-applied');
      setTimeout(() => {
        element.classList.add('palette-applied');
        
        if(element.classList.contains('istui-timetable__nav-sidebar')) {
          (element as HTMLElement).style.setProperty('--sidebar-primary', `var(--${colorPalette})`);
        }
      }, 20);
    });
    
    const primaryElements = document.querySelectorAll('[class*="bg-primary"], [class*="text-primary"], [class*="border-primary"]');
    primaryElements.forEach(element => {
      element.classList.remove('palette-applied');
      setTimeout(() => {
        element.classList.add('palette-applied');
      }, 10);
    });
    
    document.body.style.opacity = '0.99';
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 50);
  };

  const applyFontFamily = (fontFamily: string) => {
    document.documentElement.style.setProperty("--font-family", fontFamily);
    document.body.style.fontFamily = fontFamily;
  };

  const applyFontSize = (fontSize: string) => {
    document.documentElement.style.setProperty("--font-size", fontSize);
    document.body.style.fontSize = fontSize;
  };

  const applyCellDimensions = (width: number, height: number) => {
    document.documentElement.style.setProperty("--cell-width", `${width}px`);
    document.documentElement.style.setProperty("--cell-height", `${height}px`);
    
    const cells = document.querySelectorAll('.w-cell, .h-cell');
    cells.forEach(cell => {
      cell.classList.remove('dimensions-applied');
      setTimeout(() => {
        cell.classList.add('dimensions-applied');
      }, 10);
    });
  };
  
  const applyAllSettings = () => {
    if(settings) {
      applyTheme(settings.theme);
      applyColorPalette(settings.colorPalette);
      applyFontFamily(settings.font);
      applyFontSize(settings.fontSize);
      applyCellDimensions(settings.cellWidth, settings.cellHeight);
      
      localStorage.setItem("organizationUiSettings", JSON.stringify(settings));
    }
  };

  const getOrganizationSettings = async (organizationId: number): Promise<TypeOrganizationUiSettings | null> => {
    try {
      if(user?.organizationId && Number(user.organizationId) === organizationId && settings) {
        return {
          ...settings,
          organizationId 
        };
      }
      
      const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';
      const token = localStorage.getItem('authToken');
      
      if(!token) {
        toast.error("Authentication required");
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${apiUrl}/settings/organization/${organizationId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      
      if(!response.ok) {
        throw new Error(`Failed to fetch organization settings: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if(data.data) {
        return {
          ...data.data,
          organizationId 
        };
      }
      
      return {
        organizationId,
        colorPalette: "cyan" as ColorPalette,
        font: "Inter",
        fontSize: "16px",
        cellWidth: 120,
        cellHeight: 40,
        theme: "light"
      };
    }catch(error) {      
      return {
        organizationId,
        colorPalette: "cyan" as ColorPalette,
        font: "Inter",
        fontSize: "16px",
        cellWidth: 120,
        cellHeight: 40,
        theme: "light"
      };
    }
  };

  useEffect(() => {
    if(settings && settings.organizationId) {
      const orgId = settings.organizationId;
      const persistKey = `org_palette_${orgId}`;
      const savedPalette = localStorage.getItem(persistKey) as ColorPalette | null;
     
      if(savedPalette && settings.colorPalette !== savedPalette) {

        const updatedSettings = {
          ...settings,
          colorPalette: savedPalette
        };
        
        applyColorPalette(savedPalette);
        dispatch(setOrganizationUiSettings(updatedSettings));
        
        saveSettings(updatedSettings).catch(error => {
          console.error("Failed to sync localStorage palette with server", error);
        });
      } else if(settings.colorPalette) {
        applyColorPalette(settings.colorPalette);
        localStorage.setItem(persistKey, settings.colorPalette);
      }else {
        console.log(`[useOrganizationSettings] Initialization - No palette found in settings or localStorage, using default`);
      }
    }
  }, [settings, dispatch, saveSettings]); 

  return {
    settings,
    updateSettings,
    isSaving,
    applyTheme,
    applyColorPalette,
    applyFontFamily,
    applyFontSize,
    applyCellDimensions,
    applyAllSettings,
    originalSidebarColor,
    getOrganizationSettings
  };
};
