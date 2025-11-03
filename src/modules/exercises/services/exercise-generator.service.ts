import { apiRequest } from '@/utils/api';

export interface GeneratedHangmanExercise {
  id: string;
  game: 'hangman';
  createdAt: string;
  updatedAt: string;
  word: string;
  hint: string;
}


export const exerciseGeneratorService = {
  async generateHangmanExercise(): Promise<GeneratedHangmanExercise> {
    try {
      const response = await apiRequest('/api/v1/exercise-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          game: 'hangman'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        // Si es error 500 o cualquier error del servidor, usar fallback
        if (response.status >= 500) {
          console.log('Server error detected, using fallback exercise');
          return this.getFallbackHangmanExercise();
        }
        
        throw new Error(`Error ${response.status}: ${errorText || 'Error al generar el ejercicio'}`);
      }

      // Intentar parsear el JSON
      try {
        return await response.json();
      } catch (jsonError) {
        console.error('JSON Parse Error:', jsonError);
        console.log('Invalid JSON response, using fallback exercise');
        return this.getFallbackHangmanExercise();
      }
    } catch (error) {
      console.error('Error calling exercise generator API:', error);
      
      // Si hay cualquier error de red, usar fallback
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.log('Network error detected, using fallback exercise');
        return this.getFallbackHangmanExercise();
      }
      
      // Si es error relacionado con Gemini API o JSON, usar fallback
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('gemini') || 
            errorMessage.includes('json') || 
            errorMessage.includes('500') ||
            errorMessage.includes('invalid json') ||
            errorMessage.includes('unexpected')) {
          console.log('API/JSON error detected, using fallback exercise');
          return this.getFallbackHangmanExercise();
        }
      }
      
      // Para cualquier otro error, también usar fallback para garantizar funcionalidad
      console.log('Unknown error detected, using fallback exercise');
      return this.getFallbackHangmanExercise();
    }
  },

  getFallbackHangmanExercise(): GeneratedHangmanExercise {
    const fallbackExercises = [
      {
        id: 'fallback-1',
        game: 'hangman' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        word: 'ALGORITMO',
        hint: 'Secuencia de pasos para resolver un problema'
      },
      {
        id: 'fallback-2',
        game: 'hangman' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        word: 'VARIABLE',
        hint: 'Almacena un valor en la memoria del ordenador'
      },
      {
        id: 'fallback-3',
        game: 'hangman' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        word: 'FUNCION',
        hint: 'Bloque de código que realiza una tarea específica'
      },
      {
        id: 'fallback-4',
        game: 'hangman' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        word: 'BUCLE',
        hint: 'Estructura que repite código mientras se cumple una condición'
      },
      {
        id: 'fallback-5',
        game: 'hangman' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        word: 'ARRAY',
        hint: 'Estructura de datos que almacena múltiples elementos'
      }
    ];

    // Seleccionar un ejercicio aleatorio
    const randomIndex = Math.floor(Math.random() * fallbackExercises.length);
    return fallbackExercises[randomIndex];
  }
};
