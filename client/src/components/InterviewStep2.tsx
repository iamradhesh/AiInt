import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import femaleVideo from "../assets/female-ai.mp4";
import maleVideo from "../assets/male-ai.mp4";
import Timer from "./Timer";
import type { InterviewSetup, InterviewReport } from "../types/Interview";
import axios from "axios";
const ServerUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

// ─── Browser SpeechRecognition type augmentation ──────────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((e: Event) => void) | null;
  onend: ((e: Event) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}
function getSpeechRecognition(): (new () => SpeechRecognitionInstance) | null {
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InterviewStep2Props {
  interviewData: InterviewSetup;
  onFinish: (report: InterviewReport) => void;
}

// ─── Local Types ──────────────────────────────────────────────────────────────

type InputMode = "voice" | "text";
type Phase = "ai-speaking" | "user-answering" | "feedback";
type RecordingState = "idle" | "recording" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";
type FinishState  = "idle" | "finishing" | "error";

interface QuestionAnswer {
  questionIndex: number;
  answer: string;
  mode: InputMode;
}

// Feedback returned by the API after evaluating an answer
interface AnswerFeedback {
  score: number;
  feedback: string;
  improvement: string;
  confidence: number;
  communication: number;
  correctness: number;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const cardVariants     = { hidden: { opacity: 0, y: 24 },  visible: { opacity: 1, y: 0 } };
const panelVariants    = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };
const rightVariants    = { hidden: { opacity: 0, x: 20 },  visible: { opacity: 1, x: 0 } };
const staggerContainer = { hidden: {}, visible: {} };
const fadeUpTransition = { duration: 0.35, ease: [0, 0, 0.58, 1] };

const modeTransition = {
  initial: { opacity: 0, y: 10, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1    },
  exit:    { opacity: 0, y: -8, scale: 0.98 },
  transition: { duration: 0.22, ease: [0, 0, 0.58, 1] },
};
const questionTransition = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0, 0, 0.58, 1] } },
  exit:    { opacity: 0, x: -30, transition: { duration: 0.2 } },
};
// Add this with your other animation variants at the top
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

// ─── Constants ────────────────────────────────────────────────────────────────

const WAVE_HEIGHTS: number[] = [3, 6, 9, 5, 11, 7, 4, 8, 12, 6, 3, 9, 5, 11, 7, 4, 8, 6, 3];
const CHAR_LIMIT = 1000;

const DIFFICULTY_COLORS: Record<"easy" | "medium" | "hard", string> = {
  easy:   "bg-emerald-50 text-emerald-700 border-emerald-100",
  medium: "bg-amber-50   text-amber-700   border-amber-100",
  hard:   "bg-red-50     text-red-700     border-red-100",
};

function scoreColor(s: number) {
  if (s >= 70) return "text-emerald-600";
  if (s >= 40) return "text-amber-500";
  return "text-red-500";
}
function scoreBg(s: number) {
  if (s >= 70) return "bg-emerald-50 border-emerald-200";
  if (s >= 40) return "bg-amber-50   border-amber-200";
  return "bg-red-50 border-red-200";
}

// ─── Speech Synthesis Helpers ─────────────────────────────────────────────────

const PAUSE_MAP: { regex: RegExp; pause: number }[] = [
  { regex: /[.!?]\s+/g, pause: 520 },
  { regex: /[,;]\s+/g,  pause: 280 },
  { regex: /:\s+/g,     pause: 350 },
  { regex: /[—–]\s*/g,  pause: 220 },
];

interface SpeechChunk { text: string; pauseAfter: number }

function buildSpeechChunks(text: string): SpeechChunk[] {
  const pts: { end: number; pause: number }[] = [];
  for (const { regex, pause } of PAUSE_MAP) {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) pts.push({ end: m.index + m[0].length, pause });
  }
  pts.sort((a, b) => a.end - b.end);
  const deduped: { end: number; pause: number }[] = [];
  for (const sp of pts) {
    const last = deduped[deduped.length - 1];
    if (last && Math.abs(last.end - sp.end) <= 2) last.pause = Math.max(last.pause, sp.pause);
    else deduped.push({ ...sp });
  }
  const chunks: SpeechChunk[] = [];
  let cursor = 0;
  for (const { end, pause } of deduped) {
    const slice = text.slice(cursor, end).trim();
    if (slice) chunks.push({ text: slice, pauseAfter: pause });
    cursor = end;
  }
  const tail = text.slice(cursor).trim();
  if (tail) chunks.push({ text: tail, pauseAfter: 0 });
  return chunks.length ? chunks : [{ text: text.trim(), pauseAfter: 0 }];
}

interface VoiceResult { voice: SpeechSynthesisVoice | null; isMale: boolean }
const MALE_KW   = ["david", "mark", "james", "guy", "male", "daniel", "alex", "matthew"];
const FEMALE_KW = ["zira", "jenny", "aria", "sonia", "natasha", "karen", "samantha", "female"];

function pickVoice(voices: SpeechSynthesisVoice[]): VoiceResult {
  const lc  = (v: SpeechSynthesisVoice) => v.name.toLowerCase();
  const pool = voices.filter((v) => /^en/i.test(v.lang));
  const src  = pool.length ? pool : voices;
  for (const kw of MALE_KW)   { const v = src.find((v) => lc(v).includes(kw)); if (v) return { voice: v, isMale: true }; }
  for (const kw of FEMALE_KW) { const v = src.find((v) => lc(v).includes(kw)); if (v) return { voice: v, isMale: false }; }
  return { voice: src[0] ?? null, isMale: true };
}

function speakWithNaturalPauses(
  chunks: SpeechChunk[],
  voice: SpeechSynthesisVoice | null,
  cb: { onChunkStart(): void; onChunkEnd(): void; onDone(): void; onError(): void },
): () => void {
  let cancelled = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let active: SpeechSynthesisUtterance | null = null;

  const cancel = () => {
    cancelled = true;
    if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    if (active) { active.onstart = null; active.onend = null; active.onerror = null; active = null; }
    window.speechSynthesis.cancel();
  };

  const speakChunk = (i: number) => {
    if (cancelled || i >= chunks.length) { if (!cancelled) cb.onDone(); return; }
    const { text, pauseAfter } = chunks[i];
    const utt = new SpeechSynthesisUtterance(text);
    active = utt;
    utt.rate = 0.92; utt.pitch = 1.02; utt.volume = 1.0;
    if (voice) utt.voice = voice;
    utt.onstart = () => { if (!cancelled) cb.onChunkStart(); };
    utt.onend   = () => {
      if (cancelled) return;
      active = null; cb.onChunkEnd();
      if (pauseAfter > 0) {
        const jitter = (Math.random() - 0.5) * 80;
        timeoutId = setTimeout(() => { timeoutId = null; speakChunk(i + 1); }, pauseAfter + jitter);
      } else speakChunk(i + 1);
    };
    utt.onerror = (e) => {
      if (cancelled) return;
      active = null;
      if (e.error === "interrupted" || e.error === "canceled") return;
      cb.onError();
    };
    window.speechSynthesis.speak(utt);
  };

  window.speechSynthesis.cancel();
  timeoutId = setTimeout(() => { timeoutId = null; speakChunk(0); }, 80);
  return cancel;
}

// ─── Score Bar Sub-component ──────────────────────────────────────────────────

const ScoreBar: React.FC<{ label: string; value: number; delay: number; rm: boolean | null }> = ({ label, value, delay, rm }) => (
  <div className="flex flex-col gap-1.5">
    <div className="flex justify-between items-center">
      <span className="text-[11px] font-medium text-gray-500">{label}</span>
      <span className={`text-[11px] font-bold tabular-nums ${scoreColor(value)}`}>{value}<span className="font-normal text-gray-300">/100</span></span>
    </div>
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${value >= 70 ? "bg-emerald-400" : value >= 40 ? "bg-amber-400" : "bg-red-400"}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={rm ? { duration: 0 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  </div>
);

// ─── Feedback Panel Component ─────────────────────────────────────────────────

interface FeedbackPanelProps {
  feedback: AnswerFeedback;
  isLast: boolean;
  onContinue(): void;
  rm: boolean | null;
  autoFinishCountdown: number | null;
  autoFinishTotal: number;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, isLast, onContinue, rm, autoFinishCountdown, autoFinishTotal }) => {
  const hasImprovement = feedback.improvement?.trim().length > 0;
  const showCountdown  = isLast && autoFinishCountdown !== null;

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={rm ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={rm ? {} : { duration: 0.4, ease: "easeOut" }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 shadow-sm">
          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-semibold text-gray-700 leading-none">Answer Submitted</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Here's what the interviewer thinks</p>
        </div>
        {/* Score badge */}
        <span className={`ml-auto text-sm font-extrabold px-3 py-1 rounded-full border tabular-nums ${scoreBg(feedback.score)} ${scoreColor(feedback.score)}`}>
          {feedback.score}<span className="text-xs font-medium opacity-60">/100</span>
        </span>
      </div>

      {/* AI speech bubble */}
      <div className="relative">
        {/* Bubble tail */}
        <div className="absolute -top-2 left-6 w-4 h-2.5 overflow-hidden pointer-events-none">
          <div className="w-3 h-3 bg-gray-50 border-l border-t border-gray-200 rotate-45 translate-y-[7px] translate-x-0.5" />
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5">
          <p className="text-sm text-gray-700 leading-relaxed">{feedback.feedback || "Answer recorded."}</p>
        </div>
      </div>

      {/* Coach's tip — amber callout, only when improvement text exists */}
      {hasImprovement && (
        <motion.div
          className="flex gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3.5"
          initial={rm ? {} : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={rm ? {} : { duration: 0.35, delay: 0.15, ease: "easeOut" }}
        >
          <div className="shrink-0 mt-0.5">
            {/* Lightbulb icon */}
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5">Coach's Tip</p>
            <p className="text-sm text-amber-900 leading-relaxed">{feedback.improvement}</p>
          </div>
        </motion.div>
      )}

      {/* Score breakdown bars */}
      <motion.div
        className="bg-white border border-gray-100 rounded-2xl px-4 py-4 flex flex-col gap-3.5"
        initial={rm ? {} : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={rm ? {} : { duration: 0.35, delay: 0.25, ease: "easeOut" }}
      >
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Score Breakdown</p>
        <ScoreBar label="Confidence"    value={feedback.confidence}    delay={0.35} rm={rm} />
        <ScoreBar label="Communication" value={feedback.communication} delay={0.45} rm={rm} />
        <ScoreBar label="Correctness"   value={feedback.correctness}   delay={0.55} rm={rm} />
      </motion.div>

      {/* Continue CTA + auto-finish countdown ring */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3"
        initial={rm ? {} : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={rm ? {} : { delay: 0.55, duration: 0.3 }}
      >
        {/* Countdown indicator — only on last question */}
        {showCountdown && (
          <motion.div
            className="flex items-center gap-2 text-[11px] font-medium text-gray-400"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          >
            {/* Circular countdown ring */}
            <div className="relative h-7 w-7 shrink-0">
              <svg className="absolute inset-0 -rotate-90" width="28" height="28" viewBox="0 0 28 28">
                {/* Track */}
                <circle cx="14" cy="14" r="11" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
                {/* Progress — shrinks as countdown decreases */}
                <motion.circle
                  cx="14" cy="14" r="11"
                  fill="none"
                  stroke={autoFinishCountdown !== null && autoFinishCountdown <= 5 ? "#f59e0b" : "#10b981"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 11}`}
                  strokeDashoffset={
                    autoFinishCountdown !== null
                      ? `${2 * Math.PI * 11 * (1 - autoFinishCountdown / autoFinishTotal)}`
                      : 0
                  }
                  style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
                />
              </svg>
              {/* Number in centre */}
              <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums ${
                autoFinishCountdown !== null && autoFinishCountdown <= 5 ? "text-amber-500" : "text-emerald-600"
              }`}>
                {autoFinishCountdown}
              </span>
            </div>
            <span>Auto-continuing in <span className="tabular-nums font-semibold text-gray-500">{autoFinishCountdown}s</span></span>
          </motion.div>
        )}

        <motion.button
          onClick={onContinue}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-colors duration-150"
          whileHover={rm ? {} : { scale: 1.03 }}
          whileTap={rm  ? {} : { scale: 0.96 }}
        >
          {isLast ? "See Final Results" : "Next Question"}
          <motion.svg
            className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            animate={rm ? {} : { x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </motion.svg>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const InterviewStep2: React.FC<InterviewStep2Props> = ({ interviewData, onFinish }) => {
  const questions      = interviewData.interview.questions;
  const totalQuestions = questions.length;

  const [isMaleVoice,     setIsMaleVoice]     = useState<boolean>(true);
  const [currentIndex,    setCurrentIndex]    = useState<number>(0);
  const [phase,           setPhase]           = useState<Phase>("ai-speaking");
  const [videoPlaying,    setVideoPlaying]    = useState<boolean>(false);
  const [aiTimeElapsed,   setAiTimeElapsed]   = useState<number>(0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  const currentQuestion = questions[currentIndex];
  const userTotalTime   = currentQuestion?.timeLimit ?? 60;
  const [userTimeElapsed, setUserTimeElapsed] = useState<number>(0);

  const [inputMode,     setInputMode]     = useState<InputMode>("voice");
  const [textAnswer,    setTextAnswer]    = useState<string>("");
  const [answers,       setAnswers]       = useState<QuestionAnswer[]>([]);
  const [submitState,   setSubmitState]   = useState<SubmitState>("idle");
  const [submitError,   setSubmitError]   = useState<string>("");
  const [finishState,   setFinishState]   = useState<FinishState>("idle");
  const [finishError,   setFinishError]   = useState<string>("");
  const [currentFeedback, setCurrentFeedback] = useState<AnswerFeedback | null>(null);

  // ── Auto-finish countdown (last question only) ─────────────────────────────
  // Counts DOWN from 15 → 0 while on the feedback phase of the last question.
  // Reaches 0 → automatically navigates to the report page.
  // User can short-circuit at any time via "Finish Interview" / "End Interview".
  const AUTO_FINISH_SECONDS = 15;
  const [autoFinishCountdown, setAutoFinishCountdown] = useState<number | null>(null);
  const autoFinishTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAutoFinish = useCallback(() => {
    if (autoFinishTimerRef.current) {
      clearInterval(autoFinishTimerRef.current);
      autoFinishTimerRef.current = null;
    }
    setAutoFinishCountdown(null);
  }, []);

  const [recordingState,    setRecordingState]    = useState<RecordingState>("idle");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [sttSupported,      setSttSupported]      = useState<boolean>(true);
  const [micPermission,     setMicPermission]     = useState<"unknown" | "granted" | "denied">("unknown");

  const recognitionRef  = useRef<SpeechRecognitionInstance | null>(null);
  const textareaRef     = useRef<HTMLTextAreaElement>(null);
  const videoRef        = useRef<HTMLVideoElement>(null);
  const cancelSpeechRef = useRef<(() => void) | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const questionNumber  = currentIndex + 1;
  const isLastQuestion  = currentIndex === totalQuestions - 1;
  const isAiSpeaking    = phase === "ai-speaking";
  const isUserAnswering = phase === "user-answering";
  const isFeedbackPhase = phase === "feedback";
  const isRecording     = recordingState === "recording";
  const isSubmitting    = submitState === "submitting";

  const charsLeft  = CHAR_LIMIT - textAnswer.length;
  const wordCount  = textAnswer.split(/\s+/).filter(Boolean).length;
  const isNextDisabled = isAiSpeaking || isSubmitting || isFeedbackPhase ||
    (inputMode === "text" && textAnswer.trim().length === 0);

  // ── STT support check ──────────────────────────────────────────────────────
  useEffect(() => { if (!getSpeechRecognition()) setSttSupported(false); }, []);

  // ── Video sync ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (videoPlaying) vid.play().catch(() => {});
    else vid.pause();
  }, [videoPlaying]);

  // ── Stop recognition ───────────────────────────────────────────────────────
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setRecordingState("idle");
    setInterimTranscript("");
  }, []);

  // ── Start recognition ──────────────────────────────────────────────────────
  const startRecognition = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR || !sttSupported) return;
    stopRecognition();

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = "en-US"; rec.continuous = true; rec.interimResults = true; rec.maxAlternatives = 1;

    rec.onstart = () => { setRecordingState("recording"); setMicPermission("granted"); };

    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "", finalSeg = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalSeg += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (finalSeg) {
        setTextAnswer((prev) => {
          const t = prev.trim();
          return (t + (t ? " " : "") + finalSeg.trim()).slice(0, CHAR_LIMIT);
        });
        setInterimTranscript("");
      } else setInterimTranscript(interim);
    };

    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed" || e.error === "permission-denied") {
        setMicPermission("denied"); setRecordingState("error");
      } else if (e.error !== "aborted") setRecordingState("idle");
      setInterimTranscript("");
    };

    rec.onend = () => {
      setInterimTranscript("");
      setRecordingState((prev) => {
        if (prev === "recording") setTimeout(() => { if (recognitionRef.current === rec) startRecognition(); }, 200);
        return prev;
      });
    };

    try { rec.start(); } catch { setRecordingState("error"); }
  }, [sttSupported, stopRecognition]);

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecognition();
    else { setInputMode("voice"); startRecognition(); }
  }, [isRecording, startRecognition, stopRecognition]);

  // ── Reset on question change ───────────────────────────────────────────────
  useEffect(() => {
    stopRecognition();
    if (cancelSpeechRef.current) { cancelSpeechRef.current(); cancelSpeechRef.current = null; }

    setPhase("ai-speaking");
    setVideoPlaying(false);
    setAiTimeElapsed(0);
    setUserTimeElapsed(0);
    setTextAnswer("");
    setInterimTranscript("");
    setInputMode("voice");
    setCurrentFeedback(null);
    setSubmitState("idle");
    setSubmitError("");
    clearAutoFinish();

    const questionText = questions[currentIndex]?.question ?? "";
    if (!questionText) { setPhase("user-answering"); return; }

    const startSpeech = (voices: SpeechSynthesisVoice[]) => {
      const { voice, isMale } = pickVoice(voices);
      setIsMaleVoice(isMale);
      const chunks = buildSpeechChunks(questionText);
      let started = false;
      cancelSpeechRef.current = speakWithNaturalPauses(chunks, voice, {
        onChunkStart: () => { if (!started) { started = true; setAiTimeElapsed(0); } setVideoPlaying(true); },
        onChunkEnd:   () => setVideoPlaying(false),
        onDone:  () => { setVideoPlaying(false); setPhase("user-answering"); },
        onError: () => { setVideoPlaying(false); setPhase("user-answering"); },
      });
    };

    if (!("speechSynthesis" in window)) { setSpeechSupported(false); setPhase("user-answering"); return; }
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) { startSpeech(voices); return; }

    const handler = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) startSpeech(v);
      else { setSpeechSupported(false); setPhase("user-answering"); }
    };
    window.speechSynthesis.onvoiceschanged = handler;
    const safety = setTimeout(() => {
      window.speechSynthesis.onvoiceschanged = null;
      const v2 = window.speechSynthesis.getVoices();
      if (v2.length > 0) startSpeech(v2);
      else { setSpeechSupported(false); setPhase("user-answering"); }
    }, 3000);

    return () => {
      clearTimeout(safety);
      window.speechSynthesis.onvoiceschanged = null;
      if (cancelSpeechRef.current) { cancelSpeechRef.current(); cancelSpeechRef.current = null; }
      setVideoPlaying(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Stop recording when leaving user-answering
  useEffect(() => { if (phase !== "user-answering") stopRecognition(); }, [phase, stopRecognition]);

  // Auto-finish countdown — starts when last question enters feedback phase
  useEffect(() => {
    if (phase === "feedback" && isLastQuestion) {
      setAutoFinishCountdown(AUTO_FINISH_SECONDS);
      autoFinishTimerRef.current = setInterval(() => {
        setAutoFinishCountdown((prev) => {
          if (prev === null || prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    } else {
      clearAutoFinish();
    }
    return () => clearAutoFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, isLastQuestion]);

  // Navigate to report when countdown hits zero
  useEffect(() => {
    if (autoFinishCountdown === 0) {
      clearAutoFinish();
      onFinish(buildReport(answers));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFinishCountdown]);

  // AI timer — stable through chunk pauses
  useEffect(() => {
    if (phase !== "ai-speaking") return;
    const id = setInterval(() => setAiTimeElapsed((p) => p + 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, phase]);

  // ── Build report helper ────────────────────────────────────────────────────
  const buildReport = useCallback((savedAnswers: QuestionAnswer[]): InterviewReport => {
    const answered = savedAnswers.filter((a) => a.answer.trim().length > 0).length;
    const total    = questions.length;
    const score    = total > 0 ? Math.round((answered / total) * 100) : 0;
    return {
      score,
      feedback: answered === total ? "Great job completing all questions!" : `You answered ${answered} of ${total} questions.`,
      strengths: answered > 0 ? ["Attempted all provided questions", "Clear communication"] : [],
      improvements: answered < total
        ? ["Try to answer every question", "Manage your time per question"]
        : ["Expand on technical depth", "Use specific examples"],
    };
  }, [questions]);

  const handleModeSwitch = (mode: InputMode) => {
    if (mode !== "voice" && isRecording) stopRecognition();
    setInputMode(mode);
    if (mode === "text") setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= CHAR_LIMIT) setTextAnswer(e.target.value);
  };

  // ── Submit answer → receive feedback → show feedback phase ────────────────
  const handleSubmitAnswer = useCallback(async () => {
    stopRecognition();
    if (cancelSpeechRef.current) { cancelSpeechRef.current(); cancelSpeechRef.current = null; }
    setVideoPlaying(false);

    const finalAnswer = (textAnswer + (interimTranscript ? " " + interimTranscript : "")).trim();
    const allAnswers: QuestionAnswer[] = [
      ...answers.filter((a) => a.questionIndex !== currentIndex),
      { questionIndex: currentIndex, answer: finalAnswer, mode: inputMode },
    ];

    setSubmitState("submitting");
    setSubmitError("");

    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/interview/submit-answer`,
        {
          interviewId:   interviewData.interview._id,
          questionIndex: currentIndex,
          question:      currentQuestion?.question ?? "",
          answer:        finalAnswer,
          mode:          inputMode,
          timeTaken:     userTimeElapsed,
        },
        { withCredentials: true },
      );

      setAnswers(allAnswers);
      setCurrentFeedback({
        score:         data.score         ?? 0,
        feedback:      data.feedback      ?? "",
        improvement:   data.improvements  ?? "",
        confidence:    data.confidence    ?? 0,
        communication: data.communication ?? 0,
        correctness:   data.correctness   ?? 0,
      });

      // Brief "saved" flash then reveal feedback panel
      setSubmitState("success");
      setTimeout(() => {
        setSubmitState("idle");
        setPhase("feedback");
      }, 500);

    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : "Submission failed. Please try again.";
      setSubmitState("error");
      setSubmitError(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textAnswer, interimTranscript, inputMode, answers, currentIndex, currentQuestion, userTimeElapsed]);

  // Candidate reads feedback then manually continues
// ── Finish API helper (reusable) ──────────────────────────────────────────
const callFinishApi = useCallback(async () => {
  try {
    await axios.post(
      `${ServerUrl}/api/interview/finish`,
      { interviewId: interviewData.interview._id },
      { withCredentials: true },
    );
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.message ?? err.message
      : "Could not finalize interview.";
    console.error("Finish API error:", msg);
    // non-blocking — we still navigate to report
  }
}, [interviewData.interview._id]);


// ── Continue from feedback (last question → See Final Results) ────────────
const handleContinueFromFeedback = useCallback(async () => {
  clearAutoFinish();
  if (isLastQuestion) {
    await callFinishApi();          // ← API call added here
    onFinish(buildReport(answers));
  } else {
    setCurrentIndex((prev) => prev + 1);
  }
}, [isLastQuestion, answers, buildReport, onFinish, clearAutoFinish, callFinishApi]);


// ── Auto-finish (countdown hits 0) ────────────────────────────────────────
useEffect(() => {
  if (autoFinishCountdown === 0) {
    clearAutoFinish();
    callFinishApi().then(() => onFinish(buildReport(answers))); // ← API call added here
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [autoFinishCountdown]);


// ── End Interview (already had API call, cleaned up below) ────────────────
const handleEndInterview = async () => {
  if (finishState === "finishing") return;
  stopRecognition();
  clearAutoFinish();
  if (cancelSpeechRef.current) { cancelSpeechRef.current(); cancelSpeechRef.current = null; }
  setVideoPlaying(false);

  const finalAnswers: QuestionAnswer[] = [
    ...answers.filter((a) => a.questionIndex !== currentIndex),
    { questionIndex: currentIndex, answer: textAnswer.trim(), mode: inputMode },
  ];

  setFinishState("finishing");
  setFinishError("");

  try {
    await axios.post(
      `${ServerUrl}/api/interview/finish`,
      { interviewId: interviewData.interview._id },
      { withCredentials: true },
    );
    setFinishState("idle");
    onFinish(buildReport(finalAnswers));
  } catch (err: unknown) {
    const msg = axios.isAxiosError(err)
      ? err.response?.data?.message ?? err.message
      : "Could not end interview. Please try again.";
    setFinishState("error");
    setFinishError(msg);
  }
};

  // Auto-submit on timer expiry
  const handleSubmitRef = useRef(handleSubmitAnswer);
  useEffect(() => { handleSubmitRef.current = handleSubmitAnswer; }, [handleSubmitAnswer]);
  useEffect(() => {
    if (phase !== "user-answering") return;
    if (userTimeElapsed >= userTotalTime) { handleSubmitRef.current(); return; }
    const id = setInterval(() => setUserTimeElapsed((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, [phase, userTimeElapsed, userTotalTime]);

  // Voice mode display text (committed + dim interim)
  const displayText = isRecording && interimTranscript
    ? (textAnswer.trim() ? textAnswer + " " : "") + interimTranscript
    : textAnswer;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
      <motion.div
        className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col lg:flex-row"
        variants={shouldReduceMotion ? {} : cardVariants}
        initial="hidden" animate="visible"
        transition={shouldReduceMotion ? {} : { duration: 0.45, ease: "easeOut" }}
      >

        {/* ── LEFT PANEL ──────────────────────────────────────────────── */}
        <motion.aside
          className="w-full lg:w-[360px] lg:min-w-[360px] flex flex-col gap-5 p-5 sm:p-6 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100 lg:border-b-0 lg:border-r lg:border-gray-100"
          variants={shouldReduceMotion ? {} : panelVariants}
          initial="hidden" animate="visible"
          transition={shouldReduceMotion ? {} : { duration: 0.4, delay: 0.1, ease: "easeOut" }}
        >
          <motion.div className="flex flex-col gap-5" variants={shouldReduceMotion ? {} : staggerContainer} initial="hidden" animate="visible">

            {/* Live badge */}
            <motion.div className="flex items-center gap-2" variants={fadeUp} transition={shouldReduceMotion ? {} : fadeUpTransition}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-emerald-600">Live Interview</span>
              {!speechSupported && (
                <span className="ml-auto text-[10px] font-medium text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">Audio unavailable</span>
              )}
            </motion.div>

            {/* Video */}
            <motion.div className="w-full rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-gray-100 relative" variants={fadeUp} transition={shouldReduceMotion ? {} : fadeUpTransition}>
              <video
                ref={videoRef}
                src={isMaleVoice ? maleVideo : femaleVideo}
                muted loop playsInline preload="auto"
                className="w-full h-auto object-cover aspect-[4/3] sm:aspect-video lg:aspect-[4/3]"
                onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
              />
              <AnimatePresence>
                {isAiSpeaking && videoPlaying && (
                  <motion.div
                    className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.2 }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />Speaking…
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Waveform */}
            <motion.div className="flex items-end justify-center gap-0.5 h-8 px-2" variants={fadeUp}>
              {WAVE_HEIGHTS.map((h, i) => (
                <motion.span key={i}
                  className={`w-1 rounded-full ${isRecording ? "bg-red-400" : "bg-emerald-400"}`}
                  style={{ height: `${Math.round(h * 3.5)}px` }}
                  animate={
                    shouldReduceMotion ? { scaleY: 1, opacity: 0.25 }
                    : (videoPlaying || isRecording)
                      ? { scaleY: [1, 1.5 + (i % 3) * 0.3, 0.7, 1.3, 1], opacity: [0.6, 0.9, 0.5, 0.8, 0.6] }
                      : { scaleY: 1, opacity: 0.25 }
                  }
                  transition={{ duration: 1.2 + (i % 4) * 0.3, repeat: (videoPlaying || isRecording) && !shouldReduceMotion ? Infinity : 0, delay: i * 0.07, ease: "easeInOut" }}
                />
              ))}
            </motion.div>

            {/* Status card */}
            <motion.div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4" variants={fadeUp} transition={shouldReduceMotion ? {} : fadeUpTransition}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">Status</span>
                <AnimatePresence mode="wait">
                  {isAiSpeaking ? (
                    <motion.span key="ai" className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-100"
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2 }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {videoPlaying ? "AI Speaking" : "AI Pausing…"}
                    </motion.span>
                  ) : isFeedbackPhase ? (
                    <motion.span key="fb" className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-teal-100"
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2 }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                      Feedback
                    </motion.span>
                  ) : isRecording ? (
                    <motion.span key="rec" className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-[11px] font-bold px-2.5 py-1 rounded-full border border-red-100"
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2 }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      Recording…
                    </motion.span>
                  ) : (
                    <motion.span key="turn" className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-100"
                      initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.2 }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Your Turn
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="flex flex-col items-center gap-1.5">
                <AnimatePresence mode="wait">
                  <motion.div key={phase} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                    <Timer
                      timeLeft={isAiSpeaking ? aiTimeElapsed : Math.max(userTotalTime - userTimeElapsed, 0)}
                      totalTime={isAiSpeaking ? Math.max(aiTimeElapsed, 10) : userTotalTime}
                    />
                  </motion.div>
                </AnimatePresence>
                <span className="text-[10px] font-medium text-gray-400">
                  {isAiSpeaking ? "Reading question…" : isFeedbackPhase ? "Review your feedback" : "Time to answer"}
                </span>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="grid grid-cols-2 gap-3 text-center">
                <motion.div className="rounded-xl bg-emerald-50 border border-emerald-100 py-3 px-2 flex flex-col items-center" whileHover={shouldReduceMotion ? {} : { scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                  <AnimatePresence mode="wait">
                    <motion.span key={questionNumber} className="text-2xl font-extrabold text-emerald-600 leading-none tabular-nums"
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
                      {questionNumber}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[10px] font-medium text-gray-400 mt-1">Current</span>
                </motion.div>
                <motion.div className="rounded-xl bg-teal-50 border border-teal-100 py-3 px-2 flex flex-col items-center" whileHover={shouldReduceMotion ? {} : { scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                  <span className="text-2xl font-extrabold text-teal-600 leading-none tabular-nums">{totalQuestions}</span>
                  <span className="text-[10px] font-medium text-gray-400 mt-1">Total</span>
                </motion.div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <motion.div className="h-full bg-emerald-400 rounded-full"
                  animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] font-medium bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{interviewData.interview.role}</span>
                <span className="text-[11px] font-medium bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{interviewData.interview.experience}</span>
                <span className="text-[11px] font-medium bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full capitalize">{interviewData.interview.mode}</span>
              </div>
            </motion.div>
          </motion.div>
        </motion.aside>

        {/* ── RIGHT PANEL ─────────────────────────────────────────────── */}
        <motion.main
          className="flex-1 flex flex-col gap-5 p-5 sm:p-8"
          variants={shouldReduceMotion ? {} : rightVariants}
          initial="hidden" animate="visible"
          transition={shouldReduceMotion ? {} : { duration: 0.4, delay: 0.2, ease: "easeOut" }}
        >
          <motion.div className="flex flex-col gap-5 flex-1" variants={shouldReduceMotion ? {} : staggerContainer} initial="hidden" animate="visible">

            {/* Question header */}
            <AnimatePresence mode="wait">
              <motion.div key={currentIndex} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3" {...(shouldReduceMotion ? {} : questionTransition)}>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400">Question {questionNumber} of {totalQuestions}</p>
                    {currentQuestion?.difficulty && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${DIFFICULTY_COLORS[currentQuestion.difficulty as "easy" | "medium" | "hard"]}`}>
                        {currentQuestion.difficulty}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-snug">{currentQuestion?.question ?? "Loading…"}</h2>
                </div>

                <AnimatePresence mode="wait">
                  {isAiSpeaking ? (
                    <motion.span key="ai-pill" className="self-start shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{videoPlaying ? "AI Speaking…" : "AI Thinking…"}
                    </motion.span>
                  ) : isFeedbackPhase ? (
                    <motion.span key="fb-pill" className="self-start shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium text-teal-600 bg-teal-50 border border-teal-100 rounded-full px-3 py-1.5"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />Reviewing…
                    </motion.span>
                  ) : isRecording ? (
                    <motion.span key="rec-pill" className="self-start shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-full px-3 py-1.5"
                      initial={{ opacity: 0 }} animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [1, 0.6, 1] }} exit={{ opacity: 0 }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />Transcribing…
                    </motion.span>
                  ) : (
                    <motion.span key="listen-pill" className="self-start shrink-0 inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-3 py-1.5"
                      initial={{ opacity: 0 }} animate={shouldReduceMotion ? { opacity: 1 } : { opacity: [1, 0.6, 1] }} exit={{ opacity: 0 }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />Listening…
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            <motion.div className="h-px bg-gray-100" variants={fadeUp} transition={shouldReduceMotion ? {} : fadeUpTransition} />

            {/* ── BODY: feedback panel OR answer input ──────────────────── */}
            <AnimatePresence mode="wait">
              {isFeedbackPhase && currentFeedback ? (

                /* FEEDBACK PHASE */
                <motion.div key="feedback" className="flex-1 flex flex-col"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <FeedbackPanel
                    feedback={currentFeedback}
                    isLast={isLastQuestion}
                    onContinue={handleContinueFromFeedback}
                    rm={shouldReduceMotion}
                    autoFinishCountdown={autoFinishCountdown}
                    autoFinishTotal={AUTO_FINISH_SECONDS}
                  />
                </motion.div>

              ) : (

                /* ANSWER INPUT PHASE */
                <motion.div key="input" className="flex flex-col gap-3 flex-1"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                  {/* Mode toggle row */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-300">Your Response</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        {(["voice", "text"] as InputMode[]).map((mode) => (
                          <motion.button key={mode}
                            onClick={() => !isAiSpeaking && handleModeSwitch(mode)}
                            disabled={isAiSpeaking}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${inputMode === mode ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                            whileTap={!isAiSpeaking && !shouldReduceMotion ? { scale: 0.95 } : {}}
                          >
                            {mode === "voice"
                              ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                              : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            }
                            {mode === "voice" ? "Voice" : "Type"}
                          </motion.button>
                        ))}
                      </div>
                      <AnimatePresence>
                        {textAnswer.length > 0 && isUserAnswering && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.15 }}
                            onClick={() => { setTextAnswer(""); setInterimTranscript(""); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 border border-gray-200 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Clear
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Input panels */}
                  <div className={`relative flex-1 transition-opacity duration-300 ${isAiSpeaking ? "opacity-40 pointer-events-none select-none" : "opacity-100"}`}>
                    <AnimatePresence mode="wait">

                      {inputMode === "voice" ? (
                        <motion.div key="voice" {...modeTransition} className="flex flex-col gap-3 min-h-[200px] sm:min-h-[240px]">
                          {/* Transcript box */}
                          <div className={`relative flex-1 rounded-2xl border transition-all duration-200 min-h-[140px] sm:min-h-[180px] ${
                            isRecording ? "border-red-200 bg-red-50/30 ring-2 ring-red-200/50"
                            : displayText ? "border-gray-200 bg-white"
                            : "border-dashed border-gray-200 bg-gray-50/60"
                          }`}>
                            {displayText ? (
                              <div className="p-4 h-full">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                  {textAnswer}
                                  {isRecording && interimTranscript && (
                                    <span className="text-gray-400 italic">{textAnswer.trim() ? " " : ""}{interimTranscript}</span>
                                  )}
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-2 min-h-[140px]">
                                <p className="text-sm font-medium text-gray-400">{isAiSpeaking ? "Wait for AI to finish…" : "Tap the mic below to start speaking"}</p>
                                <p className="text-xs text-gray-300">Your speech will appear here in real-time</p>
                              </div>
                            )}
                            {isRecording && (
                              <div className="absolute inset-0 rounded-2xl pointer-events-none">
                                <motion.div className="absolute inset-0 rounded-2xl border-2 border-red-300"
                                  animate={shouldReduceMotion ? {} : { opacity: [0.6, 0.15, 0.6] }}
                                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
                              </div>
                            )}
                          </div>

                          {/* Mic controls */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {textAnswer.length > 0 && <span className="text-[11px] text-gray-400 tabular-nums">{wordCount} {wordCount === 1 ? "word" : "words"}</span>}
                              {!sttSupported && <span className="text-[11px] text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">STT not supported</span>}
                              {micPermission === "denied" && <span className="text-[11px] text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">Mic denied</span>}
                            </div>
                            <div className="flex flex-col items-center gap-1 mx-auto">
                              <motion.button
                                onClick={isUserAnswering ? toggleRecording : undefined}
                                disabled={!sttSupported || !isUserAnswering || micPermission === "denied"}
                                className={`relative h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${isRecording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}`}
                                whileHover={!shouldReduceMotion && isUserAnswering && sttSupported ? { scale: 1.06 } : {}}
                                whileTap={!shouldReduceMotion && isUserAnswering && sttSupported ? { scale: 0.94 } : {}}
                              >
                                {isRecording && !shouldReduceMotion && (
                                  <motion.span className="absolute inset-0 rounded-full bg-red-400"
                                    animate={{ scale: [1, 1.55], opacity: [0.5, 0] }}
                                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }} />
                                )}
                                {isRecording
                                  ? <svg className="w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
                                  : <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                }
                              </motion.button>
                              <span className="text-[10px] font-medium text-gray-400">{isRecording ? "Tap to stop" : "Tap to speak"}</span>
                            </div>
                            <motion.span key={charsLeft < 100 ? "warn" : "ok"}
                              className={`text-[11px] tabular-nums font-medium ${charsLeft < 100 ? "text-amber-400" : "text-gray-300"}`}
                              animate={charsLeft < 100 && !shouldReduceMotion ? { scale: [1, 1.15, 1] } : {}}
                              transition={{ duration: 0.3 }}>
                              {charsLeft} / {CHAR_LIMIT}
                            </motion.span>
                          </div>

                          {isUserAnswering && !isRecording && (
                            <p className="text-[11px] text-center text-gray-300">
                              Prefer typing?{" "}
                              <button onClick={() => handleModeSwitch("text")} className="text-emerald-500 font-semibold underline underline-offset-2 hover:text-emerald-600 transition-colors">Switch to text</button>
                            </p>
                          )}
                        </motion.div>

                      ) : (
                        <motion.div key="text" {...modeTransition} className="flex flex-col gap-2">
                          <div className="relative">
                            <textarea
                              ref={textareaRef}
                              value={textAnswer}
                              onChange={handleTextChange}
                              disabled={isAiSpeaking}
                              placeholder={isAiSpeaking ? "Wait for AI to finish…" : "Type your answer here…"}
                              rows={8}
                              className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-4 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-150 leading-relaxed min-h-[200px] sm:min-h-[240px] disabled:cursor-not-allowed"
                            />
                            {textAnswer.length === 0 && !isAiSpeaking && (
                              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 text-[11px] text-gray-300 pointer-events-none select-none">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" /></svg>
                                text mode
                              </div>
                            )}
                          </div>
                          <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] text-gray-300">{textAnswer.length > 0 ? `${wordCount} words` : "Start typing your answer"}</span>
                            <motion.span key={charsLeft < 100 ? "warn" : "ok"}
                              className={`text-[11px] tabular-nums font-medium transition-colors ${charsLeft < 100 ? "text-amber-400" : "text-gray-300"}`}
                              animate={charsLeft < 100 && !shouldReduceMotion ? { scale: [1, 1.15, 1] } : {}}
                              transition={{ duration: 0.3 }}>
                              {charsLeft} / {CHAR_LIMIT}
                            </motion.span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Error toast */}
                  <AnimatePresence>
                    {submitState === "error" && submitError && (
                      <motion.div
                        className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}
                      >
                        <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                        <span>{submitError}</span>
                        <button onClick={() => { setSubmitState("idle"); setSubmitError(""); }} className="ml-auto text-red-400 hover:text-red-600">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Actions */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 pt-1 mt-auto">
                    <div className="flex flex-col gap-1.5 w-full sm:w-auto">
                      <motion.button
                        onClick={handleEndInterview}
                        disabled={isSubmitting || finishState === "finishing"}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                          finishState === "error"
                            ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                            : "border-gray-200 text-gray-500 bg-white hover:bg-gray-50"
                        }`}
                        whileHover={finishState !== "finishing" && !isSubmitting && !shouldReduceMotion ? { scale: 1.02 } : {}}
                        whileTap={finishState !== "finishing" && !isSubmitting && !shouldReduceMotion ? { scale: 0.96 } : {}}
                      >
                        <AnimatePresence mode="wait">
                          {finishState === "finishing" ? (
                            <motion.span key="finishing" className="flex items-center gap-2"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                              </svg>
                              Ending…
                            </motion.span>
                          ) : finishState === "error" ? (
                            <motion.span key="end-retry" className="flex items-center gap-2"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                              </svg>
                              Retry
                            </motion.span>
                          ) : (
                            <motion.span key="end-idle"
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                              End Interview
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                      <AnimatePresence>
                        {finishState === "error" && finishError && (
                          <motion.p
                            className="text-[11px] text-red-500 text-center px-1"
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                          >
                            {finishError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      onClick={handleSubmitAnswer}
                      disabled={isNextDisabled}
                      className={`w-full sm:w-auto sm:ml-auto px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                        submitState === "success" ? "bg-teal-500 shadow-teal-100"
                        : submitState === "error" ? "bg-red-500 hover:bg-red-600 shadow-red-100"
                        : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100"
                      }`}
                      whileHover={!isNextDisabled && !shouldReduceMotion ? { scale: 1.03 } : {}}
                      whileTap={!isNextDisabled && !shouldReduceMotion ? { scale: 0.96 } : {}}
                    >
                      <AnimatePresence mode="wait">
                        {isSubmitting ? (
                          <motion.span key="loading" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                            Submitting…
                          </motion.span>
                        ) : submitState === "success" ? (
                          <motion.span key="saved" className="flex items-center gap-2" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                            Saved!
                          </motion.span>
                        ) : submitState === "error" ? (
                          <motion.span key="retry" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                            Retry
                          </motion.span>
                        ) : (
                          <motion.span key="submit" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                            Submit Answer
                            <motion.svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                              animate={!isNextDisabled && !shouldReduceMotion ? { x: [0, 3, 0] } : {}}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </motion.svg>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </motion.main>
      </motion.div>
    </div>
  );
};

export default InterviewStep2;