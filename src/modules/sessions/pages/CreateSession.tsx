import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { NavHeader } from '@/components/ui/nav-header';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useExercises } from '@/modules/exercises/hooks/useExercises';
import { useSessions } from '../hooks/useSessions';
import SelectableExerciseCard from '@/modules/exercises/components/SelectableExerciseCard';
import { ArrowLeft, Plus, BookOpen, Users, Timer, Loader2, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const CreateSession = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exercises, isLoading: exercisesLoading, error: exercisesError } = useExercises(user?.id);
  const { createSession, isCreating } = useSessions(user?.id);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 30,
    maxParticipants: 25,
    allowLateJoin: true,
    showLeaderboard: true,
    selectedExercises: [] as string[]
  });

  // Show all exercises since published logic is removed from backend
  const availableExercises = exercises || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }

    if (formData.selectedExercises.length === 0) {
      return;
    }

    if (!user?.id) {
      return;
    }

    // Create payload matching the new API structure
    const payload = {
      teacherId: user.id,
      exerciseIds: formData.selectedExercises,
      name: formData.name,
      description: formData.description || undefined,
      duration: formData.duration,
      maxParticipants: formData.maxParticipants,
      allowLateJoin: formData.allowLateJoin,
      showLeaderboard: formData.showLeaderboard
    };

    createSession(payload);

    // Navigate back to dashboard after creation
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const handleExerciseToggle = (exerciseId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedExercises: prev.selectedExercises.includes(exerciseId)
        ? prev.selectedExercises.filter(id => id !== exerciseId)
        : [...prev.selectedExercises, exerciseId]
    }));
  };

  const handleViewExercise = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <NavHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Crear Nueva Sesión</h1>
              <p className="text-muted-foreground">
                Configura una sesión interactiva para tus estudiantes
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Información Básica
                  </CardTitle>
                  <CardDescription>
                    Configura los detalles principales de la sesión
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Sesión *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Matemáticas Básicas - Grupo A"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe brevemente el contenido de la sesión..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Session Settings */}
              <Card className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Configuración
                  </CardTitle>
                  <CardDescription>
                    Ajusta los parámetros de la sesión
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración (minutos)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="5"
                        max="180"
                        value={formData.duration}
                        onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 30 }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxParticipants">Máx. Participantes</Label>
                      <Input
                        id="maxParticipants"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 25 }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowLateJoin"
                        checked={formData.allowLateJoin}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowLateJoin: !!checked }))}
                      />
                      <Label htmlFor="allowLateJoin" className="text-sm">
                        Permitir unirse tarde
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="showLeaderboard"
                        checked={formData.showLeaderboard}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showLeaderboard: !!checked }))}
                      />
                      <Label htmlFor="showLeaderboard" className="text-sm">
                        Mostrar tabla de posiciones
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exercise Selection */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="h-5 w-5" />
                      Seleccionar Ejercicios
                    </CardTitle>
                    <CardDescription>
                      Elige los ejercicios que incluirás en esta sesión
                    </CardDescription>
                  </div>
                  {formData.selectedExercises.length > 0 && (
                    <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {formData.selectedExercises.length} seleccionado{formData.selectedExercises.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {exercisesLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-semibold mb-2">Cargando ejercicios...</h3>
                    <p className="text-muted-foreground">
                      Obteniendo tus ejercicios disponibles
                    </p>
                  </div>
                ) : exercisesError ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-red-600">Error al cargar ejercicios</h3>
                    <p className="text-muted-foreground mb-6">
                      {exercisesError.message || 'No se pudieron cargar los ejercicios'}
                    </p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      variant="outline"
                      className="gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Reintentar
                    </Button>
                  </div>
                ) : availableExercises.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No hay ejercicios disponibles</h3>
                    <p className="text-muted-foreground mb-6">
                      Necesitas crear al menos un ejercicio para poder crear una sesión.
                    </p>
                    <Button 
                      onClick={() => navigate('/dashboard')} 
                      variant="outline"
                      className="gap-2"
                    >
                      <BookOpen className="h-4 w-4" />
                      Ir a Ejercicios
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Haz clic en los ejercicios que quieras incluir para crear una experiencia completa.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableExercises.map((exercise) => (
                        <SelectableExerciseCard
                          key={exercise.id}
                          exercise={exercise}
                          isSelected={formData.selectedExercises.includes(exercise.id)}
                          onToggle={handleExerciseToggle}
                          onView={handleViewExercise}
                        />
                      ))}
                    </div>

                    {formData.selectedExercises.length > 0 && (
                      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-800 mb-2">
                          Ejercicios seleccionados ({formData.selectedExercises.length}):
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {availableExercises
                            .filter(ex => formData.selectedExercises.includes(ex.id))
                            .map((exercise) => (
                              <div
                                key={exercise.id}
                                className="bg-white border border-green-300 rounded-full px-3 py-1 text-sm text-green-800 flex items-center gap-2"
                              >
                                <span>{exercise.instructions || 'Ejercicio sin nombre'}</span>
                                <button
                                  onClick={() => handleExerciseToggle(exercise.id)}
                                  className="text-green-600 hover:text-green-800 transition-colors"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !formData.name.trim() || formData.selectedExercises.length === 0}
                className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Sesión
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateSession;
