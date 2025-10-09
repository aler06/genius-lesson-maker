import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';

interface TrueFalseQuestion {
  statement: string;
  correct_answer: boolean;
  explanation: string;
}

interface TrueFalseGameProps {
  trueFalseQuestions: TrueFalseQuestion[];
  onGameComplete?: (score: number, totalQuestions: number, answers?: Array<{statement: string, selectedAnswer: boolean, correctAnswer: boolean, explanation: string, isCorrect: boolean}>) => void;
  studentMode?: boolean;
}

const TrueFalseGame: React.FC<TrueFalseGameProps> = ({ trueFalseQuestions, onGameComplete, studentMode = false }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [userAnswers, setUserAnswers] = useState<Array<{statement: string, selectedAnswer: boolean, correctAnswer: boolean, explanation: string, isCorrect: boolean}>>([]);

  const currentQuestion = trueFalseQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === trueFalseQuestions.length - 1;

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answer: boolean) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    const answerData = {
      statement: currentQuestion.statement,
      selectedAnswer: selectedAnswer,
      correctAnswer: currentQuestion.correct_answer,
      explanation: currentQuestion.explanation,
      isCorrect: isCorrect
    };

    setUserAnswers(prev => [...prev, answerData]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setGameCompleted(true);
      if (onGameComplete) {
        onGameComplete(score, trueFalseQuestions.length, userAnswers);
      }
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setGameCompleted(false);
    setUserAnswers([]);
  };

  if (gameCompleted) {
    const percentage = Math.round((score / trueFalseQuestions.length) * 100);
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
            ¡Juego Completado!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-4">
            <div className="text-6xl font-bold text-primary">
              {score}/{trueFalseQuestions.length}
            </div>
            <div className="text-xl text-muted-foreground">
              Puntuación: {percentage}%
            </div>
            <Badge 
              variant={percentage >= 70 ? "default" : percentage >= 50 ? "secondary" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {percentage >= 70 ? "¡Excelente!" : percentage >= 50 ? "Bien hecho" : "Sigue practicando"}
            </Badge>
          </div>

          {!studentMode && (
            <Button onClick={handleRestart} className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Jugar de nuevo
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ThumbsUp className="h-5 w-5 text-green-500" />
            Verdadero o Falso
          </CardTitle>
          <Badge variant="outline">
            {currentQuestionIndex + 1} de {trueFalseQuestions.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          Puntuación actual: {score}/{currentQuestionIndex + (showResult ? 1 : 0)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium leading-relaxed">
            {currentQuestion.statement}
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant={selectedAnswer === true ? "default" : "outline"}
              size="lg"
              onClick={() => handleAnswerSelect(true)}
              disabled={showResult}
              className={`flex items-center justify-center gap-2 h-14 text-base border-2 transition-all duration-200 ${
                selectedAnswer === true ? 'bg-primary text-primary-foreground border-primary selected-button' : 
                'border-border hover:border-primary/50 hover:bg-primary/5 hover:text-foreground'
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
              Verdadero
            </Button>
            
            <Button
              variant={selectedAnswer === false ? "default" : "outline"}
              size="lg"
              onClick={() => handleAnswerSelect(false)}
              disabled={showResult}
              className={`flex items-center justify-center gap-2 h-14 text-base border-2 transition-all duration-200 ${
                selectedAnswer === false ? 'bg-primary text-primary-foreground border-primary selected-button' : 
                'border-border hover:border-primary/50 hover:bg-primary/5 hover:text-foreground'
              }`}
            >
              <ThumbsDown className="h-5 w-5" />
              Falso
            </Button>
          </div>
        </div>

        {showResult && (
          <div className="space-y-4 p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2">
              {selectedAnswer === currentQuestion.correct_answer ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium">
                {selectedAnswer === currentQuestion.correct_answer ? '¡Correcto!' : 'Incorrecto'}
              </span>
            </div>
            
            <div className="text-sm space-y-2">
              <p>
                <span className="font-medium">Respuesta correcta:</span>{' '}
                <span className="flex items-center gap-1 inline-flex">
                  {currentQuestion.correct_answer ? (
                    <>
                      <ThumbsUp className="h-4 w-4 text-green-500" />
                      Verdadero
                    </>
                  ) : (
                    <>
                      <ThumbsDown className="h-4 w-4 text-red-500" />
                      Falso
                    </>
                  )}
                </span>
              </p>
              
              {currentQuestion.explanation && (
                <div className="mt-3 p-3 bg-blue-50 rounded-md border-l-4 border-blue-400">
                  <p className="text-blue-800">
                    <span className="font-medium">Explicación:</span> {currentQuestion.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Pregunta {currentQuestionIndex + 1} de {trueFalseQuestions.length}
          </div>
          
          {!showResult ? (
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={selectedAnswer === null}
              className="min-w-24 no-hover"
            >
              Confirmar
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="min-w-24 no-hover">
              {isLastQuestion ? 'Finalizar' : 'Siguiente'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrueFalseGame;
