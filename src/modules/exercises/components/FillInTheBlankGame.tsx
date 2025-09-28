import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PenTool, CheckCircle, XCircle, RotateCcw } from 'lucide-react';

interface FillInTheBlankQuestion {
  sentence: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface FillInTheBlankGameProps {
  questions: FillInTheBlankQuestion[];
  onGameComplete?: (score: number, totalQuestions: number) => void;
  studentMode?: boolean;
}

const FillInTheBlankGame: React.FC<FillInTheBlankGameProps> = ({ 
  questions, 
  onGameComplete, 
  studentMode = false 
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // In student mode, advance immediately without showing result
    if (studentMode) {
      if (isLastQuestion) {
        onGameComplete?.(score + (isCorrect ? 1 : 0), questions.length);
      } else {
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setSelectedAnswer('');
          setShowResult(false);
        }, 500);
      }
    } else {
      // Teacher mode - show result
      setShowResult(true);
      setTimeout(() => {
        if (isLastQuestion) {
          setGameCompleted(true);
          onGameComplete?.(score + (isCorrect ? 1 : 0), questions.length);
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
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setGameCompleted(false);
  };

  const renderSentenceWithBlank = (sentence: string, selectedOption?: string) => {
    const parts = sentence.split('____');
    if (parts.length !== 2) {
      return sentence; // Fallback if no blank found
    }

    return (
      <div className="text-lg leading-relaxed">
        {parts[0]}
        <span className={`inline-block min-w-[120px] px-3 py-1 mx-1 rounded border-2 border-dashed text-center font-medium ${
          selectedOption 
            ? showResult 
              ? selectedOption === currentQuestion.correct_answer
                ? 'bg-green-100 border-green-400 text-green-800'
                : 'bg-red-100 border-red-400 text-red-800'
              : 'bg-primary/10 border-primary text-primary'
            : 'border-gray-300 text-gray-400'
        }`}>
          {selectedOption || '____'}
        </span>
        {parts[1]}
      </div>
    );
  };

  if (gameCompleted && !studentMode) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <PenTool className="h-8 w-8 text-primary" />
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
          <p className="text-sm text-muted-foreground">
            Avanzando al siguiente ejercicio...
          </p>
          {!studentMode && (
            <Button onClick={resetGame} className="mt-4">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reiniciar Ejercicio
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }
  
  // In student mode, when game is completed, don't render anything
  if (gameCompleted && studentMode) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Completa la oración {currentQuestionIndex + 1} de {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-6 bg-gray-50 rounded-lg border">
          {renderSentenceWithBlank(currentQuestion.sentence, selectedAnswer)}
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Selecciona la palabra correcta para completar la oración:
          </p>
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentQuestion.correct_answer;
              const isWrong = showResult && isSelected && !isCorrect;
              const showCorrect = showResult && isCorrect;

              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  className={`p-4 h-auto text-left justify-start ${
                    showCorrect ? 'bg-green-100 border-green-500 text-green-800' :
                    isWrong ? 'bg-red-100 border-red-500 text-red-800' :
                    isSelected ? 'bg-primary text-primary-foreground' : ''
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="flex-1">{option}</span>
                    {showResult && (
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
        </div>

        {showResult && currentQuestion.explanation && (
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
            {isLastQuestion ? 'Finalizar Ejercicio' : 'Siguiente Oración'}
          </Button>
        )}

        {showResult && (
          <div className="text-center text-sm text-muted-foreground">
            {isLastQuestion ? 'Finalizando ejercicio...' : 'Avanzando a la siguiente oración...'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FillInTheBlankGame;