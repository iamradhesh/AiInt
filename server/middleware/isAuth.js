import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuth = async(req,res,next)=>{
    try {
        let {token} = req.cookies;
       // console.log(token);
        if(!token){
            return res.status(401).json({message:"Unauthorized"});
        }
        //Verify token
        //If valid, attach user info to req and call next()
        //If invalid, return 401 Unauthorized
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decoded)
        const user = await User.findById(decoded.userId);
        if(!user){
            return res.status(401).json({message:"Unauthorized"});
        }
        req.user = user;
        req.userId = user._id; // ✅ add this line
        next();

    } catch (error) {
        console.error("Error in isAuth:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}