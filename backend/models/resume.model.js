import mongoose from "mongoose";

const resumeHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    jobDescription: {
      type: String,
      required: true,
    },
    analysisSummary: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
    },
    strengths: {
      type: new mongoose.Schema({
        alignment_with_jd: [String],
        resume_quality: [String],
        technical: [String],
      }),
      required: true,
    },
    suggestions: {
      type: new mongoose.Schema({
        content_improvements: [String],
        formatting: {
          high_priority: [String],
          low_priority: [String],
        },
        keyword_optimization: {
          missing_keywords: [String],
          overused_words: [String],
        },
        rewrite_examples: [
          {
            original: String,
            improved: String,
          },
        ],
      }),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ResumeHistory = mongoose.model("ResumeHistory", resumeHistorySchema);
export default ResumeHistory;
