import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaChevronDown } from "react-icons/fa6";
import { GoDownload } from "react-icons/go";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  LineChart, Line, ReferenceLine,
} from "recharts";
import type { InterviewReport } from "../types/Interview";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QuestionRowSec from "./QuestionRowSec";

interface InterviewStep3Props { report: InterviewReport | null; }
interface QuestionItem { score?: number; question?: string; feedback?: string; answer?: string; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(s: number) {
  if (s >= 70) return "text-emerald-600";
  if (s >= 40) return "text-amber-500";
  return "text-red-500";
}
function scoreBg(s: number) {
  if (s >= 70) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (s >= 40) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-red-50 border-red-200 text-red-600";
}
function barFill(s: number) {
  if (s >= 70) return "#10b981";
  if (s >= 40) return "#f59e0b";
  return "#ef4444";
}
function scoreHex(s: number) {
  if (s >= 70) return "#059669";
  if (s >= 40) return "#d97706";
  return "#dc2626";
}
function scoreBgHex(s: number): { bg: string; color: string; border: string } {
  if (s >= 70) return { bg: "#ecfdf5", color: "#065f46", border: "#6ee7b7" };
  if (s >= 40) return { bg: "#fffbeb", color: "#92400e", border: "#fde68a" };
  return { bg: "#fef2f2", color: "#991b1b", border: "#fca5a5" };
}
function getPerformanceTier(score: number) {
  if (score >= 85) return { label: "Exceptional", tagline: "Top-tier performance", description: "Outstanding work — you demonstrated strong problem-solving, clear communication, and high confidence. You're ready for real-world opportunities." };
  if (score >= 70) return { label: "Strong", tagline: "Above average", description: "Solid performance with a good grasp of core concepts. With a little more refinement you can reach the next level." };
  if (score >= 50) return { label: "Developing", tagline: "Room to grow", description: "You understand the basics, but there are gaps in clarity and depth. Consistent practice will close the distance." };
  return { label: "Needs Work", tagline: "Keep practising", description: "Significant improvement is needed in fundamentals, confidence, and problem-solving. Focus on revision and daily practice." };
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] } }),
};

// ─── Print Report — simple table layout, zero Tailwind, zero charts ───────────

const PrintReport: React.FC<{
  finalScore: number; confidence: number; communication: number; correctness: number;
  questionsWiseScore: QuestionItem[]; role: string; mode: string; experience: string;
}> = ({ finalScore, confidence, communication, correctness, questionsWiseScore, role, mode, experience }) => {
  const tier = getPerformanceTier(finalScore);
  const tc   = scoreBgHex(finalScore);

  const metaItems = [role, experience, mode ? `${mode} mode` : ""].filter(Boolean);

  return (
    <div style={{ width: "780px", backgroundColor: "#ffffff", fontFamily: "Inter, system-ui, Arial, sans-serif", padding: "40px 48px", boxSizing: "border-box", color: "#1e293b" }}>

      {/* ── Title ── */}
      <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "20px", marginBottom: "28px" }}>
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
          Interview Report
        </h1>
        {metaItems.length > 0 && (
          <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
            {metaItems.map((item) => (
              <span key={item} style={{ fontSize: "11px", fontWeight: 600, background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "3px 10px", borderRadius: "999px", textTransform: "capitalize" }}>
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Overall Score Banner ── */}
      <div style={{ background: tc.bg, border: `1px solid ${tc.border}`, borderRadius: "12px", padding: "20px 24px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: 0, fontSize: "11px", fontWeight: 700, color: tc.color, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.7 }}>Overall Score</p>
          <p style={{ margin: "4px 0 0", fontSize: "40px", fontWeight: 900, color: tc.color, lineHeight: 1 }}>{finalScore}<span style={{ fontSize: "16px", fontWeight: 500, opacity: 0.6 }}>/100</span></p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: tc.color }}>{tier.label}</p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: tc.color, opacity: 0.75 }}>{tier.tagline}</p>
          <p style={{ margin: "8px 0 0", fontSize: "11px", color: tc.color, opacity: 0.7, maxWidth: "340px", lineHeight: 1.5 }}>{tier.description}</p>
        </div>
      </div>

      {/* ── Scores Table ── */}
      <h2 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Score Summary</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "32px", fontSize: "13px" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["Category", "Score", "Out of", "Rating"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { label: "Overall Score",  val: finalScore    },
            { label: "Confidence",     val: confidence    },
            { label: "Communication",  val: communication },
            { label: "Correctness",    val: correctness   },
          ].map(({ label, val }, i) => {
            const rating = val >= 70 ? "Good" : val >= 40 ? "Average" : "Needs Work";
            const c = scoreBgHex(val);
            return (
              <tr key={label} style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                <td style={{ padding: "11px 14px", fontWeight: label === "Overall Score" ? 700 : 500, color: "#1e293b", borderBottom: "1px solid #f1f5f9" }}>{label}</td>
                <td style={{ padding: "11px 14px", fontWeight: 800, fontSize: "15px", color: scoreHex(val), borderBottom: "1px solid #f1f5f9" }}>{val}</td>
                <td style={{ padding: "11px 14px", color: "#94a3b8", borderBottom: "1px solid #f1f5f9" }}>100</td>
                <td style={{ padding: "11px 14px", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: "2px 10px", borderRadius: "999px" }}>{rating}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ── Score Bars (simple visual) ── */}
      <h2 style={{ margin: "0 0 14px", fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Skills Breakdown</h2>
      <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
        {[
          { label: "Confidence",    val: confidence    },
          { label: "Communication", val: communication },
          { label: "Correctness",   val: correctness   },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" }}>
              <span style={{ fontWeight: 600, color: "#475569" }}>{label}</span>
              <span style={{ fontWeight: 700, color: scoreHex(val) }}>{val}/100</span>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: "999px", height: "8px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${val}%`, background: barFill(val), borderRadius: "999px" }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Question-by-Question Table ── */}
      <h2 style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em" }}>Question-by-Question Review</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", marginBottom: "16px" }}>
        <thead>
          <tr style={{ background: "#f8fafc" }}>
            {["#", "Question", "Score", "Rating"].map((h) => (
              <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {questionsWiseScore.map((q, i) => {
            const score  = q.score ?? 0;
            const rating = score >= 70 ? "Good" : score >= 40 ? "Average" : "Needs Work";
            const c      = scoreBgHex(score);
            return (
              <React.Fragment key={i}>
                <tr style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                  <td style={{ padding: "11px 14px", fontWeight: 700, color: "#94a3b8", borderBottom: q.feedback ? "none" : "1px solid #f1f5f9", verticalAlign: "top", width: "30px" }}>Q{i + 1}</td>
                  <td style={{ padding: "11px 14px", color: "#334155", lineHeight: 1.5, borderBottom: q.feedback ? "none" : "1px solid #f1f5f9", verticalAlign: "top" }}>{q.question ?? "—"}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 800, fontSize: "14px", color: scoreHex(score), borderBottom: q.feedback ? "none" : "1px solid #f1f5f9", verticalAlign: "top", whiteSpace: "nowrap" }}>{score}/100</td>
                  <td style={{ padding: "11px 14px", borderBottom: q.feedback ? "none" : "1px solid #f1f5f9", verticalAlign: "top" }}>
                    <span style={{ display: "inline-block", fontSize: "10px", fontWeight: 700, background: c.bg, color: c.color, border: `1px solid ${c.border}`, padding: "2px 10px", borderRadius: "999px" }}>{rating}</span>
                  </td>
                </tr>
                {q.feedback && (
                  <tr style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc" }}>
                    <td style={{ padding: "0 14px 12px 14px", borderBottom: "1px solid #f1f5f9" }} />
                    <td colSpan={3} style={{ padding: "0 14px 12px 14px", borderBottom: "1px solid #f1f5f9" }}>
                      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px", padding: "8px 12px" }}>
                        <p style={{ margin: "0 0 3px", fontSize: "9px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Feedback</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#78350f", lineHeight: 1.55 }}>{q.feedback}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* ── Footer ── */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8" }}>Generated by Interview AI</p>
        <p style={{ margin: 0, fontSize: "10px", color: "#94a3b8" }}>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
    </div>
  );
};

// ─── Sub-components (unchanged — for the visible UI) ──────────────────────────

const StatCard: React.FC<{ label: string; value: string; index: number; colorClass?: string }> = ({ label, value, index, colorClass = "text-gray-800" }) => (
  <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible"
    className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-0.5">
    <span className={`text-xl sm:text-2xl font-extrabold tabular-nums ${colorClass}`}>{value}</span>
    <span className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
  </motion.div>
);

const SkillBar: React.FC<{ label: string; value: number; index: number }> = ({ label, value, index }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex items-center justify-between text-sm">
      <span className="font-medium text-gray-600">{label}</span>
      <span className={`font-bold tabular-nums ${scoreColor(value)}`}>
        {value}<span className="font-normal text-gray-400 text-xs">/100</span>
      </span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <motion.div className="h-full rounded-full" style={{ backgroundColor: barFill(value) }}
        initial={{ width: 0 }} animate={{ width: `${value}%` }}
        transition={{ duration: 0.9, delay: 0.3 + index * 0.1, ease: [0.22, 1, 0.36, 1] }} />
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-gray-700">{label}</p>
      <p className={`font-bold ${scoreColor(val)}`}>{val}<span className="text-gray-400 font-normal">/100</span></p>
    </div>
  );
};

const QuestionRow: React.FC<{ question: QuestionItem; index: number }> = ({ question, index }) => {
  const [open, setOpen] = useState(false);
  const score = question.score ?? 0;
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50 transition-colors duration-150 text-left">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-xs font-bold text-gray-400 w-7">Q{index + 1}</span>
          <span className="text-sm text-gray-700 font-medium truncate">{question.question ?? "Question not available"}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>{score}<span className="text-xs font-normal text-gray-400">/100</span></span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <FaChevronDown className="text-gray-400 w-3 h-3" />
          </motion.div>
        </div>
      </button>
      <div className="px-4 pb-2">
        <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: barFill(score) }} />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
              {question.answer && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Your Answer</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{question.answer}</p>
                </div>
              )}
              {question.feedback && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">AI Feedback</p>
                  <p className="text-sm text-amber-800 leading-relaxed">{question.feedback}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const InterviewStep3: React.FC<InterviewStep3Props> = ({ report }) => {
  const navigate   = useNavigate();
  const printRef   = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (): Promise<void> => {
    const el = printRef.current;
    if (!el || downloading) return;
    setDownloading(true);

    try {
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 780,
      });

      const pdf     = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW   = pdf.internal.pageSize.getWidth();
      const pageH   = pdf.internal.pageSize.getHeight();
      const margin  = 0;
      const usableW = pageW - margin * 2;
      const usableH = pageH - margin * 2;

      const ratio  = usableW / (canvas.width / 2);
      const totalH = (canvas.height / 2) * ratio;

      let yOffset = 0, pageNum = 0;
      while (yOffset < totalH) {
        if (pageNum > 0) pdf.addPage();
        const srcY      = (yOffset / ratio) * 2;
        const sliceH_mm = Math.min(usableH, totalH - yOffset);
        const sliceH_px = (sliceH_mm / ratio) * 2;

        const slice   = document.createElement("canvas");
        slice.width   = canvas.width;
        slice.height  = Math.ceil(sliceH_px);
        const ctx     = slice.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, -srcY);

        pdf.addImage(slice.toDataURL("image/png"), "PNG", margin, margin, usableW, sliceH_mm);
        yOffset += usableH;
        pageNum++;
      }

      pdf.save("interview-report.pdf");
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setDownloading(false);
    }
  };

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading report…</p>
        </div>
      </div>
    );
  }

  const {
    finalScore = 0, confidence = 0, communication = 0, correctness = 0,
    questionsWiseScore = [], role = "", mode = "", experience = "",
  } = report as {
    finalScore?: number; confidence?: number; communication?: number; correctness?: number;
    questionsWiseScore?: QuestionItem[]; role?: string; mode?: string; experience?: string;
  };

  const tier          = getPerformanceTier(finalScore);
  const circumference = 2 * Math.PI * 48;
  const barData       = questionsWiseScore.map((q, i) => ({ name: `Q${i + 1}`, score: q.score ?? 0 }));
  const lineData      = questionsWiseScore.map((q, i) => ({ name: `Q${i + 1}`, score: q.score ?? 0 }));
  const radarData     = [
    { subject: "Confidence",    value: confidence    },
    { subject: "Communication", value: communication },
    { subject: "Correctness",   value: correctness   },
    { subject: "Overall",       value: finalScore    },
  ];
  const skills = [
    { label: "Confidence",    value: confidence    },
    { label: "Communication", value: communication },
    { label: "Correctness",   value: correctness   },
  ];

  return (
    <>
      {/* Hidden print clone */}
      <div style={{ position: "fixed", top: 0, left: "-9999px", zIndex: -1 }} aria-hidden="true">
        <div ref={printRef}>
          <PrintReport
            finalScore={finalScore} confidence={confidence}
            communication={communication} correctness={correctness}
            questionsWiseScore={questionsWiseScore}
            role={role} mode={mode} experience={experience}
          />
        </div>
      </div>

      {/* Visible UI — unchanged */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">

        <div className="mb-6 sm:mb-8 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <motion.button onClick={() => navigate("/history")}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="shrink-0 mt-0.5 p-2.5 rounded-full bg-white shadow-sm hover:bg-emerald-50 transition-all duration-200">
              <FaArrowLeft className="text-gray-500 w-3.5 h-3.5" />
            </motion.button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-800 leading-tight">Interview Report</h1>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {role       && <span className="text-[10px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full capitalize">{role}</span>}
                {experience && <span className="text-[10px] sm:text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full capitalize">{experience}</span>}
                {mode       && <span className="text-[10px] sm:text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full capitalize">{mode} mode</span>}
              </div>
            </div>
          </div>
          <motion.button onClick={handleDownload} disabled={downloading}
            whileHover={!downloading ? { scale: 1.04 } : {}} whileTap={!downloading ? { scale: 0.96 } : {}}
            className="shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl shadow-sm font-semibold text-xs sm:text-sm transition-colors duration-150">
            {downloading
              ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <GoDownload size={15} />}
            <span className="hidden sm:inline">{downloading ? "Generating…" : "Download Report"}</span>
          </motion.button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard index={0} label="Overall Score"  value={`${finalScore}/100`}    colorClass={scoreColor(finalScore)} />
          <StatCard index={1} label="Confidence"     value={`${confidence}/100`}    colorClass={scoreColor(confidence)} />
          <StatCard index={2} label="Communication"  value={`${communication}/100`} colorClass={scoreColor(communication)} />
          <StatCard index={3} label="Correctness"    value={`${correctness}/100`}   colorClass={scoreColor(correctness)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="flex flex-col gap-4 sm:gap-6">

            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 text-center">
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Overall Performance</p>
              <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center mb-4">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 112 112">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                  <motion.circle cx="56" cy="56" r="48" fill="none"
                    stroke={finalScore >= 70 ? "#10b981" : finalScore >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference * (1 - finalScore / 100) }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} />
                </svg>
                <div className="relative flex flex-col items-center">
                  <span className={`text-2xl sm:text-3xl font-extrabold tabular-nums ${scoreColor(finalScore)}`}>{finalScore}</span>
                  <span className="text-xs text-gray-400 font-medium">/100</span>
                </div>
              </div>
              <span className={`inline-block text-xs sm:text-sm font-bold px-3 py-1 rounded-full border ${scoreBg(finalScore)} mb-3`}>
                {tier.label} · {tier.tagline}
              </span>
              <p className="text-xs text-gray-500 leading-relaxed">{tier.description}</p>
            </motion.div>

            <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Skills Breakdown</p>
              <div className="flex flex-col gap-4">
                {skills.map((s, i) => <SkillBar key={s.label} label={s.label} value={s.value} index={i} />)}
              </div>
            </motion.div>

            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Skill Radar</p>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                  <PolarGrid stroke="#f3f4f6" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#9ca3af" }} />
                  <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.18} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Score Per Question</p>
                <span className="text-[11px] text-gray-400">{barData.length} questions</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={24} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} width={28} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                  <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="4 4" />
                  <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => <Cell key={i} fill={barFill(entry.score)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">Score Trend</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-gray-400">Per question</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={lineData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} width={28} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e5e7eb" }} />
                  <ReferenceLine y={50} stroke="#e5e7eb" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <p className="text-sm font-semibold text-gray-700 mb-4">Question-by-Question Review</p>
              <div className="flex flex-col gap-2.5">
                {questionsWiseScore.map((q, i) => (
                  <QuestionRowSec key={i} question={q} index={i} />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InterviewStep3;