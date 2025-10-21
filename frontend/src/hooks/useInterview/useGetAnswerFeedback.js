import { useState } from "react";
import toast from "react-hot-toast";

const useGetAnswerFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const getAnswerFeedback = async ({ resumeText, jobDescription, question, answer }) => {
    setLoading(true);
    try {
      // Send POST request to backend
      const res = await fetch("/api/interview/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important for cookie-based auth
        body: JSON.stringify({ resumeText, jobDescription, question, answer }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setFeedback(data);
    } catch (error) {
      toast.error(error.message);
      setFeedback(null);
    } finally {
      setLoading(false);
    }
  };

  return { loading, feedback, getAnswerFeedback };
};

export default useGetAnswerFeedback;