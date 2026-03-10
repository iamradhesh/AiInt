import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectDb from './config/connectDb.js';
const app = express();

const PORT = process.env.PORT || 8000;
connectDb();
app.get('/',(req,res)=>{
    res.send('Hello World');
})

app.listen(PORT,()=>{
    console.log(`✅Server is running on port ${PORT}`);
})