/**
 * Global teardown for Playwright E2E tests
 * Runs once after all tests
 */

async function globalTeardown(config) {
    console.log('🧹 Cleaning up E2E test environment...');

    // Cleanup tasks if needed

    console.log('✅ E2E test environment cleaned up');
}

module.exports = globalTeardown;
