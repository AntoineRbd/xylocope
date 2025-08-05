/**
 * E2E tests for contact form functionality
 * Tests form validation, submission, and user interactions
 */

const { test, expect } = require('@playwright/test');

test.describe('Contact Form E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Navigate to contact section
        const contactNavDot = page.locator('.nav-dot[href="#contact"]');
        await contactNavDot.click();
        await page.waitForTimeout(1000);
    });

    test.describe('Form Interaction', () => {
        test('should display form with all required fields', async ({ page }) => {
            const form = page.locator('#contactForm');
            await expect(form).toBeVisible();

            const nameField = page.locator('input[name="name"]');
            const emailField = page.locator('input[name="email"]');
            const messageField = page.locator('textarea[name="message"]');
            const submitButton = page.locator('.submit-button');

            await expect(nameField).toBeVisible();
            await expect(emailField).toBeVisible();
            await expect(messageField).toBeVisible();
            await expect(submitButton).toBeVisible();

            // Check for required attributes
            await expect(nameField).toHaveAttribute('required');
            await expect(emailField).toHaveAttribute('required');
            await expect(messageField).toHaveAttribute('required');
        });

        test('should show floating labels on focus', async ({ page }) => {
            const nameField = page.locator('input[name="name"]');
            const inputContainer = nameField.locator('..');

            // Focus on input
            await nameField.focus();

            // Container should have focused class
            await expect(inputContainer).toHaveClass(/focused/);

            // Blur without entering text
            await page.keyboard.press('Tab');

            // Should remove focused class if no value
            await expect(inputContainer).not.toHaveClass(/focused/);
        });

        test('should maintain floating label with content', async ({ page }) => {
            const nameField = page.locator('input[name="name"]');
            const inputContainer = nameField.locator('..');

            // Enter text
            await nameField.fill('John Doe');

            // Blur field
            await page.keyboard.press('Tab');

            // Should keep focused class because there's content
            await expect(inputContainer).toHaveClass(/focused/);
        });
    });

    test.describe('Form Validation', () => {
        test('should validate required fields on submission', async ({ page }) => {
            const submitButton = page.locator('.submit-button');

            // Try to submit empty form
            await submitButton.click();

            // Should show validation errors
            const nameField = page.locator('input[name="name"]');
            const emailField = page.locator('input[name="email"]');
            const messageField = page.locator('textarea[name="message"]');

            await expect(nameField).toHaveClass(/error/);
            await expect(emailField).toHaveClass(/error/);
            await expect(messageField).toHaveClass(/error/);

            // Should show error messages
            const errorMessages = page.locator('.field-error');
            await expect(errorMessages).toHaveCount(3);
        });

        test('should validate email format', async ({ page }) => {
            const emailField = page.locator('input[name="email"]');

            // Enter invalid email
            await emailField.fill('invalid-email');
            await emailField.blur();

            // Should show error
            await expect(emailField).toHaveClass(/error/);

            const errorMessage = page.locator('.field-error');
            await expect(errorMessage).toContainText('Veuillez entrer une adresse email valide');
        });

        test('should validate message minimum length', async ({ page }) => {
            const messageField = page.locator('textarea[name="message"]');

            // Enter short message
            await messageField.fill('Short');
            await messageField.blur();

            // Should show error
            await expect(messageField).toHaveClass(/error/);

            const errorMessage = page.locator('.field-error');
            await expect(errorMessage).toContainText('au moins 10 caractères');
        });

        test('should clear validation errors when valid input is entered', async ({ page }) => {
            const nameField = page.locator('input[name="name"]');

            // First make it invalid
            await nameField.focus();
            await nameField.blur();

            await expect(nameField).toHaveClass(/error/);

            // Then enter valid data
            await nameField.fill('John Doe');
            await nameField.blur();

            // Error should be cleared
            await expect(nameField).not.toHaveClass(/error/);

            const errorMessage = nameField.locator('.. .field-error');
            await expect(errorMessage).toHaveCount(0);
        });

        test('should validate all field types correctly', async ({ page }) => {
            const testCases = [
                {
                    field: 'input[name="name"]',
                    validValue: 'Jean Dupont',
                    invalidValue: ''
                },
                {
                    field: 'input[name="email"]',
                    validValue: 'jean.dupont@example.com',
                    invalidValue: 'invalid-email'
                },
                {
                    field: 'textarea[name="message"]',
                    validValue: 'Ceci est un message valide avec assez de caractères.',
                    invalidValue: 'Court'
                }
            ];

            for (const testCase of testCases) {
                const field = page.locator(testCase.field);

                // Test invalid value
                await field.fill(testCase.invalidValue);
                await field.blur();
                await expect(field).toHaveClass(/error/);

                // Test valid value
                await field.fill(testCase.validValue);
                await field.blur();
                await expect(field).not.toHaveClass(/error/);
            }
        });
    });

    test.describe('Form Submission', () => {
        test('should submit form with valid data', async ({ page }) => {
            // Fill form with valid data
            await page.locator('input[name="name"]').fill('Jean Dupont');
            await page.locator('input[name="email"]').fill('jean.dupont@example.com');
            await page.locator('textarea[name="message"]').fill('Bonjour, je souhaiterais obtenir plus d\'informations sur vos services.');

            const submitButton = page.locator('.submit-button');
            const submitSpan = submitButton.locator('span');

            // Submit form
            await submitButton.click();

            // Should show loading state
            await expect(submitSpan).toHaveText('Envoi...');
            await expect(submitButton).toBeDisabled();

            // Wait for submission to complete
            await page.waitForTimeout(3000);

            // Should show success notification
            const notification = page.locator('.notification--success');
            await expect(notification).toBeVisible();
            await expect(notification).toContainText('envoyé avec succès');

            // Form should be reset
            await expect(page.locator('input[name="name"]')).toHaveValue('');
            await expect(page.locator('input[name="email"]')).toHaveValue('');
            await expect(page.locator('textarea[name="message"]')).toHaveValue('');

            // Submit button should be reset
            await expect(submitSpan).toHaveText('Envoyer');
            await expect(submitButton).toBeEnabled();
        });

        test('should prevent submission with invalid data', async ({ page }) => {
            // Fill form with invalid data
            await page.locator('input[name="name"]').fill('');
            await page.locator('input[name="email"]').fill('invalid-email');
            await page.locator('textarea[name="message"]').fill('Short');

            const submitButton = page.locator('.submit-button');

            // Try to submit
            await submitButton.click();

            // Should show error notification
            const errorNotification = page.locator('.notification--error');
            await expect(errorNotification).toBeVisible();
            await expect(errorNotification).toContainText('corriger les erreurs');

            // Form should not be submitted (no loading state)
            const submitSpan = submitButton.locator('span');
            await expect(submitSpan).toHaveText('Envoyer');
        });

        test('should handle form submission loading states correctly', async ({ page }) => {
            // Fill form with valid data
            await page.locator('input[name="name"]').fill('Test User');
            await page.locator('input[name="email"]').fill('test@example.com');
            await page.locator('textarea[name="message"]').fill('This is a test message with enough characters.');

            const submitButton = page.locator('.submit-button');
            const submitSpan = submitButton.locator('span');

            // Record original text
            const originalText = await submitSpan.textContent();

            // Submit form
            await submitButton.click();

            // Check immediate loading state
            await expect(submitSpan).toHaveText('Envoi...');
            await expect(submitButton).toBeDisabled();

            // Check button opacity (visual feedback)
            const opacity = await submitButton.evaluate(el => el.style.opacity);
            expect(opacity).toBe('0.7');

            // Wait for completion
            await page.waitForTimeout(3000);

            // Check reset state
            await expect(submitSpan).toHaveText(originalText);
            await expect(submitButton).toBeEnabled();

            const finalOpacity = await submitButton.evaluate(el => el.style.opacity);
            expect(finalOpacity).toBe('1');
        });
    });

    test.describe('Real-time Validation', () => {
        test('should validate fields on blur', async ({ page }) => {
            const nameField = page.locator('input[name="name"]');

            // Focus and leave empty
            await nameField.focus();
            await nameField.blur();

            // Should show error immediately
            await expect(nameField).toHaveClass(/error/);
        });

        test('should validate on input for fields with existing errors', async ({ page }) => {
            const emailField = page.locator('input[name="email"]');

            // First create an error
            await emailField.fill('invalid');
            await emailField.blur();
            await expect(emailField).toHaveClass(/error/);

            // Now start typing a valid email
            await emailField.fill('valid@email.com');

            // Should clear error as we type (debounced)
            await page.waitForTimeout(500);
            await expect(emailField).not.toHaveClass(/error/);
        });

        test('should provide immediate feedback for email validation', async ({ page }) => {
            const emailField = page.locator('input[name="email"]');

            const testEmails = [
                { email: 'test@', valid: false },
                { email: 'test@example', valid: false },
                { email: 'test@example.com', valid: true },
                { email: 'invalid-email', valid: false },
                { email: 'user.name+tag@example.co.uk', valid: true }
            ];

            for (const testCase of testEmails) {
                await emailField.fill(testCase.email);
                await emailField.blur();

                if (testCase.valid) {
                    await expect(emailField).not.toHaveClass(/error/);
                } else {
                    await expect(emailField).toHaveClass(/error/);
                }
            }
        });
    });

    test.describe('User Experience', () => {
        test('should maintain form data during navigation', async ({ page }) => {
            // Fill form partially
            await page.locator('input[name="name"]').fill('John Doe');
            await page.locator('input[name="email"]').fill('john@example.com');

            // Navigate away
            const aboutNavDot = page.locator('.nav-dot[href="#about"]');
            await aboutNavDot.click();
            await page.waitForTimeout(1000);

            // Navigate back to contact
            const contactNavDot = page.locator('.nav-dot[href="#contact"]');
            await contactNavDot.click();
            await page.waitForTimeout(1000);

            // Data should still be there
            await expect(page.locator('input[name="name"]')).toHaveValue('John Doe');
            await expect(page.locator('input[name="email"]')).toHaveValue('john@example.com');
        });

        test('should handle notification interactions', async ({ page }) => {
            // Submit valid form to get notification
            await page.locator('input[name="name"]').fill('Test User');
            await page.locator('input[name="email"]').fill('test@example.com');
            await page.locator('textarea[name="message"]').fill('Test message with enough characters.');

            await page.locator('.submit-button').click();
            await page.waitForTimeout(3000);

            const notification = page.locator('.notification');
            await expect(notification).toBeVisible();

            // Should auto-hide after timeout
            await page.waitForTimeout(6000);
            await expect(notification).not.toBeVisible();
        });

        test('should handle notification close button', async ({ page }) => {
            // Trigger a notification
            await page.locator('.submit-button').click(); // Invalid form

            const notification = page.locator('.notification');
            await expect(notification).toBeVisible();

            // Click close button
            const closeButton = notification.locator('.notification__close');
            await closeButton.click();

            // Notification should disappear
            await expect(notification).not.toBeVisible();
        });
    });

    test.describe('Accessibility', () => {
        test('should support keyboard navigation', async ({ page }) => {
            const nameField = page.locator('input[name="name"]');
            const emailField = page.locator('input[name="email"]');
            const messageField = page.locator('textarea[name="message"]');
            const submitButton = page.locator('.submit-button');

            // Tab through form fields
            await nameField.focus();
            await expect(nameField).toBeFocused();

            await page.keyboard.press('Tab');
            await expect(emailField).toBeFocused();

            await page.keyboard.press('Tab');
            await expect(messageField).toBeFocused();

            await page.keyboard.press('Tab');
            await expect(submitButton).toBeFocused();
        });

        test('should have proper ARIA labels and attributes', async ({ page }) => {
            const form = page.locator('#contactForm');
            const nameField = page.locator('input[name="name"]');
            const submitButton = page.locator('.submit-button');

            // Form should have proper structure
            await expect(form).toHaveRole('form');

            // Fields should have labels
            const nameLabel = page.locator('label[for="name"]');
            if (await nameLabel.count() > 0) {
                await expect(nameLabel).toBeVisible();
            }

            // Submit button should be accessible
            await expect(submitButton).toHaveRole('button');
        });

        test('should announce validation errors to screen readers', async ({ page }) => {
            const nameField = page.locator('input[name="name"]');

            // Trigger validation error
            await nameField.focus();
            await nameField.blur();

            // Error message should be associated with field
            const errorMessage = page.locator('.field-error');
            await expect(errorMessage).toBeVisible();

            // Error should be announced (aria-describedby or similar)
            const fieldContainer = nameField.locator('..');
            await expect(fieldContainer).toHaveClass(/error/);
        });
    });

    test.describe('Mobile Form Experience', () => {
        test('should work correctly on mobile devices', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            // Navigate to contact section
            const menuTrigger = page.locator('#mobileMenuTrigger');
            await menuTrigger.click();

            const contactMenuItem = page.locator('.mobile-menu-item[href="#contact"]');
            await contactMenuItem.click();
            await page.waitForTimeout(1000);

            // Form should be visible and usable
            const form = page.locator('#contactForm');
            await expect(form).toBeVisible();

            // Fill form on mobile
            await page.locator('input[name="name"]').fill('Mobile User');
            await page.locator('input[name="email"]').fill('mobile@example.com');
            await page.locator('textarea[name="message"]').fill('Testing mobile form submission.');

            // Submit should work
            await page.locator('.submit-button').click();

            // Should show loading state
            const submitSpan = page.locator('.submit-button span');
            await expect(submitSpan).toHaveText('Envoi...');
        });

        test('should handle virtual keyboard on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const nameField = page.locator('input[name="name"]');

            // Focus should work on mobile
            await nameField.focus();
            await expect(nameField).toBeFocused();

            // Should be able to type
            await nameField.fill('Mobile Test');
            await expect(nameField).toHaveValue('Mobile Test');
        });
    });

    test.describe('Form Performance', () => {
        test('should handle rapid form interactions', async ({ page }) => {
            const nameField = page.locator('input[name="name"]');
            const emailField = page.locator('input[name="email"]');

            // Rapidly switch between fields
            for (let i = 0; i < 5; i++) {
                await nameField.focus();
                await emailField.focus();
            }

            // Should not cause errors
            const errors = page.locator('.error:not(.field-error)');
            await expect(errors).toHaveCount(0);
        });

        test('should debounce validation appropriately', async ({ page }) => {
            const emailField = page.locator('input[name="email"]');

            // Create an error first
            await emailField.fill('invalid');
            await emailField.blur();
            await expect(emailField).toHaveClass(/error/);

            // Rapidly type valid email
            await emailField.fill('');
            await emailField.type('test@example.com', { delay: 50 });

            // Should debounce validation and clear error
            await page.waitForTimeout(500);
            await expect(emailField).not.toHaveClass(/error/);
        });
    });
});
