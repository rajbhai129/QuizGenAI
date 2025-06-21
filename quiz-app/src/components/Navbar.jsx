import React, { useState } from 'react';
import { Menu, X, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const resetFlow = () => {
    window.location.reload();
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-100 via-purple-500 to-pink-500 shadow-md fixed w-full z-20 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center text-white">
        <div className="flex items-center">
          <div className="flex-shrink-0 cursor-pointer" onClick={resetFlow}>
            <div className="flex items-center">
              <svg
                className="h-8 w-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <span className="ml-2 font-bold text-xl text-gray-800">
                Quiz
                <span className="text-blue-600">GenAI</span>
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-6 text-lg">
          <a href="/" className="hover:text-yellow-300 transition">
            Home
          </a>
          <div className="relative group">
            <a href="/quiz" className="hover:text-yellow-300 transition">
              Create Quiz
            </a>
            <div className="absolute hidden group-hover:block w-48 bg-white shadow-lg rounded-lg mt-2">
              <a
                href="/create"
                className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
              >
                AI Generator
              </a>
              <a
                href="/manual"
                className="block px-4 py-2 text-gray-800 hover:bg-blue-50"
              >
                Manual Creator
              </a>
            </div>
          </div>
          <a href="/take" className="hover:text-yellow-300 transition">
            Take Quiz
          </a>
          <a href="/about" className="hover:text-yellow-300 transition">
            About
          </a>
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 rounded-full bg-gray-200 p-1" />
                  )}
                  <span className="font-semibold">{user.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="hover:text-yellow-300">
                Login
              </a>
              <a href="/register" className="hover:text-yellow-300">
                Register
              </a>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setOpen(!open)}>
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-6 pb-4 bg-gradient-to-r from-indigo-600 to-pink-600 text-white space-y-3">
          <a href="/" className="block">
            Home
          </a>
          <a href="/create" className="block">
            Create Quiz
          </a>
          <a href="/take" className="block">
            Take Quiz
          </a>
          <a href="/about" className="block">
            About
          </a>
          {user ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 py-2" onClick={() => setOpen(false)}>
                 {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8 rounded-full bg-gray-200 p-1" />
                )}
                <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition w-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="block">
                Login
              </a>
              <a href="/register" className="block">
                Register
              </a>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
