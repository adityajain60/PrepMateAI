import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuestionPanel from "../../components/mockInterview/QuestionPanel";
import FeedbackPanel from "../../components/mockInterview/FeedbackPanel";
import IdealAnswerPanel from "../../components/mockInterview/IdealAnswerPanel";
import ActionButtons from "../../components/mockInterview/ActionButtons";
import ProgressHeader from "../../components/mockInterview/ProgressHeader";
import useGetAnswerFeedback from "../../hooks/useInterview/useGetAnswerFeedback";
import useGetIdealAnswer from "../../hooks/useInterview/useGetIdealAnswer";

const MockInterview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState("");

  const { loading: feedbackLoading, feedback, getAnswerFeedback } = useGetAnswerFeedback();
  const { loading: idealLoading, idealAnswer, getIdealAnswer } = useGetIdealAnswer();

  const total = questions?.fullQuestions?.length || 0;
  const question = questions?.fullQuestions?.[currentIndex];

  useEffect(() => {
    if (!location.state?.questions) return;
    setQuestions(location.state.questions);
  }, [location.state]);

  if (!questions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Interview Questions</h2>
          <p className="text-gray-600 mb-6">Please go back and generate questions from dashboard.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleFeedback = async () => {
    if (!userAnswer.trim()) {
      setError("Please enter your answer.");
      return;
    }
    setError("");
    await getAnswerFeedback({
      resumeText: location.state?.resumeText || "",
      jobDescription: location.state?.jobDescriptionText || questions.jobDescription,
      question: question.question,
      answer: userAnswer,
    });
  };

  const handleIdeal = async () => {
    await getIdealAnswer({
      resumeText: location.state?.resumeText || "",
      jobDescription: location.state?.jobDescriptionText || questions.jobDescription,
      question: question.question,
    });
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setError("");
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setUserAnswer("");
      setError("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 max-w-6xl mx-auto">
      <ProgressHeader index={currentIndex} total={total} />

      <QuestionPanel
        question={question}
        answer={userAnswer}
        onAnswerChange={setUserAnswer}
        onPrev={handlePrev}
        onNext={handleNext}
        atStart={currentIndex === 0}
        atEnd={currentIndex === total - 1}
        index={currentIndex}
        total={total}
      />

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6 text-sm">{error}</div>
      )}

      <ActionButtons
        onSubmit={handleFeedback}
        onIdeal={handleIdeal}
        submitting={feedbackLoading}
        generating={idealLoading}
        hasAnswer={!!userAnswer.trim()}
      />

      <FeedbackPanel data={feedback} />
      <IdealAnswerPanel data={idealAnswer} />
    </div>
  );
};

export default MockInterview;
