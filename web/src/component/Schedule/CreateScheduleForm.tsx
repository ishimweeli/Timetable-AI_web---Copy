import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useI18n } from "@/hook/useI18n";
import { useToast } from "@/component/Ui/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/component/Ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { Button } from "@/component/Ui/button";
import { Checkbox } from "@/component/Ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/component/Ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { AlertCircle, School, BookOpenText, User, MapPin } from "lucide-react";

import { Binding } from '@/services/binding/bindingService';
import BindingService from '@/services/binding/bindingService';
import ManualSchedulingService, { ManualScheduleEntry } from '@/services/timetable/ManualSchedulingService';

const formSchema = z.object({
  bindingId: z.string().min(1, { message: "binding.required" }),
  dayOfWeek: z.string().min(1, { message: "day.required" }),
  periodId: z.string().min(1, { message: "period.required" }),
  isClassBandSchedule: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Period {
  id: number;
  name: string;
  start: string;
  end: string;
}

interface CreateScheduleFormProps {
  timetableId: string;
  selectedDay?: number;
  selectedPeriod?: number;
  selectedClassUuid?: string;
  selectedClassBandUuid?: string;
  availablePeriods: Period[];
  onScheduleCreated?: () => void;
}

const CreateScheduleForm: React.FC<CreateScheduleFormProps> = ({
  timetableId,
  selectedDay,
  selectedPeriod,
  selectedClassUuid,
  selectedClassBandUuid,
  availablePeriods,
  onScheduleCreated
}) => {
  const { t } = useI18n();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [bindings, setBindings] = useState<Binding[]>([]);
  const [activeTab, setActiveTab] = useState<string>(selectedClassBandUuid ? "class-band" : "class");
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bindingId: "",
      dayOfWeek: selectedDay?.toString() || "",
      periodId: selectedPeriod?.toString() || "",
      isClassBandSchedule: false,
    },
  });
  
  useEffect(() => {
    loadBindings();
  }, [selectedClassUuid, selectedClassBandUuid, activeTab]);
  
  useEffect(() => {
    // Update form values when selected day/period changes
    if (selectedDay !== undefined) {
      form.setValue('dayOfWeek', selectedDay.toString());
    }
    if (selectedPeriod !== undefined) {
      form.setValue('periodId', selectedPeriod.toString());
    }
  }, [selectedDay, selectedPeriod, form]);
  
  const loadBindings = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "class" && selectedClassUuid) {
        const classBindings = await BindingService.getBindingsByClass(selectedClassUuid);
        setBindings(classBindings);
      } else if (activeTab === "class-band" && selectedClassBandUuid) {
        const classBandBindings = await BindingService.getBindingsByClassBand(selectedClassBandUuid);
        setBindings(classBandBindings);
        form.setValue('isClassBandSchedule', true);
      } else {
        setBindings([]);
      }
    } catch (error) {
      console.error("Error loading bindings:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("binding.error.loading")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    if (!timetableId) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("schedule.error.missingTimetable")
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const scheduleEntry: ManualScheduleEntry = {
        timetableId,
        bindingId: values.bindingId,
        dayOfWeek: parseInt(values.dayOfWeek),
        periodId: parseInt(values.periodId),
        isClassBandSchedule: activeTab === "class-band"
      };
      
      await ManualSchedulingService.createScheduleEntry(scheduleEntry);
      
      toast({
        title: t("common.success"),
        description: activeTab === "class-band" 
          ? t("schedule.success.classBandEntryCreated") 
          : t("schedule.success.entryCreated")
      });
      
      form.reset({
        bindingId: "",
        dayOfWeek: selectedDay?.toString() || "",
        periodId: selectedPeriod?.toString() || "",
        isClassBandSchedule: activeTab === "class-band",
      });
      
      if (onScheduleCreated) onScheduleCreated();
    } catch (error) {
      console.error("Error creating schedule entry:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("schedule.error.creatingEntry")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    form.setValue('isClassBandSchedule', value === "class-band");
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{t("schedule.createEntry")}</CardTitle>
        <CardDescription>{t("schedule.createEntry.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="class" disabled={!selectedClassUuid}>
              <User className="h-4 w-4 mr-2" />
              {t("schedule.class")}
            </TabsTrigger>
            <TabsTrigger value="class-band" disabled={!selectedClassBandUuid}>
              <School className="h-4 w-4 mr-2" />
              {t("schedule.classBand")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="class" className="mt-2">
            <div className="text-sm text-muted-foreground mb-4">
              {t("schedule.class.description")}
            </div>
          </TabsContent>
          <TabsContent value="class-band" className="mt-2">
            <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 p-2 rounded mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>{t("schedule.classBand.warning")}</span>
            </div>
          </TabsContent>
        </Tabs>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="bindingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <BookOpenText className="h-4 w-4 mr-2" />
                    {t("schedule.selectBinding")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading || bindings.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("schedule.selectBinding.placeholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bindings.map((binding) => (
                        <SelectItem key={binding.uuid} value={binding.id.toString()}>
                          {binding.subjectName} - {binding.teacherName} {binding.roomName ? `(${binding.roomName})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("schedule.day")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("schedule.day.placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">{t("schedule.day.1")}</SelectItem>
                        <SelectItem value="2">{t("schedule.day.2")}</SelectItem>
                        <SelectItem value="3">{t("schedule.day.3")}</SelectItem>
                        <SelectItem value="4">{t("schedule.day.4")}</SelectItem>
                        <SelectItem value="5">{t("schedule.day.5")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="periodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("schedule.period")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("schedule.period.placeholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePeriods.map((period) => (
                          <SelectItem key={period.id} value={period.id.toString()}>
                            {period.name} ({period.start}-{period.end})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {activeTab === "class-band" && (
              <FormField
                control={form.control}
                name="isClassBandSchedule"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={activeTab === "class-band"}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t("schedule.classBand.confirmLabel")}
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {t("schedule.classBand.confirmDescription")}
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit"
          onClick={form.handleSubmit(onSubmit)}
          disabled={isLoading || bindings.length === 0}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              {t("common.loading")}
            </>
          ) : (
            t("schedule.createEntry.submit")
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateScheduleForm; 