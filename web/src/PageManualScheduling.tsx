import {
  dummyPeriods,
  dummyBindings,
  dummyEntries,
  dummyConflicts,
  dummyBindingSummaries,
  DummyBinding,
  DummyEntry,
  DummyBindingSummary,
  getClassInfoForUI,
  getFilteredBindings,
  addDummyEntry,
  removeDummyEntry,
  DAYS_OF_WEEK,
  generateCompleteTimetable,
  getSampleData,
  prePopulatedBindingSummaries,
  generateDummyConflicts
} from '@/services/timetable/dummySchedulingData';

// Load dummy data
const loadDummyData = useCallback(() => {
  setIsLoading(true);
  try {
    // 1. Set dummy periods
    setPeriods(dummyPeriods);

    // 2. Set dummy bindings
    setBindings(dummyBindings);

    // 3. Set dummy classes
    const classInfo = getClassInfoForUI();
    setClasses(classInfo);

    // 4. Set first class as selected by default if not already selected
    const effectiveSelectedClass = selectedClass || (classInfo.length > 0 ? classInfo[0].id : '');
    if (effectiveSelectedClass !== selectedClass) {
      setSelectedClass(effectiveSelectedClass);
    }

    // 5. Get appropriate sample data for the selected class
    if (effectiveSelectedClass) {
      // Option 1: Load pre-populated entries (simple setup)
      const sampleData = getSampleData(effectiveSelectedClass);
      
      // Option 2: Generate a more complete timetable (fuller demo)
      // Uncomment this and comment the previous line to get a more filled timetable
      // const sampleData = generateCompleteTimetable(effectiveSelectedClass);
      
      setEntries(sampleData.entries);
      setConflicts(sampleData.conflicts);
      setBindingSummaries(sampleData.bindingSummaries);
    } else {
      // Fallback to empty state
      setEntries([]);
      setConflicts([]);
      setBindingSummaries(dummyBindingSummaries);
    }

    console.log("Loaded dummy data:", {
      periods: dummyPeriods.length,
      bindings: dummyBindings.length,
      classes: classInfo.length
    });

    toast.success('Data refreshed successfully');
  } catch (error) {
    console.error('Error loading dummy data:', error);
    toast.error(`Error loading scheduling data: ${error.message || 'Unknown error'}`);
  } finally {
    setIsLoading(false);
  }
}, [selectedClass]); 