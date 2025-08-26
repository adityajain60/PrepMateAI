import React from 'react';

const Btn = ({ children, onClick, disabled, color }) => (
    <button
      className={`flex-1 py-3 px-4 rounded-md text-white ${color} hover:opacity-90 disabled:opacity-50`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
  
  const ActionButtons = ({
    onSubmit,
    onIdeal,
    submitting,
    generating,
    hasAnswer,
  }) => (
    <div className="flex space-x-4">
      <Btn
        onClick={onSubmit}
        disabled={submitting || !hasAnswer}
        color="bg-green-600"
      >
        {submitting ? "Getting Feedback…" : "Submit Answer"}
      </Btn>
      <Btn
        onClick={onIdeal}
        disabled={generating}
        color="bg-blue-600"
      >
        {generating ? "Generating…" : "Show Ideal Answer"}
      </Btn>
    </div>
  );
  
  export default ActionButtons;
  