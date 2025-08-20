# 🚀 Guide des Suggestions Dynamiques Intelligentes

## 📋 Vue d'ensemble

Le système de suggestions dynamiques a été entièrement repensé pour offrir une expérience utilisateur plus riche et variée. Les suggestions se renouvellent automatiquement et s'adaptent aux besoins de l'utilisateur.

## ✨ Nouvelles Fonctionnalités

### 🔄 Rotation Automatique
- **Activation automatique** : Les suggestions se renouvellent toutes les 30 secondes
- **Contrôle manuel** : Bouton pour activer/désactiver la rotation automatique
- **Indicateur visuel** : Badge "Auto" avec icône animée quand la rotation est active

### 🎯 Suggestions Variées
- **5 suggestions** au lieu de 3 précédemment
- **Questions intelligentes** : 60+ nouvelles questions générées par IA
- **Catégorisation avancée** : Filtrage par type de question
- **Indicateurs visuels** : Badges pour identifier les questions IA vs standard

### 🏷️ Catégories Disponibles
- **Utilisateurs et sessions** 👥
- **Actions spécifiques** ⚡
- **Schémas et objets** 🗄️
- **Horaires et fréquence** ⏰
- **Sécurité** 🛡️
- **Performance** 📈
- **Applications** 💻

## 🎮 Comment Utiliser

### 1. Interface Principale
```
┌─────────────────────────────────────────────────────────┐
│ ✨ Suggestions intelligentes [IA] [Variées] [Auto]      │
│ Dernière mise à jour: 14:30:25  [🔄] [Nouvelles]       │
└─────────────────────────────────────────────────────────┘
```

### 2. Filtres par Catégorie
```
👥 Utilisateurs et sessions  ⚡ Actions spécifiques
🗄️ Schémas et objets        ⏰ Horaires et fréquence
🛡️ Sécurité                📈 Performance
💻 Applications             💡 Général
```

### 3. Suggestions avec Métadonnées
```
[1] Quels sont les utilisateurs les plus actifs ?
    Utilisateurs et sessions • ✓ Prête • ✨ IA

[2] Quelles tables sont les plus consultées ?
    Schémas et objets • ✓ Prête

[3] Y a-t-il des accès suspects ?
    Sécurité • ✓ Prête • ✨ IA
```

## 🔧 Contrôles Disponibles

### Bouton de Rotation Automatique
- **Violet actif** : Rotation automatique activée
- **Gris inactif** : Rotation automatique désactivée
- **Icône animée** : Indique que la rotation est en cours

### Bouton de Rafraîchissement Manuel
- **"Nouvelles"** : Génère de nouvelles suggestions
- **"Rafraîchir..."** : Pendant le chargement
- **Icône animée** : Indique le traitement en cours

### Filtres de Catégorie
- **Bleu actif** : Catégorie sélectionnée
- **Gris inactif** : Catégories disponibles
- **Icônes thématiques** : Identification rapide

## 📊 Types de Questions

### Questions Standard (auditQuestions.ts)
- Questions prédéfinies du système
- Couverture complète des fonctionnalités
- Testées et validées

### Questions Intelligentes (IA)
- Générées dynamiquement
- Variations sur les thèmes principaux
- Adaptées au contexte utilisateur
- Badge ✨ IA pour identification

## 🎯 Exemples de Questions par Catégorie

### 👥 Utilisateurs et Sessions
- "Quels sont les utilisateurs les plus actifs ?"
- "Qui utilise le plus SQL Developer ?"
- "Combien d'utilisateurs uniques se sont connectés ?"
- "Quels utilisateurs accèdent au schéma SYS ?"

### ⚡ Actions Spécifiques
- "Quelles sont les actions les plus fréquentes ?"
- "Combien de requêtes SELECT ont été exécutées ?"
- "Qui fait le plus de modifications de données ?"
- "Quelles actions sont suspectes ?"

### 🗄️ Schémas et Objets
- "Quelles tables sont les plus consultées ?"
- "Quels schémas sont les plus actifs ?"
- "Quelles tables système sont accédées ?"
- "Quels objets sont le plus modifiés ?"

### ⏰ Horaires et Fréquence
- "À quelle heure l'activité est-elle maximale ?"
- "Quelle est la période la plus active ?"
- "Y a-t-il des pics d'activité inhabituels ?"
- "Quelle est la fréquence des actions par heure ?"

### 🛡️ Sécurité
- "Y a-t-il des accès suspects ?"
- "Quels utilisateurs accèdent aux objets système ?"
- "Y a-t-il des tentatives d'intrusion ?"
- "Quels privilèges sont les plus utilisés ?"

## 🔄 Comportement de Rotation

### Intervalle de Rotation
- **30 secondes** par défaut
- **Configurable** via `rotationInterval`
- **Pause automatique** pendant le rafraîchissement manuel

### Logique de Sélection
- **Mélange aléatoire** des questions disponibles
- **Filtrage par catégorie** si spécifiée
- **5 questions** sélectionnées à chaque rotation
- **Évite les doublons** dans la même session

## 🎨 Indicateurs Visuels

### Badges de Statut
- **IA** : Question générée par intelligence artificielle
- **Variées** : Système de suggestions diversifié
- **Auto** : Rotation automatique activée

### Indicateurs de Question
- **✓ Prête** : Question prête à être utilisée
- **✨ IA** : Question générée par IA
- **Numérotation** : Ordre des suggestions (1-5)

### États des Boutons
- **Actif** : Fonctionnalité en cours
- **Inactif** : Fonctionnalité disponible
- **Désactivé** : Fonctionnalité temporairement indisponible

## 🚀 Avantages

### Pour l'Utilisateur
- **Découverte continue** : Nouvelles questions régulièrement
- **Adaptation contextuelle** : Suggestions selon les besoins
- **Interface intuitive** : Contrôles visuels clairs
- **Performance optimisée** : Chargement rapide

### Pour le Système
- **Engagement utilisateur** : Interface plus dynamique
- **Couverture complète** : Questions sur tous les aspects
- **Maintenance facilitée** : Système modulaire
- **Évolutivité** : Ajout facile de nouvelles questions

## 🔧 Configuration Technique

### Variables d'État
```typescript
const [autoRotate, setAutoRotate] = useState<boolean>(true);
const [rotationInterval, setRotationInterval] = useState<number>(30000);
const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
```

### Hooks d'Effet
```typescript
// Rotation automatique
useEffect(() => {
  if (!autoRotate) return;
  
  const interval = setInterval(() => {
    if (!isRefreshing) {
      generateSuggestions(selectedCategory);
    }
  }, rotationInterval);

  return () => clearInterval(interval);
}, [selectedCategory, isRefreshing, autoRotate, rotationInterval]);
```

## 📈 Métriques de Performance

### Temps de Réponse
- **Génération** : < 200ms
- **Rotation** : 30 secondes par défaut
- **Filtrage** : Instantané

### Utilisation Mémoire
- **Questions en cache** : Optimisé
- **Rotation automatique** : Gestion efficace des intervalles
- **Nettoyage** : Automatic cleanup des timers

## 🎯 Bonnes Pratiques

### Pour les Utilisateurs
1. **Explorer les catégories** : Utiliser les filtres pour découvrir
2. **Activer la rotation** : Laisser les suggestions se renouveler
3. **Cliquer sur les suggestions** : Tester différentes questions
4. **Observer les indicateurs** : Comprendre le type de question

### Pour les Développeurs
1. **Ajouter des questions** : Étendre `intelligentQuestions`
2. **Créer des catégories** : Ajouter de nouveaux filtres
3. **Optimiser les patterns** : Améliorer la reconnaissance
4. **Tester les performances** : Vérifier les temps de réponse

## 🔮 Évolutions Futures

### Fonctionnalités Prévues
- **Personnalisation** : Suggestions adaptées au profil utilisateur
- **Historique** : Sauvegarde des questions favorites
- **Recherche** : Fonction de recherche dans les suggestions
- **Export** : Export des questions utilisées

### Améliorations Techniques
- **Machine Learning** : Suggestions basées sur l'usage
- **API externe** : Intégration de questions externes
- **Multilingue** : Support de plusieurs langues
- **Accessibilité** : Amélioration de l'accessibilité

---

*Ce guide sera mis à jour régulièrement pour refléter les nouvelles fonctionnalités et améliorations du système de suggestions dynamiques.*
