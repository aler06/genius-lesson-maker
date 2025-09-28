import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseService } from '../services/exercise.service';
import { ExerciseRequestModel } from '../model/exercise-request.model';
import { ExerciseResponse } from '../model/exercise-response.model';
import { ExerciseByIdRequestModel } from '../model/exercise-by-id-request.model';
import { ExerciseUpdateRequestModel } from '../model/exercise-update-request.model';
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
    queryFn: () => userId ? exerciseService.getUserExercises(userId) : Promise.resolve([]),
    enabled: !!userId,
  });

  // Create exercise mutation
  const createExerciseMutation = useMutation({
    mutationFn: (data: ExerciseRequestModel) => exerciseService.generateExercise(data),
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
    mutationFn: (data: ExerciseUpdateRequestModel) => exerciseService.updateExercise(data),
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
    mutationFn: (data: ExerciseByIdRequestModel) => exerciseService.deleteExercise(data),
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
        ? exerciseService.getExerciseById(exerciseId, userId)
        : Promise.resolve(null),
    enabled: !!(exerciseId && userId),
  });

  return {
    exercise,
    isLoading,
    error,
  };
};