import React, { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const useLogout = () => {
  const [loading, setloading] = useState(false);
  const { setAuthUser } = useAuthContext();

  
  const logout = async () => {
    setloading(true);

    // Send POST request to backend
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // On successful logout, clear user data from localStorage and context
      localStorage.removeItem("user");
      setAuthUser(null);
      
    } catch (error) {
      toast.error(error.message);
    } finally {
      setloading(false);
    }
  };

  return { loading, logout };
};

export default useLogout;
