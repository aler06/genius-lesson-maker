import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ui/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, BookOpen, HelpCircle, RotateCcw, Gamepad2, PuzzleIcon, FlipHorizontal, Loader2 } from "lucide-react";
import { exerciseService } from "../services/exercise.service";
import { Game } from "../enum/game.enum";
import { useToast } from "@/hooks/use-toast";

const ExerciseTypeSelector = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<Game | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingExercise, setPendingExercise] = useState<any>(null);

  useEffect(() => {
    // Get pending exercise data from localStorage
    const pendingData = localStorage.getItem('pendingExercise');
    if (!pendingData) {
      toast({
        title: "Error",
        description: "No se encontraron datos del ejercicio. Regresando al inicio.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    try {
      const data = JSON.parse(pendingData);
      setPendingExercise(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Datos del ejercicio inválidos. Regresando al inicio.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [navigate, toast]);

  const exerciseTypes = [
    {
      id: Game.QUIZ,
      name: 'Quiz Interactivo',
      description: 'Preguntas con múltiples opciones y retroalimentación inmediata',
      icon: HelpCircle,
      color: 'bg-blue-500',
      points: 10
    },
    {
      id: Game.HANGMAN,
      name: 'Ahorcado',
      description: 'Juego de palabras donde los estudiantes adivinan letra por letra',
      icon: Gamepad2,
      color: 'bg-green-500',
      points: 15
    },
    {
      id: Game.FLIP_CARDS,
      name: 'Tarjetas Voltear',
      description: 'Tarjetas con pregunta al frente y respuesta al reverso',
      icon: FlipHorizontal,
      color: 'bg-purple-500',
      points: 8
    },
    {
      id: Game.FILL_IN_THE_BLANK,
      name: 'Rellenar Espacios',
      description: 'Oraciones con espacios en blanco para completar',
      icon: PuzzleIcon,
      color: 'bg-orange-500',
      points: 12
    }
  ];

  const handleTypeSelect = (gameType: Game) => {
    setSelectedType(gameType);
  };

  const handleGenerateExercise = async () => {
    if (!selectedType || !pendingExercise) {
      toast({
        title: "Error",
        description: "Selecciona un tipo de ejercicio para continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Generate exercise using the service
      const exercise = await exerciseService.generateExercise({
        userId: pendingExercise.userId,
        topic: pendingExercise.topic,
        gameType: selectedType,
        difficulty: pendingExercise.difficulty,
        targetAudience: pendingExercise.targetAudience,
        additionalInstructions: pendingExercise.additionalInstructions,
        numberOfItems: pendingExercise.numberOfItems
      });

      // Clear pending exercise data
      localStorage.removeItem('pendingExercise');

      toast({
        title: "¡Ejercicio creado exitosamente!",
        description: `Se generó un ejercicio de ${selectedType} para "${pendingExercise.topic}".`,
      });

      // Navigate to exercise detail
      navigate(`/exercise/${exercise.id}`);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error al generar el ejercicio.",
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
              Selecciona el Tipo de Ejercicio
            </h1>
            <p className="text-muted-foreground mb-4">
              Elige el tipo de ejercicio que deseas crear:
            </p>
            {pendingExercise && (
              <Badge variant="secondary" className="text-sm">
                <BookOpen className="h-4 w-4 mr-2" />
                {pendingExercise.topic}
              </Badge>
            )}
          </div>

          {/* Exercise Types Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {exerciseTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              
              return (
                <Card 
                  key={type.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected 
                      ? 'ring-2 ring-primary shadow-lg scale-105' 
                      : 'hover:shadow-md hover:scale-102'
                  }`}
                  onClick={() => handleTypeSelect(type.id)}
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
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                      </div>
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
              onClick={() => navigate('/')}
              className="px-6"
            >
              Volver al Inicio
            </Button>
            
            <Button
              onClick={handleGenerateExercise}
              disabled={!selectedType || isGenerating}
              className="px-8 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando ejercicio...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Ejercicio
                </>
              )}
            </Button>
          </div>

          {selectedType && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Se creará un ejercicio de tipo <strong>{exerciseTypes.find(t => t.id === selectedType)?.name}</strong>
                {pendingExercise && ` sobre "${pendingExercise.topic}"`}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExerciseTypeSelector;