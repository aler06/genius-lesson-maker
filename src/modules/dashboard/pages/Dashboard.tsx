import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NavHeader } from '@/components/ui/nav-header';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useExercises } from '@/modules/exercises/hooks/useExercises';
import ExerciseCard from '@/modules/exercises/components/ExerciseCard';
import { Plus, Target, Brain, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exercises, isLoading, deleteExercise, publishExercise, isPublishing, error } = useExercises(user?.id);
  const [publishingExerciseId, setPublishingExerciseId] = useState<string | null>(null);
  const { toast } = useToast();


  const handleViewExercise = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };


  const handleDeleteExercise = (exerciseId: string) => {
    if (user?.id && window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      deleteExercise({ exerciseId, userId: user.id });
    }
  };

  const handlePublishExercise = (exerciseId: string) => {
    setPublishingExerciseId(exerciseId);
    publishExercise(exerciseId);
    
    // Reset publishing state after mutation completes
    setTimeout(() => {
      setPublishingExerciseId(null);
    }, 1500);
  };

  const handleCreateExercise = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando ejercicios...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12 border-destructive">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Target className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-destructive">Error al cargar ejercicios</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'Ocurrió un error inesperado'}
              </p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <NavHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-primary/10 via-blue-50 to-purple-50 border-primary/20 shadow-lg">
            <CardContent className="p-8">
              <div className="flex justify-between items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Dashboard de Ejercicios
                      </h1>
                      <p className="text-lg text-muted-foreground mt-1">
                        Gestiona tus ejercicios interactivos generados por IA
                      </p>
                    </div>
                  </div>
                  
                  {exercises && exercises.length > 0 && (
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-primary/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-foreground">
                          {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} creado{exercises.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-primary/20">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {exercises.filter(ex => ex.isPublished).length} publicado{exercises.filter(ex => ex.isPublished).length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    onClick={handleCreateExercise} 
                    size="lg"
                    className="gap-3 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                  >
                    <Plus className="h-5 w-5" />
                    Crear Ejercicio
                  </Button>
                  {exercises && exercises.length > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      ¡Crea tu próximo ejercicio!
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {exercises.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Target className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No hay ejercicios creados</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primer ejercicio interactivo
              </p>
              <Button onClick={handleCreateExercise} className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600">
                Crear Primer Ejercicio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onView={handleViewExercise}
                  onDelete={handleDeleteExercise}
                  onPublish={handlePublishExercise}
                  isPublishing={publishingExerciseId === exercise.id}
                />
              ))}
            </div>
          </div>
        )}

        {exercises.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleCreateExercise}
              className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear Nuevo Ejercicio
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;