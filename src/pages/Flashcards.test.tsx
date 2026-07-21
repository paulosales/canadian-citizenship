import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Flashcards from './Flashcards';
import quizReducer from '../store/quizSlice';
import { ENABLED_TESTS, QUESTIONS_PER_TEST } from '../consts';

function renderFlashcards(
  flashcards = [] as { questionId: number; known: boolean; reviewed: number }[]
) {
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
          {
            testId: 2,
            status: 'not-started' as const,
            score: null,
            passed: null,
            enabled: false,
            answers: Array(QUESTIONS_PER_TEST).fill(null),
            startedAt: null,
            completedAt: null,
          },
        ],
        enabledTestsCount: ENABLED_TESTS,
        flashcards,
        lastUpdated: new Date().toISOString(),
      },
    },
  });

  const view = render(
    <Provider store={store}>
      <MemoryRouter>
        <Flashcards />
      </MemoryRouter>
    </Provider>
  );

  return { store, view };
}

describe('Flashcards page', () => {
  it('marks a card as known and updates flashcard progress', async () => {
    const user = userEvent.setup();
    const { store, view } = renderFlashcards();

    const card = view.container.querySelector('.flashcard');
    if (!card) throw new Error('Expected flashcard element');

    await user.click(card);
    await user.click(screen.getByRole('button', { name: /i know this/i }));

    await waitFor(() => {
      expect(store.getState().quiz.flashcards.length).toBe(1);
    });

    expect(store.getState().quiz.flashcards[0].known).toBe(true);
  });

  it('resets flashcard progress from confirmation dialog', async () => {
    const user = userEvent.setup();
    const { store } = renderFlashcards([{ questionId: 1, known: true, reviewed: 2 }]);

    await user.click(screen.getByRole('button', { name: 'Reset' }));
    await user.click(screen.getByRole('button', { name: /yes, reset/i }));

    expect(store.getState().quiz.flashcards).toEqual([]);
  });
});
