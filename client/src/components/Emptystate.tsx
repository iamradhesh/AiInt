import React from "react";
import { motion } from "framer-motion";
import { FaClipboardList } from "react-icons/fa";

const EmptyState: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="col-span-full bg-white rounded-2xl border border-dashed border-gray-200 p-14 text-center flex flex-col items-center gap-4"
  >
    <div className="h-14 w-14 rounded-full bg-emerald-50 flex items-center justify-center">
      <FaClipboardList className="text-emerald-400 text-2xl" />
    </div>
    <div>
      <p className="text-base font-semibold text-gray-700">No interviews yet</p>
      <p className="text-sm text-gray-400 mt-1">
        Start your first practice interview to see your history here.
      </p>
    </div>
  </motion.div>
);

export default EmptyState;