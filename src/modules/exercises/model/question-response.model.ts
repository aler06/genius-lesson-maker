export interface QuestionResponseModel {
    question?: string;
    sentence?: string;
    options?: string[];
    correct_answer: string;
    explanation: string;
  }