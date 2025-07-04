import React from 'react';
import { Sparkles, BookOpen, PenTool, Share2, BarChart3, Users, Code2 } from 'lucide-react';

const features = [
  {
    icon: <Sparkles className="w-8 h-8 text-blue-500 animate-bounce" />,
    title: 'AI Quiz Generator',
    desc: 'Generate quizzes instantly from PDFs, images, or text using advanced AI.'
  },
  {
    icon: <PenTool className="w-8 h-8 text-purple-500 animate-pulse" />,
    title: 'Manual Quiz Builder',
    desc: 'Craft your own quizzes with custom questions and answers.'
  },
  {
    icon: <Share2 className="w-8 h-8 text-pink-500 animate-spin-slow" />,
    title: 'Easy Sharing',
    desc: 'Share quizzes with friends, students, or colleagues in one click.'
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-green-500 animate-pulse" />,
    title: 'Analytics & Results',
    desc: 'Track performance and get detailed quiz analytics.'
  },
];

const techStack = [
  { name: 'React', color: 'text-blue-600' },
  { name: 'Tailwind CSS', color: 'text-cyan-500' },
  { name: 'Node.js', color: 'text-green-600' },
  { name: 'Express', color: 'text-gray-800' },
  { name: 'MongoDB', color: 'text-green-700' },
  { name: 'OpenAI/Together AI', color: 'text-purple-600' },
];

const About = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-20 px-4 overflow-hidden">
      {/* Animated Blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob z-0" style={{animationDelay: '0s'}}></div>
      <div className="absolute top-20 right-0 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob z-0 animation-delay-2000" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob z-0 animation-delay-4000" style={{animationDelay: '4s'}}></div>
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-4 drop-shadow-lg">
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">About QuizGenAI</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            QuizGenAI is your all-in-one platform to create, share, and analyze quizzes with the power of AI and a beautiful, modern interface.
          </p>
        </div>
        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-10 text-blue-700 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 animate-bounce text-pink-500" /> Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white/90 rounded-2xl shadow-xl p-8 flex items-center gap-6 border-t-4 border-blue-200 hover:scale-105 transition-transform duration-300 group">
                <div>{f.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-1 group-hover:text-blue-600 transition">{f.title}</h3>
                  <p className="text-gray-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Tech Stack Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-8 text-purple-700 flex items-center justify-center gap-2">
            <Code2 className="w-7 h-7 animate-pulse text-blue-500" /> Tech Stack
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {techStack.map((tech, i) => (
              <span key={i} className={`px-6 py-2 rounded-full bg-white/80 shadow text-lg font-semibold border border-gray-200 hover:scale-110 transition ${tech.color}`}>
                {tech.name}
              </span>
            ))}
          </div>
        </div>
        {/* Team/Mission Section */}
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-4 text-pink-700 flex items-center justify-center gap-2">
            <Users className="w-8 h-8 animate-bounce text-purple-500" /> Our Mission
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
            We believe learning should be fun, accessible, and smart. QuizGenAI is built by passionate creators who love technology and education. Our mission is to empower everyone—students, teachers, and lifelong learners—to create and share knowledge in the most engaging way possible.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-6">
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border-t-4 border-blue-400 animate-fade-in">
              <h3 className="font-bold text-lg mb-2 text-blue-700">For Learners</h3>
              <p className="text-gray-600">Practice, test, and improve your knowledge with instant feedback and analytics.</p>
            </div>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border-t-4 border-purple-400 animate-fade-in animation-delay-2000">
              <h3 className="font-bold text-lg mb-2 text-purple-700">For Educators</h3>
              <p className="text-gray-600">Create engaging quizzes, track student progress, and save time with AI-powered tools.</p>
            </div>
            <div className="bg-white/90 rounded-xl shadow-lg p-6 border-t-4 border-pink-400 animate-fade-in animation-delay-4000">
              <h3 className="font-bold text-lg mb-2 text-pink-700">For Everyone</h3>
              <p className="text-gray-600">Share knowledge, challenge friends, and make learning a social experience!</p>
            </div>
          </div>
        </div>
        {/* Call to Action */}
        <div className="text-center mt-16">
          <a href="/quiz" className="inline-block bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white font-bold py-4 px-10 rounded-2xl shadow-lg text-2xl hover:scale-105 transition-all duration-200 animate-bounce">
            Start Your Quiz Journey Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default About; 