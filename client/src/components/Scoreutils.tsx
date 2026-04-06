// ─── Score utility helpers ────────────────────────────────────────────────────

export function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-500";
  return "text-red-500";
}

export function scoreBg(score: number): string {
  if (score >= 70) return "bg-emerald-50 border-emerald-200 text-emerald-700";
  if (score >= 40) return "bg-amber-50 border-amber-200 text-amber-700";
  return "bg-red-50 border-red-200 text-red-600";
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export function scoreRingBg(score: number): string {
  if (score >= 70) return "ring-emerald-200 bg-emerald-50";
  if (score >= 40) return "ring-amber-200 bg-amber-50";
  return "ring-red-200 bg-red-50";
}

export function scoreBarColor(score: number): string {
  if (score >= 70) return "bg-emerald-400";
  if (score >= 40) return "bg-amber-400";
  return "bg-red-400";
}

export function formatDate(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}