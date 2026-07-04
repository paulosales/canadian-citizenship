import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Layout from './Layout';

function renderLayout(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<div>Home Route</div>} />
                <Route path="/tests" element={<div>Tests Route</div>} />
                <Route path="/flashcards" element={<div>Flashcards Route</div>} />
                <Route path="/progress" element={<div>Progress Route</div>} />
                <Route path="*" element={<div>Fallback Child Content</div>} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('Layout component', () => {
  it('renders children, navigation links, and footer text', () => {
    const view = renderLayout('/tests');

    expect(screen.getByText('Tests Route')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Practice Tests' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Flashcards' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My Progress' })).toBeInTheDocument();
    expect(screen.getByText(/study tool for the citizenship test/i)).toBeInTheDocument();

    const nav = view.container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav?.className).not.toContain('nav-open');
  });

  it('toggles mobile menu class and navigates with logo button', async () => {
    const user = userEvent.setup();
    const view = renderLayout('/tests');

    const nav = view.container.querySelector('nav');
    if (!nav) throw new Error('Expected nav element');

    await user.click(screen.getByRole('button', { name: /toggle menu/i }));
    expect(nav.className).toContain('nav-open');

    await user.click(screen.getByRole('button', { name: /canada citizenship quiz/i }));
    expect(screen.getByText('Home Route')).toBeInTheDocument();
  });

  it('navigates through header links and closes menu after link click', async () => {
    const user = userEvent.setup();
    const view = renderLayout('/');

    const nav = view.container.querySelector('nav');
    if (!nav) throw new Error('Expected nav element');

    await user.click(screen.getByRole('button', { name: /toggle menu/i }));
    expect(nav.className).toContain('nav-open');

    await user.click(screen.getByRole('link', { name: 'Flashcards' }));
    expect(screen.getByText('Flashcards Route')).toBeInTheDocument();

    // Re-render on route change; query fresh nav node to assert closed state.
    const updatedNav = view.container.querySelector('nav.nav');
    expect(updatedNav?.className).not.toContain('nav-open');
  });
});
