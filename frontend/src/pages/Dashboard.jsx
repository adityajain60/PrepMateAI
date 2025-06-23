import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PlatformMetrics from '../components/PlatformMetrics';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Interview configuration
  const [interviewConfig, setInterviewConfig] = useState({
    questionDifficulty: 'Any',
    questionType: ['Technical'],
    experienceLevel: '1-2 years',
    roundType: 'Technical',
    targetJobRole: 'Software Engineer',
    skillFocus: 'Python, SQL',
    numQuestions: 5
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get('/user/me');
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user', error);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleResumeFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
      setResumeText(''); // Clear text input when file is selected
      setError('');
    } else {
      setError('Please upload a PDF file for resume.');
      setResumeFile(null);
    }
  };

  const handleJobDescriptionFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setJobDescriptionFile(file);
      setJobDescriptionText(''); // Clear text input when file is selected
      setError('');
    } else {
      setError('Please upload a PDF file for job description.');
      setJobDescriptionFile(null);
    }
  };

  const handleResumeAnalysis = async () => {
    if ((!resumeFile && !resumeText.trim()) || (!jobDescriptionFile && !jobDescriptionText.trim())) {
      setError('Please provide both resume and job description (file or text).');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    const formData = new FormData();
    if (resumeFile) {
      formData.append('resume', resumeFile);
    } else {
      formData.append('resumeText', resumeText);
    }
    
    if (jobDescriptionFile) {
      formData.append('jobDescriptionFile', jobDescriptionFile);
    } else {
      formData.append('jobDescription', jobDescriptionText);
    }

    try {
      const response = await api.post('/resume/analyze', formData, {
        headers: {
          'Content-Type': resumeFile || jobDescriptionFile ? 'multipart/form-data' : 'application/json',
        },
      });
      // Navigate directly to resume analysis page with the results
      navigate('/resume-analysis', { 
        state: { 
          resumeFile, 
          resumeText, 
          jobDescriptionFile, 
          jobDescriptionText,
          analysis: response.data 
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if ((!resumeFile && !resumeText.trim()) || (!jobDescriptionFile && !jobDescriptionText.trim())) {
      setError('Please provide both resume and job description (file or text).');
      return;
    }

    if (interviewConfig.questionType.length === 0) {
      setError('Please select at least one question type.');
      return;
    }

    setIsGeneratingQuestions(true);
    setError('');

    const formData = new FormData();
    if (resumeFile) {
      formData.append('resume', resumeFile);
    } else {
      formData.append('resumeText', resumeText);
    }
    
    if (jobDescriptionFile) {
      formData.append('jobDescriptionFile', jobDescriptionFile);
    } else {
      formData.append('jobDescription', jobDescriptionText);
    }
    
    // Add interview configuration
    Object.keys(interviewConfig).forEach(key => {
      if (key === 'questionType') {
        // Handle array for question type
        interviewConfig[key].forEach(type => {
          formData.append('questionType', type);
        });
      } else {
        formData.append(key, interviewConfig[key]);
      }
    });

    try {
      const response = await api.post('/interview/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Navigate directly to mock interview page with the questions
      navigate('/mock-interview', { 
        state: { 
          questions: response.data,
          resumeFile,
          resumeText,
          jobDescriptionFile,
          jobDescriptionText
        } 
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate questions. Please try again.');
      setIsGeneratingQuestions(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!question || ((!resumeFile && !resumeText.trim()) || (!jobDescriptionFile && !jobDescriptionText.trim()))) {
      setError('Please provide a question and both resume and job description (file or text).');
      return;
    }

    setIsAskingQuestion(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('question', question);
      
      if (resumeFile) {
        formData.append('resume', resumeFile);
      } else {
        formData.append('resumeText', resumeText);
      }
      
      if (jobDescriptionFile) {
        formData.append('jobDescriptionFile', jobDescriptionFile);
      } else {
        formData.append('jobDescription', jobDescriptionText);
      }
      
      const response = await api.post('/interview/ask', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnswer(response.data.answer);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to ask question. Please try again.');
    } finally {
      setIsAskingQuestion(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome, <span className="font-semibold text-indigo-600">{user.name}</span>!</p>
      </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/resume-history')}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Resume History
            </button>
            <button 
              onClick={() => navigate('/interview-history')}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Interview History
            </button>
            </div>
        </header>

        {/* Platform Metrics */}
        {/* <PlatformMetrics /> */}

        {/* Main Content */}
        <main className="space-y-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Submit Resume & Job Description</h2>
            <p className="text-gray-600 mb-6">
              Upload your resume and job description (PDF files or paste text) to get started.
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
            </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Resume Input */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Resume</h3>
                
                {/* File Upload Option */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload PDF Resume
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeFileChange}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="cursor-pointer text-indigo-600 hover:text-indigo-500"
                    >
                      {resumeFile ? (
                        <div>
                          <p className="text-green-600 font-medium">✓ {resumeFile.name}</p>
                          <p className="text-sm text-gray-500">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg">Click to upload PDF</p>
                          <p className="text-sm text-gray-500">or drag and drop</p>
                        </div>
                      )}
                    </label>
                  </div>
            </div>
            
                {/* Text Input Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Paste Resume Text
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      setResumeFile(null); // Clear file when text is entered
                    }}
                    placeholder="Paste your resume text here..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
          </div>
        </div>

              {/* Job Description Input */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Job Description</h3>
                
                {/* File Upload Option */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload PDF Job Description
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleJobDescriptionFileChange}
                      className="hidden"
                      id="jd-upload"
                    />
                    <label
                      htmlFor="jd-upload"
                      className="cursor-pointer text-indigo-600 hover:text-indigo-500"
                    >
                      {jobDescriptionFile ? (
                        <div>
                          <p className="text-green-600 font-medium">✓ {jobDescriptionFile.name}</p>
                          <p className="text-sm text-gray-500">Click to change file</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg">Click to upload PDF</p>
                          <p className="text-sm text-gray-500">or drag and drop</p>
                  </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Text Input Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Paste Job Description Text
                  </label>
                  <textarea
                    value={jobDescriptionText}
                    onChange={(e) => {
                      setJobDescriptionText(e.target.value);
                      setJobDescriptionFile(null); // Clear file when text is entered
                    }}
                    placeholder="Paste the job description here..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
            </div>
            </div>
        </div>

          {/* Resume Analysis Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Resume Analysis</h2>
            <p className="text-gray-600 mb-6">
              Get instant, AI-driven feedback on your resume against the job description.
            </p>
            
            <button
              onClick={handleResumeAnalysis}
              disabled={isAnalyzing || (!resumeFile && !resumeText.trim()) || (!jobDescriptionFile && !jobDescriptionText.trim())}
              className="w-full px-6 py-3 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>

          {/* Mock Interview Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mock Interview</h2>
            <p className="text-gray-600 mb-6">
              Generate personalized interview questions and practice with AI feedback.
            </p>

            {/* Interview Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Difficulty
                </label>
                <select
                  value={interviewConfig.questionDifficulty}
                  onChange={(e) => setInterviewConfig({...interviewConfig, questionDifficulty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Any">Any</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Type (Select Multiple)
                </label>
                <div className="space-y-2">
                  {['Technical', 'Behavioral', 'DSA', 'System Design', 'Resume'].map((type) => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={interviewConfig.questionType.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setInterviewConfig({
                              ...interviewConfig,
                              questionType: [...interviewConfig.questionType, type]
                            });
                          } else {
                            setInterviewConfig({
                              ...interviewConfig,
                              questionType: interviewConfig.questionType.filter(t => t !== type)
                            });
                          }
                        }}
                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={interviewConfig.experienceLevel}
                  onChange={(e) => setInterviewConfig({...interviewConfig, experienceLevel: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Fresher">Fresher</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Round Type
                </label>
                <select
                  value={interviewConfig.roundType}
                  onChange={(e) => setInterviewConfig({...interviewConfig, roundType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Technical">Technical</option>
                  <option value="HR">HR</option>
                  <option value="Managerial">Managerial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Job Role
                </label>
                <input
                  type="text"
                  value={interviewConfig.targetJobRole}
                  onChange={(e) => setInterviewConfig({...interviewConfig, targetJobRole: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Focus
                </label>
                <input
                  type="text"
                  value={interviewConfig.skillFocus}
                  onChange={(e) => setInterviewConfig({...interviewConfig, skillFocus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Python, SQL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={interviewConfig.numQuestions}
                  onChange={(e) => setInterviewConfig({...interviewConfig, numQuestions: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateQuestions}
              disabled={isGeneratingQuestions || (!resumeFile && !resumeText.trim()) || (!jobDescriptionFile && !jobDescriptionText.trim())}
              className="w-full px-6 py-3 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingQuestions ? 'Generating Questions...' : 'Generate Questions'}
            </button>
          </div>

          {/* Q&A Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Ask Questions (RAG Demo)</h3>
            <p className="text-gray-600 mb-4">Ask specific questions about your resume and job description using our RAG system.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Question
                </label>
                <input
                  type="text"
                  placeholder="e.g., What are my strongest skills for this role?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
              </div>
              
              <button
                onClick={handleAskQuestion}
                disabled={!question || ((!resumeFile && !resumeText.trim()) || (!jobDescriptionFile && !jobDescriptionText.trim())) || isAskingQuestion}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isAskingQuestion ? 'Asking Question...' : 'Ask Question'}
              </button>
              
              {answer && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-semibold text-gray-800 mb-2">Answer:</h4>
                  <p className="text-gray-700">{answer}</p>
                </div>
              )}
          </div>
        </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard; 