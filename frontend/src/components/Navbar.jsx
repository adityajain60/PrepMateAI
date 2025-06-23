import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    // We can add a call to a /api/signout endpoint if we want server-side logic
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-gray-300">
          PrepMate.AI
        </Link>
        <div className="flex items-center space-x-4">
          {token && (
            <button 
              onClick={handleLogout} 
              className="px-3 py-2 rounded bg-indigo-600 hover:bg-indigo-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 