// Subject reference data
export interface TimetableSubject {
    id: number;
    uuid: string;
    name: string;
    color: string;
    initials: string;
}

// Teacher reference data
export interface TimetableTeacher {
    id: number;
    uuid: string;
    name: string;
    initials: string;
}

// Room reference data
export interface TimetableRoom {
    id: number;
    uuid: string;
    name: string;
    code: string;
}

// Class reference data
export interface TimetableClass {
    id: number;
    uuid: string;
    name: string;
    initial: string;
    section: string;
    individualTimetableId: number | null;
    color: string;
}

// Class group for grouping classes with shared schedules
export interface TypeClassGroup {
    id: string;
    uuid: string;
    name: string;
    description: string;
    classes: string[]; // Class UUIDs
}

// Timetable entry from backend
export interface TimetableEntry {
    id: number;
    uuid: string;
    timetableId: number;
    dayOfWeek: number;
    period: number;
    subjectId: number | null;
    subjectUuid: string | null;
    subjectName: string | null;
    subjectColor: string | null;
    subjectInitials: string | null;
    teacherId: number | null;
    teacherUuid: string | null;
    teacherName: string | null;
    teacherInitials: string | null;
    roomId: number | null;
    roomUuid: string | null;
    roomName: string | null;
    roomInitials: string | null;
    durationMinutes: number;
    periodType: 'Regular' | 'Break' | 'Lunch';
    status: string;
    classGroupId?: string | null; // Reference to class group if this entry is part of a group
}

// Complete timetable data
export interface TypeTimetable {
    id: number;
    uuid: string;
    name: string;
    academicYear: string;
    semester: string;
    generatedBy: string;
    organizationId: number;
    schoolStartTime: string;
    schoolEndTime: string;
    statusId: number;
    description: string;
    isPublished: boolean;
    startDay: number;
    endDay: number;
    createdDate: string;
    modifiedDate: string;
    generatedDate?: string; // Optional field from first file
    entries: TypeTimetableEntry[];
    planSettingUuid?: string;
    classId?: number; // For individual class schedules
    classGroupId?: string; // For group schedules
    periodDurations?: number[];
    timetablePlan?: number[];
    planStartDate?: string;
    planEndDate?: string;
    planSettingName?: string;
    planSettings?: {
        id?: number;
        uuid?: string;
        name?: string;
        description?: string;
        periodsPerDay: number;
        daysPerWeek: number;
        startTime: string;
        endTime: string;
        // ... other plan settings properties ...
    };
}

// Time slot for the grid
export interface TimeSlot {
    id: string;
    period: number;
    start: string;
    end: string;
    durationMinutes: number;
}

// Class information for the grid
export interface ClassInfo {
    periodType: string;
    subject?: {
        id: string;
        uuid: string;
        name: string;
        color: string;
        code: string;
    };
    teacher?: {
        id: string;
        uuid: string;
        name: string;
        initials: string;
    };
    room?: {
        id: string;
        uuid: string;
        name: string;
        code: string;
    };
    class?: {
        id: string | number;
        name: string;
        code?: string;
    };
    classGroup?: {
        id: string;
        name: string;
    };
}

// Day data for the grid
export interface Day {
    id: string;
    name: string;
    classes: Record<string, ClassInfo>;
}

// Schedule data for rendering the grid
export interface TypeScheduleData {
    days: TypeDay[];
    timeSlots: TypeTimeSlot[];
    classGroups?: TypeClassGroup[];
    currentClass?: TimetableClass;
    modifiedDate?: string;
    generatedDate?: string;
    createdDate?: string;
    cachedData?: {
        classes?: TimetableClass[];
        subjects?: TypeSubject[];
        teachers?: TypeTeacher[];
        rooms?: TypeRoom[];
        classGroups?: TypeClassGroup[];
    };
}

export interface TypeTimetableEntry {
    id: number;
    uuid: string;
    timetableId: number;
    dayOfWeek: number;
    period: number;
    subjectId: number | null;
    subjectUuid: string | null;
    subjectName: string | null;
    subjectColor: string | null;
    subjectInitials: string | null;
    teacherId: number | null;
    teacherUuid: string | null;
    teacherName: string | null;
    teacherInitials: string | null;
    roomId: number | null;
    roomUuid: string | null;
    roomName: string | null;
    roomInitials: string | null;
    durationMinutes: number;
    periodType: string;
    status: string;
    className?: string;
    classUuid?: string;
    organizationId?: number | string; // For filtering by org
}

export interface TypeSubject {
    id: string;
    uuid: string;
    name: string;
    color: string;
    code: string;
}

export interface TypeTeacher {
    id: string;
    uuid: string;
    name: string;
    initials: string;
}

export interface TypeRoom {
    id: string;
    uuid: string;
    name: string;
    code: string;
}

export interface TypeDay {
    dayNumber: number;
    name: string;
}

export interface TypeTimeSlot {
    period: number;
    startTime: string;
    endTime: string;
    type: string;
    cells: TypeCell[];
}

export interface TypeCell {
    dayNumber: number;
    period: number;
    subject: string | null;
    subjectInitials: string | null;
    teacher: string | null;
    teacherInitials: string | null;
    room: string | null;
    roomInitials: string | null;
    class?: string | null;
    classInitials?: string | null;
    color: string | null;
    type: string;
    duration: number;
    startTime?: string | null;
    endTime?: string | null;
}