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
    
    const baseQuestion = this.generateQuestionForTopic(topicKey, originalTopic);
    
    switch (type) {
      case 'multiple-choice':
        return {
          id: `ex-${Date.now()}-${index}`,
          type,
          question: baseQuestion,
          options: this.generateOptions(topicKey),
          correctAnswer: 'A',
          explanation: 'Esta es la respuesta correcta según los conceptos fundamentales del tema.',
          points: 10
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
}