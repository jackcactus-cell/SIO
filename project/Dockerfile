# Stage 1: Build
FROM node:18-alpine AS builder

# Installer les dépendances système nécessaires
RUN apk add --no-cache python3 make g++ git

# Créer le répertoire de l'application
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances avec cache optimisé
RUN npm ci --prefer-offline --no-audit

# Copier le code source
COPY . .

# Construire l'application pour production
RUN npm run build

# Stage 2: Production avec Nginx optimisé
FROM nginx:alpine

# Installer des outils de sécurité et optimisation
RUN apk add --no-cache curl

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S nginx-user -G nginx-user

# Copier la configuration Nginx optimisée
COPY nginx.conf /etc/nginx/nginx.conf

# Copier les fichiers construits
COPY --from=builder /app/dist /usr/share/nginx/html

# Optimiser les permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    chown -R nginx-user:nginx-user /var/log/nginx && \
    chown -R nginx-user:nginx-user /etc/nginx/conf.d

# Créer les dossiers PID avec les bonnes permissions
RUN mkdir -p /var/run/nginx && \
    chown -R nginx-user:nginx-user /var/run/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Exposer le port 80
EXPOSE 80

# Passer à l'utilisateur non-root
USER nginx-user

# Labels pour la documentation
LABEL maintainer="SIO Audit App" \
      version="1.0.0" \
      description="Frontend React/Vite pour application d'audit Oracle"

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
