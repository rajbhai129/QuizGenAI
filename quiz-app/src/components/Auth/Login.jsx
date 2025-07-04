import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        mode: 'cors',
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        username: data.username,
        email: data.email
      }));

      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 overflow-hidden px-4 py-12">
      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob z-0" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-20 right-0 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob z-0 animation-delay-2000" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob z-0 animation-delay-4000" style={{animationDelay: '4s'}}></div>
      <div className="max-w-md w-full z-10">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-10 border-t-4 border-blue-400 backdrop-blur-md">
          <div className="text-center mb-8">
            <ShieldCheck className="mx-auto text-blue-500 animate-bounce" size={44} />
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 drop-shadow">Welcome Back!</h2>
            <p className="mt-2 text-gray-600 text-lg">Sign in to your QuizGenAI account to create, share, and take amazing quizzes.</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-2 rounded-lg animate-pulse">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white/80 placeholder-gray-500 shadow-sm"
                placeholder="Email address"
              />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white/80 placeholder-gray-500 shadow-sm"
                placeholder="Password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200"
            >
              <LogIn className="h-6 w-6 mr-1" />
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="font-semibold text-blue-600 hover:underline hover:text-purple-600 transition"
                >
                  Register here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Login;