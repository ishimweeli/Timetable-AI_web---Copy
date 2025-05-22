import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TypeOrganizationUiSettings } from "@/type/Organization/TypeOrganizationUiSettings";
import { RootState } from "@/store";

interface OrganizationUiSettingsState {
  settings: TypeOrganizationUiSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrganizationUiSettingsState = {
  settings: null,
  loading: false,
  error: null,
};

const applySettingsToDocument = (settings: TypeOrganizationUiSettings) => {
  console.log('[applySettingsToDocument] Applying settings:', settings.colorPalette, settings.theme);
  
  document.documentElement.style.setProperty("--font-family", settings.font);
  document.body.style.fontFamily = settings.font;
  
  document.documentElement.style.setProperty("--font-size", settings.fontSize);
  document.body.style.fontSize = settings.fontSize;
  
  document.documentElement.style.setProperty("--cell-width", `${settings.cellWidth}px`);
  document.documentElement.style.setProperty("--cell-height", `${settings.cellHeight}px`);
  
  if(settings.theme === "dark") {
    document.documentElement.classList.add("dark");
  }else {
    document.documentElement.classList.remove("dark");
  }

  document.documentElement.setAttribute("data-color", settings.colorPalette);
  document.documentElement.setAttribute("data-theme", settings.colorPalette);
  
  try {
    const linkId = 'dynamic-palette-stylesheet';
    let styleLink = document.getElementById(linkId) as HTMLLinkElement;
    
    if(!styleLink) {
      styleLink = document.createElement('link');
      styleLink.id = linkId;
      styleLink.rel = 'stylesheet';
      document.head.appendChild(styleLink);
    }
    
    const newHref = `/styles/palettes/pallete-${settings.colorPalette}.css`;
    if(styleLink.href !== newHref) {
        console.log(`[applySettingsToDocument] Updating palette CSS href to: ${newHref}`);
        styleLink.href = newHref;
    }else {
        console.log(`[applySettingsToDocument] Palette CSS href already set to: ${newHref}`);
    }

  }catch(error) {
    console.error(`[applySettingsToDocument] Failed to load palette CSS: ${settings.colorPalette}`, error);
  }
};

export const organizationUiSettingsSlice = createSlice({
  name: "organizationUiSettings",
  initialState,
  reducers: {
    setOrganizationUiSettings: (
      state,
      action: PayloadAction<TypeOrganizationUiSettings>
    ) => {
      state.settings = action.payload;
      
      localStorage.setItem(
        "organizationUiSettings",
        JSON.stringify(action.payload)
      );
      
      applySettingsToDocument(action.payload);
    },
    
    loadStoredSettings: (state) => {
      const storedSettings = localStorage.getItem("organizationUiSettings");
      if(storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        state.settings = parsedSettings;
        
        applySettingsToDocument(parsedSettings);
      }
    },
    
    resetOrganizationUiSettings: (state) => {
      const organizationId = state.settings?.organizationId || 0;
      
      const defaultSettings: TypeOrganizationUiSettings = {
        organizationId,
        colorPalette: "blue",
        font: "Inter",
        fontSize: "16px",
        cellWidth: 120,
        cellHeight: 40,
        theme: "light"
      };
      
      applySettingsToDocument(defaultSettings);
      
      state.settings = defaultSettings;
      
      localStorage.setItem(
        "organizationUiSettings",
        JSON.stringify(defaultSettings)
      );
    },
  },
});

export const {
  setOrganizationUiSettings,
  loadStoredSettings,
  resetOrganizationUiSettings,
} = organizationUiSettingsSlice.actions;

export const selectOrganizationUiSettings = (state: RootState) => 
  state.organizationUiSettings.settings;

export default organizationUiSettingsSlice.reducer; 
