import React, { useEffect, useState } from "react";
import { Checkbox } from "@/component/Ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { Label } from "@/component/Ui/label";
import { Button } from "@/component/Ui/button";
import { Card } from "@/component/Ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { useToast } from "@/hook/useToast.ts";
import SchedulePreferencesTable from "./SchedulePreferencesTable";
import ClassScheduleCalendar from "@/component/Class/ClassScheduleCalendar";
import { CellInfo } from "@/type/Calendar/TypeCalendar";
import { useAppDispatch, useAppSelector } from "@/hook/useAppRedux";
import {
  setSelectedScheduleIds,
  clearSelectedScheduleIds,
} from "@/store/Class/SliceClass";
import { Preference } from "@/type/Preference/TypePreference";
import {
  useCreateClassSchedulePreferenceMutation,
  useUpdateClassSchedulePreferenceMutation,
  useDeleteClassSchedulePreferenceMutation,
  useGetClassPreferencesQuery,
} from "@/store/Class/ApiClassCalendar";
import { PreferenceType } from "@/type/Calendar/TypeCalendar";
import { Check, X, ThumbsUp, ThumbsDown } from "lucide-react";
import { ChangeOperationType } from "@/type/Calendar/TypeCalendar";
import {
  useGetTeacherPreferencesQuery,
  useAddSchedulePreferenceToTeacherMutation,
  useUpdateSchedulePreferenceMutation,
  useDeleteSchedulePreferenceMutation,
  useGetTeacherPreferenceForPeriodAndDayQuery,
  useClearTeacherPreferencesForPeriodAndDayMutation,
} from "@/store/Teacher/ApiTeacher";

// Days of the week
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Time slots
const TIME_SLOTS = [
  "8:00 AM - 8:50 AM",
  "9:00 AM - 9:50 AM",
  "10:00 AM - 10:50 AM",
  "11:00 AM - 11:50 AM",
  "12:00 PM - 12:50 PM",
  "1:00 PM - 1:50 PM",
  "2:00 PM - 2:50 PM",
  "3:00 PM - 3:50 PM",
  "4:00 PM - 4:50 PM",
];

// Color coding for preference states
const PREFERENCE_STATES = [
  {
    id: "preferred",
    label: "Preferred",
    color: "bg-green-100 border-green-300",
  },
  {
    id: "acceptable",
    label: "Acceptable",
    color: "bg-yellow-50 border-yellow-300",
  },
  {
    id: "unavailable",
    label: "Unavailable",
    color: "bg-red-50 border-red-300",
  },
  {
    id: "no-preference",
    label: "No Preference",
    color: "bg-gray-50 border-gray-300",
  },
];

type ResourceType = "teacher" | "room" | "class" | "personnel" | "subject";

interface SchedulePreferencesProps {
  entityUuid: string;
  entityType: "teacher" | "class";
  isClassPreference?: boolean;
}

export const getDefaultPreferences = (forClass = false): Preference[] => {
  if(forClass) {
    return [
      {
        uuid: "1",
        name: "Must Schedule Class",
        type: PreferenceType.MUST_SCHEDULE_CLASS,
        description: "Class must be scheduled during this time slot",
      },
      {
        uuid: "2",
        name: "Must Not Schedule Class",
        type: PreferenceType.MUST_NOT_SCHEDULE_CLASS,
        description: "Class cannot be scheduled during this time slot",
      },
      {
        uuid: "3",
        name: "Prefers to Schedule Class",
        type: PreferenceType.PREFERS_TO_SCHEDULE_CLASS,
        description: "Class is preferred to be scheduled during this time slot",
      },
      {
        uuid: "4",
        name: "Prefers Not to Schedule Class",
        type: PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
        description:
          "Class is not preferred to be scheduled during this time slot",
      },
    ];
  }

  // Return teacher preferences (original implementation)
  return [
    {
      uuid: "1",
      name: "Must Teach",
      type: PreferenceType.MUST_TEACH,
      description: "Teacher must teach during this time slot",
    },
    {
      uuid: "2",
      name: "Cannot Teach",
      type: PreferenceType.CANNOT_TEACH,
      description: "Teacher cannot teach during this time slot",
    },
    {
      uuid: "3",
      name: "Prefers to Teach",
      type: PreferenceType.PREFERS_TO_TEACH,
      description: "Teacher prefers to teach during this time slot",
    },
    {
      uuid: "4",
      name: "Doesn't Prefer to Teach",
      type: PreferenceType.DONT_PREFER_TO_TEACH,
      description: "Teacher does not prefer to teach during this time slot",
    },
  ];
};

const SchedulePreferences: React.FC<SchedulePreferencesProps> = ({
  entityUuid,
  entityType,
  isClassPreference = false,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState("grid-view");
  const dispatch = useAppDispatch();
  const [selectedPreferenceType, setSelectedPreferenceType] =
    useState<PreferenceType | null>(null);
  
  // Add this to retrieve the plan settings ID from the store
  const selectedPlanSettingsId = useAppSelector(
    (state) => state.planSettings.selectedPlanSettingsId
  );

  const selectedScheduleIds = useAppSelector((state) => {
    if(entityType === "class") {
      return state.class.selectedScheduleIds || [];
    }
    // Add other resource types as needed
    return [];
  });

  const pendingChanges = useAppSelector(
    (state) => state.calendar.pendingChanges,
  );
  const [isSaving, setIsSaving] = React.useState(false);

  // Get class preferences query
  const { data: classPreferencesData, refetch: refetchPreferences } =
    useGetClassPreferencesQuery(entityUuid, {
      skip: !entityUuid || entityType !== "class",
    });

  // API mutations
  const [createClassSchedulePreference] =
    useCreateClassSchedulePreferenceMutation();
  const [updateClassSchedulePreference] =
    useUpdateClassSchedulePreferenceMutation();
  const [deleteClassSchedulePreference] =
    useDeleteClassSchedulePreferenceMutation();

  // Teacher API mutations
  const [addTeacherSchedulePreference] = useAddSchedulePreferenceToTeacherMutation();
  const [updateTeacherSchedulePreference] = useUpdateSchedulePreferenceMutation();
  const [deleteTeacherSchedulePreference] = useDeleteSchedulePreferenceMutation();
  const [clearTeacherPreferencesForPeriodAndDay] = useClearTeacherPreferencesForPeriodAndDayMutation();

  // Handle preference selection
  const handlePreferenceSelect = (preferenceType: PreferenceType) => {
    setSelectedPreferenceType((prevType) =>
      prevType === preferenceType ? null : preferenceType,
    );
  };

  // Important: Store the entityUuid in a ref to track if it changes
  const prevEntityUuidRef = React.useRef<string | null>(null);

  // Effect to handle entity changes
  useEffect(() => {
    // If the entity UUID has changed, refetch preferences
    if (entityUuid && entityUuid !== prevEntityUuidRef.current) {
      console.log(`Entity UUID changed from ${prevEntityUuidRef.current} to ${entityUuid}`);
      prevEntityUuidRef.current = entityUuid;
      
      if (typeof refetchPreferences === 'function') {
        refetchPreferences();
      }
    }
  }, [entityUuid, refetchPreferences]);

  // Only clear selected schedules when unmounting, not when entityUuid changes
  useEffect(() => {
    return () => {
      if(entityType === "class") {
        dispatch(clearSelectedScheduleIds());
      }
    };
  }, [dispatch, entityType]);

  const handleCellClick = (cellInfo: CellInfo) => {
    if(!cellInfo.scheduleId) return;

    if(entityType === "class") {
      // For now, just add the schedule id if it's not already selected
      if(!selectedScheduleIds.includes(cellInfo.scheduleId)) {
        dispatch(
          setSelectedScheduleIds([...selectedScheduleIds, cellInfo.scheduleId]),
        );
      }
    }
  };

  const handleSavePreferences = () => {
    toast({
      description: `Schedule preferences for this ${entityType} have been saved successfully.`,
    });
  };

  const handleSaveChanges = async () => {
    if(pendingChanges.length === 0) return;

    setIsSaving(true);
    const results: { success: boolean; message: string }[] = [];

    try {
      for(const change of pendingChanges) {
        try {
          // Make sure we have a valid preference type before sending to the backend
          if(!change.newPreferenceType) {
            console.error("Missing preference type for change:", change);
            continue; // Skip this change
          }

          // Convert UI preference type to backend preference type based on entity type
          let preferenceTypeValue = change.newPreferenceType;
          
          if (entityType === "teacher") {
            // For teachers, ensure we're using the correct preference types
            if (preferenceTypeValue && 
                (preferenceTypeValue.toString().startsWith("MUST_") || 
                preferenceTypeValue.toString().startsWith("PREFERS_") || 
                preferenceTypeValue.toString().startsWith("DONT_PREFER_") || 
                preferenceTypeValue.toString().startsWith("CANNOT_"))) {
              
              // Use the teacher mapping
              const teacherUiToBackendPreferenceType = {
                [PreferenceType.MUST_TEACH]: "must_teach",
                [PreferenceType.PREFERS_TO_TEACH]: "prefers_to_teach", 
                [PreferenceType.DONT_PREFER_TO_TEACH]: "dont_prefer_to_teach",
                [PreferenceType.CANNOT_TEACH]: "cannot_teach"
              };
              
              preferenceTypeValue = teacherUiToBackendPreferenceType[preferenceTypeValue as PreferenceType] || preferenceTypeValue;
            }
          } else if (entityType === "class") {
            // For classes, use the class-specific mapping
            const classUiToBackendPreferenceType = {
              [PreferenceType.MUST_SCHEDULE_CLASS]: "must_schedule_class",
              [PreferenceType.MUST_NOT_SCHEDULE_CLASS]: "must_not_schedule_class",
              [PreferenceType.PREFERS_TO_SCHEDULE_CLASS]: "prefers_to_schedule_class",
              [PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS]: "prefer_not_to_schedule_class"
            };
            
            preferenceTypeValue = classUiToBackendPreferenceType[preferenceTypeValue as PreferenceType] || preferenceTypeValue;
          }

          if(entityType === "class") {
            if(change.operationType === ChangeOperationType.CREATE) {
              await createClassSchedulePreference({
                classUuid: entityUuid,
                scheduleUuid: change.scheduleId,
                preferenceType: preferenceTypeValue as string,
                preferenceValue: true,
                planSettingsId: selectedPlanSettingsId, // Include plan settings ID
              }).unwrap();
            } else if(
              change.operationType === ChangeOperationType.UPDATE &&
              change.preferenceUuid
            ) {
              await updateClassSchedulePreference({
                uuid: change.preferenceUuid,
                preferenceType: preferenceTypeValue as string,
                preferenceValue: true,
                planSettingsId: selectedPlanSettingsId, // Include plan settings ID
              }).unwrap();
            } else if(
              change.operationType === ChangeOperationType.DELETE &&
              change.preferenceUuid
            ) {
              await deleteClassSchedulePreference(change.preferenceUuid).unwrap();
            }
          } else if(entityType === "teacher") {
            if(change.operationType === ChangeOperationType.CREATE) {
              await addTeacherSchedulePreference({
                teacherUuid: entityUuid,
                periodId: Number(change.periodId),
                dayOfWeek: Number(change.dayOfWeek ?? change.day),
                preferenceType: preferenceTypeValue as string,
                preferenceValue: true,
                planSettingsId: selectedPlanSettingsId, // Include plan settings ID
              }).unwrap();
            } else if(
              change.operationType === ChangeOperationType.UPDATE &&
              change.preferenceUuid
            ) {
              await updateTeacherSchedulePreference({
                preferenceUuid: change.preferenceUuid,
                preferenceType: preferenceTypeValue as string,
                preferenceValue: true,
                planSettingsId: selectedPlanSettingsId, // Include plan settings ID
              }).unwrap();
            } else if(
              change.operationType === ChangeOperationType.DELETE &&
              change.preferenceUuid
            ) {
              await deleteTeacherSchedulePreference(change.preferenceUuid).unwrap();
            }
          }
          
          results.push({ success: true, message: `Successfully processed change` });
        } catch (error: any) {
          console.error("Error processing change:", error);
          results.push({ 
            success: false, 
            message: error.data?.message || error.message || "Unknown error" 
          });
        }
      }

      // Don't clear selected schedule IDs here - this was causing the state to be lost
      // dispatch(clearSelectedScheduleIds());

      // Show success/error toast
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.length - successCount;
      
      if (successCount > 0) {
        toast({
          title: "Success",
          description: `Successfully saved ${successCount} preference changes`,
          variant: "default",
        });
      }
      
      if (errorCount > 0) {
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to save ${errorCount} preference changes`,
        });
      }

      // Refresh data
      if (typeof refetchPreferences === 'function') {
        refetchPreferences();
      }
    } catch(error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreferenceChange = async (
    cellInfo: CellInfo,
    preferenceType: PreferenceType,
  ) => {
    if(!entityUuid) return;

    try {
      let effectivePreferenceType = preferenceType;
      
      // Map teacher preference types to class preference types if needed
      if(entityType === "class" && isClassPreference) {
        const preferenceTypeMapping = {
          [PreferenceType.MUST_TEACH]: PreferenceType.MUST_SCHEDULE_CLASS,
          [PreferenceType.CANNOT_TEACH]: PreferenceType.MUST_NOT_SCHEDULE_CLASS,
          [PreferenceType.PREFERS_TO_TEACH]: PreferenceType.PREFERS_TO_SCHEDULE_CLASS,
          [PreferenceType.DONT_PREFER_TO_TEACH]: PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
        };
        
        effectivePreferenceType = preferenceTypeMapping[preferenceType] || preferenceType;
      }

      // Convert to backend string format if needed
      let backendPreferenceType: string;
      
      if(entityType === "class") {
        const classUiToBackendPreferenceType = {
          [PreferenceType.MUST_SCHEDULE_CLASS]: "must_schedule_class",
          [PreferenceType.MUST_NOT_SCHEDULE_CLASS]: "must_not_schedule_class",
          [PreferenceType.PREFERS_TO_SCHEDULE_CLASS]: "prefers_to_schedule_class",
          [PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS]: "prefer_not_to_schedule_class"
        };
        
        backendPreferenceType = classUiToBackendPreferenceType[effectivePreferenceType] || effectivePreferenceType.toString();
        
        await createClassSchedulePreference({
          classUuid: entityUuid,
          scheduleUuid: cellInfo.scheduleId,
          preferenceType: backendPreferenceType,
          preferenceValue: true,
          planSettingsId: selectedPlanSettingsId, // Include plan settings ID
        }).unwrap();
      } else if(entityType === "teacher") {
        const teacherUiToBackendPreferenceType = {
          [PreferenceType.MUST_TEACH]: "must_teach",
          [PreferenceType.PREFERS_TO_TEACH]: "prefers_to_teach", 
          [PreferenceType.DONT_PREFER_TO_TEACH]: "dont_prefer_to_teach",
          [PreferenceType.CANNOT_TEACH]: "cannot_teach"
        };
        
        backendPreferenceType = teacherUiToBackendPreferenceType[effectivePreferenceType] || effectivePreferenceType.toString();
        
        // Assume cellInfo contains periodId and day (dayOfWeek)
        await addTeacherSchedulePreference({
          teacherUuid: entityUuid,
          periodId: Number(cellInfo.periodId),
          dayOfWeek: Number(cellInfo.day),
          preferenceType: backendPreferenceType,
          preferenceValue: true,
          planSettingsId: selectedPlanSettingsId, // Include plan settings ID
        }).unwrap();
      }
      
      // Refresh data after successful change
      if (typeof refetchPreferences === 'function') {
        refetchPreferences();
      }
      
      toast({
        description: "Preference updated successfully",
      });
    } catch(error: any) {
      console.error("Error updating preference:", error);
      toast({
        variant: "destructive",
        description: error.data?.message || error.message || "Failed to update preference",
      });
    }
  };

  // Handler for grid cell preference change (teacher only)
  const handleTeacherCellPreferenceChange = async (periodId: number, dayOfWeek: number, preference: PreferenceType) => {
    if (entityType === 'teacher' && entityUuid) {
      try {
        // Convert UI preference type to backend preference type
        const teacherUiToBackendPreferenceType = {
          [PreferenceType.MUST_TEACH]: "must_teach",
          [PreferenceType.PREFERS_TO_TEACH]: "prefers_to_teach", 
          [PreferenceType.DONT_PREFER_TO_TEACH]: "dont_prefer_to_teach",
          [PreferenceType.CANNOT_TEACH]: "cannot_teach"
        };
        
        const backendPreferenceType = teacherUiToBackendPreferenceType[preference] || preference.toString();
        
        await addTeacherSchedulePreference({
          teacherUuid: entityUuid,
          periodId,
          dayOfWeek,
          preferenceType: backendPreferenceType,
          preferenceValue: true,
          planSettingsId: selectedPlanSettingsId, // Include plan settings ID
        }).unwrap();
        
        // Refresh data after successful change
        if (typeof refetchPreferences === 'function') {
          refetchPreferences();
        }
        
        toast({ 
          description: 'Preference updated successfully'
        });
      } catch (error: any) {
        console.error("Error updating teacher preference:", error);
        toast({ 
          title: 'Error', 
          description: error.data?.message || error.message || 'Failed to update preference', 
          variant: 'destructive' 
        });
      }
    }
  };

  // If no entity is selected, show placeholder
  if(!entityUuid) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>
          Select a {entityType} from the list to view or edit schedule
          preferences.
        </p>
      </div>
    );
  }

  // Use the class-specific preference buttons in the UI
  const renderPreferenceButtons = () => {
    if(entityType === "class") {
      return (
        <div className="flex space-x-2 mb-4">
          <Button
            variant={
              selectedPreferenceType === PreferenceType.MUST_SCHEDULE_CLASS
                ? "default"
                : "outline"
            }
            className="flex items-center"
            onClick={() =>
              handlePreferenceSelect(PreferenceType.MUST_SCHEDULE_CLASS)
            }
          >
            <Check className="mr-2 h-4 w-4" />
            Must Schedule Class
          </Button>
          <Button
            variant={
              selectedPreferenceType === PreferenceType.MUST_NOT_SCHEDULE_CLASS
                ? "default"
                : "outline"
            }
            className="flex items-center"
            onClick={() =>
              handlePreferenceSelect(PreferenceType.MUST_NOT_SCHEDULE_CLASS)
            }
          >
            <X className="mr-2 h-4 w-4" />
            Must Not Schedule Class
          </Button>
          <Button
            variant={
              selectedPreferenceType ===
              PreferenceType.PREFERS_TO_SCHEDULE_CLASS
                ? "default"
                : "outline"
            }
            className="flex items-center"
            onClick={() =>
              handlePreferenceSelect(PreferenceType.PREFERS_TO_SCHEDULE_CLASS)
            }
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            Prefers to Schedule Class
          </Button>
          <Button
            variant={
              selectedPreferenceType ===
              PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS
                ? "default"
                : "outline"
            }
            className="flex items-center"
            onClick={() =>
              handlePreferenceSelect(
                PreferenceType.PREFER_NOT_TO_SCHEDULE_CLASS,
              )
            }
          >
            <ThumbsDown className="mr-2 h-4 w-4" />
            Prefers Not to Schedule Class
          </Button>
        </div>
      );
    }

    // For other entity types (like teachers), return the original buttons
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Time Slot Preferences</h3>
        <p className="text-sm text-muted-foreground mb-6">
          {entityType === "teacher"
            ? "Select when this teacher is available for teaching."
            : entityType === "class"
              ? "Select when this class is preferred to be taught."
              : "Select preferred working hours and availability."}
        </p>
      </div>

      {renderPreferenceButtons()}

      <Tabs
        defaultValue="grid-view"
        className="w-full"
        onValueChange={setActiveTab}
        value={activeTab}
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="grid-view">Grid View</TabsTrigger>
          <TabsTrigger value="list-view">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid-view" className="space-y-4 mt-4">
          {entityType === "class" ? (
            <ClassScheduleCalendar
              selectedClassUuid={entityUuid}
              selectedScheduleIds={selectedScheduleIds}
              onCellClick={handleCellClick}
            />
          ) : (
            <SchedulePreferencesTable
              resourceType={entityType as "teacher" | "class" | "room" | "personnel"}
              resourceId={entityUuid}
              onCellPreferenceChange={entityType === 'teacher' ? handleTeacherCellPreferenceChange : undefined}
            />
          )}
        </TabsContent>

        <TabsContent value="list-view" className="space-y-4 mt-4">
          <Card className="p-4">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="day-filter">Filter by Day</Label>
                <Select defaultValue="all">
                  <SelectTrigger id="day-filter">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Days</SelectItem>
                    {DAYS.map((day) => (
                      <SelectItem key={day} value={day.toLowerCase()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preference Legend</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {PREFERENCE_STATES.map((state) => (
                    <div key={state.id} className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded ${state.color.replace("bg-", "bg-")}`}
                      ></div>
                      <span className="text-sm">{state.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Common Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="no-consecutive" />
                    <label
                      htmlFor="no-consecutive"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      No more than 3 consecutive periods
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="max-per-day" />
                    <label
                      htmlFor="max-per-day"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Maximum {entityType === "teacher" ? "5" : "6"} periods per
                      day
                    </label>
                  </div>
                  {entityType === "teacher" && (
                    <div className="flex items-center space-x-2">
                      <Checkbox id="lunch-break" defaultChecked />
                      <label
                        htmlFor="lunch-break"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Require lunch break (12:00-1:00 PM)
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {!isClassPreference && activeTab === "list-view" && (
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() =>
              toast({ description: "Preferences reset to default" })
            }
          >
            Reset to Default
          </Button>
          <Button onClick={handleSaveChanges}>Save Preferences</Button>
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-6">
        <p>Preference color coding:</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
          {PREFERENCE_STATES.map((state) => (
            <div key={state.id} className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${state.color.replace("border-", "bg-")}`}
              ></div>
              <span>{state.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchedulePreferences;
