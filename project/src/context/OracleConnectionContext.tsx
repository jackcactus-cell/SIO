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
}

interface OracleContextValue extends OracleConnectionState {
	setConfig: (cfg: OracleConnectionConfig) => void;
	testAndSave: (cfg?: OracleConnectionConfig) => Promise<boolean>;
	clearConfig: () => void;
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
		} catch {}
		return { isConfigured: false, isConnected: false, testing: false };
	});

	const setConfig = useCallback((cfg: OracleConnectionConfig) => {
		setState(prev => ({ ...prev, config: cfg, isConfigured: true }));
	}, []);

	const clearConfig = useCallback(() => {
		localStorage.removeItem('oracle_connection_config');
		setState({ isConfigured: false, isConnected: false, testing: false });
	}, []);

	const testAndSave = useCallback(async (cfg?: OracleConnectionConfig) => {
		const toTest = cfg || state.config;
		if (!toTest) return false;
		setState(prev => ({ ...prev, testing: true, lastMessage: undefined }));

		try {
			const base = (import.meta as any).env?.VITE_ORACLE_API_URL || 'http://localhost:8002';

			// 1) Initialiser le pool
			const initRes = await fetch(`${base}/init`, {
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
			if (!initRes.ok) {
				const err = await initRes.json().catch(() => ({} as any));
				setState(prev => ({ ...prev, isConfigured: true, isConnected: false, testing: false, lastMessage: err?.detail || 'Échec d\'initialisation Oracle' }));
				return false;
			}

			// 2) Ping
			const pingRes = await fetch(`${base}/ping`);
			const pingJson = await pingRes.json();
			const ok = pingRes.ok && pingJson?.status === 'ok';

			if (ok) {
				localStorage.setItem('oracle_connection_config', JSON.stringify(toTest));
				setState(prev => ({ ...prev, isConfigured: true, isConnected: true, testing: false, lastMessage: 'Connexion Oracle OK', config: toTest }));
				return true;
			} else {
				setState(prev => ({ ...prev, isConfigured: true, isConnected: false, testing: false, lastMessage: pingJson?.detail || 'Ping Oracle échoué' }));
				return false;
			}
		} catch (e: any) {
			setState(prev => ({ ...prev, isConfigured: true, isConnected: false, testing: false, lastMessage: e?.message || 'Erreur inconnue' }));
			return false;
		}
	}, [state.config]);

	const value = useMemo<OracleContextValue>(() => ({
		...state,
		setConfig,
		testAndSave,
		clearConfig
	}), [state, setConfig, testAndSave, clearConfig]);

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


