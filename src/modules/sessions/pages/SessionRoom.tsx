import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { NavHeader } from '@/components/ui/nav-header';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/use-toast';
import HangmanGame from '@/components/exercises/HangmanGame';
import { 
  Users, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  LogOut,
  Loader2,
  Brain,
  Play,
  Pause,
  Target,
  BookOpen,
  Trophy,
  XCircle
} from 'lucide-react';
import { SessionResponse, AnswerResult } from '@/types/session-backend';
import { getSubjectInfo } from '@/modules/exercises/utils/subject-detector';
import { Subject } from '@/modules/exercises/enum/subject.enum';

interface LocationState {
  sessionData: SessionResponse;
  accessCode: string;
  currentUser: any; // Can be authenticated user or temporary user
}

const SessionRoom = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Get data from navigation state
  const { sessionData: initialSessionData, accessCode, currentUser } = (location.state as LocationState) || {};
  
  // Local state
  const [sessionData, setSessionData] = useState<any>(initialSessionData);
  const [participantCount, setParticipantCount] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerResult>>({});
  const [isJoined, setIsJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

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
    onSessionStarted: (data) => {
      if (data.session) {
        const backendSession = data.session as any;
        const mappedSession = {
          ...backendSession,
          teacher: backendSession.teacherId || backendSession.teacher,
          exercise: backendSession.exerciseId || backendSession.exercise,
        };
        setSessionData(mappedSession);
      }
      toast({
        title: "¡Sesión iniciada!",
        description: "El profesor ha iniciado la sesión. ¡Comencemos!",
      });
    },
    onSessionEnded: (data) => {
      if (data.session) {
        const backendSession = data.session as any;
        const mappedSession = {
          ...backendSession,
          teacher: backendSession.teacherId || backendSession.teacher,
          exercise: backendSession.exerciseId || backendSession.exercise,
        };
        setSessionData(mappedSession);
      }
      toast({
        title: "Sesión finalizada",
        description: "El profesor ha finalizado la sesión.",
      });
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
    onAnswerError: (data) => {
      toast({
        title: "Error",
        description: data.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    if (!sessionData || !sessionId) {
      navigate('/');
      return;
    }

    // Connect to WebSocket
    connect();
    setConnectionStatus('connecting');

    return () => {
      if (isJoined && sessionId && currentUser) {
        leaveSession(sessionId, currentUser.id);
      }
      disconnect();
    };
  }, []);

  useEffect(() => {
    const userToUse = currentUser || user;
    if (isConnected && sessionId && userToUse && accessCode && !isJoined) {
      console.log('Attempting to join session with user:', userToUse);
      joinSession(sessionId, userToUse.id || userToUse._id, accessCode);
    }
  }, [isConnected, sessionId, currentUser, user, accessCode, isJoined]);

  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  const handleSubmitAnswer = (questionId: string, answer: string, timeSpent: number) => {
    const userToUse = currentUser || user;
    if (sessionId && userToUse) {
      submitAnswer(sessionId, userToUse.id || userToUse._id, questionId, answer, timeSpent);
    }
  };

  const handleLeaveSession = () => {
    const userToUse = currentUser || user;
    if (sessionId && userToUse) {
      leaveSession(sessionId, userToUse.id || userToUse._id);
    }
    // Navigate based on user type
    if (currentUser?.isTemporary) {
      navigate('/');
    } else {
      navigate('/dashboard');
    }
  };

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="text-center p-8">
              <CardContent>
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Cargando sesión...</h2>
                <p className="text-muted-foreground">
                  Obteniendo información de la sesión
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Safety checks for exercise data
  if (!sessionData?.exercise) {
    console.warn('Session data or exercise is missing:', sessionData);
  }

  // Use default subject info if exercise data is missing
  const subjectInfo = getSubjectInfo(Subject.GENERAL);
  const totalQuestions = sessionData?.exercise?.questions?.length || 0;
  const answeredQuestions = Object.keys(answers).length;
  const correctAnswers = Object.values(answers).filter((a: any) => a.correct).length;
  const totalScore = Object.values(answers).reduce((sum: number, a: any) => sum + a.score, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <NavHeader />
      <main className="container mx-auto px-4 py-8">

        {/* Connection Status */}
        <div className="mb-4">
          <Alert className={`${connectionStatus === 'connected' ? 'border-green-200 bg-green-50' : 
            connectionStatus === 'connecting' ? 'border-yellow-200 bg-yellow-50' : 
            'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : connectionStatus === 'connecting' ? (
                <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                {connectionStatus === 'connected' ? 'Conectado al servidor' : 
                 connectionStatus === 'connecting' ? 'Conectando...' : 
                 'Desconectado del servidor'}
              </AlertDescription>
            </div>
          </Alert>
        </div>

        {/* Session Header */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {sessionData.name}
                    </h1>
                    <p className="text-muted-foreground">
                      Profesor: {sessionData.teacher?.firstName || 'Profesor'} {sessionData.teacher?.lastName || ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge 
                    variant="secondary" 
                    className={`${subjectInfo.color} text-white`}
                  >
                    <subjectInfo.icon className="h-3 w-3 mr-1" />
                    {subjectInfo.name}
                  </Badge>
                  
                  <Badge variant="outline">
                    {sessionData.status === 'waiting' && (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        Esperando
                      </>
                    )}
                    {sessionData.status === 'active' && (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        En curso
                      </>
                    )}
                    {sessionData.status === 'finished' && (
                      <>
                        <Pause className="h-3 w-3 mr-1" />
                        Finalizada
                      </>
                    )}
                  </Badge>

                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {participantCount} participantes
                  </Badge>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleLeaveSession}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Salir de la Sesión
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tu Progreso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{answeredQuestions}</div>
                <div className="text-sm text-muted-foreground">Respondidas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correctas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{totalScore}</div>
                <div className="text-sm text-muted-foreground">Puntos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Precisión</div>
              </div>
            </div>
            <Progress 
              value={totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0} 
              className="h-2"
            />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {answeredQuestions} de {totalQuestions} preguntas completadas
            </p>
          </CardContent>
        </Card>

        {/* Exercise Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ejercicio: {sessionData.exercise?.game || 'Actividad'}
            </CardTitle>
            {sessionData.exercise?.instructions && (
              <CardDescription>
                {sessionData.exercise.instructions}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {/* Show Hangman Game if exercise type is hangman */}
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
            ) : sessionData.status === 'waiting' ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Esperando que inicie la sesión</h3>
                <p className="text-muted-foreground">
                  El profesor iniciará la sesión pronto. Mantente conectado.
                </p>
              </div>
            ) : sessionData.status === 'finished' ? (
              <div className="text-center py-12">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">¡Sesión Completada!</h3>
                <p className="text-muted-foreground mb-4">
                  Has terminado la sesión. Aquí están tus resultados finales:
                </p>
                <div className="bg-muted rounded-lg p-4 max-w-md mx-auto">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold">Preguntas respondidas:</div>
                      <div>{answeredQuestions} de {totalQuestions}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Respuestas correctas:</div>
                      <div>{correctAnswers}</div>
                    </div>
                    <div>
                      <div className="font-semibold">Puntuación total:</div>
                      <div>{totalScore} puntos</div>
                    </div>
                    <div>
                      <div className="font-semibold">Precisión:</div>
                      <div>{totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  La sesión está activa. El contenido del ejercicio se mostrará aquí.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SessionRoom;
