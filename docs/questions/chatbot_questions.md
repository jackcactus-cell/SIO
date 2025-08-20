# 20 Questions pour le Chatbot d'Analyse d'Audit

## Questions sur les Utilisateurs

1. **Quels sont les utilisateurs les plus actifs ?**
   - Identifie les utilisateurs avec le plus d'actions dans la base de données

2. **Combien d'utilisateurs uniques se sont connectés ?**
   - Donne le nombre total d'utilisateurs distincts

3. **Quels utilisateurs ont accédé au schéma SYS ?**
   - Identifie les accès privilégiés au schéma système

4. **Quels sont les utilisateurs qui utilisent SQL Developer ?**
   - Liste les utilisateurs de l'outil de développement

5. **Quels utilisateurs se connectent depuis des terminaux inconnus ?**
   - Détecte les connexions suspectes

## Questions sur les Actions

6. **Quelles sont les actions les plus fréquentes ?**
   - Montre les types d'opérations les plus courantes

7. **Combien d'actions ont été effectuées aujourd'hui ?**
   - Statistiques d'activité récente

8. **Quelles actions sont effectuées par l'utilisateur 'datchemi' ?**
   - Analyse spécifique d'un utilisateur

9. **Quelles sont les actions de type SELECT ?**
   - Filtre les opérations de lecture

10. **Quelles sont les actions de type INSERT, UPDATE, DELETE ?**
    - Identifie les opérations de modification

## Questions sur les Objets

11. **Quels sont les objets les plus fréquemment accédés ?**
    - Montre les tables/vues les plus consultées

12. **Quels objets appartiennent au schéma HR ?**
    - Analyse par schéma spécifique

13. **Quels sont les objets accédés par l'utilisateur 'admin' ?**
    - Objets consultés par un utilisateur particulier

14. **Quels objets ont été modifiés (INSERT/UPDATE/DELETE) ?**
    - Objets ayant subi des modifications

15. **Quels sont les objets du schéma SYSTEM ?**
    - Accès aux objets système

## Questions sur les Sessions et Programmes

16. **Quels programmes clients sont utilisés ?**
    - Liste des outils de connexion (SQL Developer, etc.)

17. **Combien de sessions uniques ont été créées ?**
    - Statistiques des sessions

18. **Quels utilisateurs utilisent plusieurs programmes ?**
    - Utilisateurs avec divers outils

19. **Quelles sont les sessions les plus longues ?**
    - Sessions avec la plus longue durée

## Questions d'Analyse Avancée

20. **Y a-t-il des patterns suspects dans les données ?**
    - Détection automatique d'anomalies

## Questions Supplémentaires (Bonus)

21. **Quels sont les horaires de pointe d'activité ?**
    - Analyse temporelle des connexions

22. **Quels utilisateurs accèdent aux données en dehors des heures de bureau ?**
    - Détection d'accès inhabituels

23. **Quels sont les objets les plus sensibles (accès rares) ?**
    - Objets avec peu d'accès (potentiellement sensibles)

24. **Quelles sont les actions par heure de la journée ?**
    - Répartition temporelle des actions

25. **Quels utilisateurs n'ont effectué que des actions de lecture ?**
    - Utilisateurs en lecture seule

## Questions de Sécurité

26. **Y a-t-il des tentatives d'accès non autorisées ?**
    - Détection d'intrusion

27. **Quels utilisateurs ont accès à plusieurs schémas ?**
    - Utilisateurs avec privilèges étendus

28. **Quelles sont les actions effectuées sur les tables système ?**
    - Accès aux objets critiques

29. **Y a-t-il des connexions simultanées du même utilisateur ?**
    - Détection de sessions multiples

30. **Quels sont les objets avec le plus de modifications ?**
    - Tables les plus modifiées

---

**Note :** Ces questions peuvent être posées directement au chatbot via l'interface web ou l'API. Le système analysera automatiquement les données MongoDB de la collection `actions_audit` pour fournir des réponses détaillées. 