import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExerciseResponse } from '../model/exercise-response.model';
import { Game } from '../enum/game.enum';
import { 
  Brain, 
  HelpCircle, 
  PenTool, 
  RotateCcw, 
  Eye, 
  Trash2,
  Calendar,
  Clock,
  Share2,
  CheckCircle
} from 'lucide-react';

interface ExerciseCardProps {
  exercise: ExerciseResponse;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
  isPublishing?: boolean;
}

const getGameIcon = (game: Game) => {
  switch (game) {
    case Game.QUIZ:
      return <Brain className="h-4 w-4" />;
    case Game.HANGMAN:
      return <HelpCircle className="h-4 w-4" />;
    case Game.FILL_IN_THE_BLANK:
      return <PenTool className="h-4 w-4" />;
    case Game.FLIP_CARDS:
      return <RotateCcw className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
  }
};

const getGameName = (game: Game) => {
  switch (game) {
    case Game.QUIZ:
      return 'Quiz';
    case Game.HANGMAN:
      return 'Ahorcado';
    case Game.FILL_IN_THE_BLANK:
      return 'Rellenar espacios';
    case Game.FLIP_CARDS:
      return 'Tarjetas giratorias';
    default:
      return 'Ejercicio';
  }
};

const getGameColor = (game: Game) => {
  switch (game) {
    case Game.QUIZ:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case Game.HANGMAN:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case Game.FILL_IN_THE_BLANK:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case Game.FLIP_CARDS:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const ExerciseCard = ({ exercise, onView, onDelete, onPublish, isPublishing }: ExerciseCardProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getItemCount = () => {
    if (exercise.questions?.length) return exercise.questions.length;
    if (exercise.cards?.length) return exercise.cards.length;
    if (exercise.word) return 1;
    return 0;
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md border-0 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Badge className={`${getGameColor(exercise.game)} pointer-events-none hover:bg-current`}>
            <div className="flex items-center gap-1.5 pointer-events-none">
              {getGameIcon(exercise.game)}
              <span className="text-xs font-medium">{getGameName(exercise.game)}</span>
            </div>
          </Badge>
          {exercise.isPublished && (
            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span>Publicado</span>
            </div>
          )}
        </div>
        
        <CardTitle className="text-base font-semibold text-left">
          Ejercicio #{exercise.id.slice(-6)}
        </CardTitle>
        
        <CardDescription className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(exercise.createdAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {getItemCount()} elementos
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {exercise.instructions && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {exercise.instructions}
            </p>
          )}
          
          {exercise.hint && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
              <strong className="text-foreground">Pista:</strong> {exercise.hint}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(exercise.id)}
                className="flex-[3] hover:bg-primary/10 hover:border-primary/20 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver ejercicio
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(exercise.id)}
                className="flex-[1] text-destructive hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-colors"
                disabled={exercise.isPublished}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {!exercise.isPublished && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onPublish(exercise.id)}
                disabled={isPublishing}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-sm"
              >
                {isPublishing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Publicar ejercicio
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;