import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavHeader } from '@/components/ui/nav-header';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { apiRequest } from '@/utils/api';
import { Loader2, ArrowLeft, BookOpen, Target, FlipHorizontal } from 'lucide-react';
import ExerciseTemplate from '@/modules/exercises/components/ExerciseTemplate';
import FlipCardsGame from '@/modules/exercises/components/FlipCardsGame';
import RouletteGame from '@/modules/exercises/components/RouletteGame';
import { ExerciseResponse } from '@/modules/exercises/model/exercise-response.model';
import { useExercises } from '@/modules/exercises/hooks/useExercises';

interface DynamicSessionExercise extends ExerciseResponse {}

interface DynamicSession {
  id: string;
  name: string;
  description?: string;
  sessionType: 'normal' | 'dynamic';
  exercises: DynamicSessionExercise[];
}

const DynamicSessionView: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exercises: teacherExercises } = useExercises(user?.id);

  const [session, setSession] = useState<DynamicSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiRequest(`/api/v1/sessions/${sessionId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'No se pudo cargar la sesión');
        }

        const data = await response.json();
        // Asegurarnos de que haya exercises como array
        const exercises = (data.exerciseIds || data.exercises || []).map((ex: any) => ({
          ...ex,
          id: ex.id || ex._id,
        }));

        const mapped: DynamicSession = {
          id: data.id,
          name: data.name,
          description: data.description,
          sessionType: data.sessionType || 'dynamic',
          exercises,
        };

        setSession(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error inesperado');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const renderExercise = (exercise: DynamicSessionExercise, index: number) => {
    // Intentar usar la versión completa del ejercicio (con frases, cartas, etc.)
    const fullExercise = teacherExercises?.find(e => e.id === exercise.id);
    const exToUse = (fullExercise as DynamicSessionExercise | undefined) || exercise;

    // Para flip_cards usamos el juego interactivo con una cabecera simple
    if (exToUse.game === 'flip_cards') {
      if (!exToUse.cards || exToUse.cards.length === 0) {
        return (
          <Card key={exToUse.id} className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <FlipHorizontal className="h-5 w-5" />
                Tarjetas Giratorias #{index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600">Este ejercicio no tiene tarjetas configuradas.</p>
            </CardContent>
          </Card>
        );
      }

      return (
        <div key={exToUse.id} className="space-y-3">
          <div className="flex items-center gap-2 text-purple-800">
            <FlipHorizontal className="h-5 w-5" />
            <span className="font-semibold text-sm">Tarjetas Giratorias #{index + 1}</span>
          </div>
          <FlipCardsGame
            cards={exToUse.cards || []}
            instructions={exToUse.instructions}
            // Modo similar a alumno, pero sin sistema de puntaje global
            studentMode={true}
          />
        </div>
      );
    }

    if (exToUse.game === 'roulette') {
      // Para ruleta reutilizamos ExerciseTemplate, que ya tiene
      // la misma vista previa que ves en el dashboard (lista de frases + ruleta)
      return (
        <ExerciseTemplate
          key={exToUse.id}
          exercise={exToUse}
          showActions={false}
        />
      );
    }

    // Para otros tipos de ejercicios, reutilizamos ExerciseTemplate
    return (
      <ExerciseTemplate
        key={exToUse.id}
        exercise={exToUse}
        showActions={false}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <NavHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al Dashboard
            </Button>
          </div>

          {isLoading && (
            <div className="flex justify-center items-center min-h-[300px]">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
            </div>
          )}

          {!isLoading && error && (
            <Card className="border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Error</CardTitle>
                <CardDescription>{error}</CardDescription>
              </CardHeader>
            </Card>
          )}

          {!isLoading && session && (
            <>
              <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/10 to-purple-50">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-primary" />
                        {session.name}
                      </CardTitle>
                      {session.description && (
                        <CardDescription>{session.description}</CardDescription>
                      )}
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 border border-purple-200">
                      Dinámica · Solo profesor
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {session.exercises.length === 0 ? (
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      Esta sesión dinámica aún no tiene ejercicios asociados.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {session.exercises.map((exercise, index) => renderExercise(exercise, index))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default DynamicSessionView;
