import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }

    setLoading(true);

    // Simule l'envoi d'un email de réinitialisation
    setTimeout(() => {
      setLoading(false);
      setSuccess(`Si un compte existe pour ${email}, un lien de réinitialisation a été envoyé.`);
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
          <h2 className="text-3xl font-bold theme-text-primary mb-2">Mot de passe oublié</h2>
          <p className="theme-text-secondary">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        <div className="theme-card rounded-xl theme-shadow-primary p-8 border theme-transition">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2 mb-4" role="alert">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-2 mb-4" role="status">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-green-800 dark:text-green-200">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
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

            <button
              type="submit"
              disabled={loading}
              className="theme-button-primary w-full py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow"
              aria-busy={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : null}
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 text-sm text-blue-900 dark:text-blue-300 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </button>
              <Link to="/login" className="text-sm text-blue-900 dark:text-blue-300 hover:underline">
                Aller à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;



