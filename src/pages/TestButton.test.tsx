import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestButton from './TestButton';
import quizReducer from '../store/quizSlice';
import { ENABLED_TESTS, QUESTIONS_PER_TEST } from '../consts';
import type { TestProgress } from '../types';

function createTest(overrides: Partial<TestProgress> = {}): TestProgress {
  return {
    testId: 1,
    status: 'not-started',
    score: null,
    passed: null,
    enabled: true,
    answers: Array(QUESTIONS_PER_TEST).fill(null),
    startedAt: null,
    completedAt: null,
    ...overrides,
  };
}

function renderWithStore(test: TestProgress, onClick = vi.fn()) {
  const store = configureStore({
    reducer: { quiz: quizReducer },
    preloadedState: {
      quiz: {
        tests: [test],
        enabledTestsCount: ENABLED_TESTS,
        flashcards: [],
        lastUpdated: new Date().toISOString(),
      },
    },
  });

  render(
    <Provider store={store}>
      <TestButton test={test} onClick={onClick} />
    </Provider>
  );

  return { store, onClick };
}

describe('TestButton', () => {
  it('renders status and triggers click callback for enabled tests', async () => {
    const user = userEvent.setup();
    const test = createTest({ status: 'not-started' });
    const { onClick } = renderWithStore(test);

    expect(screen.getByText('Not Started')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /test 1/i }));

    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ testId: 1 }));
  });

  it('resets completed test when clicking retry and does not trigger parent click', async () => {
    const user = userEvent.setup();
    const test = createTest({
      status: 'completed',
      score: 12,
      passed: false,
      answers: Array(QUESTIONS_PER_TEST).fill(1),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    const { store, onClick } = renderWithStore(test);

    await user.click(screen.getByTitle(/retake test/i));

    expect(onClick).not.toHaveBeenCalled();
    expect(store.getState().quiz.tests[0].status).toBe('not-started');
    expect(store.getState().quiz.tests[0].score).toBeNull();
  });
});
