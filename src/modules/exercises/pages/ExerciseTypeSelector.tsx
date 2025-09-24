import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ui/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, BookOpen, HelpCircle, RotateCcw, Gamepad2, PuzzleIcon, FlipHorizontal } from "lucide-react";
import { MockAIService } from "@/lib/mock-ai";
import { Session, Exercise } from "@/types/session";
import { useToast } from "@/hooks/use-toast";

const ExerciseTypeSelector = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get session data from localStorage
  const sessions = JSON.parse(localStorage.getItem('eduai-sessions') || '[]');
  const session = sessions.find((s: Session) => s.id === sessionId);

  if (!session) {
    navigate('/dashboard');
    return null;
  }

  const exerciseTypes = [
    {
      id: 'quiz',
      name: 'Quiz Interactivo',
      description: 'Preguntas con múltiples opciones y retroalimentación inmediata',
      icon: HelpCircle,
      color: 'bg-blue-500',
      points: 10
    },
    {
      id: 'hangman',
      name: 'Ahorcado',
      description: 'Juego de palabras donde los estudiantes adivinan letra por letra',
      icon: Gamepad2,
      color: 'bg-green-500',
      points: 15
    },
    {
      id: 'flip-cards',
      name: 'Tarjetas Voltear',
      description: 'Tarjetas con pregunta al frente y respuesta al reverso',
      icon: FlipHorizontal,
      color: 'bg-purple-500',
      points: 8
    },
    {
      id: 'fill-blank',
      name: 'Rellenar Espacios',
      description: 'Oraciones con espacios en blanco para completar',
      icon: PuzzleIcon,
      color: 'bg-orange-500',
      points: 12
    }
  ];

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  const handleGenerateExercises = async () => {
    if (selectedTypes.length === 0) {
      toast({
        title: "Selecciona al menos un tipo",
        description: "Debes elegir al menos un tipo de ejercicio para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generate exercises for each selected type
      const newExercises: Exercise[] = [];
      
      for (const typeId of selectedTypes) {
        const exercises = await MockAIService.generateSpecificExercises(
          session.topic, 
          typeId as Exercise['type'],
          2 // Generate 2 exercises per type
        );
        newExercises.push(...exercises);
      }

      // Update session with new exercises
      const updatedSession = {
        ...session,
        exercises: [...session.exercises, ...newExercises],
        totalPoints: session.totalPoints + newExercises.reduce((sum, ex) => sum + ex.points, 0),
        estimatedDuration: session.estimatedDuration + newExercises.length * 3,
        updatedAt: new Date()
      };

      // Save updated session
      const updatedSessions = sessions.map((s: Session) => 
        s.id === sessionId ? updatedSession : s
      );
      localStorage.setItem('eduai-sessions', JSON.stringify(updatedSessions));

      toast({
        title: "¡Ejercicios agregados!",
        description: `Se agregaron ${newExercises.length} ejercicios nuevos a la sesión.`,
      });

      // Navigate to session detail
      navigate(`/session/${sessionId}`);

    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al generar los ejercicios. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-muted">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Agregar Tipos de Ejercicios
            </h1>
            <p className="text-muted-foreground mb-4">
              Selecciona los tipos de ejercicios que deseas agregar a la sesión:
            </p>
            <Badge variant="secondary" className="text-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              {session.title}
            </Badge>
          </div>

          {/* Exercise Types Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {exerciseTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedTypes.includes(type.id);
              
              return (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary shadow-lg scale-105' 
                      : 'hover:shadow-md hover:scale-102'
                  }`}
                  onClick={() => handleTypeToggle(type.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type.color} text-white`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{type.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {type.points} pts c/u
                          </Badge>
                        </div>
                      </div>
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => handleTypeToggle(type.id)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {type.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/session/${sessionId}`)}
              className="px-6"
            >
              Saltar y Ver Sesión
            </Button>
            
            <Button
              onClick={handleGenerateExercises}
              disabled={selectedTypes.length === 0 || isGenerating}
              className="px-8 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600"
            >
              {isGenerating ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Ejercicios Seleccionados
                </>
              )}
            </Button>
          </div>

          {selectedTypes.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Se generarán <strong>{selectedTypes.length * 2} ejercicios nuevos</strong> 
                ({selectedTypes.map(type => exerciseTypes.find(t => t.id === type)?.name).join(', ')})
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExerciseTypeSelector;