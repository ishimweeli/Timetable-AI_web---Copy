import { ColorPalette } from "@/provider/ProviderTheme";

export interface TypeOrganizationUiSettings {
  id?: number;
  organizationId: number;
  colorPalette: ColorPalette;
  font: string;
  fontSize: string;
  cellWidth: number;
  cellHeight: number;
  theme: string;
  createdDate?: string;
  modifiedDate?: string;
} 