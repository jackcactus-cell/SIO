# Utiliser une image Python officielle optimisée
FROM python:3.11-slim

# Installer les dépendances système nécessaires avec nettoyage optimisé
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /root/.cache

# Créer un utilisateur non-root pour la sécurité
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Définir le répertoire de travail
WORKDIR /app

# Optimiser les permissions
RUN chown -R appuser:appuser /app

# Copier les fichiers de requirements en premier pour optimiser le cache Docker
COPY --chown=appuser:appuser requirements.txt .

# Installer les dépendances Python avec optimisations
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Télécharger les modèles spaCy pour le français (optionnel)
RUN python -m spacy download fr_core_news_sm || echo "SpaCy model download failed, continuing..."

# Passer à l'utilisateur non-root
USER appuser

# Copier le code de l'application
COPY --chown=appuser:appuser . .

# Créer les répertoires nécessaires avec bonnes permissions
RUN mkdir -p logs cache && \
    chmod 755 logs cache

# Variables d'environnement optimisées
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PORT=8000
ENV WORKERS=1

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Exposer le port
EXPOSE 8000

# Labels pour la documentation
LABEL maintainer="SIO Audit App" \
      version="1.0.0" \
      description="Backend Python/FastAPI pour connexion Oracle"

# Commande de démarrage optimisée pour la production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--access-log"]
