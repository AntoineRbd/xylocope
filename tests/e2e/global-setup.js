/**
 * Global setup for Playwright E2E tests
 * Runs once before all tests
 */

async function globalSetup(config) {
    console.log('🚀 Setting up E2E test environment...');

    // Wait a moment for the server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('✅ E2E test environment ready');
}

module.exports = globalSetup;
