/**
 * Unit tests for utils.js
 * Tests all utility functions including DOM utilities, debounce/throttle,
 * validation, storage, and API utilities
 */

import { JSDOM } from 'jsdom';

// Set up DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Load the utils module
require('../../js/utils.js');

const {
    $,
    $$,
    ready,
    debounce,
    throttle,
    scrollToElement,
    getOffset,
    isInViewport,
    observeElements,
    validators,
    setLoadingState,
    showNotification,
    storage,
    api
} = window.Utils;

describe('DOM Utilities', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    describe('$ (querySelector)', () => {
        test('should return first matching element', () => {
            document.body.innerHTML = `
        <div class="test">First</div>
        <div class="test">Second</div>
      `;

            const element = $('.test');
            expect(element).toBeInstanceOf(Element);
            expect(element.textContent).toBe('First');
        });

        test('should return null for non-existent selector', () => {
            const element = $('.non-existent');
            expect(element).toBeNull();
        });
    });

    describe('$$ (querySelectorAll)', () => {
        test('should return all matching elements', () => {
            document.body.innerHTML = `
        <div class="test">First</div>
        <div class="test">Second</div>
        <span class="test">Third</span>
      `;

            const elements = $$('.test');
            expect(elements).toHaveLength(3);
            expect(elements[0].textContent).toBe('First');
            expect(elements[1].textContent).toBe('Second');
            expect(elements[2].textContent).toBe('Third');
        });

        test('should return empty NodeList for non-existent selector', () => {
            const elements = $$('.non-existent');
            expect(elements).toHaveLength(0);
        });
    });

    describe('ready', () => {
        test('should call callback immediately if DOM is ready', () => {
            const callback = jest.fn();
            Object.defineProperty(document, 'readyState', {
                value: 'complete',
                writable: true
            });

            ready(callback);
            expect(callback).toHaveBeenCalled();
        });

        test('should wait for DOMContentLoaded if DOM is loading', () => {
            const callback = jest.fn();
            Object.defineProperty(document, 'readyState', {
                value: 'loading',
                writable: true
            });

            ready(callback);
            expect(callback).not.toHaveBeenCalled();

            // Simulate DOMContentLoaded
            const event = new Event('DOMContentLoaded');
            document.dispatchEvent(event);
            expect(callback).toHaveBeenCalled();
        });
    });
});

describe('Function Utilities', () => {
    describe('debounce', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should delay function execution', () => {
            const func = jest.fn();
            const debouncedFunc = debounce(func, 100);

            debouncedFunc('arg1');
            expect(func).not.toHaveBeenCalled();

            jest.advanceTimersByTime(100);
            expect(func).toHaveBeenCalledWith('arg1');
        });

        test('should cancel previous calls', () => {
            const func = jest.fn();
            const debouncedFunc = debounce(func, 100);

            debouncedFunc('arg1');
            debouncedFunc('arg2');
            debouncedFunc('arg3');

            jest.advanceTimersByTime(100);
            expect(func).toHaveBeenCalledTimes(1);
            expect(func).toHaveBeenCalledWith('arg3');
        });

        test('should execute immediately when immediate is true', () => {
            const func = jest.fn();
            const debouncedFunc = debounce(func, 100, true);

            debouncedFunc('arg1');
            expect(func).toHaveBeenCalledWith('arg1');

            debouncedFunc('arg2');
            expect(func).toHaveBeenCalledTimes(1); // Should not call again
        });
    });

    describe('throttle', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test('should limit function execution rate', () => {
            const func = jest.fn();
            const throttledFunc = throttle(func, 100);

            throttledFunc('arg1');
            expect(func).toHaveBeenCalledWith('arg1');

            throttledFunc('arg2');
            expect(func).toHaveBeenCalledTimes(1); // Should not call again immediately

            jest.advanceTimersByTime(100);
            throttledFunc('arg3');
            expect(func).toHaveBeenCalledTimes(2);
            expect(func).toHaveBeenLastCalledWith('arg3');
        });
    });
});

describe('DOM Manipulation Utilities', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        // Mock window.scrollTo
        window.scrollTo = jest.fn();
    });

    describe('scrollToElement', () => {
        test('should scroll to element with default offset', () => {
            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.top = '500px';
            Object.defineProperty(element, 'offsetTop', { value: 500 });
            document.body.appendChild(element);

            scrollToElement(element);
            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 500,
                behavior: 'smooth'
            });
        });

        test('should scroll to element with custom offset', () => {
            const element = document.createElement('div');
            Object.defineProperty(element, 'offsetTop', { value: 500 });
            document.body.appendChild(element);

            scrollToElement(element, 100);
            expect(window.scrollTo).toHaveBeenCalledWith({
                top: 400,
                behavior: 'smooth'
            });
        });
    });

    describe('getOffset', () => {
        test('should calculate element offset from top', () => {
            const parent = document.createElement('div');
            const child = document.createElement('div');

            Object.defineProperty(parent, 'offsetTop', { value: 100 });
            Object.defineProperty(parent, 'offsetParent', { value: null });
            Object.defineProperty(child, 'offsetTop', { value: 50 });
            Object.defineProperty(child, 'offsetParent', { value: parent });

            parent.appendChild(child);
            document.body.appendChild(parent);

            const offset = getOffset(child);
            expect(offset).toBe(150); // 100 + 50
        });
    });

    describe('isInViewport', () => {
        test('should return true for element in viewport', () => {
            const element = document.createElement('div');
            element.getBoundingClientRect = jest.fn(() => ({
                top: 100,
                left: 100,
                bottom: 200,
                right: 200
            }));

            Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
            Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });

            expect(isInViewport(element)).toBe(true);
        });

        test('should return false for element outside viewport', () => {
            const element = document.createElement('div');
            element.getBoundingClientRect = jest.fn(() => ({
                top: -100,
                left: 100,
                bottom: -50,
                right: 200
            }));

            Object.defineProperty(window, 'innerHeight', { value: 600, writable: true });
            Object.defineProperty(window, 'innerWidth', { value: 800, writable: true });

            expect(isInViewport(element)).toBe(false);
        });
    });

    describe('observeElements', () => {
        test('should create IntersectionObserver and observe elements', () => {
            const elements = [
                document.createElement('div'),
                document.createElement('div')
            ];
            const callback = jest.fn();

            const mockObserver = {
                observe: jest.fn(),
                unobserve: jest.fn(),
                disconnect: jest.fn()
            };

            global.IntersectionObserver = jest.fn(() => mockObserver);

            const observer = observeElements(elements, callback);

            expect(global.IntersectionObserver).toHaveBeenCalled();
            expect(mockObserver.observe).toHaveBeenCalledTimes(2);
            expect(mockObserver.observe).toHaveBeenCalledWith(elements[0]);
            expect(mockObserver.observe).toHaveBeenCalledWith(elements[1]);
        });

        test('should call callback and unobserve when element intersects', () => {
            const element = document.createElement('div');
            const callback = jest.fn();

            let observerCallback;
            const mockObserver = {
                observe: jest.fn(),
                unobserve: jest.fn(),
                disconnect: jest.fn()
            };

            global.IntersectionObserver = jest.fn(cb => {
                observerCallback = cb;
                return mockObserver;
            });

            observeElements([element], callback);

            // Simulate intersection
            const entries = [{
                target: element,
                isIntersecting: true
            }];

            observerCallback(entries);

            expect(callback).toHaveBeenCalledWith(element);
            expect(mockObserver.unobserve).toHaveBeenCalledWith(element);
        });
    });
});

describe('Validation Utilities', () => {
    describe('validators.email', () => {
        test('should validate correct email addresses', () => {
            expect(validators.email('test@example.com')).toBe(true);
            expect(validators.email('user.name@domain.co.uk')).toBe(true);
            expect(validators.email('test+tag@example.org')).toBe(true);
        });

        test('should reject invalid email addresses', () => {
            expect(validators.email('invalid-email')).toBe(false);
            expect(validators.email('test@')).toBe(false);
            expect(validators.email('@example.com')).toBe(false);
            expect(validators.email('test..test@example.com')).toBe(false);
        });
    });

    describe('validators.phone', () => {
        test('should validate correct phone numbers', () => {
            expect(validators.phone('1234567890')).toBe(true);
            expect(validators.phone('+33123456789')).toBe(true);
            expect(validators.phone('123 456 7890')).toBe(true);
        });

        test('should reject invalid phone numbers', () => {
            expect(validators.phone('abc123')).toBe(false);
            expect(validators.phone('123')).toBe(true); // Short numbers are valid
            expect(validators.phone('')).toBe(false);
        });
    });

    describe('validators.required', () => {
        test('should validate non-empty values', () => {
            expect(validators.required('test')).toBe(true);
            expect(validators.required('  test  ')).toBe(true);
        });

        test('should reject empty values', () => {
            expect(validators.required('')).toBe(false);
            expect(validators.required('   ')).toBe(false);
        });
    });

    describe('validators.minLength', () => {
        test('should validate strings meeting minimum length', () => {
            expect(validators.minLength('hello', 3)).toBe(true);
            expect(validators.minLength('hello', 5)).toBe(true);
        });

        test('should reject strings below minimum length', () => {
            expect(validators.minLength('hi', 3)).toBe(false);
            expect(validators.minLength('  hi  ', 3)).toBe(true); // Trimmed length
        });
    });

    describe('validators.maxLength', () => {
        test('should validate strings within maximum length', () => {
            expect(validators.maxLength('hello', 10)).toBe(true);
            expect(validators.maxLength('hello', 5)).toBe(true);
        });

        test('should reject strings exceeding maximum length', () => {
            expect(validators.maxLength('hello world', 5)).toBe(false);
        });
    });
});

describe('UI Utilities', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    });

    describe('setLoadingState', () => {
        test('should add loading class and set position when loading', () => {
            const element = document.createElement('div');
            document.body.appendChild(element);

            setLoadingState(element, true);

            expect(element.classList.contains('loading')).toBe(true);
            expect(element.style.position).toBe('relative');
        });

        test('should remove loading class when not loading', () => {
            const element = document.createElement('div');
            element.classList.add('loading');
            document.body.appendChild(element);

            setLoadingState(element, false);

            expect(element.classList.contains('loading')).toBe(false);
        });
    });

    describe('showNotification', () => {
        test('should create and show notification', () => {
            showNotification('Test message', 'success');

            const notification = document.querySelector('.notification');
            expect(notification).toBeTruthy();
            expect(notification.textContent).toContain('Test message');
            expect(notification.classList.contains('notification--success')).toBe(true);
        });

        test('should remove existing notification before showing new one', () => {
            showNotification('First message');
            showNotification('Second message');

            const notifications = document.querySelectorAll('.notification');
            expect(notifications).toHaveLength(1);
            expect(notifications[0].textContent).toContain('Second message');
        });

        test('should auto-remove notification after duration', done => {
            showNotification('Test message', 'info', 100);

            const notification = document.querySelector('.notification');
            expect(notification).toBeTruthy();

            setTimeout(() => {
                expect(document.querySelector('.notification')).toBeFalsy();
                done();
            }, 500);
        });
    });
});

describe('Storage Utilities', () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem.mockClear();
        localStorage.getItem.mockClear();
        localStorage.removeItem.mockClear();
        localStorage.clear.mockClear();
    });

    describe('storage.set', () => {
        test('should store JSON stringified value', () => {
            const data = { name: 'test', value: 123 };
            storage.set('testKey', data);

            expect(localStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(data));
        });

        test('should handle storage errors gracefully', () => {
            localStorage.setItem.mockImplementation(() => {
                throw new Error('Storage full');
            });

            expect(() => storage.set('key', 'value')).not.toThrow();
            expect(console.warn).toHaveBeenCalledWith('Could not save to localStorage:', expect.any(Error));
        });
    });

    describe('storage.get', () => {
        test('should retrieve and parse stored value', () => {
            const data = { name: 'test', value: 123 };
            localStorage.getItem.mockReturnValue(JSON.stringify(data));

            const result = storage.get('testKey');
            expect(result).toEqual(data);
        });

        test('should return default value for non-existent key', () => {
            localStorage.getItem.mockReturnValue(null);

            const result = storage.get('nonExistent', 'default');
            expect(result).toBe('default');
        });

        test('should handle parsing errors gracefully', () => {
            localStorage.getItem.mockReturnValue('invalid json');

            const result = storage.get('key', 'default');
            expect(result).toBe('default');
            expect(console.warn).toHaveBeenCalledWith('Could not read from localStorage:', expect.any(Error));
        });
    });

    describe('storage.remove', () => {
        test('should remove item from storage', () => {
            storage.remove('testKey');
            expect(localStorage.removeItem).toHaveBeenCalledWith('testKey');
        });
    });

    describe('storage.clear', () => {
        test('should clear all storage', () => {
            storage.clear();
            expect(localStorage.clear).toHaveBeenCalled();
        });
    });
});

describe('API Utilities', () => {
    beforeEach(() => {
        fetch.mockClear();
        fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({ success: true }),
            text: jest.fn().mockResolvedValue('success'),
            headers: {
                get: jest.fn().mockReturnValue('application/json')
            }
        });
    });

    describe('api.request', () => {
        test('should make fetch request with default options', async () => {
            await api.request('/test');

            expect(fetch).toHaveBeenCalledWith('/test', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });

        test('should handle JSON response', async () => {
            const mockData = { success: true };
            fetch.mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(mockData),
                headers: {
                    get: jest.fn().mockReturnValue('application/json')
                }
            });

            const result = await api.request('/test');
            expect(result).toEqual(mockData);
        });

        test('should handle text response', async () => {
            fetch.mockResolvedValue({
                ok: true,
                status: 200,
                text: jest.fn().mockResolvedValue('plain text'),
                headers: {
                    get: jest.fn().mockReturnValue('text/plain')
                }
            });

            const result = await api.request('/test');
            expect(result).toBe('plain text');
        });

        test('should throw error for failed requests', async () => {
            fetch.mockResolvedValue({
                ok: false,
                status: 404
            });

            await expect(api.request('/test')).rejects.toThrow('HTTP error! status: 404');
        });

        test('should handle network errors', async () => {
            fetch.mockRejectedValue(new Error('Network error'));

            await expect(api.request('/test')).rejects.toThrow('Network error');
        });
    });

    describe('api.get', () => {
        test('should make GET request', async () => {
            await api.get('/test');

            expect(fetch).toHaveBeenCalledWith('/test', {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'GET'
            });
        });
    });

    describe('api.post', () => {
        test('should make POST request with data', async () => {
            const data = { name: 'test' };
            await api.post('/test', data);

            expect(fetch).toHaveBeenCalledWith('/test', {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'POST',
                body: JSON.stringify(data)
            });
        });
    });

    describe('api.put', () => {
        test('should make PUT request with data', async () => {
            const data = { name: 'test' };
            await api.put('/test', data);

            expect(fetch).toHaveBeenCalledWith('/test', {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'PUT',
                body: JSON.stringify(data)
            });
        });
    });

    describe('api.delete', () => {
        test('should make DELETE request', async () => {
            await api.delete('/test');

            expect(fetch).toHaveBeenCalledWith('/test', {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: 'DELETE'
            });
        });
    });
});
