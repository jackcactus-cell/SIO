import React from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center theme-bg-secondary theme-transition">
      <div className="flex flex-col items-center space-y-8 p-8 theme-card rounded-2xl theme-shadow-primary border max-w-md w-full mx-4">
        <div className="flex flex-col items-center space-y-2">
          <Database className="h-14 w-14 text-blue-700 dark:text-blue-300 transition-colors" />
          <h1 className="text-4xl font-extrabold theme-text-primary">SAO</h1>
          <p className="theme-text-secondary text-lg text-center">Votre plateforme Oracle simple et moderne</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            to="/login"
            className="theme-button-primary w-full sm:w-auto px-8 py-3 rounded-lg text-lg font-semibold text-center transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Se connecter
          </Link>
          <Link
            to="/register"
            className="theme-button-secondary w-full sm:w-auto px-8 py-3 rounded-lg text-lg font-semibold text-center transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;