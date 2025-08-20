import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, Lightbulb, Zap, TrendingUp, Shield, Clock, Database, Users, Activity, RotateCcw } from 'lucide-react';
import { auditQuestions } from '../utils/auditQuestions';

interface DynamicSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  showSuggestions: boolean;
}

const DynamicSuggestions: React.FC<DynamicSuggestionsProps> = ({ 
  onSuggestionClick, 
  showSuggestions 
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date());
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotationInterval, setRotationInterval] = useState<number>(30000); // 30 secondes

  // Questions intelligentes supplémentaires pour plus de variété
  const intelligentQuestions = [
    // Questions sur les utilisateurs (avec variations)
    "Quels sont les utilisateurs les plus actifs ?",
    "Qui utilise le plus SQL Developer ?",
    "Quels utilisateurs accèdent au schéma SYS ?",
    "Combien d'utilisateurs uniques se sont connectés ?",
    "Qui a les privilèges les plus élevés ?",
    "Quels utilisateurs utilisent Toad.exe ?",
    "Qui effectue le plus d'actions de maintenance ?",
    "Quels utilisateurs sont connectés en ce moment ?",
    "Qui fait le plus de requêtes SELECT ?",
    "Quels utilisateurs ont des sessions longues ?",
    "Qui accède aux tables système ?",
    "Quels utilisateurs font des modifications ?",
    
    // Questions sur les actions (avec variations)
    "Quelles sont les actions les plus fréquentes ?",
    "Combien de requêtes SELECT ont été exécutées ?",
    "Qui fait le plus de modifications de données ?",
    "Quelles actions sont suspectes ?",
    "Combien de TRUNCATE ont été exécutés ?",
    "Qui crée le plus d'index ?",
    "Quelles sont les actions les plus risquées ?",
    "Combien de procédures ont été modifiées ?",
    "Quelles actions sont faites en dehors des heures normales ?",
    "Qui fait le plus de requêtes UPDATE ?",
    "Quelles actions sont liées à la sécurité ?",
    "Combien de requêtes DELETE ont été exécutées ?",
    
    // Questions sur les objets (avec variations)
    "Quelles tables sont les plus consultées ?",
    "Quels schémas sont les plus actifs ?",
    "Quelles tables système sont accédées ?",
    "Quels objets sont le plus modifiés ?",
    "Quelles vues sont les plus populaires ?",
    "Quels schémas applicatifs sont utilisés ?",
    "Quelles tables temporaires sont créées ?",
    "Quels objets sont liés à la sécurité ?",
    "Quelles tables sont tronquées ?",
    "Quels objets sont créés ou supprimés ?",
    "Quelles tables ont le plus d'accès ?",
    
    // Questions temporelles (avec variations)
    "À quelle heure l'activité est-elle maximale ?",
    "Quelle est la période la plus active ?",
    "Y a-t-il des pics d'activité inhabituels ?",
    "Quelle est la fréquence des actions par heure ?",
    "Quand les connexions sont-elles les plus nombreuses ?",
    "Y a-t-il des actions en dehors des heures normales ?",
    "Quelle est l'évolution de l'activité dans le temps ?",
    "Quand les maintenances sont-elles effectuées ?",
    "Quelle est la durée moyenne des sessions ?",
    "Y a-t-il des patterns d'activité quotidiens ?",
    "Quand les sauvegardes sont-elles effectuées ?",
    
    // Questions de sécurité (avec variations)
    "Y a-t-il des accès suspects ?",
    "Quels utilisateurs accèdent aux objets système ?",
    "Y a-t-il des tentatives d'intrusion ?",
    "Quels privilèges sont les plus utilisés ?",
    "Y a-t-il des actions non autorisées ?",
    "Quels hôtes sont les plus actifs ?",
    "Y a-t-il des connexions depuis des IPs suspectes ?",
    "Quelles actions sont liées à la sécurité ?",
    "Y a-t-il des échecs d'authentification ?",
    "Quels utilisateurs ont des droits étendus ?",
    "Y a-t-il des accès à des données sensibles ?",
    
    // Questions sur les applications (avec variations)
    "Quelles applications sont les plus utilisées ?",
    "Qui utilise SQL Developer ?",
    "Qui utilise Toad.exe ?",
    "Quels programmes clients sont populaires ?",
    "Quelles applications accèdent aux données sensibles ?",
    "Qui utilise sqlplus ?",
    "Quelles applications font le plus de requêtes ?",
    "Quels outils de développement sont utilisés ?",
    "Qui utilise JDBC Thin Client ?",
    "Quelles applications sont utilisées pour la maintenance ?",
    "Quels programmes accèdent aux schémas système ?",
    
    // Questions sur les performances (avec variations)
    "Quelles sont les requêtes les plus fréquentes ?",
    "Quels objets sont les plus sollicités ?",
    "Y a-t-il des goulots d'étranglement ?",
    "Quelles actions prennent le plus de temps ?",
    "Quels utilisateurs font le plus de requêtes ?",
    "Quelles tables sont les plus volumineuses ?",
    "Y a-t-il des requêtes inefficaces ?",
    "Quelles sont les métriques de performance ?",
    "Quels schémas ont le plus d'activité ?",
    "Y a-t-il des pics de charge ?",
    "Quelles sont les tables les plus accédées ?"
  ];

  // Générer des suggestions dynamiques avec plus de variété
  const generateSuggestions = (category?: string) => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      let availableQuestions = [...auditQuestions, ...intelligentQuestions.map((q, index) => ({
        id: 1000 + index,
        question: q,
        category: getCategoryFromQuestion(q),
        description: `Question intelligente ${index + 1}`
      }))];
      
      // Filtrer par catégorie si spécifiée
      if (category && category !== 'Toutes') {
        availableQuestions = availableQuestions.filter(q => 
          q.category?.toLowerCase().includes(category.toLowerCase()) ||
          q.question.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      // Mélanger et sélectionner 5 questions (au lieu de 4)
      const shuffled = availableQuestions.sort(() => 0.5 - Math.random());
      const newSuggestions = shuffled.slice(0, 5).map(q => q.question);
      
      setSuggestions(newSuggestions);
      setLastRefreshTime(new Date());
      setIsRefreshing(false);
    }, 200); // Réduit encore le délai pour une meilleure réactivité
  };

  // Déterminer la catégorie d'une question
  const getCategoryFromQuestion = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('utilisateur') || lowerQuestion.includes('user') || lowerQuestion.includes('qui')) {
      return 'Utilisateurs et sessions';
    }
    if (lowerQuestion.includes('action') || lowerQuestion.includes('requête') || lowerQuestion.includes('sql')) {
      return 'Actions spécifiques';
    }
    if (lowerQuestion.includes('table') || lowerQuestion.includes('objet') || lowerQuestion.includes('schéma')) {
      return 'Schémas et objets';
    }
    if (lowerQuestion.includes('heure') || lowerQuestion.includes('temps') || lowerQuestion.includes('quand')) {
      return 'Horaires et fréquence';
    }
    if (lowerQuestion.includes('sécurité') || lowerQuestion.includes('suspect') || lowerQuestion.includes('intrusion')) {
      return 'Sécurité';
    }
    if (lowerQuestion.includes('application') || lowerQuestion.includes('programme') || lowerQuestion.includes('client')) {
      return 'Applications spécifiques';
    }
    if (lowerQuestion.includes('performance') || lowerQuestion.includes('fréquent') || lowerQuestion.includes('populaire')) {
      return 'Performance';
    }
    
    return 'Général';
  };

  // Obtenir les catégories disponibles
  const getCategories = () => {
    const categorySet = new Set<string>();
    auditQuestions.forEach(q => {
      if (q.category) {
        categorySet.add(q.category);
      }
    });
    // Ajouter des catégories intelligentes
    categorySet.add('Sécurité');
    categorySet.add('Performance');
    categorySet.add('Applications');
    return ['Toutes', ...Array.from(categorySet)];
  };

  // Gérer le changement de catégorie
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    generateSuggestions(category);
  };

  // Gérer le rafraîchissement
  const handleRefresh = () => {
    generateSuggestions(selectedCategory);
  };

  // Gérer la rotation automatique
  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
  };

  // Générer des suggestions au chargement
  useEffect(() => {
    setCategories(getCategories());
    generateSuggestions();
  }, []);

  // Rotation automatique des suggestions
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      if (!isRefreshing) {
        generateSuggestions(selectedCategory);
      }
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [selectedCategory, isRefreshing, autoRotate, rotationInterval]);

  if (!showSuggestions) return null;

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-gray-100 border border-gray-700 rounded-lg p-4 shadow-lg">
      {/* En-tête avec titre et contrôles */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          <span className="text-sm font-semibold text-gray-200">Suggestions intelligentes</span>
          <div className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-full">
            IA
          </div>
          <div className="px-2 py-1 bg-green-600/20 text-green-300 text-xs rounded-full">
            Variées
          </div>
          {autoRotate && (
            <div className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full flex items-center gap-1">
              <RotateCcw className="h-3 w-3" />
              Auto
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-400">
            Dernière mise à jour: {lastRefreshTime.toLocaleTimeString()}
          </div>
          <button
            onClick={toggleAutoRotate}
            className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
              autoRotate 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={autoRotate ? 'Désactiver rotation automatique' : 'Activer rotation automatique'}
          >
            <RotateCcw className={`h-3 w-3 ${autoRotate ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Rafraîchir...' : 'Nouvelles'}
          </button>
        </div>
      </div>

      {/* Filtres par catégorie avec icônes */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb className="h-4 w-4 text-yellow-400" />
          <span className="text-xs text-gray-400">Filtrer par catégorie :</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 8).map((category, index) => {
            const getIcon = () => {
              switch (category) {
                case 'Utilisateurs et sessions': return <Users className="h-3 w-3" />;
                case 'Actions spécifiques': return <Activity className="h-3 w-3" />;
                case 'Schémas et objets': return <Database className="h-3 w-3" />;
                case 'Horaires et fréquence': return <Clock className="h-3 w-3" />;
                case 'Sécurité': return <Shield className="h-3 w-3" />;
                case 'Performance': return <TrendingUp className="h-3 w-3" />;
                case 'Applications': return <Zap className="h-3 w-3" />;
                default: return <Lightbulb className="h-3 w-3" />;
              }
            };

            return (
              <button
                key={index}
                onClick={() => handleCategoryChange(category)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {getIcon()}
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggestions avec indicateurs visuels */}
      <div className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion)}
            className="w-full text-left p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/70 border border-gray-600 hover:border-gray-500 transition-all duration-200 hover:scale-[1.02] group"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-blue-400 text-xs font-medium">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-200 group-hover:text-white transition-colors leading-relaxed">
                  {suggestion}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {getCategoryFromQuestion(suggestion)}
                  </span>
                  {suggestion.includes('?') && (
                    <span className="text-xs text-green-400">✓ Prête</span>
                  )}
                  {intelligentQuestions.includes(suggestion) && (
                    <span className="text-xs text-purple-400">✨ IA</span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Indicateur de catégorie active et statistiques */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span>Catégorie active :</span>
            <span className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded">
              {selectedCategory}
            </span>
            <span className="text-gray-500">•</span>
            <span>{suggestions.length} suggestions</span>
          </div>
          <div className="flex items-center gap-2">
            {autoRotate && (
              <span className="text-purple-400">Rotation automatique activée</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicSuggestions;
