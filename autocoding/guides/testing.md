
# Testing Strategy & Quality Assurance

## Testing Overview

The AI Timetable system employs a comprehensive testing strategy based on the testing pyramid approach, with more unit tests at the bottom (fast, cheap) and fewer, but more complex, tests like E2E tests at the top (slow, expensive).

## Testing Layers

### Unit Tests

**Purpose:** Test individual functions, methods, or logic in isolation.

**Tools:** Jest (JavaScript testing framework)

**Location:** `tests/unit/`

**Coverage target:** 80% or higher

**Example:**

```javascript
// Sample unit test for teacher availability function
describe('Teacher Availability', () => {
  test('should return true when teacher has no constraints', () => {
    const teacher = { id: 1, constraints: [] };
    const timeSlot = { day: 1, period: 2 };
    
    expect(isTeacherAvailable(teacher, timeSlot)).toBe(true);
  });
  
  test('should return false when teacher has blocking constraint', () => {
    const teacher = {
      id: 1,
      constraints: [{ day: 1, period: 2, type: 'red_blocking' }]
    };
    const timeSlot = { day: 1, period: 2 };
    
    expect(isTeacherAvailable(teacher, timeSlot)).toBe(false);
  });
});
```

### Component Tests

**Purpose:** Test React components to ensure they behave as expected in a browser-like environment.

**Tools:** React Testing Library, Jest

**Location:** `tests/components/`

**Coverage target:** 70% or higher

**Example:**

```javascript
// Sample component test for TeacherForm
import { render, screen, fireEvent } from '@testing-library/react';
import TeacherForm from '../../components/TeacherForm';

describe('TeacherForm', () => {
  test('renders form with all required fields', () => {
    render(<TeacherForm />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/initials/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum lessons/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/maximum lessons/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });
  
  test('validates required fields', async () => {
    render(<TeacherForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/initials are required/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

**Purpose:** Test how multiple units (or components) interact with each other and with external dependencies (e.g., API).

**Tools:** Jest, Supertest (for API testing)

**Location:** `tests/integration/`

**Coverage target:** 60% or higher

**Example:**

```javascript
// Sample integration test for teacher API endpoints
import request from 'supertest';
import app from '../../src/app';
import { generateAuthToken } from '../../src/utils/auth';

describe('Teacher API', () => {
  let authToken;
  
  beforeAll(() => {
    authToken = generateAuthToken({ id: 1, role: 'admin' });
  });
  
  test('GET /api/v1/teachers returns list of teachers', async () => {
    const response = await request(app)
      .get('/api/v1/teachers')
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  test('POST /api/v1/teachers creates a new teacher', async () => {
    const newTeacher = {
      fullName: 'John Doe',
      initials: 'JD',
      minLessonsPerDay: 2,
      maxLessonsPerDay: 6
    };
    
    const response = await request(app)
      .post('/api/v1/teachers')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newTeacher);
    
    expect(response.status).toBe(201);
    expect(response.body.data.fullName).toBe(newTeacher.fullName);
  });
});
```

### End-to-End Tests

**Purpose:** Test the entire application workflow from a user's perspective.

**Tools:** Cypress, Playwright

**Location:** `tests/e2e/`

**Coverage target:** Critical user paths covered

**Example:**

```javascript
// Sample E2E test for teacher creation
describe('Teacher Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password');
    cy.visit('/teachers');
  });
  
  it('should allow admin to create a new teacher', () => {
    cy.get('[data-testid="add-teacher-button"]').click();
    
    cy.get('[data-testid="teacher-name-input"]').type('Jane Smith');
    cy.get('[data-testid="teacher-initials-input"]').type('JS');
    cy.get('[data-testid="min-lessons-input"]').type('2');
    cy.get('[data-testid="max-lessons-input"]').type('6');
    cy.get('[data-testid="present-every-day-checkbox"]').check();
    
    cy.get('[data-testid="save-teacher-button"]').click();
    
    cy.contains('Teacher created successfully').should('be.visible');
    cy.contains('Jane Smith').should('be.visible');
    cy.contains('JS').should('be.visible');
  });
});
```

## Testing Specific Features

### AI Scheduling Algorithm Testing

The timetable generation algorithm requires specialized testing:

1. **Unit Tests** for individual constraint calculations
2. **Property Tests** to ensure the algorithm respects all defined constraints
3. **Benchmark Tests** to evaluate performance with large datasets
4. **Regression Tests** with known sample data to prevent regression

Example property test:

```javascript
// Property test for timetable generation
describe('Timetable Generation', () => {
  test('generated timetable should respect teacher constraints', () => {
    // Test with 100 random configurations
    for (let i = 0; i < 100; i++) {
      const teachers = generateRandomTeachers(5);
      const classes = generateRandomClasses(3);
      const subjects = generateRandomSubjects(10);
      const rooms = generateRandomRooms(8);
      
      const timetable = generateTimetable(teachers, classes, subjects, rooms);
      
      // Verify no teacher constraints are violated
      teachers.forEach(teacher => {
        teacher.constraints.forEach(constraint => {
          if (constraint.type === 'red_blocking') {
            // Should not have any assignments during blocked periods
            const assignments = timetable.entries.filter(entry => 
              entry.teacherId === teacher.id && 
              entry.day === constraint.day && 
              entry.period === constraint.period
            );
            expect(assignments.length).toBe(0);
          }
        });
      });
    }
  });
});
```

### Security Testing

**Authentication & Authorization:**

```javascript
// Test for proper authorization
describe('Authorization', () => {
  test('non-admin users cannot access admin endpoints', async () => {
    const teacherToken = generateAuthToken({ id: 2, role: 'teacher' });
    
    const response = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${teacherToken}`);
    
    expect(response.status).toBe(403);
  });
});
```

## Visual Regression Testing

**Purpose:** Ensure that the UI hasn't unintentionally changed (i.e., visual bugs).

**Tools:** Storybook, Percy, Chromatic

**Example:**

```javascript
// Example visual regression test setup with Percy
describe('Timetable Grid', () => {
  it('renders correctly with sample data', () => {
    cy.visit('/storybook/timetable-grid');
    cy.get('.timetable-grid').should('be.visible');
    cy.percySnapshot('Timetable Grid - Default View');
  });
  
  it('displays correctly when a cell is selected', () => {
    cy.visit('/storybook/timetable-grid');
    cy.get('.timetable-cell').first().click();
    cy.percySnapshot('Timetable Grid - Selected Cell');
  });
});
```

## Performance Testing

**Load Testing:** Using k6 to simulate user load:

```javascript
// Example k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '1m',
};

export default function() {
  const res = http.get('https://api.aitimetable.com/v1/timetables/1');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time is less than 500ms': (r) => r.timings.duration < 500,
  });
  
  sleep(1);
}
```

## Running Tests

### Running Unit and Component Tests

```bash
# Run all unit tests
npm run test:unit

# Run all component tests
npm run test:components

# Run specific test file
npm run test -- path/to/test-file.test.js

# Run tests with coverage
npm run test:coverage
```

### Running E2E Tests

```bash
# Run E2E tests in headless mode
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:open

# Run specific E2E test
npm run test:e2e -- --spec cypress/integration/teacher_management.spec.js
```

### Running API Tests

```bash
# Run API tests
npm run test:api
```

## Continuous Integration

Tests are automatically run in the CI/CD pipeline on GitHub Actions:

1. **Pull Request Checks:** Unit, component, and integration tests
2. **Merge to Staging:** E2E tests and visual regression tests
3. **Production Deployment:** Performance and load testing

### CI Configuration

```yaml
# Excerpt from .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16.x'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run unit tests
        run: npm run test:unit
      - name: Run component tests
        run: npm run test:components
      - name: Run integration tests
        run: npm run test:integration
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Testing Best Practices

1. **Write Tests First:** Follow test-driven development (TDD) principles where possible
2. **Isolate Tests:** Each test should be independent and not rely on others
3. **Use Realistic Data:** Test with realistic data samples, not just simple examples
4. **Mock External Services:** Use mock services for external APIs and databases
5. **Focus on User Behavior:** Tests should reflect how users interact with the system
6. **Maintain Test Data:** Keep test fixtures and factories up to date
7. **Run Tests Often:** Run tests locally before pushing code
8. **Monitor Test Quality:** Review test coverage and refactor tests regularly

## Test Data Management

### Factories and Fixtures

```javascript
// Example of a test factory for teacher data
const teacherFactory = (overrides = {}) => ({
  id: Math.floor(Math.random() * 10000),
  fullName: 'Test Teacher',
  initials: 'TT',
  minLessonsPerDay: 2,
  maxLessonsPerDay: 6,
  maxFreePeriods: 3,
  presentEveryDay: true,
  constraints: [],
  ...overrides
});

// Usage
const teacher = teacherFactory({ fullName: 'Custom Name' });
```

## Test Documentation

All tests should include clear documentation:

1. **Describe Block:** Clearly state what component or functionality is being tested
2. **Test Descriptions:** Use clear language about what is being tested
3. **Comments:** Add comments for complex test logic
4. **Arrange-Act-Assert:** Structure tests in this pattern for clarity

## Debugging Tests

### Common Issues and Solutions

1. **Flaky Tests:** Tests that sometimes pass and sometimes fail
    - Solution: Identify race conditions, improve assertions, add proper waits

2. **Slow Tests:** Tests that take too long to run
    - Solution: Use more mocking, focus on unit tests, optimize E2E test scenarios

3. **Failing CI but Passing Locally:**
    - Solution: Ensure environment variables are properly set in CI, check for environment-specific issues
```
