// Application constants
export const APP_CONFIG = {
  name: 'EduAI',
  description: 'Generador de Ejercicios',
  version: '1.0.0',
} as const;

// Session constants
export const SESSION_CONFIG = {
  accessCodeLength: 6,
  maxParticipants: 50,
  defaultDuration: 60, // minutes
  reconnectionAttempts: 5,
  reconnectionDelay: 1000, // milliseconds
} as const;

// User constants
export const USER_CONFIG = {
  tempUserPrefix: 'temp_',
  minNameLength: 2,
  maxNameLength: 50,
  localStorageKey: 'genius_temp_user',
} as const;

// WebSocket events
export const WS_EVENTS = {
  // Client to Server
  JOIN_SESSION: 'joinSession',
  LEAVE_SESSION: 'leaveSession',
  SUBMIT_ANSWER: 'submitAnswer',
  GET_SESSION_STATUS: 'getSessionStatus',
  
  // Server to Client
  SESSION_JOINED: 'sessionJoined',
  JOIN_ERROR: 'joinError',
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
  SESSION_STARTED: 'sessionStarted',
  SESSION_ENDED: 'sessionEnded',
  ANSWER_RESULT: 'answerResult',
  ANSWER_ERROR: 'answerError',
  PARTICIPANT_COUNT_UPDATE: 'participantCountUpdate',
  SESSION_STATUS: 'sessionStatus',
} as const;

// API endpoints
export const API_ENDPOINTS = {
  sessions: '/api/v1/sessions',
  sessionJoin: '/api/v1/session/join',
  exercises: '/api/v1/exercises',
  auth: '/api/v1/auth',
} as const;

// Routes
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard',
  createExercise: '/create-exercise',
  joinSession: '/join-session',
  sessionRoom: '/session',
  exerciseDetail: '/exercise',
} as const;
