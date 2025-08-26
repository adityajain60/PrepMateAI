import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import useLogout from "../hooks/useAuth/useLogout";

// --- SVG Icons ---
const FileTextIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
);
const MessageSquareIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
);
const LogOutIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

const Navbar = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const { loading, logout } = useLogout();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const NavLink = ({ to, children, disabled = false, title = "" }) => {
    const handleClick = (e) => {
      if (disabled) {
        e.preventDefault();
        toast.error("Please login to view history.");
      }
    };

    return (
      <Link
        to={disabled ? "#" : to}
        onClick={handleClick}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-300 transition-all ${
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-700 hover:text-white'
        }`}
        title={disabled ? title : ""}
      >
        {children}
      </Link>
    );
  };

  const ActionButton = ({ onClick, children, className = "" }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-md shadow-sm transition-all ${className}`}
    >
      {children}
    </button>
  );

  return (
    <header className="bg-slate-900 border-b border-slate-700 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-white transition-colors">
            PrepMate.AI
          </Link>

          <div className="flex items-center space-x-2">
            <NavLink to="/resume-history" disabled={!authUser} title="Login to view history">
              <FileTextIcon className="w-4 h-4" />
              <span>Resume History</span>
            </NavLink>
            <NavLink to="/interview-history" disabled={!authUser} title="Login to view history">
              <MessageSquareIcon className="w-4 h-4" />
              <span>Interview History</span>
            </NavLink>
            {authUser && (
              <ActionButton
                onClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <LogOutIcon className="w-4 h-4" />
                <span>Logout</span>
              </ActionButton>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
