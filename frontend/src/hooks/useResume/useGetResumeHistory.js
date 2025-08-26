import { useState } from "react";
import toast from "react-hot-toast";

const useGetResumeHistory = () => {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const getResumeHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resume/history", {
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

  return { loading, history, getResumeHistory };
};

export default useGetResumeHistory;