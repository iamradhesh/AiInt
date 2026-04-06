export type InterviewSetup = {
  success: boolean;
  interviewId: string;
  interview: {
    _id: string;
    userId: string;
    role: string;
    experience: string;
    mode: string;
    resumeText: string;
    questions: {
      question: string;
      difficulty: "easy" | "medium" | "hard";
      timeLimit: number;
      answer: string;
      feedback: string;
      score: number;
      confidence: number;
      communication: number;
      correctness: number;
    }[];
    finalScore: number;
    status: "incompleted" | "completed";
    createdAt: string;
    updatedAt: string;
  };
  user: {
    name: string;
    creditsLeft: number;
  };
};

export type InterviewHistoryType = {
  _id: string;
  role: string;
  experience: string;
  mode: string;
  finalScore: number;
  status: string;
  createdAt: string;
};

export type InterviewReport = {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  finalScore: number;
  confidence: number;
  communication: number;
  correctness: number;
  questionwiesescore: { question: string; score: number }[];
};