import express from 'express';
import { isAuth} from "../middleware/isAuth.js"
import {upload} from "../middleware/multer.js"
import { analyzeResume, finishInterview, generateQuestion, submitAnswer } from '../controller/InterviewController.js';
const interviewRouter = express.Router();

interviewRouter.post('/resume', isAuth,upload.single("resume"),analyzeResume);
interviewRouter.post('/genrate-questions',isAuth,generateQuestion);
interviewRouter.post('/submit-answer', isAuth,submitAnswer);
interviewRouter.post('/finish',isAuth,finishInterview);
export default interviewRouter;