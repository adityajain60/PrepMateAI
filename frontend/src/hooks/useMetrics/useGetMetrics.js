import { useState } from "react";
import toast from "react-hot-toast";

const useGetMetrics = () => {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const getMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/metrics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // in case metrics ever require auth
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setMetrics(data);
    } catch (error) {
      toast.error(error.message);
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  return { loading, metrics, getMetrics };
};

export default useGetMetrics;