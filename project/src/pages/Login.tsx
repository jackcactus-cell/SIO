import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Database, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Crown, User } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [remember, setRemember] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    {
      role: 'admin',
      icon: <Crown className="h-4 w-4" />,
      title: 'Administrateur',
      email: 'hisaac@smart2dservices.com',
      password: 'asymptote++',
      description: 'Accès complet à toutes les fonctionnalités'
    },
    {
      role: 'user',
      icon: <User className="h-4 w-4" />,
      title: 'Utilisateur Standard',
      email: 'user1@example.com',
      password: 'user123',
      description: 'Accès limité : Dashboard, SQL, Assistant IA, Paramètres'
    },
    {
      role: 'user',
      icon: <User className="h-4 w-4" />,
      title: 'Utilisateur Test',
      email: 'user2@example.com',
      password: 'user456',
      description: 'Accès limité : Dashboard, SQL, Assistant IA, Paramètres'
    },
    {
      role: 'user',
      icon: <User className="h-4 w-4" />,
      title: 'Analyste Données',
      email: 'analyst@example.com',
      password: 'analyst789',
      description: 'Accès limité : Dashboard, SQL, Assistant IA, Paramètres'
    }
  ];

  return (
    <div className="min-h-screen theme-bg-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 theme-transition">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <Database className="h-10 w-10 text-blue-900 dark:text-blue-300 transition-colors" />
            <span className="text-2xl font-bold theme-text-primary">SAO</span>
          </Link>
          <h2 className="text-3xl font-bold theme-text-primary mb-2">Connexion</h2>
          <p className="theme-text-secondary">Accédez à votre tableau de bord d'analyse Oracle</p>
        </div>

        <div className="theme-card rounded-xl theme-shadow-primary p-8 border theme-transition">
          {/* Demo credentials info */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowDemo((v) => !v)}
              className="text-blue-900 dark:text-blue-300 hover:underline text-sm font-medium mb-2 flex items-center gap-2 transition-colors"
            >
              {showDemo ? 'Masquer les comptes de démo' : ''}
            </button>
            {showDemo && (
              <div className="space-y-3 mt-3 animate-fade-in">
                {demoAccounts.map((account, index) => (
                  <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 dark:text-blue-400">
                        {account.icon}
                      </span>
                      <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                        {account.title}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-2">
                      {account.description}
                    </p>
                    <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <p><strong>Email:</strong> {account.email}</p>
                      <p><strong>Mot de passe:</strong> {account.password}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2" role="alert">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium theme-text-secondary mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="theme-input block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-colors"
                  placeholder="Votre adresse email"
                  autoComplete="username"
                  aria-label="Email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium theme-text-secondary mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="theme-input block w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-colors"
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                  aria-label="Mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm theme-text-secondary">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={() => setRemember((v) => !v)}
                  className="rounded border-gray-300 dark:border-gray-600 focus:ring-blue-900 bg-white dark:bg-gray-800"
                />
                <span>Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="text-blue-900 dark:text-blue-300 hover:underline text-sm font-medium transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="theme-button-primary w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow"
              aria-busy={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/" className="text-blue-900 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium transition-colors">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;