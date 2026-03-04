import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StateSelector from './components/StateSelector';
import StateHome from './components/StateHome';
import AdminPanel from './components/AdminPanel';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StateSelector />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/:slug" element={<StateHome />} />
      </Routes>
    </Router>
  );
}
