import { Game } from '../enum/game.enum';   
import { QuestionResponseModel } from './question-response.model';
import { CardResponseModel } from './card-response.model';
import { DragDropElementModel } from './drag-drop-element.model';

export interface ExerciseResponse {
  id: string;
  game: Game;
  questions?: QuestionResponseModel[];
  word?: string;
  hint?: string;
  createdAt: Date;
  updatedAt: Date;
  cards?: CardResponseModel[];
  instructions?: string;
  elements?: DragDropElementModel[];
  correctOrder?: number[];
  explanation?: string;
}