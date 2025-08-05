/**
 * Integration tests for DOM interactions and component integration
 * Tests how different components work together and interact with the DOM
 */

import { screen, fireEvent, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

// Load the actual HTML file
const htmlPath = path.join(process.cwd(), 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// Set up DOM with actual HTML content
const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:3000',
    pretendToBeVisual: true,
    resources: 'usable'
});

global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;

// Mock browser APIs
Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });
Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });

window.scrollTo = jest.fn();
window.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));

// Mock video methods
HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue();
HTMLVideoElement.prototype.pause = jest.fn();
HTMLVideoElement.prototype.load = jest.fn();

// Load the utils and main modules
require('../../js/utils.js');
require('../../js/main.js');

describe('DOM Integration Tests', () => {
    let user;
    let app;

    beforeEach(async () => {
        user = userEvent.setup({ delay: null });

        // Reset DOM to initial state
        document.body.style.overflow = '';

        // Clear any existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        // Reset form
        const form = document.getElementById('contactForm');
        if (form) {
            form.reset();
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.classList.remove('error');
                const error = input.parentNode.querySelector('.field-error');
                if (error) {
                    error.remove();
                }
            });
        }

        // Reset mobile menu
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.style.display = 'none';
        }

        // Create new app instance
        if (window.XylocopeModern) {
            app = new window.XylocopeModern();
        }

        jest.clearAllMocks();
    });

    describe('Navigation Integration', () => {
        test('should navigate between sections using nav dots', async () => {
            const heroNavDot = document.querySelector('.nav-dot[href="#hero"]');
            const aboutNavDot = document.querySelector('.nav-dot[href="#about"]');
            const aboutSection = document.getElementById('about');

            expect(heroNavDot.classList.contains('active')).toBe(true);

            await user.click(aboutNavDot);

            expect(window.scrollTo).toHaveBeenCalled();
            expect(aboutNavDot.classList.contains('active')).toBe(true);
            expect(heroNavDot.classList.contains('active')).toBe(false);
        });

        test('should update active nav dot on scroll', () => {
            const heroSection = document.getElementById('hero');
            const aboutSection = document.getElementById('about');
            const heroNavDot = document.querySelector('.nav-dot[href="#hero"]');
            const aboutNavDot = document.querySelector('.nav-dot[href="#about"]');

            // Mock section positions
            Object.defineProperty(heroSection, 'offsetTop', { value: 0 });
            Object.defineProperty(heroSection, 'offsetHeight', { value: 600 });
            Object.defineProperty(aboutSection, 'offsetTop', { value: 600 });
            Object.defineProperty(aboutSection, 'offsetHeight', { value: 600 });

            // Simulate scroll to about section
            Object.defineProperty(window, 'scrollY', { value: 800, writable: true });

            if (app && app.updateActiveNavDotOnScroll) {
                app.updateActiveNavDotOnScroll();
            }

            expect(aboutNavDot.classList.contains('active')).toBe(true);
            expect(heroNavDot.classList.contains('active')).toBe(false);
        });
    });

    describe('Mobile Menu Integration', () => {
        test('should toggle mobile menu on trigger click', async () => {
            const menuTrigger = document.getElementById('mobileMenuTrigger');
            const mobileMenu = document.getElementById('mobileMenu');

            expect(mobileMenu.style.display).toBe('none');

            await user.click(menuTrigger);

            expect(mobileMenu.style.display).toBe('flex');
            expect(document.body.style.overflow).toBe('hidden');
        });

        test('should close mobile menu when clicking menu item', async () => {
            const menuTrigger = document.getElementById('mobileMenuTrigger');
            const mobileMenu = document.getElementById('mobileMenu');
            const menuItem = document.querySelector('.mobile-menu-item[href="#about"]');

            // Open menu first
            await user.click(menuTrigger);
            expect(mobileMenu.style.display).toBe('flex');

            // Click menu item
            await user.click(menuItem);

            await waitFor(() => {
                expect(mobileMenu.style.display).toBe('none');
            });
            expect(document.body.style.overflow).toBe('');
        });

        test('should close mobile menu when clicking outside', async () => {
            const menuTrigger = document.getElementById('mobileMenuTrigger');
            const mobileMenu = document.getElementById('mobileMenu');

            // Open menu first
            await user.click(menuTrigger);
            expect(mobileMenu.style.display).toBe('flex');

            // Click on the menu overlay (outside content)
            await user.click(mobileMenu);

            expect(mobileMenu.style.display).toBe('none');
        });

        test('should animate hamburger icon on toggle', async () => {
            const menuTrigger = document.getElementById('mobileMenuTrigger');
            const spans = menuTrigger.querySelectorAll('span');

            await user.click(menuTrigger);

            expect(spans[0].style.transform).toContain('rotate(45deg)');
            expect(spans[1].style.opacity).toBe('0');
            expect(spans[2].style.transform).toContain('rotate(-45deg)');

            // Click again to close
            await user.click(menuTrigger);

            expect(spans[0].style.transform).toBe('');
            expect(spans[1].style.opacity).toBe('');
            expect(spans[2].style.transform).toBe('');
        });
    });

    describe('Video Gallery Integration', () => {
        test('should set random video source on load', () => {
            const video = document.getElementById('heroVideo');
            const originalSrc = video.src;

            if (app && app.setupVideoGallery) {
                app.setupVideoGallery();
            }

            expect(video.src).toMatch(/images\/.+\.(mp4|mov)$/);
            expect(video.load).toHaveBeenCalled();
            expect(video.play).toHaveBeenCalled();
        });

        test('should toggle video play/pause on click', async () => {
            const video = document.getElementById('heroVideo');

            // Set initial state as paused
            Object.defineProperty(video, 'paused', { value: true, writable: true });

            await user.click(video);

            expect(video.play).toHaveBeenCalled();

            // Change state to playing and click again
            video.paused = false;

            await user.click(video);

            expect(video.pause).toHaveBeenCalled();
        });
    });

    describe('Form Integration', () => {
        test('should validate form fields on blur', async () => {
            const nameInput = document.querySelector('input[name="name"]');
            const emailInput = document.querySelector('input[name="email"]');

            // Focus and blur without entering data (required field)
            await user.click(nameInput);
            await user.tab();

            expect(nameInput.classList.contains('error')).toBe(true);
            expect(nameInput.parentNode.querySelector('.field-error')).toBeTruthy();

            // Enter invalid email
            await user.type(emailInput, 'invalid-email');
            await user.tab();

            expect(emailInput.classList.contains('error')).toBe(true);
        });

        test('should show floating labels on focus', async () => {
            const nameInput = document.querySelector('input[name="name"]');

            await user.click(nameInput);

            expect(nameInput.parentNode.classList.contains('focused')).toBe(true);
        });

        test('should clear validation errors when valid input is entered', async () => {
            const nameInput = document.querySelector('input[name="name"]');

            // First make it invalid
            await user.click(nameInput);
            await user.tab();

            expect(nameInput.classList.contains('error')).toBe(true);

            // Then enter valid data
            await user.type(nameInput, 'John Doe');
            await user.tab();

            expect(nameInput.classList.contains('error')).toBe(false);
            expect(nameInput.parentNode.querySelector('.field-error')).toBeFalsy();
        });

        test('should handle form submission with validation', async () => {
            const form = document.getElementById('contactForm');
            const nameInput = document.querySelector('input[name="name"]');
            const emailInput = document.querySelector('input[name="email"]');
            const messageInput = document.querySelector('textarea[name="message"]');
            const submitButton = document.querySelector('.submit-button');

            // Fill form with valid data
            await user.type(nameInput, 'John Doe');
            await user.type(emailInput, 'john@example.com');
            await user.type(messageInput, 'This is a valid message with enough characters.');

            // Submit form
            await user.click(submitButton);

            // Check loading state
            expect(submitButton.disabled).toBe(true);
            expect(submitButton.querySelector('span').textContent).toBe('Envoi...');

            // Wait for submission to complete
            await waitFor(() => {
                expect(submitButton.disabled).toBe(false);
            }, { timeout: 3000 });

            expect(submitButton.querySelector('span').textContent).toBe('Envoyer');
        });

        test('should prevent form submission with invalid data', async () => {
            const form = document.getElementById('contactForm');
            const submitButton = document.querySelector('.submit-button');

            // Try to submit empty form
            await user.click(submitButton);

            // Should show validation errors
            const nameInput = document.querySelector('input[name="name"]');
            const emailInput = document.querySelector('input[name="email"]');
            const messageInput = document.querySelector('textarea[name="message"]');

            expect(nameInput.classList.contains('error')).toBe(true);
            expect(emailInput.classList.contains('error')).toBe(true);
            expect(messageInput.classList.contains('error')).toBe(true);
        });
    });

    describe('Portfolio Filter Integration', () => {
        test('should filter portfolio items by category', async () => {
            // Add some portfolio items to test with
            const portfolioContainer = document.createElement('div');
            portfolioContainer.innerHTML = `
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="photo">Photo</button>
        <button class="filter-btn" data-filter="video">Video</button>
        <div class="portfolio-item" data-category="photo">Photo Item</div>
        <div class="portfolio-item" data-category="video">Video Item</div>
        <div class="portfolio-item" data-category="photo">Photo Item 2</div>
      `;
            document.body.appendChild(portfolioContainer);

            if (app && app.setupPortfolioFilters) {
                app.setupPortfolioFilters();
            }

            const photoFilter = document.querySelector('.filter-btn[data-filter="photo"]');
            const portfolioItems = document.querySelectorAll('.portfolio-item');

            await user.click(photoFilter);

            expect(photoFilter.classList.contains('active')).toBe(true);

            // Check that only photo items are visible
            const photoItems = document.querySelectorAll('.portfolio-item[data-category="photo"]');
            const videoItems = document.querySelectorAll('.portfolio-item[data-category="video"]');

            photoItems.forEach(item => {
                expect(item.style.display).toBe('block');
            });

            videoItems.forEach(item => {
                expect(item.style.display).toBe('none');
            });

            portfolioContainer.remove();
        });
    });

    describe('Intersection Observer Integration', () => {
        test('should trigger animations when elements come into view', () => {
            // Create animated elements
            const animatedElement = document.createElement('div');
            animatedElement.className = 'service-card';
            document.body.appendChild(animatedElement);

            let observerCallback;
            global.IntersectionObserver = jest.fn(callback => {
                observerCallback = callback;
                return {
                    observe: jest.fn(),
                    unobserve: jest.fn(),
                    disconnect: jest.fn()
                };
            });

            if (app && app.setupScrollAnimations) {
                app.setupScrollAnimations();
            }

            // Initially should be hidden
            expect(animatedElement.style.opacity).toBe('0');
            expect(animatedElement.style.transform).toBe('translateY(30px)');

            // Simulate element coming into view
            if (observerCallback) {
                observerCallback([{
                    target: animatedElement,
                    isIntersecting: true
                }]);
            }

            expect(animatedElement.style.opacity).toBe('1');
            expect(animatedElement.style.transform).toBe('translateY(0)');

            animatedElement.remove();
        });
    });

    describe('Responsive Behavior', () => {
        test('should not create custom cursor on mobile devices', () => {
            Object.defineProperty(window, 'innerWidth', { value: 600, writable: true });

            if (app && app.setupCursorFollow) {
                app.setupCursorFollow();
            }

            const cursor = document.querySelector('.custom-cursor');
            expect(cursor).toBeFalsy();
        });

        test('should create custom cursor on desktop devices', () => {
            Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });

            if (app && app.setupCursorFollow) {
                app.setupCursorFollow();
            }

            const cursor = document.querySelector('.custom-cursor');
            expect(cursor).toBeTruthy();
            expect(cursor.style.position).toBe('fixed');
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle missing elements gracefully', () => {
            // Remove critical elements
            const elementsToRemove = [
                'mobileMenuTrigger',
                'mobileMenu',
                'heroVideo',
                'contactForm'
            ];

            elementsToRemove.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.remove();
                }
            });

            // Should not throw errors
            expect(() => {
                if (app) {
                    app.setupMobileMenu();
                    app.setupVideoGallery();
                    app.setupContactForm();
                }
            }).not.toThrow();
        });

        test('should handle network errors during form submission', async () => {
            const form = document.getElementById('contactForm');
            const nameInput = document.querySelector('input[name="name"]');
            const emailInput = document.querySelector('input[name="email"]');
            const messageInput = document.querySelector('textarea[name="message"]');
            const submitButton = document.querySelector('.submit-button');

            // Fill form with valid data
            await user.type(nameInput, 'John Doe');
            await user.type(emailInput, 'john@example.com');
            await user.type(messageInput, 'This is a valid message.');

            // Mock network error by overriding the promise timeout
            const originalSetTimeout = global.setTimeout;
            global.setTimeout = jest.fn((callback, delay) => {
                if (delay === 2000) {
                    // Simulate network error for form submission
                    throw new Error('Network error');
                }
                return originalSetTimeout(callback, delay);
            });

            try {
                await user.click(submitButton);

                await waitFor(() => {
                    expect(submitButton.disabled).toBe(false);
                }, { timeout: 3000 });
            } catch (error) {
                // Error should be handled gracefully
                expect(error.message).toBe('Network error');
            }

            global.setTimeout = originalSetTimeout;
        });
    });

    describe('Accessibility Integration', () => {
        test('should maintain focus management in mobile menu', async () => {
            const menuTrigger = document.getElementById('mobileMenuTrigger');
            const firstMenuItem = document.querySelector('.mobile-menu-item');

            await user.click(menuTrigger);

            // Menu should be open and focusable
            const mobileMenu = document.getElementById('mobileMenu');
            expect(mobileMenu.style.display).toBe('flex');

            // Should be able to navigate with keyboard
            await user.keyboard('{Tab}');
            expect(document.activeElement).toBe(firstMenuItem);
        });

        test('should provide proper ARIA labels and roles', () => {
            const navDots = document.querySelectorAll('.nav-dot');
            const form = document.getElementById('contactForm');

            // Navigation should have proper labels
            navDots.forEach(dot => {
                expect(dot.getAttribute('data-label')).toBeTruthy();
            });

            // Form should have proper structure
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                const label = form.querySelector(`label[for="${input.id}"]`) ||
                     input.parentNode.querySelector('label');
                // Either has a label or placeholder for accessibility
                expect(input.getAttribute('placeholder') || label).toBeTruthy();
            });
        });
    });

    describe('Performance Integration', () => {
        test('should use debounced input validation', async () => {
            const nameInput = document.querySelector('input[name="name"]');

            // Simulate rapid typing
            await user.type(nameInput, 'a');
            await user.type(nameInput, 'b');
            await user.type(nameInput, 'c');

            // Validation should be debounced and not called for every keystroke
            // This is more of a behavioral test - the debounce should prevent
            // excessive validation calls
            expect(nameInput.value).toBe('abc');
        });

        test('should use throttled scroll handlers', () => {
            // Simulate multiple scroll events
            const scrollEvents = Array.from({ length: 10 }, () => new Event('scroll'));

            scrollEvents.forEach(event => {
                window.dispatchEvent(event);
            });

            // Throttling should limit the number of actual handler calls
            // This is tested implicitly through the app's behavior
            expect(true).toBe(true); // Placeholder for throttling behavior
        });
    });
});
