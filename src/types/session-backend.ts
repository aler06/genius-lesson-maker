export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'teacher' | 'student';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  game: string;
  questions: Question[];
  word?: string;
  hint?: string;
  cards?: Card[];
  instructions: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  _id: string;
  question: string;
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export interface Card {
  _id: string;
  front: string;
  back: string;
}

export interface SessionResponse {
  id: string;
  teacher: User;
  exercise: Exercise;
  name: string;
  description?: string;
  accessCode: string;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  duration: number;
  startTime?: Date;
  endTime?: Date;
  participants: User[];
  maxParticipants: number;
  shareableLink: string;
  allowLateJoin: boolean;
  showLeaderboard: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface JoinSessionRequest {
  accessCode: string;
  studentId: string;
}

export interface AnswerSubmission {
  sessionId: string;
  userId: string;
  questionId: string;
  answer: string;
  timeSpent: number;
}

export interface AnswerResult {
  questionId: string;
  correct: boolean;
  score: number;
  correctAnswer: string;
  explanation: string;
  timestamp: Date;
}

export interface SessionStatus {
  session: SessionResponse;
  participantCount: number;
  connectedUsers: Array<{
    userId: string;
    role: 'teacher' | 'student';
  }>;
  timestamp: Date;
}

// WebSocket Events
export interface WebSocketEvents {
  // Client to Server
  joinSession: {
    sessionId: string;
    userId: string;
    accessCode: string;
  };
  leaveSession: {
    sessionId: string;
    userId: string;
  };
  submitAnswer: AnswerSubmission;
  getSessionStatus: {
    sessionId: string;
  };

  // Server to Client
  sessionJoined: {
    sessionId: string;
    session: SessionResponse;
    timestamp: Date;
  };
  joinError: {
    message: string;
  };
  userJoined: {
    user: User;
    timestamp: Date;
  };
  userLeft: {
    userId: string;
    timestamp: Date;
  };
  sessionStarted: {
    session: SessionResponse;
    timestamp: Date;
  };
  sessionEnded: {
    session: SessionResponse;
    timestamp: Date;
  };
  answerResult: AnswerResult;
  answerError: {
    message: string;
  };
  participantCountUpdate: {
    count: number;
    timestamp: Date;
  };
  sessionStatus: SessionStatus;
}
