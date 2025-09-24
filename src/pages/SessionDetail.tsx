import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ui/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Session, Exercise } from "@/types/session";
import { ArrowLeft, Edit, Trash2, Clock, Target, BookOpen, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const SessionDetail = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!sessionId) return;

    const savedSessions = localStorage.getItem('eduai-sessions');
    if (savedSessions) {
      const sessions: Session[] = JSON.parse(savedSessions).map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt)
      }));
      
      const foundSession = sessions.find(s => s.id === sessionId);
      if (foundSession) {
        setSession(foundSession);
      } else {
        toast({
          title: "Sesión no encontrada",
          description: "La sesión que buscas no existe.",
          variant: "destructive"
        });
        navigate('/dashboard');
      }
    }
  }, [sessionId, navigate, toast]);

  const handleDeleteExercise = (exerciseId: string) => {
    if (!session) return;

    const updatedExercises = session.exercises.filter(ex => ex.id !== exerciseId);
    const updatedSession = {
      ...session,
      exercises: updatedExercises,
      totalPoints: updatedExercises.reduce((sum, ex) => sum + ex.points, 0),
      estimatedDuration: updatedExercises.length * 3,
      updatedAt: new Date()
    };

    // Update localStorage
    const savedSessions = JSON.parse(localStorage.getItem('eduai-sessions') || '[]');
    const updatedSessions = savedSessions.map((s: Session) => 
      s.id === session.id ? updatedSession : s
    );
    localStorage.setItem('eduai-sessions', JSON.stringify(updatedSessions));

    setSession(updatedSession);
    toast({
      title: "Ejercicio eliminado",
      description: "El ejercicio ha sido eliminado correctamente.",
    });
  };

  const getExerciseIcon = (type: Exercise['type']) => {
    switch (type) {
      case 'multiple-choice':
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case 'true-false':
        return <XCircle className="h-5 w-5 text-secondary" />;
      case 'short-answer':
        return <HelpCircle className="h-5 w-5 text-accent" />;
      default:
        return <BookOpen className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getExerciseTypeLabel = (type: Exercise['type']) => {
    switch (type) {
      case 'multiple-choice':
        return 'Opción Múltiple';
      case 'true-false':
        return 'Verdadero/Falso';
      case 'short-answer':
        return 'Respuesta Corta';
      case 'fill-blank':
        return 'Completar';
      default:
        return type;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">Cargando sesión...</p>
          </div>
        </div>
      </div>
    );
  }

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
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>

          {/* Session Info */}
          <Card className="mb-8 shadow-medium">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{session.title}</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {session.topic}
                  </CardDescription>
                  {session.description && (
                    <p className="text-muted-foreground mt-2">{session.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="ml-4">
                  {session.exercises.length} ejercicios
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{session.estimatedDuration} min</strong> estimados
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>{session.totalPoints} puntos</strong> totales
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Creado: {formatDate(session.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exercises */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Ejercicios Generados</h2>
              <Button
                onClick={() => navigate(`/session/${session.id}/edit`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Editar Sesión
              </Button>
            </div>

            {session.exercises.map((exercise, index) => (
              <Card key={exercise.id} className="hover:shadow-medium transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getExerciseIcon(exercise.type)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            Ejercicio {index + 1}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getExerciseTypeLabel(exercise.type)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {exercise.points} pts
                          </Badge>
                        </div>
                        <h3 className="font-medium text-foreground">
                          {exercise.question}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedExercise(
                          expandedExercise === exercise.id ? null : exercise.id
                        )}
                      >
                        {expandedExercise === exercise.id ? 'Ocultar' : 'Ver detalles'}
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar ejercicio?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El ejercicio será eliminado permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteExercise(exercise.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                {expandedExercise === exercise.id && (
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      {exercise.options && (
                        <div>
                          <h4 className="font-medium mb-2">Opciones:</h4>
                          <div className="space-y-1">
                            {exercise.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground w-4">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span className="text-sm">{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-1">Respuesta correcta:</h4>
                        <p className="text-sm text-primary font-medium">
                          {Array.isArray(exercise.correctAnswer) 
                            ? exercise.correctAnswer.join(', ') 
                            : exercise.correctAnswer}
                        </p>
                      </div>

                      {exercise.explanation && (
                        <div>
                          <h4 className="font-medium mb-1">Explicación:</h4>
                          <p className="text-sm text-muted-foreground">
                            {exercise.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {session.exercises.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay ejercicios</h3>
                  <p className="text-muted-foreground">
                    Esta sesión no tiene ejercicios. Puedes regenerar la sesión desde el dashboard.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionDetail;