## ./ai/api/endpoints.md

# AI Timetable System API Endpoints

## Authentication Endpoints

### Auth Module
- `POST /auth/login` - Email/password login
- `POST /auth/login/phone` - Phone number login
- `GET /auth/oauth/{provider}` - OAuth2 providers (Google, Facebook, Apple)
- `POST /auth/logout` - Log out current session
- `POST /auth/password/reset` - Request password reset
- `POST /auth/password/reset/confirm` - Confirm password reset
- `GET /auth/token/refresh` - Refresh JWT token
- `GET /auth/verify` - Verify current token

## Core Module Endpoints

### User Module
- `GET /users` - List users (admin/manager)
- `POST /users` - Create user (admin/manager)
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user profile
- `DELETE /users/{id}` - Delete user
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile

### Admin Module
- `GET /admin/organizations` - List all organizations
- `POST /admin/organizations` - Create new organization
- `GET /admin/organizations/{id}` - Get organization details
- `PUT /admin/organizations/{id}` - Update organization
- `DELETE /admin/organizations/{id}` - Delete organization
- `GET /admin/dashboard` - Get system usage stats
- `GET /admin/managers` - List all managers
- `POST /admin/managers` - Create new manager

### Role Module
- `GET /roles` - List available roles
- `POST /roles` - Create custom role (admin)
- `GET /roles/{id}` - Get role details
- `PUT /roles/{id}` - Update role permissions
- `DELETE /roles/{id}` - Delete custom role
- `GET /users/{id}/roles` - Get user's roles
- `POST /users/{id}/roles` - Assign role to user
- `DELETE /users/{id}/roles/{roleId}` - Remove role from user

## Manager, Teacher & Student Endpoints

### Manager Module
- `GET /managers/organizations/{orgId}/teachers` - List organization teachers
- `POST /managers/organizations/{orgId}/teachers` - Create teacher
- `GET /managers/organizations/{orgId}/students` - List organization students
- `POST /managers/organizations/{orgId}/students` - Create student
- `GET /managers/organizations/{orgId}/editors` - List organization editors
- `POST /managers/organizations/{orgId}/editors` - Create editor

### Teacher Module
- `GET /teachers` - List teachers
- `POST /teachers` - Create teacher
- `GET /teachers/{id}` - Get teacher profile
- `PUT /teachers/{id}` - Update teacher profile
- `DELETE /teachers/{id}` - Delete teacher
- `GET /teachers/initials/{initial}` - Get teacher by initials
- `GET /teachers/{id}/schedule` - Get teacher's schedule
- `PUT /teachers/{id}/preferences` - Update teacher preferences

### Student Module
- `GET /students` - List students
- `POST /students` - Create student
- `GET /students/{id}` - Get student profile
- `PUT /students/{id}` - Update student profile
- `DELETE /students/{id}` - Delete student
- `GET /students/{id}/classes` - Get student's classes
- `GET /students/{id}/timetable` - Get student's timetable

## Timetable and Resource Endpoints

### Subject Module
- `GET /subjects` - List subjects
- `POST /subjects` - Create subject
- `GET /subjects/{id}` - Get subject details
- `PUT /subjects/{id}` - Update subject
- `DELETE /subjects/{id}` - Delete subject

### Class Module
- `GET /classes` - List classes
- `POST /classes` - Create class
- `GET /classes/{id}` - Get class details
- `PUT /classes/{id}` - Update class
- `DELETE /classes/{id}` - Delete class
- `GET /classes/{id}/schedule` - Get class schedule

### Room Module
- `GET /rooms` - List rooms
- `POST /rooms` - Create room
- `GET /rooms/{id}` - Get room details
- `PUT /rooms/{id}` - Update room
- `DELETE /rooms/{id}` - Delete room
- `GET /rooms/{id}/availability` - Get room availability

### Timetable Module
- `GET /timetables` - List timetables
- `POST /timetables` - Generate new timetable
- `GET /timetables/{id}` - Get timetable details
- `PUT /timetables/{id}` - Update timetable
- `DELETE /timetables/{id}` - Delete timetable
- `POST /timetables/{id}/optimize` - Optimize existing timetable
- `GET /timetables/{id}/export` - Export timetable to CSV
