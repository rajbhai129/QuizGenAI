// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingHero from './components/LandingHero';
import QuizGenerator from './components/QuizGenerator';
import { QuizProvider } from "./context/QuizContext";
import QuizTaking from './components/QuizTaking';
import QuizResult from './components/QuizResult';
function App() {
  return (
    <QuizProvider>
      <Router>
        <div className="bg-white text-gray-900 min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingHero />} />
              <Route path="/create" element={<QuizGenerator />} />
              <Route path="/take" element={<QuizTaking />} />
              <Route path="/result" element={<QuizResult />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QuizProvider>
  );
}

export default App;
