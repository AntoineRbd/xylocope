/**
 * Jest test setup file for Xylocope website
 * Configures the test environment with necessary polyfills and global utilities
 */

import '@testing-library/jest-dom';

// Mock browser APIs that are not available in jsdom
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 0);
});

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Mock matchMedia
global.matchMedia = jest.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    headers: {
      get: jest.fn(() => 'application/json'),
    },
  })
);

// Mock console methods for testing
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Mock console methods
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
  
  // Reset document
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  document.body.style.overflow = '';
  
  // Clear any existing timers
  jest.clearAllTimers();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Custom matchers
expect.extend({
  toBeInViewport(received) {
    const rect = received.getBoundingClientRect();
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
    
    return {
      message: () => `expected element ${isInViewport ? 'not ' : ''}to be in viewport`,
      pass: isInViewport,
    };
  },
  
  toHaveValidationError(received) {
    const hasError = received.classList.contains('error');
    const hasErrorMessage = received.parentNode.querySelector('.field-error');
    
    return {
      message: () => `expected element ${hasError ? 'not ' : ''}to have validation error`,
      pass: hasError && hasErrorMessage,
    };
  },
});

// Global test utilities
global.testUtils = {
  // Create a mock DOM element
  createMockElement: (tagName = 'div', attributes = {}) => {
    const element = document.createElement(tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    return element;
  },
  
  // Wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Wait for animation frame
  waitForFrame: () => new Promise(resolve => requestAnimationFrame(resolve)),
  
  // Create mock event
  createMockEvent: (type, properties = {}) => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, properties);
    return event;
  },
  
  // Mock video element
  createMockVideo: () => {
    const video = document.createElement('video');
    video.play = jest.fn().mockResolvedValue();
    video.pause = jest.fn();
    video.load = jest.fn();
    Object.defineProperty(video, 'paused', {
      value: false,
      writable: true,
    });
    return video;
  },
  
  // Mock intersection observer entry
  createMockIntersectionEntry: (target, isIntersecting = true) => ({
    target,
    isIntersecting,
    boundingClientRect: target.getBoundingClientRect(),
    intersectionRatio: isIntersecting ? 1 : 0,
    intersectionRect: isIntersecting ? target.getBoundingClientRect() : { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 },
    rootBounds: { top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth, width: window.innerWidth, height: window.innerHeight },
    time: Date.now(),
  }),
};