import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { startTest, submitAnswer, completeTest } from '../store/quizSlice';
import { getQuestionsForTest } from '../data/testAssignment';
import { QUESTIONS_PER_TEST, TIME_LIMIT_MINUTES } from '../types';

export default function Quiz() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const id = parseInt(testId ?? '1', 10);

  const test = useAppSelector(s => s.quiz.tests.find(t => t.testId === id));
  const questions = getQuestionsForTest(id);

  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT_MINUTES * 60);
  const [started, setStarted] = useState(false);

  const answers = test?.answers ?? [];

  const handleFinish = useCallback(() => {
    const correctAnswers = questions.map((q, i) => answers[i] === q.correctAnswer);
    dispatch(completeTest({ testId: id, correctAnswers }));
    navigate(`/results/${id}`);
  }, [questions, answers, dispatch, id, navigate]);

  // Timer
  useEffect(() => {
    if (!started || test?.status === 'completed') return;
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, test?.status, handleFinish]);

  // Start test on mount if not started
  useEffect(() => {
    if (test && test.status === 'not-started') {
      dispatch(startTest(id));
    }
    if (test && (test.status === 'in-progress' || test.status === 'not-started')) {
      setStarted(true);
    }
    if (test?.status === 'completed') {
      navigate(`/results/${id}`);
    }
  }, [test?.status, id, dispatch, navigate, test]);

  if (!test || !questions.length) {
    return <div className="page"><p>Test not found.</p></div>;
  }

  const q = questions[currentQ];
  const answered = answers[currentQ] ?? null;
  const progress = (answers.filter(a => a !== null).length / QUESTIONS_PER_TEST) * 100;

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timeWarning = timeLeft < 300;

  function handleAnswer(optionIdx: number) {
    if (answered !== null) return;
    setSelectedAnswer(optionIdx);
    dispatch(submitAnswer({ testId: id, questionIndex: currentQ, answer: optionIdx }));
    setShowFeedback(true);
  }

  function handleNext() {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentQ < QUESTIONS_PER_TEST - 1) {
      setCurrentQ(q => q + 1);
    } else {
      handleFinish();
    }
  }

  function handlePrev() {
    setShowFeedback(false);
    setSelectedAnswer(null);
    if (currentQ > 0) setCurrentQ(q => q - 1);
  }

  function jumpTo(idx: number) {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setCurrentQ(idx);
  }

  const currentAnswer = answers[currentQ] ?? selectedAnswer;
  const isCorrect = currentAnswer !== null && currentAnswer === q.correctAnswer;

  return (
    <div className="page quiz-page">
      {/* Header bar */}
      <div className="quiz-header">
        <div className="quiz-title">Test {id}</div>
        <div className={`quiz-timer ${timeWarning ? 'timer-warning' : ''}`}>
          ⏱ {mins}:{secs.toString().padStart(2, '0')}
        </div>
        <div className="quiz-qcount">{currentQ + 1} / {QUESTIONS_PER_TEST}</div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Question navigation dots */}
      <div className="q-dots">
        {questions.map((_, i) => {
          let cls = 'q-dot';
          if (i === currentQ) cls += ' q-dot-current';
          else if (answers[i] !== null) {
            cls += answers[i] === questions[i].correctAnswer ? ' q-dot-correct' : ' q-dot-wrong';
          }
          return <button key={i} className={cls} onClick={() => jumpTo(i)} title={`Question ${i + 1}`} />;
        })}
      </div>

      {/* Question card */}
      <div className="question-card">
        <div className="question-meta">
          <span className="question-category">{q.category}</span>
          <span className="question-num">Q{currentQ + 1}</span>
        </div>
        <h2 className="question-text">{q.question}</h2>

        <div className="options-list">
          {q.options.map((opt, i) => {
            let cls = 'option-btn';
            if (currentAnswer !== null) {
              if (i === q.correctAnswer) cls += ' option-correct';
              else if (i === currentAnswer && i !== q.correctAnswer) cls += ' option-wrong';
              else cls += ' option-disabled';
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => handleAnswer(i)}
                disabled={currentAnswer !== null}
              >
                <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                <span className="option-text">{opt}</span>
                {currentAnswer !== null && i === q.correctAnswer && <span className="option-icon">✓</span>}
                {currentAnswer !== null && i === currentAnswer && i !== q.correctAnswer && <span className="option-icon">✗</span>}
              </button>
            );
          })}
        </div>

        {showFeedback && currentAnswer !== null && (
          <div className={`feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
            <strong>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
            <p>{q.explanation}</p>
            {q.sourceText && (
              <div className="feedback-source">
                <span className="source-icon">📖</span>
                <span className="source-text">"{q.sourceText}"</span>
                {q.sourcePage && (
                  <span className="source-page">— Discover Canada, p.&nbsp;{q.sourcePage}</span>
                )}
              </div>
            )}
          </div>
        )}
        {/* When revisiting an already-answered question, show the source text even if feedback is not actively displayed */}
        {!showFeedback && currentAnswer !== null && q.sourceText && (
          <div className="feedback-source feedback-source-visited">
            <span className="source-icon">📖</span>
            <span className="source-text">"{q.sourceText}"</span>
            {q.sourcePage && (
              <span className="source-page">— Discover Canada, p.&nbsp;{q.sourcePage}</span>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="quiz-nav">
        <button className="btn btn-secondary" onClick={handlePrev} disabled={currentQ === 0}>
          ← Previous
        </button>
        <button className="btn btn-danger" onClick={handleFinish}>
          Submit Test
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          {currentQ === QUESTIONS_PER_TEST - 1 ? 'Finish →' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
