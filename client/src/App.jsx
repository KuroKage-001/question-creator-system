import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/system-page/HomePage';
import QuestionCreatorPage from './pages/system-page/QuestionCreatorPage';

function App() {
  return (
    <Router>
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 py-4">
            <Link to="/" className="text-black hover:text-blue-600 font-medium">
              Home
            </Link>
            <Link to="/create-questions" className="text-black hover:text-blue-600 font-medium">
              Create Questions
            </Link>
          </div>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create-questions" element={<QuestionCreatorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
