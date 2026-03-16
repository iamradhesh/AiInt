import express from 'express';
import {googleAuth,logOut} from '../controller/auth.controller.js';
import {isAuth} from "../middleware//isAuth.js";
const authRouter = express.Router();

authRouter.post('/google', googleAuth);
authRouter.post('/logout', logOut);
export default authRouter;