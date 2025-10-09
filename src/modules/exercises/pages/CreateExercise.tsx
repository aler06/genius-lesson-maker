import { useState } from "react";
import { NavHeader } from "@/components/ui/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, BookOpen, Target, Clock } from "lucide-react";
import { exerciseService } from "../services/exercise.service";
import { Game } from "../enum/game.enum";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../auth/hooks/useAuth";

const Index = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    targetAudience: '',
    additionalInstructions: '',
    numberOfItems: 3
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa un tema para el ejercicio.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para crear ejercicios.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Store the exercise data for the type selector
      localStorage.setItem('pendingExercise', JSON.stringify({
        topic: formData.topic,
        difficulty: formData.difficulty,
        targetAudience: formData.targetAudience,
        additionalInstructions: formData.additionalInstructions,
        numberOfItems: formData.numberOfItems,
        userId: user.id
      }));

      toast({
        title: "¡Información guardada!",
        description: `Ahora selecciona el tipo de ejercicio para "${formData.topic}".`,
      });
      
      // Navigate to exercise type selector
      navigate('/exercise-type-selector');

    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error al procesar la información.",
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
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Potenciado por IA
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Crea Ejercicios Interactivos
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Introduce un tema y selecciona el tipo de ejercicio. Nuestra IA generará contenido personalizado para tus estudiantes
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Nuevo Ejercicio
                </CardTitle>
                <CardDescription>
                  Completa los detalles para generar un ejercicio automáticamente
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Tema del Ejercicio *</Label>
                    <Input
                      id="topic"
                      placeholder="ej. Ecuaciones de segundo grado, La Revolución Francesa..."
                      value={formData.topic}
                      onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                      className="text-base"
                    />
                  </div>


                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Audiencia Objetivo (Opcional)</Label>
                    <Input
                      id="targetAudience"
                      placeholder="ej. estudiantes de secundaria, universitarios..."
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additionalInstructions">Instrucciones Adicionales (Opcional)</Label>
                    <Textarea
                      id="additionalInstructions"
                      placeholder="Añade contexto adicional o objetivos específicos..."
                      value={formData.additionalInstructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Dificultad</Label>
                      <Select 
                        value={formData.difficulty} 
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Básico</SelectItem>
                          <SelectItem value="intermediate">Intermedio</SelectItem>
                          <SelectItem value="advanced">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Número de Elementos</Label>
                      <Select 
                        value={formData.numberOfItems.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, numberOfItems: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 elementos</SelectItem>
                          <SelectItem value="5">5 elementos</SelectItem>
                          <SelectItem value="8">8 elementos</SelectItem>
                          <SelectItem value="10">10 elementos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isGenerating || !formData.topic.trim()}
                    className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 text-base py-6"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Continuar - Seleccionar Tipo
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Features Section */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Ejercicios Personalizados</h3>
                    <p className="text-muted-foreground text-sm">
                      La IA genera preguntas específicas para tu tema, incluyendo opción múltiple, verdadero/falso y respuesta corta.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-secondary/10">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Ahorro de Tiempo</h3>
                    <p className="text-muted-foreground text-sm">
                      Crea sesiones completas en minutos. Dedica más tiempo a enseñar y menos a preparar material.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <BookOpen className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Fácil Gestión</h3>
                    <p className="text-muted-foreground text-sm">
                      Edita, elimina y organiza todos tus ejercicios desde el dashboard. Control total sobre tu contenido.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;