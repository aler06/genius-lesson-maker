import { Subject } from '../enum/subject.enum';
import { ExerciseResponse } from '../model/exercise-response.model';
import { 
  Code, 
  Calculator, 
  BookOpen, 
  Microscope, 
  Languages, 
  Globe, 
  Palette, 
  Trophy, 
  Music,
  Brain
} from 'lucide-react';

// Palabras clave para detectar automáticamente la categoría
const SUBJECT_KEYWORDS = {
  [Subject.PROGRAMMING]: [
    'javascript', 'python', 'java', 'html', 'css', 'react', 'angular', 'vue',
    'código', 'programación', 'algoritmo', 'función', 'variable', 'array',
    'objeto', 'clase', 'método', 'api', 'framework', 'biblioteca', 'syntax',
    'debugging', 'frontend', 'backend', 'database', 'sql', 'git', 'github'
  ],
  [Subject.MATHEMATICS]: [
    'suma', 'resta', 'multiplicación', 'división', 'ecuación', 'álgebra',
    'geometría', 'trigonometría', 'cálculo', 'estadística', 'probabilidad',
    'número', 'fracción', 'decimal', 'porcentaje', 'raíz', 'potencia',
    'matemáticas', 'fórmula', 'teorema', 'demostración', 'gráfica'
  ],
  [Subject.HISTORY]: [
    'historia', 'guerra', 'revolución', 'imperio', 'civilización', 'cultura',
    'antiguo', 'medieval', 'moderno', 'contemporáneo', 'siglo', 'año',
    'batalla', 'rey', 'reina', 'presidente', 'independencia', 'conquista',
    'colonización', 'descubrimiento', 'tratado', 'constitución'
  ],
  [Subject.SCIENCE]: [
    'ciencia', 'física', 'química', 'biología', 'átomo', 'molécula',
    'célula', 'organismo', 'ecosistema', 'evolución', 'genética',
    'experimento', 'laboratorio', 'hipótesis', 'teoría', 'ley',
    'energía', 'materia', 'gravedad', 'electricidad', 'magnetismo'
  ],
  [Subject.LANGUAGE]: [
    'gramática', 'sintaxis', 'ortografía', 'vocabulario', 'literatura',
    'poesía', 'novela', 'cuento', 'ensayo', 'verbo', 'sustantivo',
    'adjetivo', 'adverbio', 'pronombre', 'preposición', 'conjunción',
    'oración', 'párrafo', 'texto', 'redacción', 'comprensión'
  ],
  [Subject.GEOGRAPHY]: [
    'geografía', 'continente', 'país', 'capital', 'ciudad', 'río',
    'montaña', 'océano', 'mar', 'lago', 'desierto', 'selva',
    'clima', 'población', 'territorio', 'frontera', 'mapa',
    'coordenadas', 'latitud', 'longitud', 'hemisferio'
  ],
  [Subject.ARTS]: [
    'arte', 'pintura', 'escultura', 'dibujo', 'color', 'forma',
    'estilo', 'técnica', 'artista', 'museo', 'galería', 'exposición',
    'renacimiento', 'barroco', 'impresionismo', 'cubismo',
    'abstracto', 'realismo', 'surrealismo', 'modernismo'
  ],
  [Subject.SPORTS]: [
    'deporte', 'fútbol', 'baloncesto', 'tenis', 'natación', 'atletismo',
    'gimnasia', 'boxeo', 'ciclismo', 'voleibol', 'béisbol',
    'olimpiadas', 'competencia', 'entrenamiento', 'equipo',
    'jugador', 'entrenador', 'estadio', 'cancha', 'pelota'
  ],
  [Subject.MUSIC]: [
    'música', 'instrumento', 'piano', 'guitarra', 'violín', 'batería',
    'nota', 'acorde', 'melodía', 'ritmo', 'armonía', 'composición',
    'canción', 'sinfonía', 'ópera', 'concierto', 'músico',
    'compositor', 'director', 'orquesta', 'banda', 'coro'
  ]
};

export const detectSubject = (exercise: ExerciseResponse): Subject => {
  // Recopilar todo el texto del ejercicio
  const allText = [
    exercise.instructions || '',
    exercise.hint || '',
    exercise.word || '',
    exercise.explanation || '',
    ...(exercise.questions?.map(q => `${q.question} ${q.options?.join(' ') || ''} ${q.explanation || ''}`) || []),
    ...(exercise.cards?.map(c => `${c.front} ${c.back}`) || []),
    ...(exercise.elements?.map(e => e.texto || '') || []),
    ...(exercise.trueFalseQuestions?.map(q => `${q.statement} ${q.explanation || ''}`) || [])
  ].join(' ').toLowerCase();

  // Contar coincidencias para cada categoría
  const scores: Record<Subject, number> = {
    [Subject.PROGRAMMING]: 0,
    [Subject.MATHEMATICS]: 0,
    [Subject.HISTORY]: 0,
    [Subject.SCIENCE]: 0,
    [Subject.LANGUAGE]: 0,
    [Subject.GEOGRAPHY]: 0,
    [Subject.ARTS]: 0,
    [Subject.SPORTS]: 0,
    [Subject.MUSIC]: 0,
    [Subject.GENERAL]: 0
  };

  // Calcular puntuaciones
  Object.entries(SUBJECT_KEYWORDS).forEach(([subject, keywords]) => {
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = allText.match(regex);
      if (matches) {
        scores[subject as Subject] += matches.length;
      }
    });
  });

  // Encontrar la categoría con mayor puntuación
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return Subject.GENERAL;

  const detectedSubject = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as Subject;
  return detectedSubject || Subject.GENERAL;
};

export const getSubjectInfo = (subject: Subject) => {
  switch (subject) {
    case Subject.PROGRAMMING:
      return {
        name: 'Programación',
        icon: Code,
        color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      };
    case Subject.MATHEMATICS:
      return {
        name: 'Matemáticas',
        icon: Calculator,
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      };
    case Subject.HISTORY:
      return {
        name: 'Historia',
        icon: BookOpen,
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
      };
    case Subject.SCIENCE:
      return {
        name: 'Ciencias',
        icon: Microscope,
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      };
    case Subject.LANGUAGE:
      return {
        name: 'Lenguaje',
        icon: Languages,
        color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
      };
    case Subject.GEOGRAPHY:
      return {
        name: 'Geografía',
        icon: Globe,
        color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300'
      };
    case Subject.ARTS:
      return {
        name: 'Arte',
        icon: Palette,
        color: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300'
      };
    case Subject.SPORTS:
      return {
        name: 'Deportes',
        icon: Trophy,
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      };
    case Subject.MUSIC:
      return {
        name: 'Música',
        icon: Music,
        color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300'
      };
    case Subject.GENERAL:
    default:
      return {
        name: 'General',
        icon: Brain,
        color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      };
  }
};
