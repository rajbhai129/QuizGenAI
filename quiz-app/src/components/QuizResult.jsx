import React, { useState, useEffect } from 'react';
import { useQuiz } from '../context/QuizContext';
import { useParams, useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, AlignmentType } from 'docx';
import { Download } from 'lucide-react';

const QuizResult = () => {
  const { quizId } = useParams();
  const { quizData, userAnswers, fetchQuizHistory, sharedQuizResult, sharedQuizMeta, setSharedQuizResult, setSharedQuizMeta } = useQuiz();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [notFound, setNotFound] = useState(false);

  // Load from localStorage if context is empty
  useEffect(() => {
    if (quizId) {
      const storedResult = localStorage.getItem(`quizResult_${quizId}`);
      if (storedResult) {
        setSharedQuizResult(JSON.parse(storedResult));
      } else {
        setNotFound(true);
      }
    }
  }, [sharedQuizResult, sharedQuizMeta, setSharedQuizResult, setSharedQuizMeta, quizId]);

  useEffect(() => {
    if (quizData && quizData.length > 0) {
      const saveResults = async () => {
        let totalScore = 0;
        let correctQuestions = 0;
        let incorrectQuestions = 0;
        const questionResults = quizData.map((question, index) => {
          const userAns = userAnswers[index] || [];
          const correctAns = question.correctAnswers;
          const userIndices = userAns.map(ans => ans.charCodeAt(0) - 97).filter(idx => idx >= 0 && idx < question.options.length);
          const hasWrong = userIndices.some(idx => !correctAns.includes(idx));
          let questionScore = 0;
          let isCorrect = false;
          if (question.type === "single") {
            if (userIndices.length === 1 && userIndices[0] === correctAns[0]) {
              questionScore = 1; isCorrect = true; correctQuestions++;
            } else {
              incorrectQuestions++;
            }
          } else {
            if (hasWrong || userIndices.length === 0) {
              incorrectQuestions++;
            } else {
              const correctSelected = userIndices.filter(idx => correctAns.includes(idx)).length;
              questionScore = (correctSelected / correctAns.length);
              if (correctSelected === correctAns.length) {
                isCorrect = true; correctQuestions++;
              } else {
                incorrectQuestions++;
              }
            }
          }
          totalScore += questionScore;
          return {
            question: question.question,
            userAnswer: userAns.map(idx => question.options[idx.charCodeAt(0) - 97]).join(", ") || "Not answered",
            correctAnswer: correctAns.map(idx => question.options[idx]).join(", "),
            isCorrect, score: questionScore, type: question.type
          };
        });

        try {
          await fetch(`${process.env.REACT_APP_API_URL}/api/auth/quiz-result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            body: JSON.stringify({
              quizResults: {
                quizId: quizData.id || Date.now().toString(),
                score: totalScore, totalQuestions: quizData.length,
                correctAnswers: correctQuestions, incorrectAnswers: incorrectQuestions,
                details: questionResults, type: 'taken', date: new Date()
              }
            })
          });
          await fetchQuizHistory();
        } catch (error) {
          console.error('Error saving results:', error);
          alert('Failed to save results automatically.');
        }
      };
      
      saveResults();
    }
  }, [quizData, userAnswers, fetchQuizHistory]);

  if (sharedQuizResult) {
    // Show shared quiz result
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Quiz Results
        </h1>
        {sharedQuizMeta && (
          <div className="text-center text-gray-500 mb-4">
            <span>Quiz: <span className="font-semibold text-blue-600">{sharedQuizMeta.title || 'Shared Quiz'}</span></span>
            {sharedQuizMeta.owner && <span className="ml-2">by <span className="font-semibold">{sharedQuizMeta.owner}</span></span>}
            {sharedQuizMeta.createdAt && <span className="ml-2">on {new Date(sharedQuizMeta.createdAt).toLocaleString()}</span>}
          </div>
        )}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Your Score</h2>
              <p className="text-4xl font-bold text-blue-600">
                {sharedQuizResult.score} / {sharedQuizResult.details.length}
              </p>
              <p className="text-gray-600 mt-2">
                Correct: {sharedQuizResult.correctAnswers} | Incorrect: {sharedQuizResult.incorrectAnswers}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Question-wise Breakdown</h2>
          {sharedQuizResult.details.map((result, index) => (
            <div
              key={index}
              className={`p-4 mb-4 rounded-lg border-l-4 ${
                result.isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
              }`}
            >
              <h3 className="font-semibold text-gray-800">
                {index + 1}. {result.question} ({result.type})
              </h3>
              <p className="text-gray-700 mt-1">
                <span className="font-medium">Your Answer:</span> {result.userAnswer}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Correct Answer:</span> {result.correctAnswer}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Score:</span> {result.score} / 1
              </p>
              <p className={`mt-1 font-medium ${
                result.isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.isCorrect ? 'Correct' : 'Incorrect'}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setSharedQuizResult(null);
              setSharedQuizMeta(null);
              navigate("/");
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4 text-red-600">No result found for this quiz!</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!quizData || quizData.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <h2 className="text-xl font-semibold mb-4">No quiz data found!</h2>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Calculate score and stats
  let totalScore = 0;
  let correctQuestions = 0;
  let incorrectQuestions = 0;
  const questionResults = quizData.map((question, index) => {
    const userAns = userAnswers[index] || []; // ["a", "c"]
    const correctAns = question.correctAnswers; // [0, 2]

    // Convert user answers (labels like "a", "c") to indices
    const userIndices = userAns
      .map(ans => ans.charCodeAt(0) - 97) // Convert "a" -> 0, "c" -> 2
      .filter(idx => idx >= 0 && idx < question.options.length);

    // Check if user selected any wrong options
    const hasWrong = userIndices.some(idx => !correctAns.includes(idx));

    let questionScore = 0;
    let isCorrect = false;

    if (question.type === "single") {
      // Single correct: exact match for 1 mark
      if (userIndices.length === 1 && userIndices[0] === correctAns[0]) {
        questionScore = 1;
        isCorrect = true;
        correctQuestions++;
      } else {
        incorrectQuestions++;
      }
    } else {
      // Multiple correct: partial marks if no wrong selections
      if (hasWrong || userIndices.length === 0) {
        questionScore = 0;
        incorrectQuestions++;
      } else {
        const correctSelected = userIndices.filter(idx => correctAns.includes(idx)).length;
        questionScore = (correctSelected / correctAns.length);
        if (correctSelected === correctAns.length) {
          isCorrect = true;
          correctQuestions++;
        } else {
          incorrectQuestions++;
        }
      }
    }

    totalScore += questionScore;

    return {
      question: question.question,
      userAnswer: userAns.map(idx => question.options[idx.charCodeAt(0) - 97]).join(", ") || "Not answered",
      correctAnswer: correctAns.map(idx => question.options[idx]).join(", "),
      isCorrect,
      score: questionScore,
      type: question.type
    };
  });

  const generateWordDocument = async () => {
    if (!userName.trim()) {
      alert('Please enter your name before generating the report');
      return;
    }

    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header with logo and title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "QuizGenAI - Quiz Result Report",
                bold: true,
                size: 32,
                color: "#4F46E5"
              })
            ]
          }),

          // Basic Info Table
          new Table({
            width: {
              size: 100,
              type: 'pct',
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Student Name:")],
                    width: {
                      size: 30,
                      type: 'pct',
                    },
                  }),
                  new TableCell({
                    children: [new Paragraph(userName)],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Date:")],
                  }),
                  new TableCell({
                    children: [new Paragraph(currentDate)],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Time:")],
                  }),
                  new TableCell({
                    children: [new Paragraph(currentTime)],
                  }),
                ],
              }),
            ],
          }),

          // Score Summary
          new Paragraph({
            text: "\nScore Summary",
            heading: 'Heading1',
            bold: true,
            spacing: {
              after: 200,
            },
          }),

          new Table({
            width: {
              size: 100,
              type: 'pct',
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Total Score:")],
                  }),
                  new TableCell({
                    children: [new Paragraph(`${totalScore.toFixed(2)} / ${quizData.length}`)],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Correct Answers:")],
                  }),
                  new TableCell({
                    children: [new Paragraph(`${correctQuestions}`)],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph("Incorrect Answers:")],
                  }),
                  new TableCell({
                    children: [new Paragraph(`${incorrectQuestions}`)],
                  }),
                ],
              }),
            ],
          }),

          // Detailed Question Analysis
          new Paragraph({
            text: "\nDetailed Question Analysis",
            heading: 'Heading1',
            bold: true,
            spacing: {
              before: 400,
              after: 200,
            },
          }),

          ...questionResults.map((result, index) => 
            new Table({
              width: {
                size: 100,
                type: 'pct',
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "#707070" },    // Fixed hex code
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "#707070" }, // Fixed hex code
                left: { style: BorderStyle.SINGLE, size: 1, color: "#707070" },   // Fixed hex code
                right: { style: BorderStyle.SINGLE, size: 1, color: "#707070" },  // Fixed hex code
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({
                          text: `Question ${index + 1}: ${result.question}`,
                          bold: true,
                        }),
                        new Paragraph(`Type: ${result.type}`),
                        new Paragraph(`Your Answer: ${result.userAnswer}`),
                        new Paragraph(`Correct Answer: ${result.correctAnswer}`),
                        new Paragraph(`Score: ${result.score.toFixed(2)} / 1`),
                        new Paragraph({
                          text: result.isCorrect ? "Status: Correct" : "Status: Incorrect",
                          color: result.isCorrect ? "#10B981" : "#EF4444",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            })
          ),
        ],
      }],
    });

    // Generate and download the document
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Quiz_Result_${userName}_${currentDate}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  // Data for pie chart
  const pieData = [
    { name: 'Correct', value: correctQuestions, color: '#10B981' },
    { name: 'Incorrect', value: incorrectQuestions, color: '#EF4444' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Quiz Results
      </h1>

      {/* Summary Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Your Score</h2>
            <p className="text-4xl font-bold text-blue-600">
              {totalScore.toFixed(2)} / {quizData.length}
            </p>
            <p className="text-gray-600 mt-2">
              Correct: {correctQuestions} | Incorrect: {incorrectQuestions}
            </p>
          </div>
          <div className="w-48 h-48">
            <PieChart width={200} height={200}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      {/* Question-wise Feedback */}
      <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Question-wise Breakdown</h2>
        {questionResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 mb-4 rounded-lg border-l-4 ${
              result.isCorrect
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
            }`}
          >
            <h3 className="font-semibold text-gray-800">
              {index + 1}. {result.question} ({result.type})
            </h3>
            <p className="text-gray-700 mt-1">
              <span className="font-medium">Your Answer:</span> {result.userAnswer}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Correct Answer:</span> {result.correctAnswer}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Score:</span> {result.score.toFixed(2)} / 1
            </p>
            <p className={`mt-1 font-medium ${
              result.isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {result.isCorrect ? 'Correct' : 'Incorrect'}
            </p>
          </div>
        ))}
      </div>

      {/* Name Input and Export Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Generate Report</h3>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={generateWordDocument}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Back to Home Button */}
      <div className="text-center mt-6">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default QuizResult;