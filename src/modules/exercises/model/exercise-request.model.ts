import { Game } from '../enum/game.enum';

export interface ExerciseRequestModel {
  userId: string;
  topic: string;
  gameType: Game;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience?: string;
  additionalInstructions?: string;
  numberOfItems: number;
}