import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { InterviewHistoryType } from "../types/Interview";
import { scoreColor, scoreBg, scoreLabel, formatDate } from "../components/Scoreutils";
import ScoreBox from "./Scorebox";
import StatusBadge from "./Statusbadge";
import ScoreBar from "./Scorebar";

interface InterviewCardProps {
  interview: InterviewHistoryType;
  index: number;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ interview, index }) => {
  const navigate = useNavigate();
  const { date, time } = formatDate(interview.createdAt);
  const score = interview.finalScore ?? 0;
  const isCompleted = interview.status === "completed";

  const handleClick = (): void => {
    navigate(`/report/${interview._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleClick}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 overflow-hidden cursor-pointer"
    >
      {/* Top accent bar */}
      <div
        className={`h-1 w-full ${
          isCompleted
            ? "bg-gradient-to-r from-emerald-400 to-teal-400"
            : "bg-gradient-to-r from-amber-300 to-yellow-300"
        }`}
      />

      <div className="p-5 flex flex-col gap-4">

        {/* Header: role + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5 min-w-0">
            <h3 className="text-base font-bold text-gray-800 leading-snug truncate group-hover:text-emerald-700 transition-colors duration-200">
              {interview.role}
            </h3>
            <p className="text-xs text-gray-400 capitalize">
              {interview.experience} exp · {interview.mode} mode
            </p>
          </div>
          <StatusBadge status={interview.status} />
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-50" />

        {/* Score row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScoreBox score={score} />
            <div className="flex flex-col gap-0.5">
              <span className={`text-sm font-bold ${scoreColor(score)}`}>
                {scoreLabel(score)}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${scoreBg(score)}`}>
                {score}/100
              </span>
            </div>
          </div>

          {/* Date + time */}
          <div className="text-right flex flex-col gap-0.5">
            <span className="text-xs font-medium text-gray-600">{date}</span>
            <span className="text-[11px] text-gray-400">{time}</span>
          </div>
        </div>

        {/* Progress bar */}
        <ScoreBar score={score} delay={index * 0.06 + 0.2} />

        {/* View report hint — appears on hover */}
        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mt-1">
          <span className="text-[11px] font-semibold text-emerald-600">View Report</span>
          <span className="text-emerald-500 text-xs">→</span>
        </div>

      </div>
    </motion.div>
  );
};

export default InterviewCard;