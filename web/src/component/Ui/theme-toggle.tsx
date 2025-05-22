import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "./button";
import { useTheme } from "@/hook/useTheme";
import { cn } from "@/util/util";

interface ThemeToggleProps {
  variant?: "default" | "outline" | "icon-only";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = "default",
  size = "md",
  className,
}) => {
  const { colorScheme, toggleColorScheme } = useTheme();
  const isDark = colorScheme === "dark";

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const buttonSizes = {
    sm: "h-8 text-xs",
    md: "h-9 text-sm",
    lg: "h-10",
  };

  if(variant === "icon-only") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleColorScheme}
        className={cn("rounded-full", className)}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDark ? (
          <Sun className={iconSizes[size]} />
        ) : (
          <Moon className={iconSizes[size]} />
        )}
      </Button>
    );
  }

  if(variant === "outline") {
    return (
      <div className={cn("flex items-center bg-neutral-lightGray rounded-full p-1 w-fit", className)}>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-full p-2 transition-all duration-200 ${
            !isDark ? "bg-white text-amber shadow-sm" : "text-muted-foreground"
          }`}
          onClick={() => isDark && toggleColorScheme()}
        >
          <Sun className={iconSizes[size]} />
          <span className="sr-only">Light Mode</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-full p-2 transition-all duration-200 ${
            isDark ? "bg-sidebar text-primary shadow-sm" : "text-muted-foreground"
          }`}
          onClick={() => !isDark && toggleColorScheme()}
        >
          <Moon className={iconSizes[size]} />
          <span className="sr-only">Dark Mode</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size={size === "lg" ? "default" : size === "sm" ? "sm" : "default"}
      onClick={toggleColorScheme}
      className={cn(
        "flex items-center gap-2 transition-all duration-200",
        buttonSizes[size],
        className
      )}
    >
      {isDark ? (
        <>
          <Sun className={iconSizes[size]} />
          <span>Light Mode</span>
        </>
      ) : (
        <>
          <Moon className={iconSizes[size]} />
          <span>Dark Mode</span>
        </>
      )}
    </Button>
  );
};
