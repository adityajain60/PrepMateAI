// src/pages/ResumeHistory.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import useGetResumeHistory from "../../hooks/useResume/useGetResumeHistory";
import ResumeHistoryCard from "../../components/history/ResumeHistoryCard";

const ResumeHistory = () => {
  const { loading, history, getResumeHistory } = useGetResumeHistory();

  useEffect(() => {
    getResumeHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Resume Analysis History</h1>
          <Link to="/dashboard" className="text-indigo-600 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="text-center mt-10 text-gray-500">Loading...</div>
        ) : history.length === 0 ? (
          <div className="text-center bg-white p-10 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">No History Found</h2>
            <p className="text-gray-500 mt-2">You haven't analyzed any resumes yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((item) => (
              <ResumeHistoryCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeHistory;
