#!/bin/bash

echo "🧪 DÉBUT DES TESTS DE DÉPLOIEMENT"

# Test 1: Vérification de la structure
echo "📁 Test de structure..."
test_structure() {
    local required_files=("index.html" "css/main.css" "js/main.js" "assets/icons/logoV2.png")
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -eq 0 ]]; then
        echo "✅ Structure OK - tous les fichiers requis présents"
        return 0
    else
        echo "❌ Fichiers manquants: ${missing_files[*]}"
        return 1
    fi
}

# Test 2: Validation des chemins dans HTML
echo "🔗 Test des chemins..."
test_paths() {
    local html_files=("index.html")
    local issues=0
    
    for file in "${html_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            continue
        fi
        
        echo "Analyse de $file:"
        
        # Détecte les chemins absolus depuis racine (qui peuvent causer des problèmes)
        local absolute_paths=$(grep -n 'href="/\|src="/' "$file" | wc -l)
        
        if [[ $absolute_paths -gt 0 ]]; then
            echo "⚠️  $absolute_paths chemins absolus détectés dans $file"
            echo "   Ces chemins peuvent causer des redirections sur certains serveurs"
            ((issues++))
        else
            echo "✅ Aucun chemin absolu problématique dans $file"
        fi
        
        # Compte les ressources référencées
        local css_refs=$(grep -c 'href="[^"]*\.css"' "$file")
        local js_refs=$(grep -c 'src="[^"]*\.js"' "$file")
        local img_refs=$(grep -c 'src="[^"]*\.\(png\|jpg\|jpeg\|gif\|svg\)"' "$file")
        
        echo "   📊 Ressources référencées: ${css_refs} CSS, ${js_refs} JS, ${img_refs} images"
    done
    
    if [[ $issues -eq 0 ]]; then
        echo "✅ Analyse des chemins OK"
        return 0
    else
        echo "⚠️  $issues problème(s) potentiel(s) détecté(s)"
        return 1
    fi
}

# Test 3: Vérification des ressources
test_resources() {
    echo "📦 Test des ressources..."
    
    local missing_resources=()
    
    # Extrait et vérifie les ressources CSS
    local css_files=$(grep -oh 'href="[^"]*\.css"' index.html 2>/dev/null | sed 's/href="//;s/"//' | sed 's|^/||' || true)
    
    for css_file in $css_files; do
        if [[ ! -f "$css_file" ]]; then
            missing_resources+=("$css_file (CSS)")
        else
            echo "✅ CSS trouvé: $css_file"
        fi
    done
    
    # Extrait et vérifie les ressources JS
    local js_files=$(grep -oh 'src="[^"]*\.js"' index.html 2>/dev/null | sed 's/src="//;s/"//' | sed 's|^/||' || true)
    
    for js_file in $js_files; do
        if [[ ! -f "$js_file" ]]; then
            missing_resources+=("$js_file (JS)")
        else
            echo "✅ JS trouvé: $js_file"
        fi
    done
    
    # Vérifie quelques images clés
    local key_images=("assets/icons/logoV2.png" "assets/icons/large logo V2.png")
    
    for img_file in "${key_images[@]}"; do
        if [[ ! -f "$img_file" ]]; then
            missing_resources+=("$img_file (Image)")
        else
            echo "✅ Image trouvée: $img_file"
        fi
    done
    
    if [[ ${#missing_resources[@]} -eq 0 ]]; then
        echo "✅ Toutes les ressources clés sont présentes"
        return 0
    else
        echo "❌ Ressources manquantes: ${missing_resources[*]}"
        return 1
    fi
}

# Test 4: Validation de la configuration serveur optimale
test_server_config() {
    echo "⚙️  Test configuration serveur..."
    
    if [[ -f ".htaccess-optimal" ]]; then
        echo "📄 .htaccess optimal généré"
        
        # Vérifie qu'il n'y a pas de redirections infinies
        if grep -q "R=301.*%" ".htaccess-optimal"; then
            echo "⚠️  Redirections détectées - vérifiez la configuration"
            return 1
        else
            echo "✅ Aucune redirection automatique détectée"
        fi
        
        # Vérifie la présence de MIME types
        if grep -q "AddType" ".htaccess-optimal"; then
            echo "✅ MIME types configurés"
        fi
        
        # Vérifie la compression
        if grep -q "mod_deflate" ".htaccess-optimal"; then
            echo "✅ Compression configurée"
        fi
        
    else
        echo "⚠️  Aucun .htaccess optimal trouvé"
        return 1
    fi
    
    return 0
}

# Test 5: Simulation du déploiement
test_deployment_simulation() {
    echo "🚀 Simulation de déploiement..."
    
    # Crée un dossier de simulation
    local deploy_dir="deploy-simulation"
    mkdir -p "$deploy_dir"
    
    # Copie les fichiers essentiels
    local essential_files=("index.html" "css/" "js/" "assets/")
    local copied_files=0
    
    for file in "${essential_files[@]}"; do
        if [[ -e "$file" ]]; then
            cp -r "$file" "$deploy_dir/" 2>/dev/null && ((copied_files++))
        fi
    done
    
    # Copie le .htaccess optimal si disponible
    if [[ -f ".htaccess-optimal" ]]; then
        cp ".htaccess-optimal" "$deploy_dir/.htaccess"
        echo "✅ .htaccess optimal copié"
    fi
    
    echo "📊 $copied_files éléments copiés pour la simulation"
    
    # Vérifie la cohérence dans le dossier de simulation
    cd "$deploy_dir" || return 1
    
    local sim_issues=0
    
    # Teste les chemins dans le contexte de déploiement
    if [[ -f "index.html" ]]; then
        local broken_links=0
        
        # Extrait les chemins et vérifie leur existence
        while IFS= read -r line; do
            local path=$(echo "$line" | sed 's/.*["\x27]\([^"\x27]*\)["\x27].*/\1/' | sed 's|^/||')
            
            if [[ "$path" != "" && "$path" != "$line" ]]; then
                if [[ ! -e "$path" ]]; then
                    ((broken_links++))
                fi
            fi
        done < <(grep -oh '["\x27][^"\x27]*\.\(css\|js\|png\|jpg\|jpeg\|gif\|svg\)["\x27]' index.html 2>/dev/null || true)
        
        if [[ $broken_links -eq 0 ]]; then
            echo "✅ Simulation: tous les liens sont valides"
        else
            echo "❌ Simulation: $broken_links liens brisés détectés"
            ((sim_issues++))
        fi
    fi
    
    cd ..
    rm -rf "$deploy_dir"
    
    if [[ $sim_issues -eq 0 ]]; then
        echo "✅ Simulation de déploiement réussie"
        return 0
    else
        echo "❌ $sim_issues problème(s) dans la simulation"
        return 1
    fi
}

# Exécute tous les tests
echo "========================================"
echo "🎯 EXÉCUTION DE LA SUITE DE TESTS"
echo "========================================"

declare -i total_tests=0
declare -i passed_tests=0

run_test() {
    local test_name="$1"
    local test_function="$2"
    
    echo ""
    echo "🧪 Test: $test_name"
    echo "----------------------------------------"
    
    ((total_tests++))
    
    if $test_function; then
        echo "✅ $test_name: RÉUSSI"
        ((passed_tests++))
    else
        echo "❌ $test_name: ÉCHOUÉ"
    fi
}

run_test "Structure du projet" test_structure
run_test "Validation des chemins" test_paths  
run_test "Vérification des ressources" test_resources
run_test "Configuration serveur" test_server_config
run_test "Simulation de déploiement" test_deployment_simulation

echo ""
echo "========================================"
echo "📊 RÉSULTATS FINAUX"
echo "========================================"
echo "Tests exécutés: $total_tests"
echo "Tests réussis: $passed_tests"
echo "Taux de réussite: $((passed_tests * 100 / total_tests))%"

if [[ $passed_tests -eq $total_tests ]]; then
    echo "🎉 TOUS LES TESTS SONT PASSÉS!"
    echo "✅ Le projet est prêt pour le déploiement"
    exit 0
else
    echo "⚠️  $((total_tests - passed_tests)) test(s) ont échoué"
    echo "🔧 Vérifiez les problèmes identifiés avant le déploiement"
    exit 1
fi