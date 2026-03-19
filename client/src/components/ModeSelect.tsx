import React, { useState, useRef, useEffect } from "react";
import { FiMonitor, FiBriefcase, FiZap, FiChevronDown, FiCheck } from "react-icons/fi";

const modes = [
  {
    value: "technical",
    label: "Technical Interview",
    desc: "Algorithms, system design & coding",
    icon: <FiMonitor size={16} />,
    bg: "bg-blue-50",
    text: "text-blue-500",
  },
  {
    value: "behavioral",
    label: "Behavioral Interview",
    desc: "Soft skills, STAR method & scenarios",
    icon: <FiBriefcase size={16} />,
    bg: "bg-purple-50",
    text: "text-purple-500",
  },
  {
    value: "mixed",
    label: "Mixed Mode",
    desc: "Both technical & behavioral questions",
    icon: <FiZap size={16} />,
    bg: "bg-green-50",
    text: "text-green-500",
  },
];

interface ModeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const ModeSelect = ({ value, onChange }: ModeSelectProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = modes.find((m) => m.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center gap-3 px-4 py-3 border rounded-2xl bg-white transition-all duration-200 hover:cursor-pointer
          ${open
            ? "border-green-500 ring-2 ring-green-100"
            : "border-gray-200 hover:border-gray-300"
          }`}
      >
        {/* Icon */}
        <span
          className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0
            ${selected ? `${selected.bg} ${selected.text}` : "bg-gray-100 text-gray-400"}`}
        >
          {selected ? selected.icon : <FiBriefcase size={16} />}
        </span>

        {/* Label */}
        <span className={`flex-1 text-left text-sm font-[DM_Sans] ${selected ? "text-gray-800" : "text-gray-400"}`}>
          {selected ? selected.label : "Select interview mode"}
        </span>

        {/* Chevron */}
        <FiChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-250 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden
            animate-[dropIn_.2s_ease]"
        >
          {modes.map((mode, i) => (
            <button
              key={mode.value}
              role="option"
              aria-selected={value === mode.value}
              type="button"
              onClick={() => {
                onChange(mode.value);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150
                ${i < modes.length - 1 ? "border-b border-gray-100" : ""}
                ${value === mode.value ? "bg-green-50" : "hover:bg-gray-50"}`}
            >
              {/* Mode icon */}
              <span className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${mode.bg} ${mode.text}`}>
                {mode.icon}
              </span>

              {/* Label + description */}
              <span className="flex flex-col flex-1">
                <span className="text-sm font-medium text-gray-800 font-[DM_Sans]">{mode.label}</span>
                <span className="text-xs text-gray-400 font-[DM_Sans]">{mode.desc}</span>
              </span>

              {/* Checkmark for selected */}
              {value === mode.value && (
                <FiCheck size={16} className="text-green-500 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModeSelect;