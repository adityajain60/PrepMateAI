import mongoose from 'mongoose';

const interviewHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    question_type: {
      type: String,
      default: ''
    },
    question_difficulty: {
      type: String,
      default: ''
    },
    question_num: {
      type: Number,
      default: 1
    }
  }]
}, { timestamps: true });

const InterviewHistory = mongoose.model('InterviewHistory', interviewHistorySchema);

export default InterviewHistory;
