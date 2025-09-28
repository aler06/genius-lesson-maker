// WebSocket configuration
export const WEBSOCKET_CONFIG = {
  // Use the same URL as the API but for WebSocket connection with /sessions namespace
  getUrl: () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${apiUrl}/sessions`;
  },
  
  // Socket.IO configuration options
  options: {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    timeout: 20000,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    forceNew: true,
  },
  
  // Events that the client can emit
  CLIENT_EVENTS: {
    JOIN_SESSION: 'joinSession',
    LEAVE_SESSION: 'leaveSession',
    SUBMIT_ANSWER: 'submitAnswer',
    GET_SESSION_STATUS: 'getSessionStatus',
  } as const,
  
  // Events that the server can emit
  SERVER_EVENTS: {
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
  } as const,
};
