// Script de test pour vérifier que les ressources se chargent correctement
const testUrls = [
    'https://xylocope.fr/css/reset.css',
    'https://xylocope.fr/css/main.css', 
    'https://xylocope.fr/css/responsive.css',
    'https://xylocope.fr/js/config.js',
    'https://xylocope.fr/js/utils.js',
    'https://xylocope.fr/js/main.js',
    'https://xylocope.fr/assets/icons/logoV2.png'
];

async function testResource(url) {
    try {
        const response = await fetch(url);
        console.log(`✅ ${url} - Status: ${response.status}`);
        return response.status === 200;
    } catch (error) {
        console.log(`❌ ${url} - Error: ${error.message}`);
        return false;
    }
}

async function testAllResources() {
    console.log('🧪 Testing all resources...\n');
    
    const results = await Promise.all(testUrls.map(testResource));
    const successful = results.filter(Boolean).length;
    
    console.log(`\n📊 Results: ${successful}/${testUrls.length} resources loaded successfully`);
    
    if (successful === testUrls.length) {
        console.log('🎉 All resources loaded correctly!');
    } else {
        console.log('❌ Some resources failed to load');
    }
}

// Test au chargement du script
if (typeof window !== 'undefined') {
    // Navigateur
    document.addEventListener('DOMContentLoaded', testAllResources);
} else {
    // Node.js
    testAllResources();
}