import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/component/Ui/table";
import { Button } from "@/component/Ui/button";
import { Checkbox } from "@/component/Ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { PreferenceType } from "@/type/Calendar/TypeCalendar";
import { useToast } from "@/hook/useToast";

interface SchedulePreferencesTableProps {
  resourceType: "teacher" | "class" | "room" | "personnel";
  resourceId: string | number | null;
  onCellPreferenceChange?: (periodId: number, dayOfWeek: number, preference: PreferenceType) => void;
}

const SchedulePreferencesTable: React.FC<SchedulePreferencesTableProps> = ({
  resourceType,
  resourceId,
  onCellPreferenceChange,
}) => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<
    Record<string, PreferenceType>
  >({});

  // Just for demonstration - mock data
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [
    { id: 1, name: "Period 1", time: "08:00 - 08:45" },
    { id: 2, name: "Period 2", time: "08:50 - 09:35" },
    { id: 3, name: "Period 3", time: "09:40 - 10:25" },
    { id: 4, name: "Period 4", time: "10:30 - 11:15" },
    { id: 5, name: "Period 5", time: "11:20 - 12:05" },
    { id: 6, name: "Lunch", time: "12:05 - 12:50" },
    { id: 7, name: "Period 6", time: "12:50 - 13:35" },
    { id: 8, name: "Period 7", time: "13:40 - 14:25" },
    { id: 9, name: "Period 8", time: "14:30 - 15:15" },
  ];

  const getCellKey = (dayIndex: number, periodId: number) => {
    return `${dayIndex}-${periodId}`;
  };

  const handlePreferenceChange = (cellKey: string, value: PreferenceType, periodId: number, dayOfWeek: number) => {
    setPreferences({
      ...preferences,
      [cellKey]: value,
    });
    if (onCellPreferenceChange) {
      onCellPreferenceChange(periodId, dayOfWeek, value);
    }
  };

  const handleSavePreferences = () => {
    // This would normally save to the backend
    console.log(
      "Saving preferences for",
      resourceType,
      resourceId,
      preferences,
    );
    toast({
      description: `Schedule preferences saved for ${resourceType} ${resourceId || ""}`,
    });
  };

  const handleBulkAction = (action: string) => {
    const newPreferences = { ...preferences };
    const preferenceValue: PreferenceType = action as PreferenceType;

    days.forEach((_, dayIndex) => {
      periods.forEach((period) => {
        const cellKey = getCellKey(dayIndex, period.id);
        newPreferences[cellKey] = preferenceValue;
      });
    });

    setPreferences(newPreferences);
    toast({
      description: `Set all periods to ${action.toLowerCase().replace("_", " ")}`,
    });
  };

  if(!resourceId) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No Resource Selected</h3>
        <p className="text-muted-foreground mb-4">
          Select a {resourceType} to view or edit schedule preferences.
        </p>
      </div>
    );
  }

  const resourceTypeString = resourceId ? String(resourceId) : "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Schedule Preferences</h3>
        <div className="flex gap-2">
          <Select onValueChange={handleBulkAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Bulk actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PREFERRED">Set All Preferred</SelectItem>
              <SelectItem value="ACCEPTABLE">Set All Acceptable</SelectItem>
              <SelectItem value="NOT_PREFERRED">
                Set All Not Preferred
              </SelectItem>
              <SelectItem value="UNAVAILABLE">Set All Unavailable</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSavePreferences}>Save Preferences</Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Period</TableHead>
              {days.map((day) => (
                <TableHead key={day}>{day}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {periods.map((period) => (
              <TableRow key={period.id}>
                <TableCell className="font-medium">
                  <div>{period.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {period.time}
                  </div>
                </TableCell>
                {days.map((_, dayIndex) => {
                  const cellKey = getCellKey(dayIndex, period.id);
                  const preference = preferences[cellKey] || "ACCEPTABLE";

                  return (
                    <TableCell key={dayIndex}>
                      <Select
                        value={preference}
                        onValueChange={(value) =>
                          handlePreferenceChange(
                            cellKey,
                            value as PreferenceType,
                            period.id,
                            dayIndex + 1 // dayOfWeek: 1=Monday, 2=Tuesday, ...
                          )
                        }
                      >
                        <SelectTrigger
                          className={`w-full ${
                            preference === "PREFERRED"
                              ? "bg-green-100 dark:bg-green-900"
                              : preference === "ACCEPTABLE"
                                ? "bg-blue-50 dark:bg-blue-900/30"
                                : preference === "NOT_PREFERRED"
                                  ? "bg-orange-100 dark:bg-orange-900/30"
                                  : "bg-red-100 dark:bg-red-900/30"
                          }`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PREFERRED">Preferred</SelectItem>
                          <SelectItem value="ACCEPTABLE">Acceptable</SelectItem>
                          <SelectItem value="NOT_PREFERRED">
                            Not Preferred
                          </SelectItem>
                          <SelectItem value="UNAVAILABLE">
                            Unavailable
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        <p>Legend:</p>
        <div className="grid grid-cols-4 gap-2 mt-1">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-100 dark:bg-green-900 mr-1"></div>
            <span>Preferred</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-50 dark:bg-blue-900/30 mr-1"></div>
            <span>Acceptable</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-orange-100 dark:bg-orange-900/30 mr-1"></div>
            <span>Not Preferred</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-100 dark:bg-red-900/30 mr-1"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePreferencesTable;
