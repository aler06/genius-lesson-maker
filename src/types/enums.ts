export enum Game {
  QUIZ = 'quiz',
  HANGMAN = 'hangman',
  FILL_IN_THE_BLANK = 'fill_in_the_blank',
  FLIP_CARDS = 'flip_cards'
}

export enum Role {
  STUDENT = 'student',
  PROFESSOR = 'professor',
  ADMIN = 'admin'
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';