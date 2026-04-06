import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';

export const genToken = async(userId)=>{
    try {
      
        const token = await jwt.sign({userId}, process.env.JWT_SECRET, {expiresIn: '4d'})
        return token;
    } catch (error) {
        console.error("Error generating token:", error);
        throw error;
    }
}