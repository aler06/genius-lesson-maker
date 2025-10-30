import { GraduationCap, BookOpen, Brain, Lightbulb, Sparkles, Zap, Target, Trophy, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export type LogoVariant = 'graduation' | 'book' | 'brain' | 'lightbulb' | 'sparkles' | 'zap' | 'target' | 'trophy' | 'award' | 'star';

interface LogoProps {
  variant?: LogoVariant;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
  onClick?: () => void;
}

const logoVariants = {
  graduation: GraduationCap,
  book: BookOpen,
  brain: Brain,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
  zap: Zap,
  target: Target,
  trophy: Trophy,
  award: Award,
  star: Star,
};

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Logo({ variant = 'graduation', size = 'md', className, showText = true, onClick }: LogoProps) {
  const IconComponent = logoVariants[variant];

  return (
    <div
      className={cn("flex items-center gap-2", onClick && "cursor-pointer", className)}
      onClick={onClick}
    >
      <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-blue-500">
        <IconComponent className={cn(sizeClasses[size], "text-white")} />
      </div>
      {showText && (
        <div>
          <h1 className="text-xl font-bold text-foreground">EduAI</h1>
          <p className="text-sm text-muted-foreground">Generador de Ejercicios</p>
        </div>
      )}
    </div>
  );
}
