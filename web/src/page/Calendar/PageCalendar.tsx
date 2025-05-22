import React, { useState, useEffect, useRef } from "react";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { useToast } from "@/hook/useToast";
import { useI18n } from "@/hook/useI18n";
import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardContent } from "@/component/Ui/card";
import CalendarGrid from "../../component/Calendar/CalendarGrid";
import ViewSelector from "../../component/Calendar/ViewSelector";
import EventDetails from "../../component/Calendar/EventDetails";
import CalendarHeader from "../../component/Calendar/CalendarHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/component/Ui/select";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, addMonths, addWeeks, subMonths, subWeeks, addMinutes, setHours, setMinutes, setSeconds, setMilliseconds, eachDayOfInterval, isWithinInterval, parseISO } from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter as FilterIcon,
  Download,
  Printer,
  Search,
  Plus,
  MapPin,
  Calendar as CalendarExportIcon,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useSelector } from 'react-redux';
import { RootState } from '@/store/index';
import { fetchLatestTimetable, fetchTimetableByPlanSettingUuid } from '@/store/Timetable/timetableSlice';
import { useAppSelector, useAppDispatch } from "@/hook/useAppRedux";
import { getAllPlanSettings } from '@/services/planSettings/planSettingsService';
import { PlanSettings } from '@/type/planSettings/planSettings';
import { TypeTimetableEntry } from '@/type/Timetable/TypeTimetable';
import { Popover, PopoverContent, PopoverTrigger } from "@/component/Ui/popover";
import { Calendar } from "@/component/Ui/calendar";
import TimetableService from '@/services/timetable/TimetableService';
import axios from "axios";
import { downloadICS } from '@/util/icsUtils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/component/Ui/dropdown-menu";

const DEBUG_FILTERS = false;

interface CalendarEvent {
  uuid: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  classUuid?: string;
  className?: string;
  teacherUuid?: string;
  teacherName?: string;
  roomUuid?: string;
  roomName?: string;
  subjectUuid?: string;
  subjectName?: string;
  subjectColor?: string;
  description?: string;
  status?: string;
  hasConflict?: boolean;
  periodType?: string;
  dayOfWeek?: number;
}

const PageCalendar = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView = searchParams.get("view") || "week";
  const [view, setView] = useState<"day" | "week" | "month">((initialView as any));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("_all");
  const [filterTeacher, setFilterTeacher] = useState("_all");
  const [filterSubject, setFilterSubject] = useState("_all");
  const [filterRoom, setFilterRoom] = useState("_all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const headerRef = useRef<any>(null);
  const dispatch = useAppDispatch();
  const { currentTimetable: timetable, loading, error } = useSelector((state: RootState) => state.timetable);
  const [planStartDate, setPlanStartDate] = useState<string | null>(null);
  const [planEndDate, setPlanEndDate] = useState<string | null>(null);
  const { user } = useAppSelector((state) => state.auth);
  const [planSettings, setPlanSettings] = useState<PlanSettings[]>([]);
  const [selectedPlanSettingUuid, setSelectedPlanSettingUuid] = useState<string | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [allRooms, setAllRooms] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [allEntries, setAllEntries] = useState<any[]>([]);
  const [allTimetables, setAllTimetables] = useState([]);
  const [selectedTimetableUuid, setSelectedTimetableUuid] = useState("_all");

  const normalizeUuid = (uuid) => {
    if (!uuid) return "";
    return String(uuid).trim().toLowerCase();
  };

  useEffect(() => {
    if (!timetable) {
      dispatch(fetchLatestTimetable(1));
    }
    if (timetable) {
      setPlanStartDate(timetable.planStartDate);
      setPlanEndDate(timetable.planEndDate);
    }
  }, [dispatch, timetable]);

  useEffect(() => {
    getAllPlanSettings().then((res) => {
      if (res && res.data) setPlanSettings(res.data);
    });
  }, []);

  useEffect(() => {
    if (timetable?.planSettingUuid) {
      setSelectedPlanSettingUuid(timetable.planSettingUuid);
    }
  }, [timetable?.planSettingUuid]);

useEffect(() => {
  const fetchAllTimetables = async () => {
    try {
      console.log("Fetching all timetables for calendar...");
      const organizationId = user?.organizationId ? Number(user.organizationId) : 1;
      const timetables = await TimetableService.getAllTimetables(organizationId);
      
      if (timetables && timetables.length > 0) {
        console.log(`Loaded ${timetables.length} timetables:`);
        timetables.forEach(t => {
          console.log(`Timetable: ${t.name}, UUID: ${t.uuid}, Type: ${typeof t.uuid}`);
        });
      }
      
      setAllTimetables(timetables || []);
      
      if (!timetables || timetables.length === 0) {
        console.log("No timetables found.");
        setAllEntries([]);
        return;
      }
      
      const allEvents = processTimetables(timetables);
      
      const uniqueEvents = deduplicateEventsByUuid(allEvents);
      
      setAllEntries(uniqueEvents);
    } catch (error) {
      console.error("Error fetching timetables:", error);
      setAllEntries([]);
    }
  };
  
  fetchAllTimetables();
}, [user?.organizationId]);

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const deduplicateEventsByUuid = (events) => {
    return Object.values(
      events.reduce((acc, item) => {
        if (item && item.uuid) acc[item.uuid] = item;
        return acc;
      }, {})
    );
  };

  const processTimetables = (timetables) => {
    const allEvents = [];
    
    timetables.forEach(timetable => {
      const schoolStartTime = timetable.schoolStartTime || "08:00";
      const timetablePlan = timetable.timetablePlan || [];
      
      const planStart = parseLocalDate(timetable.planStartDate);
      const planEnd = parseLocalDate(timetable.planEndDate);
      
      if (!planStart || !planEnd) {
        return;
      }
      
      planEnd.setHours(23, 59, 59, 999);
      
      (timetable.entries || []).forEach(entry => {
        try {
          generateEventsForEntry(entry, timetable, planStart, planEnd, schoolStartTime, timetablePlan, allEvents);
        } catch (entryError) {
          console.error("Error processing timetable entry:", entryError);
        }
      });
    });
    
    return allEvents;
  };

  const generateEventsForEntry = (entry, timetable, planStart, planEnd, schoolStartTime, timetablePlan, allEvents) => {
    const entryDayOfWeek = entry.dayOfWeek || 1;
    
    const jsDayOfWeek = entryDayOfWeek === 7 ? 0 : entryDayOfWeek;
    
    let current = new Date(planStart);
    
    const currentDayOfWeek = current.getDay();
    
    const daysToAdd = (jsDayOfWeek - currentDayOfWeek + 7) % 7;
    
    current.setDate(current.getDate() + daysToAdd);
    
    while (current <= planEnd) {
      const { start, end } = calculateEventTimes(current, entry, schoolStartTime, timetablePlan);
      
      if (start >= planStart && end <= planEnd) {
        const eventObject = createEventObject(entry, timetable, start, end);
        allEvents.push(eventObject);
      }
      
      current = new Date(current);
      current.setDate(current.getDate() + 7);
    }
  };

  const calculateEventTimes = (date, entry, schoolStartTime, timetablePlan) => {
    let [hour, minute] = schoolStartTime.split(":").map(Number);
    
    let start = new Date(date);
    start.setHours(hour, minute, 0, 0);
    
    for (let i = 0; i < (entry.period || 1) - 1; i++) {
      const periodDuration = timetablePlan[i] || 45;
      start = new Date(start.getTime() + periodDuration * 60000);
    }
    
    const duration = entry.durationMinutes || timetablePlan[(entry.period || 1) - 1] || 45;
    const end = new Date(start.getTime() + duration * 60000);
    
    return { start, end };
  };

  const createEventObject = (entry, timetable, start, end) => {
    const timetableUuid = timetable.uuid ? String(timetable.uuid).trim() : null;
    
    if (!timetableUuid) {
      console.warn("Creating event with missing timetableUuid:", entry.subjectName || "unknown");
    }
    
    return {
      ...entry,
      timetableName: timetable.name,
      timetableUuid: timetableUuid,
      planSettingUuid: timetable.planSettingUuid,
      planStartDate: timetable.planStartDate,
      planEndDate: timetable.planEndDate,
      schoolStartTime: timetable.schoolStartTime,
      timetablePlan: timetable.timetablePlan,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      title: entry.subjectName || entry.periodType || "Free Period",
    };
  };

  const handlePlanSettingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlanSettingUuid = e.target.value;
    setSelectedPlanSettingUuid(newPlanSettingUuid);
    
    dispatch(fetchTimetableByPlanSettingUuid({ 
      planSettingUuid: newPlanSettingUuid, 
      organizationId: user?.organizationId ? Number(user.organizationId) : 1 
    }));
  };

  function getPeriodDuration(periodIndex: number): number {
    if (timetable) {
      if (timetable.periodDurations && timetable.periodDurations[periodIndex] != null) {
        return timetable.periodDurations[periodIndex];
      }
      if (timetable.timetablePlan && timetable.timetablePlan[periodIndex] != null) {
        return timetable.timetablePlan[periodIndex];
      }
    }
    return 45;
  }

  function getPeriodTimeSlotsWithFallback(schoolStartTime: string, numPeriods: number) {
    const slots: { period: number; start: string; end: string; duration: number }[] = [];
    let [hour, minute] = schoolStartTime.split(":").map(Number);
    let current = new Date(0, 0, 0, hour, minute);
    for (let i = 0; i < numPeriods; i++) {
      const start = `${current.getHours().toString().padStart(2, "0")}:${current.getMinutes().toString().padStart(2, "0")}`;
      const duration = getPeriodDuration(i);
      current = new Date(current.getTime() + duration * 60000);
      const end = `${current.getHours().toString().padStart(2, "0")}:${current.getMinutes().toString().padStart(2, "0")}`;
      slots.push({ period: i + 1, start, end, duration });
    }
    return slots;
  }

  const maxPeriods = Math.max(
    timetable?.periodDurations?.length || 0,
    timetable?.timetablePlan?.length || 0
  );

  const periodTimeSlots = timetable && timetable.schoolStartTime && maxPeriods > 0
    ? getPeriodTimeSlotsWithFallback(timetable.schoolStartTime, maxPeriods)
    : [];

  const events = React.useMemo(() => {
    let filteredEvents;
    let timetableSource;
    
    if (selectedTimetableUuid === "_all") {
      filteredEvents = allEntries;
      timetableSource = "multiple";
    } else {
      const normalizedSelectedUuid = normalizeUuid(selectedTimetableUuid);
      filteredEvents = allEntries.filter(e => normalizeUuid(e.timetableUuid) === normalizedSelectedUuid);
      timetableSource = "single";
    }
    
    
    return filteredEvents.map(event => ({
      ...event,
      _timetableSource: timetableSource
    }));
  }, [allEntries, selectedTimetableUuid]);

  const filteredEvents = React.useMemo(() => {
    const filtered = events.filter(event => {
      if (!event || !event.startDateTime || !event.endDateTime) {
        return false;
      }
      
      const matchesSearch = !searchTerm ||
        event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.teacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.roomName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRoom = filterRoom === "_all" || 
        event.roomUuid === filterRoom || 
        event.room?.uuid === filterRoom;
      
      const matchesClass = filterClass === "_all" || 
        event.classUuid === filterClass || 
        event.class?.uuid === filterClass;
      
      const matchesTeacher = filterTeacher === "_all" || (() => {
        const selectedTeacher = allTeachers.find(t => t.uuid === filterTeacher);
        if (!selectedTeacher) return false;
        if (!event.teacherName) return false;
        const eventTeacherName = event.teacherName.trim().toLowerCase();
        const fullName = [selectedTeacher.firstName, selectedTeacher.lastName].filter(Boolean).join(" ").trim().toLowerCase();
        return eventTeacherName === fullName;
      })();
      
      const matchesSubject = filterSubject === "_all" || 
        event.subjectUuid === filterSubject || 
        event.subject?.uuid === filterSubject;

      return matchesSearch && matchesClass && matchesTeacher && matchesSubject && matchesRoom;
    });
    
    return filtered;
  }, [events, searchTerm, filterClass, filterTeacher, filterSubject, filterRoom, allTeachers]);

  useEffect(() => {
    if (events.length > 0) {
      console.log(`Filtering: ${filteredEvents.length} events shown out of ${events.length} total events`);
    }
  }, [filteredEvents, events]);

  const getDateRange = () => {
    switch (view) {
      case "day":
        return {
          start: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            0, 0, 0
          ),
          end: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            23, 59, 59
          )
        };
      case "week":
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        };
      case "month":
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      default:
        return { start: currentDate, end: currentDate };
    }
  };

  const dateRange = getDateRange();
  const startDateParam = format(dateRange.start, "yyyy-MM-dd'T'HH:mm:ss");
  const endDateParam = format(dateRange.end, "yyyy-MM-dd'T'HH:mm:ss");

  const getBaseDate = () => {
    switch (view) {
      case "day":
        return format(currentDate, "yyyy-MM-dd");
      case "week":
        return format(startOfWeek(currentDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "month":
        return format(startOfMonth(currentDate), "yyyy-MM-dd");
      default:
        return format(currentDate, "yyyy-MM-dd");
    }
  };
  const baseDateParam = getBaseDate();

  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    switch (view) {
      case "day":
        setCurrentDate(prev => addDays(prev, -1));
        break;
      case "week":
        setCurrentDate(prev => subWeeks(prev, 1));
        break;
      case "month":
        setCurrentDate(prev => subMonths(prev, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (view) {
      case "day":
        setCurrentDate(prev => addDays(prev, 1));
        break;
      case "week":
        setCurrentDate(prev => addWeeks(prev, 1));
        break;
      case "month":
        setCurrentDate(prev => addMonths(prev, 1));
        break;
    }
  };

  useEffect(() => {
    setSearchParams({ view });
  }, [view, setSearchParams]);

  const calendarRef = useRef<HTMLDivElement>(null);
  const handleExport = () => {
    if (selectedTimetableUuid === '_all') {
      toast({
        description: t("calendar.exportSingleTimetableOnly"),
        variant: "destructive"
      });
      return;
    }

    const selectedTimetable = allTimetables.find(t => t.uuid === selectedTimetableUuid);
    if (!selectedTimetable) {
      toast({
        title: t("calendar.exportToCalendar"),
        description: t("common.status.notFound", { item: t("calendar.timetable") }),
        variant: "destructive"
      });
      return;
    }

    const planStart = parseLocalDate(selectedTimetable.planStartDate);
    const planEnd = parseLocalDate(selectedTimetable.planEndDate);
    
    if (!planStart || !planEnd) {
      toast({
        title: t("calendar.exportToCalendar"),
        description: t("calendar.invalidPlanDates"),
        variant: "destructive"
      });
      return;
    }

    const events = (selectedTimetable.entries || []).map(entry => {
      const schoolStartTime = selectedTimetable.schoolStartTime || "08:00";
      const [hour, minute] = schoolStartTime.split(":").map(Number);
      
      let startTime = new Date(planStart);
      startTime.setHours(hour, minute, 0, 0);
      
      for (let i = 0; i < (entry.period || 1) - 1; i++) {
        const periodDuration = (selectedTimetable.timetablePlan || [])[i] || 45;
        startTime = new Date(startTime.getTime() + periodDuration * 60000);
      }
      
      const duration = entry.durationMinutes || (selectedTimetable.timetablePlan || [])[(entry.period || 1) - 1] || 45;
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      return {
        uuid: entry.uuid || crypto.randomUUID(),
        title: entry.subjectName || entry.periodType || "School Event",
        startDateTime: startTime.toISOString(),
        endDateTime: endTime.toISOString(),
        description: [
          selectedTimetable.description,
          `Timetable: ${selectedTimetable.name}`
        ].filter(Boolean).join('\n'),
        location: entry.roomName || "",
        teacherName: entry.teacherName || "",
        className: entry.className || "",
        subjectName: entry.subjectName || "",
        dayOfWeek: entry.dayOfWeek,
        planStartDate: selectedTimetable.planStartDate,
        planEndDate: selectedTimetable.planEndDate,
        isRecurring: true
      };
    });

    if (events.length === 0) {
      toast({
        title: t("calendar.exportToCalendar"),
        description: t("calendar.noEventsToExport"),
        variant: "destructive"
      });
      return;
    }

    const filename = `${selectedTimetable.name || 'timetable'}.ics`;
    downloadICS(events, filename);

    toast({
      title: t("common.actions.export"),
      description: t("common.status.actionSuccess", { action: t("common.actions.export") }),
    });
  };

  const handlePrint = () => {
    document.body.classList.add('print-mode');
    window.print();
    setTimeout(() => document.body.classList.remove('print-mode'), 500);
  };

  const handleCreateEvent = () => {
    toast({
      title: t("calendar.createEvent"),
      description: t("common.status.actionSuccess", { action: t("calendar.createEvent") }),
    });
  };

  const handleEventSelect = (event: any) => {
    setSelectedEvent(event);
  };

  const handleEventClose = () => {
    setSelectedEvent(null);
  };

  const handleMenuClick = () => {
    if (headerRef.current && typeof headerRef.current.closeMobileSearch === 'function') {
      headerRef.current.closeMobileSearch();
    }
    setSidebarOpen(true);
  };

  useEffect(() => {
  }, [sidebarOpen]);

  useEffect(() => {
    
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const matchingEvents = events.filter(event => {
      if (!event.startDateTime) return false;
      const eventDateStr = new Date(event.startDateTime).toISOString().split('T')[0];
      return eventDateStr === currentDateStr;
    });
    
    
    const matchingByMonthDay = events.filter(event => {
      if (!event.startDateTime) return false;
      const eventDate = new Date(event.startDateTime);
      return eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getDate() === currentDate.getDate();
    });
    
    
    if (events.length > 0) {
      events.slice(0, 5).forEach((event, index) => {
        const eventDate = new Date(event.startDateTime);
      });
      
    }
  }, [events, currentDate]);


  useEffect(() => {
    const fetchAllRooms = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const token = localStorage.getItem("authToken") || "";
      const response = await axios.get(`${API_BASE_URL}/api/v1/rooms`, {
        headers: {
          Authorization: token,
          "Accept-Language": localStorage.getItem("i18nextLng") || "en"
        },
        params: {
          page: 0,
          size: 10000,
          sortBy: "name",
          sortDirection: "asc"
        }
      });
      setAllRooms(response.data?.data || []);
    };
    fetchAllRooms();
  }, []);

  useEffect(() => {
    const fetchAllClasses = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const token = localStorage.getItem("authToken") || "";
      const response = await axios.get(`${API_BASE_URL}/api/v1/classes`, {
        headers: {
          Authorization: token,
          "Accept-Language": localStorage.getItem("i18nextLng") || "en"
        },
        params: {
          page: 0,
          size: 10000,
          sortBy: "name",
          sortDirection: "asc"
        }
      });
      setAllClasses(response.data?.data || []);
    };
    fetchAllClasses();
  }, []);

  useEffect(() => {
    const fetchAllTeachers = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const token = localStorage.getItem("authToken") || "";
      const response = await axios.get(`${API_BASE_URL}/api/v1/teachers/profiles`, {
        headers: {
          Authorization: token,
          "Accept-Language": localStorage.getItem("i18nextLng") || "en"
        },
        params: {
          page: 0,
          size: 10000,
          sortBy: "firstName",
          sortDirection: "asc"
        }
      });
      setAllTeachers(response.data?.data || []);
    };
    fetchAllTeachers();
  }, []);

  useEffect(() => {
    const fetchAllSubjects = async () => {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
      const token = localStorage.getItem("authToken") || "";
      const response = await axios.get(`${API_BASE_URL}/api/v1/subjects`, {
        headers: {
          Authorization: token,
          "Accept-Language": localStorage.getItem("i18nextLng") || "en"
        },
        params: {
          page: 0,
          size: 10000,
          sortBy: "name",
          sortDirection: "asc"
        }
      });
      setAllSubjects(response.data?.data || []);
    };
    fetchAllSubjects();
  }, []);

  function expandRecurringEvents(events, planStartDate, planEndDate) {
    if (!planStartDate || !planEndDate) return events;
    
    events.forEach(event => {
      if (event.isRecurring && event.recurringPattern === "WEEKLY") {
        let current = new Date(planStartDate);
        while (current <= planEndDate) {
        }
      }
    });
  }

  return (
    <div className="container-main mx-auto py-2 px-2 sm:px-4 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 print:hidden">
        <Breadcrumbs
          className="istui-calendar__main_breadcrumbs text-xs sm:text-base truncate"
          items={[
            { label: t("navigation.schedule"), href: "/resources" },
            { label: t("navigation.calendar"), href: "" },
          ]}
        />
        <div className="flex flex-wrap gap-2 sm:gap-3 justify-end">
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 mb-4 p-3 bg-secondary/30 rounded-lg border border-secondary">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">{t("calendar.timetable") || "Timetable"}:</span>
        </div>
        <Select value={selectedTimetableUuid} onValueChange={(value) => {
          const selectedTimetable = allTimetables.find(t => t.uuid === value);
          if (selectedTimetable) {
            console.log(`Found matching timetable: ${selectedTimetable.name}`);
          } else if (value !== "_all") {
            console.log(`Warning: No matching timetable found for UUID: ${value}`);
          }
          setSelectedTimetableUuid(value);
        }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("calendar.allTimetables") || "All Timetables"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">{t("calendar.allTimetables") || "All Timetables"}</SelectItem>
            {allTimetables.map(tt => (
              <SelectItem key={tt.uuid} value={tt.uuid}>
                {tt.name || tt.uuid}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loading.currentTimetable ? (
          <span className="text-sm italic">Loading...</span>
        ) : (
          <span className="font-semibold text-primary">{timetable?.name}</span>
        )}
        {timetable?.planStartDate && timetable?.planEndDate && (
          <span className="text-sm text-muted-foreground ml-auto">
            {timetable.planStartDate} - {timetable.planEndDate}
          </span>
        )}
        {error.currentTimetable && (
          <span className="text-sm text-amber-500 ml-2">
            {error.currentTimetable.includes('No timetable found for plan setting UUID') 
              ? 'No timetable generated yet for this timetable' 
              : `Error: ${error.currentTimetable}`}
          </span>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-2 bg-secondary print:hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h1 className="text-xl sm:text-2xl font-bold">{t("calendar.title")}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("calendar.exportCalendar") || "Export Calendar"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="istui-button istui-button--outline istui-button--sm flex items-center gap-1"
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4" />
                <span className="hidden xs:inline">{t("common.actions.print")}</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="istui-button istui-button--primary istui-button--sm flex items-center gap-1 hidden"
                onClick={handleCreateEvent}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden xs:inline">{t("calendar.createEvent")}</span>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder={t("actions.search")}
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <div className="absolute -top-5 left-0 text-xs font-medium text-primary flex items-center gap-1">
              </div>
              <Select value={filterRoom} onValueChange={setFilterRoom}>
                <SelectTrigger
                  className={`w-full p-2 border-2 rounded-md focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    filterRoom !== '_all' ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MapPin
                      className="h-4 w-4"
                      color={filterRoom !== '_all' ? 'var(--primary)' : undefined}
                    />
                    <SelectValue placeholder={t("calendar.allRooms")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">{t("calendar.allRooms")}</SelectItem>
                  {allRooms.map(room => (
                    <SelectItem key={String(room.uuid)} value={String(room.uuid) || "_unknown"}>
                      {room.name || room.uuid}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger>
                <SelectValue placeholder={t("calendar.filterByClass")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">{t("calendar.allClasses")}</SelectItem>
                {allClasses.map(classItem => (
                  <SelectItem key={String(classItem.uuid)} value={String(classItem.uuid)}>
                    {classItem.name || classItem.uuid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTeacher} onValueChange={(value) => {
              console.log("Selected teacher filter:", value);
              const teacher = allTeachers.find(t => t.uuid === value);
              if (teacher) {
                console.log("Selected teacher details:", {
                  uuid: teacher.uuid,
                  id: teacher.id,
                  fullName: teacher.fullName,
                  firstName: teacher.firstName,
                  lastName: teacher.lastName
                });
              }
              setFilterTeacher(value);
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t("calendar.filterByTeacher")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">{t("calendar.allTeachers")}</SelectItem>
                {allTeachers.map(teacherItem => (
                  <SelectItem key={String(teacherItem.uuid)} value={String(teacherItem.uuid)}>
                    {teacherItem.fullName ||
                      (teacherItem.firstName && teacherItem.lastName
                        ? `${teacherItem.firstName} ${teacherItem.lastName}`
                        : teacherItem.firstName || teacherItem.lastName || teacherItem.uuid)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger>
                <SelectValue placeholder={t("calendar.filterBySubject")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">{t("calendar.allSubjects")}</SelectItem>
                {allSubjects.map(subjectItem => (
                  <SelectItem key={String(subjectItem.uuid)} value={String(subjectItem.uuid)}>
                    {subjectItem.name || subjectItem.uuid}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mt-4 gap-2">
            <ViewSelector view={view} onChange={setView} />

            <div className="flex items-center w-full xs:w-auto justify-between xs:justify-end">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="h-8 px-3 rounded-l-md border-r"
                >
                  {t("calendar.today")}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToPrevious()}
                  className="h-8 w-8 rounded-none border-r"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 px-3 rounded-none font-medium"
                    >
                      {format(currentDate, view === "day" ? "MMMM d, yyyy" : view === "week" ? "MMMM yyyy" : "MMMM yyyy")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={currentDate}
                      onSelect={(date) => {
                        if (date) {
                          setCurrentDate(date);
                          setDatePickerOpen(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => goToNext()}
                  className="h-8 w-8 rounded-none border-l rounded-r-md"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <CalendarHeader
            view={view}
            currentDate={currentDate}
            roomFilter={{
              roomId: filterRoom,
              roomName: filterRoom !== '_all'
                ? allRooms.find(r => r.uuid === filterRoom)?.name
                : undefined
            }}
          />
        </CardHeader>

        <CardContent
          className={`flex-1 p-0 ${view === "month" ? "overflow-auto" : "overflow-auto"} print:overflow-visible print:h-auto`}
          style={{ height: 'calc(100vh - 250px)', minHeight: 0, overflow: 'auto' }}
        >
          {!timetable && !error.currentTimetable?.includes('No timetable found for plan setting UUID') ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <CalendarIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Timetable Available</h3>
              <p className="text-muted-foreground max-w-md">
                There is no timetable data available. 
                Please select a different plan setting or create a timetable.
              </p>
            </div>
          ) : (
            <div ref={calendarRef} style={{ height: '100%', minHeight: 0 }}>
              <CalendarGrid
                view={view}
                currentDate={currentDate}
                events={filteredEvents}
                onEventSelect={handleEventSelect}
                planStartDate={timetable?.planStartDate}
                planEndDate={timetable?.planEndDate}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          onClose={handleEventClose}
        />
      )}
    </div>
  );
};

export default PageCalendar;
