import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { upload } from "../middleware/multer.js";
import {
  analyzeResume,
  finishInterview,
  generateQuestion,
  getInterviewHistory,
  getInterviewReport,
  submitAnswer,
} from "../controller/InterviewController.js";
const interviewRouter = express.Router();

interviewRouter.post("/resume", isAuth, upload.single("resume"), analyzeResume);
interviewRouter.post("/generate-questions", isAuth, generateQuestion);
interviewRouter.post("/submit-answer", isAuth, submitAnswer);
interviewRouter.post("/finish", isAuth, finishInterview);
interviewRouter.get("/get-interview", isAuth, getInterviewHistory);
interviewRouter.get("/report/:id", isAuth, getInterviewReport);

export default interviewRouter;
