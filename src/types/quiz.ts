export type Language = 'fr' | 'en' | 'ar' | 'de';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'expert';
export type ToneStyle = 'formal' | 'conversational' | 'humorous';
export type QuizType = 'quiz' | 'vrai-faux' | 'puzzle' | 'curseur' | 'reponse-libre';

export interface QuizMetadata {
  id: string;
  title: string;
  type: QuizType;
  language: Language;
  createdAt: Date;
  updatedAt: Date;
  questionCount: number;
  status: 'draft' | 'published';
}

export interface QuizFormData {
  language: Language;
  proficiencyLevel: ProficiencyLevel;
  slideCount: number;
  toneStyle: ToneStyle;
  topic: string;
  sourceUrl?: string;
  type: QuizType;
}

export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
  min?: number;
  max?: number;
  correctValue?: number;
  order?: number;
}

export interface Question {
  id: string;
  type: QuizType;
  text: string;
  imageUrls?: string[];
  explanation?: string;
  choices: Choice[];
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  language: Language;
  type: QuizType;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published';
  questions: Question[];
  timeLimit?: number;
  points?: number;
}

// AI Response Types
export interface AIQuizResponse {
  status: string;
  data: {
    quiz_id: string;
    questions: AIQuestion[];
    metadata: {
      type: string;
      generated_at: string;
      source: string;
      language: string;
    };
  };
  error: null | string;
}

export interface AIQuestion {
  question_text: string;
  image_url: string[];
  answer: {
    type: string;
    correct_answer: number | number[] | string[];
    options: string[] | null;
  };
  explanation: string;
}