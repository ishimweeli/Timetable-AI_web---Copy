# Frontend Components

## Design System Foundation

### Atomic Design Approach
The UI is organized using the atomic design methodology:

#### Atoms
- Buttons (Primary, Secondary, Tertiary)
- Input Fields
- Checkboxes
- Radio Buttons
- Icons
- Tooltips

#### Molecules
- Form Groups
- Search Bars
- Dropdown Menus
- Date Pickers
- Toggle Switches

#### Organisms
- Navigation Bars
- Timetable Grids
- User Profile Cards
- Filter and Search Panels
- Modal Dialogs

### Typography
- **Headings**: Inter
    - Weight: 600 (Semi-bold) for headers
    - Sizes:
        - H1: 32px
        - H2: 24px
        - H3: 20px
        - H4: 18px
- **Body Text**: Roboto
    - Regular weight: 400
    - Medium weight: 500
    - Sizes:
        - Body Large: 16px
        - Body Medium: 14px
        - Body Small: 12px

### Color System
The application uses a dynamic color palette system:

#### Primary Colors
- Blue: #3B82F6 (Vibrant Blue)
- Green: #10B981 (Emerald Green)
- Purple: #8B5CF6 (Royal Purple)
- Red: #EF4444 (Coral Red)
- Orange: #F97316 (Bright Orange)
- Yellow: #FBBF24 (Golden Yellow)
- Pink: #EC4899 (Hot Pink)
- Teal: #14B8A6 (Turquoise)

#### Neutral Colors
- White: #FFFFFF
- Off-White: #F9FAFB (Alabaster)
- Light Gray: #F3F4F6 (Ghost White)
- Border Gray: #E5E7EB (Silver)
- Medium Gray: #9CA3AF (Pewter)
- Text Gray: #6B7280 (Slate)
- Dark Gray: #4B5563 (Charcoal)
- Near Black: #1F2937 (Ebony)

#### Status Colors
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Info: #3B82F6 (Blue)

## Key Components Documentation

### Form Components
- Form validation with real-time feedback
- Consistent 8px rounded corners
- 2px borders across all form elements
- Error states with #FF3B30 for borders and text

### Navigation Components
- Tab-based system with 4 main sections
- Context-sensitive secondary navigation
- Breadcrumb component for multi-step flows
- Responsive adaptation for different screen sizes

### Modal System
- Standardized header with title and close button
- Four sizes: small (400px), medium (600px), large (800px), and full screen
- Backdrop with 50% opacity and blur effect
- Focus trapping and keyboard navigation support

### Timetable Grid
- Week-based visualization
- Period tracking with customizable time slots
- Color-coded class, teacher, and room assignments
- Drag-and-drop scheduling interface

### Data Visualization Components
- Bar Charts for lesson distribution
- Line Charts for teacher workload
- Pie Charts for room utilization
- Scatter Plots for scheduling patterns
