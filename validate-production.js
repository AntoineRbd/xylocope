#!/usr/bin/env node

const https = require('https');
const http = require('http');

class ProductionValidator {
    constructor(baseUrl = 'https://xylocope.fr') {
        this.baseUrl = baseUrl;
        this.results = {
            totalTests: 0,
            passedTests: 0,
            failedTests: 0,
            details: []
        };
    }

    log(message, type = 'info') {
        const prefix = {
            'info': 'ℹ️',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️'
        }[type] || 'ℹ️';
        console.log(`${prefix} ${message}`);
    }

    async makeRequest(url, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const client = urlObj.protocol === 'https:' ? https : http;
            
            const req = client.get(url, { timeout }, (res) => {
                let redirects = [];
                let currentRes = res;
                
                // Suit les redirections manuellement pour les détecter
                const followRedirects = (response) => {
                    if (response.statusCode >= 300 && response.statusCode < 400) {
                        redirects.push({
                            status: response.statusCode,
                            location: response.headers.location
                        });
                        
                        if (redirects.length > 5) {
                            reject(new Error('ERR_TOO_MANY_REDIRECTS'));
                            return;
                        }
                        
                        if (response.headers.location) {
                            const nextUrl = new URL(response.headers.location, url);
                            return this.makeRequest(nextUrl.href, timeout);
                        }
                    }
                    
                    let data = '';
                    response.on('data', chunk => data += chunk);
                    response.on('end', () => {
                        resolve({
                            status: response.statusCode,
                            headers: response.headers,
                            data: data,
                            redirects: redirects,
                            finalUrl: url
                        });
                    });
                };
                
                followRedirects(currentRes);
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.on('error', (err) => {
                reject(err);
            });
        });
    }

    async testResource(path, expectedType = null) {
        this.results.totalTests++;
        
        try {
            const url = `${this.baseUrl}${path}`;
            const response = await this.makeRequest(url);
            
            const test = {
                url: url,
                path: path,
                status: response.status,
                contentType: response.headers['content-type'] || 'unknown',
                contentLength: response.headers['content-length'] || 'unknown',
                redirects: response.redirects,
                success: response.status === 200
            };
            
            if (response.redirects.length > 0) {
                test.redirectChain = response.redirects.map(r => `${r.status} → ${r.location}`).join(' → ');
            }
            
            if (response.status === 200) {
                this.results.passedTests++;
                this.log(`✅ ${path} (${response.status}) - ${test.contentType}`, 'success');
                
                if (response.redirects.length > 0) {
                    this.log(`  🔄 ${response.redirects.length} redirection(s): ${test.redirectChain}`, 'warning');
                }
            } else {
                this.results.failedTests++;
                this.log(`❌ ${path} (${response.status})`, 'error');
                
                if (response.redirects.length > 0) {
                    this.log(`  🔄 Redirections: ${test.redirectChain}`, 'error');
                }
            }
            
            this.results.details.push(test);
            return test;
            
        } catch (error) {
            this.results.failedTests++;
            const test = {
                url: `${this.baseUrl}${path}`,
                path: path,
                error: error.message,
                success: false
            };
            
            if (error.message === 'ERR_TOO_MANY_REDIRECTS') {
                this.log(`❌ ${path} - ERR_TOO_MANY_REDIRECTS!`, 'error');
            } else {
                this.log(`❌ ${path} - ${error.message}`, 'error');
            }
            
            this.results.details.push(test);
            return test;
        }
    }

    async validateMainResources() {
        this.log('🧪 Test des ressources principales...', 'info');
        
        const resources = [
            { path: '/', type: 'text/html' },
            { path: '/css/reset.css', type: 'text/css' },
            { path: '/css/main.css', type: 'text/css' },
            { path: '/css/responsive.css', type: 'text/css' },
            { path: '/js/config.js', type: 'application/javascript' },
            { path: '/js/utils.js', type: 'application/javascript' },
            { path: '/js/main.js', type: 'application/javascript' },
            { path: '/assets/icons/logoV2.png', type: 'image/png' },
            { path: '/index-test.html', type: 'text/html' }
        ];
        
        for (const resource of resources) {
            await this.testResource(resource.path, resource.type);
        }
    }

    async checkDeploymentStatus() {
        this.log('📋 Vérification du statut de déploiement...', 'info');
        
        try {
            const response = await this.makeRequest(`${this.baseUrl}/deployment-test.txt`);
            
            if (response.status === 200) {
                const deploymentInfo = response.data.trim();
                this.log(`✅ Dernier déploiement: ${deploymentInfo}`, 'success');
                
                // Vérifie si le déploiement est récent (moins de 1 heure)
                const deploymentTime = new Date(deploymentInfo.split(' - ')[0]);
                const now = new Date();
                const timeDiff = now - deploymentTime;
                const minutesDiff = timeDiff / (1000 * 60);
                
                if (minutesDiff < 60) {
                    this.log(`⏰ Déploiement récent (${Math.round(minutesDiff)} minutes)`, 'success');
                } else {
                    this.log(`⚠️ Déploiement ancien (${Math.round(minutesDiff)} minutes)`, 'warning');
                }
            } else {
                this.log('❌ Fichier de test de déploiement non trouvé', 'error');
            }
        } catch (error) {
            this.log(`❌ Erreur lors de la vérification du déploiement: ${error.message}`, 'error');
        }
    }

    generateReport() {
        this.log('\n' + '='.repeat(50), 'info');
        this.log('📊 RAPPORT FINAL DE VALIDATION', 'info');
        this.log('='.repeat(50), 'info');
        
        this.log(`Tests exécutés: ${this.results.totalTests}`, 'info');
        this.log(`Tests réussis: ${this.results.passedTests}`, this.results.passedTests > 0 ? 'success' : 'error');
        this.log(`Tests échoués: ${this.results.failedTests}`, this.results.failedTests === 0 ? 'success' : 'error');
        
        const successRate = this.results.totalTests > 0 ? 
            Math.round((this.results.passedTests / this.results.totalTests) * 100) : 0;
            
        this.log(`Taux de réussite: ${successRate}%`, successRate === 100 ? 'success' : 'warning');
        
        // Analyse spécifique des erreurs de redirection
        const redirectErrors = this.results.details.filter(t => 
            t.error && t.error.includes('ERR_TOO_MANY_REDIRECTS')
        );
        
        if (redirectErrors.length > 0) {
            this.log('\n❌ ERREURS ERR_TOO_MANY_REDIRECTS DÉTECTÉES!', 'error');
            redirectErrors.forEach(error => {
                this.log(`  - ${error.path}`, 'error');
            });
            this.log('\n🔧 ACTIONS RECOMMANDÉES:', 'warning');
            this.log('1. Vérifiez la configuration .htaccess sur le serveur', 'warning');
            this.log('2. Contactez le support OVH si le problème persiste', 'warning');
            this.log('3. Vérifiez les redirections HTTPS automatiques', 'warning');
        } else if (this.results.failedTests === 0) {
            this.log('\n🎉 SUCCÈS COMPLET!', 'success');
            this.log('✅ Aucune erreur ERR_TOO_MANY_REDIRECTS détectée', 'success');
            this.log('✅ Toutes les ressources se chargent correctement', 'success');
            this.log('✅ Le site est opérationnel', 'success');
        } else {
            this.log('\n⚠️ PROBLÈMES DÉTECTÉS', 'warning');
            this.results.details.filter(t => !t.success).forEach(test => {
                this.log(`- ${test.path}: ${test.error || `HTTP ${test.status}`}`, 'warning');
            });
        }
        
        return successRate;
    }

    async run() {
        this.log('🚀 VALIDATION DE LA PRODUCTION', 'info');
        this.log(`🌐 URL de base: ${this.baseUrl}`, 'info');
        this.log('', 'info');
        
        await this.checkDeploymentStatus();
        await this.validateMainResources();
        
        const successRate = this.generateReport();
        
        return {
            success: successRate === 100,
            successRate,
            results: this.results
        };
    }
}

// Exécution
if (require.main === module) {
    const validator = new ProductionValidator();
    validator.run().then(result => {
        process.exit(result.success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Erreur lors de la validation:', error);
        process.exit(1);
    });
}

module.exports = ProductionValidator;