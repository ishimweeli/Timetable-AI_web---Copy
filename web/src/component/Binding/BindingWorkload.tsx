import React, { useState, useEffect, useMemo } from "react";
import { useI18n } from "@/hook/useI18n";
import {
  useGetAllBindingsQuery,
  useGetTeacherWorkloadQuery,
  useGetClassWorkloadQuery,
  useGetSubjectWorkloadQuery,
  useGetRoomWorkloadQuery,
  useGetClassBandWorkloadQuery,
} from "@/store/Workload/ApiWorkload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/component/Ui/tabs";
import { 
  User, 
  School, 
  Book, 
  Home, 
  Search,
  BookOpen,
  Users,
  Building,
  Clock,
  Calendar,
  ArrowLeft,
  PieChart,
  BarChart4,
  CheckCircle,
  XCircle,
  List,
  Grid,
  LucideUserSquare2
} from "lucide-react";
import { Badge } from "@/component/Ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/component/Ui/card";
import { Input } from "@/component/Ui/input";
import { Checkbox } from "@/component/Ui/checkbox";
import { Button } from "@/component/Ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/component/Ui/tooltip";

// =============================
// Types and helper functions
// =============================

/**
 * Represents a workload assignment item with all its properties
 */
interface WorkloadItem {
  uuid: string;
  teacherUuid?: string;
  teacherFullName?: string;
  subjectUuid?: string;
  subjectName?: string;
  subjectInitials?: string;
  classUuid?: string;
  className?: string;
  classSection?: string;
  roomUuid?: string;
  roomName?: string;
  roomCode?: string;
  periodsPerWeek?: number;
  isFixed?: boolean;
  priority?: number;
  notes?: string;
  statusId?: number;
  createdDate?: string;
  modifiedDate?: string;
  ruleUuids?: string[];
  classBandUuid?: string;
  classBandName?: string;
  planSettingsId?: number | string;
  workload?: number; // For API response compatibility
  name?: string; // For API response compatibility
}

/**
 * Groups assignments by a specific property (like teacher, class, etc.)
 */
const groupAssignmentsByProperty = (data = [], property) => {
  const groupedMap = new Map();
  
  data.forEach(item => {
    const key = item[property];
    if(!groupedMap.has(key)) {
      groupedMap.set(key, {
        id: key,
        name: property === 'teacherUuid' ? item.teacherFullName :
              property === 'classUuid' ? `${item.className} ${item.classSection || ''}` :
              property === 'classBandUuid' ? `${item.classBandName} (Band)` :
              property === 'subjectUuid' ? `${item.subjectName} ${item.subjectInitials ? `(${item.subjectInitials})` : ''}` :
              `${item.roomName} ${item.roomCode ? `(${item.roomCode})` : ''}`,
        assignments: []
      });
    }
    groupedMap.get(key).assignments.push(item);
  });
  
  return Array.from(groupedMap.values());
};

/**
 * Calculates the sum of periods per week for a list of workload items
 */
const calculateTotalPeriods = (items = []) => {
  return items.reduce((sum, item) => sum + (item.periodsPerWeek || 0), 0);
};

/**
 * Color map for different entity types
 */
const colorMap = {
  teacher: {
    bg: "bg-indigo-600",
    bgLight: "bg-indigo-50",
    border: "border-indigo-300",
    hover: "hover:border-indigo-200",
    text: "text-indigo-700",
    icon: (props) => <Users {...props} />
  },
  class: {
    bg: "bg-green-600",
    bgLight: "bg-green-50",
    border: "border-green-300",
    hover: "hover:border-green-200",
    text: "text-green-700",
    icon: (props) => <School {...props} />
  },
  classBand: {
    bg: "bg-cyan-600",
    bgLight: "bg-cyan-50",
    border: "border-cyan-300",
    hover: "hover:border-cyan-200",
    text: "text-cyan-700",
    icon: (props) => <LucideUserSquare2 {...props} />
  },
  subject: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    border: "border-amber-300",
    hover: "hover:border-amber-200",
    text: "text-amber-700",
    icon: (props) => <BookOpen {...props} />
  },
  room: {
    bg: "bg-orange-500",
    bgLight: "bg-orange-50",
    border: "border-orange-300",
    hover: "hover:border-orange-200",
    text: "text-orange-700",
    icon: (props) => <Building {...props} />
  }
};

// =============================
// Subcomponents
// =============================

/**
 * Card displaying an individual assignment with its details
 */
const AssignmentCard = ({ item, propertyToSkip }) => {
  const { t } = useI18n();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-3 bg-gray-50 border-b">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">
            {t("resource.allocation")}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant={item.isFixed ? "default" : "outline"} className="ml-2">
                  {item.isFixed ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {t(item.isFixed ? "binding.form.isFixed" : "common.flexible")}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t(item.isFixed ? "binding.description.isFixed" : "This assignment can be scheduled flexibly")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {propertyToSkip !== 'teacher' && (
            <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">
              <Users className="mr-1 h-3 w-3" />
              {item.teacherFullName}
            </Badge>
          )}
          
          {propertyToSkip !== 'class' && (
            <Badge className="bg-green-600 text-white hover:bg-green-700">
              <School className="mr-1 h-3 w-3" />
              {item.className} {item.classSection ? `(${item.classSection})` : ""}
            </Badge>
          )}
          
          {propertyToSkip !== 'classBand' && item.classBandName && (
            <Badge className="bg-cyan-600 text-white hover:bg-cyan-700">
              <LucideUserSquare2 className="mr-1 h-3 w-3" />
              {item.classBandName}
            </Badge>
          )}
          
          {propertyToSkip !== 'subject' && (
            <Badge className="bg-amber-500 text-white hover:bg-amber-600">
              <BookOpen className="mr-1 h-3 w-3" />
              {item.subjectName} {item.subjectInitials ? `(${item.subjectInitials})` : ""}
            </Badge>
          )}
          
          {propertyToSkip !== 'room' && (
            <Badge className="bg-orange-500 text-white hover:bg-orange-600">
              <Building className="mr-1 h-3 w-3" />
              {item.roomName} {item.roomCode ? `(${item.roomCode})` : ""}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-gray-700">
              {t("binding.form.periodsPerWeek")}: <span className="font-semibold">{item.periodsPerWeek}</span>
            </span>
          </div>
          
          <div className="flex items-center">
            <PieChart className="h-3 w-3 mr-1 text-gray-500" />
            <span className="text-gray-700">
              {t("binding.form.priority")}: <span className="font-semibold">{item.priority}</span>
            </span>
          </div>
        </div>
        
        {item.notes && (
          <div className="mt-2 text-xs text-gray-500 border-t pt-2">
            <p className="font-medium mb-1">{t("binding.form.notes")}:</p>
            <p>{item.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/**
 * Card displaying an entity (teacher, class, subject, room) with summary data
 */
const EntityCard = ({ title, items, type, selected, onClick }) => {
  const { t } = useI18n();
  
  const colors = {
    bg: colorMap[type].bg,
    border: selected ? colorMap[type].border : "border-gray-200",
    hover: colorMap[type].hover,
    bgLight: selected ? colorMap[type].bgLight : ""
  };
  
  const Icon = colorMap[type].icon;
  const totalPeriods = calculateTotalPeriods(items);
  const totalFixedAssignments = items.filter(item => item.isFixed).length;
  
  // Count unique related entities
  const uniqueRelatedEntities = {
    teachers: new Set(items.map(item => item.teacherUuid)).size,
    classes: new Set(items.map(item => item.classUuid)).size,
    subjects: new Set(items.map(item => item.subjectUuid)).size,
    rooms: new Set(items.map(item => item.roomUuid)).size
  };
  
  const relatedEntityLabel = type === 'teacher' ? t("common.subjects") : 
                            type === 'class' ? t("common.teachers") : 
                            type === 'subject' ? t("common.classes") : 
                            t("common.classes");
                            
  const relatedEntityCount = type === 'teacher' ? uniqueRelatedEntities.subjects : 
                            type === 'class' ? uniqueRelatedEntities.teachers : 
                            type === 'subject' ? uniqueRelatedEntities.classes : 
                            uniqueRelatedEntities.classes;
  
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${colors.border} ${colors.hover} ${colors.bgLight} hover:shadow-md`}
      onClick={onClick}
    >
      <CardHeader className={`p-3 ${colors.bg} text-white`}>
        <div className="flex items-center">
          <Icon className="h-4 w-4 mr-2" />
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
      </CardHeader>
      
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">{t("resource.allocation")}</span>
            <span className="font-medium text-base">{items.length}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">{t("binding.form.periodsPerWeek")}</span>
            <span className="font-medium text-base">{totalPeriods}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">{t("binding.form.isFixed")}</span>
            <span className="font-medium">
              {totalFixedAssignments} / {items.length}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500 text-xs">{relatedEntityLabel}</span>
            <span className="font-medium">{relatedEntityCount}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-2 pt-0 border-t mt-2 text-xs text-gray-500 bg-gray-50">
        <div className="flex items-center w-full justify-center">
          <BarChart4 className="h-3 w-3 mr-1" />
          {t("binding.details")}
        </div>
      </CardFooter>
    </Card>
  );
};

/**
 * List item displaying an entity with summary data (used for list view)
 */
const EntityListItem = ({ entity, type, selected, onClick }) => {
  const { t } = useI18n();
  
  const colors = {
    bg: colorMap[type].bgLight,
    text: colorMap[type].text,
    border: selected ? colorMap[type].border : "border-gray-200",
    hover: `hover:${colorMap[type].bgLight}`
  };
  
  const Icon = colorMap[type].icon;
  const totalPeriods = calculateTotalPeriods(entity.assignments);
  const totalFixedAssignments = entity.assignments.filter(item => item.isFixed).length;
  
  return (
    <div 
      className={`border rounded-md p-3 mb-2 cursor-pointer ${colors.border} ${colors.hover} ${selected ? colors.bg : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Icon className={`h-4 w-4 mr-2 ${selected ? colors.text : ''}`} />
          <span className={`font-medium ${selected ? colors.text : ''}`}>{entity.name}</span>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div>
            <span className="text-gray-500 mr-1">{t("resource.allocation")}:</span>
            <span className="font-medium">{entity.assignments.length}</span>
          </div>
          <div>
            <span className="text-gray-500 mr-1">{t("binding.form.periodsPerWeek")}:</span>
            <span className="font-medium">{totalPeriods}</span>
          </div>
          <div>
            <span className="text-gray-500 mr-1">{t("binding.form.isFixed")}:</span>
            <span className="font-medium">{totalFixedAssignments} / {entity.assignments.length}</span>
          </div>
          <Button size="sm" variant="outline" className="text-xs py-1 h-7">
            {t("binding.details")}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * Detail view for a specific entity showing its assignments
 */
const DetailView = ({ title, assignments, type, onBack, viewType = "grid" }) => {
  const { t } = useI18n();
  
  const Icon = colorMap[type].icon;
  const headerBgColor = colorMap[type].bg;
  
  const totalPeriods = calculateTotalPeriods(assignments);
  const totalFixedAssignments = assignments.filter(item => item.isFixed).length;
  
  // Group assignments based on entity type
  const groupProperty = type === 'teacher' ? 'subjectUuid' :
                       type === 'class' || type === 'classband' ? 'subjectUuid' :
                       'classUuid';
  
  const groupedAssignments = groupAssignmentsByProperty(assignments, groupProperty);
  
  // Determine icon for grouped assignments
  const getGroupIcon = () => {
    if(type === 'teacher' || type === 'class') {
      return <BookOpen className="h-4 w-4 mr-2 text-amber-500" />;
    }else {
      return <School className="h-4 w-4 mr-2 text-green-600" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className={`${headerBgColor} text-white p-4 rounded-lg flex items-center justify-between`}>
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div>
          <Button 
            onClick={onBack}
            variant="outline"
            size="sm"
            className="bg-white/20 hover:bg-white/30 border-white/40"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("common.back")}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <div className="font-medium text-gray-500 text-xs">{t("resource.allocation")}</div>
            <div className="text-2xl font-bold">{assignments.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <div className="font-medium text-gray-500 text-xs">{t("binding.form.periodsPerWeek")}</div>
            <div className="text-2xl font-bold">{totalPeriods}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <div className="font-medium text-gray-500 text-xs">{t("binding.form.isFixed")}</div>
            <div className="text-2xl font-bold">{totalFixedAssignments}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-50">
          <CardContent className="p-3">
            <div className="font-medium text-gray-500 text-xs">{t("Groups")}</div>
            <div className="text-2xl font-bold">{groupedAssignments.length}</div>
          </CardContent>
        </Card>
      </div>
      
      {groupedAssignments.map(group => (
        <div key={group.id} className="mt-6">
          <h3 className="font-bold text-lg mb-3 flex items-center">
            {getGroupIcon()}
            {group.name}
            <Badge className="ml-2">
              {group.assignments.length} {group.assignments.length === 1 ? t("assignment") : t("assignments")}
            </Badge>
            <Badge variant="outline" className="ml-2">
              {calculateTotalPeriods(group.assignments)} {t("binding.form.periodsPerWeek")}
            </Badge>
          </h3>
          
          <div className={viewType === "grid" ? "grid gap-4 grid-cols-1 md:grid-cols-2" : "space-y-3"}>
            {group.assignments.map((assignment) => (
              viewType === "grid" ? (
                <AssignmentCard 
                  key={assignment.uuid} 
                  item={assignment} 
                  propertyToSkip={type}
                />
              ) : (
                <div key={assignment.uuid} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">{t("resource.allocation")}</div>
                    <Badge variant={assignment.isFixed ? "default" : "outline"}>
                      {assignment.isFixed ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {t(assignment.isFixed ? "binding.form.isFixed" : "common.flexible")}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {type !== 'teacher' && (
                      <Badge className="bg-indigo-600 text-white hover:bg-indigo-700">
                        <Users className="mr-1 h-3 w-3" />
                        {assignment.teacherFullName}
                      </Badge>
                    )}
                    
                    {type !== 'class' && (
                      <Badge className="bg-green-600 text-white hover:bg-green-700">
                        <School className="mr-1 h-3 w-3" />
                        {assignment.className} {assignment.classSection ? `(${assignment.classSection})` : ""}
                      </Badge>
                    )}
                    
                    {type !== 'subject' && (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-600">
                        <BookOpen className="mr-1 h-3 w-3" />
                        {assignment.subjectName} {assignment.subjectInitials ? `(${assignment.subjectInitials})` : ""}
                      </Badge>
                    )}
                    
                    {type !== 'room' && (
                      <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                        <Building className="mr-1 h-3 w-3" />
                        {assignment.roomName} {assignment.roomCode ? `(${assignment.roomCode})` : ""}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-gray-700">
                        {t("binding.form.periodsPerWeek")}: <span className="font-semibold">{assignment.periodsPerWeek}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <PieChart className="h-3 w-3 mr-1 text-gray-500" />
                      <span className="text-gray-700">
                        {t("binding.form.priority")}: <span className="font-semibold">{assignment.priority}</span>
                      </span>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Content display for entities in each tab
 */
const EntityTabContent = ({ 
  entityType, 
  title, 
  description, 
  entities = [], 
  showAll, 
  setShowAll, 
  selectedUuid, 
  setSelectedUuid, 
  selectedData, 
  viewType 
}) => {
  const { t } = useI18n();

  const resetSelection = () => {
    setSelectedUuid(null);
    setShowAll(true);
  };

  const handleEntitySelect = (uuid) => {
    setSelectedUuid(uuid);
    setShowAll(false);
  };

  // Render appropriate content based on selection state
  if(entities.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 border rounded-md bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">{t(`No ${entityType} workload data`)}</p>
          <p className="text-sm text-gray-400 mt-1">
            {t("binding.message.noData")}
          </p>
        </div>
      </div>
    );
  }

  if(!showAll && selectedUuid) {
    return (
      <DetailView
        title={entities.find(g => g.id === selectedUuid)?.name || ""}
        assignments={selectedData}
        type={entityType}
        onBack={resetSelection}
        viewType={viewType}
      />
    );
  }

  // Show grid or list view of entities
  return viewType === "grid" ? (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {entities.map((entity) => (
        <EntityCard
          key={entity.id}
          title={entity.name}
          items={entity.assignments}
          type={entityType}
          selected={entity.id === selectedUuid}
          onClick={() => handleEntitySelect(entity.id)}
        />
      ))}
    </div>
  ) : (
    <div className="space-y-2">
      {entities.map((entity) => (
        <EntityListItem
          key={entity.id}
          entity={entity}
          type={entityType}
          selected={entity.id === selectedUuid}
          onClick={() => handleEntitySelect(entity.id)}
        />
      ))}
    </div>
  );
};

// =============================
// Main Component
// =============================

/**
 * Main BindingWorkload component
 */
const BindingWorkload = ({ selectedOrganizationId, viewType: initialViewType = "grid", planSettingsId = null }) => {
  const { t } = useI18n();

  // UI state
  const [activeTab, setActiveTab] = useState("teachers");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [viewType, setViewType] = useState(initialViewType);
  
  // Selection state for each entity type
  const [selectedTeacherUuid, setSelectedTeacherUuid] = useState(null);
  const [selectedClassUuid, setSelectedClassUuid] = useState(null);
  const [selectedClassBandUuid, setSelectedClassBandUuid] = useState(null);
  const [selectedSubjectUuid, setSelectedSubjectUuid] = useState(null);
  const [selectedRoomUuid, setSelectedRoomUuid] = useState(null);

  // Toggle for "show all" entities
  const [showAllTeachers, setShowAllTeachers] = useState(true);
  const [showAllClasses, setShowAllClasses] = useState(true);
  const [showAllClassBands, setShowAllClassBands] = useState(true);
  const [showAllSubjects, setShowAllSubjects] = useState(true);
  const [showAllRooms, setShowAllRooms] = useState(true);

  // Reset selected entities when tab changes
  useEffect(() => {
    // Reset selections based on active tab
    if(activeTab === "teachers") {
      setSelectedClassUuid(null);
      setSelectedClassBandUuid(null);
      setSelectedSubjectUuid(null);
      setSelectedRoomUuid(null);
      setShowAllClasses(true);
      setShowAllClassBands(true);
      setShowAllSubjects(true);
      setShowAllRooms(true);
    } else if(activeTab === "classes") {
      setSelectedTeacherUuid(null);
      setSelectedClassBandUuid(null);
      setSelectedSubjectUuid(null);
      setSelectedRoomUuid(null);
      setShowAllTeachers(true);
      setShowAllClassBands(true);
      setShowAllSubjects(true);
      setShowAllRooms(true);
    } else if(activeTab === "classBands") {
      setSelectedTeacherUuid(null);
      setSelectedClassUuid(null);
      setSelectedSubjectUuid(null);
      setSelectedRoomUuid(null);
      setShowAllTeachers(true);
      setShowAllClasses(true);
      setShowAllSubjects(true);
      setShowAllRooms(true);
    } else if(activeTab === "subjects") {
      setSelectedTeacherUuid(null);
      setSelectedClassUuid(null);
      setSelectedClassBandUuid(null);
      setSelectedRoomUuid(null);
      setShowAllTeachers(true);
      setShowAllClasses(true);
      setShowAllClassBands(true);
      setShowAllRooms(true);
    } else if(activeTab === "rooms") {
      setSelectedTeacherUuid(null);
      setSelectedClassUuid(null);
      setSelectedClassBandUuid(null);
      setSelectedSubjectUuid(null);
      setShowAllTeachers(true);
      setShowAllClasses(true);
      setShowAllClassBands(true);
      setShowAllSubjects(true);
    }
  }, [activeTab]);

  // API queries
  const {
    data: allBindings,
    isLoading: isLoadingBindings,
    refetch: refetchBindings
  } = useGetAllBindingsQuery({
    orgId: selectedOrganizationId ? Number(selectedOrganizationId) : null,
    page: 0,
    size: 1000,
    sortBy: activeTab === "teachers" ? "teacher_name" : 
            activeTab === "classes" ? "class_name" : 
            activeTab === "subjects" ? "subject_name" : 
            "room_name",
    sortDirection: 'asc',
    keyword: searchKeyword,
    planSettingsId: planSettingsId ? Number(planSettingsId) : undefined
  }, {
    skip: !selectedOrganizationId
  });

  // Specific workload queries for detailed views
  const {
    data: teacherWorkload,
    isLoading: isLoadingTeacherWorkload,
    refetch: refetchTeacherWorkload
  } = useGetTeacherWorkloadQuery(
    { 
      teacherUuid: selectedTeacherUuid ? String(selectedTeacherUuid) : "",
      planSettingsId: planSettingsId ? Number(planSettingsId) : undefined
    },
    { skip: !selectedTeacherUuid || showAllTeachers }
  );

  const {
    data: classWorkload,
    isLoading: isLoadingClassWorkload,
    refetch: refetchClassWorkload
  } = useGetClassWorkloadQuery(
    { 
      classUuid: selectedClassUuid ? String(selectedClassUuid) : "",
      planSettingsId: planSettingsId ? Number(planSettingsId) : undefined
    },
    { skip: !selectedClassUuid || showAllClasses }
  );

  const {
    data: subjectWorkload,
    isLoading: isLoadingSubjectWorkload,
    refetch: refetchSubjectWorkload
  } = useGetSubjectWorkloadQuery(
    { 
      subjectUuid: selectedSubjectUuid ? String(selectedSubjectUuid) : "",
      planSettingsId: planSettingsId ? Number(planSettingsId) : undefined
    },
    { skip: !selectedSubjectUuid || showAllSubjects }
  );

  const {
    data: roomWorkload,
    isLoading: isLoadingRoomWorkload,
    refetch: refetchRoomWorkload
  } = useGetRoomWorkloadQuery(
    { 
      roomUuid: selectedRoomUuid ? String(selectedRoomUuid) : "",
      planSettingsId: planSettingsId ? Number(planSettingsId) : undefined
    },
    { skip: !selectedRoomUuid || showAllRooms }
  );

  const {
    data: classBandWorkload,
    isLoading: isLoadingClassBandWorkload,
    refetch: refetchClassBandWorkload
  } = useGetClassBandWorkloadQuery(
    { 
      classBandUuid: selectedClassBandUuid ? String(selectedClassBandUuid) : "",
      planSettingsId: planSettingsId ? Number(planSettingsId) : undefined
    },
    { skip: !selectedClassBandUuid || showAllClassBands }
  );

  // Refetch data when organization changes
  useEffect(() => {
    if(selectedOrganizationId) {
      refetchBindings();
      if(selectedTeacherUuid) refetchTeacherWorkload();
      if(selectedClassUuid) refetchClassWorkload();
      if(selectedSubjectUuid) refetchSubjectWorkload();
      if(selectedRoomUuid) refetchRoomWorkload();
      if(selectedClassBandUuid) refetchClassBandWorkload();
    }
  }, [selectedOrganizationId, planSettingsId, refetchBindings, refetchTeacherWorkload, refetchClassWorkload, refetchSubjectWorkload, refetchRoomWorkload, refetchClassBandWorkload, selectedTeacherUuid, selectedClassUuid, selectedSubjectUuid, selectedRoomUuid, selectedClassBandUuid]);

  // Process data to group by entity
  const { 
    teacherGroups, 
    classGroups, 
    classBandGroups,
    subjectGroups, 
    roomGroups,
    selectedTeacherData,
    selectedClassData,
    selectedClassBandData,
    selectedSubjectData,
    selectedRoomData
  } = useMemo(() => {
    // Helper function to sanitize data to prevent circular references
    const sanitizeData = (items = []) => {
      if (!items || !Array.isArray(items)) return [];
      
      return items.map(item => {
        // Create a new plain object with only the properties we need
        const { teacherUuid, teacherFullName, subjectUuid, subjectName, subjectInitials,
                classUuid, className, classSection, roomUuid, roomName, roomCode,
                periodsPerWeek, isFixed, priority, uuid, statusId, classBandUuid, 
                classBandName, planSettingsId } = item;
                
        return { 
          teacherUuid, teacherFullName, subjectUuid, subjectName, subjectInitials,
          classUuid, className, classSection, roomUuid, roomName, roomCode,
          periodsPerWeek, isFixed, priority, uuid, statusId, classBandUuid, 
          classBandName, planSettingsId 
        };
      });
    };
    
    let data = allBindings?.data ? sanitizeData(allBindings.data) : [];
    
    // Apply search filter if needed
    if(searchKeyword) {
      data = data.filter(item => 
        (item.teacherFullName && item.teacherFullName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.className && item.className.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.classSection && item.classSection.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.classBandName && item.classBandName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.subjectName && item.subjectName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.subjectInitials && item.subjectInitials.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.roomName && item.roomName.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (item.roomCode && item.roomCode.toLowerCase().includes(searchKeyword.toLowerCase()))
      );
    }
    
    // Function to extract groups
    const extractGroups = (data) => {
      // For class groups, only include items that have a classUuid and do NOT have a classBandUuid
      const classItems = data.filter(item => item.classUuid && !item.classBandUuid);
      // For class band groups, only include items that have a classBandUuid
      const classBandItems = data.filter(item => item.classBandUuid);
      
      return {
        teacherGroups: groupAssignmentsByProperty(data, 'teacherUuid'),
        classGroups: groupAssignmentsByProperty(classItems, 'classUuid'),
        classBandGroups: groupAssignmentsByProperty(classBandItems, 'classBandUuid'),
        subjectGroups: groupAssignmentsByProperty(data, 'subjectUuid'),
        roomGroups: groupAssignmentsByProperty(data, 'roomUuid')
      };
    };
    
    // Get groups for all data
    const groups = extractGroups(data);
    
    // Get data for selected entities
    const selectedTeacherData = groups.teacherGroups.find(g => g.id === selectedTeacherUuid)?.assignments || [];
    const selectedClassData = groups.classGroups.find(g => g.id === selectedClassUuid)?.assignments || [];
    const selectedClassBandData = groups.classBandGroups.find(g => g.id === selectedClassBandUuid)?.assignments || [];
    const selectedSubjectData = groups.subjectGroups.find(g => g.id === selectedSubjectUuid)?.assignments || [];
    const selectedRoomData = groups.roomGroups.find(g => g.id === selectedRoomUuid)?.assignments || [];
    
    // Use specific workload data if available
    const finalTeacherData = !showAllTeachers && teacherWorkload?.data 
      ? sanitizeData(teacherWorkload.data) 
      : selectedTeacherData;
      
    const finalClassData = !showAllClasses && classWorkload?.data 
      ? sanitizeData(classWorkload.data) 
      : selectedClassData;
      
    const finalClassBandData = !showAllClassBands && classBandWorkload?.data 
      ? sanitizeData(classBandWorkload.data) 
      : selectedClassBandData;
      
    const finalSubjectData = !showAllSubjects && subjectWorkload?.data 
      ? sanitizeData(subjectWorkload.data) 
      : selectedSubjectData;
      
    const finalRoomData = !showAllRooms && roomWorkload?.data 
      ? sanitizeData(roomWorkload.data) 
      : selectedRoomData;
    
    return {
      ...groups,
      selectedTeacherData: finalTeacherData,
      selectedClassData: finalClassData,
      selectedClassBandData: finalClassBandData,
      selectedSubjectData: finalSubjectData,
      selectedRoomData: finalRoomData
    };
  }, [
    allBindings, 
    selectedTeacherUuid, 
    selectedClassUuid,
    selectedClassBandUuid,
    selectedSubjectUuid, 
    selectedRoomUuid,
    showAllTeachers,
    showAllClasses,
    showAllClassBands,
    showAllSubjects,
    showAllRooms,
    teacherWorkload,
    classWorkload,
    classBandWorkload,
    subjectWorkload,
    roomWorkload,
    searchKeyword,
    planSettingsId
  ]);

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleTeacherSelect = (uuid) => {
    setSelectedTeacherUuid(uuid);
    setShowAllTeachers(false);
  };

  const handleClassSelect = (uuid) => {
    setSelectedClassUuid(uuid);
    setShowAllClasses(false);
  };

  const handleSubjectSelect = (uuid) => {
    setSelectedSubjectUuid(uuid);
    setShowAllSubjects(false);
  };

  const handleRoomSelect = (uuid) => {
    setSelectedRoomUuid(uuid);
    setShowAllRooms(false);
  };

  const handleClassBandSelect = (uuid) => {
    setSelectedClassBandUuid(uuid);
    setShowAllClassBands(false);
  };

  const resetTeacherSelection = () => {
    setSelectedTeacherUuid(null);
    setShowAllTeachers(true);
  };

  const resetClassSelection = () => {
    setSelectedClassUuid(null);
    setShowAllClasses(true);
  };

  const resetSubjectSelection = () => {
    setSelectedSubjectUuid(null);
    setShowAllSubjects(true);
  };

  const resetRoomSelection = () => {
    setSelectedRoomUuid(null);
    setShowAllRooms(true);
  };

  const resetClassBandSelection = () => {
    setSelectedClassBandUuid(null);
    setShowAllClassBands(true);
  };

  // If no organization selected, show message
  if(!selectedOrganizationId) {
    return (
      <Card className="border rounded-md">
        <CardContent className="flex flex-col justify-center items-center h-64 p-6">
          <Building className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg text-center text-gray-500 font-medium">
            {t("organization.empty.selectPrompt")}
          </p>
          <p className="text-sm text-center text-gray-400 mt-1 max-w-md">
            {t("To view workload data, please select an organization from the dropdown menu above")}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  const isLoading = 
    isLoadingBindings || 
    isLoadingTeacherWorkload || 
    isLoadingClassWorkload || 
    isLoadingSubjectWorkload || 
    isLoadingRoomWorkload ||
    isLoadingClassBandWorkload;

  if(isLoading && !allBindings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="mt-2 text-sm text-gray-500">
            {t("binding.message.loading")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("resource.allocation")}</h2>
        
        {/* View toggle button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setViewType(viewType === "grid" ? "list" : "grid")}
          className="flex items-center"
        >
          {viewType === "grid" ? (
            <>
              <List className="h-4 w-4 mr-2" />
              {t("List View")}
            </>
          ) : (
            <>
              <Grid className="h-4 w-4 mr-2" />
              {t("Grid View")}
            </>
          )}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="mb-4 grid grid-cols-5 gap-2">
            <TabsTrigger value="teachers" className="flex items-center justify-center">
              <Users className="h-4 w-4 mr-2" />
              {t("resource.teachers")}
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center justify-center">
              <School className="h-4 w-4 mr-2" />
              {t("resource.classes")}
            </TabsTrigger>
            <TabsTrigger value="classBands" className="flex items-center justify-center">
              <LucideUserSquare2 className="h-4 w-4 mr-2" />
              {t("resource.classBands")}
            </TabsTrigger>
            <TabsTrigger value="subjects" className="flex items-center justify-center">
              <BookOpen className="h-4 w-4 mr-2" />
              {t("resource.subjects")}
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center justify-center">
              <Building className="h-4 w-4 mr-2" />
              {t("resource.rooms")}
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewType === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={t("common.search")}
            value={searchKeyword}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        
        <TabsContent value="teachers">
          <EntityTabContent 
            entityType="teacher"
            title={t("resource.teachers")}
            description={t("resource.teachersDescription")}
            entities={teacherGroups}
            showAll={showAllTeachers}
            setShowAll={setShowAllTeachers}
            selectedUuid={selectedTeacherUuid}
            setSelectedUuid={handleTeacherSelect}
            selectedData={selectedTeacherData}
            viewType={viewType}
          />
        </TabsContent>
        
        <TabsContent value="classes">
          <EntityTabContent 
            entityType="class"
            title={t("resource.classes")}
            description={t("resource.classesDescription")}
            entities={classGroups}
            showAll={showAllClasses}
            setShowAll={setShowAllClasses}
            selectedUuid={selectedClassUuid}
            setSelectedUuid={handleClassSelect}
            selectedData={selectedClassData}
            viewType={viewType}
          />
        </TabsContent>
        
        <TabsContent value="classBands">
          <EntityTabContent 
            entityType="classBand"
            title={t("resource.classBands")}
            description={t("resource.classBandsDescription")}
            entities={classBandGroups}
            showAll={showAllClassBands}
            setShowAll={setShowAllClassBands}
            selectedUuid={selectedClassBandUuid}
            setSelectedUuid={handleClassBandSelect}
            selectedData={selectedClassBandData}
            viewType={viewType}
          />
        </TabsContent>
        
        <TabsContent value="subjects">
          <EntityTabContent 
            entityType="subject"
            title={t("resource.subjects")}
            description={t("resource.subjectsDescription")}
            entities={subjectGroups}
            showAll={showAllSubjects}
            setShowAll={setShowAllSubjects}
            selectedUuid={selectedSubjectUuid}
            setSelectedUuid={handleSubjectSelect}
            selectedData={selectedSubjectData}
            viewType={viewType}
          />
        </TabsContent>
        
        <TabsContent value="rooms">
          <EntityTabContent 
            entityType="room"
            title={t("resource.rooms")}
            description={t("resource.roomsDescription")}
            entities={roomGroups}
            showAll={showAllRooms}
            setShowAll={setShowAllRooms}
            selectedUuid={selectedRoomUuid}
            setSelectedUuid={handleRoomSelect}
            selectedData={selectedRoomData}
            viewType={viewType}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BindingWorkload;
