import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const InterviewHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/interview/history');
        setHistory(response.data);
      } catch (err) {
        setError('Failed to fetch interview history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const Card = ({ item }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
        <h3 className="font-bold text-lg text-gray-800 mb-2">
            Interview for <span className="text-indigo-600">{item.jobRole}</span>
        </h3>
        <div className="mt-4">
            <h4 className="font-semibold text-gray-700">Generated Questions:</h4>
            <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
                {item.questions.map((q, index) => <li key={index}>{q}</li>)}
            </ul>
        </div>
        <p className="text-xs text-gray-400 text-right mt-4">
            Generated on: {new Date(item.createdAt).toLocaleDateString()}
        </p>
    </div>
  );

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Interview History</h1>
            <Link to="/dashboard" className="text-indigo-600 hover:underline">
                &larr; Back to Dashboard
            </Link>
        </div>
        {history.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">No History Found</h2>
            <p className="text-gray-500 mt-2">You haven't generated any interview questions yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((item) => <Card key={item._id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewHistory; 