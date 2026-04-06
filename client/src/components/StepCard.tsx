import { motion } from "framer-motion";

interface StepCardProps {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
  index: number;
}

const StepCard = ({ icon, step, title, description, index }: StepCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      whileHover={{ rotate: 0, scale: 1.05, y: -6 }}
      className={`
        relative bg-white/90 backdrop-blur-sm rounded-3xl
        p-8 pt-12
        border border-gray-200
        shadow-md hover:shadow-2xl
        transition-all duration-300
        text-center

        ${index === 0 ? "rotate-[-3deg]" : ""}
        ${index === 1 ? "rotate-[2deg]" : ""}
        ${index === 2 ? "rotate-[-2deg]" : ""}
        ${index === 3 ? "rotate-[3deg]" : ""}
      `}
    >
      {/* Icon */}
      <div
        className="absolute -top-7 left-1/2 -translate-x-1/2
        bg-white border border-green-200
        text-green-600
        w-14 h-14 rounded-xl
        flex items-center justify-center
        shadow-md"
      >
        {icon}
      </div>

      {/* Text */}
      <div className="mt-4">
        <div className="text-xs font-semibold text-green-600 tracking-widest mb-2">
          {step}
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default StepCard;