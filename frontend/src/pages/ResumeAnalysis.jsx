import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const ResumeAnalysis = () => {
  const [user, setUser] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [jobDescriptionFile, setJobDescriptionFile] = useState(null);
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

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

    // Check if data was passed from Dashboard
    if (location.state) {
      if (location.state.resumeFile) setResumeFile(location.state.resumeFile);
      if (location.state.resumeText) setResumeText(location.state.resumeText);
      if (location.state.jobDescriptionFile) setJobDescriptionFile(location.state.jobDescriptionFile);
      if (location.state.jobDescriptionText) setJobDescriptionText(location.state.jobDescriptionText);
      if (location.state.analysis) setAnalysis(location.state.analysis);
    }
  }, [navigate, location.state]);

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
      setAnalysis(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
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
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Resume Analysis</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            ← Back to Dashboard
          </button>
        </header>

        {!analysis ? (
          /* Input Form */
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Analyze Your Resume</h2>
            <p className="text-gray-600 mb-6">
              Upload your resume and job description (PDF files or paste text) to get detailed AI-driven feedback.
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

            {/* Submit Button */}
            <div className="mt-8">
              <button
                onClick={handleResumeAnalysis}
                disabled={isAnalyzing || (!resumeFile && !resumeText.trim()) || (!jobDescriptionFile && !jobDescriptionText.trim())}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Analysis Results</h2>
                <div className="text-right">
                  <div className="text-3xl font-bold text-indigo-600">{analysis.matchScore}%</div>
                  <div className="text-sm text-gray-500">Match Score</div>
                </div>
              </div>
              
              {/* ATS Score Breakdown */}
              {analysis.fullAnalysis?.ats_score && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{analysis.fullAnalysis.ats_score.skills_match}</div>
                    <div className="text-xs text-gray-500">Skills Match</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{analysis.fullAnalysis.ats_score.keyword_match}</div>
                    <div className="text-xs text-gray-500">Keyword Match</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600">{analysis.fullAnalysis.ats_score.format_penalty}</div>
                    <div className="text-xs text-gray-500">Format Penalty</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{analysis.fullAnalysis.ats_score.total_score}</div>
                    <div className="text-xs text-gray-500">Total Score</div>
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Summary</h3>
              <div className="space-y-4">
                {analysis.fullAnalysis?.resume_summary && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Resume Summary</h4>
                    <p className="text-gray-600 leading-relaxed">{analysis.fullAnalysis.resume_summary}</p>
                  </div>
                )}
                {analysis.fullAnalysis?.jd_summary && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Job Description Summary</h4>
                    <p className="text-gray-600 leading-relaxed">{analysis.fullAnalysis.jd_summary}</p>
                  </div>
                )}
                {analysis.fullAnalysis?.ats_score?.final_assessment && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Final Assessment</h4>
                    <p className="text-gray-600 leading-relaxed">{analysis.fullAnalysis.ats_score.final_assessment}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Resume Sections */}
            {analysis.fullAnalysis?.sections && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Resume Sections</h3>
                
                {/* Basic Info */}
                {analysis.fullAnalysis.sections.basic_info && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div><span className="font-medium">Name:</span> {analysis.fullAnalysis.sections.basic_info.name || 'Not provided'}</div>
                      <div><span className="font-medium">Email:</span> {analysis.fullAnalysis.sections.basic_info.email || 'Not provided'}</div>
                      <div><span className="font-medium">Phone:</span> {analysis.fullAnalysis.sections.basic_info.phone || 'Not provided'}</div>
                    </div>
                  </div>
                )}

                {/* Education */}
                {analysis.fullAnalysis.sections.education && analysis.fullAnalysis.sections.education.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Education</h4>
                    <div className="space-y-3">
                      {analysis.fullAnalysis.sections.education.map((edu, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <div className="font-medium">{edu.degree}</div>
                          <div className="text-sm text-gray-600">{edu.institute}</div>
                          <div className="text-sm text-gray-500">{edu.years} {edu.cgpa && `• CGPA: ${edu.cgpa}`}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {analysis.fullAnalysis.sections.work_experience && analysis.fullAnalysis.sections.work_experience.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Work Experience</h4>
                    <div className="space-y-3">
                      {analysis.fullAnalysis.sections.work_experience.map((work, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4">
                          <div className="font-medium">{work.title}</div>
                          <div className="text-sm text-gray-600">{work.company}</div>
                          <div className="text-sm text-gray-500">{work.duration}</div>
                          {work.tech_stack && work.tech_stack.length > 0 && (
                            <div className="text-sm text-gray-500">Tech: {work.tech_stack.join(', ')}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects */}
                {analysis.fullAnalysis.sections.projects && analysis.fullAnalysis.sections.projects.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Projects</h4>
                    <div className="space-y-3">
                      {analysis.fullAnalysis.sections.projects.map((project, index) => (
                        <div key={index} className="border-l-4 border-purple-500 pl-4">
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-gray-600 mb-1">{project.description}</div>
                          {project.tech_stack && project.tech_stack.length > 0 && (
                            <div className="text-sm text-gray-500 mb-1">Tech: {project.tech_stack.join(', ')}</div>
                          )}
                          {project.impact && (
                            <div className="text-sm text-gray-500">Impact: {project.impact}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {analysis.fullAnalysis.sections.skills && analysis.fullAnalysis.sections.skills.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.fullAnalysis.sections.skills.map((skill, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {analysis.fullAnalysis.sections.certifications && analysis.fullAnalysis.sections.certifications.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Certifications</h4>
                    <ul className="space-y-1">
                      {analysis.fullAnalysis.sections.certifications.map((cert, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {cert}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Strengths */}
            {analysis.fullAnalysis?.strengths && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Strengths</h3>
                <div className="space-y-4">
                  {analysis.fullAnalysis.strengths.technical && analysis.fullAnalysis.strengths.technical.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Technical Strengths</h4>
                      <ul className="space-y-1">
                        {analysis.fullAnalysis.strengths.technical.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.fullAnalysis.strengths.resume_quality && analysis.fullAnalysis.strengths.resume_quality.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Resume Quality</h4>
                      <ul className="space-y-1">
                        {analysis.fullAnalysis.strengths.resume_quality.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.fullAnalysis.strengths.alignment_with_jd && analysis.fullAnalysis.strengths.alignment_with_jd.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Alignment with Job Description</h4>
                      <ul className="space-y-1">
                        {analysis.fullAnalysis.strengths.alignment_with_jd.map((strength, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            <span className="text-gray-700">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Weaknesses */}
            {analysis.fullAnalysis?.weaknesses && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Areas for Improvement</h3>
                <div className="space-y-4">
                  {analysis.fullAnalysis.weaknesses.missing_skills && analysis.fullAnalysis.weaknesses.missing_skills.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Missing Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.fullAnalysis.weaknesses.missing_skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.fullAnalysis.weaknesses.content_gaps && analysis.fullAnalysis.weaknesses.content_gaps.length > 0 && (
                    <div>
                      <h4 className="font-medium text-orange-700 mb-2">Content Gaps</h4>
                      <ul className="space-y-1">
                        {analysis.fullAnalysis.weaknesses.content_gaps.map((gap, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-orange-500 mr-2">⚠</span>
                            <span className="text-gray-700">{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.fullAnalysis.weaknesses.format_issues && (
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">Format Issues</h4>
                      <div className="space-y-2">
                        {analysis.fullAnalysis.weaknesses.format_issues.layout && analysis.fullAnalysis.weaknesses.format_issues.layout.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-600">Layout Issues</h5>
                            <ul className="space-y-1">
                              {analysis.fullAnalysis.weaknesses.format_issues.layout.map((issue, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-yellow-500 mr-2">⚠</span>
                                  <span className="text-gray-700">{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.fullAnalysis.weaknesses.format_issues.technical && analysis.fullAnalysis.weaknesses.format_issues.technical.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-600">Technical Issues</h5>
                            <ul className="space-y-1">
                              {analysis.fullAnalysis.weaknesses.format_issues.technical.map((issue, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-yellow-500 mr-2">⚠</span>
                                  <span className="text-gray-700">{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.fullAnalysis?.suggestions && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Suggestions for Improvement</h3>
                <div className="space-y-4">
                  {analysis.fullAnalysis.suggestions.formatting && (
                    <div>
                      <h4 className="font-medium text-blue-700 mb-2">Formatting Suggestions</h4>
                      <div className="space-y-2">
                        {analysis.fullAnalysis.suggestions.formatting.high_priority && analysis.fullAnalysis.suggestions.formatting.high_priority.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-600">High Priority</h5>
                            <ul className="space-y-1">
                              {analysis.fullAnalysis.suggestions.formatting.high_priority.map((suggestion, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-red-500 mr-2">→</span>
                                  <span className="text-gray-700">{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {analysis.fullAnalysis.suggestions.formatting.low_priority && analysis.fullAnalysis.suggestions.formatting.low_priority.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-600">Low Priority</h5>
                            <ul className="space-y-1">
                              {analysis.fullAnalysis.suggestions.formatting.low_priority.map((suggestion, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-500 mr-2">→</span>
                                  <span className="text-gray-700">{suggestion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {analysis.fullAnalysis.suggestions.content_improvements && analysis.fullAnalysis.suggestions.content_improvements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-700 mb-2">Content Improvements</h4>
                      <ul className="space-y-1">
                        {analysis.fullAnalysis.suggestions.content_improvements.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">→</span>
                            <span className="text-gray-700">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.fullAnalysis.suggestions.rewrite_examples && analysis.fullAnalysis.suggestions.rewrite_examples.length > 0 && (
                    <div>
                      <h4 className="font-medium text-purple-700 mb-2">Rewrite Examples</h4>
                      <div className="space-y-3">
                        {analysis.fullAnalysis.suggestions.rewrite_examples.map((example, index) => (
                          <div key={index} className="border-l-4 border-purple-500 pl-4">
                            <div className="text-sm font-medium text-gray-600 mb-1">Current:</div>
                            <div className="text-gray-700 mb-2 italic">"{example.current}"</div>
                            <div className="text-sm font-medium text-gray-600 mb-1">Suggested:</div>
                            <div className="text-gray-700">"{example.suggested}"</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Red Flags */}
            {analysis.fullAnalysis?.red_flags && analysis.fullAnalysis.red_flags.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-4">⚠️ Red Flags</h3>
                <ul className="space-y-2">
                  {analysis.fullAnalysis.red_flags.map((flag, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">⚠</span>
                      <span className="text-red-700">{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Resume Title */}
            {analysis.fullAnalysis?.suggested_resume_title && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-800 mb-2">💡 Suggested Resume Title</h3>
                <p className="text-blue-700 font-medium">{analysis.fullAnalysis.suggested_resume_title}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => setAnalysis(null)}
                className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Start Over
              </button>
              <button
                onClick={() => navigate('/resume-history')}
                className="flex-1 bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                View Resume History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalysis; 