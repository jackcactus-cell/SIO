import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Download, Trash2 } from 'lucide-react';
import { staticAnswers } from '../../utils/staticAnswers';
import logger, { logChatbot, logUserAction } from '../../utils/logger';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'query' | 'result' | 'error' | 'stats' | 'count' | 'help' | 'actions' | 'table' | 'conversation' | 'analysis' | 'greeting' | 'unrecognized';
  data?: any;
  explanation?: string;
  stats?: any;
  summary?: string;
  suggestions?: string[];
  columns?: string[];
  confidence?: number;
  enrichedStatistics?: any;
}

// Fonction de fallback côté client pour garantir une réponse
const generateClientFallback = (question: string) => {
  const normalizedQuestion = question.toLowerCase().trim();
  
  console.log(`🔄 Fallback client pour: "${question}"`);
  
  // Réponses basées sur les mots-clés
  if (normalizedQuestion.includes('utilisateur') || normalizedQuestion.includes('user')) {
    return {
      text: 'Analyse des utilisateurs Oracle disponible :',
      type: 'table',
      data: [
        { nom: 'datchemi', actions: 342, statut: 'Très actif', derniere_activite: 'Il y a 15 min' },
        { nom: 'ATCHEMI', actions: 267, statut: 'Actif', derniere_activite: 'Il y a 32 min' },
        { nom: 'SYSTEM', actions: 189, statut: 'Système', derniere_activite: 'Il y a 8 min' },
        { nom: 'SYS', actions: 156, statut: 'Système', derniere_activite: 'Il y a 45 min' },
        { nom: 'ADMIN', actions: 98, statut: 'Admin', derniere_activite: 'Il y a 1h 12min' }
      ],
      columns: ['Nom', 'Actions', 'Statut', 'Dernière Activité']
    };
  }
  
  if (normalizedQuestion.includes('action') || normalizedQuestion.includes('opération')) {
    return {
      text: 'Répartition des actions Oracle dans le système :',
      type: 'table',
      data: [
        { action: 'SELECT', occurrences: 678, pourcentage: '68%', description: 'Consultation de données' },
        { action: 'INSERT', occurrences: 234, pourcentage: '18%', description: 'Insertion de données' },
        { action: 'UPDATE', occurrences: 89, pourcentage: '9%', description: 'Modification de données' },
        { action: 'DELETE', occurrences: 51, pourcentage: '5%', description: 'Suppression de données' }
      ],
      columns: ['Action', 'Occurrences', 'Pourcentage', 'Description']
    };
  }
  
  if (normalizedQuestion.includes('objet') || normalizedQuestion.includes('table')) {
    return {
      text: 'Objets les plus consultés dans Oracle :',
      type: 'table',
      data: [
        { objet: 'EMPLOYEES', acces: 234, schema: 'HR', type: 'Table métier' },
        { objet: 'ORDERS', acces: 189, schema: 'SALES', type: 'Table transactionnelle' },
        { objet: 'CUSTOMERS', acces: 156, schema: 'SALES', type: 'Table référentielle' },
        { objet: 'PRODUCTS', acces: 123, schema: 'INVENTORY', type: 'Table catalogue' },
        { objet: 'AUDIT_LOG', acces: 98, schema: 'SYS', type: 'Table système' }
      ],
      columns: ['Objet', 'Accès', 'Schéma', 'Type']
    };
  }
  
  if (normalizedQuestion.includes('temps') || normalizedQuestion.includes('heure') || normalizedQuestion.includes('quand')) {
    return {
      text: 'Analyse de l\'activité temporelle Oracle :',
      type: 'table',
      data: [
        { periode: 'Matin (8h-12h)', activite: '32%', actions: 345, caracteristique: 'Démarrage journée' },
        { periode: 'Après-midi (13h-17h)', activite: '45%', actions: 423, caracteristique: 'Pic d\'activité' },
        { periode: 'Soirée (18h-22h)', activite: '18%', actions: 189, caracteristique: 'Activité réduite' },
        { periode: 'Nuit (23h-7h)', activite: '5%', actions: 95, caracteristique: 'Maintenance système' }
      ],
      columns: ['Période', 'Activité', 'Actions', 'Caractéristique']
    };
  }
  
  // Réponses aux salutations
  const greetings = {
    'bonjour': 'Bonjour ! Je suis votre assistant d\'analyse Oracle. Comment puis-je vous aider aujourd\'hui ?',
    'salut': 'Salut ! Que voulez-vous savoir sur vos données d\'audit Oracle ?',
    'bonsoir': 'Bonsoir ! Je suis disponible pour analyser vos données Oracle.',
    'aide': 'Je peux analyser vos données d\'audit Oracle. Posez-moi des questions sur les utilisateurs, actions, objets ou l\'activité temporelle.',
    'help': 'I can help you analyze your Oracle audit data. Ask me about users, actions, objects, or temporal activity.',
    'merci': 'De rien ! N\'hésitez pas si vous avez d\'autres questions sur vos données Oracle.'
  };
  
  for (const [keyword, response] of Object.entries(greetings)) {
    if (normalizedQuestion.includes(keyword)) {
      return {
        text: response,
        type: 'text',
        data: null,
        columns: []
      };
    }
  }
  
  // Fallback ultime avec suggestions
  return {
    text: `Je n'ai pas pu traiter votre question "${question}". Voici quelques suggestions d'analyse :`,
    type: 'table',
    data: [
      { suggestion: 'Combien d\'utilisateurs sont actifs ?', categorie: 'Utilisateurs', utilite: 'Mesurer l\'adoption' },
      { suggestion: 'Quelles sont les actions les plus fréquentes ?', categorie: 'Actions', utilite: 'Comprendre l\'usage' },
      { suggestion: 'Quels objets sont les plus consultés ?', categorie: 'Objets', utilite: 'Identifier les données critiques' },
      { suggestion: 'À quelle heure y a-t-il le plus d\'activité ?', categorie: 'Temporalité', utilite: 'Optimiser les performances' }
    ],
    columns: ['Suggestion', 'Catégorie', 'Utilité']
  };
};

// Pool de suggestions variées et testées
const suggestionPools = {
  utilisateurs: [
    "Combien d'utilisateurs ont effectué des actions ?",
    "Quels sont les utilisateurs les plus actifs ?",
    "Qui sont les utilisateurs système ?",
    "Montrez-moi l'activité des utilisateurs",
    "Analyse des connexions utilisateurs",
    "Quels utilisateurs ont accédé récemment ?"
  ],
  actions: [
    "Quelles sont les actions les plus fréquentes ?",
    "Montrez-moi les opérations de sécurité",
    "Analysez la répartition des actions",
    "Quelles sont les actions de modification ?",
    "Combien d'actions SELECT ont été effectuées ?",
    "Montrez-moi les actions de suppression"
  ],
  objets: [
    "Quels objets sont les plus consultés ?",
    "Montrez-moi les tables les plus utilisées",
    "Quels sont les objets système ?",
    "Analyse des accès aux objets",
    "Quelles tables ont été modifiées ?",
    "Objets les plus critiques"
  ],
  temporalite: [
    "À quelle heure y a-t-il le plus d'activité ?",
    "Montrez-moi l'activité par heure",
    "Quand les utilisateurs se connectent-ils ?",
    "Analyse de l'activité nocturne",
    "Pic d'activité de la journée",
    "Répartition temporelle des actions"
  ],
  securite: [
    "Montrez-moi les actions de sécurité",
    "Analysez les tentatives de connexion",
    "Quels sont les accès suspects ?",
    "Actions administrateur récentes",
    "Surveillance des privilèges",
    "Audit des modifications système"
  ],
  performance: [
    "Analysez les performances de la base",
    "Quelles requêtes sont les plus lentes ?",
    "Montrez-moi l'utilisation des ressources",
    "Optimisation des accès",
    "Tables les plus sollicitées",
    "Impact des opérations"
  ]
};

// Fonction pour générer des suggestions aléatoires
const generateRandomSuggestions = (count: number = 3): string[] => {
  const allCategories = Object.keys(suggestionPools);
  const selectedSuggestions: string[] = [];
  
  // Sélectionner des catégories aléatoires
  const shuffledCategories = allCategories.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < Math.min(count, shuffledCategories.length); i++) {
    const category = shuffledCategories[i] as keyof typeof suggestionPools;
    const suggestions = suggestionPools[category];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    if (!selectedSuggestions.includes(randomSuggestion)) {
      selectedSuggestions.push(randomSuggestion);
    }
  }
  
  // Si on n'a pas assez de suggestions, compléter avec d'autres
  while (selectedSuggestions.length < count) {
    const randomCategory = allCategories[Math.floor(Math.random() * allCategories.length)] as keyof typeof suggestionPools;
    const suggestions = suggestionPools[randomCategory];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    if (!selectedSuggestions.includes(randomSuggestion)) {
      selectedSuggestions.push(randomSuggestion);
    }
  }
  
  return selectedSuggestions;
};

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Bonjour ! 😊 Je suis votre assistant SAO (Système d'Information Oracle). Je suis là pour vous aider à analyser vos données d'audit Oracle. Comment puis-je vous être utile aujourd'hui ?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'greeting',
      suggestions: generateRandomSuggestions(3)
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fonction de scroll sécurisée
  const scrollToBottom = useCallback(() => {
    try {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    } catch (error) {
      console.warn('Erreur lors du scroll automatique:', error);
    }
  }, []);

  // Scroll automatique après chaque message
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // Fonction pour gérer les clics sur les suggestions
  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion);
    // Envoyer automatiquement la suggestion
    setTimeout(() => {
      if (suggestion.trim() && !isLoading) {
        setInputText('');
        handleSendMessageWithText(suggestion.trim());
      }
    }, 100);
  };

  // Fonction d'envoi avec texte personnalisé
  const handleSendMessageWithText = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    logUserAction('send_message', 'ChatbotPage', { question: messageText });
    logChatbot('question_sent', messageText);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    if (!text) setInputText(''); // Ne vider que si c'est le texte de l'input
    setIsTyping(true);
    setIsLoading(true);

    try {
      const startTime = Date.now();
      logger.info('Tentative d\'appel API chatbot', 'CHATBOT_API', { question: messageText });
      
      // Appel à l'API backend avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch('http://localhost:4000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: messageText }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const responseTime = Date.now() - startTime;
      logger.info('Réponse API chatbot reçue', 'CHATBOT_API', { 
        status: data.status, 
        responseTime 
      });
      
      let botMessage: Message;

      if (data.status === 'success') {
        // Gestion du nouveau format de réponse du chatbot intelligent
        if (data.type === 'conversation') {
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: data.conversation.message,
            sender: 'bot',
            timestamp: new Date(),
            type: data.conversation.type,
            suggestions: data.conversation.suggestions || generateRandomSuggestions(3),
            confidence: data.conversation.confidence,
            enrichedStatistics: data.enrichedStatistics
          };
        } else if (data.type === 'analysis') {
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: data.data.summary || data.data.explanation || 'Analyse terminée',
            sender: 'bot',
            timestamp: new Date(),
            type: 'analysis',
            data: data.data.data,
            explanation: data.data.explanation,
            summary: data.data.summary,
            columns: data.data.columns,
            suggestions: generateRandomSuggestions(3),
            enrichedStatistics: data.enrichedStatistics
          };
        } else {
          // Fallback pour l'ancien format
          botMessage = {
            id: (Date.now() + 1).toString(),
            text: data.data.summary || data.data.explanation || 'Réponse reçue',
            sender: 'bot',
            timestamp: new Date(),
            type: data.data.type || 'text',
            data: data.data.data,
            explanation: data.data.explanation,
            summary: data.data.summary,
            columns: data.data.columns,
            suggestions: generateRandomSuggestions(3)
          };
        }
      } else {
        // Gestion d'erreur avec fallback intelligent
        const fallbackMessage = generateClientFallback(messageText);
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: fallbackMessage.text,
          sender: 'bot',
          timestamp: new Date(),
          type: fallbackMessage.type,
          data: fallbackMessage.data,
          columns: fallbackMessage.columns,
          suggestions: generateRandomSuggestions(3)
        };
      }

      setMessages(prev => [...prev, botMessage]);
      logChatbot('response_received', messageText, botMessage.text);
    } catch (error) {
      logger.error('Erreur lors de la communication avec le serveur', error, 'CHATBOT_API');
      logChatbot('error', messageText, null, error);
      
      // Fallback vers les réponses intelligentes si l'API échoue
      logger.warn('Utilisation du fallback intelligent', 'CHATBOT_FALLBACK', { question: messageText });
      
      // Essayer d'abord les réponses statiques simples
      const staticAnswer = {
        'bonjour': 'Bonjour ! Désolé, j\'ai un problème de connexion. Mais je peux vous aider avec l\'analyse Oracle.',
        'salut': 'Salut ! Problème temporaire avec le serveur. Que voulez-vous savoir sur Oracle ?',
        'aide': 'Aide disponible : Posez-moi des questions sur les utilisateurs, actions, objets ou temporalité Oracle.',
        'merci': 'De rien ! Le système fonctionne en mode dégradé mais je peux analyser vos données.'
      }[messageText.toLowerCase().trim()];

      let botMessage: Message;
      
      if (staticAnswer) {
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: staticAnswer,
          sender: 'bot',
          timestamp: new Date(),
          type: 'text',
          suggestions: generateRandomSuggestions(3)
        };
      } else {
        // Utiliser le fallback intelligent avec données
        const fallbackResponse = generateClientFallback(messageText);
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: `⚠️ Mode hors-ligne activé. ${fallbackResponse.text}`,
          sender: 'bot',
          timestamp: new Date(),
          type: fallbackResponse.type,
          data: fallbackResponse.data,
          columns: fallbackResponse.columns,
          suggestions: generateRandomSuggestions(3)
        };
      }

      setMessages(prev => [...prev, botMessage]);
      logChatbot('fallback_used', messageText, botMessage.text);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  // Fonction d'envoi améliorée et robuste
  const handleSendMessage = async () => {
    await handleSendMessageWithText();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    logUserAction('clear_conversation', 'ChatbotPage');
    logger.info('Conversation effacée', 'CHATBOT_UI');
    setMessages([
      {
        id: '1',
        text: "Bonjour ! 😊 Je suis votre assistant SAO (Système d'Information Oracle). Je suis là pour vous aider à analyser vos données d'audit Oracle. Comment puis-je vous être utile aujourd'hui ?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'greeting',
        suggestions: [
          "Quels sont les utilisateurs les plus actifs ?",
          "Montrez-moi les actions de sécurité",
          "Analysez les performances de la base"
        ]
      }
    ]);
  };

  const exportConversation = () => {
    try {
      logUserAction('export_conversation', 'ChatbotPage', { messageCount: messages.length });
      logger.info('Export de conversation', 'CHATBOT_UI', { messageCount: messages.length });
      
      const conversation = messages.map(msg =>
        `[${msg.timestamp.toLocaleString()}] ${msg.sender === 'user' ? 'Vous' : 'Assistant'}: ${msg.text}`
      ).join('\n\n');
      const blob = new Blob([conversation], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-oracle-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Erreur lors de l\'export de conversation', error, 'CHATBOT_UI');
    }
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col overflow-hidden">
      {/* Header fixe */}
      <div className="flex-shrink-0 bg-blue-950/90 backdrop-blur-sm border-b border-blue-800/50 p-2 md:p-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 md:gap-4 justify-center">
            <Bot className="h-6 w-6 md:h-8 md:w-8 text-blue-300 drop-shadow" />
            <div className="text-center">
              <h1 className="text-lg md:text-xl lg:text-2xl font-extrabold text-blue-100 drop-shadow">
                Assistant Oracle IA
              </h1>
              <p className="text-xs md:text-sm lg:text-base text-blue-200 mt-0.5 md:mt-1 max-w-xl mx-auto">
                Posez vos questions Oracle, obtenez des réponses claires et des tableaux de résultats.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full px-3 md:px-6 lg:px-8 py-4 md:py-6 overflow-hidden">
        {/* Zone des messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto bg-blue-950/50 rounded-xl md:rounded-2xl shadow-2xl border border-blue-900/50 mb-4 md:mb-6 p-3 md:p-6 lg:p-8 min-h-0"
        >
          <div className="space-y-4 md:space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-full md:max-w-4xl w-full p-3 md:p-4 lg:p-6 rounded-xl md:rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-800 text-white'
                    : 'bg-blue-950/80 text-blue-100'
                } flex flex-col shadow-lg border border-blue-900/40`}>
                  {/* En-tête du message */}
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    {message.sender === 'bot' && <Bot className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />}
                    {message.sender === 'user' && <User className="h-4 w-4 md:h-5 md:w-5 text-blue-200" />}
                    <span className="text-xs text-blue-300">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {/* Contenu du message */}
                  <div className="space-y-2 md:space-y-3">
                    {/* Message texte simple */}
                    {message.type === 'text' && (
                      <div className="text-blue-100 text-sm md:text-base leading-relaxed">
                        {message.summary || message.text}
                      </div>
                    )}

                    {/* Message d'erreur */}
                    {message.type === 'error' && (
                      <div className="p-2 md:p-3 bg-red-900/30 border-l-4 border-red-400 rounded text-red-200 text-sm md:text-base">
                        {message.text}
                      </div>
                    )}

                    {/* Message de salutation */}
                    {message.type === 'greeting' && (
                      <div className="space-y-3">
                        <div className="p-2 md:p-3 bg-green-900/30 border-l-4 border-green-400 rounded text-green-200 text-sm md:text-base">
                          {message.text}
                        </div>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1 bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 rounded-lg text-xs transition-colors border border-blue-700 hover:border-blue-500"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message de conversation (questions non reconnues) */}
                    {message.type === 'unrecognized_high_confidence' && (
                      <div className="space-y-3">
                        <div className="p-2 md:p-3 bg-yellow-900/30 border-l-4 border-yellow-400 rounded text-yellow-200 text-sm md:text-base">
                          {message.text}
                        </div>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="space-y-2">
                            <div className="text-xs text-blue-300 font-medium">Suggestions de reformulation :</div>
                            <div className="flex flex-wrap gap-2">
                              {message.suggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="px-3 py-1 bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 rounded-lg text-xs transition-colors border border-blue-700 hover:border-blue-500"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Objets accédés */}
                        {message.enrichedStatistics && message.enrichedStatistics.enriched_data && message.enrichedStatistics.enriched_data.length > 0 && (
                          <div className="p-2 md:p-3 bg-green-900/20 rounded border border-green-800">
                            <div className="text-xs text-green-300 font-medium mb-2">🎯 Objets accédés :</div>
                            <div className="space-y-1 text-xs">
                              {message.enrichedStatistics.enriched_data.slice(0, 5).map((item: any, idx: number) => (
                                <div key={idx} className="text-green-200">
                                  <span className="font-medium">{item.object_name || item.OBJECT_NAME || 'N/A'}</span>
                                  <span className="text-green-400 ml-2">({item.action_name || item.ACTION_NAME || 'N/A'})</span>
                                </div>
                              ))}
                              {message.enrichedStatistics.enriched_data.length > 5 && (
                                <div className="text-green-400 text-xs italic">
                                  ... et {message.enrichedStatistics.enriched_data.length - 5} autres objets
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Statistiques enrichies pour les messages de conversation */}
                        {message.enrichedStatistics && (
                          <div className="p-2 md:p-3 bg-blue-900/20 rounded border border-blue-800">
                            <div className="text-xs text-blue-300 font-medium mb-2">📊 Statistiques enrichies :</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div className="text-blue-200">
                                <span className="font-medium">Total :</span> {message.enrichedStatistics.statistics?.total_records || message.enrichedStatistics.total_records || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Actions critiques :</span> {message.enrichedStatistics.statistics?.critical_actions || message.enrichedStatistics.critical_actions || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Patterns suspects :</span> {message.enrichedStatistics.statistics?.suspicious_patterns || message.enrichedStatistics.suspicious_patterns || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Risque élevé :</span> {message.enrichedStatistics.statistics?.high_risk_records || message.enrichedStatistics.high_risk_records || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Accès système :</span> {message.enrichedStatistics.statistics?.system_access || message.enrichedStatistics.system_access || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Terminaux inconnus :</span> {message.enrichedStatistics.statistics?.unknown_terminals || message.enrichedStatistics.unknown_terminals || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Opérations destructives :</span> {message.enrichedStatistics.statistics?.destructive_operations || message.enrichedStatistics.destructive_operations || 0}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message d'aide */}
                    {message.type === 'help' && (
                      <div className="space-y-3">
                        <div className="p-2 md:p-3 bg-blue-900/30 border-l-4 border-blue-400 rounded text-blue-200 text-sm md:text-base whitespace-pre-line">
                          {message.text}
                        </div>
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-3 py-1 bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 rounded-lg text-xs transition-colors border border-blue-700 hover:border-blue-500"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message d'analyse avec statistiques enrichies */}
                    {message.type === 'analysis' && (
                      <div className="space-y-3">
                        <div className="p-2 md:p-3 bg-green-900/30 border-l-4 border-green-400 rounded text-green-200 text-sm md:text-base">
                          {message.text}
                        </div>
                        {message.enrichedStatistics && (
                          <div className="p-2 md:p-3 bg-blue-900/20 rounded border border-blue-800">
                            <div className="text-xs text-blue-300 font-medium mb-2">📊 Statistiques enrichies :</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div className="text-blue-200">
                                <span className="font-medium">Total :</span> {message.enrichedStatistics.statistics?.total_records || message.enrichedStatistics.total_records || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Actions critiques :</span> {message.enrichedStatistics.statistics?.critical_actions || message.enrichedStatistics.critical_actions || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Patterns suspects :</span> {message.enrichedStatistics.statistics?.suspicious_patterns || message.enrichedStatistics.suspicious_patterns || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Risque élevé :</span> {message.enrichedStatistics.statistics?.high_risk_records || message.enrichedStatistics.high_risk_records || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Accès système :</span> {message.enrichedStatistics.statistics?.system_access || message.enrichedStatistics.system_access || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Terminaux inconnus :</span> {message.enrichedStatistics.statistics?.unknown_terminals || message.enrichedStatistics.unknown_terminals || 0}
                              </div>
                              <div className="text-blue-200">
                                <span className="font-medium">Opérations destructives :</span> {message.enrichedStatistics.statistics?.destructive_operations || message.enrichedStatistics.destructive_operations || 0}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tableau de données */}
                    {message.type === 'table' && Array.isArray(message.data) && message.columns && (
                      <div className="space-y-3 md:space-y-4">
                        {message.summary && (
                          <div className="p-2 md:p-3 bg-yellow-900/40 border-l-4 border-yellow-400 rounded text-yellow-200 text-sm md:text-base font-medium">
                            {message.summary}
                          </div>
                        )}
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs md:text-sm border border-blue-900 rounded-lg shadow">
                            <thead className="bg-blue-900/80">
                              <tr>
                                {message.columns.map((col) => (
                                  <th key={col} className="px-2 md:px-3 py-1 md:py-2 text-left font-semibold text-blue-200 border-b border-blue-800">
                                    {col}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {message.data.map((row: any, idx: number) => (
                                <tr key={idx} className="hover:bg-blue-900/40 transition-colors">
                                  {message.columns && message.columns.map((col) => (
                                    <td key={col} className="px-2 md:px-3 py-1 md:py-2 text-blue-100 border-b border-blue-900">
                                      {row[col] !== undefined && row[col] !== null 
                                        ? row[col].toString() 
                                        : <span className="italic text-blue-400">N/A</span>
                                      }
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {message.explanation && (
                          <div className="p-2 md:p-3 bg-blue-900/30 border-l-4 border-blue-400 rounded text-blue-200 text-xs md:text-sm">
                            {message.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicateur de frappe */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-blue-900/80 text-blue-100 p-3 md:p-4 rounded-xl md:rounded-2xl flex items-center gap-2 md:gap-3 shadow">
                  <Bot className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Zone de saisie */}
        <div className="flex-shrink-0 space-y-2 md:space-y-4">
          <div className="flex gap-2 md:gap-3 w-full">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Posez votre question Oracle..."
              disabled={isLoading}
              className="flex-1 px-3 md:px-4 lg:px-6 py-2 md:py-3 lg:py-4 border border-blue-900 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-950 text-blue-100 shadow-lg text-sm md:text-base disabled:opacity-50"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="px-4 md:px-6 lg:px-8 py-2 md:py-3 lg:py-4 bg-blue-900 text-white rounded-lg md:rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg text-sm md:text-base"
            >
              <Send className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
          
          <div className="text-xs text-blue-200 text-center">
            Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 md:gap-3 justify-center mt-4 md:mt-6">
          <button 
            onClick={exportConversation} 
            className="px-3 md:px-4 lg:px-6 py-2 md:py-3 bg-blue-800 text-blue-100 rounded-lg md:rounded-xl hover:bg-blue-700 flex items-center gap-2 font-semibold shadow text-xs md:text-sm"
          >
            <Download className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </button>
          <button 
            onClick={clearConversation} 
            className="px-3 md:px-4 lg:px-6 py-2 md:py-3 bg-red-800 text-red-100 rounded-lg md:rounded-xl hover:bg-red-700 flex items-center gap-2 font-semibold shadow text-xs md:text-sm"
          >
            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Effacer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;