import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExerciseResponse } from '../model/exercise-response.model';
import { Game } from '../enum/game.enum';
import { HelpCircle, Gamepad2, PuzzleIcon, FlipHorizontal, CheckCircle2, XCircle } from 'lucide-react';

interface ExerciseTemplateProps {
  exercise: ExerciseResponse;
}

const ExerciseTemplate: React.FC<ExerciseTemplateProps> = ({ exercise }) => {
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

  const renderHangmanTemplate = () => (
    <div className="space-y-4">
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5 text-green-600" />
            Palabra a Adivinar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-3xl font-mono font-bold tracking-widest mb-4 p-4 bg-gray-100 rounded-lg">
              {exercise.word?.toUpperCase()}
            </div>
            {exercise.hint && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Pista:</strong> {exercise.hint}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

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
                {question.question}
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Respuesta:</strong> {question.correct_answer}
                </p>
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
