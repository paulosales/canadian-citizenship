import questionsData from '../data/questions.json';
import type { Question } from '../types';

export const questions: Question[] = questionsData as Question[];

// Deterministically assign 20 questions per test across 60 tests
// We use a seeded rotation to ensure good distribution
export function getQuestionsForTest(testId: number): Question[] {
  const total = questions.length; // 220
  const perTest = 20;
  // Use a deterministic offset so tests overlap but vary
  const seed = (testId - 1) * 17; // prime step for good distribution
  const result: Question[] = [];
  const used = new Set<number>();

  // Primary pass: pick questions using the seed
  for (let i = 0; i < perTest; i++) {
    const idx = (seed + i * 11) % total;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(questions[idx]);
    }
  }

  // Fill any gaps (shouldn't happen with 220 questions and 20 per test)
  if (result.length < perTest) {
    for (let i = 0; i < total && result.length < perTest; i++) {
      const idx = (seed + i) % total;
      if (!used.has(idx)) {
        used.add(idx);
        result.push(questions[idx]);
      }
    }
  }

  return result;
}
