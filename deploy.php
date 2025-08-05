<?php
/**
 * 🚀 Script de déploiement automatique OVH pour Xylocope
 * 
 * Ce script permet de déployer automatiquement le site via webhook GitHub
 * Alternative au déploiement GitHub Actions (à utiliser seulement si nécessaire)
 * 
 * @author Claude Code
 * @version 1.0.0
 */

error_reporting(E_ALL);
ini_set('display_errors', 0); // Désactiver l'affichage des erreurs en production

// Configuration
define('LOG_FILE', __DIR__ . '/deploy.log');
define('SECRET_TOKEN', 'CHANGE_THIS_SECRET_TOKEN'); // À changer impérativement
define('GITHUB_IPS', [
    '192.30.252.0/22',
    '185.199.108.0/22',
    '140.82.112.0/20',
    '143.55.64.0/20',
    '2a0a:a440::/29',
    '2606:50c0::/32'
]);

/**
 * Écrire dans le fichier de log
 */
function writeLog($message, $level = 'INFO') {
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[{$timestamp}] [{$level}] {$message}" . PHP_EOL;
    file_put_contents(LOG_FILE, $logEntry, FILE_APPEND | LOCK_EX);
}

/**
 * Vérifier si l'IP est autorisée (GitHub)
 */
function isValidGitHubIP($ip) {
    foreach (GITHUB_IPS as $range) {
        if (strpos($range, '/') !== false) {
            list($subnet, $mask) = explode('/', $range);
            if ((ip2long($ip) & ~((1 << (32 - $mask)) - 1)) == ip2long($subnet)) {
                return true;
            }
        } else {
            if ($ip === $range) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Vérifier la signature GitHub
 */
function verifyGitHubSignature($payload, $signature) {
    $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, SECRET_TOKEN);
    return hash_equals($expectedSignature, $signature);
}

/**
 * Exécuter une commande système en toute sécurité
 */
function executeCommand($command) {
    $output = [];
    $returnCode = 0;
    
    writeLog("Exécution: {$command}");
    exec($command . ' 2>&1', $output, $returnCode);
    
    $outputString = implode("\n", $output);
    writeLog("Sortie: {$outputString}");
    writeLog("Code de retour: {$returnCode}");
    
    return [
        'success' => $returnCode === 0,
        'output' => $outputString,
        'code' => $returnCode
    ];
}

/**
 * Créer une sauvegarde du site actuel
 */
function createBackup() {
    $backupDir = __DIR__ . '/backups';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d_H-i-s');
    $backupFile = "{$backupDir}/backup_{$timestamp}.tar.gz";
    
    $command = "tar -czf {$backupFile} --exclude=backups --exclude=deploy.log --exclude=.git . 2>/dev/null";
    $result = executeCommand($command);
    
    if ($result['success']) {
        writeLog("Sauvegarde créée: {$backupFile}");
        
        // Nettoyer les anciennes sauvegardes (garder seulement les 5 dernières)
        $backups = glob("{$backupDir}/backup_*.tar.gz");
        rsort($backups);
        $backupsToDelete = array_slice($backups, 5);
        
        foreach ($backupsToDelete as $oldBackup) {
            unlink($oldBackup);
            writeLog("Ancienne sauvegarde supprimée: " . basename($oldBackup));
        }
        
        return $backupFile;
    }
    
    writeLog("Échec de la création de sauvegarde", 'ERROR');
    return false;
}

/**
 * Déployer le site
 */
function deployWebsite() {
    writeLog("=== DÉBUT DU DÉPLOIEMENT ===");
    
    // Vérifier si Git est disponible
    $gitCheck = executeCommand('which git');
    if (!$gitCheck['success']) {
        writeLog("Git n'est pas disponible sur ce serveur", 'ERROR');
        return false;
    }
    
    // Vérifier si c'est un repository Git
    if (!is_dir(__DIR__ . '/.git')) {
        writeLog("Ce répertoire n'est pas un repository Git", 'ERROR');
        return false;
    }
    
    // Créer une sauvegarde
    $backup = createBackup();
    if (!$backup) {
        writeLog("Impossible de créer une sauvegarde, déploiement annulé", 'ERROR');
        return false;
    }
    
    // Récupérer les dernières modifications
    $commands = [
        'git fetch origin main',
        'git reset --hard origin/main',
        'git clean -fd'
    ];
    
    foreach ($commands as $command) {
        $result = executeCommand($command);
        if (!$result['success']) {
            writeLog("Échec de la commande: {$command}", 'ERROR');
            writeLog("Tentative de restauration...", 'WARNING');
            
            // Restaurer la sauvegarde
            executeCommand("tar -xzf {$backup}");
            writeLog("Sauvegarde restaurée", 'INFO');
            
            return false;
        }
    }
    
    // Vérifications post-déploiement
    if (!file_exists(__DIR__ . '/index.html')) {
        writeLog("Fichier index.html manquant après déploiement", 'ERROR');
        return false;
    }
    
    if (!is_dir(__DIR__ . '/css')) {
        writeLog("Dossier CSS manquant après déploiement", 'ERROR');
        return false;
    }
    
    writeLog("=== DÉPLOIEMENT TERMINÉ AVEC SUCCÈS ===");
    return true;
}

/**
 * Fonction principale
 */
function main() {
    // Vérifier la méthode HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        writeLog("Méthode non autorisée: " . $_SERVER['REQUEST_METHOD'], 'ERROR');
        die('Méthode non autorisée');
    }
    
    // Vérifier l'IP source
    $clientIP = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!isValidGitHubIP($clientIP)) {
        http_response_code(403);
        writeLog("IP non autorisée: {$clientIP}", 'ERROR');
        die('Accès refusé');
    }
    
    // Récupérer le payload
    $payload = file_get_contents('php://input');
    if (empty($payload)) {
        http_response_code(400);
        writeLog("Payload vide", 'ERROR');
        die('Payload requis');
    }
    
    // Vérifier la signature
    $signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
    if (!verifyGitHubSignature($payload, $signature)) {
        http_response_code(403);
        writeLog("Signature invalide", 'ERROR');
        die('Signature invalide');
    }
    
    // Décoder le payload JSON
    $data = json_decode($payload, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        writeLog("JSON invalide: " . json_last_error_msg(), 'ERROR');
        die('JSON invalide');
    }
    
    // Vérifier que c'est un push sur la branche main
    if (!isset($data['ref']) || $data['ref'] !== 'refs/heads/main') {
        writeLog("Push ignoré - branche: " . ($data['ref'] ?? 'inconnue'));
        die('Push ignoré (pas sur main)');
    }
    
    // Logs d'information
    $repository = $data['repository']['full_name'] ?? 'inconnu';
    $pusher = $data['pusher']['name'] ?? 'inconnu';
    $commits = count($data['commits'] ?? []);
    
    writeLog("Webhook reçu - Repository: {$repository}, Pusher: {$pusher}, Commits: {$commits}");
    
    // Déployer
    $success = deployWebsite();
    
    if ($success) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Déploiement réussi',
            'timestamp' => date('c')
        ]);
        writeLog("Réponse envoyée: Déploiement réussi");
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Échec du déploiement',
            'timestamp' => date('c')
        ]);
        writeLog("Réponse envoyée: Échec du déploiement", 'ERROR');
    }
}

// Interface web simple pour voir les logs (si pas de webhook)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['logs'])) {
    // Protection basique
    if (!isset($_GET['key']) || $_GET['key'] !== 'xylocope_logs_2024') {
        http_response_code(403);
        die('Accès refusé');
    }
    
    header('Content-Type: text/plain; charset=utf-8');
    
    if (file_exists(LOG_FILE)) {
        $logs = file_get_contents(LOG_FILE);
        
        // Afficher seulement les 100 dernières lignes
        $lines = explode("\n", $logs);
        $lastLines = array_slice($lines, -100);
        
        echo "=== LOGS DE DÉPLOIEMENT XYLOCOPE ===\n\n";
        echo implode("\n", $lastLines);
    } else {
        echo "Aucun log disponible";
    }
    exit;
}

// Exécuter le script principal si c'est un POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    main();
} else {
    // Page d'information pour les accès GET
    ?>
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Déploiement Xylocope</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 800px;
                margin: 50px auto;
                padding: 20px;
                background: #f5f5f5;
            }
            .container {
                background: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .status {
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
            .success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .info { background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
            .warning { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 Déploiement automatique Xylocope</h1>
            
            <div class="status info">
                <strong>ℹ️ Information:</strong> Ce script gère le déploiement automatique du site xylocope.fr
            </div>
            
            <h2>📋 Configuration requise</h2>
            <ul>
                <li>Repository Git initialisé</li>
                <li>Webhook GitHub configuré</li>
                <li>Secret token défini</li>
                <li>Permissions d'écriture</li>
            </ul>
            
            <h2>🔧 Fonctionnalités</h2>
            <ul>
                <li>✅ Vérification des signatures GitHub</li>
                <li>✅ Validation des IP sources</li>
                <li>✅ Sauvegarde automatique avant déploiement</li>
                <li>✅ Logs détaillés</li>
                <li>✅ Restauration en cas d'erreur</li>
            </ul>
            
            <div class="status warning">
                <strong>⚠️ Important:</strong> 
                N'oubliez pas de changer le SECRET_TOKEN dans le code !
            </div>
            
            <p><strong>Version:</strong> 1.0.0 | <strong>Créé par:</strong> Claude Code</p>
        </div>
    </body>
    </html>
    <?php
}
?>