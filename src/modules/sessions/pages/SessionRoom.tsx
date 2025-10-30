import React, { useState, useEffect } from 'react';
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
import HangmanGame from '@/modules/exercises/components/HangmanGame';
import QuizGame from '@/modules/exercises/components/QuizGame';
import FillInTheBlankGame from '@/modules/exercises/components/FillInTheBlankGame';
import FlipCardsGame from '@/modules/exercises/components/FlipCardsGame';
import DragAndDropGame from '@/modules/exercises/components/DragAndDropGame';
import TrueFalseGame from '@/modules/exercises/components/TrueFalseGame';
import RouletteGame from '@/modules/exercises/components/RouletteGame';
import MatchingGame from '@/modules/exercises/components/MatchingGame';
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
  
  // Map initial session data if it exists
  const mappedInitialData = initialSessionData ? {
    ...initialSessionData,
    exercises: (initialSessionData as any).exerciseIds || (initialSessionData as any).exercises || []
  } : null;
  
  // Local state
  const [sessionData, setSessionData] = useState<any>(mappedInitialData);
  const [participantCount, setParticipantCount] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseCompleted, setExerciseCompleted] = useState<boolean[]>([]);
  const [exerciseResults, setExerciseResults] = useState<Array<{
    score: number;
    total: number;
    type: string;
    answers?: Array<{question: string, selectedAnswer: string, correctAnswer: string, explanation?: string, isCorrect: boolean}>;
    hangmanData?: {word: string, hint?: string, guessedLetters: string[], wrongGuesses: number};
    dragDropData?: {elements: Array<{id: number, texto: string}>, userOrder: number[], correctOrder: number[], explanation?: string};
    trueFalseData?: Array<{statement: string, selectedAnswer: boolean, correctAnswer: boolean, explanation: string, isCorrect: boolean}>;
    rouletteData?: {selectedPhrase: string, phraseIndex: number, allPhrases: Array<{text: string}>};
    matchingData?: {matchedPairs: Array<{term: string, match: string, correct: boolean}>, totalPairs: number};
  }>>([]);
  const [allExercisesCompleted, setAllExercisesCompleted] = useState(false);
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
          exercises: backendSession.exerciseIds || backendSession.exercises || [], // Map exerciseIds to exercises
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
          exercises: backendSession.exerciseIds || backendSession.exercises || [],
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
          exercises: backendSession.exerciseIds || backendSession.exercises || [],
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
    // Always navigate to home for students (session interface is for students)
    navigate('/');
  };

  // Define variables needed by functions
  const exercises = sessionData?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const completedExercises = exerciseCompleted.filter(Boolean).length;

  const handleExerciseComplete = (exerciseIndex: number, success: boolean, score?: number, total?: number, quizAnswers?: Array<{question: string, selectedAnswer: string, correctAnswer: string, explanation?: string, isCorrect: boolean}>, hangmanData?: {word: string, hint?: string, guessedLetters: string[], wrongGuesses: number}, dragDropData?: {elements: Array<{id: number, texto: string}>, userOrder: number[], correctOrder: number[], explanation?: string}, trueFalseData?: Array<{statement: string, selectedAnswer: boolean, correctAnswer: boolean, explanation: string, isCorrect: boolean}>, rouletteData?: {selectedPhrase: string, phraseIndex: number, allPhrases: Array<{text: string}>}, matchingData?: {matchedPairs: Array<{term: string, match: string, correct: boolean}>, totalPairs: number}) => {
    // Mark exercise as completed
    setExerciseCompleted(prev => {
      const newCompleted = [...prev];
      newCompleted[exerciseIndex] = true;
      return newCompleted;
    });

    // Save exercise result
    setExerciseResults(prev => {
      const newResults = [...prev];
      newResults[exerciseIndex] = {
        score: score || 0,
        total: total || 1,
        type: currentExercise?.game || 'unknown',
        answers: quizAnswers, // Store quiz answers for final review
        hangmanData: hangmanData, // Store hangman game data
        dragDropData: dragDropData, // Store drag and drop game data
        trueFalseData: trueFalseData, // Store true or false game data
        rouletteData: rouletteData, // Store roulette game data
        matchingData: matchingData // Store matching game data
      };
      return newResults;
    });

    // Auto advance to next exercise after short delay
    setTimeout(() => {
      if (exerciseIndex < totalExercises - 1) {
        // Just advance to next exercise without toast
        setCurrentExerciseIndex(exerciseIndex + 1);
      } else {
        // All exercises completed - show toast only here
        setAllExercisesCompleted(true);
        const totalScore = exerciseResults.reduce((sum, result) => sum + result.score, 0) + (score || 0);
        const totalQuestions = exerciseResults.reduce((sum, result) => sum + result.total, 0) + (total || 0);
        const finalPercentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
        
        toast({
          title: "¡Sesión completada!",
          description: `Has terminado todos los ejercicios. Puntuación final: ${totalScore}/${totalQuestions} (${finalPercentage}%)`,
        });
      }
    }, 500); // Quick transition between exercises
  };

  const renderCurrentExercise = () => {
    // Show final summary if all exercises are completed
    if (allExercisesCompleted) {
      const totalScore = exerciseResults.reduce((sum, result) => sum + result.score, 0);
      const totalQuestions = exerciseResults.reduce((sum, result) => sum + result.total, 0);
      const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;

      return (
        <div className="text-center py-12">
          <Trophy className="h-24 w-24 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">¡Sesión Completada!</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Has terminado todos los ejercicios de la sesión
          </p>
          
          <div className="bg-muted rounded-lg p-6 max-w-4xl mx-auto mb-8">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{totalScore}</div>
                <div className="text-sm text-muted-foreground">Respuestas Correctas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground">Total Preguntas</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">{percentage}%</div>
                <div className="text-sm text-muted-foreground">Precisión</div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Resumen por Ejercicio:</h3>
              {exerciseResults.map((result, index) => (
                <div key={index} className="bg-background rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">Ejercicio {index + 1}</div>
                        <div className="text-sm text-muted-foreground capitalize">{result.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{result.score}/{result.total}</div>
                      <div className="text-sm text-muted-foreground">
                        {Math.round((result.score / result.total) * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Show detailed answers for quiz and fill_in_the_blank */}
                  {(result.type === 'quiz' || result.type === 'fill_in_the_blank') && result.answers && (
                    <div className="space-y-4 mt-4 border-t pt-4">
                      <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                        📋 Revisión Detallada de Respuestas
                      </h4>
                      {result.answers.map((answer, qIndex) => (
                        <div key={qIndex} className={`p-4 rounded-lg border-l-4 shadow-sm ${
                          answer.isCorrect 
                            ? 'border-l-green-500 bg-green-50 border border-green-200' 
                            : 'border-l-red-500 bg-red-50 border border-red-200'
                        }`}>
                          <div className="font-semibold text-sm mb-3 text-gray-800">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-bold mr-2">
                              {qIndex + 1}
                            </span>
                            {answer.question}
                          </div>
                          
                          <div className="space-y-2">
                            <div className={`flex items-center gap-2 p-2 rounded ${
                              answer.isCorrect ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <span className={`text-lg ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                {answer.isCorrect ? '✅' : '❌'}
                              </span>
                              <div className="flex-1">
                                <span className="font-medium text-sm text-gray-700">Tu respuesta:</span>
                                <span className={`ml-2 font-semibold ${
                                  answer.isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {answer.selectedAnswer}
                                </span>
                              </div>
                            </div>
                            
                            {!answer.isCorrect && (
                              <div className="flex items-center gap-2 p-2 bg-green-100 rounded">
                                <span className="text-lg text-green-600">✅</span>
                                <div className="flex-1">
                                  <span className="font-medium text-sm text-gray-700">Respuesta correcta:</span>
                                  <span className="ml-2 font-semibold text-green-700">
                                    {answer.correctAnswer}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {answer.explanation && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <span className="text-blue-600 text-sm">💡</span>
                                  <div className="flex-1">
                                    <div className="font-semibold text-sm text-blue-800 mb-1">Explicación:</div>
                                    <div className="text-sm text-blue-700 leading-relaxed">
                                      {answer.explanation}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Show detailed results for hangman */}
                  {result.type === 'hangman' && result.hangmanData && (
                    <div className="space-y-4 mt-4 border-t pt-4">
                      <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                        🎯 Detalles del Juego del Ahorcado
                      </h4>
                      <div className="p-4 rounded-lg border-l-4 shadow-sm bg-blue-50 border border-blue-200 border-l-blue-500">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-2 bg-white rounded">
                            <span className="text-lg">🎯</span>
                            <div className="flex-1">
                              <span className="font-medium text-sm text-gray-700">Palabra:</span>
                              <span className="ml-2 font-bold text-blue-700 text-lg">
                                {result.hangmanData.word}
                              </span>
                            </div>
                          </div>
                          
                          {result.hangmanData.hint && (
                            <div className="flex items-start gap-2 p-2 bg-white rounded">
                              <span className="text-lg">💡</span>
                              <div className="flex-1">
                                <span className="font-medium text-sm text-gray-700">Pista:</span>
                                <span className="ml-2 text-gray-600">
                                  {result.hangmanData.hint}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 p-2 bg-white rounded">
                            <span className={`text-lg ${result.score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.score > 0 ? '✅' : '❌'}
                            </span>
                            <div className="flex-1">
                              <span className="font-medium text-sm text-gray-700">Resultado:</span>
                              <span className={`ml-2 font-semibold ${result.score > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {result.score > 0 ? '¡Ganaste!' : 'Perdiste'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-2 bg-white rounded">
                            <span className="text-lg">🔤</span>
                            <div className="flex-1">
                              <span className="font-medium text-sm text-gray-700">Letras intentadas:</span>
                              <div className="ml-2 mt-1 flex flex-wrap gap-1">
                                {result.hangmanData.guessedLetters.map((letter, idx) => (
                                  <span key={idx} className={`px-2 py-1 rounded text-xs font-medium ${
                                    result.hangmanData!.word.toUpperCase().includes(letter) 
                                      ? 'bg-green-100 text-green-700 border border-green-300'
                                      : 'bg-red-100 text-red-700 border border-red-300'
                                  }`}>
                                    {letter}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 p-2 bg-white rounded">
                            <span className="text-lg">⚠️</span>
                            <div className="flex-1">
                              <span className="font-medium text-sm text-gray-700">Errores cometidos:</span>
                              <span className={`ml-2 font-semibold ${
                                result.hangmanData.wrongGuesses <= 2 ? 'text-green-700' : 
                                result.hangmanData.wrongGuesses <= 4 ? 'text-yellow-700' : 'text-red-700'
                              }`}>
                                {result.hangmanData.wrongGuesses} de 6
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show detailed results for drag and drop */}
                  {result.type === 'drag_and_drop' && result.dragDropData && (
                    <div className="space-y-4 mt-4 border-t pt-4">
                      <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                        🔄 Detalles del Arrastrar y Soltar
                      </h4>
                      <div className="p-4 rounded-lg border-l-4 shadow-sm bg-indigo-50 border border-indigo-200 border-l-indigo-500">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 p-2 bg-white rounded">
                            <span className={`text-lg ${result.score > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.score > 0 ? '✅' : '❌'}
                            </span>
                            <div className="flex-1">
                              <span className="font-medium text-sm text-gray-700">Resultado:</span>
                              <span className={`ml-2 font-semibold ${result.score > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {result.score > 0 ? '¡Orden Correcto!' : 'Orden Incorrecto'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="font-medium text-sm text-gray-700">Tu orden:</div>
                            <div className="space-y-1">
                              {result.dragDropData.userOrder.map((elementId, index) => {
                                const element = result.dragDropData!.elements.find(el => el.id === elementId);
                                const isCorrect = result.dragDropData!.correctOrder[index] === elementId;
                                return (
                                  <div key={index} className={`flex items-center gap-3 p-2 rounded ${
                                    isCorrect ? 'bg-green-100' : 'bg-red-100'
                                  }`}>
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isCorrect ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                    }`}>
                                      {index + 1}
                                    </span>
                                    <span className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                      {element?.texto || 'Elemento no encontrado'}
                                    </span>
                                    <span className={`text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                      {isCorrect ? '✅' : '❌'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="font-medium text-sm text-gray-700">Orden correcto:</div>
                            <div className="space-y-1">
                              {result.dragDropData.correctOrder.map((elementId, index) => {
                                const element = result.dragDropData!.elements.find(el => el.id === elementId);
                                return (
                                  <div key={index} className="flex items-center gap-3 p-2 bg-green-50 rounded border border-green-200">
                                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm text-green-700">
                                      {element?.texto || 'Elemento no encontrado'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {result.dragDropData.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <span className="text-blue-600 text-sm">💡</span>
                                <div className="flex-1">
                                  <div className="font-semibold text-sm text-blue-800 mb-1">Explicación:</div>
                                  <div className="text-sm text-blue-700 leading-relaxed">
                                    {result.dragDropData.explanation}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show detailed results for true or false */}
                  {result.type === 'true_or_false' && result.trueFalseData && (
                    <div className="space-y-4 mt-4 border-t pt-4">
                      <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                        ✅ Detalles del Verdadero o Falso
                      </h4>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="space-y-4">
                          {result.trueFalseData.map((answer, answerIndex) => (
                            <div key={answerIndex} className={`p-4 rounded-lg border-2 ${
                              answer.isCorrect 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-red-50 border-red-200'
                            }`}>
                              <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    answer.isCorrect 
                                      ? 'bg-green-600 text-white' 
                                      : 'bg-red-600 text-white'
                                  }`}>
                                    {answerIndex + 1}
                                  </span>
                                  <div className="flex-1">
                                    <div className="font-medium text-sm text-gray-800 mb-2">
                                      {answer.statement}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium text-gray-600">Tu respuesta:</span>
                                        <div className={`mt-1 flex items-center gap-2 ${
                                          answer.isCorrect ? 'text-green-700' : 'text-red-700'
                                        }`}>
                                          {answer.selectedAnswer ? (
                                            <>
                                              <CheckCircle className="h-4 w-4" />
                                              Verdadero
                                            </>
                                          ) : (
                                            <>
                                              <XCircle className="h-4 w-4" />
                                              Falso
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <span className="font-medium text-gray-600">Respuesta correcta:</span>
                                        <div className="mt-1 flex items-center gap-2 text-green-700">
                                          {answer.correctAnswer ? (
                                            <>
                                              <CheckCircle className="h-4 w-4" />
                                              Verdadero
                                            </>
                                          ) : (
                                            <>
                                              <XCircle className="h-4 w-4" />
                                              Falso
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {answer.explanation && (
                                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start gap-2">
                                          <span className="text-blue-600 text-sm">💡</span>
                                          <div className="flex-1">
                                            <div className="font-semibold text-sm text-blue-800 mb-1">Explicación:</div>
                                            <div className="text-sm text-blue-700 leading-relaxed">
                                              {answer.explanation}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show detailed results for roulette */}
                  {result.type === 'roulette' && result.rouletteData && (
                    <div className="space-y-4 mt-4 border-t pt-4">
                      <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                        🎯 Detalles de la Ruleta de Reflexión
                      </h4>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg border-2 bg-rose-50 border-rose-200">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                  🎯
                                </span>
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-800 mb-2">
                                    Frase seleccionada por la ruleta:
                                  </div>
                                  
                                  <div className="p-4 bg-white rounded-lg border-2 border-rose-300">
                                    <div className="flex items-start gap-3">
                                      <span className="bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                                        {result.rouletteData.phraseIndex + 1}
                                      </span>
                                      <p className="text-gray-800 font-medium leading-relaxed">
                                        "{result.rouletteData.selectedPhrase}"
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="mt-3 text-sm text-rose-700">
                                    💡 Esta frase fue seleccionada aleatoriamente para tu reflexión
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Show all available phrases */}
                          <div className="mt-4">
                            <h5 className="font-medium text-sm text-gray-700 mb-3">
                              Todas las frases disponibles en la ruleta:
                            </h5>
                            <div className="grid gap-2">
                              {result.rouletteData.allPhrases.map((phrase, index) => (
                                <div 
                                  key={index}
                                  className={`p-3 rounded-lg border ${
                                    index === result.rouletteData!.phraseIndex
                                      ? 'bg-rose-100 border-rose-300 font-medium' 
                                      : 'bg-gray-50 border-gray-200'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      index === result.rouletteData!.phraseIndex
                                        ? 'bg-rose-600 text-white'
                                        : 'bg-gray-400 text-white'
                                    }`}>
                                      {index + 1}
                                    </span>
                                    <p className="text-sm flex-1">{phrase.text}</p>
                                    {index === result.rouletteData!.phraseIndex && (
                                      <span className="text-rose-600 text-xs font-bold">SELECCIONADA</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show detailed results for matching */}
                  {result.type === 'matching' && result.matchingData && (
                    <div className="space-y-4 mt-4 border-t pt-4">
                      <h4 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                        🔗 Detalles del Emparejamiento
                      </h4>
                      
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="space-y-4">
                          <div className="grid gap-3">
                            {result.matchingData.matchedPairs.map((pair, index) => (
                              <div 
                                key={index}
                                className={`p-4 rounded-lg border-2 ${
                                  pair.correct 
                                    ? 'bg-green-50 border-green-200' 
                                    : 'bg-red-50 border-red-200'
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                    pair.correct ? 'bg-green-600' : 'bg-red-600'
                                  }`}>
                                    {pair.correct ? '✓' : '✗'}
                                  </div>
                                  
                                  <div className="flex-1 grid md:grid-cols-2 gap-4">
                                    <div>
                                      <span className={`text-xs font-medium uppercase tracking-wide ${
                                        pair.correct ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        Término
                                      </span>
                                      <p className="text-sm font-medium text-gray-800 mt-1">
                                        {pair.term}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <span className={`text-xs font-medium uppercase tracking-wide ${
                                        pair.correct ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        Tu emparejamiento
                                      </span>
                                      <p className="text-sm text-gray-700 mt-1">
                                        {pair.match}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    pair.correct 
                                      ? 'bg-green-600 text-white' 
                                      : 'bg-red-600 text-white'
                                  }`}>
                                    {pair.correct ? 'CORRECTO' : 'INCORRECTO'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                            <div className="flex items-center gap-2 text-cyan-800">
                              <span className="text-cyan-600">📊</span>
                              <span className="font-semibold text-sm">Resumen:</span>
                              <span className="text-sm">
                                {result.matchingData.matchedPairs.filter(p => p.correct).length} de {result.matchingData.totalPairs} emparejamientos correctos
                                ({Math.round((result.matchingData.matchedPairs.filter(p => p.correct).length / result.matchingData.totalPairs) * 100)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleLeaveSession}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Salir de la Sesión
          </Button>
        </div>
      );
    }

    if (!currentExercise) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No hay ejercicios disponibles en esta sesión.
          </p>
        </div>
      );
    }

    if (sessionData.status === 'waiting') {
      return (
        <div className="text-center py-12">
          <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Esperando que inicie la sesión</h3>
          <p className="text-muted-foreground">
            El profesor iniciará la sesión pronto. Mantente conectado.
          </p>
        </div>
      );
    }

    if (sessionData.status === 'finished') {
      return (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">¡Sesión Completada!</h3>
          <p className="text-muted-foreground mb-4">
            Has terminado la sesión. Aquí están tus resultados finales:
          </p>
          <div className="bg-muted rounded-lg p-4 max-w-md mx-auto">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-semibold">Ejercicios completados:</div>
                <div>{completedExercises} de {totalExercises}</div>
              </div>
              <div>
                <div className="font-semibold">Progreso:</div>
                <div>{totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0}%</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show exercise navigation if multiple exercises
    const exerciseNavigation = totalExercises > 1 && (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            onClick={() => setCurrentExerciseIndex(Math.max(0, currentExerciseIndex - 1))}
            disabled={currentExerciseIndex === 0 || !exerciseCompleted[currentExerciseIndex - 1]}
            className="no-hover"
          >
            ← Ejercicio Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Ejercicio {currentExerciseIndex + 1} de {totalExercises}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentExerciseIndex(Math.min(totalExercises - 1, currentExerciseIndex + 1))}
            disabled={currentExerciseIndex === totalExercises - 1 || !exerciseCompleted[currentExerciseIndex]}
            className="no-hover"
          >
            Ejercicio Siguiente →
          </Button>
        </div>
        
        {/* Exercise progress indicators */}
        <div className="flex justify-center space-x-2">
          {exercises.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentExerciseIndex
                  ? 'bg-primary'
                  : exerciseCompleted[index]
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    );

    // Debug: Log current exercise data
    console.log('Rendering exercise:', {
      index: currentExerciseIndex,
      id: currentExercise?.id,
      game: currentExercise?.game,
      questionsCount: currentExercise?.questions?.length,
      questions: currentExercise?.questions
    });

    // Render specific exercise type
    const exerciseContent = (() => {
      switch (currentExercise.game) {
        case 'hangman':
          return (
            <HangmanGame
              key={`hangman-${currentExerciseIndex}-${currentExercise.id}`}
              word={currentExercise.word || ''}
              hint={currentExercise.hint || 'Sin pista disponible'}
              studentMode={true}
              onGameComplete={(won, attempts, gameData) => {
                handleExerciseComplete(currentExerciseIndex, won, won ? 1 : 0, 1, undefined, gameData);
              }}
            />
          );
          
        case 'quiz':
          return (
            <QuizGame
              key={`quiz-${currentExerciseIndex}-${currentExercise.id}`}
              questions={currentExercise.questions || []}
              studentMode={true}
              onGameComplete={(score, total, answers) => {
                handleExerciseComplete(currentExerciseIndex, score > 0, score, total, answers);
              }}
            />
          );
          
        case 'fill_in_the_blank':
          return (
            <FillInTheBlankGame
              key={`fill-${currentExerciseIndex}-${currentExercise.id}`}
              questions={currentExercise.questions || []}
              studentMode={true}
              onGameComplete={(score, total, answers) => {
                handleExerciseComplete(currentExerciseIndex, score > 0, score, total, answers);
              }}
            />
          );
          
        case 'flip_cards':
          return (
            <FlipCardsGame
              key={`cards-${currentExerciseIndex}-${currentExercise.id}`}
              cards={currentExercise.cards || []}
              instructions={currentExercise.instructions}
              studentMode={true}
              onGameComplete={(viewed, total) => {
                handleExerciseComplete(currentExerciseIndex, viewed === total, viewed, total);
              }}
            />
          );

        case 'drag_and_drop':
          return (
            <DragAndDropGame
              key={`dragdrop-${currentExerciseIndex}-${currentExercise.id}`}
              elements={currentExercise.elements || []}
              correctOrder={currentExercise.correctOrder || []}
              instructions={currentExercise.instructions || 'Arrastra y ordena los elementos en el orden correcto.'}
              explanation={currentExercise.explanation}
              studentMode={true}
              onGameComplete={(score, totalElements, userOrder) => {
                const dragDropGameData = {
                  elements: currentExercise.elements || [],
                  userOrder: userOrder,
                  correctOrder: currentExercise.correctOrder || [],
                  explanation: currentExercise.explanation
                };
                handleExerciseComplete(currentExerciseIndex, score > 0, score, totalElements, undefined, undefined, dragDropGameData);
              }}
            />
          );

        case 'true_or_false':
          return (
            <TrueFalseGame
              key={`truefalse-${currentExerciseIndex}-${currentExercise.id}`}
              trueFalseQuestions={currentExercise.trueFalseQuestions || []}
              studentMode={true}
              onGameComplete={(score, total, answers) => {
                handleExerciseComplete(currentExerciseIndex, score > 0, score, total, undefined, undefined, undefined, answers);
              }}
            />
          );

        case 'roulette':
          return (
            <RouletteGame
              key={`roulette-${currentExerciseIndex}-${currentExercise.id}`}
              phrases={currentExercise.phrases || []}
              instructions={currentExercise.instructions}
              studentMode={true}
              onGameComplete={(selectedPhrase, phraseIndex) => {
                const rouletteGameData = {
                  selectedPhrase: selectedPhrase,
                  phraseIndex: phraseIndex,
                  allPhrases: currentExercise.phrases || []
                };
                handleExerciseComplete(currentExerciseIndex, true, 1, 1, undefined, undefined, undefined, undefined, rouletteGameData);
              }}
            />
          );

        case 'matching':
          return (
            <MatchingGame
              key={`matching-${currentExerciseIndex}-${currentExercise.id}`}
              pairs={currentExercise.pairs || []}
              instructions={currentExercise.instructions}
              studentMode={true}
              onGameComplete={(score, totalPairs, matchedPairs) => {
                const matchingGameData = {
                  matchedPairs: matchedPairs,
                  totalPairs: totalPairs
                };
                handleExerciseComplete(currentExerciseIndex, score > 0, score, totalPairs, undefined, undefined, undefined, undefined, undefined, matchingGameData);
              }}
            />
          );
          
        default:
          return (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Tipo de ejercicio no soportado: {currentExercise.game}
              </p>
            </div>
          );
      }
    })();

    return (
      <div>
        {exerciseNavigation}
        {exerciseContent}
        
        {/* Show completion requirement */}
        {!exerciseCompleted[currentExerciseIndex] && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-800">
              💡 Completa este ejercicio para poder continuar al siguiente
            </p>
          </div>
        )}
      </div>
    );
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

  // Safety checks for exercises data
  if (!sessionData?.exercises || sessionData.exercises.length === 0) {
    console.warn('Session data or exercises are missing:', sessionData);
  }

  // Use default subject info if exercise data is missing
  const subjectInfo = getSubjectInfo(Subject.GENERAL);
  
  // Initialize exercise completion tracking
  React.useEffect(() => {
    if (exercises.length > 0 && exerciseCompleted.length === 0) {
      setExerciseCompleted(new Array(exercises.length).fill(false));
      setExerciseResults(new Array(exercises.length).fill({score: 0, total: 0, type: 'unknown'}));
    }
  }, [exercises.length, exerciseCompleted.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <NavHeader />
      <main className="container mx-auto px-4 py-8">

        {/* Connection Status*/}
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
                <div className="text-2xl font-bold text-primary">{currentExerciseIndex + 1}</div>
                <div className="text-sm text-muted-foreground">Ejercicio Actual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedExercises}</div>
                <div className="text-sm text-muted-foreground">Completados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{totalExercises}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Progreso</div>
              </div>
            </div>
            <Progress 
              value={totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0} 
              className="h-2"
            />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {completedExercises} de {totalExercises} ejercicios completados
            </p>
          </CardContent>
        </Card>

        {/* Exercise Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Ejercicio {currentExerciseIndex + 1}: {currentExercise?.game || 'Actividad'}
              </CardTitle>
              {totalExercises > 1 && (
                <Badge variant="outline">
                  {currentExerciseIndex + 1} de {totalExercises}
                </Badge>
              )}
            </div>
            {currentExercise?.instructions && (
              <CardDescription>
                {currentExercise.instructions}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {renderCurrentExercise()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SessionRoom;
