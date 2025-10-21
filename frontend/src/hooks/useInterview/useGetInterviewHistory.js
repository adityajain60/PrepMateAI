import { useState } from "react";
import toast from "react-hot-toast";

const useGetInterviewHistory = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const getInterviewHistory = async () => {
    setLoading(true);

    // Send GET request to backend to fetch interview history
    try {
      const res = await fetch("/api/interview/history", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important for cookie-based auth
      });


      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setHistory(data);
    } catch (error) {
      toast.error(error.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return { loading, history, getInterviewHistory };
};

export default useGetInterviewHistory;