# Room Module

## Overview
The Room Module stores details of physical or virtual rooms used for classes and ensures timetable constraints for room availability are respected during scheduling.

## Key Features
- Room definition and management
- Resource tracking
- Location grouping
- Availability scheduling

## Room Features
- **Initials Field**: Abbreviation for the room name
- **Name Field**: Full name of the room
- **Control Number**: Room capacity or available resources
- **Group Consisting Of**: Groups rooms together for scheduling
- **Location Selection**: Specifies the room's location
- **Priority Selection**:
    - **High Priority**: Ensures preferred allocation
    - **Low Priority**: Assigns only when high-priority rooms are occupied
- **Restrictions and Preferences**:
    - **Red Button**: Blocks room allocation in selected time slots
    - **Red Tick**: Marks periods as not preferred
- **Periods**: Supports scheduling from Period 1 to 8

## API Endpoints
The Room Module provides RESTful endpoints for managing rooms:
- Room creation and configuration
- Room availability settings
- Room assignment to classes
- Room utilization reporting

## Integration Points
- Class Module: Room assignments to classes
- Teacher Module: Teacher room preferences
- Timetable Module: Room availability constraints
