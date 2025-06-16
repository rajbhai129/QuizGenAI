import React from 'react';

const LandingHero = () => {
  return (
    <section className="bg-gradient-to-br from-slate-100 to-slate-200 text-gray-900 py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
          Create AI-Powered Quizzes Effortlessly
        </h1>

        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Upload PDFs, text, or images and instantly generate smart quizzes. Share them and analyze results with ease.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="/quiz"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition"
          >
            Get Started
          </a>
          <a
            href="/about"
            className="text-blue-600 hover:underline font-medium"
          >
            Learn more
          </a>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
