import React, { useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'react-toastify';
import TimetableGenerationService from '@/services/timetable/TimetableGenerationService';

export const generateEntryId = () => {
  return `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 85%)`;
};

export const DAY_NAME_MAP = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
  7: 'Sunday'
};

export const useTimetableEntries = (timetableId, selectedClass, selectedClassBand, selectionType, bindings) => {
  const [entries, setEntries] = useState([]);
  const [pendingEntries, setPendingEntries] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [dataSource, setDataSource] = useState('default');
  const [lastDataLoadTime, setLastDataLoadTime] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveInProgress, setSaveInProgress] = useState(false);
  
  const entriesRef = useRef([]);
  const conflictsRef = useRef([]);
  const selectedClassRef = useRef('');
  
  React.useEffect(() => { entriesRef.current = entries; }, [entries]);
  React.useEffect(() => { conflictsRef.current = conflicts; }, [conflicts]);
  React.useEffect(() => { selectedClassRef.current = selectedClass; }, [selectedClass]);
  
  const isRemovingRef = useRef(false);
  const pendingAddOperationRef = useRef(false);
  
  const extractId = useCallback((obj) => {
    if (!obj) return null;
    
    if (typeof obj === 'number') return obj;
    if (typeof obj === 'string') {
      const parsed = parseInt(obj, 10);
      if (!isNaN(parsed)) return parsed;
      return obj;
    }
    
    if (typeof obj === 'object' && obj !== null) {
      if (obj.id) return obj.id;
      if (obj.uuid) return obj.uuid;
    }
    
    return null;
  }, []);
  
  const updateConflicts = useCallback((filteredEntries, bindings) => {
    if (!filteredEntries || !bindings) return;
    
    const newConflicts = [];
    
    // Group entries by day and period
    const entriesByDayAndPeriod = {};
    
    // Group entries by teacher and day to check for excessive teaching load
    const entriesByTeacherAndDay = {};
    
    filteredEntries.forEach(entry => {
      // For day-period conflicts
      const key = `${entry.dayOfWeek}-${entry.periodId}`;
      if (!entriesByDayAndPeriod[key]) {
        entriesByDayAndPeriod[key] = [];
      }
      entriesByDayAndPeriod[key].push(entry);
      
      // For teacher daily load
      if (entry.teacherId) {
        const teacherDayKey = `${entry.teacherId}-${entry.dayOfWeek}`;
        if (!entriesByTeacherAndDay[teacherDayKey]) {
          entriesByTeacherAndDay[teacherDayKey] = [];
        }
        entriesByTeacherAndDay[teacherDayKey].push(entry);
      }
    });
    
    // Check for same-slot conflicts (teacher or room double-booked)
    Object.entries(entriesByDayAndPeriod).forEach(([key, slotEntries]) => {
      if (Array.isArray(slotEntries) && slotEntries.length > 1) {
        const [dayOfWeek, periodId] = key.split('-').map(Number);
        
        // Check for teacher double-booking
        const teacherIds = {};
        slotEntries.forEach(entry => {
          if (entry.teacherId && teacherIds[entry.teacherId]) {
            newConflicts.push({
              dayOfWeek,
              periodId,
              conflictType: 'TEACHER_DOUBLE_BOOKING',
              resourceId: entry.teacherId.toString(),
              resourceName: entry.teacherName,
              bindingId: entry.bindingId,
              conflictDescription: `Teacher ${entry.teacherName} is scheduled for multiple classes at the same time`
            });
          }
          if (entry.teacherId) {
            teacherIds[entry.teacherId] = true;
          }
        });
        
        // Check for room double-booking
        const roomIds = {};
        slotEntries.forEach(entry => {
          if (entry.roomId && roomIds[entry.roomId]) {
            newConflicts.push({
              dayOfWeek,
              periodId,
              conflictType: 'ROOM_DOUBLE_BOOKING',
              resourceId: entry.roomId.toString(),
              resourceName: entry.roomName,
              bindingId: entry.bindingId,
              conflictDescription: `Room ${entry.roomName} is scheduled for multiple classes at the same time`
            });
          }
          if (entry.roomId) {
            roomIds[entry.roomId] = true;
          }
        });
      }
    });
    
    // Check for excessive teacher load
    Object.entries(entriesByTeacherAndDay).forEach(([key, teacherEntries]) => {
      if (Array.isArray(teacherEntries) && teacherEntries.length > 5) { // Threshold for excessive teaching load per day
        const [teacherId, dayOfWeek] = key.split('-').map(Number);
        const teacherName = teacherEntries[0]?.teacherName || 'Unknown Teacher';
        
        newConflicts.push({
          dayOfWeek,
          periodId: null, // Not period-specific
          conflictType: 'TEACHER_EXCESSIVE_LOAD',
          resourceId: teacherId.toString(),
          resourceName: teacherName,
          bindingId: null, // Not binding-specific
          conflictDescription: `Teacher ${teacherName} has ${teacherEntries.length} periods on ${DAY_NAME_MAP[dayOfWeek] || `Day ${dayOfWeek}`}, which may be excessive`
        });
      }
    });
    
    setConflicts(newConflicts);
  }, []);

  const loadScheduleFromBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!timetableId) {
        setEntries([]);
        setDataSource('no-timetable');
        return;
      }

      setEntries([]);
      setDataSource('loading');

      let fetchedEntries = [];
      
      const classId = extractId(selectedClass);
      const classBandId = extractId(selectedClassBand);
      
      if (selectionType === 'class' && classId) {
        fetchedEntries = await TimetableGenerationService.getClassTimetableEntries(classId);
      } else if (selectionType === 'classBand' && classBandId) {
        fetchedEntries = await TimetableGenerationService.getClassBandTimetableEntries(classBandId);
      }
      
      setAllEntries(fetchedEntries);
      
      const processedEntries = fetchedEntries.map(entry => {
        const binding = bindings.find(b => b.subjectId === entry.subjectId && b.teacherId === entry.teacherId);
        return {
          id: entry.id,
          uuid: entry.uuid,
          timetableId: entry.timetableId,
          bindingId: binding ? binding.uuid : null,
          dayOfWeek: entry.dayOfWeek,
          periodId: entry.period || entry.periodId,
          subjectId: entry.subjectId,
          subjectName: entry.subjectName,
          subjectUuid: entry.subjectUuid,
          subjectInitials: entry.subjectInitials,
          subjectColor: entry.subjectColor,
          teacherId: entry.teacherId,
          teacherName: entry.teacherName,
          teacherInitials: entry.teacherInitials,
          teacherUuid: entry.teacherUuid,
          classId: entry.classId,
          className: entry.className,
          classBandId: entry.classBandId,
          classBandUuid: entry.classBandUuid,
          roomId: entry.roomId,
          roomName: entry.roomName,
          roomInitials: entry.roomInitials,
          durationMinutes: entry.durationMinutes || 45,
          periodType: entry.periodType || 'Regular',
          status: entry.status,
          isManuallyScheduled: true,
          isClassBandEntry: entry.classBandId ? true : false
        };
      });
      
      setEntries(processedEntries);
      updateConflicts(processedEntries, bindings);
      setLastDataLoadTime(new Date());
      setDataSource('backend');
    } catch (error) {
      console.error(`Error loading schedule for timetable ${timetableId}:`, error);
      toast.error(`Failed to load schedule: ${error.message || 'Unknown error'}`);
      setEntries([]);
      setDataSource('error');
    } finally {
      setIsLoading(false);
    }
  }, [timetableId, selectionType, selectedClass, selectedClassBand, bindings, updateConflicts, extractId]);

  const checkForConflicts = useCallback(async (
    existingEntries,
    newEntry,
    bindings,
    checkGlobalTeacherConflicts = true
  ) => {
    if (!Array.isArray(existingEntries) || !newEntry || !Array.isArray(bindings)) {
      return [];
    }

    const conflicts = [];

    const binding = bindings.find(b => b.uuid === newEntry.bindingId);
    if (!binding) return conflicts;

    let selectedClassValue = selectedClassRef.current;
    
    if (typeof selectedClassValue === 'object' && selectedClassValue !== null) {
      const objValue = selectedClassValue as { id?: string | number; uuid?: string };
      const idValue = objValue.id !== undefined ? String(objValue.id) : null;
      const uuidValue = objValue.uuid || null;
      selectedClassValue = idValue || uuidValue || null;
    }

    // Filter current class entries
    const currentClassEntries = existingEntries.filter(entry => {
      if (!selectedClassValue) return false;
      
      if (typeof entry.classId === 'object' && entry.classId !== null) {
        const entryClassId = entry.classId as { id?: string | number; uuid?: string };
        return entryClassId.id === selectedClassValue || entryClassId.uuid === selectedClassValue;
      }
      return entry.classId === selectedClassValue;
    });

    // Check for double-booking of teacher within the same class
    const teacherInClassConflicts = currentClassEntries.filter(entry =>
      entry.dayOfWeek === newEntry.dayOfWeek &&
      entry.periodId === newEntry.periodId &&
      entry.teacherName === newEntry.teacherName &&
      entry.uuid !== newEntry.uuid
    );

    if (teacherInClassConflicts.length > 0) {
      conflicts.push({
        dayOfWeek: newEntry.dayOfWeek,
        periodId: newEntry.periodId,
        conflictType: 'TEACHER_DOUBLE_BOOKING',
        resourceId: binding.teacherId.toString(),
        resourceName: binding.teacherName,
        bindingId: binding.uuid,
        conflictDescription: `Teacher ${newEntry.teacherName} is already scheduled at this time for ${teacherInClassConflicts[0]?.className || 'another class'}`
      });
    }

    // Check for class slot conflicts (time slot already occupied)
    const classTimeSlotConflicts = currentClassEntries.filter(entry =>
      entry.dayOfWeek === newEntry.dayOfWeek &&
      entry.periodId === newEntry.periodId &&
      entry.className === newEntry.className &&
      entry.uuid !== newEntry.uuid
    );

    if (classTimeSlotConflicts.length > 0) {
      conflicts.push({
        dayOfWeek: newEntry.dayOfWeek,
        periodId: newEntry.periodId,
        conflictType: 'CLASS_SLOT_OCCUPIED',
        resourceId: (newEntry.classId ? newEntry.classId.toString() : '') || '',
        resourceName: newEntry.className,
        bindingId: binding.uuid,
        conflictDescription: `Class ${newEntry.className} already has ${classTimeSlotConflicts[0]?.subjectName || 'another subject'} scheduled at this time`
      });
    }

    // Check for global teacher conflicts (teacher scheduled in other classes at the same time)
    if (checkGlobalTeacherConflicts && binding.teacherId) {
      const globalTeacherConflicts = existingEntries.filter(entry =>
        entry.dayOfWeek === newEntry.dayOfWeek &&
        entry.periodId === newEntry.periodId &&
        entry.teacherId === binding.teacherId &&
        entry.uuid !== newEntry.uuid &&
        entry.className !== newEntry.className // Different class
      );

      if (globalTeacherConflicts.length > 0) {
        conflicts.push({
          dayOfWeek: newEntry.dayOfWeek,
          periodId: newEntry.periodId,
          conflictType: 'TEACHER_GLOBAL_CONFLICT',
          resourceId: binding.teacherId.toString(),
          resourceName: binding.teacherName,
          bindingId: binding.uuid,
          conflictDescription: `Teacher ${binding.teacherName} is already scheduled in ${globalTeacherConflicts.map(c => c.className).join(', ')} at this time`
        });
      }
    }

    // Check for excessive teacher load on the same day
    if (binding.teacherId) {
      const teacherDayEntries = existingEntries.filter(entry =>
        entry.dayOfWeek === newEntry.dayOfWeek &&
        entry.teacherId === binding.teacherId &&
        entry.uuid !== newEntry.uuid
      );

      if (teacherDayEntries.length >= 5) { // Threshold for warning
        conflicts.push({
          dayOfWeek: newEntry.dayOfWeek,
          periodId: newEntry.periodId,
          conflictType: 'TEACHER_EXCESSIVE_LOAD',
          resourceId: binding.teacherId.toString(),
          resourceName: binding.teacherName,
          bindingId: binding.uuid,
          conflictDescription: `Teacher ${binding.teacherName} already has ${teacherDayEntries.length} periods scheduled on ${DAY_NAME_MAP[newEntry.dayOfWeek] || `Day ${newEntry.dayOfWeek}`}, which may be excessive`
        });
      }
    }

    // Check for room conflicts
    if (binding.roomId) {
      const roomConflicts = existingEntries.filter(entry =>
        entry.dayOfWeek === newEntry.dayOfWeek &&
        entry.periodId === newEntry.periodId &&
        entry.roomId === binding.roomId &&
        entry.uuid !== newEntry.uuid
      );

      if (roomConflicts.length > 0) {
        conflicts.push({
          dayOfWeek: newEntry.dayOfWeek,
          periodId: newEntry.periodId,
          conflictType: 'ROOM_CONFLICT',
          resourceId: binding.roomId.toString(),
          resourceName: binding.roomName,
          bindingId: binding.uuid,
          conflictDescription: `Room ${binding.roomName} is already in use by ${roomConflicts.map(c => c.className).join(', ')} at this time`
        });
      }
    }

    return conflicts;
  }, []);

  const handlePendingEntryAdded = useCallback(async (newEntry, forceAdd = false) => {
    if (pendingAddOperationRef.current) {
      return { success: false, error: 'Operation in progress' };
    }
    
    try {
      pendingAddOperationRef.current = true;
      
      let entryWithClass;
      if (selectionType === 'classBand' && selectedClassBand) {
        let classBandId = selectedClassBand;
        
        if (typeof classBandId === 'object' && classBandId !== null) {
          classBandId = classBandId.id || classBandId.uuid;
        }
        
        entryWithClass = {
          ...newEntry,
          classBandId: classBandId,
          isClassBandEntry: true,
          className: newEntry.className || ''
        };
      } else {
        let classIdValue = newEntry.classId;
        
        if ((typeof classIdValue !== 'number' || classIdValue === null) && selectedClass) {
          let selectedClassId = selectedClass;
          
          if (typeof selectedClassId === 'object' && selectedClassId !== null) {
            selectedClassId = selectedClassId.id || selectedClassId.uuid;
          }
          
          const matchingBinding = bindings.find(b => b.classUuid === selectedClassId);
          if (matchingBinding && typeof matchingBinding.classId === 'number') {
            classIdValue = matchingBinding.classId;
          } else {
            const parsedId = parseInt(selectedClassId, 10);
            if (!isNaN(parsedId)) {
              classIdValue = parsedId;
            }
          }
        }
        
        entryWithClass = {
          ...newEntry,
          classId: classIdValue,
          isClassBandEntry: false
        };
      }
      
      const conflicts = await checkForConflicts(
        [...entries, ...pendingEntries],
        entryWithClass,
        bindings,
        true
      );
      
      if (conflicts.length > 0 && !forceAdd) {
        return { success: false, conflicts };
      }
      
      const entryWithId = {
        ...entryWithClass,
        uuid: generateEntryId()
      };
      
      setPendingEntries(prev => [...prev, entryWithId]);
      return { success: true };
    } finally {
      setTimeout(() => {
        pendingAddOperationRef.current = false;
      }, 300);
    }
  }, [selectedClass, selectedClassBand, selectionType, bindings, entries, pendingEntries, checkForConflicts]);

  const handleEntryRemoved = useCallback(async (entryKey) => {
    if (isRemovingRef.current) {
      return false;
    }
    
    try {
      isRemovingRef.current = true;

      if (typeof entryKey === 'number') {
        const entriesCopy = [...entries];
        const saved = entriesCopy.find(e => e.id === entryKey);
        
        if (saved) {
          setEntries(prev => prev.filter(e => e.id !== entryKey));
          if (timetableId) {
            try {
              await TimetableGenerationService.deleteEntry(entryKey);
              toast.success('Entry deleted successfully');
              return true;
            } catch (error) {
              setEntries(entriesCopy);
              toast.error('Failed to delete entry: ' + (error.message || 'Unknown error'));
              return false;
            }
          }
          return true;
        }
      }

      if (typeof entryKey === 'string') {
        const numericId = parseInt(entryKey, 10);
        if (!isNaN(numericId) && String(numericId) === entryKey) {
          isRemovingRef.current = false;
          return await handleEntryRemoved(numericId);
        }
        
        const allEntriesCopy = [...entries];
        const savedEntry = allEntriesCopy.find(e => e.uuid === entryKey);
        
        if (savedEntry) {
          setEntries(prev => prev.filter(e => e.uuid !== entryKey));
          
          if (timetableId) {
            try {
              const idForApi = savedEntry.id || entryKey;
              await TimetableGenerationService.deleteEntry(idForApi);
              toast.success('Entry deleted successfully');
              return true;
            } catch (error) {
              setEntries(allEntriesCopy);
              toast.error('Failed to delete entry: ' + (error.message || 'Unknown error'));
              return false;
            }
          }
          return true;
        }
        
        const pendingCopy = [...pendingEntries];
        const pendingEntry = pendingCopy.find(e => e.uuid === entryKey);
        
        if (pendingEntry) {
          setPendingEntries(prev => prev.filter(e => e.uuid !== entryKey));
          toast.info('Removed pending entry');
          return true;
        } else {
          toast.error('Entry not found with UUID: ' + entryKey.substring(0, 8) + '...');
          return false;
        }
      }

      toast.error('Entry not found for deletion');
      return false;
    } finally {
      setTimeout(() => {
        isRemovingRef.current = false;
      }, 300);
    }
  }, [entries, pendingEntries, timetableId]);

  const saveScheduleToBackend = useCallback(async () => {
    if (!timetableId) return;
    setSaveInProgress(true);
    try {
      const backendEntries = entries.map(entry => {
        if (typeof entry.bindingId === 'number') {
          return {
            id: entry.id,
            uuid: entry.uuid,
            timetableId: timetableId,
            bindingId: entry.bindingId,
            dayOfWeek: entry.dayOfWeek,
            period: entry.periodId,
            roomId: entry.roomId,
            status: entry.status || "Active",
            subjectId: entry.subjectId,
            teacherId: entry.teacherId,
            durationMinutes: entry.durationMinutes || 45,
            periodType: entry.periodType || "Regular",
            classId: entry.classId
          };
        }
        const binding = bindings.find(b => b.uuid === entry.bindingId);
        if (!binding) {
          throw new Error(`Invalid binding reference in entry: ${entry.subjectName || 'Unknown subject'}`);
        }
        return {
          id: entry.id,
          uuid: entry.uuid,
          timetableId: timetableId,
          bindingId: binding.id,
          dayOfWeek: entry.dayOfWeek,
          period: entry.periodId,
          roomId: binding.roomId || entry.roomId,
          status: entry.status || "Active",
          subjectId: binding.subjectId || entry.subjectId,
          teacherId: binding.teacherId || entry.teacherId,
          durationMinutes: entry.durationMinutes || 45,
          periodType: entry.periodType || "Regular",
          classId: binding.classId || entry.classId
        };
      });
      
      await TimetableGenerationService.saveTimetableEntries(timetableId, backendEntries);
      toast.success("Schedule saved to backend!");
      setLastSavedAt(new Date());
      await loadScheduleFromBackend();
      return true;
    } catch (error) {
      toast.error(`Failed to save schedule: ${error.message || 'Unknown error'}`);
      return false;
    } finally {
      setSaveInProgress(false);
    }
  }, [timetableId, entries, bindings, loadScheduleFromBackend]);

  return {
    entries,
    setEntries,
    pendingEntries,
    setPendingEntries,
    allEntries,
    setAllEntries,
    conflicts,
    setConflicts,
    dataSource,
    setDataSource,
    lastDataLoadTime,
    setLastDataLoadTime,
    isLoading,
    setIsLoading,
    lastSavedAt,
    setLastSavedAt,
    saveInProgress,
    setSaveInProgress,
    loadScheduleFromBackend,
    handlePendingEntryAdded,
    handleEntryRemoved,
    saveScheduleToBackend,
    checkForConflicts,
    updateConflicts
  };
};

export const checkAuth = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    toast.error('Authentication required. Please log in.');
    return false;
  }
  return true;
};

export const DraggableBinding = ({
  binding,
  scheduledPeriods = 0,
  totalPeriods = 5,
  isOverscheduled = false,
  allBindings = [],
  useDrag
}) => {
  const remainingPeriods = Math.max(0, (binding.periodsPerWeek || totalPeriods) - scheduledPeriods);
  const isCompleted = remainingPeriods <= 0;
  const canDrag = !isCompleted;

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'binding',
    item: {
      binding,
      bindings: allBindings
    },
    canDrag: canDrag,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  }), [binding, scheduledPeriods, isCompleted, canDrag, allBindings]);

  const getBindingStatusClass = () => {
    if (isOverscheduled) return 'border-red-500 bg-red-50';
    if (isCompleted) return 'border-green-500 bg-green-50 opacity-60';
    return 'border-gray-200';
  };

  const getSubjectColor = () => {
    return { backgroundColor: stringToColor(binding.uuid || binding.subjectName) };
  };

  return (
    <div
      ref={drag}
      className={`p-3 my-2 border rounded-md ${
        canDrag ? 'cursor-move' : 'cursor-not-allowed'
      } ${
        isDragging ? 'opacity-50 bg-gray-100' : ''
      } ${getBindingStatusClass()}`}
      style={getSubjectColor()}
    >
      <div className="font-semibold">{binding.subjectName}</div>
      <div className="text-sm text-gray-600">
        {binding.teacherName} · {binding.classBandName || binding.className}
      </div>
      <div className="text-xs text-gray-500">Room: {binding.roomName}</div>
  
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs font-medium">
          Periods: {scheduledPeriods}/{binding.periodsPerWeek || totalPeriods}
        </span>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          isOverscheduled ? 'bg-red-100 text-red-800' :
          isCompleted ? 'bg-green-100 text-green-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {isOverscheduled ? 'Over-scheduled' :
           isCompleted ? 'Completed' :
           `${remainingPeriods} remaining`}
        </span>
      </div>
    </div>
  )}