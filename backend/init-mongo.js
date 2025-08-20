// Script d'initialisation MongoDB
// Ce script s'exécute automatiquement lors du premier démarrage du conteneur

print('=== Initialisation de la base de données audit_db ===');

// Utiliser la base de données audit_db
db = db.getSiblingDB('audit_db');

// Créer la collection actions_audit si elle n'existe pas
db.createCollection('actions_audit');

// Insérer des données de test
const testData = [
  {
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'SEQ$',
    EVENT_TIMESTAMP: '2025-01-15T10:00:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SYS',
    USERHOST: '192.168.60.42'
  },
  {
    OS_USERNAME: 'ATCHEMI',
    DBUSERNAME: 'ATCHEMI',
    ACTION_NAME: 'INSERT',
    OBJECT_NAME: 'TABLE1',
    EVENT_TIMESTAMP: '2025-01-15T11:00:00Z',
    CLIENT_PROGRAM_NAME: 'sqlplus',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'USER_SCHEMA',
    USERHOST: '192.168.60.42'
  },
  {
    OS_USERNAME: 'SYSTEM',
    DBUSERNAME: 'SYSTEM',
    ACTION_NAME: 'UPDATE',
    OBJECT_NAME: 'MOUVEMENT',
    EVENT_TIMESTAMP: '2025-01-15T12:00:00Z',
    CLIENT_PROGRAM_NAME: 'rwbuilder.exe',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SYS',
    USERHOST: '192.168.60.42'
  },
  {
    OS_USERNAME: 'SYS',
    DBUSERNAME: 'SYS',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'SUM$',
    EVENT_TIMESTAMP: '2025-01-15T13:00:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SYS',
    USERHOST: '192.168.60.42'
  },
  {
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'DELETE',
    OBJECT_NAME: 'TEMP_TABLE',
    EVENT_TIMESTAMP: '2025-01-15T14:00:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'USER_SCHEMA',
    USERHOST: '192.168.60.42'
  },
  {
    OS_USERNAME: 'ATCHEMI',
    DBUSERNAME: 'ATCHEMI',
    ACTION_NAME: 'CREATE',
    OBJECT_NAME: 'NEW_TABLE',
    EVENT_TIMESTAMP: '2025-01-15T15:00:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'USER_SCHEMA',
    USERHOST: '192.168.60.42'
  },
  {
    OS_USERNAME: 'SYSTEM',
    DBUSERNAME: 'SYSTEM',
    ACTION_NAME: 'DROP',
    OBJECT_NAME: 'OLD_TABLE',
    EVENT_TIMESTAMP: '2025-01-15T16:00:00Z',
    CLIENT_PROGRAM_NAME: 'sqlplus',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'USER_SCHEMA',
    USERHOST: '192.168.60.42'
  },
  {
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'DBA_USERS',
    EVENT_TIMESTAMP: '2025-01-15T17:00:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SYS',
    USERHOST: '192.168.60.42'
  },
  {
    OS_USERNAME: 'ATCHEMI',
    DBUSERNAME: 'ATCHEMI',
    ACTION_NAME: 'UPDATE',
    OBJECT_NAME: 'EMPLOYEES',
    EVENT_TIMESTAMP: '2025-01-15T18:00:00Z',
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'USER_SCHEMA',
    USERHOST: '192.168.60.42'
  },
  {
    OS_USERNAME: 'SYSTEM',
    DBUSERNAME: 'SYSTEM',
    ACTION_NAME: 'INSERT',
    OBJECT_NAME: 'LOGS',
    EVENT_TIMESTAMP: '2025-01-15T19:00:00Z',
    CLIENT_PROGRAM_NAME: 'sqlplus',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'USER_SCHEMA',
    USERHOST: '192.168.60.42'
  }
];

// Insérer les données de test
const result = db.actions_audit.insertMany(testData);
print(`✅ ${result.insertedCount} documents insérés dans actions_audit`);

// Vérifier le nombre de documents
const count = db.actions_audit.countDocuments();
print(`📊 Total de documents dans actions_audit: ${count}`);

// Créer un index sur EVENT_TIMESTAMP pour de meilleures performances
db.actions_audit.createIndex({ "EVENT_TIMESTAMP": 1 });
print('✅ Index créé sur EVENT_TIMESTAMP');

print('=== Initialisation terminée ==='); 