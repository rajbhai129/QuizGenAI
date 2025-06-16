// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingHero from './components/LandingHero';
import QuizGenerator from './components/QuizGenerator'; // Update this line
import { QuizProvider } from "./context/QuizContext";
import QuizTaking from './components/QuizTaking';
import QuizResult from './components/QuizResult';
import ManualQuizCreator from './components/ManualQuizCreator';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Profile from './components/Profile/Profile';
import QuizTypeSelector from './components/QuizTypeSelector'; // Import the new component

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Router>
          <div className="bg-white text-gray-900 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingHero />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/quiz" 
                  element={
                    <ProtectedRoute>
                      <QuizTypeSelector />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/create" 
                  element={
                    <ProtectedRoute>
                      <QuizGenerator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/manual" 
                  element={
                    <ProtectedRoute>
                      <ManualQuizCreator />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/take" 
                  element={
                    <ProtectedRoute>
                      <QuizTaking />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/result" element={<QuizResult />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;
