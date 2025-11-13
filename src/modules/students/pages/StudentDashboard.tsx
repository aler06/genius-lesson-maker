import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { NavHeader } from '@/components/ui/nav-header';

// Hooks y servicios
import { useMyScores } from '@/modules/sessions/hooks/useSessionScores';
import { authService } from '@/modules/auth/services/auth.service';
import { useToast } from '@/hooks/use-toast';

// Iconos
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle,
  TrendingUp,
  Award,
  Loader2,
  Calendar,
  BookOpen,
  BarChart3,
  GraduationCap,
  LogIn,
  X
} from 'lucide-react';

// Utilidades de fecha
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Dashboard para estudiantes - visualización de progreso y acceso a sesiones
const StudentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authService.getStoredUser();
  const { myScores, isLoading, error, refetch } = useMyScores();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Manejar unión a sesión con código de acceso
  const handleJoinSession = () => {
    if (!accessCode.trim()) {
      toast({
        title: 'Código requerido',
        description: 'Por favor ingresa un código de acceso',
        variant: 'destructive',
      });
      return;
    }

    setIsJoining(true);
    navigate(`/session/join/${accessCode.trim().toUpperCase()}`);
  };

  const handleOpenJoinModal = () => {
    setAccessCode('');
    setIsJoinModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Cargando tus resultados...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <NavHeader />
        <main className="container mx-auto px-4 py-8">
          <Card className="text-center py-12 border-red-500 border-l-4">
            <CardContent>
              <div className="text-red-500 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-red-600">Error al cargar resultados</h3>
              <p className="text-gray-600 mb-4">
                {error instanceof Error ? error.message : 'No se pudieron cargar tus resultados'}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Calcular estadísticas del estudiante
  const totalSessions = myScores?.length || 0;
  const completedSessions = myScores?.filter(score => score.completado).length || 0;
  const averageScore = totalSessions > 0 
    ? myScores!.reduce((sum, score) => sum + score.puntajeFinal, 0) / totalSessions 
    : 0;
  const highestScore = totalSessions > 0 
    ? Math.max(...myScores!.map(score => score.puntajeFinal)) 
    : 0;
  const totalAnswers = myScores?.reduce((sum, score) => sum + score.respuestas.length, 0) || 0;
  const correctAnswers = myScores?.reduce((sum, score) => 
    sum + score.respuestas.filter(r => r.isCorrect).length, 0
  ) || 0;
  const accuracyPercentage = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

  // Ordenar puntajes por fecha (más recientes primero)
  const sortedScores = myScores ? [...myScores].sort((a, b) => 
    new Date(b.fechaResolucion || b.createdAt).getTime() - 
    new Date(a.fechaResolucion || a.createdAt).getTime()
  ) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <NavHeader />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            ¡Hola, {user?.firstName || 'Estudiante'}!
          </h1>
          <p className="text-gray-600 text-lg">
            Aquí puedes ver tu progreso y resultados en las sesiones
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <Button 
            onClick={handleOpenJoinModal}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Unirse a una Sesión
          </Button>
        </div>

        {/* Join Session Modal */}
        <Dialog open={isJoinModalOpen} onOpenChange={setIsJoinModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5 text-blue-600" />
                Unirse a una Sesión
              </DialogTitle>
              <DialogDescription>
                Ingresa el código de acceso que te proporcionó tu profesor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-sm font-medium">
                  Código de Acceso
                </Label>
                <Input
                  id="accessCode"
                  placeholder="Ej: ABC123"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleJoinSession();
                    }
                  }}
                  className="text-center text-2xl font-bold tracking-widest uppercase"
                  maxLength={6}
                  autoFocus
                />
                <p className="text-xs text-gray-500 text-center">
                  El código tiene 6 caracteres
                </p>
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsJoinModalOpen(false)}
                disabled={isJoining}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleJoinSession}
                disabled={isJoining || !accessCode.trim()}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uniéndose...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Unirse
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sesiones Totales</p>
                  <p className="text-3xl font-bold text-blue-600">{totalSessions}</p>
                </div>
                <BookOpen className="h-10 w-10 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completadas</p>
                  <p className="text-3xl font-bold text-green-600">{completedSessions}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Promedio</p>
                  <p className="text-3xl font-bold text-purple-600">{averageScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">sobre 20</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mejor Puntaje</p>
                  <p className="text-3xl font-bold text-yellow-600">{highestScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">sobre 20</p>
                </div>
                <Award className="h-10 w-10 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accuracy Card */}
        <Card className="mb-8 border-l-4 border-l-cyan-500 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-600" />
              Precisión General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Respuestas Correctas</span>
                  <span className="text-sm font-bold text-cyan-600">{accuracyPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${accuracyPercentage}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{correctAnswers}/{totalAnswers}</p>
                <p className="text-xs text-gray-500">respuestas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scores History */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Historial de Resultados
            </CardTitle>
            <CardDescription>
              Tus resultados en todas las sesiones en las que has participado
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedScores.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">No hay resultados aún</h3>
                <p className="text-gray-500 mb-6">
                  Únete a una sesión para empezar a ver tus resultados aquí
                </p>
                <Button 
                  onClick={handleOpenJoinModal}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Unirse a una Sesión
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedScores.map((score, index) => {
                  const correctCount = score.respuestas.filter(r => r.isCorrect).length;
                  const totalCount = score.respuestas.length;
                  const percentage = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;
                  
                  return (
                    <div 
                      key={score.id} 
                      className="border rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Target className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">
                                Sesión #{sortedScores.length - index}
                              </h3>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(score.fechaResolucion || score.createdAt), { 
                                  addSuffix: true,
                                  locale: es 
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {score.puntajeFinal.toFixed(1)}
                            <span className="text-lg text-gray-500">/20</span>
                          </div>
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
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Respuestas</p>
                          <p className="text-xl font-bold text-gray-900">
                            {correctCount}/{totalCount}
                          </p>
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
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Tiempo Total</p>
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <p className="text-xl font-bold text-gray-900">
                              {Math.floor(score.tiempoTotal / 60)}:{(score.tiempoTotal % 60).toString().padStart(2, '0')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-gray-600 mb-1">Calificación</p>
                          <p className={`text-xl font-bold ${
                            score.puntajeFinal >= 18 ? 'text-green-600' :
                            score.puntajeFinal >= 14 ? 'text-blue-600' :
                            score.puntajeFinal >= 10 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {score.puntajeFinal >= 18 ? 'Excelente' :
                             score.puntajeFinal >= 14 ? 'Muy Bien' :
                             score.puntajeFinal >= 10 ? 'Bien' :
                             'Regular'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;
