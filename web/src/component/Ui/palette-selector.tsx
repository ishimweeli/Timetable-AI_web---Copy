import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/util/util";
import { PopoverTrigger,Popover,PopoverContent} from "@/component/Ui/popover";
import { Button } from "@/component/Ui/button";
import { useTheme } from "@/hook/useTheme";
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { useCreateOrUpdateOrganizationUiSettingsMutation } from "@/store/Organization/ApiOrganizationUiSettings";
import { setOrganizationUiSettings } from "@/store/Organization/SliceOrganizationUiSettings";
import { ColorPalette } from "@/provider/ProviderTheme";

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
};

// Tailwind CSS color mappings
const TAILWIND_COLORS: Record<ColorPalette, { primary: string, secondary: string, accent: string }> = {
    "blue": { 
        primary: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100", 
        secondary: "text-blue-700 bg-blue-100 border-blue-300",
        accent: "text-blue-800 bg-blue-200 border-blue-400"
    },
    "cyan": { 
        primary: "text-cyan-600 bg-cyan-50 border-cyan-200 hover:bg-cyan-100", 
        secondary: "text-cyan-700 bg-cyan-100 border-cyan-300",
        accent: "text-cyan-800 bg-cyan-200 border-cyan-400"
    },
    "gray": { 
        primary: "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100", 
        secondary: "text-gray-700 bg-gray-100 border-gray-300",
        accent: "text-gray-800 bg-gray-200 border-gray-400"
    },
    "brown": { 
        primary: "text-amber-800 bg-amber-50 border-amber-200 hover:bg-amber-100", 
        secondary: "text-amber-900 bg-amber-100 border-amber-300",
        accent: "text-amber-950 bg-amber-200 border-amber-400"
    },
    "yellow": { 
        primary: "text-yellow-600 bg-yellow-50 border-yellow-200 hover:bg-yellow-100", 
        secondary: "text-yellow-700 bg-yellow-100 border-yellow-300",
        accent: "text-yellow-800 bg-yellow-200 border-yellow-400"
    },
    "magenta": { 
        primary: "text-pink-600 bg-pink-50 border-pink-200 hover:bg-pink-100", 
        secondary: "text-pink-700 bg-pink-100 border-pink-300",
        accent: "text-pink-800 bg-pink-200 border-pink-400"
    },
    "amber": { 
        primary: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100", 
        secondary: "text-amber-700 bg-amber-100 border-amber-300",
        accent: "text-amber-800 bg-amber-200 border-amber-400"
    },
    "purple": { 
        primary: "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100", 
        secondary: "text-purple-700 bg-purple-100 border-purple-300",
        accent: "text-purple-800 bg-purple-200 border-purple-400"
    },
    "navy": { 
        primary: "text-indigo-900 bg-indigo-50 border-indigo-200 hover:bg-indigo-100", 
        secondary: "text-indigo-950 bg-indigo-100 border-indigo-300",
        accent: "text-indigo-950 bg-indigo-200 border-indigo-400"
    },
    "black": { 
        primary: "text-gray-800 bg-gray-50 border-gray-200 hover:bg-gray-100", 
        secondary: "text-gray-900 bg-gray-100 border-gray-300",
        accent: "text-gray-950 bg-gray-200 border-gray-400"
    }
};

interface ColorPickerProps {
    colorName: ColorPalette;
    onChange: (colorName: ColorPalette) => void;
    disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    colorName,
    onChange,
    disabled = false,
}) => {
    const [open, setOpen] = useState(false);
    const colorValue = COLORS[colorName] || COLORS.blue;

    return (
        <Popover open={open && !disabled} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !colorName && "text-muted-foreground",
                    )}
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2">
                        <div
                            className="h-5 w-5 rounded-full border"
                            style={{ backgroundColor: colorValue }}
                        />
                        <span></span>
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
                <div className="grid grid-cols-4 gap-2">
                    {Object.entries(COLORS).map(([name, hex]) => (
                        <div
                            key={name}
                            className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full"
                            style={{ backgroundColor: hex }}
                            onClick={() => {
                                onChange(name as ColorPalette);
                                setOpen(false);
                            }}
                        >
                            {colorName === name && <Check className="h-4 w-4 text-white" />}
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export const PaletteSelector: React.FC = () => {
    const dispatch = useAppDispatch();
    const { colorPalette, setColorPalette } = useTheme();
    const [saveSettings] = useCreateOrUpdateOrganizationUiSettingsMutation();
    const orgSettings = useAppSelector((state) => state.organizationUiSettings.settings);
    const { user } = useAppSelector((state) => state.auth);
    
    // Apply Tailwind classes when the component mounts or palette changes
    useEffect(() => {
        applyTailwindPalette(colorPalette);
    }, [colorPalette]);

    const applyTailwindPalette = (name: ColorPalette) => {
        try {
            // Set data attributes for potential CSS variable access
            document.documentElement.setAttribute("data-color", name);
            document.documentElement.setAttribute("data-theme", name);
            
            // Store the selected palette in localStorage
            localStorage.setItem("colorPalette", name);
            
            // Apply primary color as a CSS variable (for compatibility with existing code)
            const primaryColor = COLORS[name];
            if(primaryColor) {
                document.documentElement.style.setProperty('--color-primary', primaryColor);
            }
            
            // Apply Tailwind classes to specific elements if needed
            // This is just an example; you may need to adjust based on your app's structure
            const primaryElements = document.querySelectorAll('.primary-theme-element');
            const secondaryElements = document.querySelectorAll('.secondary-theme-element');
            const accentElements = document.querySelectorAll('.accent-theme-element');
            
            if (TAILWIND_COLORS[name]) {
                const { primary, secondary, accent } = TAILWIND_COLORS[name];
                
                primaryElements.forEach(element => {
                    // Remove all color classes and add new ones
                    element.className = element.className
                        .replace(/text-\w+-\d+ bg-\w+-\d+ border-\w+-\d+ hover:bg-\w+-\d+/g, '')
                        .trim() + ' ' + primary;
                });
                
                secondaryElements.forEach(element => {
                    element.className = element.className
                        .replace(/text-\w+-\d+ bg-\w+-\d+ border-\w+-\d+/g, '')
                        .trim() + ' ' + secondary;
                });
                
                accentElements.forEach(element => {
                    element.className = element.className
                        .replace(/text-\w+-\d+ bg-\w+-\d+ border-\w+-\d+/g, '')
                        .trim() + ' ' + accent;
                });
            }
        } catch(error) {
            console.error(`Failed to apply Tailwind palette: ${name}`, error);
        }
    };

    const handleColorChange = async (newColorName: ColorPalette) => {
        setColorPalette(newColorName);
        applyTailwindPalette(newColorName);
        
        if(orgSettings && user?.organizationId) {
            try {
                const updatedSettings = {
                    ...orgSettings,
                    colorPalette: newColorName
                };

                dispatch(setOrganizationUiSettings(updatedSettings));
                await saveSettings(updatedSettings).unwrap();
            } catch(error) {
                console.error("Failed to update organization settings", error);
            }
        }
    };

    return (
        <div className="w-[52px]">
            <ColorPicker colorName={colorPalette} onChange={handleColorChange} />
        </div>
    );
};
