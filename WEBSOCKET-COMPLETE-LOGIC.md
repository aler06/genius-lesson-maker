# 🔌 Lógica Completa del WebSocket - Sistema de Sesiones Interactivas

## 📋 Resumen General

Sistema completo de WebSocket para sesiones interactivas en tiempo real entre profesores y estudiantes, con soporte para juegos como Hangman y manejo de usuarios temporales.

---

## 🏗️ Arquitectura del Sistema

### **1. Configuración WebSocket (`/src/config/websocket.ts`)**

```typescript
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
```

### **2. Hook Principal (`/src/hooks/useWebSocket.ts`)**

```typescript
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

    newSocket.on('userJoined', (data: WebSocketEvents['userJoined']) => {
      console.log('User joined:', data);
      onUserJoined?.(data);
    });

    newSocket.on('userLeft', (data: WebSocketEvents['userLeft']) => {
      console.log('User left:', data);
      onUserLeft?.(data);
    });

    newSocket.on('sessionStarted', (data: WebSocketEvents['sessionStarted']) => {
      console.log('Session started:', data);
      onSessionStarted?.(data);
    });

    newSocket.on('sessionEnded', (data: WebSocketEvents['sessionEnded']) => {
      console.log('Session ended:', data);
      onSessionEnded?.(data);
    });

    newSocket.on('answerResult', (data: AnswerResult) => {
      console.log('Answer result:', data);
      onAnswerResult?.(data);
    });

    newSocket.on('answerError', (data: WebSocketEvents['answerError']) => {
      console.error('Answer error:', data);
      onAnswerError?.(data);
    });

    newSocket.on('participantCountUpdate', (data: WebSocketEvents['participantCountUpdate']) => {
      console.log('Participant count update:', data);
      onParticipantCountUpdate?.(data);
    });

    newSocket.on('sessionStatus', (data: SessionStatus) => {
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
      socketRef.current.emit('leaveSession', { sessionId, userId });
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
      socketRef.current.emit('submitAnswer', {
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
      socketRef.current.emit('getSessionStatus', { sessionId });
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
```

---

## 📝 Tipos de Datos (`/src/types/session-backend.ts`)

### **Interfaces Principales**

```typescript
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

export interface AnswerResult {
  questionId: string;
  correct: boolean;
  score: number;
  correctAnswer: string;
  explanation: string;
  timestamp: Date;
}
```

### **Eventos WebSocket**

```typescript
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
```

---

## 🎮 Componente de Juego - Hangman (`/src/components/exercises/HangmanGame.tsx`)

### **Características Principales**

```typescript
interface HangmanGameProps {
  word: string;
  hint: string;
  onGuess?: (letter: string, isCorrect: boolean, timeSpent: number) => void;
  onComplete?: (success: boolean, totalTime: number) => void;
}

const HangmanGame: React.FC<HangmanGameProps> = ({ 
  word, 
  hint, 
  onGuess, 
  onComplete 
}) => {
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [startTime] = useState(Date.now());
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  const maxWrongGuesses = 6;
  const wordToGuess = word.toUpperCase();
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Lógica del juego...
};
```

### **Funcionalidades del Juego**

- ✅ **Selección de letras** - Grid A-Z compacto
- ✅ **Adivinanza de palabra completa** - Input para palabra entera
- ✅ **Pista siempre visible** - No requiere botón
- ✅ **Dibujo ASCII del ahorcado** - 6 etapas
- ✅ **Estados del juego** - Jugando, ganado, perdido
- ✅ **Callbacks** - onGuess y onComplete para integración

---

## 🏠 Implementación en SessionRoom

### **Uso del Hook WebSocket**

```typescript
const {
  isConnected,
  connectionError,
  connect,
  disconnect,
  joinSession,
  leaveSession,
  submitAnswer,
  getSessionStatus,
} = useWebSocket({
  onSessionJoined: (data) => {
    console.log('Successfully joined session:', data);
    if (data.session) {
      // Map backend data structure to frontend expected structure
      const backendSession = data.session as any;
      const mappedSession = {
        ...backendSession,
        teacher: backendSession.teacherId || backendSession.teacher,
        exercise: backendSession.exerciseId || backendSession.exercise,
      };
      console.log('Mapped session data:', mappedSession);
      setSessionData(mappedSession);
    }
    setIsJoined(true);
    setConnectionStatus('connected');
    toast({
      title: "¡Conectado!",
      description: `Te has unido exitosamente a la sesión "${data.session?.name || 'la sesión'}"`,
    });
  },
  onJoinError: (data) => {
    console.error('Failed to join session:', data);
    toast({
      title: "Error de conexión",
      description: data.message,
      variant: "destructive",
    });
    navigate('/join-session');
  },
  onParticipantCountUpdate: (data) => {
    setParticipantCount(data.count);
  },
  onAnswerResult: (data) => {
    setAnswers(prev => ({
      ...prev,
      [data.questionId]: data
    }));
    
    toast({
      title: data.correct ? "¡Correcto!" : "Incorrecto",
      description: data.correct 
        ? `¡Excelente! Ganaste ${data.score} puntos` 
        : `La respuesta correcta era: ${data.correctAnswer}`,
      variant: data.correct ? "default" : "destructive",
    });
  },
});
```

### **Integración con Hangman**

```typescript
{sessionData.exercise?.game === 'hangman' && sessionData.exercise.word ? (
  <HangmanGame
    word={sessionData.exercise.word}
    hint={sessionData.exercise.hint || 'Sin pista disponible'}
    onGuess={(letter, isCorrect, timeSpent) => {
      console.log('Hangman guess:', { letter, isCorrect, timeSpent });
      // Here you can send the guess to the backend if needed
    }}
    onComplete={(success, totalTime) => {
      console.log('Hangman completed:', { success, totalTime });
      // Here you can send the final result to the backend
      toast({
        title: success ? "¡Felicitaciones!" : "Juego terminado",
        description: success 
          ? `¡Has completado el juego en ${Math.round(totalTime / 1000)} segundos!`
          : "¡Mejor suerte la próxima vez!",
        variant: success ? "default" : "destructive",
      });
    }}
  />
) : (
  // Otros estados de la sesión...
)}
```

---

## 👤 Sistema de Usuarios Temporales

### **Creación de Usuario Temporal**

```typescript
// En JoinSession.tsx
const createTemporaryUser = (firstName: string): any => {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  
  return {
    id: `temp_${timestamp}_${randomId}`,
    firstName: firstName,
    lastName: 'Temporal',
    fullName: firstName,
    email: `temp_${timestamp}@temp.local`,
    role: 'student',
    isTemporary: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
```

### **Manejo en el Backend**

```typescript
// En el WebSocket Gateway del backend
@SubscribeMessage('joinSession')
async handleJoinSession(
  @MessageBody() data: { sessionId: string; userId: string; accessCode: string },
  @ConnectedSocket() client: Socket,
) {
  try {
    // Manejar usuarios temporales vs registrados
    let user;
    if (data.userId.startsWith('temp_')) {
      // Usuario temporal - crear objeto user temporal
      user = {
        id: data.userId,
        firstName: 'Estudiante',
        lastName: 'Temporal',
        email: `${data.userId}@temp.local`,
        role: 'student',
        isTemporary: true,
      };
    } else {
      // Usuario registrado - buscar en BD
      user = await this.userService.findById(data.userId);
    }
    
    // Lógica de unirse a la sesión...
  } catch (error) {
    client.emit('joinError', { message: error.message });
  }
}
```

---

## 🔧 Configuración de Entorno

### **Variables de Entorno (`.env`)**

```bash
# API Configuration - Backend NestJS
VITE_API_URL=http://localhost:3000

# WebSocket Configuration (same as API URL)
VITE_WS_URL=http://localhost:3000

# Frontend URL (Vite dev server) - for session sharing links
VITE_FRONTEND_URL=http://localhost:3001
```

### **Configuración de Puertos**

- **Frontend (Vite)**: `http://localhost:3001`
- **Backend (NestJS)**: `http://localhost:3000`
- **WebSocket**: `ws://localhost:3000/sessions` (namespace `/sessions`)

---

## 🚀 Flujo Completo de Uso

### **1. Estudiante se Une a Sesión**

1. **Accede** via código o enlace: `/session/join/ABC123`
2. **Ingresa nombre** → Crea usuario temporal
3. **Valida sesión** → API REST `/api/v1/session/join/ABC123`
4. **Conecta WebSocket** → `ws://localhost:3000/sessions`
5. **Emite `joinSession`** → `{ sessionId, userId, accessCode }`
6. **Recibe `sessionJoined`** → Datos de la sesión
7. **Mapea datos** → `teacherId` → `teacher`, `exerciseId` → `exercise`

### **2. Jugando Hangman**

1. **Renderiza HangmanGame** → Palabra "TCP/IP", pista visible
2. **Selecciona letras** → Teclado compacto A-Z
3. **Callbacks** → `onGuess` y `onComplete`
4. **Estados visuales** → Dibujo del ahorcado, progreso
5. **Finalización** → Toast con resultado y tiempo

### **3. Comunicación en Tiempo Real**

- **Contador de participantes** → `participantCountUpdate`
- **Estado de sesión** → `sessionStarted`, `sessionEnded`
- **Respuestas** → `answerResult`, `answerError`
- **Usuarios** → `userJoined`, `userLeft`

---

## 📊 Eventos WebSocket Implementados

### **Cliente → Servidor**

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `joinSession` | `{sessionId, userId, accessCode}` | Unirse a sesión |
| `leaveSession` | `{sessionId, userId}` | Salir de sesión |
| `submitAnswer` | `{sessionId, userId, questionId, answer, timeSpent}` | Enviar respuesta |
| `getSessionStatus` | `{sessionId}` | Obtener estado |

### **Servidor → Cliente**

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `sessionJoined` | `{sessionId, session, timestamp}` | Unido exitosamente |
| `joinError` | `{message}` | Error al unirse |
| `userJoined` | `{user, timestamp}` | Usuario se unió |
| `userLeft` | `{userId, timestamp}` | Usuario se fue |
| `sessionStarted` | `{session, timestamp}` | Sesión iniciada |
| `sessionEnded` | `{session, timestamp}` | Sesión terminada |
| `answerResult` | `{questionId, correct, score, ...}` | Resultado de respuesta |
| `participantCountUpdate` | `{count, timestamp}` | Actualización contador |

---

## 🛠️ Archivos Principales

### **Frontend**

- `/src/hooks/useWebSocket.ts` - Hook principal WebSocket
- `/src/config/websocket.ts` - Configuración y constantes
- `/src/types/session-backend.ts` - Tipos e interfaces
- `/src/components/exercises/HangmanGame.tsx` - Juego Hangman
- `/src/modules/sessions/pages/SessionRoom.tsx` - Sala de sesión
- `/src/modules/sessions/pages/JoinSession.tsx` - Unirse a sesión

### **Componentes de UI**

- `/src/components/SessionDebugger.tsx` - Debugging (removido en producción)
- `/src/components/SessionErrorBoundary.tsx` - Manejo de errores

---

## 🔍 Debugging y Logs

### **Logs del Frontend**

```javascript
// Conexión
"Connecting to WebSocket at: http://localhost:3000/sessions"
"Connected to WebSocket"

// Unirse a sesión
"Attempting to join session with user: {id: 'temp_...', firstName: 'Alessandro'}"
"Attempting to join session: {sessionId: '...', userId: '...', accessCode: 'ABC123'}"

// Éxito
"Session joined: {sessionId: '...', session: {...}, timestamp: '...'}"
"Mapped session data: {teacher: {...}, exercise: {...}}"

// Juego
"Hangman guess: {letter: 'T', isCorrect: true, timeSpent: 1500}"
"Hangman completed: {success: true, totalTime: 45000}"
```

### **Logs Esperados del Backend**

```javascript
// WebSocket Gateway
"Received joinSession: {sessionId: '...', userId: 'temp_...', accessCode: 'ABC123'}"
"Created temporary user: {id: 'temp_...', isTemporary: true}"
"User joined session successfully"
```

---

## ⚡ Características Técnicas

### **Optimizaciones**

- ✅ **Reconexión automática** - 5 intentos con delay
- ✅ **Fallback a polling** - Si WebSocket falla
- ✅ **Timeout configurado** - 20 segundos
- ✅ **Cleanup automático** - Desconexión en unmount
- ✅ **Logs detallados** - Para debugging
- ✅ **Manejo de errores** - Con rollback y toasts

### **Seguridad**

- ✅ **Validación de códigos** - En backend
- ✅ **Usuarios temporales** - Sin persistencia
- ✅ **Namespace aislado** - `/sessions`
- ✅ **CORS configurado** - Para desarrollo

---

## 🎯 Estado Final

### **✅ Funciona Completamente**

- **WebSocket conecta** correctamente al puerto 3000
- **Usuarios temporales** se crean y manejan
- **Sesiones se unen** exitosamente
- **Juego Hangman** completamente funcional
- **Comunicación bidireccional** en tiempo real
- **Manejo de errores** robusto
- **UI responsiva** y profesional

### **🔮 Listo para Producción**

- **Configuración flexible** via variables de entorno
- **Tipos TypeScript** completos
- **Documentación detallada**
- **Debugging tools** incluidos
- **Error boundaries** implementados

---

**¡Sistema WebSocket completo y funcional para sesiones interactivas en tiempo real!** 🚀
