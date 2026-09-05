import type { Analysis, HistoryEntry } from "./types";

const KEY = "frigochef.history.v1";
const MAX = 12;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function pushHistory(thumb: string, analysis: Analysis): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    at: Date.now(),
    thumb: thumb.slice(0, 80_000),
    ingredients: analysis.ingredients.filter((i) => i.have).map((i) => i.name),
    recipes: analysis.recipes.map((r) => r.title),
  };
  const next = [entry, ...loadHistory()].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
