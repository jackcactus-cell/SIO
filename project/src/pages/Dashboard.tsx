import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Overview from './dashboard/Overview';
import Performance from './dashboard/Performance';
import SQLEditor from './dashboard/SQLEditor';
import SchemaExplorer from './dashboard/SchemaExplorer';
import Reports from './dashboard/Reports';
import Settings from './dashboard/Settings';
import ChatbotPage from './dashboard/ChatbotPage';
import OracleAuditPage from './dashboard/OracleAuditPage';
import Visualizations from './dashboard/Visualizations';
import OracleLogin from './OracleLogin';
import UserAnalysisPage from './dashboard/UserAnalysisPage';

const Dashboard: React.FC = () => {
  return (
    <div className="flex h-screen theme-bg-primary font-sans theme-transition">
      <Sidebar />
      <div className="flex-1 overflow-auto scrollbar-hide bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 theme-transition">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/oracle-login" element={<OracleLogin />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/sql-editor" element={<SQLEditor />} />
          <Route path="/schema" element={<SchemaExplorer />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/oracle-audit" element={<OracleAuditPage />} />
          <Route path="/visualizations" element={<Visualizations />} />
          <Route path="/user-analysis/:username" element={<UserAnalysisPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;