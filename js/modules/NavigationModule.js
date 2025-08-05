/**
 * NavigationModule - Handles all navigation-related functionality
 * Including scroll management, active state updates, and smooth scrolling
 */

class NavigationModule {
    /**
     * Create a NavigationModule instance
     * @param {object} dependencies - Required dependencies
     * @param {object} dependencies.utils - Utility functions
     * @param {object} dependencies.config - Configuration object
     */
    constructor({ utils, config }) {
        this.utils = utils;
        this.config = config;
        
        // Cache frequently used elements
        this.elements = {
            navDots: null,
            sections: null
        };
        
        // Throttled scroll handler
        this.handleScroll = this.utils.throttle(
            () => this.updateActiveNavDotOnScroll(),
            this.config.PERFORMANCE.SCROLL_THROTTLE
        );
        
        // Bind methods to preserve context
        this.init = this.init.bind(this);
        this.cleanup = this.cleanup.bind(this);
    }

    /**
     * Initialize the navigation module
     * Sets up event listeners and caches DOM elements
     */
    init() {
        try {
            this.cacheElements();
            this.setupNavigationEvents();
            this.setupScrollHandler();
            this.setupIntersectionObserver();
            this.updateActiveNavDotOnScroll();
            
            if (this.config.DEBUG.ENABLED) {
                console.log('NavigationModule initialized successfully');
            }
        } catch (error) {
            console.error('NavigationModule initialization failed:', error);
            throw error;
        }
    }

    /**
     * Cache DOM elements for better performance
     * @private
     */
    cacheElements() {
        this.elements.navDots = this.utils.$$(this.config.SELECTORS.NAV.DOTS);
        this.elements.sections = this.utils.$$(this.config.SELECTORS.GENERAL.SECTIONS);
        
        if (this.config.DEBUG.VERBOSE) {
            console.log('NavigationModule: Cached elements', {
                navDots: this.elements.navDots.length,
                sections: this.elements.sections.length
            });
        }
    }

    /**
     * Set up navigation dot click events
     * @private
     */
    setupNavigationEvents() {
        this.elements.navDots.forEach(dot => {
            dot.addEventListener('click', this.handleNavDotClick.bind(this));
        });
    }

    /**
     * Handle navigation dot click events
     * @param {Event} event - Click event
     * @private
     */
    handleNavDotClick(event) {
        event.preventDefault();
        
        const targetId = event.target.getAttribute('href')?.substring(1);
        if (!targetId) {
            console.warn('NavigationModule: No target ID found for navigation dot');
            return;
        }

        const targetSection = this.utils.$(`#${targetId}`);
        if (!targetSection) {
            console.warn(`NavigationModule: Target section not found: ${targetId}`);
            return;
        }

        this.smoothScrollTo(targetSection);
        this.updateActiveNavDot(targetId);
    }

    /**
     * Set up scroll event handler
     * @private
     */
    setupScrollHandler() {
        window.addEventListener('scroll', this.handleScroll, { passive: true });
    }

    /**
     * Set up intersection observer for section visibility
     * @private
     */
    setupIntersectionObserver() {
        const observerOptions = {
            threshold: this.config.PERFORMANCE.SECTION_OBSERVER_THRESHOLD,
            rootMargin: `0px 0px -${this.config.ANIMATION.NAV_UPDATE_OFFSET}px 0px`
        };

        this.sectionObserver = new IntersectionObserver(
            this.handleSectionIntersection.bind(this),
            observerOptions
        );

        this.elements.sections.forEach(section => {
            this.sectionObserver.observe(section);
        });
    }

    /**
     * Handle section intersection changes
     * @param {IntersectionObserverEntry[]} entries - Intersection entries
     * @private
     */
    handleSectionIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                if (sectionId) {
                    this.updateActiveNavDot(sectionId);
                }
            }
        });
    }

    /**
     * Update active navigation dot based on current scroll position
     * Fallback method when intersection observer is not available
     */
    updateActiveNavDotOnScroll() {
        const scrollY = window.scrollY;
        let currentSection = '';

        // Find the currently visible section
        this.elements.sections.forEach(section => {
            const sectionTop = section.offsetTop - this.config.ANIMATION.NAV_UPDATE_OFFSET;
            const sectionHeight = section.offsetHeight;

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        if (currentSection) {
            this.updateActiveNavDot(currentSection);
        }
    }

    /**
     * Update the active navigation dot
     * @param {string} activeSection - ID of the active section
     */
    updateActiveNavDot(activeSection) {
        // Remove active class from all dots
        this.elements.navDots.forEach(dot => {
            dot.classList.remove(this.config.CLASSES.STATES.ACTIVE);
        });

        // Add active class to the current dot
        const activeDot = this.elements.navDots.find(dot => {
            const href = dot.getAttribute('href');
            return href === `#${activeSection}`;
        });

        if (activeDot) {
            activeDot.classList.add(this.config.CLASSES.STATES.ACTIVE);
            
            if (this.config.DEBUG.VERBOSE) {
                console.log(`NavigationModule: Updated active section to ${activeSection}`);
            }
        }
    }

    /**
     * Smooth scroll to target element with enhanced easing
     * @param {HTMLElement} target - Target element to scroll to
     * @param {number} [customOffset] - Custom offset override
     */
    smoothScrollTo(target, customOffset = null) {
        if (!target) {
            console.warn('NavigationModule: Cannot scroll to null target');
            return;
        }

        const offset = customOffset ?? this.config.ANIMATION.SCROLL_OFFSET;
        const targetPosition = target.offsetTop - offset;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = this.config.ANIMATION.SCROLL_DURATION;

        if (Math.abs(distance) < 10) {
            // Already close to target, no need to animate
            return;
        }

        let startTime = null;

        const animationStep = (currentTime) => {
            if (startTime === null) {
                startTime = currentTime;
            }

            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Enhanced easing function (ease-in-out-cubic)
            const easedProgress = this.easeInOutCubic(progress);
            const currentPosition = startPosition + (distance * easedProgress);

            window.scrollTo(0, currentPosition);

            if (progress < 1) {
                requestAnimationFrame(animationStep);
            }
        };

        requestAnimationFrame(animationStep);
    }

    /**
     * Enhanced cubic easing function for smooth animations
     * @param {number} t - Time progress (0-1)
     * @returns {number} Eased value
     * @private
     */
    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Get current active section
     * @returns {string|null} ID of current active section
     */
    getCurrentActiveSection() {
        const scrollY = window.scrollY;
        
        for (const section of this.elements.sections) {
            const sectionTop = section.offsetTop - this.config.ANIMATION.NAV_UPDATE_OFFSET;
            const sectionHeight = section.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                return section.getAttribute('id');
            }
        }
        
        return null;
    }

    /**
     * Scroll to section by ID
     * @param {string} sectionId - ID of section to scroll to
     * @returns {boolean} Success status
     */
    scrollToSection(sectionId) {
        const targetSection = this.utils.$(`#${sectionId}`);
        
        if (!targetSection) {
            console.warn(`NavigationModule: Section not found: ${sectionId}`);
            return false;
        }

        this.smoothScrollTo(targetSection);
        return true;
    }

    /**
     * Check if navigation is supported
     * @returns {boolean} Support status
     */
    isSupported() {
        return !!(
            this.elements.navDots.length > 0 &&
            this.elements.sections.length > 0 &&
            window.requestAnimationFrame &&
            window.IntersectionObserver
        );
    }

    /**
     * Get navigation statistics
     * @returns {object} Navigation stats
     */
    getStats() {
        return {
            navDotsCount: this.elements.navDots.length,
            sectionsCount: this.elements.sections.length,
            currentActiveSection: this.getCurrentActiveSection(),
            isObserverActive: !!this.sectionObserver,
            isSupported: this.isSupported()
        };
    }

    /**
     * Update navigation after DOM changes
     * Call this method if sections or navigation dots are added/removed dynamically
     */
    refresh() {
        try {
            // Clean up existing observers
            if (this.sectionObserver) {
                this.sectionObserver.disconnect();
            }

            // Re-cache elements and reinitialize
            this.cacheElements();
            this.setupIntersectionObserver();
            this.updateActiveNavDotOnScroll();

            if (this.config.DEBUG.ENABLED) {
                console.log('NavigationModule refreshed successfully');
            }
        } catch (error) {
            console.error('NavigationModule refresh failed:', error);
        }
    }

    /**
     * Clean up event listeners and observers
     * Call this method before destroying the module instance
     */
    cleanup() {
        try {
            // Remove event listeners
            window.removeEventListener('scroll', this.handleScroll);
            
            // Clean up navigation dot events
            this.elements.navDots.forEach(dot => {
                dot.removeEventListener('click', this.handleNavDotClick);
            });

            // Disconnect intersection observer
            if (this.sectionObserver) {
                this.sectionObserver.disconnect();
                this.sectionObserver = null;
            }

            // Clear cached elements
            this.elements = {
                navDots: null,
                sections: null
            };

            if (this.config.DEBUG.ENABLED) {
                console.log('NavigationModule cleaned up successfully');
            }
        } catch (error) {
            console.error('NavigationModule cleanup failed:', error);
        }
    }
}

// Export for use in main application
if (typeof window !== 'undefined') {
    window.NavigationModule = NavigationModule;
}

// Export for Node.js (testing environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationModule;
}