# Subject Module

## Overview
The Subject Module defines subjects offered at an organization and links subjects with teachers and periods for scheduling.

## Key Features
- Subject definition and management
- Teacher assignment to subjects
- Subject conflict management
- Subject grouping and categorization

## Subject Features
- **Initials Field**: Used as an abbreviation for the subject
- **Name Field**: Full name of the subject
- **Comment Section**: Additional information about the subject
- **Subject Count Repetition**: Defines if a subject can be repeated in the same day
- **Subject Repetition Control**:
    - **Red Subject Repetition**: Prevents multiple bindings of the same subject on the same day (default)
    - **Blue Subject Repetition**: Allows multiple bindings if necessary
- **Conflict Subject**: Assigns subjects that should be scheduled on different days
- **Subject Group**: Categorizes subjects to prevent back-to-back scheduling
- **Automatic Conflict Handling**: Prevents subjects in the same group from appearing consecutively

## API Endpoints
The Subject Module provides RESTful endpoints for managing subjects:
- Subject creation and editing
- Subject assignment to classes
- Subject constraints configuration
- Subject grouping management

## Integration Points
- Teacher Module: Linking subjects to qualified teachers
- Class Module: Assigning subjects to class schedules
- Timetable Module: Subject scheduling constraints
