import React, { useEffect, useState } from 'react';
import { useI18n } from '@/hook/useI18n';
import { Teacher, Room, Class, TypeClassBand } from '@/type/Binding/TypeBinding';
import { Progress } from '@/component/Ui/progress';
import { useGetTeacherWorkloadQuery, useGetRoomWorkloadQuery, useGetClassWorkloadQuery, useGetClassBandWorkloadQuery } from '@/store/Workload/ApiWorkload';
import { AlertCircle, Info, CheckCircle, XCircle, User, Home, Book, School } from 'lucide-react';
import { Badge } from '@/component/Ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/component/Ui/tooltip';
import { usePlanSettingsStore } from '@/store/PlanSettings/planSettingsStore';

interface WorkloadDisplayProps {
  selectedTeacher: Teacher | null;
  selectedRoom: Room | null;
  selectedClass: Class | null;
  selectedClassBand: TypeClassBand | null;
  periodsPerWeek: number;
  organizationId?: number | null;
  totalAvailableSchedules?: number; // From plan settings (days per week * periods per day)
  isEditing?: boolean;
  existingPeriodsPerWeek?: number; // Only needed when editing
  planSettingsId?: number | null; // NEW: pass planSettingsId
}

const WorkloadDisplay: React.FC<WorkloadDisplayProps> = ({
  selectedTeacher,
  selectedRoom,
  selectedClass,
  selectedClassBand,
  periodsPerWeek,
  organizationId,
  totalAvailableSchedules: propsTotalAvailableSchedules,
  isEditing = false,
  existingPeriodsPerWeek = 0,
  planSettingsId = null,
}) => {
  const { t } = useI18n();
  const { planSettingsList } = usePlanSettingsStore();
  
  // Get the actual total available schedules from the selected plan settings
  const [actualTotalAvailableSchedules, setActualTotalAvailableSchedules] = useState(propsTotalAvailableSchedules || 40);
  
  // Update total available schedules when plan settings change
  useEffect(() => {
    if (planSettingsId && planSettingsList?.length) {
      const selectedPlanSetting = planSettingsList.find(ps => ps.id === planSettingsId);
      if (selectedPlanSetting) {
        // Calculate total periods from the plan setting
        const total = selectedPlanSetting.periodsPerDay * selectedPlanSetting.daysPerWeek;
        setActualTotalAvailableSchedules(total);
      }
    } else if (propsTotalAvailableSchedules) {
      setActualTotalAvailableSchedules(propsTotalAvailableSchedules);
    }
  }, [planSettingsId, planSettingsList, propsTotalAvailableSchedules]);
  
  const [allocations, setAllocations] = useState({
    teacher: { current: 0, new: 0, max: actualTotalAvailableSchedules, remaining: actualTotalAvailableSchedules },
    room: { current: 0, new: 0, max: actualTotalAvailableSchedules, remaining: actualTotalAvailableSchedules },
    class: { current: 0, new: 0, max: actualTotalAvailableSchedules, remaining: actualTotalAvailableSchedules },
    classband: { current: 0, new: 0, max: actualTotalAvailableSchedules, remaining: actualTotalAvailableSchedules }
  });
  const [hasWarnings, setHasWarnings] = useState(false);

  // Fetch workload data for teacher
  const { data: teacherWorkload, isLoading: isLoadingTeacher } = useGetTeacherWorkloadQuery(
    { teacherUuid: selectedTeacher?.uuid || '', planSettingsId: planSettingsId || undefined },
    { skip: !selectedTeacher?.uuid }
  );

  // Fetch workload data for room
  const { data: roomWorkload, isLoading: isLoadingRoom } = useGetRoomWorkloadQuery(
    { roomUuid: selectedRoom?.uuid || '', planSettingsId: planSettingsId || undefined },
    { skip: !selectedRoom?.uuid }
  );
  
  // Fetch workload data for class
  const { data: classWorkload, isLoading: isLoadingClass } = useGetClassWorkloadQuery(
    { classUuid: selectedClass?.uuid || '', planSettingsId: planSettingsId || undefined },
    { skip: !selectedClass?.uuid }
  );
  
  // Fetch workload data for class band
  const { data: classBandWorkload, isLoading: isLoadingClassBand, error: classBandWorkloadError } = useGetClassBandWorkloadQuery(
    { classBandUuid: selectedClassBand?.uuid || '', planSettingsId: planSettingsId || undefined },
    { skip: !selectedClassBand?.uuid }
  );

  // Handle any errors in fetching workload data
  useEffect(() => {
    if (classBandWorkloadError) {
      console.error('Error fetching class band workload:', classBandWorkloadError);
    }
  }, [classBandWorkloadError]);

  // Calculate workload whenever data or form values change
  useEffect(() => {
    // Helper to calculate sum of periods from workload data
    const calculateTotalPeriods = (items = []) => {
      if (!planSettingsId) return 0;
      
      // First check if items have periodsPerWeek property directly
      if (items.length > 0 && 'periodsPerWeek' in items[0]) {
        // For compatibility with different API response formats:
        // 1. If items have planSettingsId, filter by it
        // 2. Otherwise use all items (for backwards compatibility)
        const hasAnyPlanSettingsId = items.some(item => item.planSettingsId !== undefined);
        
        if (hasAnyPlanSettingsId) {
          const filtered = items.filter(item => 
            item.planSettingsId === planSettingsId || 
            // Convert to string for compatibility with API responses
            item.planSettingsId === planSettingsId.toString()
          );
          return filtered.reduce((sum, item) => sum + (item.periodsPerWeek || 0), 0);
        } else {
          // If no planSettingsId found in items, sum all items (for compatibility)
          return items.reduce((sum, item) => sum + (item.periodsPerWeek || 0), 0);
        }
      }
      
      // If the response has a different structure, try to extract the data
      if (Array.isArray(items)) {
        return items.reduce((sum, item) => sum + (
          // Try different property paths that might contain the periods value
          (item.periodsPerWeek) || 
          (item.workload) || 
          (item.periods) || 
          0
        ), 0);
      }
      
      return 0;
    };

    let teacherCurrent = 0;
    let roomCurrent = 0;
    let classCurrent = 0;
    let classbandCurrent = 0;

    // Get current workload for teacher
    if(teacherWorkload?.data) {
      teacherCurrent = calculateTotalPeriods(teacherWorkload.data);
      
      // Debug logging for teacher workload
      if (process.env.NODE_ENV === 'development') {
        console.debug('Teacher Workload:', {
          uuid: selectedTeacher?.uuid,
          data: teacherWorkload.data,
          planSettingsId,
          calculatedTotal: teacherCurrent
        });
      }
    }

    // Get current workload for room
    if(roomWorkload?.data) {
      roomCurrent = calculateTotalPeriods(roomWorkload.data);
      
      // Debug logging for room workload
      if (process.env.NODE_ENV === 'development') {
        console.debug('Room Workload:', {
          uuid: selectedRoom?.uuid,
          data: roomWorkload.data,
          planSettingsId,
          calculatedTotal: roomCurrent
        });
      }
    }
    
    // Get current workload for class
    if(classWorkload?.data) {
      classCurrent = calculateTotalPeriods(classWorkload.data);
      
      // Debug logging for class workload
      if (process.env.NODE_ENV === 'development') {
        console.debug('Class Workload:', {
          uuid: selectedClass?.uuid,
          data: classWorkload.data,
          planSettingsId,
          calculatedTotal: classCurrent
        });
      }
    }
    
    // Get current workload for class band from API
    if(classBandWorkload?.data) {
      classbandCurrent = calculateTotalPeriods(classBandWorkload.data);
      
      // Debug logging for class band workload
      if (process.env.NODE_ENV === 'development') {
        console.debug('Class Band Workload:', {
          uuid: selectedClassBand?.uuid,
          data: classBandWorkload.data,
          planSettingsId,
          calculatedTotal: classbandCurrent
        });
      }
    }

    // Calculate new workload based on form values
    // If editing, subtract existing periods and add new
    const addedPeriods = periodsPerWeek || 0;
    
    const teacherNew = isEditing
      ? teacherCurrent - existingPeriodsPerWeek + addedPeriods
      : teacherCurrent + addedPeriods;
    
    const roomNew = isEditing
      ? roomCurrent - existingPeriodsPerWeek + addedPeriods
      : roomCurrent + addedPeriods;
      
    const classNew = isEditing
      ? classCurrent - existingPeriodsPerWeek + addedPeriods
      : classCurrent + addedPeriods;
      
    const classbandNew = isEditing
      ? classbandCurrent - existingPeriodsPerWeek + addedPeriods
      : classbandCurrent + addedPeriods;

    // Update allocations
    setAllocations({
      teacher: { 
        current: teacherCurrent, 
        new: teacherNew, 
        max: actualTotalAvailableSchedules,
        remaining: actualTotalAvailableSchedules - teacherNew
      },
      room: { 
        current: roomCurrent, 
        new: roomNew, 
        max: actualTotalAvailableSchedules,
        remaining: actualTotalAvailableSchedules - roomNew
      },
      class: {
        current: classCurrent,
        new: classNew,
        max: actualTotalAvailableSchedules,
        remaining: actualTotalAvailableSchedules - classNew
      },
      classband: {
        current: classbandCurrent,
        new: classbandNew,
        max: actualTotalAvailableSchedules,
        remaining: actualTotalAvailableSchedules - classbandNew
      }
    });

    // Check for warnings (when new allocation exceeds max)
    setHasWarnings(
      teacherNew > actualTotalAvailableSchedules || 
      roomNew > actualTotalAvailableSchedules || 
      classNew > actualTotalAvailableSchedules ||
      classbandNew > actualTotalAvailableSchedules
    );
  }, [
    teacherWorkload, 
    roomWorkload, 
    classWorkload,
    classBandWorkload,
    selectedTeacher, 
    selectedRoom, 
    selectedClass,
    selectedClassBand,
    periodsPerWeek, 
    isEditing, 
    existingPeriodsPerWeek,
    actualTotalAvailableSchedules,
    planSettingsId
  ]);

  // Helper function to determine progress color based on percentage
  const getProgressColor = (percentage: number) => {
    if(percentage > 100) return 'bg-red-500';
    if(percentage > 80) return 'bg-amber-500';
    return 'bg-green-500';
  };
  
  // Helper function to get remaining capacity color
  const getRemainingColor = (remaining: number, max: number) => {
    const percentage = (remaining / max) * 100;
    if(remaining < 0) return 'text-red-600';
    if(percentage < 20) return 'text-amber-600';
    return 'text-green-600';
  };

  // Helper function to format percentage
  const formatPercentage = (value: number, max: number) => {
    return Math.round((value / max) * 100);
  };

  if(!selectedTeacher && !selectedRoom && !selectedClass && !selectedClassBand) {
    return (
      <div className="text-center py-4 text-gray-500">
        {t("binding.workload.selectResources")}
      </div>
    );
  }

  // Determine which entity is selected (class or classband)
  const classEntityName = selectedClass 
    ? selectedClass.name + (selectedClass.section ? ` (${selectedClass.section})` : '')
    : selectedClassBand 
      ? selectedClassBand.name
      : null;
  
  const classEntityType = selectedClass 
    ? t("common.class") 
    : selectedClassBand 
      ? t("binding.form.classband")
      : null;

  return (
    <div className="space-y-4">
      {hasWarnings && (
        <div className="flex items-start gap-2 bg-red-50 p-3 rounded-md border border-red-200">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">
            {t("binding.workload.warning")}
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <p className="text-md font-medium">{t("binding.workload.resourceAllocation")}</p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-xs">
                {t("binding.workload.help")}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Resource Cards */}
      <div className="grid gap-4">
        {/* Teacher Workload */}
        {selectedTeacher && (
          <div className="bg-white p-3 rounded-md border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <User className="h-4 w-4 text-blue-600 mr-2 flex-shrink-0" />
                <div className="font-medium text-sm">
                  {selectedTeacher.firstName} {selectedTeacher.lastName}
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-xs">
                {t("binding.form.teacher")}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Progress
                value={formatPercentage(allocations.teacher.new, allocations.teacher.max)}
                className="h-2.5 bg-gray-100"
                indicatorColor={getProgressColor(
                  formatPercentage(allocations.teacher.new, allocations.teacher.max)
                )}
              />
              
              <div className="flex justify-between text-xs">
                <div>
                  <span className="font-medium">
                    {allocations.teacher.new}/{allocations.teacher.max}
                  </span>
                  <span className="ml-1 text-gray-500">
                    ({formatPercentage(allocations.teacher.new, allocations.teacher.max)}%)
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  {allocations.teacher.remaining >= 0 ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={getRemainingColor(allocations.teacher.remaining, allocations.teacher.max)}>
                    <span className="font-medium">{Math.abs(allocations.teacher.remaining)}</span>
                    &nbsp;{allocations.teacher.remaining >= 0 ? 
                        t("binding.workload.remaining") : 
                        t("binding.workload.overallocated")}
                  </span>
                </div>
              </div>
              
              {periodsPerWeek > 0 && (
                <div className="text-xs text-gray-600 border-t pt-2 mt-2">
                  <span className="font-medium">{t("binding.workload.impact")}:</span> {periodsPerWeek} {t("binding.form.periodsPerWeek")}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Room Workload */}
        {selectedRoom && (
          <div className="bg-white p-3 rounded-md border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Home className="h-4 w-4 text-orange-600 mr-2 flex-shrink-0" />
                <div className="font-medium text-sm">
                  {selectedRoom.name}
                  {selectedRoom.capacity && <span className="text-xs text-gray-500 ml-1">(Cap: {selectedRoom.capacity})</span>}
                </div>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-xs">
                {t("binding.form.room")}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Progress
                value={formatPercentage(allocations.room.new, allocations.room.max)}
                className="h-2.5 bg-gray-100"
                indicatorColor={getProgressColor(
                  formatPercentage(allocations.room.new, allocations.room.max)
                )}
              />
              
              <div className="flex justify-between text-xs">
                <div>
                  <span className="font-medium">
                    {allocations.room.new}/{allocations.room.max}
                  </span>
                  <span className="ml-1 text-gray-500">
                    ({formatPercentage(allocations.room.new, allocations.room.max)}%)
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  {allocations.room.remaining >= 0 ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={getRemainingColor(allocations.room.remaining, allocations.room.max)}>
                    <span className="font-medium">{Math.abs(allocations.room.remaining)}</span>
                    &nbsp;{allocations.room.remaining >= 0 ? 
                        t("binding.workload.remaining") : 
                        t("binding.workload.overallocated")}
                  </span>
                </div>
              </div>
              
              {periodsPerWeek > 0 && (
                <div className="text-xs text-gray-600 border-t pt-2 mt-2">
                  <span className="font-medium">{t("binding.workload.impact")}:</span> {periodsPerWeek} {t("binding.form.periodsPerWeek")}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Class Workload */}
        {selectedClass && (
          <div className="bg-white p-3 rounded-md border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <School className="h-4 w-4 text-purple-600 mr-2 flex-shrink-0" />
                <div className="font-medium text-sm">
                  {selectedClass.name}
                  {selectedClass.section && <span className="text-xs text-gray-500 ml-1">({selectedClass.section})</span>}
                </div>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-xs">
                {t("binding.form.class")}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Progress
                value={formatPercentage(allocations.class.new, allocations.class.max)}
                className="h-2.5 bg-gray-100"
                indicatorColor={getProgressColor(
                  formatPercentage(allocations.class.new, allocations.class.max)
                )}
              />
              
              <div className="flex justify-between text-xs">
                <div>
                  <span className="font-medium">
                    {allocations.class.new}/{allocations.class.max}
                  </span>
                  <span className="ml-1 text-gray-500">
                    ({formatPercentage(allocations.class.new, allocations.class.max)}%)
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  {allocations.class.remaining >= 0 ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={getRemainingColor(allocations.class.remaining, allocations.class.max)}>
                    <span className="font-medium">{Math.abs(allocations.class.remaining)}</span>
                    &nbsp;{allocations.class.remaining >= 0 ? 
                        t("binding.workload.remaining") : 
                        t("binding.workload.overallocated")}
                  </span>
                </div>
              </div>
              
              {periodsPerWeek > 0 && (
                <div className="text-xs text-gray-600 border-t pt-2 mt-2">
                  <span className="font-medium">{t("binding.workload.impact")}:</span> {periodsPerWeek} {t("binding.form.periodsPerWeek")}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* ClassBand Workload */}
        {selectedClassBand && (
          <div className="bg-white p-3 rounded-md border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <School className="h-4 w-4 text-indigo-600 mr-2 flex-shrink-0" />
                <div className="font-medium text-sm">
                  {selectedClassBand.name}
                </div>
              </div>
              <Badge variant="outline" className="bg-indigo-50 text-xs">
                {t("binding.form.classband")}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <Progress
                value={formatPercentage(allocations.classband.new, allocations.classband.max)}
                className="h-2.5 bg-gray-100"
                indicatorColor={getProgressColor(
                  formatPercentage(allocations.classband.new, allocations.classband.max)
                )}
              />
              
              <div className="flex justify-between text-xs">
                <div>
                  <span className="font-medium">
                    {isNaN(allocations.classband.new) ? '0' : allocations.classband.new}/{allocations.classband.max}
                  </span>
                  <span className="ml-1 text-gray-500">
                    ({isNaN(formatPercentage(allocations.classband.new, allocations.classband.max)) ? 0 : formatPercentage(allocations.classband.new, allocations.classband.max)}%)
                  </span>
                </div>
                <div className="flex gap-1 items-center">
                  {allocations.classband.remaining >= 0 ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={getRemainingColor(allocations.classband.remaining, allocations.classband.max)}>
                    <span className="font-medium">{Math.abs(allocations.classband.remaining)}</span>
                    &nbsp;{allocations.classband.remaining >= 0 ? 
                        t("binding.workload.remaining") : 
                        t("binding.workload.overallocated")}
                  </span>
                </div>
              </div>
              
              {periodsPerWeek > 0 && (
                <div className="text-xs text-gray-600 border-t pt-2 mt-2">
                  <span className="font-medium">{t("binding.workload.impact")}:</span> {periodsPerWeek} {t("binding.form.periodsPerWeek")}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="text-xs border-t pt-3 mt-2 text-gray-500">
        <div className="grid grid-cols-3 gap-x-2 gap-y-1">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
            <span>0-80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
            <span>80-100%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span>&gt;100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadDisplay;
