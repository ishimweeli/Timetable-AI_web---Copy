import React, { useEffect, useState, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { TypeOrganizationUiSettings } from "@/type/Organization/TypeOrganizationUiSettings";
import { useOrganizationSettings } from "@/hook/useOrganizationSettings";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/component/Ui/card";
import { Label } from "@/component/Ui/label";
import { Button } from "@/component/Ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/Ui/select";
import { Slider } from "@/component/Ui/slider";
import { toast } from "sonner";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import { Eye,Undo2 } from "lucide-react";
import { ThemeToggle } from "@/component/Ui/theme-toggle";
import { OrganizationSelector } from "@/component/Organization/OrganizationSelector";
import { Badge } from "@/component/Ui/badge";
import { setOrganizationUiSettings } from "@/store/Organization/SliceOrganizationUiSettings";
import { ColorPalette } from "@/provider/ProviderTheme";
import { useI18n } from "@/hook/useI18n";

const FONTS = [
  "Inter",
  "Arial",
  "Roboto",
  "Open Sans",
  "Helvetica",
  "Times New Roman",
  "Georgia",
];

const FONT_SIZES = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
];

const COLORS: Record<ColorPalette, string> = {
  "blue": "#3538CD",
  "cyan": "#42A5C5",
  "gray": "#808080",
  "brown": "#8B4513",
  "yellow": "#E87F3A",
  "magenta": "#D64C93",
  "amber": "#E9B539",
  "purple": "#9D61E3",
  "navy": "#000080",
  "black": "#000000",
  "indigo": "#4B0082",
  "teal": "#008080"
};

const COLOR_PALETTES: ColorPalette[] = Object.keys(COLORS) as ColorPalette[];

const PageOrganizationSettings = () => {
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { t } = useI18n();

  const userSettingsFromStore = useAppSelector(state => state.organizationUiSettings.settings);

  const {
    updateSettings: saveSettingsMutation,
    isSaving,
    getOrganizationSettings,
    applyColorPalette 
  } = useOrganizationSettings();

  const currentUserOrgId = user?.organizationId ? Number(user.organizationId) : null;
  const isAdmin = user?.roleId === 1;
  
  const [editingSettings, setEditingSettings] = useState<TypeOrganizationUiSettings | null>(null);
  const editingSettingsRef = useRef(editingSettings);
  useEffect(() => {
    editingSettingsRef.current = editingSettings;
  }, [editingSettings]);
  
  const [adminTargetOrgId, setAdminTargetOrgId] = useState<number | null>(currentUserOrgId);
  const displayedOrgId = isAdmin ? adminTargetOrgId : currentUserOrgId;
  const isPreviewingOtherOrg = isAdmin && adminTargetOrgId !== currentUserOrgId;

  useEffect(() => {
    if(!displayedOrgId) return;

    if(displayedOrgId === currentUserOrgId) {
      if(userSettingsFromStore && userSettingsFromStore.organizationId === currentUserOrgId) {
         if(
           !editingSettings || 
           editingSettings.organizationId !== userSettingsFromStore.organizationId
         ) {
            setEditingSettings(userSettingsFromStore);
         }
      }else {
        getOrganizationSettings(currentUserOrgId)
          .then(fetchedSettings => {
            if(fetchedSettings) {
              const updatedSettings = {
                ...fetchedSettings,
                organizationId: currentUserOrgId 
              };
              dispatch(setOrganizationUiSettings(updatedSettings)); 
              setEditingSettings(updatedSettings);
            }
          })
          .catch(err => console.error("Error fetching user's own settings", err));
      }
    } else if(isAdmin) {
      if(!editingSettings || editingSettings.organizationId !== displayedOrgId) {
        getOrganizationSettings(displayedOrgId)
          .then(fetchedSettings => {
            if(fetchedSettings) {
              const updatedSettings = {
                ...fetchedSettings,
                organizationId: displayedOrgId 
              };
              setEditingSettings(updatedSettings); 
            }
          })
          .catch(error => {
            console.error(`Failed to fetch preview settings for org ${displayedOrgId}`, error);
            toast.error("Failed to load settings for the selected organization");
          });
      }
    }
  }, [displayedOrgId, currentUserOrgId, isAdmin, userSettingsFromStore, getOrganizationSettings, dispatch, editingSettings]); // Added editingSettings to dependencies for the optimization check

  const handleAdminOrgSelectionChange = (organizationId: number) => {
    if(!isAdmin) return;
    if(organizationId === adminTargetOrgId) return;
    
    setAdminTargetOrgId(organizationId);
    if(organizationId !== currentUserOrgId) {
      toast.info(`Previewing settings for organization ID: ${organizationId}`);
    }else {
      toast.info("Viewing your organization's settings");
    }
  };

  const handleChange = (field: keyof TypeOrganizationUiSettings, value: any) => {
    if(!editingSettings) return;
    if(editingSettings[field] === value) return;
    setEditingSettings(prev => {
      if(!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const handleColorPaletteChange = (color: ColorPalette) => {
    console.log(`[Page] Changing color palette to: ${color}`);
    
    if(!editingSettings || !displayedOrgId) {
      toast.error("Cannot update settings: no organization selected");
      return;
    }
    
    setEditingSettings(prev => {
      if(!prev) return null;
      const updatedSettings = { ...prev, colorPalette: color };
      console.log("[Page] Updated local settings:", updatedSettings);
      return updatedSettings;
    });
    
    applyColorPalette(color);
    
    setTimeout(() => {
      const selectedColorElement = document.querySelector(`button[title="${color}"]`);
      if(selectedColorElement) {
        const allButtons = document.querySelectorAll('button[title]');
        allButtons.forEach(btn => btn.classList.remove('ring-2', 'ring-primary'));
        selectedColorElement.classList.add('ring-2', 'ring-primary');
        
        const selectedText = document.querySelector('strong');
        if(selectedText) {
          selectedText.textContent = color;
        }
      }
      
      toast.info("Color updated. Click 'Save Settings' to make changes permanent.");
    }, 10);
    
  };

  const handleSave = async () => {
    const currentSettings = editingSettingsRef.current;
    if(!currentSettings) {
      toast.error("Cannot save: Settings not loaded.");
      return;
    }
    if(currentSettings.organizationId !== displayedOrgId) {
      toast.error("Save error: Data mismatch. Please refresh.");
      return;
    }
    const settingsToSave = {
      ...currentSettings,
      organizationId: displayedOrgId
    };
    await saveSettingsMutation(settingsToSave);
  };

  const handleResetToDefaults = () => {
    if(!displayedOrgId) return;

    console.log(`[Page] Resetting LOCAL editing settings for org ${displayedOrgId} to defaults.`);
    const defaultSettings: TypeOrganizationUiSettings = {
      organizationId: displayedOrgId,
      colorPalette: "cyan" as ColorPalette,
      font: "Inter",
      fontSize: "16px",
      cellWidth: 120,
      cellHeight: 40,
      theme: "light"
    };
    
    setEditingSettings(defaultSettings);
    toast.info("Settings reset to defaults locally (click Save to persist)");
  };
  
  if(!editingSettings) {
      return (
          <div className="flex h-screen">
            <div className="flex-1 flex flex-col overflow-hidden">
              <main className="flex-1 flex items-center justify-center">
                {t("organization.settings.loading")}
              </main>
            </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto bg-background text-foreground font-ui text-ui">
          <div className="container mx-auto py-6">
            <Breadcrumbs
              items={[
                { label: t("navigation.settings"), href: "/dashboard" },
                { label: t("navigation.organizationSettings"), href: "" },
              ]}
            />
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">
                  {t("organization.settings.title")}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {t("organization.settings.subtitle")}
                  {isAdmin && t("organization.settings.adminSubtitle")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleResetToDefaults}
                  className="flex items-center gap-2"
                  disabled={!editingSettings}
                >
                  <Undo2 className="h-4 w-4" />
                  {t("organization.settings.resetToDefaults")}
                </Button>
                <Button onClick={handleSave} disabled={isSaving || !editingSettings}>
                  {isSaving ? t("common.saving") : t("common.updateAll")}
                </Button>
              </div>
            </div>
            
            {isAdmin && (
              <div className="mb-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>{t("organization.settings.selectOrgToEdit")}</CardTitle> 
                      {isPreviewingOtherOrg && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {t("organization.settings.previewingOrg", { id: String(displayedOrgId) })}
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {t("organization.settings.selectOrgToEditDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <OrganizationSelector 
                      onOrganizationChange={handleAdminOrgSelectionChange}
                      selectedOrganizationId={adminTargetOrgId || undefined}
                      className="w-full max-w-md"
                    />
                  </CardContent>
                </Card>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>{t("organization.settings.themeSettings")}</CardTitle>
                  <CardDescription>{t("organization.settings.themeSettingsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-col items-start space-y-2 mr-10">
                      <Label>{t("organization.settings.theme")}</Label>
                      <ThemeToggle variant="outline" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colorPalette">{t("organization.settings.colorPalette")}</Label>
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        {COLOR_PALETTES.map(color => (
                          <button 
                            key={color}
                            type="button"
                            className={`p-2 border rounded flex items-center justify-between ${editingSettings.colorPalette === color ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => handleColorPaletteChange(color)}
                            title={color}
                            style={{ minWidth: "80px" }}
                          >
                            <div 
                              className="w-6 h-6 rounded-full" 
                              style={{ backgroundColor: COLORS[color] }}
                            />
                            <span className="text-xs ml-1">{color}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {t("organization.settings.selectedColor", { color: editingSettings.colorPalette })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-background">
                <CardHeader>
                  <CardTitle>{t("organization.settings.typography")}</CardTitle>
                  <CardDescription>{t("organization.settings.typographyDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="font">{t("organization.settings.fontFamily")}</Label>
                    <Select 
                      value={editingSettings.font} 
                      onValueChange={(value) => handleChange("font", value)}
                    >
                      <SelectTrigger id="font">
                        <SelectValue placeholder={t("organization.settings.fontFamily")}/>
                      </SelectTrigger>
                      <SelectContent>
                        {FONTS.map((font) => (
                          <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">{t("organization.settings.fontSize")}</Label>
                    <Select 
                      value={editingSettings.fontSize} 
                      onValueChange={(value) => handleChange("fontSize", value)}
                    >
                      <SelectTrigger id="fontSize">
                        <SelectValue placeholder={t("organization.settings.fontSize")}/>
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background md:col-span-1">
                <CardHeader>
                  <CardTitle>{t("organization.settings.timetableCells")}</CardTitle>
                  <CardDescription>{t("organization.settings.timetableCellsDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="cellWidth">{t("organization.settings.cellWidth", { width: String(editingSettings.cellWidth) })}</Label>
                    <Slider
                      id="cellWidth"
                      min={60}
                      max={200}
                      step={10}
                      value={[editingSettings.cellWidth]}
                      onValueChange={(value) => handleChange("cellWidth", value[0])}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cellHeight">{t("organization.settings.cellHeight", { height: String(editingSettings.cellHeight) })}</Label>
                    <Slider
                      id="cellHeight"
                      min={20}
                      max={80}
                      step={5}
                      value={[editingSettings.cellHeight]}
                      onValueChange={(value) => handleChange("cellHeight", value[0])}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-background md:col-span-1">
                <CardHeader>
                  <CardTitle>{t("organization.settings.preview")}</CardTitle>
                  <CardDescription>{t("organization.settings.previewDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className={`border rounded-md p-4 transition-all duration-200 ${editingSettings.theme === "dark" ? "bg-card text-card-foreground" : "bg-background text-foreground"}`}
                    style={{ fontFamily: editingSettings.font, fontSize: editingSettings.fontSize }}
                  >
                    <h3 className="text-xl font-semibold mb-2 text-primary">
                      {t("organization.settings.previewHeading")}
                    </h3>
                    <p className="mb-4">{t("organization.settings.previewText")}</p>
                    <div className="grid grid-cols-3 gap-2">
                       <Button variant="default" size="sm" style={{ height: `${editingSettings.cellHeight}px`, width: `${editingSettings.cellWidth}px` }}>
                         {t("organization.settings.previewButton")}
                       </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-xs text-muted-foreground">
                    {isAdmin 
                      ? isPreviewingOtherOrg 
                        ? t("organization.settings.previewAdminOther")
                        : t("organization.settings.previewAdminOwn")
                      : t("organization.settings.previewUser")
                    }
                  </p>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageOrganizationSettings; 
