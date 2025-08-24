# Utiliser une image Node.js LTS optimisée
FROM node:18-alpine

# Installer les dépendances système nécessaires
RUN apk add --no-cache python3 make g++ git curl dumb-init

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodeuser && \
    adduser -S nodeuser -G nodeuser -u 1001

# Créer le répertoire de l'application
WORKDIR /app

# Optimiser les permissions
RUN chown -R nodeuser:nodeuser /app

# Copier les fichiers de dépendances
COPY --chown=nodeuser:nodeuser package*.json ./

# Installer les dépendances avec optimisations
RUN npm install --only=production --prefer-offline --no-audit && \
    npm cache clean --force

# Passer à l'utilisateur non-root
USER nodeuser

# Copier le reste des fichiers de l'application
COPY --chown=nodeuser:nodeuser . .

# Créer les répertoires nécessaires avec les bonnes permissions
RUN mkdir -p /app/data /app/logs && \
    chmod 755 /app/data /app/logs

# Variables d'environnement pour la production
ENV NODE_ENV=production
ENV PORT=4000
ENV MONGODB_URI=mongodb://mongodb:27017/audit_146

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:4000/api/health || exit 1

# Exposer le port
EXPOSE 4000

# Labels pour la documentation
LABEL maintainer="SIO Audit App" \
      version="1.0.0" \
      description="Backend Node.js/Express pour application d'audit Oracle"

# Utiliser dumb-init pour une gestion correcte des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage
CMD ["node", "index.js"]
