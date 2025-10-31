import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  LoginResponse, 
  LoginRequestDto, 
  UserProfile, 
  RefreshTokenResponse, 
  ValidateTokenResponse 
} from '../model/auth-response.model';

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1/users',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequestDto): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', credentials);
      
      // Store token and user data
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al iniciar sesión';
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Register new user
   */
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
  }): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/register', userData);
      
      // Store token and user data
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al registrar usuario';
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response: AxiosResponse<UserProfile> = await this.api.get('/auth/profile');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al obtener el perfil';
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    try {
      const response: AxiosResponse<RefreshTokenResponse> = await this.api.post('/auth/refresh');
      
      // Update stored token
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al renovar el token';
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Validate current token
   */
  async validateToken(): Promise<ValidateTokenResponse> {
    try {
      const response: AxiosResponse<ValidateTokenResponse> = await this.api.get('/auth/validate-token');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Token inválido';
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Guest login - Get temporary token for non-registered users
   */
  async guestLogin(guestData: {
    nombre: string;
    correo?: string;
  }): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/guest', guestData);
      
      // Store token and user data (same as regular login)
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al iniciar sesión como invitado';
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get stored user data
   */
  getStoredUser(): UserProfile | null {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const authService = new AuthService();
