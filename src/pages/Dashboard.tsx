import { useState, useEffect } from "react";
import { NavHeader } from "@/components/ui/nav-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Session } from "@/types/session";
import { Edit, Trash2, Eye, Calendar, Clock, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Load sessions from localStorage
    const savedSessions = localStorage.getItem('eduai-sessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }));
      setSessions(parsedSessions);
    }
  }, []);

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    localStorage.setItem('eduai-sessions', JSON.stringify(updatedSessions));
    
    toast({
      title: "Sesión eliminada",
      description: "La sesión ha sido eliminada correctamente.",
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTypeColor = (exerciseCount: number) => {
    if (exerciseCount <= 3) return 'bg-secondary';
    if (exerciseCount <= 6) return 'bg-accent';
    return 'bg-primary';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <NavHeader />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Sesiones</h1>
          <p className="text-muted-foreground">Gestiona tus sesiones de ejercicios y contenido educativo</p>
        </div>

        {sessions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Target className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No hay sesiones creadas</h3>
              <p className="text-muted-foreground mb-4">
                Comienza creando tu primera sesión de ejercicios
              </p>
              <Button onClick={() => navigate('/')} className="bg-gradient-to-r from-primary to-blue-500">
                Crear Primera Sesión
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {session.topic}
                      </CardDescription>
                    </div>
                    <Badge 
                      className={`${getTypeColor(session.exercises.length)} text-white`}
                    >
                      {session.exercises.length} ejercicios
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(session.createdAt)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {session.estimatedDuration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {session.totalPoints} pts
                      </div>
                    </div>

                    {session.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {session.description}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/session/${session.id}`)}
                        className="flex-1 gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/session/${session.id}/edit`)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSession(session.id)}
                        className="gap-2 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sessions.length > 0 && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-secondary to-green-500 hover:from-secondary-hover hover:to-green-600"
            >
              Crear Nueva Sesión
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;