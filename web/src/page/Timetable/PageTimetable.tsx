import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    RefreshCw,
    Upload,
    Download,
    Printer,
    Filter as FilterIcon,
    Save,
    Sliders,
    Loader2,
    Menu,
    ChevronDown,
    Clock
} from "lucide-react";
import Header from "@/component/Core/layout/Header.tsx";
import Sidebar from "@/component/Core/layout/Sidebar.tsx";
import ScheduleGrid from "@/component/Timetable/ScheduleGrid.tsx";
import { Button } from "@/component/Ui/button.tsx";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs.tsx";
import { useToast } from "@/hook/useToast.ts";
import { useI18n } from "@/hook/useI18n";
import { useTheme } from "@/hook/useTheme.ts";
import { cn } from "@/util/util.ts";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { Progress } from "@/component/Ui/progress.tsx";
import {
    CardDescription,
    CardHeader
} from "@/component/Ui/card.tsx";
import { mockTimetableData, transformToScheduleData } from "@/store/Timetable/mockTimetableData";
import TimetableFilters from '@/component/Timetable/TimetableFilters';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/component/Ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/component/Ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/component/Ui/dropdown-menu';
import { transformApiTimetableData, filterTimetableData, processFilteredEntries } from "@/util/timetableUtils";
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/index';
import { fetchLatestTimetable, fetchAllTimetables, fetchTimetableByUuid } from '@/store/Timetable/timetableSlice';
import { TimetableService } from "@/services/timetable/TimetableService";
import { filterTimetableEntries, clearFilteredEntries } from '@/store/Timetable/timetableSlice';
import { useGetClassesQuery } from '@/store/Class/ApiClass';

const getDayNumber = (dayName: string): number => {
    const dayMap = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 7
    };
    return dayMap[dayName] || 1;
};

const PageTimetable = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { uuid: timetableUuid } = useParams();
    const { t } = useI18n();
    const [classType, setClassType] = useState(t("timetable.classType"));
    const [selectedClass, setSelectedClass] = useState(t("timetable.class1"));
    const { toast } = useToast();
    const { colorScheme } = useTheme();
    const isDarkMode = colorScheme === "dark";

    const { timetables, currentTimetable, filteredEntries, loading, error } = useSelector((state: RootState) => state.timetable);
    const isLoadingAny = loading.currentTimetable || loading.filteredEntries || loading.timetables;

    const [filters, setFilters] = useState<{
        teacherId?: string | number;
        roomId?: string | number;
        subjectId?: string | number;
        classId?: string | number;
    }>({});
    const [startDay, setStartDay] = useState(1);
    const [endDay, setEndDay] = useState(5);

    const [apiTimetableData, setApiTimetableData] = useState(null);
    const [scheduleData, setScheduleData] = useState(null);
    const [useApiData, setUseApiData] = useState(false);

    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    const {
        data: classesData,
        isLoading: isLoadingClasses
    } = useGetClassesQuery({
        page: 0,
        size: 100,
        sortBy: "name",
        sortDirection: "asc"
    });

    // Store the first class ID for reuse
    const [firstClassId, setFirstClassId] = useState<string | null>(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
            setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        dispatch(fetchAllTimetables(1));

        if (timetableUuid) {
            dispatch(fetchTimetableByUuid(timetableUuid));
        } else {
            dispatch(fetchLatestTimetable(1));
        }
    }, [dispatch, timetableUuid]);

    useEffect(() => {
        if (currentTimetable?.uuid && !timetableUuid) {
            navigate(`/timetable/${currentTimetable.uuid}`, { replace: true });
        }
    }, [currentTimetable, navigate, timetableUuid]);

    useEffect(() => {
        if (currentTimetable && classesData && classesData.data && classesData.data.length > 0) {
            // Set days from plan settings
            if (currentTimetable.planSettings) {
                setStartDay(1);
                setEndDay(currentTimetable.planSettings.daysPerWeek || 5);
            } else {
                setStartDay(currentTimetable.startDay || 1);
                setEndDay(currentTimetable.endDay || 5);
            }
            
            // Get the first class from the dropdown (sorted by name)
            const firstClass = classesData.data[0];
            
            if (firstClass && firstClass.id) {
                // Store the first class ID for reuse
                setFirstClassId(firstClass.id.toString());
                
                // Only set the initial filter if no filters already exist
                if (!filters.classId && !filters.teacherId && !filters.roomId && !filters.subjectId) {
                    // Apply filter for this class
                    const newFilters = {
                        teacherId: null,
                        roomId: null,
                        subjectId: null,
                        classId: firstClass.id.toString()
                    };
                    
                    setFilters(newFilters);
                    
                    // Dispatch the filter action
                    if (currentTimetable.uuid) {
                        dispatch(filterTimetableEntries({
                            uuid: currentTimetable.uuid,
                            classIds: [firstClass.id]
                        }));
                    }
                }
            }
        }
    }, [currentTimetable, classesData, dispatch, filters]);

    // Add this effect to update the TimetableFilters component when filters change
    useEffect(() => {
        // This will ensure the dropdown reflects the selected class
        if (filters.classId) {
            // You might need to fetch class details here if not already available
            // For now, we'll just set the class ID
            const classIdStr = filters.classId.toString();
            
            // This will update the dropdown in TimetableFilters component
            const timetableFiltersElement = document.querySelector('select[name="classFilter"]');
            if (timetableFiltersElement) {
                (timetableFiltersElement as HTMLSelectElement).value = classIdStr;
            }
        }
    }, [filters]);

    const timetableData = useMemo(() => {
        if (!currentTimetable) return null;

        const timetableToProcess = filteredEntries
            ? processFilteredEntries(currentTimetable, filteredEntries)
            : currentTimetable;

        const transformedData = transformApiTimetableData(timetableToProcess);

        const filteredData = filterTimetableData(transformedData, filters);

        // Filter days based on plan settings or day range
        if (filteredData && filteredData.days) {
            const maxDays = currentTimetable.planSettings?.daysPerWeek || (endDay - startDay + 1);
            
            filteredData.days = filteredData.days.filter(day => {
                const dayNumber = getDayNumber(day.name);
                return dayNumber >= startDay && dayNumber <= Math.min(startDay + maxDays - 1, endDay);
            });
        }

        return filteredData;
    }, [currentTimetable, filteredEntries, filters, startDay, endDay]);

    // Add a handler for when filters are cleared
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        
        // Apply the filters
        if (currentTimetable?.uuid) {
            // Check if all filters are set to "all" or null - this is a reset scenario
            const allFiltersCleared = 
                (!newFilters.classId || newFilters.classId === 'all') &&
                (!newFilters.teacherId || newFilters.teacherId === 'all') &&
                (!newFilters.roomId || newFilters.roomId === 'all') &&
                (!newFilters.subjectId || newFilters.subjectId === 'all');
                
            if (allFiltersCleared) {
                // Clear all filters and fetch the full timetable
                dispatch(clearFilteredEntries());
                dispatch(fetchTimetableByUuid(currentTimetable.uuid));
                return;
            }
            
            // Prepare filter parameters for non-empty filters
            const filterParams: any = {
                uuid: currentTimetable.uuid
            };
            
            // Add all non-null filters, excluding ones with value 'all'
            if (newFilters.classId && newFilters.classId !== 'all') filterParams.classIds = [newFilters.classId];
            if (newFilters.teacherId && newFilters.teacherId !== 'all') filterParams.teacherIds = [newFilters.teacherId];
            if (newFilters.roomId && newFilters.roomId !== 'all') filterParams.roomIds = [newFilters.roomId];
            if (newFilters.subjectId && newFilters.subjectId !== 'all') filterParams.subjectIds = [newFilters.subjectId];
            
            // Apply filters
            dispatch(filterTimetableEntries(filterParams));
        }
    };

    const handleDayRangeReset = () => {
        setStartDay(1);
        setEndDay(5);
    };

    const filteredTimetableData = useApiData && apiTimetableData
        ? filterTimetableData(apiTimetableData, filters)
        : mockTimetableData;

    const timetableWithDayRange = {
        ...filteredTimetableData,
        startDay,
        endDay
    };

    const displayScheduleData = useApiData
        ? transformApiTimetableData(filteredTimetableData)
        : transformToScheduleData(timetableWithDayRange);

    const dayOptions = [
        { value: 1, label: t("timetable.headers.monday") },
        { value: 2, label: t("timetable.headers.tuesday") },
        { value: 3, label: t("timetable.headers.wednesday") },
        { value: 4, label: t("timetable.headers.thursday") },
        { value: 5, label: t("timetable.headers.friday") },
        { value: 6, label: t("timetable.headers.saturday") },
        { value: 7, label: t("timetable.headers.sunday") }
    ];

    const handleAction = (action: string) => {
        toast({
            title: action,
            description: t("common.status.actionSuccess", { action }),
        });
    };

    const getRelativeTimeFromDate = (dateString?: string): string => {
        if (!dateString) return "-";

        try {
            const date = new Date(dateString);
            const now = new Date();

            if (isNaN(date.getTime())) {
                return "-";
            }

            const diffMs = now.getTime() - date.getTime();
            const diffSec = Math.floor(diffMs / 1000);
            const diffMin = Math.floor(diffSec / 60);
            const diffHour = Math.floor(diffMin / 60);
            const diffDay = Math.floor(diffHour / 24);
            const diffMonth = Math.floor(diffDay / 30);

            if (diffSec < 60) {
                return "just now";
            } else if (diffMin < 60) {
                return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
            } else if (diffHour < 24) {
                return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
            } else if (diffDay < 30) {
                return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
            } else {
                return `${diffMonth} ${diffMonth === 1 ? 'month' : 'months'} ago`;
            }
        } catch (error) {
            return "-";
        }
    };
    useEffect(() => {
        const fetchTimetableData = async () => {
            try {
                const data = await TimetableService.getLatestTimetable();

                setRawApiResponse(data);

                setApiTimetableData(data);
            } catch (error) {
                console.error("Error fetching timetable data:", error);
            }
        };

        fetchTimetableData();
    }, []);

    const [rawApiResponse, setRawApiResponse] = useState(null);

    const handleTimetableSelect = (uuid: string) => {
        if (uuid !== currentTimetable?.uuid) {
            navigate(`/timetable/${uuid}`);
            dispatch(fetchTimetableByUuid(uuid));
            setFilters({});
            dispatch(clearFilteredEntries());
        }
    };

    const handlePlanSettingsClick = () => {
        if (currentTimetable?.planSettingUuid) {
            navigate(`/plan-settings/${currentTimetable.planSettingUuid}`);
        } else {
            toast({
                title: "No Plan Settings",
                description: "This timetable doesn't have associated plan settings.",
                variant: "destructive"
            });
        }
    };

    const MobileActionsMenu = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden istui-button istui-button--outline istui-button--sm flex items-center gap-1"
                >
                    <Menu className="h-4 w-4" />
                    {t("timetable.actions")}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>{t("timetable.actions")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handlePlanSettingsClick} className="flex items-center gap-2 cursor-pointer">
                    <Sliders className="h-4 w-4" />
                    {t("timetable.planSettings")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(t("timetable.import"))} className="flex items-center gap-2 cursor-pointer">
                    <Upload className="h-4 w-4" />
                    {t("timetable.import")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(t("timetable.export"))} className="flex items-center gap-2 cursor-pointer">
                    <Download className="h-4 w-4" />
                    {t("timetable.export")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(t("timetable.print"))} className="flex items-center gap-2 cursor-pointer">
                    <Printer className="h-4 w-4" />
                    {t("timetable.print")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(t("timetable.filter"))} className="flex items-center gap-2 cursor-pointer">
                    <FilterIcon className="h-4 w-4" />
                    {t("timetable.filter")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const MobileFiltersSheet = () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex lg:hidden items-center gap-1">
                    <FilterIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">{t("timetable.filters")}</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{t("timetable.filters.title")}</SheetTitle>
                    <SheetDescription>
                        {t("timetable.filters.description")}
                    </SheetDescription>
                </SheetHeader>
                <div className="py-6 space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">{t("timetable.filters.filter")}</h3>
                        <div className="space-y-3">
                            <TimetableFilters
                                timetableUuid={currentTimetable?.uuid || ''}
                                onFilterChange={handleFilterChange}
                                onDayRangeReset={handleDayRangeReset}
                                initialFilters={filters}
                                isMobile={true}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">{t("timetable.days")}</h3>
                        <div className="space-y-3">
                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">{t("timetable.filters.startDay")}</span>
                                    <Select
                                        value={startDay.toString()}
                                        onValueChange={(value) => setStartDay(parseInt(value))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Start Day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dayOptions.map((day) => (
                                                <SelectItem
                                                    key={day.value}
                                                    value={day.value.toString()}
                                                    disabled={day.value > endDay}
                                                >
                                                    {day.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sm text-gray-500 mb-1">{t("timetable.filters.endDay")}</span>
                                    <Select
                                        value={endDay.toString()}
                                        onValueChange={(value) => setEndDay(parseInt(value))}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="End Day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dayOptions.map((day) => (
                                                <SelectItem
                                                    key={day.value}
                                                    value={day.value.toString()}
                                                    disabled={day.value < startDay}
                                                >
                                                    {day.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );

    const RefreshButton = () => (
        <Button
            variant="ghost"
            size="sm"
            className="text-primary flex items-center gap-1"
            onClick={() => handleAction(t("timetable.regenerate"))}
        >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">
        {t("timetable.regenerate")}
      </span>
        </Button>
    );

    const LastUpdated = () => (
        <span
            className={cn(
                isDarkMode ? "text-gray-500" : "text-gray-500",
                "text-xs sm:text-sm flex items-center whitespace-nowrap"
            )}
        >
      <span className="hidden sm:inline mr-1 ml-1">|</span>
            {t("timetable.lastUpdated")}: {getRelativeTimeFromDate(rawApiResponse?.modifiedDate)}
    </span>
    );

    const LastGenerated = () => (
        <span
            className={cn(
                isDarkMode ? "text-gray-500" : "text-gray-500",
                "text-xs sm:text-sm flex items-center whitespace-nowrap mr-2"
            )}
        >
      {t("timetable.lastGenerated")}: {getRelativeTimeFromDate(rawApiResponse?.generatedDate)}
    </span>
    );

    const TimetableSelector = () => {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        {currentTimetable?.name || t("timetable.selectTimetable")}
                        <ChevronDown className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>{t("timetable.selectTimetable")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {timetables.map((timetable) => (
                        <DropdownMenuItem
                            key={timetable.uuid}
                            onClick={() => handleTimetableSelect(timetable.uuid)}
                            className={cn(
                                "cursor-pointer",
                                currentTimetable?.uuid === timetable.uuid && "bg-primary/10 font-medium"
                            )}
                        >
                            {timetable.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        );
    };
    const DesktopActionButtons = () => (
        <div className="hidden lg:flex flex-wrap items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="istui-button istui-button--outline istui-button--sm flex items-center gap-1"
                onClick={handlePlanSettingsClick}
            >
                <Sliders className="h-4 w-4" />
                {t("timetable.planSettings")}
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="istui-button istui-button--outline istui-button--sm flex items-center gap-1"
                onClick={() => handleAction(t("timetable.import"))}
            >
                <Upload className="h-4 w-4" />
                {t("timetable.import")}
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="istui-button istui-button--outline istui-button--sm flex items-center gap-1"
                onClick={() => handleAction(t("timetable.export"))}
            >
                <Download className="h-4 w-4" />
                {t("timetable.export")}
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="istui-button istui-button--outline istui-button--sm flex items-center gap-1"
                onClick={() => handleAction(t("timetable.print"))}
            >
                <Printer className="h-4 w-4" />
                {t("timetable.print")}
            </Button>

            <Button
                variant="outline"
                size="sm"
                className="istui-button istui-button--outline istui-button--sm flex items-center gap-1"
                onClick={() => handleAction(t("timetable.filter"))}
            >
                <FilterIcon className="h-4 w-4" />
                {t("timetable.filter")}
            </Button>
        </div>
    );

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'N/A';

        const date = new Date(dateString);
        const now = new Date();

        if (isNaN(date.getTime())) return 'N/A';

        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return `${diffInHours} hours ago`;
        } else {
            return date.toLocaleDateString() + ' ' +
                date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    // Check if any filters are active
    const filtersActive = useMemo(() => {
        return Object.values(filters).some(value => value && value !== "all");
    }, [filters]);

    return (
        <div className="flex h-screen bg-background-main">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header />
                <main className="flex-1 overflow-hidden istui-timetable__main_content">
                    {isLoadingAny && (
                        <div className="fixed top-0 left-0 w-full z-50">
                            <Progress
                                value={100}
                                className="h-1"
                                indicatorColor="animate-pulse bg-blue-500"
                            />
                        </div>
                    )}
                    <div className="container mx-auto py-4 px-2 sm:px-4 md:px-6 h-full flex flex-col istui-timetable__main_content">

                        <div className="flex justify-between items-center mb-4 istui-timetable__main_breadcrumbs_wrapper">
                            <Breadcrumbs
                                className="istui-timetable__main_breadcrumbs hidden md:flex"
                                items={[
                                    { label: t("navigation.schedule"), href: "/timetable" },
                                    { label: currentTimetable?.name || t("navigation.timetable"), href: currentTimetable?.uuid ? `/timetable/${currentTimetable.uuid}` : "/timetable" },
                                ]}
                            />
                            <div className="md:hidden">
                                <h2 className="text-lg font-semibold">{t("navigation.timetable")}</h2>
                            </div>
                        </div>

                        <div className="overflow-y-auto space-y-4">
                            <CardHeader className="pb-2 bg-secondary rounded-lg">
                                <div className="flex flex-col space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-xl md:text-2xl font-bold">
                                                {t("timetable.title")}
                                            </h1>
                                            <TimetableSelector />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <MobileActionsMenu />

                                            <MobileFiltersSheet />

                                            <DesktopActionButtons />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <div className="hidden md:flex items-center gap-2">
                                            <div className="w-40">
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 ml-auto">
                                            <div className="flex items-center">
                                                <RefreshCw className="h-4 w-4 mr-1 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                          {t("timetable.lastGenerated")}: {formatDate(currentTimetable?.generatedDate)}
                        </span>
                                            </div>
                                            <div className="flex items-center ml-4">
                                                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                          {t("timetable.lastUpdated")}: {formatDate(currentTimetable?.modifiedDate)}
                        </span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="ml-2"
                                                onClick={() => handleAction(t("timetable.regenerate"))}
                                            >
                                                <RefreshCw className="h-4 w-4 mr-1" />
                                                {t("timetable.regenerate")}
                                            </Button>
                                        </div>
                                    </div>

                                    <CardDescription></CardDescription>
                                </div>
                            </CardHeader>

                            <div className="istui-timetable">
                                <div className="hidden lg:flex flex-wrap gap-4 mb-4">
                                    <TimetableFilters
                                        timetableUuid={currentTimetable?.uuid || ''}
                                        onFilterChange={handleFilterChange}
                                        onDayRangeReset={handleDayRangeReset}
                                        initialFilters={filters}
                                    />

                                    <div className="flex items-center gap-2 ml-4">
                                        <span className="text-sm font-medium whitespace-nowrap">{t("timetable.days")}:</span>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Select
                                                value={startDay.toString()}
                                                onValueChange={(value) => setStartDay(parseInt(value))}
                                            >
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="Start Day" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dayOptions.map((day) => (
                                                        <SelectItem
                                                            key={day.value}
                                                            value={day.value.toString()}
                                                            disabled={day.value > endDay}
                                                        >
                                                            {day.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            <span>{t("timetable.to")}</span>

                                            <Select
                                                value={endDay.toString()}
                                                onValueChange={(value) => setEndDay(parseInt(value))}
                                            >
                                                <SelectTrigger className="w-[120px]">
                                                    <SelectValue placeholder="End Day" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {dayOptions.map((day) => (
                                                        <SelectItem
                                                            key={day.value}
                                                            value={day.value.toString()}
                                                            disabled={day.value < startDay}
                                                        >
                                                            {day.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <div className="overflow-x-auto pb-4">
                                    {isLoadingAny ? (
                                        <div className="flex justify-center items-center h-64">
                                            <Loader2 className="h-8 w-8 animate-spin" />
                                            <span className="ml-2">{t("timetable.status.loadingTimetable")}</span>
                                        </div>
                                    ) : (
                                        timetableData ? (
                                            <div className={cn("min-w-full lg:min-w-[768px]", isMobile ? "scale-90 origin-top-left" : "")}>
                                                <ScheduleGrid
                                                    scheduleData={timetableData}
                                                    isMobile={isMobile}
                                                    isTablet={isTablet}
                                                    timetableUuid={currentTimetable?.uuid}
                                                    activeFilters={filters}
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex justify-center items-center h-64">
                                                <span>{t("timetable.status.noTimetableData")}</span>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mt-4 p-2 sm:p-4 bg-card rounded-lg">
                                    {useApiData && scheduleData && scheduleData.cachedData && scheduleData.cachedData.subjects ?
                                        scheduleData.cachedData.subjects.map(subject => (
                                            <div key={subject.id} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 sm:w-4 sm:h-4 rounded border flex-shrink-0"
                                                    style={{ backgroundColor: subject.color, borderColor: subject.color }}
                                                ></div>
                                                <span className="text-xs sm:text-sm truncate">{subject.name}</span>
                                            </div>
                                        )) :
                                        timetableWithDayRange.cachedData && timetableWithDayRange.cachedData.subjects ?
                                            timetableWithDayRange.cachedData.subjects.map(subject => (
                                                <div key={subject.id} className="flex items-center gap-2">
                                                    <div
                                                        className={cn(
                                                            "w-3 h-3 sm:w-4 sm:h-4 rounded border flex-shrink-0",
                                                            `bg-${subject.color}-500 border-${subject.color}-500`
                                                        )}
                                                    ></div>
                                                    <span className="text-xs sm:text-sm truncate">{subject.name}</span>
                                                </div>
                                            )) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PageTimetable;