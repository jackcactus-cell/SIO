const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const logFilePath = path.join(__dirname, '../../logs/app.log');

// Création de la connexion à la base SQLite avec promesses
const db = new sqlite3.Database(path.join(__dirname, '../chatbot_cache.db'));

// Active les clés étrangères et le mode WAL pour de meilleures performances
db.run('PRAGMA foreign_keys = ON');
db.run('PRAGMA journal_mode = WAL');

// Fonction pour exécuter une requête SQL avec promesse et logging
const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    logToFile('Exécution de la requête: ' + query + ' avec params: ' + JSON.stringify(params));
    db.run(query, params, function(err) {
      if (err) {
        logToFile('Erreur SQL: ' + err);
        reject(err);
      } else {
        logToFile('Requête exécutée avec succès, lastID: ' + this.lastID + ', changes: ' + this.changes);
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

// Fonction pour exécuter une requête SELECT avec promesse
const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    logToFile('Exécution du SELECT: ' + query + ' avec params: ' + JSON.stringify(params));
    db.all(query, params, (err, rows) => {
      if (err) {
        logToFile('Erreur SELECT: ' + err);
        reject(err);
      } else {
        logToFile('SELECT réussi, nombre de résultats: ' + rows?.length);
        resolve(rows);
      }
    });
  });
};

// Initialisation des tables
const initializeTables = async () => {
  try {
    logToFile('Début de l\'initialisation des tables SQLite...');

    // Table pour le cache des requêtes
    await runQuery(`
      CREATE TABLE IF NOT EXISTS query_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        normalized_query TEXT NOT NULL,
        result TEXT NOT NULL,
        execution_time_ms INTEGER,
        status TEXT,
        query_type TEXT,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        last_used DATETIME DEFAULT (datetime('now', 'localtime')),
        use_count INTEGER DEFAULT 1,
        UNIQUE(normalized_query)
      )
    `);

    // Table pour le cache des actions
    await runQuery(`
      CREATE TABLE IF NOT EXISTS action_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action_name TEXT NOT NULL,
        object_schema TEXT,
        object_name TEXT,
        os_username TEXT,
        dbusername TEXT,
        event_timestamp DATETIME,
        client_program_name TEXT,
        created_at DATETIME DEFAULT (datetime('now', 'localtime')),
        occurrence_count INTEGER DEFAULT 1,
        UNIQUE(action_name, object_schema, object_name, os_username, event_timestamp)
      )
    `);

    // Index pour améliorer les performances
    await runQuery('CREATE INDEX IF NOT EXISTS idx_normalized_query ON query_cache(normalized_query)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_action_name ON action_cache(action_name)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_event_timestamp ON action_cache(event_timestamp)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_status ON query_cache(status)');
    await runQuery('CREATE INDEX IF NOT EXISTS idx_query_type ON query_cache(query_type)');

    logToFile('Tables SQLite initialisées avec succès');
  } catch (error) {
    logToFile('Erreur lors de l\'initialisation des tables: ' + error);
    throw error;
  }
};

// Fonction pour normaliser une requête
const normalizeQuery = (query) => {
  return query.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
};

// Fonctions pour gérer le cache des requêtes
const queryCache = {
  // Rechercher dans le cache
  async get(query) {
    const normalizedQuery = normalizeQuery(query);
    logToFile('Recherche dans le cache pour: ' + normalizedQuery);

    try {
      const rows = await getQuery(
        'SELECT result, use_count FROM query_cache WHERE normalized_query = ? AND created_at > datetime("now", "-1 day")',
        [normalizedQuery]
      );

      if (rows && rows.length > 0) {
        logToFile('Cache hit pour: ' + normalizedQuery);
        // Mettre à jour le compteur et la date de dernière utilisation
        await runQuery(
          'UPDATE query_cache SET use_count = use_count + 1, last_used = datetime("now", "localtime") WHERE normalized_query = ?',
          [normalizedQuery]
        );
        return JSON.parse(rows[0].result);
      }

      logToFile('Cache miss pour: ' + normalizedQuery);
      return null;
    } catch (error) {
      logToFile('Erreur lors de la lecture du cache: ' + error);
      return null;
    }
  },

  // Ajouter au cache
  async set(query, result) {
    const normalizedQuery = normalizeQuery(query);
    logToFile('Ajout au cache de la requête: ' + normalizedQuery);

    try {
      await runQuery(
        `INSERT OR REPLACE INTO query_cache 
        (query, normalized_query, result, created_at, last_used, use_count) 
        VALUES (?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'), 
          COALESCE((SELECT use_count + 1 FROM query_cache WHERE normalized_query = ?), 1))`,
        [query, normalizedQuery, JSON.stringify(result), normalizedQuery]
      );
      logToFile('Requête mise en cache avec succès');
    } catch (error) {
      logToFile('Erreur lors de l\'écriture dans le cache: ' + error);
      throw error;
    }
  },

  // Obtenir les requêtes les plus fréquentes
  async getTopQueries(limit = 10) {
    logToFile('Récupération des top requêtes, limite: ' + limit);
    try {
      return await getQuery(
        'SELECT query, use_count, last_used FROM query_cache ORDER BY use_count DESC LIMIT ?',
        [limit]
      );
    } catch (error) {
      logToFile('Erreur lors de la récupération des top requêtes: ' + error);
      return [];
    }
  }
};

// Fonctions pour gérer le cache des actions
const actionCache = {
  // Ajouter ou mettre à jour une action
  async addAction(action) {
    logToFile('Ajout d\'une action au cache: ' + JSON.stringify(action));
    const { action_name, object_schema, object_name, os_username, dbusername, event_timestamp, client_program_name } = action;

    try {
      const result = await runQuery(
        `INSERT OR REPLACE INTO action_cache 
        (action_name, object_schema, object_name, os_username, dbusername, event_timestamp, client_program_name, occurrence_count) 
        VALUES (?, ?, ?, ?, ?, ?, ?,
          COALESCE((SELECT occurrence_count + 1 FROM action_cache 
            WHERE action_name = ? AND object_schema = ? AND object_name = ? AND os_username = ? AND event_timestamp = ?), 1))`,
        [
          action_name, object_schema, object_name, os_username, dbusername, event_timestamp, client_program_name,
          action_name, object_schema, object_name, os_username, event_timestamp
        ]
      );
      logToFile('Action mise en cache avec succès, ID: ' + result.lastID);
      return result.lastID;
    } catch (error) {
      logToFile('Erreur lors de l\'ajout de l\'action: ' + error);
      throw error;
    }
  },

  // Obtenir les statistiques des actions
  async getActionStats(timeframe = '24h') {
    logToFile('Récupération des stats des actions, timeframe: ' + timeframe);
    const timeframes = {
      '1h': "'-1 hour'",
      '24h': "'-1 day'",
      '7d': "'-7 days'",
      '30d': "'-30 days'"
    };

    try {
      return await getQuery(
        `SELECT 
          action_name,
          COUNT(*) as total_count,
          COUNT(DISTINCT os_username) as unique_users,
          COUNT(DISTINCT object_name) as unique_objects,
          MAX(event_timestamp) as last_occurrence,
          SUM(occurrence_count) as total_occurrences
        FROM action_cache 
        WHERE datetime(event_timestamp) > datetime('now', ?)
        GROUP BY action_name 
        ORDER BY total_occurrences DESC`,
        [timeframes[timeframe] || "'-1 day'"]
      );
    } catch (error) {
      logToFile('Erreur lors de la récupération des stats: ' + error);
      return [];
    }
  },

  // Obtenir les tendances des actions
  async getActionTrends(timeframe = '24h', groupBy = 'hour') {
    logToFile('Récupération des tendances, timeframe: ' + timeframe + ', groupBy: ' + groupBy);
    const groupings = {
      hour: "strftime('%H', event_timestamp)",
      day: "strftime('%Y-%m-%d', event_timestamp)",
      week: "strftime('%Y-%W', event_timestamp)",
      month: "strftime('%Y-%m', event_timestamp)"
    };

    try {
      return await getQuery(
        `SELECT 
          action_name,
          ${groupings[groupBy]} as period,
          COUNT(*) as count,
          SUM(occurrence_count) as total_occurrences
        FROM action_cache 
        WHERE datetime(event_timestamp) > datetime('now', '-' || ? || ' hours')
        GROUP BY action_name, period
        ORDER BY period DESC, total_occurrences DESC`,
        [timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720]
      );
    } catch (error) {
      logToFile('Erreur lors de la récupération des tendances: ' + error);
      return [];
    }
  },

  // Nettoyer les anciennes entrées du cache
  async cleanup(maxAge = '30d') {
    logToFile('Nettoyage du cache, maxAge: ' + maxAge);
    try {
      const result = await runQuery(
        "DELETE FROM action_cache WHERE datetime(event_timestamp) < datetime('now', ?)",
        [`'-${maxAge}'`]
      );
      logToFile(`${result.changes} entrées supprimées du cache`);
    } catch (error) {
      logToFile('Erreur lors du nettoyage du cache: ' + error);
    }
  }
};

// Initialiser les tables au démarrage
initializeTables()
  .then(() => {
    logToFile('Base SQLite initialisée avec succès');
    // Nettoyer le cache toutes les 24 heures
    setInterval(() => actionCache.cleanup(), 24 * 60 * 60 * 1000);
  })
  .catch(err => {
    logToFile('Erreur lors de l\'initialisation de la base SQLite: ' + err);
  });

function logToFile(message) {
  const timestamp = new Date().toISOString();
  // Crée le dossier logs s'il n'existe pas
  const dir = path.dirname(logFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`);
}

module.exports = {
  db,
  queryCache,
  actionCache
}; 