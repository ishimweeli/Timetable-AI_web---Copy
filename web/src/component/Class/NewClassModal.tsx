import React, { useState, useEffect } from "react";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Label } from "@/component/Ui/label";
import { ColorPicker } from "@/component/Ui/palette-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { ScrollArea } from "@/component/Ui/scroll-area";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { CreateClassRequest } from "@/type/Class/TypeClass";
import { useToast } from "@/hook/useToast";
import { useAppSelector } from "@/hook/useAppRedux";
import OrganizationSelector from "@/component/Organization/OrganizationSelector";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { X, CheckCheck } from "lucide-react";

interface NewClassModalProps {
  onSave: (classData: CreateClassRequest) => void;
  onClose: () => void;
  isLoading?: boolean;
  inlineMode?: boolean; // New prop to determine if it's inline or modal
}

const NewClassModal: React.FC<NewClassModalProps> = ({
  onSave,
  onClose,
  isLoading = false,
  inlineMode = false,
}) => {
  const { toast } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roleName === "ADMIN";
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    initial?: string;
    section?: string;
    organization?: string;
  }>({});

  // Get plan settings from the store and the fetch function
  const planSettings = usePlanSettingsStore((state) => state.planSettings);
  const fetchPlanSettingsByOrganization = usePlanSettingsStore(
    (state) => state.fetchPlanSettingsByOrganization,
  );

  // Access the periodsPerDay from the first plan setting if available
  // This is important as planSettings might be an array
  const maxPeriodsPerDay =
    planSettings?.length > 0 && planSettings[0]?.periodsPerDay
      ? planSettings[0].periodsPerDay
      : planSettings?.periodsPerDay || 5; // Handle both array and object structure

  console.log("NewClassModal: Using max periods per day:", maxPeriodsPerDay);
  console.log("NewClassModal: Plan settings data:", planSettings);

  // When component mounts, make sure we have the latest plan settings
  useEffect(() => {
    const orgId = user?.organizationId;

    if(orgId) {
      console.log(
        "NewClassModal: Fetching latest plan settings for organization ID:",
        orgId,
      );
      fetchPlanSettingsByOrganization(orgId)
        .then(() => {
          console.log("NewClassModal: Plan settings fetch completed");
        })
        .catch((error) => {
          console.error("NewClassModal: Error fetching plan settings:", error);
        });
    }
  }, [fetchPlanSettingsByOrganization, user]);

  // Create number options based on plan settings - dynamic rebuild when maxPeriodsPerDay changes
  const createPeriodOptions = (startFrom = 0) => {
    return Array.from(
      { length: maxPeriodsPerDay - startFrom + 1 },
      (_, i) => i + startFrom,
    );
  };

  // Options starting from 0 (for min lessons per day and max free periods)
  const optionsStartingFromZero = createPeriodOptions(0);

  // Options starting from 1 (for other fields)
  const optionsStartingFromOne = createPeriodOptions(1);

  const [newClass, setNewClass] = useState<CreateClassRequest>({
    name: "",
    initial: "",
    section: "",
    capacity: 30,
    color: "#4F46E5",
    minLessonsPerDay: 0,
    maxLessonsPerDay: maxPeriodsPerDay, // Set to max from plan settings
    latestStartPosition: 1, // Start with 1
    earliestEnd: maxPeriodsPerDay, // Set to max from plan settings
    maxFreePeriods: 0, // Start with 0
    mainTeacher: null,
    comment: "",
    presentEveryDay: true,
    organizationId: null,
    planSettingsId: undefined,
  });

  // Update form values when maxPeriodsPerDay changes
  useEffect(() => {
    // Only update the fields if they exceed the new maximum
    if(
      newClass.maxLessonsPerDay > maxPeriodsPerDay ||
      newClass.earliestEnd > maxPeriodsPerDay
    ) {
      setNewClass((prev) => ({
        ...prev,
        maxLessonsPerDay: Math.min(prev.maxLessonsPerDay, maxPeriodsPerDay),
        earliestEnd: Math.min(prev.earliestEnd, maxPeriodsPerDay),
        latestStartPosition: Math.min(
          prev.latestStartPosition,
          maxPeriodsPerDay,
        ),
        maxFreePeriods: Math.min(prev.maxFreePeriods, maxPeriodsPerDay),
      }));

      console.log(
        "NewClassModal: Form values adjusted for new period limit:",
        maxPeriodsPerDay,
      );
    }
  }, [maxPeriodsPerDay]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let parsedValue = type === "number" ? Number(value) : value;

    // Validate number inputs against maxPeriodsPerDay
    if(
      type === "number" &&
      [
        "minLessonsPerDay",
        "maxLessonsPerDay",
        "latestStartPosition",
        "earliestEnd",
        "maxFreePeriods",
      ].includes(name)
    ) {
      const numValue = Number(value);
      if(numValue > maxPeriodsPerDay) {
        toast({
          variant: "warning",
          description: `Value cannot exceed ${maxPeriodsPerDay} periods per day`,
        });
        parsedValue = maxPeriodsPerDay;
      }
    }

    setNewClass({
      ...newClass,
      [name]: parsedValue,
    });

    // Clear error when user types in a field
    if(formErrors[name as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [name]: undefined,
      });
    }
  };

  const handleSelectChange = (name: string, value: any) => {
    setNewClass({
      ...newClass,
      [name]: value,
    });
  };

  // Validate minLessonsPerDay vs maxLessonsPerDay
  useEffect(() => {
    if(
      newClass.minLessonsPerDay > newClass.maxLessonsPerDay &&
      newClass.maxLessonsPerDay !== 0
    ) {
      setNewClass((prev) => ({
        ...prev,
        maxLessonsPerDay: prev.minLessonsPerDay,
      }));
      toast({
        variant: "default",
        description: "Maximum lessons per day updated to match minimum lessons",
      });
    }
  }, [newClass.minLessonsPerDay, newClass.maxLessonsPerDay, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    const errors: {
      name?: string;
      initial?: string;
      section?: string;
      organization?: string;
    } = {};
    let hasErrors = false;

    // Validation checks
    if(!newClass.name.trim()) {
      errors.name = "Class name is required";
      hasErrors = true;
    }

    if(!newClass.initial.trim()) {
      errors.initial = "Class initial is required";
      hasErrors = true;
    }

    if(!newClass.section.trim()) {
      errors.section = "Section is required";
      hasErrors = true;
    }

    if(newClass.initial.length > 5) {
      errors.initial = "Class initial must not exceed 5 characters";
      hasErrors = true;
    }

    if(isAdmin && !newClass.organizationId) {
      errors.organization = "Please select an organization";
      hasErrors = true;
    }

    if(hasErrors) {
      setFormErrors(errors);
      return;
    }

    // Validate schedule-related fields against maxPeriodsPerDay
    const scheduleFields = [
      { name: "minLessonsPerDay", label: "Min Lessons Per Day" },
      { name: "maxLessonsPerDay", label: "Max Lessons Per Day" },
      { name: "latestStartPosition", label: "Latest Start Position" },
      { name: "earliestEnd", label: "Earliest End Position" },
      { name: "maxFreePeriods", label: "Max Free Periods" },
    ];

    for(const field of scheduleFields) {
      if(newClass[field.name] > maxPeriodsPerDay) {
        toast({
          variant: "destructive",
          description: `${field.label} cannot exceed ${maxPeriodsPerDay} periods`,
        });
        return;
      }
    }

    onSave(newClass);
  };

  const handleOrganizationChange = (orgId: number) => {
    setNewClass({
      ...newClass,
      organizationId: orgId,
    });

    // Clear organization error when user selects an organization
    if(formErrors.organization) {
      setFormErrors({
        ...formErrors,
        organization: undefined,
      });
    }

    // Fetch plan settings for the new organization
    if(orgId) {
      console.log(
        "NewClassModal: Organization changed, fetching plan settings for:",
        orgId,
      );
      fetchPlanSettingsByOrganization(orgId);
    }
  };

  // If user is not admin, use their organization ID from user data
  useEffect(() => {
    if(!isAdmin && user?.organizationId) {
      setNewClass((prev) => ({
        ...prev,
        organizationId: user.organizationId,
      }));
    }
  }, [isAdmin, user]);

  // Render inline form instead of modal if inlineMode is true
  if(inlineMode) {
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4">
          {/* Organization selection - only show if admin - Inline mode */}
          {isAdmin && (
            <div className="space-y-2">
              <OrganizationSelector
                value={newClass.organizationId}
                onChange={handleOrganizationChange}
                label="Organization"
                required={true}
                error={!!formErrors.organization}
                errorMessage={formErrors.organization}
                disabled={isLoading}
              />
            </div>
          )}

          {/* PlanSetting Dropdown */}
          <div className="mb-4">
            <Label htmlFor="planSettingsId">Plan Setting</Label>
            <select
              id="planSettingsId"
              className="w-full p-2 border rounded-md"
              value={newClass.planSettingsId || ""}
              onChange={e => setNewClass({ ...newClass, planSettingsId: e.target.value ? Number(e.target.value) : undefined })}
              disabled={isLoading}
            >
              <option value="">Select Plan Setting</option>
              {Array.isArray(planSettings)
                ? planSettings.map((ps) => (
                    <option key={ps.id} value={ps.id}>
                      {ps.name}
                    </option>
                  ))
                : planSettings && (
                    <option key={planSettings.id} value={planSettings.id}>
                      {planSettings.name}
                    </option>
                  )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name*</Label>
              <Input
                id="name"
                name="name"
                value={newClass.name}
                onChange={handleChange}
                placeholder="e.g. Class 1A"
                disabled={isLoading}
                required
                className={formErrors.name ? "border-red-500" : ""}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="initial">Initial (max 5 chars)*</Label>
              <Input
                id="initial"
                name="initial"
                value={newClass.initial}
                onChange={handleChange}
                placeholder="e.g. 1A"
                disabled={isLoading}
                maxLength={5}
                required
                className={formErrors.initial ? "border-red-500" : ""}
              />
              {formErrors.initial && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.initial}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="section">Section*</Label>
              <Input
                id="section"
                name="section"
                value={newClass.section}
                onChange={handleChange}
                placeholder="e.g. Science"
                disabled={isLoading}
                required
                className={formErrors.section ? "border-red-500" : ""}
              />
              {formErrors.section && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.section}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={newClass.capacity}
                onChange={handleChange}
                min={1}
                max={100}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Class Color</Label>
            <ColorPicker
              color={newClass.color}
              onChange={(color) => handleSelectChange("color", color)}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minLessonsPerDay">
                Min Lessons Per Day
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxPeriodsPerDay})
                </span>
              </Label>
              <Select
                value={newClass.minLessonsPerDay.toString()}
                onValueChange={(value) =>
                  handleSelectChange("minLessonsPerDay", Number(value))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="minLessonsPerDay">
                  <SelectValue placeholder="Select minimum lessons" />
                </SelectTrigger>
                <SelectContent>
                  {optionsStartingFromZero.map((value) => (
                    <SelectItem key={`min-${value}`} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxLessonsPerDay">
                Max Lessons Per Day
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxPeriodsPerDay})
                </span>
              </Label>
              <Select
                value={newClass.maxLessonsPerDay.toString()}
                onValueChange={(value) =>
                  handleSelectChange("maxLessonsPerDay", Number(value))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="maxLessonsPerDay">
                  <SelectValue placeholder="Select maximum lessons" />
                </SelectTrigger>
                <SelectContent>
                  {optionsStartingFromZero.map((value) => (
                    <SelectItem key={`max-${value}`} value={value.toString()}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-blue-500 mt-1">
                Note: Breaks and lunch periods are excluded when calculating
                this limit.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latestStartPosition">
                Latest Start Position
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxPeriodsPerDay})
                </span>
              </Label>
              <Select
                value={newClass.latestStartPosition.toString()}
                onValueChange={(value) =>
                  handleSelectChange("latestStartPosition", Number(value))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="latestStartPosition">
                  <SelectValue placeholder="Select latest start" />
                </SelectTrigger>
                <SelectContent>
                  {optionsStartingFromOne.map((value) => (
                    <SelectItem
                      key={`latestStart-${value}`}
                      value={value.toString()}
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="earliestEnd">
                Earliest End Position
                <span className="text-xs text-gray-500 ml-1">
                  (Max: {maxPeriodsPerDay})
                </span>
              </Label>
              <Select
                value={newClass.earliestEnd.toString()}
                onValueChange={(value) =>
                  handleSelectChange("earliestEnd", Number(value))
                }
                disabled={isLoading}
              >
                <SelectTrigger id="earliestEnd">
                  <SelectValue placeholder="Select earliest end" />
                </SelectTrigger>
                <SelectContent>
                  {optionsStartingFromOne.map((value) => (
                    <SelectItem
                      key={`earliestEnd-${value}`}
                      value={value.toString()}
                    >
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxFreePeriods">
              Max Free Periods
              <span className="text-xs text-gray-500 ml-1">
                (Max: {maxPeriodsPerDay})
              </span>
            </Label>
            <Select
              value={newClass.maxFreePeriods.toString()}
              onValueChange={(value) =>
                handleSelectChange("maxFreePeriods", Number(value))
              }
              disabled={isLoading}
            >
              <SelectTrigger id="maxFreePeriods">
                <SelectValue placeholder="Select max free periods" />
              </SelectTrigger>
              <SelectContent>
                {optionsStartingFromZero.map((value) => (
                  <SelectItem key={`maxFree-${value}`} value={value.toString()}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="presentEveryDay">Attendance</Label>
            <Select
              value={newClass.presentEveryDay ? "true" : "false"}
              onValueChange={(value) =>
                handleSelectChange("presentEveryDay", value === "true")
              }
              disabled={isLoading}
            >
              <SelectTrigger id="presentEveryDay">
                <SelectValue placeholder="Select attendance option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Present Every Day</SelectItem>
                <SelectItem value="false">Variable Attendance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Input
              id="comment"
              name="comment"
              value={newClass.comment || ""}
              onChange={handleChange}
              placeholder="Additional notes about this class"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button
          size="sm"
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            <X/>
            Cancel
          </Button>
          <Button size="sm" type="submit" disabled={isLoading}>
            <CheckCheck/>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Class"
            )}
          </Button>
        </div>
      </form>
    );
  }

  // Regular modal version
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Class</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isLoading}
          >
            <Cross2Icon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <ScrollArea className="p-4 max-h-[calc(90vh-120px)]">
            <div className="space-y-4">
              {/* Organization selection - only show if admin - Modal mode */}
              {isAdmin && (
                <div className="space-y-2">
                  <OrganizationSelector
                    value={newClass.organizationId}
                    onChange={handleOrganizationChange}
                    label="Organization"
                    required={true}
                    error={!!formErrors.organization}
                    errorMessage={formErrors.organization}
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* PlanSetting Dropdown */}
              <div className="mb-4">
                <Label htmlFor="planSettingsId">Plan Setting</Label>
                <select
                  id="planSettingsId"
                  className="w-full p-2 border rounded-md"
                  value={newClass.planSettingsId || ""}
                  onChange={e => setNewClass({ ...newClass, planSettingsId: e.target.value ? Number(e.target.value) : undefined })}
                  disabled={isLoading}
                >
                  <option value="">Select Plan Setting</option>
                  {Array.isArray(planSettings)
                    ? planSettings.map((ps) => (
                        <option key={ps.id} value={ps.id}>
                          {ps.name}
                        </option>
                      ))
                    : planSettings && (
                        <option key={planSettings.id} value={planSettings.id}>
                          {planSettings.name}
                        </option>
                      )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newClass.name}
                    onChange={handleChange}
                    placeholder="e.g. Class 1A"
                    disabled={isLoading}
                    required
                    className={formErrors.name ? "border-red-500" : ""}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initial">Initial (max 5 chars)*</Label>
                  <Input
                    id="initial"
                    name="initial"
                    value={newClass.initial}
                    onChange={handleChange}
                    placeholder="e.g. 1A"
                    disabled={isLoading}
                    maxLength={5}
                    required
                    className={formErrors.initial ? "border-red-500" : ""}
                  />
                  {formErrors.initial && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.initial}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="section">Section*</Label>
                  <Input
                    id="section"
                    name="section"
                    value={newClass.section}
                    onChange={handleChange}
                    placeholder="e.g. Science"
                    disabled={isLoading}
                    required
                    className={formErrors.section ? "border-red-500" : ""}
                  />
                  {formErrors.section && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors.section}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    name="capacity"
                    type="number"
                    value={newClass.capacity}
                    onChange={handleChange}
                    min={1}
                    max={100}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Class Color</Label>
                <ColorPicker
                  color={newClass.color}
                  onChange={(color) => handleSelectChange("color", color)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minLessonsPerDay">
                    Min Lessons Per Day
                    <span className="text-xs text-gray-500 ml-1">
                      (Max: {maxPeriodsPerDay})
                    </span>
                  </Label>
                  <Select
                    value={newClass.minLessonsPerDay.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("minLessonsPerDay", Number(value))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="minLessonsPerDay">
                      <SelectValue placeholder="Select minimum lessons" />
                    </SelectTrigger>
                    <SelectContent>
                      {optionsStartingFromZero.map((value) => (
                        <SelectItem
                          key={`min-${value}`}
                          value={value.toString()}
                        >
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxLessonsPerDay">
                    Max Lessons Per Day
                    <span className="text-xs text-gray-500 ml-1">
                      (Max: {maxPeriodsPerDay})
                    </span>
                  </Label>
                  <Select
                    value={newClass.maxLessonsPerDay.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("maxLessonsPerDay", Number(value))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="maxLessonsPerDay">
                      <SelectValue placeholder="Select maximum lessons" />
                    </SelectTrigger>
                    <SelectContent>
                      {optionsStartingFromZero.map((value) => (
                        <SelectItem
                          key={`max-${value}`}
                          value={value.toString()}
                        >
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-blue-500 mt-1">
                    Note: Breaks and lunch periods are excluded when calculating
                    this limit.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latestStartPosition">
                    Latest Start Position
                    <span className="text-xs text-gray-500 ml-1">
                      (Max: {maxPeriodsPerDay})
                    </span>
                  </Label>
                  <Select
                    value={newClass.latestStartPosition.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("latestStartPosition", Number(value))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="latestStartPosition">
                      <SelectValue placeholder="Select latest start" />
                    </SelectTrigger>
                    <SelectContent>
                      {optionsStartingFromOne.map((value) => (
                        <SelectItem
                          key={`latestStart-${value}`}
                          value={value.toString()}
                        >
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="earliestEnd">
                    Earliest End Position
                    <span className="text-xs text-gray-500 ml-1">
                      (Max: {maxPeriodsPerDay})
                    </span>
                  </Label>
                  <Select
                    value={newClass.earliestEnd.toString()}
                    onValueChange={(value) =>
                      handleSelectChange("earliestEnd", Number(value))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger id="earliestEnd">
                      <SelectValue placeholder="Select earliest end" />
                    </SelectTrigger>
                    <SelectContent>
                      {optionsStartingFromOne.map((value) => (
                        <SelectItem
                          key={`earliestEnd-${value}`}
                          value={value.toString()}
                        >
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxFreePeriods">
                  Max Free Periods
                  <span className="text-xs text-gray-500 ml-1">
                    (Max: {maxPeriodsPerDay})
                  </span>
                </Label>
                <Select
                  value={newClass.maxFreePeriods.toString()}
                  onValueChange={(value) =>
                    handleSelectChange("maxFreePeriods", Number(value))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="maxFreePeriods">
                    <SelectValue placeholder="Select max free periods" />
                  </SelectTrigger>
                  <SelectContent>
                    {optionsStartingFromZero.map((value) => (
                      <SelectItem
                        key={`maxFree-${value}`}
                        value={value.toString()}
                      >
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="presentEveryDay">Attendance</Label>
                <Select
                  value={newClass.presentEveryDay ? "true" : "false"}
                  onValueChange={(value) =>
                    handleSelectChange("presentEveryDay", value === "true")
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="presentEveryDay">
                    <SelectValue placeholder="Select attendance option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Present Every Day</SelectItem>
                    <SelectItem value="false">Variable Attendance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Input
                  id="comment"
                  name="comment"
                  value={newClass.comment || ""}
                  onChange={handleChange}
                  placeholder="Additional notes about this class"
                  disabled={isLoading}
                />
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex justify-end gap-3">
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X />
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={isLoading}>
              <Check />
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Class"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClassModal;
