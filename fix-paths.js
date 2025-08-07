const fs = require('fs');

function fixAbsolutePaths() {
    console.log('🔧 Conversion des chemins absolus en chemins relatifs...');
    
    const files = ['index.html', 'dist/index.html'];
    let totalChanges = 0;
    
    files.forEach(file => {
        if (!fs.existsSync(file)) {
            console.log(`⚠️ Fichier non trouvé: ${file}`);
            return;
        }
        
        let content = fs.readFileSync(file, 'utf8');
        let changes = 0;
        
        // Conversions des chemins absolus en relatifs
        const conversions = [
            { from: 'href="/css/', to: 'href="css/' },
            { from: 'src="/js/', to: 'src="js/' },
            { from: 'src="/assets/', to: 'src="assets/' },
            { from: 'href="/assets/', to: 'href="assets/' },
            { from: 'src="/images/', to: 'src="images/' },
        ];
        
        conversions.forEach(conv => {
            const regex = new RegExp(conv.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = content.match(regex);
            if (matches) {
                content = content.replace(regex, conv.to);
                changes += matches.length;
                console.log(`  ✅ ${matches.length} occurrence(s) de "${conv.from}" → "${conv.to}" dans ${file}`);
            }
        });
        
        if (changes > 0) {
            fs.writeFileSync(file, content);
            console.log(`✅ ${file}: ${changes} chemins corrigés`);
            totalChanges += changes;
        } else {
            console.log(`ℹ️ ${file}: aucun chemin absolu trouvé`);
        }
    });
    
    console.log(`\n🎯 Total: ${totalChanges} chemins convertis de absolus vers relatifs`);
    
    if (totalChanges > 0) {
        console.log('✅ Correction des chemins terminée - les erreurs ERR_TOO_MANY_REDIRECTS devraient être résolues');
    } else {
        console.log('ℹ️ Aucun chemin absolu trouvé à corriger');
    }
}

// Exécution
fixAbsolutePaths();