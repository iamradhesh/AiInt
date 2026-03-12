import React from "react";
import type { FC } from "react";
import { BsRobot } from "react-icons/bs";
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import { auth, provider } from "../utils/firebase";
import { ServerUrl } from "../App";
import axios from "axios";
const Auth: FC = () => {
  const handleGoogleAuth = async (): Promise<void> => {
    console.log("Google login clicked");
  try {
    const response: UserCredential = await signInWithPopup(auth, provider);

    const user = response.user;
    console.log(response);
    if (!user.email || !user.displayName) {
      throw new Error("Google account missing required profile info");
    }

    const name: string = user.displayName;
    const email: string = user.email;

    const result = await axios.post(
      `${ServerUrl}/api/auth/google`,
      { name, email },
      { withCredentials: true }
    );

    console.log(result.data);

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unknown authentication error", error);
    }
  }
};

  return (
    <div className="w-full min-h-screen bg-[#f3f3f3] flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-3xl bg-white shadow-2xl border-gray-200"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={28} />
          </div>
          <h2 className="font-semibold text-lg">InterviewIQ.AI</h2>
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold text-center leading-snug mb-4">
          Continue With
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2">
            <IoSparkles size={20} />
            AI Powered Smart Interviews
          </span>
        </h1>

        <p className="text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8">
          Sign in to your account to access personalized interview preparation,
          mock interviews, and expert feedback powered by AI.
        </p>

        <motion.button
          whileHover={{ opacity: 0.9, scale: 1.03 }}
          whileTap={{ opacity: 1, scale: 0.98 }}
          onClick={handleGoogleAuth}
          className="w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md"
        >
          <FcGoogle size={20} />
          Sign in with Google
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Auth;