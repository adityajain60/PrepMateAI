// src/components/InterviewHistoryCard.jsx
import React, { useState } from "react";

// --- Icons ---
const ChevronDownIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const HelpCircleIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);
const BrainCircuitIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a4 4 0 00-4 4v2H6a2 2 0 00-2 2v3a2 2 0 002 2h2v3a2 2 0 002 2h2a2 2 0 002-2v-3h2a2 2 0 002-2v-3a2 2 0 00-2-2h-2V6a4 4 0 00-4-4zM8 8v1M16 8v1M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const ZapIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

const InterviewHistoryCard = ({ item }) => {
    const [expanded, setExpanded] = useState(false);
    const toggle = () => setExpanded((prev) => !prev);

    const difficultyColor = {
        "Easy": "bg-green-100 text-green-800",
        "Medium": "bg-yellow-100 text-yellow-800",
        "Hard": "bg-red-100 text-red-800",
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300">
            <div className="p-4 cursor-pointer hover:bg-gray-50/80" onClick={toggle}>
                <div className="flex justify-between items-center">
                    <div className="flex-1 pr-4">
                        <p className="text-sm font-semibold text-purple-600">Mock Interview</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Practiced on: {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                           {item.jobDescription}
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 text-gray-600">
                            <HelpCircleIcon className="w-5 h-5"/>
                            <span className="font-semibold text-lg">{item.questions.length}</span>
                        </div>
                         <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </div>
            {expanded && (
                <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3 text-sm">Generated Questions:</h4>
                    <ul className="space-y-3">
                        {item.questions.map((q, index) => (
                            <li key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                                <p className="font-semibold text-gray-800 mb-2">{index + 1}. {q.question}</p>
                                <div className="flex items-center space-x-2">
                                    <span className="flex items-center space-x-1 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                        <BrainCircuitIcon className="w-3 h-3"/>
                                        <span>{q.question_type}</span>
                                    </span>
                                    <span className={`flex items-center space-x-1 px-2 py-0.5 text-xs font-semibold rounded-full ${difficultyColor[q.question_difficulty] || 'bg-gray-100 text-gray-800'}`}>
                                        <ZapIcon className="w-3 h-3"/>
                                        <span>{q.question_difficulty}</span>
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default InterviewHistoryCard;
