export interface QuestionUpdateModel {
    question?: string;
    sentence?: string;
    options?: string[];
    correct_answer: string;
    explanation: string;
  }
  
  export interface CardUpdateModel {
    front: string;
    back: string;
  }

  export interface DragDropElementUpdateModel {
    id: number;
    texto: string;
  }
  
  export interface ExerciseUpdateRequestModel {
    exerciseId: string;
    userId: string;
    questions?: QuestionUpdateModel[];
    word?: string;
    hint?: string;
    topic?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    targetAudience?: string;
    cards?: CardUpdateModel[];
    instructions?: string;
    elements?: DragDropElementUpdateModel[];
    correctOrder?: number[];
    explanation?: string;
  }