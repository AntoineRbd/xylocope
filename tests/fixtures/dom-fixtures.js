/**
 * DOM fixtures for testing
 * Provides reusable DOM structures and test data
 */

export const domFixtures = {
  // Complete navigation structure
  navigation: `
    <nav class="futuristic-nav" id="nav">
      <div class="nav-background"></div>
      <div class="nav-content">
        <div class="nav-dots">
          <a href="#hero" class="nav-dot active" data-label="Accueil"></a>
          <a href="#about" class="nav-dot" data-label="À propos"></a>
          <a href="#services" class="nav-dot" data-label="Services"></a>
          <a href="#portfolio" class="nav-dot" data-label="Portfolio"></a>
          <a href="#contact" class="nav-dot" data-label="Contact"></a>
        </div>
      </div>
    </nav>
  `,

  // Mobile menu structure
  mobileMenu: `
    <div class="mobile-menu-trigger" id="mobileMenuTrigger">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <div class="mobile-menu" id="mobileMenu">
      <div class="mobile-menu-content">
        <a href="#hero" class="mobile-menu-item">Accueil</a>
        <a href="#about" class="mobile-menu-item">À propos</a>
        <a href="#services" class="mobile-menu-item">Services</a>
        <a href="#portfolio" class="mobile-menu-item">Portfolio</a>
        <a href="#contact" class="mobile-menu-item">Contact</a>
      </div>
    </div>
  `,

  // Contact form structure
  contactForm: `
    <form id="contactForm" class="contact-form">
      <div class="form-group">
        <div class="input-container">
          <input type="text" id="name" name="name" required>
          <label for="name">Nom complet</label>
        </div>
      </div>
      
      <div class="form-group">
        <div class="input-container">
          <input type="email" id="email" name="email" required>
          <label for="email">Email</label>
        </div>
      </div>
      
      <div class="form-group">
        <div class="input-container">
          <input type="tel" id="phone" name="phone">
          <label for="phone">Téléphone</label>
        </div>
      </div>
      
      <div class="form-group">
        <div class="input-container">
          <textarea id="message" name="message" required></textarea>
          <label for="message">Message</label>
        </div>
      </div>
      
      <button type="submit" class="submit-button">
        <span>Envoyer</span>
      </button>
    </form>
  `,

  // Video gallery structure
  videoGallery: `
    <div class="video-showcase">
      <div class="video-container-modern">
        <video id="heroVideo" autoplay muted loop>
          <source src="images/default-video.mp4" type="video/mp4">
        </video>
      </div>
    </div>
  `,

  // Portfolio section
  portfolio: `
    <section id="portfolio" class="portfolio-section">
      <div class="section-container">
        <div class="portfolio-filters">
          <button class="filter-btn active" data-filter="all">Tous</button>
          <button class="filter-btn" data-filter="photo">Photo</button>
          <button class="filter-btn" data-filter="video">Vidéo</button>
          <button class="filter-btn" data-filter="inspection">Inspection</button>
        </div>
        
        <div class="portfolio-grid">
          <div class="portfolio-item" data-category="photo">
            <img src="images/photo1.jpg" alt="Photo 1">
            <div class="portfolio-overlay">
              <h3>Photo Aérienne</h3>
              <p>Paysage magnifique</p>
            </div>
          </div>
          
          <div class="portfolio-item" data-category="video">
            <img src="images/video-thumb1.jpg" alt="Video 1">
            <div class="portfolio-overlay">
              <h3>Vidéo Drone</h3>
              <p>Vol cinématographique</p>
            </div>
          </div>
          
          <div class="portfolio-item" data-category="photo">
            <img src="images/photo2.jpg" alt="Photo 2">
            <div class="portfolio-overlay">
              <h3>Vue Panoramique</h3>
              <p>Architecture moderne</p>
            </div>
          </div>
          
          <div class="portfolio-item" data-category="inspection">
            <img src="images/inspection1.jpg" alt="Inspection 1">
            <div class="portfolio-overlay">
              <h3>Inspection Technique</h3>
              <p>Contrôle infrastructure</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,

  // Services section with animated cards
  services: `
    <section id="services" class="services-section">
      <div class="section-container">
        <div class="services-grid">
          <div class="service-card" data-service="photo">
            <div class="service-icon">
              <img src="assets/icons/photo_aerienne.png" alt="Photo aérienne">
            </div>
            <h3>Photographie Aérienne</h3>
            <p>Capturer des perspectives uniques depuis les airs.</p>
          </div>
          
          <div class="service-card" data-service="video">
            <div class="service-icon">
              <img src="assets/icons/Video.png" alt="Vidéo drone">
            </div>
            <h3>Vidéo Drone</h3>
            <p>Productions cinématographiques et promotionnelles.</p>
          </div>
          
          <div class="service-card" data-service="inspection">
            <div class="service-icon">
              <img src="assets/icons/inspection.png" alt="Inspection">
            </div>
            <h3>Inspection Technique</h3>
            <p>Contrôles et diagnostics par drone.</p>
          </div>
        </div>
      </div>
    </section>
  `,

  // Main page sections
  sections: `
    <section id="hero" class="hero-section">
      <div class="hero-content">
        <h1>Xylocope</h1>
        <p>Spécialiste en drones & FPV</p>
      </div>
    </section>
    
    <section id="about" class="about-section">
      <div class="section-container">
        <h2>À propos</h2>
        <p>Notre expertise en drone et FPV.</p>
      </div>
    </section>
    
    <section id="services" class="services-section">
      <div class="section-container">
        <h2>Services</h2>
        <div class="services-grid"></div>
      </div>
    </section>
    
    <section id="portfolio" class="portfolio-section">
      <div class="section-container">
        <h2>Portfolio</h2>
        <div class="portfolio-grid"></div>
      </div>
    </section>
    
    <section id="contact" class="contact-section">
      <div class="section-container">
        <h2>Contact</h2>
      </div>
    </section>
  `,

  // Notification structure
  notification: `
    <div class="notification notification--success show">
      <div class="notification__content">
        <span class="notification__message">Message envoyé avec succès!</span>
        <button class="notification__close" aria-label="Fermer">&times;</button>
      </div>
    </div>
  `,

  // Complete minimal page structure
  minimalPage: `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xylocope Test</title>
    </head>
    <body>
      <nav id="nav">
        <div class="nav-dots">
          <a href="#hero" class="nav-dot active"></a>
          <a href="#about" class="nav-dot"></a>
        </div>
      </nav>
      
      <div id="mobileMenuTrigger">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <div id="mobileMenu">
        <a href="#hero" class="mobile-menu-item">Home</a>
        <a href="#about" class="mobile-menu-item">About</a>
      </div>
      
      <main>
        <section id="hero"></section>
        <section id="about"></section>
      </main>
      
      <video id="heroVideo"></video>
      
      <form id="contactForm">
        <input name="name" required>
        <input name="email" type="email" required>
        <textarea name="message" required></textarea>
        <button type="submit" class="submit-button">
          <span>Submit</span>
        </button>
      </form>
    </body>
    </html>
  `
};

// Test data fixtures
export const testData = {
  // Form validation test cases
  formValidation: {
    validData: {
      name: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      phone: '+33123456789',
      message: 'Bonjour, je souhaiterais obtenir plus d\'informations sur vos services de photographie aérienne.'
    },
    
    invalidData: {
      emptyName: { name: '', email: 'valid@email.com', message: 'Valid message' },
      invalidEmail: { name: 'Valid Name', email: 'invalid-email', message: 'Valid message' },
      shortMessage: { name: 'Valid Name', email: 'valid@email.com', message: 'Short' },
      emptyMessage: { name: 'Valid Name', email: 'valid@email.com', message: '' }
    },
    
    edgeCases: {
      longName: { name: 'A'.repeat(100), email: 'valid@email.com', message: 'Valid message' },
      longMessage: { name: 'Valid Name', email: 'valid@email.com', message: 'A'.repeat(1000) },
      specialChars: { name: 'Jean-Marie O\'Connor', email: 'jean-marie@example.com', message: 'Message with special chars: àéèùç' }
    }
  },

  // Video gallery test data
  videos: [
    'Paradise Found! Dive Into This Stunning Seasi.mp4',
    'Mesmerizing Waves and Reefs  Dive Into Seasid.mp4',
    'Vol 16-06_2.mp4',
    'Have You Ever Seen Waves Dance on Endless Blu.mp4',
    'Wow! Breathtaking Seaside Paradise Under Blue.mp4',
    'Retouche photo pointe du grouin.mp4',
    '0000004_video.mp4',
    'Plan7.mov'
  ],

  // Image gallery test data
  images: [
    'Image 2025-07-15 220942_1.1.1.jpg',
    '0000005_photo.jpg',
    'Image 2025-07-15 221050_1.1.1.jpg',
    'DJI_0934.JPG',
    'DJI_0989.JPG'
  ],

  // Portfolio categories
  portfolioCategories: ['all', 'photo', 'video', 'inspection', 'formation'],

  // Navigation sections
  navigationSections: [
    { id: 'hero', label: 'Accueil', href: '#hero' },
    { id: 'about', label: 'À propos', href: '#about' },
    { id: 'services', label: 'Services', href: '#services' },
    { id: 'portfolio', label: 'Portfolio', href: '#portfolio' },
    { id: 'contact', label: 'Contact', href: '#contact' }
  ],

  // User preferences test data
  userPreferences: {
    validSavedData: {
      name: 'Jean Dupont',
      email: 'jean@example.com',
      timestamp: Date.now()
    },
    
    expiredSavedData: {
      name: 'Old User',
      email: 'old@example.com',
      timestamp: Date.now() - (31 * 24 * 60 * 60 * 1000) // 31 days ago
    }
  },

  // API response mocks
  apiResponses: {
    success: {
      status: 200,
      ok: true,
      json: () => Promise.resolve({ success: true, message: 'Form submitted successfully' }),
      headers: { get: () => 'application/json' }
    },
    
    error: {
      status: 500,
      ok: false,
      statusText: 'Internal Server Error'
    },
    
    networkError: new Error('Network connection failed')
  },

  // Scroll and viewport test data
  viewport: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  },

  // Element positions for scroll testing
  elementPositions: {
    hero: { offsetTop: 0, offsetHeight: 600 },
    about: { offsetTop: 600, offsetHeight: 500 },
    services: { offsetTop: 1100, offsetHeight: 600 },
    portfolio: { offsetTop: 1700, offsetHeight: 800 },
    contact: { offsetTop: 2500, offsetHeight: 400 }
  }
};

// Mock factory functions
export const mockFactories = {
  // Create mock DOM element
  createElement: (tagName, attributes = {}, textContent = '') => {
    const element = document.createElement(tagName);
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
    
    if (textContent) {
      element.textContent = textContent;
    }
    
    return element;
  },

  // Create mock video element with all necessary methods
  createMockVideo: (attributes = {}) => {
    const video = mockFactories.createElement('video', attributes);
    
    video.play = jest.fn().mockResolvedValue();
    video.pause = jest.fn();
    video.load = jest.fn();
    
    Object.defineProperties(video, {
      paused: { value: false, writable: true },
      currentTime: { value: 0, writable: true },
      duration: { value: 120, writable: true },
      volume: { value: 1, writable: true },
      muted: { value: true, writable: true }
    });
    
    return video;
  },

  // Create mock form with validation
  createMockForm: (formData = testData.formValidation.validData) => {
    const form = mockFactories.createElement('form', { id: 'contactForm' });
    
    Object.entries(formData).forEach(([name, value]) => {
      const input = name === 'message' 
        ? mockFactories.createElement('textarea', { name, required: '' })
        : mockFactories.createElement('input', { 
            name, 
            type: name === 'email' ? 'email' : 'text',
            required: name !== 'phone' ? '' : undefined
          });
      
      input.value = value;
      
      const container = mockFactories.createElement('div', { class: 'input-container' });
      container.appendChild(input);
      form.appendChild(container);
    });
    
    const submitButton = mockFactories.createElement('button', { 
      type: 'submit', 
      class: 'submit-button' 
    });
    const submitSpan = mockFactories.createElement('span', {}, 'Envoyer');
    submitButton.appendChild(submitSpan);
    form.appendChild(submitButton);
    
    return form;
  },

  // Create mock IntersectionObserver
  createMockIntersectionObserver: () => {
    const mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn()
    };
    
    global.IntersectionObserver = jest.fn((callback) => {
      mockObserver.callback = callback;
      return mockObserver;
    });
    
    return mockObserver;
  },

  // Create mock media query
  createMockMediaQuery: (matches = false) => ({
    matches,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }),

  // Create mock fetch response
  createMockFetchResponse: (data, options = {}) => {
    const defaultOptions = {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map([['content-type', 'application/json']])
    };
    
    const response = { ...defaultOptions, ...options };
    
    response.json = jest.fn().mockResolvedValue(data);
    response.text = jest.fn().mockResolvedValue(typeof data === 'string' ? data : JSON.stringify(data));
    response.headers = {
      get: jest.fn((key) => response.headers.get ? response.headers.get(key) : 'application/json')
    };
    
    return response;
  },

  // Create mock local storage
  createMockStorage: (initialData = {}) => {
    const storage = { ...initialData };
    
    return {
      getItem: jest.fn((key) => storage[key] || null),
      setItem: jest.fn((key, value) => { storage[key] = value; }),
      removeItem: jest.fn((key) => { delete storage[key]; }),
      clear: jest.fn(() => { Object.keys(storage).forEach(key => delete storage[key]); }),
      length: Object.keys(storage).length,
      key: jest.fn((index) => Object.keys(storage)[index] || null)
    };
  }
};