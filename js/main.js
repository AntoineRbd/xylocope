/**
 * JavaScript pour Xylocope - Design ultra-moderne
 */

// Import utilities
const { $, $$, ready, debounce, throttle, scrollToElement, observeElements, validators, setLoadingState, showNotification, storage } = window.Utils;

// Application principale
class XylocopeModern {
    constructor() {
        // Toutes les vidéos disponibles dans le dossier images
        this.allVideos = [
            'Paradise Found! Dive Into This Stunning Seasi.mp4',
            'Mesmerizing Waves and Reefs  Dive Into Seasid.mp4',
            'Vol 16-06_2.mp4',
            'Have You Ever Seen Waves Dance on Endless Blu.mp4',
            'Wow! Breathtaking Seaside Paradise Under Blue.mp4',
            'Retouche photo pointe du grouin.mp4',
            '0000004_video.mp4',
            'Plan7.mov'
        ];
        this.images = [
            'Image 2025-07-15 220942_1.1.1.jpg',
            '0000005_photo.jpg',
            'Image 2025-07-15 221050_1.1.1.jpg'
        ];
        this.currentVideoIndex = 0;
        this.shuffledVideos = [...this.allVideos].sort(() => Math.random() - 0.5);
        this.isAutoPlaying = true;
        
        this.init();
    }
    
    init() {
        ready(() => {
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
        const navDots = $$('.nav-dot');
        const sections = $$('section[id]');
        
        // Gestion des clics sur les points de navigation
        navDots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = dot.getAttribute('href').substring(1);
                const targetSection = $(`#${targetId}`);
                
                if (targetSection) {
                    this.smoothScrollTo(targetSection);
                    this.updateActiveNavDot(targetId);
                }
            });
        });
        
        // Mise à jour des points actifs lors du scroll
        const handleScroll = throttle(() => {
            this.updateActiveNavDotOnScroll();
        }, 100);
        
        window.addEventListener('scroll', handleScroll);
        this.updateActiveNavDotOnScroll();
    }
    
    // Menu mobile moderne
    setupMobileMenu() {
        const menuTrigger = $('#mobileMenuTrigger');
        const mobileMenu = $('#mobileMenu');
        const mobileMenuItems = $$('.mobile-menu-item');
        
        if (!menuTrigger || !mobileMenu) return;
        
        menuTrigger.addEventListener('click', () => {
            const isOpen = mobileMenu.style.display === 'flex';
            this.toggleMobileMenu(!isOpen);
        });
        
        // Fermer le menu lors du clic sur un lien
        mobileMenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                const targetSection = $(`#${targetId}`);
                
                if (targetSection) {
                    this.toggleMobileMenu(false);
                    setTimeout(() => {
                        this.smoothScrollTo(targetSection);
                    }, 300);
                }
            });
        });
        
        // Fermer le menu en cliquant en dehors
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                this.toggleMobileMenu(false);
            }
        });
    }
    
    toggleMobileMenu(show) {
        const menuTrigger = $('#mobileMenuTrigger');
        const mobileMenu = $('#mobileMenu');
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
        const videoElement = $('#heroVideo');
        
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
        videoElement.play().catch(e => console.log('Autoplay prevented:', e));
        
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
        const aboutImage = $('.image-card img');
        if (aboutImage && this.images.length > 0) {
            const randomImage = this.images[Math.floor(Math.random() * this.images.length)];
            aboutImage.src = `images/${randomImage}`;
        }
        
        // Images dans le portfolio
        const portfolioImages = $$('.portfolio-item[data-category="photo"] img');
        portfolioImages.forEach(img => {
            if (this.images.length > 0) {
                const randomImage = this.images[Math.floor(Math.random() * this.images.length)];
                img.src = `images/${randomImage}`;
            }
        });
    }
    
    // Filtres du portfolio
    setupPortfolioFilters() {
        const filterBtns = $$('.filter-btn');
        const portfolioItems = $$('.portfolio-item');
        
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
        const form = $('#contactForm');
        if (!form) return;
        
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
            
            input.addEventListener('input', debounce(() => {
                if (input.classList.contains('error')) {
                    this.validateField(input);
                }
            }, 300));
        });
        
        // Soumission du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit(form, submitBtn);
        });
    }
    
    // Curseur personnalisé qui suit la souris
    setupCursorFollow() {
        if (window.innerWidth < 768) return; // Pas de curseur personnalisé sur mobile
        
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: rgba(139, 95, 191, 0.8);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
        `;
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        });
        
        // Agrandir le curseur sur les éléments interactifs
        const interactiveElements = $$('a, button, .nav-dot, .filter-btn, .service-card');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(2)';
                cursor.style.background = 'rgba(255, 140, 66, 0.8)';
            });
            
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursor.style.background = 'rgba(139, 95, 191, 0.8)';
            });
        });
    }
    
    // Animations au scroll avec Intersection Observer
    setupScrollAnimations() {
        const animatedElements = $$('.service-card, .portfolio-item, .stat, .contact-card, .image-card');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
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
        const sections = $$('section[id]');
        
        const sectionObserver = new IntersectionObserver((entries) => {
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
        const navDots = $$('.nav-dot');
        navDots.forEach(dot => {
            dot.classList.remove('active');
            const href = dot.getAttribute('href');
            if (href === `#${activeSection}`) {
                dot.classList.add('active');
            }
        });
    }
    
    updateActiveNavDotOnScroll() {
        const sections = $$('section[id]');
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
        
        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = this.easeInOutCubic(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };
        
        requestAnimationFrame(animation);
    }
    
    easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t * t + b;
        t -= 2;
        return c / 2 * (t * t * t + 2) + b;
    }
    
    // Validation des champs
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        let isValid = true;
        let errorMessage = '';
        
        // Supprimer l'état d'erreur existant
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Validation des champs requis
        if (field.hasAttribute('required') && !validators.required(value)) {
            isValid = false;
            errorMessage = 'Ce champ est requis.';
        }
        
        // Validation de l'email
        if (fieldName === 'email' && value && !validators.email(value)) {
            isValid = false;
            errorMessage = 'Veuillez entrer une adresse email valide.';
        }
        
        // Validation de la longueur du message
        if (fieldName === 'message' && value && !validators.minLength(value, 10)) {
            isValid = false;
            errorMessage = 'Le message doit contenir au moins 10 caractères.';
        }
        
        // Afficher l'erreur si invalide
        if (!isValid) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = errorMessage;
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
        
        return isValid;
    }
    
    // Gestion de la soumission du formulaire
    async handleFormSubmit(form, submitBtn) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validation de tous les champs
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
        
        // État de chargement
        const originalText = submitBtn.querySelector('span').textContent;
        submitBtn.querySelector('span').textContent = 'Envoi...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        
        try {
            // Simulation d'envoi (remplacer par vraie API)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('Données du formulaire:', data);
            
            // Succès
            showNotification('Votre message a été envoyé avec succès !', 'success');
            form.reset();
            
            // Sauvegarder les données pour la prochaine fois
            storage.set('lastContactData', {
                name: data.name,
                email: data.email,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('Erreur lors de l\'envoi:', error);
            showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
        } finally {
            // Reset de l'état
            submitBtn.querySelector('span').textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
        }
    }
    
    // Chargement des préférences utilisateur
    loadUserPreferences() {
        // Charger les données de contact sauvegardées
        const savedData = storage.get('lastContactData');
        if (savedData && Date.now() - savedData.timestamp < 30 * 24 * 60 * 60 * 1000) {
            const nameField = $('#name');
            const emailField = $('#email');
            
            if (nameField && !nameField.value) nameField.value = savedData.name || '';
            if (emailField && !emailField.value) emailField.value = savedData.email || '';
        }
        
        // Détecter les préférences du système
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition', 'none');
        }
        
        // Adaptation au thème sombre du système
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addListener(() => {
            if (darkModeQuery.matches) {
                document.body.classList.add('dark-mode');
            } else {
                document.body.classList.remove('dark-mode');
            }
        });
    }
}

// Initialisation de l'application
const app = new XylocopeModern();

// Exposition globale pour le debug
window.XylocopeApp = app;

// Styles CSS additionnels injectés via JavaScript
ready(() => {
    if (!$('#dynamic-styles')) {
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