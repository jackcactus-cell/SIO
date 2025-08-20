import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, Filter } from 'lucide-react';
import UserActionsDetail from '../../components/UserActionsDetail';

const UserAnalysisPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (!username) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800">Erreur</h2>
            <p className="text-red-700">Nom d'utilisateur non spécifié</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retour au Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour au Dashboard
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analyse détaillée - {username}
              </h1>
              <p className="text-gray-600">
                Analyse complète des actions et comportements de l'utilisateur
              </p>
            </div>
          </div>
        </div>

        {/* User Actions Detail Component */}
        <UserActionsDetail 
          username={username} 
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default UserAnalysisPage;
