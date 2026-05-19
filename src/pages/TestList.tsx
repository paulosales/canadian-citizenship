import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { resetTest } from '../store/quizSlice';
import { TOTAL_TESTS } from '../types';
import type { TestProgress } from '../types';

function statusLabel(t: TestProgress) {
  if (t.status === 'not-started') return { text: 'Not Started', cls: 'status-not-started' };
  if (t.status === 'in-progress') return { text: 'In Progress', cls: 'status-in-progress' };
  if (t.passed === true) return { text: `Passed ${t.score}/20`, cls: 'status-passed' };
  return { text: `Failed ${t.score}/20`, cls: 'status-failed' };
}

export default function TestList() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tests = useAppSelector(s => s.quiz.tests);

  const total = tests.length;
  const completed = tests.filter(t => t.status === 'completed').length;
  const passed = tests.filter(t => t.passed === true).length;

  function handleTestClick(test: TestProgress) {
    if (test.status === 'completed') {
      navigate(`/results/${test.testId}`);
    } else {
      navigate(`/test/${test.testId}`);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Practice Tests</h1>
        <p className="page-subtitle">
          {TOTAL_TESTS} practice tests · 20 questions each · Pass: 15/20 (75%)
        </p>
        <div className="progress-summary">
          <span>{completed}/{total} completed</span>
          <span className="dot">·</span>
          <span className="text-green">{passed} passed</span>
          <span className="dot">·</span>
          <span className="text-red">{completed - passed} failed</span>
        </div>
      </div>

      <div className="test-grid">
        {tests.map(test => {
          const { text, cls } = statusLabel(test);
          return (
            <button
              key={test.testId}
              className={`test-card ${cls}`}
              onClick={() => handleTestClick(test)}
            >
              <div className="test-number">Test {test.testId}</div>
              <div className={`test-status ${cls}`}>{text}</div>
              {test.status === 'completed' && (
                <button
                  className="retry-btn"
                  onClick={e => {
                    e.stopPropagation();
                    dispatch(resetTest(test.testId));
                  }}
                  title="Retake test"
                >
                  ↺ Retry
                </button>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
