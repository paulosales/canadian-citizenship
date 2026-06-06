import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="header-inner">
          <button className="logo-btn" onClick={() => navigate('/')}>
            <img src="https://flagcdn.com/ca.svg" alt="Canada Flag" className="hero-image" width={40}/>
            <span className="logo-text">Canada Citizenship Quiz</span>
          </button>

          <button
            className="hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-bar ${menuOpen ? 'open' : ''}`} />
          </button>

          <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
            <NavLink
              to="/"
              end
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Home
            </NavLink>
            <NavLink
              to="/tests"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Practice Tests
            </NavLink>
            <NavLink
              to="/flashcards"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Flashcards
            </NavLink>
            <NavLink
              to="/progress"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              My Progress
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main-content">{children}</main>

      <footer className="footer">
        <p>
          Canada Citizenship Quiz &mdash; Study tool for the citizenship test. Pass: 15/20 (75%)
        </p>
      </footer>
    </div>
  );
}
