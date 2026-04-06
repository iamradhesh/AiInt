import { motion } from "framer-motion";

interface AnalyzeButtonProps {
  analyzing: boolean;
  onAnalyze: () => void;
}


const AnalyzeButton = ({ analyzing, onAnalyze }: AnalyzeButtonProps) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onAnalyze}
    disabled={analyzing}
    className={`w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300
      ${analyzing
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-gray-900 text-white hover:bg-gray-700 shadow-md hover:shadow-lg cursor-pointer"
      }`}
  >
    {analyzing ? (
      <>
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Analyzing...
      </>
    ) : "Analyze Resume"}
  </motion.button>
);

export default AnalyzeButton;