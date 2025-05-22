# Teacher Module

## Overview
The Teacher Module handles teacher profile management, linking teachers to subjects and classes, and managing complex scheduling constraints and preferences.

## Key Features
- Comprehensive teacher profiles
- Advanced scheduling constraints
- Preference management
- Workload balancing

## Teacher Profile Fields
- **Initials**: Auto-generated from first/last name
- **Full Name**: Teacher's complete name
- **Control Number**: Maximum hours per day
- **Minimum Lessons Per Day**: Minimum required lessons daily
- **Maximum Lessons Per Day**: Maximum allowed lessons daily
- **Maximum Free Periods**: Maximum allowed free periods
- **Minimum Adjacent Free Periods**: Minimum consecutive free periods required
- **Maximum Adjacent Free Periods**: Maximum consecutive free periods allowed
- **Include Classless Bindings**: Allow unassigned periods if checked
- **Present Every Day**: Available every weekday if checked

## Restriction & Preference System
The teacher module includes a sophisticated schedule editor with four symbol types:
- **Red Blocking**: Teacher cannot teach in this period
- **Blue Blocking**: Teacher must teach in this period
- **Blue Tractor**: Teacher prefers to teach in this period
- **Red Tractor**: Teacher does not prefer but can teach in this period

## API Endpoints
- `GET /teachers` - List teachers
- `POST /teachers` - Create teacher
- `GET /teachers/{id}` - Get teacher profile
- `PUT /teachers/{id}` - Update teacher profile
- `DELETE /teachers/{id}` - Delete teacher
- `GET /teachers/initials/{initial}` - Get teacher by initials
- `GET /teachers/{id}/schedule` - Get teacher's schedule
- `PUT /teachers/{id}/preferences` - Update teacher preferences
