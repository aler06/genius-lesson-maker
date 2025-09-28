import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NavHeader } from '@/components/ui/nav-header';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useExercises } from '@/modules/exercises/hooks/useExercises';
import { useSessions } from '@/modules/sessions/hooks/useSessions';
import ExerciseCard from '@/modules/exercises/components/ExerciseCard';
import SessionCard from '@/modules/sessions/components/SessionCard';
import { Plus, Brain, CheckCircle, Users, Calendar, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exercises, isLoading: exercisesLoading, deleteExercise, error: exercisesError } = useExercises(user?.id);
  const { sessions, isLoading: sessionsLoading, startSession, endSession, deleteSession, isStarting, isEnding, isDeleting, error: sessionsError } = useSessions(user?.id);
  const [activeTab, setActiveTab] = useState('exercises');
  const { toast } = useToast();


  const handleViewExercise = (exerciseId: string) => {
    navigate(`/exercise/${exerciseId}`);
  };


  const handleDeleteExercise = (exerciseId: string) => {
    if (user?.id && window.confirm('¿Estás seguro de que quieres eliminar este ejercicio?')) {
      deleteExercise({ exerciseId, userId: user.id });
    }
  };


  const handleCreateExercise = () => {
    navigate('/create-exercise');
  };

  const handleCreateSession = () => {
    navigate('/create-session');
  };

  const handleStartSession = (sessionId: string) => {
    startSession(sessionId);
  };

  const handleEndSession = (sessionId: string) => {
    endSession(sessionId);
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sesión?')) {
      deleteSession(sessionId);
    }
  };

  if (exercisesLoading || sessionsLoading) {
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

  if (exercisesError || sessionsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12 border-destructive border-l-4 border-l-destructive">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-10 w-10 text-destructive" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-destructive">Error al cargar ejercicios</h3>
              <p className="text-muted-foreground mb-4">
                {(exercisesError || sessionsError) instanceof Error ? (exercisesError || sessionsError)?.message : 'Ocurrió un error inesperado'}
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
          <Card className="bg-gradient-to-r from-primary/10 via-blue-50 to-purple-50 border-primary/20 shadow-lg border-l-4 border-l-primary">
            <CardContent className="p-8">
              <div className="flex justify-between items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <Brain className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        Dashboard del Profesor
                      </h1>
                      <p className="text-lg text-muted-foreground mt-1">
                        Gestiona tus ejercicios y sesiones interactivas
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-primary/20">
                      <Brain className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">
                        {exercises?.length || 0} ejercicio{(exercises?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-primary/20">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-foreground">
                        {sessions?.length || 0} sesión{(sessions?.length || 0) !== 1 ? 'es' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full border border-primary/20">
                      <Play className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-foreground">
                        {sessions?.filter(s => s.status === 'active').length || 0} activa{(sessions?.filter(s => s.status === 'active').length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  {activeTab === 'exercises' ? (
                    <Button 
                      onClick={handleCreateExercise} 
                      size="lg"
                      className="gap-3 bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                    >
                      <Plus className="h-5 w-5" />
                      Crear Ejercicio
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleCreateSession} 
                      size="lg"
                      className="gap-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3"
                    >
                      <Plus className="h-5 w-5" />
                      Crear Sesión
                    </Button>
                  )}
                  <p className="text-xs text-center text-muted-foreground">
                    {activeTab === 'exercises' ? '¡Crea tu próximo ejercicio!' : '¡Inicia una nueva sesión!'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Exercises and Sessions */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="exercises" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Ejercicios
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sesiones
            </TabsTrigger>
          </TabsList>

          {/* Exercises Tab */}
          <TabsContent value="exercises" className="mt-6">
            {!exercises || exercises.length === 0 ? (
              <Card className="text-center py-12 border-l-4 border-l-primary">
                <CardContent>
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Brain className="h-10 w-10 text-muted-foreground" />
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
              <>
                <div className="flex justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
                    {exercises.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        onView={handleViewExercise}
                        onDelete={handleDeleteExercise}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleCreateExercise}
                    className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Crear Nuevo Ejercicio
                  </Button>
                </div>
              </>
            )}
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions" className="mt-6">
            {!sessions || sessions.length === 0 ? (
              <Card className="text-center py-12 border-l-4 border-l-primary">
                <CardContent>
                  <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Users className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No hay sesiones creadas</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea tu primera sesión interactiva para estudiantes
                  </p>
                  <Button onClick={handleCreateSession} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    Crear Primera Sesión
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl">
                    {sessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onStart={handleStartSession}
                        onEnd={handleEndSession}
                        onDelete={handleDeleteSession}
                        isStarting={isStarting}
                        isEnding={isEnding}
                        isDeleting={isDeleting}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <Button
                    onClick={handleCreateSession}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Crear Nueva Sesión
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;