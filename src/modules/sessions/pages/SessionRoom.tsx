import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { NavHeader } from '@/components/ui/nav-header';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { authService } from '@/modules/auth/services/auth.service';
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
import { useSessionScores } from '@/modules/sessions/hooks/useSessionScores';

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
    exercises: ((initialSessionData as any).exerciseIds || (initialSessionData as any).exercises || []).map((ex: any) => ({
      ...ex,
      id: ex.id || ex._id, // Ensure id property exists
    }))
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
    matchingData?: {matchedPairs: Array<{term: string, match: string, correct: boolean, correctMatch?: string}>, totalPairs: number};
  }>>([]);
  const [allExercisesCompleted, setAllExercisesCompleted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, AnswerResult>>({});
  const [isJoined, setIsJoined] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [scoreInitialized, setScoreInitialized] = useState(false);
  const [guestTokenObtained, setGuestTokenObtained] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [existingScore, setExistingScore] = useState<any>(null);
  const [checkingCompletion, setCheckingCompletion] = useState(true);
  const [fiveMinuteWarningShown, setFiveMinuteWarningShown] = useState(false);
  const [oneMinuteWarningShown, setOneMinuteWarningShown] = useState(false);

  // Session scores hook
  const { initializeScore, submitAnswer: submitScoreAnswer, completeSession: completeSessionScore, checkSessionCompletion } = useSessionScores(sessionId);

  // Define variables needed by hooks and functions (must be before hooks that use them)
  const exercises = sessionData?.exercises || [];
  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;
  const completedExercises = exerciseCompleted.filter(Boolean).length;

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
        const exercises = (backendSession.exerciseIds || backendSession.exercises || []).map((ex: any) => ({
          ...ex,
          id: ex.id || ex._id, // Ensure id property exists
        }));
        const mappedSession = {
          ...backendSession,
          teacher: backendSession.teacherId || backendSession.teacher,
          exercises: exercises,
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
        const exercises = (backendSession.exerciseIds || backendSession.exercises || []).map((ex: any) => ({
          ...ex,
          id: ex.id || ex._id, // Ensure id property exists
        }));
        const mappedSession = {
          ...backendSession,
          teacher: backendSession.teacherId || backendSession.teacher,
          exercises: exercises,
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
        const exercises = (backendSession.exerciseIds || backendSession.exercises || []).map((ex: any) => ({
          ...ex,
          id: ex.id || ex._id, // Ensure id property exists
        }));
        const mappedSession = {
          ...backendSession,
          teacher: backendSession.teacherId || backendSession.teacher,
          exercises: exercises,
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

  // Connect to WebSocket on mount
  useEffect(() => {
    // Only connect if we have the required data
    if (currentUser && sessionData && sessionId) {
      connect();
      setConnectionStatus('connecting');
    }

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

  // Get guest token for temporary users
  useEffect(() => {
    const userToUse = currentUser || user;
    const isTemporary = userToUse?.isTemporary;
    const hasToken = !!localStorage.getItem('token');
    
    if (isTemporary && !hasToken && !guestTokenObtained && userToUse) {
      console.log('Getting guest token for temporary user:', userToUse);
      const nombre = userToUse.firstName ? `${userToUse.firstName} ${userToUse.lastName || ''}`.trim() : userToUse.name || 'Estudiante';
      // Use the email from tempUser model (consistent across all sessions)
      const correo = userToUse.email;
      
      authService.guestLogin({ nombre, correo })
        .then((response) => {
          console.log('Guest token obtained successfully:', response);
          setGuestTokenObtained(true);
        })
        .catch((error) => {
          console.error('Error getting guest token:', error);
          toast({
            title: 'Error',
            description: 'No se pudo obtener acceso como invitado. Intenta de nuevo.',
            variant: 'destructive',
          });
        });
    }
  }, [currentUser, user, guestTokenObtained, toast]);

  // Check if user has already completed this session
  useEffect(() => {
    const checkCompletion = async () => {
      const userToUse = currentUser || user;
      
      if (!sessionId || !userToUse) {
        setCheckingCompletion(false);
        return;
      }

      // Get user's email
      const correo = userToUse.email || userToUse.correo;
      
      if (!correo) {
        setCheckingCompletion(false);
        return;
      }

      try {
        console.log('🔍 Checking if user already completed session:', { sessionId, correo });
        const existingCompletion = await checkSessionCompletion(sessionId, correo);
        
        if (existingCompletion) {
          console.log('⚠️ User has already completed this session:', existingCompletion);
          setAlreadyCompleted(true);
          setExistingScore(existingCompletion);
          
          toast({
            title: '⚠️ Sesión ya completada',
            description: `Ya completaste esta sesión con un puntaje de ${existingCompletion.puntajeFinal?.toFixed(1) || 0} puntos. No puedes volver a enviar respuestas.`,
            variant: 'default',
          });
        } else {
          console.log('✅ User has not completed this session yet');
          setAlreadyCompleted(false);
        }
      } catch (error) {
        console.error('Error checking session completion:', error);
        // If there's an error, allow the user to continue (fail open)
        setAlreadyCompleted(false);
      } finally {
        setCheckingCompletion(false);
      }
    };

    // Only check after we have a token (for temporary users) or immediately for authenticated users
    const userToUse = currentUser || user;
    const isTemporary = userToUse?.isTemporary;
    const hasToken = !!localStorage.getItem('token');
    
    if (userToUse && (!isTemporary || (isTemporary && hasToken))) {
      checkCompletion();
    }
  }, [sessionId, currentUser, user, guestTokenObtained, checkSessionCompletion, toast]);

  // Start timer when session is joined
  useEffect(() => {
    if (isJoined && sessionId && !scoreInitialized) {
      console.log('Session joined - starting timer');
      setScoreInitialized(true);
      setSessionStartTime(Date.now());
      
      // Initialize countdown timer based on session duration
      if (sessionData?.duration) {
        setTimeRemaining(sessionData.duration * 60); // Convert minutes to seconds
        setTimerStarted(true);
      }
    }
  }, [isJoined, sessionId, scoreInitialized, sessionData?.duration]);

  // Countdown timer effect with warnings
  useEffect(() => {
    if (!timerStarted || timeRemaining <= 0 || allExercisesCompleted) {
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show 5 minute warning
        if (newTime === 300 && !fiveMinuteWarningShown) {
          setFiveMinuteWarningShown(true);
          toast({
            title: "⏰ 5 minutos restantes",
            description: "La sesión está por terminar. Apresúrate a completar los ejercicios.",
            variant: "default",
          });
        }
        
        // Show 1 minute warning
        if (newTime === 60 && !oneMinuteWarningShown) {
          setOneMinuteWarningShown(true);
          toast({
            title: "⚠️ 1 minuto restante",
            description: "¡Último minuto! La sesión terminará pronto.",
            variant: "destructive",
          });
        }
        
        if (newTime <= 0) {
          setTimeExpired(true);
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerStarted, timeRemaining, allExercisesCompleted, fiveMinuteWarningShown, oneMinuteWarningShown, toast]);

  // Auto-submit when time expires
  useEffect(() => {
    if (timeExpired && !allExercisesCompleted) {
      console.log('⏰ Time expired - auto-submitting answers');
      handleTimeExpired();
    }
  }, [timeExpired]);

  useEffect(() => {
    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
  }, [isConnected]);

  // Initialize exercise completion tracking
  useEffect(() => {
    if (exercises.length > 0 && exerciseCompleted.length === 0) {
      setExerciseCompleted(new Array(exercises.length).fill(false));
      setExerciseResults(new Array(exercises.length).fill({score: 0, total: 0, type: 'unknown'}));
    }
  }, [exercises.length, exerciseCompleted.length]);

  // Validation and redirect - must be AFTER all hooks
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    if (!sessionData || !sessionId) {
      navigate('/');
      return;
    }
  }, [currentUser, sessionData, sessionId, navigate]);

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

  // Handle time expiration - auto-submit all answers
  const handleTimeExpired = () => {
    const userToUse = currentUser || user;
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    // Mark all exercises as completed (even if not finished)
    const completedStatus = exercises.map((_, idx) => exerciseCompleted[idx] || false);
    setExerciseCompleted(completedStatus);

    // Build results for all exercises (completed and not completed)
    const allResults = exercises.map((exercise, idx) => {
      // If exercise was already completed, use existing result
      if (exerciseResults[idx]) {
        return exerciseResults[idx];
      }
      
      // For incomplete exercises, create empty result
      return {
        score: 0,
        total: getExerciseTotal(exercise),
        type: exercise.game || 'unknown',
        answers: exercise.questions?.map((q: any) => ({
          question: q.question || q.sentence || '',
          selectedAnswer: '',
          correctAnswer: q.correct_answer || '',
          explanation: q.explanation,
          isCorrect: false
        })),
        trueFalseData: exercise.trueFalseQuestions?.map((q: any) => ({
          statement: q.statement || '',
          selectedAnswer: false,
          correctAnswer: q.correctAnswer || false,
          explanation: q.explanation || '',
          isCorrect: false
        }))
      };
    });

    setExerciseResults(allResults);
    setAllExercisesCompleted(true);

    // Calculate final score
    const totalCorrect = allResults.reduce((sum, result) => sum + (result?.score || 0), 0);
    const totalQuestions = allResults.reduce((sum, result) => sum + (result?.total || 0), 0);
    const MAX_SCORE = 20;
    const finalScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * MAX_SCORE : 0;
    const roundedFinalScore = Math.round(finalScore * 100) / 100;

    // Submit to backend
    if (sessionId && userToUse) {
      const nombre = userToUse.firstName ? `${userToUse.firstName} ${userToUse.lastName || ''}`.trim() : userToUse.name || 'Estudiante';
      // Use the email from tempUser model (consistent across all sessions)
      const correo = userToUse.email || userToUse.correo;
      
      const allAnswers: any[] = [];
      
      allResults.forEach((result, idx) => {
        if (!result) return;
        const exercise = exercises[idx];
        if (!exercise?.id) return;
        
        const totalExercisesCompleted = allResults.filter(r => r).length;
        
        if (result.answers && result.answers.length > 0) {
          result.answers.forEach((answer: any, qIdx: number) => {
            const question = exercise.questions?.[qIdx];
            allAnswers.push({
              exerciseId: exercise.id,
              questionId: question?._id || `${exercise.id}-q${qIdx}`,
              answer: answer.selectedAnswer || '',
              isCorrect: answer.isCorrect,
              timeSpent: Math.floor(timeSpent / totalExercisesCompleted / (result.answers?.length || 1))
            });
          });
        } else if (result.trueFalseData && result.trueFalseData.length > 0) {
          result.trueFalseData.forEach((answer: any, qIdx: number) => {
            const question = exercise.trueFalseQuestions?.[qIdx];
            allAnswers.push({
              exerciseId: exercise.id,
              questionId: question?._id || `${exercise.id}-tf${qIdx}`,
              answer: answer.selectedAnswer.toString(),
              isCorrect: answer.isCorrect,
              timeSpent: Math.floor(timeSpent / totalExercisesCompleted / (result.trueFalseData?.length || 1))
            });
          });
        }
      });
      
      // Only submit if user hasn't already completed this session
      if (!alreadyCompleted) {
        completeSessionScore({
          sessionId: sessionId,
          nombre: nombre,
          correo: correo,
          puntajeFinal: roundedFinalScore,
          tiempoTotal: timeSpent,
          respuestas: allAnswers
        });
      } else {
        console.log('⚠️ Skipping score submission - user already completed this session');
      }
    }

    toast({
      title: "⏰ Tiempo agotado",
      description: alreadyCompleted 
        ? `Tiempo agotado. Tu puntaje anterior de ${existingScore?.puntajeFinal?.toFixed(1) || 0}/20 se mantiene.`
        : `Se han enviado tus respuestas. Puntuación: ${roundedFinalScore}/20`,
      variant: "destructive"
    });
  };

  // Helper function to get total questions for an exercise
  const getExerciseTotal = (exercise: any): number => {
    if (exercise.questions?.length) return exercise.questions.length;
    if (exercise.trueFalseQuestions?.length) return exercise.trueFalseQuestions.length;
    if (exercise.pairs?.length) return exercise.pairs.length;
    return 1; // For games like hangman, drag&drop, etc.
  };

  const handleExerciseComplete = (exerciseIndex: number, success: boolean, score?: number, total?: number, quizAnswers?: Array<{question: string, selectedAnswer: string, correctAnswer: string, explanation?: string, isCorrect: boolean}>, hangmanData?: {word: string, hint?: string, guessedLetters: string[], wrongGuesses: number}, dragDropData?: {elements: Array<{id: number, texto: string}>, userOrder: number[], correctOrder: number[], explanation?: string}, trueFalseData?: Array<{statement: string, selectedAnswer: boolean, correctAnswer: boolean, explanation: string, isCorrect: boolean}>, rouletteData?: {selectedPhrase: string, phraseIndex: number, allPhrases: Array<{text: string}>}, matchingData?: {matchedPairs: Array<{term: string, match: string, correct: boolean, correctMatch?: string}>, totalPairs: number}) => {
    const userToUse = currentUser || user;
    const exerciseId = currentExercise?.id || exercises[exerciseIndex]?.id;
    const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);

    // NOTE: We no longer submit individual answers to the backend during the session
    // All results will be submitted at the end when the session is completed
    // This simplifies the system and avoids synchronization issues

    // Mark exercise as completed
    setExerciseCompleted(prev => {
      const newCompleted = [...prev];
      newCompleted[exerciseIndex] = true;
      return newCompleted;
    });

    // Save exercise result and get updated results
    const currentResult = {
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

    setExerciseResults(prev => {
      const newResults = [...prev];
      newResults[exerciseIndex] = currentResult;
      return newResults;
    });

    // Auto advance to next exercise after short delay
    setTimeout(() => {
      if (exerciseIndex < totalExercises - 1) {
        // Just advance to next exercise without toast
        setCurrentExerciseIndex(exerciseIndex + 1);
      } else {
        // All exercises completed - show toast and complete session
        setAllExercisesCompleted(true);
        
        // Build complete results array including current exercise
        const completeResults = [...exerciseResults];
        completeResults[exerciseIndex] = currentResult;
        
        // Calculate score out of 20 points
        const totalCorrect = completeResults.reduce((sum, result) => sum + (result?.score || 0), 0);
        const totalQuestions = completeResults.reduce((sum, result) => sum + (result?.total || 0), 0);
        const MAX_SCORE = 20;
        const finalScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * MAX_SCORE : 0;
        const roundedFinalScore = Math.round(finalScore * 100) / 100; // Round to 2 decimals
        const finalPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        
        // Submit final results to backend
        if (sessionId && userToUse) {
          const nombre = userToUse.firstName ? `${userToUse.firstName} ${userToUse.lastName || ''}`.trim() : userToUse.name || 'Estudiante';
          // Use the email from tempUser model (consistent across all sessions)
          const correo = userToUse.email || userToUse.correo;
          
          console.log('📊 Submitting final session results:', {
            totalCorrect,
            totalQuestions,
            finalScore: roundedFinalScore,
            timeSpent,
            exercisesCompleted: completeResults.filter(r => r).length,
            nombre,
            correo
          });
          
          // Submit all answers at once
          const allAnswers: any[] = [];
          
          // Process all completed exercises
          completeResults.forEach((result, idx) => {
            if (!result) return;
            const exercise = exercises[idx];
            console.log('🔍 Processing exercise:', { idx, exerciseId: exercise?.id, resultType: result.type, hasAnswers: !!result.answers, answersLength: result.answers?.length });
            
            if (!exercise?.id) {
              console.log('⚠️ Skipping - no exercise ID');
              return;
            }
            
            const totalExercisesCompleted = completeResults.filter(r => r).length;
            
            // Quiz answers
            if (result.answers && result.answers.length > 0) {
              result.answers.forEach((answer: any, qIdx: number) => {
                const question = exercise.questions?.[qIdx];
                allAnswers.push({
                  exerciseId: exercise.id,
                  questionId: question?._id || `${exercise.id}-q${qIdx}`,
                  answer: answer.selectedAnswer,
                  isCorrect: answer.isCorrect,
                  timeSpent: Math.floor(timeSpent / totalExercisesCompleted / result.answers.length)
                });
              });
            }
            // True/False answers
            else if (result.trueFalseData && result.trueFalseData.length > 0) {
              result.trueFalseData.forEach((answer: any, qIdx: number) => {
                const question = exercise.trueFalseQuestions?.[qIdx];
                allAnswers.push({
                  exerciseId: exercise.id,
                  questionId: question?._id || `${exercise.id}-tf${qIdx}`,
                  answer: answer.selectedAnswer.toString(),
                  isCorrect: answer.isCorrect,
                  timeSpent: Math.floor(timeSpent / totalExercisesCompleted / result.trueFalseData.length)
                });
              });
            }
            // Hangman
            else if (result.hangmanData) {
              allAnswers.push({
                exerciseId: exercise.id,
                questionId: `${exercise.id}-hangman`,
                answer: result.hangmanData.word,
                isCorrect: result.hangmanData.wrongGuesses <= 6,
                timeSpent: Math.floor(timeSpent / totalExercisesCompleted)
              });
            }
            // Drag and Drop
            else if (result.dragDropData) {
              allAnswers.push({
                exerciseId: exercise.id,
                questionId: `${exercise.id}-dragdrop`,
                answer: JSON.stringify(result.dragDropData.userOrder),
                isCorrect: JSON.stringify(result.dragDropData.userOrder) === JSON.stringify(result.dragDropData.correctOrder),
                timeSpent: Math.floor(timeSpent / totalExercisesCompleted)
              });
            }
            // Matching
            else if (result.matchingData) {
              allAnswers.push({
                exerciseId: exercise.id,
                questionId: `${exercise.id}-matching`,
                answer: JSON.stringify(result.matchingData.matchedPairs),
                isCorrect: result.matchingData.matchedPairs.every((p: any) => p.correct),
                timeSpent: Math.floor(timeSpent / totalExercisesCompleted)
              });
            }
          });
          
          // Only submit if user hasn't already completed this session
          if (!alreadyCompleted) {
            console.log('📤 Sending to backend:', {
              answersCount: allAnswers.length,
              puntajeFinal: roundedFinalScore,
              tiempoTotal: timeSpent
            });
            
            completeSessionScore({
              sessionId: sessionId,
              nombre: nombre,
              correo: correo,
              puntajeFinal: roundedFinalScore,
              tiempoTotal: timeSpent,
              respuestas: allAnswers
            });
          } else {
            console.log('⚠️ Skipping score submission - user already completed this session');
          }
        }
        
        toast({
          title: "¡Sesión completada!",
          description: alreadyCompleted 
            ? `Has terminado los ejercicios. Tu puntaje anterior de ${existingScore?.puntajeFinal?.toFixed(1) || 0}/20 se mantiene.`
            : `Has terminado todos los ejercicios. Puntuación final: ${roundedFinalScore}/20 (${finalPercentage}%)`,
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
      
      // Calculate final grade out of 20
      const MAX_SCORE = 20;
      const finalGrade = totalQuestions > 0 ? (totalScore / totalQuestions) * MAX_SCORE : 0;
      const roundedFinalGrade = Math.round(finalGrade * 100) / 100;
      
      // Determine grade color and message
      const getGradeColor = (grade: number) => {
        if (grade >= 18) return 'text-green-600';
        if (grade >= 14) return 'text-blue-600';
        if (grade >= 10) return 'text-yellow-600';
        return 'text-red-600';
      };
      
      const getGradeMessage = (grade: number) => {
        if (grade >= 18) return '¡Excelente trabajo!';
        if (grade >= 14) return '¡Muy bien!';
        if (grade >= 10) return '¡Buen esfuerzo!';
        return 'Sigue practicando 💪';
      };

      return (
        <div className="text-center py-12">
          <Trophy className="h-24 w-24 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">¡Sesión Completada!</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Has terminado todos los ejercicios de la sesión
          </p>
          
          {/* Final Grade Card - Prominent Display */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary rounded-xl p-8 max-w-md mx-auto mb-8 shadow-lg">
            <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Tu Calificación Final
            </div>
            <div className={`text-7xl font-bold ${getGradeColor(roundedFinalGrade)} mb-3`}>
              {roundedFinalGrade}
              <span className="text-4xl text-muted-foreground">/20</span>
            </div>
            <div className="text-xl font-semibold text-foreground mb-2">
              {getGradeMessage(roundedFinalGrade)}
            </div>
            <div className="text-sm text-muted-foreground">
              Equivalente a {percentage}% de precisión
            </div>
          </div>
          
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
              {exerciseResults.map((result, index) => {
                console.log('📋 Rendering result summary:', { 
                  index, 
                  type: result.type, 
                  hasMatchingData: !!result.matchingData,
                  matchingData: result.matchingData 
                });
                return (
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
                      {result.answers.map((answer, qIndex) => {
                        const wasNotAnswered = !answer.selectedAnswer || answer.selectedAnswer === '';
                        return (
                        <div key={qIndex} className={`p-4 rounded-lg border-l-4 shadow-sm ${
                          answer.isCorrect 
                            ? 'border-l-green-500 bg-green-50 border border-green-200' 
                            : wasNotAnswered
                            ? 'border-l-gray-500 bg-gray-50 border border-gray-200'
                            : 'border-l-red-500 bg-red-50 border border-red-200'
                        }`}>
                          <div className="font-semibold text-sm mb-3 text-gray-800">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-bold mr-2">
                              {qIndex + 1}
                            </span>
                            {answer.question}
                          </div>
                          
                          <div className="space-y-2">
                            {!wasNotAnswered && (
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
                            )}
                            
                            {wasNotAnswered && (
                              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                <span className="text-lg text-gray-600">⊘</span>
                                <div className="flex-1">
                                  <span className="font-medium text-sm text-gray-700">No respondida</span>
                                </div>
                              </div>
                            )}
                            
                            {(!answer.isCorrect || wasNotAnswered) && (
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
                      );
                      })}
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
                        Detalles de la Ruleta
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
                                    💡 Esta frase fue seleccionada aleatoriamente
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
                                  
                                  <div className="flex-1 space-y-3">
                                    <div>
                                      <span className="text-xs font-medium uppercase tracking-wide text-gray-600">
                                        Término
                                      </span>
                                      <p className="text-sm font-medium text-gray-800 mt-1">
                                        {pair.term}
                                      </p>
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <span className={`text-xs font-medium uppercase tracking-wide ${
                                          pair.correct ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          Tu emparejamiento
                                        </span>
                                        <p className={`text-sm mt-1 ${
                                          pair.correct ? 'text-gray-700' : 'text-red-700 font-medium'
                                        }`}>
                                          {pair.match}
                                        </p>
                                      </div>
                                      
                                      {!pair.correct && pair.correctMatch && (
                                        <div>
                                          <span className="text-xs font-medium uppercase tracking-wide text-green-600">
                                            Emparejamiento correcto
                                          </span>
                                          <p className="text-sm text-green-700 font-medium mt-1">
                                            {pair.correctMatch}
                                          </p>
                                        </div>
                                      )}
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
              );
              })}
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
      questions: currentExercise?.questions,
      pairs: currentExercise?.pairs,
      pairsCount: currentExercise?.pairs?.length
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
                // Calculate score with penalties for hangman based on wrong guesses
                const wrongGuesses = gameData?.wrongGuesses || 0;
                let finalScore = 0;
                
                if (won) {
                  // Penalty system based on errors:
                  // 0-2 errors: full score (1.0)
                  // 3 errors: 0.85
                  // 4 errors: 0.70
                  // 5 errors: 0.55
                  // 6 errors: 0.40
                  if (wrongGuesses <= 2) {
                    finalScore = 1.0;
                  } else if (wrongGuesses === 3) {
                    finalScore = 0.85;
                  } else if (wrongGuesses === 4) {
                    finalScore = 0.70;
                  } else if (wrongGuesses === 5) {
                    finalScore = 0.55;
                  } else if (wrongGuesses === 6) {
                    finalScore = 0.40;
                  }
                }
                
                console.log('🎮 Hangman score calculation:', {
                  won,
                  wrongGuesses,
                  finalScore
                });
                
                handleExerciseComplete(currentExerciseIndex, won, finalScore, 1, undefined, gameData);
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
                // Calculate score with penalties for drag and drop
                const correctOrder = currentExercise.correctOrder || [];
                let correctPositions = 0;
                
                userOrder.forEach((elementId, index) => {
                  if (correctOrder[index] === elementId) {
                    correctPositions++;
                  }
                });
                
                // Proportional score based on correct positions
                const finalScore = correctPositions / totalElements;
                
                console.log('🔀 Drag & Drop score calculation:', {
                  correctPositions,
                  totalElements,
                  rawScore: score,
                  finalScore,
                  userOrder,
                  correctOrder
                });
                
                const dragDropGameData = {
                  elements: currentExercise.elements || [],
                  userOrder: userOrder,
                  correctOrder: correctOrder,
                  explanation: currentExercise.explanation
                };
                handleExerciseComplete(currentExerciseIndex, finalScore > 0, finalScore, 1, undefined, undefined, dragDropGameData);
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
          console.log('🔗 Rendering MatchingGame with:', {
            pairs: currentExercise.pairs,
            pairsCount: currentExercise.pairs?.length,
            instructions: currentExercise.instructions
          });
          
          // Show loading if pairs are not loaded yet
          if (!currentExercise.pairs || currentExercise.pairs.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Cargando ejercicio de emparejamiento...</p>
              </div>
            );
          }
          
          return (
            <MatchingGame
              key={`matching-${currentExerciseIndex}-${currentExercise.id}`}
              pairs={currentExercise.pairs}
              instructions={currentExercise.instructions}
              studentMode={true}
              onGameComplete={(score, totalPairs, matchedPairs) => {
                // Calculate score with penalties for matching
                const correctPairs = matchedPairs.filter(p => p.correct).length;
                const incorrectPairs = matchedPairs.filter(p => !p.correct).length;
                
                // Proportional score: correct pairs minus penalty for incorrect ones
                const finalScore = Math.max(0, correctPairs - (incorrectPairs * 0.5));
                
                console.log('🔗 Matching score calculation:', {
                  correctPairs,
                  incorrectPairs,
                  rawScore: score,
                  finalScore,
                  totalPairs
                });
                
                const matchingGameData = {
                  matchedPairs: matchedPairs,
                  totalPairs: totalPairs
                };
                handleExerciseComplete(currentExerciseIndex, finalScore > 0, finalScore, totalPairs, undefined, undefined, undefined, undefined, undefined, matchingGameData);
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

  // Show loading screen while checking if user already completed
  if (checkingCompletion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="text-center p-8">
              <CardContent>
                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Verificando sesión...</h2>
                <p className="text-muted-foreground">
                  Comprobando tu progreso anterior
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Show special screen if user already completed this session
  if (alreadyCompleted && existingScore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-2xl border-2 border-yellow-500">
              <CardHeader className="text-center bg-gradient-to-r from-yellow-50 to-amber-50 border-b">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <CardTitle className="text-3xl font-bold text-gray-900">
                  🚫 Acceso Denegado
                </CardTitle>
                <CardDescription className="text-lg text-gray-700 mt-2">
                  Ya completaste esta sesión. No puedes volver a entrar.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Score Display */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Tu Puntaje Registrado</p>
                    <p className="text-5xl font-bold text-blue-600">
                      {existingScore.puntajeFinal?.toFixed(1) || 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">de 20 puntos</p>
                  </div>
                </div>

                {/* Info Message */}
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-gray-700">
                    <strong>Solo puedes completar cada sesión una vez.</strong>
                    <br />
                    Para mantener la integridad de los resultados, cada estudiante tiene un solo intento por sesión. Tu puntaje anterior ha sido guardado y no puede ser modificado. Puedes unirte a otras sesiones diferentes.
                  </AlertDescription>
                </Alert>

                {/* Session Info */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Sesión:</span>
                    <span>{sessionData?.name || 'Sin nombre'}</span>
                  </div>
                  {existingScore.tiempoTotal && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Tiempo empleado:</span>
                      <span>{Math.floor(existingScore.tiempoTotal / 60)} minutos</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Fecha de completitud:</span>
                    <span>
                      {existingScore.createdAt 
                        ? new Date(existingScore.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'No disponible'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => navigate('/')}
                    className="flex-1"
                    variant="default"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Volver al Inicio
                  </Button>
                </div>
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
                    {participantCount} / {sessionData.maxParticipants || '∞'} participantes
                  </Badge>

                  {sessionData.duration && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sessionData.duration} min
                    </Badge>
                  )}
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

        {/* Timer Card - Show countdown */}
        {timerStarted && !allExercisesCompleted && (
          <Card className={`mb-6 ${timeRemaining <= 60 ? 'border-red-500 bg-red-50' : timeRemaining <= 300 ? 'border-yellow-500 bg-yellow-50' : 'border-blue-500 bg-blue-50'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-4">
                <Clock className={`h-8 w-8 ${timeRemaining <= 60 ? 'text-red-600 animate-pulse' : timeRemaining <= 300 ? 'text-yellow-600' : 'text-blue-600'}`} />
                <div className="text-center">
                  <div className={`text-4xl font-bold ${timeRemaining <= 60 ? 'text-red-600' : timeRemaining <= 300 ? 'text-yellow-600' : 'text-blue-600'}`}>
                    {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {timeRemaining <= 60 ? '⚠️ ¡Tiempo casi agotado!' : timeRemaining <= 300 ? '⏰ Quedan pocos minutos' : 'Tiempo restante'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
