import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Move, CheckCircle, XCircle, RotateCcw, Lightbulb } from 'lucide-react';
import { DragDropElementModel } from '../model/drag-drop-element.model';

interface DragAndDropGameProps {
  elements: DragDropElementModel[];
  correctOrder: number[];
  instructions?: string;
  explanation?: string;
  onGameComplete?: (score: number, totalElements: number, answers?: Array<{element: string, userPosition: number, correctPosition: number, isCorrect: boolean}>) => void;
  studentMode?: boolean;
}

const DragAndDropGame: React.FC<DragAndDropGameProps> = ({ 
  elements, 
  correctOrder, 
  instructions, 
  explanation,
  onGameComplete, 
  studentMode = false 
}) => {
  const [currentOrder, setCurrentOrder] = useState<number[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Array<{element: string, userPosition: number, correctPosition: number, isCorrect: boolean}>>([]);

  useEffect(() => {
    // Initialize with shuffled order
    const shuffled = [...elements.map(el => el.id)].sort(() => Math.random() - 0.5);
    setCurrentOrder(shuffled);
  }, [elements]);

  const handleDragStart = (e: React.DragEvent, elementId: number) => {
    setDraggedItem(elementId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedItem === null) return;

    const draggedIndex = currentOrder.indexOf(draggedItem);
    const newOrder = [...currentOrder];
    
    // Remove dragged item and insert at target position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);
    
    setCurrentOrder(newOrder);
    setDraggedItem(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...currentOrder];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    setCurrentOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === currentOrder.length - 1) return;
    const newOrder = [...currentOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setCurrentOrder(newOrder);
  };

  const handleSubmit = () => {
    const answers = currentOrder.map((elementId, userPosition) => {
      const element = elements.find(el => el.id === elementId);
      const correctPosition = correctOrder.indexOf(elementId);
      return {
        element: element?.texto || '',
        userPosition: userPosition + 1,
        correctPosition: correctPosition + 1,
        isCorrect: userPosition === correctPosition
      };
    });

    const correctCount = answers.filter(answer => answer.isCorrect).length;
    
    setScore(correctCount);
    setUserAnswers(answers);
    setShowResult(true);
    setGameCompleted(true);

    if (onGameComplete) {
      onGameComplete(correctCount, elements.length, answers);
    }
  };

  const handleRestart = () => {
    const shuffled = [...elements.map(el => el.id)].sort(() => Math.random() - 0.5);
    setCurrentOrder(shuffled);
    setShowResult(false);
    setGameCompleted(false);
    setScore(0);
    setUserAnswers([]);
  };

  const getElementById = (id: number) => elements.find(el => el.id === id);

  if (showResult) {
    const percentage = Math.round((score / elements.length) * 100);
    
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {percentage >= 70 ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500" />
            )}
            Resultado del Ejercicio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">
              {score}/{elements.length}
            </div>
            <div className="text-lg text-muted-foreground">
              {percentage}% correcto
            </div>
          </div>

          {explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Explicación:</h4>
                  <p className="text-blue-700">{explanation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="font-semibold">Orden correcto:</h4>
            {correctOrder.map((elementId, index) => {
              const element = getElementById(elementId);
              const userAnswer = userAnswers.find(a => a.element === element?.texto);
              return (
                <div key={elementId} className={`p-3 rounded-lg border-l-4 ${
                  userAnswer?.isCorrect ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-bold">
                        {index + 1}
                      </Badge>
                      <span>{element?.texto}</span>
                    </div>
                    {userAnswer?.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-red-600">
                          Tu posición: {userAnswer?.userPosition}
                        </span>
                        <XCircle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!studentMode && (
            <div className="flex justify-center">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Intentar de nuevo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Move className="h-6 w-6 text-primary" />
          Arrastra y Ordena
        </CardTitle>
        {instructions && (
          <p className="text-muted-foreground mt-2">{instructions}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 <strong>Instrucciones:</strong> Arrastra los elementos para ordenarlos correctamente, 
            o usa los botones ↑ ↓ para mover los elementos.
          </p>
        </div>

        <div className="space-y-3">
          {currentOrder.map((elementId, index) => {
            const element = getElementById(elementId);
            return (
              <div
                key={elementId}
                draggable
                onDragStart={(e) => handleDragStart(e, elementId)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-move transition-all duration-200 hover:border-primary hover:bg-primary/5 ${
                  draggedItem === elementId ? 'opacity-50 scale-95' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-bold">
                      {index + 1}
                    </Badge>
                    <span className="flex-1">{element?.texto}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveDown(index)}
                      disabled={index === currentOrder.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      ↓
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600"
            disabled={gameCompleted}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Verificar Orden
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DragAndDropGame;
