import blind75 from "../data/pools/blind75.json";
import neetcode150 from "../data/pools/neetcode150.json";

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Question {
  id: string;
  title: string;
  url: string;
  difficulty: Difficulty;
  categories: string[];
}

export interface Pool {
  name: string;
  data: Question[];
}

export type PoolId = keyof typeof POOLS;

export interface DifficultyCounts {
  Easy: number;
  Medium: number;
  Hard: number;
}

export interface SelectQuestionsArgs {
  poolId: PoolId;
  selectedCategories?: string[];
  counts?: DifficultyCounts;
}

export const POOLS: Record<string, Pool> = {
  blind75: {
    name: "Blind 75",
    data: blind75 as Question[],
  },
  neetcode150: {
    name: "NeetCode 150",
    data: neetcode150 as Question[],
  },
};

/** Get all unique categories across all pools */
export const getAllCategories = (): string[] => {
  const categories = new Set<string>();
  Object.values(POOLS).forEach((pool) => {
    pool.data.forEach((question) => {
      question.categories.forEach((cat) => categories.add(cat));
    });
  });
  return Array.from(categories).sort();
};

/** Fisher-Yates shuffle, returns at most `size` elements */
function getRandomSubarray<T>(arr: T[], size: number): T[] {
  const shuffled = arr.slice(0);
  let i = arr.length;
  while (i--) {
    const index = Math.floor((i + 1) * Math.random());
    [shuffled[index], shuffled[i]] = [shuffled[i], shuffled[index]];
  }
  return shuffled.slice(0, size);
}

/** Filter questions from a pool and randomly pick the requested amounts per difficulty. */
export const selectQuestions = ({
  poolId,
  selectedCategories = [],
  counts = { Easy: 0, Medium: 0, Hard: 0 },
}: SelectQuestionsArgs): Question[] => {
  const pool = POOLS[poolId];
  if (!pool) return [];

  // 1. Filter by categories if any selected
  let validQuestions: Question[] = pool.data;
  if (selectedCategories.length > 0) {
    validQuestions = validQuestions.filter((q) =>
      q.categories.some((cat) => selectedCategories.includes(cat))
    );
  }

  // 2. Separate by difficulty
  const byDifficulty: Record<Difficulty, Question[]> = {
    Easy: validQuestions.filter((q) => q.difficulty === "Easy"),
    Medium: validQuestions.filter((q) => q.difficulty === "Medium"),
    Hard: validQuestions.filter((q) => q.difficulty === "Hard"),
  };

  // 3. Randomly select the requested amount per difficulty
  const selected: Question[] = [];
  (["Easy", "Medium", "Hard"] as Difficulty[]).forEach((diff) => {
    const requested = counts[diff] ?? 0;
    const available = byDifficulty[diff];
    const picked = getRandomSubarray(available, Math.min(requested, available.length));
    selected.push(...picked);
  });

  // Shuffle so questions aren't grouped by difficulty
  return getRandomSubarray(selected, selected.length);
};

/** Seconds to spend on each difficulty in the random-pick flow */
export const RANDOM_TIMER_SECONDS: Record<Difficulty, number> = {
  Easy:   20 * 60, // 20 min
  Medium: 30 * 60, // 30 min
  Hard:   45 * 60, // 45 min
};

/**
 * Pick one question at random from the combined set of all pools.
 * Optionally exclude a specific question id (for re-rolling).
 */
export function pickRandomQuestion(excludeId?: string): Question {
  // Build a deduplicated pool (Map keyed by id) so shared questions
  // don't appear twice and skew the probability distribution.
  const seen = new Map<string, Question>();
  Object.values(POOLS).forEach((p) => p.data.forEach((q) => seen.set(q.id, q)));
  const unique = Array.from(seen.values());
  const pool = excludeId ? unique.filter((q) => q.id !== excludeId) : unique;
  const candidates = pool.length > 0 ? pool : unique;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
