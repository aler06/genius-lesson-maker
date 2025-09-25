import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ExerciseRequestModel } from '../model/exercise-request.model';
import { ExerciseResponse } from '../model/exercise-response.model';
import { ExerciseByIdRequestModel } from '../model/exercise-by-id-request.model';
import { ExerciseUpdateRequestModel } from '../model/exercise-update-request.model';

class ExerciseService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
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

    // Add response interceptor to handle errors
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
   * Generate a new exercise
   */
  async generateExercise(exerciseData: ExerciseRequestModel): Promise<ExerciseResponse> {
    try {
      const response: AxiosResponse<ExerciseResponse> = await this.api.post('/exercise-generator', exerciseData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al generar el ejercicio';
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Get user exercises
   */
  async getUserExercises(userId: string): Promise<ExerciseResponse[]> {
    try {
      const response: AxiosResponse<ExerciseResponse[]> = await this.api.get('/exercise-generator/my-exercises', {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al obtener los ejercicios';
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Get exercise by ID
   */
  async getExerciseById(exerciseId: string, userId: string): Promise<ExerciseResponse> {
    try {
      const response: AxiosResponse<ExerciseResponse> = await this.api.get('/exercise-generator/exercise', {
        params: { exerciseId, userId }
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al obtener el ejercicio';
        if (error.response?.status === 404) {
          throw new Error('Ejercicio no encontrado');
        }
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Delete exercise
   */
  async deleteExercise(exerciseData: ExerciseByIdRequestModel): Promise<void> {
    try {
      await this.api.delete('/exercise-generator/exercise', {
        data: exerciseData
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al eliminar el ejercicio';
        if (error.response?.status === 404) {
          throw new Error('Ejercicio no encontrado');
        }
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
  }

  /**
   * Update exercise
   */
  async updateExercise(exerciseData: ExerciseUpdateRequestModel): Promise<ExerciseResponse> {
    try {
      const response: AxiosResponse<ExerciseResponse> = await this.api.put('/exercise-generator/exercise', exerciseData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Error al actualizar el ejercicio';
        if (error.response?.status === 404) {
          throw new Error('Ejercicio no encontrado');
        }
        throw new Error(Array.isArray(message) ? message.join(', ') : message);
      }
      throw new Error('Error de conexión');
    }
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
}

export const exerciseService = new ExerciseService();
