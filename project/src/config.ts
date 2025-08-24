// Configuration des URLs du backend
export const config = {
  backendUrl: import.meta.env?.VITE_BACKEND_URL || 'http://localhost:4000',
  backendPyUrl: import.meta.env?.VITE_BACKEND_PY_URL || 'http://localhost:8000',
  backendLlmUrl: import.meta.env?.VITE_BACKEND_LLM_URL || 'http://localhost:8001'
};


