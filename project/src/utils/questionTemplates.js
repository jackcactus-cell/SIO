// Templates de questions d'analyse pour les données d'audit Oracle
// Système d'analyse dynamique avec moteur de traitement

export const questionTemplates = {
  // Questions sur les utilisateurs (OS_USERNAME, DBUSERNAME)
  users: [
    {
      id: 1,
      category: 'Utilisateurs',
      question: "Quels sont les OS_USERNAME les plus fréquents dans les données ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const username = row.OS_USERNAME;
          counts[username] = (counts[username] || 0) + 1;
        });
        return Object.entries(counts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([username, count]) => ({ username, count }));
      },
      description: "Analyse la fréquence d'utilisation des noms d'utilisateur système"
    },
    {
      id: 2,
      category: 'Utilisateurs',
      question: "Combien d'OS_USERNAME distincts existent dans l'ensemble ?",
      analysis: (data) => {
        const uniqueUsers = new Set(data.map(row => row.OS_USERNAME));
        return {
          total: uniqueUsers.size,
          users: Array.from(uniqueUsers)
        };
      },
      description: "Compte le nombre total d'utilisateurs système uniques"
    },
    {
      id: 3,
      category: 'Utilisateurs',
      question: "Quel DBUSERNAME est le plus utilisé ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const dbUser = row.DBUSERNAME;
          counts[dbUser] = (counts[dbUser] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
        return {
          mostUsed: sorted[0],
          top10: sorted.slice(0, 10)
        };
      },
      description: "Identifie l'utilisateur de base de données le plus actif"
    },
    {
      id: 4,
      category: 'Utilisateurs',
      question: "Y a-t-il un DBUSERNAME qui correspond à plusieurs OS_USERNAME ?",
      analysis: (data) => {
        const mapping = {};
        data.forEach(row => {
          const dbUser = row.DBUSERNAME;
          const osUser = row.OS_USERNAME;
          if (!mapping[dbUser]) mapping[dbUser] = new Set();
          mapping[dbUser].add(osUser);
        });
        const multipleUsers = Object.entries(mapping)
          .filter(([, osUsers]) => osUsers.size > 1)
          .map(([dbUser, osUsers]) => ({
            dbUser,
            osUsers: Array.from(osUsers),
            count: osUsers.size
          }));
        return {
          hasMultiple: multipleUsers.length > 0,
          mappings: multipleUsers
        };
      },
      description: "Détecte les utilisateurs DB partagés entre plusieurs utilisateurs système"
    },
    {
      id: 5,
      category: 'Utilisateurs',
      question: "Quels couples OS_USERNAME–DBUSERNAME sont les plus fréquents ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const key = `${row.OS_USERNAME}->${row.DBUSERNAME}`;
          counts[key] = (counts[key] || 0) + 1;
        });
        return Object.entries(counts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([pair, count]) => {
            const [osUser, dbUser] = pair.split('->');
            return { osUser, dbUser, count };
          });
      },
      description: "Analyse les combinaisons utilisateur système/utilisateur DB les plus courantes"
    }
  ],

  // Questions sur les hôtes (USERHOST)
  hosts: [
    {
      id: 11,
      category: 'Hôtes',
      question: "Combien d'USERHOST distincts sont présents ?",
      analysis: (data) => {
        const uniqueHosts = new Set(data.map(row => row.USERHOST));
        return {
          total: uniqueHosts.size,
          hosts: Array.from(uniqueHosts)
        };
      },
      description: "Compte le nombre total d'hôtes uniques"
    },
    {
      id: 12,
      category: 'Hôtes',
      question: "Quel USERHOST a généré le plus grand nombre d'événements ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const host = row.USERHOST;
          counts[host] = (counts[host] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
        return {
          mostActive: sorted[0],
          top10: sorted.slice(0, 10)
        };
      },
      description: "Identifie l'hôte le plus actif en termes d'événements"
    },
    {
      id: 13,
      category: 'Hôtes',
      question: "Quels OS_USERNAME sont liés à un seul USERHOST ?",
      analysis: (data) => {
        const userHosts = {};
        data.forEach(row => {
          const osUser = row.OS_USERNAME;
          const host = row.USERHOST;
          if (!userHosts[osUser]) userHosts[osUser] = new Set();
          userHosts[osUser].add(host);
        });
        const singleHostUsers = Object.entries(userHosts)
          .filter(([, hosts]) => hosts.size === 1)
          .map(([osUser, hosts]) => ({
            osUser,
            host: Array.from(hosts)[0]
          }));
        return {
          count: singleHostUsers.length,
          users: singleHostUsers
        };
      },
      description: "Identifie les utilisateurs qui n'utilisent qu'un seul hôte"
    }
  ],

  // Questions sur les terminaux (TERMINAL)
  terminals: [
    {
      id: 21,
      category: 'Terminaux',
      question: "Combien de terminaux distincts sont enregistrés ?",
      analysis: (data) => {
        const uniqueTerminals = new Set(data.map(row => row.TERMINAL));
        return {
          total: uniqueTerminals.size,
          terminals: Array.from(uniqueTerminals)
        };
      },
      description: "Compte le nombre total de terminaux uniques"
    },
    {
      id: 22,
      category: 'Terminaux',
      question: "Quel terminal est le plus actif ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const terminal = row.TERMINAL;
          counts[terminal] = (counts[terminal] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
        return {
          mostActive: sorted[0],
          top10: sorted.slice(0, 10)
        };
      },
      description: "Identifie le terminal le plus utilisé"
    }
  ],

  // Questions sur l'authentification (AUTHENTICATION_TYPE)
  authentication: [
    {
      id: 31,
      category: 'Authentification',
      question: "Combien de types d'authentification différents sont utilisés ?",
      analysis: (data) => {
        const uniqueTypes = new Set(data.map(row => row.AUTHENTICATION_TYPE));
        return {
          total: uniqueTypes.size,
          types: Array.from(uniqueTypes)
        };
      },
      description: "Compte les différents types d'authentification utilisés"
    },
    {
      id: 32,
      category: 'Authentification',
      question: "Quel type d'authentification est le plus fréquent ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const authType = row.AUTHENTICATION_TYPE;
          counts[authType] = (counts[authType] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
        return {
          mostFrequent: sorted[0],
          allTypes: sorted
        };
      },
      description: "Identifie le type d'authentification le plus utilisé"
    }
  ],

  // Questions sur les programmes clients (CLIENT_PROGRAM_NAME)
  programs: [
    {
      id: 41,
      category: 'Programmes Clients',
      question: "Combien de programmes clients distincts apparaissent ?",
      analysis: (data) => {
        const uniquePrograms = new Set(data.map(row => row.CLIENT_PROGRAM_NAME));
        return {
          total: uniquePrograms.size,
          programs: Array.from(uniquePrograms)
        };
      },
      description: "Compte le nombre de programmes clients uniques"
    },
    {
      id: 42,
      category: 'Programmes Clients',
      question: "Quel programme client est le plus utilisé ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const program = row.CLIENT_PROGRAM_NAME;
          counts[program] = (counts[program] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
        return {
          mostUsed: sorted[0],
          top10: sorted.slice(0, 10)
        };
      },
      description: "Identifie le programme client le plus populaire"
    }
  ],

  // Questions sur les objets (OBJECT_SCHEMA, OBJECT_NAME)
  objects: [
    {
      id: 51,
      category: 'Objets',
      question: "Quel OBJECT_SCHEMA est le plus accédé ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const schema = row.OBJECT_SCHEMA;
          counts[schema] = (counts[schema] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
        return {
          mostAccessed: sorted[0],
          top10: sorted.slice(0, 10)
        };
      },
      description: "Identifie le schéma d'objet le plus fréquemment accédé"
    },
    {
      id: 52,
      category: 'Objets',
      question: "Combien d'OBJECT_SCHEMA différents existent ?",
      analysis: (data) => {
        const uniqueSchemas = new Set(data.map(row => row.OBJECT_SCHEMA));
        return {
          total: uniqueSchemas.size,
          schemas: Array.from(uniqueSchemas)
        };
      },
      description: "Compte le nombre total de schémas d'objets uniques"
    },
    {
      id: 53,
      category: 'Objets',
      question: "Quels OBJECT_NAME sont les plus fréquents ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const objectName = row.OBJECT_NAME;
          counts[objectName] = (counts[objectName] || 0) + 1;
        });
        return Object.entries(counts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([objectName, count]) => ({ objectName, count }));
      },
      description: "Identifie les noms d'objets les plus fréquemment accédés"
    }
  ],

  // Questions sur le SQL (SQL_TEXT, SQL_BINDS)
  sql: [
    {
      id: 61,
      category: 'SQL',
      question: "Combien de requêtes SQL_TEXT distinctes apparaissent ?",
      analysis: (data) => {
        const uniqueQueries = new Set(data.map(row => row.SQL_TEXT));
        return {
          total: uniqueQueries.size,
          queries: Array.from(uniqueQueries).slice(0, 10) // Limiter l'affichage
        };
      },
      description: "Compte le nombre de requêtes SQL uniques"
    },
    {
      id: 62,
      category: 'SQL',
      question: "Quelle est la requête SQL_TEXT la plus fréquente ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const sqlText = row.SQL_TEXT;
          counts[sqlText] = (counts[sqlText] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
        return {
          mostFrequent: sorted[0],
          top5: sorted.slice(0, 5)
        };
      },
      description: "Identifie la requête SQL la plus exécutée"
    }
  ],

  // Questions sur le temps (EVENT_TIMESTAMP)
  time: [
    {
      id: 71,
      category: 'Temps',
      question: "Quelle est la période couverte par les données ?",
      analysis: (data) => {
        const timestamps = data.map(row => new Date(row.EVENT_TIMESTAMP));
        const minDate = new Date(Math.min(...timestamps));
        const maxDate = new Date(Math.max(...timestamps));
        return {
          startDate: minDate.toISOString(),
          endDate: maxDate.toISOString(),
          duration: Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + ' jours'
        };
      },
      description: "Calcule la période totale couverte par les données d'audit"
    },
    {
      id: 72,
      category: 'Temps',
      question: "Quel est le jour avec le plus d'événements ?",
      analysis: (data) => {
        const dayCounts = {};
        data.forEach(row => {
          const date = new Date(row.EVENT_TIMESTAMP).toDateString();
          dayCounts[date] = (dayCounts[date] || 0) + 1;
        });
        const sorted = Object.entries(dayCounts).sort(([,a], [,b]) => b - a);
        return {
          busiestDay: sorted[0],
          top5: sorted.slice(0, 5)
        };
      },
      description: "Identifie le jour avec le plus d'activité"
    },
    {
      id: 73,
      category: 'Temps',
      question: "Y a-t-il un pic d'activité à une heure précise ?",
      analysis: (data) => {
        const hourCounts = {};
        data.forEach(row => {
          const hour = new Date(row.EVENT_TIMESTAMP).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const sorted = Object.entries(hourCounts).sort(([,a], [,b]) => b - a);
        return {
          peakHour: sorted[0],
          hourlyDistribution: sorted
        };
      },
      description: "Analyse la distribution horaire des événements"
    }
  ],

  // Questions sur les actions (ACTION_NAME)
  actions: [
    {
      id: 81,
      category: 'Actions',
      question: "Combien d'actions distinctes sont présentes ?",
      analysis: (data) => {
        const uniqueActions = new Set(data.map(row => row.ACTION_NAME));
        return {
          total: uniqueActions.size,
          actions: Array.from(uniqueActions)
        };
      },
      description: "Compte le nombre d'actions uniques dans les données"
    },
    {
      id: 82,
      category: 'Actions',
      question: "Quelle action est la plus fréquente ?",
      analysis: (data) => {
        const counts = {};
        data.forEach(row => {
          const action = row.ACTION_NAME;
          counts[action] = (counts[action] || 0) + 1;
        });
        const sorted = Object.entries(counts).sort(([,a], [,b]) => b - a);
        return {
          mostFrequent: sorted[0],
          top10: sorted.slice(0, 10)
        };
      },
      description: "Identifie l'action la plus fréquemment exécutée"
    }
  ],

  // Questions croisées et anomalies
  crossAnalysis: [
    {
      id: 91,
      category: 'Analyse Croisée',
      question: "Y a-t-il des OS_USERNAME qui changent souvent de USERHOST ?",
      analysis: (data) => {
        const userHosts = {};
        data.forEach(row => {
          const osUser = row.OS_USERNAME;
          const host = row.USERHOST;
          if (!userHosts[osUser]) userHosts[osUser] = new Set();
          userHosts[osUser].add(host);
        });
        const frequentChanges = Object.entries(userHosts)
          .filter(([, hosts]) => hosts.size > 2)
          .map(([osUser, hosts]) => ({
            osUser,
            hostCount: hosts.size,
            hosts: Array.from(hosts)
          }))
          .sort((a, b) => b.hostCount - a.hostCount);
        return {
          hasFrequentChanges: frequentChanges.length > 0,
          users: frequentChanges.slice(0, 10)
        };
      },
      description: "Identifie les utilisateurs qui utilisent plusieurs hôtes"
    },
    {
      id: 92,
      category: 'Analyse Croisée',
      question: "Existe-t-il des combinaisons OS_USERNAME–TERMINAL jamais vues ailleurs ?",
      analysis: (data) => {
        const combinations = {};
        data.forEach(row => {
          const key = `${row.OS_USERNAME}-${row.TERMINAL}`;
          combinations[key] = (combinations[key] || 0) + 1;
        });
        const uniqueCombinations = Object.entries(combinations)
          .filter(([, count]) => count === 1)
          .map(([combination, count]) => {
            const [osUser, terminal] = combination.split('-');
            return { osUser, terminal, count };
          });
        return {
          hasUniqueCombinations: uniqueCombinations.length > 0,
          combinations: uniqueCombinations.slice(0, 10)
        };
      },
      description: "Détecte les combinaisons utilisateur-terminal uniques"
    },
    {
      id: 93,
      category: 'Analyse Croisée',
      question: "Y a-t-il des événements avec des champs vides ou null ?",
      analysis: (data) => {
        const emptyFields = {};
        const fields = ['OS_USERNAME', 'USERHOST', 'TERMINAL', 'DBUSERNAME', 
                       'AUTHENTICATION_TYPE', 'CLIENT_PROGRAM_NAME', 'OBJECT_SCHEMA', 
                       'OBJECT_NAME', 'SQL_TEXT', 'SQL_BINDS', 'ACTION_NAME'];
        
        fields.forEach(field => {
          const emptyCount = data.filter(row => !row[field] || row[field] === '' || row[field] === null).length;
          if (emptyCount > 0) {
            emptyFields[field] = emptyCount;
          }
        });
        
        return {
          hasEmptyFields: Object.keys(emptyFields).length > 0,
          emptyFields: emptyFields,
          totalRecords: data.length
        };
      },
      description: "Détecte les champs manquants ou vides dans les données"
    }
  ]
};

// Moteur d'analyse dynamique
export class AuditAnalyzer {
  constructor(data) {
    this.data = data;
    this.cache = new Map();
  }

  // Analyse une question spécifique
  analyzeQuestion(questionId) {
    if (this.cache.has(questionId)) {
      return this.cache.get(questionId);
    }

    const question = this.findQuestion(questionId);
    if (!question) {
      throw new Error(`Question ${questionId} non trouvée`);
    }

    const result = question.analysis(this.data);
    this.cache.set(questionId, result);
    return result;
  }

  // Trouve une question par ID
  findQuestion(questionId) {
    for (const category of Object.values(questionTemplates)) {
      const question = category.find(q => q.id === questionId);
      if (question) return question;
    }
    return null;
  }

  // Analyse toutes les questions d'une catégorie
  analyzeCategory(category) {
    const questions = questionTemplates[category] || [];
    const results = {};
    
    questions.forEach(question => {
      try {
        results[question.id] = {
          question: question.question,
          result: question.analysis(this.data),
          description: question.description
        };
      } catch (error) {
        results[question.id] = {
          question: question.question,
          error: error.message,
          description: question.description
        };
      }
    });
    
    return results;
  }

  // Analyse toutes les questions
  analyzeAll() {
    const results = {};
    for (const category of Object.keys(questionTemplates)) {
      results[category] = this.analyzeCategory(category);
    }
    return results;
  }

  // Recherche de questions par mot-clé
  searchQuestions(keyword) {
    const results = [];
    for (const category of Object.values(questionTemplates)) {
      category.forEach(question => {
        if (question.question.toLowerCase().includes(keyword.toLowerCase()) ||
            question.description.toLowerCase().includes(keyword.toLowerCase())) {
          results.push(question);
        }
      });
    }
    return results;
  }

  // Génère un rapport d'analyse
  generateReport() {
    const allResults = this.analyzeAll();
    const summary = {
      totalQuestions: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      categories: Object.keys(questionTemplates),
      dataSummary: {
        totalRecords: this.data.length,
        dateRange: this.analyzeQuestion(71), // Période couverte
        uniqueUsers: this.analyzeQuestion(2), // Utilisateurs distincts
        uniqueHosts: this.analyzeQuestion(11), // Hôtes distincts
        uniqueActions: this.analyzeQuestion(81) // Actions distinctes
      }
    };

    Object.values(allResults).forEach(category => {
      Object.values(category).forEach(result => {
        summary.totalQuestions++;
        if (result.error) {
          summary.failedAnalyses++;
        } else {
          summary.successfulAnalyses++;
        }
      });
    });

    return {
      summary,
      detailedResults: allResults
    };
  }
}

// Fonctions utilitaires pour l'analyse
export const analysisUtils = {
  // Formate un nombre avec des séparateurs
  formatNumber: (num) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  },

  // Formate une date
  formatDate: (date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Calcule un pourcentage
  calculatePercentage: (value, total) => {
    return ((value / total) * 100).toFixed(2);
  },

  // Trie un objet par valeurs
  sortByValue: (obj, ascending = false) => {
    return Object.entries(obj).sort(([,a], [,b]) => 
      ascending ? a - b : b - a
    );
  },

  // Groupe les données par champ
  groupBy: (data, field) => {
    const groups = {};
    data.forEach(row => {
      const key = row[field];
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });
    return groups;
  },

  // Compte les occurrences
  countOccurrences: (data, field) => {
    const counts = {};
    data.forEach(row => {
      const value = row[field];
      counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
  }
};

export default questionTemplates;
