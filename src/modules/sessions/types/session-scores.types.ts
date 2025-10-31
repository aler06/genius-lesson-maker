// Session Scores Types - matching backend API structure

export interface AnswerRecord {
  exerciseId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
  timeSpent: number;
  timestamp: string;
}

export interface SessionScore {
  id: string;
  sessionId: string;
  userId: string;
  nombre: string;
  correo: string;
  puntajeFinal: number;
  tiempoTotal: number;
  fechaResolucion: string;
  completado: boolean;
  respuestas: AnswerRecord[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionScoresSummary {
  sessionId: string;
  sessionName: string;
  totalParticipants: number;
  completedCount: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  scores: SessionScore[];
}

// Request DTOs
export interface InitializeScoreRequest {
  sessionId: string;
  nombre: string;
  correo: string;
}

export interface SubmitAnswerRequest {
  sessionId: string;
  exerciseId: string;
  questionId: string;
  answer: string;
  timeSpent: number;
  nombre: string;
  correo: string;
}

export interface CompleteSessionRequest {
  sessionId: string;
  nombre: string;
  correo: string;
  puntajeFinal?: number;
  tiempoTotal?: number;
  respuestas?: Array<{
    exerciseId: string;
    questionId: string;
    answer: string;
    isCorrect: boolean;
    timeSpent: number;
  }>;
}

// Response from submit-answer endpoint
export interface SubmitAnswerResponse {
  scoreRecord: SessionScore;
  isCorrect: boolean;
  points: number;
  correctAnswer?: string;
  explanation?: string;
}
