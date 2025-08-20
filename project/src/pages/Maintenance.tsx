import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Maintenance: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen theme-bg-secondary flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* En-tête avec logo et statut */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Maintenance en cours
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Nous travaillons actuellement pour améliorer votre expérience
          </p>
        </div>

        {/* Informations de statut */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Statut de connexion */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className={`w-3 h-3 rounded-full mr-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <h3 className="text-lg font-semibold text-gray-800">
                Statut de connexion
              </h3>
            </div>
            <p className="text-gray-600">
              {isOnline ? 'Connexion Internet disponible' : 'Pas de connexion Internet'}
            </p>
          </div>

          {/* Heure actuelle */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">
                Heure actuelle
              </h3>
            </div>
            <p className="text-2xl font-mono text-gray-800">{formatTime(time)}</p>
            <p className="text-sm text-gray-500">{formatDate(time)}</p>
          </div>
        </div>

        {/* Message principal */}
        <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Que se passe-t-il ?
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Notre équipe technique effectue actuellement des travaux de maintenance 
              pour améliorer les performances et la sécurité de l'application. 
              Cette interruption est temporaire et nous nous excusons pour la gêne occasionnée.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>Durée estimée :</strong> 30 minutes à 2 heures selon la complexité des travaux
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions possibles */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser la page
          </button>

          <Link 
            to="/"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l'accueil
          </Link>

          <button 
            onClick={() => window.history.back()}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Page précédente
          </button>
        </div>

        {/* Contact et informations */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Besoin d'aide ?
          </h3>
          <p className="text-gray-600 mb-4">
            Si vous avez des questions urgentes ou si la maintenance dure plus longtemps que prévu, 
            n'hésitez pas à nous contacter.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-600">support@example.com</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-gray-600">+33 1 23 45 67 89</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 Système d'Audit Oracle. Tous droits réservés.</p>
          <p className="mt-1">Page de maintenance - Version 1.0</p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;

