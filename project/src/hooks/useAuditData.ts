import { useState, useEffect } from 'react';

interface AuditRecord {
  _id: string;
  OS_USERNAME: string;
  DBUSERNAME: string;
  ACTION_NAME: string;
  OBJECT_NAME: string;
  EVENT_TIMESTAMP: string;
  CLIENT_PROGRAM_NAME: string;
  TERMINAL: string;
  AUTHENTICATION_TYPE: string;
  OBJECT_SCHEMA: string;
  USERHOST: string;
}

interface AuditResponse {
  status: string;
  data: AuditRecord[];
  source: 'mongodb' | 'default';
}

export const useAuditData = () => {
  const [auditData, setAuditData] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'mongodb' | 'default'>('default');

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/audit/raw');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: AuditResponse = await response.json();
      
      if (result.status === 'success') {
        setAuditData(result.data);
        setSource(result.source);
        setError(null);
      } else {
        throw new Error('Failed to fetch audit data');
      }
    } catch (err) {
      console.error('Error fetching audit data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Utiliser des données par défaut en cas d'erreur
      setAuditData(getDefaultAuditData());
      setSource('default');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
    
    // Actualiser les données toutes les 30 secondes
    const interval = setInterval(fetchAuditData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { auditData, loading, error, source, refetch: fetchAuditData };
};

// Données par défaut pour le fallback
const getDefaultAuditData = (): AuditRecord[] => [
  {
    _id: 'default_1',
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'EMPLOYEES',
    EVENT_TIMESTAMP: new Date(Date.now() - 3600000).toISOString(),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'WORKSTATION01',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'HR',
    USERHOST: '192.168.1.100'
  },
  {
    _id: 'default_2',
    OS_USERNAME: 'ATCHEMI',
    DBUSERNAME: 'ATCHEMI',
    ACTION_NAME: 'INSERT',
    OBJECT_NAME: 'ORDERS',
    EVENT_TIMESTAMP: new Date(Date.now() - 2700000).toISOString(),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'WORKSTATION02',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SALES',
    USERHOST: '192.168.1.101'
  },
  {
    _id: 'default_3',
    OS_USERNAME: 'SYSTEM',
    DBUSERNAME: 'SYSTEM',
    ACTION_NAME: 'UPDATE',
    OBJECT_NAME: 'CUSTOMERS',
    EVENT_TIMESTAMP: new Date(Date.now() - 1800000).toISOString(),
    CLIENT_PROGRAM_NAME: 'SQL*Plus',
    TERMINAL: 'SERVER01',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'CRM',
    USERHOST: '192.168.1.102'
  },
  {
    _id: 'default_4',
    OS_USERNAME: 'SYS',
    DBUSERNAME: 'SYS',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'DBA_USERS',
    EVENT_TIMESTAMP: new Date(Date.now() - 900000).toISOString(),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'ADMIN_CONSOLE',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'SYS',
    USERHOST: '192.168.1.103'
  },
  {
    _id: 'default_5',
    OS_USERNAME: 'datchemi',
    DBUSERNAME: 'datchemi',
    ACTION_NAME: 'DELETE',
    OBJECT_NAME: 'TEMP_TABLE',
    EVENT_TIMESTAMP: new Date(Date.now() - 300000).toISOString(),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'WORKSTATION01',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'HR',
    USERHOST: '192.168.1.100'
  },
  {
    _id: 'default_6',
    OS_USERNAME: 'ADMIN',
    DBUSERNAME: 'ADMIN',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'PRODUCTS',
    EVENT_TIMESTAMP: new Date(Date.now() - 600000).toISOString(),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'ADMIN_WORKSTATION',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'INVENTORY',
    USERHOST: '192.168.1.104'
  },
  {
    _id: 'default_7',
    OS_USERNAME: 'SMART2DADMIN',
    DBUSERNAME: 'SMART2DADMIN',
    ACTION_NAME: 'INSERT',
    OBJECT_NAME: 'AUDIT_LOG',
    EVENT_TIMESTAMP: new Date(Date.now() - 1200000).toISOString(),
    CLIENT_PROGRAM_NAME: 'Custom App',
    TERMINAL: 'APP_SERVER',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'AUDIT',
    USERHOST: '192.168.1.105'
  },
  {
    _id: 'default_8',
    OS_USERNAME: 'ANALYST',
    DBUSERNAME: 'ANALYST',
    ACTION_NAME: 'SELECT',
    OBJECT_NAME: 'SALES_HISTORY',
    EVENT_TIMESTAMP: new Date(Date.now() - 1500000).toISOString(),
    CLIENT_PROGRAM_NAME: 'SQL Developer',
    TERMINAL: 'ANALYST_DESK',
    AUTHENTICATION_TYPE: 'DATABASE',
    OBJECT_SCHEMA: 'REPORTING',
    USERHOST: '192.168.1.106'
  }
];
