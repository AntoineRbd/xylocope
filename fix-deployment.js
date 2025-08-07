#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class DeploymentFixer {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.report = {
            totalFiles: 0,
            issuesFound: 0,
            fixesApplied: 0
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            'info': '🔍',
            'error': '❌',
            'success': '✅',
            'warning': '⚠️',
            'fix': '🔧'
        }[type] || 'ℹ️';
        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    analyzeHTML() {
        this.log('Analyse des fichiers HTML...', 'info');
        
        const htmlFiles = ['index.html', 'dist/index.html'];
        
        htmlFiles.forEach(file => {
            if (!fs.existsSync(file)) {
                this.log(`Fichier non trouvé: ${file}`, 'warning');
                return;
            }
            
            const content = fs.readFileSync(file, 'utf8');
            this.report.totalFiles++;
            
            // Analyse des chemins problématiques
            this.analyzeAssetPaths(file, content);
        });
    }

    analyzeAssetPaths(file, content) {
        this.log(`Analyse des chemins dans ${file}`, 'info');
        
        // Détection des chemins absolus depuis racine
        const absolutePaths = content.match(/(?:href|src)=["']\/[^"']*["']/g) || [];
        
        absolutePaths.forEach(match => {
            const path = match.match(/["']([^"']*)["']/)[1];
            const localPath = path.substring(1); // Remove leading /
            
            if (!fs.existsSync(localPath)) {
                this.issues.push({
                    file,
                    type: 'missing-resource',
                    path,
                    localPath,
                    severity: 'high',
                    description: `Ressource manquante: ${localPath}`
                });
                this.log(`❌ Ressource manquante: ${localPath}`, 'error');
            } else {
                this.log(`✅ Ressource trouvée: ${localPath}`, 'success');
            }
        });

        // Détection des chemins relatifs problématiques
        const relativePaths = content.match(/(?:href|src)=["'][^"']*(?:css|js|png|jpg|jpeg|gif|ico|svg)[^"']*["']/g) || [];
        
        relativePaths.forEach(match => {
            if (!match.includes('/') && !match.includes('http')) {
                this.issues.push({
                    file,
                    type: 'relative-path',
                    match,
                    severity: 'medium',
                    description: 'Chemin relatif détecté (peut causer des problèmes)'
                });
            }
        });
    }

    checkServerConfig() {
        this.log('Vérification configuration serveur...', 'info');
        
        // Vérification .htaccess
        if (fs.existsSync('.htaccess')) {
            const content = fs.readFileSync('.htaccess', 'utf8');
            
            // Détection redirections infinies potentielles
            if (content.includes('RewriteRule') && content.includes('R=301')) {
                this.issues.push({
                    file: '.htaccess',
                    type: 'infinite-redirect-risk',
                    severity: 'critical',
                    description: 'Risque de redirection infinie dans .htaccess'
                });
                this.log('⚠️ Risque de redirection infinie détecté dans .htaccess', 'warning');
            }
        } else {
            this.log('✅ Aucun .htaccess trouvé - OVH gère automatiquement', 'success');
        }
        
        // Vérification workflow GitHub Actions
        if (fs.existsSync('.github/workflows/deploy.yml')) {
            this.log('✅ Workflow de déploiement trouvé', 'success');
        }
    }

    generateOptimalHTAccess() {
        this.log('Génération .htaccess optimal...', 'fix');
        
        const optimalHTAccess = `# Xylocope.fr - Configuration Apache optimale
# Pas de redirections pour éviter les boucles infinies

# Gestion des erreurs 404 gracieuse
ErrorDocument 404 /index.html

# Compression pour les performances
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript text/javascript application/json
</IfModule>

# Cache pour les ressources statiques
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/svg+xml "access plus 1 month"
</IfModule>

# Headers de sécurité
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options SAMEORIGIN
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# MIME types pour assurer la bonne interprétation
AddType text/css .css
AddType application/javascript .js
AddType image/svg+xml .svg

# Pas de redirection automatique - laisse OVH gérer HTTPS
`;
        
        this.fixes.push({
            type: 'create-htaccess',
            file: '.htaccess-optimal',
            content: optimalHTAccess,
            description: 'Création .htaccess optimisé sans redirections'
        });
    }

    generateReport() {
        this.report.issuesFound = this.issues.length;
        this.report.fixesApplied = this.fixes.length;

        this.log('=== RAPPORT DE DIAGNOSTIC ===', 'info');
        this.log(`Fichiers analysés: ${this.report.totalFiles}`, 'info');
        this.log(`Problèmes trouvés: ${this.report.issuesFound}`, this.report.issuesFound > 0 ? 'error' : 'success');
        this.log(`Corrections proposées: ${this.report.fixesApplied}`, 'fix');

        if (this.issues.length > 0) {
            this.log('\n=== PROBLÈMES DÉTECTÉS ===', 'error');
            this.issues.forEach((issue, index) => {
                this.log(`${index + 1}. [${issue.severity.toUpperCase()}] ${issue.description}`, 'error');
                this.log(`   Fichier: ${issue.file}`, 'info');
                if (issue.path) this.log(`   Chemin: ${issue.path}`, 'info');
            });
        }

        if (this.fixes.length > 0) {
            this.log('\n=== CORRECTIONS PROPOSÉES ===', 'fix');
            this.fixes.forEach((fix, index) => {
                this.log(`${index + 1}. ${fix.description}`, 'fix');
                this.log(`   Type: ${fix.type}`, 'info');
                this.log(`   Fichier: ${fix.file}`, 'info');
            });
        }

        // Diagnostic spécifique ERR_TOO_MANY_REDIRECTS
        this.log('\n=== DIAGNOSTIC ERR_TOO_MANY_REDIRECTS ===', 'warning');
        
        const criticalIssues = this.issues.filter(i => i.type === 'infinite-redirect-risk');
        if (criticalIssues.length > 0) {
            this.log('❌ CAUSE PROBABLE: Redirections infinies dans .htaccess', 'error');
        } else {
            this.log('✅ Aucune redirection infinie détectée dans la configuration locale', 'success');
        }

        const missingResources = this.issues.filter(i => i.type === 'missing-resource');
        if (missingResources.length > 0) {
            this.log(`❌ ${missingResources.length} ressources manquantes qui peuvent causer des redirections`, 'error');
        } else {
            this.log('✅ Toutes les ressources référencées sont présentes', 'success');
        }
    }

    applyFixes() {
        this.log('Application des corrections...', 'fix');
        
        this.fixes.forEach(fix => {
            try {
                fs.writeFileSync(fix.file, fix.content);
                this.log(`✅ Correction appliquée: ${fix.file}`, 'success');
            } catch (error) {
                this.log(`❌ Erreur lors de l'application de ${fix.file}: ${error.message}`, 'error');
            }
        });
    }

    run() {
        this.log('🚀 DÉBUT DU DIAGNOSTIC AUTOMATISÉ', 'info');
        
        this.analyzeHTML();
        this.checkServerConfig();
        this.generateOptimalHTAccess();
        this.generateReport();
        
        // Demande confirmation avant application des corrections
        this.log('\n⚠️ Pour appliquer les corrections, relancez avec --fix', 'warning');
        
        return {
            issues: this.issues,
            fixes: this.fixes,
            report: this.report
        };
    }
}

// Exécution
if (require.main === module) {
    const fixer = new DeploymentFixer();
    const result = fixer.run();
    
    if (process.argv.includes('--fix')) {
        fixer.applyFixes();
    }
    
    process.exit(result.issues.length > 0 ? 1 : 0);
}

module.exports = DeploymentFixer;