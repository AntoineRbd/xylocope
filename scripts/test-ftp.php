<?php
/**
 * 🧪 Script de test de connectivité FTP pour OVH
 * 
 * Ce script teste la connexion FTP vers l'hébergement OVH
 * et vérifie les permissions d'écriture
 * 
 * Usage: php scripts/test-ftp.php
 */

// Configuration
define('FTP_SERVER', 'ftp.cluster021.hosting.ovh.net');
define('FTP_PORT', 21);
define('FTP_USER', 'xylocoz');
define('REMOTE_DIR', './www/');
define('TEST_FILE', 'ftp-test-' . date('Y-m-d-H-i-s') . '.txt');

// Couleurs pour les logs (si supportées)
$colors = [
    'reset' => "\033[0m",
    'red' => "\033[31m",
    'green' => "\033[32m",
    'yellow' => "\033[33m",
    'blue' => "\033[34m",
    'cyan' => "\033[36m"
];

/**
 * Logger avec couleurs
 */
function log_message($message, $type = 'info') {
    global $colors;
    
    $prefix = match($type) {
        'success' => $colors['green'] . '✅ ',
        'error' => $colors['red'] . '❌ ',
        'warning' => $colors['yellow'] . '⚠️  ',
        'info' => $colors['blue'] . 'ℹ️  ',
        'title' => $colors['cyan'] . '🔍 ',
        default => ''
    };
    
    echo $prefix . $message . $colors['reset'] . "\n";
}

/**
 * Demander le mot de passe de façon sécurisée
 */
function prompt_password($prompt = "Mot de passe FTP: ") {
    echo $prompt;
    
    // Désactiver l'écho du terminal si possible
    if (function_exists('shell_exec') && stripos(PHP_OS, 'win') === false) {
        shell_exec('stty -echo');
        $password = trim(fgets(STDIN));
        shell_exec('stty echo');
        echo "\n";
    } else {
        // Fallback pour Windows ou si stty n'est pas disponible
        $password = trim(fgets(STDIN));
    }
    
    return $password;
}

/**
 * Tester la connexion FTP
 */
function test_ftp_connection($password) {
    log_message("Test de connexion FTP", 'title');
    
    // Connexion
    log_message("Connexion à " . FTP_SERVER . ":" . FTP_PORT . "...");
    $ftp = @ftp_connect(FTP_SERVER, FTP_PORT, 30);
    
    if (!$ftp) {
        log_message("Impossible de se connecter au serveur FTP", 'error');
        return false;
    }
    
    log_message("Connexion TCP établie", 'success');
    
    // Authentification
    log_message("Authentification avec l'utilisateur: " . FTP_USER . "...");
    $login = @ftp_login($ftp, FTP_USER, $password);
    
    if (!$login) {
        log_message("Échec de l'authentification", 'error');
        ftp_close($ftp);
        return false;
    }
    
    log_message("Authentification réussie", 'success');
    
    // Mode passif (recommandé pour les hébergements partagés)
    if (ftp_pasv($ftp, true)) {
        log_message("Mode passif activé", 'success');
    } else {
        log_message("Impossible d'activer le mode passif", 'warning');
    }
    
    return $ftp;
}

/**
 * Tester la navigation dans les dossiers
 */
function test_directory_navigation($ftp) {
    log_message("Test de navigation", 'title');
    
    // Lister le répertoire racine
    log_message("Listing du répertoire racine...");
    $files = @ftp_nlist($ftp, '.');
    
    if ($files === false) {
        log_message("Impossible de lister le répertoire racine", 'error');
        return false;
    }
    
    log_message("Répertoire racine: " . count($files) . " éléments trouvés", 'success');
    
    // Afficher quelques éléments
    $shown = 0;
    foreach ($files as $file) {
        if ($shown >= 5) break;
        log_message("  → " . basename($file));
        $shown++;
    }
    
    if (count($files) > 5) {
        log_message("  ... et " . (count($files) - 5) . " autres");
    }
    
    // Tester l'accès au dossier www
    log_message("Test d'accès au dossier www...");
    if (@ftp_chdir($ftp, REMOTE_DIR)) {
        log_message("Accès au dossier www réussi", 'success');
        
        // Lister le contenu du dossier www
        $www_files = @ftp_nlist($ftp, '.');
        if ($www_files !== false) {
            log_message("Dossier www: " . count($www_files) . " éléments", 'success');
        }
        
        return true;
    } else {
        log_message("Impossible d'accéder au dossier www", 'error');
        return false;
    }
}

/**
 * Tester les permissions d'écriture
 */
function test_write_permissions($ftp) {
    log_message("Test des permissions d'écriture", 'title');
    
    // Créer un fichier de test
    $test_content = "Test FTP Xylocope\n";
    $test_content .= "Date: " . date('Y-m-d H:i:s') . "\n";
    $test_content .= "Serveur: " . FTP_SERVER . "\n";
    $test_content .= "User: " . FTP_USER . "\n";
    
    // Créer un fichier temporaire local
    $temp_file = tempnam(sys_get_temp_dir(), 'ftp_test_');
    file_put_contents($temp_file, $test_content);
    
    log_message("Upload du fichier de test: " . TEST_FILE . "...");
    
    // Uploader le fichier
    if (@ftp_put($ftp, TEST_FILE, $temp_file, FTP_ASCII)) {
        log_message("Upload réussi", 'success');
        
        // Vérifier que le fichier existe
        $files = @ftp_nlist($ftp, '.');
        if ($files && in_array('./' . TEST_FILE, $files)) {
            log_message("Fichier confirmé sur le serveur", 'success');
            
            // Télécharger le fichier pour vérifier
            $download_file = tempnam(sys_get_temp_dir(), 'ftp_download_');
            if (@ftp_get($ftp, $download_file, TEST_FILE, FTP_ASCII)) {
                $downloaded_content = file_get_contents($download_file);
                if ($downloaded_content === $test_content) {
                    log_message("Vérification de l'intégrité réussie", 'success');
                } else {
                    log_message("Problème d'intégrité des données", 'warning');
                }
                unlink($download_file);
            }
            
            // Nettoyer le fichier de test
            if (@ftp_delete($ftp, TEST_FILE)) {
                log_message("Fichier de test supprimé", 'success');
            } else {
                log_message("Impossible de supprimer le fichier de test", 'warning');
            }
            
        } else {
            log_message("Fichier non trouvé après upload", 'error');
        }
        
    } else {
        log_message("Échec de l'upload", 'error');
        unlink($temp_file);
        return false;
    }
    
    unlink($temp_file);
    return true;
}

/**
 * Test des performances de transfert
 */
function test_transfer_performance($ftp) {
    log_message("Test de performance", 'title');
    
    // Créer un fichier de test plus volumineux (100KB)
    $large_content = str_repeat("Test de performance Xylocope\n", 3000);
    $large_file = tempnam(sys_get_temp_dir(), 'ftp_perf_');
    file_put_contents($large_file, $large_content);
    
    $remote_file = 'perf-test-' . date('H-i-s') . '.txt';
    
    log_message("Test d'upload d'un fichier de " . number_format(strlen($large_content)) . " octets...");
    
    $start_time = microtime(true);
    $success = @ftp_put($ftp, $remote_file, $large_file, FTP_BINARY);
    $end_time = microtime(true);
    
    if ($success) {
        $duration = $end_time - $start_time;
        $speed = (strlen($large_content) / 1024) / $duration; // KB/s
        
        log_message("Upload terminé en " . number_format($duration, 2) . "s", 'success');
        log_message("Vitesse: " . number_format($speed, 2) . " KB/s", 'success');
        
        // Nettoyer
        @ftp_delete($ftp, $remote_file);
    } else {
        log_message("Échec du test de performance", 'error');
    }
    
    unlink($large_file);
}

/**
 * Afficher les informations du serveur
 */
function show_server_info($ftp) {
    log_message("Informations du serveur", 'title');
    
    // Répertoire de travail actuel
    $pwd = @ftp_pwd($ftp);
    if ($pwd) {
        log_message("Répertoire actuel: " . $pwd, 'info');
    }
    
    // Système du serveur
    $system = @ftp_systype($ftp);
    if ($system) {
        log_message("Système: " . $system, 'info');
    }
    
    // Taille du répertoire www (approximative)
    $files = @ftp_rawlist($ftp, '.');
    if ($files) {
        $total_size = 0;
        $count = 0;
        
        foreach ($files as $file) {
            if (preg_match('/^-/', $file)) { // Fichier régulier
                $parts = preg_split('/\s+/', $file);
                if (isset($parts[4]) && is_numeric($parts[4])) {
                    $total_size += intval($parts[4]);
                    $count++;
                }
            }
        }
        
        if ($count > 0) {
            log_message("Fichiers analysés: " . $count, 'info');
            log_message("Taille totale: " . number_format($total_size / 1024, 2) . " KB", 'info');
        }
    }
}

/**
 * Fonction principale
 */
function main() {
    echo "\n";
    echo "🧪 Test FTP pour Xylocope - OVH Hosting\n";
    echo "======================================\n\n";
    
    // Demander le mot de passe
    $password = prompt_password();
    
    if (empty($password)) {
        log_message("Mot de passe requis", 'error');
        exit(1);
    }
    
    // Test de connexion
    $ftp = test_ftp_connection($password);
    if (!$ftp) {
        exit(1);
    }
    
    $success = true;
    
    // Tests séquentiels
    if (!test_directory_navigation($ftp)) {
        $success = false;
    }
    
    if (!test_write_permissions($ftp)) {
        $success = false;
    }
    
    test_transfer_performance($ftp);
    show_server_info($ftp);
    
    // Fermer la connexion
    ftp_close($ftp);
    
    // Résumé final
    echo "\n" . str_repeat("=", 50) . "\n";
    
    if ($success) {
        log_message("🎉 Tous les tests FTP ont réussi !", 'success');
        log_message("Le déploiement automatique devrait fonctionner correctement.", 'success');
    } else {
        log_message("❌ Certains tests ont échoué.", 'error');
        log_message("Vérifiez la configuration FTP avant de déployer.", 'error');
        exit(1);
    }
    
    echo "\nProchaines étapes :\n";
    echo "1. Configurez les secrets GitHub Actions\n";
    echo "2. Poussez vos modifications vers GitHub\n";
    echo "3. Surveillez l'onglet Actions\n\n";
}

// Exécuter si appelé directement
if (php_sapi_name() === 'cli') {
    main();
} else {
    echo "Ce script doit être exécuté en ligne de commande.\n";
    echo "Usage: php " . basename(__FILE__) . "\n";
}
?>