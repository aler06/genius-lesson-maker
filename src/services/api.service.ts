import { 
  ExerciseRequestDTO, 
  ExerciseResponseDto, 
  ExerciseByIdRequestDTO, 
  ExerciseUpdateRequestDTO,
  UserExerciseRequestDTO,
  UserRequestDTO,
  UserResponseDTO 
} from '../types/dtos';

// Servicio centralizado para todas las peticiones HTTP de la API
class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  // Método helper para hacer peticiones HTTP con manejo de errores
  private async makeRequest<T>(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return method === 'DELETE' ? undefined as T : response.json();
  }

  // Endpoints de ejercicios - CRUD completo
  async createExercise(data: ExerciseRequestDTO): Promise<ExerciseResponseDto> {
    return this.makeRequest<ExerciseResponseDto>('/exercises', 'POST', data);
  }

  async getExerciseById(data: ExerciseByIdRequestDTO): Promise<ExerciseResponseDto> {
    return this.makeRequest<ExerciseResponseDto>(`/exercises/${data.exerciseId}?userId=${data.userId}`);
  }

  async updateExercise(data: ExerciseUpdateRequestDTO): Promise<ExerciseResponseDto> {
    return this.makeRequest<ExerciseResponseDto>(`/exercises/${data.exerciseId}`, 'PUT', data);
  }

  async deleteExercise(data: ExerciseByIdRequestDTO): Promise<void> {
    return this.makeRequest<void>(`/exercises/${data.exerciseId}`, 'DELETE', { userId: data.userId });
  }

  async getUserExercises(data: UserExerciseRequestDTO): Promise<ExerciseResponseDto[]> {
    return this.makeRequest<ExerciseResponseDto[]>(`/exercises/user/${data.userId}`);
  }

  // Endpoints de usuarios
  async createUser(data: UserRequestDTO): Promise<UserResponseDTO> {
    return this.makeRequest<UserResponseDTO>('/users', 'POST', data);
  }

  async getUser(userId: string): Promise<UserResponseDTO> {
    return this.makeRequest<UserResponseDTO>(`/users/${userId}`);
  }

  // Endpoints de autenticación
  async login(email: string, password: string): Promise<{ user: UserResponseDTO; token: string }> {
    return this.makeRequest<{ user: UserResponseDTO; token: string }>('/auth/login', 'POST', { email, password });
  }

  async register(data: UserRequestDTO): Promise<{ user: UserResponseDTO; token: string }> {
    return this.makeRequest<{ user: UserResponseDTO; token: string }>('/auth/register', 'POST', data);
  }
}

export const apiService = new ApiService();