# Xylocope Website Test Suite

This document provides comprehensive information about the test suite for the Xylocope website, including setup, execution, and maintenance guidelines.

## Table of Contents

- [Overview](#overview)
- [Test Architecture](#test-architecture)
- [Setup and Installation](#setup-and-installation)
- [Running Tests](#running-tests)
- [Test Types](#test-types)
- [Coverage Requirements](#coverage-requirements)
- [CI/CD Pipeline](#cicd-pipeline)
- [Writing Tests](#writing-tests)
- [Troubleshooting](#troubleshooting)

## Overview

The Xylocope website test suite follows the testing pyramid approach with:
- **Many unit tests** - Fast, isolated tests for individual functions and components
- **Fewer integration tests** - Tests for component interactions and DOM manipulation
- **Minimal E2E tests** - Tests for critical user flows and business scenarios

### Test Stack

- **Unit & Integration Tests**: Jest with jsdom
- **E2E Tests**: Playwright
- **Test Utilities**: Testing Library DOM, User Event
- **Coverage**: Istanbul/NYC
- **CI/CD**: GitHub Actions

## Test Architecture

```
tests/
├── unit/                 # Unit tests for individual functions
│   ├── utils.test.js     # Tests for utility functions
│   └── main.test.js      # Tests for XylocopeModern class
├── integration/          # Integration tests for DOM interactions
│   └── dom-integration.test.js
├── e2e/                  # End-to-end tests
│   ├── navigation.e2e.test.js
│   ├── contact-form.e2e.test.js
│   └── visual-elements.e2e.test.js
├── fixtures/             # Test data and DOM fixtures
│   └── dom-fixtures.js
├── utils/                # Test utilities and helpers
│   └── test-helpers.js
├── setup.js              # Jest setup configuration
└── README.md            # This file
```

## Setup and Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

```bash
# Install all dependencies including test dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### Configuration Files

- `jest.config.js` - Jest configuration for unit and integration tests
- `playwright.config.js` - Playwright configuration for E2E tests
- `babel.config.js` - Babel configuration for Jest
- `tests/setup.js` - Global test setup and mocks

## Running Tests

### All Tests

```bash
# Run all test types (lint, validate, unit, integration)
npm test

# Run all tests including E2E
npm run test:all
```

### Specific Test Types

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests only
npm run test:e2e

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Individual Test Files

```bash
# Run specific test file
npx jest tests/unit/utils.test.js

# Run specific E2E test
npx playwright test tests/e2e/navigation.e2e.test.js

# Run tests matching pattern
npx jest --testNamePattern="validation"
```

## Test Types

### Unit Tests

**Location**: `tests/unit/`
**Purpose**: Test individual functions and methods in isolation

#### utils.test.js
Tests all utility functions from `js/utils.js`:
- DOM utilities (`$`, `$$`, `ready`)
- Function utilities (`debounce`, `throttle`)
- Validation utilities (`validators.*`)
- Storage utilities (`storage.*`)
- API utilities (`api.*`)
- UI utilities (`showNotification`, `setLoadingState`)

#### main.test.js
Tests the XylocopeModern class from `js/main.js`:
- Constructor and initialization
- Navigation functionality
- Mobile menu interactions
- Form validation and submission
- Video gallery setup
- Scroll animations
- User preferences handling

### Integration Tests

**Location**: `tests/integration/`
**Purpose**: Test component interactions and DOM manipulations

#### dom-integration.test.js
Tests how components work together:
- Navigation between sections
- Mobile menu interactions with DOM
- Form validation with real DOM elements
- Video gallery with actual video elements
- Animation triggers with Intersection Observer
- Responsive behavior across viewports

### E2E Tests

**Location**: `tests/e2e/`
**Purpose**: Test complete user flows in real browser environment

#### navigation.e2e.test.js
- Desktop and mobile navigation
- Smooth scrolling between sections
- Active state management
- Keyboard accessibility
- Responsive navigation switching

#### contact-form.e2e.test.js
- Form field interactions
- Real-time validation
- Form submission flow
- Loading states and notifications
- Mobile form experience
- Accessibility compliance

#### visual-elements.e2e.test.js
- Video gallery functionality
- Portfolio filtering
- Scroll-triggered animations
- Custom cursor behavior
- Dark mode support
- Performance optimization

## Coverage Requirements

### Minimum Coverage Thresholds

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './js/utils.js': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

### Coverage Reports

- **HTML Report**: `coverage/lcov-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **JSON Report**: `coverage/coverage-final.json`

## CI/CD Pipeline

### GitHub Actions Workflow

The CI pipeline (`.github/workflows/test.yml`) includes:

1. **Lint and Validate**
   - ESLint code quality checks
   - HTML validation
   - Code formatting verification

2. **Unit Tests**
   - Fast unit test execution
   - Coverage collection

3. **Integration Tests**
   - DOM integration testing
   - Component interaction validation

4. **E2E Tests**
   - Cross-browser testing
   - Critical user flow validation
   - Visual regression testing

5. **Coverage Reporting**
   - Coverage threshold enforcement
   - Codecov integration
   - PR coverage comments

6. **Performance Testing**
   - Lighthouse CI performance audits
   - Core Web Vitals monitoring

7. **Security Scanning**
   - Dependency vulnerability checks
   - Security audit reports

### Pipeline Triggers

- **Push to main/develop**: Full test suite
- **Pull requests**: Full test suite + performance tests
- **Scheduled**: Weekly security scans

## Writing Tests

### Test Structure

Follow the **Arrange-Act-Assert** pattern:

```javascript
test('should validate email format', () => {
  // Arrange
  const email = 'invalid-email';
  
  // Act
  const result = validators.email(email);
  
  // Assert
  expect(result).toBe(false);
});
```

### Best Practices

#### Unit Tests
- Test behavior, not implementation
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error conditions
- Keep tests fast and isolated

#### Integration Tests
- Focus on component interactions
- Use real DOM elements
- Test user interactions
- Verify visual feedback
- Test responsive behavior

#### E2E Tests
- Test critical user journeys
- Use stable selectors
- Handle async operations properly
- Test across different browsers/devices
- Keep tests deterministic

### Common Patterns

#### Testing Form Validation
```javascript
test('should show validation error for empty required field', async () => {
  const field = document.querySelector('input[name="email"]');
  
  // Trigger validation
  fireEvent.focus(field);
  fireEvent.blur(field);
  
  // Assert error state
  expect(field).toHaveClass('error');
  expect(field.parentNode.querySelector('.field-error')).toBeTruthy();
});
```

#### Testing Async Operations
```javascript
test('should handle form submission', async () => {
  const form = document.getElementById('contactForm');
  const submitButton = form.querySelector('.submit-button');
  
  // Fill form with valid data
  await testHelpers.fillForm({
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Test message'
  });
  
  // Submit form
  fireEvent.click(submitButton);
  
  // Wait for async operation
  await waitFor(() => {
    expect(submitButton).toBeDisabled();
  });
  
  // Wait for completion
  await waitFor(() => {
    expect(submitButton).toBeEnabled();
  }, { timeout: 5000 });
});
```

#### Testing Animations
```javascript
test('should animate element on scroll', async () => {
  const element = document.querySelector('.service-card');
  
  // Setup intersection observer mock
  const mockObserver = testHelpers.createMockIntersectionObserver();
  
  // Trigger intersection
  const entry = testHelpers.createIntersectionEntry(element, true);
  testHelpers.triggerIntersection(mockObserver, [entry]);
  
  // Verify animation
  expect(element.style.opacity).toBe('1');
  expect(element.style.transform).toBe('translateY(0)');
});
```

### Custom Matchers

Use custom matchers for better test readability:

```javascript
// Check if element is in viewport
expect(element).toBeInViewport();

// Check form validation state
expect(field).toHaveValidationError('Email is required');

// Check animations
expect(element).toBeAnimating('fadeInUp');
expect(element).toHaveTransition('opacity');
```

## Troubleshooting

### Common Issues

#### Jest Tests Failing

**DOM Not Available**
```bash
# Ensure jsdom environment is configured
# In jest.config.js:
testEnvironment: 'jsdom'
```

**Module Import Errors**
```bash
# Check babel configuration in babel.config.js
# Ensure ES6 imports are transformed for Node.js
```

#### Playwright Tests Failing

**Browser Not Installed**
```bash
npx playwright install
```

**Server Not Starting**
```bash
# Check if port 3000 is available
# Ensure server starts correctly with npm run start
```

**Flaky Tests**
```javascript
// Add proper waits for dynamic content
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible();
```

#### Coverage Issues

**Low Coverage**
```bash
# Identify uncovered code
npm run test:coverage
# Open coverage/lcov-report/index.html
```

**False Positives**
```javascript
// Exclude test utilities and mocks from coverage
// In jest.config.js collectCoverageFrom
```

### Debug Mode

#### Jest Debug
```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand --no-coverage
```

#### Playwright Debug
```bash
# Run tests with browser visible
npx playwright test --headed --debug
```

### Performance Issues

#### Slow Unit Tests
- Reduce DOM manipulation in unit tests
- Mock heavy dependencies
- Use `--maxWorkers` flag to limit parallelization

#### Slow E2E Tests
- Use `page.waitForLoadState('networkidle')` appropriately
- Optimize test data setup
- Run tests in parallel where possible

### Updating Tests

When updating the application:

1. **Update test fixtures** if DOM structure changes
2. **Update selectors** if CSS classes change
3. **Update expected behavior** if functionality changes
4. **Add new tests** for new features
5. **Remove obsolete tests** for removed features

### Getting Help

1. Check test output and error messages
2. Review this documentation
3. Check existing test examples
4. Search for similar issues in the project
5. Ask team members for assistance

## Maintenance

### Regular Tasks

- **Weekly**: Review test coverage reports
- **Monthly**: Update test dependencies
- **Quarterly**: Review and refactor test suite
- **Per release**: Update E2E test scenarios

### Test Health Metrics

Monitor these metrics:
- Test execution time
- Test failure rate
- Coverage trends
- Flaky test frequency

### Dependencies Updates

```bash
# Update test dependencies
npm update @playwright/test jest @testing-library/dom

# Update security patches
npm audit fix
```

---

For questions or issues with the test suite, please refer to the project documentation or contact the development team.