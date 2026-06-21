import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { selectQuestions, type Question, type PoolId, type DifficultyCounts } from "../lib/questions";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";

interface SessionLocationState {
  poolId: PoolId;
  selectedCategories: string[];
  counts: DifficultyCounts;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function Session() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SessionLocationState | null;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!state) {
      navigate("/");
      return;
    }

    const selected = selectQuestions(state);
    setQuestions(selected);

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [state, navigate]);

  const toggleComplete = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEndSession = () => {
    navigate("/summary", {
      state: { questions, completed, elapsedTime },
    });
  };

  if (!state || questions.length === 0) return null;

  const difficultyClass: Record<string, string> = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="space-y-6 flex flex-col flex-1">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Active Session</h2>
          <p className="text-muted-foreground">Focus mode. Do not refresh this page.</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-mono font-bold text-primary tabular-nums">
            {formatTime(elapsedTime)}
          </div>
          <p className="text-sm text-muted-foreground">Elapsed Time</p>
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
