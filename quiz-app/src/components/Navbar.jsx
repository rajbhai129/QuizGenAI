import React, { useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-100 via-purple-500 to-pink-500 shadow-md fixed w-full z-20 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}> 
          <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="ml-2 font-bold text-xl text-gray-800">
            Quiz<span className="text-blue-600">GenAI</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex flex-1 justify-center items-center gap-8">
          <NavLink to="/" className={({ isActive }) => `transition font-medium px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'}`}>Home</NavLink>
          <NavLink to="/create" className={({ isActive }) => `transition font-medium px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'}`}>Create Quiz</NavLink>
          <NavLink to="/take" className={({ isActive }) => `transition font-medium px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'}`}>Take Quiz</NavLink>
          <NavLink to="/about" className={({ isActive }) => `transition font-medium px-3 py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'}`}>About</NavLink>
        </div>

        {/* User Section */}
        <div className="hidden md:flex items-center gap-4 relative">
          {user ? (
            <div className="flex items-center gap-2 relative">
              <button
                className="flex items-center gap-2 focus:outline-none group"
                onClick={() => setDropdown((d) => !d)}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-blue-400 shadow" />
                ) : (
                  <User className="w-9 h-9 rounded-full bg-gray-200 p-1 text-gray-500 border-2 border-blue-400" />
                )}
                <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition">{user.username}</span>
                <svg className="w-4 h-4 ml-1 text-gray-500 group-hover:text-blue-600 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-12 w-44 bg-white rounded-xl shadow-lg py-2 z-50 border border-blue-100 animate-fade-in">
                  <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-blue-50 rounded-t-xl" onClick={() => setDropdown(false)}>Profile</Link>
                  <button onClick={() => { setDropdown(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-xl">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <NavLink to="/login" className="transition font-medium px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"><User className="w-5 h-5" />Login</NavLink>
              <NavLink to="/register" className="transition font-medium px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2">Register</NavLink>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button onClick={() => setOpen(!open)} className="focus:outline-none">
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden absolute top-20 right-0 bg-white w-full shadow-lg transition-transform duration-300 ease-in-out z-40">
          <div className="flex flex-col items-center p-4 gap-2">
            <NavLink to="/" className={({ isActive }) => `w-full text-center py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'}`} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/create" className={({ isActive }) => `w-full text-center py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'}`} onClick={() => setOpen(false)}>Create Quiz</NavLink>
            <NavLink to="/take" className={({ isActive }) => `w-full text-center py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'}`} onClick={() => setOpen(false)}>Take Quiz</NavLink>
            <NavLink to="/about" className={({ isActive }) => `w-full text-center py-2 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-800 hover:bg-blue-50 hover:text-blue-600'}`} onClick={() => setOpen(false)}>About</NavLink>
            <div className="w-full border-t my-2"></div>
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 py-2 w-full" onClick={() => setOpen(false)}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border-2 border-blue-400" />
                  ) : (
                    <User className="w-8 h-8 rounded-full bg-gray-200 p-1 text-gray-500 border-2 border-blue-400" />
                  )}
                  <span className="font-semibold">{user.username}</span>
                </Link>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl mt-2">Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="w-full text-center py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 justify-center" onClick={() => setOpen(false)}><User className="w-5 h-5" />Login</NavLink>
                <NavLink to="/register" className="w-full text-center py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 justify-center" onClick={() => setOpen(false)}>Register</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
