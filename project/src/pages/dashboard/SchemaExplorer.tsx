import React from 'react';
import SchemaExplorer from '../../components/SchemaExplorer';

const SchemaExplorerPage: React.FC = () => {
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Explorateur de Schéma</h1>
        <p className="text-gray-600 dark:text-gray-300">Naviguez et explorez la structure de votre base de données Oracle</p>
      </div>
      
      <SchemaExplorer />
    </div>
  );
};

export default SchemaExplorerPage;