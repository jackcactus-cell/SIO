import React, { useState, useEffect } from 'react';
import { useNetworkStatus } from '../utils/useNetworkStatus';

const NetworkStatusBanner: React.FC = () => {
  const { isOnline, isReconnecting, connectionType, checkServerConnectivity } = useNetworkStatus();
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const serverOnline = await checkServerConnectivity();
      setServerStatus(serverOnline);
      
      // Afficher la bannière si pas de connexion Internet ou serveur inaccessible
      setShowBanner(!isOnline || !serverOnline);
    };

    checkStatus();

    // Vérifier périodiquement le statut du serveur
    const interval = setInterval(checkStatus, 30000); // Toutes les 30 secondes

    return () => clearInterval(interval);
  }, [isOnline, checkServerConnectivity]);

  if (!showBanner) return null;

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (!serverStatus) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Pas de connexion Internet';
    if (!serverStatus) return 'Serveur temporairement inaccessible';
    return 'Connexion rétablie';
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
        </svg>
      );
    }
    if (!serverStatus) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${getStatusColor()} text-white px-4 py-3 shadow-lg`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <span className="font-medium">{getStatusText()}</span>
          {isReconnecting && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span className="text-sm">Reconnexion...</span>
            </div>
          )}
          {connectionType && (
            <span className="text-sm opacity-75">({connectionType})</span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="text-sm underline hover:no-underline transition-all"
          >
            Actualiser
          </button>
          <button
            onClick={() => setShowBanner(false)}
            className="text-sm opacity-75 hover:opacity-100 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatusBanner;

