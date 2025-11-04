import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NavHeader } from '@/components/ui/nav-header';
import { AuthBackground } from '@/components/ui/auth-background';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useTemporaryUser } from '@/hooks/useTemporaryUser';
import StudentNameModal from '@/components/StudentNameModal';
import { Users, Wifi, AlertCircle, Loader2, GraduationCap, LogIn, UserPlus, BookOpenCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatAccessCode, isValidAccessCode } from '@/utils/sessionHelpers';
import { validateSession } from '@/utils/api';
import { checkSessionCompletion } from '@/modules/sessions/services/session-scores.service';

const JoinSession = () => {
  const navigate = useNavigate();
  const { accessCode: urlAccessCode } = useParams<{ accessCode: string }>();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { tempUser, createTemporaryUser, updateTemporaryUser } = useTemporaryUser();
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<any>(null);

  // Debug logs
  console.log('JoinSession render:', { 
    user, 
    isAuthenticated,
    authLoading,
    tempUser, 
    showNameModal, 
    pendingSessionData: !!pendingSessionData 
  });

  const handleJoinSessionWithCode = async (code: string) => {
    // Wait for auth to finish loading before proceeding
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate the session exists using the API utility
      const sessionData = await validateSession(code);
      
      // If user is authenticated (registered student or teacher), check if they already completed this session
      if (isAuthenticated && user) {
        console.log('Authenticated user joining session:', user);
        
        // Check if user already completed this session
        try {
          const existingCompletion = await checkSessionCompletion(sessionData.id, user.email);
          
          if (existingCompletion) {
            // User already completed this session - block access
            toast({
              title: '⚠️ Sesión ya completada',
              description: `Ya completaste esta sesión con un puntaje de ${existingCompletion.puntajeFinal?.toFixed(1) || 0}/20. No puedes volver a entrar.`,
              variant: 'destructive',
            });
            setIsLoading(false);
            return; // Block access
          }
        } catch (checkError) {
          console.log('Error checking completion (allowing access):', checkError);
          // If check fails (404 or error), allow access (fail open)
        }
        
        // Use authenticated user's data directly from the database
        navigate(`/session/${sessionData.id}`, { 
          state: { 
            sessionData,
            accessCode: code,
            currentUser: {
              id: user.id,
              _id: user.id, // Backend might expect _id
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              isTemporary: false // Authenticated users are not temporary
            }
          } 
        });
        return; // Exit early to prevent any modal from showing
      }
      
      // For non-authenticated users, show name modal to create temporary user
      console.log('Non-authenticated user - showing name modal', { isAuthenticated, user });
      setPendingSessionData({ sessionData, accessCode: code });
      setShowNameModal(true);

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
  // Wait for auth to finish loading before attempting to join
  useEffect(() => {
    if (urlAccessCode && !authLoading) {
      setAccessCode(urlAccessCode.toUpperCase());
      // Try to join with the URL access code once auth is loaded
      handleJoinSessionWithCode(urlAccessCode.toUpperCase());
    }
  }, [urlAccessCode, authLoading]);

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

  const handleNameSubmit = async (name: string) => {
    // Check if there's already a temporary user in localStorage
    let userToUse = tempUser;
    
    if (!userToUse) {
      // Create new temporary user only if one doesn't exist
      userToUse = createTemporaryUser(name);
    } else {
      // Update the existing temporary user's name if it changed
      const currentName = `${userToUse.firstName} ${userToUse.lastName}`.trim();
      if (currentName !== name.trim()) {
        userToUse = updateTemporaryUser(name) || userToUse;
      }
    }
    
    // Check if temporary user already completed this session
    if (pendingSessionData && userToUse.email) {
      try {
        const existingCompletion = await checkSessionCompletion(
          pendingSessionData.sessionData.id,
          userToUse.email
        );
        
        if (existingCompletion) {
          // User already completed this session - block access
          setShowNameModal(false);
          setPendingSessionData(null);
          toast({
            title: '⚠️ Sesión ya completada',
            description: `Ya completaste esta sesión con un puntaje de ${existingCompletion.puntajeFinal?.toFixed(1) || 0}/20. No puedes volver a entrar.`,
            variant: 'destructive',
          });
          return; // Block access
        }
      } catch (checkError) {
        console.log('Error checking completion for temp user (allowing access):', checkError);
        // If check fails (404 or error), allow access (fail open)
      }
    }
    
    // Email is already included in tempUser model
    setShowNameModal(false);
    
    if (pendingSessionData) {
      navigate(`/session/${pendingSessionData.sessionData.id}`, { 
        state: { 
          sessionData: pendingSessionData.sessionData,
          accessCode: pendingSessionData.accessCode,
          currentUser: userToUse
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
    <div className="min-h-screen relative">
      <AuthBackground />
      <NavHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Header */}
          <div className="text-center mb-12">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  EduAI - Generador de Ejercicios
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Únete a sesiones interactivas de aprendizaje o accede como profesor para crear y gestionar ejercicios
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Join Session Card */}
            <Card className="bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-gray-900">Unirse a Sesión</CardTitle>
                <CardDescription className="text-base text-gray-600">
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
                      placeholder="CODIGO"
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
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
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
            <Card className="bg-white rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full">
                    <BookOpenCheck className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-2xl text-gray-900">Acceso para Profesores</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  Crea y gestiona ejercicios interactivos con IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/register')}
                    variant="outline"
                    className="w-full border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Cuenta
                  </Button>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">¿Qué puedes hacer?</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Generar ejercicios con IA</li>
                    <li>• Crear sesiones interactivas</li>
                    <li>• Gestionar estudiantes</li>
                    <li>• Ver estadísticas en tiempo real</li>
                  </ul>
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
