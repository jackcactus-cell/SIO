import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type DriverMode = 'thin' | 'thick';

export interface OracleConnectionConfig {
	host: string;
	port: number;
	serviceName: string;
	username: string;
	password: string;
	driverMode: DriverMode;
}

export interface OracleConnectionState {
	isConfigured: boolean;
	isConnected: boolean;
	testing: boolean;
	lastMessage?: string;
	config?: OracleConnectionConfig;
	error?: string;
}

interface OracleContextValue extends OracleConnectionState {
	setConfig: (cfg: OracleConnectionConfig) => void;
	testAndSave: (cfg?: OracleConnectionConfig) => Promise<boolean>;
	clearConfig: () => void;
	testConnection: (cfg: OracleConnectionConfig) => Promise<{ success: boolean; message?: string; error?: string }>;
}

const OracleConnectionContext = createContext<OracleContextValue | undefined>(undefined);

export const OracleConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [state, setState] = useState<OracleConnectionState>(() => {
		try {
			const saved = localStorage.getItem('oracle_connection_config');
			if (saved) {
				const cfg = JSON.parse(saved);
				return { isConfigured: true, isConnected: false, testing: false, config: cfg };
			}
		} catch (error) {
			console.error('Erreur lors du chargement de la configuration Oracle:', error);
		}
		return { isConfigured: false, isConnected: false, testing: false };
	});

	const setConfig = useCallback((cfg: OracleConnectionConfig) => {
		setState(prev => ({ ...prev, config: cfg, isConfigured: true, error: undefined }));
	}, []);

	const clearConfig = useCallback(() => {
		localStorage.removeItem('oracle_connection_config');
		setState({ isConfigured: false, isConnected: false, testing: false });
	}, []);

	const testConnection = useCallback(async (cfg: OracleConnectionConfig): Promise<{ success: boolean; message?: string; error?: string }> => {
		try {
			const backendUrl = (import.meta as any).env?.VITE_BACKEND_PY_URL || 'http://localhost:8000';
			const response = await fetch(`${backendUrl}/api/oracle/test-connection`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					host: cfg.host,
					port: Number(cfg.port),
					service_name: cfg.serviceName,
					username: cfg.username,
					password: cfg.password,
					driver_mode: cfg.driverMode
				})
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				return {
					success: false,
					error: errorData.detail || errorData.error || `Erreur HTTP ${response.status}`
				};
			}

			const data = await response.json();
			return {
				success: data.success || false,
				message: data.message,
				error: data.error
			};
		} catch (error: any) {
			return {
				success: false,
				error: error?.message || 'Erreur de connexion au serveur backend'
			};
		}
	}, []);

	const testAndSave = useCallback(async (cfg?: OracleConnectionConfig) => {
		const toTest = cfg || state.config;
		if (!toTest) {
			setState(prev => ({ ...prev, error: 'Aucune configuration Oracle fournie' }));
			return false;
		}

		setState(prev => ({ ...prev, testing: true, lastMessage: undefined, error: undefined }));

		try {
			// Test de connexion simple
			const testResult = await testConnection(toTest);
			
			if (testResult.success) {
				// Si le test réussit, initialiser le pool
				const base = (import.meta as any).env?.VITE_BACKEND_PY_URL || 'http://localhost:8000';
				
				try {
					// Initialiser le pool
					const initRes = await fetch(`${base}/api/oracle/init-pool`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							host: toTest.host,
							port: Number(toTest.port),
							service_name: toTest.serviceName,
							username: toTest.username,
							password: toTest.password,
							driver_mode: toTest.driverMode,
							min_sessions: 1,
							max_sessions: 5,
							increment: 1
						})
					});

					if (initRes.ok) {
						// Sauvegarder la configuration
						localStorage.setItem('oracle_connection_config', JSON.stringify(toTest));
						setState(prev => ({ 
							...prev, 
							isConfigured: true, 
							isConnected: true, 
							testing: false, 
							lastMessage: 'Connexion Oracle OK', 
							config: toTest,
							error: undefined
						}));
						return true;
					} else {
						const err = await initRes.json().catch(() => ({}));
						setState(prev => ({ 
							...prev, 
							isConfigured: true, 
							isConnected: false, 
							testing: false, 
							lastMessage: err?.detail || 'Échec d\'initialisation du pool Oracle',
							error: err?.detail || 'Échec d\'initialisation du pool Oracle'
						}));
						return false;
					}
				} catch (poolError: any) {
					// Si l'initialisation du pool échoue, on garde quand même la connexion de test
					localStorage.setItem('oracle_connection_config', JSON.stringify(toTest));
					setState(prev => ({ 
						...prev, 
						isConfigured: true, 
						isConnected: true, 
						testing: false, 
						lastMessage: 'Connexion Oracle OK (pool non initialisé)', 
						config: toTest,
						error: undefined
					}));
					return true;
				}
			} else {
				setState(prev => ({ 
					...prev, 
					isConfigured: true, 
					isConnected: false, 
					testing: false, 
					lastMessage: testResult.error || 'Test de connexion échoué',
					error: testResult.error || 'Test de connexion échoué'
				}));
				return false;
			}
		} catch (e: any) {
			const errorMessage = e?.message || 'Erreur inconnue';
			setState(prev => ({ 
				...prev, 
				isConfigured: true, 
				isConnected: false, 
				testing: false, 
				lastMessage: errorMessage,
				error: errorMessage
			}));
			return false;
		}
	}, [state.config, testConnection]);

	const value = useMemo<OracleContextValue>(() => ({
		...state,
		setConfig,
		testAndSave,
		clearConfig,
		testConnection
	}), [state, setConfig, testAndSave, clearConfig, testConnection]);

	return (
		<OracleConnectionContext.Provider value={value}>
			{children}
		</OracleConnectionContext.Provider>
	);
};

export const useOracleConnection = (): OracleContextValue => {
	const ctx = useContext(OracleConnectionContext);
	if (!ctx) throw new Error('useOracleConnection doit être utilisé dans OracleConnectionProvider');
	return ctx;
};


