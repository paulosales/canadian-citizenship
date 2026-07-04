import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Progress from './Progress';
import quizReducer from '../store/quizSlice';
import { ENABLED_TESTS, QUESTIONS_PER_TEST } from '../consts';
import type { TestProgress } from '../types';

function createTests(): TestProgress[] {
  return [
    {
      testId: 1,
      status: 'completed',
      score: 18,
      passed: true,
      enabled: true,
      answers: Array(QUESTIONS_PER_TEST).fill(0),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
    {
      testId: 2,
      status: 'in-progress',
      score: null,
      passed: null,
      enabled: true,
      answers: Array(QUESTIONS_PER_TEST).fill(null),
      startedAt: new Date().toISOString(),
      completedAt: null,
    },
  ];
}

function renderProgress() {
  const store = configureStore({
    reducer: { quiz: quizReducer },
    preloadedState: {
      quiz: {
        tests: createTests(),
        enabledTestsCount: ENABLED_TESTS,
        flashcards: [{ questionId: 1, known: true, reviewed: 1 }],
        lastUpdated: new Date().toISOString(),
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/progress']}>
        <Routes>
          <Route path="/progress" element={<Progress />} />
          <Route path="/results/:testId" element={<div>Results Detail Page</div>} />
          <Route path="/test/:testId" element={<div>Start Test Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  return store;
}

describe('Progress page', () => {
  it('renders computed stats and supports navigation actions', async () => {
    const user = userEvent.setup();
    renderProgress();

    expect(screen.getByText('Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Tests Completed')).toBeInTheDocument();
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('Pass Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg Score')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByText('Results Detail Page')).toBeInTheDocument();
  });

  it('resets all progress after confirmation', async () => {
    const user = userEvent.setup();
    const store = renderProgress();

    await user.click(screen.getByRole('button', { name: /reset all progress/i }));

    const confirm = screen.getByText('Reset all progress?').closest('div');
    if (!confirm) throw new Error('Expected reset confirmation container');

    await user.click(within(confirm).getByRole('button', { name: /yes, reset/i }));

    expect(store.getState().quiz.flashcards).toEqual([]);
    expect(store.getState().quiz.tests[0].status).toBe('not-started');
    expect(store.getState().quiz.tests[1].status).toBe('not-started');
  });
});
