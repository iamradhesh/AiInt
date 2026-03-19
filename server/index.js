import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDb from './config/connectDb.js';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import interviewRouter from './routes/interview.route.js';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter)

const PORT = process.env.PORT || 8000;
await connectDb();



app.listen(PORT,()=>{
    console.log(`✅Server is running on port ${PORT}`);
})