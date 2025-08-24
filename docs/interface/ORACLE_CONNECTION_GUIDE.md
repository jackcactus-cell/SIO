# Guide d'utilisation - Connexion Oracle

## Vue d'ensemble

La page de connexion Oracle permet de configurer et tester les connexions à vos bases de données Oracle. Elle offre une interface intuitive pour :

- Tester les connexions Oracle
- Sauvegarder les configurations de connexion
- Gérer plusieurs connexions
- Initialiser des pools de connexions

## Fonctionnalités principales

### 1. Gestion des connexions sauvegardées

**Panneau de gauche** : Liste des connexions sauvegardées
- Affiche toutes les connexions précédemment configurées
- Permet de charger rapidement une configuration existante
- Bouton de suppression pour chaque connexion
- Indication visuelle de la connexion sélectionnée

### 2. Configuration d'une nouvelle connexion

**Panneau de droite** : Formulaire de configuration

#### Champs requis (*)
- **Nom de la connexion** : Identifiant unique pour cette connexion
- **Hôte** : Adresse IP ou nom d'hôte du serveur Oracle
- **Port** : Port Oracle (généralement 1521)
- **Service** : Nom du service Oracle (ex: ORCL, XE, etc.)
- **Nom d'utilisateur** : Compte utilisateur Oracle
- **Mot de passe** : Mot de passe du compte

#### Champs optionnels
- **Mode Driver** : 
  - `Thin` (recommandé) : Driver Python pur, plus léger
  - `Thick` : Nécessite Oracle Instant Client installé

### 3. Test et sauvegarde

#### Bouton "Tester la connexion"
- Vérifie la connectivité avec la base Oracle
- Affiche le statut en temps réel
- Messages d'erreur détaillés en cas d'échec

#### Bouton "Sauvegarder"
- Enregistre la configuration dans le stockage local
- Initialise le pool de connexions Oracle
- Confirmation visuelle du succès

## États de connexion

### Aucune connexion active
- Icône grise avec message informatif
- Invite à configurer une connexion

### Test en cours
- Animation de chargement
- Message "Test de connexion en cours..."

### Connexion réussie
- Icône verte avec message de succès
- Détails de la connexion établie

### Échec de connexion
- Icône rouge avec message d'erreur
- Description détaillée de l'erreur

## Informations et conseils

### Prérequis
- Service Oracle démarré et accessible
- Port 1521 ouvert et accessible
- Identifiants de connexion valides
- Module `oracledb` installé côté backend

### Dépannage

#### Erreur "Module oracledb non installé"
```bash
# Dans le dossier backend_python
pip install oracledb
```

#### Erreur de connexion réseau
- Vérifiez que le serveur Oracle est démarré
- Testez la connectivité : `telnet hostname 1521`
- Vérifiez les paramètres de pare-feu

#### Erreur d'authentification
- Vérifiez le nom d'utilisateur et mot de passe
- Assurez-vous que l'utilisateur a les droits de connexion
- Vérifiez que le compte n'est pas verrouillé

#### Erreur de service
- Vérifiez le nom du service Oracle
- Utilisez `lsnrctl services` pour lister les services disponibles
- Vérifiez le fichier `tnsnames.ora` si applicable

## Utilisation avancée

### Mode Thick vs Thin

#### Mode Thin (recommandé)
- Driver Python pur
- Plus léger, pas d'installation Oracle requise
- Compatible avec la plupart des environnements

#### Mode Thick
- Nécessite Oracle Instant Client
- Performances légèrement meilleures
- Plus de fonctionnalités avancées disponibles

### Pool de connexions

Le système initialise automatiquement un pool de connexions pour :
- Améliorer les performances
- Réduire la surcharge de connexion
- Gérer les connexions concurrentes

### Stockage sécurisé

- Les mots de passe ne sont pas sauvegardés localement
- Les configurations sont stockées dans le localStorage du navigateur
- Chiffrement recommandé pour les environnements de production

## Scripts de test

### Test manuel via script Python
```bash
cd backend_python
python test_oracle_connection.py [host] [port] [service] [username] [password] [driver_mode]
```

### Test avec paramètres par défaut
```bash
python test_oracle_connection.py
```

### Test avec paramètres personnalisés
```bash
python test_oracle_connection.py oracle-server 1521 ORCL myuser mypassword thin
```

## Intégration avec l'application

Une fois la connexion Oracle configurée, elle est disponible pour :
- L'explorateur de schéma
- L'éditeur SQL
- Les analyses d'audit
- Les rapports de performance

## Support et maintenance

### Logs
Les actions de connexion sont loggées dans :
- Console du navigateur (logs frontend)
- Fichiers de logs du backend Python
- Base de données d'audit (si configurée)

### Monitoring
- Statut de connexion en temps réel
- Métriques de performance du pool
- Alertes en cas de déconnexion

## Sécurité

### Recommandations
- Utilisez des comptes dédiés avec privilèges minimaux
- Changez régulièrement les mots de passe
- Limitez l'accès réseau aux serveurs Oracle
- Utilisez SSL/TLS pour les connexions sensibles

### Audit
- Toutes les tentatives de connexion sont enregistrées
- Suivi des modifications de configuration
- Historique des connexions réussies/échouées
