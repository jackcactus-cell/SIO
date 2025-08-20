import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  MessageSquare, 
  AlertTriangle, 
  ChartBar, 
  Users, 
  Clock, 
  Shield, 
  Terminal, 
  Monitor,
  Lightbulb,
  ListChecks,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { auditQuestions } from '../utils/auditQuestions';
import DynamicSuggestions from './DynamicSuggestions';

// Types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'error' | 'message' | 'suggestions' | 'statistics' | 'table' | 'behavioral' | 'frequency' | 'security' | 'text';
  data?: any;
  columns?: string[];
  summary?: string;
  explanation?: string;
  suggestions?: string[];
  keywords?: Array<{
    keyword: string;
    category: string;
    relevance: number;
  }>;
  keywordAnalysis?: {
    detected: boolean;
    totalKeywords: number;
    topKeywords: string[];
    categories: Record<string, string[]>;
    primaryCategory?: string;
    relevance: number;
  };
  interpretation?: {
    summary: string;
    insights: string[];
    recommendations: string[];
    anomalies: string[];
    trends: string[];
  };
}

interface StatisticalData {
  actionsByUser?: Array<{
    _id: string;
    actionCount: number;
    uniqueObjects: string[];
    uniquePrograms: string[];
  }>;
  hourlyActivity?: Array<{
    _id: number;
    count: number;
  }>;
  terminalUsers?: Array<{
    _id: string;
    users: string[];
    count: number;
  }>;
  clientPrograms?: Array<{
    _id: string;
    count: number;
    users: string[];
  }>;
}

// Composant pour afficher les mots-clés détectés
const KeywordDisplay: React.FC<{ keywords: Array<{keyword: string; category: string; relevance: number}>; analysis?: any }> = ({ keywords, analysis }) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      users: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      actions: 'bg-green-500/20 text-green-300 border-green-500/30',
      objects: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      security: 'bg-red-500/20 text-red-300 border-red-500/30',
      statistics: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      time: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      clients: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      infrastructure: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      sessions: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      queries: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      terminals: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      auth: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      audit: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      database: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      users: Users,
      actions: TrendingUp,
      objects: Monitor,
      security: Shield,
      statistics: ChartBar,
      time: Clock,
      clients: Terminal,
      infrastructure: Monitor,
      sessions: Clock,
      queries: ListChecks,
      terminals: Terminal,
      auth: Shield,
      audit: AlertCircle,
      database: Monitor
    };
    const IconComponent = icons[category];
    return IconComponent ? <IconComponent className="w-3 h-3 mr-1" /> : null;
  };

  if (!keywords || keywords.length === 0) return null;

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-3 mt-2 border border-gray-700/50">
      <div className="flex items-center mb-2">
        <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
        <span className="text-sm font-medium text-gray-300">Mots-clés détectés</span>
        {analysis && (
          <span className="ml-2 text-xs text-gray-400">
            ({analysis.totalKeywords} mots-clés, pertinence: {(analysis.relevance * 100).toFixed(0)}%)
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {keywords.map((kw, index) => (
          <div
            key={index}
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(kw.category)}`}
            title={`Catégorie: ${kw.category}, Pertinence: ${(kw.relevance * 100).toFixed(0)}%`}
          >
            {getCategoryIcon(kw.category)}
            {kw.keyword}
          </div>
        ))}
      </div>

      {analysis && analysis.categories && (
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="text-xs text-gray-400 mb-2">Catégories principales:</div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(analysis.categories).slice(0, 3).map(([category, keywords]) => (
              <span
                key={category}
                className={`inline-flex items-center px-2 py-1 rounded text-xs ${getCategoryColor(category)}`}
              >
                {getCategoryIcon(category)}
                {category} ({Array.isArray(keywords) ? keywords.length : 0})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher les tableaux de données
const TableDisplay: React.FC<{ data: any[]; columns: string[]; summary: string }> = ({ data, columns, summary }) => {
  const formatValue = (value: any): string => {
    if (Array.isArray(value)) return value.length.toString();
    if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
    if (typeof value === 'number') return new Intl.NumberFormat('fr-FR').format(value);
    return value?.toString() || '';
  };

    return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mt-2 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
        <ChartBar className="w-5 h-5 mr-2 text-blue-400" />
        {summary}
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700/50">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-800/30">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-700/30 transition-colors">
                {columns.map((column) => {
                  const value = formatValue(row[column.toLowerCase()]);
                  const isNumeric = !isNaN(Number(value));
                  return (
                    <td key={column} className={`px-4 py-3 text-sm ${isNumeric ? 'text-right font-mono text-blue-300' : 'text-gray-300'}`}>
                      {value}
                  </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    );
  };

// Composant pour afficher les statistiques
const StatisticsDisplay: React.FC<{ data: StatisticalData }> = ({ data }) => {
  const formatNumber = (num: number): string => new Intl.NumberFormat('fr-FR').format(num);

  return (
    <div className="space-y-6">
      {/* Statistiques utilisateurs */}
      {data.actionsByUser && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-400" />
            Statistiques par Utilisateur
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-800/30">Utilisateur</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-800/30">Actions</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-800/30">Objets uniques</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-800/30">Programmes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {data.actionsByUser.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300">{user._id}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-blue-300">{formatNumber(user.actionCount)}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-blue-300">{formatNumber(user.uniqueObjects.length)}</td>
                    <td className="px-4 py-3 text-sm text-right font-mono text-blue-300">{formatNumber(user.uniquePrograms.length)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Distribution horaire */}
      {data.hourlyActivity && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-400" />
            Distribution Horaire
          </h3>
          <div className="grid grid-cols-24 gap-1 h-40 relative">
            {data.hourlyActivity.map((hour) => {
              const maxCount = Math.max(...data.hourlyActivity!.map(h => h.count));
              const height = (hour.count / maxCount) * 100;
    return (
                <div
                  key={hour._id}
                  className="flex flex-col items-center justify-end group"
                >
                  <div className="relative w-full">
                    <div
                      className="w-full bg-blue-500/20 absolute bottom-0 transition-all duration-200 group-hover:bg-blue-400"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="absolute top-full mt-2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1">
                    {hour._id}h: {formatNumber(hour.count)}
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400">{hour._id}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistiques de sécurité */}
      {data.terminalUsers && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-white flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-400" />
            Analyse de Sécurité
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Terminal className="w-4 h-4 mr-2 text-blue-400" />
                Terminaux Partagés
              </h4>
              <ul className="space-y-2">
                {data.terminalUsers.map((terminal) => (
                  <li key={terminal._id} className="flex justify-between items-center p-2 rounded bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                    <span className="text-gray-300 text-sm">{terminal._id}</span>
                    <span className="text-xs bg-yellow-500/20 text-yellow-200 px-2 py-1 rounded-full">
                      {terminal.users.length} utilisateurs
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {data.clientPrograms && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300 flex items-center">
                  <Monitor className="w-4 h-4 mr-2 text-blue-400" />
                  Programmes Clients
                </h4>
                <ul className="space-y-2">
                  {data.clientPrograms.map((program) => (
                    <li key={program._id} className="flex justify-between items-center p-2 rounded bg-gray-700/30 hover:bg-gray-700/50 transition-colors">
                      <span className="text-gray-300 text-sm">{program._id}</span>
                      <span className="text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded-full">
                        {formatNumber(program.count)} utilisations
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    );
  };

// Composant pour afficher l'analyse
const AnalysisDisplay: React.FC<{ interpretation: Message['interpretation'] }> = ({ interpretation }) => {
  if (!interpretation) return null;

      return (
    <div className="space-y-4 mt-4">
      {/* Résumé */}
      {interpretation.summary && (
        <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-300 flex items-center mb-2">
            <ChartBar className="w-4 h-4 mr-2" />
            Résumé de l'analyse
          </h4>
          <p className="text-sm text-blue-100">{interpretation.summary}</p>
        </div>
      )}

      {/* Insights */}
      {interpretation.insights && interpretation.insights.length > 0 && (
        <div className="bg-indigo-900/20 backdrop-blur-sm border border-indigo-800/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-indigo-300 flex items-center mb-2">
            <Lightbulb className="w-4 h-4 mr-2" />
            Points clés
          </h4>
          <ul className="space-y-2">
            {interpretation.insights.map((insight, index) => (
              <li key={index} className="text-sm text-indigo-100 flex items-start">
                <span className="mr-2">•</span>
                {insight}
              </li>
            ))}
          </ul>
            </div>
          )}

      {/* Recommandations */}
      {interpretation.recommendations && interpretation.recommendations.length > 0 && (
        <div className="bg-emerald-900/20 backdrop-blur-sm border border-emerald-800/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-emerald-300 flex items-center mb-2">
            <ListChecks className="w-4 h-4 mr-2" />
            Recommandations
          </h4>
          <ul className="space-y-2">
            {interpretation.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-emerald-100 flex items-start">
                <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                {recommendation}
              </li>
            ))}
          </ul>
          </div>
      )}

      {/* Anomalies */}
      {interpretation.anomalies && interpretation.anomalies.length > 0 && (
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-red-300 flex items-center mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Points d'attention
          </h4>
          <ul className="space-y-2">
            {interpretation.anomalies.map((anomaly, index) => (
              <li key={index} className="text-sm text-red-100 flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                {anomaly}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tendances */}
      {interpretation.trends && interpretation.trends.length > 0 && (
        <div className="bg-purple-900/20 backdrop-blur-sm border border-purple-800/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-purple-300 flex items-center mb-2">
            <TrendingUp className="w-4 h-4 mr-2" />
            Tendances
          </h4>
          <ul className="space-y-2">
            {interpretation.trends.map((trend, index) => (
              <li key={index} className="text-sm text-purple-100 flex items-start">
                <ArrowUpRight className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                {trend}
              </li>
            ))}
          </ul>
        </div>
      )}
        </div>
      );
};

// Composant principal du chatbot
const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [detectedUsers, setDetectedUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Gérer le clic sur une suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsTyping(true);

    // Détecter les utilisateurs mentionnés dans la question
    const userKeywords = ['utilisateur', 'user', 'utilisateurs', 'users', 'atchemi', 'ola', 'sys', 'backup', 'batch_user'];
    const detectedUsers = userKeywords.filter(keyword => 
      inputText.toLowerCase().includes(keyword.toLowerCase())
    );
    setDetectedUsers(detectedUsers);

    try {
      const text = inputText.trim();
      const isSql = /^select\s|^with\s|^explain\s/i.test(text);

      if (isSql) {
        // Route d'exécution SQL Oracle
        const response = await fetch(((import.meta as any).env?.VITE_BACKEND_PY_URL || 'http://localhost:8000') + '/api/oracle/execute-sql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text })
        });
        const data = await response.json();
        if (!response.ok || data.status !== 'success') {
          throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: '',
          sender: 'bot',
          timestamp: new Date(),
          type: 'table',
          data: data.data,
          columns: data.columns,
          summary: `Résultats (${data.rowCount})`,
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Route LLM existante
        const response = await fetch(((import.meta as any).env?.VITE_BACKEND_LLM_URL || 'http://localhost:8001') + '/api/ask-llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text })
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let botMessage: Message;
        if (data.success === false) {
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: data.error || "Une erreur est survenue lors du traitement de votre question.",
            sender: 'bot',
            timestamp: new Date(),
            type: 'error'
          };
        } else if (data.type === 'table' || (Array.isArray(data.columns) && Array.isArray(data.data))) {
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: '',
            sender: 'bot',
            timestamp: new Date(),
            type: 'table',
            data: data.data,
            columns: data.columns,
            summary: data.summary || '',
            explanation: data.explanation,
            interpretation: data.interpretation,
            keywords: data.keywords || [],
            keywordAnalysis: data.keywordAnalysis || null
          };
          
          // Ajouter des liens vers l'analyse détaillée si des utilisateurs sont détectés
          if (detectedUsers.length > 0 && data.data && Array.isArray(data.data)) {
            const usersInData = data.data
              .filter((row: any) => row.utilisateur || row.user || row.dbusername || row.os_username)
              .map((row: any) => row.utilisateur || row.user || row.dbusername || row.os_username)
              .filter(Boolean);
            
            if (usersInData.length > 0) {
              botMessage.suggestions = usersInData.map((user: string) => 
                `Voir l'analyse détaillée de ${user}`
              );
            }
          }
        } else if (data.answer) {
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: data.answer,
            sender: 'bot',
            timestamp: new Date(),
            type: 'message',
            summary: data.answer,
            keywords: data.keywords || [],
            keywordAnalysis: data.keywordAnalysis || null,
            interpretation: {
              summary: data.answer,
              insights: [],
              recommendations: [],
              anomalies: [],
              trends: []
            }
          };
        } else {
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: data.answer || data.summary || data.message || 'Réponse reçue.',
            sender: 'bot',
            timestamp: new Date(),
            type: 'message',
            summary: data.summary || data.answer || data.message,
            keywords: data.keywords || [],
            keywordAnalysis: data.keywordAnalysis || null,
            explanation: data.explanation,
            interpretation: data.interpretation
          };
        }
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Erreur lors de la communication avec le serveur:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 4).toString(),
          text: "Une erreur est survenue lors de la communication avec le serveur.",
          sender: 'bot',
          timestamp: new Date(),
          type: 'error'
        }
      ]);
    }
    setIsTyping(false);
  };

  // Affichage d'un message du bot
  const renderBotMessage = (message: Message) => {
    // Message d'erreur
    if (message.type === 'error') {
      return (
        <div className="space-y-3">
          <div className="text-red-300 text-sm md:text-base">
            {message.text}
          </div>
          {message.keywords && Array.isArray(message.keywords) && message.keywords.length > 0 && (
            <KeywordDisplay keywords={message.keywords as Array<{keyword: string; category: string; relevance: number}>} analysis={message.keywordAnalysis} />
          )}
        </div>
      );
    }

    // Message avec tableau de données
    if (message.type === 'table' && message.data && message.columns) {
      return (
        <div className="space-y-3">
          {message.summary && (
            <div className="text-blue-100 text-sm md:text-base">
              {message.summary}
            </div>
          )}
          <TableDisplay 
            data={message.data} 
            columns={message.columns} 
            summary={message.summary || 'Données'} 
          />
          
          {/* Liens vers l'analyse détaillée des utilisateurs */}
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="bg-blue-900/20 backdrop-blur-sm rounded-lg p-3 border border-blue-800/30">
              <div className="flex items-center mb-2">
                <ExternalLink className="w-4 h-4 mr-2 text-blue-400" />
                <span className="text-sm font-medium text-blue-300">Analyses détaillées disponibles</span>
              </div>
              <div className="space-y-2">
                {message.suggestions.map((suggestion, index) => {
                  const userMatch = suggestion.match(/Voir l'analyse détaillée de (.+)/);
                  if (userMatch) {
                    const username = userMatch[1];
                    return (
                      <button
                        key={index}
                        onClick={() => window.open(`/dashboard/user-analysis/${encodeURIComponent(username)}`, '_blank')}
                        className="flex items-center w-full p-2 rounded bg-blue-800/30 hover:bg-blue-700/40 transition-colors text-left"
                      >
                        <User className="w-4 h-4 mr-2 text-blue-400" />
                        <span className="text-sm text-blue-200">{suggestion}</span>
                        <ExternalLink className="w-4 h-4 ml-auto text-blue-400" />
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
          
          {message.keywords && Array.isArray(message.keywords) && message.keywords.length > 0 && (
            <KeywordDisplay keywords={message.keywords as Array<{keyword: string; category: string; relevance: number}>} analysis={message.keywordAnalysis} />
          )}
        </div>
      );
    }

    // Message avec interprétation/analyse
    if (message.interpretation) {
      return (
        <div className="space-y-3">
          {message.text && (
            <div className="text-blue-100 text-sm md:text-base">
              {message.text}
            </div>
          )}
          <AnalysisDisplay interpretation={message.interpretation} />
          {message.keywords && Array.isArray(message.keywords) && message.keywords.length > 0 && (
            <KeywordDisplay keywords={message.keywords as Array<{keyword: string; category: string; relevance: number}>} analysis={message.keywordAnalysis} />
          )}
        </div>
      );
    }

    // Message avec données statistiques
    if (message.type === 'statistics' && message.data) {
      return (
        <div className="space-y-3">
          {message.summary && (
            <div className="text-blue-100 text-sm md:text-base">
              {message.summary}
            </div>
          )}
          <StatisticsDisplay data={message.data} />
          {message.keywords && message.keywords.length > 0 && (
            <KeywordDisplay keywords={message.keywords} analysis={message.keywordAnalysis} />
          )}
        </div>
      );
    }

    // Message texte simple
    if (message.type === 'message' || message.summary) {
      return (
        <div className="space-y-3">
          <div className="text-blue-100 text-sm md:text-base">
            {message.summary || message.text}
          </div>
          {message.keywords && Array.isArray(message.keywords) && message.keywords.length > 0 && (
            <KeywordDisplay keywords={message.keywords as Array<{keyword: string; category: string; relevance: number}>} analysis={message.keywordAnalysis} />
          )}
        </div>
      );
    }

    // Message par défaut
    return (
      <div className="space-y-3">
        <div className="text-blue-100 text-sm md:text-base">
          {message.text || message.summary || 'Réponse reçue.'}
        </div>
        {message.keywords && Array.isArray(message.keywords) && message.keywords.length > 0 && (
          <KeywordDisplay keywords={message.keywords as Array<{keyword: string; category: string; relevance: number}>} analysis={message.keywordAnalysis} />
        )}
      </div>
    );
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-900 dark:bg-blue-800 text-white p-4 rounded-full shadow-lg hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors"
        >
          <Bot className="h-6 w-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[450px] bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-50 backdrop-blur-lg font-sans">
      <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-blue-900 dark:bg-blue-800 text-white rounded-t-2xl">
        <div className="flex items-center space-x-3">
          <Bot className="h-6 w-6" />
          <span className="font-bold text-base">Assistant Oracle IA</span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowStatistics(!showStatistics)}
            className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
            title="Statistiques"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        <button
          onClick={() => setIsMinimized(true)}
          className="text-white hover:text-gray-300 transition-colors p-2 rounded-lg hover:bg-white/10"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
        </div>
      </div>

      <div className="h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          {/* Suggestions dynamiques */}
          {messages.length === 0 && (
            <DynamicSuggestions
              onSuggestionClick={handleSuggestionClick}
              showSuggestions={true}
            />
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] p-3 rounded-xl shadow-lg flex items-start space-x-3 transition-all duration-200 ${
                  message.sender === 'user'
                    ? 'bg-blue-900 dark:bg-blue-700 text-white'
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="h-5 w-5 text-blue-300" />
                ) : (
                  <Bot className="h-5 w-5 text-green-300" />
                )}
                <div className="flex-1">
                  {message.sender === 'bot' ? renderBotMessage(message) : (
                    <div className="whitespace-pre-wrap text-sm text-blue-100 font-medium">{message.text}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[90%] p-3 rounded-xl shadow-lg bg-gray-800 text-gray-100 border border-gray-700 flex items-center animate-pulse">
                <Bot className="h-5 w-5 text-green-300 mr-3" />
                <span className="text-sm text-gray-300 font-medium">L'assistant analyse votre demande...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-800 p-4 bg-gray-900 rounded-b-2xl">
          <form
            className="flex items-center gap-3"
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              className="flex-1 bg-gray-800 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 font-medium"
              placeholder="Posez votre question sur la base de données..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 transition-colors flex items-center gap-2 font-semibold text-sm shadow-lg hover:shadow-xl"
              disabled={isTyping || !inputText.trim()}
            >
              <Send className="h-4 w-4" />
              Envoyer
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;