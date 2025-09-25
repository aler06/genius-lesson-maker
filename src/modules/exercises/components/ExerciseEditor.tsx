import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ExerciseResponse } from '../model/exercise-response.model';
import { Game } from '../enum/game.enum';
import { HelpCircle, Gamepad2, PuzzleIcon, FlipHorizontal, Save, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExerciseEditorProps {
  exercise: ExerciseResponse;
  onSave: (updatedExercise: ExerciseResponse) => void;
  onCancel: () => void;
}

const ExerciseEditor: React.FC<ExerciseEditorProps> = ({ exercise, onSave, onCancel }) => {
  const [editedExercise, setEditedExercise] = useState<ExerciseResponse>({ ...exercise });
  const { toast } = useToast();

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

  const handleQuestionChange = (questionIndex: number, field: string, value: string) => {
    const updatedQuestions = [...(editedExercise.questions || [])];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    setEditedExercise({ ...editedExercise, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...(editedExercise.questions || [])];
    const updatedOptions = [...(updatedQuestions[questionIndex].options || [])];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions
    };
    setEditedExercise({ ...editedExercise, questions: updatedQuestions });
  };

  const handleCorrectAnswerChange = (questionIndex: number, correctAnswer: string) => {
    const updatedQuestions = [...(editedExercise.questions || [])];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      correct_answer: correctAnswer
    };
    setEditedExercise({ ...editedExercise, questions: updatedQuestions });
  };

  const addQuestion = () => {
    const newQuestion = {
      question: '',
      options: ['', '', '', ''],
      correct_answer: '',
      explanation: ''
    };
    setEditedExercise({
      ...editedExercise,
      questions: [...(editedExercise.questions || []), newQuestion]
    });
  };

  const removeQuestion = (questionIndex: number) => {
    const updatedQuestions = editedExercise.questions?.filter((_, index) => index !== questionIndex) || [];
    setEditedExercise({ ...editedExercise, questions: updatedQuestions });
  };

  const handleCardChange = (cardIndex: number, field: 'front' | 'back', value: string) => {
    const updatedCards = [...(editedExercise.cards || [])];
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      [field]: value
    };
    setEditedExercise({ ...editedExercise, cards: updatedCards });
  };

  const addCard = () => {
    const newCard = { front: '', back: '' };
    setEditedExercise({
      ...editedExercise,
      cards: [...(editedExercise.cards || []), newCard]
    });
  };

  const removeCard = (cardIndex: number) => {
    const updatedCards = editedExercise.cards?.filter((_, index) => index !== cardIndex) || [];
    setEditedExercise({ ...editedExercise, cards: updatedCards });
  };

  const handleWordChange = (value: string) => {
    setEditedExercise({ ...editedExercise, word: value });
  };

  const handleHintChange = (value: string) => {
    setEditedExercise({ ...editedExercise, hint: value });
  };

  const handleSave = () => {
    // Validations
    if (editedExercise.game === Game.QUIZ) {
      const hasEmptyQuestions = editedExercise.questions?.some(q => 
        !q.question?.trim() || 
        !q.options?.every(opt => opt.trim()) || 
        !q.correct_answer?.trim()
      );
      if (hasEmptyQuestions) {
        toast({
          title: "Error de validación",
          description: "Todas las preguntas deben tener texto, opciones completas y respuesta correcta.",
          variant: "destructive"
        });
        return;
      }
    }

    if (editedExercise.game === Game.HANGMAN && !editedExercise.word?.trim()) {
      toast({
        title: "Error de validación",
        description: "El ejercicio de ahorcado debe tener una palabra.",
        variant: "destructive"
      });
      return;
    }

    if (editedExercise.game === Game.FLIP_CARDS) {
      const hasEmptyCards = editedExercise.cards?.some(c => !c.front?.trim() || !c.back?.trim());
      if (hasEmptyCards) {
        toast({
          title: "Error de validación",
          description: "Todas las tarjetas deben tener contenido en ambos lados.",
          variant: "destructive"
        });
        return;
      }
    }

    onSave(editedExercise);
  };

  const renderQuizEditor = () => (
    <div className="space-y-6">
      {editedExercise.questions?.map((question, questionIndex) => (
        <Card key={questionIndex} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {questionIndex + 1}
                </span>
                Pregunta {questionIndex + 1}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeQuestion(questionIndex)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Pregunta</Label>
              <Textarea
                value={question.question || ''}
                onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                placeholder="Escribe tu pregunta aquí..."
                rows={2}
              />
            </div>

            <div>
              <Label>Opciones</Label>
              <div className="space-y-2">
                {question.options?.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <span className="font-medium text-sm w-6">
                      {String.fromCharCode(65 + optionIndex)}.
                    </span>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      placeholder={`Opción ${String.fromCharCode(65 + optionIndex)}`}
                    />
                    <Button
                      variant={option === question.correct_answer ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleCorrectAnswerChange(questionIndex, option)}
                      className={option === question.correct_answer ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      {option === question.correct_answer ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        "Correcta"
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              {question.correct_answer && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                  <strong>Respuesta correcta:</strong> {question.correct_answer}
                </div>
              )}
            </div>

            <div>
              <Label>Explicación (opcional)</Label>
              <Textarea
                value={question.explanation || ''}
                onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                placeholder="Explica por qué esta es la respuesta correcta..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addQuestion} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Pregunta
      </Button>
    </div>
  );

  const renderHangmanEditor = () => (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5 text-green-600" />
          Configurar Ahorcado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Palabra a adivinar</Label>
          <Input
            value={editedExercise.word || ''}
            onChange={(e) => handleWordChange(e.target.value)}
            placeholder="Escribe la palabra..."
          />
        </div>
        <div>
          <Label>Pista (opcional)</Label>
          <Textarea
            value={editedExercise.hint || ''}
            onChange={(e) => handleHintChange(e.target.value)}
            placeholder="Escribe una pista para ayudar..."
            rows={2}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderFillBlankEditor = () => (
    <div className="space-y-6">
      {editedExercise.questions?.map((question, questionIndex) => (
        <Card key={questionIndex} className="border-l-4 border-l-orange-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {questionIndex + 1}
                </span>
                Oración {questionIndex + 1}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeQuestion(questionIndex)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Oración con espacio en blanco</Label>
              <Textarea
                value={question.question || ''}
                onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                placeholder="Escribe la oración con _____ para el espacio en blanco..."
                rows={2}
              />
            </div>
            <div>
              <Label>Respuesta correcta</Label>
              <Input
                value={question.correct_answer || ''}
                onChange={(e) => handleQuestionChange(questionIndex, 'correct_answer', e.target.value)}
                placeholder="Palabra o frase que va en el espacio en blanco..."
              />
            </div>
            <div>
              <Label>Explicación (opcional)</Label>
              <Textarea
                value={question.explanation || ''}
                onChange={(e) => handleQuestionChange(questionIndex, 'explanation', e.target.value)}
                placeholder="Explica la respuesta..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addQuestion} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Oración
      </Button>
    </div>
  );

  const renderFlipCardsEditor = () => (
    <div className="space-y-6">
      {editedExercise.cards?.map((card, cardIndex) => (
        <Card key={cardIndex} className="border-l-4 border-l-purple-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {cardIndex + 1}
                </span>
                Tarjeta {cardIndex + 1}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeCard(cardIndex)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Frente de la tarjeta</Label>
              <Textarea
                value={card.front || ''}
                onChange={(e) => handleCardChange(cardIndex, 'front', e.target.value)}
                placeholder="Pregunta o concepto..."
                rows={2}
              />
            </div>
            <div>
              <Label>Reverso de la tarjeta</Label>
              <Textarea
                value={card.back || ''}
                onChange={(e) => handleCardChange(cardIndex, 'back', e.target.value)}
                placeholder="Respuesta o definición..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addCard} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Tarjeta
      </Button>
    </div>
  );

  const renderEditor = () => {
    switch (editedExercise.game) {
      case Game.QUIZ:
        return renderQuizEditor();
      case Game.HANGMAN:
        return renderHangmanEditor();
      case Game.FILL_IN_THE_BLANK:
        return renderFillBlankEditor();
      case Game.FLIP_CARDS:
        return renderFlipCardsEditor();
      default:
        return <div>Tipo de ejercicio no soportado para edición</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-blue-500/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                {getGameIcon(editedExercise.game)}
              </div>
              <div>
                <CardTitle className="text-xl">
                  Editando: {getGameName(editedExercise.game)}
                </CardTitle>
                <CardDescription>
                  Modifica las preguntas, respuestas y explicaciones
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Editor Content */}
      {renderEditor()}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button onClick={onCancel} variant="outline">
          Cancelar
        </Button>
        <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
};

export default ExerciseEditor;
