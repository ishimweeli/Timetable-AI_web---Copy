# Class Module

## Overview
The Class Module manages class definitions, scheduling parameters, and relationships with teachers, rooms, and subjects.

## Key Features
- Class definition and configuration
- Scheduling constraints per class
- Teacher assignments
- Weekly scheduling preferences

## Class Definition Fields
- **Initials**: Class identifier (e.g., "C1")
- **Color**: Visual identifier for the class
- **Name**: Full class name (e.g., "Classroom 1")
- **Control Number**: Class attendance frequency per week
- **Comment**: Additional information about the class
- **Min. Lessons per Day**: Minimum lessons required daily
- **Max. Lessons per Day**: Maximum lessons allowed daily
- **Latest Start Position**: Latest allowed start time
- **Earliest End**: Earliest allowed end time
- **Max Free Periods**: Maximum allowed free periods between lessons
- **Present Every Day**: Indicates if class is scheduled daily
- **Main Teacher**: Primary teacher assigned to the class
- **Max. Loc. Chg. per Day**: Maximum location changes per day (disabled in this module)

## Weekly Schedule Table
The class module includes a weekly schedule editor with blocking and attractor features:
- **Red circle**: Blocks teaching on selected days
- **Blue circle**: Indicates teaching preference on selected days
- **Red tick**: Requires assignment on the selected day
- **Blue tick**: Indicates assignment preference on the selected day

## API Endpoints
The Class Module provides RESTful endpoints for managing classes:
- Class creation and configuration
- Class scheduling preferences
- Class-teacher relationships
- Class schedules and timetables
