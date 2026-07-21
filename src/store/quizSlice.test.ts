import reducer, {
  startTest,
  submitAnswer,
  completeTest,
  markFlashcard,
  resetAllProgress,
} from './quizSlice';
import type { QuizState } from '../types';
import { ENABLED_TESTS, PASS_SCORE, QUESTIONS_PER_TEST } from '../consts';

function createState(): QuizState {
  return {
    tests: [
      {
        testId: 1,
        status: 'not-started',
        score: null,
        passed: null,
        enabled: true,
        answers: Array(QUESTIONS_PER_TEST).fill(null),
        startedAt: null,
        completedAt: null,
      },
      {
        testId: 2,
        status: 'not-started',
        score: null,
        passed: null,
        enabled: true,
        answers: Array(QUESTIONS_PER_TEST).fill(null),
        startedAt: null,
        completedAt: null,
      },
    ],
    enabledTestsCount: ENABLED_TESTS,
    flashcards: [],
    lastUpdated: new Date().toISOString(),
  };
}

describe('quizSlice reducer', () => {
  it('starts test and records answers while in progress', () => {
    const state = createState();

    const started = reducer(state, startTest(1));
    expect(started.tests[0].status).toBe('in-progress');
    expect(started.tests[0].answers).toHaveLength(QUESTIONS_PER_TEST);

    const answered = reducer(
      started,
      submitAnswer({
        testId: 1,
        questionIndex: 0,
        answer: 2,
      })
    );

    expect(answered.tests[0].answers[0]).toBe(2);
  });

  it('completes a test, updates pass/fail, and tracks flashcards', () => {
    const state = createState();
    const inProgress = reducer(state, startTest(1));

    const correctAnswers = Array.from(
      { length: QUESTIONS_PER_TEST },
      (_, index) => index < PASS_SCORE
    );
    const completed = reducer(inProgress, completeTest({ testId: 1, correctAnswers }));

    expect(completed.tests[0].status).toBe('completed');
    expect(completed.tests[0].score).toBe(PASS_SCORE);
    expect(completed.tests[0].passed).toBe(true);

    const markedOnce = reducer(completed, markFlashcard({ questionId: 10, known: true }));
    expect(markedOnce.flashcards).toEqual([{ questionId: 10, known: true, reviewed: 1 }]);

    const markedAgain = reducer(markedOnce, markFlashcard({ questionId: 10, known: false }));
    expect(markedAgain.flashcards).toEqual([{ questionId: 10, known: false, reviewed: 2 }]);
  });

  it('resets all progress to initial defaults', () => {
    const state = createState();
    const inProgress = reducer(state, startTest(1));
    const changed = reducer(inProgress, markFlashcard({ questionId: 1, known: true }));

    const reset = reducer(changed, resetAllProgress());

    expect(reset.enabledTestsCount).toBe(ENABLED_TESTS);
    expect(reset.flashcards).toEqual([]);
    expect(reset.tests[0].status).toBe('not-started');
    expect(reset.tests[0].score).toBeNull();
    expect(reset.tests[0].answers).toHaveLength(QUESTIONS_PER_TEST);
  });
});
