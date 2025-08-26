import React from 'react';

const ProgressHeader = ({ index, total }) => {
    const pct = Math.round(((index + 1) / total) * 100);
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mock Interview</h2>
            <p className="text-gray-600">Question {index + 1} of {total}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{pct}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
        <div className="mt-4 w-full bg-gray-200 h-2 rounded-full">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };
  export default ProgressHeader;
  