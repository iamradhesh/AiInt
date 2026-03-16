import React from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import type { RootState } from "../types/store";
import { motion } from "framer-motion";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import AuthModel from "../components/AuthModel";
import { useNavigate } from "react-router-dom";
import { FaUserAstronaut } from "react-icons/fa";

import {
  evalImg,
  hrImg,
  techImg,
  confidenceImg,
  creditImg,
  resumeImg,
  pdfImg,
  analyticsImg,
} from "../assets";

import StepCard from "../components/StepCard";
import { steps } from "../data/steps";
import { imagesData } from "../data/image";

const Home = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const userData = useSelector((state: RootState) => state.user.userData);

  // const steps = [
  //   {
  //     icon: <BsRobot size={26} />,
  //     step: "STEP 1",
  //     title: "AI-Powered Mock Interviews",
  //     description:
  //       "Engage in realistic mock interviews powered by advanced AI algorithms that simulate real-world interview scenarios.",
  //   },
  //   {
  //     icon: <FaUserAstronaut size={26} />,
  //     step: "STEP 2",
  //     title: "Personalized Feedback",
  //     description:
  //       "Receive detailed feedback on your answers, communication skills, and problem-solving approach to improve your performance.",
  //   },
  //   {
  //     icon: <BsCoin size={26} />,
  //     step: "STEP 3",
  //     title: "Track Your Progress",
  //     description:
  //       "Monitor your interview performance over time with analytics and insights to identify strengths and areas for improvement.",
  //   },
  //   {
  //     icon: <BsRobot size={26} />,
  //     step: "STEP 4",
  //     title: "Get Job Ready",
  //     description:
  //       "Practice with multiple interview scenarios and become fully prepared to confidently face real company interviews.",
  //   },
  // ];

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col">
      <Navbar />

      <div className="flex flex-col px-6 py-20">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 text-sm px-4 py-2 rounded-full flex items-center gap-2">
              <HiSparkles className="text-green-600" size={18} />
              <span className="text-gray-600 font-semibold">
                AI-Powered Interview Platform
              </span>
            </div>
          </div>

          {/* Hero */}
          <div className="text-center mb-28 mt-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-semibold leading-tight max-w-4xl mx-auto"
            >
              Ace Your Interviews with{" "}
              <span className="bg-green-100 text-green-600 px-5 py-1 rounded-full inline-block">
                AI-Powered
              </span>{" "}
              Practice and Feedback
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-gray-500 mt-6 max-w-2xl mx-auto text-lg"
            >
              Practice mock interviews, get instant AI feedback, and boost your
              confidence for real-world success.
            </motion.p>

            {/* Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <motion.button
                onClick={() => {
                  if (!userData) {
                    setShowAuthModal(true);
                    return;
                  }
                  navigate("/interview");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black text-white px-6 py-3 rounded-full shadow-md"
              >
                Start Interview
              </motion.button>

              <motion.button
                onClick={() => {
                  if (!userData) {
                    setShowAuthModal(true);
                    return;
                  }
                  navigate("/history");
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border border-gray-300 px-10 py-3 rounded-full shadow-md hover:bg-gray-100"
              >
                View History
              </motion.button>
            </div>
          </div>

          {/* Section Title */}
          <h2 className="text-3xl font-semibold text-center mb-16">
            How It Works
          </h2>

          {/* Cards */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto mb-28">
            {steps.map((item, index) => (
              <StepCard key={index} index={index} {...item} />
            ))}
          </div>
          <div className="mb-32"></div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-semibold text-center mb-16"
          >
            Advance AI <span className="text-green-600">Capabilities</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-10">
            {imagesData?.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.02 }}
                viewport={{ once: true }}
                className="bg-white border border-gray-2 rounded-3xl p-8
                shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-full md:w-1/2 flex justify-center">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-auto object-contain max-h-64 rounded-2xl"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <div
                      className="bg-green-50 text-green-600 w-12 h-12 rounded-xl flex
                    items-center justify-center mb-6"
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {showAuthModal && <AuthModel onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default Home;
