import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data._id,
        username: data.username,
        email: data.email
      }));

      navigate('/');
    } catch (err) {
      setError(err.message);
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
        <div className="bg-white/90 rounded-3xl shadow-2xl p-10 border-t-4 border-purple-400 backdrop-blur-md">
          <div className="text-center mb-8">
            <Sparkles className="mx-auto text-purple-500 animate-bounce" size={44} />
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900 drop-shadow">Create Your Account</h2>
            <p className="mt-2 text-gray-600 text-lg">Join QuizGenAI and unlock the smartest way to create, share, and take quizzes!</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-2 rounded-lg animate-pulse">
                <p className="text-red-700">{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900 bg-white/80 placeholder-gray-500 shadow-sm"
                placeholder="Username"
              />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900 bg-white/80 placeholder-gray-500 shadow-sm"
                placeholder="Email address"
              />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900 bg-white/80 placeholder-gray-500 shadow-sm"
                placeholder="Password"
              />
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900 bg-white/80 placeholder-gray-500 shadow-sm"
                placeholder="Confirm password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 text-white shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200"
            >
              <UserPlus className="h-6 w-6 mr-1" />
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-semibold text-purple-600 hover:underline hover:text-blue-600 transition"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;