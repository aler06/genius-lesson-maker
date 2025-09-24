import { Exercise, Session } from '@/types/session';

// Mock AI service to simulate exercise generation
export class MockAIService {
  private static questionTemplates = {
    'matemáticas': [
      'Resuelve la siguiente ecuación: {equation}',
      'Calcula el área de un triángulo con base {base} y altura {height}',
      'Si un producto cuesta ${price} y tiene un descuento del {discount}%, ¿cuál es el precio final?'
    ],
    'ciencias': [
      '¿Cuál es la función principal de {organ} en el cuerpo humano?',
      'Explica el proceso de {process} en la naturaleza',
      '¿Qué elemento químico tiene el símbolo {symbol}?'
    ],
    'historia': [
      '¿En qué año ocurrió {event}?',
      '¿Quién fue {person} y por qué es importante en la historia?',
      'Describe las causas principales de {historical_event}'
    ],
    'literatura': [
      '¿Quién escribió "{book}"?',
      'Identifica la figura retórica en: "{quote}"',
      'Describe las características del movimiento literario {movement}'
    ]
  };

  static async generateExercises(topic: string, count: number = 5): Promise<Exercise[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const exercises: Exercise[] = [];
    const topicKey = this.getTopicKey(topic.toLowerCase());
    
    for (let i = 0; i < count; i++) {
      exercises.push(this.createExercise(i + 1, topicKey, topic));
    }

    return exercises;
  }

  static async generateSpecificExercises(topic: string, type: Exercise['type'], count: number = 2): Promise<Exercise[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const exercises: Exercise[] = [];
    const topicKey = this.getTopicKey(topic.toLowerCase());
    
    for (let i = 0; i < count; i++) {
      exercises.push(this.createSpecificExercise(i + 1, topicKey, topic, type));
    }

    return exercises;
  }

  private static getTopicKey(topic: string): string {
    if (topic.includes('matemática') || topic.includes('álgebra') || topic.includes('geometría')) {
      return 'matemáticas';
    }
    if (topic.includes('ciencia') || topic.includes('biología') || topic.includes('química') || topic.includes('física')) {
      return 'ciencias';
    }
    if (topic.includes('historia') || topic.includes('histórico')) {
      return 'historia';
    }
    if (topic.includes('literatura') || topic.includes('lengua') || topic.includes('poesía')) {
      return 'literatura';
    }
    return 'matemáticas'; // default
  }

  private static createExercise(index: number, topicKey: string, originalTopic: string): Exercise {
    const types: Exercise['type'][] = ['multiple-choice', 'true-false', 'short-answer'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return this.createSpecificExercise(index, topicKey, originalTopic, type);
  }

  private static createSpecificExercise(index: number, topicKey: string, originalTopic: string, type: Exercise['type']): Exercise {
    const baseQuestion = this.generateQuestionForTopic(topicKey, originalTopic);
    
    switch (type) {
      case 'multiple-choice':
      case 'quiz':
        return {
          id: `ex-${Date.now()}-${index}`,
          type,
          question: baseQuestion,
          options: this.generateOptions(topicKey),
          correctAnswer: 'A',
          explanation: 'Esta es la respuesta correcta según los conceptos fundamentales del tema.',
          points: type === 'quiz' ? 10 : 10
        };
      
      case 'true-false':
        return {
          id: `ex-${Date.now()}-${index}`,
          type,
          question: `Verdadero o Falso: ${baseQuestion}`,
          correctAnswer: Math.random() > 0.5 ? 'Verdadero' : 'Falso',
          explanation: 'Revisa los conceptos básicos para entender esta respuesta.',
          points: 5
        };

      case 'hangman':
        const hangmanWords = this.getHangmanWords(topicKey);
        const selectedWord = hangmanWords[Math.floor(Math.random() * hangmanWords.length)];
        return {
          id: `ex-${Date.now()}-${index}`,
          type,
          question: `Adivina la palabra relacionada con ${originalTopic}`,
          hangmanWord: selectedWord,
          correctAnswer: selectedWord,
          explanation: `La palabra "${selectedWord}" es un concepto clave en ${originalTopic}.`,
          points: 15
        };

      case 'flip-cards':
        return {
          id: `ex-${Date.now()}-${index}`,
          type,
          question: baseQuestion,
          flipCardBack: this.generateFlipCardAnswer(topicKey, originalTopic),
          correctAnswer: this.generateFlipCardAnswer(topicKey, originalTopic),
          explanation: 'Memoriza la relación entre pregunta y respuesta.',
          points: 8
        };

      case 'fill-blank':
        const fillBlankSentence = this.generateFillBlankSentence(topicKey, originalTopic);
        return {
          id: `ex-${Date.now()}-${index}`,
          type,
          question: fillBlankSentence.question,
          correctAnswer: fillBlankSentence.answer,
          explanation: 'Completa el espacio con el término correcto.',
          points: 12
        };
      
      default:
        return {
          id: `ex-${Date.now()}-${index}`,
          type: 'short-answer',
          question: baseQuestion,
          correctAnswer: 'Respuesta modelo basada en el tema.',
          explanation: 'Criterios de evaluación incluyen precisión y claridad conceptual.',
          points: 15
        };
    }
  }

  private static generateQuestionForTopic(topicKey: string, originalTopic: string): string {
    const templates = this.questionTemplates[topicKey as keyof typeof this.questionTemplates] || this.questionTemplates.matemáticas;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Replace placeholders with topic-specific content
    return template
      .replace('{equation}', '2x + 5 = 13')
      .replace('{base}', '8 cm')
      .replace('{height}', '6 cm')
      .replace('{price}', '150')
      .replace('{discount}', '20')
      .replace('{organ}', 'corazón')
      .replace('{process}', 'fotosíntesis')
      .replace('{symbol}', 'H')
      .replace('{event}', 'la Revolución Francesa')
      .replace('{person}', 'Miguel de Cervantes')
      .replace('{historical_event}', 'la Primera Guerra Mundial')
      .replace('{book}', 'Don Quijote de la Mancha')
      .replace('{quote}', 'Sus ojos eran dos luceros brillantes')
      .replace('{movement}', 'Barroco')
      || `Explica los conceptos fundamentales de ${originalTopic}`;
  }

  private static generateOptions(topicKey: string): string[] {
    const optionSets = {
      matemáticas: ['x = 4', 'x = 6', 'x = 8', 'x = 10'],
      ciencias: ['Bombear sangre', 'Digerir alimentos', 'Producir hormonas', 'Filtrar toxinas'],
      historia: ['1789', '1776', '1804', '1815'],
      literatura: ['Miguel de Cervantes', 'Federico García Lorca', 'Pablo Neruda', 'Gabriel García Márquez']
    };

    return optionSets[topicKey as keyof typeof optionSets] || optionSets.matemáticas;
  }

  private static getHangmanWords(topicKey: string): string[] {
    const wordSets = {
      matemáticas: ['ECUACION', 'ALGEBRA', 'GEOMETRIA', 'CALCULO', 'FRACCION'],
      ciencias: ['CELULA', 'MOLECULA', 'FOTOSINTESIS', 'EVOLUCION', 'GRAVEDAD'],
      historia: ['REVOLUCION', 'IMPERIO', 'DINASTIA', 'CONQUISTA', 'CIVILIZACION'],
      literatura: ['METAFORA', 'SONETO', 'NARRATIVA', 'PROSA', 'VERSO']
    };

    return wordSets[topicKey as keyof typeof wordSets] || wordSets.matemáticas;
  }

  private static generateFlipCardAnswer(topicKey: string, originalTopic: string): string {
    const answers = {
      matemáticas: 'Operación matemática fundamental',
      ciencias: 'Proceso biológico esencial',
      historia: 'Evento histórico significativo',
      literatura: 'Recurso literario importante'
    };

    return answers[topicKey as keyof typeof answers] || `Concepto clave de ${originalTopic}`;
  }

  private static generateFillBlankSentence(topicKey: string, originalTopic: string): { question: string; answer: string } {
    const sentences = {
      matemáticas: {
        question: 'Una ______ es una igualdad que contiene una o más incógnitas.',
        answer: 'ecuación'
      },
      ciencias: {
        question: 'La ______ es el proceso por el cual las plantas producen su alimento.',
        answer: 'fotosíntesis'
      },
      historia: {
        question: 'La ______ Francesa comenzó en el año 1789.',
        answer: 'Revolución'
      },
      literatura: {
        question: 'Una ______ es una comparación poética entre dos elementos.',
        answer: 'metáfora'
      }
    };

    return sentences[topicKey as keyof typeof sentences] || {
      question: `Un concepto importante en ${originalTopic} es ______.`,
      answer: 'fundamental'
    };
  }
}