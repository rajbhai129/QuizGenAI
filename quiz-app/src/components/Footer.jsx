import React from 'react';
import { Facebook, Twitter, Instagram, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 text-white py-10 px-4 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand & About */}
        <div>
          <h2 className="text-2xl font-bold mb-2">QuizGen</h2>
          <p className="text-sm text-white/80">
            Build, take, and share intelligent quizzes with elegant UI. Powered by AI, designed for everyone.
          </p>
        </div>

        {/* Useful Links */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="/" className="hover:underline hover:text-yellow-200">Home</a></li>
            <li><a href="/create" className="hover:underline hover:text-yellow-200">Create Quiz</a></li>
            <li><a href="/take" className="hover:underline hover:text-yellow-200">Take Quiz</a></li>
            <li><a href="/about" className="hover:underline hover:text-yellow-200">About</a></li>
          </ul>
        </div>

        {/* Social Icons */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Follow Us</h3>
          <div className="flex gap-4 mt-2">
            <a href="#" className="hover:text-yellow-300 transition"><Facebook /></a>
            <a href="#" className="hover:text-yellow-300 transition"><Twitter /></a>
            <a href="#" className="hover:text-yellow-300 transition"><Instagram /></a>
            <a href="#" className="hover:text-yellow-300 transition"><Github /></a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-sm text-white/70">
        © {new Date().getFullYear()} QuizGen. All rights reserved .
      </div>
    </footer>
  );
};

export default Footer;
