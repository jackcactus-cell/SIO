const { MongoClient } = require('mongodb');

/**
 * Système complet de questions/réponses pour l'audit Oracle
 * Basé sur les templates de questionTemplates.js
 */
class QuestionAnswerSystem {
    constructor() {
        this.templates = this.loadTemplates();
        this.mongoClient = null;
        this.db = null;
        this.uploadedData = []; // Stockage des données uploadées
    }

    /**
     * Charge tous les templates de questions depuis questionTemplates.js
     */
    loadTemplates() {
        const { questionTemplates } = require('./questionTemplates');
        return questionTemplates || [];
    }

    /**
     * Initialise la connexion MongoDB
     */
    async connectToMongo(connectionString = 'mongodb://localhost:27017') {
        try {
            this.mongoClient = new MongoClient(connectionString);
            await this.mongoClient.connect();
            this.db = this.mongoClient.db('auditdb');
            console.log('✅ Connexion MongoDB établie');
            return true;
        } catch (error) {
            console.error('❌ Erreur de connexion MongoDB:', error.message);
            return false;
        }
    }

    /**
     * Stocke les données uploadées en mémoire
     */
    storeUploadedData(data) {
        if (Array.isArray(data)) {
            this.uploadedData = data;
            console.log(`📊 ${data.length} données uploadées stockées en mémoire`);
            return true;
        }
        return false;
    }

    /**
     * Récupère les données stockées (uploadées en priorité, puis MongoDB)
     */
    async getStoredData() {
        // Priorité aux données uploadées
        if (this.uploadedData.length > 0) {
            console.log(`📊 Utilisation de ${this.uploadedData.length} données uploadées`);
            return this.uploadedData;
        }

        // Sinon, récupérer depuis MongoDB
        if (!this.db) {
            await this.connectToMongo();
        }
        const mongoData = await this.getAuditData();
        console.log(`📊 Utilisation de ${mongoData.length} données MongoDB`);
        return mongoData;
    }

    /**
     * Ferme la connexion MongoDB
     */
    async closeMongoConnection() {
        if (this.mongoClient) {
            await this.mongoClient.close();
            console.log('🔌 Connexion MongoDB fermée');
        }
    }

    /**
     * Récupère les données d'audit depuis MongoDB
     */
    async getAuditData(collectionName = 'actions_audit', limit = 1000) {
        try {
            if (!this.db) {
                throw new Error('Base de données non connectée');
            }

            const collection = this.db.collection(collectionName);
            const data = await collection.find({}).limit(limit).toArray();
            console.log(`📊 Récupération de ${data.length} documents depuis MongoDB`);
            return data;
        } catch (error) {
            console.error('❌ Erreur lors de la récupération des données MongoDB:', error.message);
            return [];
        }
    }

    /**
     * Normalise une question pour la recherche
     */
    normalizeQuestion(question) {
        return question.toLowerCase().trim().replace(/[^\w\s]/g, '');
    }

    /**
     * Trouve un template correspondant à la question
     */
    findMatchingTemplate(question) {
        const normalizedQuestion = this.normalizeQuestion(question);
        
        // 1. Recherche exacte
        let template = this.templates.find(t => 
            this.normalizeQuestion(t.question) === normalizedQuestion
        );
        
        if (template) {
            return template;
        }

        // 2. Recherche spécifique pour les questions de comptage
        if (normalizedQuestion.includes('combien') && normalizedQuestion.includes('opérations')) {
            // Chercher des templates qui contiennent "Combien d'opérations"
            template = this.templates.find(t => 
                t.question.toLowerCase().includes('combien') && 
                t.question.toLowerCase().includes('opérations')
            );
            if (template) {
                return template;
            }
        }

        // 3. Recherche par mots-clés avec score
        const keywords = this.extractKeywords(normalizedQuestion);
        
        let bestMatch = null;
        let bestScore = 0;
        
        for (const t of this.templates) {
            const templateQuestion = this.normalizeQuestion(t.question);
            let score = 0;
            
            // Compter les mots-clés correspondants
            for (const keyword of keywords) {
                if (templateQuestion.includes(keyword)) {
                    score += 1;
                }
            }
            
            // Bonus pour les questions qui commencent par les mêmes mots
            const questionWords = normalizedQuestion.split(' ').slice(0, 3);
            const templateWords = templateQuestion.split(' ').slice(0, 3);
            const commonWords = questionWords.filter(word => templateWords.includes(word));
            score += commonWords.length * 0.5;
            
            // Bonus spécial pour les questions de comptage
            if (normalizedQuestion.includes('combien') && templateQuestion.includes('combien')) {
                score += 2;
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = t;
            }
        }
        
        if (bestMatch && bestScore >= 1) {
            return bestMatch;
        }

        // 4. Recherche par catégorie
        const categories = ['utilisateurs', 'actions', 'objets', 'sécurité', 'statistiques', 'temps', 'sessions', 'infrastructure', 'clients'];
        const matchingCategory = categories.find(cat => normalizedQuestion.includes(cat));
        
        if (matchingCategory) {
            template = this.templates.find(t => 
                t.categorie.toLowerCase().includes(matchingCategory)
            );
            if (template) {
                return template;
            }
        }

        return null;
    }

    /**
     * Extrait les mots-clés d'une question
     */
    extractKeywords(question) {
        const keywords = [
            // Utilisateurs
            'utilisateurs', 'os_username', 'db_username', 'utilisateur', 'user', 'users',
            // Actions
            'actions', 'action', 'opérations', 'opération', 'tables', 'schémas', 'schema',
            'sessions', 'connexions', 'truncate', 'select', 'update', 'insert', 'delete',
            'logon', 'set role', 'alter system', 'create', 'index', 'procédures',
            // Programmes clients
            'sql developer', 'toad', 'jdbc', 'rwbuilder', 'client', 'programme',
            // Temps et statistiques
            'heures', 'temps', 'time', 'sécurité', 'système', 'objets', 'statistiques',
            'fréquence', 'patterns', 'hôtes', 'ports', 'combien', 'nombre', 'count',
            // Questions
            'quels', 'qui', 'quand', 'où', 'comment', 'pourquoi', 'quel', 'quelle',
            // Spécifiques
            'audit', 'log', 'logs', 'événements', 'événement', 'base', 'données', 'data'
        ];

        const foundKeywords = [];
        const normalizedQuestion = question.toLowerCase();
        
        for (const keyword of keywords) {
            if (normalizedQuestion.includes(keyword.toLowerCase())) {
                foundKeywords.push(keyword);
            }
        }
        
        return foundKeywords;
    }

    /**
     * Analyse les données pour un template donné
     */
    analyzeDataForTemplate(data, template) {
        const analysis = {};

        for (const field of template.champs || []) {
            switch (field) {
                case 'OS_USERNAME':
                    analysis.os_username = this.analyzeOsUsernames(data);
                    break;
                case 'DBUSERNAME':
                    analysis.db_username = this.analyzeDbUsernames(data);
                    break;
                case 'ACTION_NAME':
                    analysis.action_name = this.analyzeActions(data);
                    break;
                case 'OBJECT_NAME':
                    analysis.object_name = this.analyzeObjects(data);
                    break;
                case 'OBJECT_SCHEMA':
                    analysis.object_schema = this.analyzeSchemas(data);
                    break;
                case 'CLIENT_PROGRAM_NAME':
                    analysis.client_program = this.analyzeClientPrograms(data);
                    break;
                case 'USERHOST':
                    analysis.userhost = this.analyzeUserhosts(data);
                    break;
                case 'SESSIONID':
                    analysis.session_id = this.analyzeSessions(data);
                    break;
                case 'EVENT_TIMESTAMP':
                    analysis.timestamp = this.analyzeTimestamps(data);
                    break;
                case 'INSTANCE':
                    analysis.instance = this.analyzeInstances(data);
                    break;
            }
        }

        return analysis;
    }

    /**
     * Analyse les noms d'utilisateurs OS
     */
    analyzeOsUsernames(data) {
        const usernames = {};
        data.forEach(item => {
            const username = item.os_username || item.OS_USERNAME || item.OSUSERNAME || item.osusername;
            if (username) {
                usernames[username] = (usernames[username] || 0) + 1;
            }
        });

        return {
            unique_count: Object.keys(usernames).length,
            most_common: Object.entries(usernames)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            all: Object.keys(usernames)
        };
    }

    /**
     * Analyse les noms d'utilisateurs DB
     */
    analyzeDbUsernames(data) {
        const usernames = {};
        data.forEach(item => {
            const username = item.dbusername || item.DBUSERNAME || item.db_username || item.DB_USERNAME || item.DbUsername;
            if (username) {
                usernames[username] = (usernames[username] || 0) + 1;
            }
        });

        return {
            unique_count: Object.keys(usernames).length,
            most_common: Object.entries(usernames)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            all: Object.keys(usernames)
        };
    }

    /**
     * Analyse les actions
     */
    analyzeActions(data) {
        const actions = {};
        
        data.forEach((item, index) => {
            // Essayer tous les formats possibles
            const action = item.action_name || item.ACTION_NAME || item.action || item.ACTION || item.ActionName || item.Action;
            if (action) {
                actions[action] = (actions[action] || 0) + 1;
            }
        });

        return {
            unique_count: Object.keys(actions).length,
            most_common: Object.entries(actions)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            all: Object.keys(actions)
        };
    }

    /**
     * Analyse les objets
     */
    analyzeObjects(data) {
        const objects = {};
        data.forEach(item => {
            const object = item.object_name || item.OBJECT_NAME || item.object || item.OBJECT || item.ObjectName || item.Object;
            if (object) {
                objects[object] = (objects[object] || 0) + 1;
            }
        });

        return {
            unique_count: Object.keys(objects).length,
            most_common: Object.entries(objects)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            all: Object.keys(objects)
        };
    }

    /**
     * Analyse les schémas
     */
    analyzeSchemas(data) {
        const schemas = {};
        data.forEach(item => {
            const schema = item.object_schema || item.OBJECT_SCHEMA || item.schema || item.SCHEMA || item.schema_name || item.SCHEMA_NAME || item.Schema;
            if (schema) {
                schemas[schema] = (schemas[schema] || 0) + 1;
            }
        });

        return {
            unique_count: Object.keys(schemas).length,
            most_common: Object.entries(schemas)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            all: Object.keys(schemas)
        };
    }

    /**
     * Analyse les programmes clients
     */
    analyzeClientPrograms(data) {
        const programs = {};
        data.forEach(item => {
            const program = item.client_program_name || item.CLIENT_PROGRAM_NAME || item.client_program || item.CLIENT_PROGRAM || item.ClientProgram;
            if (program) {
                programs[program] = (programs[program] || 0) + 1;
            }
        });

        return {
            unique_count: Object.keys(programs).length,
            most_common: Object.entries(programs)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            all: Object.keys(programs)
        };
    }

    /**
     * Analyse les hôtes utilisateurs
     */
    analyzeUserhosts(data) {
        const userhosts = {};
        data.forEach(item => {
            const userhost = item.userhost || item.USERHOST || item.UserHost || item.user_host;
            if (userhost) {
                userhosts[userhost] = (userhosts[userhost] || 0) + 1;
            }
        });

        return {
            unique_count: Object.keys(userhosts).length,
            most_common: Object.entries(userhosts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            all: Object.keys(userhosts)
        };
    }

    /**
     * Analyse les sessions
     */
    analyzeSessions(data) {
        const sessions = {};
        data.forEach(item => {
            const sessionId = item.sessionid || item.SESSIONID || item.session_id || item.SESSION_ID || item.SessionId;
            if (sessionId) {
                sessions[sessionId] = (sessions[sessionId] || 0) + 1;
            }
        });

        return {
            unique_count: Object.keys(sessions).length,
            most_common: Object.entries(sessions)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            all: Object.keys(sessions)
        };
    }

    /**
     * Analyse les timestamps
     */
    analyzeTimestamps(data) {
        if (!data || data.length === 0) {
            return { earliest: null, latest: null, duration_hours: 0 };
        }

        const timestamps = data
            .map(item => {
                const ts = item.event_timestamp || item.EVENT_TIMESTAMP || item.timestamp || item.TIMESTAMP || item.Timestamp;
                return ts ? new Date(ts) : null;
            })
            .filter(ts => ts && !isNaN(ts.getTime()));

        if (timestamps.length === 0) {
            return { earliest: null, latest: null, duration_hours: 0 };
        }

        const earliest = new Date(Math.min(...timestamps));
        const latest = new Date(Math.max(...timestamps));
        const duration = (latest - earliest) / (1000 * 60 * 60);

        return {
            earliest,
            latest,
            duration_hours: Math.round(duration * 100) / 100
        };
    }

    /**
     * Analyse les instances
     */
    analyzeInstances(data) {
        const instances = {};
        data.forEach(item => {
            const instance = item.instance || item.INSTANCE || item.Instance;
            if (instance) {
                instances[instance] = (instances[instance] || 0) + 1;
            }
        });

        return {
            unique_count: Object.keys(instances).length,
            most_common: Object.entries(instances)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            all: Object.keys(instances)
        };
    }

    /**
     * Génère une réponse dynamique basée sur l'analyse
     */
    generateDynamicResponse(template, analysis, data) {
        let response = template.reponse;

        // Remplacer les placeholders par les vraies données
        if (analysis.os_username && analysis.os_username.all.length > 0) {
            const usernames = analysis.os_username.all.slice(0, 7).join(', ');
            response = response.replace(
                /datchemi, tahose, olan, root, oracle, BACKUP, Administrateur/g,
                usernames
            );
        }

        if (analysis.db_username && analysis.db_username.most_common.length > 0) {
            const topUsers = analysis.db_username.most_common
                .slice(0, 3)
                .map(([user, count]) => `${user} (${count} actions)`)
                .join(', ');
            response = response.replace(
                /ATCHEMI \(SELECT sur SYS\), OLA \(Toad\), root \(TRUNCATE via JDBC\)/g,
                topUsers
            );
        }

        if (analysis.action_name && analysis.action_name.most_common.length > 0) {
            const totalActions = analysis.action_name.most_common.reduce((sum, [, count]) => sum + count, 0);
            const actionTypes = analysis.action_name.all.slice(0, 5).join(', ');
            
            // Pour les questions de comptage spécifiques
            if (template.question.toLowerCase().includes('combien d\'opérations')) {
                const actionType = template.question.toLowerCase().includes('select') ? 'SELECT' :
                                 template.question.toLowerCase().includes('logon') ? 'LOGON' :
                                 template.question.toLowerCase().includes('set role') ? 'SET ROLE' : null;
                
                if (actionType) {
                    const count = analysis.action_name.most_common.find(([action]) => action === actionType);
                    if (count) {
                        response = response.replace(/200\+ opérations SELECT|environ 30 connexions LOGON|50\+ opérations SET ROLE/g, 
                            `${count[1]} opérations ${actionType}`);
                    }
                }
            }
            
            response = response.replace(/200\+ opérations SELECT/g, `${totalActions} opérations`);
            response = response.replace(/SELECT, INSERT, UPDATE, DELETE/g, actionTypes);
        }

        if (analysis.object_name && analysis.object_name.most_common.length > 0) {
            const topObjects = analysis.object_name.most_common
                .slice(0, 5)
                .map(([obj]) => obj)
                .join(', ');
            response = response.replace(/SYS\.OBJ\$, SYS\.USER\$, SYS\.TAB\$, DUAL/g, topObjects);
        }

        if (analysis.client_program && analysis.client_program.most_common.length > 0) {
            const topPrograms = analysis.client_program.most_common
                .slice(0, 3)
                .map(([prog, count]) => `${prog} (${count})`)
                .join(', ');
            response = response.replace(
                /SQL Developer \(ATCHEMI\), 2\) Toad\.exe \(OLA\/AHOSE\), 3\) JDBC Thin Client \(root\)/g,
                topPrograms
            );
        }

        if (analysis.object_schema && analysis.object_schema.most_common.length > 0) {
            const topSchemas = analysis.object_schema.most_common
                .slice(0, 3)
                .map(([schema, count]) => `${schema} (${count})`)
                .join(', ');
            response = response.replace(/SYS, HR, FINANCE/g, topSchemas);
        }

        // Ajouter des statistiques réelles
        if (data && data.length > 0) {
            response += `\n\n📊 Statistiques basées sur ${data.length} événements analysés :`;
            
            if (analysis.os_username) {
                response += `\n- ${analysis.os_username.unique_count} utilisateurs OS uniques`;
            }
            
            if (analysis.db_username) {
                response += `\n- ${analysis.db_username.unique_count} utilisateurs DB uniques`;
            }
            
            if (analysis.action_name) {
                response += `\n- ${analysis.action_name.unique_count} types d'actions différents`;
            }

            if (analysis.object_name) {
                response += `\n- ${analysis.object_name.unique_count} objets différents`;
            }

            if (analysis.object_schema) {
                response += `\n- ${analysis.object_schema.unique_count} schémas utilisés`;
            }

            if (analysis.client_program) {
                response += `\n- ${analysis.client_program.unique_count} programmes clients différents`;
            }
        }

        return response;
    }

    /**
     * Répond à une question en utilisant les templates et l'analyse des données
     */
    async answerQuestion(question, data = null) {
        try {
            // Récupérer les données si non fournies
            if (!data) {
                data = await this.getStoredData();
            }

            if (!data || data.length === 0) {
                return {
                    success: false,
                    answer: "Aucune donnée d'audit disponible. Veuillez uploader un fichier de logs ou vérifier la connexion MongoDB.",
                    confidence: 0.0,
                    sources: [{ source: "none", count: 0, type: "error" }],
                    analysis_type: "error"
                };
            }

            // Trouver un template correspondant
            const template = this.findMatchingTemplate(question);
            
            if (template) {
                console.log(`🎯 Template trouvé: ${template.question}`);
                
                // Analyser les données pour ce template
                const analysis = this.analyzeDataForTemplate(data, template);
                
                // Générer une réponse dynamique
                const response = this.generateDynamicResponse(template, analysis, data);
                
                return {
                    success: true,
                    answer: response,
                    confidence: 0.9,
                    sources: [{ 
                        source: this.uploadedData.length > 0 ? "uploaded" : "mongodb", 
                        count: data.length, 
                        type: "template" 
                    }],
                    analysis_type: "template",
                    template_used: template.question
                };
            }

            // Si pas de template, utiliser l'analyse générale
            const generalAnalysis = this.analyzeGeneralData(data, question);
            
            return {
                success: true,
                answer: generalAnalysis.answer,
                confidence: 0.7,
                sources: [{ 
                    source: this.uploadedData.length > 0 ? "uploaded" : "mongodb", 
                    count: data.length, 
                    type: "analysis" 
                }],
                analysis_type: "general"
            };

        } catch (error) {
            console.error('❌ Erreur lors de l\'analyse:', error.message);
            return {
                success: false,
                answer: `Erreur lors de l'analyse: ${error.message}`,
                confidence: 0.0,
                sources: [{ source: "error", count: 0, type: "error" }],
                analysis_type: "error"
            };
        }
    }

    /**
     * Analyse générale des données pour les questions sans template
     */
    analyzeGeneralData(data, question) {
        const normalizedQuestion = this.normalizeQuestion(question);
        
        // Analyse basique
        const users = this.analyzeDbUsernames(data);
        const actions = this.analyzeActions(data);
        const objects = this.analyzeObjects(data);
        const schemas = this.analyzeSchemas(data);

        let answer = `Analyse générale basée sur ${data.length} événements d'audit :\n\n`;

        if (normalizedQuestion.includes('utilisateur') || normalizedQuestion.includes('qui')) {
            answer += `👥 Utilisateurs détectés (${users.unique_count}) : ${users.all.slice(0, 10).join(', ')}`;
        } else if (normalizedQuestion.includes('action') || normalizedQuestion.includes('opération')) {
            answer += `⚡ Types d'actions (${actions.unique_count}) : ${actions.all.slice(0, 10).join(', ')}`;
        } else if (normalizedQuestion.includes('objet') || normalizedQuestion.includes('table')) {
            answer += `📋 Objets accédés (${objects.unique_count}) : ${objects.all.slice(0, 10).join(', ')}`;
        } else if (normalizedQuestion.includes('schéma') || normalizedQuestion.includes('schema')) {
            answer += `🗂️ Schémas utilisés (${schemas.unique_count}) : ${schemas.all.slice(0, 10).join(', ')}`;
        } else if (normalizedQuestion.includes('combien') || normalizedQuestion.includes('nombre')) {
            answer += `📊 Statistiques générales :\n`;
            answer += `- ${data.length} événements total\n`;
            answer += `- ${users.unique_count} utilisateurs uniques\n`;
            answer += `- ${actions.unique_count} types d'actions\n`;
            answer += `- ${objects.unique_count} objets différents\n`;
            answer += `- ${schemas.unique_count} schémas utilisés`;
        } else {
            answer += `📈 Vue d'ensemble :\n`;
            answer += `- ${data.length} événements d'audit\n`;
            answer += `- ${users.unique_count} utilisateurs actifs\n`;
            answer += `- ${actions.unique_count} types d'actions\n`;
            answer += `- ${objects.unique_count} objets accédés`;
        }

        return { answer };
    }

    /**
     * Obtient la liste des templates disponibles
     */
    getAvailableTemplates() {
        return this.templates.map(template => ({
            question: template.question,
            categorie: template.categorie,
            champs: template.champs
        }));
    }

    /**
     * Obtient les statistiques des templates
     */
    getTemplateStats() {
        const categories = {};
        this.templates.forEach(template => {
            const cat = template.categorie;
            categories[cat] = (categories[cat] || 0) + 1;
        });

        return {
            total_templates: this.templates.length,
            categories: categories,
            categories_count: Object.keys(categories).length
        };
    }
}

module.exports = QuestionAnswerSystem;
