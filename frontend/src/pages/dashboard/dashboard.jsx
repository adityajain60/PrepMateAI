import React, { useState } from "react";
import UploadFileCard from "../../components/dashboard/UploadFileCard";
import ResumeAnalysisCard from "../../components/dashboard/ResumeAnalysisCard";
import MockInterviewCard from "../../components/dashboard/MockInterviewCard";

const Dashboard = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");

  const [jdFile, setJdFile] = useState(null);
  const [jdText, setJdText] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <UploadFileCard
          title="Resume"
          description="Upload your resume or paste the content directly."
          fileLabel="Resume PDF"
          file={resumeFile}
          onFileChange={(e) => setResumeFile(e.target.files?.length ? e.target.files[0] : null)}
          textLabel="Resume Text"
          text={resumeText}
          onTextChange={(e) => setResumeText(e.target.value)}
          allowText
        />
        <UploadFileCard
          title="Job Description"
          description="Upload the job description or paste the text."
          fileLabel="JD PDF"
          file={jdFile}
          onFileChange={(e) => setJdFile(e.target.files?.length ? e.target.files[0] : null)}
          textLabel="Job Description Text"
          text={jdText}
          onTextChange={(e) => setJdText(e.target.value)}
          allowText
        />
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6">
        <ResumeAnalysisCard
          resumeFile={resumeFile}
          resumeText={resumeText}
          jdFile={jdFile}
          jdText={jdText}
        />
        <MockInterviewCard
          resumeFile={resumeFile}
          resumeText={resumeText}
          jdFile={jdFile}
          jdText={jdText}
        />
      </div>
    </div>
  );
};

export default Dashboard;
