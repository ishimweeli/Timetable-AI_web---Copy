import React, { useEffect, useState } from "react";
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
import { CreateRoomRequest } from "@/store/Room/ApiRoom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import SchedulePreferences from "./SchedulePreferences";
import { usePlanSettingsStore } from "@/store/PlanSettings/planSettingsStore";
import { useI18n } from "@/hook/useI18n";
import OrganizationSelector from "@/component/Organization/OrganizationSelector";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  initials: z
    .string()
    .min(1, "Initials are required")
    .max(5, "Initials must be 5 characters or less"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  description: z.string().optional(),
  controlNumber: z.string().min(1, "Control number is required"),
  priority: z.string().min(1, "Priority is required"),
  location: z.string().min(1, "Location is required"),
  statusId: z.coerce.number().int().min(1, "Status is required"),
  organizationId: z.number().min(1, "Organization is required"),
  planSettingsId: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CreateRoomRequest) => void;
  isLoading: boolean;
  suggestedName?: string;
  suggestedCode?: string;
  suggestedCapacity?: number;
  suggestedOrganizationId?: number;
}

const NewRoomModal = ({
  open,
  onOpenChange,
  onSave,
  isLoading,
  suggestedName,
  suggestedCode,
  suggestedCapacity,
  suggestedOrganizationId,
}: NewRoomModalProps) => {
  const { t } = useI18n();
  const [isAdmin, setIsAdmin] = useState(false);
  const [organizationId, setOrganizationId] = useState<number | null>(null);
  const [selectedPlanSettingsId, setSelectedPlanSettingsId] = useState<number | null>(null);
  
  const planSettingsList = usePlanSettingsStore((state) => state.planSettingsList);
  const fetchPlanSettingsByOrganizationPaginated = usePlanSettingsStore((state) => state.fetchPlanSettingsByOrganizationPaginated);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: suggestedName || "",
      code: suggestedCode || "",
      initials: "",
      capacity: suggestedCapacity || 30,
      description: "",
      controlNumber: "",
      priority: "High",
      location: "",
      statusId: 1,
      organizationId: suggestedOrganizationId || 0,
      planSettingsId: undefined,
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if(open) {
      form.reset();
    }
  }, [open, form]);

  // Add this useEffect for the organizationId changes
  useEffect(() => {
    if(organizationId) {
      fetchPlanSettingsByOrganizationPaginated(organizationId.toString(), 0, 100);
    }
  }, [organizationId, fetchPlanSettingsByOrganizationPaginated]);

  // Add a handler for plan settings changes
  const handlePlanSettingsChange = (value: string | null) => {
    const numValue = value === "none" ? null : value ? Number(value) : null;
    setSelectedPlanSettingsId(numValue);
    form.setValue("planSettingsId", numValue || undefined);
  };

  const onSubmit = (data: FormValues) => {
    try {
      const roomData: CreateRoomRequest = {
        name: data.name,
        code: data.code,
        initials: data.initials,
        capacity: data.capacity,
        description: data.description,
        location: data.location,
        controlNumber: data.controlNumber,
        priority: data.priority,
        statusId: data.statusId,
        organizationId: organizationId || data.organizationId,
        planSettingsId: selectedPlanSettingsId
      };
      
      onSave(roomData);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <div className="flex items-center justify-between border-b">
        <TabsList className="ml-4 mt-2">
          <TabsTrigger value="details">Room Details</TabsTrigger>
          <TabsTrigger value="preferences">Schedule Preferences</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="details" className="p-0 m-0">
        <div className="">
          <div className="mb-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Room Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter room name" {...field} />
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
                            <FormLabel>Room Code</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter room code" {...field} />
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
                            <FormLabel>Initials</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter initials" {...field} />
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
                            <FormLabel>Capacity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
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
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter location" {...field} />
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
                            <FormLabel>Control Number</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter control number"
                                {...field}
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
                            <FormLabel>Status</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
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

                      <div className="col-span-2">
                        <OrganizationSelector
                          value={organizationId}
                          onChange={(value) => {
                            setOrganizationId(value);
                            form.setValue("organizationId", value);
                          }}
                          error={!!form.formState.errors.organizationId}
                          errorMessage={form.formState.errors.organizationId?.message}
                          disabled={false}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter room description"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="col-span-2">
                        <FormItem>
                          <FormLabel>Plan Settings</FormLabel>
                          <Select
                            value={selectedPlanSettingsId?.toString() || "none"}
                            onValueChange={(value) => handlePlanSettingsChange(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select plan settings" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              {planSettingsList && planSettingsList.map((ps) => (
                                <SelectItem key={ps.id} value={ps.id.toString()}>
                                  {ps.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Room Configuration
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="high-priority"
                            name="priority"
                            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={form.watch("priority") === "High"}
                            onChange={() => form.setValue("priority", "High")}
                          />
                          <label
                            htmlFor="high-priority"
                            className="ml-2 text-sm"
                          >
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
                          <label
                            htmlFor="low-priority"
                            className="ml-2 text-sm"
                          >
                            <span className="font-medium">Low Priority</span> -
                            This room will be scheduled after high priority
                            rooms
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="whitespace-nowrap"
                  >
                    <span>Cancel</span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="whitespace-nowrap"
                  >
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Save Room</span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="preferences" className="p-0 m-0">
        <SchedulePreferences roomId={0} />
      </TabsContent>
    </Tabs>
  );
};

export default NewRoomModal;
