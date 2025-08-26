import React from 'react';

const FeedbackPanel = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Feedback</h3>

      {/* Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-700">Score:</span>
          <div className="text-3xl font-bold text-indigo-600">
            {data.score_out_of_10}/10
          </div>
        </div>
      </div>

      {/* Overall Feedback */}
      {data.overall_feedback && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-2">Overall Feedback</h4>
          <p className="text-gray-600 leading-relaxed">{data.overall_feedback}</p>
        </div>
      )}

      {/* Strengths */}
      {data.strengths?.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
          <ul className="space-y-1">
            {data.strengths.map((item, i) => (
              <li key={i} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas to Improve */}
      {data.areas_to_improve?.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-orange-700 mb-2">Areas to Improve</h4>
          <ul className="space-y-1">
            {data.areas_to_improve.map((item, i) => (
              <li key={i} className="flex items-start">
                <span className="text-orange-500 mr-2">⚠</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvement Suggestions */}
      {data.improvement_suggestions?.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-blue-700 mb-2">Improvement Suggestions</h4>
          <ul className="space-y-1">
            {data.improvement_suggestions.map((item, i) => (
              <li key={i} className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-up Questions */}
      {data.follow_up_questions?.length > 0 && (
        <div>
          <h4 className="font-medium text-purple-700 mb-2">Follow-up Questions</h4>
          <ul className="space-y-1">
            {data.follow_up_questions.map((item, i) => (
              <li key={i} className="flex items-start">
                <span className="text-purple-500 mr-2">?</span>
                <span className="text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
