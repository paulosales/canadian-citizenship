export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  sourcePage: number | null;
  sourceText: string | null;
}

export interface TestProgress {
  testId: number;
  status: 'not-started' | 'in-progress' | 'completed';
  score: number | null;
  passed: boolean | null;
  answers: (number | null)[];
  enabled: boolean;
  startedAt: string | null;
  completedAt: string | null;
}

export interface FlashcardProgress {
  questionId: number;
  known: boolean;
  reviewed: number;
}

export interface AppState {
  tests: TestProgress[];
  flashcards: FlashcardProgress[];
  lastUpdated: string;
}

export const PASS_SCORE = 15;
export const QUESTIONS_PER_TEST = 20;
export const TOTAL_TESTS = 60;
export const ENABLED_TESTS = 3;
export const TIME_LIMIT_MINUTES = 45;
