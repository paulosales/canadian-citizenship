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
