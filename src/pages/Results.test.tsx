import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Results from './Results';
import quizReducer from '../store/quizSlice';
import { getQuestionsForTest } from '../data/testAssignment';
import { ENABLED_TESTS, QUESTIONS_PER_TEST } from '../consts';

function renderResults(status: 'completed' | 'not-started' = 'completed') {
  const questions = getQuestionsForTest(1);
  const answers = questions.map((question) => question.correctAnswer);

  const store = configureStore({
    reducer: { quiz: quizReducer },
    preloadedState: {
      quiz: {
        tests: [
          {
            testId: 1,
            status,
            score: status === 'completed' ? QUESTIONS_PER_TEST : null,
            passed: status === 'completed' ? true : null,
            enabled: true,
            answers: status === 'completed' ? answers : Array(QUESTIONS_PER_TEST).fill(null),
            startedAt: new Date().toISOString(),
            completedAt: status === 'completed' ? new Date().toISOString() : null,
          },
        ],
        enabledTestsCount: ENABLED_TESTS,
        flashcards: [],
        lastUpdated: new Date().toISOString(),
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/results/1']}>
        <Routes>
          <Route path="/results/:testId" element={<Results />} />
          <Route path="/test/:testId" element={<div>Retake Route</div>} />
          <Route path="/tests" element={<div>Tests Route</div>} />
          <Route path="/flashcards" element={<div>Flashcards Route</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  return store;
}

describe('Results page', () => {
  it('shows completed result details and allows retaking a test', async () => {
    const user = userEvent.setup();
    const store = renderResults('completed');

    expect(screen.getByText('You Passed!')).toBeInTheDocument();
    expect(screen.getByText('Answer Review')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /retake test/i }));

    await waitFor(() => {
      expect(screen.getByText('Retake Route')).toBeInTheDocument();
    });

    expect(store.getState().quiz.tests[0].status).toBe('not-started');
  });

  it('renders fallback when no completed result exists', async () => {
    const user = userEvent.setup();
    renderResults('not-started');

    expect(screen.getByText(/no results found for test 1/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back to tests/i }));

    expect(screen.getByText('Tests Route')).toBeInTheDocument();
  });
});
