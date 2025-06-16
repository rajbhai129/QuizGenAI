import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Dashboard = ({ quizHistory }) => {
  const performanceData = quizHistory.map(quiz => ({
    date: new Date(quiz.date).toLocaleDateString(),
    score: (quiz.score / quiz.totalQuestions) * 100
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Performance Over Time</h2>
      <div className="w-full h-64">
        <LineChart width={800} height={250} data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#8884d8" />
        </LineChart>
      </div>
    </div>
  );
};

export default Dashboard;