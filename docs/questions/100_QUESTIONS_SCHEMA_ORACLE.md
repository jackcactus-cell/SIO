# 🎯 100 QUESTIONS POUR VOTRE PROJET ORACLE AUDIT

## Schéma de vos données :
```
ID AUDIT_TYPE SESSIONID OS_USERNAME USERHOST TERMINAL AUTHENTICATION_TYPE 
DBUSERNAME CLIENT_PROGRAM_NAME OBJECT_SCHEMA OBJECT_NAME SQL_TEXT SQL_BINDS 
EVENT_TIMESTAMP ACTION_NAME INSTANCE_ID INSTANCE
```

---

## 👥 **QUESTIONS SUR LES UTILISATEURS (1-20)**

### OS_USERNAME & DBUSERNAME
1. "Quels sont tous les OS_USERNAME différents ?"
2. "Quels sont tous les DBUSERNAME différents ?"
3. "Quels utilisateurs se connectent le plus ?"
4. "Quel utilisateur a effectué le plus d'actions ?"
5. "Combien d'actions par OS_USERNAME ?"
6. "Combien d'actions par DBUSERNAME ?"
7. "Quels utilisateurs ont des privilèges élevés ?"
8. "Analyse des utilisateurs actifs"
9. "Utilisateurs avec le plus de sessions"
10. "Corrélation entre OS_USERNAME et DBUSERNAME"
11. "Utilisateurs qui accèdent à plusieurs schémas"
12. "Activité par utilisateur aujourd'hui"
13. "Dernière connexion de chaque utilisateur"
14. "Utilisateurs suspendus ou inactifs"
15. "Top 5 des utilisateurs les plus actifs"
16. "Utilisateurs avec accès système"
17. "Répartition des utilisateurs par type"
18. "Utilisateurs connectés simultanément"
19. "Analyse comportementale des utilisateurs"
20. "Utilisateurs avec actions suspectes"

---

## 🖥️ **QUESTIONS SUR L'INFRASTRUCTURE (21-35)**

### USERHOST & TERMINAL
21. "Quels sont tous les USERHOST différents ?"
22. "D'où viennent les connexions ?"
23. "Analyse des machines sources"
24. "Quels terminaux sont utilisés ?"
25. "Connexions par adresse IP"
26. "Machines avec le plus d'activité"
27. "Hôtes suspects ou non autorisés"
28. "Répartition géographique des connexions"
29. "Terminaux les plus utilisés"
30. "Analyse de sécurité des hôtes"
31. "Connexions depuis des machines externes"
32. "Pic d'activité par machine"
33. "Machines avec plusieurs utilisateurs"
34. "Analyse des postes de travail"
35. "Cartographie du réseau d'accès"

---

## 🔐 **QUESTIONS SUR L'AUTHENTIFICATION (36-45)**

### AUTHENTICATION_TYPE
36. "Quels types d'authentification sont utilisés ?"
37. "Répartition par AUTHENTICATION_TYPE"
38. "Connexions avec authentification faible"
39. "Méthodes d'authentification par utilisateur"
40. "Analyse de sécurité de l'authentification"
41. "Échecs d'authentification"
42. "Authentifications externes vs internes"
43. "Sécurité des méthodes de connexion"
44. "Utilisateurs sans authentification forte"
45. "Évolution des types d'authentification"

---

## 💻 **QUESTIONS SUR LES APPLICATIONS (46-55)**

### CLIENT_PROGRAM_NAME
46. "Quels programmes sont utilisés ?"
47. "Applications les plus populaires"
48. "Analyse des CLIENT_PROGRAM_NAME"
49. "Outils de développement utilisés"
50. "Applications avec le plus d'actions"
51. "Programmes suspects ou non autorisés"
52. "Répartition des applications clientes"
53. "Versions des logiciels utilisés"
54. "Applications par utilisateur"
55. "Performance des applications"

---

## 🗃️ **QUESTIONS SUR LES OBJETS (56-70)**

### OBJECT_SCHEMA & OBJECT_NAME
56. "Quels schémas sont les plus accédés ?"
57. "Quels objets sont les plus utilisés ?"
58. "Analyse des OBJECT_SCHEMA"
59. "Tables les plus consultées"
60. "Objets modifiés récemment"
61. "Schémas système vs utilisateur"
62. "Objets avec accès privilégiés"
63. "Tables jamais utilisées"
64. "Répartition par schéma"
65. "Objets sensibles accédés"
66. "Croissance des accès par objet"
67. "Objets créés vs supprimés"
68. "Analyse de popularité des tables"
69. "Schémas avec le plus d'activité"
70. "Objets temporaires vs permanents"

---

## ⚡ **QUESTIONS SUR LES ACTIONS (71-80)**

### ACTION_NAME
71. "Quelles sont les actions les plus fréquentes ?"
72. "Combien d'opérations SELECT ?"
73. "Analyse des ACTION_NAME"
74. "Actions de modification (INSERT/UPDATE/DELETE)"
75. "Opérations DDL vs DML"
76. "Actions administratives"
77. "Opérations potentiellement dangereuses"
78. "Fréquence des actions par heure"
79. "Actions par type d'utilisateur"
80. "Évolution des types d'actions"

---

## ⏰ **QUESTIONS TEMPORELLES (81-90)**

### EVENT_TIMESTAMP
81. "Activité par heure de la journée"
82. "Pics d'activité"
83. "Analyse des EVENT_TIMESTAMP"
84. "Activité en dehors des heures de bureau"
85. "Tendances hebdomadaires"
86. "Sessions les plus longues"
87. "Activité nocturne suspecte"
88. "Comparaison jour vs nuit"
89. "Évolution de l'activité dans le temps"
90. "Patterns temporels par utilisateur"

---

## 🔍 **QUESTIONS AVANCÉES (91-100)**

### SESSIONID, INSTANCE, SQL_TEXT
91. "Analyse des sessions utilisateur"
92. "Requêtes SQL les plus fréquentes"
93. "Sessions avec le plus d'actions"
94. "Analyse des instances Oracle"
95. "Requêtes avec erreurs"
96. "Sessions abandonnées"
97. "Analyse des requêtes complexes"
98. "Performance par instance"
99. "Corrélations entre tous les champs"
100. "Vue d'ensemble complète du système"

---

## 🚀 **COMMENT UTILISER CES QUESTIONS**

### Dans l'interface web (`http://localhost:5173`) :
Copiez-collez directement ces questions dans le chatbot.

### En ligne de commande :
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/api/chatbot" -Method POST -ContentType "application/json" -Body '{"question":"[QUESTION ICI]"}'
```

### Questions prioritaires pour commencer :
1. **"Quels utilisateurs se connectent le plus ?"**
2. **"Quelles sont les actions les plus fréquentes ?"**
3. **"Quels objets sont les plus utilisés ?"**
4. **"D'où viennent les connexions ?"**
5. **"Quels programmes sont utilisés ?"**

## 📊 **RÉSULTATS ATTENDUS**

Chaque question génèrera :
- ✅ **Tableaux structurés** avec vos colonnes
- ✅ **Statistiques détaillées** avec pourcentages
- ✅ **Analyses approfondies** pour l'étude
- ✅ **Explications contextuelles** académiques

**Ces 100 questions couvrent TOUS les aspects de votre schéma Oracle audit ! 🎯**



