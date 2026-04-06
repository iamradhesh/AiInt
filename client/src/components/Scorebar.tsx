import React from "react";
import { motion } from "framer-motion";
import { scoreBarColor } from "./Scoreutils";

interface ScoreBarProps {
  score: number;
  delay?: number;
}

const ScoreBar: React.FC<ScoreBarProps> = ({ score, delay = 0 }) => (
  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
    <motion.div
      className={`h-full rounded-full ${scoreBarColor(score)}`}
      initial={{ width: 0 }}
      animate={{ width: `${score}%` }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    />
  </div>
);

export default ScoreBar;