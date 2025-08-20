const express = require('express');
const cors = require('cors');
const QuestionAnswerSystem = require('./questionAnswerSystem');

/**
 * Serveur Express pour le système de questions/réponses
 */
class QuestionAnswerServer {
    constructor(port = 8001) {
        this.port = port;
        this.app = express();
        this.qaSystem = new QuestionAnswerSystem();
        this.setupMiddleware();
        this.setupRoutes();
    }

    /**
     * Configure les middlewares
     */
    setupMiddleware() {
        // CORS
        this.app.use(cors({
            origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
            credentials: true
        }));

        // JSON parsing
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

        // Logging middleware
        this.app.use((req, res, next) => {
            console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }

    /**
     * Configure les routes
     */
    setupRoutes() {
        // Routes de santé
        const healthRouter = require('./health');
        this.app.use('/api', healthRouter);

        // Route racine
        this.app.get('/', (req, res) => {
            res.json({
                message: 'Système de Questions/Réponses pour Audit Oracle',
                version: '1.0.0',
                endpoints: {
                    health: '/health',
                    ask: '/api/ask',
                    templates: '/api/templates',
                    stats: '/api/stats',
                    upload: '/api/upload-logs'
                }
            });
        });

        // Route pour poser une question
        this.app.post('/api/ask', async (req, res) => {
            try {
                const { question, data } = req.body;

                if (!question) {
                    return res.status(400).json({
                        success: false,
                        error: 'Question requise'
                    });
                }

                console.log(`🤔 Question reçue: ${question}`);

                // Utiliser le système de questions/réponses
                const result = await this.qaSystem.answerQuestion(question, data);

                res.json(result);

            } catch (error) {
                console.error('❌ Erreur lors du traitement de la question:', error);
                res.status(500).json({
                    success: false,
                    error: error.message,
                    answer: 'Erreur lors du traitement de la question'
                });
            }
        });

        // Route pour obtenir les templates disponibles
        this.app.get('/api/templates', (req, res) => {
            try {
                const templates = this.qaSystem.getAvailableTemplates();
                res.json({
                    success: true,
                    templates: templates,
                    count: templates.length
                });
            } catch (error) {
                console.error('❌ Erreur lors de la récupération des templates:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Route pour obtenir les statistiques des templates
        this.app.get('/api/stats', (req, res) => {
            try {
                const stats = this.qaSystem.getTemplateStats();
                res.json({
                    success: true,
                    stats: stats
                });
            } catch (error) {
                console.error('❌ Erreur lors de la récupération des statistiques:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Route pour uploader des logs
        this.app.post('/api/upload-logs', async (req, res) => {
            try {
                const { logs } = req.body;

                if (!logs || !Array.isArray(logs)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Logs requis (format array)'
                    });
                }

                console.log(`📊 Upload de ${logs.length} logs`);

                // Stocker les logs dans le système
                const stored = this.qaSystem.storeUploadedData(logs);
                
                if (!stored) {
                    return res.status(400).json({
                        success: false,
                        error: 'Erreur lors du stockage des logs'
                    });
                }

                // Analyser les logs
                const analysis = {
                    total_logs: logs.length,
                    users: this.qaSystem.analyzeDbUsernames(logs),
                    actions: this.qaSystem.analyzeActions(logs),
                    objects: this.qaSystem.analyzeObjects(logs),
                    schemas: this.qaSystem.analyzeSchemas(logs)
                };

                res.json({
                    success: true,
                    message: `${logs.length} logs uploadés et stockés avec succès`,
                    analysis: analysis,
                    data_source: "uploaded"
                });

            } catch (error) {
                console.error('❌ Erreur lors de l\'upload des logs:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Route pour obtenir les données MongoDB
        this.app.get('/api/mongo-data', async (req, res) => {
            try {
                const { limit = 1000, collection = 'actions_audit' } = req.query;
                
                await this.qaSystem.connectToMongo();
                const data = await this.qaSystem.getAuditData(collection, parseInt(limit));

                res.json({
                    success: true,
                    data: data,
                    count: data.length
                });

            } catch (error) {
                console.error('❌ Erreur lors de la récupération des données MongoDB:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Route pour obtenir les données stockées
        this.app.get('/api/stored-data', (req, res) => {
            try {
                const dataInfo = {
                    uploaded_data_count: this.qaSystem.uploadedData.length,
                    has_uploaded_data: this.qaSystem.uploadedData.length > 0,
                    data_source: this.qaSystem.uploadedData.length > 0 ? "uploaded" : "mongodb"
                };

                res.json({
                    success: true,
                    data_info: dataInfo
                });

            } catch (error) {
                console.error('❌ Erreur lors de la récupération des informations sur les données:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Route pour effacer les données uploadées
        this.app.delete('/api/clear-uploaded-data', (req, res) => {
            try {
                const previousCount = this.qaSystem.uploadedData.length;
                this.qaSystem.uploadedData = [];
                
                res.json({
                    success: true,
                    message: `${previousCount} données uploadées effacées`,
                    data_source: "mongodb"
                });

            } catch (error) {
                console.error('❌ Erreur lors de l\'effacement des données uploadées:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Route pour tester la connexion MongoDB
        this.app.get('/api/mongo-status', async (req, res) => {
            try {
                const isConnected = await this.qaSystem.connectToMongo();
                
                res.json({
                    success: true,
                    connected: isConnected,
                    message: isConnected ? 'Connexion MongoDB établie' : 'Connexion MongoDB échouée'
                });

            } catch (error) {
                console.error('❌ Erreur lors du test de connexion MongoDB:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Route pour analyser des données spécifiques
        this.app.post('/api/analyze', async (req, res) => {
            try {
                const { data, analysis_type } = req.body;

                if (!data || !Array.isArray(data)) {
                    return res.status(400).json({
                        success: false,
                        error: 'Données requises (format array)'
                    });
                }

                let analysis = {};

                switch (analysis_type) {
                    case 'users':
                        analysis = this.qaSystem.analyzeDbUsernames(data);
                        break;
                    case 'actions':
                        analysis = this.qaSystem.analyzeActions(data);
                        break;
                    case 'objects':
                        analysis = this.qaSystem.analyzeObjects(data);
                        break;
                    case 'schemas':
                        analysis = this.qaSystem.analyzeSchemas(data);
                        break;
                    case 'sessions':
                        analysis = this.qaSystem.analyzeSessions(data);
                        break;
                    case 'timestamps':
                        analysis = this.qaSystem.analyzeTimestamps(data);
                        break;
                    default:
                        analysis = {
                            users: this.qaSystem.analyzeDbUsernames(data),
                            actions: this.qaSystem.analyzeActions(data),
                            objects: this.qaSystem.analyzeObjects(data),
                            schemas: this.qaSystem.analyzeSchemas(data)
                        };
                }

                res.json({
                    success: true,
                    analysis: analysis,
                    data_count: data.length
                });

            } catch (error) {
                console.error('❌ Erreur lors de l\'analyse:', error);
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });

        // Gestion des erreurs 404
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: 'Route non trouvée',
                available_routes: [
                    'GET /health',
                    'GET /',
                    'POST /api/ask',
                    'GET /api/templates',
                    'GET /api/stats',
                    'POST /api/upload-logs',
                    'GET /api/mongo-data',
                    'GET /api/mongo-status',
                    'GET /api/stored-data',
                    'DELETE /api/clear-uploaded-data',
                    'POST /api/analyze'
                ]
            });
        });

        // Gestion des erreurs globales
        this.app.use((error, req, res, next) => {
            console.error('❌ Erreur globale:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: error.message
            });
        });
    }

    /**
     * Démarre le serveur
     */
    async start() {
        try {
            // Tester la connexion MongoDB
            console.log('🔌 Test de connexion MongoDB...');
            await this.qaSystem.connectToMongo();

            // Démarrer le serveur
            this.app.listen(this.port, () => {
                console.log(`🚀 Serveur Question/Answer démarré sur le port ${this.port}`);
                console.log(`📊 Templates chargés: ${this.qaSystem.templates.length}`);
                console.log(`🔗 URL: http://localhost:${this.port}`);
                console.log(`🏥 Health check: http://localhost:${this.port}/health`);
            });

        } catch (error) {
            console.error('❌ Erreur lors du démarrage du serveur:', error);
            process.exit(1);
        }
    }

    /**
     * Arrête le serveur
     */
    async stop() {
        try {
            await this.qaSystem.closeMongoConnection();
            console.log('🛑 Serveur arrêté');
        } catch (error) {
            console.error('❌ Erreur lors de l\'arrêt du serveur:', error);
        }
    }
}

// Export de la classe
module.exports = QuestionAnswerServer;

// Démarrage automatique si le fichier est exécuté directement
if (require.main === module) {
    const server = new QuestionAnswerServer();
    server.start();

    // Gestion de l'arrêt propre
    process.on('SIGINT', async () => {
        console.log('\n🛑 Arrêt du serveur...');
        await server.stop();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        console.log('\n🛑 Arrêt du serveur...');
        await server.stop();
        process.exit(0);
    });
}
