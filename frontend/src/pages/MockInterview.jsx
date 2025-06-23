import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const MockInterview = () => {
  const [questions, setQuestions] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [idealAnswer, setIdealAnswer] = useState(null);
  const [isGeneratingIdealAnswer, setIsGeneratingIdealAnswer] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Check if questions were passed from Dashboard
  React.useEffect(() => {
    if (location.state?.questions) {
      setQuestions(location.state.questions);
    }
  }, [location.state]);

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setIsSubmittingAnswer(true);
    setError('');

    try {
      const currentQuestion = questions.fullQuestions[currentQuestionIndex];
      const requestData = {
        resume_content: location.state?.resumeText || 'Resume content from file',
        jd_content: location.state?.jobDescriptionText || questions.jobDescription,
        question: currentQuestion.question,
        answer: userAnswer,
        interviewId: questions.interviewId
      };
      
      console.log('Sending answer feedback request:', requestData);
      
      const response = await api.post('/interview/feedback', requestData);
      setFeedback(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get feedback. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleGenerateIdealAnswer = async () => {
    setIsGeneratingIdealAnswer(true);
    setError('');

    try {
      const currentQuestion = questions.fullQuestions[currentQuestionIndex];
      const requestData = {
        resume_content: location.state?.resumeText || 'Resume content from file',
        jd_content: location.state?.jobDescriptionText || questions.jobDescription,
        question: currentQuestion.question
      };
      
      console.log('Sending ideal answer request:', requestData);
      
      const response = await api.post('/interview/ideal-answer', requestData);
      setIdealAnswer(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate ideal answer. Please try again.');
    } finally {
      setIsGeneratingIdealAnswer(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.fullQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setFeedback(null);
      setIdealAnswer(null);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      setFeedback(null);
      setIdealAnswer(null);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'behavioral': return 'bg-purple-100 text-purple-800';
      case 'dsa': return 'bg-orange-100 text-orange-800';
      case 'system design': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Mock Interview</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Dashboard
          </button>
        </div>

        {!questions ? (
          /* No Questions State */
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Interview Questions Available</h2>
            <p className="text-gray-600 mb-6">
              Please go back to the Dashboard and generate interview questions first.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          /* Interactive Interview Mode */
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Mock Interview</h2>
                  <p className="text-gray-600 mt-1">Question {currentQuestionIndex + 1} of {questions.fullQuestions.length}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round(((currentQuestionIndex + 1) / questions.fullQuestions.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.fullQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Question */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Question {currentQuestionIndex + 1}</h3>
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(questions.fullQuestions[currentQuestionIndex]?.question_difficulty)}`}>
                    {questions.fullQuestions[currentQuestionIndex]?.question_difficulty || 'Medium'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(questions.fullQuestions[currentQuestionIndex]?.question_type)}`}>
                    {questions.fullQuestions[currentQuestionIndex]?.question_type || 'Technical'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-gray-800 leading-relaxed text-lg">
                  {questions.fullQuestions[currentQuestionIndex]?.question}
                </p>
              </div>

              {/* Answer Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAnswerSubmit}
                  disabled={isSubmittingAnswer || !userAnswer.trim()}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingAnswer ? 'Getting Feedback...' : 'Submit Answer'}
                </button>
                <button
                  onClick={handleGenerateIdealAnswer}
                  disabled={isGeneratingIdealAnswer}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingIdealAnswer ? 'Generating...' : 'Show Ideal Answer'}
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feedback Section */}
            {feedback && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Feedback</h3>
                
                {/* Score */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-gray-700">Score:</span>
                    <div className="text-3xl font-bold text-indigo-600">{feedback.score_out_of_10}/10</div>
                  </div>
                </div>

                {/* Overall Feedback */}
                {feedback.overall_feedback && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Overall Feedback</h4>
                    <p className="text-gray-600 leading-relaxed">{feedback.overall_feedback}</p>
                  </div>
                )}

                {/* Strengths */}
                {feedback.strengths && feedback.strengths.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-green-700 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {feedback.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-700">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas to Improve */}
                {feedback.areas_to_improve && feedback.areas_to_improve.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-orange-700 mb-2">Areas to Improve</h4>
                    <ul className="space-y-1">
                      {feedback.areas_to_improve.map((area, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-orange-500 mr-2">⚠</span>
                          <span className="text-gray-700">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvement Suggestions */}
                {feedback.improvement_suggestions && feedback.improvement_suggestions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-blue-700 mb-2">Improvement Suggestions</h4>
                    <ul className="space-y-1">
                      {feedback.improvement_suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">→</span>
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow-up Questions */}
                {feedback.follow_up_questions && feedback.follow_up_questions.length > 0 && (
                  <div>
                    <h4 className="font-medium text-purple-700 mb-2">Follow-up Questions</h4>
                    <ul className="space-y-1">
                      {feedback.follow_up_questions.map((question, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-500 mr-2">?</span>
                          <span className="text-gray-700">{question}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Ideal Answer Section */}
            {idealAnswer && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Ideal Answer</h3>
                
                {idealAnswer.ideal_answer && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Suggested Answer</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {idealAnswer.ideal_answer}
                      </div>
                    </div>
                  </div>
                )}

                {idealAnswer.explanation && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Why This Answer Works</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="whitespace-pre-line text-gray-800 leading-relaxed">
                        {idealAnswer.explanation}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              <button
                onClick={nextQuestion}
                disabled={currentQuestionIndex === questions.fullQuestions.length - 1}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview; 