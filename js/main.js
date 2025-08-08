/**
 * JavaScript pour Xylocope - Design ultra-moderne
 * Refactored for better maintainability and performance
 */

// Import utilities and configuration
const config = window.XylocopeConfig;

// Use utilities directly from window.Utils (alwindow.Utils.ready available globally)

/**
 * Main application class for Xylocope website
 * Manages all website functionality with modular approach
 */
class XylocopeModern {
    constructor() {
        // Initialize configuration-based properties
        this.allVideos = [...config.VIDEOS];
        this.images = [...config.IMAGES];
        this.currentVideoIndex = 0;
        this.shuffledVideos = [...this.allVideos].sort(() => Math.random() - 0.5);
        this.isAutoPlaying = true;

        // Cache for DOM elements to improve performance
        this.domCache = new Map();

        // Initialize cleanup handlers
        this.cleanupHandlers = [];

        this.init();
    }

    init() {
        window.Utils.ready(() => {
            this.setupNavigation();
            this.setupMobileMenu();
            this.setupVideoGallery();
            this.setupRandomImages();
            this.setupScrollAnimations();
            this.setupPortfolioFilters();
            this.setupContactForm();
            this.setupCursorFollow();
            this.setupIntersectionObserver();
            this.loadUserPreferences();
        });
    }

    // Navigation futuriste
    setupNavigation() {
        const navDots = window.Utils.$$('.nav-dot');
        const sections = window.Utils.$$('section[id]');

        // Gestion des clics sur les points de navigation
        navDots.forEach(dot => {
            dot.addEventListener('click', e => {
                e.preventDefault();
                const targetId = dot.getAttribute('href').substring(1);
                const targetSection = window.Utils.$(`#${targetId}`);

                if (targetSection) {
                    this.smoothScrollTo(targetSection);
                    this.updateActiveNavDot(targetId);
                }
            });
        });

        // Mise à jour des points actifs lors du scroll
        const handleScroll = window.Utils.throttle(() => {
            this.updateActiveNavDotOnScroll();
        }, 100);

        window.addEventListener('scroll', handleScroll);
        this.updateActiveNavDotOnScroll();
    }

    // Menu mobile moderne
    setupMobileMenu() {
        const menuTrigger = window.Utils.$('#mobileMenuTrigger');
        const mobileMenu = window.Utils.$('#mobileMenu');
        const mobileMenuItems = window.Utils.$$('.mobile-menu-item');

        if (!menuTrigger || !mobileMenu) {
            return;
        }

        menuTrigger.addEventListener('click', () => {
            const isOpen = mobileMenu.style.display === 'flex';
            this.toggleMobileMenu(!isOpen);
        });

        // Fermer le menu lors du clic sur un lien
        mobileMenuItems.forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                const targetSection = window.Utils.$(`#${targetId}`);

                if (targetSection) {
                    this.toggleMobileMenu(false);
                    setTimeout(() => {
                        this.smoothScrollTo(targetSection);
                    }, 300);
                }
            });
        });

        // Fermer le menu en cliquant en dehors
        mobileMenu.addEventListener('click', e => {
            if (e.target === mobileMenu) {
                this.toggleMobileMenu(false);
            }
        });
    }

    toggleMobileMenu(show) {
        const menuTrigger = window.Utils.$('#mobileMenuTrigger');
        const mobileMenu = window.Utils.$('#mobileMenu');
        const spans = menuTrigger.querySelectorAll('span');

        if (show) {
            mobileMenu.style.display = 'flex';
            document.body.style.overflow = 'hidden';

            // Animation du hamburger
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            mobileMenu.style.display = 'none';
            document.body.style.overflow = '';

            // Reset du hamburger
            spans.forEach(span => {
                span.style.transform = '';
                span.style.opacity = '';
            });
        }
    }

    // Vidéo aléatoire simple
    setupVideoGallery() {
        const videoElement = window.Utils.$('#heroVideo');

        if (!videoElement) {
            return;
        }

        // Sélectionner une vidéo aléatoire au chargement de la page
        const randomIndex = Math.floor(Math.random() * this.allVideos.length);
        const randomVideo = this.allVideos[randomIndex];

        // Mettre à jour la source de la vidéo
        videoElement.src = `images/${randomVideo}`;
        videoElement.load();

        // Auto-play au chargement
        videoElement.play().catch(() => {
            // Autoplay was prevented by browser policy
        });

        // Pause/play au clic
        videoElement.addEventListener('click', () => {
            if (videoElement.paused) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        });
    }

    // Système d'images aléatoires
    setupRandomImages() {
        // Images dans la section About
        const aboutImage = window.Utils.$('.image-card img');
        if (aboutImage && this.images.length > 0) {
            const randomImage = this.images[Math.floor(Math.random() * this.images.length)];
            aboutImage.src = `images/${randomImage}`;
        }

        // Images dans le portfolio
        const portfolioImages = window.Utils.$$('.portfolio-item[data-category="photo"] img');
        portfolioImages.forEach(img => {
            if (this.images.length > 0) {
                const randomImage = this.images[Math.floor(Math.random() * this.images.length)];
                img.src = `images/${randomImage}`;
            }
        });
    }

    // Filtres du portfolio
    setupPortfolioFilters() {
        const filterBtns = window.Utils.$$('.filter-btn');
        const portfolioItems = window.Utils.$$('.portfolio-item');

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');

                // Mise à jour des boutons actifs
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Filtrage des éléments
                portfolioItems.forEach(item => {
                    const category = item.getAttribute('data-category');

                    if (filter === 'all' || category === filter) {
                        item.style.display = 'block';
                        item.style.animation = 'fadeInUp 0.6s ease-out';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // Formulaire de contact moderne
    setupContactForm() {
        const form = window.Utils.$('#contactForm');
        if (!form) {
            return;
        }

        const inputs = form.querySelectorAll('input, textarea');
        const submitBtn = form.querySelector('.submit-button');

        // Animation des labels flottants
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentNode.classList.add('focused');
            });

            input.addEventListener('blur', () => {
                if (!input.value.trim()) {
                    input.parentNode.classList.remove('focused');
                }
                this.validateField(input);
            });

            input.addEventListener('input', window.Utils.debounce(() => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            }, 300));
        });

        // Soumission du formulaire
        form.addEventListener('submit', async e => {
            e.preventDefault();
            await this.handleFormSubmit(form, submitBtn);
        });
    }

    /**
     * Setup custom cursor for desktop devices only
     */
    setupCursorFollow() {
        if (window.innerWidth < config.UI.MOBILE_BREAKPOINT) {
            return; // No custom cursor on mobile
        }

        const cursor = this.createCustomCursor();
        this.setupCursorMovement(cursor);
        this.setupCursorInteractions(cursor);
    }

    /**
     * Create custom cursor element
     * @returns {HTMLElement} - The cursor element
     */
    createCustomCursor() {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: ${config.UI.CURSOR_COLORS.DEFAULT};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursor);
        return cursor;
    }

    /**
     * Setup cursor movement tracking
     * @param {HTMLElement} cursor - The cursor element
     */
    setupCursorMovement(cursor) {
        const handleMouseMove = e => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        };

        document.addEventListener('mousemove', handleMouseMove);

        // Store cleanup handler
        this.cleanupHandlers.push(() => {
            document.removeEventListener('mousemove', handleMouseMove);
            cursor.remove();
        });
    }

    /**
     * Setup cursor interactions with interactive elements
     * @param {HTMLElement} cursor - The cursor element
     */
    setupCursorInteractions(cursor) {
        const interactiveElements = window.Utils.$$(config.SELECTORS.INTERACTIVE_ELEMENTS);

        interactiveElements.forEach(el => {
            const handleMouseEnter = () => {
                cursor.style.transform = 'scale(2)';
                cursor.style.background = config.UI.CURSOR_COLORS.HOVER;
            };

            const handleMouseLeave = () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = config.UI.CURSOR_COLORS.DEFAULT;
            };

            el.addEventListener('mouseenter', handleMouseEnter);
            el.addEventListener('mouseleave', handleMouseLeave);

            // Store cleanup handlers
            this.cleanupHandlers.push(() => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
        });
    }

    // Animations au scroll avec Intersection Observer
    setupScrollAnimations() {
        const animatedElements = window.Utils.$$('.service-card, .portfolio-item, .stat, .contact-card, .image-card');

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    entry.target.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.320, 1)';
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    }

    // Observer pour les sections visibles
    setupIntersectionObserver() {
        const sections = window.Utils.$$('section[id]');

        const sectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    this.updateActiveNavDot(sectionId);
                }
            });
        }, {
            threshold: 0.5
        });

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    // Mise à jour de la navigation active
    updateActiveNavDot(activeSection) {
        const navDots = window.Utils.$$('.nav-dot');
        navDots.forEach(dot => {
            dot.classList.remove('active');
            const href = dot.getAttribute('href');
            if (href === `#${activeSection}`) {
                dot.classList.add('active');
            }
        });
    }

    updateActiveNavDotOnScroll() {
        const sections = window.Utils.$$('section[id]');
        let currentSection = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            const sectionHeight = section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        if (currentSection) {
            this.updateActiveNavDot(currentSection);
        }
    }

    // Scroll fluide amélioré
    smoothScrollTo(target) {
        const targetPosition = target.offsetTop - 50;
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        const animation = currentTime => {
            if (start === null) {
                start = currentTime;
            }
            const timeElapsed = currentTime - start;
            const run = this.easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        };

        requestAnimationFrame(animation);
    }

    easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t * t + b;
        }
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }

    /**
     * Validate form field with configuration-based messages
     * @param {HTMLElement} field - The field to validate
     * @returns {boolean} - Whether the field is valid
     */
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        let isValid = true;
        let errorMessage = '';

        // Clear existing error state
        this.clearFieldError(field);

        // Required field validation
        if (field.hasAttribute('required') && !window.Utils.validators.required(value)) {
            isValid = false;
            errorMessage = config.VALIDATION.ERROR_MESSAGES.REQUIRED;
        }

        // Email validation
        if (fieldName === 'email' && value && !window.Utils.validators.email(value)) {
            isValid = false;
            errorMessage = config.VALIDATION.ERROR_MESSAGES.INVALID_EMAIL;
        }

        // Message length validation
        if (fieldName === 'message' && value && !window.Utils.validators.minLength(value, config.VALIDATION.MESSAGE_MIN_LENGTH)) {
            isValid = false;
            errorMessage = config.VALIDATION.ERROR_MESSAGES.MESSAGE_TOO_SHORT;
        }

        // Display error if invalid
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    /**
     * Clear error state from field
     * @param {HTMLElement} field - The field to clear
     */
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    /**
     * Show error message for field
     * @param {HTMLElement} field - The field with error
     * @param {string} message - Error message to display
     */
    showFieldError(field, message) {
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff6b6b;
            font-size: 0.8rem;
            margin-top: 0.5rem;
            position: absolute;
            bottom: -1.5rem;
            left: 0;
        `;
        field.parentNode.style.position = 'relative';
        field.parentNode.appendChild(errorDiv);
    }

    /**
     * Handle form submission with validation and loading states
     * @param {HTMLFormElement} form - The form to submit
     * @param {HTMLElement} submitBtn - The submit button
     */
    async handleFormSubmit(form, submitBtn) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Validate all fields
        if (!this.validateAllFields(form)) {
            window.Utils.showNotification(config.FORM.VALIDATION_ERROR_MESSAGE, 'error');
            return;
        }

        // Set loading state
        const originalText = this.setLoadingState(submitBtn, true);

        try {
            // Simulate API call (replace with real endpoint)
            await new Promise(resolve => setTimeout(resolve, config.FORM.SUBMISSION_DELAY));

            // Success handling
            this.handleSubmissionSuccess(form, data);

        } catch (error) {
            this.handleSubmissionError();
        } finally {
            // Reset loading state
            this.setLoadingState(submitBtn, false, originalText);
        }
    }

    /**
     * Validate all form fields
     * @param {HTMLFormElement} form - The form to validate
     * @returns {boolean} - Whether all fields are valid
     */
    validateAllFields(form) {
        const inputs = form.querySelectorAll('input, textarea');
        let isFormValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });

        return isFormValid;
    }

    /**
     * Set loading state for submit button
     * @param {HTMLElement} submitBtn - The submit button
     * @param {boolean} isLoading - Whether to show loading state
     * @param {string} originalText - Original button text (for reset)
     * @returns {string} - Original text if setting loading state
     */
    setLoadingState(submitBtn, isLoading, originalText = null) {
        const span = submitBtn.querySelector('span');

        if (isLoading) {
            const original = span.textContent;
            span.textContent = config.FORM.LOADING_TEXT;
            submitBtn.disabled = true;
            submitBtn.style.opacity = config.UI.LOADING_OPACITY;
            return original;
        } else {
            span.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }

    /**
     * Handle successful form submission
     * @param {HTMLFormElement} form - The submitted form
     * @param {Object} data - Form data
     */
    handleSubmissionSuccess(form, data) {
        window.Utils.showNotification(config.FORM.SUCCESS_MESSAGE, 'success');
        form.reset();

        // Save contact data for future use
        window.Utils.storage.set(config.STORAGE.CONTACT_DATA_KEY, {
            name: data.name,
            email: data.email,
            timestamp: Date.now()
        });
    }

    /**
     * Handle form submission error
     */
    handleSubmissionError() {
        window.Utils.showNotification(config.FORM.ERROR_MESSAGE, 'error');
    }

    /**
     * Load and apply user preferences
     */
    loadUserPreferences() {
        this.loadSavedContactData();
        this.setupAccessibilityPreferences();
        this.setupThemePreferences();
    }

    /**
     * Load saved contact data if not expired
     */
    loadSavedContactData() {
        const savedData = window.Utils.storage.get(config.STORAGE.CONTACT_DATA_KEY);
        if (!savedData || !this.isContactDataValid(savedData)) {
            return;
        }

        const nameField = window.Utils.$('#name');
        const emailField = window.Utils.$('#email');

        if (nameField && !nameField.value) {
            nameField.value = savedData.name || '';
        }
        if (emailField && !emailField.value) {
            emailField.value = savedData.email || '';
        }
    }

    /**
     * Check if saved contact data is still valid (not expired)
     * @param {Object} savedData - The saved contact data
     * @returns {boolean} - Whether the data is valid
     */
    isContactDataValid(savedData) {
        return Date.now() - savedData.timestamp < config.STORAGE.CONTACT_DATA_EXPIRY;
    }

    /**
     * Setup accessibility preferences from system
     */
    setupAccessibilityPreferences() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition', 'none');
        }
    }

    /**
     * Setup theme preferences and listeners
     */
    setupThemePreferences() {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleThemeChange = () => {
            document.body.classList.toggle('dark-mode', darkModeQuery.matches);
        };

        // Apply initial theme
        handleThemeChange();

        // Listen for changes
        darkModeQuery.addListener(handleThemeChange);

        // Store cleanup handler
        this.cleanupHandlers.push(() => {
            darkModeQuery.removeListener(handleThemeChange);
        });
    }

    /**
     * Cache DOM element for performance
     * @param {string} selector - CSS selector
     * @param {string} key - Cache key (optional, defaults to selector)
     * @returns {HTMLElement|null} - The cached element
     */
    getCachedElement(selector, key = null) {
        const cacheKey = key || selector;

        if (!this.domCache.has(cacheKey)) {
            const element = $(selector);
            this.domCache.set(cacheKey, element);
        }

        return this.domCache.get(cacheKey);
    }

    /**
     * Clear DOM cache
     */
    clearCache() {
        this.domCache.clear();
    }

    /**
     * Clean up all event handlers and resources
     * Call this when destroying the instance
     */
    destroy() {
        // Execute all cleanup handlers
        this.cleanupHandlers.forEach(handler => {
            try {
                handler();
            } catch (error) {
                // Silently handle cleanup errors
            }
        });

        // Clear arrays and cache
        this.cleanupHandlers.length = 0;
        this.clearCache();
    }
}

// Initialisation de l'application
const app = new XylocopeModern();

// Exposition globale pour le debug
window.XylocopeApp = app;

// Styles CSS additionnels injectés via JavaScript
window.Utils.ready(() => {
    if (!window.Utils.$('#dynamic-styles')) {
        const style = document.createElement('style');
        style.id = 'dynamic-styles';
        style.textContent = `
            .field-error {
                color: #ff6b6b;
                font-size: 0.8rem;
                margin-top: 0.5rem;
                position: absolute;
                bottom: -1.5rem;
                left: 0;
            }
            
            .input-container.error input,
            .input-container.error textarea {
                border-color: #ff6b6b;
                box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
            }
            
            .notification {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: var(--glass-bg);
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border);
                border-radius: 15px;
                padding: 1rem 1.5rem;
                color: var(--text-primary);
                z-index: 10000;
                transform: translateX(100%);
                transition: transform 0.3s ease;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification.success {
                border-left: 4px solid #4ade80;
            }
            
            .notification.error {
                border-left: 4px solid #ef4444;
            }
            
            @media (max-width: 768px) {
                .notification {
                    top: 1rem;
                    right: 1rem;
                    left: 1rem;
                    transform: translateY(-100%);
                }
                
                .notification.show {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
});
