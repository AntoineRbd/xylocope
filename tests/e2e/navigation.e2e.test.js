/**
 * E2E tests for navigation functionality
 * Tests the complete navigation flow including mobile menu and scroll behavior
 */

const { test, expect } = require('@playwright/test');

test.describe('Navigation E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');
    });

    test.describe('Desktop Navigation', () => {
        test('should navigate between sections using nav dots', async ({ page }) => {
            // Check initial state - hero nav dot should be active
            const heroNavDot = page.locator('.nav-dot[href="#hero"]');
            const aboutNavDot = page.locator('.nav-dot[href="#about"]');

            await expect(heroNavDot).toHaveClass(/active/);

            // Click about nav dot
            await aboutNavDot.click();

            // Wait for smooth scroll animation
            await page.waitForTimeout(1000);

            // Check that about section is in view and nav dot is active
            await expect(aboutNavDot).toHaveClass(/active/);
            await expect(heroNavDot).not.toHaveClass(/active/);

            // Verify scroll position changed
            const scrollY = await page.evaluate(() => window.scrollY);
            expect(scrollY).toBeGreaterThan(0);
        });

        test('should update active nav dot on scroll', async ({ page }) => {
            const servicesNavDot = page.locator('.nav-dot[href="#services"]');
            const servicesSection = page.locator('#services');

            // Scroll to services section
            await servicesSection.scrollIntoView();
            await page.waitForTimeout(500);

            // Check that services nav dot becomes active
            await expect(servicesNavDot).toHaveClass(/active/);
        });

        test('should navigate to all main sections', async ({ page }) => {
            const sections = ['#about', '#services', '#portfolio', '#contact'];

            for (const sectionId of sections) {
                const navDot = page.locator(`.nav-dot[href="${sectionId}"]`);
                const section = page.locator(sectionId);

                await navDot.click();
                await page.waitForTimeout(1000);

                // Verify section is visible
                await expect(section).toBeInViewport();
                await expect(navDot).toHaveClass(/active/);
            }
        });
    });

    test.describe('Mobile Navigation', () => {
        test('should open and close mobile menu', async ({ page }) => {
            // Switch to mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            const menuTrigger = page.locator('#mobileMenuTrigger');
            const mobileMenu = page.locator('#mobileMenu');

            // Initially menu should be hidden
            await expect(mobileMenu).toHaveCSS('display', 'none');

            // Click menu trigger to open
            await menuTrigger.click();

            // Menu should be visible
            await expect(mobileMenu).toHaveCSS('display', 'flex');

            // Body should have overflow hidden (prevent scrolling)
            const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
            expect(bodyOverflow).toBe('hidden');

            // Click menu trigger again to close
            await menuTrigger.click();

            // Menu should be hidden again
            await expect(mobileMenu).toHaveCSS('display', 'none');
        });

        test('should navigate using mobile menu items', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const menuTrigger = page.locator('#mobileMenuTrigger');
            const mobileMenu = page.locator('#mobileMenu');
            const aboutMenuItem = page.locator('.mobile-menu-item[href="#about"]');

            // Open mobile menu
            await menuTrigger.click();
            await expect(mobileMenu).toHaveCSS('display', 'flex');

            // Click about menu item
            await aboutMenuItem.click();

            // Wait for navigation and menu close animation
            await page.waitForTimeout(1000);

            // Menu should close
            await expect(mobileMenu).toHaveCSS('display', 'none');

            // Should navigate to about section
            const aboutSection = page.locator('#about');
            await expect(aboutSection).toBeInViewport();
        });

        test('should close mobile menu when clicking outside', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const menuTrigger = page.locator('#mobileMenuTrigger');
            const mobileMenu = page.locator('#mobileMenu');

            // Open mobile menu
            await menuTrigger.click();
            await expect(mobileMenu).toHaveCSS('display', 'flex');

            // Click on the menu overlay (outside content)
            await mobileMenu.click();

            // Menu should close
            await expect(mobileMenu).toHaveCSS('display', 'none');
        });

        test('should animate hamburger icon on toggle', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const menuTrigger = page.locator('#mobileMenuTrigger');
            const spans = menuTrigger.locator('span');

            // Click to open menu
            await menuTrigger.click();

            // Check hamburger animation (transformed to X)
            const firstSpanTransform = await spans.nth(0).evaluate(el => el.style.transform);
            const secondSpanOpacity = await spans.nth(1).evaluate(el => el.style.opacity);
            const thirdSpanTransform = await spans.nth(2).evaluate(el => el.style.transform);

            expect(firstSpanTransform).toContain('rotate(45deg)');
            expect(secondSpanOpacity).toBe('0');
            expect(thirdSpanTransform).toContain('rotate(-45deg)');

            // Click to close menu
            await menuTrigger.click();

            // Check hamburger is back to normal
            const resetFirstSpan = await spans.nth(0).evaluate(el => el.style.transform);
            const resetSecondSpan = await spans.nth(1).evaluate(el => el.style.opacity);
            const resetThirdSpan = await spans.nth(2).evaluate(el => el.style.transform);

            expect(resetFirstSpan).toBe('');
            expect(resetSecondSpan).toBe('');
            expect(resetThirdSpan).toBe('');
        });
    });

    test.describe('Keyboard Navigation', () => {
        test('should support keyboard navigation for accessibility', async ({ page }) => {
            // Focus on first nav dot
            const firstNavDot = page.locator('.nav-dot').first();
            await firstNavDot.focus();

            // Should be focusable
            await expect(firstNavDot).toBeFocused();

            // Tab through nav dots
            await page.keyboard.press('Tab');
            const secondNavDot = page.locator('.nav-dot').nth(1);
            await expect(secondNavDot).toBeFocused();

            // Press Enter to activate
            await page.keyboard.press('Enter');

            // Should navigate to the section
            await page.waitForTimeout(1000);
            await expect(secondNavDot).toHaveClass(/active/);
        });

        test('should support keyboard navigation in mobile menu', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const menuTrigger = page.locator('#mobileMenuTrigger');

            // Focus and activate menu trigger with keyboard
            await menuTrigger.focus();
            await page.keyboard.press('Enter');

            // Menu should open
            const mobileMenu = page.locator('#mobileMenu');
            await expect(mobileMenu).toHaveCSS('display', 'flex');

            // Tab to first menu item
            await page.keyboard.press('Tab');
            const firstMenuItem = page.locator('.mobile-menu-item').first();
            await expect(firstMenuItem).toBeFocused();
        });
    });

    test.describe('Responsive Navigation', () => {
        test('should show desktop navigation on large screens', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });

            const desktopNav = page.locator('.futuristic-nav');
            const mobileMenuTrigger = page.locator('#mobileMenuTrigger');

            await expect(desktopNav).toBeVisible();
            await expect(mobileMenuTrigger).toBeHidden();
        });

        test('should show mobile navigation on small screens', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const mobileMenuTrigger = page.locator('#mobileMenuTrigger');

            await expect(mobileMenuTrigger).toBeVisible();
        });

        test('should handle viewport resize correctly', async ({ page }) => {
            // Start with desktop
            await page.setViewportSize({ width: 1920, height: 1080 });

            const mobileMenuTrigger = page.locator('#mobileMenuTrigger');
            await expect(mobileMenuTrigger).toBeHidden();

            // Resize to mobile
            await page.setViewportSize({ width: 375, height: 667 });

            await expect(mobileMenuTrigger).toBeVisible();

            // Resize back to desktop
            await page.setViewportSize({ width: 1920, height: 1080 });

            await expect(mobileMenuTrigger).toBeHidden();
        });
    });

    test.describe('Smooth Scrolling', () => {
        test('should perform smooth scroll animation', async ({ page }) => {
            const contactNavDot = page.locator('.nav-dot[href="#contact"]');

            // Record initial scroll position
            const initialScrollY = await page.evaluate(() => window.scrollY);

            // Click contact nav dot
            await contactNavDot.click();

            // Wait for animation to start
            await page.waitForTimeout(100);

            // Check that scroll position is changing (animation in progress)
            const midScrollY = await page.evaluate(() => window.scrollY);
            expect(midScrollY).toBeGreaterThan(initialScrollY);

            // Wait for animation to complete
            await page.waitForTimeout(1500);

            // Check final position
            const finalScrollY = await page.evaluate(() => window.scrollY);
            expect(finalScrollY).toBeGreaterThan(midScrollY);

            // Verify contact section is in viewport
            const contactSection = page.locator('#contact');
            await expect(contactSection).toBeInViewport();
        });

        test('should maintain scroll position after page reload', async ({ page }) => {
            // Navigate to a section
            const aboutNavDot = page.locator('.nav-dot[href="#about"]');
            await aboutNavDot.click();
            await page.waitForTimeout(1000);

            const scrollPosition = await page.evaluate(() => window.scrollY);
            expect(scrollPosition).toBeGreaterThan(0);

            // Reload page
            await page.reload();
            await page.waitForLoadState('networkidle');

            // Should be back at top
            const newScrollPosition = await page.evaluate(() => window.scrollY);
            expect(newScrollPosition).toBe(0);
        });
    });

    test.describe('Navigation Performance', () => {
        test('should load navigation quickly', async ({ page }) => {
            const startTime = Date.now();

            await page.goto('/');

            // Wait for navigation to be ready
            await page.locator('.nav-dot').first().waitFor();

            const loadTime = Date.now() - startTime;

            // Navigation should load within 2 seconds
            expect(loadTime).toBeLessThan(2000);
        });

        test('should handle rapid navigation clicks', async ({ page }) => {
            const navDots = page.locator('.nav-dot');

            // Rapidly click through navigation items
            for (let i = 0; i < 3; i++) {
                await navDots.nth(i).click();
                await page.waitForTimeout(100); // Small delay between clicks
            }

            // Should handle rapid clicks without errors
            const errors = page.locator('.error, .notification--error');
            await expect(errors).toHaveCount(0);
        });
    });
});
