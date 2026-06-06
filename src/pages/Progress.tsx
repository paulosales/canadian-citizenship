import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { resetAllProgress } from '../store/quizSlice';
import { TOTAL_TESTS, QUESTIONS_PER_TEST, PASS_SCORE } from '../types';

export default function Progress() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const tests = useAppSelector((s) => s.quiz.tests);
  const [showConfirm, setShowConfirm] = useState(false);

  const completed = tests.filter((t) => t.status === 'completed').length;
  const passed = tests.filter((t) => t.passed === true).length;
  const failed = completed - passed;
  const passRate = completed > 0 ? Math.round((passed / completed) * 100) : 0;
  const avgScore =
    completed > 0
      ? (
          tests
            .filter((t) => t.status === 'completed')
            .reduce((sum, t) => sum + (t.score ?? 0), 0) / completed
        ).toFixed(1)
      : 'N/A';

  return (
    <div className="page progress-page">
      <div className="page-header">
        <h1>Your Progress</h1>
        <p className="page-subtitle">Track your practice test performance</p>
      </div>

      {/* Summary stats */}
      <div className="progress-stats-grid">
        <div className="progress-stat-card">
          <div className="ps-num">
            {completed}
            <span className="ps-denom">/{TOTAL_TESTS}</span>
          </div>
          <div className="ps-label">Tests Completed</div>
        </div>
        <div className="progress-stat-card stat-passed">
          <div className="ps-num">{passed}</div>
          <div className="ps-label">Passed</div>
        </div>
        <div className="progress-stat-card stat-failed">
          <div className="ps-num">{failed}</div>
          <div className="ps-label">Failed</div>
        </div>
        <div className="progress-stat-card">
          <div className="ps-num">{passRate}%</div>
          <div className="ps-label">Pass Rate</div>
        </div>
        <div className="progress-stat-card">
          <div className="ps-num">{avgScore}</div>
          <div className="ps-label">Avg Score</div>
        </div>
        <div className="progress-stat-card">
          <div className="ps-num">
            {PASS_SCORE}/{QUESTIONS_PER_TEST}
          </div>
          <div className="ps-label">Passing Score</div>
        </div>
      </div>

      {/* Visual progress bar */}
      <div className="overall-progress">
        <div className="op-label">
          Overall Completion: {Math.round((completed / TOTAL_TESTS) * 100)}%
        </div>
        <div className="progress-bar-wrap progress-bar-lg">
          <div
            className="progress-bar-fill"
            style={{ width: `${(completed / TOTAL_TESTS) * 100}%` }}
          />
        </div>
      </div>

      {/* Test list */}
      <div className="progress-list-header">
        <h2>All Tests</h2>
        {showConfirm ? (
          <div className="confirm-inline">
            <span>Reset all progress?</span>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => {
                dispatch(resetAllProgress());
                setShowConfirm(false);
              }}
            >
              Yes, Reset
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowConfirm(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button className="btn btn-outline" onClick={() => setShowConfirm(true)}>
            Reset All Progress
          </button>
        )}
      </div>

      <div className="progress-test-list">
        {tests.map((test) => {
          const isCompleted = test.status === 'completed';
          const isPassed = test.passed === true;
          const scoreWidth =
            isCompleted && test.score !== null ? (test.score / QUESTIONS_PER_TEST) * 100 : 0;
          return (
            <div
              key={test.testId}
              className={`pt-row ${isCompleted ? (isPassed ? 'pt-passed' : 'pt-failed') : 'pt-not-started'}`}
            >
              <span className="pt-name">Test {test.testId}</span>
              {isCompleted ? (
                <>
                  <div className="pt-bar-wrap">
                    <div
                      className={`pt-bar-fill ${isPassed ? 'bar-passed' : 'bar-failed'}`}
                      style={{ width: `${scoreWidth}%` }}
                    />
                  </div>
                  <span className="pt-score">
                    {test.score}/{QUESTIONS_PER_TEST}
                  </span>
                  <span className={`pt-badge ${isPassed ? 'badge-passed' : 'badge-failed'}`}>
                    {isPassed ? 'Pass' : 'Fail'}
                  </span>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => navigate(`/results/${test.testId}`)}
                  >
                    Review
                  </button>
                </>
              ) : (
                <>
                  <div className="pt-bar-wrap">
                    <div className="pt-bar-fill bar-empty" style={{ width: '0%' }} />
                  </div>
                  <span className="pt-score">-</span>
                  <span className="pt-badge badge-not-started">
                    {test.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                  </span>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/test/${test.testId}`)}
                  >
                    Start
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
