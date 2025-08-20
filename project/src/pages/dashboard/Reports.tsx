import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Filter, Eye, Trash2, Plus, Clock, CheckCircle, XCircle, AlertTriangle, BarChart3, Shield, Database, Activity } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: string;
  status: 'completed' | 'processing' | 'failed' | 'pending';
  createdAt: string;
  updatedAt: string;
  size: string;
  description: string;
  generatedBy: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  icon: React.ReactNode;
  category: string;
}

const Reports: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [reports, setReports] = useState<Report[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Générer des rapports simulés
  const generateMockReports = (): Report[] => {
    const types = ['performance', 'sécurité', 'stockage', 'activité'];
    const statuses: ('completed' | 'processing' | 'failed' | 'pending')[] = ['completed', 'processing', 'failed', 'pending'];
    const names = [
      'Rapport Performance Mensuel',
      'Analyse Sécurité Hebdomadaire',
      'État du Stockage',
      'Activité Utilisateurs',
      'Audit des Accès',
      'Métriques Système'
    ];

    return Array.from({ length: 8 }, (_, i) => ({
      id: `report-${i + 1}`,
      name: names[i % names.length],
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      size: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 9)} MB`,
      description: `Rapport détaillé sur ${types[i % types.length]} du système Oracle`,
      generatedBy: `Utilisateur ${Math.floor(Math.random() * 10) + 1}`
    }));
  };

  // Générer des templates de rapports
  const generateReportTemplates = (): ReportTemplate[] => {
    return [
      {
        id: 'perf-monthly',
        name: 'Performance Mensuelle',
        description: 'Analyse complète des performances système sur le mois',
        type: 'performance',
        icon: <Activity className="h-5 w-5" />,
        category: 'performance'
      },
      {
        id: 'security-weekly',
        name: 'Sécurité Hebdomadaire',
        description: 'Rapport de sécurité et audit des accès',
        type: 'sécurité',
        icon: <Shield className="h-5 w-5" />,
        category: 'sécurité'
      },
      {
        id: 'storage-daily',
        name: 'État du Stockage',
        description: 'Analyse de l\'utilisation des espaces de stockage',
        type: 'stockage',
        icon: <Database className="h-5 w-5" />,
        category: 'stockage'
      },
      {
        id: 'activity-daily',
        name: 'Activité Utilisateurs',
        description: 'Suivi de l\'activité des utilisateurs',
        type: 'activité',
        icon: <BarChart3 className="h-5 w-5" />,
        category: 'activité'
      }
    ];
  };

  const fetchReportsData = async () => {
    setIsLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setReports(generateMockReports());
      setReportTemplates(generateReportTemplates());
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'processing': return 'En cours';
      case 'failed': return 'Échec';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const handleGenerateReport = async (template: ReportTemplate) => {
    setIsGenerating(true);
    try {
      // Simuler la génération d'un rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: Report = {
        id: `report-${Date.now()}`,
        name: template.name,
        type: template.type,
        status: 'processing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        size: '0.0 MB',
        description: template.description,
        generatedBy: 'Utilisateur actuel'
      };
      
      setReports(prev => [newReport, ...prev]);
      
      // Simuler la finalisation du rapport
      setTimeout(() => {
        setReports(prev => prev.map(r => 
          r.id === newReport.id 
            ? { ...r, status: 'completed', size: `${(Math.random() * 5 + 1).toFixed(1)} MB` }
            : r
        ));
      }, 3000);
      
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (report: Report) => {
    // Simuler le téléchargement
    const blob = new Blob([`Rapport: ${report.name}\nType: ${report.type}\nGénéré le: ${new Date(report.createdAt).toLocaleDateString('fr-FR')}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

  const filteredReports = reports.filter(report => {
    if (selectedFilter === 'all') return true;
    return report.type.toLowerCase() === selectedFilter.toLowerCase();
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Rapports</h1>
          <p className="text-gray-600 dark:text-gray-300">Générez et consultez vos rapports d'analyse Oracle</p>
        </div>
        <button 
          className="flex items-center space-x-2 px-4 py-2 bg-blue-900 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-blue-600 transition-colors"
          onClick={() => document.getElementById('templates-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau Rapport</span>
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 transition-colors mb-8">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Filtrer par:</span>
          </div>
          <select 
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="all">Tous les types</option>
            <option value="performance">Performance</option>
            <option value="sécurité">Sécurité</option>
            <option value="stockage">Stockage</option>
            <option value="activité">Activité</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Période:</span>
          </div>
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Templates de rapports */}
      <div id="templates-section" className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors mb-8">
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Templates de Rapports</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Sélectionnez un template pour générer un nouveau rapport</p>
        </div>
        <div className="p-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Chargement des templates...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportTemplates.map((template) => (
                <div key={template.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      {template.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{template.name}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{template.type}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{template.description}</p>
                  <button
                    onClick={() => handleGenerateReport(template)}
                    disabled={isGenerating}
                    className="w-full px-4 py-2 bg-blue-900 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-800 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Génération...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Générer</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Liste des rapports */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">Rapports Générés</h3>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''} trouvé{filteredReports.length > 1 ? 's' : ''}
          </p>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-300">Chargement des rapports...</span>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Aucun rapport trouvé</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Générez votre premier rapport en utilisant les templates ci-dessus</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nom du Rapport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{report.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                        {report.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(report.status)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {report.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadReport(report)}
                          disabled={report.status !== 'completed'}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Télécharger"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;