import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDb = async()=>{
   try{
    await mongoose.connect(process.env.MONGODB_URL,{
         useNewUrlParser: true,
         useUnifiedTopology: true,
    });
    console.table('Database connected successfully ✅');
   } catch(error){
    console.error('Error connecting to the database:', error);
   }
   };

export default connectDb;
