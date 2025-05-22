import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/component/Ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/component/Ui/select';
import { Loader2 } from 'lucide-react';
import { Subject } from '@/type/subject';
import axios from 'axios';
import { TypeRoom } from '@/type/Room/TypeRoom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store/index';
import { filterTimetableEntries, clearFilteredEntries } from '@/store/Timetable/timetableSlice';
import { useGetClassesQuery } from '@/store/Class/ApiClass';
import { useI18n } from '@/hook/useI18n';
import { useGetAllTeacherProfilesQuery } from '@/store/Teacher/ApiTeacher';
import { cn } from '@/lib/utils';
import { 
  useGetClassesByTeacherIdQuery, 
  useGetClassesByRoomIdQuery, 
  useGetClassesBySubjectIdQuery,
  useLazyGetClassesByTeacherIdQuery,
  useLazyGetClassesByRoomIdQuery,
  useLazyGetClassesBySubjectIdQuery
} from '@/store/Binding/ApiBinding';

interface TimetableFiltersProps {
  timetableUuid: string;
  onFilterChange: (filters: {
    teacherId?: string | null;
    roomId?: string | null;
    subjectId?: string | null;
    classId?: string | null;
  }) => void;
  onDayRangeReset?: () => void;
  isMobile?: boolean;
  initialFilters?: {
    teacherId?: string | null;
    roomId?: string | null;
    subjectId?: string | null;
    classId?: string | null;
  };
}

const TimetableFilters: React.FC<TimetableFiltersProps> = ({ 
  timetableUuid, 
  onFilterChange,
  onDayRangeReset,
  isMobile = false,
  initialFilters = {}
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [teacherId, setTeacherId] = useState<string>(initialFilters.teacherId?.toString() || "all");
  const [roomId, setRoomId] = useState<string>(initialFilters.roomId?.toString() || "all");
  const [subjectId, setSubjectId] = useState<string>(initialFilters.subjectId?.toString() || "all");
  const [classId, setClassId] = useState<string>(initialFilters.classId?.toString() || "all");
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<TypeRoom[]>([]);
  
  const [isLoadingSubjects, setIsLoadingSubjects] = useState<boolean>(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(false);
  
  const { t } = useI18n();
  
  const {
    data: classesData,
    isLoading: isLoadingClasses
  } = useGetClassesQuery({
    page: 0,
    size: 100,
    sortBy: "name",
    sortDirection: "asc"
  });
  
  const {
    data: teachersData,
    isLoading: isLoadingTeachers
  } = useGetAllTeacherProfilesQuery({ page: 0, size: 1000, sortBy: "firstName", sortDirection: "asc" });
  
  // Use lazy queries so we can trigger them manually
  const [getClassesByTeacher, { data: teacherClassesData, isLoading: isLoadingTeacherClasses }] = 
    useLazyGetClassesByTeacherIdQuery();
  const [getClassesByRoom, { data: roomClassesData, isLoading: isLoadingRoomClasses }] = 
    useLazyGetClassesByRoomIdQuery();
  const [getClassesBySubject, { data: subjectClassesData, isLoading: isLoadingSubjectClasses }] = 
    useLazyGetClassesBySubjectIdQuery();
  
  // Track which filter is active for classes
  const [activeClassFilter, setActiveClassFilter] = useState<'none' | 'teacher' | 'room' | 'subject'>('none');
  
  // Add this to track initial mount
  const isInitialMount = useRef(true);
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token || '',
      'Accept-Language': localStorage.getItem("i18nextLng") || "en"
    };
  };
  
  // Load subjects function
  const loadSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/subjects`, {
        headers: getAuthHeaders(),
        params: {
          page: 0,
          size: 1000,
          sortBy: "name",
          sortDirection: "asc"
        }
      });
      
      if (response.data && response.data.data) {
        setSubjects(response.data.data);
      } else {
        console.error("Unexpected response format for subjects:", response.data);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
    } finally {
      setIsLoadingSubjects(false);
    }
  };
  
  // Load rooms function
  const loadRooms = async () => {
    setIsLoadingRooms(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      
      // Use the paginated endpoint with a large size instead of /all
      const response = await axios.get(`${API_BASE_URL}/api/v1/rooms`, {
        headers: getAuthHeaders(),
        params: {
          page: 0,
          size: 1000,
          sortBy: "name",
          sortDirection: "asc"
        }
      });
      
      if (response.data && response.data.data) {
        setRooms(response.data.data);
      } else {
        console.error("Unexpected response format for rooms:", response.data);
      }
    } catch (error) {
      console.error("Error loading rooms:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  };
  
  // Initial data loading
  useEffect(() => {
    loadSubjects();
    loadRooms();
  }, []);
  
  // Update effect for filter changes
  useEffect(() => {
    // Reset class selection when changing other filters
    setClassId('all');
    
    // Trigger appropriate API calls based on active filters
    if (teacherId !== 'all') {
      setActiveClassFilter('teacher');
      getClassesByTeacher({ teacherId });
    } else if (roomId !== 'all') {
      setActiveClassFilter('room');
      getClassesByRoom({ roomId });
    } else if (subjectId !== 'all') {
      setActiveClassFilter('subject');
      getClassesBySubject({ subjectId });
    } else {
      setActiveClassFilter('none');
    }
  }, [teacherId, roomId, subjectId]);
  
  // Prevent any filter effects from running on initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
  }, []);
  
  // Add this effect to update state when initialFilters changes
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.teacherId) {
        setTeacherId(initialFilters.teacherId.toString());
      }
      if (initialFilters.roomId) {
        setRoomId(initialFilters.roomId.toString());
      }
      if (initialFilters.subjectId) {
        setSubjectId(initialFilters.subjectId.toString());
      }
      if (initialFilters.classId) {
        setClassId(initialFilters.classId.toString());
      }
    }
  }, [initialFilters]);
  
  const handleTeacherChange = (value: string) => {
    setTeacherId(value);
    // Class selection is reset in the useEffect
    
    // Apply filters without including class filter
    const newFilters = {
      teacherId: value !== 'all' ? value : null,
      roomId: roomId !== 'all' ? roomId : null,
      subjectId: subjectId !== 'all' ? subjectId : null,
      classId: null // Always clear class filter when changing teacher
    };
    
    onFilterChange(newFilters);
  };
  
  const handleRoomChange = (value: string) => {
    setRoomId(value);
    
    // Clear the classId when changing room
    setClassId('all');
    
    // Fetch connected classes if specific room selected
    if (value !== 'all') {
      setActiveClassFilter('room');
      getClassesByRoom({ roomId: value });
    } else {
      setActiveClassFilter('none');
    }
    
    // Apply filters WITHOUT the classId
    const newFilters = {
      teacherId: teacherId !== 'all' ? teacherId : null,
      roomId: value !== 'all' ? value : null,
      subjectId: subjectId !== 'all' ? subjectId : null,
      classId: null // Always clear classId when changing room
    };
    
    onFilterChange(newFilters);
    
    if (timetableUuid) {
      const filterParams: any = {
        uuid: timetableUuid
      };
      
      if (teacherId !== 'all') filterParams.teacherIds = [teacherId];
      if (value !== 'all') filterParams.roomIds = [value];
      if (subjectId !== 'all') filterParams.subjectIds = [subjectId];
      
      if (Object.keys(filterParams).length > 1) { // More than just uuid
        dispatch(filterTimetableEntries(filterParams));
      } else {
        dispatch(clearFilteredEntries());
      }
    }
  };
  
  const handleSubjectChange = (value: string) => {
    setSubjectId(value);
    
    // Clear the classId when changing subject
    setClassId('all');
    
    // Fetch connected classes if specific subject selected
    if (value !== 'all') {
      setActiveClassFilter('subject');
      getClassesBySubject({ subjectId: value });
    } else {
      setActiveClassFilter('none');
    }
    
    // Apply filters WITHOUT the classId
    const newFilters = {
      teacherId: teacherId !== 'all' ? teacherId : null,
      roomId: roomId !== 'all' ? roomId : null,
      subjectId: value !== 'all' ? value : null,
      classId: null // Always clear classId when changing subject
    };
    
    onFilterChange(newFilters);
    
    if (timetableUuid) {
      const filterParams: any = {
        uuid: timetableUuid
      };
      
      if (teacherId !== 'all') filterParams.teacherIds = [teacherId];
      if (roomId !== 'all') filterParams.roomIds = [roomId];
      if (value !== 'all') filterParams.subjectIds = [value];
      
      if (Object.keys(filterParams).length > 1) { // More than just uuid
        dispatch(filterTimetableEntries(filterParams));
      } else {
        dispatch(clearFilteredEntries());
      }
    }
  };
  
  const handleClassChange = (value: string) => {
    setClassId(value);
    
    const newFilters = {
      teacherId: teacherId !== 'all' ? teacherId : null,
      roomId: roomId !== 'all' ? roomId : null,
      subjectId: subjectId !== 'all' ? subjectId : null,
      classId: value !== 'all' ? value : null
    };
    
    onFilterChange(newFilters);
  };
  
  const clearFilters = () => {
    setClassId("all");
    setTeacherId("all");
    setRoomId("all");
    setSubjectId("all");
    setActiveClassFilter('none');
    
    onFilterChange({
        classId: "all",
        teacherId: "all",
        roomId: "all",
        subjectId: "all"
    });
    
    if (onDayRangeReset) {
        onDayRangeReset();
    }
  };

  const selectWidth = isMobile ? "w-full" : "w-[200px]";
  
  // Helper function to determine which classes to display
  const getClassesToDisplay = () => {
    if (activeClassFilter === 'teacher' && teacherId !== 'all' && teacherClassesData?.data) {
      return teacherClassesData.data;
    }
    if (activeClassFilter === 'room' && roomId !== 'all' && roomClassesData?.data) {
      return roomClassesData.data;
    }
    if (activeClassFilter === 'subject' && subjectId !== 'all' && subjectClassesData?.data) {
      return subjectClassesData.data;
    }
    return classesData?.data || [];
  };

  // Determine if we're loading filtered classes
  const isLoadingFilteredClasses = 
    (activeClassFilter === 'teacher' && isLoadingTeacherClasses) ||
    (activeClassFilter === 'room' && isLoadingRoomClasses) ||
    (activeClassFilter === 'subject' && isLoadingSubjectClasses);

  // Helper function to get the label for a selected class
  const getClassLabel = (id: string) => {
    // Find in filtered classes first
    if (activeClassFilter !== 'none') {
      if (activeClassFilter === 'teacher' && teacherClassesData?.data) {
        const foundClass = teacherClassesData.data.find(c => (c.id?.toString() || c.uuid) === id);
        if (foundClass) return `${foundClass.name} ${foundClass.section ? `(${foundClass.section})` : ''}`;
      }
      if (activeClassFilter === 'room' && roomClassesData?.data) {
        const foundClass = roomClassesData.data.find(c => (c.id?.toString() || c.uuid) === id);
        if (foundClass) return `${foundClass.name} ${foundClass.section ? `(${foundClass.section})` : ''}`;
      }
      if (activeClassFilter === 'subject' && subjectClassesData?.data) {
        const foundClass = subjectClassesData.data.find(c => (c.id?.toString() || c.uuid) === id);
        if (foundClass) return `${foundClass.name} ${foundClass.section ? `(${foundClass.section})` : ''}`;
      }
    }
    
    // Fall back to all classes
    if (classesData?.data) {
      const foundClass = classesData.data.find(c => (c.id?.toString() || c.uuid) === id);
      if (foundClass) return `${foundClass.name} ${foundClass.section ? `(${foundClass.section})` : ''}`;
    }
    
    return t("timetable.filters.class");
  };

  if (isMobile) {
    return (
      <div className="flex flex-col space-y-3 w-full">
        <Select
          value={classId}
          onValueChange={handleClassChange}
        >
          <SelectTrigger className={selectWidth} disabled={isLoadingClasses || isLoadingFilteredClasses}>
            {isLoadingClasses || isLoadingFilteredClasses ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("timetable.filters.loading")}</span>
              </div>
            ) : (
              <span>
                {classId === 'all' 
                  ? t("timetable.filters.allClasses") 
                  : getClassLabel(classId)}
              </span>
            )}
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">{t("timetable.filters.allClasses")}</SelectItem>
            
            {(isLoadingClasses || isLoadingFilteredClasses) ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>{t("timetable.filters.loadingClasses")}</span>
              </div>
            ) : (
              <>
                {activeClassFilter !== 'none' && (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    {activeClassFilter === 'teacher' && teacherId !== 'all' && teacherClassesData?.data?.length === 0 && (
                      <span>{t("timetable.filters.noClassesForTeacher")}</span>
                    )}
                    {activeClassFilter === 'room' && roomId !== 'all' && roomClassesData?.data?.length === 0 && (
                      <span>{t("timetable.filters.noClassesForRoom")}</span>
                    )}
                    {activeClassFilter === 'subject' && subjectId !== 'all' && subjectClassesData?.data?.length === 0 && (
                      <span>{t("timetable.filters.noClassesForSubject")}</span>
                    )}
                  </div>
                )}
                
                {getClassesToDisplay().map((classItem) => (
                  <SelectItem key={classItem.id || classItem.uuid} value={(classItem.id || classItem.uuid).toString()}>
                    {classItem.name} {classItem.section ? `(${classItem.section})` : ''}
                  </SelectItem>
                ))}
                
                {getClassesToDisplay().length === 0 && activeClassFilter === 'none' && (
                  <div className="flex items-center justify-center py-2">
                    <span>{t("timetable.filters.noClasses")}</span>
                  </div>
                )}
              </>
            )}
          </SelectContent>
        </Select>
        
        <Select
          value={teacherId}
          onValueChange={handleTeacherChange}
        >
          <SelectTrigger className={selectWidth} disabled={isLoadingTeachers}>
            <SelectValue placeholder={isLoadingTeachers ? t("timetable.filters.loading") : t("timetable.filters.teacher")} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">{t("timetable.filters.allTeachers")}</SelectItem>
            {isLoadingTeachers ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>{t("timetable.filters.loadingTeachers")}</span>
              </div>
            ) : (
              teachersData && teachersData.data && teachersData.data.length > 0 ? (
                teachersData.data
                  .filter((teacher) => {
                    const valid = teacher && teacher.id != null;
                    if (!valid) {
                      console.warn("Skipping teacher with missing id:", teacher);
                    } else {
                    }
                    return valid;
                  })
                  .map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id.toString()}>
                      {teacher.firstName} {teacher.lastName} {teacher.initials ? `(${teacher.initials})` : ''}
                    </SelectItem>
                  ))
              ) : (
                <div className="flex items-center justify-center py-2">
                  <span>{t("timetable.filters.noTeachers")}</span>
                </div>
              )
            )}
          </SelectContent>
        </Select>
        
        <Select
          value={roomId}
          onValueChange={handleRoomChange}
        >
          <SelectTrigger className={selectWidth} disabled={isLoadingRooms}>
            <SelectValue placeholder={isLoadingRooms ? t("timetable.filters.loading") : t("timetable.filters.room")} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">{t("timetable.filters.allRooms")}</SelectItem>
            {isLoadingRooms ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>{t("timetable.filters.loadingRooms")}</span>
              </div>
            ) : (
              rooms && rooms.length > 0 ? (
                rooms.map((room) => (
                  <SelectItem key={room.id || room.uuid} value={room.id?.toString() || room.uuid}>
                    {room.name} ({room.code})
                  </SelectItem>
                ))
              ) : (
                <div className="flex items-center justify-center py-2">
                  <span>{t("timetable.filters.noRooms")}</span>
                </div>
              )
            )}
          </SelectContent>
        </Select>
        
        <Select
          value={subjectId}
          onValueChange={handleSubjectChange}
        >
          <SelectTrigger className={selectWidth} disabled={isLoadingSubjects}>
            <SelectValue placeholder={isLoadingSubjects ? t("timetable.filters.loading") : t("timetable.filters.subject")} />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="all">{t("timetable.filters.allSubjects")}</SelectItem>
            {isLoadingSubjects ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>{t("timetable.filters.loadingSubjects")}</span>
              </div>
            ) : (
              subjects && subjects.length > 0 ? (
                subjects.map((subject) => (
                  <SelectItem key={subject.id || subject.uuid} value={subject.id?.toString() || subject.uuid}>
                    {subject.name} {subject.initials ? `(${subject.initials})` : ''}
                  </SelectItem>
                ))
              ) : (
                <div className="flex items-center justify-center py-2">
                  <span>{t("timetable.filters.noSubjects")}</span>
                </div>
              )
            )}
          </SelectContent>
        </Select>
        
        <Button variant="outline" onClick={clearFilters} className="w-full">
          {t("timetable.filters.clearFilters")}
        </Button>
      </div>
    );
  }
  
  return (
    <div className={cn("flex flex-wrap gap-3 items-center", isMobile ? "flex-col" : "")}>
      <Select
        value={classId}
        onValueChange={handleClassChange}
      >
        <SelectTrigger className={selectWidth} disabled={isLoadingClasses || isLoadingFilteredClasses}>
          {isLoadingClasses || isLoadingFilteredClasses ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("timetable.filters.loading")}</span>
            </div>
          ) : (
            <span>
              {classId === 'all' 
                ? t("timetable.filters.allClasses") 
                : getClassLabel(classId)}
            </span>
          )}
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="all">{t("timetable.filters.allClasses")}</SelectItem>
          
          {(isLoadingClasses || isLoadingFilteredClasses) ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>{t("timetable.filters.loadingClasses")}</span>
            </div>
          ) : (
            <>
              {activeClassFilter !== 'none' && (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  {activeClassFilter === 'teacher' && teacherId !== 'all' && teacherClassesData?.data?.length === 0 && (
                    <span>{t("timetable.filters.noClassesForTeacher")}</span>
                  )}
                  {activeClassFilter === 'room' && roomId !== 'all' && roomClassesData?.data?.length === 0 && (
                    <span>{t("timetable.filters.noClassesForRoom")}</span>
                  )}
                  {activeClassFilter === 'subject' && subjectId !== 'all' && subjectClassesData?.data?.length === 0 && (
                    <span>{t("timetable.filters.noClassesForSubject")}</span>
                  )}
                </div>
              )}
              
              {getClassesToDisplay().map((classItem) => (
                <SelectItem key={classItem.id || classItem.uuid} value={(classItem.id || classItem.uuid).toString()}>
                  {classItem.name} {classItem.section ? `(${classItem.section})` : ''}
                </SelectItem>
              ))}
              
              {getClassesToDisplay().length === 0 && activeClassFilter === 'none' && (
                <div className="flex items-center justify-center py-2">
                  <span>{t("timetable.filters.noClasses")}</span>
                </div>
              )}
            </>
          )}
        </SelectContent>
      </Select>
      
      <Select
        value={teacherId}
        onValueChange={handleTeacherChange}
      >
        <SelectTrigger className={selectWidth} disabled={isLoadingTeachers}>
          <SelectValue placeholder={isLoadingTeachers ? t("timetable.filters.loading") : t("timetable.filters.teacher")} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="all">{t("timetable.filters.allTeachers")}</SelectItem>
          {isLoadingTeachers ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>{t("timetable.filters.loadingTeachers")}</span>
            </div>
          ) : (
            teachersData && teachersData.data && teachersData.data.length > 0 ? (
              teachersData.data
                .filter((teacher) => {
                  const valid = teacher && teacher.id != null;
                  if (!valid) {
                    console.warn("Skipping teacher with missing id:", teacher);
                  } else {
                  }
                  return valid;
                })
                .map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    {teacher.firstName} {teacher.lastName} {teacher.initials ? `(${teacher.initials})` : ''}
                  </SelectItem>
                ))
            ) : (
              <div className="flex items-center justify-center py-2">
                <span>{t("timetable.filters.noTeachers")}</span>
              </div>
            )
          )}
        </SelectContent>
      </Select>
      
      <Select
        value={roomId}
        onValueChange={handleRoomChange}
      >
        <SelectTrigger className={selectWidth} disabled={isLoadingRooms}>
          <SelectValue placeholder={isLoadingRooms ? t("timetable.filters.loading") : t("timetable.filters.room")} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="all">{t("timetable.filters.allRooms")}</SelectItem>
          {isLoadingRooms ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>{t("timetable.filters.loadingRooms")}</span>
            </div>
          ) : (
            rooms && rooms.length > 0 ? (
              rooms.map((room) => (
                <SelectItem key={room.id || room.uuid} value={room.id?.toString() || room.uuid}>
                  {room.name} ({room.code})
                </SelectItem>
              ))
            ) : (
              <div className="flex items-center justify-center py-2">
                <span>{t("timetable.filters.noRooms")}</span>
              </div>
            )
          )}
        </SelectContent>
      </Select>
      
      <Select
        value={subjectId}
        onValueChange={handleSubjectChange}
      >
        <SelectTrigger className={selectWidth} disabled={isLoadingSubjects}>
          <SelectValue placeholder={isLoadingSubjects ? t("timetable.filters.loading") : t("timetable.filters.subject")} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectItem value="all">{t("timetable.filters.allSubjects")}</SelectItem>
          {isLoadingSubjects ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>{t("timetable.filters.loadingSubjects")}</span>
            </div>
          ) : (
            subjects && subjects.length > 0 ? (
              subjects.map((subject) => (
                <SelectItem key={subject.id || subject.uuid} value={subject.id?.toString() || subject.uuid}>
                  {subject.name} {subject.initials ? `(${subject.initials})` : ''}
                </SelectItem>
              ))
            ) : (
              <div className="flex items-center justify-center py-2">
                <span>{t("timetable.filters.noSubjects")}</span>
              </div>
            )
          )}
        </SelectContent>
      </Select>
      
      <Button variant="outline" onClick={clearFilters}>
        {t("timetable.filters.clearFilters")}
      </Button>
    </div>
  );
};

export default TimetableFilters;