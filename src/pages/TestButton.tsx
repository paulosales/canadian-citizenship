import { useAppDispatch } from '../store/hooks';
import { resetTest } from '../store/quizSlice';
import type { TestProgress } from '../types';

function statusLabel(t: TestProgress) {
  if (!t.enabled) return { text: 'Not ready', cls: 'status-not-started' };
  if (t.status === 'not-started') return { text: 'Not Started', cls: 'status-not-started' };
  if (t.status === 'in-progress') return { text: 'In Progress', cls: 'status-in-progress' };
  if (t.passed === true) return { text: `Passed ${t.score}/20`, cls: 'status-passed' };
  return { text: `Failed ${t.score}/20`, cls: 'status-failed' };
}

type TestButtonProps = {
  test: TestProgress;
  onClick: (test: TestProgress) => void;
};

export default function TestButton({ test, onClick }: TestButtonProps) {
  const dispatch = useAppDispatch();

  const { text, cls } = statusLabel(test);
  return (
    <button
      key={test.testId}
      className={`test-card ${cls}`}
      onClick={() => onClick(test)}
      disabled={!test.enabled}
    >
      <div className="test-number">Test {test.testId}</div>
      <div className={`test-status ${cls}`}>{text}</div>
      {test.status === 'completed' && (
        <button
          className="retry-btn"
          onClick={(e) => {
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
}
