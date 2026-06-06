import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { TOTAL_TESTS } from '../types';
import type { TestProgress } from '../types';
import TestButton from './TestButton';

export default function TestList() {
  const navigate = useNavigate();
  const tests = useAppSelector((s) => s.quiz.tests);

  const total = tests.length;
  const completed = tests.filter((t) => t.status === 'completed').length;
  const passed = tests.filter((t) => t.passed === true).length;

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
          <span>
            {completed}/{total} completed
          </span>
          <span className="dot">·</span>
          <span className="text-green">{passed} passed</span>
          <span className="dot">·</span>
          <span className="text-red">{completed - passed} failed</span>
        </div>
      </div>

      <div className="test-grid">
        {tests.map((test) => {
          return <TestButton key={test.testId} test={test} onClick={handleTestClick} />;
        })}
      </div>
    </div>
  );
}
