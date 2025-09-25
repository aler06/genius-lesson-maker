import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NavHeader } from "@/components/ui/nav-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Loader2, Share2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../../auth/hooks/useAuth";
import { useExerciseById, useExercises } from "../hooks/useExercises";
import ExerciseTemplate from "../components/ExerciseTemplate";
import ExerciseEditor from "../components/ExerciseEditor";
import { ExerciseResponse } from "../model/exercise-response.model";
import { exerciseService } from "../services/exercise.service";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ExerciseDetail = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { exercise, isLoading, error } = useExerciseById(exerciseId, user?.id);
  const { deleteExercise, publishExercise, isPublishing } = useExercises(user?.id);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<ExerciseResponse | null>(null);

  const handleDeleteExercise = async () => {
    if (!exerciseId || !user?.id) return;

    try {
      await deleteExercise({ exerciseId, userId: user.id });
      toast({
        title: "Ejercicio eliminado",
        description: "El ejercicio ha sido eliminado correctamente.",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el ejercicio.",
      });
    }
  };

  const handleEditClick = () => {
    setCurrentExercise(exercise);
    setIsEditing(true);
  };

  const handleSaveEdit = async (updatedExercise: ExerciseResponse) => {
    try {
      // Create the update request object
      const updateRequest = {
        exerciseId: updatedExercise.id,
        userId: user?.id || '',
        questions: updatedExercise.questions,
        word: updatedExercise.word,
        hint: updatedExercise.hint,
        cards: updatedExercise.cards,
        instructions: updatedExercise.instructions,
      };
      
      // Update the exercise using the service
      await exerciseService.updateExercise(updateRequest);
      
      toast({
        title: "Ejercicio actualizado",
        description: "Los cambios han sido guardados exitosamente.",
      });
      
      // Exit edit mode
      setIsEditing(false);
      setCurrentExercise(null);
      
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error instanceof Error ? error.message : "No se pudo actualizar el ejercicio.",
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentExercise(null);
  };

  const handlePublishExercise = async () => {
    if (!exerciseId) return;
    publishExercise(exerciseId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Cargando ejercicio...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12 border-destructive">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2 text-destructive">
                Error al cargar el ejercicio
              </h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : 'El ejercicio no se pudo cargar'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/dashboard')} variant="outline">
                  Volver al Dashboard
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Intentar de nuevo
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-muted">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with actions */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            
            <div className="flex gap-2">
              {!exercise.isPublished && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePublishExercise}
                  disabled={isPublishing}
                  className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 text-white"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-2" />
                      Publicar
                    </>
                  )}
                </Button>
              )}
              
              {exercise.isPublished && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-md pointer-events-none">
                  <CheckCircle className="h-4 w-4 pointer-events-none" />
                  Publicado
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className={exercise.isPublished ? 'pointer-events-none hover:bg-background hover:text-foreground' : ''}
              >
                <Edit className={`h-4 w-4 mr-2 ${exercise.isPublished ? 'pointer-events-none' : ''}`} />
                Editar
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className={`text-destructive ${exercise.isPublished ? 'pointer-events-none hover:bg-background hover:text-destructive' : 'hover:text-destructive'}`}>
                    <Trash2 className={`h-4 w-4 mr-2 ${exercise.isPublished ? 'pointer-events-none' : ''}`} />
                    Eliminar
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
                    <AlertDialogAction onClick={handleDeleteExercise} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Exercise content */}
          {isEditing && currentExercise ? (
            <ExerciseEditor
              exercise={currentExercise}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : (
            <ExerciseTemplate exercise={exercise} />
          )}

          {/* Action buttons */}
          {!isEditing && (
            <div className="mt-8 flex justify-center gap-4">
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Volver al Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600"
              >
                Crear Nuevo Ejercicio
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExerciseDetail;
