export interface AuditQuestion {
  id: number;
  question: string;
  category: string;
  description: string;
}

export const auditQuestions: AuditQuestion[] = [
  // Questions générales sur les données
  { id: 1, question: "Combien d'événements d'audit sont enregistrés dans ce fichier ?", category: "Données générales", description: "Analyse du volume total d'événements" },
  { id: 2, question: "Quelle est la plage de dates couverte par ces données ?", category: "Données générales", description: "Période d'analyse des logs" },
  { id: 3, question: "Quels sont les types d'actions (ACTION_NAME) les plus fréquents ?", category: "Données générales", description: "Actions les plus communes" },
  { id: 4, question: "Combien d'utilisateurs différents (OS_USERNAME) sont enregistrés ?", category: "Données générales", description: "Nombre d'utilisateurs uniques" },
  { id: 5, question: "Quels sont les programmes clients (CLIENT_PROGRAM_NAME) les plus utilisés ?", category: "Données générales", description: "Applications les plus fréquentes" },

  // Questions sur les utilisateurs et les sessions
  { id: 6, question: "Quels sont les utilisateurs de base de données (DBUSERNAME) les plus actifs ?", category: "Utilisateurs et sessions", description: "Utilisateurs DB les plus actifs" },
  { id: 7, question: "Combien de sessions uniques (SESSIONID) sont enregistrées ?", category: "Utilisateurs et sessions", description: "Nombre de sessions distinctes" },
  { id: 8, question: "Quels sont les hôtes (USERHOST) les plus fréquents ?", category: "Utilisateurs et sessions", description: "Machines sources les plus communes" },
  { id: 9, question: "Quels terminaux (TERMINAL) sont utilisés pour se connecter ?", category: "Utilisateurs et sessions", description: "Types de terminaux utilisés" },
  { id: 10, question: "Quels sont les types d'authentification (AUTHENTICATION_TYPE) utilisés ?", category: "Utilisateurs et sessions", description: "Méthodes d'authentification" },

  // Questions sur les actions spécifiques
  { id: 11, question: "Combien de requêtes SELECT ont été exécutées ?", category: "Actions spécifiques", description: "Nombre de requêtes de lecture" },
  { id: 12, question: "Combien de requêtes TRUNCATE TABLE ont été exécutées ?", category: "Actions spécifiques", description: "Nombre de troncatures" },
  { id: 13, question: "Combien de requêtes UPDATE ont été exécutées ?", category: "Actions spécifiques", description: "Nombre de modifications" },
  { id: 14, question: "Combien de requêtes INSERT ont été exécutées ?", category: "Actions spécifiques", description: "Nombre d'insertions" },
  { id: 15, question: "Combien de requêtes DELETE ont été exécutées ?", category: "Actions spécifiques", description: "Nombre de suppressions" },
  { id: 16, question: "Combien de requêtes ALTER SYSTEM ont été exécutées ?", category: "Actions spécifiques", description: "Modifications système" },
  { id: 17, question: "Combien de requêtes CREATE INDEX ont été exécutées ?", category: "Actions spécifiques", description: "Créations d'index" },
  { id: 18, question: "Combien de requêtes CREATE PROCEDURE ont été exécutées ?", category: "Actions spécifiques", description: "Créations de procédures" },
  { id: 19, question: "Combien de requêtes ALTER PROCEDURE ont été exécutées ?", category: "Actions spécifiques", description: "Modifications de procédures" },
  { id: 20, question: "Combien de requêtes SET ROLE ont été exécutées ?", category: "Actions spécifiques", description: "Changements de rôles" },

  // Questions sur les schémas et objets
  { id: 21, question: "Quels sont les schémas (OBJECT_SCHEMA) les plus fréquemment interrogés ?", category: "Schémas et objets", description: "Schémas les plus actifs" },
  { id: 22, question: "Quels sont les objets (OBJECT_NAME) les plus fréquemment interrogés ?", category: "Schémas et objets", description: "Objets les plus consultés" },
  { id: 23, question: "Combien de fois la table SYS.OBJ$ a-t-elle été interrogée ?", category: "Schémas et objets", description: "Accès à la table système OBJ$" },
  { id: 24, question: "Combien de fois la table SYS.USER$ a-t-elle été interrogée ?", category: "Schémas et objets", description: "Accès à la table système USER$" },
  { id: 25, question: "Combien de fois la table SYS.TAB$ a-t-elle été interrogée ?", category: "Schémas et objets", description: "Accès à la table système TAB$" },
  { id: 26, question: "Quels sont les objets les plus souvent modifiés (UPDATE, INSERT, DELETE) ?", category: "Schémas et objets", description: "Objets les plus modifiés" },
  { id: 27, question: "Quels sont les objets les plus souvent tronqués (TRUNCATE) ?", category: "Schémas et objets", description: "Objets tronqués" },
  { id: 28, question: "Quels sont les objets liés aux privilèges (GV$ENABLEDPRIVS, V$ENABLEDPRIVS) interrogés ?", category: "Schémas et objets", description: "Vérifications de privilèges" },
  { id: 29, question: "Quels sont les objets système (SYS) les plus consultés ?", category: "Schémas et objets", description: "Accès aux objets système" },
  { id: 30, question: "Quels sont les objets des schémas applicatifs (SPT, EPOSTE, etc.) les plus consultés ?", category: "Schémas et objets", description: "Accès aux schémas applicatifs" },

  // Questions sur les horaires et la fréquence
  { id: 31, question: "À quelle heure de la journée l'activité est-elle la plus élevée ?", category: "Horaires et fréquence", description: "Pic d'activité horaire" },
  { id: 32, question: "Quelle est la fréquence des actions par heure ?", category: "Horaires et fréquence", description: "Distribution horaire" },
  { id: 33, question: "Combien d'actions ont été enregistrées entre 11h et 12h ?", category: "Horaires et fréquence", description: "Activité de 11h à 12h" },
  { id: 34, question: "Combien d'actions ont été enregistrées entre 14h et 15h ?", category: "Horaires et fréquence", description: "Activité de 14h à 15h" },
  { id: 35, question: "Quelle est la durée moyenne entre deux actions pour un même SESSIONID ?", category: "Horaires et fréquence", description: "Intervalle moyen entre actions" },

  // Questions sur les connexions (LOGON)
  { id: 36, question: "Combien de connexions (LOGON) ont été enregistrées ?", category: "Connexions", description: "Nombre total de connexions" },
  { id: 37, question: "Quels sont les utilisateurs les plus fréquents pour les connexions ?", category: "Connexions", description: "Utilisateurs connectés" },
  { id: 38, question: "Quels sont les programmes clients utilisés pour les connexions ?", category: "Connexions", description: "Applications de connexion" },
  { id: 39, question: "À quelles heures les connexions sont-elles les plus fréquentes ?", category: "Connexions", description: "Pics de connexion" },
  { id: 40, question: "Y a-t-il des connexions depuis des hôtes inconnus (USERHOST) ?", category: "Connexions", description: "Connexions suspectes" },

  // Questions sur les adresses IP et les réseaux
  { id: 41, question: "Quelles sont les adresses IP (HOST) les plus fréquentes ?", category: "Réseau et IP", description: "IPs les plus actives" },
  { id: 42, question: "Combien de connexions proviennent de 192.168.60.42 ?", category: "Réseau et IP", description: "Connexions depuis 192.168.60.42" },
  { id: 43, question: "Combien de connexions proviennent de 192.168.200.93 ?", category: "Réseau et IP", description: "Connexions depuis 192.168.200.93" },
  { id: 44, question: "Quels ports (PORT) sont les plus utilisés pour les connexions ?", category: "Réseau et IP", description: "Ports les plus utilisés" },
  { id: 45, question: "Y a-t-il des connexions depuis des adresses IP externes ?", category: "Réseau et IP", description: "Connexions externes" },

  // Questions sur les rôles et privilèges
  { id: 46, question: "Combien de fois l'action SET ROLE a-t-elle été exécutée ?", category: "Rôles et privilèges", description: "Changements de rôles" },
  { id: 47, question: "Quels utilisateurs ont utilisé SET ROLE le plus souvent ?", category: "Rôles et privilèges", description: "Utilisateurs changeant de rôles" },
  { id: 48, question: "Quels programmes clients sont associés à SET ROLE ?", category: "Rôles et privilèges", description: "Applications avec changement de rôles" },
  { id: 49, question: "Y a-t-il des actions suspectes liées aux rôles ?", category: "Rôles et privilèges", description: "Actions suspectes sur les rôles" },
  { id: 50, question: "Quels sont les schémas concernés par SET ROLE ?", category: "Rôles et privilèges", description: "Schémas avec changement de rôles" },

  // Questions sur les schémas applicatifs
  { id: 51, question: "Combien d'actions concernent le schéma SPT ?", category: "Schémas applicatifs", description: "Activité sur le schéma SPT" },
  { id: 52, question: "Combien d'actions concernent le schéma EPOSTE ?", category: "Schémas applicatifs", description: "Activité sur le schéma EPOSTE" },
  { id: 53, question: "Combien d'actions concernent le schéma IMOBILE ?", category: "Schémas applicatifs", description: "Activité sur le schéma IMOBILE" },
  { id: 54, question: "Combien d'actions concernent le schéma MBUDGET ?", category: "Schémas applicatifs", description: "Activité sur le schéma MBUDGET" },
  { id: 55, question: "Quelles tables du schéma SPT sont les plus consultées ?", category: "Schémas applicatifs", description: "Tables SPT les plus actives" },

  // Questions sur les actions de maintenance
  { id: 56, question: "Combien de TRUNCATE TABLE ont été exécutés sur MOUVEMENT_EPOSTE ?", category: "Maintenance", description: "Troncatures sur MOUVEMENT_EPOSTE" },
  { id: 57, question: "Combien de TRUNCATE TABLE ont été exécutés sur MOUVEMENT_UL ?", category: "Maintenance", description: "Troncatures sur MOUVEMENT_UL" },
  { id: 58, question: "Combien de TRUNCATE TABLE ont été exécutés sur TEMPORAL_LIGNE ?", category: "Maintenance", description: "Troncatures sur TEMPORAL_LIGNE" },
  { id: 59, question: "Combien de TRUNCATE TABLE ont été exécutés sur TEMP2 ?", category: "Maintenance", description: "Troncatures sur TEMP2" },
  { id: 60, question: "Qui a exécuté le plus de TRUNCATE TABLE ?", category: "Maintenance", description: "Utilisateurs tronquant le plus" },

  // Questions sur les procédures et fonctions
  { id: 61, question: "Quelles procédures ont été créées ou modifiées ?", category: "Procédures et fonctions", description: "Procédures créées/modifiées" },
  { id: 62, question: "Qui a créé ou modifié des procédures ?", category: "Procédures et fonctions", description: "Auteurs des procédures" },
  { id: 63, question: "Combien de fois MOON_API_DATA_VALIDATION a-t-elle été modifiée ?", category: "Procédures et fonctions", description: "Modifications de MOON_API_DATA_VALIDATION" },
  { id: 64, question: "Quels schémas contiennent des procédures modifiées ?", category: "Procédures et fonctions", description: "Schémas avec procédures modifiées" },
  { id: 65, question: "À quelles heures les procédures sont-elles modifiées ?", category: "Procédures et fonctions", description: "Horaires de modification des procédures" },

  // Questions sur les index
  { id: 66, question: "Combien de CREATE INDEX ont été exécutés ?", category: "Index", description: "Nombre total de créations d'index" },
  { id: 67, question: "Quels index ont été créés sur le schéma SPT ?", category: "Index", description: "Index créés sur SPT" },
  { id: 68, question: "Qui a créé des index ?", category: "Index", description: "Créateurs d'index" },
  { id: 69, question: "À quelles heures les index sont-ils créés ?", category: "Index", description: "Horaires de création d'index" },
  { id: 70, question: "Quelles tables ont été indexées ?", category: "Index", description: "Tables avec nouveaux index" },

  // Questions sur les batchs et automatisation
  { id: 71, question: "Combien d'actions sont associées à JDBC Thin Client ?", category: "Batchs et automatisation", description: "Actions JDBC Thin Client" },
  { id: 72, question: "Quels utilisateurs utilisent JDBC Thin Client ?", category: "Batchs et automatisation", description: "Utilisateurs JDBC" },
  { id: 73, question: "Quelles tables sont concernées par JDBC Thin Client ?", category: "Batchs et automatisation", description: "Tables accédées via JDBC" },
  { id: 74, question: "Combien d'actions sont associées à sqlplus ?", category: "Batchs et automatisation", description: "Actions sqlplus" },
  { id: 75, question: "Quels utilisateurs utilisent sqlplus ?", category: "Batchs et automatisation", description: "Utilisateurs sqlplus" },

  // Questions sur les applications spécifiques
  { id: 76, question: "Combien d'actions sont associées à Toad.exe ?", category: "Applications spécifiques", description: "Actions via Toad" },
  { id: 77, question: "Quels utilisateurs utilisent Toad.exe ?", category: "Applications spécifiques", description: "Utilisateurs Toad" },
  { id: 78, question: "Combien d'actions sont associées à SQL Developer ?", category: "Applications spécifiques", description: "Actions via SQL Developer" },
  { id: 79, question: "Quels utilisateurs utilisent SQL Developer ?", category: "Applications spécifiques", description: "Utilisateurs SQL Developer" },
  { id: 80, question: "Combien d'actions sont associées à rwbuilder.exe ?", category: "Applications spécifiques", description: "Actions via rwbuilder" },

  // Questions sur les schémas système
  { id: 81, question: "Combien d'actions concernent le schéma SYS ?", category: "Schémas système", description: "Actions sur le schéma SYS" },
  { id: 82, question: "Quelles tables système sont les plus consultées ?", category: "Schémas système", description: "Tables système populaires" },
  { id: 83, question: "Qui consulte les tables système ?", category: "Schémas système", description: "Utilisateurs accédant aux tables système" },
  { id: 84, question: "Combien de fois DUAL a-t-elle été interrogée ?", category: "Schémas système", description: "Utilisation de la table DUAL" },
  { id: 85, question: "Quelles vues système (GV$, V$) sont interrogées ?", category: "Schémas système", description: "Vues système consultées" },

  // Questions sur les schémas temporaires
  { id: 86, question: "Combien d'actions concernent des tables temporaires (TEMP, TEMP2) ?", category: "Schémas temporaires", description: "Actions sur tables temporaires" },
  { id: 87, question: "Qui utilise des tables temporaires ?", category: "Schémas temporaires", description: "Utilisateurs des tables temporaires" },
  { id: 88, question: "Quelles sont les actions les plus fréquentes sur les tables temporaires ?", category: "Schémas temporaires", description: "Actions communes sur tables temporaires" },
  { id: 89, question: "Combien de TRUNCATE sur des tables temporaires ?", category: "Schémas temporaires", description: "Troncatures de tables temporaires" },
  { id: 90, question: "Quels schémas contiennent des tables temporaires ?", category: "Schémas temporaires", description: "Schémas avec tables temporaires" },

  // Questions sur les schémas utilisateur
  { id: 91, question: "Quels schémas utilisateur (non système) sont les plus actifs ?", category: "Schémas utilisateur", description: "Schémas utilisateur les plus actifs" },
  { id: 92, question: "Quelles tables utilisateur sont les plus modifiées ?", category: "Schémas utilisateur", description: "Tables utilisateur modifiées" },
  { id: 93, question: "Qui accède aux schémas utilisateur ?", category: "Schémas utilisateur", description: "Utilisateurs accédant aux schémas utilisateur" },
  { id: 94, question: "Combien d'actions sont des SELECT sur des tables utilisateur ?", category: "Schémas utilisateur", description: "Lectures sur tables utilisateur" },
  { id: 95, question: "Combien d'actions sont des UPDATE sur des tables utilisateur ?", category: "Schémas utilisateur", description: "Modifications sur tables utilisateur" },

  // Questions sur les schémas de production
  { id: 96, question: "Toutes les actions sont-elles marquées comme PRODUCTION (INSTANCE) ?", category: "Production", description: "Vérification environnement production" },
  { id: 97, question: "Y a-t-il des actions suspectes en production ?", category: "Production", description: "Actions suspectes en production" },
  { id: 98, question: "Quelles sont les actions les plus risquées en production ?", category: "Production", description: "Actions à risque en production" },
  { id: 99, question: "Qui a les droits les plus étendus en production ?", category: "Production", description: "Utilisateurs avec droits étendus" },
  { id: 100, question: "Quelles sont les meilleures pratiques pour auditer ces actions en production ?", category: "Production", description: "Recommandations d'audit" }
];

export const getQuestionsByCategory = () => {
  const categories = [...new Set(auditQuestions.map(q => q.category))];
  return categories.map(category => ({
    category,
    questions: auditQuestions.filter(q => q.category === category)
  }));
}; 