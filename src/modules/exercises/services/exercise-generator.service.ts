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
      throw new Error(`Error ${response.status}: ${errorText || 'Error al generar el ejercicio'}`);
    }

    return await response.json();
  }
};
