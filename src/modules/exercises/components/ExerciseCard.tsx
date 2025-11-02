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
  Move,
  CheckSquare,
  Target,
  Link2
} from 'lucide-react';

interface ExerciseCardProps {
  exercise: ExerciseResponse;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
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
    case Game.DRAG_AND_DROP:
      return <Move className="h-4 w-4" />;
    case Game.TRUE_OR_FALSE:
      return <CheckSquare className="h-4 w-4" />;
    case Game.ROULETTE:
      return <Target className="h-4 w-4" />;
    case Game.MATCHING:
      return <Link2 className="h-4 w-4" />;
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
    case Game.DRAG_AND_DROP:
      return 'Arrastrar y soltar';
    case Game.TRUE_OR_FALSE:
      return 'Verdadero o falso';
    case Game.ROULETTE:
      return 'Ruleta';
    case Game.MATCHING:
      return 'Emparejamiento';
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
    case Game.DRAG_AND_DROP:
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    case Game.TRUE_OR_FALSE:
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
    case Game.ROULETTE:
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300';
    case Game.MATCHING:
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const ExerciseCard = ({ exercise, onView, onDelete }: ExerciseCardProps) => {
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
    if (exercise.elements?.length) return exercise.elements.length;
    if (exercise.trueFalseQuestions?.length) return exercise.trueFalseQuestions.length;
    if (exercise.phrases?.length) return exercise.phrases.length;
    if (exercise.pairs?.length) return exercise.pairs.length;
    if (exercise.word) return 1;
    return 0;
  };

  // Detectar la categoría del ejercicio
  const detectedSubject = detectSubject(exercise);
  const subjectInfo = getSubjectInfo(detectedSubject);
  const SubjectIcon = subjectInfo.icon;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm">
      {/* Main content - vertical centered layout */}
      <div className="flex flex-col items-center gap-4 p-6">
        {/* Large circular icon */}
        <div className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full ${getGameColor(exercise.game)}`}>
          <div className="scale-150">
            {getGameIcon(exercise.game)}
          </div>
        </div>
        
        {/* Badges centered */}
        <div className="flex flex-col items-center gap-2">
          <div className={`inline-flex items-center rounded-full border-0 px-3 py-1 text-xs font-medium ${subjectInfo.color} pointer-events-none`}>
            <SubjectIcon className="mr-1.5 h-3.5 w-3.5" />
            {subjectInfo.name}
          </div>
          <div className="inline-flex items-center rounded-full border border-border/40 bg-background/60 px-3 py-1 text-xs font-medium pointer-events-none">
            {getGameName(exercise.game)}
          </div>
        </div>
        
        {/* Stats centered */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
            <span>{getItemCount()} {getItemCount() === 1 ? 'ítem' : 'ítems'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
            <span>{formatDate(exercise.createdAt)}</span>
          </div>
        </div>

        {/* Action buttons - full width */}
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(exercise.id)}
            className="flex-1 rounded-full border-border/50 bg-background/50 text-sm"
          >
            <Eye className="mr-1.5 h-4 w-4" />
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(exercise.id)}
            className="flex-1 rounded-full border-border/50 bg-background/50 text-sm text-muted-foreground"
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;