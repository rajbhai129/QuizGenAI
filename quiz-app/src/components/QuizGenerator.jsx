import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { Sparkles, FileText, Settings, Loader2 } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "";

const QuizGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [singleCorrect, setSingleCorrect] = useState("");
  const [multipleCorrect, setMultipleCorrect] = useState("");
  const [numOptions, setNumOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setQuizData } = useQuiz();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Validate inputs before sending
      if (!inputText.trim()) {
        throw new Error('Please enter some content to generate questions from');
      }

      const total = parseInt(totalQuestions);
      const single = parseInt(singleCorrect);
      const multiple = parseInt(multipleCorrect);
      const options = parseInt(numOptions);

      if (single + multiple !== total) {
        throw new Error('Single + Multiple correct questions must equal Total questions');
      }

      if (options < 2) {
        throw new Error('Must have at least 2 options per question');
      }

      console.log('Sending request to:', `${API_BASE}/api/quiz/generate`);
      
      const response = await fetch(`${API_BASE}/api/quiz/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          content: inputText.trim(),           // Changed from prompt
          totalQuestions: total,               // Changed from numQuestions
          singleCorrect: single,
          multipleCorrect: multiple,
          optionsPerQuestion: options          // Changed from numOptions
        }),
      });

      // First check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      // Then try to parse JSON
      const data = await response.json();
      console.log('Received data:', data);

      if (!data.quiz || !Array.isArray(data.quiz)) {
        console.error('Invalid quiz format:', data);
        throw new Error("Invalid quiz format received from server");
      }

      setQuizData(data.quiz);
      navigate("/take");
    } catch (err) {
      console.error("Quiz generation error:", err);
      alert(err.message || "Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-20 min-h-[100vh] flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 relative overflow-hidden border border-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 drop-shadow-md flex justify-center gap-2 items-center">
            <Sparkles className="text-pink-500" /> Generate Your AI Quiz
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            Paste your content below and customize your quiz. Instantly create questions using AI!
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleGenerate();
          }}
          className="space-y-6"
        >
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FileText size={18} /> Source Content
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              rows={4}
              placeholder="Paste your content here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Single Correct</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={singleCorrect}
                onChange={(e) => setSingleCorrect(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Multiple Correct</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={multipleCorrect}
                onChange={(e) => setMultipleCorrect(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Options/Question</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={numOptions}
                onChange={(e) => setNumOptions(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-200 flex justify-center items-center text-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} /> Generating...
              </>
            ) : (
              <>
                <Settings className="mr-2" size={20} /> Generate Quiz
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
};

export default QuizGenerator;
