import { 
  ExerciseRequestDTO, 
  ExerciseResponseDto, 
  ExerciseByIdRequestDTO, 
  ExerciseUpdateRequestDTO,
  UserExerciseRequestDTO,
  UserRequestDTO,
  UserResponseDTO 
} from '../types/dtos';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  // Exercise endpoints
  async createExercise(data: ExerciseRequestDTO): Promise<ExerciseResponseDto> {
    const response = await fetch(`${this.baseUrl}/exercises`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create exercise: ${response.statusText}`);
    }

    return response.json();
  }

  async getExerciseById(data: ExerciseByIdRequestDTO): Promise<ExerciseResponseDto> {
    const response = await fetch(`${this.baseUrl}/exercises/${data.exerciseId}?userId=${data.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get exercise: ${response.statusText}`);
    }

    return response.json();
  }

  async updateExercise(data: ExerciseUpdateRequestDTO): Promise<ExerciseResponseDto> {
    const response = await fetch(`${this.baseUrl}/exercises/${data.exerciseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update exercise: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteExercise(data: ExerciseByIdRequestDTO): Promise<void> {
    const response = await fetch(`${this.baseUrl}/exercises/${data.exerciseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: data.userId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete exercise: ${response.statusText}`);
    }
  }

  async getUserExercises(data: UserExerciseRequestDTO): Promise<ExerciseResponseDto[]> {
    const response = await fetch(`${this.baseUrl}/exercises/user/${data.userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user exercises: ${response.statusText}`);
    }

    return response.json();
  }

  // User endpoints
  async createUser(data: UserRequestDTO): Promise<UserResponseDTO> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(userId: string): Promise<UserResponseDTO> {
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get user: ${response.statusText}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ user: UserResponseDTO; token: string }> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error(`Failed to login: ${response.statusText}`);
    }

    return response.json();
  }

  async register(data: UserRequestDTO): Promise<{ user: UserResponseDTO; token: string }> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to register: ${response.statusText}`);
    }

    return response.json();
  }
}

export const apiService = new ApiService();