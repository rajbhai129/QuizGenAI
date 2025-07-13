import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { useAuth } from "../context/AuthContext";
import { Sparkles, FileText, Settings, Loader2, Image, File, Paperclip, Link as LinkIcon, CheckCircle, Info } from "lucide-react";
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
  const [selectedLanguage, setSelectedLanguage] = useState("hin+eng"); // Default to Hindi + English
  const [languageModelsLoaded, setLanguageModelsLoaded] = useState(false);
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const navigate = useNavigate();
  const { setQuizData, fetchQuizHistory } = useQuiz();
  const { user } = useAuth();
  const [shareModal, setShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [guestLimitModal, setGuestLimitModal] = useState(false);

  // Preload language models for better performance
  useEffect(() => {
    const preloadLanguages = async () => {
      try {
        console.log('Preloading language models...');
        await Tesseract.createWorker('hin+eng');
        setLanguageModelsLoaded(true);
        console.log('Language models loaded successfully!');
      } catch (error) {
        console.error('Error preloading language models:', error);
        // Continue anyway, models will load on first use
      }
    };
    preloadLanguages();
  }, []);

  // Function to detect text language
  const detectTextLanguage = (text) => {
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    
    if (hasHindi && hasEnglish) return 'multilingual';
    if (hasHindi) return 'hindi';
    if (hasEnglish) return 'english';
    return 'unknown';
  };

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

      if (single < 0 || multiple < 0) {
        throw new Error('Question counts cannot be negative');
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
      } else if (err.message && err.message.includes('Guest account can only create 2 quizzes')) {
        setGuestLimitModal(true);
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

      const { text, languageInfo } = await response.json();
      
      // Show language detection feedback
      if (languageInfo) {
        let languageMsg = 'Text extracted successfully! ';
        if (languageInfo.isMultilingual) {
          languageMsg += '✅ Hindi + English text detected';
        } else if (languageInfo.hasHindi) {
          languageMsg += '✅ Hindi text detected';
        } else if (languageInfo.hasEnglish) {
          languageMsg += '✅ English text detected';
        }
        
        // Show a brief notification (you can replace this with a proper toast notification)
        console.log(languageMsg);
      }
      
      setInputText((prev) => prev ? `${prev}\n\n${text}` : text);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      alert("Failed to extract text from PDF. Please try another PDF or ensure the text is clear and readable.");
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
      // Use selected language for better text recognition
      const result = await Tesseract.recognize(
        file,
        selectedLanguage, // Use selected language
        { 
          logger: m => console.log(m),
          // Additional options for better accuracy
          tessedit_char_whitelist: selectedLanguage.includes('hin') 
            ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzअआइईउऊएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसहक्षत्रज्ञड़ढ़।,?!:;()[]{}"\'-_+=@#$%^&*~`|\\/<>'
            : '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz,?!:;()[]{}"\'-_+=@#$%^&*~`|\\/<>',
          preserve_interword_spaces: '1'
        }
      );

      const extractedText = result.data.text;
      const detectedLanguage = detectTextLanguage(extractedText);
      
      // Provide feedback about extraction
      let feedbackMsg = 'Text extracted successfully! ';
      if (detectedLanguage === 'multilingual') {
        feedbackMsg += '✅ Hindi + English text detected';
      } else if (detectedLanguage === 'hindi') {
        feedbackMsg += '✅ Hindi text detected';
      } else if (detectedLanguage === 'english') {
        feedbackMsg += '✅ English text detected';
      } else {
        feedbackMsg += '⚠️ No recognizable text detected';
      }
      
      console.log(feedbackMsg);
      console.log('Extracted text length:', extractedText.length);
      
      if (extractedText.trim().length < 10) {
        alert('Warning: Very little text was extracted. Please ensure the image has clear, readable text.');
      }

      setInputText((prev) => prev ? `${prev}\n\n${extractedText}` : extractedText);
    } catch (error) {
      console.error("Error extracting text from image:", error);
      alert("Failed to extract text from image. Please try another image or ensure the text is clear and readable.");
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
      {guestLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-2 border-orange-200">
            <div className="bg-orange-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="text-orange-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Quiz Limit Reached! 🎯</h2>
            <p className="mb-6 text-gray-600">You've created 2 quizzes as a guest. Register now for unlimited access!</p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setGuestLimitModal(false);
                  navigate('/register');
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🚀 Register for Unlimited Access
              </button>
              
              <button
                onClick={() => {
                  setGuestLimitModal(false);
                  navigate('/login');
                }}
                className="w-full bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-700 transition"
              >
                🔐 Login to Existing Account
              </button>
              
              <button
                onClick={() => setGuestLimitModal(false)}
                className="w-full text-gray-500 hover:text-gray-700 transition"
              >
                Maybe Later
              </button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 <strong>Benefits of registering:</strong><br/>
                • Unlimited quiz creation<br/>
                • Save quiz history<br/>
                • Analytics & insights<br/>
                • Custom profile
              </p>
            </div>
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
          {user?.email === 'guest@quizgenai.com' && (
            <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                🎯 Guest Mode: You can create 2 quizzes. Register for unlimited access!
              </p>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
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

          {/* Language Selector for Image OCR */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Language for Image OCR:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="hin+eng">Hindi + English (Recommended)</option>
                <option value="hin">Hindi Only</option>
                <option value="eng">English Only</option>
                <option value="hin+eng+dev">Hindi + English + Devanagari</option>
              </select>
              {languageModelsLoaded && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Ready
                </span>
              )}
            </div>
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

          {/* Helpful Tips */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Tips for Better Text Extraction
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Images:</strong> Use high-resolution, well-lit images with clear text</li>
              <li>• <strong>PDFs:</strong> Ensure text is selectable (not scanned images)</li>
              <li>• <strong>Hindi Text:</strong> Choose "Hindi + English" for mixed content</li>
              <li>• <strong>Font Size:</strong> Larger, clear fonts work better for OCR</li>
            </ul>
          </div>
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