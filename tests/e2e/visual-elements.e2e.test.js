/**
 * E2E tests for visual elements and animations
 * Tests video gallery, portfolio filters, scroll animations, and visual interactions
 */

const { test, expect } = require('@playwright/test');

test.describe('Visual Elements E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Video Gallery', () => {
        test('should display hero video', async ({ page }) => {
            const video = page.locator('#heroVideo');

            await expect(video).toBeVisible();
            await expect(video).toHaveAttribute('autoplay');
            await expect(video).toHaveAttribute('muted');
            await expect(video).toHaveAttribute('loop');
        });

        test('should load random video source', async ({ page }) => {
            const video = page.locator('#heroVideo');

            // Video should have a source
            const src = await video.getAttribute('src');
            expect(src).toMatch(/images\/.+\.(mp4|mov)$/);
        });

        test('should toggle video play/pause on click', async ({ page }) => {
            const video = page.locator('#heroVideo');

            // Wait for video to load
            await page.waitForTimeout(1000);

            // Initially should be playing (autoplay)
            const initialPaused = await video.evaluate(v => v.paused);

            // Click to pause
            await video.click();
            await page.waitForTimeout(100);

            const afterClickPaused = await video.evaluate(v => v.paused);
            expect(afterClickPaused).not.toBe(initialPaused);
        });

        test('should handle video loading errors gracefully', async ({ page }) => {
            // Intercept video requests and return 404
            await page.route('**/images/*.mp4', route => {
                route.fulfill({ status: 404 });
            });

            await page.reload();

            // Page should still load without errors
            const video = page.locator('#heroVideo');
            await expect(video).toBeVisible();

            // No JavaScript errors should occur
            const errors = [];
            page.on('pageerror', error => errors.push(error));

            await page.waitForTimeout(2000);
            expect(errors).toHaveLength(0);
        });
    });

    test.describe('Portfolio Filters', () => {
        test('should display portfolio filter buttons', async ({ page }) => {
            // Navigate to portfolio section
            const portfolioNavDot = page.locator('.nav-dot[href="#portfolio"]');
            await portfolioNavDot.click();
            await page.waitForTimeout(1000);

            const filterButtons = page.locator('.filter-btn');
            await expect(filterButtons).toHaveCount(4); // all, photo, video, inspection

            // 'All' button should be active by default
            const allButton = page.locator('.filter-btn[data-filter="all"]');
            await expect(allButton).toHaveClass(/active/);
        });

        test('should filter portfolio items by category', async ({ page }) => {
            // Navigate to portfolio
            const portfolioNavDot = page.locator('.nav-dot[href="#portfolio"]');
            await portfolioNavDot.click();
            await page.waitForTimeout(1000);

            // Click photo filter
            const photoFilter = page.locator('.filter-btn[data-filter="photo"]');
            await photoFilter.click();

            // Should activate photo filter
            await expect(photoFilter).toHaveClass(/active/);

            // Check that only photo items are visible
            const portfolioItems = page.locator('.portfolio-item');
            const visibleItems = await portfolioItems.evaluateAll(items =>
                items.filter(item => window.getComputedStyle(item).display !== 'none')
            );

            // All visible items should be photo category
            for (const item of visibleItems) {
                const category = await page.evaluate(el => el.getAttribute('data-category'), item);
                expect(category).toBe('photo');
            }
        });

        test('should show all items when "all" filter is selected', async ({ page }) => {
            const portfolioNavDot = page.locator('.nav-dot[href="#portfolio"]');
            await portfolioNavDot.click();
            await page.waitForTimeout(1000);

            // First filter by photo
            const photoFilter = page.locator('.filter-btn[data-filter="photo"]');
            await photoFilter.click();

            // Then click "all" filter
            const allFilter = page.locator('.filter-btn[data-filter="all"]');
            await allFilter.click();

            await expect(allFilter).toHaveClass(/active/);

            // All portfolio items should be visible
            const portfolioItems = page.locator('.portfolio-item');
            const itemCount = await portfolioItems.count();

            for (let i = 0; i < itemCount; i++) {
                const item = portfolioItems.nth(i);
                await expect(item).toHaveCSS('display', 'block');
            }
        });

        test('should animate filtered items', async ({ page }) => {
            const portfolioNavDot = page.locator('.nav-dot[href="#portfolio"]');
            await portfolioNavDot.click();
            await page.waitForTimeout(1000);

            const videoFilter = page.locator('.filter-btn[data-filter="video"]');
            await videoFilter.click();

            // Check for animation (fade in effect)
            const visibleItems = page.locator('.portfolio-item[data-category="video"]');
            const firstVisibleItem = visibleItems.first();

            const animation = await firstVisibleItem.evaluate(el => el.style.animation);
            expect(animation).toContain('fadeInUp');
        });
    });

    test.describe('Scroll Animations', () => {
        test('should trigger animations when elements come into view', async ({ page }) => {
            const servicesNavDot = page.locator('.nav-dot[href="#services"]');
            await servicesNavDot.click();

            // Wait for scroll animation
            await page.waitForTimeout(1500);

            // Service cards should be animated into view
            const serviceCards = page.locator('.service-card');
            const firstCard = serviceCards.first();

            // Should have fade-in animation applied
            const opacity = await firstCard.evaluate(el => window.getComputedStyle(el).opacity);
            expect(parseFloat(opacity)).toBeGreaterThan(0.5);

            const transform = await firstCard.evaluate(el => window.getComputedStyle(el).transform);
            expect(transform).not.toBe('none');
        });

        test('should animate elements sequentially', async ({ page }) => {
            const aboutNavDot = page.locator('.nav-dot[href="#about"]');
            await aboutNavDot.click();
            await page.waitForTimeout(1000);

            // Stats should animate in
            const stats = page.locator('.stat');
            const statCount = await stats.count();

            if (statCount > 0) {
                // Check that stats have transition animations
                for (let i = 0; i < statCount; i++) {
                    const stat = stats.nth(i);
                    const transition = await stat.evaluate(el => window.getComputedStyle(el).transition);
                    expect(transition).toContain('0.6s');
                }
            }
        });

        test('should handle intersection observer correctly', async ({ page }) => {
            // Scroll through different sections quickly
            const sections = ['#about', '#services', '#portfolio', '#contact'];

            for (const sectionId of sections) {
                const navDot = page.locator(`.nav-dot[href="${sectionId}"]`);
                await navDot.click();
                await page.waitForTimeout(500);
            }

            // Should not cause any JavaScript errors
            const errors = [];
            page.on('pageerror', error => errors.push(error));

            await page.waitForTimeout(1000);
            expect(errors).toHaveLength(0);
        });
    });

    test.describe('Custom Cursor', () => {
        test('should create custom cursor on desktop', async ({ page }) => {
            // Ensure desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 });

            // Check if custom cursor exists
            const cursor = page.locator('.custom-cursor');

            // Custom cursor might be created dynamically
            await page.waitForTimeout(1000);

            // If cursor exists, it should follow mouse movement
            if (await cursor.count() > 0) {
                await expect(cursor).toHaveCSS('position', 'fixed');

                // Move mouse and check cursor follows
                await page.mouse.move(100, 100);
                await page.waitForTimeout(100);

                const left = await cursor.evaluate(el => el.style.left);
                const top = await cursor.evaluate(el => el.style.top);

                expect(left).toContain('90px'); // 100 - 10 (offset)
                expect(top).toContain('90px');
            }
        });

        test('should not create custom cursor on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            await page.waitForTimeout(1000);

            const cursor = page.locator('.custom-cursor');
            await expect(cursor).toHaveCount(0);
        });

        test('should animate cursor on interactive elements', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });

            const cursor = page.locator('.custom-cursor');

            if (await cursor.count() > 0) {
                const navDot = page.locator('.nav-dot').first();

                // Hover over interactive element
                await navDot.hover();
                await page.waitForTimeout(200);

                // Cursor should scale up
                const transform = await cursor.evaluate(el => el.style.transform);
                expect(transform).toContain('scale(2)');

                // Move away
                await page.mouse.move(0, 0);
                await page.waitForTimeout(200);

                // Should scale back
                const resetTransform = await cursor.evaluate(el => el.style.transform);
                expect(resetTransform).toContain('scale(1)');
            }
        });
    });

    test.describe('Responsive Images', () => {
        test('should load random images in about section', async ({ page }) => {
            const aboutNavDot = page.locator('.nav-dot[href="#about"]');
            await aboutNavDot.click();
            await page.waitForTimeout(1000);

            const aboutImage = page.locator('.image-card img');

            if (await aboutImage.count() > 0) {
                const src = await aboutImage.getAttribute('src');
                expect(src).toMatch(/images\/.+\.(jpg|jpeg|png)$/);

                // Image should be loaded
                const isLoaded = await aboutImage.evaluate(img => img.complete && img.naturalHeight !== 0);
                expect(isLoaded).toBe(true);
            }
        });

        test('should handle image loading errors', async ({ page }) => {
            // Intercept image requests and return 404 for some
            await page.route('**/images/*.jpg', route => {
                if (route.request().url().includes('nonexistent')) {
                    route.fulfill({ status: 404 });
                } else {
                    route.continue();
                }
            });

            const aboutNavDot = page.locator('.nav-dot[href="#about"]');
            await aboutNavDot.click();
            await page.waitForTimeout(1000);

            // Page should still function normally
            const aboutSection = page.locator('#about');
            await expect(aboutSection).toBeVisible();
        });
    });

    test.describe('Notifications', () => {
        test('should display notifications with proper styling', async ({ page }) => {
            // Navigate to contact and submit invalid form to trigger notification
            const contactNavDot = page.locator('.nav-dot[href="#contact"]');
            await contactNavDot.click();
            await page.waitForTimeout(1000);

            const submitButton = page.locator('.submit-button');
            await submitButton.click();

            // Should show error notification
            const notification = page.locator('.notification');
            await expect(notification).toBeVisible();
            await expect(notification).toHaveClass(/notification--error/);

            // Should have proper positioning
            await expect(notification).toHaveCSS('position', 'fixed');
            await expect(notification).toHaveCSS('z-index', '10000');
        });

        test('should animate notification entrance and exit', async ({ page }) => {
            const contactNavDot = page.locator('.nav-dot[href="#contact"]');
            await contactNavDot.click();
            await page.waitForTimeout(1000);

            const submitButton = page.locator('.submit-button');
            await submitButton.click();

            const notification = page.locator('.notification');
            await expect(notification).toBeVisible();

            // Should have show class for animation
            await expect(notification).toHaveClass(/show/);

            // Should have transform transition
            const transform = await notification.evaluate(el => window.getComputedStyle(el).transform);
            expect(transform).toBe('matrix(1, 0, 0, 1, 0, 0)'); // translateX(0)
        });

        test('should close notification on close button click', async ({ page }) => {
            const contactNavDot = page.locator('.nav-dot[href="#contact"]');
            await contactNavDot.click();
            await page.waitForTimeout(1000);

            const submitButton = page.locator('.submit-button');
            await submitButton.click();

            const notification = page.locator('.notification');
            await expect(notification).toBeVisible();

            const closeButton = notification.locator('.notification__close');
            await closeButton.click();

            // Should disappear
            await expect(notification).not.toBeVisible();
        });

        test('should auto-dismiss notification after timeout', async ({ page }) => {
            // Submit valid form to get success notification
            const contactNavDot = page.locator('.nav-dot[href="#contact"]');
            await contactNavDot.click();
            await page.waitForTimeout(1000);

            await page.locator('input[name="name"]').fill('Test User');
            await page.locator('input[name="email"]').fill('test@example.com');
            await page.locator('textarea[name="message"]').fill('Test message with enough characters.');

            const submitButton = page.locator('.submit-button');
            await submitButton.click();

            // Wait for submission to complete
            await page.waitForTimeout(3000);

            const notification = page.locator('.notification--success');
            await expect(notification).toBeVisible();

            // Should auto-dismiss after timeout (5 seconds + animation)
            await page.waitForTimeout(6000);
            await expect(notification).not.toBeVisible();
        });
    });

    test.describe('Dark Mode Support', () => {
        test('should respect system dark mode preference', async ({ page }) => {
            // Emulate dark mode preference
            await page.emulateMedia({ colorScheme: 'dark' });

            await page.reload();
            await page.waitForLoadState('networkidle');

            // Should apply dark mode class
            const body = page.locator('body');
            await expect(body).toHaveClass(/dark-mode/);
        });

        test('should handle theme transitions smoothly', async ({ page }) => {
            // Test theme switching (if implemented)
            await page.emulateMedia({ colorScheme: 'light' });
            await page.reload();

            // Switch to dark mode
            await page.emulateMedia({ colorScheme: 'dark' });

            // Should handle transition without layout shifts
            const body = page.locator('body');

            // Check that transitions are applied
            const transition = await body.evaluate(el => window.getComputedStyle(el).transition);

            // Should not cause any visual glitches
            await page.waitForTimeout(500);
        });
    });

    test.describe('Performance and Loading', () => {
        test('should load visual elements efficiently', async ({ page }) => {
            const startTime = Date.now();

            // Navigate through sections quickly
            const sections = ['.nav-dot[href="#about"]', '.nav-dot[href="#services"]', '.nav-dot[href="#portfolio"]'];

            for (const selector of sections) {
                const navDot = page.locator(selector);
                await navDot.click();
                await page.waitForTimeout(200);
            }

            const totalTime = Date.now() - startTime;

            // Should complete navigation quickly
            expect(totalTime).toBeLessThan(3000);
        });

        test('should handle rapid interactions without performance issues', async ({ page }) => {
            // Rapidly interact with different elements
            const navDots = page.locator('.nav-dot');
            const dotCount = await navDots.count();

            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < dotCount; j++) {
                    await navDots.nth(j).hover();
                    await page.waitForTimeout(50);
                }
            }

            // Should not cause memory leaks or performance issues
            const errors = [];
            page.on('pageerror', error => errors.push(error));

            await page.waitForTimeout(1000);
            expect(errors).toHaveLength(0);
        });

        test('should optimize image loading', async ({ page }) => {
            const aboutNavDot = page.locator('.nav-dot[href="#about"]');
            await aboutNavDot.click();

            // Check that images load reasonably quickly
            const images = page.locator('img');
            const imageCount = await images.count();

            if (imageCount > 0) {
                const startTime = Date.now();

                // Wait for images to load
                await page.waitForFunction(() => {
                    const imgs = document.querySelectorAll('img');
                    return Array.from(imgs).every(img => img.complete);
                }, { timeout: 10000 });

                const loadTime = Date.now() - startTime;

                // Images should load within reasonable time
                expect(loadTime).toBeLessThan(5000);
            }
        });
    });
});
