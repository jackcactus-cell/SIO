import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-teal-800 to-green-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto">
        {/* Message principal */}
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 tracking-wider">
            Oops!
          </h1>
          
          {/* Numéro 404 avec effet de bordure */}
          <div className="inline-block bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl px-8 py-4 mb-6 shadow-2xl">
            <span className="text-7xl md:text-9xl font-black text-white tracking-wider">
              404
            </span>
          </div>
        </div>

        {/* Message explicatif */}
        <div className="mb-12">
          <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed">
            Erreur survenue lors de la récupération des données
          </p>
          <p className="text-lg text-white/70 mt-4">
            
          </p>
        </div>

        {/* Bouton d'action */}
        <div className="mb-12">
          <Link 
            to="/"
            className="inline-flex items-center px-8 py-4 bg-white/20 hover:bg-white/30 border-2 border-white/40 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl backdrop-blur-sm"
          >
            <span className="mr-3">Revenir en lieu sûr</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </Link>
        </div>

        {/* Actions supplémentaires */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Page précédente
          </button>

          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualiser
          </button>

          <Link 
            to="/maintenance"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white font-medium transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Maintenance
          </Link>
        </div>

        {/* Icône de fin */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="mt-8 text-white/50 text-sm">
          <p>Erreur 404 - Page non trouvée</p>
          <p className="mt-1">URL demandée : {window.location.pathname}</p>
        </div>
      </div>

      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Cercles décoratifs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
        
        {/* Lignes décoratives */}
        <div className="absolute top-1/3 right-10 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        <div className="absolute bottom-1/3 left-10 w-px h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
      </div>
    </div>
  );
};

export default NotFound;

