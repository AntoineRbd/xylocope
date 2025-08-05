# 🚀 Guide de Déploiement Automatique - Xylocope.fr

Ce guide vous explique comment configurer le déploiement automatique de votre site xylocope.fr vers votre hébergement OVH.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Configuration GitHub Actions (Recommandé)](#configuration-github-actions-recommandé)
- [Configuration Webhook PHP (Alternative)](#configuration-webhook-php-alternative)
- [Scripts de test](#scripts-de-test)
- [Dépannage](#dépannage)
- [Sécurité](#sécurité)

## 🎯 Vue d'ensemble

### Approches disponibles

1. **GitHub Actions + FTP** ⭐ **(Recommandé)**
   - ✅ Plus fiable et sécurisé
   - ✅ Logs centralisés dans GitHub
   - ✅ Tests automatiques avant déploiement
   - ✅ Pas besoin de Git sur le serveur OVH

2. **Webhook PHP** (Alternative)
   - ⚠️ Nécessite Git sur le serveur
   - ⚠️ Plus complexe à déboguer
   - ✅ Déploiement instantané

## 📦 Prérequis

### Côté GitHub
- Repository GitHub configuré
- Accès aux paramètres du repository
- Branche `main` active

### Côté OVH
- Hébergement web Starter ou supérieur
- Accès FTP configuré
- SSL activé (Let's Encrypt)

### Informations nécessaires
```
Serveur FTP: ftp.cluster021.hosting.ovh.net
Serveur SSH: ssh.cluster021.hosting.ovh.net (si disponible)
Login: xylocoz
Répertoire web: /home/xylocoz/www/
```

## 🚀 Configuration GitHub Actions (Recommandé)

### Étape 1: Configuration des secrets GitHub

1. Aller dans votre repository GitHub
2. `Settings` → `Secrets and variables` → `Actions`
3. Cliquer sur `New repository secret`
4. Ajouter ces secrets :

```
FTP_USERNAME = xylocoz
FTP_PASSWORD = [votre_mot_de_passe_ftp]
```

### Étape 2: Vérifier le workflow

Le fichier `.github/workflows/deploy.yml` est déjà créé et contient :

- ✅ Tests automatiques (lint, validation HTML, tests unitaires)
- ✅ Build des assets optimisés
- ✅ Déploiement FTP vers OVH
- ✅ Vérification post-déploiement
- ✅ Nettoyage des fichiers inutiles
- ✅ Création automatique du .htaccess et robots.txt

### Étape 3: Premier déploiement

1. Poussez vos modifications vers la branche `main`
2. Le workflow se déclenche automatiquement
3. Surveillez l'onglet `Actions` de votre repository
4. Vérifiez que le site est en ligne : https://xylocope.fr

### Étape 4: Configuration de l'environnement (optionnel)

Pour une meilleure sécurité, configurez un environnement de production :

1. `Settings` → `Environments`
2. Créer un environnement `production`
3. Ajouter des règles de protection si nécessaire

## 🔗 Configuration Webhook PHP (Alternative)

⚠️ **Attention**: Cette méthode nécessite Git sur le serveur OVH, ce qui n'est pas toujours disponible sur l'hébergement partagé.

### Étape 1: Modifier le secret token

Dans le fichier `deploy.php`, changez :
```php
define('SECRET_TOKEN', 'VOTRE_SECRET_ULTRA_SECURISE_ICI');
```

Générez un token sécurisé :
```bash
openssl rand -hex 32
```

### Étape 2: Uploader le script

1. Uploadez `deploy.php` à la racine de votre site OVH
2. Définissez les permissions à 755 :
```bash
chmod 755 deploy.php
```

### Étape 3: Configuration du webhook GitHub

1. GitHub Repository → `Settings` → `Webhooks`
2. `Add webhook`
3. Configuration :
   - **Payload URL**: `https://xylocope.fr/deploy.php`
   - **Content type**: `application/json`
   - **Secret**: Le même que dans `deploy.php`
   - **Events**: `Just the push event`
   - **Active**: ✅

### Étape 4: Initialiser Git sur le serveur

Connectez-vous en SSH (si disponible) :
```bash
cd /home/xylocoz/www
git init
git remote add origin https://github.com/AntoineRbd/xylocope.git
git fetch origin main
git checkout -b main origin/main
```

### Étape 5: Test du webhook

Accédez à `https://xylocope.fr/deploy.php?logs&key=xylocope_logs_2024` pour voir les logs.

## 🧪 Scripts de test

### Test de connectivité FTP

Créez et exécutez `test-ftp.php` :

```php
<?php
$ftp = ftp_connect('ftp.cluster021.hosting.ovh.net');
if ($ftp) {
    echo "✅ Connexion FTP réussie\n";
    
    if (ftp_login($ftp, 'xylocoz', 'VOTRE_MOT_DE_PASSE')) {
        echo "✅ Authentification réussie\n";
        
        $files = ftp_nlist($ftp, './www/');
        echo "📁 Fichiers dans /www/: " . count($files) . "\n";
        
        ftp_close($ftp);
    } else {
        echo "❌ Échec de l'authentification\n";
    }
} else {
    echo "❌ Connexion FTP échouée\n";
}
?>
```

### Test local du workflow

```bash
# Vérifier les outils nécessaires
npm run lint
npm run validate-html
npm run test:unit
npm run build

# Simuler le déploiement
echo "Simulation réussie ✅"
```

## 🛠️ Dépannage

### Problèmes courants

#### 1. "FTP connection failed"
- ✅ Vérifiez les identifiants FTP
- ✅ Testez la connexion avec un client FTP (FileZilla)
- ✅ Vérifiez que le serveur FTP est correct

#### 2. "Permission denied"
- ✅ Vérifiez les permissions du répertoire /www/
- ✅ Assurez-vous que l'utilisateur FTP a les droits d'écriture

#### 3. "Webhook not received"
- ✅ Vérifiez l'URL du webhook
- ✅ Vérifiez le secret token
- ✅ Consultez les logs de livraison GitHub

#### 4. "Git not found" (webhook PHP)
- ❌ Git n'est pas disponible sur l'hébergement partagé
- ✅ Utilisez GitHub Actions à la place

### Commandes de diagnostic

```bash
# Vérifier les logs GitHub Actions
# Aller dans l'onglet Actions de votre repository

# Vérifier les logs webhook (si utilisé)
curl "https://xylocope.fr/deploy.php?logs&key=xylocope_logs_2024"

# Test direct du site
curl -I https://xylocope.fr
```

### Logs utiles

#### GitHub Actions
- Les logs sont disponibles dans l'onglet `Actions`
- Chaque étape a ses propres logs détaillés

#### Webhook PHP
- Logs dans `deploy.log` sur le serveur
- Accès via l'interface web du script

## 🔒 Sécurité

### Bonnes pratiques

1. **Secrets GitHub**
   - ✅ Utilisez toujours les secrets pour les mots de passe
   - ✅ Ne commitez jamais d'identifiants en dur

2. **Webhook PHP**
   - ✅ Changez obligatoirement le SECRET_TOKEN
   - ✅ Vérifiez les signatures GitHub
   - ✅ Limitez l'accès aux logs

3. **Permissions FTP**
   - ✅ Utilisez un utilisateur FTP dédié si possible
   - ✅ Limitez les permissions au strict nécessaire

4. **HTTPS**
   - ✅ SSL/TLS activé sur xylocope.fr
   - ✅ Redirection automatique HTTP → HTTPS

### Fichiers sensibles exclus du déploiement

Le workflow exclut automatiquement :
- `.git*` (repository Git)
- `node_modules/` (dépendances)
- `.env*` (variables d'environnement)
- Fichiers de logs et cache
- `deploy.php` (si utilisé)

## 📞 Support

### En cas de problème

1. **Vérifiez les logs** :
   - GitHub Actions : onglet Actions
   - Webhook : logs du script PHP

2. **Testez manuellement** :
   - Connexion FTP
   - Accès au site web
   - Fonctionnement des CSS/JS

3. **Points de vérification** :
   - Secrets GitHub configurés
   - Permissions FTP correctes
   - Site accessible en HTTPS

### Contacts utiles

- **Support OVH** : https://help.ovh.com/
- **Documentation GitHub Actions** : https://docs.github.com/actions
- **Aide FTP-Deploy-Action** : https://github.com/SamKirkland/FTP-Deploy-Action

---

## 📈 Améliorations futures

### Fonctionnalités avancées possibles

1. **Déploiement multi-environnements**
   - Staging (test.xylocope.fr)
   - Production (xylocope.fr)

2. **Tests automatisés avancés**
   - Tests E2E avec Playwright
   - Tests de performance Lighthouse
   - Validation W3C automatique

3. **Notifications**
   - Slack/Discord
   - Email sur échec
   - Webhooks personnalisés

4. **Rollback automatique**
   - Sauvegarde avant déploiement
   - Restauration en cas d'échec
   - Versioning des déploiements

---

**🎉 Félicitations !** Votre déploiement automatique est maintenant configuré !

Chaque `git push` sur la branche `main` mettra automatiquement à jour votre site https://xylocope.fr ✨