import React, { useState, useEffect } from "react";
import { cn } from "@/util/util.ts";
import {
  TooltipProvider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/component/Ui/tooltip";
import { useToast } from "@/hook/useToast.ts";
import { useTheme } from "@/hook/useTheme";
import { TypeScheduleData } from "@/type/Timetable/TypeTimetable";
import { mockScheduleData } from "@/store/Timetable/mockTimetableData";
import { useI18n } from "@/hook/useI18n";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/component/Ui/dialog";
import { Button } from "@/component/Ui/button";
import { useDispatch } from "react-redux";
import { 
  updateTimetableEntryPositions, 
  restoreTimetableEntry, 
  fetchTimetableByUuid 
} from "@/store/Timetable/timetableSlice";
import { Lock, Clock, RotateCcw } from "lucide-react";

const getSubjectColors = (isDarkMode: boolean) => ({
  "subj-math": isDarkMode
    ? "bg-blue-900/90 hover:bg-blue-800/90 border-blue-700 text-blue-50 shadow-md"
    : "bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-900 shadow-sm",
  "subj-hist": isDarkMode
    ? "bg-amber-900/90 hover:bg-amber-800/90 border-amber-700 text-amber-50 shadow-md"
    : "bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-900 shadow-sm",
  "subj-phys": isDarkMode
    ? "bg-purple-900/90 hover:bg-purple-800/90 border-purple-700 text-purple-50 shadow-md"
    : "bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900 shadow-sm",
  "subj-eng": isDarkMode
    ? "bg-emerald-900/90 hover:bg-emerald-800/90 border-emerald-700 text-emerald-50 shadow-md"
    : "bg-green-100 hover:bg-green-200 border-green-300 text-green-900 shadow-sm",
});

const getSpecialPeriodStyle = (type: string, isDarkMode: boolean) => {
  if(type === 'Break') {
    return isDarkMode
      ? "bg-gray-800/80 border-gray-700 text-gray-100"
      : "bg-gray-100 border-gray-200 text-gray-700";
  } else if(type === 'Lunch') {
    return isDarkMode
      ? "bg-amber-900/80 border-amber-800 text-amber-100"
      : "bg-amber-50 border-amber-200 text-amber-800";
  }
  return "";
};

interface ScheduleGridProps {
  scheduleData?: TypeScheduleData;
  isMobile?: boolean;
  isTablet?: boolean;
  timetableUuid?: string;
  activeFilters?: Record<string, string>;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  scheduleData = mockScheduleData,
  isMobile = false,
  isTablet = false,
  timetableUuid,
  activeFilters = {}
}) => {
  const { toast } = useToast();
  const { colorScheme } = useTheme();
  const isDarkMode = colorScheme === "dark";
  const subjectColors = getSubjectColors(isDarkMode);
  const { t } = useI18n();
  const dispatch = useDispatch();
  
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [sourceCell, setSourceCell] = useState(null);
  const [destinationCell, setDestinationCell] = useState(null);
  const [operationType, setOperationType] = useState("swap");

  // Add a helper function to check if filters are active
  const filtersActive = Object.values(activeFilters).some(
    value => value && value !== 'all'
  );

  const handleCellClick = (dayId: string, slotId: string) => {
    toast({
      title: "Class details",
      description: `Selected slot on ${dayId}, period ${slotId}`,
    });
  };

  const { timeSlots, days } = scheduleData;

  const calculateDuration = (start: string, end: string): number => {
    if(!start || !end) {
      return 0;
    }
    
    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  };

  const getSubjectColor = (subject) => {
    if(subject && subject.color) {
      return subject.color;
    }
    
    if(subject && subject.id && subject.id.startsWith('subj-')) {
      const subjectId = subject.id;
      const cachedSubject = scheduleData.cachedData?.subjects?.find(
        s => s.id === subjectId
      );
      return cachedSubject?.color || '#3b82f6';
    }
    
    return '#3b82f6';
  };

  const getDayTranslationKey = (dayName) => {
    const dayMap = {
      'Monday': 'timetable.headers.monday',
      'Tuesday': 'timetable.headers.tuesday',
      'Wednesday': 'timetable.headers.wednesday',
      'Thursday': 'timetable.headers.thursday',
      'Friday': 'timetable.headers.friday',
      'Saturday': 'timetable.headers.saturday',
      'Sunday': 'timetable.headers.sunday',
    };
    
    return dayMap[dayName] || `timetable.headers.${dayName.toLowerCase()}`;
  };

  const getAbbreviatedDayName = (dayName) => {
    const abbreviations = {
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat',
      'Sunday': 'Sun',
    };
    
    return abbreviations[dayName] || dayName.substring(0, 3);
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    // Extract drag source and destination info
    const sourceId = result.source.droppableId;
    const destinationId = result.destination.droppableId;
    
    if (sourceId === destinationId) return;
    
    // Split the ids to get day and period values
    const [sourceDay, sourcePeriod] = sourceId.split('-');
    const [destDay, destPeriod] = destinationId.split('-');
    
    // Get source and destination classes
    const sourceClassInfo = days.find(day => day.id === sourceDay)?.classes[sourcePeriod];
    const destClassInfo = days.find(day => day.id === destDay)?.classes[destPeriod];
    
    // Check if either source or destination is locked
    if (sourceClassInfo?.isLocked || destClassInfo?.isLocked) {
      toast({
        title: t("timetable.swap.error"),
        description: t("timetable.swap.lockedEntry"),
        variant: "destructive"
      });
      return;
    }
    
    // Modify the validation logic to allow Break/Lunch periods for swapping
    // Only truly empty cells should be rejected
    const isSourceEmpty = !sourceClassInfo || 
      (sourceClassInfo.periodType === 'Regular' && 
       !sourceClassInfo.subject && 
       !sourceClassInfo.teacher && 
       !sourceClassInfo.room);
    
    const isDestEmpty = !destClassInfo || 
      (destClassInfo.periodType === 'Regular' && 
       !destClassInfo.subject && 
       !destClassInfo.teacher && 
       !destClassInfo.room && 
       !destClassInfo.class);
    
    if (isSourceEmpty || isDestEmpty) {
      toast({
        title: t("timetable.swap.error"),
        description: t("timetable.swap.emptyDestination"),
        variant: "destructive"
      });
      return;
    }
    
    setSourceCell({
      dayId: sourceDay,
      period: sourcePeriod,
      classInfo: sourceClassInfo,
      entryId: sourceClassInfo.entryId,
      entryUuid: sourceClassInfo.entryUuid
    });
    
    setDestinationCell({
      dayId: destDay,
      period: destPeriod,
      classInfo: destClassInfo,
      entryId: destClassInfo.entryId,
      entryUuid: destClassInfo.entryUuid
    });
    
    setSwapDialogOpen(true);
  };
  
  const handleConfirmSwap = () => {
    if (!sourceCell || !destinationCell || !timetableUuid) {
      toast({
        title: t("timetable.swap.error"),
        description: t("timetable.swap.missingInfo"),
        variant: "destructive"
      });
      return;
    }

    try {
      
      const requests = [
        {
          uuid: sourceCell.entryUuid,
          dayOfWeek: destinationCell.dayId,
          period: destinationCell.period
        },
        {
          uuid: destinationCell.entryUuid,
          dayOfWeek: sourceCell.dayId,
          period: sourceCell.period
        }
      ];

      dispatch(updateTimetableEntryPositions({
        uuid: timetableUuid,
        entryPositions: requests,
        operation: operationType
      }));

      setSwapDialogOpen(false);
      setSourceCell(null);
      setDestinationCell(null);
      
      toast({
        title: t("timetable.swap.success"),
        description: t("timetable.swap.entriesSwapped"),
      });
    } catch (error) {
      console.error('Error swapping classes:', error);
      toast({
        title: t("timetable.swap.error"),
        description: t("timetable.swap.failedToSwap"),
        variant: "destructive"
      });
    }
  };
  
  const handleCancelSwap = () => {
    setSwapDialogOpen(false);
    setSourceCell(null);
    setDestinationCell(null);
  };

  // Add a function to handle restoring a deleted entry
  const handleRestoreEntry = (dayId: string, periodId: string) => {
    if (!timetableUuid) return;
    
    // Show loading toast
    toast({
      title: t("timetable.restore.loading"),
      description: t("timetable.restore.inProgress"),
    });
    
    // Convert dayId and periodId to numbers 
    const dayOfWeek = parseInt(dayId, 10);
    const period = parseInt(periodId, 10);
    
    // Dispatch the restore action
    dispatch(restoreTimetableEntry({ 
      uuid: timetableUuid,
      dayOfWeek, 
      period 
    }))
    .unwrap()
    .then(() => {
      // On success, refresh the timetable
      dispatch(fetchTimetableByUuid(timetableUuid));
      
      toast({
        title: t("timetable.restore.completed"),
        description: t("timetable.restore.entryRestored"),
      });
    })
    .catch((error) => {
      console.error('Error restoring entry:', error);
      toast({
        title: t("timetable.restore.error"),
        description: t("timetable.restore.failedToRestore"),
        variant: "destructive"
      });
    });
  };

  if(!days.length || !timeSlots.length) {
    return (
      <div className="animate-fade-in bg-card rounded-md overflow-hidden border border-border p-8 text-center">
        <p className="text-lg text-muted-foreground">No schedule data available for the selected filters.</p>
      </div>
    );
  }

  const cellHeight = isMobile ? "min-h-[65px]" : isTablet ? "min-h-[75px]" : "min-h-[100px]";
  const fontSizeClass = isMobile ? "text-xs" : "text-sm";
  const paddings = isMobile ? "p-1" : isTablet ? "p-1.5" : "p-2";
  const headerPaddings = isMobile ? "p-1.5" : isTablet ? "p-2" : "p-3";

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="animate-fade-in bg-card rounded-md overflow-hidden border border-border">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-muted/50">
                <th className={cn("font-medium text-left border-r border-border w-[10%]", fontSizeClass, headerPaddings)}>
                  {t("timetable.headers.period")}
                </th>
                {days.map((day, index) => (
                  <th 
                    key={day.id || index}
                    className={cn("font-medium text-center border-r border-border w-[18%]", fontSizeClass, headerPaddings)}
                  >
                    {isMobile ? getAbbreviatedDayName(day.name) : day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((slot, slotIndex) => (
                <tr key={slot.id || slotIndex} className="border-b border-border">
                  <td className={cn("text-center border-r border-border", fontSizeClass, paddings)}>
                    {slot.period}
                  </td>
                  {days.map((day, dayIndex) => {
                    const classInfo = day.classes[slot.period.toString()];
                    const droppableId = `${day.id}-${slot.period}`;
                    
                    // Check if this is a Break or Lunch period
                    const isBreakOrLunch = classInfo && 
                      (classInfo.periodType === "Break" || classInfo.periodType === "Lunch");
                    
                    // Determine if we should show the cell content based on filters
                    const showBreakOrLunch = !filtersActive || !isBreakOrLunch;
                    
                    // Consider a cell empty if it has no content or just a "Regular" period type
                    const isEmptyCell = !classInfo || 
                      (classInfo.periodType === 'Regular' && 
                       !classInfo.subject && 
                       !classInfo.teacher && 
                       !classInfo.room);
                    
                    return (
                      <td
                        key={`${day.id || dayIndex}-${slot.id || slotIndex}`}
                        className={cn(
                          "border-r border-border relative w-[18%]",
                          paddings,
                        )}
                      >
                        <Droppable droppableId={droppableId} key={droppableId}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="h-full w-full"
                            >
                              {classInfo && (classInfo.subject || (classInfo.periodType && !filtersActive)) ? (
                                <Draggable 
                                  draggableId={droppableId} 
                                  index={0}
                                  isDragDisabled={isMobile || !classInfo.entryUuid || classInfo.isLocked || classInfo.isEmpty}
                                >
                                  {(provided, snapshot) => {
                                    const cellInfo = classInfo;
                                    const isBreakOrLunch = cellInfo?.periodType === 'Break' || cellInfo?.periodType === 'Lunch';
                                    
                                    // Define isLocked variable here to fix the error
                                    const isLocked = cellInfo?.isLocked || false;
                                    const isSpecialPeriod = isBreakOrLunch;
                                    
                                    // Consider a cell empty if it has no content or just a "Regular" period type
                                    const isEmptyCell = !cellInfo || 
                                      (cellInfo.periodType === 'Regular' && 
                                       !cellInfo.subject && 
                                       !cellInfo.teacher && 
                                       !cellInfo.room);
                                    
                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={cn(
                                          "h-full w-full rounded border flex flex-col justify-center relative",
                                          cellHeight,
                                          classInfo.subject 
                                            ? subjectColors[classInfo.subject.id as keyof typeof subjectColors]
                                            : (filtersActive && (classInfo.periodType === "Break" || classInfo.periodType === "Lunch")) 
                                              ? "bg-muted border-muted-foreground/20"
                                              : getSpecialPeriodStyle(classInfo.periodType, isDarkMode),
                                          snapshot.isDragging ? "opacity-70 shadow-lg" : "",
                                          (classInfo.isLocked && classInfo.subject) || classInfo.isEmpty ? "cursor-not-allowed" : ""
                                        )}
                                        style={{
                                          backgroundColor: classInfo.subject ? getSubjectColor(classInfo.subject) + '20' : undefined,
                                          borderLeft: classInfo.subject ? `3px solid ${getSubjectColor(classInfo.subject)}` : undefined,
                                          height: '100%', // Ensure height fills the container
                                          width: '100%',  // Ensure width fills the container
                                          ...provided.draggableProps.style
                                        }}
                                        onClick={
                                          classInfo.subject && !classInfo.isEmpty
                                            ? () => handleCellClick(day.id, slot.period.toString())
                                            : undefined
                                        }
                                      >
                                        {isEmptyCell ? (
                                          <div className="h-full w-full flex items-center justify-center group relative">
                                            <span className="text-gray-400 text-center group-hover:opacity-30">—</span>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                              <button
                                                type="button"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleRestoreEntry(day.id, slot.period.toString());
                                                }}
                                                className="p-1.5 bg-muted hover:bg-muted/80 rounded-full transition-colors"
                                                title={t("timetable.restore.tooltip")}
                                              >
                                                <RotateCcw className="h-4 w-4 text-primary" />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col h-full items-center justify-center text-center p-1">
                                            {/* Subject initials */}
                                            {classInfo.subject ? (
                                              <>
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <div className={cn("font-medium mb-1 text-center", isMobile ? "text-xs" : "text-sm")}>
                                                        {classInfo.subject.code}
                                                      </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>{classInfo.subject.name}</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                                
                                                {/* Teacher */}
                                                {!isMobile && (
                                                  <div className="text-xs space-y-1">
                                                    <div className="flex items-center justify-center space-x-1">
                                                      <span className={cn("text-opacity-90 text-xs", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                                        {t("timetable.cell.teacher")}:
                                                      </span>
                                                      <TooltipProvider>
                                                        <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <span className="font-medium text-xs">
                                                              {classInfo.teacher.initials}
                                                            </span>
                                                          </TooltipTrigger>
                                                          <TooltipContent>
                                                            <p>{classInfo.teacher.name}</p>
                                                          </TooltipContent>
                                                        </Tooltip>
                                                      </TooltipProvider>
                                                    </div>
                                                  </div>
                                                )}
                                                
                                                {/* Room */}
                                                {!isMobile && (
                                                  <div className="text-xs space-y-1">
                                                    <div className="flex items-center justify-center space-x-1">
                                                      <span className={cn("text-opacity-90 text-xs", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                                        {t("timetable.cell.room")}:
                                                      </span>
                                                      <span className="font-medium text-xs">
                                                        {getRoomInitials(classInfo.room)}
                                                      </span>
                                                    </div>
                                                  </div>
                                                )}
                                                
                                                {/* Class */}
                                                {!isMobile && (
                                                  <div className="text-xs space-y-1">
                                                    <div className="flex items-center justify-center space-x-1">
                                                      <span className={cn("text-opacity-90 text-xs", isDarkMode ? "text-gray-300" : "text-gray-600")}>
                                                        {t("timetable.cell.class")}:
                                                      </span>
                                                      <TooltipProvider>
                                                        <Tooltip>
                                                          <TooltipTrigger asChild>
                                                            <span className="font-medium text-xs">
                                                              {getClassInitials(classInfo.class)}
                                                            </span>
                                                          </TooltipTrigger>
                                                          <TooltipContent>
                                                            <p>{classInfo.class.name}</p>
                                                          </TooltipContent>
                                                        </Tooltip>
                                                      </TooltipProvider>
                                                    </div>
                                                  </div>
                                                )}
                                                
                                                {/* Start and End Time for regular class entries */}
                                                {classInfo.startTime && classInfo.endTime && (
                                                  <div className="flex items-center justify-center mt-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    <span>{classInfo.startTime} - {classInfo.endTime}</span>
                                                  </div>
                                                )}
                                              </>
                                            ) : (
                                              <div className="flex flex-col items-center justify-center h-full w-full">
                                                <div className="text-sm font-medium">
                                                  {classInfo.periodType}
                                                </div>
                                                
                                                {classInfo.startTime && classInfo.endTime && (
                                                  <div className="flex items-center justify-center mt-1 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    <span>{classInfo.startTime} - {classInfo.endTime}</span>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                            
                                            {/* Lock indicator */}
                                            {isLocked && classInfo.subject && (
                                              <div className="absolute top-1 right-1">
                                                <Lock className="h-3 w-3 text-amber-600" />
                                              </div>
                                            )}

                                            {/* For empty cells, add a restore button */}
                                            {classInfo.isEmpty && (
                                              <div className="absolute bottom-1 right-1">
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger asChild>
                                                      <button 
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleRestoreEntry(day.id, slot.period.toString());
                                                        }}
                                                        className="h-5 w-5 p-0.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                                                      >
                                                        <RotateCcw className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                      </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      <p>{t("timetable.cell.restore")}</p>
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              ) : (
                                <div className={cn("h-full w-full flex items-center justify-center text-muted-foreground", cellHeight)}>
                                  <span className="text-sm">—</span>
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DragDropContext>
      
      <Dialog open={swapDialogOpen} onOpenChange={(open) => !open && handleCancelSwap()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("timetable.swap.confirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("timetable.swap.confirmDescription")}
            </DialogDescription>
          </DialogHeader>
          
          {/* Add radio buttons for operation type */}
          <div className="space-y-2 mb-4">
            <div className="text-sm font-medium">{t("timetable.swap.operationType")}</div>
            <div className="flex flex-col space-y-2">
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="operationType" 
                  value="swap" 
                  checked={operationType === "swap"} 
                  onChange={() => {
                    setOperationType("swap");
                  }}
                  className="h-4 w-4"
                />
                <span>{t("timetable.swap.operations.swap")}</span>
              </label>
              <label className="flex items-center space-x-2">
                <input 
                  type="radio" 
                  name="operationType" 
                  value="create" 
                  checked={operationType === "create"} 
                  onChange={() => {
                    setOperationType("create");
                  }}
                  className="h-4 w-4"
                />
                <span>{t("timetable.swap.operations.create")}</span>
              </label>
            </div>
          </div>
          
          {sourceCell && destinationCell && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 border p-3 rounded-md">
                <h3 className="font-medium">{t("timetable.swap.source")}</h3>
                <div className="text-sm">
                  <p><span className="font-medium">{t("timetable.headers.day")}:</span> {days.find(d => d.id === sourceCell.dayId)?.name}</p>
                  <p><span className="font-medium">{t("timetable.headers.period")}:</span> {sourceCell.period}</p>
                  {sourceCell.classInfo.subject ? (
                    <>
                      <p><span className="font-medium">{t("timetable.cell.subject")}:</span> {sourceCell.classInfo.subject.name}</p>
                      {sourceCell.classInfo.teacher && (
                        <p><span className="font-medium">{t("timetable.cell.teacher")}:</span> {sourceCell.classInfo.teacher.name}</p>
                      )}
                      {sourceCell.classInfo.room && (
                        <p><span className="font-medium">{t("timetable.cell.room")}:</span> {sourceCell.classInfo.room.name}</p>
                      )}
                      {sourceCell.classInfo.isLocked && (
                        <p className="flex items-center gap-1 text-amber-600">
                          <Lock className="h-3 w-3" />
                          <span>{t("timetable.cell.locked")}</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <p><span className="font-medium">{t("timetable.cell.type")}:</span> {sourceCell.classInfo.isEmpty ? "Empty" : sourceCell.classInfo.periodType}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 border p-3 rounded-md">
                <h3 className="font-medium">{t("timetable.swap.destination")}</h3>
                <div className="text-sm">
                  <p><span className="font-medium">{t("timetable.headers.day")}:</span> {days.find(d => d.id === destinationCell.dayId)?.name}</p>
                  <p><span className="font-medium">{t("timetable.headers.period")}:</span> {destinationCell.period}</p>
                  {destinationCell.classInfo.subject ? (
                    <>
                      <p><span className="font-medium">{t("timetable.cell.subject")}:</span> {destinationCell.classInfo.subject.name}</p>
                      {destinationCell.classInfo.teacher && (
                        <p><span className="font-medium">{t("timetable.cell.teacher")}:</span> {destinationCell.classInfo.teacher.name}</p>
                      )}
                      {destinationCell.classInfo.room && (
                        <p><span className="font-medium">{t("timetable.cell.room")}:</span> {destinationCell.classInfo.room.name}</p>
                      )}
                      {destinationCell.classInfo.isLocked && (
                        <p className="flex items-center gap-1 text-amber-600">
                          <Lock className="h-3 w-3" />
                          <span>{t("timetable.cell.locked")}</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <p><span className="font-medium">{t("timetable.cell.type")}:</span> {destinationCell.classInfo.isEmpty ? "Empty" : destinationCell.classInfo.periodType}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelSwap}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleConfirmSwap}
            >
              {operationType === "swap" 
                ? t("timetable.swap.confirm") 
                : t("timetable.swap.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Helper functions
const formatTeacherName = (name: string) => {
  // Extract initials from full name (e.g., "Miss Anita" becomes "MA")
  return name.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
};

// Add this function to safely get subject initials
const getSubjectInitials = (subject: any): string => {
  if (!subject || typeof subject !== 'string') {
    // If it's a subject object, try to use the code property
    if (subject && subject.code) {
      return subject.code;
    }
    // Otherwise return placeholder
    return '??';
  }
  
  return subject
    .split(' ')
    .map((word: string) => word.charAt(0))
    .join('')
    .toUpperCase();
};

const getRoomInitials = (room: any): string => {
  if (!room) return '??';
  
  // If room has a code property, use it
  if (room.code) {
    return room.code;
  }
  
  // If room has a name property, get initials
  if (room.name && typeof room.name === 'string') {
    return room.name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase();
  }
  
  return '??';
};

const getClassInitials = (classObj: any): string => {
  if (!classObj) return '??';
  
  // If class has a code property, use it
  if (classObj.code) {
    return classObj.code;
  }
  
  // If class has a name property, get initials
  if (classObj.name && typeof classObj.name === 'string') {
    return classObj.name
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase();
  }
  
  return '??';
};

const getBackgroundColorForSubject = (cellInfo: any) => {
  if (!cellInfo) return '';
  
  if (cellInfo.periodType === 'Break') return 'bg-gray-100';
  if (cellInfo.periodType === 'Lunch') return 'bg-yellow-50';
  
  // Map subject names to appropriate background colors
  const subjectColors: Record<string, string> = {
    'English': 'bg-green-50',
    'Mathematics': 'bg-blue-50', 
    'Business Analytics': 'bg-teal-50',
    'Introduction to Computer Science': 'bg-red-50',
    // Add more subjects as needed
  };
  
  return subjectColors[cellInfo.subject] || 'bg-white';
};

export default ScheduleGrid;