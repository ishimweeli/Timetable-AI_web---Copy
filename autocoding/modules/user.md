# User Module

## Overview
The User Module manages basic user profiles and stores essential user details, roles, and permissions across the system.

## Key Features
- Central user profile management
- Base information for all user types
- Role assignment interface
- Profile settings and preferences

## API Endpoints
- `GET /users` - List users (admin/manager)
- `POST /users` - Create user (admin/manager)
- `GET /users/{id}` - Get user profile
- `PUT /users/{id}` - Update user profile
- `DELETE /users/{id}` - Delete user
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile

## Data Model
- User profile information:
    - Basic identification (name, email, phone)
    - Authentication details
    - Role assignments
    - Organization affiliations
    - Profile settings and preferences

## Integration Points
- Auth Module: Authentication and authorization
- Role Module: Role-based permissions
- Admin/Manager Modules: User creation and management
- Notification Module: User communication preferences
