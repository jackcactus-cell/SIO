import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Overview from '../pages/dashboard/Overview';
import Performance from '../pages/dashboard/Performance';
import SQLEditor from '../pages/dashboard/SQLEditor';
import SchemaExplorer from '../pages/dashboard/SchemaExplorer';
import Reports from '../pages/dashboard/Reports';
import Settings from '../pages/dashboard/Settings';
import ChatbotPage from '../pages/dashboard/ChatbotPage';
import Visualizations from '../pages/dashboard/Visualizations';
import LLMChatbotPage from '../pages/dashboard/LLMChatbotPage'; // ✅ ici

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/sql-editor" element={<SQLEditor />} />
            <Route path="/schema" element={<SchemaExplorer />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/llm-chatbot" element={<LLMChatbotPage />} /> {/* ✅ ajout ici */}
            <Route path="/visualizations" element={<Visualizations />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
