const express = require('express');
const router = express.Router();

/**
 * Endpoint de santé pour vérifier l'état du serveur
 * Utilisé par le frontend pour détecter les problèmes de connectivité
 */
router.get('/health', async (req, res) => {
  try {
    // Vérifications de base
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'unknown',
        cache: 'unknown',
        external: 'unknown'
      }
    };

    // Vérifier la base de données SQLite si disponible
    try {
      const sqlite = require('./db/sqlite-config');
      if (sqlite && sqlite.db) {
        await sqlite.db.get('SELECT 1');
        healthCheck.services.database = 'healthy';
      }
    } catch (dbError) {
      console.warn('Database health check failed:', dbError.message);
      healthCheck.services.database = 'unhealthy';
    }

    // Vérifier le cache si disponible
    try {
      const cacheService = require('./cache_service');
      if (cacheService && cacheService.isConnected()) {
        healthCheck.services.cache = 'healthy';
      }
    } catch (cacheError) {
      console.warn('Cache health check failed:', cacheError.message);
      healthCheck.services.cache = 'unhealthy';
    }

    // Déterminer le statut global
    const allServicesHealthy = Object.values(healthCheck.services).every(
      status => status === 'healthy'
    );
    
    if (!allServicesHealthy) {
      healthCheck.status = 'degraded';
    }

    // Réponse avec le statut approprié
    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(healthCheck);

  } catch (error) {
    console.error('Health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime()
    });
  }
});

/**
 * Endpoint de santé détaillé (pour les administrateurs)
 */
router.get('/health/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      services: {}
    };

    // Vérifications détaillées des services
    try {
      const sqlite = require('./db/sqlite-config');
      if (sqlite && sqlite.db) {
        const startTime = Date.now();
        await sqlite.db.get('SELECT 1');
        const responseTime = Date.now() - startTime;
        
        detailedHealth.services.database = {
          status: 'healthy',
          responseTime: `${responseTime}ms`,
          type: 'sqlite'
        };
      }
    } catch (dbError) {
      detailedHealth.services.database = {
        status: 'unhealthy',
        error: dbError.message,
        type: 'sqlite'
      };
    }

    try {
      const cacheService = require('./cache_service');
      if (cacheService && cacheService.isConnected()) {
        detailedHealth.services.cache = {
          status: 'healthy',
          type: 'sqlite-cache'
        };
      }
    } catch (cacheError) {
      detailedHealth.services.cache = {
        status: 'unhealthy',
        error: cacheError.message,
        type: 'sqlite-cache'
      };
    }

    // Statut global
    const allServicesHealthy = Object.values(detailedHealth.services).every(
      service => service.status === 'healthy'
    );
    
    if (!allServicesHealthy) {
      detailedHealth.status = 'degraded';
    }

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(detailedHealth);

  } catch (error) {
    console.error('Detailed health check error:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      uptime: process.uptime()
    });
  }
});

module.exports = router;

