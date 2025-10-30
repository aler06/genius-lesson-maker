import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ExerciseResponse } from '../model/exercise-response.model';
import { Game } from '../enum/game.enum';
import {
  Brain,
  HelpCircle,
  PenTool,
  RotateCcw,
  Move,
  CheckSquare,
  Target,
  Link2,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface ExerciseAnswersModalProps {
  exercise: ExerciseResponse | null;
  open: boolean;
  onClose: () => void;
}

const getGameIcon = (game: Game) => {
  switch (game) {
    case Game.QUIZ:
      return <Brain className="h-5 w-5" />;
    case Game.HANGMAN:
      return <HelpCircle className="h-5 w-5" />;
    case Game.FILL_IN_THE_BLANK:
      return <PenTool className="h-5 w-5" />;
    case Game.FLIP_CARDS:
      return <RotateCcw className="h-5 w-5" />;
    case Game.DRAG_AND_DROP:
      return <Move className="h-5 w-5" />;
    case Game.TRUE_OR_FALSE:
      return <CheckSquare className="h-5 w-5" />;
    case Game.ROULETTE:
      return <Target className="h-5 w-5" />;
    case Game.MATCHING:
      return <Link2 className="h-5 w-5" />;
    default:
      return <Brain className="h-5 w-5" />;
  }
};

const getGameName = (game: Game) => {
  switch (game) {
    case Game.QUIZ:
      return 'Quiz';
    case Game.HANGMAN:
      return 'Ahorcado';
    case Game.FILL_IN_THE_BLANK:
      return 'Rellenar espacios';
    case Game.FLIP_CARDS:
      return 'Tarjetas giratorias';
    case Game.DRAG_AND_DROP:
      return 'Arrastrar y soltar';
    case Game.TRUE_OR_FALSE:
      return 'Verdadero o falso';
    case Game.ROULETTE:
      return 'Ruleta de reflexión';
    case Game.MATCHING:
      return 'Emparejamiento';
    default:
      return 'Ejercicio';
  }
};

const ExerciseAnswersModal: React.FC<ExerciseAnswersModalProps> = ({
  exercise,
  open,
  onClose,
}) => {
  if (!exercise) return null;

  const renderAnswers = () => {
    switch (exercise.game) {
      case Game.QUIZ:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              Respuestas Correctas del Quiz
            </h3>
            {exercise.questions?.map((question, index) => (
              <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-medium text-gray-800 mb-3 flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{question.question}</span>
                </div>
                <div className="ml-8 space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded ${
                        option === question.correct_answer
                          ? 'bg-green-100 border border-green-300 font-medium text-green-800'
                          : 'bg-white border border-gray-200 text-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option === question.correct_answer && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        <span>{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-3 ml-8 p-3 bg-blue-100 border-l-4 border-blue-500 rounded">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Explicación:</span> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case Game.FILL_IN_THE_BLANK:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <PenTool className="h-5 w-5 text-purple-600" />
              Respuestas Correctas - Rellenar Espacios
            </h3>
            {exercise.questions?.map((question, index) => (
              <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="font-medium text-gray-800 mb-2 flex items-start gap-2">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{question.question}</span>
                </div>
                <div className="ml-8 p-3 bg-green-100 border border-green-300 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-800">
                      Respuesta: {question.correct_answer}
                    </span>
                  </div>
                </div>
                {question.explanation && (
                  <div className="mt-3 ml-8 p-3 bg-purple-100 border-l-4 border-purple-500 rounded">
                    <p className="text-sm text-purple-800">
                      <span className="font-semibold">Explicación:</span> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case Game.HANGMAN:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-green-600" />
              Palabra del Ahorcado
            </h3>
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Palabra:</p>
                  <p className="text-3xl font-bold text-green-700 tracking-wider">
                    {exercise.word}
                  </p>
                </div>
                {exercise.hint && (
                  <div className="p-3 bg-green-100 border-l-4 border-green-500 rounded text-left">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Pista:</span> {exercise.hint}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case Game.DRAG_AND_DROP:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Move className="h-5 w-5 text-indigo-600" />
              Orden Correcto - Arrastrar y Soltar
            </h3>
            {exercise.instructions && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm text-indigo-800">
                  <span className="font-semibold">Instrucciones:</span> {exercise.instructions}
                </p>
              </div>
            )}
            <div className="space-y-2">
              {exercise.correctOrder?.map((elementId, index) => {
                const element = exercise.elements?.find((el) => el.id === elementId);
                return (
                  <div
                    key={elementId}
                    className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-3"
                  >
                    <span className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-800">{element?.texto}</span>
                  </div>
                );
              })}
            </div>
            {exercise.explanation && (
              <div className="p-3 bg-indigo-100 border-l-4 border-indigo-500 rounded">
                <p className="text-sm text-indigo-800">
                  <span className="font-semibold">Explicación:</span> {exercise.explanation}
                </p>
              </div>
            )}
          </div>
        );

      case Game.TRUE_OR_FALSE:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-teal-600" />
              Respuestas Correctas - Verdadero o Falso
            </h3>
            {exercise.trueFalseQuestions?.map((question, index) => (
              <div key={index} className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <div className="font-medium text-gray-800 mb-3 flex items-start gap-2">
                  <span className="bg-teal-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span>{question.statement}</span>
                </div>
                <div className="ml-8 p-3 bg-green-100 border border-green-300 rounded">
                  <div className="flex items-center gap-2">
                    {question.correct_answer ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
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
                  <div className="mt-3 ml-8 p-3 bg-teal-100 border-l-4 border-teal-500 rounded">
                    <p className="text-sm text-teal-800">
                      <span className="font-semibold">Explicación:</span> {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case Game.FLIP_CARDS:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-orange-600" />
              Contenido de las Tarjetas
            </h3>
            {exercise.instructions && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <span className="font-semibold">Instrucciones:</span> {exercise.instructions}
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercise.cards?.map((card, index) => (
                <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-gray-800">Tarjeta {index + 1}</span>
                  </div>
                  <div className="ml-8 space-y-2">
                    <div className="p-2 bg-white border border-orange-200 rounded">
                      <p className="text-sm text-gray-600 font-medium mb-1">Frente:</p>
                      <p className="text-gray-800">{card.front}</p>
                    </div>
                    <div className="p-2 bg-white border border-orange-200 rounded">
                      <p className="text-sm text-gray-600 font-medium mb-1">Reverso:</p>
                      <p className="text-gray-800">{card.back}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case Game.ROULETTE:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-rose-600" />
              Frases de Reflexión
            </h3>
            {exercise.instructions && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-sm text-rose-800">
                  <span className="font-semibold">Instrucciones:</span> {exercise.instructions}
                </p>
              </div>
            )}
            <div className="space-y-2">
              {exercise.phrases?.map((phrase, index) => (
                <div
                  key={index}
                  className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-3"
                >
                  <span className="bg-rose-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">{phrase.text}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-rose-100 border-l-4 border-rose-500 rounded">
              <p className="text-sm text-rose-800">
                💡 La ruleta seleccionará aleatoriamente una de estas frases para que el estudiante reflexione.
              </p>
            </div>
          </div>
        );

      case Game.MATCHING:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Link2 className="h-5 w-5 text-cyan-600" />
              Emparejamientos Correctos
            </h3>
            {exercise.instructions && (
              <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg">
                <p className="text-sm text-cyan-800">
                  <span className="font-semibold">Instrucciones:</span> {exercise.instructions}
                </p>
              </div>
            )}
            <div className="space-y-3">
              {exercise.pairs?.map((pair, index) => (
                <div
                  key={index}
                  className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1 p-2 bg-blue-100 border border-blue-200 rounded">
                        <p className="text-sm text-gray-600 font-medium mb-1">Término:</p>
                        <p className="text-gray-800 font-medium">{pair.term}</p>
                      </div>
                      <div className="text-cyan-600 font-bold">↔</div>
                      <div className="flex-1 p-2 bg-green-100 border border-green-200 rounded">
                        <p className="text-sm text-gray-600 font-medium mb-1">Definición:</p>
                        <p className="text-gray-800">{pair.match}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 py-8">
            No hay respuestas disponibles para este tipo de ejercicio.
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            {getGameIcon(exercise.game)}
            {getGameName(exercise.game)}
          </DialogTitle>
          <DialogDescription>
            Respuestas correctas y contenido del ejercicio
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">{renderAnswers()}</div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseAnswersModal;
