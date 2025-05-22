import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import { Button } from 'flowbite-react';
import { FaPlus, FaTrash, FaArrowLeft, FaExclamationTriangle, FaEraser, FaSave, FaLock, FaUnlock, FaX } from 'react-icons/fa';
import { ArrowLeft, Lock, Unlock, X } from 'lucide-react';
import { useI18n } from "@/hook/useI18n.ts";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/component/Ui/dialog";

import TimetableGenerationService from '@/services/timetable/TimetableGenerationService';
import { 
  stringToColor, 
  DAY_NAME_MAP, 
  useTimetableEntries, 
  checkAuth 
} from './TimetableManualHelpers';
import TimetableService from '@/services/timetable/TimetableService';
import { updateTimetableEntryLockStatus } from '@/store/Timetable/timetableSlice';
import { useDispatch } from 'react-redux';

const PageManualScheduling = () => {
  const { t } = useI18n();
  const { id: timetableIdParam } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handlePublishTimetable = async () => {
    if (!timetableId || !selectedPlanSettingId) {
      toast.error(t('timetable.publishErrorNoId'));
      return;
    }
    if (pendingEntries.length > 0) {
      toast.error(t('timetable.savePendingEntriesBeforePublish'));
      return;
    }

    setIsPublishing(true);
    try {
      const updatedTimetable = await TimetableGenerationService.publishTimetable(timetableId, selectedPlanSettingId);
      setTimetable(updatedTimetable);
      toast.success(t('timetable.publishSuccess'));
      await loadScheduleFromBackend(); // Refresh entries
    } catch (error) {
      toast.error(t('timetable.publishError', { error: error.message || t('common.unknownError') }));
    } finally {
      setIsPublishing(false);
    }
  };

  const getInitialOrganizationId = () => {
    const storedOrgId = localStorage.getItem('selectedOrganizationId');
    if (storedOrgId) {
      const parsed = parseInt(storedOrgId, 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 1;
  };

 
  const [organizationId, setOrganizationId] = useState(getInitialOrganizationId());
  const [periods, setPeriods] = useState([]);
  const [bindings, setBindings] = useState([]);
  const [bindingSummaries, setBindingSummaries] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  
  const [timetableId, setTimetableId] = useState(
    timetableIdParam ? parseInt(timetableIdParam, 10) : null
  );
  const [timetable, setTimetable] = useState(null);

  const [selectedPlanSettingId, setSelectedPlanSettingId] = useState(null);
  const [planSettings, setPlanSettings] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-2025');
  const [selectedSemester, setSelectedSemester] = useState('1');

  const classChangeTimeout = useRef(null);

  const [classBands, setClassBands] = useState([]);
  const [selectedClassBand, setSelectedClassBand] = useState('');
  const [selectionType, setSelectionType] = useState('class');
  const [classBandBindings, setClassBandBindings] = useState([]);

  
  const [lockDialogOpen, setLockDialogOpen] = useState(false);
  const [entryToLock, setEntryToLock] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);


  const {
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
  } = useTimetableEntries(timetableId, selectedClass, selectedClassBand, selectionType, bindings);


  const [timetableExists, setTimetableExists] = useState(false);
  const [timetableCheckLoading, setTimetableCheckLoading] = useState(false);


  useEffect(() => {
    const handleStorage = () => {
      const storedOrgId = localStorage.getItem('selectedOrganizationId');
      if (storedOrgId) {
        const parsed = parseInt(storedOrgId, 10);
        if (!isNaN(parsed) && parsed !== organizationId) {
          setOrganizationId(parsed);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [organizationId]);

  
  const handleSaveTimetableAndEntries = async () => {
    if (pendingEntries.length === 0) {
      toast.info('No pending entries to save');
      return;
    }

    if (!selectedPlanSettingId) {
      toast.error(t('timetable.selectPlanSettingForValidation'));
      return;
    }
    
    setIsLoading(true);
    try {
      // Validate entries before saving
      const validationConflicts = await TimetableGenerationService.validateEntries(pendingEntries, selectedPlanSettingId);
      const actualConflicts = validationConflicts.filter(vc => vc.hasConflict);

      if (actualConflicts.length > 0) {
        actualConflicts.forEach(conflict => {
          toast.error(t('timetable.validationError', { details: conflict.conflictDetails }));
        });
        setIsLoading(false);
        return;
      }

      // Proceed with saving if no validation conflicts
      const params = {
        organizationId,
        selectedClass,
        selectedClassBand,
        selectionType,
        classId: selectedClass,
        planSettingId: selectedPlanSettingId,
        academicYear: selectedAcademicYear,
        semester: selectedSemester,
      };

      const result = await TimetableGenerationService.handleSaveTimetableAndEntries(
        pendingEntries, 
        bindings, 
        params
      );
      
      if (result.success) {
        setTimetable(result.timetable);
        setTimetableId(result.timetable.id);
        setPendingEntries([]); 
        
        if (result.failureCount > 0) {
          toast.warning(`Saved ${result.successCount} entries, but failed to save ${result.failureCount} entries.`);
        } else {
          toast.success(`Successfully saved all ${result.successCount} entries!`);
        }
        
        setLastSavedAt(new Date());
        
     
        await loadScheduleFromBackend();
      } else {
        toast.error(`Failed to save: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error(`Failed to save: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleManualSave = useCallback(async () => {
    if (pendingEntries.length === 0) {
      toast.info('No pending entries to save');
      return;
    }

    if (!selectedPlanSettingId) {
      toast.error(t('timetable.selectPlanSettingForValidation'));
      return;
    }

    setIsLoading(true);
    try {
      // Validate entries before saving
      const validationConflicts = await TimetableGenerationService.validateEntries(pendingEntries, selectedPlanSettingId);
      const actualConflicts = validationConflicts.filter(vc => vc.hasConflict);

      if (actualConflicts.length > 0) {
        actualConflicts.forEach(conflict => {
          toast.error(t('timetable.validationError', { details: conflict.conflictDetails }));
        });
        setIsLoading(false);
        return;
      }

      // Proceed with saving if no validation conflicts
      const result = await TimetableGenerationService.handleManualSave(
        pendingEntries,
        bindings,
        timetableId,
        selectedClass,
        selectedClassBand,
        selectionType
      );
      
      if (result.success) {
        if (result.failureCount > 0) {
          toast.warning(`Saved ${result.successCount} entries, but failed to save ${result.failureCount} entries.`);
        } else {
          toast.success(`${result.successCount} entries saved successfully!`);
        }
        
        setPendingEntries([]);
        setLastSavedAt(new Date());
        
        await loadScheduleFromBackend();
      } else {
        toast.error(`Failed to save entries: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      toast.error(`Failed to save entries: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [pendingEntries, bindings, timetableId, selectedClass, selectedClassBand, selectionType, loadScheduleFromBackend]);


  const handleBackToTimetables = useCallback(() => {
    navigate('/timetable');
  }, [navigate]);
  

  const handleClearSchedule = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all scheduled entries? This action cannot be undone.')) {
      setEntries([]);
      setPendingEntries([]);
      toast.success('Schedule cleared successfully');
    }
  }, [setEntries, setPendingEntries]);


  const handleToggleAutosave = useCallback(() => {
    setAutosaveEnabled(prev => {
      const newState = !prev;
      toast.info(`Autosave ${newState ? 'enabled' : 'disabled'}`);
      return newState;
    });
  }, []);


  const loadBindingsForClassOrClassBand = useCallback(async (id, type) => {
    try {
      let bindingsData = [];
      const currentPlanSettingId = resolvePlanSettingsId(); // Get current plan setting ID

      if (type === 'class') {
        if (!currentPlanSettingId) {
          toast.error(t('timetable.selectPlanSettingToLoadBindings'));
          setBindings([]); // Clear bindings if no plan setting is selected
          return [];
        }
        bindingsData = await TimetableGenerationService.getBindingsForClass(id, organizationId, currentPlanSettingId);
        
        const formattedBindings = bindingsData.map(binding => ({
          id: binding.id,
          uuid: binding.uuid,
          classId: binding.classId,
          classUuid: binding.classUuid,
          teacherId: binding.teacherId,
          teacherName: binding.teacherName,
          teacherFirstName: binding.teacherFirstName,
          teacherLastName: binding.teacherLastName,
          teacherFullName: binding.teacherFullName || 
            (binding.teacherFirstName && binding.teacherLastName ? 
              `${binding.teacherFirstName} ${binding.teacherLastName}` : 
              binding.teacherName),
          className: binding.className,
          classBandId: binding.classBandId || '',
          classBandUuid: binding.classBandUuid || '',
          classBandName: binding.classBandName || '',
          subjectId: binding.subjectId,
          subjectName: binding.subjectName,
          roomId: binding.roomId,
          roomName: binding.roomName,
          periodsPerWeek: binding.periodsPerWeek || 5,
          isFixed: binding.isFixed || false
        }));
        
        setBindings(formattedBindings);
      } else if (type === 'classBand') {
        bindingsData = await TimetableGenerationService.getBindingsForClassBand(id);
        
        const formattedBindings = bindingsData.map(binding => ({
          id: binding.id,
          uuid: binding.uuid,
          classId: binding.classId || null,
          classUuid: binding.classUuid || null,
          teacherId: binding.teacherId,
          teacherName: binding.teacherName,
          teacherFirstName: binding.teacherFirstName,
          teacherLastName: binding.teacherLastName,
          teacherFullName: binding.teacherFullName || 
            (binding.teacherFirstName && binding.teacherLastName ? 
              `${binding.teacherFirstName} ${binding.teacherLastName}` : 
              binding.teacherName),
          className: binding.className || '',
          classBandId: binding.classBandId,
          classBandUuid: binding.classBandUuid,
          classBandName: binding.classBandName,
          subjectId: binding.subjectId,
          subjectName: binding.subjectName,
          subjectInitials: binding.subjectInitials,
          roomId: binding.roomId,
          roomName: binding.roomName,
          roomCode: binding.roomCode,
          periodsPerWeek: binding.periodsPerWeek || 5,
          isFixed: binding.isFixed || false,
          priority: binding.priority || 0,
          notes: binding.notes || '',
          organizationUuid: binding.organizationUuid,
          organizationName: binding.organizationName
        }));
        
        setClassBandBindings(formattedBindings);
        setBindings(prev => [...prev, ...formattedBindings]);
      }
      
      return bindingsData;
    } catch (error) {
      console.error(`Error loading bindings for ${type} ${id}:`, error);
      toast.error(`Error loading bindings: ${error.message || 'Unknown error'}`);
      return [];
    }
  }, [organizationId, resolvePlanSettingsId, t]);


  const debouncedHandleClassChange = (classObj, type = 'class') => {
    if (classChangeTimeout.current) {
      clearTimeout(classChangeTimeout.current);
    }
    classChangeTimeout.current = setTimeout(() => {
      handleClassChange(classObj, type);
    }, 400);
  };

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

  const handleClassChange = useCallback(async (classObj, type = 'class') => {
    if (!classObj) {
      if (type === 'class') {
        setSelectedClass(null);
      } else if (type === 'classBand') {
        setSelectedClassBand(null);
      }
      setEntries([]);
      setPendingEntries([]);
      setDataSource('no-selection');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log(`Selected ${type}:`, classObj);
      
      setSelectionType(type);
      if (type === 'class') {
        setSelectedClass(classObj);
        setSelectedClassBand(null);

        let classId = classObj.id;
        if (typeof classObj === 'object' && classObj !== null) {
          if (!classObj.id && !classObj.uuid) {
            console.error('Class object missing required properties:', classObj);
            throw new Error('Invalid class data: missing ID or UUID');
          }
        } else {
          classId = classObj;
        }

        await TimetableGenerationService.getClassTimetableEntries(classId);

        const classUuid = classObj.uuid || classObj.id;
        // Ensure planSettingId is available before loading bindings
        const planSettingId = resolvePlanSettingsId();
        if (planSettingId) {
          await loadBindingsForClassOrClassBand(classUuid, 'class');
        } else {
          toast.info(t('timetable.selectPlanSettingFirst'));
          setBindings([]); // Clear bindings if no plan setting
        }
      } else if (type === 'classBand') {
        setSelectedClassBand(classObj);
        setSelectedClass(null);

        let classBandId = classObj.id;
        if (typeof classObj === 'object' && classObj !== null) {
          if (!classObj.id && !classObj.uuid) {
            console.error('Class band object missing required properties:', classObj);
            throw new Error('Invalid class band data: missing ID or UUID');
          }
        } else {
    
          classBandId = classObj;
        }

        await TimetableGenerationService.getClassBandTimetableEntries(classBandId);
        
        const classBandUuid = classObj.uuid || classObj.id;
        await loadBindingsForClassOrClassBand(classBandUuid, 'classBand');
      }
      
      await loadScheduleFromBackend();
    } catch (error) {
      console.error(`Error in handleClassChange for ${type} ${classObj && (classObj.id || classObj.uuid)}:`, error);
      toast.error(`Error loading data: ${error.message || 'Unknown error'}`);
      setEntries([]);
      setDataSource('error');
    } finally {
      setIsLoading(false);
    }
  }, [
    loadScheduleFromBackend, 
    setSelectedClass, 
    setSelectedClassBand,
    setSelectionType, 
    setIsLoading, 
    setEntries, 
    setPendingEntries, 
    setDataSource, 
    loadBindingsForClassOrClassBand,
    resolvePlanSettingsId, // Added resolvePlanSettingsId to dependency array
    t // Added t to dependency array
  ]);


  const resolvePlanSettingsId = useCallback(() => {
    let planSettingsIdNumber = selectedPlanSettingId;
    if (!planSettingsIdNumber) {
      const storedId = localStorage.getItem("selectedPlanSettingsId");
      if (storedId) {
        planSettingsIdNumber = parseInt(storedId, 10);
        if (isNaN(planSettingsIdNumber)) planSettingsIdNumber = null;
      }
      if (!planSettingsIdNumber && planSettings.length > 0) {
        planSettingsIdNumber = planSettings[0].id;
      }
    }
    if (planSettingsIdNumber) {
      localStorage.setItem("selectedPlanSettingsId", planSettingsIdNumber.toString());
    }
    return planSettingsIdNumber;
  }, [selectedPlanSettingId, planSettings]);


  const handlePlanSettingChange = useCallback(async (planSettingId) => {
    let planSettingsIdNumber = planSettingId;
    if (!planSettingsIdNumber) {
      planSettingsIdNumber = resolvePlanSettingsId();
    }
    setSelectedPlanSettingId(planSettingsIdNumber);
    if (planSettingsIdNumber) {
      localStorage.setItem("selectedPlanSettingsId", planSettingsIdNumber.toString());
    }
    
    setIsLoading(true);
    try {
      const periodsData = await TimetableGenerationService.getPeriods(organizationId, planSettingsIdNumber);
      const filteredPeriods = periodsData.filter(period => 
        period.allowScheduling && 
        period.showInTimetable && 
        period.periodType !== 'BREAK' && 
        period.periodType !== 'LUNCH'
      );
      
      const formattedPeriods = filteredPeriods.map(period => ({
        id: period.periodNumber || period.id,
        name: period.name,
        startTime: period.startTime ? period.startTime.slice(0, 5) : '',
        endTime: period.endTime ? period.endTime.slice(0, 5) : '',
        days: period.days || [],
        planSettingsId: period.planSettingsId
      }));
      
      setPeriods(formattedPeriods);
      toast.success('Periods updated for selected plan setting');
    } catch (error) {
      toast.error(`Error loading periods: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, resolvePlanSettingsId]);


  const checkTimetableExistence = useCallback(async (planSettingId, classId, classBandId, academicYear, semester) => {
    setTimetableCheckLoading(true);
    setTimetableExists(false);
    try {
      const params = {
        organizationId,
        planSettingId,
        academicYear,
        semester,
      };
      if (selectionType === 'class') {
        params.classId = classId;
      } else if (selectionType === 'classBand') {
        params.classId = classBandId;
      }
  
      const response = await TimetableGenerationService.findOrCreateTimetable({ ...params }, false);
      if (response && response.id) {
        setTimetable(response);
        setTimetableId(response.id);
        setTimetableExists(true);
        const entries = await TimetableGenerationService.getTimetableEntries(response.id);
        setEntries(entries);
      } else {
        setTimetable(null);
        setTimetableId(null);
        setTimetableExists(false);
        setEntries([]);
      }
    } catch (error) {
      setTimetable(null);
      setTimetableId(null);
      setTimetableExists(false);
      setEntries([]);
    } finally {
      setTimetableCheckLoading(false);
    }
  }, [organizationId, selectionType, setTimetable, setTimetableId, setEntries]);


  useEffect(() => {
    if (selectedPlanSettingId && (selectedClass || selectedClassBand)) {
      checkTimetableExistence(
        selectedPlanSettingId,
        selectedClass,
        selectedClassBand,
        selectedAcademicYear,
        selectedSemester
      );
    }

  }, [selectedPlanSettingId, selectedClass, selectedClassBand, selectedAcademicYear, selectedSemester, selectionType]);


  const handleGenerateTimetable = async () => {
    if (!selectedClass || !selectedPlanSettingId) {
      toast.error('Please select a class and plan setting');
      return;
    }
    setIsLoading(true);
    try {
      const params = {
        organizationId,
        classId: selectedClass,
        planSettingId: selectedPlanSettingId,
        academicYear: selectedAcademicYear,
        semester: selectedSemester,
      };
      const timetable = await TimetableGenerationService.findOrCreateTimetable(params, true);
      setTimetable(timetable);
      setTimetableId(timetable.id);
      const timetableEntries = await TimetableGenerationService.getTimetableEntries(timetable.id);
      setEntries(timetableEntries);
      if (pendingEntries.length > 0) {
        await handleSaveTimetableAndEntries();
      }
      toast.success(`Timetable ${timetable.id} generated successfully`);
      setTimetableExists(true);
    } catch (error) {
      toast.error(`Failed to generate timetable: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchPlanSettings = useCallback(async () => {
    try {
      const data = await TimetableGenerationService.getPlanSettings(organizationId);
      setPlanSettings(data || []);
      
      const storedPlanSettingId = localStorage.getItem("selectedPlanSettingsId");
      let effectivePlanSettingId = selectedPlanSettingId;
      
      if (!effectivePlanSettingId && storedPlanSettingId) {
        effectivePlanSettingId = parseInt(storedPlanSettingId, 10);
        if (!isNaN(effectivePlanSettingId)) {
          const planSettingExists = (data || []).some(ps => ps.id === effectivePlanSettingId);
          if (!planSettingExists) {
            effectivePlanSettingId = null;
          }
        } else {
          effectivePlanSettingId = null;
        }
      }
      
      if (!effectivePlanSettingId && (data || []).length > 0) {
        effectivePlanSettingId = data[0].id;
      }
      
      if (effectivePlanSettingId) {
        setSelectedPlanSettingId(effectivePlanSettingId);
        localStorage.setItem("selectedPlanSettingsId", effectivePlanSettingId.toString());
      }
    } catch (error) {
      toast.error('Error loading plan settings');
    }
  }, [organizationId, selectedPlanSettingId]);

  const loadRealData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!checkAuth()) {
        setIsLoading(false);
        return;
      }
      
      const [classesData, classBandsData] = await Promise.all([
        TimetableGenerationService.getClasses(organizationId),
        TimetableGenerationService.getClassBands(organizationId)
      ]);
      
   
      const formattedClasses = classesData.map(cls => ({
        id: cls.id,
        uuid: cls.uuid,
        name: cls.name,
        initial: cls.initial || cls.name.charAt(0),
        type: 'class'
      }));
      

      const formattedClassBands = classBandsData.map(band => ({
        id: band.id,
        uuid: band.uuid, 
        name: band.name,
        initial: band.name.charAt(0),
        type: 'classBand',
        participatingClasses: band.participatingClasses || [],
        raw: band
      }));
      
      setClasses(formattedClasses);
      setClassBands(formattedClassBands);
      
 
      let effectiveSelected = selectedClass || selectedClassBand;
      let effectiveType = selectionType;
      
      if (!effectiveSelected) {
        if (formattedClasses.length > 0) {
          effectiveSelected = formattedClasses[0].id;
          effectiveType = 'class';
        } else if (formattedClassBands.length > 0) {
          effectiveSelected = formattedClassBands[0].id;
          effectiveType = 'classBand';
        }
      }
      
      setSelectionType(effectiveType);
      
      if (effectiveType === 'class') {
        setSelectedClass(effectiveSelected);
        setSelectedClassBand('');
        await handleClassChange(effectiveSelected, 'class');
      } else {
        setSelectedClass('');
        setSelectedClassBand(effectiveSelected);
        await handleClassChange(effectiveSelected, 'classBand');
      }
      
      await fetchPlanSettings();
      
  
      const planSettingsIdNumber = resolvePlanSettingsId();
      const periodsData = await TimetableGenerationService.getPeriods(organizationId, planSettingsIdNumber);
      
      const filteredPeriods = periodsData.filter(period => 
        period.allowScheduling && 
        period.showInTimetable && 
        period.periodType !== 'BREAK' && 
        period.periodType !== 'LUNCH'
      );
      
      const formattedPeriods = filteredPeriods.map(period => ({
        id: period.periodNumber || period.id,
        name: period.name,
        startTime: period.startTime ? period.startTime.slice(0, 5) : '',
        endTime: period.endTime ? period.endTime.slice(0, 5) : '',
        days: period.days || [],
        planSettingsId: period.planSettingsId
      }));
      
      setPeriods(formattedPeriods);
      
 
      if (timetableId) {
        await loadScheduleFromBackend();
      }
      
      setDataSource('api');
      setLastDataLoadTime(new Date());
      toast.success('Data loaded successfully from API');
    } catch (error) {
      toast.error(t('timetable.loadDataFailed', { error: error.message || t('common.unknownError') }));
    } finally {
      setIsLoading(false);
    }
  }, [
    organizationId, 
    selectedClass, 
    selectedClassBand, 
    timetableId, 
    fetchPlanSettings, 
    handleClassChange, 
    loadScheduleFromBackend, 
    resolvePlanSettingsId, 
    selectionType,
    t
  ]);


  useEffect(() => {
    loadRealData();
    
    if (timetableIdParam) {
      const id = parseInt(timetableIdParam, 10);
      if (!isNaN(id)) {
        setTimetableId(id);
        (async () => {
          try {
            const timetable = await TimetableGenerationService.getTimetableById(id);
            setTimetable(timetable);
            const entries = await TimetableGenerationService.getTimetableEntries(id);
            setEntries(entries);
          } catch (error) {
            toast.error(t('timetable.failedToLoadTimetable', { error: error.message || t('common.unknownError') }));
          }
        })();
      }
    }
  }, []);


  const allDays = React.useMemo(() => {
    if (!Array.isArray(periods) || periods.length === 0) return [];
    return Array.from(new Set(periods.flatMap(period => Array.isArray(period.days) ? period.days : []))).sort((a, b) => a - b);
  }, [periods]);


  const translatedDayNameMap = {
    1: t('days.monday'),
    2: t('days.tuesday'),
    3: t('days.wednesday'),
    4: t('days.thursday'),
    5: t('days.friday'),
    6: t('days.saturday'),
    7: t('days.sunday')
  };

  const daysToShow = allDays.map(dayNum => translatedDayNameMap[dayNum] || DAY_NAME_MAP[dayNum]);

  const filteredBindings = React.useMemo(() => {
 
    const getUuid = (obj) => {
      if (!obj) return null;
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'object' && obj.uuid) return obj.uuid;
      if (typeof obj === 'object' && obj.id) return obj.id;
      return null;
    };

    if (selectionType === 'class') {
      if (!selectedClass) return [];
      const classUuid = getUuid(selectedClass);
      if (!classUuid) return [];
      return bindings.filter(binding => binding.classUuid === classUuid);
    } else if (selectionType === 'classBand') {
      if (!selectedClassBand) return [];
      const classBandUuid = getUuid(selectedClassBand);
      if (!classBandUuid) return [];
      return bindings.filter(binding => binding.classBandUuid === classBandUuid);
    }
    return [];
  }, [selectionType, selectedClass, selectedClassBand, bindings]);


  useEffect(() => {
   
    window.PageManualSchedulingComponent = {
      setEntryToLock,
      setLockDialogOpen
    };

    return () => {
      window.PageManualSchedulingComponent = undefined;
    };
  }, []);

  const handleLockClick = (entry) => {
    setEntryToLock(entry);
    setLockDialogOpen(true);
  };


  const handleLockConfirm = async () => {
    if (!entryToLock) {
      setLockDialogOpen(false);
      return;
    }
    
    setIsLoading(true);
    try {
 
      const entryUuid = entryToLock.uuid || entryToLock.id?.toString();
      
      
      if (!entryUuid) {
        toast.error('Cannot update lock status: missing entry UUID');
        setLockDialogOpen(false);
        setIsLoading(false);
        return;
      }
      
     
      const newLockStatus = !entryToLock.isLocked;
      
 
      const result = await TimetableService.updateTimetableEntryLockStatus(
        entryUuid,
        newLockStatus
      );
      
      if (result) {
        toast.success(
          newLockStatus 
            ? 'Entry locked successfully' 
            : 'Entry unlocked successfully'
        );
        
 
        setEntries(prevEntries => 
          prevEntries.map(entry => 
            (entry.uuid === entryUuid) 
              ? { ...entry, isLocked: newLockStatus } 
              : entry
          )
        );
        

        if (typeof loadScheduleFromBackend === 'function') {
          await loadScheduleFromBackend();
        }
      }
    } catch (error) {
      console.error("Lock/unlock error:", error); 
      toast.error(
        `${entryToLock.isLocked ? 'Failed to unlock entry' : 'Failed to lock entry'}: ${
          error.message || 'Unknown error'
        }`
      );
    } finally {
      setIsLoading(false);
      setLockDialogOpen(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-auto p-2 md:p-4">
            <div className="container mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Button
                    color="light"
                    onClick={handleBackToTimetables}
                    className="mr-4"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('navigation.backToTimetables')}
                  </Button>
                  <h1 className="text-2xl font-bold">
                    {t('timetable.manualScheduling')}
                  </h1>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    color="light"
                    onClick={loadRealData}
                    disabled={isLoading}
                    size="sm"
                  >
                    {isLoading ? t('common.loading') : t('timetable.refreshData')}
                  </Button>
                  <Button
                    color="light"
                    onClick={handleClearSchedule}
                    disabled={entries.length === 0 && pendingEntries.length === 0}
                    size="sm"
                  >
                    <FaEraser className="mr-2" />
                    {t('timetable.clearSchedule')}
                  </Button>
                  <Button
                    color="light"
                    onClick={handleGenerateTimetable}
                    disabled={isLoading || !selectedPlanSettingId || timetableExists || timetableCheckLoading}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    style={{ display: timetableExists ? 'none' : undefined }}
                    size="sm"
                  >
                    <FaPlus className="mr-2" />
                    {t('timetable.generateTimetable')}
                  </Button>
                  <Button
                    color={autosaveEnabled ? "success" : "light"}
                    onClick={handleToggleAutosave}
                    size="sm"
                  >
                    {autosaveEnabled ? t('timetable.autosaveOn') : t('timetable.autosaveOff')}
                  </Button>
                  <Button
                    color="success"
                    onClick={handleManualSave}
                    disabled={saveInProgress || pendingEntries.length === 0}
                    size="sm"
                  >
                    <FaSave className="mr-2" />
                    {saveInProgress ? t('common.saving') : (
                      pendingEntries.length > 0 ? 
                      `${t('timetable.savePending')} (${pendingEntries.length})` : 
                      t('timetable.saveNow')
                    )}
                  </Button>
                  <Button
                    color="info"
                    onClick={handlePublishTimetable}
                    disabled={!timetableId || timetable?.isPublished || pendingEntries.length > 0 || isPublishing || isLoading}
                    size="sm"
                  >
                    {isPublishing ? t('timetable.publishing') : t('timetable.publishTimetable')}
                  </Button>
                </div>
              </div>

              {lastSavedAt && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-2 mb-2 text-xs">
                  {t('timetable.lastSaved', { time: new Date(lastSavedAt).toLocaleString() })}
                </div>
              )}

              {timetable && (
                <div className={`border-l-4 p-2 mb-2 ${timetable.isPublished ? 'bg-green-50 border-green-500 text-green-700' : 'bg-blue-50 border-blue-500 text-blue-700'}`}>
                  <p>
                    <span className="font-semibold">{t('timetable.currentTimetable')}:</span> 
                    {t('timetable.id')}: {timetable.id}, {t('timetable.created')}: {new Date(timetable.createdDate).toLocaleString()}
                  </p>
                  <p>
                    <span className="font-semibold">{t('timetable.academicYear')}:</span> {timetable.academicYear}, 
                    <span className="font-semibold"> {t('timetable.semester')}:</span> {timetable.semester}
                  </p>
                  <p>
                    <span className="font-semibold">{t('timetable.status')}:</span> 
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${timetable.isPublished ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                      {timetable.isPublished ? t('timetable.statusPublished') : t('timetable.statusDraft')}
                    </span>
                    <span className="ml-2 font-semibold">{t('timetable.version')}:</span> {timetable.version}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('timetable.selectClass')} / {t('timetable.selectClassBand')}:
                </label>
                <div className="space-y-3">
                  {/* Classes Row */}
                  {Array.isArray(classes) && classes.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-2">
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wide mr-2">{t('timetable.classes')}</span>
                        <span className="text-xs text-gray-400">({classes.length})</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2" style={{maxHeight: '60px'}}>
                        {classes.map(cls => {
             
                          let isSelected = false;
                          
                          if (selectionType === 'class' && selectedClass !== null && selectedClass !== undefined) {
                            if (typeof selectedClass === 'object' && 'id' in selectedClass) {
                              isSelected = selectedClass.id === cls.id;
                            } else if (typeof selectedClass === 'string' || typeof selectedClass === 'number') {
                              isSelected = String(selectedClass) === String(cls.id);
                            }
                          }
                          
                          return (
                            <Button
                              key={cls.id}
                              color={isSelected ? "blue" : "light"}
                              onClick={() => debouncedHandleClassChange(cls, 'class')}
                              size="sm"
                              className={`whitespace-nowrap transition-all duration-150 ${
                                isSelected
                                  ? 'ring-2 ring-blue-400 bg-blue-50 border-blue-500' 
                                  : 'hover:bg-blue-50'}`}
                              style={{ minWidth: 100 }}
                            >
                              {cls.name}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* Class Bands Row */}
                  {Array.isArray(classBands) && classBands.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-2">
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-bold text-purple-700 uppercase tracking-wide mr-2">{t('timetable.classBands') || 'Class Bands'}</span>
                        <span className="text-xs text-gray-400">({classBands.length})</span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2" style={{maxHeight: '60px'}}>
                        {classBands.map(band => {
                          let isSelected = false;
                          
                          if (selectionType === 'classBand' && selectedClassBand !== null && selectedClassBand !== undefined) {
                            if (typeof selectedClassBand === 'object' && 'id' in selectedClassBand) {
                              isSelected = selectedClassBand.id === band.id;
                            } else if (typeof selectedClassBand === 'string' || typeof selectedClassBand === 'number') {
                              isSelected = String(selectedClassBand) === String(band.id);
                            }
                          }
                          
                          return (
                            <Button
                              key={band.id}
                              color={isSelected ? "purple" : "light"}
                              onClick={() => debouncedHandleClassChange(band, 'classBand')}
                              size="sm"
                              className={`whitespace-nowrap transition-all duration-150 ${
                                isSelected
                                  ? 'ring-2 ring-purple-400 bg-purple-50 border-purple-500' 
                                  : 'hover:bg-purple-50'}`}
                              style={{ minWidth: 100 }}
                            >
                              {band.name}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {/* No classes or class bands */}
                  {(!Array.isArray(classes) || classes.length === 0) && (!Array.isArray(classBands) || classBands.length === 0) && (
                    <div className="text-gray-500">{t('timetable.noClassesAvailable')}</div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('timetable.selectPlanSetting')}:
                </label>
                <select
                  className="p-2 border rounded w-full"
                  value={selectedPlanSettingId || ''}
                  onChange={e => handlePlanSettingChange(Number(e.target.value))}
                  disabled={isLoading}
                >
                  <option value="">{t('timetable.selectAPlanSetting')}</option>
                  {planSettings.map(ps => (
                    <option key={ps.id} value={ps.id}>{ps.name || `Plan Setting ${ps.id}`}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {t('timetable.planSettingUpdateNote')}
                </p>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('timetable.academicYear')}:
                  </label>
                  <input
                    type="text"
                    className="p-2 border rounded w-full"
                    value={selectedAcademicYear}
                    onChange={e => setSelectedAcademicYear(e.target.value)}
                    placeholder="e.g. 2024-2025"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('timetable.semester')}:
                  </label>
                  <select
                    className="p-2 border rounded w-full"
                    value={selectedSemester}
                    onChange={e => setSelectedSemester(e.target.value)}
                  >
                    <option value="1">{t('timetable.semester')} 1</option>
                    <option value="2">{t('timetable.semester')} 2</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/4 pr-0 md:pr-4 overflow-y-auto max-h-[calc(100vh-400px)] mb-4 md:mb-0">
                  <h2 className="text-lg font-semibold mb-2">Available Subjects</h2>
                  {isLoading ? (
                    <div className="text-center p-4 text-gray-500">Loading subjects...</div>
                  ) : Array.isArray(filteredBindings) && filteredBindings.length > 0 ? (
                    filteredBindings.map(binding => {
                      const scheduledCount = [...entries, ...pendingEntries].filter(
                        entry => entry.bindingId === binding.uuid
                      ).length;
                      
                      return (
                        <DraggableBinding
                          key={binding.uuid}
                          binding={binding}
                          scheduledPeriods={scheduledCount}
                          totalPeriods={binding.periodsPerWeek || 5}
                          isOverscheduled={scheduledCount > (binding.periodsPerWeek || 5)}
                          allBindings={bindings}
                        />
                      );
                    })
                  ) : (
                    <div className="text-center p-4 text-gray-500">
                      No subjects available for the selected class.
                    </div>
                  )}
                </div>

                <div className="w-full md:w-3/4">
                  {isLoading ? (
                    <div className="text-center p-8 text-gray-500">Loading timetable...</div>
                  ) : (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="grid gap-2 mb-2" style={{gridTemplateColumns: `repeat(${daysToShow.length + 1}, minmax(0, 1fr))`}}>
                        <div className="bg-gray-100 p-2 text-center font-medium">Period / Day</div>
                        {daysToShow.map((day) => (
                          <div key={day} className="bg-gray-100 p-2 text-center font-medium">{day}</div>
                        ))}
                      </div>

                      {Array.isArray(periods) && periods.length > 0 ? (
                        periods.map(period => (
                          <div key={period.id} className="grid gap-2 mb-2" style={{gridTemplateColumns: `repeat(${daysToShow.length + 1}, minmax(0, 1fr))`}}>
                            <div className="bg-gray-100 p-2 text-center">
                              <div className="font-medium">{period.name}</div>
                              <div className="text-xs text-gray-500">{period.startTime} - {period.endTime}</div>
                            </div>
                            {allDays.map((dayNum) => (
                              period.days && period.days.includes(dayNum) ? (
                                <TimetableCell
                                  key={`${period.id}-${dayNum}`}
                                  day={dayNum - 1}
                                  period={period}
                                  entries={[...entries, ...pendingEntries]}
                                  pendingEntries={pendingEntries}
                                  onEntryAdded={handlePendingEntryAdded}
                                  onEntryRemoved={handleEntryRemoved}
                                  conflicts={conflicts}
                                  allBindings={bindings}
                                  selectedClass={selectedClass}
                                  handleLockClick={handleLockClick}
                                />
                              ) : (
                                <div key={`${period.id}-${dayNum}`} className="bg-gray-50" />
                              )
                            ))}
                          </div>
                        ))
                      ) : (
                        <div className="text-center p-4 text-gray-500">
                          No periods available. Please check your schedule configuration.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Button
                  color="primary"
                  onClick={handleSaveTimetableAndEntries}
                  disabled={pendingEntries.length === 0 || !selectedPlanSettingId || isLoading}
                  className="ml-2"
                >
                  {isLoading ? 'Saving...' : `Save Pending Entries${pendingEntries.length > 0 ? ` (${pendingEntries.length})` : ''}`}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Replace the existing lock dialog with this new implementation */}
      <Dialog open={lockDialogOpen} onOpenChange={setLockDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle className="flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Confirm Lock Items
            </DialogTitle>
            <button 
              onClick={() => setLockDialogOpen(false)} 
              className="rounded-full p-1 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          
          <div className="py-4">
            <p>
              Locked items will not be modified during automatic timetable generation.
            </p>
          </div>
          
          {/* Make sure these buttons are visible with proper styling */}
          <div className="flex justify-end space-x-2 mt-4 border-t pt-4">
            <button
              onClick={() => setLockDialogOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleLockConfirm}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            >
              <Lock className="h-4 w-4 mr-2" />
              {entryToLock?.isLocked ? "Unlock Item" : "Lock Item"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </DndProvider>
  );
};


const TimetableCell = ({
  day,
  period,
  entries,
  pendingEntries = [],
  onEntryAdded,
  onEntryRemoved,
  conflicts,
  allBindings,
  selectedClass,
  handleLockClick
}) => {
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [pendingEntry, setPendingEntry] = useState(null);
  const [pendingConflicts, setPendingConflicts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState(null);
  const { t } = useI18n();
  
 
  interface DragItem {
    binding: {
      uuid: string;
      classBandUuid?: string;
      classBandId?: string | number;
      classId?: string | number;
      periodsPerWeek?: number;
      subjectName: string;
      teacherFullName?: string;
      teacherName?: string;
      className?: string;
      classBandName?: string;
      roomName: string;
      subjectId: number;
      teacherId: number;
      roomId: number;
    };
    bindings?: any[];
  }
  
  const [{isOver, canDrop}, drop] = useDrop(() => ({
    accept: 'binding',
    drop: (item: DragItem) => {
      if (isProcessing) return;

      setIsProcessing(true);
      

      const processDrop = async () => {
        try {
          const scheduledPeriods = entries.filter(
            entry => entry.bindingId === item.binding.uuid
          ).length;
          const maxPeriods = item.binding.periodsPerWeek || 5;
          if (scheduledPeriods >= maxPeriods) {
            toast.error('All periods for this subject are already scheduled.');
            return;
          }
          
          const isClassBandBinding = !!item.binding.classBandUuid || !!item.binding.classBandId;
          
          let classBandIdValue;
          if (isClassBandBinding) {
            if (typeof item.binding.classBandId === 'number') {
              classBandIdValue = item.binding.classBandId;
            } else {
              try {
                const classBandDetails = await TimetableGenerationService.getClassBandDetails(
                  item.binding.classBandUuid
                );
                classBandIdValue = classBandDetails.data?.id;
              } catch (err) {
                console.error("Error getting class band details:", err);
                classBandIdValue = item.binding.classBandId;
              }
            }
          }
          
          let classIdValue = null;
          if (!isClassBandBinding) {
            if (typeof item.binding.classId === 'number') {
              classIdValue = item.binding.classId;
            } else {
    
              if (typeof selectedClass === 'object' && selectedClass !== null) {
                classIdValue = selectedClass.id;
              } else {
                const classBinding = allBindings.find(b => b.classUuid === selectedClass);
                if (classBinding && typeof classBinding.classId === 'number') {
                  classIdValue = classBinding.classId;
                } else {
                  const parsedId = parseInt(selectedClass, 10);
                  if (!isNaN(parsedId)) {
                    classIdValue = parsedId;
                  }
                }
              }
            }
          }
          
          const newEntry = {
            dayOfWeek: day + 1,
            periodId: period.id,
            bindingId: item.binding.uuid,
            subjectName: item.binding.subjectName,
            teacherName: item.binding.teacherFullName || item.binding.teacherName || 'No Teacher',
            className: isClassBandBinding ? item.binding.classBandName : (item.binding.className || ''),
            roomName: item.binding.roomName,
            isManuallyScheduled: true,
            status: "Draft",
            classId: isClassBandBinding ? undefined : classIdValue,
            subjectId: item.binding.subjectId,
            teacherId: item.binding.teacherId,
            roomId: item.binding.roomId,
            classBandId: isClassBandBinding ? classBandIdValue : undefined,
            isClassBandEntry: isClassBandBinding
          };

          const conflictsList = [];

          const slotOccupied = entries.some(entry => 
            entry.dayOfWeek === newEntry.dayOfWeek && 
            entry.periodId === newEntry.periodId && 
            (
              (isClassBandBinding && entry.classBandId === newEntry.classBandId) ||
              (!isClassBandBinding && entry.classId === newEntry.classId)
            )
          );
          
          if (slotOccupied) {
            conflictsList.push({
              conflictType: 'SLOT_OCCUPIED',
              conflictDescription: `This time slot is already occupied for ${isClassBandBinding ? 'class band' : 'class'} ${newEntry.className}`
            });
          }
          

          const teacherConflicts = entries.filter(entry => 
            entry.teacherId === newEntry.teacherId &&
            entry.dayOfWeek === newEntry.dayOfWeek && 
            entry.periodId === newEntry.periodId &&
            (
              (isClassBandBinding && entry.classBandId !== newEntry.classBandId) ||
              (!isClassBandBinding && entry.classId !== newEntry.classId)
            )
          );
          
          if (teacherConflicts.length > 0) {
            conflictsList.push({
              conflictType: 'TEACHER_OVERLAP',
              conflictDescription: `Teacher ${newEntry.teacherName} is already scheduled at this time in ${teacherConflicts.map(c => c.className).join(', ')}`
            });
          }
          

          const roomConflicts = entries.filter(entry => 
            entry.roomId === newEntry.roomId &&
            entry.dayOfWeek === newEntry.dayOfWeek && 
            entry.periodId === newEntry.periodId &&
            (
              (isClassBandBinding && entry.classBandId !== newEntry.classBandId) ||
              (!isClassBandBinding && entry.classId !== newEntry.classId)
            )
          );
          
          if (roomConflicts.length > 0) {
            conflictsList.push({
              conflictType: 'ROOM_OVERLAP',
              conflictDescription: `Room ${newEntry.roomName} is already in use at this time by ${roomConflicts.map(c => c.className).join(', ')}`
            });
          }
          
          const teacherPeriodsOnDay = entries.filter(entry => 
            entry.teacherId === newEntry.teacherId &&
            entry.dayOfWeek === newEntry.dayOfWeek
          ).length;
          
          if (teacherPeriodsOnDay >= 5) { 
            conflictsList.push({
              conflictType: 'TEACHER_OVERLOAD',
              conflictDescription: `Teacher ${newEntry.teacherName} already has ${teacherPeriodsOnDay} periods scheduled on this day`
            });
          }

          const bindings = item.bindings || allBindings || [];
          

          if (conflictsList.length > 0) {
            setPendingEntry(newEntry);
            setPendingConflicts(conflictsList);
            setShowConflictDialog(true);
          } else {
            const result = await onEntryAdded(newEntry, false);
            
            if (result.conflicts && result.conflicts.length > 0) {
              setPendingEntry(newEntry);
              setPendingConflicts(result.conflicts);
              setShowConflictDialog(true);
            } else if (result.success) {
              toast.success('Class scheduled successfully');
            } else {
              toast.error(`Error scheduling class: ${result.error || 'Unknown error'}`);
            }
          }
        } catch (err) {
          toast.error(`Error scheduling class: ${err.message || 'Unknown error'}`);
        } finally {
          setIsProcessing(false);
        }
      };
      

      processDrop();
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  }), [day, period.id, entries, onEntryAdded, allBindings, isProcessing, selectedClass]);

  const cellEntries = React.useMemo(() => {
    const filtered = Array.isArray(entries) ?
      entries.filter(entry => {
        const entryDay = Number(entry.dayOfWeek);
        const entryPeriod = Number(entry.period !== undefined ? entry.period : entry.periodId);
        return entryDay === Number(day + 1) && entryPeriod === Number(period.id);
      }) : [];
    return filtered;
  }, [entries, day, period.id]);

  const cellConflicts = React.useMemo(() => {
    if (!Array.isArray(conflicts)) return [];
    return conflicts.filter(conflict => 
      Number(conflict.dayOfWeek) === Number(day + 1) && 
      (conflict.periodId === null || Number(conflict.periodId) === Number(period.id))
    );
  }, [conflicts, day, period.id]);
  
  const hasConflicts = cellConflicts.length > 0;

  const isPending = (entry) => pendingEntries.some(
    e => e.dayOfWeek === entry.dayOfWeek && e.periodId === entry.periodId && e.bindingId === entry.bindingId
  );

  const handleDelete = async (entry) => {
    if (deletingEntryId) return;
    
    const entryId = entry.id || entry.uuid;
    if (!entryId) {
      toast.error('Cannot delete: missing ID');
      return;
    }
    
    setDeletingEntryId(entryId);
    try {
      const success = await onEntryRemoved(entryId);
      if (success) {
        toast.success('Successfully deleted entry');
      } else {
        toast.error('Failed to delete entry');
      }
    } catch (error) {
      toast.error(`Delete failed: ${error.message || 'Error'}`);
    } finally {
      setTimeout(() => setDeletingEntryId(null), 300);
    }
  };

  return (
    <>
      <div
        ref={drop}
        className={`border min-h-[90px] p-1 sm:p-2 relative ${
          isOver && canDrop ? 'bg-blue-100' : 
          hasConflicts ? 'bg-red-50 border-red-300' : 'bg-white'
        } ${
          hasConflicts ? 'shadow-sm' : ''
        }`}
      >
        {hasConflicts && (
          <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
            <div className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {cellConflicts.length}
            </div>
          </div>
        )}
        
        {cellEntries.map(entry => {
          const entryColor = { backgroundColor: stringToColor(entry.bindingId || entry.subjectName) };
          const pending = isPending(entry);
          const isDeleting = deletingEntryId === (entry.id || entry.uuid);
          

          const entryConflicts = Array.isArray(conflicts) ? 
            conflicts.filter(conflict => 
              conflict.bindingId === entry.bindingId && 
              Number(conflict.dayOfWeek) === Number(entry.dayOfWeek) && 
              (conflict.periodId === null || Number(conflict.periodId) === Number(entry.periodId))
            ) : [];
          
          const hasEntryConflicts = entryConflicts.length > 0;
          
          return (
            <div
              key={entry.uuid || `${entry.dayOfWeek}-${entry.periodId}-${entry.bindingId}`}
              className={`p-1 sm:p-2 mb-1 rounded-md text-xs sm:text-sm border ${
                isDeleting ? 'border-red-500 ring-1 ring-red-300 opacity-60' : 
                hasEntryConflicts ? 'border-red-500 ring-1 ring-red-300' :
                pending ? 'border-yellow-500 ring-1 ring-yellow-300' : 
                'border-transparent'
              }`}
              style={entryColor}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium flex items-center">
                  {entry.subjectName}
                  {pending && <span className="ml-2 text-xs text-yellow-700" title="Unsaved">●</span>}
                  {isDeleting && <span className="ml-2 text-xs text-red-700 animate-pulse" title="Deleting...">⟳</span>}
                  {hasEntryConflicts && <span className="ml-2 text-xs text-red-700" title="Has conflicts">⚠️</span>}
                  {entry.isLocked !== undefined && (
                    <button 
                      type="button"
                      className="ml-2 text-xs cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLockClick(entry);
                      }}
                      title={entry.isLocked ? "Locked (click to unlock)" : "Unlocked (click to lock)"}
                    >
                      <span className={entry.isLocked ? 'text-gray-700' : 'text-gray-400'}>
                        {entry.isLocked ? '🔒' : '🔓'}
                      </span>
                    </button>
                  )}
                  {entry.isClassBandEntry && (
                    <span className="ml-2 px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-semibold">
                      Class Band Entry
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isDeleting) return;
                    handleDelete(entry);
                  }}
                  className={`text-gray-500 hover:text-red-500 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isDeleting || isProcessing}
                >
                  <FaTrash size={12} className={isDeleting ? "animate-pulse" : ""} />
                </button>
              </div>
              <div className="text-xs text-gray-600">
                {entry.teacherName} · {entry.className}
              </div>
              <div className="text-xs text-gray-500">
                Room: {entry.roomName}
              </div>
              <div className="text-xs text-gray-400">
                {entry.id ? `ID: ${entry.id}` : entry.uuid ? `UUID: ${entry.uuid.substring(0, 6)}...` : 'No ID'}
              </div>
              
              {hasEntryConflicts && (
                <div className="mt-1 text-xxs text-red-700 bg-red-50 p-1 rounded">
                  {entryConflicts[0]?.conflictDescription || 'Scheduling conflict detected'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showConflictDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full border border-red-500">
            <div className="flex items-center text-red-500 mb-2">
              <FaExclamationTriangle className="mr-2" />
              <h3 className="text-base font-semibold">Scheduling Conflicts Detected</h3>
              <button
                onClick={() => setShowConflictDialog(false)}
                className="ml-auto text-gray-500 hover:text-gray-700"
                disabled={isProcessing}
              >
                <span className="text-xl">×</span>
              </button>
            </div>

            <p className="text-sm mb-2">The following conflicts were detected with your scheduling request:</p>

            <div className="max-h-60 overflow-y-auto mb-4">
              {pendingConflicts.map((conflict, index) => {
                let bgColor = 'bg-red-50';
                let borderColor = 'border-red-300';
                let textColor = 'text-red-700';
                let icon = <FaExclamationTriangle className="mr-2 text-red-500" />;

                if (conflict.conflictType === 'TEACHER_OVERLOAD' || conflict.conflictType === 'TEACHER_EXCESSIVE_LOAD') {
                  bgColor = 'bg-yellow-50';
                  borderColor = 'border-yellow-300';
                  textColor = 'text-yellow-700';
                  icon = <FaExclamationTriangle className="mr-2 text-yellow-500" />;
                }
                
                return (
                  <div key={index} className={`p-2 mb-2 rounded ${bgColor} ${borderColor} border ${textColor} flex items-start`}>
                    {icon}
                    <div className="flex-1">
                      <p className="text-xs font-medium">{conflict.conflictDescription}</p>
                      {conflict.conflictType && (
                        <span className="inline-block text-xs bg-white px-2 py-0.5 rounded mt-1 opacity-75">
                          {conflict.conflictType.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConflictDialog(false)}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsProcessing(true);
                  try {
                    const result = await onEntryAdded(pendingEntry, true);
                    if (result.success) {
                      toast.success('Class scheduled with conflicts');
                    } else {
                      toast.error('Failed to schedule class');
                    }
                    setShowConflictDialog(false);
                  } catch (error) {
                    toast.error(`Error scheduling with conflicts: ${error.message || 'Unknown error'}`);
                  } finally {
                    setIsProcessing(false);
                  }
                }}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Schedule Anyway'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const DraggableBinding = ({
  binding,
  scheduledPeriods = 0,
  totalPeriods = 5,
  isOverscheduled = false,
  allBindings = []
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
  );
};

export default PageManualScheduling;
