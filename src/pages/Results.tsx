import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { resetTest } from '../store/quizSlice';
import { getQuestionsForTest } from '../data/testAssignment';
import { PASS_SCORE, QUESTIONS_PER_TEST } from '../types';

export default function Results() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const id = parseInt(testId ?? '1', 10);

  const test = useAppSelector((s) => s.quiz.tests.find((t) => t.testId === id));
  const questions = getQuestionsForTest(id);

  if (!test || test.status !== 'completed') {
    return (
      <div className="page">
        <p>No results found for Test {id}.</p>
        <button className="btn btn-primary" onClick={() => navigate('/tests')}>
          Back to Tests
        </button>
      </div>
    );
  }

  const score = test.score ?? 0;
  const passed = test.passed ?? false;
  const pct = Math.round((score / QUESTIONS_PER_TEST) * 100);
  const answers = test.answers;

  function handleRetry() {
    dispatch(resetTest(id));
    navigate(`/test/${id}`);
  }

  return (
    <div className="page results-page">
      {/* Score card */}
      <div className={`score-card ${passed ? 'score-passed' : 'score-failed'}`}>
        <div className="score-icon">{passed ? '🎉' : '📚'}</div>
        <h1 className="score-result">{passed ? 'You Passed!' : 'Keep Studying'}</h1>
        <div className="score-numbers">
          <span className="score-big">{score}</span>
          <span className="score-denom">/ {QUESTIONS_PER_TEST}</span>
        </div>
        <div className="score-pct">{pct}%</div>
        <p className="score-message">
          {passed
            ? `Great job! You scored ${score}/20, above the required ${PASS_SCORE}/20 (75%).`
            : `You scored ${score}/20. You need at least ${PASS_SCORE}/20 (75%) to pass. Try again!`}
        </p>
        {test.completedAt && (
          <p className="score-date">Completed: {new Date(test.completedAt).toLocaleDateString()}</p>
        )}
      </div>

      {/* Actions */}
      <div className="results-actions">
        <button className="btn btn-primary" onClick={handleRetry}>
          ↺ Retake Test
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/tests')}>
          All Tests
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/flashcards')}>
          Study Flashcards
        </button>
      </div>

      {/* Answer review */}
      <div className="answer-review">
        <h2>Answer Review</h2>
        {questions.map((q, i) => {
          const userAnswer = answers[i] ?? -1;
          const correct = userAnswer === q.correctAnswer;
          return (
            <div
              key={q.id}
              className={`review-item ${correct ? 'review-correct' : 'review-wrong'}`}
            >
              <div className="review-header">
                <span className="review-num">Q{i + 1}</span>
                <span className="review-cat">{q.category}</span>
                <span className={`review-badge ${correct ? 'badge-correct' : 'badge-wrong'}`}>
                  {correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
              <p className="review-question">{q.question}</p>
              <div className="review-options">
                {q.options.map((opt, j) => {
                  let cls = 'review-option';
                  if (j === q.correctAnswer) cls += ' review-option-correct';
                  else if (j === userAnswer && !correct) cls += ' review-option-wrong';
                  return (
                    <div key={j} className={cls}>
                      <span className="option-letter">{String.fromCharCode(65 + j)}</span>
                      {opt}
                      {j === q.correctAnswer && <span className="review-tick"> ✓</span>}
                      {j === userAnswer && j !== q.correctAnswer && (
                        <span className="review-cross"> ✗</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {!correct && (
                <div className="review-explanation">
                  <strong>Explanation:</strong> {q.explanation}
                  {q.sourceText && (
                    <div className="feedback-source">
                      <span className="source-icon">📖</span>
                      <div className="source-text">"{q.sourceText}"</div>
                      {q.sourcePage && (
                        <span className="source-page">
                          — Discover Canada, p.&nbsp;{q.sourcePage}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
