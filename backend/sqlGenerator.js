// Générateur de requêtes SQL pour le chatbot Oracle Audit

class SQLGenerator {
  constructor() {
    this.tableName = 'actions_audit';
  }

  // Générer une requête SQL basée sur la question
  generateSQL(question, filters = {}) {
    const normalizedQuestion = question.toLowerCase();
    
    // Plage horaire la plus active
    if (/plage horaire.*plus active|heure.*plus active|période.*plus active/i.test(normalizedQuestion)) {
      return `
        SELECT 
          EXTRACT(HOUR FROM EVENT_TIMESTAMP) as heure,
          COUNT(*) as connexions,
          CONCAT(EXTRACT(HOUR FROM EVENT_TIMESTAMP), ':00-', EXTRACT(HOUR FROM EVENT_TIMESTAMP), ':59') as plage_horaire
        FROM ${this.tableName}
        WHERE EVENT_TIMESTAMP IS NOT NULL
        GROUP BY EXTRACT(HOUR FROM EVENT_TIMESTAMP)
        ORDER BY connexions DESC
        LIMIT 1
      `;
    }

    // Distribution horaire des connexions
    if (/distribution horaire|connexions par heure/i.test(normalizedQuestion)) {
      return `
        SELECT 
          EXTRACT(HOUR FROM EVENT_TIMESTAMP) as heure,
          COUNT(*) as connexions,
          CONCAT(EXTRACT(HOUR FROM EVENT_TIMESTAMP), ':00-', EXTRACT(HOUR FROM EVENT_TIMESTAMP), ':59') as plage_horaire
        FROM ${this.tableName}
        WHERE EVENT_TIMESTAMP IS NOT NULL
        GROUP BY EXTRACT(HOUR FROM EVENT_TIMESTAMP)
        ORDER BY heure ASC
      `;
    }

    // Première connexion du jour
    if (/première connexion|premier accès.*aujourd'hui/i.test(normalizedQuestion)) {
      return `
        SELECT 
          EVENT_TIMESTAMP,
          DBUSERNAME,
          ACTION_NAME,
          OBJECT_NAME,
          TO_CHAR(EVENT_TIMESTAMP, 'HH24:MI:SS') as heure_connexion
        FROM ${this.tableName}
        WHERE EVENT_TIMESTAMP >= TRUNC(SYSDATE)
        ORDER BY EVENT_TIMESTAMP ASC
        LIMIT 1
      `;
    }

    // Dernière connexion du jour
    if (/dernière connexion|dernier accès.*aujourd'hui/i.test(normalizedQuestion)) {
      return `
        SELECT 
          EVENT_TIMESTAMP,
          DBUSERNAME,
          ACTION_NAME,
          OBJECT_NAME,
          TO_CHAR(EVENT_TIMESTAMP, 'HH24:MI:SS') as heure_connexion
        FROM ${this.tableName}
        WHERE EVENT_TIMESTAMP >= TRUNC(SYSDATE)
        ORDER BY EVENT_TIMESTAMP DESC
        LIMIT 1
      `;
    }

    // Nombre d'utilisateurs distincts
    if (/utilisateurs.*distinct|combien.*utilisateurs/i.test(normalizedQuestion)) {
      return `
        SELECT 
          COUNT(DISTINCT DBUSERNAME) as nombre_utilisateurs,
          COUNT(DISTINCT OS_USERNAME) as nombre_utilisateurs_systeme
        FROM ${this.tableName}
        WHERE DBUSERNAME IS NOT NULL
      `;
    }

    // Top utilisateurs les plus actifs
    if (/utilisateurs.*plus actifs|top.*utilisateurs/i.test(normalizedQuestion)) {
      return `
        SELECT 
          DBUSERNAME,
          COUNT(*) as nombre_actions
        FROM ${this.tableName}
        WHERE DBUSERNAME IS NOT NULL
        GROUP BY DBUSERNAME
        ORDER BY nombre_actions DESC
        LIMIT 5
      `;
    }

    // Actions par type
    if (/actions.*select|nombre.*select/i.test(normalizedQuestion)) {
      return `
        SELECT 
          ACTION_NAME,
          COUNT(*) as nombre_actions
        FROM ${this.tableName}
        WHERE ACTION_NAME = 'SELECT'
        GROUP BY ACTION_NAME
      `;
    }

    // Objets les plus consultés
    if (/objets.*plus consultés|top.*objets/i.test(normalizedQuestion)) {
      return `
        SELECT 
          OBJECT_NAME,
          COUNT(*) as nombre_consultations
        FROM ${this.tableName}
        WHERE OBJECT_NAME IS NOT NULL
        GROUP BY OBJECT_NAME
        ORDER BY nombre_consultations DESC
        LIMIT 5
      `;
    }

    // Programmes clients les plus utilisés
    if (/programmes.*plus utilisés|top.*programmes/i.test(normalizedQuestion)) {
      return `
        SELECT 
          CLIENT_PROGRAM_NAME,
          COUNT(*) as nombre_utilisations
        FROM ${this.tableName}
        WHERE CLIENT_PROGRAM_NAME IS NOT NULL
        GROUP BY CLIENT_PROGRAM_NAME
        ORDER BY nombre_utilisations DESC
        LIMIT 5
      `;
    }

    // Connexions par IP
    if (/adresses ip|connexions.*ip/i.test(normalizedQuestion)) {
      return `
        SELECT 
          REGEXP_SUBSTR(AUTHENTICATION_TYPE, 'HOST=([0-9.]+)', 1, 1, NULL, 1) as adresse_ip,
          COUNT(*) as nombre_connexions
        FROM ${this.tableName}
        WHERE AUTHENTICATION_TYPE LIKE '%HOST=%'
        GROUP BY REGEXP_SUBSTR(AUTHENTICATION_TYPE, 'HOST=([0-9.]+)', 1, 1, NULL, 1)
        ORDER BY nombre_connexions DESC
      `;
    }

    // Actions par utilisateur
    if (/actions.*utilisateur/i.test(normalizedQuestion)) {
      return `
        SELECT 
          DBUSERNAME,
          ACTION_NAME,
          COUNT(*) as nombre_actions
        FROM ${this.tableName}
        WHERE DBUSERNAME IS NOT NULL
        GROUP BY DBUSERNAME, ACTION_NAME
        ORDER BY DBUSERNAME, nombre_actions DESC
      `;
    }

    // Requête générique pour toute question non reconnue
    return `
      SELECT 
        COUNT(*) as total_entrees,
        COUNT(DISTINCT DBUSERNAME) as utilisateurs_distincts,
        COUNT(DISTINCT ACTION_NAME) as actions_distinctes,
        COUNT(DISTINCT OBJECT_NAME) as objets_distincts
      FROM ${this.tableName}
    `;
  }

  // Analyser les données et générer une réponse structurée
  analyzeResults(sqlResults, question) {
    const normalizedQuestion = question.toLowerCase();
    
    if (/plage horaire.*plus active|heure.*plus active/i.test(normalizedQuestion)) {
      if (sqlResults.length > 0) {
        const result = sqlResults[0];
        return {
          type: 'table',
          data: sqlResults,
          columns: ['Heure', 'Connexions', 'Plage Horaire'],
          summary: `La plage horaire la plus active est : ${result.plage_horaire} avec ${result.connexions} connexions.`,
          sql: this.generateSQL(question)
        };
      }
    }

    if (/distribution horaire/i.test(normalizedQuestion)) {
      return {
        type: 'table',
        data: sqlResults,
        columns: ['Heure', 'Connexions', 'Plage Horaire'],
        summary: `Distribution horaire des connexions (${sqlResults.length} périodes horaires).`,
        sql: this.generateSQL(question)
      };
    }

    if (/première connexion/i.test(normalizedQuestion)) {
      if (sqlResults.length > 0) {
        const result = sqlResults[0];
        return {
          type: 'text',
          data: result,
          summary: `La première connexion aujourd'hui a eu lieu à ${result.heure_connexion} par ${result.dbusername}.`,
          sql: this.generateSQL(question)
        };
      }
    }

    if (/utilisateurs.*distinct/i.test(normalizedQuestion)) {
      if (sqlResults.length > 0) {
        const result = sqlResults[0];
        return {
          type: 'text',
          data: result,
          summary: `Nombre d'utilisateurs Oracle distincts : ${result.nombre_utilisateurs}, Utilisateurs système : ${result.nombre_utilisateurs_systeme}`,
          sql: this.generateSQL(question)
        };
      }
    }

    // Réponse par défaut
    return {
      type: 'table',
      data: sqlResults,
      columns: Object.keys(sqlResults[0] || {}),
      summary: `Résultats de l'analyse pour : "${question}"`,
      sql: this.generateSQL(question)
    };
  }
}

module.exports = SQLGenerator; 