import React, { useState } from "react";

const ResumeHistoryCard = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((prev) => !prev);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300">
      <div
        onClick={toggle}
        className="flex justify-between items-start p-4 cursor-pointer hover:bg-gray-50"
      >
        <div className="flex-1 pr-4">
          <p className="text-sm font-semibold text-indigo-600 mb-1">Resume Analysis</p>
          <p className="text-xs text-gray-500 mb-2">
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-sm text-gray-700 mb-1 line-clamp-2">
            <strong>Summary:</strong> {item.analysisSummary}
          </p>
          <p className="text-sm text-gray-600 line-clamp-1">
            <strong>Resume Snippet:</strong>{" "}
            {item?.strengths?.resume_quality?.[0] || "No specific highlight."}
          </p>
          <p className="text-sm text-gray-600 line-clamp-1">
            <strong>JD Snippet:</strong>{" "}
            {item?.strengths?.alignment_with_jd?.[0] || "No JD match found."}
          </p>
        </div>
        <div className="text-center shrink-0">
          <div className="w-12 h-12 relative">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                className={getScoreColor(item.matchScore)}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={
                  2 * Math.PI * 45 * (1 - (item.matchScore || 0) / 100)
                }
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor(
                item.matchScore
              )}`}
            >
              {item.matchScore}%
            </span>
          </div>
        </div>
      </div>
      {expanded && <ExpandedDetails item={item} />}
    </div>
  );
};

const ExpandedDetails = ({ item }) => (
  <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 space-y-4 text-sm text-gray-800">
    <Section title="Strengths" data={item.strengths} bulletColor="bg-green-500" />
    <Section title="Suggestions" data={item.suggestions?.content_improvements} bulletColor="bg-blue-500" />

    {item.suggestions?.keyword_optimization && (
      <>
        <KeywordTagList
          label="Missing Keywords"
          items={item.suggestions.keyword_optimization.missing_keywords}
        />
        <KeywordTagList
          label="Overused Words"
          items={item.suggestions.keyword_optimization.overused_words}
          color="bg-yellow-100 text-yellow-800"
        />
      </>
    )}
    
    <RewriteSuggestions examples={item.suggestions?.rewrite_examples} />
  </div>
);

const Section = ({ title, data, bulletColor }) => {
  if (!data || (Array.isArray(data) ? data.length === 0 : Object.keys(data).length === 0)) {
    return null;
  }

  // Handle simple arrays
  if (Array.isArray(data)) {
    return (
      <div>
        <h4 className="font-semibold text-sm text-gray-800 mb-1">{title}</h4>
        <ul className="list-none space-y-1 mt-1">
          {data.map((val, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={`w-2 h-2 rounded-full mt-1.5 ${bulletColor}`}></span>
              <span>{val}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Handle objects of arrays
  return (
    <div>
      <h4 className="font-semibold text-sm text-gray-800 mb-1">{title}</h4>
      {Object.entries(data).map(([key, values]) => (
        Array.isArray(values) && values.length > 0 && (
          <div key={key} className="mb-2">
            <h5 className="text-xs text-gray-500 capitalize">
              {key.replace(/_/g, " ")}
            </h5>
            <ul className="list-none space-y-1 mt-1">
              {values.map((val, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`w-2 h-2 rounded-full mt-1.5 ${bulletColor}`}></span>
                  <span>{val}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
};

const KeywordTagList = ({ label, items, color = "bg-green-100 text-green-800" }) => {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h5 className="text-xs font-medium text-gray-600 mb-1">{label}</h5>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className={`px-2 py-0.5 text-xs rounded-full font-medium ${color}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

const RewriteSuggestions = ({ examples }) => {
  if (!examples || examples.length === 0) return null;
  return (
    <div>
      <h4 className="font-semibold text-sm text-gray-800 mb-1">Rewrite Suggestions</h4>
      <div className="space-y-3">
        {examples.map((ex, i) => (
          <div key={i} className="bg-white border border-gray-200 p-3 rounded-md">
            <p className="text-xs text-gray-500">Original:</p>
            <p className="italic text-gray-600 mb-1">"{ex.original || ex.current}"</p>
            <p className="text-xs text-gray-500">Improved:</p>
            <p className="text-gray-800 font-medium">"{ex.improved || ex.suggested}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumeHistoryCard;
