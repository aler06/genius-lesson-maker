import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface QuizGameProps {
  questions: Question[];
  onGameComplete?: (score: number, totalQuestions: number, answers?: Array<{question: string, selectedAnswer: string, correctAnswer: string, explanation?: string, isCorrect: boolean}>) => void;
  studentMode?: boolean;
}

const QuizGame: React.FC<QuizGameProps> = ({ questions, onGameComplete, studentMode = false }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [userAnswers, setUserAnswers] = useState<Array<{question: string, selectedAnswer: string, correctAnswer: string, explanation?: string, isCorrect: boolean}>>([]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    const answerData = {
      question: currentQuestion.question,
      selectedAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correct_answer,
      explanation: currentQuestion.explanation,
      isCorrect: isCorrect
    };
    const updatedAnswers = [...userAnswers, answerData];
    setUserAnswers(updatedAnswers);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (studentMode) {
      // In student mode, don't show feedback during exercise
      if (isLastQuestion) {
        onGameComplete?.(score + (isCorrect ? 1 : 0), questions.length, updatedAnswers);
      } else {
        // Small delay to show selection, then advance without feedback
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer('');
          setShowResult(false);
        }, 300);
      }
    } else {
      // Teacher mode - show result for each question
      setShowResult(true);
      setTimeout(() => {
        if (isLastQuestion) {
          setGameCompleted(true);
          onGameComplete?.(score + (isCorrect ? 1 : 0), questions.length, [...userAnswers, answerData]);
        } else {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer('');
          setShowResult(false);
        }
      }, 2500);
    }
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setScore(0);
    setGameCompleted(false);
    setStartTime(Date.now());
    setUserAnswers([]);
  };

  if (gameCompleted && !studentMode) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Brain className="h-8 w-8 text-primary" />
            ¡Ejercicio Completado!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl font-bold text-primary">
            {score}/{questions.length}
          </div>
          <p className="text-lg text-muted-foreground">
            Puntuación: {Math.round((score / questions.length) * 100)}%
          </p>
          <Button onClick={resetGame} className="mt-4">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // In student mode, when game is completed, don't render anything (let parent handle transition)
  if (gameCompleted && studentMode) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Pregunta {currentQuestionIndex + 1} de {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-lg font-medium">
          {currentQuestion.question}
        </div>

        <div className="grid gap-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === currentQuestion.correct_answer;
            const isWrong = showResult && isSelected && !isCorrect;
            const showCorrect = showResult && isCorrect;
            
            // In student mode, don't show feedback during exercise
            const shouldShowResult = showResult && !studentMode;

            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "outline"}
                className={`p-4 h-auto text-left justify-start border-2 transition-all duration-200 ${
                  shouldShowResult && showCorrect ? 'bg-green-100 border-green-500 text-green-800 hover:bg-green-100' :
                  shouldShowResult && isWrong ? 'bg-red-100 border-red-500 text-red-800 hover:bg-red-100' :
                  isSelected ? 'bg-primary text-primary-foreground border-primary selected-button' : 
                  'border-border hover:border-primary/50 hover:bg-primary/5 hover:text-foreground'
                }`}
                onClick={() => handleAnswerSelect(option)}
                disabled={showResult}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="flex-1">{option}</span>
                  {shouldShowResult && (
                    <>
                      {showCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {isWrong && <XCircle className="h-4 w-4 text-red-600" />}
                    </>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {showResult && currentQuestion.explanation && !studentMode && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Explicación:</strong> {currentQuestion.explanation}
            </p>
          </div>
        )}

        {!showResult && (
          <Button 
            onClick={handleSubmitAnswer} 
            disabled={!selectedAnswer}
            className="w-full"
          >
            {isLastQuestion ? 'Finalizar Ejercicio' : 'Siguiente Pregunta'}
          </Button>
        )}

        {showResult && (
          <div className="text-center text-sm text-muted-foreground">
            {isLastQuestion ? 'Finalizando ejercicio...' : 'Avanzando a la siguiente pregunta...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuizGame;