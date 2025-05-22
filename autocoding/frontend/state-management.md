# State Management & Data Flow

## State Management Architecture

### Core State Slices
The application's state is organized into modular slices:
- **user** - Authentication state and preferences
- **calendar** - View settings and selected dates
- **appointments** - Appointment data and filters
- **ui** - Interface state like open modals and panels
- **timetable** - Scheduling data and constraints
- **settings** - System configuration and parameters

### Data Flow Pattern
The application follows a unidirectional data flow pattern:
1. User interaction generates actions
2. Actions are dispatched to state management
3. State is updated based on action
4. UI components re-render based on new state
5. Side effects (API calls, etc.) are triggered

## API Integration

### React Query Implementation
The application uses React Query for data fetching and caching:

```jsx
// Example React Query implementation
const { data, isLoading, error } = useQuery(
  ['teachers', organizationId],
  () => fetchTeachers(organizationId),
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    onError: (error) => {
      // Error handling
    }
  }
);
