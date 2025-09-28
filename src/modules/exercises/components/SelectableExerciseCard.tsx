import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExerciseResponse } from '../model/exercise-response.model';
import { Game } from '../enum/game.enum';
import { detectSubject, getSubjectInfo } from '../utils/subject-detector';
import { CheckCircle2, Circle, Eye } from 'lucide-react';

interface SelectableExerciseCardProps {
  exercise: ExerciseResponse;
  isSelected: boolean;
  onToggle: (exerciseId: string) => void;
  onView: (exerciseId: string) => void;
}

const getGameIcon = (game: Game) => {
  switch (game) {
    case Game.QUIZ:
      return '🧠';
    case Game.HANGMAN:
      return '🎯';
    case Game.FILL_IN_THE_BLANK:
      return '✏️';
    case Game.FLIP_CARDS:
      return '🔄';
    default:
      return '📝';
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

const SelectableExerciseCard = ({ exercise, isSelected, onToggle, onView }: SelectableExerciseCardProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Detectar la categoría del ejercicio
  const detectedSubject = detectSubject(exercise);
  const subjectInfo = getSubjectInfo(detectedSubject);
  const SubjectIcon = subjectInfo.icon;

  return (
    <Card 
      className={`h-[320px] w-full min-w-[280px] transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isSelected 
          ? 'bg-primary/5 shadow-lg ring-2 ring-primary/20 border-primary' 
          : 'bg-gradient-to-br from-white/80 via-card/60 to-primary/5 hover:border-primary/50'
      } backdrop-blur-sm flex flex-col group cursor-pointer overflow-hidden relative`}
      onClick={() => onToggle(exercise.id)}
    >
      {/* Selection indicator */}
      <div className="absolute top-3 right-3 z-20">
        {isSelected ? (
          <div className="bg-primary text-white rounded-full p-1 shadow-lg">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        ) : (
          <div className="bg-white/80 border-2 border-gray-300 rounded-full p-1 group-hover:border-primary/50 transition-colors">
            <Circle className="h-5 w-5 text-gray-400 group-hover:text-primary/70" />
          </div>
        )}
      </div>

      {/* Decorative gradient overlay */}
      <div className={`absolute inset-0 ${
        isSelected 
          ? 'bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 opacity-100' 
          : 'bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100'
      } transition-opacity duration-300 pointer-events-none`} />
      
      <CardHeader className="pb-4 pt-6 flex-1 flex items-center justify-center relative z-10">
        <div className="text-center space-y-4">
          {/* Icon container with animation */}
          <div className="flex justify-center">
            <div className={`p-3 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-2xl border border-primary/20 ${
              isSelected ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'
            } transition-all duration-300 shadow-sm group-hover:shadow-lg`}>
              <SubjectIcon className={`h-10 w-10 ${
                isSelected ? 'text-primary' : 'text-primary group-hover:text-blue-600'
              } transition-colors duration-300`} />
            </div>
          </div>
          
          {/* Badges */}
          <div className="flex flex-col gap-2">
            <Badge className={`${subjectInfo.color} pointer-events-none mx-auto shadow-sm group-hover:shadow-md transition-shadow duration-300 text-xs px-2 py-1`}>
              <div className="flex items-center gap-1.5 pointer-events-none">
                <span className="font-medium">{subjectInfo.name}</span>
              </div>
            </Badge>
            
            <Badge className={`${getGameColor(exercise.game)} pointer-events-none mx-auto shadow-sm group-hover:shadow-md transition-shadow duration-300 px-2 py-1`}>
              <div className="flex items-center gap-1.5 pointer-events-none">
                <span className="text-lg">{getGameIcon(exercise.game)}</span>
                <span className="text-xs font-medium">{getGameName(exercise.game)}</span>
              </div>
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4 px-4 flex-shrink-0 relative z-10">
        <div className="space-y-4">
          {/* View Exercise Button */}
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card selection when clicking button
                onView(exercise.id);
              }}
              className="w-full hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Ejercicio
            </Button>
          </div>

          {/* Selection status */}
          <div className="text-center">
            <div className={`text-sm font-medium px-3 py-2 rounded-full transition-all duration-200 ${
              isSelected 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'bg-muted text-muted-foreground border border-transparent'
            }`}>
              {isSelected ? '✓ Seleccionado' : 'Clic para seleccionar'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SelectableExerciseCard;
