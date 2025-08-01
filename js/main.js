/**
 * Main JavaScript for Xylocope website
 */

// Import utilities
const { $, $$, ready, debounce, throttle, scrollToElement, observeElements, validators, setLoadingState, showNotification, storage } = window.Utils;

// Website main functionality
class XylocopeWebsite {
    constructor() {
        this.init();
    }
    
    init() {
        ready(() => {
            this.setupNavigation();
            this.setupScrollEffects();
            this.setupAnimations();
            this.setupContactForm();
            this.setupMobileMenu();
            this.setupSmoothScroll();
            this.loadUserPreferences();
        });
    }
    
    // Navigation functionality
    setupNavigation() {
        const header = $('.header');
        const navLinks = $$('.nav-link');
        
        // Header scroll effect
        const handleScroll = throttle(() => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            
            this.updateActiveNavLink();
        }, 100);
        
        window.addEventListener('scroll', handleScroll);
        
        // Set active nav link on page load
        this.updateActiveNavLink();
    }
    
    // Update active navigation link based on scroll position
    updateActiveNavLink() {
        const sections = $$('section[id]');
        const navLinks = $$('.nav-link');
        const headerHeight = $('.header').offsetHeight;
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 50;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // Mobile menu functionality
    setupMobileMenu() {
        const hamburger = $('.hamburger');
        const navMenu = $('.nav-menu');
        const navLinks = $$('.nav-link');
        
        if (!hamburger || !navMenu) return;
        
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
        
        // Close menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
    
    // Smooth scroll for anchor links
    setupSmoothScroll() {
        const anchorLinks = $$('a[href^="#"]');
        const headerHeight = $('.header').offsetHeight;
        
        anchorLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                const targetElement = $(href);
                if (targetElement) {
                    e.preventDefault();
                    scrollToElement(targetElement, headerHeight + 20);
                }
            });
        });
    }
    
    // Scroll-triggered animations
    setupAnimations() {
        const animatedElements = $$('.service-card, .contact-item, .about-text, .about-image');
        
        observeElements(animatedElements, (element) => {
            element.classList.add('fade-in-up');
        }, {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        });
    }
    
    // Scroll effects for various elements
    setupScrollEffects() {
        const hero = $('.hero');
        if (!hero) return;
        
        const handleScroll = throttle(() => {
            const scrolled = window.scrollY;
            const heroHeight = hero.offsetHeight;
            
            // Parallax effect for hero
            if (scrolled < heroHeight) {
                const heroImage = $('.hero-image');
                if (heroImage) {
                    heroImage.style.transform = `translateY(${scrolled * 0.5}px)`;
                }
            }
            
            // Fade out hero content
            const heroContent = $('.hero-content');
            if (heroContent && scrolled < heroHeight) {
                const opacity = Math.max(0, 1 - (scrolled / heroHeight) * 1.5);
                heroContent.style.opacity = opacity;
            }
        }, 16); // ~60fps
        
        window.addEventListener('scroll', handleScroll);
    }
    
    // Contact form functionality
    setupContactForm() {
        const form = $('#contactForm');
        if (!form) return;
        
        const inputs = form.querySelectorAll('input, textarea');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Real-time validation
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', debounce(() => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            }, 300));
        });
        
        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit(form, submitBtn);
        });
    }
    
    // Validate individual form field
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error state
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Required field validation
        if (field.hasAttribute('required') && !validators.required(value)) {
            isValid = false;
            errorMessage = 'Ce champ est requis.';
        }
        
        // Email validation
        if (fieldName === 'email' && value && !validators.email(value)) {
            isValid = false;
            errorMessage = 'Veuillez entrer une adresse email valide.';
        }
        
        // Message length validation
        if (fieldName === 'message' && value && !validators.minLength(value, 10)) {
            isValid = false;
            errorMessage = 'Le message doit contenir au moins 10 caractères.';
        }
        
        // Show error if invalid
        if (!isValid) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = errorMessage;
            field.parentNode.appendChild(errorDiv);
        }
        
        return isValid;
    }
    
    // Handle form submission
    async handleFormSubmit(form, submitBtn) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate all fields
        const inputs = form.querySelectorAll('input, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            showNotification('Veuillez corriger les erreurs dans le formulaire.', 'error');
            return;
        }
        
        // Show loading state
        setLoadingState(submitBtn, true);
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Envoi en cours...';
        
        try {
            // Simulate API call (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Here you would normally send the data to your server
            console.log('Form data:', data);
            
            // Success
            showNotification('Votre message a été envoyé avec succès !', 'success');
            form.reset();
            
            // Save form data to localStorage for future use
            storage.set('lastContactData', {
                name: data.name,
                email: data.email,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Form submission error:', error);
            showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
        } finally {
            // Reset loading state
            setLoadingState(submitBtn, false);
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    // Load user preferences
    loadUserPreferences() {
        // Load saved contact data
        const savedData = storage.get('lastContactData');
        if (savedData && Date.now() - savedData.timestamp < 30 * 24 * 60 * 60 * 1000) { // 30 days
            const nameField = $('#name');
            const emailField = $('#email');
            
            if (nameField && !nameField.value) nameField.value = savedData.name || '';
            if (emailField && !emailField.value) emailField.value = savedData.email || '';
        }
        
        // Load theme preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const savedTheme = storage.get('theme', prefersDark ? 'dark' : 'light');
        this.setTheme(savedTheme);
        
        // Listen for theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addListener((e) => {
            if (!storage.get('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }
    
    // Theme management
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        storage.set('theme', theme);
    }
    
    // Public API methods
    scrollToSection(sectionId) {
        const section = $(`#${sectionId}`);
        const headerHeight = $('.header').offsetHeight;
        
        if (section) {
            scrollToElement(section, headerHeight + 20);
        }
    }
    
    showMessage(message, type = 'info') {
        showNotification(message, type);
    }
}

// Initialize website when DOM is ready
const website = new XylocopeWebsite();

// Expose website instance globally for debugging/external access
window.XylocopeWebsite = website;

// Add CSS for form validation errors
ready(() => {
    if (!$('#form-validation-styles')) {
        const style = document.createElement('style');
        style.id = 'form-validation-styles';
        style.textContent = `
            .form-group input.error,
            .form-group textarea.error {
                border-color: #dc3545;
                box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
            }
            
            .field-error {
                color: #dc3545;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: block;
            }
            
            .header.scrolled {
                background-color: rgba(255, 255, 255, 0.98);
                backdrop-filter: blur(20px);
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            }
            
            @media (max-width: 991px) {
                .menu-open {
                    overflow: hidden;
                }
            }
        `;
        document.head.appendChild(style);
    }
});