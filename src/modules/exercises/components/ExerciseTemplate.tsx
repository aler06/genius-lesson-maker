import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExerciseResponse } from '../model/exercise-response.model';
import { Game } from '../enum/game.enum';
import { HelpCircle, Gamepad2, PuzzleIcon, FlipHorizontal, CheckCircle2, XCircle, Pencil, Trash2, Move, CheckSquare, Target, Link2 } from 'lucide-react';
import HangmanGame from './HangmanGame';
import RouletteGame from './RouletteGame';
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
      case Game.TRUE_OR_FALSE:
        return <CheckSquare className="h-5 w-5" />;
      case Game.ROULETTE:
        return <Target className="h-5 w-5" />;
      case Game.MATCHING:
        return <Link2 className="h-5 w-5" />;
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
      case Game.TRUE_OR_FALSE:
        return 'Verdadero o Falso';
      case Game.ROULETTE:
        return 'Ruleta de Reflexión';
      case Game.MATCHING:
        return 'Emparejamiento';
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
      <div className="space-y-6">
        {/* Answer Card */}
        <Card className="border-l-4 border-l-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Respuesta Correcta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-6 bg-white border border-green-200 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">Palabra:</p>
                <p className="text-4xl font-bold text-green-700 tracking-wider">
                  {exercise.word}
                </p>
              </div>
              {exercise.hint && (
                <div className="p-4 bg-green-100 border-l-4 border-green-500 rounded">
                  <p className="text-sm text-green-800">
                    <strong>Pista:</strong> {exercise.hint}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Interactive Game */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vista Previa del Juego</CardTitle>
            <CardDescription>Así es como los estudiantes verán el ejercicio</CardDescription>
          </CardHeader>
          <CardContent>
            <HangmanGame 
              word={exercise.word} 
              hint={exercise.hint}
              onGameComplete={(won, attempts) => {
                console.log(`Game completed: ${won ? 'Won' : 'Lost'} with ${attempts} wrong attempts`);
              }}
            />
          </CardContent>
        </Card>
      </div>
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
      <Card className="border-l-4 border-l-indigo-500 bg-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg text-indigo-800 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Orden Correcto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {exercise.correctOrder.map((elementId, index) => {
              const element = exercise.elements?.find(el => el.id === elementId);
              return (
                <div key={elementId} className="p-4 bg-white border border-indigo-200 rounded-lg flex items-center gap-3">
                  <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">{element?.texto}</span>
                </div>
              );
            })}
          </div>
          {exercise.explanation && (
            <div className="mt-4 p-4 bg-indigo-100 border-l-4 border-indigo-500 rounded">
              <p className="text-sm text-indigo-800">
                <strong>Explicación:</strong> {exercise.explanation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderTrueFalseTemplate = () => {
    if (!exercise.trueFalseQuestions || exercise.trueFalseQuestions.length === 0) {
      return (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: No se han configurado preguntas de verdadero o falso.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-l-4 border-l-teal-500 bg-teal-50">
        <CardHeader>
          <CardTitle className="text-lg text-teal-800 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Respuestas Correctas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exercise.trueFalseQuestions.map((question, index) => (
              <div key={index} className="p-4 bg-white border border-teal-200 rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                  <span className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-800 flex-1">{question.statement}</span>
                </div>
                <div className="ml-9 p-3 bg-green-100 border border-green-300 rounded">
                  <div className="flex items-center gap-2">
                    {question.correct_answer ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800">Verdadero</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="font-semibold text-red-800">Falso</span>
                      </>
                    )}
                  </div>
                </div>
                {question.explanation && (
                  <div className="ml-9 mt-2 p-3 bg-teal-100 border-l-4 border-teal-500 rounded">
                    <p className="text-sm text-teal-800">
                      <strong>Explicación:</strong> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRouletteTemplate = () => {
    if (!exercise.phrases || exercise.phrases.length === 0) {
      return (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: No se han configurado frases para la ruleta.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Phrases List Card */}
        <Card className="border-l-4 border-l-rose-500 bg-rose-50">
          <CardHeader>
            <CardTitle className="text-lg text-rose-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Frases de Reflexión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {exercise.phrases.map((phrase, index) => (
                <div key={index} className="p-4 bg-white border border-rose-200 rounded-lg flex items-start gap-3">
                  <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">{phrase.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-rose-100 border-l-4 border-rose-500 rounded">
              <p className="text-sm text-rose-800">
                💡 La ruleta seleccionará aleatoriamente una de estas frases para que el estudiante reflexione.
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Interactive Game */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vista Previa del Juego</CardTitle>
            <CardDescription>Así es como los estudiantes verán el ejercicio</CardDescription>
          </CardHeader>
          <CardContent>
            <RouletteGame 
              phrases={exercise.phrases}
              instructions={exercise.instructions}
              onGameComplete={(selectedPhrase, phraseIndex) => {
                console.log(`Roulette completed: Selected phrase "${selectedPhrase}" at index ${phraseIndex}`);
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderMatchingTemplate = () => {
    if (!exercise.pairs || exercise.pairs.length === 0) {
      return (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: No se han configurado pares para el juego de emparejamiento.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border-l-4 border-l-cyan-500 bg-cyan-50">
        <CardHeader>
          <CardTitle className="text-lg text-cyan-800 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Emparejamientos Correctos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exercise.pairs.map((pair, index) => (
              <div key={index} className="p-4 bg-white border border-cyan-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="flex-1 flex items-center gap-4">
                    <div className="flex-1 p-3 bg-blue-100 border border-blue-200 rounded">
                      <p className="text-xs text-gray-600 font-medium mb-1">Término:</p>
                      <p className="text-gray-800 font-medium">{pair.term}</p>
                    </div>
                    <div className="text-cyan-600 font-bold text-xl">↔</div>
                    <div className="flex-1 p-3 bg-green-100 border border-green-200 rounded">
                      <p className="text-xs text-gray-600 font-medium mb-1">Definición:</p>
                      <p className="text-gray-800">{pair.match}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
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
      case Game.TRUE_OR_FALSE:
        return renderTrueFalseTemplate();
      case Game.ROULETTE:
        return renderRouletteTemplate();
      case Game.MATCHING:
        return renderMatchingTemplate();
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
