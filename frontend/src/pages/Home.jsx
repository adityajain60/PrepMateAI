import React from 'react';
import { Link } from 'react-router-dom';
import PlatformMetrics from '../components/PlatformMetrics';

const Home = () => {
  const token = localStorage.getItem('token');

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center p-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Welcome to PrepMate.AI
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your personal AI-powered assistant for resume analysis and mock interviews.
          </p>
          <div className="space-x-4">
            {token ? (
              <Link 
                to="/dashboard"
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                >
                  Login
                </Link>
                <Link 
                  to="/signup"
                  className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
        
        {/* Platform Metrics */}
        <PlatformMetrics />
        
        {/* Features Section */}
        <div className="mt-16 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Features</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Smart Resume Analysis</h3>
              <p className="text-gray-600">Get instant, AI-driven feedback on your resume against any job description.</p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Personalized Mock Interviews</h3>
              <p className="text-gray-600">Practice with questions tailored to your resume and the job you're applying for.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 