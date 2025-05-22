
# Database Models

## Core Models and Relationships

This document details the key data models and their relationships in the AI Timetable system. Each model includes validation rules, relationships, and sample data structures.

## User Model

```typescript
interface User {
  user_id: number;
  user_email: string;
  user_first_name: string;
  user_last_name: string;
  user_password_hash: string;
  user_phone: string;
  user_is_active: boolean;
  user_is_deleted: boolean;
  user_created_by: number;
  user_modified_by: number;
  user_created_date: Date;
  user_modified_date: Date;
  user_status_id: number;
  user_uuid: string;
  role_id: number;
  organization_id: number;
}
```

### Validation Rules
- Email: Valid email format, unique
- Password: Minimum 8 characters, includes uppercase, lowercase, number, special character
- Phone: Valid international format

### Relationships
- Belongs to one Role
- Belongs to one Organization
- Has one TeacherProfile (optional)
- Has one StudentProfile (optional)
- Has one ManagerProfile (optional)
- Has one AdminProfile (optional)
- Has many Notifications

## Organization Model

```typescript
interface Organization {
  organization_id: number;
  organization_name: string;
  organization_address: string;
  organization_contact_email: string;
  organization_contact_phone: string;
  organization_is_deleted: boolean;
  organization_created_by: string;
  organization_modified_by: string;
  organization_created_date: Date;
  organization_modified_date: Date;
  organization_status_id: number;
  organization_uid: string;
}
```

### Validation Rules
- Name: Required, 3-100 characters
- Contact Email: Valid email format
- Contact Phone: Valid phone format

### Relationships
- Has many Users
- Has many Classes
- Has many Teachers
- Has many Students
- Has many Subjects
- Has many Rooms
- Has many Timetables
- Has one UISettings

## Role Model

```typescript
interface Role {
  role_id: number;
  role_name: string;
  role_description: string;
  role_is_deleted: boolean;
  role_created_by: number;
  role_modified_by: number;
  role_created_date: Date;
  role_modified_date: Date;
  role_status_id: number;
  role_uuid: string;
}
```

### Validation Rules
- Name: Unique, required
- Description: Required

### Relationships
- Has many Users
- Has many RolePermissions

## TeacherProfile Model

```typescript
interface TeacherProfile {
  teacher_profile_id: number;
  user_id: number;
  initials: string;
  department: string;
  qualification: string;
  bio: string;
  notes: string;
  max_daily_hours: number;
  preferred_start_time: Date;
  preferred_end_time: Date;
  control_number: string;
  contract_type: string;
  organization_id: number;
  is_deleted: boolean;
  created_by: number;
  modified_by: number;
  created_date: Date;
  modified_date: Date;
  status_id: number;
  primary_schedule_preference_id: number;
  calendar_uuid: string;
  teacher_profile_uuid: string;
}
```

### Validation Rules
- Initials: 1-5 characters, unique
- Max Daily Hours: Positive integer

### Relationships
- Belongs to one User
- Belongs to one Organization
- Has many TeacherAvailabilities
- Has many SchedulePreferences
- Has one primary SchedulePreference
- Has many Bindings (teaching assignments)
- Has many TimetableEntries

## Class Model

```typescript
interface Class {
  class_id: number;
  class_name: string;
  class_initial: string;
  class_subject: string;
  class_description: string;
  class_color: string;
  class_capacity: number;
  class_min_lessons_per_day: number;
  class_max_lessons_per_day: number;
  class_latest_start_position: number;
  class_earliest_end: number;
  class_max_free_periods: number;
  class_present_every_day: boolean;
  class_main_teacher: string;
  class_location_id: number;
  class_organization_id: number;
  class_is_deleted: boolean;
  class_created_by: string;
  class_modified_by: string;
  class_created_date: Date;
  class_modified_date: Date;
  class_status_id: number;
  class_uuid: string;
  primary_schedule_preference_id: number;
  class_individual_timetable_id: number;
}
```

### Validation Rules
- Name: Required, 3-100 characters
- Initial: 1-5 characters, unique within organization
- Min/Max Lessons Per Day: Min ≤ Max
- Capacity: Positive integer or null

### Relationships
- Belongs to one Organization
- Has many SchedulePreferences
- Has one primary SchedulePreference
- Has many TimetableEntries
- Can belong to many ClassBands
- Can belong to many ClassGroups
- Has one individual Timetable (optional)

## Subject Model

```typescript
interface Subject {
  subject_id: number;
  subject_name: string;
  subject_initials: string;
  subject_description: string;
  subject_duration_in_minutes: number;
  subject_red_repetition: boolean;
  subject_blue_repetition: boolean;
  subject_conflict_subject_id: number;
  subject_group: string;
  subject_auto_conflict_handling: boolean;
  subject_organization_id: number;
  subject_is_deleted: boolean;
  subject_created_by: number;
  subject_modified_by: number;
  subject_created_date: Date;
  subject_modified_date: Date;
  subject_status_id: number;
  subject_uuid: string;
  subject_color: string;
}
```

### Validation Rules
- Name: Required, 3-100 characters
- Initials: 1-5 characters, unique within organization
- Duration: Positive integer in minutes

### Relationships
- Belongs to one Organization
- Can have one conflict Subject (self-referential)
- Has many Bindings
- Has many TimetableEntries
- Has many SubjectAssignments

## Room Model

```typescript
interface Room {
  room_id: number;
  room_name: string;
  room_code: string;
  room_initials: string;
  room_description: string;
  room_capacity: number;
  room_location: string;
  room_control_number: string;
  room_priority: string;
  organization_id: number;
  room_is_deleted: boolean;
  room_created_by: number;
  room_modified_by: number;
  room_created_date: Date;
  room_modified_date: Date;
  room_status_id: number;
  room_uuid: string;
}
```

### Validation Rules
- Name: Required, 3-100 characters
- Code: Required, unique within organization
- Capacity: Positive integer
- Priority: Enum ('HIGH', 'LOW', null)

### Relationships
- Belongs to one Organization
- Has many SchedulePreferences
- Has many TimetableEntries
- Has many Bindings

## Timetable Model

```typescript
interface Timetable {
  timetable_id: number;
  timetable_name: string;
  timetable_description: string;
  timetable_organization_id: number;
  timetable_academic_year: string;
  timetable_semester: string;
  timetable_start_date: Date;
  timetable_end_date: Date;
  timetable_is_published: boolean;
  timetable_start_day: number;
  timetable_end_day: number;
  timetable_school_start_time: string;
  timetable_school_end_time: string;
  timetable_generated_by: string;
  timetable_cached_data: string;
  timetable_view_id: string;
  timetable_view_name: string;
  timetable_view_type: string;
  timetable_is_deleted: boolean;
  timetable_created_by: number;
  timetable_modified_by: number;
  timetable_created_date: Date;
  timetable_modified_date: Date;
  timetable_status_id: number;
  timetable_uuid: string;
  timetable_generated_date: Date;
  timetable_generation_duration: number;
  timetable_generation_success_count: number;
  timetable_generation_failure_count: number;
  timetable_include_weekends: boolean;
  timetable_plan_start_date: Date;
  timetable_plan_end_date: Date;
  timetable_plan_setting_uuid: string;
  plan_settings_id: number;
  timetable_plan: string;
}
```

### Validation Rules
- Name: Required, 3-100 characters
- Academic Year: Required
- Semester: Required
- Start/End Date: Valid dates, Start before End

### Relationships
- Belongs to one Organization
- Has many TimetableEntries
- Has one PlanningSettings
- Has many TimetableCache records

## TimetableEntry Model

```typescript
interface TimetableEntry {
  entry_id: number;
  entry_timetable_id: number;
  entry_day_of_week: number;
  entry_period: number;
  entry_period_number: number;
  entry_period_type: string;
  entry_teacher_id: number;
  entry_class_id: number;
  entry_class_band_id: number;
  entry_subject_id: number;
  entry_room_id: number;
  entry_duration_minutes: number;
  entry_status: string;
  entry_is_class_band_entry: boolean;
  timetable_is_deleted: boolean;
  entry_is_locked: boolean;
  timetable_entry_uuid: string;
}
```

### Validation Rules
- Day of Week: 0-6 (Sunday to Saturday)
- Period: Valid period number
- Duration: Positive integer in minutes
- Status: Enum ('SCHEDULED', 'TENTATIVE', 'CANCELLED')

### Relationships
- Belongs to one Timetable
- Can belong to one Teacher
- Can belong to one Class
- Can belong to one ClassBand
- Can belong to one Subject
- Can belong to one Room
- Has many Attendances

## Binding Model

```typescript
interface Binding {
  binding_id: number;
  binding_teacher_id: number;
  binding_subject_id: number;
  binding_class_id: number;
  binding_class_band_id: number;
  binding_room_id: number;
  binding_organization_id: number;
  binding_periods_per_week: number;
  binding_priority: number;
  binding_is_fixed: boolean;
  binding_notes: string;
  binding_is_deleted: boolean;
  binding_created_by: number;
  binding_modified_by: number;
  binding_created_date: Date;
  binding_modified_date: Date;
  binding_status_id: number;
  binding_uuid: string;
}
```

### Validation Rules
- Periods Per Week: Positive integer
- Priority: Integer (higher values mean higher priority)

### Relationships
- Belongs to one Teacher
- Belongs to one Subject
- Can belong to one Class
- Can belong to one ClassBand
- Belongs to one Room
- Belongs to one Organization
- Has many Rules through BindingRules

## Period Model

```typescript
interface Period {
  period_id: number;
  period_name: string;
  period_number: number;
  period_start_time: Date;
  period_end_time: Date;
  period_duration_minutes: number;
  period_organization_id: number;
  period_days: string;
  period_type: string;
  period_allow_scheduling: boolean;
  period_allow_conflicts: boolean;
  period_show_in_timetable: boolean;
  period_is_deleted: boolean;
  period_created_by: number;
  period_modified_by: number;
  period_created_date: Date;
  period_modified_date: Date;
  period_status_id: number;
  period_uuid: string;
  period_plan_settings_id: number;
}
```

### Validation Rules
- Name: Required
- Number: Unique integer within organization
- Start/End Time: Valid times, Start before End
- Duration: Positive integer in minutes
- Days: Comma-separated list of day numbers (0-6)

### Relationships
- Belongs to one Organization
- Belongs to one PlanningSettings (optional)
- Has many Schedules

## Rule Model

```typescript
interface Rule {
  rule_id: number;
  rule_name: string;
  rule_type: string;
  rule_data: string;
  rule_comment: string;
  rule_priority: number;
  rule_is_enabled: boolean;
  rule_organization_id: number;
  rule_is_deleted: boolean;
  rule_created_date: Date;
  rule_modified_date: Date;
  rule_status_id: number;
  rule_uuid: string;
}
```

### Validation Rules
- Name: Required, 3-100 characters
- Type: Enum of rule types
- Data: JSON string with rule configuration
- Priority: Integer (higher values mean higher priority)

### Relationships
- Belongs to one Organization
- Has many SchedulePreferences through RuleSchedulePreferences
- Has many Bindings through BindingRules

## Sample JSON Data

### User Sample
```json
{
  "user_id": 1,
  "user_email": "john.doe@example.com",
  "user_first_name": "John",
  "user_last_name": "Doe",
  "user_password_hash": "$2a$10$abcdefghijklmnopqrstuvwxyz12345",
  "user_phone": "+1234567890",
  "user_is_active": true,
  "user_is_deleted": false,
  "user_created_by": 1,
  "user_modified_by": 1,
  "user_created_date": "2025-01-01T00:00:00Z",
  "user_modified_date": "2025-01-01T00:00:00Z",
  "user_status_id": 1,
  "user_uuid": "a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6",
  "role_id": 2,
  "organization_id": 1
}
```

### Teacher Profile Sample
```json
{
  "teacher_profile_id": 1,
  "user_id": 1,
  "initials": "JD",
  "department": "Mathematics",
  "qualification": "PhD in Mathematics",
  "bio": "Experienced math teacher with 10 years of teaching experience",
  "notes": "Prefers morning classes",
  "max_daily_hours": 6,
  "preferred_start_time": "08:00:00",
  "preferred_end_time": "16:00:00",
  "control_number": "T001",
  "contract_type": "FULL_TIME",
  "organization_id": 1,
  "is_deleted": false,
  "created_by": 1,
  "modified_by": 1,
  "created_date": "2025-01-01T00:00:00Z",
  "modified_date": "2025-01-01T00:00:00Z",
  "status_id": 1,
  "primary_schedule_preference_id": 1,
  "calendar_uuid": "cal-a1b2c3d4-e5f6-7g8h-9i0j",
  "teacher_profile_uuid": "tpr-a1b2c3d4-e5f6-7g8h-9i0j"
}
```

### Timetable Entry Sample
```json
{
  "entry_id": 1,
  "entry_timetable_id": 1,
  "entry_day_of_week": 1,
  "entry_period": 2,
  "entry_period_number": 2,
  "entry_period_type": "REGULAR",
  "entry_teacher_id": 1,
  "entry_class_id": 3,
  "entry_class_band_id": null,
  "entry_subject_id": 5,
  "entry_room_id": 2,
  "entry_duration_minutes": 45,
  "entry_status": "SCHEDULED",
  "entry_is_class_band_entry": false,
  "timetable_is_deleted": false,
  "entry_is_locked": false,
  "timetable_entry_uuid": "ent-a1b2c3d4-e5f6-7g8h-9i0j"
}
```
