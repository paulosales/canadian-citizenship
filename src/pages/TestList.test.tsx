import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestList from './TestList';
import quizReducer from '../store/quizSlice';
import { ENABLED_TESTS, QUESTIONS_PER_TEST } from '../consts';
import type { TestProgress } from '../types';

function createTests(): TestProgress[] {
  return [
    {
      testId: 1,
      status: 'completed',
      score: 16,
      passed: true,
      enabled: true,
      answers: Array(QUESTIONS_PER_TEST).fill(0),
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
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
  ];
}

function renderTestList() {
  const store = configureStore({
    reducer: { quiz: quizReducer },
    preloadedState: {
      quiz: {
        tests: createTests(),
        enabledTestsCount: ENABLED_TESTS,
        flashcards: [],
        lastUpdated: new Date().toISOString(),
      },
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/tests']}>
        <Routes>
          <Route path="/tests" element={<TestList />} />
          <Route path="/test/:testId" element={<div>Quiz Page</div>} />
          <Route path="/results/:testId" element={<div>Results Page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe('TestList', () => {
  it('shows progress summary from test state', () => {
    renderTestList();

    expect(screen.getByText('1/2 completed')).toBeInTheDocument();
    expect(screen.getByText('1 passed')).toBeInTheDocument();
    expect(screen.getByText('0 failed')).toBeInTheDocument();
  });

  it('navigates completed tests to results and not-started tests to quiz', async () => {
    const user = userEvent.setup();
    renderTestList();

    const firstCard = screen.getByText('Test 1').closest('button');
    if (!firstCard) throw new Error('Expected Test 1 card button');

    await user.click(firstCard);
    expect(screen.getByText('Results Page')).toBeInTheDocument();

    renderTestList();
    const secondCard = screen.getByText('Test 2').closest('button');
    if (!secondCard) throw new Error('Expected Test 2 card button');

    await user.click(secondCard);
    expect(screen.getByText('Quiz Page')).toBeInTheDocument();
  });
});
