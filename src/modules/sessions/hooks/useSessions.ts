import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/utils/api';

// Session interface matching exact backend response
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
  // Updated to support multiple exercises
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
  accessCode: string;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  duration: number;
  startTime?: string;
  endTime?: string;
  participants: any[];
  maxParticipants: number;
  shareableLink: string;
  allowLateJoin: boolean;
  showLeaderboard: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a session
interface CreateSessionRequest {
  teacherId: string;
  exerciseIds: string[];
  name: string;
  description?: string;
  duration: number;
  maxParticipants?: number;
  allowLateJoin?: boolean;
  showLeaderboard?: boolean;
}

// Mock API functions - replace with actual API calls
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
    createdAt: '2025-09-27T03:18:09.711Z',
    updatedAt: '2025-09-27T03:43:39.056Z'
  }
];

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
    // Fallback to mock data if API fails
    console.warn('API call failed, using mock data:', error);
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockSessions;
  }
};

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
  // TODO: Implement real API call
  throw new Error('Start session not implemented yet');
};

const endSession = async (sessionId: string): Promise<Session> => {
  // TODO: Implement real API call
  throw new Error('End session not implemented yet');
};

const deleteSession = async (sessionId: string): Promise<void> => {
  // TODO: Implement real API call
  throw new Error('Delete session not implemented yet');
};

export const useSessions = (teacherId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch sessions query
  const {
    data: sessions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['sessions', teacherId],
    queryFn: () => fetchSessions(teacherId!),
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (newSession) => {
      // Optimistically update the cache
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