import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { TestProgress, AppState } from '../types';
import { TOTAL_TESTS, QUESTIONS_PER_TEST } from '../types';

const STORAGE_KEY = 'citizenship_quiz_progress';

function createInitialTests(): TestProgress[] {
  return Array.from({ length: TOTAL_TESTS }, (_, i) => ({
    testId: i + 1,
    status: 'not-started' as const,
    score: null,
    passed: null,
    answers: Array(QUESTIONS_PER_TEST).fill(null),
    startedAt: null,
    completedAt: null,
  }));
}

function loadFromStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch {
    return null;
  }
}

function saveToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

const saved = loadFromStorage();

const initialState: AppState = saved || {
  tests: createInitialTests(),
  flashcards: [],
  lastUpdated: new Date().toISOString(),
};

// Keep saved data aligned with the configured test count.
if (initialState.tests.length > TOTAL_TESTS) {
  initialState.tests = initialState.tests.slice(0, TOTAL_TESTS);
}

// Ensure we always have all tests even if saved data has fewer.
if (initialState.tests.length < TOTAL_TESTS) {
  const extra = createInitialTests().slice(initialState.tests.length);
  initialState.tests = [...initialState.tests, ...extra];
}

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    startTest(state, action: PayloadAction<number>) {
      const test = state.tests.find(t => t.testId === action.payload);
      if (test && test.status === 'not-started') {
        test.status = 'in-progress';
        test.startedAt = new Date().toISOString();
        test.answers = Array(QUESTIONS_PER_TEST).fill(null);
      } else if (test && test.status === 'completed') {
        // Allow retaking
        test.status = 'in-progress';
        test.startedAt = new Date().toISOString();
        test.answers = Array(QUESTIONS_PER_TEST).fill(null);
        test.score = null;
        test.passed = null;
        test.completedAt = null;
      }
      state.lastUpdated = new Date().toISOString();
      saveToStorage(state);
    },
    submitAnswer(state, action: PayloadAction<{ testId: number; questionIndex: number; answer: number }>) {
      const { testId, questionIndex, answer } = action.payload;
      const test = state.tests.find(t => t.testId === testId);
      if (test && test.status === 'in-progress') {
        test.answers[questionIndex] = answer;
      }
      state.lastUpdated = new Date().toISOString();
      saveToStorage(state);
    },
    completeTest(state, action: PayloadAction<{ testId: number; correctAnswers: boolean[] }>) {
      const { testId, correctAnswers } = action.payload;
      const test = state.tests.find(t => t.testId === testId);
      if (test) {
        const score = correctAnswers.filter(Boolean).length;
        test.status = 'completed';
        test.score = score;
        test.passed = score >= 15; // PASS_SCORE
        test.completedAt = new Date().toISOString();
      }
      state.lastUpdated = new Date().toISOString();
      saveToStorage(state);
    },
    resetTest(state, action: PayloadAction<number>) {
      const test = state.tests.find(t => t.testId === action.payload);
      if (test) {
        test.status = 'not-started';
        test.score = null;
        test.passed = null;
        test.answers = Array(QUESTIONS_PER_TEST).fill(null);
        test.startedAt = null;
        test.completedAt = null;
      }
      state.lastUpdated = new Date().toISOString();
      saveToStorage(state);
    },
    resetAllProgress(state) {
      state.tests = createInitialTests();
      state.flashcards = [];
      state.lastUpdated = new Date().toISOString();
      saveToStorage(state);
    },
    markFlashcard(state, action: PayloadAction<{ questionId: number; known: boolean }>) {
      const { questionId, known } = action.payload;
      const existing = state.flashcards.find(f => f.questionId === questionId);
      if (existing) {
        existing.known = known;
        existing.reviewed += 1;
      } else {
        state.flashcards.push({ questionId, known, reviewed: 1 });
      }
      state.lastUpdated = new Date().toISOString();
      saveToStorage(state);
    },
    resetFlashcards(state) {
      state.flashcards = [];
      state.lastUpdated = new Date().toISOString();
      saveToStorage(state);
    },
  },
});

export const {
  startTest,
  submitAnswer,
  completeTest,
  resetTest,
  resetAllProgress,
  markFlashcard,
  resetFlashcards,
} = quizSlice.actions;

export default quizSlice.reducer;
