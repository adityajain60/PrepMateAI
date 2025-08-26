import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGetInterviewQuestions from "../../hooks/useInterview/useGetInterviewQuestions";

const MockInterviewCard = ({
  resumeFile,
  resumeText,
  jdFile,
  jdText,
}) => {
  const navigate = useNavigate();

  const [config, setConfig] = useState({
    questionDifficulty: "Any",
    questionType: ["Technical"],
    experienceLevel: "Fresher",
    roundType: "Technical",
    targetJobRole: "Software Engineer",
    skillFocus: "",
    numQuestions: 5,
  });

  const [localError, setLocalError] = useState("");
  const { loading, questions, getInterviewQuestions } = useGetInterviewQuestions();

  const update = (k, v) => setConfig((c) => ({ ...c, [k]: v }));

  const toggleQuestionType = (type) =>
    setConfig((c) => ({
      ...c,
      questionType: c.questionType.includes(type)
        ? c.questionType.filter((t) => t !== type)
        : [...c.questionType, type],
    }));

  const disabled =
    loading ||
    (!resumeFile && !resumeText.trim()) ||
    (!jdFile && !jdText.trim()) ||
    config.questionType.length === 0;

  const handleGenerate = async () => {
    if (disabled) return;

    try {
      setLocalError("");
      const qs = await getInterviewQuestions({
        resumeFile,
        resumeText,
        jdFile,
        jdText,
        config,
      });

      if (qs) {
        navigate("/mock-interview", {
          state: {
            questions: { fullQuestions: qs }, // Wrap the array in an object
            resumeFile,
            resumeText,
            jobDescriptionFile: jdFile,
            jobDescriptionText: jdText,
          },
        });
      }
    } catch (err) {
      setLocalError(err.message || "Failed to generate questions.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mock Interview</h2>
      <p className="text-gray-600 mb-6">
        Generate personalised interview questions and practise with AI
        feedback.
      </p>

      {localError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {localError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Select
          label="Question Difficulty"
          value={config.questionDifficulty}
          onChange={(v) => update("questionDifficulty", v)}
          options={["Any", "Easy", "Medium", "Hard"]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Type&nbsp;
            <span className="text-xs text-gray-500">(Select multiple)</span>
          </label>
          <div className="space-y-2">
            {["Technical", "Behavioral", "DSA", "System Design", "Resume"].map((t) => (
              <label key={t} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config.questionType.includes(t)}
                  onChange={() => toggleQuestionType(t)}
                  className="mr-2 h-4 w-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{t}</span>
              </label>
            ))}
          </div>
        </div>

        <Select
          label="Experience Level"
          value={config.experienceLevel}
          onChange={(v) => update("experienceLevel", v)}
          options={["Fresher", "1-2 years", "3-5 years", "Senior"]}
        />

        <Select
          label="Round Type"
          value={config.roundType}
          onChange={(v) => update("roundType", v)}
          options={["Technical", "HR", "Managerial"]}
        />

        <Input
          label="Target Job Role"
          value={config.targetJobRole}
          onChange={(v) => update("targetJobRole", v)}
          placeholder="e.g., Software Engineer"
        />

        <Input
          label="Skill Focus"
          value={config.skillFocus}
          onChange={(v) => update("skillFocus", v)}
          placeholder="e.g., Python, SQL"
        />

        <Select
          label="Number of Questions"
          value={config.numQuestions}
          onChange={(v) => update("numQuestions", parseInt(v))}
          options={[3, 5, 10]}
        />
      </div>
            {(!resumeFile && !resumeText.trim()) || (!jdFile && !jdText.trim()) ? (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg mb-6 text-sm">
          <span className="inline-block w-3 h-3 rounded-full bg-yellow-400"></span>
          <p>Please provide both resume and job description to start the interview.</p>
        </div>
      ) : null}

      <button
        onClick={handleGenerate}
        disabled={disabled}
        className="w-full px-6 py-3 font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Preparing Interview..." : "Start Interview"}
      </button>
    </div>
  );
};

const Select = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

const Input = ({ label, value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
    />
  </div>
);

export default MockInterviewCard;
