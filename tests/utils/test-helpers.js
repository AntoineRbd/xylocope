/**
 * Test helper utilities
 * Common functions and utilities used across tests
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';

/**
 * Test helper functions
 */
export const testHelpers = {
    /**
   * Wait for an element to be removed from the DOM
   */
    waitForElementToBeRemoved: async (element, options = {}) => {
        const { timeout = 5000 } = options;

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Element was not removed within ${timeout}ms`));
            }, timeout);

            const observer = new MutationObserver(() => {
                if (!document.contains(element)) {
                    clearTimeout(timeoutId);
                    observer.disconnect();
                    resolve();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Check immediately in case element is already removed
            if (!document.contains(element)) {
                clearTimeout(timeoutId);
                observer.disconnect();
                resolve();
            }
        });
    },

    /**
   * Wait for CSS animation to complete
   */
    waitForAnimation: (element, animationName) => {
        return new Promise(resolve => {
            const onAnimationEnd = event => {
                if (event.animationName === animationName) {
                    element.removeEventListener('animationend', onAnimationEnd);
                    resolve();
                }
            };

            element.addEventListener('animationend', onAnimationEnd);

            // Fallback timeout
            setTimeout(resolve, 2000);
        });
    },

    /**
   * Wait for CSS transition to complete
   */
    waitForTransition: (element, property) => {
        return new Promise(resolve => {
            const onTransitionEnd = event => {
                if (!property || event.propertyName === property) {
                    element.removeEventListener('transitionend', onTransitionEnd);
                    resolve();
                }
            };

            element.addEventListener('transitionend', onTransitionEnd);

            // Fallback timeout
            setTimeout(resolve, 1000);
        });
    },

    /**
   * Simulate scroll event
   */
    simulateScroll: scrollY => {
        Object.defineProperty(window, 'scrollY', { value: scrollY, writable: true });
        Object.defineProperty(window, 'pageYOffset', { value: scrollY, writable: true });

        const scrollEvent = new Event('scroll');
        window.dispatchEvent(scrollEvent);
    },

    /**
   * Simulate window resize
   */
    simulateResize: (width, height) => {
        Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: height, writable: true });

        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
    },

    /**
   * Create a mock intersection observer entry
   */
    createIntersectionEntry: (target, isIntersecting = true, intersectionRatio = 1) => ({
        target,
        isIntersecting,
        intersectionRatio,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRect: isIntersecting ? target.getBoundingClientRect() : { top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 },
        rootBounds: { top: 0, left: 0, bottom: window.innerHeight, right: window.innerWidth, width: window.innerWidth, height: window.innerHeight },
        time: Date.now()
    }),

    /**
   * Trigger intersection observer callback
   */
    triggerIntersection: (mockObserver, entries) => {
        if (mockObserver.callback) {
            mockObserver.callback(entries);
        }
    },

    /**
   * Fill form with test data
   */
    fillForm: async (formData, user = null) => {
        if (!user) {
            user = userEvent.setup({ delay: null });
        }

        for (const [fieldName, value] of Object.entries(formData)) {
            const field = screen.getByName ? screen.getByName(fieldName) : document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                await user.clear(field);
                await user.type(field, value);
            }
        }
    },

    /**
   * Assert form validation errors
   */
    assertFormErrors: expectedErrors => {
        expectedErrors.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            expect(field).toHaveClass('error');

            const errorMessage = field.parentNode.querySelector('.field-error');
            expect(errorMessage).toBeTruthy();
        });
    },

    /**
   * Assert no form validation errors
   */
    assertNoFormErrors: fieldNames => {
        fieldNames.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            expect(field).not.toHaveClass('error');

            const errorMessage = field.parentNode.querySelector('.field-error');
            expect(errorMessage).toBeFalsy();
        });
    },

    /**
   * Wait for notification to appear
   */
    waitForNotification: async (type = null, timeout = 5000) => {
        const selector = type ? `.notification--${type}` : '.notification';

        return waitFor(() => {
            const notification = document.querySelector(selector);
            expect(notification).toBeTruthy();
            return notification;
        }, { timeout });
    },

    /**
   * Setup video mock
   */
    setupVideoMock: video => {
        video.play = jest.fn().mockResolvedValue();
        video.pause = jest.fn();
        video.load = jest.fn();

        Object.defineProperties(video, {
            paused: { value: false, writable: true },
            currentTime: { value: 0, writable: true },
            duration: { value: 120, writable: true },
            volume: { value: 1, writable: true },
            muted: { value: true, writable: true },
            readyState: { value: 4, writable: true } // HAVE_ENOUGH_DATA
        });

        return video;
    },

    /**
   * Create DOM structure from HTML string
   */
    createDOMFromHTML: htmlString => {
        const container = document.createElement('div');
        container.innerHTML = htmlString;
        return container;
    },

    /**
   * Setup viewport for mobile testing
   */
    setupMobileViewport: () => {
        Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 667, writable: true });

        // Trigger resize event
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
    },

    /**
   * Setup viewport for desktop testing
   */
    setupDesktopViewport: () => {
        Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });

        // Trigger resize event
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
    },

    /**
   * Mock localStorage with data
   */
    mockLocalStorage: (data = {}) => {
        const storage = { ...data };

        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: jest.fn(key => storage[key] || null),
                setItem: jest.fn((key, value) => {
                    storage[key] = value;
                }),
                removeItem: jest.fn(key => {
                    delete storage[key];
                }),
                clear: jest.fn(() => {
                    Object.keys(storage).forEach(key => delete storage[key]);
                }),
                length: Object.keys(storage).length,
                key: jest.fn(index => Object.keys(storage)[index] || null)
            },
            writable: true
        });

        return window.localStorage;
    },

    /**
   * Mock fetch with custom responses
   */
    mockFetch: (responses = {}) => {
        global.fetch = jest.fn((url, options) => {
            const method = options?.method || 'GET';
            const key = `${method} ${url}`;

            if (responses[key]) {
                return Promise.resolve(responses[key]);
            }

            // Default successful response
            return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true }),
                text: () => Promise.resolve('OK'),
                headers: {
                    get: () => 'application/json'
                }
            });
        });

        return global.fetch;
    },

    /**
   * Create performance observer mock
   */
    mockPerformanceObserver: () => {
        const mockObserver = {
            observe: jest.fn(),
            disconnect: jest.fn(),
            takeRecords: jest.fn(() => [])
        };

        global.PerformanceObserver = jest.fn(() => mockObserver);

        return mockObserver;
    },

    /**
   * Measure execution time
   */
    measureTime: async fn => {
        const start = performance.now();
        await fn();
        const end = performance.now();
        return end - start;
    },

    /**
   * Generate test ID
   */
    generateTestId: (prefix = 'test') => {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    },

    /**
   * Clean up DOM after test
   */
    cleanupDOM: () => {
        document.head.innerHTML = '';
        document.body.innerHTML = '';
        document.body.style.cssText = '';
        document.documentElement.style.cssText = '';

        // Remove any added event listeners
        const clone = document.cloneNode(true);
        document.replaceWith(clone);
    }
};

/**
 * Custom Jest matchers
 */
export const customMatchers = {
    toBeInViewport(received) {
        const rect = received.getBoundingClientRect();
        const isInViewport = (
            rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );

        return {
            message: () => `expected element ${isInViewport ? 'not ' : ''}to be in viewport`,
            pass: isInViewport
        };
    },

    toHaveValidationError(received, expectedMessage = null) {
        const hasError = received.classList.contains('error');
        const errorElement = received.parentNode.querySelector('.field-error');
        const hasErrorMessage = !!errorElement;
        const messageMatches = !expectedMessage || (errorElement && errorElement.textContent.includes(expectedMessage));

        const pass = hasError && hasErrorMessage && messageMatches;

        return {
            message: () => {
                if (!hasError) {
                    return 'expected element to have error class';
                }
                if (!hasErrorMessage) {
                    return 'expected element to have error message';
                }
                if (!messageMatches) {
                    return `expected error message to contain "${expectedMessage}"`;
                }
                return 'expected element not to have validation error';
            },
            pass
        };
    },

    toBeAnimating(received, animationName = null) {
        const computedStyle = window.getComputedStyle(received);
        const animations = computedStyle.animationName;
        const isAnimating = animations !== 'none';
        const specificAnimation = !animationName || animations.includes(animationName);

        const pass = isAnimating && specificAnimation;

        return {
            message: () => {
                if (!isAnimating) {
                    return 'expected element to be animating';
                }
                if (!specificAnimation) {
                    return `expected element to be animating with "${animationName}"`;
                }
                return 'expected element not to be animating';
            },
            pass
        };
    },

    toHaveTransition(received, property = null) {
        const computedStyle = window.getComputedStyle(received);
        const transition = computedStyle.transition;
        const hasTransition = transition !== 'none' && transition !== '';
        const specificProperty = !property || transition.includes(property);

        const pass = hasTransition && specificProperty;

        return {
            message: () => {
                if (!hasTransition) {
                    return 'expected element to have transition';
                }
                if (!specificProperty) {
                    return `expected element to have transition for "${property}"`;
                }
                return 'expected element not to have transition';
            },
            pass
        };
    }
};

// Export default object with all utilities
export default {
    ...testHelpers,
    customMatchers
};
