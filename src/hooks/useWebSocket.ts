import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SessionResponse, JoinSessionRequest, AnswerSubmission, AnswerResult, SessionStatus } from '@/types/session-backend';
import { WEBSOCKET_CONFIG } from '@/config/websocket';

// Import WebSocket events from the backend types
import { WebSocketEvents } from '@/types/session-backend';

interface UseWebSocketProps {
  onSessionJoined?: (data: WebSocketEvents['sessionJoined']) => void;
  onJoinError?: (data: WebSocketEvents['joinError']) => void;
  onUserJoined?: (data: WebSocketEvents['userJoined']) => void;
  onUserLeft?: (data: WebSocketEvents['userLeft']) => void;
  onSessionStarted?: (data: WebSocketEvents['sessionStarted']) => void;
  onSessionEnded?: (data: WebSocketEvents['sessionEnded']) => void;
  onAnswerResult?: (data: AnswerResult) => void;
  onAnswerError?: (data: WebSocketEvents['answerError']) => void;
  onParticipantCountUpdate?: (data: WebSocketEvents['participantCountUpdate']) => void;
  onSessionStatus?: (data: SessionStatus) => void;
}

export const useWebSocket = (props: UseWebSocketProps = {}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const {
    onSessionJoined,
    onJoinError,
    onUserJoined,
    onUserLeft,
    onSessionStarted,
    onSessionEnded,
    onAnswerResult,
    onAnswerError,
    onParticipantCountUpdate,
    onSessionStatus,
  } = props;

  useEffect(() => {
    // Initialize socket connection
    const wsUrl = WEBSOCKET_CONFIG.getUrl();
    console.log('Connecting to WebSocket at:', wsUrl);
    
    const newSocket = io(wsUrl, WEBSOCKET_CONFIG.options);

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    // Session event handlers
    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.SESSION_JOINED, (data: WebSocketEvents['sessionJoined']) => {
      console.log('Session joined:', data);
      onSessionJoined?.(data);
    });

    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.JOIN_ERROR, (data: WebSocketEvents['joinError']) => {
      console.error('Join error:', data);
      onJoinError?.(data);
    });

    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.USER_JOINED, (data: WebSocketEvents['userJoined']) => {
      console.log('User joined:', data);
      onUserJoined?.(data);
    });

    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.USER_LEFT, (data: WebSocketEvents['userLeft']) => {
      console.log('User left:', data);
      onUserLeft?.(data);
    });

    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.SESSION_STARTED, (data: WebSocketEvents['sessionStarted']) => {
      console.log('Session started:', data);
      onSessionStarted?.(data);
    });

    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.SESSION_ENDED, (data: WebSocketEvents['sessionEnded']) => {
      console.log('Session ended:', data);
      onSessionEnded?.(data);
    });

    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.ANSWER_RESULT, (data: AnswerResult) => {
      console.log('Answer result:', data);
      onAnswerResult?.(data);
    });

    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.ANSWER_ERROR, (data: WebSocketEvents['answerError']) => {
      console.error('Answer error:', data);
      onAnswerError?.(data);
    });

    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.PARTICIPANT_COUNT_UPDATE, (data: WebSocketEvents['participantCountUpdate']) => {
      console.log('Participant count update:', data);
      onParticipantCountUpdate?.(data);
    });

    newSocket.on(WEBSOCKET_CONFIG.SERVER_EVENTS.SESSION_STATUS, (data: SessionStatus) => {
      console.log('Session status:', data);
      onSessionStatus?.(data);
    });

    return () => {
      newSocket.disconnect();
      newSocket.removeAllListeners();
    };
  }, []); // Sin dependencias para evitar re-creación constante del socket

  const connect = () => {
    if (socketRef.current && !isConnected) {
      socketRef.current.connect();
    }
  };

  const disconnect = () => {
    if (socketRef.current && isConnected) {
      socketRef.current.disconnect();
    }
  };

  const joinSession = (sessionId: string, userId: string, accessCode: string) => {
    if (socketRef.current && isConnected) {
      console.log('Attempting to join session:', { sessionId, userId, accessCode });
      socketRef.current.emit(WEBSOCKET_CONFIG.CLIENT_EVENTS.JOIN_SESSION, { 
        sessionId, 
        userId, 
        accessCode 
      });
    } else {
      console.error('Cannot join session - socket not connected:', { 
        hasSocket: !!socketRef.current, 
        isConnected 
      });
    }
  };

  const leaveSession = (sessionId: string, userId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(WEBSOCKET_CONFIG.CLIENT_EVENTS.LEAVE_SESSION, { sessionId, userId });
    }
  };

  const submitAnswer = (
    sessionId: string,
    userId: string,
    questionId: string,
    answer: string,
    timeSpent: number
  ) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(WEBSOCKET_CONFIG.CLIENT_EVENTS.SUBMIT_ANSWER, {
        sessionId,
        userId,
        questionId,
        answer,
        timeSpent,
      });
    }
  };

  const getSessionStatus = (sessionId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(WEBSOCKET_CONFIG.CLIENT_EVENTS.GET_SESSION_STATUS, { sessionId });
    }
  };

  return {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
    joinSession,
    leaveSession,
    submitAnswer,
    getSessionStatus,
  };
};
