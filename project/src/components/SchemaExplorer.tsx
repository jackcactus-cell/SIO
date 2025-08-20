import React, { useMemo, useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Table, Key, Database, Eye, Search, Filter, Shield, Lock } from 'lucide-react';
import { useUserRole, UserRole } from '../utils/userRoles';

interface SchemaItem {
  name: string;
  type: 'schema' | 'table' | 'column';
  dataType?: string;
  nullable?: boolean;
  primaryKey?: boolean;
  children?: SchemaItem[];
}

// Interface utilisateur (non utilisée pour l'instant)
// interface OracleUser2 {
//   USERNAME: string;
//   ACCOUNT_STATUS: string;
//   CREATED_DATE: string;
//   EXPIRY_DATE?: string;
//   PROFILE: string;
//   AUTHENTICATION_TYPE: string;
//   DEFAULT_TABLESPACE: string;
//   TEMPORARY_TABLESPACE: string;
// }

// 1. Définis le type et les données
interface OracleTableInfo {
  OWNER: string;
  TABLE_NAME: string;
  TABLESPACE_NAME: string;
  STATUS: string;
  NUM_ROWS: string;
  AVG_ROW_LEN: string;
  BLOCKS: string;
  EMPTY_BLOCKS: string;
  AVG_SPACE: string;
  CHAIN_CNT: string;
  LAST_ANALYZED: string;
  PARTITIONED: string;
  TEMPORARY: string;
  SECONDARY: string;
  NESTED: string;
}

const SchemaExplorer: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [filterTablespace, setFilterTablespace] = useState('Tous');
  const [filterOwner, setFilterOwner] = useState('Tous');
  const [activeTab, setActiveTab] = useState<'tables' | 'schemas' | 'tablespaces'>('tables');
  const [sortKey, setSortKey] = useState<keyof OracleTableInfo>('TABLE_NAME');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  
  // Système de rôles utilisateur
  const { 
    currentRole, 
    permissions, 
    canViewTablespaces, 
    canViewSystemSchemas,
    updateRoleFromAuditData 
  } = useUserRole();
  
  // Filtrer les données selon les permissions
  const filteredSchemaData: SchemaItem[] = useMemo(() => {
    const baseData = [
      {
        name: 'Tablespaces',
        type: 'schema' as const,
        children: canViewTablespaces() ? [
          {
            name: 'LAB01_IAS_OPSS',
            type: 'table' as const,
            children: [
              { name: 'Type: Permanent', type: 'column' as const },
              { name: 'Status: Online', type: 'column' as const },
              { name: 'Size: 60 MB', type: 'column' as const },
              { name: 'Free: 6 MB', type: 'column' as const },
              { name: 'Used: 54 MB', type: 'column' as const },
              { name: '% Used: 90%', type: 'column' as const },
              { name: 'Max Size: 32 GB', type: 'column' as const },
              { name: 'Block Size: 8192', type: 'column' as const },
              { name: 'BigFile: No', type: 'column' as const },
              { name: 'Extent Manage: Local', type: 'column' as const },
            ],
          },
          {
          name: 'LAB01_IAS_TEMP',
          type: 'table' as const,
          children: [
            { name: 'Type: Temporary', type: 'column' as const },
            { name: 'Status: Online', type: 'column' as const },
            { name: 'Size: 100 MB', type: 'column' as const },
            { name: 'Free: 100 MB', type: 'column' as const },
            { name: 'Used: 0 MB', type: 'column' as const },
            { name: '% Used: 0%', type: 'column' as const },
            { name: 'Max Size: 32 GB', type: 'column' as const },
            { name: 'Block Size: 8192', type: 'column' as const },
            { name: 'BigFile: No', type: 'column' as const },
            { name: 'Extent Manage: Local', type: 'column' as const },
          ],
        },
        {
          name: 'LAB01_IAS_UMS',
          type: 'table' as const,
          children: [
            { name: 'Type: Permanent', type: 'column' as const },
            { name: 'Status: Online', type: 'column' as const },
            { name: 'Size: 100 MB', type: 'column' as const },
            { name: 'Free: 92 MB', type: 'column' as const },
            { name: 'Used: 8 MB', type: 'column' as const },
            { name: '% Used: 8%', type: 'column' as const },
            { name: 'Max Size: 32 GB', type: 'column' as const },
            { name: 'Block Size: 8192', type: 'column' as const },
            { name: 'BigFile: No', type: 'column' as const },
            { name: 'Extent Manage: Local', type: 'column' as const },
          ],
        },
        {
          name: 'LAB01_IAU',
          type: 'table' as const,
          children: [
            { name: 'Type: Permanent', type: 'column' as const },
            { name: 'Status: Online', type: 'column' as const },
            { name: 'Size: 60 MB', type: 'column' as const },
            { name: 'Free: 59 MB', type: 'column' as const },
            { name: 'Used: 1 MB', type: 'column' as const },
            { name: '% Used: 2%', type: 'column' as const },
            { name: 'Max Size: 32 GB', type: 'column' as const },
            { name: 'Block Size: 8192', type: 'column' as const },
            { name: 'BigFile: No', type: 'column' as const },
            { name: 'Extent Manage: Local', type: 'column' as const },
          ],
        },
        {
          name: 'LAB01_MDS',
          type: 'table' as const,
          children: [
            { name: 'Type: Permanent', type: 'column' as const },
            { name: 'Status: Online', type: 'column' as const },
            { name: 'Size: 100 MB', type: 'column' as const },
            { name: 'Free: 90 MB', type: 'column' as const },
            { name: 'Used: 10 MB', type: 'column' as const },
            { name: '% Used: 10%', type: 'column' as const },
            { name: 'Max Size: 32 GB', type: 'column' as const },
            { name: 'Block Size: 8192', type: 'column' as const },
            { name: 'BigFile: No', type: 'column' as const },
            { name: 'Extent Manage: Local', type: 'column' as const },
          ],
        },
        {
          name: 'LAB01_STB',
          type: 'table' as const,
          children: [
            { name: 'Type: Permanent', type: 'column' as const },
            { name: 'Status: Online', type: 'column' as const },
            { name: 'Size: 10 MB', type: 'column' as const },
            { name: 'Free: 8 MB', type: 'column' as const },
            { name: 'Used: 2 MB', type: 'column' as const },
            { name: '% Used: 19%', type: 'column' as const },
            { name: 'Max Size: 32 GB', type: 'column' as const },
            { name: 'Block Size: 8192', type: 'column' as const },
            { name: 'BigFile: No', type: 'column' as const },
            { name: 'Extent Manage: Local', type: 'column' as const },
          ],
        },
                          {
           name: 'LAB01_WLS',
           type: 'table' as const,
           children: [
             { name: 'Type: Permanent', type: 'column' as const },
             { name: 'Status: Online', type: 'column' as const },
             { name: 'Size: 60 MB', type: 'column' as const },
             { name: 'Free: 59 MB', type: 'column' as const },
             { name: 'Used: 1 MB', type: 'column' as const },
             { name: '% Used: 2%', type: 'column' as const },
             { name: 'Max Size: 32 GB', type: 'column' as const },
             { name: 'Block Size: 8192', type: 'column' as const },
             { name: 'BigFile: No', type: 'column' as const },
             { name: 'Extent Manage: Local', type: 'column' as const },
           ],
         },
                          {
           name: 'SMART2D_TBS',
           type: 'table' as const,
           children: [
             { name: 'Type: Permanent', type: 'column' as const },
             { name: 'Status: Online', type: 'column' as const },
             { name: 'Size: 3 GB', type: 'column' as const },
             { name: 'Free: 2.7 GB', type: 'column' as const },
             { name: 'Used: 311 MB', type: 'column' as const },
             { name: '% Used: 10%', type: 'column' as const },
             { name: 'Max Size: 32 GB', type: 'column' as const },
             { name: 'Block Size: 8192', type: 'column' as const },
             { name: 'BigFile: No', type: 'column' as const },
             { name: 'Extent Manage: Local', type: 'column' as const },
           ],
         },
                          {
           name: 'SYSAUX',
           type: 'table' as const,
           children: [
             { name: 'Type: Permanent', type: 'column' as const },
             { name: 'Status: Online', type: 'column' as const },
             { name: 'Size: 620 MB', type: 'column' as const },
             { name: 'Free: 34 MB', type: 'column' as const },
             { name: 'Used: 586 MB', type: 'column' as const },
             { name: '% Used: 95%', type: 'column' as const },
             { name: 'Max Size: 32 GB', type: 'column' as const },
             { name: 'Block Size: 8192', type: 'column' as const },
             { name: 'BigFile: No', type: 'column' as const },
             { name: 'Extent Manage: Local', type: 'column' as const },
           ],
         },
                          {
           name: 'SYSTEM',
           type: 'table' as const,
           children: [
             { name: 'Type: Permanent', type: 'column' as const },
             { name: 'Status: Online', type: 'column' as const },
             { name: 'Size: 460 MB', type: 'column' as const },
             { name: 'Free: 4 MB', type: 'column' as const },
             { name: 'Used: 456 MB', type: 'column' as const },
             { name: '% Used: 99%', type: 'column' as const },
             { name: 'Max Size: 32 GB', type: 'column' as const },
             { name: 'Block Size: 8192', type: 'column' as const },
             { name: 'BigFile: No', type: 'column' as const },
             { name: 'Extent Manage: Local', type: 'column' as const },
           ],
         },
                          {
           name: 'TEMP',
           type: 'table' as const,
           children: [
             { name: 'Type: Temporary', type: 'column' as const },
             { name: 'Status: Online', type: 'column' as const },
             { name: 'Size: 157 MB', type: 'column' as const },
             { name: 'Free: 157 MB', type: 'column' as const },
             { name: 'Used: 0 MB', type: 'column' as const },
             { name: '% Used: 0%', type: 'column' as const },
             { name: 'Max Size: 32 GB', type: 'column' as const },
             { name: 'Block Size: 8192', type: 'column' as const },
             { name: 'BigFile: No', type: 'column' as const },
             { name: 'Extent Manage: Local', type: 'column' as const },
           ],
         },
                          {
           name: 'UNDOTBS1',
           type: 'table' as const,
           children: [
             { name: 'Type: Undo', type: 'column' as const },
             { name: 'Status: Online', type: 'column' as const },
             { name: 'Size: 230 MB', type: 'column' as const },
             { name: 'Free: 202 MB', type: 'column' as const },
             { name: 'Used: 28 MB', type: 'column' as const },
             { name: '% Used: 12%', type: 'column' as const },
             { name: 'Max Size: 32 GB', type: 'column' as const },
             { name: 'Block Size: 8192', type: 'column' as const },
             { name: 'BigFile: No', type: 'column' as const },
             { name: 'Extent Manage: Local', type: 'column' as const },
           ],
         },
                          {
           name: 'UNDOTBS3',
           type: 'table' as const,
           children: [
             { name: 'Type: Undo', type: 'column' as const },
             { name: 'Status: Online', type: 'column' as const },
             { name: 'Size: 2 GB', type: 'column' as const },
             { name: 'Free: 1.98 GB', type: 'column' as const },
             { name: 'Used: 19 MB', type: 'column' as const },
             { name: '% Used: 1%', type: 'column' as const },
             { name: 'Max Size: 32 GB', type: 'column' as const },
             { name: 'Block Size: 8192', type: 'column' as const },
             { name: 'BigFile: No', type: 'column' as const },
             { name: 'Extent Manage: Local', type: 'column' as const },
           ],
         },
                          {
           name: 'USERS',
           type: 'table' as const,
           children: [
             { name: 'Type: Permanent', type: 'column' as const },
             { name: 'Status: Online', type: 'column' as const },
             { name: 'Size: 23 MB', type: 'column' as const },
             { name: 'Free: 21 MB', type: 'column' as const },
             { name: 'Used: 1 MB', type: 'column' as const },
             { name: '% Used: 5%', type: 'column' as const },
             { name: 'Max Size: 32 GB', type: 'column' as const },
             { name: 'Block Size: 8192', type: 'column' as const },
             { name: 'BigFile: No', type: 'column' as const },
             { name: 'Extent Manage: Local', type: 'column' as const },
           ],
         },
      ] : [],
    },
  ];
  
  return baseData;
  }, [canViewTablespaces]);

  // (Section "Utilisateurs" retirée de l'interface courante pour alléger l'UX)

  const oracleTableInfos: OracleTableInfo[] = [
    { OWNER: "APPQOSSYS", TABLE_NAME: "WLM_CLASSIFIER_PLAN", TABLESPACE_NAME: "SYSAUX", STATUS: "VALID", NUM_ROWS: "0", AVG_ROW_LEN: "0", BLOCKS: "0", EMPTY_BLOCKS: "0", AVG_SPACE: "0", CHAIN_CNT: "0", LAST_ANALYZED: "2019-04-17 01:33:13", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
    { OWNER: "SYS", TABLE_NAME: "AUD$", TABLESPACE_NAME: "SYSTEM", STATUS: "VALID", NUM_ROWS: "100", AVG_ROW_LEN: "120", BLOCKS: "10", EMPTY_BLOCKS: "2", AVG_SPACE: "50", CHAIN_CNT: "1", LAST_ANALYZED: "2025-07-01 10:00:00", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
    { OWNER: "HR", TABLE_NAME: "EMPLOYEES", TABLESPACE_NAME: "SYSAUX", STATUS: "VALID", NUM_ROWS: "25", AVG_ROW_LEN: "80", BLOCKS: "5", EMPTY_BLOCKS: "1", AVG_SPACE: "20", CHAIN_CNT: "0", LAST_ANALYZED: "2025-07-10 09:30:00", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
    { OWNER: "SMART2DADMIN", TABLE_NAME: "CONFIG", TABLESPACE_NAME: "SMART2D_TBS", STATUS: "VALID", NUM_ROWS: "5", AVG_ROW_LEN: "200", BLOCKS: "1", EMPTY_BLOCKS: "0", AVG_SPACE: "5", CHAIN_CNT: "0", LAST_ANALYZED: "2025-07-20 14:15:00", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
    { OWNER: "LAB01_OPSS", TABLE_NAME: "SECURITY", TABLESPACE_NAME: "LAB01_IAS_OPSS", STATUS: "VALID", NUM_ROWS: "50", AVG_ROW_LEN: "150", BLOCKS: "8", EMPTY_BLOCKS: "1", AVG_SPACE: "30", CHAIN_CNT: "2", LAST_ANALYZED: "2025-07-25 16:45:00", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
    { OWNER: "LAB01_IAU", TABLE_NAME: "AUDIT_LOG", TABLESPACE_NAME: "LAB01_IAU", STATUS: "VALID", NUM_ROWS: "200", AVG_ROW_LEN: "100", BLOCKS: "20", EMPTY_BLOCKS: "3", AVG_SPACE: "60", CHAIN_CNT: "5", LAST_ANALYZED: "2025-07-26 11:00:00", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
    { OWNER: "LAB01_MDS", TABLE_NAME: "METADATA", TABLESPACE_NAME: "LAB01_MDS", STATUS: "VALID", NUM_ROWS: "80", AVG_ROW_LEN: "90", BLOCKS: "7", EMPTY_BLOCKS: "2", AVG_SPACE: "25", CHAIN_CNT: "1", LAST_ANALYZED: "2025-07-27 09:00:00", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
    { OWNER: "LAB01_STB", TABLE_NAME: "STAGING", TABLESPACE_NAME: "LAB01_STB", STATUS: "VALID", NUM_ROWS: "30", AVG_ROW_LEN: "110", BLOCKS: "3", EMPTY_BLOCKS: "0", AVG_SPACE: "10", CHAIN_CNT: "0", LAST_ANALYZED: "2025-07-27 10:00:00", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
    { OWNER: "LAB01_WLS", TABLE_NAME: "WEBLOGIC", TABLESPACE_NAME: "LAB01_WLS", STATUS: "VALID", NUM_ROWS: "60", AVG_ROW_LEN: "130", BLOCKS: "6", EMPTY_BLOCKS: "1", AVG_SPACE: "15", CHAIN_CNT: "1", LAST_ANALYZED: "2025-07-27 11:00:00", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
    { OWNER: "USERS", TABLE_NAME: "USER_DATA", TABLESPACE_NAME: "USERS", STATUS: "VALID", NUM_ROWS: "10", AVG_ROW_LEN: "70", BLOCKS: "2", EMPTY_BLOCKS: "0", AVG_SPACE: "8", CHAIN_CNT: "0", LAST_ANALYZED: "2025-07-27 12:00:00", PARTITIONED: "NO", TEMPORARY: "N", SECONDARY: "N", NESTED: "NO" },
  ];

  const toggleExpand = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const renderSchemaItem = (item: SchemaItem, level: number = 0): React.ReactNode => {
    const isExpanded = expandedItems.includes(item.name);
    const hasChildren = item.children && item.children.length > 0;
    
    const getIcon = () => {
      switch (item.type) {
        case 'schema':
          return <Database className="h-4 w-4 text-blue-500" />;
        case 'table':
          return <Table className="h-4 w-4 text-emerald-500" />;
        case 'column':
          return item.primaryKey 
            ? <Key className="h-4 w-4 text-amber-500" />
            : <Eye className="h-4 w-4 text-gray-400" />;
        default:
          return null;
      }
    };

    return (
      <div key={item.name} className="group">
        <div 
          className="flex items-center space-x-2 p-2 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-all duration-200"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => hasChildren && toggleExpand(item.name)}
        >
          {hasChildren && (
            <span className="text-gray-400 hover:text-gray-300 transition-colors">
              {isExpanded 
                ? <ChevronDown className="h-4 w-4" />
                : <ChevronRight className="h-4 w-4" />
              }
            </span>
          )}
          {!hasChildren && <div className="w-4" />}
          
          {getIcon()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium truncate ${
                  item.type === 'Utilisateur' ? 'text-blue-400' : 
                  item.type === 'table' ? 'text-emerald-400' : 
                  'text-gray-300'
                } group-hover:text-white transition-colors`}>
                {item.name}
              </span>
              {item.dataType && (
                  <span className="text-xs text-gray-500 group-hover:text-gray-400">
                    {item.dataType}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                  {item.primaryKey && (
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full">
                    PK
                  </span>
                  )}
                  {item.nullable === false && (
                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">
                    NOT NULL
                  </span>
                  )}
                </div>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="border-l border-gray-700/50 ml-4 my-1">
            {item.type === 'table' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-4">
                {item.children!.map(child => (
                  <div
                    key={child.name}
                    className="flex items-center space-x-2 p-2 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    {getIcon()}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300 truncate">
                    {child.name}
                  </span>
                        {child.dataType && (
                          <span className="text-xs text-gray-500">
                            {child.dataType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              item.children!.map(child => renderSchemaItem(child, level + 1))
            )}
          </div>
        )}
      </div>
    );
  };

  // Regroupe les tables par tablespace
  const tablesByTablespace: { [tablespace: string]: OracleTableInfo[] } = {};
  oracleTableInfos.forEach(table => {
    if (!tablesByTablespace[table.TABLESPACE_NAME]) {
      tablesByTablespace[table.TABLESPACE_NAME] = [];
    }
    tablesByTablespace[table.TABLESPACE_NAME].push(table);
  });

  // Filtre + tri des tables
  const filteredTables = useMemo(() => {
    const base = oracleTableInfos.filter(table => {
      const matchesSearch =
        table.TABLE_NAME.toLowerCase().includes(search.toLowerCase()) ||
        table.OWNER.toLowerCase().includes(search.toLowerCase());
      const matchesTablespace = filterTablespace === 'Tous' || table.TABLESPACE_NAME === filterTablespace;
      const matchesOwner = filterOwner === 'Tous' || table.OWNER === filterOwner;
      return matchesSearch && matchesTablespace && matchesOwner;
    });
    const sorted = [...base].sort((a, b) => {
      const va = String(a[sortKey] ?? '').toLowerCase();
      const vb = String(b[sortKey] ?? '').toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [oracleTableInfos, search, filterTablespace, filterOwner, sortKey, sortDir]);

  // Options préparées (potentiellement utiles si l'on migre vers des selects réutilisables)

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 flex flex-row min-h-[720px]">
      {/* Sidebar */}
      <div className="w-72 bg-gray-800/60 border-r border-gray-700/50 p-4 overflow-y-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-300" />
            <span className="text-sm font-semibold text-gray-200">Filtres</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Recherche</label>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-2 top-2.5" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Nom table ou schéma..."
                  className="w-full pl-8 pr-3 py-2 rounded-lg bg-gray-900/60 border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Schéma (OWNER)</label>
              <select
                value={filterOwner}
                                 onChange={e => { setFilterOwner(e.target.value); setActiveTab('tables' as 'tables' | 'schemas' | 'tablespaces'); }}
                className="w-full rounded-lg bg-gray-900/60 border border-gray-700 text-gray-100 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Tous', ...new Set(oracleTableInfos.map(t => t.OWNER))].map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tablespace</label>
              <select
                value={filterTablespace}
                                 onChange={e => { setFilterTablespace(e.target.value); setActiveTab('tables' as 'tables' | 'schemas' | 'tablespaces'); }}
                className="w-full rounded-lg bg-gray-900/60 border border-gray-700 text-gray-100 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {['Tous', ...new Set(oracleTableInfos.map(t => t.TABLESPACE_NAME))].map(ts => (
                  <option key={ts} value={ts}>{ts}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Navigation contextuelle */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Schémas</h4>
            <ul className="space-y-1">
              {[...new Set(oracleTableInfos.map(t => t.OWNER))].map(owner => (
                <li
                  key={owner}
                  onClick={() => { setFilterOwner(owner); setActiveTab('tables' as 'tables' | 'schemas' | 'tablespaces'); }}
                  className={`px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${filterOwner === owner ? 'bg-blue-900/50 text-blue-200' : 'text-gray-300 hover:bg-blue-900/30'}`}
                >
                  {owner}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Tablespaces</h4>
            <ul className="space-y-1">
              {[...new Set(oracleTableInfos.map(t => t.TABLESPACE_NAME))].map(ts => (
                <li
                  key={ts}
                  onClick={() => { setFilterTablespace(ts); setActiveTab('tables' as 'tables' | 'schemas' | 'tablespaces'); }}
                  className={`px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${filterTablespace === ts ? 'bg-emerald-900/40 text-emerald-200' : 'text-gray-300 hover:bg-emerald-900/30'}`}
                >
                  {ts}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Onglets */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-gray-800/60 border border-gray-700 rounded-xl overflow-hidden">
            {([
              { key: 'tables', label: 'Tables', icon: <Table className="h-4 w-4" /> },
              { key: 'schemas', label: 'Schémas', icon: <Database className="h-4 w-4" /> },
                             ...(canViewTablespaces() ? [{ key: 'tablespaces', label: 'Tablespaces', icon: <Database className="h-4 w-4" /> }] : []),
            ] as const).map(t => (
              <button
                key={t.key}
                                 onClick={() => setActiveTab(t.key as 'tables' | 'schemas' | 'tablespaces')}
                className={`px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${activeTab === t.key ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700/60'}`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-400">{filteredTables.length} tables affichées</div>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-3 w-3" />
              <span className={`px-2 py-1 rounded ${
                currentRole === UserRole.SYSTEM ? 'bg-red-900/40 text-red-200' :
                currentRole === UserRole.ADMIN ? 'bg-orange-900/40 text-orange-200' :
                'bg-gray-700/40 text-gray-300'
              }`}>
                {currentRole.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Vue Tables */}
        {activeTab === 'tables' && (
          <div className="rounded-xl border border-purple-700/40 bg-purple-950/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-purple-50">
                <thead className="bg-purple-900/40">
                  <tr>
                    {[
                      { key: 'TABLE_NAME', label: 'Table' },
                      { key: 'OWNER', label: 'Schéma' },
                      { key: 'TABLESPACE_NAME', label: 'Tablespace' },
                      { key: 'STATUS', label: 'Statut' },
                      { key: 'NUM_ROWS', label: 'Lignes' },
                      { key: 'LAST_ANALYZED', label: 'Dernière analyse' },
                    ].map(col => (
                      <th
                        key={col.key}
                        onClick={() => {
                          const nextDir = sortKey === (col.key as keyof OracleTableInfo) && sortDir === 'asc' ? 'desc' : 'asc';
                          setSortKey(col.key as keyof OracleTableInfo);
                          setSortDir(nextDir);
                        }}
                        className="text-left px-4 py-3 cursor-pointer select-none whitespace-nowrap"
                      >
                        {col.label} {sortKey === (col.key as keyof OracleTableInfo) ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.map((t) => (
                    <tr key={`${t.OWNER}.${t.TABLE_NAME}`} className="border-t border-purple-900/40 hover:bg-purple-900/20">
                      <td className="px-4 py-2 font-semibold">{t.TABLE_NAME}</td>
                      <td className="px-4 py-2 text-purple-200">{t.OWNER}</td>
                      <td className="px-4 py-2"><span className="px-2 py-0.5 rounded bg-blue-800 text-blue-100 text-xs">{t.TABLESPACE_NAME}</span></td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.STATUS === 'VALID' ? 'bg-emerald-700 text-emerald-100' : 'bg-red-700 text-red-100'}`}>{t.STATUS}</span>
                      </td>
                      <td className="px-4 py-2">{t.NUM_ROWS}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{t.LAST_ANALYZED}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vue Schémas */}
        {activeTab === 'schemas' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...new Set(oracleTableInfos.map(t => t.OWNER))].map(owner => {
              const count = oracleTableInfos.filter(t => t.OWNER === owner).length;
              const spaces = [...new Set(oracleTableInfos.filter(t => t.OWNER === owner).map(t => t.TABLESPACE_NAME))];
              return (
                <div key={owner} className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 shadow hover:shadow-lg transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-300" />
                      <span className="font-semibold text-blue-100 text-lg">{owner}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-800 text-blue-100 text-xs">{count} tables</span>
                  </div>
                  <div className="text-xs text-blue-100">Tablespaces: {spaces.join(', ')}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Vue Tablespaces - Visible uniquement pour les administrateurs */}
        {activeTab === 'tablespaces' && canViewTablespaces() && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchemaData[0].children?.map(ts => (
              <div key={ts.name} className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 shadow hover:shadow-lg transition">
                <div className="flex items-center mb-2">
                  <Database className="h-5 w-5 text-emerald-300 mr-2" />
                  <span className="font-semibold text-emerald-100 text-lg">{ts.name}</span>
                </div>
                <ul className="text-sm text-emerald-100 space-y-1">
                  {ts.children?.map(attr => (
                    <li key={attr.name} className="flex items-center">
                      <span className="mr-2">•</span> {attr.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Message d'accès refusé pour les tablespaces */}
        {activeTab === 'tablespaces' && !canViewTablespaces() && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Lock className="h-16 w-16 text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Accès Restreint</h3>
            <p className="text-gray-400 mb-4">
              Vous n'avez pas les permissions nécessaires pour voir les tablespaces.
            </p>
            <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400">
                Rôle actuel: <span className="text-gray-300 font-medium">{currentRole.toUpperCase()}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Privilèges requis: <span className="text-orange-300 font-medium">ADMIN</span> ou <span className="text-red-300 font-medium">SYSTEM</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchemaExplorer;