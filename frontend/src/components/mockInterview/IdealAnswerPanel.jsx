import React from 'react';

const IdealAnswerPanel = ({ data }) => {
  if (!data) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Ideal Answer</h3>

      {/* Suggested Answer */}
      {data.ideal_answer && (
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-2">Suggested Answer</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="whitespace-pre-line text-gray-800 leading-relaxed">
              {data.ideal_answer}
            </div>
          </div>
        </div>
      )}

      {/* Explanation */}
      {data.explanation && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Why This Answer Works</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="whitespace-pre-line text-gray-800 leading-relaxed">
              {data.explanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdealAnswerPanel;
