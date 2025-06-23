import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const ResumeHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/resume/history');
        setHistory(response.data);
      } catch (err) {
        setError('Failed to fetch resume history.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);
  
  const Card = ({ item }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-800">Analysis Summary</h3>
        <span className="text-sm font-semibold text-white bg-indigo-500 px-3 py-1 rounded-full">
          Score: {item.matchScore}%
        </span>
      </div>
      <p className="text-gray-600 mb-4">{item.analysisSummary}</p>
      <p className="text-xs text-gray-400 text-right">
        Analyzed on: {new Date(item.createdAt).toLocaleDateString()}
      </p>
    </div>
  );

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Resume Analysis History</h1>
            <Link to="/dashboard" className="text-indigo-600 hover:underline">
                &larr; Back to Dashboard
            </Link>
        </div>
        {history.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">No History Found</h2>
            <p className="text-gray-500 mt-2">You haven't analyzed any resumes yet.</p>
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

export default ResumeHistory; 