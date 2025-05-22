import { LucideIcon } from "lucide-react";

/**
 * Interface for menu items in the sidebar
 */
export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  
  /** Translation key for the menu item label */
  label: string;
  
  /** URL path for the menu item (if it's a link) */
  path?: string;
  
  /** Icon component to display next to the menu item */
  icon: LucideIcon;
  
  /** Whether this is a root-level menu item */
  isRoot?: boolean;
  
  /** Child menu items (for dropdown menus) */
  children?: MenuItem[];
}
