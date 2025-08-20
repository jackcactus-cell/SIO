import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Met à jour l'état pour que le prochain rendu affiche l'UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log l'erreur pour le debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Ici vous pourriez envoyer l'erreur à un service de monitoring
    // comme Sentry, LogRocket, etc.
    
    // Optionnel : envoyer l'erreur à votre backend
    this.logErrorToServer(error, errorInfo);
  }

  private logErrorToServer = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (logError) {
      console.error('Failed to log error to server:', logError);
    }
  };

  render() {
    if (this.state.hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Sinon, rediriger vers la page de maintenance
      return <Navigate to="/maintenance" replace />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

