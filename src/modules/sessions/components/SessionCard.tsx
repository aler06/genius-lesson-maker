import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  Play, 
  Square, 
  Trash2, 
  Copy, 
  ExternalLink,
  Calendar,
  Timer,
  BookOpen,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Session } from '../hooks/useSessions';
import { useToast } from '@/hooks/use-toast';

interface SessionCardProps {
  session: Session;
  onStart?: (sessionId: string) => void;
  onEnd?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
  isStarting?: boolean;
  isEnding?: boolean;
  isDeleting?: boolean;
}

const SessionCard = ({ 
  session, 
  onStart, 
  onEnd, 
  onDelete,
  isStarting = false,
  isEnding = false,
  isDeleting = false
}: SessionCardProps) => {
  const { toast } = useToast();

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'finished': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'waiting': return <Clock className="h-3 w-3" />;
      case 'active': return <Play className="h-3 w-3" />;
      case 'finished': return <CheckCircle className="h-3 w-3" />;
      case 'cancelled': return <Square className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusText = (status: Session['status']) => {
    switch (status) {
      case 'waiting': return 'Esperando';
      case 'active': return 'En curso';
      case 'finished': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const copyAccessCode = () => {
    navigator.clipboard.writeText(session.accessCode);
    toast({
      title: "¡Copiado!",
      description: "Código de acceso copiado al portapapeles",
    });
  };

  const copyShareableLink = () => {
    navigator.clipboard.writeText(session.shareableLink);
    toast({
      title: "¡Enlace copiado!",
      description: "Enlace compartible copiado al portapapeles",
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getDuration = () => {
    if (session.startTime && session.endTime) {
      const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
      const minutes = Math.floor(duration / (1000 * 60));
      return `${minutes} min`;
    }
    return `${session.duration} min`;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {session.name}
            </CardTitle>
            {session.description && (
              <CardDescription className="text-sm line-clamp-2">
                {session.description}
              </CardDescription>
            )}
          </div>
          <Badge className={`ml-2 ${getStatusColor(session.status)} flex items-center gap-1`}>
            {getStatusIcon(session.status)}
            {getStatusText(session.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Access Code and Link */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Código:</span>
              <code className="text-lg font-mono font-bold text-primary">
                {session.accessCode}
              </code>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyAccessCode}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={copyShareableLink}
            className="w-full text-xs"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Copiar enlace compartible
          </Button>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{session.participants?.length || 0}/{session.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span>{getDuration()}</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <span>1 ejercicio ({session.exercise.game})</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">{formatDate(new Date(session.createdAt))}</span>
          </div>
        </div>

        {/* Exercise Info */}
        {session.exercise && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Ejercicio:</span>
            <div className="text-xs bg-muted/50 rounded px-2 py-1">
              {session.exercise.word || session.exercise.hint || `Ejercicio de ${session.exercise.game}`}
            </div>
            {session.exercise.hint && session.exercise.word && (
              <div className="text-xs text-muted-foreground">
                Pista: {session.exercise.hint}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {session.status === 'waiting' && (
            <Button
              onClick={() => onStart?.(session.id)}
              disabled={isStarting}
              className="flex-1 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              {isStarting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Iniciar
                </>
              )}
            </Button>
          )}
          
          {session.status === 'active' && (
            <Button
              onClick={() => onEnd?.(session.id)}
              disabled={isEnding}
              variant="destructive"
              className="flex-1"
              size="sm"
            >
              {isEnding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Square className="h-4 w-4 mr-1" />
                  Finalizar
                </>
              )}
            </Button>
          )}

          {(session.status === 'finished' || session.status === 'cancelled') && (
            <Button
              onClick={() => onDelete?.(session.id)}
              disabled={isDeleting}
              variant="outline"
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              size="sm"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </>
              )}
            </Button>
          )}
        </div>

        {/* Additional Info */}
        {session.startTime && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            {session.status === 'active' && (
              <span>Iniciada: {formatDate(new Date(session.startTime))}</span>
            )}
            {session.status === 'finished' && session.endTime && (
              <span>Finalizada: {formatDate(new Date(session.endTime))}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionCard;
