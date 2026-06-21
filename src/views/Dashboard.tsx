import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { POOLS, getAllCategories, type PoolId, type DifficultyCounts } from "../lib/questions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { TimerPicker, type TimerMode } from "../components/TimerPicker";

// Re-export so Session.tsx can still import from here if needed
export type { TimerMode };

interface Preset {
  label: string;
  counts: DifficultyCounts | null;
  /** Suggested countdown duration (seconds) shown next to preset in Timer mode */
  timerDuration: number;
}

const PRESETS: Preset[] = [
  { label: "Quick Warmup (1E, 1M)",  counts: { Easy: 1, Medium: 1, Hard: 0 }, timerDuration: 20 * 60 },
  { label: "Standard Mock (1E, 2M)", counts: { Easy: 1, Medium: 2, Hard: 0 }, timerDuration: 45 * 60 },
  { label: "Advanced Mock (1M, 1H)", counts: { Easy: 0, Medium: 1, Hard: 1 }, timerDuration: 60 * 60 },
  { label: "Custom",                 counts: null,                             timerDuration: 30 * 60 },
];

function secondsToHM(total: number): { h: number; m: number } {
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
  };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const allCategories = getAllCategories();

  // Question config
  const [poolId, setPoolId] = useState<PoolId>("blind75");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [presetIndex, setPresetIndex] = useState<number>(1);
  const [customCounts, setCustomCounts] = useState<DifficultyCounts>({ Easy: 0, Medium: 0, Hard: 0 });

  // Timer config (owned here, passed into TimerPicker)
  const [timerMode, setTimerMode] = useState<TimerMode>("stopwatch");
  const [timerHours, setTimerHours] = useState<number>(0);
  const [timerMinutes, setTimerMinutes] = useState<number>(45);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  /** Selecting a preset also updates the time picker suggestion */
  const handlePresetSelect = (index: number) => {
    setPresetIndex(index);
    const { h, m } = secondsToHM(PRESETS[index].timerDuration);
    setTimerHours(h);
    setTimerMinutes(m);
  };

  /** Switching to Timer mode pre-fills from the active preset's suggestion */
  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode);
    if (mode === "timer") {
      const { h, m } = secondsToHM(PRESETS[presetIndex].timerDuration);
      setTimerHours(h);
      setTimerMinutes(m);
    }
  };

  const timerDurationSeconds = timerHours * 3600 + timerMinutes * 60;
  const canStart = !(timerMode === "timer" && timerDurationSeconds === 0);

  const handleStart = () => {
    const isCustom = PRESETS[presetIndex].counts === null;
    const finalCounts = isCustom ? customCounts : (PRESETS[presetIndex].counts as DifficultyCounts);

    navigate("/session", {
      state: {
        poolId,
        selectedCategories,
        counts: finalCounts,
        timerMode,
        timerDuration: timerMode === "timer" ? timerDurationSeconds : 0,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Configure Interview</h2>
        <p className="text-muted-foreground">Select your question pool, categories, and format.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Left Column: Pool & Categories ── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question Pool</CardTitle>
              <CardDescription>Select the source of your questions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={poolId} onValueChange={(v) => setPoolId(v as PoolId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a pool" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(POOLS).map(([key, pool]) => (
                    <SelectItem key={key} value={key}>
                      {pool.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Leave empty to include all categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column: Format, Timer & Start ── */}
        <div className="space-y-6">
          {/* Presets / Custom difficulty counts */}
          <Card>
            <CardHeader>
              <CardTitle>Format</CardTitle>
              <CardDescription>How many questions do you want?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preset</Label>
                <div className="flex flex-col gap-2">
                  {PRESETS.map((preset, index) => {
                    const { h, m } = secondsToHM(preset.timerDuration);
                    const durationLabel = h > 0 ? `${h}h ${m}m` : `${m}m`;
                    return (
                      <label
                        key={index}
                        className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                          presetIndex === index ? "border-primary bg-primary/5" : "hover:bg-muted"
                        }`}
                      >
                        <input
                          type="radio"
                          name="preset"
                          checked={presetIndex === index}
                          onChange={() => handlePresetSelect(index)}
                          className="accent-primary"
                        />
                        <span className="flex-1">{preset.label}</span>
                        {timerMode === "timer" && (
                          <span className="text-xs text-muted-foreground font-mono tabular-nums">
                            {durationLabel}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {PRESETS[presetIndex].counts === null && (
                <div className="pt-4 border-t grid grid-cols-3 gap-4">
                  {(["Easy", "Medium", "Hard"] as const).map((diff) => (
                    <div key={diff} className="space-y-2">
                      <Label>{diff}</Label>
                      <Input
                        type="number"
                        min="0"
                        value={customCounts[diff]}
                        onChange={(e) =>
                          setCustomCounts({
                            ...customCounts,
                            [diff]: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Timer — extracted component */}
          <Card>
            <CardHeader>
              <CardTitle>Session Timer</CardTitle>
              <CardDescription>Choose how you want to track time.</CardDescription>
            </CardHeader>
            <CardContent>
              <TimerPicker
                mode={timerMode}
                hours={timerHours}
                minutes={timerMinutes}
                onModeChange={handleModeChange}
                onHoursChange={setTimerHours}
                onMinutesChange={setTimerMinutes}
              />
            </CardContent>
          </Card>

          <Button
            size="lg"
            className="w-full text-lg h-14"
            onClick={handleStart}
            disabled={!canStart}
          >
            Start Mock Interview
          </Button>
        </div>
      </div>
    </div>
  );
}
