import { useState } from "react";
import toast from "react-hot-toast";

const useGetIdealAnswer = () => {
  const [loading, setLoading] = useState(false);
  const [idealAnswer, setIdealAnswer] = useState(null);

  const getIdealAnswer = async ({ resumeText, jobDescription, question }) => {
    setLoading(true);
    try {
      // Send POST request to backend 
      const res = await fetch("/api/interview/ideal-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important for cookie-based auth
        body: JSON.stringify({ resumeText, jobDescription, question }),
      });


      
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setIdealAnswer(data);
    } catch (error) {
      toast.error(error.message);
      setIdealAnswer(null);
    } finally {
      setLoading(false);
    }
  };

  return { loading, idealAnswer, getIdealAnswer };
};

export default useGetIdealAnswer;