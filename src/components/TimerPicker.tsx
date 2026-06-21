/**
 * TimerPicker
 *
 * A self-contained tab bar that lets the user choose between
 * "Stopwatch" (count-up) and "Timer" (countdown with HH:MM picker).
 *
 * Props
 * ─────
 * mode          – current TimerMode value
 * hours         – current hours value (only relevant in "timer" mode)
 * minutes       – current minutes value (only relevant in "timer" mode)
 * onModeChange  – called when the tab changes
 * onHoursChange – called when hours input changes
 * onMinutesChange – called when minutes input changes
 */

import { AlarmClock, Timer } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export type TimerMode = "stopwatch" | "timer";

export interface TimerPickerProps {
  mode: TimerMode;
  hours: number;
  minutes: number;
  onModeChange: (mode: TimerMode) => void;
  onHoursChange: (h: number) => void;
  onMinutesChange: (m: number) => void;
}

const TABS: { mode: TimerMode; label: string; Icon: typeof AlarmClock }[] = [
  { mode: "stopwatch", label: "Stopwatch", Icon: AlarmClock },
  { mode: "timer", label: "Timer", Icon: Timer },
];

export function TimerPicker({
  mode,
  hours,
  minutes,
  onModeChange,
  onHoursChange,
  onMinutesChange,
}: TimerPickerProps) {
  const totalSeconds = hours * 3600 + minutes * 60;
  const isTimer = mode === "timer";

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div
        className="flex rounded-lg bg-muted p-1 gap-1"
        role="tablist"
        aria-label="Timer mode"
      >
        {TABS.map(({ mode: tabMode, label, Icon }) => {
          const isActive = mode === tabMode;
          return (
            <button
              key={tabMode}
              role="tab"
              id={`tab-${tabMode}`}
              aria-selected={isActive}
              onClick={() => onModeChange(tabMode)}
              className={[
                "flex-1 flex items-center justify-center gap-2",
                "text-sm font-medium px-3 py-2 rounded-md transition-all cursor-pointer",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Duration picker — only visible in Timer mode */}
      {isTimer && (
        <div>
          <Label className="mb-3 block text-sm">Duration</Label>
          <div className="flex items-center gap-2">
            {/* Hours */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <Input
                id="timer-hours"
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) =>
                  onHoursChange(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))
                }
                className="text-center text-lg font-mono tabular-nums h-12"
              />
              <span className="text-xs text-muted-foreground">hr</span>
            </div>

            <span className="text-xl font-bold text-muted-foreground mb-4">:</span>

            {/* Minutes */}
            <div className="flex-1 flex flex-col items-center gap-1">
              <Input
                id="timer-minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) =>
                  onMinutesChange(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))
                }
                className="text-center text-lg font-mono tabular-nums h-12"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </div>

          {totalSeconds === 0 && (
            <p className="text-xs text-destructive mt-2">
              Please set a duration greater than 0.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
