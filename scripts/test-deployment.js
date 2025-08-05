#!/usr/bin/env node

/**
 * 🧪 Script de test pour le déploiement Xylocope
 * 
 * Ce script vérifie que tous les prérequis sont en place
 * et teste la connectivité avant le déploiement
 * 
 * Usage: node scripts/test-deployment.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
    site: {
        url: 'https://xylocope.fr',
        expectedFiles: [
            '/',
            '/css/main.css',
            '/js/main.js',
            '/assets/icons/logoV2.png'
        ]
    },
    local: {
        requiredFiles: [
            'index.html',
            'css/main.css',
            'js/main.js',
            'package.json',
            '.github/workflows/deploy.yml'
        ],
        requiredDirs: [
            'css',
            'js',
            'images',
            'assets'
        ]
    }
};

/**
 * Couleurs pour les logs
 */
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

/**
 * Logger avec couleurs
 */
const log = {
    info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
    warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
    title: (msg) => console.log(`\n${colors.cyan}🔍 ${msg}${colors.reset}\n`),
    separator: () => console.log(`${colors.magenta}${'='.repeat(60)}${colors.reset}`)
};

/**
 * Vérifier l'existence d'un fichier
 */
function checkFile(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return { exists: true, size: stats.size, isFile: stats.isFile() };
    } catch (error) {
        return { exists: false, error: error.message };
    }
}

/**
 * Vérifier l'existence d'un dossier
 */
function checkDirectory(dirPath) {
    try {
        const stats = fs.statSync(dirPath);
        return { exists: true, isDirectory: stats.isDirectory() };
    } catch (error) {
        return { exists: false, error: error.message };
    }
}

/**
 * Faire une requête HTTP(S)
 */
function makeRequest(url, timeout = 10000) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.get(url, {
            timeout,
            headers: {
                'User-Agent': 'Xylocope-Deployment-Test/1.0'
            }
        }, (res) => {
            let data = '';
            
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    data: data,
                    url: url
                });
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Timeout après ${timeout}ms`));
        });
    });
}

/**
 * Tester la structure locale du projet
 */
async function testLocalStructure() {
    log.title('Test de la structure locale');
    
    let errors = 0;
    
    // Vérifier les fichiers requis
    log.info('Vérification des fichiers requis...');
    for (const file of CONFIG.local.requiredFiles) {
        const result = checkFile(file);
        if (result.exists && result.isFile) {
            log.success(`${file} (${Math.round(result.size / 1024)}KB)`);
        } else {
            log.error(`${file} - ${result.error || 'Non trouvé'}`);
            errors++;
        }
    }
    
    // Vérifier les dossiers requis
    log.info('\nVérification des dossiers requis...');
    for (const dir of CONFIG.local.requiredDirs) {
        const result = checkDirectory(dir);
        if (result.exists && result.isDirectory) {
            const files = fs.readdirSync(dir);
            log.success(`${dir}/ (${files.length} fichiers)`);
        } else {
            log.error(`${dir}/ - ${result.error || 'Non trouvé'}`);
            errors++;
        }
    }
    
    // Vérifier le package.json
    log.info('\nVérification du package.json...');
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (packageJson.scripts && packageJson.scripts.build) {
            log.success('Script de build présent');
        } else {
            log.warning('Script de build manquant');
        }
        
        if (packageJson.scripts && packageJson.scripts.test) {
            log.success('Script de test présent');
        } else {
            log.warning('Script de test manquant');
        }
        
        if (packageJson.devDependencies) {
            const depCount = Object.keys(packageJson.devDependencies).length;
            log.success(`${depCount} dépendances de développement`);
        }
        
    } catch (error) {
        log.error(`Erreur lors de la lecture du package.json: ${error.message}`);
        errors++;
    }
    
    return errors === 0;
}

/**
 * Tester la configuration GitHub Actions
 */
async function testGitHubActions() {
    log.title('Test de la configuration GitHub Actions');
    
    const workflowFile = '.github/workflows/deploy.yml';
    const result = checkFile(workflowFile);
    
    if (!result.exists) {
        log.error('Fichier workflow GitHub Actions non trouvé');
        return false;
    }
    
    log.success(`Workflow trouvé (${Math.round(result.size / 1024)}KB)`);
    
    try {
        const workflowContent = fs.readFileSync(workflowFile, 'utf8');
        
        // Vérifications basiques du contenu
        const checks = [
            { pattern: /on:\s*push:/, message: 'Déclenchement sur push configuré' },
            { pattern: /branches:\s*\[\s*main\s*\]/, message: 'Branche main configurée' },
            { pattern: /FTP_USERNAME/, message: 'Variable FTP_USERNAME utilisée' },
            { pattern: /FTP_PASSWORD/, message: 'Variable FTP_PASSWORD utilisée' },
            { pattern: /SamKirkland\/FTP-Deploy-Action/, message: 'Action FTP Deploy configurée' },
            { pattern: /npm run build/, message: 'Build step présent' },
            { pattern: /npm run test/, message: 'Test step présent' }
        ];
        
        for (const check of checks) {
            if (check.pattern.test(workflowContent)) {
                log.success(check.message);
            } else {
                log.warning(check.message + ' - NON TROUVÉ');
            }
        }
        
        return true;
    } catch (error) {
        log.error(`Erreur lors de la lecture du workflow: ${error.message}`);
        return false;
    }
}

/**
 * Tester l'accès au site web
 */
async function testWebsiteAccess() {
    log.title('Test d\'accès au site web');
    
    let totalErrors = 0;
    
    for (const path of CONFIG.site.expectedFiles) {
        const url = CONFIG.site.url + path;
        
        try {
            log.info(`Test: ${url}`);
            const response = await makeRequest(url, 15000);
            
            if (response.statusCode === 200) {
                const sizeKB = Math.round(response.data.length / 1024);
                log.success(`OK (${response.statusCode}) - ${sizeKB}KB`);
                
                // Vérifications spécifiques
                if (path === '/') {
                    if (response.data.includes('<title>')) {
                        log.success('  → Titre HTML trouvé');
                    } else {
                        log.warning('  → Titre HTML non trouvé');
                    }
                    
                    if (response.data.includes('Xylocope')) {
                        log.success('  → Contenu Xylocope détecté');
                    } else {
                        log.warning('  → Contenu Xylocope non détecté');
                    }
                }
                
                if (path.endsWith('.css')) {
                    if (response.data.includes('color') || response.data.includes('background')) {
                        log.success('  → CSS valide détecté');
                    } else {
                        log.warning('  → CSS pourrait être invalide');
                    }
                }
                
                if (path.endsWith('.js')) {
                    if (response.data.includes('function') || response.data.includes('class') || response.data.includes('=>')) {
                        log.success('  → JavaScript valide détecté');
                    } else {
                        log.warning('  → JavaScript pourrait être invalide');
                    }
                }
                
            } else {
                log.error(`ERREUR (${response.statusCode})`);
                totalErrors++;
            }
            
        } catch (error) {
            log.error(`ÉCHEC: ${error.message}`);
            totalErrors++;
        }
    }
    
    return totalErrors === 0;
}

/**
 * Tester les en-têtes de sécurité
 */
async function testSecurityHeaders() {
    log.title('Test des en-têtes de sécurité');
    
    try {
        const response = await makeRequest(CONFIG.site.url);
        const headers = response.headers;
        
        // Vérifications des en-têtes de sécurité
        const securityChecks = [
            { header: 'x-content-type-options', expected: 'nosniff', message: 'X-Content-Type-Options' },
            { header: 'x-frame-options', expected: 'SAMEORIGIN', message: 'X-Frame-Options' },
            { header: 'strict-transport-security', expected: null, message: 'HSTS (Strict-Transport-Security)' }
        ];
        
        for (const check of securityChecks) {
            const headerValue = headers[check.header];
            if (headerValue) {
                if (check.expected && headerValue.toLowerCase().includes(check.expected.toLowerCase())) {
                    log.success(`${check.message}: ${headerValue}`);
                } else if (!check.expected) {
                    log.success(`${check.message}: ${headerValue}`);
                } else {
                    log.warning(`${check.message}: ${headerValue} (attendu: ${check.expected})`);
                }
            } else {
                log.warning(`${check.message}: Non configuré`);
            }
        }
        
        // Vérifier HTTPS
        if (response.url.startsWith('https://')) {
            log.success('HTTPS activé');
        } else {
            log.error('HTTPS non activé');
            return false;
        }
        
        return true;
    } catch (error) {
        log.error(`Erreur lors du test de sécurité: ${error.message}`);
        return false;
    }
}

/**
 * Rapport final
 */
function generateReport(results) {
    log.separator();
    log.title('📊 RAPPORT FINAL');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    console.log(`Tests réussis: ${passed}/${total}\n`);
    
    for (const result of results) {
        if (result.passed) {
            log.success(`${result.name}: RÉUSSI`);
        } else {
            log.error(`${result.name}: ÉCHEC`);
        }
    }
    
    console.log();
    
    if (passed === total) {
        log.success('🎉 Tous les tests sont passés ! Le déploiement devrait fonctionner correctement.');
        return true;
    } else {
        log.error('❌ Certains tests ont échoué. Vérifiez la configuration avant de déployer.');
        return false;
    }
}

/**
 * Fonction principale
 */
async function main() {
    console.log(`
${colors.cyan}
 ██████╗ ██╗   ██╗██╗      ██████╗  ██████╗ ██████╗ ██████╗ ███████╗
██╔═══██╗╚██╗ ██╔╝██║     ██╔═══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║   ██║ ╚████╔╝ ██║     ██║   ██║██║     ██║   ██║██████╔╝█████╗  
██║▄▄ ██║  ╚██╔╝  ██║     ██║   ██║██║     ██║   ██║██╔═══╝ ██╔══╝  
╚██████╔╝   ██║   ███████╗╚██████╔╝╚██████╗╚██████╔╝██║     ███████╗
 ╚══▀▀═╝    ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝     ╚══════╝
                                                                     
🧪 Test de Déploiement - Version 1.0.0
${colors.reset}
    `);
    
    const results = [];
    
    try {
        // Test 1: Structure locale
        const localTest = await testLocalStructure();
        results.push({ name: 'Structure locale', passed: localTest });
        
        // Test 2: GitHub Actions
        const ghActionsTest = await testGitHubActions();
        results.push({ name: 'Configuration GitHub Actions', passed: ghActionsTest });
        
        // Test 3: Accès web
        const webTest = await testWebsiteAccess();
        results.push({ name: 'Accès au site web', passed: webTest });
        
        // Test 4: Sécurité
        const securityTest = await testSecurityHeaders();
        results.push({ name: 'En-têtes de sécurité', passed: securityTest });
        
        // Générer le rapport final
        const allPassed = generateReport(results);
        
        process.exit(allPassed ? 0 : 1);
        
    } catch (error) {
        log.error(`Erreur critique: ${error.message}`);
        process.exit(1);
    }
}

// Exécuter si appelé directement
if (require.main === module) {
    main();
}

module.exports = {
    testLocalStructure,
    testGitHubActions,
    testWebsiteAccess,
    testSecurityHeaders
};