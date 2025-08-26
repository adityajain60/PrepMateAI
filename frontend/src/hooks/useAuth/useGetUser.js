import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";

const useGetUser = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const getUser = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // important if using cookies for auth
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      localStorage.setItem("user", JSON.stringify(data));
      setAuthUser(data);
    } catch (error) {
      toast.error(error.message);
      setAuthUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  return { loading, getUser };
};

export default useGetUser;