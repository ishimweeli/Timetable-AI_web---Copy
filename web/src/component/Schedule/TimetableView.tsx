import React, { useState, useEffect } from 'react';
import { useI18n } from "@/hook/useI18n";
import { useToast } from "@/component/Ui/use-toast";
import { Badge } from "@/component/Ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/component/Ui/card";
import { CalendarClock, Pencil, Trash2, AlertCircle, School } from "lucide-react";
import { Button } from "@/component/Ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/component/Ui/tooltip";

import TimetableService from '@/services/timetable/TimetableService';
import ManualSchedulingService, { TimetableEntry } from '@/services/timetable/ManualSchedulingService';
import CreateScheduleForm from './CreateScheduleForm';
import ClassBandScheduleInfo from './ClassBandScheduleInfo';

interface Period {
  id: number;
  name: string;
  start: string;
  end: string;
}

interface TimetableViewProps {
  timetableId: string;
  selectedClassUuid?: string;
  selectedClassBandUuid?: string;
  selectedClassBandName?: string;
  availablePeriods: Period[];
}

const DAYS_OF_WEEK = [1, 2, 3, 4, 5];
const DAY_NAMES = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday'
};

const TimetableView: React.FC<TimetableViewProps> = ({
  timetableId,
  selectedClassUuid,
  selectedClassBandUuid,
  selectedClassBandName,
  availablePeriods
}) => {
  const { t } = useI18n();
  const { toast } = useToast();
  
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<Record<number, Record<number, TimetableEntry[]>>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [selectedCell, setSelectedCell] = useState<{day: number, period: number} | null>(null);
  const [activeTab, setActiveTab] = useState<string>("timetable");
  
  useEffect(() => {
    if (timetableId && (selectedClassUuid || selectedClassBandUuid)) {
      loadTimetableEntries();
    }
  }, [timetableId, selectedClassUuid, selectedClassBandUuid]);
  
  const loadTimetableEntries = async () => {
    if (!timetableId) return;
    
    setIsLoading(true);
    try {
      let entriesData: TimetableEntry[] = [];
      
      if (selectedClassBandUuid) {
        // Load class band entries with their class entries
        entriesData = await ManualSchedulingService.getClassBandEntries(selectedClassBandUuid, timetableId);
      } else if (selectedClassUuid) {
        // Load class entries
        const response = await TimetableService.getEntriesForClass(timetableId, selectedClassUuid);
        entriesData = response.data || [];
      }
      
      setEntries(entriesData);
      organizeEntriesByDayAndPeriod(entriesData);
    } catch (error) {
      console.error("Error loading timetable entries:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("schedule.error.loadingEntries")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const organizeEntriesByDayAndPeriod = (entriesData: TimetableEntry[]) => {
    const organized: Record<number, Record<number, TimetableEntry[]>> = {};
    
    // Initialize structure
    DAYS_OF_WEEK.forEach(day => {
      organized[day] = {};
      availablePeriods.forEach(period => {
        organized[day][period.id] = [];
      });
    });
    
    // Fill with entries
    entriesData.forEach(entry => {
      if (organized[entry.dayOfWeek] && organized[entry.dayOfWeek][entry.periodId]) {
        organized[entry.dayOfWeek][entry.periodId].push(entry);
      }
    });
    
    setFilteredEntries(organized);
  };
  
  const handleCellClick = (day: number, period: number) => {
    setSelectedCell({ day, period });
    setShowCreateForm(true);
    setActiveTab("create");
  };
  
  const handleDeleteEntry = async (entryUuid: string) => {
    setIsLoading(true);
    try {
      // If it's a class band schedule, only class band level can delete it
      const entry = entries.find(e => e.uuid === entryUuid);
      if (entry?.isClassBandSchedule) {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: t("schedule.error.cannotDeleteClassBandEntry")
        });
        return;
      }
      
      await ManualSchedulingService.deleteEntry(entryUuid);
      toast({
        title: t("common.success"),
        description: t("schedule.success.entryDeleted")
      });
      loadTimetableEntries();
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("schedule.error.deletingEntry")
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleScheduleCreated = () => {
    loadTimetableEntries();
    setShowCreateForm(false);
    setActiveTab("timetable");
  };
  
  const CellContent = ({ entries }: { entries: TimetableEntry[] }) => {
    if (entries.length === 0) return null;
    
    return (
      <div className="space-y-1">
        {entries.map((entry) => (
          <div 
            key={entry.uuid}
            className={`p-1 rounded text-xs ${
              entry.isClassBandSchedule ? 'border-l-4 border-indigo-500 bg-indigo-50' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{entry.subjectName}</div>
                <div className="text-[10px] text-gray-600">{entry.teacherName}</div>
                {entry.roomName && <div className="text-[10px] text-gray-500">{entry.roomName}</div>}
              </div>
              <div className="flex space-x-1">
                {entry.isClassBandSchedule && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <School className="h-3 w-3 text-indigo-600" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("schedule.classBand.entry")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {!entry.isClassBandSchedule && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry.uuid);
                    }}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  if (!timetableId || (!selectedClassUuid && !selectedClassBandUuid)) {
    return (
      <div className="text-center p-8 text-gray-500">
        {t("schedule.selectClassOrClassBand")}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="timetable">
            <CalendarClock className="h-4 w-4 mr-2" />
            {t("schedule.timetable")}
          </TabsTrigger>
          <TabsTrigger value="create" disabled={!timetableId}>
            <Pencil className="h-4 w-4 mr-2" />
            {t("schedule.create")}
          </TabsTrigger>
          {selectedClassBandUuid && (
            <TabsTrigger value="class-band">
              <School className="h-4 w-4 mr-2" />
              {t("schedule.classBand.management")}
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="timetable" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedClassBandUuid 
                  ? `${selectedClassBandName} ${t("schedule.classBand.timetable")}` 
                  : t("schedule.classTimetable")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="p-2 border bg-gray-50 w-20"></th>
                        {DAYS_OF_WEEK.map((day) => (
                          <th key={day} className="p-2 border bg-gray-50">
                            {t(`schedule.day.${day}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {availablePeriods.map((period) => (
                        <tr key={period.id}>
                          <td className="p-2 border bg-gray-50 text-xs">
                            <div className="font-medium">{period.name}</div>
                            <div className="text-gray-500">{period.start}-{period.end}</div>
                          </td>
                          {DAYS_OF_WEEK.map((day) => (
                            <td 
                              key={`${day}-${period.id}`} 
                              className="p-1 border align-top min-h-16 h-16 cursor-pointer hover:bg-gray-50"
                              onClick={() => handleCellClick(day, period.id)}
                            >
                              {filteredEntries[day] && filteredEntries[day][period.id] && (
                                <CellContent entries={filteredEntries[day][period.id]} />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {selectedClassBandUuid && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                  <div className="flex items-center gap-2 text-sm">
                    <School className="h-4 w-4 text-indigo-600" />
                    <span className="font-medium">{t("schedule.classBand.legend")}</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1 ml-6">
                    {t("schedule.classBand.legendDescription")}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="create" className="mt-4">
          <CreateScheduleForm 
            timetableId={timetableId}
            selectedDay={selectedCell?.day}
            selectedPeriod={selectedCell?.period}
            selectedClassUuid={selectedClassUuid}
            selectedClassBandUuid={selectedClassBandUuid}
            availablePeriods={availablePeriods}
            onScheduleCreated={handleScheduleCreated}
          />
        </TabsContent>
        
        {selectedClassBandUuid && (
          <TabsContent value="class-band" className="mt-4">
            <ClassBandScheduleInfo 
              classBandUuid={selectedClassBandUuid}
              classBandName={selectedClassBandName || ""}
              timetableId={timetableId}
              onScheduleChange={loadTimetableEntries}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default TimetableView; 