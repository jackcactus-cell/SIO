# Scripts Q/R et Intentions (Chatbot SAO)

## Objectif
Faciliter l'ajout de nouvelles questions/réponses, construire un mini-modèle d'intentions basé sur similarité, et tester le matching avant intégration.

## Fichiers
- `data/qna_sample.json` : exemple de Q/R au bon format
- `scripts/qna_merge.js` : merge + validation de Q/R dans `questionTemplates.js`
- `scripts/qna_intents_build.js` : construit un modèle d'intentions (basé textes)
- `scripts/qna_intents_match.js` : teste le matching d'une question utilisateur

## Formats
Entrée JSON (liste d'objets) :
```
[
  {
    "question": "Ma question ?",
    "categorie": "Catégorie",
    "champs": ["COL1", "COL2"],
    "reponse": "Réponse textuelle"
  }
]
```

## Commandes (PowerShell)
- Merge Q/R (sans écrire) :
```
cd SIO/backend
node scripts/qna_merge.js --input ./data/qna_sample.json --dry
```
- Merge Q/R (écriture) :
```
node scripts/qna_merge.js --input ./data/qna_sample.json
```
- Construire le modèle d'intentions :
```
node scripts/qna_intents_build.js --output ./data/intents_model.json
```
- Tester le matching d'une question :
```
node scripts/qna_intents_match.js --question "quels sont les utilisateurs les plus actifs ?" --model ./data/intents_model.json
```

## Bonnes pratiques
- Ajoutez des variantes de formulation dans `questionTemplates.js` (plusieurs entrées proches) si les utilisateurs écrivent différemment.
- Tenez à jour les catégories et les champs, cela facilite l'analyse et la navigation.
- Surveillez `SIO/logs/chatbot.log` pour repérer les formulations non reconnues à intégrer.





