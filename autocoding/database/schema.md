
# Database Schema

## Overview

The AI Timetable system uses a relational database structure with MySQL/MariaDB. This document details the table structure, relationships, and key constraints that form the foundation of the system's data model.

## Common Fields

Most tables in the system include these standard fields:
- `*_id` - Primary key (auto-increment integer)
- `*_uuid` - Unique identifier string (UUID format)
- `*_created_by` - Reference to user who created the record
- `*_modified_by` - Reference to user who last modified the record
- `*_created_date` - Timestamp of creation
- `*_modified_date` - Timestamp of last modification
- `*_is_deleted` - Soft delete flag (boolean)
- `*_status_id` - Record status reference

## Core Tables

### users

Stores user accounts and authentication information.

| Column | Type | Description |
|--------|------|-------------|
| user_id | int(11) | Primary key |
| user_email | varchar(255) | User email address (unique) |
| user_first_name | varchar(255) | User's first name |
| user_last_name | varchar(255) | User's last name |
| user_password_hash | varchar(255) | Bcrypt hashed password |
| user_phone | varchar(255) | User phone number |
| user_is_active | bit(1) | Account active status |
| user_is_deleted | bit(1) | Soft delete flag |
| user_created_by | int(11) | Creator reference |
| user_modified_by | int(11) | Modifier reference |
| user_created_date | datetime(6) | Creation timestamp |
| user_modified_date | datetime(6) | Last modification timestamp |
| user_status_id | int(11) | Status reference |
| user_uuid | varchar(255) | Unique identifier |
| role_id | int(11) | Foreign key to roles.role_id |
| organization_id | int(11) | Foreign key to organizations.organization_id |

### roles

Defines user roles and permissions within the system.

| Column | Type | Description |
|--------|------|-------------|
| role_id | int(11) | Primary key |
| role_name | varchar(255) | Role name (unique) |
| role_description | tinytext | Role description |
| role_is_deleted | bit(1) | Soft delete flag |
| role_created_by | int(11) | Creator reference |
| role_modified_by | int(11) | Modifier reference |
| role_created_date | datetime(6) | Creation timestamp |
| role_modified_date | datetime(6) | Last modification timestamp |
| role_status_id | int(11) | Status reference |
| role_uuid | varchar(255) | Unique identifier |

### permissions

Stores individual permissions that can be assigned to roles.

| Column | Type | Description |
|--------|------|-------------|
| permission_id | int(11) | Primary key |
| permission_name | varchar(100) | Permission name (unique) |
| permission_description | varchar(255) | Permission description |

### role_permissions

Maps permissions to roles in a many-to-many relationship.

| Column | Type | Description |
|--------|------|-------------|
| roleperm_id | int(11) | Primary key |
| roleperm_role_id | int(11) | Foreign key to roles.role_id |
| roleperm_permission_id | int(11) | Foreign key to permissions.permission_id |

### organizations

Stores organizations (schools, universities, etc.) in the system.

| Column | Type | Description |
|--------|------|-------------|
| organization_id | int(11) | Primary key |
| organization_name | varchar(255) | Organization name |
| organization_address | varchar(255) | Physical address |
| organization_contact_email | varchar(255) | Contact email |
| organization_contact_phone | varchar(255) | Contact phone |
| organization_is_deleted | bit(1) | Soft delete flag |
| organization_created_by | varchar(255) | Creator reference |
| organization_modified_by | varchar(255) | Modifier reference |
| organization_created_date | datetime(6) | Creation timestamp |
| organization_modified_date | datetime(6) | Last modification timestamp |
| organization_status_id | int(11) | Status reference |
| organization_uid | varchar(255) | Unique identifier |

## Profile Tables

### teacher_profiles

Stores teacher-specific information and constraints.

| Column | Type | Description |
|--------|------|-------------|
| teacher_profile_id | int(11) | Primary key |
| user_id | int(11) | Foreign key to users.user_id |
| initials | varchar(255) | Teacher initials |
| department | varchar(255) | Department/subject area |
| qualification | varchar(255) | Academic qualifications |
| bio | varchar(255) | Brief biography |
| notes | varchar(255) | Additional notes |
| max_daily_hours | int(11) | Maximum teaching hours per day |
| preferred_start_time | time(6) | Preferred earliest teaching time |
| preferred_end_time | time(6) | Preferred latest teaching time |
| control_number | varchar(255) | External identifier |
| contract_type | varchar(255) | Employment type |
| organization_id | int(11) | Foreign key to organizations.organization_id |
| is_deleted | bit(1) | Soft delete flag |
| created_by | int(11) | Creator reference |
| modified_by | int(11) | Modifier reference |
| created_date | datetime(6) | Creation timestamp |
| modified_date | datetime(6) | Last modification timestamp |
| status_id | int(11) | Status reference |
| primary_schedule_preference_id | int(11) | Foreign key to schedule_preferences.schedule_preference_id |
| calendar_uuid | varchar(255) | Calendar reference |
| teacher_profile_uuid | varchar(255) | Unique identifier |

### teacher_availabilities

Defines when teachers are available for scheduling.

| Column | Type | Description |
|--------|------|-------------|
| teacher_availability_id | int(11) | Primary key |
| teacher_id | int(11) | Foreign key to teacher_profiles.teacher_profile_id |
| teacher_availability_day_of_week | int(11) | Day of week (0-6) |
| teacher_availability_start_time | time(6) | Start time of availability |
| teacher_availability_end_time | time(6) | End time of availability |
| organization_id | int(11) | Foreign key to organizations.organization_id |
| teacher_availability_is_deleted | bit(1) | Soft delete flag |
| teacher_availability_created_by | int(11) | Creator reference |
| teacher_availability_modified_by | int(11) | Modifier reference |
| teacher_availability_created_date | datetime(6) | Creation timestamp |
| teacher_availability_modified_date | datetime(6) | Last modification timestamp |
| teacher_availability_status_id | int(11) | Status reference |
| teacher_availability_uuid | varchar(255) | Unique identifier |

### student_profiles

Stores student-specific information.

| Column | Type | Description |
|--------|------|-------------|
| student_id | int(11) | Primary key |
| user_id | int(11) | Foreign key to users.user_id |
| student_id_number | varchar(255) | Student ID number |
| student_class_id | int(11) | Foreign key to classes.class_id |
| department | varchar(255) | Department/faculty |
| address | varchar(255) | Student address |
| notes | varchar(255) | Additional notes |
| organization_id | int(11) | Foreign key to organizations.organization_id |
| student_is_deleted | bit(1) | Soft delete flag |
| student_created_by | int(11) | Creator reference |
| student_modified_by | int(11) | Modifier reference |
| student_created_date | datetime(6) | Creation timestamp |
| student_modified_date | datetime(6) | Last modification timestamp |
| student_status_id | int(11) | Status reference |
| student_uuid | varchar(255) | Unique identifier |

### manager_profiles

Stores manager-specific information and permissions.

| Column | Type | Description |
|--------|------|-------------|
| manager_id | int(11) | Primary key |
| manager_user_id | int(11) | Foreign key to users.user_id |
| manager_organization_id | int(11) | Foreign key to organizations.organization_id |
| manager_can_manage_teachers | bit(1) | Permission flag |
| manager_can_manage_students | bit(1) | Permission flag |
| manager_can_generate_timetable | bit(1) | Permission flag |
| manager_can_create_managers | bit(1) | Permission flag |
| manager_is_deleted | bit(1) | Soft delete flag |
| manager_created_by | int(11) | Creator reference |
| manager_modified_by | int(11) | Modifier reference |
| manager_created_date | datetime(6) | Creation timestamp |
| manager_modified_date | datetime(6) | Last modification timestamp |
| manager_status_id | int(11) | Status reference |
| manager_uuid | varchar(255) | Unique identifier |

### admin_profiles

Stores admin-specific information and permissions.

| Column | Type | Description |
|--------|------|-------------|
| admin_id | int(11) | Primary key |
| admin_user_id | int(11) | Foreign key to users.user_id |
| admin_organization_id | int(11) | Foreign key to organizations.organization_id |
| admin_can_manage_organizations | bit(1) | Permission flag |
| admin_is_deleted | bit(1) | Soft delete flag |
| admin_created_by | int(11) | Creator reference |
| admin_modified_by | int(11) | Modifier reference |
| admin_created_date | datetime(6) | Creation timestamp |
| admin_modified_date | datetime(6) | Last modification timestamp |
| admin_status_id | int(11) | Status reference |
| admin_uuid | varchar(255) | Unique identifier |

## Timetable-Related Tables

### classes

Defines class groups that are scheduled together.

| Column | Type | Description |
|--------|------|-------------|
| class_id | int(11) | Primary key |
| class_name | varchar(255) | Class name |
| class_initial | varchar(255) | Class initials |
| class_subject | varchar(255) | Default subject |
| class_description | varchar(255) | Description |
| class_color | varchar(255) | Display color |
| class_capacity | int(11) | Maximum number of students |
| class_min_lessons_per_day | int(11) | Minimum lessons per day |
| class_max_lessons_per_day | int(11) | Maximum lessons per day |
| class_latest_start_position | int(11) | Latest allowed start period |
| class_earliest_end | int(11) | Earliest allowed end period |
| class_max_free_periods | int(11) | Maximum allowed free periods |
| class_present_every_day | bit(1) | Must be scheduled every day |
| class_main_teacher | varchar(255) | Main teacher reference |
| class_location_id | int(11) | Default location |
| class_organization_id | int(11) | Foreign key to organizations.organization_id |
| class_is_deleted | bit(1) | Soft delete flag |
| class_created_by | varchar(255) | Creator reference |
| class_modified_by | varchar(255) | Modifier reference |
| class_created_date | datetime(6) | Creation timestamp |
| class_modified_date | datetime(6) | Last modification timestamp |
| class_status_id | int(11) | Status reference |
| class_uuid | varchar(255) | Unique identifier |
| primary_schedule_preference_id | int(11) | Primary schedule preference |
| class_individual_timetable_id | int(11) | Individual timetable reference |

### class_bands

Groups multiple classes that can be scheduled together.

| Column | Type | Description |
|--------|------|-------------|
| class_band_id | int(11) | Primary key |
| class_band_name | varchar(255) | Band name |
| class_band_description | varchar(255) | Description |
| class_band_color | varchar(255) | Display color |
| class_band_min_lessons_per_day | int(11) | Minimum lessons per day |
| class_band_max_lessons_per_day | int(11) | Maximum lessons per day |
| class_band_latest_start_position | int(11) | Latest allowed start period |
| class_band_earliest_end | int(11) | Earliest allowed end period |
| class_band_max_free_periods | int(11) | Maximum allowed free periods |
| class_band_present_every_day | bit(1) | Must be scheduled every day |
| class_band_organization_id | int(11) | Foreign key to organizations.organization_id |
| class_band_is_deleted | bit(1) | Soft delete flag |
| class_band_created_by | varchar(255) | Creator reference |
| class_band_modified_by | varchar(255) | Modifier reference |
| class_band_created_date | datetime(6) | Creation timestamp |
| class_band_modified_date | datetime(6) | Last modification timestamp |
| class_band_status_id | int(11) | Status reference |
| class_band_uuid | varchar(255) | Unique identifier |
| primary_schedule_preference_id | int(11) | Primary schedule preference |

### class_band_classes

Maps classes to class bands in a many-to-many relationship.

| Column | Type | Description |
|--------|------|-------------|
| class_band_id | int(11) | Foreign key to class_bands.class_band_id |
| class_id | int(11) | Foreign key to classes.class_id |

### subjects

Defines subjects that can be taught.

| Column | Type | Description |
|--------|------|-------------|
| subject_id | int(11) | Primary key |
| subject_name | varchar(255) | Subject name |
| subject_initials | varchar(255) | Subject initials |
| subject_description | text | Description |
| subject_duration_in_minutes | int(11) | Standard duration |
| subject_red_repetition | bit(1) | Prevent multiple periods in one day |
| subject_blue_repetition | bit(1) | Allow multiple periods in one day |
| subject_conflict_subject_id | int(11) | Related subject that conflicts |
| subject_group | varchar(255) | Subject group for conflicts |
| subject_auto_conflict_handling | bit(1) | Auto handle conflicts |
| subject_organization_id | int(11) | Foreign key to organizations.organization_id |
| subject_is_deleted | bit(1) | Soft delete flag |
| subject_created_by | int(11) | Creator reference |
| subject_modified_by | int(11) | Modifier reference |
| subject_created_date | datetime(6) | Creation timestamp |
| subject_modified_date | datetime(6) | Last modification timestamp |
| subject_status_id | int(11) | Status reference |
| subject_uuid | varchar(255) | Unique identifier |
| subject_color | varchar(255) | Display color |

### rooms

Stores physical or virtual rooms used for classes.

| Column | Type | Description |
|--------|------|-------------|
| room_id | int(11) | Primary key |
| room_name | varchar(255) | Room name |
| room_code | varchar(255) | Room code |
| room_initials | varchar(255) | Room initials |
| room_description | tinytext | Description |
| room_capacity | int(11) | Maximum capacity |
| room_location | varchar(255) | Physical location |
| room_control_number | varchar(255) | External identifier |
| room_priority | varchar(255) | Priority level (HIGH/LOW) |
| organization_id | int(11) | Foreign key to organizations.organization_id |
| room_is_deleted | bit(1) | Soft delete flag |
| room_created_by | int(11) | Creator reference |
| room_modified_by | int(11) | Modifier reference |
| room_created_date | datetime(6) | Creation timestamp |
| room_modified_date | datetime(6) | Last modification timestamp |
| room_status_id | int(11) | Status reference |
| room_uuid | varchar(255) | Unique identifier |

### periods

Defines time slots for scheduling.

| Column | Type | Description |
|--------|------|-------------|
| period_id | int(11) | Primary key |
| period_name | varchar(255) | Period name |
| period_number | int(11) | Period sequence number |
| period_start_time | time(6) | Start time |
| period_end_time | time(6) | End time |
| period_duration_minutes | int(11) | Duration in minutes |
| period_days | varchar(255) | Applicable days |
| period_type | varchar(255) | Period type |
| period_allow_scheduling | bit(1) | Can be scheduled |
| period_allow_conflicts | bit(1) | Allows conflicts |
| period_show_in_timetable | bit(1) | Visible in timetable |
| period_organization_id | int(11) | Foreign key to organizations.organization_id |
| period_is_deleted | bit(1) | Soft delete flag |
| period_created_by | int(11) | Creator reference |
| period_modified_by | int(11) | Modifier reference |
| period_created_date | datetime(6) | Creation timestamp |
| period_modified_date | datetime(6) | Last modification timestamp |
| period_status_id | int(11) | Status reference |
| period_uuid | varchar(255) | Unique identifier |
| period_plan_settings_id | int(11) | Plan settings reference |

### schedules

Maps periods to days of the week.

| Column | Type | Description |
|--------|------|-------------|
| schedule_id | int(11) | Primary key |
| day_of_week | int(11) | Day of week (0-6) |
| period_id | int(11) | Foreign key to periods.period_id |
| schedule_organization_id | int(11) | Foreign key to organizations.organization_id |
| schedule_is_deleted | bit(1) | Soft delete flag |
| schedule_created_by | int(11) | Creator reference |
| schedule_modified_by | int(11) | Modifier reference |
| schedule_created_date | datetime(6) | Creation timestamp |
| schedule_modified_date | datetime(6) | Last modification timestamp |
| schedule_status_id | int(11) | Status reference |
| schedule_uuid | varchar(255) | Unique identifier |

### schedule_preferences

Stores scheduling preferences for various entities.

| Column | Type | Description |
|--------|------|-------------|
| schedule_preference_id | int(11) | Primary key |
| schedule_id | int(11) | Foreign key to schedules.schedule_id |
| schedule_preference_organization_id | int(11) | Organization reference |
| must_teach | bit(1) | Teacher must teach |
| prefers_to_teach | bit(1) | Teacher prefers to teach |
| cannot_teach | bit(1) | Teacher cannot teach |
| dont_prefer_to_teach | bit(1) | Teacher doesn't prefer to teach |
| must_schedule_class | bit(1) | Class must be scheduled |
| prefers_to_schedule_class | bit(1) | Class preferably scheduled |
| must_not_schedule_class | bit(1) | Class must not be scheduled |
| prefer_not_to_schedule_class | bit(1) | Class preferably not scheduled |
| is_available | bit(1) | Entity is available |
| applies | bit(1) | Preference applies |
| schedule_preference_reason | varchar(255) | Reason for preference |
| schedule_preference_effective_from | datetime(6) | Start date of effect |
| schedule_preference_effective_to | datetime(6) | End date of effect |
| schedule_preference_is_recurring | bit(1) | Recurring preference |
| schedule_preference_is_deleted | bit(1) | Soft delete flag |
| schedule_preference_created_by | int(11) | Creator reference |
| schedule_preference_modified_by | int(11) | Modifier reference |
| schedule_preference_created_date | datetime(6) | Creation timestamp |
| schedule_preference_modified_date | datetime(6) | Last modification timestamp |
| schedule_preference_status_id | int(11) | Status reference |
| schedule_preference_uuid | varchar(36) | Unique identifier |

### teacher_schedule_preferences

Maps schedule preferences to teachers.

| Column | Type | Description |
|--------|------|-------------|
| teacher_profile_id | int(11) | Foreign key to teacher_profiles.teacher_profile_id |
| schedule_preference_id | int(11) | Foreign key to schedule_preferences.schedule_preference_id |

### class_schedule_preferences

Maps schedule preferences to classes.

| Column | Type | Description |
|--------|------|-------------|
| class_id | int(11) | Foreign key to classes.class_id |
| schedule_preference_id | int(11) | Foreign key to schedule_preferences.schedule_preference_id |

### room_schedule_preferences

Maps schedule preferences to rooms.

| Column | Type | Description |
|--------|------|-------------|
| room_id | int(11) | Foreign key to rooms.room_id |
| schedule_preference_id | int(11) | Foreign key to schedule_preferences.schedule_preference_id |

### bindings

Defines teaching assignments (teacher-subject-class combinations).

| Column | Type | Description |
|--------|------|-------------|
| binding_id | int(11) | Primary key |
| binding_teacher_id | int(11) | Foreign key to teacher_profiles.teacher_profile_id |
| binding_subject_id | int(11) | Foreign key to subjects.subject_id |
| binding_class_id | int(11) | Foreign key to classes.class_id |
| binding_class_band_id | int(11) | Foreign key to class_bands.class_band_id |
| binding_room_id | int(11) | Foreign key to rooms.room_id |
| binding_organization_id | int(11) | Foreign key to organizations.organization_id |
| binding_periods_per_week | int(11) | Required periods per week |
| binding_priority | int(11) | Scheduling priority |
| binding_is_fixed | bit(1) | Fixed assignment flag |
| binding_notes | varchar(255) | Additional notes |
| binding_is_deleted | bit(1) | Soft delete flag |
| binding_created_by | int(11) | Creator reference |
| binding_modified_by | int(11) | Modifier reference |
| binding_created_date | datetime(6) | Creation timestamp |
| binding_modified_date | datetime(6) | Last modification timestamp |
| binding_status_id | int(11) | Status reference |
| binding_uuid | varchar(255) | Unique identifier |

### rules

Defines scheduling rules and constraints.

| Column | Type | Description |
|--------|------|-------------|
| rule_id | bigint(20) | Primary key |
| rule_name | varchar(255) | Rule name |
| rule_type | varchar(255) | Rule type |
| rule_data | tinytext | Rule configuration |
| rule_comment | varchar(255) | Additional comments |
| rule_priority | int(11) | Processing priority |
| rule_is_enabled | bit(1) | Enabled flag |
| rule_organization_id | int(11) | Foreign key to organizations.organization_id |
| rule_is_deleted | bit(1) | Soft delete flag |
| rule_created_date | datetime(6) | Creation timestamp |
| rule_modified_date | datetime(6) | Last modification timestamp |
| rule_status_id | int(11) | Status reference |
| rule_uuid | varchar(255) | Unique identifier |

### binding_rules

Maps rules to bindings in a many-to-many relationship.

| Column | Type | Description |
|--------|------|-------------|
| binding_id | int(11) | Foreign key to bindings.binding_id |
| rule_id | bigint(20) | Foreign key to rules.rule_id |

### planning_settings

Stores timetable planning configuration.

| Column | Type | Description |
|--------|------|-------------|
| planning_settings_id | int(11) | Primary key |
| planning_settings_name | varchar(255) | Settings name |
| planning_settings_description | varchar(1000) | Description |
| planning_settings_organization_id | varchar(255) | Organization reference |
| planning_settings_days_per_week | int(11) | Days per week |
| planning_settings_periods_per_day | int(11) | Periods per day |
| planning_settings_start_time | time(6) | Day start time |
| planning_settings_end_time | time(6) | Day end time |
| planning_settings_category | varchar(255) | Settings category |
| planning_settings_include_weekends | bit(1) | Include weekends |
| planning_settings_plan_type | varchar(255) | Plan type |
| planning_settings_plan_start_date | date | Plan start date |
| planning_settings_plan_end_date | date | Plan end date |
| planning_settings_is_deleted | bit(1) | Soft delete flag |
| planning_settings_created_by | int(11) | Creator reference |
| planning_settings_modified_by | int(11) | Modifier reference |
| planning_settings_created_date | datetime(6) | Creation timestamp |
| planning_settings_modified_date | datetime(6) | Last modification timestamp |
| planning_settings_uuid | varchar(255) | Unique identifier |

### timetables

Stores generated timetables.

| Column | Type | Description |
|--------|------|-------------|
| timetable_id | int(11) | Primary key |
| timetable_name | varchar(255) | Timetable name |
| timetable_description | text | Description |
| timetable_organization_id | int(11) | Foreign key to organizations.organization_id |
| timetable_academic_year | varchar(255) | Academic year |
| timetable_semester | varchar(255) | Semester |
| timetable_start_date | datetime(6) | Start date |
| timetable_end_date | datetime(6) | End date |
| timetable_is_published | bit(1) | Published flag |
| timetable_start_day | int(11) | Starting day of week |
| timetable_end_day | int(11) | Ending day of week |
| timetable_school_start_time | varchar(255) | School day start time |
| timetable_school_end_time | varchar(255) | School day end time |
| timetable_generated_by | varchar(255) | Generator reference |
| timetable_cached_data | text | Cached timetable data |
| timetable_view_id | varchar(255) | View identifier |
| timetable_view_name | varchar(255) | View name |
| timetable_view_type | varchar(255) | View type |
| timetable_is_deleted | bit(1) | Soft delete flag |
| timetable_created_by | bigint(20) | Creator reference |
| timetable_modified_by | bigint(20) | Modifier reference |
| timetable_created_date | datetime(6) | Creation timestamp |
| timetable_modified_date | datetime(6) | Last modification timestamp |
| timetable_status_id | int(11) | Status reference |
| timetable_uuid | varchar(255) | Unique identifier |
| timetable_generated_date | datetime(6) | Generation timestamp |
| timetable_generation_duration | int(11) | Generation duration in ms |
| timetable_generation_success_count | int(11) | Successful generations |
| timetable_generation_failure_count | int(11) | Failed generations |
| timetable_include_weekends | bit(1) | Include weekends |
| timetable_plan_start_date | date | Plan start date |
| timetable_plan_end_date | date | Plan end date |
| timetable_plan_setting_uuid | varchar(255) | Plan settings reference |
| plan_settings_id | int(11) | Foreign key to planning_settings.planning_settings_id |
| timetable_plan | varchar(255) | Plan type |

### timetable_entries

Stores individual entries in timetables.

| Column | Type | Description |
|--------|------|-------------|
| entry_id | int(11) | Primary key |
| entry_timetable_id | int(11) | Foreign key to timetables.timetable_id |
| entry_day_of_week | int(11) | Day of week (0-6) |
| entry_period | int(11) | Period reference |
| entry_period_number | int(11) | Period sequence number |
| entry_period_type | varchar(255) | Period type |
| entry_teacher_id | int(11) | Foreign key to teacher_profiles.teacher_profile_id |
| entry_class_id | int(11) | Foreign key to classes.class_id |
| entry_class_band_id | int(11) | Foreign key to class_bands.class_band_id |
| entry_subject_id | int(11) | Foreign key to subjects.subject_id |
| entry_room_id | int(11) | Foreign key to rooms.room_id |
| entry_duration_minutes | int(11) | Duration in minutes |
| entry_status | varchar(255) | Entry status |
| entry_is_class_band_entry | bit(1) | Class band entry flag |
| timetable_is_deleted | bit(1) | Soft delete flag |
| entry_is_locked | bit(1) | Locked against changes |
| timetable_entry_uuid | varchar(255) | Unique identifier |

### timetable_cache

Caches computed timetable data for performance.

| Column | Type | Description |
|--------|------|-------------|
| id | int(11) | Primary key |
| timetable_id | int(11) | Foreign key to timetables.timetable_id |
| cache_key | varchar(255) | Cache key |
| cache_data | varchar(255) | Cached data |
| is_valid | bit(1) | Validity flag |
| created_at | datetime(6) | Creation timestamp |
| expires_at | datetime(6) | Expiration timestamp |
| uuid | varchar(36) | Unique identifier |

## Authentication Tables

### auth_tokens

Stores active authentication tokens.

| Column | Type | Description |
|--------|------|-------------|
| token_id | int(11) | Primary key |
| token_user_id | int(11) | Foreign key to users.user_id |
| token_token | varchar(256) | Token value (unique) |
| token_issued_at | datetime(6) | Issue timestamp |
| token_expiry | datetime(6) | Expiration timestamp |

### auth_refresh_tokens

Stores refresh tokens for JWT authentication.

| Column | Type | Description |
|--------|------|-------------|
| refresh_token_id | int(11) | Primary key |
| refresh_token_user_id | int(11) | Foreign key to users.user_id |
| refresh_token_token | varchar(256) | Token value (unique) |
| refresh_token_created_at | datetime(6) | Creation timestamp |
| refresh_token_expires_at | datetime(6) | Expiration timestamp |
| refresh_token_revoked | bit(1) | Revocation flag |

### auth_blacklisted_tokens

Stores revoked tokens that are still valid by expiration date.

| Column | Type | Description |
|--------|------|-------------|
| blacklisted_token_id | int(11) | Primary key |
| blacklisted_token_jti | varchar(256) | JWT ID (unique) |
| blacklisted_token_created_at | datetime(6) | Creation timestamp |
| blacklisted_token_expires_at | datetime(6) | Expiration timestamp |

### authcodes

Stores verification codes for various actions.

| Column | Type | Description |
|--------|------|-------------|
| authcode_id | int(11) | Primary key |
| authcode_user_id | int(11) | Foreign key to users.user_id |
| authcode_value | varchar(255) | Code value |
| authcode_type | enum | Code type (PASSWORD_RESET, REGISTRATION, TWO_FACTOR_AUTH) |
| authcode_expires_at | datetime(6) | Expiration timestamp |
| authcode_is_used | bit(1) | Usage flag |
| authcode_used_at | datetime(6) | Usage timestamp |
| authcode_attempts | int(11) | Verification attempts |
| authcode_ip_address | varchar(255) | Requesting IP address |
| authcode_is_deleted | bit(1) | Soft delete flag |
| authcode_created_by | int(11) | Creator reference |
| authcode_modified_by | int(11) | Modifier reference |
| authcode_created_date | datetime(6) | Creation timestamp |
| authcode_modified_date | datetime(6) | Last modification timestamp |
| authcode_status_id | int(11) | Status reference |

### user_oauth

Stores OAuth provider authentication information.

| Column | Type | Description |
|--------|------|-------------|
| oauth_id | int(11) | Primary key |
| oauth_user_id | int(11) | Foreign key to users.user_id |
| oauth_provider | varchar(100) | Provider name |
| oauth_provider_user_id | varchar(200) | Provider's user ID |
| oauth_access_token | varchar(256) | Access token |
| oauth_refresh_token | varchar(256) | Refresh token |
| oauth_issued_at | datetime(6) | Token issue timestamp |
| oauth_expires_at | datetime(6) | Token expiration timestamp |

## Other Tables

### calendars

Stores academic calendars.

| Column | Type | Description |
|--------|------|-------------|
| calendar_id | int(11) | Primary key |
| calendar_organization_id | int(11) | Foreign key to organizations.organization_id |
| calendar_academic_year | varchar(255) | Academic year |
| calendar_start_date | datetime(6) | Start date |
| calendar_end_date | datetime(6) | End date |
| calendar_is_deleted | bit(1) | Soft delete flag |
| calendar_created_by | int(11) | Creator reference |
| calendar_modified_by | int(11) | Modifier reference |
| calendar_created_date | datetime(6) | Creation timestamp |
| calendar_modified_date | datetime(6) | Last modification timestamp |
| calendar_status_id | int(11) | Status reference |
| calendar_uuid | varchar(255) | Unique identifier |

### holidays

Stores holiday and non-teaching days.

| Column | Type | Description |
|--------|------|-------------|
| holiday_id | bigint(20) | Primary key |
| holiday_calendar_id | int(11) | Foreign key to calendars.calendar_id |
| holiday_name | varchar(255) | Holiday name |
| holiday_description | tinytext | Description |
| holiday_start_date | datetime(6) | Start date |
| holiday_end_date | datetime(6) | End date |
| holiday_is_recurring | bit(1) | Recurring flag |
| holiday_is_deleted | bit(1) | Soft delete flag |
| holiday_created_by | int(11) | Creator reference |
| holiday_modified_by | int(11) | Modifier reference |
| holiday_created_date | datetime(6) | Creation timestamp |
| holiday_modified_date | datetime(6) | Last modification timestamp |
| holiday_status_id | int(11) | Status reference |
| holiday_uuid | varchar(255) | Unique identifier |

### attendances

Records student attendance for classes.

| Column | Type | Description |
|--------|------|-------------|
| attendance_id | bigint(20) | Primary key |
| attendance_student_id | int(11) | Foreign key to student_profiles.student_id |
| attendance_timetable_entry_id | int(11) | Foreign key to timetable_entries.entry_id |
| attendance_status | varchar(255) | Attendance status |
| attendance_recorded_at | datetime(6) | Recording timestamp |
| attendance_is_deleted | bit(1) | Soft delete flag |
| attendance_created_by | int(11) | Creator reference |
| attendance_modified_by | int(11) | Modifier reference |
| attendance_created_date | datetime(6) | Creation timestamp |
| attendance_modified_date | datetime(6) | Last modification timestamp |
| attendance_status_id | int(11) | Status reference |
| attendance_uuid | varchar(255) | Unique identifier |

### notifications

Stores user notifications.

| Column | Type | Description |
|--------|------|-------------|
| notification_id | bigint(20) | Primary key |
| notification_user_id | int(11) | Foreign key to users.user_id |
| notification_user_uuid | varchar(255) | User UUID reference |
| notification_organization_id | int(11) | Foreign key to organizations.organization_id |
| notification_title | varchar(255) | Notification title |
| notification_message | tinytext | Notification message |
| notification_type | varchar(255) | Notification type |
| notification_entity_type | varchar(255) | Referenced entity type |
| notification_is_read | bit(1) | Read status |
| notification_expires_at | datetime(6) | Expiration timestamp |
| notification_is_deleted | bit(1) | Soft delete flag |
| notification_created_by | int(11) | Creator reference |
| notification_modified_by | int(11) | Modifier reference |
| notification_created_date | datetime(6) | Creation timestamp |
| notification_modified_date | datetime(6) | Last modification timestamp |
| notification_status_id | int(11) | Status reference |
| notification_uuid | varchar(255) | Unique identifier |

### statuses

Defines status codes for entities.

| Column | Type | Description |
|--------|------|-------------|
| status_id | int(11) | Primary key |
| status_code | varchar(255) | Status code (unique) |
| status_name | varchar(255) | Status name |
| status_description | tinytext | Description |
| status_category | varchar(255) | Status category |
| status_order_index | int(11) | Display order |
| status_is_deleted | bit(1) | Soft delete flag |
| status_created_by | int(11) | Creator reference |
| status_modified_by | int(11) | Modifier reference |
| status_created_date | datetime(6) | Creation timestamp |
| status_modified_date | datetime(6) | Last modification timestamp |
| status_uuid | varchar(255) | Unique identifier |

## Key Relationships

1. **Users and Profiles**:
    - Users can have specialized profiles (Teacher, Student, Manager, Admin)
    - Each profile type has specific capabilities and constraints

2. **Classes and Scheduling**:
    - Classes can be grouped into ClassBands for concurrent scheduling
    - Classes have scheduling preferences defining when they can be scheduled
    - Classes are assigned subjects with specific teachers through bindings

3. **Timetable Generation**:
    - Timetables are generated based on bindings, preferences, and rules
    - TimetableEntries represent individual scheduled lessons
    - Rules and preferences guide the scheduling algorithm

4. **Organizations and Multi-tenancy**:
    - Most entities belong to a specific organization
    - Administrators can manage multiple organizations
    - Each organization can have its own set of users, classes, and timetables

5. **Authentication and Security**:
    - Users authenticate with password or OAuth providers
    - JWT tokens with refresh capability manage sessions
    - Roles and permissions control access to functions
```
