import React from "react";
import { Link } from "react-router-dom";
import PlatformMetrics from "../../components/home/PlatformMetrics";
import { useAuthContext } from "../../context/AuthContext";

const Home = () => {
  const { authUser } = useAuthContext();

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ---------------- HERO SECTION ---------------- */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to PrepMate.AI
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your AI-powered assistant for smarter resume reviews and personalized mock interviews.
          </p>

          {authUser ? (
            <Link
              to="/dashboard"
              className="inline-block px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex justify-center gap-4">
              <Link
                to="/login"
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow hover:bg-gray-800 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </section>

        {/* ---------------- METRICS ---------------- */}
        <PlatformMetrics />

        {/* ---------------- FEATURES ---------------- */}
        <section className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">
            Features
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              title="Smart Resume Analysis"
              description="Get instant, AI-driven feedback on your resume tailored to any job description."
            />
            <FeatureCard
              title="Personalized Mock Interviews"
              description="Practice with questions generated specifically for your resume and job role."
            />
          </div>
        </section>
      </div>
    </div>
  );
};

const FeatureCard = ({ title, description }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default Home;
