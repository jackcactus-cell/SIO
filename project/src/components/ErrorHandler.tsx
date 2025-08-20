import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ErrorHandlerProps {
  children: React.ReactNode;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Gérer les erreurs de navigation
    const handleNavigationError = (event: ErrorEvent) => {
      console.error('Erreur de navigation détectée:', event.error);
      
      // Si l'erreur est liée à une route inexistante, rediriger vers 404
      if (event.error?.message?.includes('404') || 
          event.error?.message?.includes('not found') ||
          event.error?.message?.includes('route')) {
        navigate('/404', { replace: true });
      }
    };

    // Gérer les erreurs de chargement de ressources
    const handleResourceError = (event: ErrorEvent) => {
      console.error('Erreur de ressource détectée:', event.error);
      
      // Si c'est une erreur de chargement d'image ou de script
      if (event.target && (event.target as any).tagName) {
        const target = event.target as any;
        if (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK') {
          console.warn(`Ressource non trouvée: ${target.src || target.href}`);
        }
      }
    };

    // Écouter les erreurs
    window.addEventListener('error', handleNavigationError);
    window.addEventListener('error', handleResourceError);

    // Nettoyer les listeners
    return () => {
      window.removeEventListener('error', handleNavigationError);
      window.removeEventListener('error', handleResourceError);
    };
  }, [navigate]);

  // Vérifier si la route actuelle existe
  useEffect(() => {
    const validRoutes = [
      '/',
      '/login',
      '/register',
      '/forgot-password',
      '/maintenance',
      '/dashboard',
      '/cache'
    ];

    const currentPath = location.pathname;
    const isValidRoute = validRoutes.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    );

    // Si la route n'est pas valide et qu'on n'est pas déjà sur la page 404
    if (!isValidRoute && currentPath !== '/404') {
      console.warn(`Route invalide détectée: ${currentPath}`);
      // Ne pas rediriger automatiquement, laisser React Router gérer
    }
  }, [location.pathname]);

  return <>{children}</>;
};

export default ErrorHandler;

