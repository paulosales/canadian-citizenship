import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { markFlashcard, resetFlashcards } from '../store/quizSlice';
import { questions } from '../data/testAssignment';

type FilterMode = 'all' | 'unknown' | 'known';

export default function Flashcards() {
  const dispatch = useAppDispatch();
  const flashcards = useAppSelector(s => s.quiz.flashcards);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const knownIds = new Set(flashcards.filter(f => f.known).map(f => f.questionId));
  const unknownIds = new Set(flashcards.filter(f => !f.known).map(f => f.questionId));

  const filteredQuestions = questions.filter(q => {
    if (filter === 'known') return knownIds.has(q.id);
    if (filter === 'unknown') return unknownIds.has(q.id);
    return true;
  });

  const total = filteredQuestions.length;
  const card = filteredQuestions[currentIdx] ?? null;
  const cardFC = card ? flashcards.find(f => f.questionId === card.id) : null;
  const isKnown = cardFC?.known ?? null;

  function handleMark(known: boolean) {
    if (!card) return;
    dispatch(markFlashcard({ questionId: card.id, known }));
    setFlipped(false);
    if (currentIdx < total - 1) {
      setCurrentIdx(i => i + 1);
    }
  }

  function goNext() {
    setFlipped(false);
    if (currentIdx < total - 1) setCurrentIdx(i => i + 1);
  }

  function goPrev() {
    setFlipped(false);
    if (currentIdx > 0) setCurrentIdx(i => i - 1);
  }

  function shuffle() {
    setCurrentIdx(Math.floor(Math.random() * total));
    setFlipped(false);
  }

  const knownCount = flashcards.filter(f => f.known).length;
  const reviewedCount = flashcards.length;

  return (
    <div className="page flashcards-page">
      <div className="page-header">
        <h1>Flashcards</h1>
        <p className="page-subtitle">{questions.length} questions to study</p>
      </div>

      {/* Stats */}
      <div className="fc-stats">
        <div className="fc-stat">
          <span className="fc-stat-num text-green">{knownCount}</span>
          <span className="fc-stat-label">Known</span>
        </div>
        <div className="fc-stat">
          <span className="fc-stat-num text-red">{reviewedCount - knownCount}</span>
          <span className="fc-stat-label">Still Learning</span>
        </div>
        <div className="fc-stat">
          <span className="fc-stat-num">{questions.length - reviewedCount}</span>
          <span className="fc-stat-label">Not Reviewed</span>
        </div>
        <button className="btn btn-outline-small" onClick={() => setShowConfirmReset(true)}>Reset</button>
      </div>

      {showConfirmReset && (
        <div className="confirm-dialog">
          <p>Reset all flashcard progress?</p>
          <button className="btn btn-danger" onClick={() => { dispatch(resetFlashcards()); setShowConfirmReset(false); }}>Yes, Reset</button>
          <button className="btn btn-secondary" onClick={() => setShowConfirmReset(false)}>Cancel</button>
        </div>
      )}

      {/* Filter */}
      <div className="fc-filter">
        {(['all', 'unknown', 'known'] as FilterMode[]).map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'filter-active' : ''}`}
            onClick={() => { setFilter(f); setCurrentIdx(0); setFlipped(false); }}
          >
            {f === 'all' ? `All (${questions.length})` : f === 'known' ? `Known (${knownCount})` : `Learning (${reviewedCount - knownCount})`}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <div className="fc-empty">
          <p>No cards in this filter. Try "All" to see all questions.</p>
        </div>
      ) : (
        <>
          {/* Progress */}
          <div className="fc-progress-label">{currentIdx + 1} / {total}</div>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width: `${((currentIdx + 1) / total) * 100}%` }} />
          </div>

          {/* Card */}
          <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
            <div className="fc-front">
              <div className="fc-category">{card?.category}</div>
              <p className="fc-question">{card?.question}</p>
              <p className="fc-hint">Click to reveal answer</p>
            </div>
            <div className="fc-back">
              <div className="fc-category">{card?.category}</div>
              <p className="fc-answer"><strong>Answer:</strong> {card ? card.options[card.correctAnswer] : ''}</p>
              <p className="fc-explanation">{card?.explanation}</p>
            </div>
          </div>

          {/* Mark buttons */}
          <div className="fc-mark-btns">
            <button className={`btn btn-wrong-mark ${isKnown === false ? 'active' : ''}`} onClick={() => handleMark(false)}>
              ✗ Still Learning
            </button>
            <button className="btn btn-shuffle" onClick={shuffle}>🔀</button>
            <button className={`btn btn-correct-mark ${isKnown === true ? 'active' : ''}`} onClick={() => handleMark(true)}>
              ✓ I Know This
            </button>
          </div>

          {/* Navigation */}
          <div className="fc-nav">
            <button className="btn btn-secondary" onClick={goPrev} disabled={currentIdx === 0}>← Prev</button>
            <button className="btn btn-secondary" onClick={goNext} disabled={currentIdx === total - 1}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
}
