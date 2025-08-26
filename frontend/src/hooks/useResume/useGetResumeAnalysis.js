import { useState } from "react";
import toast from "react-hot-toast";

export const getResumeAnalysis = async ({
  resumeFile,
  resumeText,
  jdFile,
  jdText,
}) => {
  const form = new FormData();

  if (resumeFile) {
    form.append("resume", resumeFile);
  } else if (resumeText) {
    form.append("resumeText", resumeText);
  } else {
    throw new Error("Resume (file or text) is required");
  }

  if (jdFile) {
    form.append("jobDescriptionFile", jdFile);
  } else if (jdText) {
    form.append("jobDescription", jdText);
  } else {
    throw new Error("Job description (file or text) is required");
  }

  const res = await fetch("/api/resume/analyze", {
    method: "POST",
    body: form,
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");

  return data;
};

export default getResumeAnalysis;
