import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/utils/api';

// Interfaz de sesión que coincide exactamente con la respuesta del backend
interface Session {
  id: string;
  teacher: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  // Soporte para múltiples ejercicios por sesión
  exercises: {
    id: string;
    game: string;
    questions: any[];
    word?: string;
    hint?: string;
    cards: any[];
    createdAt: string;
    updatedAt: string;
  }[];
  name: string;
  description?: string;
  // accessCode ahora es opcional porque las sesiones dinámicas no tienen código
  accessCode?: string;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  duration: number;
  startTime?: string;
  endTime?: string;
  participants: any[];
  maxParticipants: number;
  // Para sesiones dinámicas, el backend no genera shareableLink
  shareableLink?: string;
  allowLateJoin: boolean;
  showLeaderboard: boolean;
  // Tipo de sesión: 'normal' (por defecto) o 'dynamic' (solo profesor)
  sessionType: 'normal' | 'dynamic';
  createdAt: string;
  updatedAt: string;
}

// Interfaz para crear una sesión
interface CreateSessionRequest {
  teacherId: string;
  exerciseIds: string[];
  name: string;
  description?: string;
  duration: number;
  maxParticipants?: number;
  allowLateJoin?: boolean;
  showLeaderboard?: boolean;
  // Opcional para compatibilidad: si no se envía, el backend asume 'normal'
  sessionType?: 'normal' | 'dynamic';
}

// Datos mock para fallback cuando la API no está disponible
const mockSessions: Session[] = [
  {
    id: '68d75771162164a7a9e24ba7',
    teacher: {
      _id: '68d08666310fa90890c2f346',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@gmail.com',
      role: 'teacher',
      isActive: true,
      createdAt: '2025-09-21T23:12:38.717Z',
      updatedAt: '2025-09-21T23:12:38.717Z'
    },
    exercises: [
      {
        id: '68d5d193c60063d50dd9dc5d',
        game: 'hangman',
        questions: [],
        word: 'TCP/IP',
        hint: 'Conjunto de protocolos fundamentales para la comunicación en Internet',
        cards: [],
        createdAt: '2025-09-25T23:34:43.204Z',
        updatedAt: '2025-09-26T01:17:31.133Z'
      },
      {
        id: '68d5d18ac60063d50dd9dc5b',
        game: 'hangman',
        questions: [],
        word: 'polimorfismo',
        hint: 'Capacidad de un objeto para tomar muchas formas diferentes en programación orientada a objetos.',
        cards: [],
        createdAt: '2025-09-25T23:34:34.274Z',
        updatedAt: '2025-09-25T23:34:34.274Z'
      }
    ],
    name: 'Redes - Sesión 1',
    description: 'Sesión interactiva sobre Redes',
    accessCode: 'LXQ7TM',
    status: 'finished',
    duration: 30,
    startTime: '2025-09-27T03:26:14.078Z',
    endTime: '2025-09-27T03:43:39.053Z',
    participants: [],
    maxParticipants: 30,
    shareableLink: 'http://localhost:3000/session/join/LXQ7TM',
    allowLateJoin: true,
    showLeaderboard: true,
    sessionType: 'normal',
    createdAt: '2025-09-27T03:18:09.711Z',
    updatedAt: '2025-09-27T03:43:39.056Z'
  }
];

// Obtener sesiones del profesor con fallback a datos mock
const fetchSessions = async (teacherId: string): Promise<Session[]> => {
  try {
    const response = await apiRequest(`/api/v1/sessions/teacher/${teacherId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || 'Error al obtener sesiones'}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Fallback a datos mock si la API falla
    console.warn('API call failed, using mock data:', error);
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSessions;
  }
};

// Crear nueva sesión con múltiples ejercicios
const createSession = async (sessionData: CreateSessionRequest): Promise<Session> => {
  try {
    console.log('Creating session with data:', sessionData);
    
    const response = await apiRequest('/api/v1/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Session creation failed:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al crear la sesión'}`);
    }

    const sessionResponse = await response.json();
    console.log('Session created successfully:', sessionResponse);
    return sessionResponse as Session;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
};

const startSession = async (sessionId: string): Promise<Session> => {
  try {
    console.log('Starting session:', sessionId);
    
    const response = await apiRequest(`/api/v1/sessions/${sessionId}/start`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Session start failed:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al iniciar la sesión'}`);
    }

    const sessionResponse = await response.json();
    console.log('Session started successfully:', sessionResponse);
    return sessionResponse as Session;
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
};

const endSession = async (sessionId: string): Promise<Session> => {
  try {
    console.log('Ending session:', sessionId);
    
    const response = await apiRequest(`/api/v1/sessions/${sessionId}/end`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Session end failed:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al finalizar la sesión'}`);
    }

    const sessionResponse = await response.json();
    console.log('Session ended successfully:', sessionResponse);
    return sessionResponse as Session;
  } catch (error) {
    console.error('Error ending session:', error);
    throw error;
  }
};


const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    console.log('Deleting session:', sessionId);
    
    const response = await apiRequest(`/api/v1/sessions/${sessionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Session delete failed:', response.status, errorText);
      throw new Error(`Error ${response.status}: ${errorText || 'Error al eliminar la sesión'}`);
    }

    console.log('Session deleted successfully');
  } catch (error) {
    console.error('Error deleting session:', error);
    throw error;
  }
};


// Hook principal para gestión de sesiones - CRUD completo con React Query
export const useSessions = (teacherId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para obtener sesiones con cache de 5 minutos
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sessions', teacherId],
    queryFn: () => fetchSessions(teacherId!),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutación para crear sesión con actualización optimista
  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (newSession) => {
      // Actualizar cache optimísticamente
      queryClient.setQueryData(['sessions', teacherId], (old: Session[] = []) => [
        newSession,
        ...old
      ]);
      
      toast({
        title: "¡Sesión creada!",
        description: `La sesión "${newSession.name}" ha sido creada exitosamente.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la sesión",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['sessions', teacherId] });
    }
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: startSession,
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(['sessions', teacherId], (old: Session[] = []) =>
        old.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        )
      );
      
      toast({
        title: "¡Sesión iniciada!",
        description: `La sesión "${updatedSession.name}" ha comenzado.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo iniciar la sesión",
        variant: "destructive",
      });
    }
  });


  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: endSession,
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(['sessions', teacherId], (old: Session[] = []) =>
        old.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        )
      );
      
      toast({
        title: "Sesión finalizada",
        description: `La sesión "${updatedSession.name}" ha terminado.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo finalizar la sesión",
        variant: "destructive",
      });
    }
  });


  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: (_, sessionId) => {
      queryClient.setQueryData(['sessions', teacherId], (old: Session[] = []) =>
        old.filter(session => session.id !== sessionId)
      );
      
      toast({
        title: "Sesión eliminada",
        description: "La sesión ha sido eliminada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la sesión",
        variant: "destructive",
      });
    }
  });

  return {
    sessions,
    isLoading,
    error,
    refetch,
    createSession: createSessionMutation.mutate,
    startSession: startSessionMutation.mutate,
    endSession: endSessionMutation.mutate,
    deleteSession: deleteSessionMutation.mutate,
    isCreating: createSessionMutation.isPending,
    isStarting: startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
  };
};

export type { Session, CreateSessionRequest };