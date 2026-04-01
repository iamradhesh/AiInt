import React from "react";
import { scoreColor, scoreRingBg } from "./Scoreutils";

interface ScoreBoxProps {
  score: number;
}

const ScoreBox: React.FC<ScoreBoxProps> = ({ score }) => (
  <div
    className={`shrink-0 h-16 w-16 rounded-2xl ring-2 flex flex-col items-center justify-center gap-0.5 ${scoreRingBg(score)}`}
  >
    <span className={`text-xl font-extrabold tabular-nums leading-none ${scoreColor(score)}`}>
      {score}
    </span>
    <span className="text-[10px] font-medium text-gray-400 leading-none">/100</span>
  </div>
);

export default ScoreBox;