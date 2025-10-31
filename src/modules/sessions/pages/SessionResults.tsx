import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NavHeader } from '@/components/ui/nav-header';
import { useSessionScores } from '../hooks/useSessionScores';
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Award,
  Loader2,
  Mail,
  User
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const SessionResults = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessionScores, isLoadingScores, scoresError, refetchScores } = useSessionScores(sessionId);

  if (isLoadingScores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Cargando resultados...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (scoresError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12 border-destructive border-l-4">
            <CardContent>
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-destructive">Error al cargar resultados</h3>
              <p className="text-muted-foreground mb-4">
                {scoresError instanceof Error ? scoresError.message : 'No se pudieron cargar los resultados'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => refetchScores()} variant="outline">
                  Reintentar
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Volver al Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Handle case when no scores are available yet (404 from backend)
  if (!sessionScores || !sessionScores.scores || sessionScores.scores.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          
          <Card className="text-center py-12 border-yellow-500 border-l-4">
            <CardContent>
              <Users className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay resultados disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Aún no hay estudiantes que hayan completado esta sesión.
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => refetchScores()} variant="outline">
                  Actualizar
                </Button>
                <Button onClick={() => navigate('/dashboard')}>
                  Volver al Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const { scores, sessionName, totalParticipants, completedCount, averageScore, highestScore, lowestScore } = sessionScores;

  // Sort scores by final score (descending)
  const sortedScores = [...scores].sort((a, b) => b.puntajeFinal - a.puntajeFinal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <NavHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al Dashboard
        </Button>

        {/* Header Card */}
        <Card className="mb-6 shadow-lg border-l-4 border-l-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  Resultados de la Sesión
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {sessionName}
                </CardDescription>
              </div>
              <Button onClick={() => refetchScores()} variant="outline">
                Actualizar
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Participantes</p>
                  <p className="text-3xl font-bold text-blue-600">{totalParticipants}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completaron</p>
                  <p className="text-3xl font-bold text-green-600">{completedCount}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Promedio</p>
                  <p className="text-3xl font-bold text-purple-600">{averageScore.toFixed(1)}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Puntaje Más Alto</p>
                  <p className="text-3xl font-bold text-yellow-600">{highestScore.toFixed(1)}</p>
                </div>
                <Award className="h-10 w-10 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scores Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Tabla de Puntajes
            </CardTitle>
            <CardDescription>
              Resultados detallados de todos los estudiantes que participaron
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedScores.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No hay resultados aún</h3>
                <p className="text-muted-foreground">
                  Los estudiantes aún no han completado la sesión
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Posición</th>
                      <th className="text-left p-4 font-semibold">Estudiante</th>
                      <th className="text-left p-4 font-semibold">Correo</th>
                      <th className="text-center p-4 font-semibold">Puntaje Final</th>
                      <th className="text-center p-4 font-semibold">Tiempo Total</th>
                      <th className="text-center p-4 font-semibold">Respuestas</th>
                      <th className="text-center p-4 font-semibold">Estado</th>
                      <th className="text-center p-4 font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedScores.map((score, index) => {
                      const correctAnswers = score.respuestas.filter(r => r.isCorrect).length;
                      const totalAnswers = score.respuestas.length;
                      const percentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
                      
                      return (
                        <tr key={score.id} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Trophy className="h-5 w-5 text-yellow-500" />
                              )}
                              {index === 1 && (
                                <Trophy className="h-5 w-5 text-gray-400" />
                              )}
                              {index === 2 && (
                                <Trophy className="h-5 w-5 text-orange-600" />
                              )}
                              <span className="font-bold text-lg">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{score.nombre}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              {score.correo}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-2xl font-bold text-primary">
                                {score.puntajeFinal.toFixed(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">puntos</span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {Math.floor(score.tiempoTotal / 60)}:{(score.tiempoTotal % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold">
                                {correctAnswers}/{totalAnswers}
                              </span>
                              <Badge 
                                variant="outline" 
                                className={`mt-1 ${
                                  percentage >= 80 ? 'bg-green-100 text-green-800 border-green-300' :
                                  percentage >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                                  'bg-red-100 text-red-800 border-red-300'
                                }`}
                              >
                                {percentage.toFixed(0)}%
                              </Badge>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {score.completado ? (
                              <Badge className="bg-green-500 hover:bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                <Clock className="h-3 w-3 mr-1" />
                                En progreso
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-center text-sm text-muted-foreground">
                            {(() => {
                              // Use fechaResolucion if available, otherwise fall back to updatedAt or createdAt
                              const dateToUse = score.fechaResolucion || score.updatedAt || score.createdAt;
                              if (dateToUse && !isNaN(new Date(dateToUse).getTime())) {
                                return formatDistanceToNow(new Date(dateToUse), { 
                                  addSuffix: true,
                                  locale: es 
                                });
                              }
                              return 'Fecha no disponible';
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card */}
        {sortedScores.length > 0 && (
          <Card className="mt-6 border-l-4 border-l-cyan-500">
            <CardHeader>
              <CardTitle className="text-lg">Resumen Estadístico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Puntaje más bajo</p>
                  <p className="text-xl font-bold">{lowestScore.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Tasa de finalización</p>
                  <p className="text-xl font-bold">
                    {totalParticipants > 0 ? ((completedCount / totalParticipants) * 100).toFixed(0) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Total respuestas</p>
                  <p className="text-xl font-bold">
                    {sortedScores.reduce((sum, score) => sum + score.respuestas.length, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Respuestas correctas</p>
                  <p className="text-xl font-bold text-green-600">
                    {sortedScores.reduce((sum, score) => 
                      sum + score.respuestas.filter(r => r.isCorrect).length, 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SessionResults;
