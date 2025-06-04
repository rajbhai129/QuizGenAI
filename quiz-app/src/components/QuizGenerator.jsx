import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuiz } from "../context/QuizContext";
import { Sparkles, FileText, Settings, Loader2, Image, File, Paperclip } from "lucide-react";
import Tesseract from 'tesseract.js';

const API_BASE = process.env.REACT_APP_API_URL || "";

const QuizGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [singleCorrect, setSingleCorrect] = useState("");
  const [multipleCorrect, setMultipleCorrect] = useState("");
  const [numOptions, setNumOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const navigate = useNavigate();
  const { setQuizData } = useQuiz();

  // Function to convert ArrayBuffer to base64 using FileReader
  const arrayBufferToBase64 = (buffer) => {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer], { type: 'application/pdf' });
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(',')[1]; // Remove "data:application/pdf;base64," prefix
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(blob);
    });
  };

  // Handle image upload and OCR
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB for images)
    const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSizeInBytes) {
      alert(`Image size exceeds 10 MB. Please upload a smaller image (max ${maxSizeInBytes / 1024 / 1024}MB).`);
      return;
    }

    setImageLoading(true);
    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => console.log(m),
        }
      );
      setInputText((prev) => prev ? `${prev}\n\n${text}` : text);
    } catch (error) {
      console.error("Error extracting text from image:", error);
      alert("Failed to extract text from image. Please try another image.");
    } finally {
      setImageLoading(false);
    }
  };

  // Handle PDF upload and text extraction by calling the backend API
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPdfLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const base64String = await arrayBufferToBase64(arrayBuffer);

      console.log('Sending PDF extraction request to:', `${API_BASE}/api/extract-pdf`);
      
      const response = await fetch(`${API_BASE}/api/extract-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ pdf: base64String }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `Server error (${response.status})` 
        }));
        throw new Error(errorData.error || 'Failed to extract text from PDF');
      }

      const data = await response.json();
      if (!data.text) {
        throw new Error('No text could be extracted from the PDF');
      }

      setInputText((prev) => prev ? `${prev}\n\n${data.text}` : data.text);
    } catch (error) {
      console.error("PDF extraction error:", error);
      alert(`PDF extraction failed: ${error.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  // Toggle dropdown for attach options
  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  // Trigger file input for image
  const triggerImageUpload = () => {
    imageInputRef.current.click();
    setShowDropdown(false);
  };

  // Trigger file input for PDF
  const triggerPdfUpload = () => {
    pdfInputRef.current.click();
    setShowDropdown(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (!inputText.trim()) {
        throw new Error('Please enter some content, upload an image, or upload a PDF to generate questions from');
      }

      const total = parseInt(totalQuestions);
      const single = parseInt(singleCorrect);
      const multiple = parseInt(multipleCorrect);
      const options = parseInt(numOptions);

      if (isNaN(total) || total < 1) {
        throw new Error('Total questions must be a number greater than 0');
      }
      if (isNaN(single) || single < 0) {
        throw new Error('Single correct questions must be a number greater than or equal to 0');
      }
      if (isNaN(multiple) || multiple < 0) {
        throw new Error('Multiple correct questions must be a number greater than or equal to 0');
      }
      if (isNaN(options) || options < 2) {
        throw new Error('Options per question must be a number greater than or equal to 2');
      }

      if (single + multiple !== total) {
        throw new Error('Single + Multiple correct questions must equal Total questions');
      }

      console.log('Sending request to:', `${API_BASE}/api/quiz/generate`);
      
      const response = await fetch(`${API_BASE}/api/quiz/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          content: inputText.trim(),
          totalQuestions: total,
          singleCorrect: single,
          multipleCorrect: multiple,
          optionsPerQuestion: options
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = `Server error (${response.status})`;
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          console.error('Non-JSON response from server:', errorText);
          errorMessage = 'Server returned an unexpected response. Please try again.';
        }
        
        throw new Error(errorMessage);
      }

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
            Paste your content, upload an image, or upload a PDF to generate questions using AI!
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
            <div className="relative">
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition pr-12"
                rows={4}
                placeholder="Paste your content here, or attach an image/PDF..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                type="button"
                onClick={toggleDropdown}
                className="absolute right-2 top-2 text-gray-600 hover:text-blue-500 transition"
              >
                <Paperclip size={20} />
              </button>
              {showDropdown && (
                <div className="absolute right-2 top-10 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <button
                    type="button"
                    onClick={triggerImageUpload}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Image size={16} /> Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={triggerPdfUpload}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <File size={16} /> Upload PDF
                  </button>
                </div>
              )}
            </div>
            {/* Hidden file inputs */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={imageInputRef}
              className="hidden"
              disabled={imageLoading || pdfLoading}
            />
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              ref={pdfInputRef}
              className="hidden"
              disabled={imageLoading || pdfLoading}
            />
            {(imageLoading || pdfLoading) && (
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Loader2 className="animate-spin" size={18} />
                {imageLoading ? "Extracting text from image..." : "Extracting text from PDF..."}
              </p>
            )}
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
            disabled={loading || imageLoading || pdfLoading}
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