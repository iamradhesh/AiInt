import React from "react";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import type { RootState } from "../types/store";
import { motion } from "framer-motion";
import { BsRobot } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";

import AuthModel from "../components/AuthModel";
import { useNavigate } from "react-router-dom";

import StepCard from "../components/StepCard";
import { steps } from "../data/steps";
import { imagesData } from "../data/image";
import { modes } from "../data/modes";
import Footer from "../components/Footer";

const Home = () => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const userData = useSelector((state: RootState) => state.user.userData);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <Navbar />

      <div className="flex flex-col px-4 sm:px-6 md:px-8 py-16 md:py-20">
        <div className="max-w-7xl mx-auto w-full">

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 text-xs sm:text-sm px-4 py-2 rounded-full flex items-center gap-2">
              <HiSparkles className="text-green-600" />
              <span className="text-gray-600 font-medium">
                AI-Powered Interview Platform
              </span>
            </div>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-20 mt-4">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight"
            >
              Ace Your Interviews with{" "}
              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full inline-block">
                AI-Powered
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 mt-4 text-sm sm:text-base md:text-lg max-w-xl mx-auto"
            >
              Practice mock interviews, get instant AI feedback, and boost your
              confidence for real-world success.
            </motion.p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!userData) return setShowAuthModal(true);
                  navigate("/interview");
                }}
                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full"
              >
                <BsRobot /> Start Interview
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!userData) return setShowAuthModal(true);
                  navigate("/history");
                }}
                className="flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-full hover:bg-gray-100"
              >
                <HiSparkles /> View History
              </motion.button>
            </div>
          </div>

          {/* How it works */}
          <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-24">
            {steps.map((item, index) => (
              <StepCard key={index} index={index} {...item} />
            ))}
          </div>

          {/* AI Capabilities */}
          <div className="mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-semibold text-center mb-12"
            >
              Advanced AI <span className="text-green-600">Capabilities</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {imagesData.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-center">

                    <div className="w-full md:w-1/2 flex justify-center">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="max-h-52 object-contain"
                      />
                    </div>

                    <div className="w-full md:w-1/2 text-center md:text-left">
                      <div className="bg-green-50 text-green-600 w-10 h-10 flex items-center justify-center rounded-lg mb-4 mx-auto md:mx-0 text-lg">
                        {item.icon}
                      </div>

                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Modes */}
          <div className="mb-24">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -6 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl font-semibold text-center mb-12"
            >
              Interview <span className="text-green-600">Modes</span>
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              {modes.map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-center">

                    <div className="w-full md:w-1/2 flex justify-center">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="max-h-52 object-contain"
                      />
                    </div>

                    <div className="w-full md:w-1/2 text-center md:text-left">
                      <div className="bg-green-50 text-green-600 w-10 h-10 flex items-center justify-center rounded-lg mb-4 mx-auto md:mx-0 text-lg">
                        {item.icon}
                      </div>

                      <h3 className="text-lg sm:text-xl font-semibold mb-2">
                        {item.title}
                      </h3>

                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {showAuthModal && (
        <AuthModel onClose={() => setShowAuthModal(false)} />
      )}
      <Footer />
    </div>
  );
};

export default Home;