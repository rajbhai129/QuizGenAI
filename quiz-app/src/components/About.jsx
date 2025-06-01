import React from 'react';
import { BookOpen, Brain, Cpu, Users, Target, Sparkles, CheckCircle2, FileText, Settings, ArrowRight } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Brain className="w-6 h-6 text-purple-500" />,
      title: "AI-Powered Generation",
      description: "Leveraging cutting-edge AI models to create intelligent and contextually relevant quizzes from any content."
    },
    {
      icon: <CheckCircle2 className="w-6 h-6 text-blue-500" />,
      title: "Smart Validation",
      description: "Advanced validation ensures high-quality questions with both single and multiple correct answer formats."
    },
    {
      icon: <Target className="w-6 h-6 text-pink-500" />,
      title: "Precise Results",
      description: "Detailed analytics and scoring system with visual representations of performance metrics."
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      title: "User-Friendly Interface",
      description: "Modern, intuitive design making quiz creation and taking a seamless experience."
    }
  ];

  const instructions = [
    {
      step: 1,
      title: "Prepare Your Content",
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      description: "Paste any text content you want to create a quiz from - articles, lessons, or study materials."
    },
    {
      step: 2,
      title: "Configure Quiz Settings",
      icon: <Settings className="w-6 h-6 text-purple-500" />,
      description: "Set the number of questions, choose between single and multiple-choice types, and specify options per question."
    },
    {
      step: 3,
      title: "Generate Quiz",
      icon: <Sparkles className="w-6 h-6 text-pink-500" />,
      description: "Click generate and let our AI create relevant questions from your content."
    },
    {
      step: 4,
      title: "Take the Quiz",
      icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
      description: "Answer the questions and get instant feedback on your performance."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-20 px-4">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto mb-20 relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-300 rounded-full blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        
        <div className="text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text">
            About QuizGenAI
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Revolutionizing quiz creation with artificial intelligence, making learning assessment more engaging and effective than ever before.
          </p>
        </div>
      </div>

      {/* How to Use Section */}
      <div className="max-w-6xl mx-auto my-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text mb-4">
            How to Use QuizGenAI
          </h2>
          <p className="text-gray-700 text-lg">
            Follow these simple steps to create your AI-powered quiz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {instructions.map((instruction, index) => (
            <div key={index} className="relative">
              {/* Connecting Line */}
              {index < instructions.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 w-full h-0.5 bg-gradient-to-r from-purple-300 to-transparent transform translate-y-[-50%] z-0"></div>
              )}
              
              {/* Step Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 relative z-10 h-full hover:shadow-xl transition-all duration-300">
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  {instruction.step}
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-white rounded-lg shadow-md mb-4">
                    {instruction.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {instruction.title}
                  </h3>
                  <p className="text-gray-600">
                    {instruction.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Start Button */}
        <div className="text-center mt-12">
          <a 
            href="/create" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            Create Your First Quiz
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-white/80 backdrop-blur-lg rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/20"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-lg shadow-md">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
            <div className="text-gray-600">Quizzes Generated</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50K+</div>
            <div className="text-gray-600">Questions Created</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-pink-600 mb-2">98%</div>
            <div className="text-gray-600">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">10K+</div>
            <div className="text-gray-600">Happy Users</div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-4xl mx-auto mt-20 text-center">
        <div className="inline-block p-1 bg-white/50 backdrop-blur-sm rounded-full mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Our Mission</span>
          </div>
        </div>
        <p className="text-xl text-gray-700 leading-relaxed">
          We're on a mission to transform the way educators and learners approach assessments. 
          By harnessing the power of AI, we're making it possible to create high-quality, 
          engaging quizzes in seconds, allowing more time for what matters most - learning and growth.
        </p>
      </div>
    </div>
  );
};

export default About;