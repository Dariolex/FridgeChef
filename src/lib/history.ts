import type { HistoryEntry, Recipe } from "./types";

// v2: una voce = un piatto cucinato (la v1 salvava l'analisi del frigo con una
// miniatura base64 troncata, che risultava illeggibile).
const KEY = "frigochef.history.v2";
const MAX = 30;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((e) => e && e.recipe && typeof e.recipe.title === "string");
  } catch {
    return [];
  }
}

export function pushHistory(recipe: Recipe): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    at: Date.now(),
    recipe,
  };
  const next = [entry, ...loadHistory()].slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return loadHistory();
  }
  return next;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}
