#!/bin/bash

# 🚀 Script de configuration automatique du déploiement Xylocope
# 
# Ce script automatise la configuration initiale du déploiement
# pour l'hébergement OVH avec GitHub Actions
#
# Usage: ./scripts/setup-deployment.sh

set -e  # Arrêter en cas d'erreur

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="xylocope"
GITHUB_USER="AntoineRbd"
FTP_SERVER="ftp.cluster021.hosting.ovh.net"
FTP_USER="xylocoz"
WEBSITE_URL="https://xylocope.fr"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_title() {
    echo -e "\n${CYAN}🔧 $1${NC}\n"
}

separator() {
    echo -e "${PURPLE}$(printf '=%.0s' {1..60})${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log_title "Vérification des prérequis"
    
    local errors=0
    
    # Vérifier Git
    if command -v git &> /dev/null; then
        log_success "Git installé $(git --version)"
    else
        log_error "Git n'est pas installé"
        errors=$((errors + 1))
    fi
    
    # Vérifier Node.js
    if command -v node &> /dev/null; then
        log_success "Node.js installé $(node --version)"
    else
        log_error "Node.js n'est pas installé"
        errors=$((errors + 1))
    fi
    
    # Vérifier npm
    if command -v npm &> /dev/null; then
        log_success "npm installé $(npm --version)"
    else
        log_error "npm n'est pas installé"
        errors=$((errors + 1))
    fi
    
    # Vérifier curl
    if command -v curl &> /dev/null; then
        log_success "curl installé"
    else
        log_warning "curl n'est pas installé (optionnel)"
    fi
    
    # Vérifier jq (optionnel)
    if command -v jq &> /dev/null; then
        log_success "jq installé (pour le formatage JSON)"
    else
        log_warning "jq n'est pas installé (optionnel pour le formatage JSON)"
    fi
    
    if [ $errors -eq 0 ]; then
        log_success "Tous les prérequis sont satisfaits"
        return 0
    else
        log_error "$errors prérequis manquants"
        return 1
    fi
}

# Vérifier la structure du projet
check_project_structure() {
    log_title "Vérification de la structure du projet"
    
    local required_files=(
        "index.html"
        "package.json"
        "css/main.css"
        "js/main.js"
    )
    
    local required_dirs=(
        "css"
        "js"
        "images"
        "assets"
    )
    
    local errors=0
    
    # Vérifier les fichiers requis
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "Fichier trouvé: $file"
        else
            log_error "Fichier manquant: $file"
            errors=$((errors + 1))
        fi
    done
    
    # Vérifier les dossiers requis
    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            local file_count=$(find "$dir" -type f | wc -l)
            log_success "Dossier trouvé: $dir ($file_count fichiers)"
        else
            log_error "Dossier manquant: $dir"
            errors=$((errors + 1))
        fi
    done
    
    # Vérifier le workflow GitHub Actions
    if [ -f ".github/workflows/deploy.yml" ]; then
        log_success "Workflow GitHub Actions trouvé"
    else
        log_error "Workflow GitHub Actions manquant"
        errors=$((errors + 1))
    fi
    
    return $errors
}

# Générer un secret sécurisé
generate_secret() {
    if command -v openssl &> /dev/null; then
        openssl rand -hex 32
    else
        # Fallback si openssl n'est pas disponible
        head /dev/urandom | tr -dc A-Za-z0-9 | head -c 64
    fi
}

# Configuration des secrets GitHub
setup_github_secrets() {
    log_title "Configuration des secrets GitHub"
    
    log_info "Pour configurer les secrets GitHub Actions, suivez ces étapes :"
    echo ""
    echo "1. Allez sur https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/secrets/actions"
    echo ""
    echo "2. Cliquez sur 'New repository secret'"
    echo ""
    echo "3. Créez ces secrets :"
    echo ""
    echo "   Nom: FTP_USERNAME"
    echo "   Valeur: ${FTP_USER}"
    echo ""
    echo "   Nom: FTP_PASSWORD"
    echo "   Valeur: [Votre mot de passe FTP OVH]"
    echo ""
    
    log_warning "⚠️  Ne partagez jamais votre mot de passe FTP !"
    
    read -p "Appuyez sur Entrée une fois les secrets configurés..."
}

# Test de connectivité FTP
test_ftp_connection() {
    log_title "Test de connectivité FTP"
    
    read -p "Voulez-vous tester la connexion FTP ? (y/N): " test_ftp
    
    if [[ $test_ftp =~ ^[Yy]$ ]]; then
        read -s -p "Entrez votre mot de passe FTP pour le test: " ftp_password
        echo ""
        
        # Créer un script de test temporaire
        cat > /tmp/test_ftp.sh << EOF
#!/bin/bash
ftp -n ${FTP_SERVER} << END_SCRIPT
user ${FTP_USER} ${ftp_password}
ls
quit
END_SCRIPT
EOF
        
        chmod +x /tmp/test_ftp.sh
        
        log_info "Test de connexion FTP..."
        if /tmp/test_ftp.sh > /tmp/ftp_test_output.txt 2>&1; then
            log_success "Connexion FTP réussie"
            if grep -q "www" /tmp/ftp_test_output.txt; then
                log_success "Dossier www détecté"
            else
                log_warning "Dossier www non visible (normal)"
            fi
        else
            log_error "Échec de la connexion FTP"
            cat /tmp/ftp_test_output.txt
        fi
        
        # Nettoyer
        rm -f /tmp/test_ftp.sh /tmp/ftp_test_output.txt
    else
        log_info "Test FTP ignoré"
    fi
}

# Configuration du webhook PHP (optionnel)
setup_webhook() {
    log_title "Configuration du webhook PHP (optionnel)"
    
    read -p "Voulez-vous configurer le webhook PHP comme alternative ? (y/N): " setup_webhook
    
    if [[ $setup_webhook =~ ^[Yy]$ ]]; then
        local secret=$(generate_secret)
        
        log_info "Secret généré pour le webhook: $secret"
        log_warning "Sauvegardez ce secret, vous en aurez besoin !"
        
        # Modifier le fichier deploy.php si il existe
        if [ -f "deploy.php" ]; then
            log_info "Configuration du secret dans deploy.php..."
            
            # Créer une sauvegarde
            cp deploy.php deploy.php.backup
            
            # Remplacer le secret
            sed -i.tmp "s/CHANGE_THIS_SECRET_TOKEN/$secret/g" deploy.php
            rm -f deploy.php.tmp
            
            log_success "Secret configuré dans deploy.php"
            
            echo ""
            echo "Pour configurer le webhook GitHub :"
            echo "1. Allez sur https://github.com/${GITHUB_USER}/${REPO_NAME}/settings/hooks"
            echo "2. Cliquez sur 'Add webhook'"
            echo "3. URL: ${WEBSITE_URL}/deploy.php"
            echo "4. Content type: application/json"
            echo "5. Secret: $secret"
            echo "6. Events: Just the push event"
            echo ""
        else
            log_warning "Fichier deploy.php non trouvé"
        fi
    else
        log_info "Configuration webhook ignorée"
    fi
}

# Test du site web
test_website() {
    log_title "Test du site web"
    
    log_info "Test d'accès à ${WEBSITE_URL}..."
    
    if command -v curl &> /dev/null; then
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" "${WEBSITE_URL}" || echo "000")
        
        case $http_code in
            200|301|302)
                log_success "Site accessible (HTTP $http_code)"
                ;;
            404)
                log_warning "Site non trouvé (HTTP 404) - Peut être normal avant le premier déploiement"
                ;;
            000)
                log_error "Impossible de contacter le site"
                ;;
            *)
                log_warning "Réponse inattendue (HTTP $http_code)"
                ;;
        esac
    else
        log_warning "curl non disponible, impossible de tester le site"
    fi
}

# Initialiser le repository Git si nécessaire
setup_git() {
    log_title "Configuration Git"
    
    if [ ! -d ".git" ]; then
        log_info "Initialisation du repository Git..."
        git init
        
        log_info "Ajout de l'origine remote..."
        git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
        
        log_success "Repository Git initialisé"
    else
        log_success "Repository Git déjà configuré"
        
        # Vérifier la remote origin
        if git remote get-url origin &> /dev/null; then
            local current_origin=$(git remote get-url origin)
            log_info "Remote origin: $current_origin"
        else
            log_info "Ajout de l'origine remote..."
            git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
        fi
    fi
    
    # Vérifier la branche main
    local current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")
    if [ "$current_branch" != "main" ]; then
        log_info "Basculement vers la branche main..."
        git checkout -b main 2>/dev/null || git checkout main
    fi
    
    log_success "Configuration Git terminée"
}

# Installer les dépendances NPM
install_dependencies() {
    log_title "Installation des dépendances"
    
    if [ -f "package.json" ]; then
        log_info "Installation des dépendances npm..."
        npm install
        log_success "Dépendances installées"
        
        # Test des scripts
        log_info "Test des scripts npm..."
        
        if npm run lint --silent; then
            log_success "Script lint fonctionne"
        else
            log_warning "Script lint a des erreurs (normal au début)"
        fi
        
        if npm run build --silent; then
            log_success "Script build fonctionne"
        else
            log_warning "Script build a des erreurs"
        fi
        
    else
        log_warning "package.json non trouvé, installation ignorée"
    fi
}

# Résumé final
final_summary() {
    separator
    log_title "📋 RÉSUMÉ DE LA CONFIGURATION"
    
    echo "✅ Configuration terminée pour le déploiement automatique Xylocope"
    echo ""
    echo "🔧 Ce qui a été configuré :"
    echo "   • Structure du projet vérifiée"
    echo "   • Workflow GitHub Actions prêt"
    echo "   • Dépendances installées"
    echo "   • Repository Git configuré"
    echo ""
    echo "📝 Prochaines étapes :"
    echo "   1. Configurez les secrets GitHub Actions (FTP_USERNAME, FTP_PASSWORD)"
    echo "   2. Poussez vos modifications vers GitHub"
    echo "   3. Surveillez l'onglet Actions pour le déploiement"
    echo "   4. Vérifiez le site : ${WEBSITE_URL}"
    echo ""
    echo "🧪 Pour tester :"
    echo "   node scripts/test-deployment.js"
    echo ""
    echo "📚 Documentation :"
    echo "   README_DEPLOYMENT.md"
    echo ""
    
    log_success "🎉 Configuration terminée avec succès !"
}

# Fonction principale
main() {
    echo -e "${CYAN}"
    cat << "EOF"
 ██████╗ ██╗   ██╗██╗      ██████╗  ██████╗ ██████╗ ██████╗ ███████╗
██╔═══██╗╚██╗ ██╔╝██║     ██╔═══██╗██╔════╝██╔═══██╗██╔══██╗██╔════╝
██║   ██║ ╚████╔╝ ██║     ██║   ██║██║     ██║   ██║██████╔╝█████╗  
██║▄▄ ██║  ╚██╔╝  ██║     ██║   ██║██║     ██║   ██║██╔═══╝ ██╔══╝  
╚██████╔╝   ██║   ███████╗╚██████╔╝╚██████╗╚██████╔╝██║     ███████╗
 ╚══▀▀═╝    ╚═╝   ╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝ ╚═╝     ╚══════╝
                                                                     
🚀 Configuration automatique du déploiement - Version 1.0.0
EOF
    echo -e "${NC}\n"
    
    # Exécuter les étapes
    if ! check_prerequisites; then
        log_error "Prérequis manquants, arrêt du script"
        exit 1
    fi
    
    if ! check_project_structure; then
        log_error "Structure du projet incorrecte"
        read -p "Continuer malgré tout ? (y/N): " continue_anyway
        if [[ ! $continue_anyway =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    setup_git
    install_dependencies
    test_website
    setup_github_secrets
    test_ftp_connection
    setup_webhook
    final_summary
}

# Vérifier si le script est exécuté directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi