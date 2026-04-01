import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 300,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 10,
      max: 600,
    },
    answer: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    feedback: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    improvement: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300, // keep it concise and actionable
    },
    score: { type: Number, default: 0, min: 0, max: 100 },
    confidence: { type: Number, default: 0, min: 0, max: 100 },
    communication: { type: Number, default: 0, min: 0, max: 100 },
    correctness: { type: Number, default: 0, min: 0, max: 100 },
  },
  { _id: false, timestamps: true },
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    experience: {
      type: String,
      required: true,
      maxlength: 50,
    },
    mode: {
      type: String,
      enum: ["technical", "behavioral", "mixed"],
      required: true,
    },
    resumeText: {
      type: String,
      default: "",
      maxlength: 10000, // prevent huge payloads
    },
    questions: {
      type: [questionSchema],
      validate: [(arr) => arr.length <= 10, "Too many questions"],
    },
    finalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ["incompleted", "completed"],
      default: "incompleted",
    },
  },
  {
    timestamps: true,
    strict: "throw",
  },
);

export const Interview = mongoose.model("Interview", interviewSchema);
