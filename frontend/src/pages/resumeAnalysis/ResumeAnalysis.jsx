// src/pages/ResumeAnalysis.jsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

// --- SVG ICONS ---
const ArrowLeftIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ChartBarIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20V10M18 20V4M6 20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const CheckCircleIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const XCircleIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const LightbulbIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 18h6M12 22V18M9 14.04C9 15.34 10.02 17 12 17s3-1.66 3-2.96C15 11.53 12 10 12 10s-3 1.53-3 4.04z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 2a7 7 0 00-7 7c0 3.04 2.18 5.58 5 6.5V2h4v13.5c2.82-.92 5-3.46 5-6.5a7 7 0 00-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const AlertTriangleIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);


const ResumeAnalysis = () => {
  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const { state } = useLocation();
  const analysis = state?.analysis;

  useEffect(() => {
    if (authUser && !analysis) navigate("/dashboard");
  }, [authUser, analysis, navigate]);

  if (!authUser || !analysis) return null;

  const {
    ats_score = {},
    resume_summary,
    jd_summary,
    strengths = {},
    weaknesses = {},
    suggestions = {},
    red_flags = [],
    suggested_resume_title,
  } = analysis;

  const go = (path) => () => navigate(path);
  const getScoreColor = (s) => (s >= 80 ? "text-green-500" : s >= 60 ? "text-yellow-500" : "text-red-500");

  const totalScore = ats_score?.total_score || 0;
  const finalAssessment = ats_score?.final_assessment;
  const scoreDetails = Object.entries(ats_score).filter(
    ([key, value]) => typeof value === 'number' && key !== 'total_score'
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={go("/dashboard")} className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-900">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">Resume Analysis Report</h1>
            <div className="flex items-center space-x-2">
              <button onClick={go("/resume-history")} className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Resume History</button>
              <button onClick={go("/dashboard")} className="px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Start Over</button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">

          {/* Left Column (Main Analysis) */}
          <div className="lg:col-span-8 space-y-6">
            <AnalysisSection title="Strengths" data={strengths} icon={CheckCircleIcon} color="green" />
            <AnalysisSection title="Areas for Improvement" data={weaknesses} icon={XCircleIcon} color="red" />
            <AnalysisSection title="Suggestions" data={suggestions} icon={LightbulbIcon} color="blue" />
            {red_flags.length > 0 && (
              <section className="bg-red-50 border-2 border-dashed border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangleIcon className="w-8 h-8 text-red-500" />
                  <h2 className="text-2xl font-bold text-red-700">Red Flags</h2>
                </div>
                <ul className="space-y-3">
                  {red_flags.map((flag, i) => (
                    <li key={i} className="flex items-start space-x-3 text-red-800">
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-sm">{flag}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right Column (Sticky) */}
          <aside className="lg:col-span-4 mt-8 lg:mt-0 lg:sticky lg:top-24 space-y-6">
            <section className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">ATS Match Score</h2>
              <p className="text-sm text-gray-500 mb-4">How well your resume matches the job description.</p>
              <div className="flex items-center justify-center space-x-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke="currentColor"
                      className={`${getScoreColor(totalScore)} transition-all duration-1000`}
                      strokeWidth="10"
                      strokeDasharray={2 * Math.PI * 45}
                      strokeDashoffset={2 * Math.PI * 45 * (1 - totalScore / 100)}
                      strokeLinecap="round" transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(totalScore)}`}>{totalScore}</span>
                    <span className="text-sm font-medium text-gray-500">out of 100</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                {scoreDetails.map(([k, v]) => (
                  <div key={k} className="flex items-center">
                    <span className="text-sm font-medium text-gray-600 w-32 capitalize">{k.replaceAll("_", " ")}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${getScoreColor(v).replace('text-','bg-')}`} style={{ width: `${v}%` }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 w-10 text-right">{v}%</span>
                  </div>
                ))}
              </div>
              {finalAssessment && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Final Assessment</h3>
                  <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md border border-gray-200">{finalAssessment}</p>
                </div>
              )}
            </section>
            
            <SummaryCard title="Resume Summary">
              {suggested_resume_title && <p className="font-bold text-gray-800 mb-2">{suggested_resume_title}</p>}
              <p className="text-sm text-gray-600 whitespace-pre-line">{resume_summary}</p>
            </SummaryCard>
            
            <SummaryCard title="Job Description Summary">
              <p className="text-sm text-gray-600 whitespace-pre-line">{jd_summary}</p>
            </SummaryCard>

          </aside>
        </div>
      </main>
    </div>
  );
};

const SummaryCard = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl">
    <div className="p-4">
      <h3 className="font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-4 border-t border-gray-200">{children}</div>
  </div>
);

const AnalysisSection = ({ title, data, icon: Icon, color }) => {
  if (!data || Object.keys(data).length === 0) return null;
  const colorClasses = {
    green: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    red: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    blue: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  };
  const c = colorClasses[color] || colorClasses.blue;

  return (
    <section className="bg-white border border-gray-200 rounded-xl">
      <header className={`flex items-center space-x-3 p-4 border-b border-gray-200 ${c.bg}`}>
        <Icon className={`w-7 h-7 ${c.text}`} />
        <h2 className={`text-2xl font-bold ${c.text}`}>{title}</h2>
      </header>
      <div className="p-4 space-y-4">
        {Object.entries(data).map(([group, items]) => (
          <GroupList key={group} title={group} items={items} color={color} />
        ))}
      </div>
    </section>
  );
};

const GroupList = ({ title, items, color }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  const colorClasses = {
    green: { text: 'text-green-800', border: 'border-green-300' },
    red: { text: 'text-red-800', border: 'border-red-300' },
    blue: { text: 'text-blue-800', border: 'border-blue-300' },
  };
  const c = colorClasses[color] || colorClasses.blue;

  return (
    <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-200">
      <h3 className={`font-semibold text-lg ${c.text} mb-3 capitalize`}>{title.replaceAll("_", " ")}</h3>
      <ul className="space-y-3">
        {items.map((item, idx) => {
          if (typeof item === 'object' && item.current && item.suggested) {
            return (
              <li key={idx} className="p-3 bg-white border rounded-md shadow-sm">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Current</span>
                  <p className="mt-1 text-sm text-gray-700">{item.current}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Suggested</span>
                  <p className="mt-1 text-sm text-gray-900 font-medium">{item.suggested}</p>
                </div>
              </li>
            );
          }
          return (
            <li key={idx} className="flex items-start space-x-3 text-sm text-gray-700">
              <div className={`w-1.5 h-1.5 ${c.text.replace('700', '500').replace('800','500')} rounded-full mt-1.5 flex-shrink-0`}></div>
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ResumeAnalysis;
