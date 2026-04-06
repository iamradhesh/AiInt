import React from 'react'
import { motion } from 'framer-motion'

interface QuestionRowProps {
  question: {
    score?: number;
    question?: string;
    feedback?: string;
    answer?: string;
  };
  index: number;
}

function scoreColor(s: number): string {
  if (s >= 70) return "text-emerald-600";
  if (s >= 40) return "text-amber-500";
  return "text-red-500";
}

// function scoreBg(s: number): string {
//   if (s >= 70) return "bg-emerald-50 border-emerald-200 text-emerald-700";
//   if (s >= 40) return "bg-amber-50 border-amber-200 text-amber-700";
//   return "bg-red-50 border-red-200 text-red-600";
// }

function barFill(s: number): string {
  if (s >= 70) return "#10b981";
  if (s >= 40) return "#f59e0b";
  return "#ef4444";
}

const QuestionRowSec: React.FC<QuestionRowProps> = ({ question, index }) => {
  const [open, setOpen] = React.useState(false);
  const score = question.score ?? 0;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 text-xs font-bold text-gray-400 w-6 text-left">Q{index + 1}</span>
          <span className="text-sm text-gray-700 font-medium text-left truncate">
            {question.question ?? "Question not available"}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>{score}<span className="text-xs font-normal text-gray-400">/100</span></span>
          <div className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${open ? "bg-emerald-100 border-emerald-300" : "border-gray-300"} flex items-center justify-center`}>
            <span className={`text-[10px] font-bold text-gray-400 transition-transform duration-200 inline-block ${open ? "rotate-180" : ""}`}>▾</span>
          </div>
        </div>
      </button>

      {/* Progress bar inside row */}
      <div className="px-4 pb-1">
        <div className="w-full bg-gray-100 rounded-full h-1">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${score}%`, backgroundColor: barFill(score) }}
          />
        </div>
      </div>

      {/* Expanded detail */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25 }}
          className="px-4 py-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3"
        >
          {question.answer && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-1">Your Answer</p>
              <p className="text-sm text-gray-600 leading-relaxed">{question.answer}</p>
            </div>
          )}
          {question.feedback && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600 mb-1">AI Feedback</p>
              <p className="text-sm text-amber-800 leading-relaxed">{question.feedback}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default QuestionRowSec