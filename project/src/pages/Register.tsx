import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    // Enregistrer l'utilisateur dans localStorage
    setTimeout(() => {
      let users = [];
      const usersRaw = localStorage.getItem('registered_users');
      if (usersRaw) {
        users = JSON.parse(usersRaw);
      }
      // Vérifier si l'email existe déjà
      if (users.find((u: any) => u.email === email)) {
        setError('Cet email est déjà utilisé.');
        setLoading(false);
        return;
      }
      users.push({
        id: Date.now().toString(),
        email,
        name,
        password, // Pour la démo, non hashé
        role: 'user'
      });
      localStorage.setItem('registered_users', JSON.stringify(users));
      setLoading(false);
      navigate('/login');
    }, 1200);
  };

  return (
    <div className="min-h-screen theme-bg-secondary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 theme-transition">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <Database className="h-10 w-10 text-blue-900 dark:text-blue-300 transition-colors" />
            <span className="text-2xl font-bold theme-text-primary">SAO</span>
          </Link>
          <h2 className="text-3xl font-bold theme-text-primary mb-2">Créer un compte</h2>
          <p className="theme-text-secondary">Inscrivez-vous pour accéder à la plateforme</p>
        </div>
        <div className="theme-card rounded-xl theme-shadow-primary p-8 border theme-transition">
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2" role="alert">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-800 dark:text-red-200">{error}</span>
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium theme-text-secondary mb-2">
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="theme-input block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-colors"
                  placeholder="Votre nom complet"
                  autoComplete="name"
                  aria-label="Nom complet"
                />
              </div>
            </div>
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
                  placeholder="Créez un mot de passe"
                  autoComplete="new-password"
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
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium theme-text-secondary mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="theme-input block w-full pl-10 pr-10 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-colors"
                  placeholder="Confirmez le mot de passe"
                  autoComplete="new-password"
                  aria-label="Confirmer le mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  tabIndex={-1}
                  aria-label={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="theme-button-primary w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow"
              aria-busy={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
              {loading ? 'Création du compte...' : 'Créer un compte'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <span className="theme-text-secondary text-sm">Déjà inscrit ? </span>
            <Link to="/login" className="text-blue-900 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 text-sm font-medium transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 