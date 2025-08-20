# Guide de la Page de Maintenance

## Vue d'ensemble

La page de maintenance est une interface moderne et responsive qui s'affiche automatiquement en cas d'erreur de l'application ou du frontend. Elle fournit aux utilisateurs des informations claires sur l'état du système et les actions qu'ils peuvent entreprendre.

## Fonctionnalités

### 🔍 Détection automatique des problèmes
- **ErrorBoundary React** : Capture les erreurs JavaScript et redirige vers la page de maintenance
- **Surveillance réseau** : Détecte les problèmes de connectivité Internet
- **Vérification serveur** : Teste la disponibilité du backend via l'endpoint `/api/health`

### 📊 Informations en temps réel
- **Statut de connexion** : Indicateur visuel de la connectivité Internet
- **Heure actuelle** : Horloge en temps réel avec date complète
- **Type de connexion** : Détection automatique (WiFi, 4G, etc.)

### 🎯 Actions utilisateur
- **Actualiser la page** : Bouton pour recharger l'application
- **Retour à l'accueil** : Navigation vers la page d'accueil
- **Page précédente** : Retour à la page précédemment visitée

### 📞 Support utilisateur
- **Informations de contact** : Email et téléphone du support
- **Message explicatif** : Explication claire de la situation
- **Durée estimée** : Estimation du temps de résolution

## Architecture technique

### Composants créés

1. **`Maintenance.tsx`** - Page principale de maintenance
2. **`ErrorBoundary.tsx`** - Gestionnaire d'erreurs React
3. **`NetworkStatusBanner.tsx`** - Bannière de statut réseau
4. **`useNetworkStatus.ts`** - Hook de surveillance réseau
5. **`health.js`** - Endpoints de santé du backend

### Intégration dans l'application

```typescript
// App.tsx - Structure principale
<ErrorBoundary>
  <ThemeProvider>
    <AuthProvider>
      <Router>
        <NetworkStatusBanner />
        <Navbar />
        <Routes>
          <Route path="/maintenance" element={<Maintenance />} />
          {/* Autres routes */}
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
</ErrorBoundary>
```

## Configuration

### Endpoints de santé

Le backend expose deux endpoints de santé :

- **`GET /api/health`** : Vérification basique
- **`GET /api/health/detailed`** : Informations détaillées (admin)

### Variables d'environnement

```bash
# Configuration du support (à personnaliser)
SUPPORT_EMAIL=support@example.com
SUPPORT_PHONE=+33 1 23 45 67 89
MAINTENANCE_DURATION_ESTIMATE="30 minutes à 2 heures"
```

## Utilisation

### Accès manuel
```
http://localhost:3000/maintenance
```

### Déclenchement automatique
La page s'affiche automatiquement dans ces cas :
- Erreur JavaScript non gérée
- Perte de connexion Internet
- Serveur backend inaccessible
- Erreur 500 du serveur

### Test de la page

```bash
# Lancer les tests de maintenance
cd scripts
node test-maintenance.js
```

## Personnalisation

### Modification du design

La page utilise Tailwind CSS et s'intègre avec le thème de l'application. Pour modifier le style :

```typescript
// Maintenance.tsx - Personnalisation des couleurs
<div className="bg-red-100 rounded-full"> // Couleur de l'icône d'alerte
<div className="bg-blue-600 hover:bg-blue-700"> // Couleur des boutons
```

### Ajout d'informations

Pour ajouter des informations supplémentaires :

```typescript
// Ajouter un nouveau bloc d'information
<div className="bg-white rounded-lg p-6 shadow-lg">
  <h3 className="text-lg font-semibold text-gray-800">
    Nouvelle information
  </h3>
  <p className="text-gray-600">
    Contenu de l'information
  </p>
</div>
```

### Modification des messages

```typescript
// Messages personnalisables
const messages = {
  title: "Maintenance en cours",
  description: "Nous travaillons actuellement pour améliorer votre expérience",
  duration: "30 minutes à 2 heures selon la complexité des travaux",
  contact: "Si vous avez des questions urgentes..."
};
```

## Monitoring et logs

### Logs d'erreurs

Les erreurs sont automatiquement loggées :

```javascript
// ErrorBoundary.tsx
console.error('ErrorBoundary caught an error:', error, errorInfo);

// Envoi au serveur (optionnel)
await fetch('/api/log-error', {
  method: 'POST',
  body: JSON.stringify({
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })
});
```

### Métriques de santé

L'endpoint `/api/health/detailed` fournit :

- Utilisation mémoire
- Temps de réponse base de données
- Statut des services
- Informations système

## Dépannage

### Problèmes courants

1. **Page de maintenance ne s'affiche pas**
   - Vérifier que l'ErrorBoundary est bien intégré
   - Contrôler les logs de la console

2. **Bannière réseau ne fonctionne pas**
   - Vérifier l'endpoint `/api/health`
   - Contrôler la connectivité réseau

3. **Erreurs de compilation TypeScript**
   - Vérifier les imports
   - Contrôler les types définis

### Tests de diagnostic

```bash
# Test de l'endpoint de santé
curl http://localhost:8001/api/health

# Test de la page de maintenance
curl http://localhost:3000/maintenance

# Test des erreurs
curl http://localhost:8001/api/nonexistent
```

## Sécurité

### Protection des informations sensibles

- Les logs d'erreurs ne contiennent pas d'informations sensibles
- L'endpoint détaillé peut être protégé par authentification
- Les informations de contact sont configurables

### Bonnes pratiques

- Tester régulièrement la page de maintenance
- Maintenir les informations de contact à jour
- Surveiller les logs d'erreurs
- Documenter les procédures de maintenance

## Évolutions futures

### Fonctionnalités prévues

- [ ] Mode maintenance programmée
- [ ] Notifications push en cas de problème
- [ ] Intégration avec des outils de monitoring (Sentry, LogRocket)
- [ ] Page de maintenance multilingue
- [ ] Statistiques de disponibilité

### Améliorations techniques

- [ ] Service Worker pour le mode hors ligne
- [ ] Cache intelligent des ressources
- [ ] Retry automatique des requêtes
- [ ] Métriques de performance utilisateur

---

## Support

Pour toute question ou problème avec la page de maintenance, consultez :
- La documentation technique
- Les logs d'erreurs
- L'équipe de développement

**Contact :** support@example.com
**Téléphone :** +33 1 23 45 67 89

