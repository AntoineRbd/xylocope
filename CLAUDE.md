# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Xylocope is a modern, responsive website built with vanilla HTML, CSS, and JavaScript. The project emphasizes clean code, performance, and accessibility while maintaining a professional design.

## Project Structure

```
xylocope/
├── index.html              # Main HTML file with complete site structure
├── css/
│   ├── reset.css          # CSS reset and normalization
│   ├── main.css           # Main styles with CSS variables and components
│   └── responsive.css     # Media queries and responsive design
├── js/
│   ├── utils.js           # Utility functions and helper methods
│   └── main.js            # Main application logic and interactivity
├── images/                # Image assets (hero, about, etc.)
├── assets/
│   ├── icons/            # SVG icons and favicon
│   └── fonts/            # Custom fonts (if any)
├── src/
│   ├── components/       # Reusable component templates (future use)
│   └── utils/            # Additional utility modules (future use)
└── docs/                 # Documentation files
```

## Development Commands

**Start development server:**
```bash
npm start                 # Starts live-server on port 3000
npm run dev              # Alias for npm start
```

**Build and optimization:**
```bash
npm run build            # Minify CSS and JavaScript
npm run minify-css       # Minify CSS files to dist/css/
npm run minify-js        # Minify JS files to dist/js/
npm run optimize-images  # Optimize images to dist/images/
npm run deploy           # Full build with image optimization
```

**Code quality:**
```bash
npm run lint             # ESLint JavaScript files
npm run format           # Format code with Prettier
npm run validate-html    # Validate HTML structure
npm run test             # Run linting and HTML validation
```

## Architecture

### CSS Architecture
- **CSS Variables**: Centralized design tokens in `:root` for colors, spacing, and typography
- **Modular CSS**: Separated into reset, main styles, and responsive layers
- **Mobile-first**: Responsive design using min-width media queries
- **Component-based**: Styles organized by UI components (header, hero, services, etc.)

### JavaScript Architecture
- **Utility-first**: Core utilities in `utils.js` exposed via `window.Utils`
- **Class-based main**: `XylocopeWebsite` class manages all site functionality
- **Event-driven**: Uses modern event handling with debouncing and throttling
- **Modular functions**: Separated concerns (navigation, forms, animations, etc.)

### Key Features
- **Responsive navigation**: Mobile hamburger menu with smooth transitions
- **Smooth scrolling**: Animated scroll-to-section with active nav highlighting
- **Form validation**: Real-time validation with visual feedback
- **Scroll animations**: Intersection Observer for fade-in effects
- **Theme support**: Dark mode detection and preference storage
- **Performance optimized**: Throttled scroll handlers and debounced inputs

## Development Guidelines

### CSS
- Use CSS custom properties for consistent theming
- Follow BEM-like naming conventions for components
- Maintain mobile-first responsive approach
- Leverage CSS Grid and Flexbox for layouts

### JavaScript
- Use modern ES6+ features (classes, arrow functions, destructuring)
- Implement proper error handling for API calls and form submissions
- Use debouncing/throttling for performance-critical event handlers
- Maintain separation of concerns between utilities and main application logic

### Performance
- Lazy load images and optimize assets
- Use CSS transforms for animations (GPU acceleration)
- Implement intersection observers for scroll-triggered animations
- Minimize DOM queries by caching selectors

## Browser Support

Supports modern browsers as defined in `browserslist`:
- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with >1% usage

## Development Notes

- All assets paths assume relative positioning from root
- Form submission currently simulated (replace with actual endpoint)
- Images and icons need to be added to respective directories
- Dark mode styles included but theme toggle not implemented in UI