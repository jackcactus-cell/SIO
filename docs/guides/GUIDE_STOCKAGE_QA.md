# 📂 GUIDE : OÙ STOCKER VOS QUESTIONS/RÉPONSES

## 🎯 **FICHIERS PRINCIPAUX POUR Q&A**

### 1. **`SIO/backend/questionTemplates.js`** ⭐ PRINCIPAL
```javascript
// Fichier PRINCIPAL pour stocker vos questions/réponses prédéfinies
const questionTemplates = [
  {
    question: "Quels sont les utilisateurs OS (OS_USERNAME) ?",
    categorie: "Utilisateurs",
    champs: ["OS_USERNAME"],
    reponse: "Les utilisateurs OS sont : datchemi, tahose, olan..."
  },
  // VOS NOUVELLES QUESTIONS ICI
];
```

**🔹 Avantages :**
- Questions prédéfinies avec réponses exactes
- Catégorisation par domaine
- Templates réutilisables
- Performance optimisée

---

### 2. **`SIO/backend/advancedQuestionProcessor.js`** 🚀 AVANCÉ
```javascript
// Pour questions sophistiquées avec patterns regex
setupFiltresQuestions() {
  return [
    {
      pattern: /entrées.*audit.*DBUSERNAME.*['"]([^'"]+)['"]/i,
      handler: (data, match) => this.filterByDBUsername(data, match[1])
    },
    // VOS PATTERNS AVANCÉS ICI
  ];
}
```

**🔹 Avantages :**
- Reconnaissance intelligente par patterns
- Traitement automatique des données
- Analyses complexes
- Flexibilité maximale

---

### 3. **Base de Données MongoDB** 💾 DYNAMIQUE
```javascript
// Collection pour stocker Q&A dynamiques
db.question_answers.insertOne({
  question: "Votre question",
  answer: "Votre réponse",
  category: "utilisateurs",
  tags: ["oracle", "audit"],
  created_at: new Date(),
  confidence: 0.9
});
```

**🔹 Avantages :**
- Stockage permanent
- Questions générées dynamiquement
- Historique complet
- Recherche avancée

---

## 📋 **MÉTHODES DE STOCKAGE RECOMMANDÉES**

### ✅ **OPTION 1 : Questions Simples (RECOMMANDÉ)**
**Fichier :** `SIO/backend/questionTemplates.js`

```javascript
// Ajoutez vos questions dans le tableau existant :
const questionTemplates = [
  // Questions existantes...
  
  // VOS NOUVELLES QUESTIONS :
  {
    question: "Combien d'utilisateurs différents ?",
    categorie: "Statistiques",
    champs: ["DBUSERNAME", "OS_USERNAME"],
    reponse: "Il y a X utilisateurs uniques dans la base."
  },
  {
    question: "Quels programmes clients sont utilisés ?",
    categorie: "Applications",
    champs: ["CLIENT_PROGRAM_NAME"],
    reponse: "Les programmes les plus utilisés sont..."
  }
];
```

---

### ✅ **OPTION 2 : Questions avec Analyses (AVANCÉ)**
**Fichier :** `SIO/backend/questionTemplates.js` dans la fonction `answerQuestion()`

```javascript
// Ajouter de nouveaux cas dans answerQuestion() :
function answerQuestion(logs, question) {
  // Cas existants...
  
  // VOTRE NOUVEAU CAS :
  else if (normalizedQuestion.includes('votre_mot_cle')) {
    const analysis = logs.filter(/* votre logique */);
    
    result = analysis;
    summary = `VOTRE RÉSUMÉ`;
    explanation = `VOTRE EXPLICATION DÉTAILLÉE`;
    type = 'detailed_analysis';
    columns = ['Col1', 'Col2'];
  }
}
```

---

### ✅ **OPTION 3 : Fichier Séparé (ORGANISATION)**
**Nouveau fichier :** `SIO/backend/customQuestions.js`

```javascript
// Créez votre propre fichier de questions
const customQuestions = [
  {
    id: 'custom_001',
    question: "Analyse personnalisée des connexions",
    category: "custom",
    handler: (data) => {
      // Votre logique personnalisée
      return {
        summary: "Analyse custom",
        data: [...],
        explanation: "..."
      };
    }
  }
];

module.exports = { customQuestions };
```

Puis l'importer dans `intelligentChatbot.js` :
```javascript
const { customQuestions } = require('./customQuestions');
```

---

## 🗂️ **STRUCTURE RECOMMANDÉE POUR VOS Q&A**

### 📁 **Par Catégorie de Données :**

1. **Questions Utilisateurs** (`OS_USERNAME`, `DBUSERNAME`)
2. **Questions Actions** (`ACTION_NAME`)
3. **Questions Objets** (`OBJECT_SCHEMA`, `OBJECT_NAME`)
4. **Questions Infrastructure** (`USERHOST`, `TERMINAL`)
5. **Questions Temporelles** (`EVENT_TIMESTAMP`)
6. **Questions Méta** (Chatbot, Statistiques)

### 📝 **Format Standard :**
```javascript
{
  id: "unique_id",
  question: "Question exacte",
  category: "categorie",
  schema_fields: ["CHAMP1", "CHAMP2"],
  expected_response_type: "detailed_analysis|statistics|simple",
  handler: function(data) { /* logique */ },
  examples: ["exemple1", "exemple2"],
  difficulty: "easy|medium|hard"
}
```

---

## 🚀 **GUIDE PRATIQUE D'AJOUT**

### **Étape 1 : Choisir l'emplacement**
- **Questions simples** → `questionTemplates.js`
- **Questions complexes** → `advancedQuestionProcessor.js`
- **Questions personnalisées** → Nouveau fichier

### **Étape 2 : Ajouter votre question**
```javascript
// Dans questionTemplates.js :
{
  question: "VOTRE QUESTION ICI",
  categorie: "VOTRE_CATEGORIE",
  champs: ["COLONNES_UTILISÉES"],
  reponse: "RÉPONSE PRÉDÉFINIE OU LOGIQUE"
}
```

### **Étape 3 : Tester**
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot" -Method POST -ContentType "application/json" -Body '{"question":"VOTRE QUESTION ICI"}'
```

### **Étape 4 : Redémarrer le backend**
```powershell
# Arrêter
taskkill /F /IM node.exe

# Redémarrer
cd SIO/backend
node index.js
```

---

## 💡 **RECOMMANDATION FINALE**

**Pour commencer :** Utilisez `SIO/backend/questionTemplates.js`
- Plus simple à modifier
- Déjà intégré au système
- Questions reconnues automatiquement

**Pour aller plus loin :** Créez `SIO/backend/monDomaine_questions.js`
- Organisation par domaine métier
- Réutilisable dans d'autres projets
- Maintenance facilitée

**Le fichier `questionTemplates.js` est votre point d'entrée IDÉAL ! 🎯**



