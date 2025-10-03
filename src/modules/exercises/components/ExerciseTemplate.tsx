import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExerciseResponse } from '../model/exercise-response.model';
import { Game } from '../enum/game.enum';
import { HelpCircle, Gamepad2, PuzzleIcon, FlipHorizontal, CheckCircle2, XCircle, Pencil, Trash2, Move } from 'lucide-react';
import HangmanGame from './HangmanGame';
import DragAndDropGame from './DragAndDropGame';
import { useNavigate } from 'react-router-dom';

interface ExerciseTemplateProps {
  exercise: ExerciseResponse;
  onEdit?: (exerciseId: string) => void;
  onDelete?: (exerciseId: string) => void;
  showActions?: boolean;
}

const ExerciseTemplate: React.FC<ExerciseTemplateProps> = ({ 
  exercise,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(exercise.id);
    } else {
      navigate(`/exercise/edit/${exercise.id}`);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      onDelete(exercise.id);
    }
  };
  const getGameIcon = (game: Game) => {
    switch (game) {
      case Game.QUIZ:
        return <HelpCircle className="h-5 w-5" />;
      case Game.HANGMAN:
        return <Gamepad2 className="h-5 w-5" />;
      case Game.FILL_IN_THE_BLANK:
        return <PuzzleIcon className="h-5 w-5" />;
      case Game.FLIP_CARDS:
        return <FlipHorizontal className="h-5 w-5" />;
      case Game.DRAG_AND_DROP:
        return <Move className="h-5 w-5" />;
      default:
        return <HelpCircle className="h-5 w-5" />;
    }
  };

  const getGameName = (game: Game) => {
    switch (game) {
      case Game.QUIZ:
        return 'Quiz Interactivo';
      case Game.HANGMAN:
        return 'Ahorcado';
      case Game.FILL_IN_THE_BLANK:
        return 'Rellenar Espacios';
      case Game.FLIP_CARDS:
        return 'Tarjetas Giratorias';
      case Game.DRAG_AND_DROP:
        return 'Arrastrar y Soltar';
      default:
        return 'Ejercicio';
    }
  };

  const renderQuizTemplate = () => (
    <div className="space-y-4">
      {exercise.questions?.map((question, index) => (
        <Card key={index} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                {index + 1}
              </span>
              {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {question.options?.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={`p-4 rounded-lg border-2 ${
                    option === question.correct_answer
                      ? 'bg-green-100 border-green-400 text-green-900 shadow-md'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option === question.correct_answer ? (
                      <div className="bg-green-600 text-white rounded-full p-1 pointer-events-none">
                        <CheckCircle2 className="h-4 w-4 pointer-events-none" />
                      </div>
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-400 pointer-events-none" />
                    )}
                    <span className={`font-bold text-lg ${
                      option === question.correct_answer ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    <span className={`${
                      option === question.correct_answer 
                        ? 'font-bold text-green-900 text-lg' 
                        : 'text-gray-700'
                    }`}>
                      {option}
                    </span>
                    {option === question.correct_answer && (
                      <div className="ml-auto flex items-center gap-2">
                        <Badge variant="default" className="bg-green-600 text-white font-bold px-3 py-1 pointer-events-none hover:bg-green-600">
                          ✓ CORRECTA
                        </Badge>
                        <div className="bg-green-600 text-white rounded-full p-1 animate-pulse pointer-events-none">
                          <CheckCircle2 className="h-3 w-3 pointer-events-none" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {question.explanation && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Explicación:</strong> {question.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      
      {/* Summary of correct answers */}
      <Card className="bg-green-50 border-green-200 mt-6">
        <CardHeader>
          <CardTitle className="text-lg text-green-800 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 pointer-events-none" />
            Resumen de Respuestas Correctas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {exercise.questions?.map((question, index) => (
              <div key={index} className="bg-white p-3 rounded-lg border border-green-200 text-center">
                <div className="font-bold text-green-800 text-lg">
                  Pregunta {index + 1}
                </div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {String.fromCharCode(65 + (question.options?.indexOf(question.correct_answer) || 0))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHangmanTemplate = () => {
    if (!exercise.word) {
      return (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: No se ha configurado una palabra para el juego del ahorcado.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <HangmanGame 
        word={exercise.word} 
        hint={exercise.hint}
        onGameComplete={(won, attempts) => {
          console.log(`Game completed: ${won ? 'Won' : 'Lost'} with ${attempts} wrong attempts`);
        }}
      />
    );
  };

  const renderFillBlankTemplate = () => (
    <div className="space-y-4">
      {exercise.questions?.map((question, index) => (
        <Card key={index} className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                {index + 1}
              </span>
              Completar la Oración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg font-mono">
                {question.sentence || question.question || 'Oración no disponible'}
              </div>
              
              {question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Opciones:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div 
                        key={optionIndex}
                        className={`p-2 rounded border text-sm ${
                          option === question.correct_answer 
                            ? 'bg-green-50 border-green-200 text-green-800 font-medium' 
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Respuesta correcta:</strong> {question.correct_answer}
                </p>
                {question.explanation && (
                  <p className="text-sm text-orange-700 mt-1">
                    <strong>Explicación:</strong> {question.explanation}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFlipCardsTemplate = () => (
    <div className="grid md:grid-cols-2 gap-4">
      {exercise.cards?.map((card, index) => (
        <Card key={index} className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                {index + 1}
              </span>
              Tarjeta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-sm text-purple-600 font-medium mb-2">Frente:</p>
                <p className="text-purple-800">{card.front}</p>
              </div>
              <div className="p-4 bg-purple-100 border border-purple-300 rounded-lg">
                <p className="text-sm text-purple-600 font-medium mb-2">Reverso:</p>
                <p className="text-purple-900">{card.back}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderDragAndDropTemplate = () => {
    if (!exercise.elements || !exercise.correctOrder) {
      return (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: No se han configurado elementos o el orden correcto para el ejercicio de arrastrar y soltar.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <DragAndDropGame 
        elements={exercise.elements}
        correctOrder={exercise.correctOrder}
        instructions={exercise.instructions || 'Arrastra y ordena los elementos en el orden correcto.'}
        explanation={exercise.explanation}
        onGameComplete={(isCorrect, userOrder, score) => {
          console.log(`Drag and Drop completed: ${isCorrect ? 'Correct' : 'Incorrect'} order, Score: ${score}`);
        }}
      />
    );
  };

  const renderExerciseContent = () => {
    switch (exercise.game) {
      case Game.QUIZ:
        return renderQuizTemplate();
      case Game.HANGMAN:
        return renderHangmanTemplate();
      case Game.FILL_IN_THE_BLANK:
        return renderFillBlankTemplate();
      case Game.FLIP_CARDS:
        return renderFlipCardsTemplate();
      case Game.DRAG_AND_DROP:
        return renderDragAndDropTemplate();
      default:
        return (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Tipo de ejercicio no soportado: {exercise.game}
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {showActions && (
        <div className="flex justify-end gap-2 mb-4">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      )}

      {/* Exercise Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                {getGameIcon(exercise.game)}
              </div>
              <div>
                <CardTitle className="text-xl">
                  {getGameName(exercise.game)}
                </CardTitle>
                <CardDescription>
                  Ejercicio #{exercise.id.slice(-6)}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {new Date(exercise.createdAt).toLocaleDateString('es-ES')}
            </Badge>
          </div>
        </CardHeader>
        {exercise.instructions && (
          <CardContent>
            <div className="p-4 bg-white/50 rounded-lg">
              <p className="text-sm">
                <strong>Instrucciones:</strong> {exercise.instructions}
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Exercise Content */}
      {renderExerciseContent()}
    </div>
  );
};

export default ExerciseTemplate;
