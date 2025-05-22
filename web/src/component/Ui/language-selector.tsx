import React from "react";
import { Check, Globe } from "lucide-react";
import { Button } from "@/component/Ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/component/Ui/dropdown-menu";
import { useI18n } from "@/hook/useI18n";
import { Languages } from "@/i18n";

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" },
  { id: "sv", label: "Svenska" },
  { id: "da", label: "Dansk" },
  { id: "no", label: "norsk" },
  { id: "pl", label: "polski" },
  { id: "rw", label: "Kinyarwanda" },
] as const;

export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map((language) => (
          <DropdownMenuItem
            key={language.id}
            onClick={() => setLanguage(language.id as Languages)}
          >
            {language.label}
            {currentLanguage === language.id && (
              <Check className="ml-auto h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
