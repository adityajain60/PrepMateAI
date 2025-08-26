import React from 'react';

const QuestionPanel = ({
  question,
  answer,
  onAnswerChange,
  onPrev,
  onNext,
  atStart,
  atEnd,
  index,
  total
}) => {
  const getColor = (val, map) => map[val?.toLowerCase()] || "bg-gray-100 text-gray-800";

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Header: Title and Tags */}
      <div className="flex justify-between mb-2">
        <h3 className="text-xl font-semibold text-gray-800">Question</h3>
        <div className="flex space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColor(question.question_difficulty, {
            easy: "bg-green-100 text-green-800",
            medium: "bg-yellow-100 text-yellow-800",
            hard: "bg-red-100 text-red-800",
          })}`}>
            {question.question_difficulty || "Medium"}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getColor(question.question_type, {
            technical: "bg-blue-100 text-blue-800",
            behavioral: "bg-purple-100 text-purple-800",
            dsa: "bg-orange-100 text-orange-800",
            "system design": "bg-indigo-100 text-indigo-800",
          })}`}>
            {question.question_type || "Technical"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.round(((index + 1) / total) * 100)}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-gray-800 leading-relaxed text-lg">
          {question.question}
        </p>
      </div>

      {/* Answer Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Answer
        </label>
        <textarea
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Action Buttons Placeholder */}
      <div className="flex space-x-4 mb-6">
        {/* <SubmitAnswerButton /> */}
        {/* <GenerateIdealAnswerButton /> */}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={atStart}
          className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={atEnd}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default QuestionPanel;
