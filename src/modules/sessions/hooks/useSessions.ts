import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Mock data for sessions - replace with actual API calls
interface Session {
  id: string;
  name: string;
  description?: string;
  accessCode: string;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  duration: number;
  startTime?: Date;
  endTime?: Date;
  maxParticipants: number;
  participantCount: number;
  shareableLink: string;
  allowLateJoin: boolean;
  showLeaderboard: boolean;
  createdAt: Date;
  updatedAt: Date;
  exercises: Array<{
    id: string;
    name: string;
    game: string;
  }>;
}

// Mock API functions - replace with actual API calls
const mockSessions: Session[] = [
  {
    id: '1',
    name: 'Sesión de Matemáticas Básicas',
    description: 'Ejercicios de suma y resta para principiantes',
    accessCode: 'MATH01',
    status: 'waiting',
    duration: 30,
    maxParticipants: 25,
    participantCount: 0,
    shareableLink: 'http://localhost:3001/session/join/MATH01',
    allowLateJoin: true,
    showLeaderboard: true,
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    exercises: [
      { id: '1', name: 'Sumas Básicas', game: 'quiz' },
      { id: '2', name: 'Restas Simples', game: 'quiz' }
    ]
  },
  {
    id: '2',
    name: 'Vocabulario en Inglés',
    description: 'Juego del ahorcado con palabras en inglés',
    accessCode: 'ENG123',
    status: 'active',
    duration: 45,
    startTime: new Date('2024-01-15T14:00:00Z'),
    maxParticipants: 30,
    participantCount: 12,
    shareableLink: 'http://localhost:3001/session/join/ENG123',
    allowLateJoin: false,
    showLeaderboard: true,
    createdAt: new Date('2024-01-15T13:30:00Z'),
    updatedAt: new Date('2024-01-15T14:00:00Z'),
    exercises: [
      { id: '3', name: 'Animales en Inglés', game: 'hangman' },
      { id: '4', name: 'Colores Básicos', game: 'hangman' }
    ]
  },
  {
    id: '3',
    name: 'Historia Universal',
    description: 'Preguntas sobre eventos históricos importantes',
    accessCode: 'HIST99',
    status: 'finished',
    duration: 60,
    startTime: new Date('2024-01-14T16:00:00Z'),
    endTime: new Date('2024-01-14T17:00:00Z'),
    maxParticipants: 20,
    participantCount: 18,
    shareableLink: 'http://localhost:3001/session/join/HIST99',
    allowLateJoin: true,
    showLeaderboard: true,
    createdAt: new Date('2024-01-14T15:30:00Z'),
    updatedAt: new Date('2024-01-14T17:00:00Z'),
    exercises: [
      { id: '5', name: 'Edad Media', game: 'quiz' },
      { id: '6', name: 'Revolución Industrial', game: 'quiz' }
    ]
  }
];

const fetchSessions = async (teacherId: string): Promise<Session[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real app, this would be an API call
  // return await api.get(`/sessions?teacherId=${teacherId}`);
  
  return mockSessions;
};

const createSession = async (sessionData: Partial<Session>): Promise<Session> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // In a real app, this would be an API call
  // return await api.post('/sessions', sessionData);
  
  const newSession: Session = {
    id: Date.now().toString(),
    name: sessionData.name || 'Nueva Sesión',
    description: sessionData.description,
    accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    status: 'waiting',
    duration: sessionData.duration || 30,
    maxParticipants: sessionData.maxParticipants || 25,
    participantCount: 0,
    shareableLink: `http://localhost:3001/session/join/${sessionData.accessCode}`,
    allowLateJoin: sessionData.allowLateJoin ?? true,
    showLeaderboard: sessionData.showLeaderboard ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises: sessionData.exercises || []
  };
  
  return newSession;
};

const startSession = async (sessionId: string): Promise<Session> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const session = mockSessions.find(s => s.id === sessionId);
  if (!session) throw new Error('Sesión no encontrada');
  
  return {
    ...session,
    status: 'active',
    startTime: new Date(),
    updatedAt: new Date()
  };
};

const endSession = async (sessionId: string): Promise<Session> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const session = mockSessions.find(s => s.id === sessionId);
  if (!session) throw new Error('Sesión no encontrada');
  
  return {
    ...session,
    status: 'finished',
    endTime: new Date(),
    updatedAt: new Date()
  };
};

const deleteSession = async (sessionId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const index = mockSessions.findIndex(s => s.id === sessionId);
  if (index === -1) throw new Error('Sesión no encontrada');
  
  mockSessions.splice(index, 1);
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

export type { Session };
