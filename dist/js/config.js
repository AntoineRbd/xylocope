/**
 * Configuration constants for Xylocope website
 * Centralized configuration management
 */

const XylocopeConfig = {
    // Media assets
    VIDEOS: [
        'Paradise Found! Dive Into This Stunning Seasi.mp4',
        'Mesmerizing Waves and Reefs  Dive Into Seasid.mp4',
        'Vol 16-06_2.mp4',
        'Have You Ever Seen Waves Dance on Endless Blu.mp4',
        'Wow! Breathtaking Seaside Paradise Under Blue.mp4',
        'Retouche photo pointe du grouin.mp4',
        '0000004_video.mp4',
        'Plan7.mov'
    ],

    IMAGES: [
        'Image 2025-07-15 220942_1.1.1.jpg',
        '0000005_photo.jpg',
        'Image 2025-07-15 221050_1.1.1.jpg'
    ],

    // Animation settings
    ANIMATION: {
        SCROLL_OFFSET: 50,
        SMOOTH_SCROLL_DURATION: 1000,
        INTERSECTION_THRESHOLD: 0.1,
        INTERSECTION_ROOT_MARGIN: '0px 0px -50px 0px',
        FADE_IN_DURATION: '0.6s',
        FADE_IN_EASING: 'cubic-bezier(0.23, 1, 0.320, 1)',
        MOBILE_MENU_DELAY: 300
    },

    // Form validation
    VALIDATION: {
        MESSAGE_MIN_LENGTH: 10,
        DEBOUNCE_DELAY: 300,
        ERROR_MESSAGES: {
            REQUIRED: 'Ce champ est requis.',
            INVALID_EMAIL: 'Veuillez entrer une adresse email valide.',
            MESSAGE_TOO_SHORT: 'Le message doit contenir au moins 10 caractères.'
        }
    },

    // UI settings
    UI: {
        MOBILE_BREAKPOINT: 768,
        THROTTLE_SCROLL_DELAY: 100,
        NOTIFICATION_DURATION: 5000,
        LOADING_OPACITY: '0.7',
        CURSOR_COLORS: {
            DEFAULT: 'rgba(139, 95, 191, 0.8)',
            HOVER: 'rgba(255, 140, 66, 0.8)'
        }
    },

    // Storage settings
    STORAGE: {
        CONTACT_DATA_KEY: 'lastContactData',
        CONTACT_DATA_EXPIRY: 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    },

    // Form submission
    FORM: {
        SUBMISSION_DELAY: 2000, // Simulate network delay
        LOADING_TEXT: 'Envoi...',
        SUCCESS_MESSAGE: 'Votre message a été envoyé avec succès !',
        ERROR_MESSAGE: 'Une erreur est survenue. Veuillez réessayer.',
        VALIDATION_ERROR_MESSAGE: 'Veuillez corriger les erreurs dans le formulaire.'
    },

    // CSS selectors (for easy maintenance)
    SELECTORS: {
        NAV_DOT: '.nav-dot',
        MOBILE_MENU_TRIGGER: '#mobileMenuTrigger',
        MOBILE_MENU: '#mobileMenu',
        MOBILE_MENU_ITEM: '.mobile-menu-item',
        HERO_VIDEO: '#heroVideo',
        CONTACT_FORM: '#contactForm',
        SUBMIT_BUTTON: '.submit-button',
        ANIMATED_ELEMENTS: '.service-card, .portfolio-item, .stat, .contact-card, .image-card',
        PORTFOLIO_FILTER: '.filter-btn',
        PORTFOLIO_ITEM: '.portfolio-item',
        INTERACTIVE_ELEMENTS: 'a, button, .nav-dot, .filter-btn, .service-card'
    }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.XylocopeConfig = XylocopeConfig;
}

// Export for Node.js (testing environment)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XylocopeConfig;
}
