import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import type { InterviewHistoryType } from "../types/Interview";

import InterviewCard from "../components/InterviewCard";
import SkeletonCard  from "../components/Skeletoncard";
import EmptyState    from "../components/Emptystate";
import ErrorBanner   from "../components/Errorbanner";
import SummaryStats  from "../components/Summarystats";

const ServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';



const InterviewHistory: React.FC = () => {
  const [interviews, setInterviews] = useState<InterviewHistoryType[]>([]);
  const [loading,    setLoading]    = useState<boolean>(true);
  const [error,      setError]      = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async (): Promise<void> => {
      try {
        setLoading(true);
        setError("");
        const result = await axios.get<{ interviews: InterviewHistoryType[] }>(
          `${ServerUrl}/api/interview/get-interview`,
          { withCredentials: true },
        );
        setInterviews(result.data.interviews ?? []);
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? err.response?.data?.message ?? err.message
          : "Failed to load interview history.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void fetchInterviews();
  }, []);

  const completedCount = interviews.filter((i) => i.status === "completed").length;
  const avgScore =
    interviews.length > 0
      ? Math.round(
          interviews.reduce((sum, i) => sum + (i.finalScore ?? 0), 0) /
            interviews.length,
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 py-10">
      <div className="w-[90vw] lg:w-[75vw] max-w-6xl mx-auto">

        {/* ── Page header ─────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-start gap-4">
          <motion.button
            onClick={() => navigate("/")}
            className="mt-1 p-3 rounded-full bg-white shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaArrowLeft className="text-gray-500 w-4 h-4" />
          </motion.button>

          <div>
            <h1 className="text-3xl font-bold text-gray-800">Interview History</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Review your past sessions and track progress over time.
            </p>
          </div>
        </div>

        {/* ── Summary stats ────────────────────────────────────────────── */}
        <AnimatePresence>
          {!loading && interviews.length > 0 && (
            <SummaryStats
              total={interviews.length}
              completed={completedCount}
              avgScore={avgScore}
            />
          )}
        </AnimatePresence>

        {/* ── Error banner ─────────────────────────────────────────────── */}
        <AnimatePresence>
          {error && <ErrorBanner message={error} />}
        </AnimatePresence>

        {/* ── Cards grid ───────────────────────────────────────────────── */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : interviews.length === 0 ? (
            <EmptyState />
          ) : (
            interviews.map((interview, index) => (
              <InterviewCard
                key={interview._id ?? index}
                interview={interview}
                index={index}
                
              />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default InterviewHistory;