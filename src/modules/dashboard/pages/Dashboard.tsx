import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NavHeader } from '@/components/ui/nav-header';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useExercises } from '@/modules/exercises/hooks/useExercises';
import ExerciseCard from '@/modules/exercises/components/ExerciseCard';
import { Plus, Target } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exercises, isLoading, deleteExercise, publishExercise, isPublishing, error } = useExercises(user?.id);

  // Debug logs
  console.log('Dashboard - User:', user);
  console.log('Dashboard - User ID:', user?.id);
  console.log('Dashboard - Exercises:', exercises);
  console.log('Dashboard - Is Loading:', isLoading);

  const handleViewExercise = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };


  const handleDeleteExercise = (exerciseId: string) => {
    if (user?.id && window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      deleteExercise({ exerciseId, userId: user.id });
    }
  };

  const handlePublishExercise = (exerciseId: string) => {
    publishExercise(exerciseId);
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Ejercicios</h1>
            <p className="text-muted-foreground">
              Gestiona tus ejercicios interactivos generados por IA
            </p>
            {exercises && exercises.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} creado{exercises.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Button onClick={handleCreateExercise} className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600">
            <Plus className="h-4 w-4" />
            Crear Ejercicio
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onView={handleViewExercise}
                onDelete={handleDeleteExercise}
                onPublish={handlePublishExercise}
                isPublishing={isPublishing}
              />
            ))}
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