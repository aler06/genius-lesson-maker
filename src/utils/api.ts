import { API_ENDPOINTS } from '@/constants/app';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Default headers for API requests
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// API request configuration
const DEFAULT_CONFIG: RequestInit = {
  headers: DEFAULT_HEADERS,
  credentials: 'include', // Include cookies for authentication
};

/**
 * Makes an API request with proper error handling
 */
export const apiRequest = async (
  endpoint: string, 
  config: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const requestConfig: RequestInit = {
    ...DEFAULT_CONFIG,
    ...config,
    headers: {
      ...DEFAULT_HEADERS,
      ...config.headers,
    },
  };

  try {
    const response = await fetch(url, requestConfig);
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    
    // Check if it's a network error (CORS, server down, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión: Verifica que el backend esté ejecutándose y configurado correctamente para CORS.');
    }
    
    throw new Error('Error de conexión con el servidor.');
  }
};

/**
 * Validates a session by access code
 */
export const validateSession = async (accessCode: string) => {
  const response = await apiRequest(`${API_ENDPOINTS.sessionJoin}/${accessCode}`, {
    method: 'GET',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Código de sesión no válido o sesión no encontrada');
    }
    if (response.status === 0) {
      throw new Error('Error de CORS: Verifica la configuración del servidor');
    }
    throw new Error(`Error del servidor: ${response.status}`);
  }

  return response.json();
};

/**
 * Gets the WebSocket URL for sessions
 */
export const getWebSocketUrl = (): string => {
  const wsUrl = import.meta.env.VITE_WS_URL || API_BASE_URL;
  // Remove http/https and replace with ws/wss for WebSocket connection
  const wsProtocol = wsUrl.startsWith('https') ? 'wss' : 'ws';
  const wsHost = wsUrl.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${wsHost}`;
};
