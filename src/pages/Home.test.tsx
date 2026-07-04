import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from './Home';
import quizReducer from '../store/quizSlice';
import { ENABLED_TESTS, QUESTIONS_PER_TEST, TOTAL_TESTS } from '../consts';
import type { TestProgress } from '../types';

function createTests(completedCount = 0, passedCount = 0): TestProgress[] {
  const tests: TestProgress[] = Array.from({ length: TOTAL_TESTS }, (_, index) => ({
    testId: index + 1,
    status: 'not-started' as const,
    score: null,
    passed: null,
    enabled: index < ENABLED_TESTS,
    answers: Array(QUESTIONS_PER_TEST).fill(null),
    startedAt: null,
    completedAt: null,
  }));

  for (let i = 0; i < completedCount; i += 1) {
    tests[i] = {
      ...tests[i],
      status: 'completed',
      score: i < passedCount ? 18 : 10,
      passed: i < passedCount,
      completedAt: new Date().toISOString(),
    };
  }

  return tests;
}

function renderHome(completedCount = 0, passedCount = 0) {
  const store = configureStore({
    reducer: { quiz: quizReducer },
    preloadedState: {
      quiz: {
        tests: createTests(completedCount, passedCount),
        enabledTestsCount: ENABLED_TESTS,
        flashcards: [],
        lastUpdated: new Date().toISOString(),
      },
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={<div>Tests Page</div>} />
          <Route path="/flashcards" element={<div>Flashcards Page</div>} />
          <Route path="/progress" element={<div>Progress Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('Home page', () => {
  it('navigates to practice tests from primary CTA', async () => {
    const user = userEvent.setup();
    renderHome();

    await user.click(screen.getByRole('button', { name: /start practice tests/i }));

    expect(screen.getByText('Tests Page')).toBeInTheDocument();
  });

  it('shows stats when there are completed tests and opens progress page', async () => {
    const user = userEvent.setup();
    renderHome(2, 1);

    expect(screen.getByText('Tests Completed')).toBeInTheDocument();
    expect(screen.getByText('Tests Passed')).toBeInTheDocument();
    expect(screen.getByText('Pass Rate')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /view full progress/i }));

    expect(screen.getByText('Progress Page')).toBeInTheDocument();
  });
});
