import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.isAdmin) return;
      setLoading(true);
      try {
        const usersRes = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/users`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const usersData = await usersRes.json();
        if (!usersRes.ok) throw new Error(usersData.error || 'Failed to fetch users');
        setUsers(usersData);

        const quizzesRes = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/quizzes`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const quizzesData = await quizzesRes.json();
        if (!quizzesRes.ok) throw new Error(quizzesData.error || 'Failed to fetch quizzes');
        setQuizzes(quizzesData);
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (!user || !user.isAdmin) {
    return <div className="p-8 text-center text-red-600 font-bold text-xl">Access Denied: Admins Only</div>;
  }

  if (loading) return <div className="p-8 text-center">Loading admin data...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Admin Panel</h1>
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">All Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Username</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Admin</th>
                <th className="px-4 py-2 border">Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="text-center">
                  <td className="px-4 py-2 border">{u.username}</td>
                  <td className="px-4 py-2 border">{u.email}</td>
                  <td className="px-4 py-2 border">{u.isAdmin ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 border">{new Date(u.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">All Quizzes</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Quiz ID</th>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Creator</th>
                <th className="px-4 py-2 border">Created At</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(q => (
                <tr key={q._id} className="text-center">
                  <td className="px-4 py-2 border">{q.quizId}</td>
                  <td className="px-4 py-2 border">{q.title}</td>
                  <td className="px-4 py-2 border">{q.creator}</td>
                  <td className="px-4 py-2 border">{new Date(q.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 