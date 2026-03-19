import { motion } from "framer-motion";
import React, { useState } from "react";
import { features } from "../data/Feature";
import { FaBriefcase, FaFileUpload, FaUserTie } from "react-icons/fa";
import ModeSelect from "./ModeSelect";
import ResumeUploader from "./ResumeUploader";
import AnalyzeButton from "./AnalyzeButton";
import axios from "axios";
import { ServerUrl } from "../App";

const fadeSlide = (x: number, delay: number) => ({
  initial: { x, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  transition: { duration: 0.7, delay },
});

const InterviewStep1 = ({ onStart }) => {
  const [role, setRole] = React.useState("");
  const [experience, setExperience] = React.useState("");
  const [mode, setMode] = React.useState("");
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeFile || analyzing) return;
    setLoading(true);
    setAnalyzing(true);

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const response = await axios.post(
        ServerUrl + "/api/interview/resume",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setRole(response.data.role || "");
      setExperience(response.data.experience || "");
      setProjects(response.data.projects || []);
      setSkills(response.data.skills || []);
      setResumeText(response.data.resumeText || "");
      setAnalysisDone(true);
    } catch (error) {
      console.error("Error analyzing resume:", error);
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4 font-[DM_Sans]"
    >
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">

        {/* LEFT — Features panel */}
        <motion.div
          {...fadeSlide(-100, 0.3)}
          className="bg-gradient-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center"
        >
          <h2 className="text-4xl font-bold text-gray-800 mb-4 font-[Sora]">
            Start Your AI Interview
          </h2>
          <p className="text-gray-600 mb-10">
            Practice real interview scenarios powered by AI. Improve
            communication, technical skills, and confidence with instant
            feedback.
          </p>
          <div className="space-y-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.15 * index }}
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer"
              >
                {feature.icon}
                <span className="text-gray-700 font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* RIGHT — Setup form */}
        <motion.div {...fadeSlide(100, 0.5)} className="bg-white p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 font-[Sora]">
            Interview Setup
          </h2>

          <div className="space-y-6">

            {/* Role input */}
            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300 hover:cursor-pointer"
              />
            </div>

            {/* Experience input */}
            <div className="relative">
              <FaBriefcase className="absolute top-4 left-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter your Experience e.g. 3 years"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300 hover:cursor-pointer"
              />
            </div>

            {/* Mode selection */}
            <div className="relative">
              <ModeSelect value={mode} onChange={setMode} />
            </div>

            {/* Resume upload + analyze */}
            {!analysisDone && (
              <>
                <ResumeUploader
                  resumeFile={resumeFile}
                  onFileChange={setResumeFile}
                />
                {resumeFile && (
                  <AnalyzeButton
                    analyzing={analyzing}
                    onAnalyze={handleAnalyze}
                  />
                )}
              </>
            )}

            {/* Analysis result */}
            {analysisDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  Resume Analysis Result
                </h3>

                {/* Projects */}
                {projects.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Projects:</p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {(showAllProjects ? projects : projects.slice(0, 3)).map(
                        (project, i) => (
                          <li key={i}>{project}</li>
                        )
                      )}
                    </ul>
                    {projects.length > 3 && (
                      <button
                        onClick={() => setShowAllProjects(!showAllProjects)}
                        className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium transition duration-200"
                      >
                        {showAllProjects
                          ? "Show less ↑"
                          : `+${projects.length - 3} more...`}
                      </button>
                    )}
                  </div>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {(showAllSkills ? skills : skills.slice(0, 5)).map(
                        (skill, i) => (
                          <span
                            key={i}
                            className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium"
                          >
                            {skill}
                          </span>
                        )
                      )}
                      {skills.length > 5 && (
                        <button
                          onClick={() => setShowAllSkills(!showAllSkills)}
                          className="text-sm px-3 py-1 rounded-full font-medium bg-gray-200 text-gray-600 hover:bg-gray-300 transition duration-200"
                        >
                          {showAllSkills
                            ? "Show less ↑"
                            : `+${skills.length - 5} more...`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Start Interview button */}
            <motion.button
              disabled={!role || !experience}
              whileHover={{ scale: role && experience ? 1.03 : 1 }}
              whileTap={{ scale: role && experience ? 0.95 : 1 }}
              className={`w-full py-3 rounded-full text-lg font-semibold transition duration-300 shadow-md text-white
                ${role && experience
                  ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
                }`}
            >
              Start Interview
            </motion.button>

          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default InterviewStep1;