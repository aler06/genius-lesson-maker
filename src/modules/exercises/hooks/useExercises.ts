import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api.service';
import { 
  ExerciseRequestDTO, 
  ExerciseResponseDto, 
  ExerciseByIdRequestDTO,
  ExerciseUpdateRequestDTO,
  UserExerciseRequestDTO 
} from '@/types/dtos';
import { useToast } from '@/hooks/use-toast';

export const useExercises = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user exercises
  const {
    data: exercises,
    isLoading,
    error
  } = useQuery({
    queryKey: ['exercises', userId],
    queryFn: () => userId ? apiService.getUserExercises({ userId }) : Promise.resolve([]),
    enabled: !!userId,
  });

  // Create exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: (data: ExerciseRequestDTO) => apiService.createExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "¡Ejercicio creado!",
        description: "El ejercicio ha sido generado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error al crear ejercicio",
        description: error.message,
      });
    },
  });

  // Update exercise mutation
  const updateExerciseMutation = useMutation({
    mutationFn: (data: ExerciseUpdateRequestDTO) => apiService.updateExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "¡Ejercicio actualizado!",
        description: "Los cambios han sido guardados.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error al actualizar ejercicio",
        description: error.message,
      });
    },
  });

  // Delete exercise mutation
  const deleteExerciseMutation = useMutation({
    mutationFn: (data: ExerciseByIdRequestDTO) => apiService.deleteExercise(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "Ejercicio eliminado",
        description: "El ejercicio ha sido eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error al eliminar ejercicio",
        description: error.message,
      });
    },
  });

  return {
    exercises: exercises || [],
    isLoading,
    error,
    createExercise: createExerciseMutation.mutate,
    updateExercise: updateExerciseMutation.mutate,
    deleteExercise: deleteExerciseMutation.mutate,
    isCreating: createExerciseMutation.isPending,
    isUpdating: updateExerciseMutation.isPending,
    isDeleting: deleteExerciseMutation.isPending,
  };
};

export const useExerciseById = (exerciseId?: string, userId?: string) => {
  const { data: exercise, isLoading, error } = useQuery({
    queryKey: ['exercise', exerciseId],
    queryFn: () => 
      exerciseId && userId 
        ? apiService.getExerciseById({ exerciseId, userId })
        : Promise.resolve(null),
    enabled: !!(exerciseId && userId),
  });

  return {
    exercise,
    isLoading,
    error,
  };
};