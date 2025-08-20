import React from 'react';
import SQLQueryEditor from '../../components/SQLQueryEditor';

const SQLEditor: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Éditeur SQL Oracle</h1>
        <p className="text-gray-600 dark:text-gray-300">Exécutez et analysez vos requêtes Oracle en temps réel</p>
      </div>
      
      <SQLQueryEditor />
    </div>
  );
};

export default SQLEditor;