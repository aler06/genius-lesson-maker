import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExerciseResponse } from '../model/exercise-response.model';
import { Game } from '../enum/game.enum';
import { detectSubject, getSubjectInfo } from '../utils/subject-detector';
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

  // Detectar la categoría del ejercicio
  const detectedSubject = detectSubject(exercise);
  const subjectInfo = getSubjectInfo(detectedSubject);
  const SubjectIcon = subjectInfo.icon;

  return (
    <Card className="h-[320px] transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 border-0 bg-gradient-to-br from-white/80 via-card/60 to-primary/5 backdrop-blur-sm flex flex-col group cursor-pointer overflow-hidden relative">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <CardHeader className="pb-4 flex-1 flex items-center justify-center relative z-10">
        <div className="text-center space-y-4">
          {/* Icon container with animation - optimized size */}
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl border border-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm group-hover:shadow-lg">
              <SubjectIcon className="h-8 w-8 text-primary group-hover:text-blue-600 transition-colors duration-300" />
            </div>
          </div>
          
          {/* Badges with improved styling - compact */}
          <div className="flex flex-col gap-2">
            <Badge className={`${subjectInfo.color} pointer-events-none mx-auto shadow-sm group-hover:shadow-md transition-shadow duration-300 text-sm px-3 py-1`}>
              <div className="flex items-center gap-1.5 pointer-events-none">
                <span className="font-medium">{subjectInfo.name}</span>
              </div>
            </Badge>
            
            <Badge className={`${getGameColor(exercise.game)} pointer-events-none mx-auto shadow-sm group-hover:shadow-md transition-shadow duration-300 px-3 py-1`}>
              <div className="flex items-center gap-1.5 pointer-events-none">
                {getGameIcon(exercise.game)}
                <span className="text-xs font-medium">{getGameName(exercise.game)}</span>
              </div>
            </Badge>
          </div>
          
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-shrink-0 relative z-10">
        <div className="space-y-3">
          {/* Action buttons with enhanced styling */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView(exercise.id)}
              className="flex-1 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200 hover:scale-105 hover:shadow-md bg-white/80 backdrop-blur-sm"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(exercise.id)}
              className="flex-1 text-destructive hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all duration-200 hover:scale-105 hover:shadow-md bg-white/80 backdrop-blur-sm"
              disabled={exercise.isPublished}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </div>
          
           {/* Publish button with enhanced styling */}
           <Button
             variant={exercise.isPublished ? "secondary" : "default"}
             size="sm"
             onClick={() => onPublish(exercise.id)}
             disabled={isPublishing || exercise.isPublished}
             className={`w-full transition-all duration-200 ${
               exercise.isPublished 
                 ? 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-300 cursor-default shadow-sm' 
                 : 'bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 text-white shadow-md hover:shadow-xl hover:scale-105'
             }`}
           >
             {exercise.isPublished ? (
               <>
                 <CheckCircle className="h-4 w-4 mr-2" />
                 Publicado
               </>
             ) : isPublishing ? (
               <>
                 <Clock className="h-4 w-4 mr-2 animate-spin" />
                 Publicando...
               </>
             ) : (
               <>
                 <Share2 className="h-4 w-4 mr-2" />
                 Publicar
               </>
             )}
           </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;