import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { selectQuestions, type Question, type PoolId, type DifficultyCounts } from "../lib/questions";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import type { TimerMode } from "../components/TimerPicker";

interface SessionLocationState {
  poolId: PoolId;
  selectedCategories: string[];
  counts: DifficultyCounts;
  timerMode: TimerMode;
  /** Total seconds for countdown; 0 means stopwatch */
  timerDuration: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(Math.abs(seconds) / 3600);
  const m = Math.floor((Math.abs(seconds) % 3600) / 60);
  const s = Math.abs(seconds) % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function Session() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SessionLocationState | null;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [displaySeconds, setDisplaySeconds] = useState<number>(0);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const startTimeRef = useRef<number>(0);

  const timerMode: TimerMode = state?.timerMode ?? "stopwatch";
  const timerDuration: number = state?.timerDuration ?? 0;
  const isCountdown = timerMode === "timer" && timerDuration > 0;

  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }

    const selected = selectQuestions(state);
    setQuestions(selected);

    startTimeRef.current = Date.now();
    // For countdown, initialize immediately
    setDisplaySeconds(isCountdown ? timerDuration : 0);

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);

      if (isCountdown) {
        const remaining = timerDuration - elapsed;
        if (remaining <= 0) {
          setDisplaySeconds(0);
          setIsTimeUp(true);
          clearInterval(interval);
        } else {
          setDisplaySeconds(remaining);
        }
      } else {
        setDisplaySeconds(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleComplete = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEndSession = () => {
    const elapsedTime = isCountdown
      ? timerDuration - displaySeconds // how much of the countdown was used
      : displaySeconds;
    navigate("/summary", {
      state: { questions, completed, elapsedTime, timerMode },
    });
  };

  if (!state || questions.length === 0) return null;

  const difficultyClass: Record<string, string> = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  // Color the timer urgently when ≤ 20% time left in countdown mode
  const timerUrgent =
    isCountdown && timerDuration > 0 && displaySeconds / timerDuration <= 0.2;
  const timerClass = isTimeUp
    ? "text-destructive animate-pulse"
    : timerUrgent
    ? "text-orange-500"
    : "text-primary";

  return (
    <div className="space-y-6 flex flex-col flex-1">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Session</h2>
          <p className="text-muted-foreground">Focus mode. Do not refresh this page.</p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-mono font-bold tabular-nums transition-colors ${timerClass}`}>
            {isTimeUp ? "00:00" : formatTime(displaySeconds)}
          </div>
          <p className="text-sm text-muted-foreground">
            {isTimeUp ? "⏰ Time's up!" : isCountdown ? "Time Remaining" : "Elapsed Time"}
          </p>
          {/* Warning banner */}
          {isTimeUp && (
            <p className="text-xs text-destructive font-medium mt-1">
              End the session when you're ready.
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {questions.map((q, index) => (
          <Card
            key={q.id}
            className={`transition-opacity ${completed[q.id] ? "opacity-60" : ""}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl">
                {index + 1}. {q.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    difficultyClass[q.difficulty] ?? ""
                  }`}
                >
                  {q.difficulty}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <a href={q.url} target="_blank" rel="noreferrer">
                    Open Problem
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {q.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`complete-${q.id}`}
                  checked={!!completed[q.id]}
                  onCheckedChange={() => toggleComplete(q.id)}
                />
                <label
                  htmlFor={`complete-${q.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Mark as completed
                </label>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-6 border-t flex justify-end">
        <Button variant="destructive" size="lg" onClick={handleEndSession}>
          End Session
        </Button>
      </div>
    </div>
  );
}
