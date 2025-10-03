import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ExerciseResponse } from '../model/exercise-response.model';
import { Game } from '../enum/game.enum';
import { HelpCircle, Gamepad2, PuzzleIcon, FlipHorizontal, Save, Plus, Trash2, CheckCircle2, Move, ArrowUp, ArrowDown, CheckSquare, XCircle } from 'lucide-react';
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
      case Game.DRAG_AND_DROP:
        return <Move className="h-5 w-5" />;
      case Game.TRUE_OR_FALSE:
        return <CheckSquare className="h-5 w-5" />;
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

  // Drag and Drop handlers
  const handleElementChange = (elementIndex: number, field: string, value: string | number) => {
    const updatedElements = [...(editedExercise.elements || [])];
    updatedElements[elementIndex] = {
      ...updatedElements[elementIndex],
      [field]: value
    };
    setEditedExercise({ ...editedExercise, elements: updatedElements });
  };

  const addElement = () => {
    const newElement = {
      id: (editedExercise.elements?.length || 0) + 1,
      texto: ''
    };
    setEditedExercise({
      ...editedExercise,
      elements: [...(editedExercise.elements || []), newElement]
    });
  };

  const removeElement = (elementIndex: number) => {
    const updatedElements = editedExercise.elements?.filter((_, index) => index !== elementIndex) || [];
    // Reorder IDs
    const reorderedElements = updatedElements.map((element, index) => ({
      ...element,
      id: index + 1
    }));
    setEditedExercise({ ...editedExercise, elements: reorderedElements });
  };

  const moveElement = (elementIndex: number, direction: 'up' | 'down') => {
    const elements = [...(editedExercise.elements || [])];
    const newIndex = direction === 'up' ? elementIndex - 1 : elementIndex + 1;
    
    if (newIndex >= 0 && newIndex < elements.length) {
      // Swap elements
      [elements[elementIndex], elements[newIndex]] = [elements[newIndex], elements[elementIndex]];
      
      // Update IDs to match new positions
      const reorderedElements = elements.map((element, index) => ({
        ...element,
        id: index + 1
      }));
      
      setEditedExercise({ ...editedExercise, elements: reorderedElements });
    }
  };

  const handleInstructionsChange = (value: string) => {
    setEditedExercise({ ...editedExercise, instructions: value });
  };

  const handleExplanationChange = (value: string) => {
    setEditedExercise({ ...editedExercise, explanation: value });
  };

  // True or False handlers
  const handleTrueFalseQuestionChange = (questionIndex: number, field: string, value: string | boolean) => {
    const updatedQuestions = [...(editedExercise.trueFalseQuestions || [])];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value
    };
    setEditedExercise({ ...editedExercise, trueFalseQuestions: updatedQuestions });
  };

  const addTrueFalseQuestion = () => {
    const newQuestion = {
      statement: '',
      correct_answer: true,
      explanation: ''
    };
    setEditedExercise({
      ...editedExercise,
      trueFalseQuestions: [...(editedExercise.trueFalseQuestions || []), newQuestion]
    });
  };

  const removeTrueFalseQuestion = (questionIndex: number) => {
    const updatedQuestions = editedExercise.trueFalseQuestions?.filter((_, index) => index !== questionIndex) || [];
    setEditedExercise({ ...editedExercise, trueFalseQuestions: updatedQuestions });
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

    if (editedExercise.game === Game.DRAG_AND_DROP) {
      const hasEmptyElements = editedExercise.elements?.some(e => !e.texto?.trim());
      if (hasEmptyElements || !editedExercise.elements?.length) {
        toast({
          title: "Error de validación",
          description: "Todos los elementos deben tener texto y debe haber al menos un elemento.",
          variant: "destructive"
        });
        return;
      }
      if (!editedExercise.instructions?.trim()) {
        toast({
          title: "Error de validación",
          description: "Las instrucciones son obligatorias para ejercicios de arrastrar y soltar.",
          variant: "destructive"
        });
        return;
      }
    }

    if (editedExercise.game === Game.TRUE_OR_FALSE) {
      const hasEmptyStatements = editedExercise.trueFalseQuestions?.some(q => !q.statement?.trim());
      if (hasEmptyStatements || !editedExercise.trueFalseQuestions?.length) {
        toast({
          title: "Error de validación",
          description: "Todas las declaraciones deben tener texto y debe haber al menos una pregunta.",
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
              <Label>{exercise.game === 'fill_in_the_blank' ? 'Oración' : 'Pregunta'}</Label>
              <Textarea
                value={question.sentence || question.question || ''}
                onChange={(e) => handleQuestionChange(questionIndex, exercise.game === 'fill_in_the_blank' ? 'sentence' : 'question', e.target.value)}
                placeholder={exercise.game === 'fill_in_the_blank' ? 'Escribe la oración con ______ para el espacio en blanco...' : 'Escribe tu pregunta aquí...'}
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

  const renderFillBlankEditor = () => {
    // Debug: Log question data for fill in the blank
    console.log('Fill in the blank editor - Questions:', editedExercise.questions);
    if (editedExercise.questions && editedExercise.questions.length > 0) {
      console.log('First question:', editedExercise.questions[0]);
    }
    
    return (
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
                value={question.sentence || question.question || ''}
                onChange={(e) => handleQuestionChange(questionIndex, 'sentence', e.target.value)}
                placeholder="Escribe la oración con ______ para el espacio en blanco..."
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
  };

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

  const renderDragAndDropEditor = () => (
    <div className="space-y-6">
      {/* Instructions */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Move className="h-5 w-5 text-indigo-600" />
            Instrucciones del Ejercicio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Instrucciones</Label>
            <Textarea
              value={editedExercise.instructions || ''}
              onChange={(e) => handleInstructionsChange(e.target.value)}
              placeholder="Describe qué deben hacer los estudiantes (ej: Arrastra y ordena los pasos...)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Elements */}
      {editedExercise.elements?.map((element, elementIndex) => (
        <Card key={elementIndex} className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {element.id}
                </span>
                Elemento {element.id}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveElement(elementIndex, 'up')}
                  disabled={elementIndex === 0}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => moveElement(elementIndex, 'down')}
                  disabled={elementIndex === (editedExercise.elements?.length || 0) - 1}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeElement(elementIndex)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <Label>Texto del elemento</Label>
              <Textarea
                value={element.texto || ''}
                onChange={(e) => handleElementChange(elementIndex, 'texto', e.target.value)}
                placeholder="Describe este paso o elemento..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addElement} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Elemento
      </Button>

      {/* Explanation */}
      <Card className="border-l-4 border-l-indigo-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="bg-indigo-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              ?
            </span>
            Explicación (Opcional)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Explicación del orden correcto</Label>
            <Textarea
              value={editedExercise.explanation || ''}
              onChange={(e) => handleExplanationChange(e.target.value)}
              placeholder="Explica por qué este es el orden correcto..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Preview */}
      {editedExercise.elements && editedExercise.elements.length > 0 && (
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-800">Orden Correcto (Actual)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {editedExercise.elements.map((element, index) => (
                <div key={element.id} className="flex items-center gap-3 p-2 bg-white rounded border">
                  <span className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm">{element.texto}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderTrueFalseEditor = () => (
    <div className="space-y-6">
      {editedExercise.trueFalseQuestions?.map((question, questionIndex) => (
        <Card key={questionIndex} className="border-l-4 border-l-teal-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-teal-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  {questionIndex + 1}
                </span>
                Declaración {questionIndex + 1}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeTrueFalseQuestion(questionIndex)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Declaración</Label>
              <Textarea
                value={question.statement || ''}
                onChange={(e) => handleTrueFalseQuestionChange(questionIndex, 'statement', e.target.value)}
                placeholder="Escribe una declaración que pueda ser verdadera o falsa..."
                rows={3}
              />
            </div>

            <div>
              <Label>Respuesta Correcta</Label>
              <div className="flex gap-3 mt-2">
                <Button
                  type="button"
                  variant={question.correct_answer === true ? "default" : "outline"}
                  onClick={() => handleTrueFalseQuestionChange(questionIndex, 'correct_answer', true)}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Verdadero
                </Button>
                <Button
                  type="button"
                  variant={question.correct_answer === false ? "default" : "outline"}
                  onClick={() => handleTrueFalseQuestionChange(questionIndex, 'correct_answer', false)}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Falso
                </Button>
              </div>
            </div>

            <div>
              <Label>Explicación</Label>
              <Textarea
                value={question.explanation || ''}
                onChange={(e) => handleTrueFalseQuestionChange(questionIndex, 'explanation', e.target.value)}
                placeholder="Explica por qué esta declaración es verdadera o falsa..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={addTrueFalseQuestion} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Agregar Declaración
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
      case Game.DRAG_AND_DROP:
        return renderDragAndDropEditor();
      case Game.TRUE_OR_FALSE:
        return renderTrueFalseEditor();
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