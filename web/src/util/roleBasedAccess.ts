import { MenuItem } from "@/type/Menu/TypeMenu";


export const filterMenuItemsByRole = (
  menuItems: MenuItem[],
  role?: string
): MenuItem[] => {
  if(!role) {
    return [];
  }


  const roleBasedAccess: Record<string, string[]> = {
    ADMIN: [
      "dashboard",
      "resources",
      "schedule",
      "calendar",
      "organizations",
      "classes",
      "classBands",
      "teachers",
      "students",
      "subjects",
      "rooms",
      "managers",
      "rules",
      "periods",
      "timetable",
      "timetableLock",
      "bindings",
      "planSettings",
      "organizationSettings",
      "manualScheduling",
      "locationChangeSettings",
    ],
    MANAGER: [
      "dashboard",
      "resources",
      "schedule",
      "calendar",
      "organizations",
      "classes",
      "classBands",
      "teachers",
      "students",
      "subjects",
      "rooms",
      "managers",
      "rules",
      "periods",
      "bindings",
      "timetable",
      "timetableLock",
      "planSettings",
      "organizationSettings",
      "manualScheduling",
      "locationChangeSettings",
    ],
    TEACHER: [
      "dashboard", 
      "teacherProfile", 
      "schedule", 
      "timetable"
    ],
    STUDENT: [
      "dashboard", 
      "studentProfile", 
      "schedule", 
      "timetable"
    ],
  };


  const allowedIds = roleBasedAccess[role] || [];
  console.log(`Role: ${role}, Allowed IDs:`, allowedIds);
 
  const filteredItems = menuItems.filter((item) => {
   
    const isItemAllowed = allowedIds.includes(item.id);

 
    if(item.children && item.children.length > 0) {
      
      
     
      
      item.children = item.children.filter((child) => {
        const isChildAllowed = allowedIds.includes(child.id);
        
        return isChildAllowed;
      });
      
      console.log(`Filtering children of ${item.id}, after:`, item.children.map(c => c.id));
      
      return isItemAllowed || item.children.length > 0;
    }

    return isItemAllowed;
  });

  return filteredItems;
};
