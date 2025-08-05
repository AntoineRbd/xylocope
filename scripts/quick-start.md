# 🚀 Démarrage Rapide - Déploiement Xylocope

Guide ultra-rapide pour configurer le déploiement automatique en 5 minutes !

## ⚡ Setup en 5 étapes

### 1. Vérifier les prérequis ✅
```bash
# Vérifier Node.js et npm
node --version && npm --version

# Installer les dépendances
npm install
```

### 2. Configurer les secrets GitHub 🔐

Aller sur : `https://github.com/AntoineRbd/xylocope/settings/secrets/actions`

**Créer ces 2 secrets :**
- `FTP_USERNAME` → `xylocoz`
- `FTP_PASSWORD` → `[votre mot de passe FTP OVH]`

### 3. Tester la connexion FTP 🧪
```bash
# Test rapide de connectivité
php scripts/test-ftp.php

# Ou test complet
node scripts/test-deployment.js
```

### 4. Premier déploiement 🚀
```bash
# Ajouter tous les fichiers
git add .

# Commit avec message
git commit -m "feat: Configuration déploiement automatique"

# Push vers GitHub (déclenche le déploiement)
git push origin main
```

### 5. Vérifier le déploiement ✨

1. **GitHub Actions** : `https://github.com/AntoineRbd/xylocope/actions`
2. **Site en ligne** : `https://xylocope.fr`
3. **Logs** : Vérifier dans l'onglet Actions

## 🎯 C'est tout !

À partir de maintenant, chaque `git push` sur `main` déploie automatiquement !

## 🛠️ Commandes utiles

```bash
# Test local complet
npm run test && npm run build

# Test déploiement uniquement
node scripts/test-deployment.js

# Configuration manuelle détaillée
./scripts/setup-deployment.sh

# Build pour production
npm run deploy
```

## 🆘 Dépannage express

**Problème : "FTP connection failed"**
```bash
# Tester la connexion
php scripts/test-ftp.php
```

**Problème : "Secrets not found"**
- Vérifier : `GitHub Settings → Secrets → Actions`
- Ajouter : `FTP_USERNAME` et `FTP_PASSWORD`

**Problème : "Tests failed"**
```bash
# Corriger le lint
npm run lint -- --fix

# Corriger les tests
npm run test:unit
```

**Site non accessible**
- Attendre 2-3 minutes après le déploiement
- Vérifier les logs GitHub Actions
- Tester : `curl -I https://xylocope.fr`

## 📚 Documentation complète

Pour plus de détails : [`README_DEPLOYMENT.md`](../README_DEPLOYMENT.md)

---

**🎉 Déploiement configuré !** Chaque modification est maintenant automatiquement en ligne ! ✨