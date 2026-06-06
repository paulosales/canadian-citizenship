import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export default function Home() {
  const navigate = useNavigate();
  const tests = useAppSelector((s) => s.quiz.tests);
  const completed = tests.filter((t) => t.status === 'completed').length;
  const passed = tests.filter((t) => t.passed === true).length;

  return (
    <div className="page home-page">
      <div className="hero">
        <div className="hero-flag">
          <div className="flag-red" />
          <div className="flag-white">
            <span className="flag-maple">🍁</span>
          </div>
          <div className="flag-red" />
        </div>
        <h1 className="hero-title">Canadian Citizenship Test</h1>
        <p className="hero-subtitle">
          Prepare for your Canadian citizenship test with 60 practice tests and flashcard study
          mode. Based on <em>Discover Canada: The Rights and Responsibilities of Citizenship</em>.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/tests')}>
            Start Practice Tests
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/flashcards')}>
            Study Flashcards
          </button>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <div className="info-icon">📋</div>
          <h3>60 Practice Tests</h3>
          <p>20 questions per test, covering all topics from Discover Canada</p>
        </div>
        <div className="info-card">
          <div className="info-icon">✅</div>
          <h3>Official Pass Criteria</h3>
          <p>Must score 15/20 (75%) to pass, same as the official citizenship test</p>
        </div>
        <div className="info-card">
          <div className="info-icon">🃏</div>
          <h3>Flashcard Mode</h3>
          <p>Study all 220 questions with interactive flashcards</p>
        </div>
        <div className="info-card">
          <div className="info-icon">📊</div>
          <h3>Track Progress</h3>
          <p>Your progress is saved automatically in your browser</p>
        </div>
      </div>

      {completed > 0 && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-num">{completed}</span>
            <span className="stat-label">Tests Completed</span>
          </div>
          <div className="stat">
            <span className="stat-num">{passed}</span>
            <span className="stat-label">Tests Passed</span>
          </div>
          <div className="stat">
            <span className="stat-num">
              {completed > 0 ? Math.round((passed / completed) * 100) : 0}%
            </span>
            <span className="stat-label">Pass Rate</span>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/progress')}>
            View Full Progress
          </button>
        </div>
      )}

      <div className="topics-section">
        <h2>Topics Covered</h2>
        <div className="topics-grid">
          {[
            'Canadian History',
            'Government & Democracy',
            'Rights & Freedoms',
            'Elections',
            'Justice System',
            'Canadian Symbols',
            'Regions of Canada',
            'Economy',
            'Modern Canada',
            'Who We Are',
            'Citizenship',
          ].map((topic) => (
            <span key={topic} className="topic-tag">
              {topic}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
