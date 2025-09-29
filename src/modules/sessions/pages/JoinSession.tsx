import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NavHeader } from '@/components/ui/nav-header';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useTemporaryUser } from '@/hooks/useTemporaryUser';
import StudentNameModal from '@/components/StudentNameModal';
import { Users, Wifi, AlertCircle, Loader2, BookOpen, GraduationCap, LogIn, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatAccessCode, isValidAccessCode } from '@/utils/sessionHelpers';
import { validateSession } from '@/utils/api';

const JoinSession = () => {
  const navigate = useNavigate();
  const { accessCode: urlAccessCode } = useParams<{ accessCode: string }>();
  const { user } = useAuth();
  const { tempUser, createTemporaryUser } = useTemporaryUser();
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<any>(null);

  // Debug logs
  console.log('JoinSession render:', { 
    user, 
    tempUser, 
    showNameModal, 
    pendingSessionData: !!pendingSessionData 
  });

  const handleJoinSessionWithCode = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate the session exists using the API utility
      const sessionData = await validateSession(code);
      
      // If user is authenticated (teacher/registered student), join directly
      if (user) {
        navigate(`/session/${sessionData.id}`, { 
          state: { 
            sessionData,
            accessCode: code,
            currentUser: user
          } 
        });
      } else {
        // For non-authenticated users, always show name modal (even if tempUser exists)
        // This ensures students can change their name if needed
        console.log('Showing name modal for non-authenticated user');
        setPendingSessionData({ sessionData, accessCode: code });
        setShowNameModal(true);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al unirse a la sesión';
      setError(errorMessage);
      
      // Show more detailed error information for CORS issues
      const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('conexión');
      
      toast({
        title: isCorsError ? "Error de Configuración" : "Error",
        description: isCorsError 
          ? "El servidor necesita configurar CORS. Consulta CORS-SOLUTION.md para más detalles."
          : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If there's an access code in the URL, use it and auto-join
  useEffect(() => {
    if (urlAccessCode) {
      setAccessCode(urlAccessCode.toUpperCase());
      // Always try to join with the URL access code
      handleJoinSessionWithCode(urlAccessCode.toUpperCase());
    }
  }, [urlAccessCode]);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessCode.trim()) {
      setError('Por favor ingresa un código de sesión');
      return;
    }

    if (!isValidAccessCode(accessCode)) {
      setError('El código debe tener exactamente 6 caracteres alfanuméricos');
      return;
    }

    await handleJoinSessionWithCode(accessCode.toUpperCase());
  };

  const handleNameSubmit = (name: string) => {
    const newTempUser = createTemporaryUser(name);
    setShowNameModal(false);
    
    if (pendingSessionData) {
      navigate(`/session/${pendingSessionData.sessionData.id}`, { 
        state: { 
          sessionData: pendingSessionData.sessionData,
          accessCode: pendingSessionData.accessCode,
          currentUser: newTempUser
        } 
      });
      setPendingSessionData(null);
    }
  };

  const handleNameModalClose = () => {
    setShowNameModal(false);
    setPendingSessionData(null);
    setIsLoading(false);
  };

  const handleAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccessCode(e.target.value);
    setAccessCode(formatted);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <NavHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-gradient-to-r from-primary to-blue-500 rounded-full shadow-lg">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
              EduAI - Generador de Ejercicios
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Únete a sesiones interactivas de aprendizaje o accede como profesor para crear y gestionar ejercicios
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Join Session Card */}
            <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-primary/20 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-primary to-blue-500 rounded-full">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Unirse a Sesión</CardTitle>
                <CardDescription className="text-base">
                  Ingresa el código de 6 dígitos para participar en una sesión interactiva
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinSession} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="accessCode" className="text-sm font-medium">
                      Código de Acceso
                    </Label>
                    <Input
                      id="accessCode"
                      type="text"
                      placeholder="Ej: ABC123"
                      value={accessCode}
                      onChange={handleAccessCodeChange}
                      className="text-center text-lg font-mono tracking-widest uppercase"
                      maxLength={6}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      No necesitas crear una cuenta para participar
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {error}
                        {(error.includes('CORS') || error.includes('conexión')) && (
                          <div className="mt-2 text-xs">
                            <strong>Solución:</strong> El backend necesita configurar CORS. 
                            Consulta el archivo <code>CORS-SOLUTION.md</code> en la raíz del proyecto.
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-blue-500 hover:from-primary-hover hover:to-blue-600 shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading || !accessCode.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4" />
                        Unirse a la Sesión
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Teacher Access Card */}
            <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-green-200 shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl">Acceso para Profesores</CardTitle>
                <CardDescription className="text-base">
                  Crea y gestiona ejercicios interactivos con IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/register')}
                    variant="outline"
                    className="w-full border-green-200 hover:bg-green-50"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Cuenta
                  </Button>
                </div>

                <div className="pt-4 border-t border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">¿Qué puedes hacer?</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Generar ejercicios con IA</li>
                    <li>• Crear sesiones interactivas</li>
                    <li>• Gestionar estudiantes</li>
                    <li>• Ver estadísticas en tiempo real</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Section */}
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="bg-blue-50/50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-medium text-blue-900">Para Estudiantes</h3>
                    <p className="text-sm text-blue-700">
                      Solo necesitas el código de sesión que te proporcione tu profesor. 
                      No es necesario crear una cuenta - solo ingresa tu nombre y comienza a aprender.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50/50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-6 w-6 text-green-600 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="font-medium text-green-900">Para Profesores</h3>
                    <p className="text-sm text-green-700">
                      Crea una cuenta para acceder a todas las herramientas: generador de ejercicios con IA, 
                      gestión de sesiones y análisis de resultados.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Student Name Modal */}
      <StudentNameModal
        isOpen={showNameModal}
        onClose={handleNameModalClose}
        onSubmit={handleNameSubmit}
        sessionName={pendingSessionData?.sessionData?.name}
      />
    </div>
  );
};

export default JoinSession;
