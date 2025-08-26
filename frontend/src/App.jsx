import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthContext } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";

// Pages
import Home from "./pages/home/Home";
import Login from "./pages/login/LoginPage";
import Signup from "./pages/signup/SignupPage";
import Dashboard from "./pages/dashboard/Dashboard";
import ResumeAnalysis from "./pages/resumeAnalysis/ResumeAnalysis";
import ResumeHistory from "./pages/resumeHistory/ResumeHistory";
import InterviewHistory from "./pages/interviewHistory/InterviewHistory";
import MockInterview from "./pages/mockInterview/MockInterview";

function App() {
  const { authUser } = useAuthContext();

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <Routes>
        {/* Always public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!authUser ? <Signup /> : <Navigate to="/dashboard" />} />

        {/* Protected */}
        <Route path="/dashboard" element={authUser ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/resume-analysis" element={authUser ? <ResumeAnalysis /> : <Navigate to="/login" />} />
        <Route path="/resume-history" element={authUser ? <ResumeHistory /> : <Navigate to="/login" />} />
        <Route path="/interview-history" element={authUser ? <InterviewHistory /> : <Navigate to="/login" />} />
        <Route path="/mock-interview" element={authUser ? <MockInterview /> : <Navigate to="/login" />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
}

export default App;
