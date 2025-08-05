/**
 * Unit tests for XylocopeModern class in main.js
 * Tests navigation, form handling, video gallery, animations, and other core functionality
 */

import { JSDOM } from 'jsdom';

// Set up DOM environment
const dom = new JSDOM(`<!DOCTYPE html>
<html>
<head></head>
<body>
  <nav id="nav">
    <div class="nav-dots">
      <a href="#hero" class="nav-dot active"></a>
      <a href="#about" class="nav-dot"></a>
      <a href="#services" class="nav-dot"></a>
    </div>
  </nav>
  
  <div class="mobile-menu-trigger" id="mobileMenuTrigger">
    <span></span>
    <span></span>
    <span></span>
  </div>
  
  <div class="mobile-menu" id="mobileMenu">
    <div class="mobile-menu-content">
      <a href="#hero" class="mobile-menu-item">Home</a>
      <a href="#about" class="mobile-menu-item">About</a>
    </div>
  </div>
  
  <video id="heroVideo"></video>
  
  <form id="contactForm">
    <input name="name" required />
    <input name="email" type="email" required />
    <textarea name="message" required></textarea>
    <button type="submit" class="submit-button">
      <span>Submit</span>
    </button>
  </form>
  
  <section id="hero"></section>
  <section id="about"></section>
  <section id="services"></section>
</body>
</html>`);

global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;

// Mock window properties
Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });

// Load the utilities first
require('../../js/utils.js');

// Mock Utils if not loaded properly
if (!window.Utils) {
    window.Utils = {
        $: selector => document.querySelector(selector),
        $$: selector => document.querySelectorAll(selector),
        ready: callback => callback(),
        debounce: (func, wait) => func,
        throttle: (func, limit) => func,
        scrollToElement: jest.fn(),
        observeElements: jest.fn(),
        validators: {
            required: value => value.trim().length > 0,
            email: email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            minLength: (value, min) => value.trim().length >= min
        },
        setLoadingState: jest.fn(),
        showNotification: jest.fn(),
        storage: {
            set: jest.fn(),
            get: jest.fn(),
            remove: jest.fn(),
            clear: jest.fn()
        }
    };
}

// Now load the main module
require('../../js/main.js');

const XylocopeModern = window.XylocopeModern || class MockXylocopeModern {
    constructor() {
        this.allVideos = ['video1.mp4', 'video2.mp4'];
        this.images = ['image1.jpg', 'image2.jpg'];
        this.currentVideoIndex = 0;
        this.shuffledVideos = [...this.allVideos];
        this.isAutoPlaying = true;
    }

    init() {}
    setupNavigation() {}
    setupMobileMenu() {}
    setupVideoGallery() {}
    setupRandomImages() {}
    setupScrollAnimations() {}
    setupPortfolioFilters() {}
    setupContactForm() {}
    setupCursorFollow() {}
    setupIntersectionObserver() {}
    loadUserPreferences() {}
    toggleMobileMenu() {}
    smoothScrollTo() {}
    updateActiveNavDot() {}
    validateField() {}
    handleFormSubmit() {}
};

describe('XylocopeModern Class', () => {
    let app;

    beforeEach(() => {
    // Reset DOM
        document.body.style.overflow = '';
        const video = document.getElementById('heroVideo');
        if (video) {
            video.src = '';
            video.play = jest.fn().mockResolvedValue();
            video.pause = jest.fn();
            video.load = jest.fn();
            Object.defineProperty(video, 'paused', { value: false, writable: true });
        }

        // Reset mocks
        jest.clearAllMocks();
        window.Utils.showNotification.mockClear();
        window.Utils.storage.get.mockReturnValue(null);

        // Create new instance
        app = new XylocopeModern();
    });

    describe('Constructor', () => {
        test('should initialize with correct default values', () => {
            expect(app.allVideos).toEqual(expect.arrayContaining([
                'Paradise Found! Dive Into This Stunning Seasi.mp4',
                'Mesmerizing Waves and Reefs  Dive Into Seasid.mp4'
            ]));
            expect(app.images).toEqual(expect.arrayContaining([
                'Image 2025-07-15 220942_1.1.1.jpg',
                '0000005_photo.jpg'
            ]));
            expect(app.currentVideoIndex).toBe(0);
            expect(app.isAutoPlaying).toBe(true);
            expect(app.shuffledVideos).toHaveLength(app.allVideos.length);
        });

        test('should shuffle videos array', () => {
            // Test multiple instances to check randomization
            const apps = Array.from({ length: 10 }, () => new XylocopeModern());
            const shuffleResults = apps.map(a => a.shuffledVideos[0]);
            const hasVariation = new Set(shuffleResults).size > 1;
            expect(hasVariation).toBe(true);
        });
    });

    describe('Navigation', () => {
        test('setupNavigation should add click listeners to nav dots', () => {
            const navDots = document.querySelectorAll('.nav-dot');
            const addEventListenerSpy = jest.spyOn(navDots[0], 'addEventListener');

            app.setupNavigation();

            expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('should update active nav dot', () => {
            const navDots = document.querySelectorAll('.nav-dot');
            navDots[0].classList.add('active');

            app.updateActiveNavDot('about');

            expect(navDots[0].classList.contains('active')).toBe(false);
            expect(navDots[1].classList.contains('active')).toBe(true);
        });

        test('should handle scroll-based nav dot updates', () => {
            const sections = document.querySelectorAll('section[id]');
            Object.defineProperty(sections[0], 'offsetTop', { value: 100 });
            Object.defineProperty(sections[0], 'offsetHeight', { value: 500 });
            Object.defineProperty(sections[1], 'offsetTop', { value: 600 });
            Object.defineProperty(sections[1], 'offsetHeight', { value: 500 });

            Object.defineProperty(window, 'scrollY', { value: 350, writable: true });

            app.updateActiveNavDotOnScroll();

            const navDots = document.querySelectorAll('.nav-dot');
            expect(navDots[0].classList.contains('active')).toBe(true);
        });
    });

    describe('Mobile Menu', () => {
        test('setupMobileMenu should add event listeners', () => {
            const menuTrigger = document.getElementById('mobileMenuTrigger');
            const addEventListenerSpy = jest.spyOn(menuTrigger, 'addEventListener');

            app.setupMobileMenu();

            expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
        });

        test('toggleMobileMenu should show menu', () => {
            const mobileMenu = document.getElementById('mobileMenu');
            const menuTrigger = document.getElementById('mobileMenuTrigger');
            const spans = menuTrigger.querySelectorAll('span');

            app.toggleMobileMenu(true);

            expect(mobileMenu.style.display).toBe('flex');
            expect(document.body.style.overflow).toBe('hidden');
            expect(spans[0].style.transform).toContain('rotate(45deg)');
            expect(spans[1].style.opacity).toBe('0');
        });

        test('toggleMobileMenu should hide menu', () => {
            const mobileMenu = document.getElementById('mobileMenu');
            const menuTrigger = document.getElementById('mobileMenuTrigger');
            const spans = menuTrigger.querySelectorAll('span');

            // First show the menu
            app.toggleMobileMenu(true);

            // Then hide it
            app.toggleMobileMenu(false);

            expect(mobileMenu.style.display).toBe('none');
            expect(document.body.style.overflow).toBe('');
            expect(spans[0].style.transform).toBe('');
            expect(spans[1].style.opacity).toBe('');
        });
    });

    describe('Video Gallery', () => {
        test('setupVideoGallery should set random video source', () => {
            const video = document.getElementById('heroVideo');

            app.setupVideoGallery();

            expect(video.src).toMatch(/images\/.+\.mp4$/);
            expect(video.load).toHaveBeenCalled();
            expect(video.play).toHaveBeenCalled();
        });

        test('should handle video click for play/pause', () => {
            const video = document.getElementById('heroVideo');
            video.paused = true;

            app.setupVideoGallery();

            // Simulate click event
            const clickEvent = new Event('click');
            video.dispatchEvent(clickEvent);

            expect(video.play).toHaveBeenCalled();
        });

        test('should handle missing video element gracefully', () => {
            document.getElementById('heroVideo').remove();

            expect(() => app.setupVideoGallery()).not.toThrow();
        });
    });

    describe('Form Validation', () => {
        test('validateField should validate required fields', () => {
            const nameField = document.querySelector('input[name="name"]');
            nameField.value = '';
            nameField.setAttribute('required', '');

            const isValid = app.validateField(nameField);

            expect(isValid).toBe(false);
            expect(nameField.classList.contains('error')).toBe(true);
            expect(nameField.parentNode.querySelector('.field-error')).toBeTruthy();
        });

        test('validateField should validate email format', () => {
            const emailField = document.querySelector('input[name="email"]');
            emailField.value = 'invalid-email';

            const isValid = app.validateField(emailField);

            expect(isValid).toBe(false);
            expect(emailField.classList.contains('error')).toBe(true);
        });

        test('validateField should validate message minimum length', () => {
            const messageField = document.querySelector('textarea[name="message"]');
            messageField.value = 'short';

            const isValid = app.validateField(messageField);

            expect(isValid).toBe(false);
            expect(messageField.classList.contains('error')).toBe(true);
        });

        test('validateField should pass valid inputs', () => {
            const nameField = document.querySelector('input[name="name"]');
            nameField.value = 'John Doe';
            nameField.setAttribute('required', '');

            const isValid = app.validateField(nameField);

            expect(isValid).toBe(true);
            expect(nameField.classList.contains('error')).toBe(false);
        });

        test('should clear existing error states', () => {
            const nameField = document.querySelector('input[name="name"]');
            nameField.classList.add('error');

            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            nameField.parentNode.appendChild(errorDiv);

            nameField.value = 'Valid Name';
            app.validateField(nameField);

            expect(nameField.classList.contains('error')).toBe(false);
            expect(nameField.parentNode.querySelector('.field-error')).toBeFalsy();
        });
    });

    describe('Form Submission', () => {
        test('handleFormSubmit should validate all fields', async () => {
            const form = document.getElementById('contactForm');
            const submitBtn = form.querySelector('.submit-button');

            // Set invalid values
            form.querySelector('input[name="name"]').value = '';
            form.querySelector('input[name="email"]').value = 'invalid';
            form.querySelector('textarea[name="message"]').value = 'short';

            const validateFieldSpy = jest.spyOn(app, 'validateField');
            validateFieldSpy.mockReturnValue(false);

            await app.handleFormSubmit(form, submitBtn);

            expect(validateFieldSpy).toHaveBeenCalledTimes(3);
            expect(window.Utils.showNotification).toHaveBeenCalledWith(
                'Veuillez corriger les erreurs dans le formulaire.',
                'error'
            );
        });

        test('should show loading state during submission', async () => {
            const form = document.getElementById('contactForm');
            const submitBtn = form.querySelector('.submit-button');
            const submitSpan = submitBtn.querySelector('span');

            // Set valid values
            form.querySelector('input[name="name"]').value = 'John Doe';
            form.querySelector('input[name="email"]').value = 'john@example.com';
            form.querySelector('textarea[name="message"]').value = 'Valid message with enough characters';

            const validateFieldSpy = jest.spyOn(app, 'validateField');
            validateFieldSpy.mockReturnValue(true);

            const originalText = submitSpan.textContent;

            const submitPromise = app.handleFormSubmit(form, submitBtn);

            // Check loading state is set
            expect(submitSpan.textContent).toBe('Envoi...');
            expect(submitBtn.disabled).toBe(true);
            expect(submitBtn.style.opacity).toBe('0.7');

            await submitPromise;

            // Check loading state is reset
            expect(submitSpan.textContent).toBe(originalText);
            expect(submitBtn.disabled).toBe(false);
            expect(submitBtn.style.opacity).toBe('1');
        });

        test('should show success notification on successful submission', async () => {
            const form = document.getElementById('contactForm');
            const submitBtn = form.querySelector('.submit-button');

            // Set valid values
            form.querySelector('input[name="name"]').value = 'John Doe';
            form.querySelector('input[name="email"]').value = 'john@example.com';
            form.querySelector('textarea[name="message"]').value = 'Valid message with enough characters';

            const validateFieldSpy = jest.spyOn(app, 'validateField');
            validateFieldSpy.mockReturnValue(true);

            await app.handleFormSubmit(form, submitBtn);

            expect(window.Utils.showNotification).toHaveBeenCalledWith(
                'Votre message a été envoyé avec succès !',
                'success'
            );
            expect(window.Utils.storage.set).toHaveBeenCalledWith(
                'lastContactData',
                expect.objectContaining({
                    name: 'John Doe',
                    email: 'john@example.com'
                })
            );
        });
    });

    describe('Contact Form Setup', () => {
        test('setupContactForm should add event listeners to form inputs', () => {
            const form = document.getElementById('contactForm');
            const inputs = form.querySelectorAll('input, textarea');

            const addEventListenerSpies = Array.from(inputs).map(input =>
                jest.spyOn(input, 'addEventListener')
            );

            app.setupContactForm();

            addEventListenerSpies.forEach(spy => {
                expect(spy).toHaveBeenCalledWith('focus', expect.any(Function));
                expect(spy).toHaveBeenCalledWith('blur', expect.any(Function));
                expect(spy).toHaveBeenCalledWith('input', expect.any(Function));
            });
        });

        test('should handle form submission', () => {
            const form = document.getElementById('contactForm');
            const addEventListenerSpy = jest.spyOn(form, 'addEventListener');

            app.setupContactForm();

            expect(addEventListenerSpy).toHaveBeenCalledWith('submit', expect.any(Function));
        });
    });

    describe('Smooth Scrolling', () => {
        beforeEach(() => {
            global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
            Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
        });

        test('smoothScrollTo should animate scroll position', () => {
            const target = document.getElementById('about');
            Object.defineProperty(target, 'offsetTop', { value: 1000 });

            window.scrollTo = jest.fn();

            app.smoothScrollTo(target);

            expect(requestAnimationFrame).toHaveBeenCalled();
        });

        test('easeInOutCubic should return correct values', () => {
            // Test easing function at different points
            expect(app.easeInOutCubic(0, 0, 100, 100)).toBe(0);
            expect(app.easeInOutCubic(50, 0, 100, 100)).toBe(50);
            expect(app.easeInOutCubic(100, 0, 100, 100)).toBe(100);
        });
    });

    describe('User Preferences', () => {
        test('loadUserPreferences should load saved contact data', () => {
            const savedData = {
                name: 'John Doe',
                email: 'john@example.com',
                timestamp: Date.now()
            };

            window.Utils.storage.get.mockReturnValue(savedData);

            app.loadUserPreferences();

            const nameField = document.getElementById('name') || document.querySelector('input[name="name"]');
            const emailField = document.getElementById('email') || document.querySelector('input[name="email"]');

            if (nameField && emailField) {
                expect(nameField.value).toBe('John Doe');
                expect(emailField.value).toBe('john@example.com');
            }
        });

        test('should not load expired contact data', () => {
            const expiredData = {
                name: 'John Doe',
                email: 'john@example.com',
                timestamp: Date.now() - (31 * 24 * 60 * 60 * 1000) // 31 days ago
            };

            window.Utils.storage.get.mockReturnValue(expiredData);

            app.loadUserPreferences();

            const nameField = document.querySelector('input[name="name"]');
            const emailField = document.querySelector('input[name="email"]');

            expect(nameField.value).toBe('');
            expect(emailField.value).toBe('');
        });

        test('should handle reduced motion preference', () => {
            // Mock matchMedia for reduced motion
            window.matchMedia = jest.fn().mockReturnValue({
                matches: true,
                addListener: jest.fn()
            });

            app.loadUserPreferences();

            expect(document.documentElement.style.getPropertyValue('--transition')).toBe('none');
        });

        test('should handle dark mode preference', () => {
            const mockMediaQuery = {
                matches: true,
                addListener: jest.fn()
            };

            window.matchMedia = jest.fn().mockReturnValue(mockMediaQuery);

            app.loadUserPreferences();

            // Simulate dark mode change
            const listener = mockMediaQuery.addListener.mock.calls[0][0];
            listener();

            expect(document.body.classList.contains('dark-mode')).toBe(true);
        });
    });

    describe('Cursor Follow', () => {
        test('setupCursorFollow should create custom cursor on desktop', () => {
            Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });

            app.setupCursorFollow();

            const cursor = document.querySelector('.custom-cursor');
            expect(cursor).toBeTruthy();
            expect(cursor.style.position).toBe('fixed');
        });

        test('should not create cursor on mobile', () => {
            Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });

            app.setupCursorFollow();

            const cursor = document.querySelector('.custom-cursor');
            expect(cursor).toBeFalsy();
        });
    });

    describe('Intersection Observer', () => {
        test('setupIntersectionObserver should observe sections', () => {
            const mockObserver = {
                observe: jest.fn(),
                unobserve: jest.fn(),
                disconnect: jest.fn()
            };

            global.IntersectionObserver = jest.fn(() => mockObserver);

            app.setupIntersectionObserver();

            const sections = document.querySelectorAll('section[id]');
            expect(mockObserver.observe).toHaveBeenCalledTimes(sections.length);
        });

        test('should update active nav dot when section intersects', () => {
            let observerCallback;
            const mockObserver = {
                observe: jest.fn(),
                unobserve: jest.fn(),
                disconnect: jest.fn()
            };

            global.IntersectionObserver = jest.fn(callback => {
                observerCallback = callback;
                return mockObserver;
            });

            const updateActiveNavDotSpy = jest.spyOn(app, 'updateActiveNavDot');

            app.setupIntersectionObserver();

            // Simulate intersection
            const aboutSection = document.getElementById('about');
            const entries = [{
                target: aboutSection,
                isIntersecting: true
            }];

            observerCallback(entries);

            expect(updateActiveNavDotSpy).toHaveBeenCalledWith('about');
        });
    });

    describe('Error Handling', () => {
        test('should handle missing DOM elements gracefully', () => {
            // Remove critical elements
            document.getElementById('mobileMenuTrigger')?.remove();
            document.getElementById('heroVideo')?.remove();
            document.getElementById('contactForm')?.remove();

            expect(() => {
                app.setupMobileMenu();
                app.setupVideoGallery();
                app.setupContactForm();
            }).not.toThrow();
        });

        test('should handle form submission errors', async () => {
            const form = document.getElementById('contactForm');
            const submitBtn = form.querySelector('.submit-button');

            // Set valid values
            form.querySelector('input[name="name"]').value = 'John Doe';
            form.querySelector('input[name="email"]').value = 'john@example.com';
            form.querySelector('textarea[name="message"]').value = 'Valid message';

            const validateFieldSpy = jest.spyOn(app, 'validateField');
            validateFieldSpy.mockReturnValue(true);

            // Mock a promise rejection to simulate network error
            const originalPromise = global.Promise;
            global.Promise = class extends originalPromise {
                static resolve(value) {
                    if (typeof value === 'number' && value === 2000) {
                        return originalPromise.reject(new Error('Network error'));
                    }
                    return originalPromise.resolve(value);
                }
            };

            await app.handleFormSubmit(form, submitBtn);

            expect(window.Utils.showNotification).toHaveBeenCalledWith(
                'Une erreur est survenue. Veuillez réessayer.',
                'error'
            );

            // Restore Promise
            global.Promise = originalPromise;
        });
    });
});
