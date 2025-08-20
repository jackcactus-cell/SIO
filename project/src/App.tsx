import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import ErrorHandler from './components/ErrorHandler';
import NetworkStatusBanner from './components/NetworkStatusBanner';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Maintenance from './pages/Maintenance';
import NotFound from './pages/NotFound';
import Chatbot from './components/Chatbot';
import CacheStats from './components/CacheStats';
import LLMChatbotPage from './pages/dashboard/LLMCChatbotPage';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <ErrorHandler>
              <div className="min-h-screen theme-bg-secondary theme-transition text-[1.35rem] md:text-[1.5rem]">
                <NetworkStatusBanner />
                <Navbar />
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route 
                  path="/dashboard/*" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />

                <Route path="/cache" element={<CacheStats />} />
                
                {/* Route 404 - Doit être en dernier */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            </ErrorHandler>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;