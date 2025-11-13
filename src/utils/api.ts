import { API_ENDPOINTS } from '@/constants/app';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Headers por defecto para todas las peticiones
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Configuración base de peticiones (incluye cookies para auth)
const DEFAULT_CONFIG: RequestInit = {
  headers: DEFAULT_HEADERS,
  credentials: 'include',
};

// Función principal para hacer peticiones HTTP con autenticación automática
export const apiRequest = async (
  endpoint: string, 
  config: RequestInit = {}
): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Incluir token de autorización si existe
  const token = localStorage.getItem('token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  
  const requestConfig: RequestInit = {
    ...DEFAULT_CONFIG,
    ...config,
    headers: {
      ...DEFAULT_HEADERS,
      ...authHeaders,
      ...config.headers,
    },
  };

  try {
    const response = await fetch(url, requestConfig);
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    
    // Manejo específico de errores de red/CORS
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión: Verifica que el backend esté ejecutándose y configurado correctamente para CORS.');
    }
    
    throw new Error('Error de conexión con el servidor.');
  }
};

// Validar si una sesión existe por código de acceso
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

// Generar URL de WebSocket para conexiones en tiempo real
export const getWebSocketUrl = (): string => {
  const wsUrl = import.meta.env.VITE_WS_URL || API_BASE_URL;
  // Convertir HTTP a WS y HTTPS a WSS
  const wsProtocol = wsUrl.startsWith('https') ? 'wss' : 'ws';
  const wsHost = wsUrl.replace(/^https?:\/\//, '');
  return `${wsProtocol}://${wsHost}`;
};
