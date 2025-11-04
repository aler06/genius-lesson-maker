import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  initializeScore,
  submitAnswer,
  completeSession,
  getSessionScores,
  getStudentScore,
  getMyScores,
  getUserScores,
  deleteScore,
  checkSessionCompletion,
  markSessionAsCompleted,
} from '../services/session-scores.service';
import {
  InitializeScoreRequest,
  SubmitAnswerRequest,
  CompleteSessionRequest,
  SessionScore,
  SessionScoresSummary,
} from '../types/session-scores.types';

/**
 * Hook for managing session scores
 */
export const useSessionScores = (sessionId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query to get all scores for a session (for teachers)
  const {
    data: sessionScores,
    isLoading: isLoadingScores,
    error: scoresError,
    refetch: refetchScores,
  } = useQuery<SessionScoresSummary | null>({
    queryKey: ['session-scores', sessionId],
    queryFn: () => getSessionScores(sessionId!),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds - refresh frequently for live updates
    retry: false, // Don't retry if endpoint doesn't exist
  });

  // Query to get student's own score
  const {
    data: studentScore,
    isLoading: isLoadingStudentScore,
    error: studentScoreError,
    refetch: refetchStudentScore,
  } = useQuery<SessionScore | null>({
    queryKey: ['student-score', sessionId],
    queryFn: () => getStudentScore(sessionId!),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
    retry: false, // Don't retry if endpoint doesn't exist
  });

  // Mutation to initialize score
  const initializeScoreMutation = useMutation({
    mutationFn: (request: InitializeScoreRequest) => initializeScore(request),
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(['student-score', data.sessionId], data);
        console.log('Score initialized successfully:', data);
      } else {
        console.log('Score initialization skipped (endpoint not available)');
      }
    },
    onError: (error) => {
      console.error('Error initializing score:', error);
      // Show toast for real errors (not 404)
      if (error instanceof Error && !error.message.includes('404')) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  // Mutation to submit an answer
  const submitAnswerMutation = useMutation({
    mutationFn: (request: SubmitAnswerRequest) => submitAnswer(request),
    onSuccess: (data) => {
      if (data) {
        // Update the student score cache with the scoreRecord from the response
        queryClient.setQueryData(['student-score', data.scoreRecord.sessionId], data.scoreRecord);
        console.log('Answer submitted successfully:', data);
        console.log('Current score:', data.scoreRecord.puntajeFinal, '/', 20);
      } else {
        console.log('Answer submission skipped (endpoint not available)');
      }
    },
    onError: (error) => {
      console.error('Error submitting answer:', error);
      // Show toast for real errors (not 404)
      if (error instanceof Error && !error.message.includes('404')) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  // Mutation to complete session
  const completeSessionMutation = useMutation({
    mutationFn: (request: CompleteSessionRequest) => completeSession(request),
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.setQueryData(['student-score', data.sessionId], data);
        
        // Mark session as completed in localStorage
        markSessionAsCompleted(
          data.sessionId,
          data.correo,
          data.puntajeFinal,
          data.tiempoTotal,
          data.respuestas
        );
        
        // Invalidate session scores to refresh teacher view
        queryClient.invalidateQueries({ queryKey: ['session-scores', data.sessionId] });
        
        toast({
          title: '¡Sesión completada!',
          description: `Puntaje final: ${data.puntajeFinal.toFixed(1)} puntos`,
        });
      } else {
        console.log('Session completion skipped (endpoint not available)');
        // Still mark as completed in localStorage even if backend fails
        markSessionAsCompleted(
          variables.sessionId,
          variables.correo,
          variables.puntajeFinal,
          variables.tiempoTotal,
          variables.respuestas
        );
        // Still show a completion message even if backend doesn't track scores
        toast({
          title: '¡Sesión completada!',
          description: 'Has terminado todos los ejercicios.',
        });
      }
    },
    onError: (error, variables) => {
      console.error('Error completing session:', error);
      // Even on error, mark as completed in localStorage to prevent re-entry
      markSessionAsCompleted(
        variables.sessionId,
        variables.correo,
        variables.puntajeFinal,
        variables.tiempoTotal,
        variables.respuestas
      );
      // Show toast for real errors (not 404)
      if (error instanceof Error && !error.message.includes('404')) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    },
  });

  // Mutation to delete score
  const deleteScoreMutation = useMutation({
    mutationFn: (scoreId: string) => deleteScore(scoreId),
    onSuccess: (_, scoreId) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['session-scores'] });
      
      toast({
        title: 'Puntaje eliminado',
        description: 'El puntaje ha sido eliminado exitosamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'No se pudo eliminar el puntaje',
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    sessionScores,
    studentScore,
    
    // Loading states
    isLoadingScores,
    isLoadingStudentScore,
    
    // Errors
    scoresError,
    studentScoreError,
    
    // Refetch functions
    refetchScores,
    refetchStudentScore,
    
    // Mutations
    initializeScore: initializeScoreMutation.mutate,
    submitAnswer: submitAnswerMutation.mutate,
    completeSession: completeSessionMutation.mutate,
    deleteScore: deleteScoreMutation.mutate,
    
    // Mutation states
    isInitializing: initializeScoreMutation.isPending,
    isSubmitting: submitAnswerMutation.isPending,
    isCompleting: completeSessionMutation.isPending,
    isDeleting: deleteScoreMutation.isPending,
    
    // Utility functions
    checkSessionCompletion,
  };
};

/**
 * Hook for getting user's scores across all sessions
 */
export const useMyScores = () => {
  const { toast } = useToast();

  const {
    data: myScores,
    isLoading,
    error,
    refetch,
  } = useQuery<SessionScore[]>({
    queryKey: ['my-scores'],
    queryFn: getMyScores,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    myScores,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook for getting a specific user's scores (for teachers/admins)
 */
export const useUserScores = (userId?: string) => {
  const {
    data: userScores,
    isLoading,
    error,
    refetch,
  } = useQuery<SessionScore[]>({
    queryKey: ['user-scores', userId],
    queryFn: () => getUserScores(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    userScores,
    isLoading,
    error,
    refetch,
  };
};
