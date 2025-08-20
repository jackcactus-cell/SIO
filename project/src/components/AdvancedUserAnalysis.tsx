import React, { useState } from 'react';
import { User, Activity, Shield, AlertTriangle } from 'lucide-react';
import { useUserRole, UserRole } from '../utils/userRoles';

const AdvancedUserAnalysis: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const { currentRole, canViewAdvancedAnalytics } = useUserRole();

  const performAdvancedAnalysis = async (username: string) => {
    if (!canViewAdvancedAnalytics) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/users/advanced-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, analysisType: 'comprehensive' }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisData(data.data.analysis);
      }
    } catch (error) {
      console.error('Erreur analyse avancée:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!canViewAdvancedAnalytics) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Shield className="h-16 w-16 text-gray-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Accès Restreint</h3>
        <p className="text-gray-400">Analyses avancées réservées aux administrateurs</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Analyse Avancée des Actions</h2>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <span className="text-sm text-gray-400">Mode Avancé</span>
        </div>
      </div>

      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            placeholder="Nom d'utilisateur à analyser"
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
          <button
            onClick={() => performAdvancedAnalysis(selectedUser)}
            disabled={!selectedUser || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Analyse...' : 'Analyser'}
          </button>
        </div>
      </div>

      {analysisData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-3">Profil Utilisateur</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Actions totales:</span>
                <span className="text-white">{analysisData.userProfile?.totalActions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sessions:</span>
                <span className="text-white">{analysisData.userProfile?.sessionCount || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4">
            <h4 className="font-semibold text-red-300 mb-3">Évaluation des Risques</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Score:</span>
                <span className="text-red-300 font-bold">
                  {analysisData.riskAssessment?.score || 0}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Niveau:</span>
                <span className="text-red-300 font-bold">
                  {analysisData.riskAssessment?.level || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedUserAnalysis;
