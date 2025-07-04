import React from 'react';

const LandingHero = () => {
  return (
    <section className="relative bg-gradient-to-br from-slate-100 to-slate-200 text-gray-900 py-28 px-6 md:px-12 lg:px-20 overflow-hidden">
      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob z-0" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-20 right-0 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob z-0 animation-delay-2000" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob z-0 animation-delay-4000" style={{animationDelay: '4s'}}></div>
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
          <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">QuizGenAI</span> <br />
          <span className="text-gray-800">Create, Share & Analyze Quizzes Instantly</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Generate quizzes from PDFs, images, or text using AI, or craft your own manually. Share quizzes, track results, and enjoy a beautiful, modern experience.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="/quiz"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition shadow-lg hover:scale-105"
          >
            Get Started
          </a>
          <a
            href="/about"
            className="text-blue-600 hover:underline font-medium text-lg"
          >
            Learn more
          </a>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/80 rounded-xl shadow-lg p-6 border-t-4 border-blue-400">
            <h3 className="font-bold text-xl mb-2 text-blue-700">AI Quiz Generator</h3>
            <p className="text-gray-600">Upload content and let AI create smart quizzes for you in seconds.</p>
          </div>
          <div className="bg-white/80 rounded-xl shadow-lg p-6 border-t-4 border-purple-400">
            <h3 className="font-bold text-xl mb-2 text-purple-700">Manual Quiz Builder</h3>
            <p className="text-gray-600">Design your own quizzes with custom questions and answers.</p>
          </div>
          <div className="bg-white/80 rounded-xl shadow-lg p-6 border-t-4 border-pink-400">
            <h3 className="font-bold text-xl mb-2 text-pink-700">Share & Analyze</h3>
            <p className="text-gray-600">Share quizzes with anyone and view detailed analytics and results.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
