# 🔧 Guide de Dépannage - Éditeur SQL

## Problème Identifié

L'erreur `"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"` indique que :
1. **Le frontend reçoit une page HTML** au lieu d'une réponse JSON
2. **Le backend n'est pas accessible** sur http://localhost:4000
3. **L'endpoint `/api/sql/execute` n'est pas disponible**

## Diagnostic et Solutions

### 1. ✅ Vérifier Node.js et les Dépendances

```bash
# Vérifier la version de Node.js
node --version

# Vérifier npm
npm --version

# Réinstaller les dépendances
cd backend
npm install
```

### 2. ✅ Démarrer le Backend Correctement

```bash
# Aller dans le dossier backend
cd backend

# Installer les dépendances
npm install

# Démarrer le serveur
node index.js
```

**Vérifier que vous voyez :**
```
[INFO] [MongoDB] Connecté à MongoDB: mongodb://localhost:27017/audit_db
[INFO] [Server] Serveur backend démarré sur http://localhost:4000
```

### 3. ✅ Tester les Endpoints

**Test avec curl (si disponible) :**
```bash
curl http://localhost:4000/api/health
```

**Test avec PowerShell :**
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method Get
```

**Test avec le navigateur :**
- Ouvrir http://localhost:4000/api/health
- Devrait afficher du JSON

### 4. ✅ Démarrer le Frontend

```bash
# Aller dans le dossier project
cd project

# Installer les dépendances
npm install

# Démarrer le frontend
npm run dev
```

**Vérifier que vous voyez :**
```
Local:   http://localhost:5173/
```

### 5. ✅ Tester l'Éditeur SQL

1. **Ouvrir** http://localhost:5173/dashboard/sql-editor
2. **Sélectionner** un exemple de requête
3. **Cliquer** sur "Exécuter"
4. **Vérifier** la console du navigateur (F12 > Console)

## Solutions Alternatives

### Solution 1 : Utiliser un Port Différent

Si le port 4000 est bloqué, modifiez le backend :

```javascript
// Dans backend/index.js
const PORT = process.env.PORT || 4001; // Changer le port
```

Et mettez à jour le frontend :

```typescript
// Dans SQLQueryEditor.tsx
const response = await fetch('http://localhost:4001/api/sql/execute', {
```

### Solution 2 : Vérifier le Pare-feu Windows

1. **Ouvrir** le Pare-feu Windows
2. **Autoriser** Node.js dans les applications autorisées
3. **Vérifier** que le port 4000 n'est pas bloqué

### Solution 3 : Utiliser un Serveur de Test Simple

Créer `backend/simple_server.js` :

```javascript
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'success', message: 'Serveur OK' });
});

app.post('/api/sql/execute', (req, res) => {
  const { query } = req.body;
  res.json({
    status: 'success',
    data: [
      { DBUSERNAME: 'test', ACTION_NAME: 'SELECT', nombre_actions: 5 }
    ]
  });
});

app.listen(4000, () => {
  console.log('✅ Serveur simple démarré sur http://localhost:4000');
});
```

Puis démarrer :
```bash
cd backend
node simple_server.js
```

### Solution 4 : Vérifier MongoDB

Si MongoDB n'est pas installé, le système utilisera des données factices automatiquement.

## Tests de Validation

### Test 1 : Backend
```bash
# Démarrer le backend
cd backend
node index.js

# Dans un autre terminal, tester
curl http://localhost:4000/api/health
```

### Test 2 : Frontend
```bash
# Démarrer le frontend
cd project
npm run dev

# Ouvrir http://localhost:5173/dashboard/sql-editor
```

### Test 3 : Éditeur SQL
1. Aller sur http://localhost:5173/dashboard/sql-editor
2. Sélectionner "Utilisateurs actifs" dans les exemples
3. Cliquer sur "Exécuter"
4. Vérifier que les résultats s'affichent

## Messages d'Erreur Courants

### "Cannot GET /api/health"
- **Cause :** Serveur backend non démarré
- **Solution :** Démarrer `node index.js` dans le dossier backend

### "Unexpected token '<'"
- **Cause :** Réception d'une page HTML au lieu de JSON
- **Solution :** Vérifier que le backend répond sur le bon port

### "Failed to fetch"
- **Cause :** Problème de CORS ou serveur inaccessible
- **Solution :** Vérifier que CORS est configuré et que le serveur est démarré

### "Cannot find module"
- **Cause :** Dépendances manquantes
- **Solution :** Exécuter `npm install` dans le dossier backend

## Vérification Finale

Une fois tout configuré, vous devriez pouvoir :

1. ✅ **Démarrer le backend** sans erreur
2. ✅ **Accéder à** http://localhost:4000/api/health
3. ✅ **Démarrer le frontend** sans erreur
4. ✅ **Accéder à** http://localhost:5173/dashboard/sql-editor
5. ✅ **Exécuter des requêtes SQL** et voir les résultats

## Prochaines Étapes

Si le problème persiste :

1. **Vérifier les logs** du backend pour des erreurs spécifiques
2. **Tester avec un serveur minimal** pour isoler le problème
3. **Vérifier les ports** utilisés par d'autres applications
4. **Redémarrer** l'ordinateur si nécessaire

## Support

Si le problème persiste après avoir suivi ce guide, vérifiez :
- Les logs du backend dans la console
- Les erreurs dans la console du navigateur (F12)
- Les messages d'erreur spécifiques 