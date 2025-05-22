import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Header from "@/component/Core/layout/Header";
import Sidebar from "@/component/Core/layout/Sidebar";
import Breadcrumbs from "@/component/Core/navigation/Breadcrumbs";
import { useToast } from "@/hook/useToast";
import { useI18n } from "@/hook/useI18n";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/index";
import { 
  fetchAllTimetables, 
  updateTimetableEntryLockStatus, 
  bulkUpdateTimetableEntriesLockStatus 
} from "@/store/Timetable/timetableSlice";
import { TimetableService } from "@/services/timetable/TimetableService";
import { TypeTimetable, TimetableEntry } from "@/type/Timetable/TypeTimetable";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/component/Ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { Input } from "@/component/Ui/input";
import { Button } from "@/component/Ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/component/Ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/component/Ui/dialog";
import { Checkbox } from "@/component/Ui/checkbox";
import { Badge } from "@/component/Ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/component/Ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/component/Ui/dropdown-menu";
import { Separator } from "@/component/Ui/separator";
import { ScrollArea } from "@/component/Ui/scroll-area";

import {
  Search,
  Lock,
  Unlock,
  X,
  Filter,
  Calendar,
  BookOpen,
  AlertCircle,
  LayoutGrid,
  List,
  Clock,
  Sliders,
  MoreHorizontal,
  Eye,
  Loader2,
} from "lucide-react";

import { motion } from "framer-motion";

const PageTimetableLock = () => {
  const { t } = useI18n();
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const [timetables, setTimetables] = useState<TypeTimetable[]>([]);
  const [selectedTimetable, setSelectedTimetable] = useState<TypeTimetable | null>(null);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("teachers");
  const [searchTerm, setSearchTerm] = useState("");
  const [manualPlans, setManualPlans] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"lock" | "unlock" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortBy, setSortBy] = useState<string>("day");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showHistory, setShowHistory] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [viewPlan, setViewPlan] = useState<any | null>(null);
  const [singleConfirmDialogOpen, setSingleConfirmDialogOpen] = useState(false);
  const [singleConfirmAction, setSingleConfirmAction] = useState<{
    id: number;
    currentStatus: boolean;
    action: "lock" | "unlock";
  } | null>(null);

  // Add pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Refs for scroll handling
  const listContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Now compute filteredManualPlans
  const filteredManualPlans = useMemo(() => {
    return manualPlans
      .filter(plan =>
        plan.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.day.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let vA = a[sortBy as keyof typeof a];
        let vB = b[sortBy as keyof typeof b];
        if (typeof vA === "string" && typeof vB === "string") {
          return sortOrder === "asc"
            ? vA.localeCompare(vB)
            : vB.localeCompare(vA);
        }
        if (typeof vA === "number" && typeof vB === "number") {
          return sortOrder === "asc" ? vA - vB : vB - vA;
        }
        return 0;
      });
  }, [manualPlans, searchTerm, sortBy, sortOrder]);

  // Now compute isAllSelected
  const isAllSelected = useMemo(() => {
    return filteredManualPlans.length > 0 && 
      filteredManualPlans.every(plan => selectedItems.includes(plan.id));
  }, [filteredManualPlans, selectedItems]);

  useEffect(() => {
    const fetchTimetables = async () => {
      setLoading(true);
      try {
        const data = await TimetableService.getAllTimetables();
        setTimetables(data);
        if (data.length > 0) {
          setSelectedTimetable(data[0]);
        }
      } catch (error) {
        console.error("Error fetching timetables:", error);
        toast({
          title: t("common.error"),
          description: t("timetable.lock.fetchError"),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTimetables();
  }, []);

  useEffect(() => {
    if (selectedTimetable?.uuid) {
      // Reset pagination when timetable changes
      setPage(0);
      setHasMore(true);
      setManualPlans([]);
      fetchTimetableEntries(selectedTimetable.uuid);
    }
  }, [selectedTimetable]);

  // Reset pagination when filters or sort changes
  useEffect(() => {
    if (selectedTimetable?.uuid) {
      setPage(0);
      setHasMore(true);
      setManualPlans([]);
      fetchTimetableEntries(selectedTimetable.uuid);
    }
  }, [sortBy, sortOrder, searchTerm]);

  const fetchTimetableEntries = async (uuid: string, pageNum = 0, append = false) => {
    const loadingState = append ? setIsLoadingMore : setLoading;
    loadingState(true);
    
    try {
      // Build filter parameters without filter state
      const params = {
        page: pageNum,
        size: pageSize,
        ...(searchTerm && { keyword: searchTerm })
      };
      
      const response = await TimetableService.getTimetableEntriesByUuid(uuid, params);
      console.log("API response:", response);
      
      // Extract data from the response
      const entries = response.data || [];
      const totalCount = response.totalItems || 0;
      const totalPagesCount = response.totalPages || 0;
      const hasNextPage = response.hasNext || false;
      
      setTotalEntries(totalCount);
      setTotalPages(totalPagesCount);
      setHasMore(hasNextPage);
      
      // Format entries for display
      const formattedEntries = entries.map((entry: TimetableEntry) => {
        return {
          id: entry?.id,
          uuid: entry?.uuid,
          className: entry?.className || `Class ${entry?.classId}`,
          subject: entry?.subjectName || "No Subject",
          teacher: entry?.teacherName || "No Teacher",
          room: entry?.roomName || "No Room",
          day: getDayName(entry?.dayOfWeek),
          period: entry.period,
          startTime: calculateStartTime(entry.period),
          endTime: calculateEndTime(entry.period, entry.durationMinutes),
          locked: entry?.isLocked
        };
      });
      
      if (append) {
        setManualPlans(prev => [...prev, ...formattedEntries]);
      } else {
        setManualPlans(formattedEntries);
      }
    } catch (error) {
      console.error("Error fetching timetable entries:", error);
      toast({
        title: t("common.error"),
        description: t("timetable.lock.fetchError"),
        variant: "destructive",
      });
    } finally {
      loadingState(false);
    }
  };

  // Load more entries when user scrolls to bottom or clicks "Load More"
  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !hasMore || !selectedTimetable?.uuid) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTimetableEntries(selectedTimetable.uuid, nextPage, true);
  }, [page, isLoadingMore, hasMore, selectedTimetable]);

  // Handle scroll events for infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (
        listContainerRef.current &&
        hasMore &&
        !loading &&
        !isLoadingMore
      ) {
        const { scrollTop, clientHeight, scrollHeight } = listContainerRef.current;
        // Trigger loading when user scrolls to within 200px of the bottom
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 200;
        
        if (isNearBottom) {
          handleLoadMore();
        }
      }
    };
    
    const listElement = listContainerRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, loading, isLoadingMore, handleLoadMore]);

  const getDayName = (dayNumber: number): string => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    return days[dayNumber - 1] || "Unknown";
  };

  const calculateStartTime = (period: number): string => {
    const hour = 8 + Math.floor((period - 1) * 45 / 60);
    const minute = ((period - 1) * 45) % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const calculateEndTime = (period: number, durationMinutes: number): string => {
    const startMinutes = 8 * 60 + ((period - 1) * 45);
    const endMinutes = startMinutes + durationMinutes;
    const hour = Math.floor(endMinutes / 60);
    const minute = endMinutes % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleTimetableChange = (uuid: string) => {
    const selected = timetables.find(t => t.uuid === uuid);
    if (selected) {
      setSelectedTimetable(selected);
    }
  };

  const toggleLockStatus = async (id: number, currentStatus: boolean) => {
    setSingleConfirmAction({
      id,
      currentStatus,
      action: currentStatus ? "unlock" : "lock"
    });
    setSingleConfirmDialogOpen(true);
  };

  const handleSingleLockAction = async () => {
    if (!singleConfirmAction) return;
    
    setIsLoading(true);
    
    try {
      // Find the entry in manualPlans
      const entry = manualPlans.find(plan => plan.id === singleConfirmAction.id);
      
      if (!entry || !entry.uuid) {
        throw new Error("Entry not found or missing UUID");
      }
      
      console.log("Updating lock status for entry:", entry);
      
      // Call the service directly
      await TimetableService.updateTimetableEntryLockStatus(
        entry.uuid,
        singleConfirmAction.action === "lock"
      );
      
      // Update local state
      setManualPlans(prev => prev.map(plan => 
        plan.id === singleConfirmAction.id
          ? { ...plan, locked: singleConfirmAction.action === "lock" } 
          : plan
      ));
      
      toast({
        title: singleConfirmAction.action === "lock" 
          ? t("timetable.lock.itemLocked") 
          : t("timetable.lock.itemUnlocked"),
        description: t("timetable.lock.statusChanged"),
      });
    } catch (error) {
      console.error("Error updating lock status:", error);
      toast({
        title: t("common.error"),
        description: t("timetable.lock.actionFailed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSingleConfirmDialogOpen(false);
      setSingleConfirmAction(null);
    }
  };

  const handleLockAction = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: t("common.error"),
        description: t("timetable.lock.noEntriesSelected"),
        variant: "destructive",
      });
      setConfirmDialogOpen(false);
      setConfirmAction(null);
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the selected entries from manualPlans instead of timetableEntries
      const selectedEntries = manualPlans.filter(plan => 
        selectedItems.includes(plan.id)
      );
      
      if (selectedEntries.length === 0) {
        throw new Error("No entries selected");
      }
      
      // Make sure we have the UUIDs
      const entryUuids = selectedEntries.map(entry => entry.uuid);
      
      if (!entryUuids.length || !selectedTimetable?.uuid) {
        throw new Error("Missing UUIDs for entries or timetable");
      }
      
      console.log("Selected entries:", selectedEntries);
      console.log("Entry UUIDs:", entryUuids);
      console.log("Timetable UUID:", selectedTimetable?.uuid);
      
      // Call the service directly instead of using Redux
      await TimetableService.bulkUpdateTimetableEntriesLockStatus(
        selectedTimetable.uuid,
        entryUuids,
        confirmAction === "lock"
      );
      
      // Update local state
      setManualPlans(prev => prev.map(plan => 
        selectedItems.includes(plan.id) 
          ? { ...plan, locked: confirmAction === "lock" } 
          : plan
      ));
      
      toast({
        title: confirmAction === "lock" 
          ? t("timetable.lock.lockSuccess") 
          : t("timetable.lock.unlockSuccess"),
        description: t("timetable.lock.actionComplete"),
      });
      
      // Clear selection after successful action
      setSelectedItems([]);
    } catch (error) {
      console.error("Error performing lock action:", error);
      toast({
        title: t("common.error"),
        description: t("timetable.lock.actionError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setConfirmDialogOpen(false);
      setConfirmAction(null);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all items
      setSelectedItems(filteredManualPlans.map(plan => plan.id));
    } else {
      // Deselect all items
      setSelectedItems([]);
    }
  };

  const openConfirmDialog = (action: "lock" | "unlock") => {
    if (selectedItems.length === 0) {
      toast({
        title: t("timetable.lock.noSelection"),
        description: t("timetable.lock.selectItemsFirst"),
        variant: "destructive",
      });
      return;
    }
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  return (
    <div className="flex h-screen bg-background-main">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="container-main mx-auto py-4 px-4 sm:px-6 h-full flex flex-col">
            <Breadcrumbs
              items={[
                { label: t("navigation.schedule"), href: "" },
                { label: t("timetable.lock.title"), href: "/timetable/lock" },
              ]}
            />

            <div className="flex items-center justify-between my-6">
              <div>
                <h1 className="text-2xl font-bold flex items-center">
                  <Lock className="h-6 w-6 mr-2 text-primary" />
                  {t("timetable.lock.title")}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {t("timetable.lock.description")}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium">{t("timetable.select")}:</label>
                <select 
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedTimetable?.uuid || ""}
                  onChange={(e) => handleTimetableChange(e.target.value)}
                  disabled={loading}
                >
                  {timetables.map(timetable => (
                    <option key={timetable.uuid} value={timetable.uuid}>
                      {timetable.name || `Timetable ${timetable.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Card className="shadow-md border-muted mb-6">
              <CardHeader className="pb-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center text-primary">
                      <Lock className="h-5 w-5 mr-2" />
                      {t("timetable.lock.manageLockedItems")}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {t("timetable.lock.preventChanges")}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2 ">
                    <div className="relative w-64">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder={t("common.search")}
                        className="pl-8 border-muted focus:border-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-muted hover:bg-muted/20"
                          >
                            <Filter className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("common.filter")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Button 
                    variant="default" 
                    className="bg-primary text-white flex items-center"
                    disabled
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("timetable.lock.manualPlans")}
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
                  >
                    {viewMode === "table" ? <LayoutGrid className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
                    {viewMode === "table" ? t("common.gridView") : t("common.tableView")}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHistory(true)}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {t("timetable.lock.history")}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRules(true)}
                  >
                    <Sliders className="h-4 w-4 mr-2" />
                    {t("timetable.lock.rules")}
                  </Button>
                  
                  <div className="ml-auto flex gap-2">
                    {viewMode === "table" && (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setConfirmAction("lock");
                            setConfirmDialogOpen(true);
                          }}
                          disabled={selectedItems.length === 0}
                          className="flex items-center"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          {t("timetable.lock.lockSelected")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setConfirmAction("unlock");
                            setConfirmDialogOpen(true);
                          }}
                          disabled={selectedItems.length === 0}
                          className="flex items-center"
                        >
                          <Unlock className="h-4 w-4 mr-2" />
                          {t("timetable.lock.unlockSelected")}
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {viewMode === "table" ? (
                  <div 
                    className="h-[calc(100vh-400px)] mt-4 overflow-auto" 
                    ref={listContainerRef}
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell className="w-[30px] p-2">
                            <Checkbox
                              checked={isAllSelected}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableCell>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("className")}>{t("common.class")}</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("subject")}>{t("common.subject")}</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("teacher")}>{t("common.teacher")}</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("room")}>{t("common.room")}</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("day")}>{t("common.day")}</TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleSort("period")}>{t("common.period")}</TableHead>
                          <TableHead>{t("timetable.lock.status")}</TableHead>
                          <TableHead className="text-right">{t("common.actions")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredManualPlans.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              {searchTerm ? t("common.noSearchResults") : t("timetable.lock.noManualPlans")}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredManualPlans.map((plan) => (
                            <TableRow key={plan.id} className={plan.locked ? "bg-muted/10" : ""}>
                              <TableCell className="w-[30px] p-2">
                                <Checkbox
                                  checked={selectedItems.includes(plan.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      handleSelectItem(plan.id);
                                    } else {
                                      handleSelectItem(plan.id);
                                    }
                                  }}
                                />
                              </TableCell>
                              <TableCell>{plan.className}</TableCell>
                              <TableCell>{plan.subject}</TableCell>
                              <TableCell>{plan.teacher}</TableCell>
                              <TableCell>{plan.room}</TableCell>
                              <TableCell>{plan.day}</TableCell>
                              <TableCell>{plan.period}</TableCell>
                              <TableCell>
                                <Badge variant={plan.locked ? "default" : "outline"}>
                                  {plan.locked ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                                  {plan.locked ? t("timetable.lock.locked") : t("timetable.lock.unlocked")}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => toggleLockStatus(plan.id, plan.locked)}>
                                      {plan.locked ? (
                                        <Unlock className="h-4 w-4 mr-2" />
                                      ) : (
                                        <Lock className="h-4 w-4 mr-2" />
                                      )}
                                      {plan.locked ? t("timetable.lock.unlock") : t("timetable.lock.lock")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setViewPlan(plan)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      {t("common.view")}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                    
                    {/* Loading more indicator */}
                    {isLoadingMore && (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                    
                    {/* Load more button */}
                    {hasMore && manualPlans.length > 0 && !isLoadingMore && (
                      <div className="flex justify-center py-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleLoadMore}
                          className="min-w-[200px]"
                        >
                          {t("common.loadMore")}
                          {totalEntries > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({manualPlans.length}/{totalEntries})
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {/* End of list message */}
                    {!hasMore && manualPlans.length > 0 && (
                      <div className="text-center py-3 text-xs text-muted-foreground">
                        {t("common.endOfList", { count: String(manualPlans.length) })}
                      </div>
                    )}
                    
                    {/* Reference element for scroll position */}
                    <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
                  </div>
                ) : (
                  <div 
                    className="h-[calc(100vh-400px)] mt-4 overflow-auto" 
                    ref={listContainerRef}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pb-4">
                      {filteredManualPlans.length === 0 ? (
                        <div className="col-span-full flex justify-center items-center h-32 text-muted-foreground">
                          {searchTerm ? t("common.noSearchResults") : t("timetable.lock.noManualPlans")}
                        </div>
                      ) : (
                        filteredManualPlans.map((plan, index) => (
                          <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index % 3 * 0.1 }}
                          >
                            <Card key={plan.id} className={`p-4 ${plan.locked ? "border-primary" : ""}`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-bold">{plan.subject}</div>
                                <Badge variant={plan.locked ? "default" : "outline"}>
                                  {plan.locked ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                                  {plan.locked ? t("timetable.lock.locked") : t("timetable.lock.unlocked")}
                                </Badge>
                              </div>
                              <div className="text-xs mb-1">{plan.className} • {plan.teacher}</div>
                              <div className="text-xs mb-1">{plan.room} • {plan.day}</div>
                              <div className="text-xs mb-2">
                                {t("common.period")} {plan.period} ({plan.startTime} - {plan.endTime})
                              </div>
                              <div className="flex gap-2">
                                {plan.locked ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleLockStatus(plan.id, plan.locked)}
                                  >
                                    <Unlock className="h-4 w-4 mr-1" />
                                    {t("timetable.lock.unlock")}
                                  </Button>
                                ) : (
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => toggleLockStatus(plan.id, plan.locked)}
                                  >
                                    <Lock className="h-4 w-4 mr-1" />
                                    {t("timetable.lock.lock")}
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setViewPlan(plan)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  {t("common.view")}
                                </Button>
                              </div>
                            </Card>
                          </motion.div>
                        ))
                      )}
                    </div>
                    
                    {/* Loading more indicator */}
                    {isLoadingMore && (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                    
                    {/* Load more button */}
                    {hasMore && manualPlans.length > 0 && !isLoadingMore && (
                      <div className="flex justify-center py-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleLoadMore}
                          className="min-w-[200px]"
                        >
                          {t("common.loadMore")}
                          {totalEntries > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              ({manualPlans.length}/{totalEntries})
                            </span>
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {/* End of list message */}
                    {!hasMore && manualPlans.length > 0 && (
                      <div className="text-center py-3 text-xs text-muted-foreground">
                        {t("common.endOfList", { count: String(manualPlans.length) })}
                      </div>
                    )}
                    
                    {/* Reference element for scroll position */}
                    <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg">
              {confirmAction === "lock" ? (
                <Lock className="h-5 w-5 mr-2 text-primary" />
              ) : (
                <Unlock className="h-5 w-5 mr-2 text-primary" />
              )}
              {confirmAction === "lock" 
                ? t("timetable.lock.confirmLock") 
                : t("timetable.lock.confirmUnlock")}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {confirmAction === "lock" 
                ? t("timetable.lock.confirmLockDescription") 
                : t("timetable.lock.confirmUnlockDescription")}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-md border border-muted mt-2">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <p className="text-sm">
              {confirmAction === "lock" 
                ? t("timetable.lock.lockWarning") 
                : t("timetable.lock.unlockWarning")}
            </p>
          </div>
          
          <div className="bg-muted/30 p-3 rounded-md mt-2">
            <p className="text-sm font-medium mb-2">{t("timetable.lock.selectedItemsSummary")}:</p>
            <ul className="text-sm space-y-1 max-h-32 overflow-y-auto">
              {selectedItems.map(id => {
                const item = manualPlans.find(p => p.id === id);
                return item && (
                  <li key={id}>• {item.subject} - {item.className} ({item.day}, Period {item.period})</li>
                );
              })}
            </ul>
          </div>
          
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isLoading}
              className="border-muted"
            >
              <X className="h-4 w-4 mr-2" />
              {t("common.cancel")}
            </Button>
            <Button
              variant={confirmAction === "lock" ? "default" : "outline"}
              onClick={handleLockAction}
              disabled={isLoading}
              className={confirmAction === "lock" ? "bg-primary text-white" : ""}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  {t("common.processing")}
                </div>
              ) : (
                <>
                  {confirmAction === "lock" ? (
                    <Lock className="h-4 w-4 mr-2" />
                  ) : (
                    <Unlock className="h-4 w-4 mr-2" />
                  )}
                  {confirmAction === "lock" 
                    ? t("timetable.lock.lockItems") 
                    : t("timetable.lock.unlockItems")}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showHistory && (
        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Clock className="h-5 w-5 mr-2" />
                {t("timetable.lock.history")}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-64 overflow-y-auto">
              <ul className="text-xs">
                <li>2024-05-01 09:00 - Locked "ENGLISH - S2" by Admin</li>
                <li>2024-05-01 10:00 - Unlocked "Science Lab" by Teacher1</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHistory(false)}>
                {t("common.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showRules && (
        <Dialog open={showRules} onOpenChange={setShowRules}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <Sliders className="h-5 w-5 mr-2" />
                {t("timetable.lock.rules")}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-64 overflow-y-auto">
              <ul className="text-xs">
                <li>Rule: Lock all core subjects (Mathematics, Science, English)</li>
                <li>Rule: Lock all plans for senior teachers</li>
              </ul>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRules(false)}>
                {t("common.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {viewPlan && (
        <Dialog open={!!viewPlan} onOpenChange={() => setViewPlan(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <BookOpen className="h-5 w-5 mr-2" />
                {t("timetable.lock.planDetails")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-semibold">{t("common.subject")}: </span>
                {viewPlan.subject}
              </div>
              <div>
                <span className="font-semibold">{t("common.class")}: </span>
                {viewPlan.className}
              </div>
              <div>
                <span className="font-semibold">{t("common.teacher")}: </span>
                {viewPlan.teacher}
              </div>
              <div>
                <span className="font-semibold">{t("common.room")}: </span>
                {viewPlan.room}
              </div>
              <div>
                <span className="font-semibold">{t("common.day")}: </span>
                {viewPlan.day}
              </div>
              <div>
                <span className="font-semibold">{t("common.period")}: </span>
                {viewPlan.period} ({viewPlan.startTime} - {viewPlan.endTime})
              </div>
              <div>
                <span className="font-semibold">{t("timetable.lock.status")}: </span>
                <Badge variant={viewPlan.locked ? "default" : "outline"}>
                  {viewPlan.locked ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                  {viewPlan.locked ? t("timetable.lock.locked") : t("timetable.lock.unlocked")}
                </Badge>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewPlan(null)}>
                {t("common.close")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {singleConfirmAction && (
        <Dialog open={singleConfirmDialogOpen} onOpenChange={setSingleConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {singleConfirmAction.action === "lock" ? (
                  <Lock className="h-5 w-5 mr-2 inline" />
                ) : (
                  <Unlock className="h-5 w-5 mr-2 inline" />
                )}
                {singleConfirmAction.action === "lock" 
                  ? t("timetable.lock.confirmLock") 
                  : t("timetable.lock.confirmUnlock")}
              </DialogTitle>
              <DialogDescription>
                {singleConfirmAction.action === "lock" 
                  ? t("timetable.lock.confirmLockDescription") 
                  : t("timetable.lock.confirmUnlockDescription")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setSingleConfirmDialogOpen(false);
                setSingleConfirmAction(null);
              }}>
                {t("common.cancel")}
              </Button>
              <Button 
                onClick={handleSingleLockAction}
                disabled={isLoading}
                variant={singleConfirmAction.action === "lock" ? "default" : "secondary"}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    {t("common.processing")}
                  </div>
                ) : (
                  <>
                    {singleConfirmAction.action === "lock" ? (
                      <Lock className="h-4 w-4 mr-2" />
                    ) : (
                      <Unlock className="h-4 w-4 mr-2" />
                    )}
                    {singleConfirmAction.action === "lock" 
                      ? t("timetable.lock.lockItem") 
                      : t("timetable.lock.unlockItem")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PageTimetableLock; 