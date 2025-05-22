import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/component/Ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/component/Ui/form";
import { Input } from "@/component/Ui/input";
import { Textarea } from "@/component/Ui/textarea";
import { Spinner } from "@/component/Ui/spinner";
import { ChevronDown, Trash2,X,Check, CheckCheck } from "lucide-react";
import { useUpdateRoomMutation } from "@/store/Room/ApiRoom.ts";
import { useToast } from "@/hook/useToast.ts";
import { useAppDispatch } from "@/hook/useAppRedux";
import { closeRoomPanel } from "@/store/Room/SliceRoom.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { useI18n } from "@/hook/useI18n";
import OrganizationSelector from "@/component/Organization/OrganizationSelector";
import { useMaxControlNumber } from "@/hook/useMaxControlNumber";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";

interface RoomFormProps {
  roomData: any;
  onCancel: () => void;
  onDelete: (uuid: string, event?: React.MouseEvent) => void;
  onUpdate: (data: any) => void;
  isUpdating: boolean;
  isNewRoom?: boolean;
}

const LOCATION_NUMBER_OPTIONS = [1,2,3,4,5,6,7,8];

const RoomForm = ({
  roomData,
  onCancel,
  onDelete,
  onUpdate,
  isUpdating,
  isNewRoom = false,
}: RoomFormProps) => {
  const { t } = useI18n();
  const dispatch = useAppDispatch();
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const { maxControlNumber } = useMaxControlNumber();
  const [selectedPlanSettingsId, setSelectedPlanSettingsId] = useState<number | null>(null);
  const { toast } = useToast();
  
  console.log("RoomForm mounted, isNewRoom:", isNewRoom);
  console.log("RoomData:", roomData);
  
  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);
  const fetchPlanSettingsByOrganizationPaginated = usePlanSettingsStore((state) => state.fetchPlanSettingsByOrganizationPaginated);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if(userData) {
      try {
        const user = JSON.parse(userData);
        const isUserAdmin = user.role === "admin" || user.role === "ADMIN" || user.roles?.includes("admin") || user.roles?.includes("ADMIN");
        setIsAdmin(isUserAdmin);
      }catch(e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    initials: z
      .string()
      .min(1, "Initials are required")
      .max(5, "Initials must be 5 characters or less"),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
    description: z.string().optional(),
    controlNumber: z.coerce.number().int().min(1).max(maxControlNumber, `Control number cannot exceed ${maxControlNumber}`),
    priority: z.string().min(1, "Priority is required"),
    locationNumber: z.coerce.number().int().min(1, "Location number is required").max(8, "Location number must be between 1 and 8"),
    statusId: z.coerce.number().int().min(1, "Status is required"),
    organizationId: z.number().min(1, "Organization is required"),
    planSettingsId: z.number().optional(),
  });
  
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: roomData?.name || "",
      code: roomData?.code || "",
      initials: roomData?.initials || "",
      capacity: roomData?.capacity || 30,
      description: roomData?.description || "",
      controlNumber: roomData?.controlNumber || 1,
      priority: roomData?.priority || "High",
      locationNumber: roomData?.locationNumber ?? 1,
      statusId: roomData?.statusId || 1,
      organizationId: roomData?.organizationId || 0,
      planSettingsId: roomData?.planSettingsId || undefined,
    },
  });

  useEffect(() => {
    if(roomData?.organizationId) {
      setOrganizationId(roomData.organizationId);
      form.setValue("organizationId", roomData.organizationId);
      
      if(roomData.planSettingsId) {
        setSelectedPlanSettingsId(roomData.planSettingsId);
        form.setValue("planSettingsId", roomData.planSettingsId);
      }
      
      // Fetch plan settings for this organization
      fetchPlanSettingsByOrganizationPaginated(roomData.organizationId.toString(), 0, 100);
    } else if(isNewRoom) {
      const userData = localStorage.getItem("userData");
      if(userData) {
        try {
          const user = JSON.parse(userData);
          if(user.organizationId) {
            setOrganizationId(user.organizationId);
            form.setValue("organizationId", user.organizationId);
            
            // Fetch plan settings for this organization
            fetchPlanSettingsByOrganizationPaginated(user.organizationId.toString(), 0, 100);
          }
        }catch(e) {
          console.error("Error parsing user data:", e);
        }
      }
    }
  }, [roomData, isNewRoom, form, fetchPlanSettingsByOrganizationPaginated]);

  const handleOrganizationChange = (value: number) => {
    form.setValue("organizationId", value);
    setOrganizationId(value);
    setSelectedPlanSettingsId(null);
    form.setValue("planSettingsId", undefined);
    
    // Fetch plan settings for the newly selected organization
    fetchPlanSettingsByOrganizationPaginated(value.toString(), 0, 100);
  };
  
  const handlePlanSettingsChange = (value: string | null) => {
    const numValue = value === "none" ? null : value ? Number(value) : null;
    setSelectedPlanSettingsId(numValue);
    form.setValue("planSettingsId", numValue || undefined);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      // Add logging for debugging
      console.log("Form values before submission:", data);
      console.log("Form validation state:", form.formState);
      
      if (form.formState.errors && Object.keys(form.formState.errors).length > 0) {
        console.error("Form has validation errors:", form.formState.errors);
        toast({
          title: "Validation Error",
          description: "Please check the form for errors",
          variant: "destructive",
        });
        return;
      }
      
      // Prepare the data with proper types
      const roomData = {
        ...data,
        locationNumber: Number(data.locationNumber),
        controlNumber: Number(data.controlNumber),
        planSettingsId: selectedPlanSettingsId
      };
      
      console.log("Data being sent to update:", roomData);
      onUpdate(roomData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting the form.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(roomData.uuid, e);
  };
  
  const handleSubmitClick = () => {
    console.log("Submit button clicked!");
    const isValid = form.formState.isValid;
    console.log("Form is valid:", isValid);
    
    if (!isValid) {
      console.log("Form errors:", form.formState.errors);
      form.trigger();
    }
  };

  return (
    <div className="">
      <div className="mb-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Room Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <OrganizationSelector
                      selectedOrganizationId={organizationId}
                      onOrganizationChange={handleOrganizationChange}
                    />
                  </div>
                  
                  <div className="col-span-2 mb-2">
                    <FormItem>
                      <FormLabel className="istui-timetable__main_form_input_label font-medium">
                        {t("room.form.planSettings", { defaultValue: "Plan Settings" })}
                      </FormLabel>
                      <Select
                        value={selectedPlanSettingsId?.toString() || "none"}
                        onValueChange={(value) => handlePlanSettingsChange(value)}
                      >
                        <SelectTrigger className="w-full istui-timetable__main_form_input">
                          <SelectValue placeholder={t("room.form.selectPlanSettings", { defaultValue: "Select plan settings" })} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t("room.form.none", { defaultValue: "None" })}</SelectItem>
                          {planSettingsList && planSettingsList.map((ps) => (
                            <SelectItem key={ps.id} value={ps.id.toString()}>
                              {ps.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground mt-1">
                        {t("room.form.planSettingsDescription", { defaultValue: "Select the plan settings to use for this room's schedule" })}
                      </div>
                    </FormItem>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="istui-timetable__main_form_input_label">
                          Room Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="istui-timetable__main_form_input"
                            placeholder="Enter room name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="istui-timetable__main_form_input_label">
                          Room Code
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="istui-timetable__main_form_input"
                            placeholder="Enter room code"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="initials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="istui-timetable__main_form_input_label">
                          Initials
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="istui-timetable__main_form_input"
                            placeholder="Enter initials"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="istui-timetable__main_form_input_label">
                          Capacity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="istui-timetable__main_form_input"
                            placeholder="Enter capacity"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="locationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="istui-timetable__main_form_input_label">
                          Location Number
                        </FormLabel>
                        <FormControl>
                          <select
                            id="locationNumber"
                            name="locationNumber"
                            value={field.value}
                            onChange={e => field.onChange(Number(e.target.value))}
                            className="border rounded px-2 py-1 w-32"
                            required
                          >
                            {LOCATION_NUMBER_OPTIONS.map(num => (
                              <option key={num} value={num}>
                                {num}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="controlNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="istui-timetable__main_form_input_label">
                          Control Number
                          <span className="text-xs text-gray-500 ml-1">
                            (Max: {maxControlNumber})
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            className="istui-timetable__main_form_input"
                            placeholder="Enter control number"
                            min={1}
                            max={maxControlNumber}
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if(value <= maxControlNumber) {
                                field.onChange(value);
                              } else {
                                field.onChange(maxControlNumber);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="statusId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="istui-timetable__main_form_input_label">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger className="istui-timetable__main_form_input_select">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1">Active</SelectItem>
                            <SelectItem value="2">Inactive</SelectItem>
                            <SelectItem value="3">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel className="istui-timetable__main_form_input_label">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter room description"
                            className="resize-none istui-timetable__main_form_input_textarea"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Room Configuration</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="high-priority"
                        name="priority"
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 istui-timetable__main_form_radio_item"
                        checked={form.watch("priority") === "High"}
                        onChange={() => form.setValue("priority", "High")}
                      />
                      <label htmlFor="high-priority" className="ml-2 text-sm">
                        <span className="font-medium">High Priority</span> -
                        This room will be scheduled first
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="low-priority"
                        name="priority"
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={form.watch("priority") === "Low"}
                        onChange={() => form.setValue("priority", "Low")}
                      />
                      <label htmlFor="low-priority" className="ml-2 text-sm">
                        <span className="font-medium">Low Priority</span> - This
                        room will be scheduled after high priority rooms
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-6">
              <Button
              size="sm"
                type="button"
                variant="outline"
                onClick={onCancel}
                className="istui-timetable__main_form_cancel_button"
              >
                <X/>
                {t("common.cancel")}
              </Button>
              {!isNewRoom && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("common.deleteButton")}
                </Button>
              )}
              <Button
                type="submit"
                size="sm"
                disabled={isUpdating}
                className="whitespace-nowrap istui-timetable__main_form_save_button"
                onClick={handleSubmitClick}
              >
                {isUpdating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    {t("common.saving")}
                  </>
                ) : isNewRoom ? (
                  <><CheckCheck/> { t("common.create")}</>
                 
                ) : (
                  <>
                  <Check/>
                  {  t("common.update")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RoomForm;
