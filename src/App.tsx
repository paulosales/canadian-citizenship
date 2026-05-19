import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TestList from './pages/TestList';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import Flashcards from './pages/Flashcards';
import Progress from './pages/Progress';
import Home from './pages/Home';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tests" element={<TestList />} />
        <Route path="/test/:testId" element={<Quiz />} />
        <Route path="/results/:testId" element={<Results />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/progress" element={<Progress />} />
      </Routes>
    </Layout>
  );
}
