import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Quiz from './Quiz';
import quizReducer from '../store/quizSlice';
import { getQuestionsForTest } from '../data/testAssignment';
import { ENABLED_TESTS, QUESTIONS_PER_TEST } from '../consts';

function renderQuiz() {
  const store = configureStore({
    reducer: { quiz: quizReducer },
    preloadedState: {
      quiz: {
        tests: [
          {
            testId: 1,
            status: 'not-started' as const,
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
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/test/1']}>
        <Routes>
          <Route path="/test/:testId" element={<Quiz />} />
          <Route path="/results/:testId" element={<div>Results Route</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  return store;
}

describe('Quiz page', () => {
  it('starts test, submits answer, and completes test', async () => {
    const user = userEvent.setup();
    const store = renderQuiz();
    const question = getQuestionsForTest(1)[0];

    await waitFor(() => {
      expect(store.getState().quiz.tests[0].status).toBe('in-progress');
    });

    await user.click(screen.getByRole('button', { name: new RegExp(question.options[0], 'i') }));

    expect(store.getState().quiz.tests[0].answers[0]).toBe(0);
    expect(screen.getByText(/correct|incorrect/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /submit test/i }));

    await waitFor(() => {
      expect(screen.getByText('Results Route')).toBeInTheDocument();
    });

    expect(store.getState().quiz.tests[0].status).toBe('completed');
    expect(store.getState().quiz.tests[0].score).not.toBeNull();
  });
});
