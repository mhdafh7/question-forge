import { useLocation, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Question } from "../lib/questions";

interface SummaryLocationState {
  questions: Question[];
  completed: Record<string, boolean>;
  elapsedTime: number;
  timerMode?: "stopwatch" | "timer";
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function Summary() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as SummaryLocationState | null;

  if (!state) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-full gap-4">
        <h2 className="text-2xl font-bold">No session data found.</h2>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const { questions, completed, elapsedTime, timerMode } = state;
  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalQuestions = questions.length;
  const timeLabel = timerMode === "timer" ? "Time Used" : "Total Time";

  return (
    <div className="space-y-8 max-w-3xl mx-auto w-full mt-8">
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">Session Complete!</h2>
        <p className="text-muted-foreground text-lg">Here is a summary of your mock interview.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{timeLabel}</CardDescription>
            <CardTitle className="text-3xl text-primary">{formatTime(elapsedTime)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl text-primary">
              {completedCount} / {totalQuestions}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questions Attempted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, index) => {
            const isDone = !!completed[q.id];
            return (
              <div key={q.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span
                    className={`font-medium ${
                      isDone ? "text-foreground" : "text-muted-foreground line-through"
                    }`}
                  >
                    {index + 1}. {q.title}
                  </span>
                </div>
                <Button variant="link" size="sm" asChild>
                  <a href={q.url} target="_blank" rel="noreferrer">
                    Review
                  </a>
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button size="lg" asChild>
          <Link to="/">Start Another Mock</Link>
        </Button>
      </div>
    </div>
  );
}
