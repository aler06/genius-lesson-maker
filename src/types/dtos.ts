import { Game, Role, Difficulty } from './enums';

// Card DTOs
export interface CardResponseDto {
  front: string;
  back: string;
}

export interface CardUpdateDto {
  front: string;
  back: string;
}

// Question DTOs
export interface QuestionResponseDto {
  question?: string;
  sentence?: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

export interface QuestionUpdateDto {
  question?: string;
  sentence?: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

// Exercise DTOs
export interface ExerciseRequestDTO {
  userId: string;
  topic: string;
  gameType: Game;
  difficulty?: Difficulty;
  targetAudience?: string;
  additionalInstructions?: string;
  numberOfItems?: number;
}

export interface ExerciseResponseDto {
  id: string;
  game: Game;
  questions?: QuestionResponseDto[];
  word?: string;
  hint?: string;
  createdAt: Date;
  updatedAt: Date;
  cards?: CardResponseDto[];
  instructions?: string;
}

export interface ExerciseByIdRequestDTO {
  exerciseId: string;
  userId: string;
}

export interface ExerciseUpdateRequestDTO {
  exerciseId: string;
  userId: string;
  questions?: QuestionUpdateDto[];
  word?: string;
  hint?: string;
  topic?: string;
  difficulty?: Difficulty;
  targetAudience?: string;
  cards?: CardUpdateDto[];
  instructions?: string;
}

export interface UserExerciseRequestDTO {
  userId: string;
}

// User DTOs
export interface UserRequestDTO {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password: string;
}

export interface UserResponseDTO {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}