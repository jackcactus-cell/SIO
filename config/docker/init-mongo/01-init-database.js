// Script d'initialisation MongoDB - Étape 1: Configuration de base
print('=== Étape 1: Configuration de la base de données audit_db ===');

// Utiliser la base de données audit_db
db = db.getSiblingDB('audit_db');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'audit_user',
  pwd: 'audit_password_123',
  roles: [
    { role: 'readWrite', db: 'audit_db' },
    { role: 'dbAdmin', db: 'audit_db' }
  ]
});

print('✅ Utilisateur audit_user créé');

// Créer les collections principales
db.createCollection('actions_audit');
db.createCollection('audit_logs');
db.createCollection('user_sessions');
db.createCollection('system_events');

print('✅ Collections créées');

// Créer les index pour de meilleures performances
db.actions_audit.createIndex({ "EVENT_TIMESTAMP": 1 });
db.actions_audit.createIndex({ "OS_USERNAME": 1 });
db.actions_audit.createIndex({ "ACTION_NAME": 1 });
db.actions_audit.createIndex({ "OBJECT_NAME": 1 });
db.actions_audit.createIndex({ "OBJECT_SCHEMA": 1 });

db.audit_logs.createIndex({ "timestamp": 1 });
db.audit_logs.createIndex({ "level": 1 });
db.audit_logs.createIndex({ "component": 1 });

db.user_sessions.createIndex({ "user_id": 1 });
db.user_sessions.createIndex({ "session_start": 1 });
db.user_sessions.createIndex({ "session_end": 1 });

print('✅ Index créés');

print('=== Étape 1 terminée ===');
