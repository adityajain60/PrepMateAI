import { useState } from "react";
import toast from "react-hot-toast";

const useGetInterviewQuestions = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState(null);

  const getInterviewQuestions = async ({
    resumeFile,
    resumeText,
    jdFile,
    jdText,
    config,
  }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (resumeFile) formData.append("resume", resumeFile);
      if (resumeText) formData.append("resumeText", resumeText);
      if (jdFile) formData.append("jobDescriptionFile", jdFile);
      if (jdText) formData.append("jobDescription", jdText);

      // Append config fields
      Object.entries(config).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Send array as comma-separated string, as FormData doesn't natively support arrays
          formData.append(key, value.join(','));
        } else {
          formData.append(key, value);
        }
      });
      
      const res = await fetch("/api/interview/generate", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate questions");
      }
      
      setQuestions(data.questions); // The API returns an object with a `questions` property
      return data.questions; // Return questions for immediate use
    } catch (error) {
      toast.error(error.message);
      setQuestions(null);
      return null; // Return null on error
    } finally {
      setLoading(false);
    }
  };

  return { loading, questions, getInterviewQuestions };
};

export default useGetInterviewQuestions;