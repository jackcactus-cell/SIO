import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  BarChart3, 
  Users, 
  Database, 
  Clock, 
  Shield, 
  Monitor, 
  FileText,
  Terminal,
  Server,
  Code,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { questionTemplates, AuditAnalyzer as Analyzer, analysisUtils } from '../utils/questionTemplates';
import logger, { logUserAction, logOracleAudit } from '../utils/logger';

interface AuditAnalyzerProps {
  auditData: any[];
  onAnalysisComplete?: (results: any) => void;
}

interface AnalysisResult {
  question: string;
  result: any;
  description: string;
  error?: string;
}

const AuditAnalyzer: React.FC<AuditAnalyzerProps> = ({ auditData, onAnalysisComplete }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('users');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [report, setReport] = useState<any>(null);

  // Initialiser l'analyseur
  const analyzer = useMemo(() => {
    if (auditData && auditData.length > 0) {
      return new Analyzer(auditData);
    }
    return null;
  }, [auditData]);

  // Catégories disponibles
  const categories = [
    { key: 'users', label: 'Utilisateurs', icon: <Users className="h-5 w-5" /> },
    { key: 'hosts', label: 'Hôtes', icon: <Server className="h-5 w-5" /> },
    { key: 'terminals', label: 'Terminaux', icon: <Terminal className="h-5 w-5" /> },
    { key: 'authentication', label: 'Authentification', icon: <Shield className="h-5 w-5" /> },
    { key: 'programs', label: 'Programmes', icon: <Code className="h-5 w-5" /> },
    { key: 'objects', label: 'Objets', icon: <Database className="h-5 w-5" /> },
    { key: 'sql', label: 'SQL', icon: <FileText className="h-5 w-5" /> },
    { key: 'time', label: 'Temps', icon: <Clock className="h-5 w-5" /> },
    { key: 'actions', label: 'Actions', icon: <Activity className="h-5 w-5" /> },
    { key: 'crossAnalysis', label: 'Analyse Croisée', icon: <TrendingUp className="h-5 w-5" /> }
  ];

  // Analyser une question spécifique
  const analyzeQuestion = async (questionId: number) => {
    if (!analyzer) return;

    try {
      setIsAnalyzing(true);
      logOracleAudit('question_analysis_started', { questionId }, 'AuditAnalyzer');
      
      const result = analyzer.analyzeQuestion(questionId);
      const question = analyzer.findQuestion(questionId);
      
      setAnalysisResults(prev => ({
        ...prev,
        [questionId]: {
          question: question?.question || '',
          result,
          description: question?.description || ''
        }
      }));

      logOracleAudit('question_analysis_completed', { questionId, success: true }, 'AuditAnalyzer');
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      logOracleAudit('question_analysis_error', { questionId, error: error.message }, 'AuditAnalyzer');
      
      setAnalysisResults(prev => ({
        ...prev,
        [questionId]: {
          question: `Question ${questionId}`,
          result: null,
          description: '',
          error: error.message
        }
      }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Analyser toute une catégorie
  const analyzeCategory = async (category: string) => {
    if (!analyzer) return;

    try {
      setIsAnalyzing(true);
      logOracleAudit('category_analysis_started', { category }, 'AuditAnalyzer');
      
      const results = analyzer.analyzeCategory(category);
      setAnalysisResults(prev => ({ ...prev, ...results }));
      
      logOracleAudit('category_analysis_completed', { category, success: true }, 'AuditAnalyzer');
    } catch (error) {
      console.error('Erreur lors de l\'analyse de catégorie:', error);
      logOracleAudit('category_analysis_error', { category, error: error.message }, 'AuditAnalyzer');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Générer un rapport complet
  const generateFullReport = async () => {
    if (!analyzer) return;

    try {
      setIsAnalyzing(true);
      logOracleAudit('full_report_generation_started', {}, 'AuditAnalyzer');
      
      const fullReport = analyzer.generateReport();
      setReport(fullReport);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(fullReport);
      }
      
      logOracleAudit('full_report_generation_completed', { success: true }, 'AuditAnalyzer');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      logOracleAudit('full_report_generation_error', { error: error.message }, 'AuditAnalyzer');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Rechercher des questions
  const searchQuestions = () => {
    if (!analyzer || !searchKeyword.trim()) return [];

    return analyzer.searchQuestions(searchKeyword);
  };

  // Formater les résultats pour l'affichage
  const formatResult = (result: any) => {
    if (!result) return 'Aucun résultat';

    if (typeof result === 'object') {
      if (Array.isArray(result)) {
        return result.slice(0, 5).map((item, index) => (
          <div key={index} className="text-sm">
            {JSON.stringify(item)}
          </div>
        ));
      } else {
        return Object.entries(result).map(([key, value]) => (
          <div key={key} className="text-sm">
            <strong>{key}:</strong> {JSON.stringify(value)}
          </div>
        ));
      }
    }

    return String(result);
  };

  // Questions filtrées de la catégorie sélectionnée
  const filteredQuestions = useMemo(() => {
    const questions = questionTemplates[selectedCategory] || [];
    if (searchKeyword.trim()) {
      return questions.filter(q => 
        q.question.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        q.description.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
    return questions;
  }, [selectedCategory, searchKeyword]);

  useEffect(() => {
    if (analyzer) {
      logOracleAudit('analyzer_initialized', { dataCount: auditData.length }, 'AuditAnalyzer');
    }
  }, [analyzer, auditData.length]);

  if (!auditData || auditData.length === 0) {
    return (
      <div className="theme-card p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold theme-text-primary mb-2">
          Aucune donnée d'audit disponible
        </h3>
        <p className="theme-text-secondary">
          Veuillez charger des données d'audit Oracle pour commencer l'analyse.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="theme-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl font-bold theme-text-primary">
              Analyseur d'Audit Oracle
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={generateFullReport}
              disabled={isAnalyzing}
              className="theme-button-primary px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>Rapport Complet</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analysisUtils.formatNumber(auditData.length)}
            </div>
            <div className="text-sm theme-text-secondary">Enregistrements</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Object.keys(analysisResults).length}
            </div>
            <div className="text-sm theme-text-secondary">Analyses</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {categories.length}
            </div>
            <div className="text-sm theme-text-secondary">Catégories</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {filteredQuestions.length}
            </div>
            <div className="text-sm theme-text-secondary">Questions</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar des catégories */}
        <div className="lg:col-span-1">
          <div className="theme-card p-4">
            <h3 className="text-lg font-semibold theme-text-primary mb-4 flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Catégories</span>
            </h3>
            
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.key}
                  onClick={() => {
                    setSelectedCategory(category.key);
                    setSearchKeyword('');
                    logUserAction('category_selected', { category: category.key }, 'AuditAnalyzer');
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {category.icon}
                  <span className="theme-text-primary">{category.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium theme-text-secondary mb-2">Recherche</h4>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des questions..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="theme-input w-full pl-10 pr-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Zone principale */}
        <div className="lg:col-span-3">
          <div className="theme-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold theme-text-primary">
                {categories.find(c => c.key === selectedCategory)?.label} - Questions d'Analyse
              </h3>
              <button
                onClick={() => analyzeCategory(selectedCategory)}
                disabled={isAnalyzing}
                className="theme-button-secondary px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>Analyser Tout</span>
              </button>
            </div>

            <div className="space-y-4">
              {filteredQuestions.map(question => (
                <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium theme-text-primary mb-1">
                        {question.question}
                      </h4>
                      <p className="text-sm theme-text-muted">
                        {question.description}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedQuestion(question.id);
                        analyzeQuestion(question.id);
                        logUserAction('question_analyzed', { questionId: question.id }, 'AuditAnalyzer');
                      }}
                      disabled={isAnalyzing}
                      className="theme-button-primary px-3 py-1 rounded text-sm flex items-center space-x-1"
                    >
                      {isAnalyzing && selectedQuestion === question.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <BarChart3 className="h-3 w-3" />
                      )}
                      <span>Analyser</span>
                    </button>
                  </div>

                  {/* Résultats */}
                  {analysisResults[question.id] && (
                    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      {analysisResults[question.id].error ? (
                        <div className="text-red-600 dark:text-red-400 text-sm">
                          <AlertTriangle className="h-4 w-4 inline mr-2" />
                          Erreur: {analysisResults[question.id].error}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-sm theme-text-secondary">
                            <CheckCircle className="h-4 w-4 inline mr-2 text-green-500" />
                            Analyse terminée
                          </div>
                          <div className="text-sm theme-text-primary">
                            {formatResult(analysisResults[question.id].result)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {filteredQuestions.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="theme-text-secondary">
                    Aucune question trouvée pour "{searchKeyword}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Rapport complet */}
      {report && (
        <div className="theme-card p-6">
          <h3 className="text-xl font-semibold theme-text-primary mb-4">
            Rapport d'Analyse Complet
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium theme-text-primary mb-2">Résumé</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Total des questions:</strong> {report.summary.totalQuestions}</div>
                <div><strong>Analyses réussies:</strong> {report.summary.successfulAnalyses}</div>
                <div><strong>Analyses échouées:</strong> {report.summary.failedAnalyses}</div>
                <div><strong>Enregistrements:</strong> {analysisUtils.formatNumber(report.summary.dataSummary.totalRecords)}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium theme-text-primary mb-2">Période d'Analyse</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Début:</strong> {analysisUtils.formatDate(report.summary.dataSummary.dateRange.startDate)}</div>
                <div><strong>Fin:</strong> {analysisUtils.formatDate(report.summary.dataSummary.dateRange.endDate)}</div>
                <div><strong>Durée:</strong> {report.summary.dataSummary.dateRange.duration}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditAnalyzer;
