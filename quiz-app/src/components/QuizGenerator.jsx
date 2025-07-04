import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { Sparkles, FileText, Settings, Loader2, Image, File, Paperclip, Link as LinkIcon, CheckCircle } from "lucide-react";
import Tesseract from 'tesseract.js';

const API_BASE = process.env.REACT_APP_API_URL || "";

const QuizGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [singleCorrect, setSingleCorrect] = useState("");
  const [multipleCorrect, setMultipleCorrect] = useState("");
  const [numOptions, setNumOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const navigate = useNavigate();
  const { setQuizData, fetchQuizHistory } = useQuiz();
  const [shareModal, setShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

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
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}` // Add this line
        },
        body: JSON.stringify({
          content: inputText.trim(),
          totalQuestions: total,
          singleCorrect: single,
          multipleCorrect: multiple,
          optionsPerQuestion: options
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

      await fetchQuizHistory();
      setQuizData(data.quiz);

      // Save quiz as shared quiz
      const res = await fetch(`${API_BASE}/api/quiz/create`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          details: data.quiz,
          title: 'AI Generated Quiz',
          description: ''
        })
      });
      const result = await res.json();
      if (res.ok && result.quizId) {
        const link = `${window.location.origin}/take/${result.quizId}`;
        setShareLink(link);
        setShareModal(true);
      } else {
        throw new Error(result.error || 'Failed to create quiz');
      }
    } catch (err) {
      console.error("Quiz generation error:", err);
      if (err.response?.status === 401) {
        alert("Please login to generate quiz");
        navigate('/login');
      } else {
        alert(err.message || "Failed to generate quiz. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle PDF upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileLoading(true);
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`${API_BASE}/api/extract-pdf`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Add this line
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to extract text from PDF');
      }

      const { text } = await response.json();
      setInputText((prev) => prev ? `${prev}\n\n${text}` : text);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      alert("Failed to extract text from PDF. Please try another PDF.");
    } finally {
      setFileLoading(false);
    }
  };

  // Handle Image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileLoading(true);
    try {
      const result = await Tesseract.recognize(
        file,
        'eng',
        { logger: m => console.log(m) }
      );

      setInputText((prev) => prev ? `${prev}\n\n${result.data.text}` : result.data.text);
    } catch (error) {
      console.error("Error extracting text from image:", error);
      alert("Failed to extract text from image. Please try another image.");
    } finally {
      setFileLoading(false);
    }
  };

  // Trigger file inputs
  const triggerFileUpload = (type) => {
    if (type === 'pdf') {
      pdfInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 py-20 min-h-[100vh] flex items-center justify-center px-4">
      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-blue-200">
            <LinkIcon className="mx-auto text-blue-500 mb-2" size={40} />
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Quiz Created!</h2>
            <p className="mb-4 text-gray-600">Share this link with anyone to let them take your quiz:</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 text-sm"
              />
              <button
                onClick={handleCopy}
                className={`px-3 py-2 rounded-lg font-semibold transition ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {copied ? <><CheckCircle className="inline mr-1" size={18}/>Copied!</> : 'Copy Link'}
              </button>
            </div>
            <button
              onClick={() => setShareModal(false)}
              className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 relative overflow-hidden border border-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300 rounded-full blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>

        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800 drop-shadow-md flex justify-center gap-2 items-center">
            <Sparkles className="text-pink-500" /> Generate Your AI Quiz
          </h2>
          <p className="text-gray-600 mt-2 text-lg">
            Upload content or paste text below to create your quiz instantly!
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => triggerFileUpload('image')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Image size={20} />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => triggerFileUpload('pdf')}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <File size={20} />
              Upload PDF
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={pdfInputRef}
            onChange={handlePdfUpload}
            accept=".pdf"
            className="hidden"
          />

          {fileLoading && (
            <div className="text-center mt-4">
              <div className="inline-flex items-center gap-2">
                <Loader2 className="animate-spin" size={20} />
                <span>Processing file...</span>
              </div>
            </div>
          )}
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