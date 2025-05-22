import React, { createContext, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { setOrganizationUiSettings } from "@/store/Organization/SliceOrganizationUiSettings";
import { useCreateOrUpdateOrganizationUiSettingsMutation } from "@/store/Organization/ApiOrganizationUiSettings";

type ColorScheme = "light" | "dark";
export type ColorPalette =
  | "blue"
  | "cyan" 
  | "gray"
  | "brown"
  | "yellow"
  | "magenta"
  | "amber"
  | "purple"
  | "navy"
  | "black"
  | "indigo"
  | "teal";

interface ThemeContextType {
  colorScheme: ColorScheme;
  colorPalette: ColorPalette;
  toggleColorScheme: () => void;
  setColorPalette: (palette: ColorPalette) => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

const DEFAULT_SCHEME: ColorScheme = "light";
const DEFAULT_PALETTE: ColorPalette = "blue";

export const ProviderTheme: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();
  const organizationSettings = useAppSelector(state => state.organizationUiSettings.settings);
  const { user } = useAppSelector(state => state.auth);
  const [saveSettings] = useCreateOrUpdateOrganizationUiSettingsMutation();

  const currentScheme = (organizationSettings?.theme as ColorScheme) || DEFAULT_SCHEME;
  const currentPalette = (organizationSettings?.colorPalette as ColorPalette) || DEFAULT_PALETTE;


  useEffect(() => {
    console.log("[Theme Provider] Applying styles based on derived settings:", currentScheme, currentPalette);
    if(currentScheme === "dark") {
      document.documentElement.classList.add("dark");
    }else {
      document.documentElement.classList.remove("dark");
    }
  
  }, [currentScheme, currentPalette]); 
  
  const toggleColorScheme = () => {
    if(!organizationSettings) return;
    const newScheme = currentScheme === "light" ? "dark" : "light";
    const updatedSettings = { ...organizationSettings, theme: newScheme };
    dispatch(setOrganizationUiSettings(updatedSettings));
    saveSettings(updatedSettings).catch(error => {
      console.error("[Theme Provider] Failed to save toggled scheme", error);
    });
  };

  const setColorPalette = (palette: ColorPalette) => {
    if(!organizationSettings) return;
    if(palette === currentPalette) return;
    const updatedSettings = { ...organizationSettings, colorPalette: palette };
    dispatch(setOrganizationUiSettings(updatedSettings));
    saveSettings(updatedSettings).catch(error => {
      console.error("[Theme Provider] Failed to save new palette", error);
    });
  };

  const value = {
    colorScheme: currentScheme,
    colorPalette: currentPalette,
    toggleColorScheme,
    setColorPalette,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
