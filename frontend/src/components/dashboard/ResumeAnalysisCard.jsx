import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import getResumeAnalysis from "../../hooks/useResume/useGetResumeAnalysis";

const ResumeAnalysisCard = ({ resumeFile, resumeText, jdFile, jdText }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getResumeAnalysis({
        resumeFile,
        resumeText,
        jdFile,
        jdText,
      });

      if (result) {
        navigate("/resume-analysis", { state: { analysis: result } });
      }
    } catch (err) {
      setError("Analysis failed. Please try again.");
      console.error("Analysis failed:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const hasResume = resumeFile || (resumeText && resumeText.trim());
  const hasJD = jdFile || (jdText && jdText.trim());
  const isEnabled = hasResume && hasJD;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-shadow w-full">
      <div className="p-6 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Resume Analysis</h2>
          <p className="text-sm text-gray-500">
            Get a relevance score and tailored suggestions based on a job description.
          </p>
        </div>

        {/* Input Status */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-800">Inputs</div>
          <div className="grid grid-cols-2 gap-4">
            <div className={`border px-3 py-2 rounded-lg text-sm font-medium ${hasResume ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
              Resume: {hasResume ? "Provided" : "Missing"}
            </div>
            <div className={`border px-3 py-2 rounded-lg text-sm font-medium ${hasJD ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
              Job Description: {hasJD ? "Provided" : "Missing"}
            </div>
          </div>
        </div>

        {/* Errors & Warnings */}
        {!isEnabled && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-2 rounded-lg">
            Please provide both resume and job description to start the analysis.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleClick}
          disabled={!isEnabled || loading}
          className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors ${
            isEnabled && !loading
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Analyzing..." : "Generate Analysis"}
        </button>
      </div>
    </div>
  );
};

export default ResumeAnalysisCard;
