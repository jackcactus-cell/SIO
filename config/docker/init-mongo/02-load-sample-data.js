// Script d'initialisation MongoDB - Étape 2: Chargement des données d'exemple
print('=== Étape 2: Chargement des données d\'exemple ===');

// Utiliser la base de données audit_db
db = db.getSiblingDB('audit_db');

// Données d'exemple pour actions_audit
const auditActions = [
  {
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'EMPLOYEES',
    EVENT_TIMESTAMP: new Date('2025-01-15T10:00:00Z'),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'HR',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_001',
    SQL_TEXT: 'SELECT * FROM employees WHERE department_id = 10'
  },
  {
    OS_USERNAME: 'ATCHEMI',
    DBUSERNAME: 'ATCHEMI',
    ACTION_NAME: 'INSERT',
    OBJECT_NAME: 'CUSTOMERS',
    EVENT_TIMESTAMP: new Date('2025-01-15T11:00:00Z'),
    CLIENT_PROGRAM_NAME: 'sqlplus',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SALES',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_002',
    SQL_TEXT: 'INSERT INTO customers (id, name, email) VALUES (1001, \'John Doe\', \'john@example.com\')'
  },
  {
    OS_USERNAME: 'SYSTEM',
    DBUSERNAME: 'SYSTEM',
    ACTION_NAME: 'UPDATE',
    OBJECT_NAME: 'PRODUCTS',
    EVENT_TIMESTAMP: new Date('2025-01-15T12:00:00Z'),
    CLIENT_PROGRAM_NAME: 'rwbuilder.exe',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'INVENTORY',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_003',
    SQL_TEXT: 'UPDATE products SET price = 29.99 WHERE product_id = 101'
  },
  {
    OS_USERNAME: 'SYS',
    DBUSERNAME: 'SYS',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'DBA_USERS',
    EVENT_TIMESTAMP: new Date('2025-01-15T13:00:00Z'),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SYS',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_004',
    SQL_TEXT: 'SELECT username, account_status FROM dba_users WHERE account_status = \'OPEN\''
  },
  {
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'DELETE',
    OBJECT_NAME: 'TEMP_ORDERS',
    EVENT_TIMESTAMP: new Date('2025-01-15T14:00:00Z'),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SALES',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_005',
    SQL_TEXT: 'DELETE FROM temp_orders WHERE created_date < SYSDATE - 30'
  },
  {
    OS_USERNAME: 'ATCHEMI',
    DBUSERNAME: 'ATCHEMI',
    ACTION_NAME: 'CREATE',
    OBJECT_NAME: 'NEW_REPORTS',
    EVENT_TIMESTAMP: new Date('2025-01-15T15:00:00Z'),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'REPORTS',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_006',
    SQL_TEXT: 'CREATE TABLE new_reports (id NUMBER PRIMARY KEY, report_name VARCHAR2(100), created_date DATE)'
  },
  {
    OS_USERNAME: 'SYSTEM',
    DBUSERNAME: 'SYSTEM',
    ACTION_NAME: 'DROP',
    OBJECT_NAME: 'OLD_BACKUP',
    EVENT_TIMESTAMP: new Date('2025-01-15T16:00:00Z'),
    CLIENT_PROGRAM_NAME: 'sqlplus',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'BACKUP',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_007',
    SQL_TEXT: 'DROP TABLE old_backup PURGE'
  },
  {
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'SALES_DATA',
    EVENT_TIMESTAMP: new Date('2025-01-15T17:00:00Z'),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SALES',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_008',
    SQL_TEXT: 'SELECT SUM(amount) FROM sales_data WHERE sale_date >= \'2025-01-01\''
  },
  {
    OS_USERNAME: 'ATCHEMI',
    DBUSERNAME: 'ATCHEMI',
    ACTION_NAME: 'UPDATE',
    OBJECT_NAME: 'EMPLOYEE_SALARIES',
    EVENT_TIMESTAMP: new Date('2025-01-15T18:00:00Z'),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'HR',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_009',
    SQL_TEXT: 'UPDATE employee_salaries SET salary = salary * 1.05 WHERE department_id = 20'
  },
  {
    OS_USERNAME: 'SYSTEM',
    DBUSERNAME: 'SYSTEM',
    ACTION_NAME: 'INSERT',
    OBJECT_NAME: 'AUDIT_LOGS',
    EVENT_TIMESTAMP: new Date('2025-01-15T19:00:00Z'),
    CLIENT_PROGRAM_NAME: 'sqlplus',
    TERMINAL: 'unknown',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'AUDIT',
    USERHOST: '192.168.60.42',
    SESSION_ID: 'SESS_010',
    SQL_TEXT: 'INSERT INTO audit_logs (event_type, user_name, timestamp) VALUES (\'LOGIN\', \'datchemi\', SYSDATE)'
  }
];

// Insérer les données d'audit
const auditResult = db.actions_audit.insertMany(auditActions);
print(`✅ ${auditResult.insertedCount} documents insérés dans actions_audit`);

// Données d'exemple pour audit_logs
const auditLogs = [
  {
    timestamp: new Date('2025-01-15T10:00:00Z'),
    level: 'INFO',
    component: 'AUTHENTICATION',
    message: 'Utilisateur datchemi connecté avec succès',
    user_id: 'datchemi',
    session_id: 'SESS_001',
    ip_address: '192.168.60.42'
  },
  {
    timestamp: new Date('2025-01-15T11:00:00Z'),
    level: 'WARNING',
    component: 'PERMISSIONS',
    message: 'Tentative d\'accès à une table sans privilèges',
    user_id: 'ATCHEMI',
    session_id: 'SESS_002',
    ip_address: '192.168.60.42'
  },
  {
    timestamp: new Date('2025-01-15T12:00:00Z'),
    level: 'ERROR',
    component: 'DATABASE',
    message: 'Erreur de connexion à la base de données',
    user_id: 'SYSTEM',
    session_id: 'SESS_003',
    ip_address: '192.168.60.42'
  }
];

// Insérer les logs d'audit
const logsResult = db.audit_logs.insertMany(auditLogs);
print(`✅ ${logsResult.insertedCount} documents insérés dans audit_logs`);

// Données d'exemple pour user_sessions
const userSessions = [
  {
    user_id: 'datchemi',
    session_id: 'SESS_001',
    session_start: new Date('2025-01-15T10:00:00Z'),
    session_end: new Date('2025-01-15T12:00:00Z'),
    ip_address: '192.168.60.42',
    client_program: 'SQL Developer',
    actions_count: 15,
    status: 'COMPLETED'
  },
  {
    user_id: 'ATCHEMI',
    session_id: 'SESS_002',
    session_start: new Date('2025-01-15T11:00:00Z'),
    session_end: new Date('2025-01-15T13:00:00Z'),
    ip_address: '192.168.60.42',
    client_program: 'sqlplus',
    actions_count: 8,
    status: 'COMPLETED'
  },
  {
    user_id: 'SYSTEM',
    session_id: 'SESS_003',
    session_start: new Date('2025-01-15T12:00:00Z'),
    session_end: null,
    ip_address: '192.168.60.42',
    client_program: 'rwbuilder.exe',
    actions_count: 3,
    status: 'ACTIVE'
  }
];

// Insérer les sessions utilisateur
const sessionsResult = db.user_sessions.insertMany(userSessions);
print(`✅ ${sessionsResult.insertedCount} documents insérés dans user_sessions`);

// Vérifier le nombre total de documents
const auditCount = db.actions_audit.countDocuments();
const logsCount = db.audit_logs.countDocuments();
const sessionsCount = db.user_sessions.countDocuments();

print(`📊 Statistiques finales:`);
print(`   - actions_audit: ${auditCount} documents`);
print(`   - audit_logs: ${logsCount} documents`);
print(`   - user_sessions: ${sessionsCount} documents`);

print('=== Étape 2 terminée ===');
