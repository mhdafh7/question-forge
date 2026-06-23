/**
 * RandomPicker — full-screen "pick for me" flow.
 *
 * Shows a random question from the entire pool.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { pickRandomQuestion, RANDOM_TIMER_SECONDS, type Question } from "../lib/questions";
import { X, Check, Shuffle, ExternalLink, ArrowLeft } from "lucide-react";

const DIFFICULTY_STYLES: Record<string, { badge: string; glow: string; label: string }> = {
  Easy: {
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300",
    glow: "from-emerald-500/10 via-transparent to-transparent",
    label: "Easy",
  },
  Medium: {
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
    glow: "from-amber-500/10 via-transparent to-transparent",
    label: "Medium",
  },
  Hard: {
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300",
    glow: "from-rose-500/10 via-transparent to-transparent",
    label: "Hard",
  },
};

function timerLabel(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

export default function RandomPicker() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState<Question>(() => pickRandomQuestion());
  const [rolling, setRolling] = useState(false);

  const handleReroll = useCallback(() => {
    setRolling(true);
    // Small timeout so the fade-out animation plays before the new question renders
    setTimeout(() => {
      setQuestion((prev) => pickRandomQuestion(prev.id));
      setRolling(false);
    }, 200);
  }, []);

  const handleAccept = useCallback(() => {
    const timerDuration = RANDOM_TIMER_SECONDS[question.difficulty];
    navigate("/session", {
      state: {
        // Pass the question directly so Session picks it up as a pre-selected list
        preSelectedQuestions: [question],
        timerMode: "timer" as const,
        timerDuration,
      },
    });
  }, [question, navigate]);

  const style = DIFFICULTY_STYLES[question.difficulty] ?? DIFFICULTY_STYLES.Medium;
  const timerSeconds = RANDOM_TIMER_SECONDS[question.difficulty];

  return (
    /* Full-screen backdrop — bypasses the normal max-w wrapper */
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center gap-2 text-muted-foreground">
          <Shuffle className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide uppercase">Random Pick</span>
        </div>

        {/* placeholder to keep centre-aligned title centred */}
        <div className="w-16" />
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-8 overflow-auto">
        {/* Decorative gradient behind the card */}
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${style.glow} opacity-60 transition-all duration-500`}
        />

        <div
          className={`
            relative w-full max-w-2xl rounded-2xl border bg-card shadow-xl p-8 sm:p-12
            transition-all duration-200
            ${rolling ? "opacity-0 scale-95" : "opacity-100 scale-100"}
          `}
        >
          {/* Difficulty badge */}
          <div className="flex items-center justify-between mb-6">
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${style.badge}`}
            >
              {style.label}
            </span>
            <span className="text-xs text-muted-foreground font-mono tabular-nums">
              ⏱ {timerLabel(timerSeconds)} on the clock
            </span>
          </div>

          {/* Question title */}
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight leading-snug mb-6">
            {question.title}
          </h2>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {question.categories.map((cat) => (
              <span
                key={cat}
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* External link — preview only, doesn't start the session */}
          <a
            href={question.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on platform
          </a>
        </div>

        {/* ── Action buttons ── */}
        <div className="flex items-center gap-6 w-full max-w-2xl">
          {/* ❌ Re-roll */}
          <button
            id="random-reroll"
            onClick={handleReroll}
            disabled={rolling}
            className="
              flex-1 flex flex-col items-center justify-center gap-3
              h-28 rounded-2xl border-2 border-rose-300 dark:border-rose-800
              bg-rose-50 dark:bg-rose-950/40
              text-rose-600 dark:text-rose-400
              hover:bg-rose-100 dark:hover:bg-rose-950/70
              active:scale-95 transition-all duration-150 cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed
              group
            "
            aria-label="Skip this question"
          >
            <X className="w-10 h-10 group-hover:rotate-12 transition-transform" strokeWidth={2.5} />
            <span className="text-sm font-semibold">Try another</span>
          </button>

          {/* ✅ Accept */}
          <button
            id="random-accept"
            onClick={handleAccept}
            disabled={rolling}
            className="
              flex-1 flex flex-col items-center justify-center gap-3
              h-28 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700
              bg-emerald-50 dark:bg-emerald-950/40
              text-emerald-700 dark:text-emerald-400
              hover:bg-emerald-100 dark:hover:bg-emerald-950/70
              active:scale-95 transition-all duration-150 cursor-pointer
              disabled:opacity-40 disabled:cursor-not-allowed
              group
            "
            aria-label="Accept this question and start timer"
          >
            <Check className="w-10 h-10 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
            <span className="text-sm font-semibold">Start — {timerLabel(timerSeconds)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
