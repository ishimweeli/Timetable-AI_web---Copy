import { Period } from "@/type/Period/Period";
import { Binding } from "@/services/binding/bindingService";
import { ScheduleConflict } from "@/services/timetable/ManualSchedulingService";
import { ClassInfo, BindingSummary, LocalEntry } from "@/type/Scheduling/SchedulingTypes";

// Dummy periods data
export const dummyPeriods: Period[] = [
  {
    id: 1,
    uuid: "period-1",
    name: "Period 1",
    startTime: "08:00",
    endTime: "09:00",
    orderIndex: 1
  },
  {
    id: 2,
    uuid: "period-2",
    name: "Period 2",
    startTime: "09:10",
    endTime: "10:10",
    orderIndex: 2
  },
  {
    id: 3,
    uuid: "period-3",
    name: "Period 3",
    startTime: "10:20",
    endTime: "11:20",
    orderIndex: 3
  },
  {
    id: 4,
    uuid: "period-4",
    name: "Period 4",
    startTime: "11:30",
    endTime: "12:30",
    orderIndex: 4
  },
  {
    id: 5,
    uuid: "period-5",
    name: "Period 5",
    startTime: "13:30",
    endTime: "14:30",
    orderIndex: 5
  }
];

// Dummy teachers data
const teachers = [
  { id: 1, uuid: "teacher-1", name: "Mr. Smith" },
  { id: 2, uuid: "teacher-2", name: "Mrs. Johnson" },
  { id: 3, uuid: "teacher-3", name: "Dr. Williams" }
];

// Dummy subjects data
const subjects = [
  { id: 1, uuid: "subject-1", name: "Mathematics" },
  { id: 2, uuid: "subject-2", name: "English" },
  { id: 3, uuid: "subject-3", name: "Science" },
  { id: 4, uuid: "subject-4", name: "History" },
  { id: 5, uuid: "subject-5", name: "Physical Education" }
];

// Dummy classes data
const classes = [
  { id: 1, uuid: "class-1", name: "Class 10A" },
  { id: 2, uuid: "class-2", name: "Class 10B" },
  { id: 3, uuid: "class-3", name: "Class 10C" }
];

// Dummy rooms data
const rooms = [
  { id: 1, uuid: "room-1", name: "Room 101" },
  { id: 2, uuid: "room-2", name: "Room 102" },
  { id: 3, uuid: "room-3", name: "Room 103" },
  { id: 4, uuid: "room-4", name: "Room 104" },
  { id: 5, uuid: "room-5", name: "Room 105" }
];

// Generate dummy bindings
export const dummyBindings: Binding[] = [];

// Create 5 bindings for each class (5 subjects)
classes.forEach(cls => {
  subjects.forEach((subject, index) => {
    // Assign teachers in a round-robin fashion
    const teacher = teachers[index % teachers.length];
    // Assign rooms in a round-robin fashion
    const room = rooms[index % rooms.length];
    
    dummyBindings.push({
      id: dummyBindings.length + 1,
      uuid: `binding-${dummyBindings.length + 1}`,
      teacherId: teacher.id,
      teacherUuid: teacher.uuid,
      teacherName: teacher.name,
      classId: cls.id,
      classUuid: cls.uuid,
      className: cls.name,
      subjectId: subject.id,
      subjectUuid: subject.uuid,
      subjectName: subject.name,
      roomId: room.id,
      roomUuid: room.uuid,
      roomName: room.name,
      organizationId: 1,
      isDeleted: false,
      periodsPerWeek: 5, // Each subject has 5 periods per week
      scheduledPeriods: 0,
      remainingPeriods: 5,
      isFixed: false
    });
  });
});

// Dummy class info for the UI
export const dummyClasses: ClassInfo[] = classes.map(cls => ({
  id: cls.uuid,
  name: cls.name
}));

// Empty entries and conflicts for initial state
export const dummyEntries: LocalEntry[] = [];
export const dummyConflicts: ScheduleConflict[] = [];

// Empty binding summaries for initial state
export const dummyBindingSummaries: BindingSummary[] = dummyBindings.map(binding => ({
  bindingId: binding.uuid,
  scheduledPeriods: 0,
  totalPeriods: binding.periodsPerWeek || 5,
  remainingPeriods: binding.periodsPerWeek || 5,
  isOverscheduled: false
}));
