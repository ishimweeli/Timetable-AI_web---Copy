import React from "react";
import { ThemeToggle } from "@/component/Ui/theme-toggle";
import { LanguageSelector } from "@/component/Ui/language-selector";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <LanguageSelector />
      <ThemeToggle />
    </div>
  );
}
