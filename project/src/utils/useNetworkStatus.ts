import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isReconnecting: boolean;
  lastSeen: Date | null;
  connectionType: string | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isReconnecting: false,
    lastSeen: navigator.onLine ? new Date() : null,
    connectionType: null,
  });

  useEffect(() => {
    const updateNetworkStatus = (online: boolean) => {
      setNetworkStatus(prev => ({
        ...prev,
        isOnline: online,
        lastSeen: online ? new Date() : prev.lastSeen,
        isReconnecting: !online && prev.isOnline,
      }));
    };

    const handleOnline = () => updateNetworkStatus(true);
    const handleOffline = () => updateNetworkStatus(false);

    // Détecter le type de connexion si disponible
    const detectConnectionType = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkStatus(prev => ({
          ...prev,
          connectionType: connection?.effectiveType || connection?.type || null,
        }));
      }
    };

    // Surveiller les changements de connexion
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection?.addEventListener('change', detectConnectionType);
    }

    // Événements de base
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Détection initiale
    detectConnectionType();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection?.removeEventListener('change', detectConnectionType);
      }
    };
  }, []);

  // Vérifier la connectivité au serveur
  const checkServerConnectivity = async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout

      const response = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Serveur inaccessible:', error);
      return false;
    }
  };

  return {
    ...networkStatus,
    checkServerConnectivity,
  };
};

