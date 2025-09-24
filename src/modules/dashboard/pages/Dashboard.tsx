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
  const { exercises, isLoading, deleteExercise } = useExercises(user?._id);

  const handleViewExercise = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };

  const handleEditExercise = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}/edit`);
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (user?._id && window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      deleteExercise({ exerciseId, userId: user._id });
    }
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
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
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
          </div>
          <Button onClick={handleCreateExercise} className="gap-2 bg-gradient-to-r from-primary to-blue-500">
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
              <Button onClick={handleCreateExercise} className="bg-gradient-to-r from-primary to-blue-500">
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
                onEdit={handleEditExercise}
                onDelete={handleDeleteExercise}
              />
            ))}
          </div>
        )}

        {exercises.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={handleCreateExercise}
              className="bg-gradient-to-r from-secondary to-green-500 hover:from-secondary-hover hover:to-green-600 gap-2"
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