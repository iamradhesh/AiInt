import React from "react";
import { motion } from "framer-motion";
import { scoreColor } from "./Scoreutils";

interface SummaryStatsProps {
  total: number;
  completed: number;
  avgScore: number;
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ total, completed, avgScore }) => {
  const stats: { label: string; value: string; color: string }[] = [
    { label: "Total Sessions", value: String(total),       color: "text-gray-700" },
    { label: "Completed",      value: String(completed),   color: "text-emerald-600" },
    { label: "Average Score",  value: `${avgScore}/100`,   color: scoreColor(avgScore) },
  ];

  return (
    <motion.div
      className="grid grid-cols-3 gap-4 mb-8"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {stats.map(({ label, value, color }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex flex-col gap-1"
        >
          <span className={`text-xl font-extrabold tabular-nums ${color}`}>{value}</span>
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">
            {label}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

export default SummaryStats;