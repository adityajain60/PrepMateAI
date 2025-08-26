import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";


const useSignup = () => {
  const [loading, setloading] = useState(false);

  const { setAuthUser } = useAuthContext();

  const signup = async ({
    name,
    email,
    password,
  }) => {
    const success = handleInputErrors({
      name,
      email,
      password,
    });
    if (!success) return;

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

        localStorage.setItem("user", JSON.stringify(data));
        setAuthUser(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setloading(false);
    }
  };

  return { loading, signup };
};

export default useSignup;

const handleInputErrors = ({
  name,
  email,
  password,
}) => {
  if (!name || !email || !password) {
    toast.error("Please fill in all fields");
    return false;
  }
  if (password.length < 6) {
    toast.error("Password must be atleast 6 characters long");
    return false;
  }
  return true;
};
