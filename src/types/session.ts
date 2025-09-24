export interface Exercise {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank' | 'short-answer' | 'quiz' | 'hangman' | 'flip-cards';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  hangmanWord?: string; // for hangman exercises
  flipCardBack?: string; // for flip card exercises
}

export interface Session {
  id: string;
  title: string;
  topic: string;
  description?: string;
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
  totalPoints: number;
  estimatedDuration: number; // in minutes
}

export interface CreateSessionRequest {
  topic: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  exerciseCount?: number;
}