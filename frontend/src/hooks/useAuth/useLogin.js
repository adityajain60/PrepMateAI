import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";


function handleInputErrors(email, password) {
  if (!email || !password) {
    toast.error("Please fill in all fields");
    return false;
  }
  return true;
}

const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const login = async (email, password) => {
    // Validate input
    const success = handleInputErrors(email, password);
    if (!success) return;

    setLoading(true);
    
    // Send POST request to backend
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // JSON response from backend contains user info or error message
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
        // ok
      // On successful login, save user data to localStorage
      localStorage.setItem("user", JSON.stringify(data));

      // Update auth context with user data
      setAuthUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { loading, login };
};
export default useLogin;


