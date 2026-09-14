import type { ShoppingItem } from "./types";

/** Non vanno in lista spesa: sempre considerati disponibili in dispensa. */
const PANTRY_STAPLES = ["sale", "zucchero", "olio", "pepe", "peperoncino"];

function normShop(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

export function isPantryStaple(name: string): boolean {
  const n = normShop(name);
  return PANTRY_STAPLES.some(
    (s) =>
      n === s ||
      n.startsWith(s + " ") ||
      n.includes(" " + s) ||
      n.includes(s + " ") ||
      n.endsWith(" " + s),
  );
}

/** Filtra ingredienti mancanti escludendo sale, zucchero, olio, pepe, peperoncino. */
export function filterShoppingMissing(items: string[]): string[] {
  return items.map((i) => i.trim()).filter(Boolean).filter((i) => !isPantryStaple(i));
}


const KEY = "fridgechef.shopping.v1";
const LEGACY_KEY = "frigochef.shopping.v1";
const MAX = 100;

/** Confronto "morbido": ignora maiuscole, accenti e spazi doppi. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function save(items: ShoppingItem[]): ShoppingItem[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    return loadShopping();
  }
  return items;
}

export function loadShopping(): ShoppingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShoppingItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((i) => i && typeof i.name === "string" && i.name.trim());
  } catch {
    return [];
  }
}

/**
 * Aggiunge voci evitando i doppioni: se un ingrediente è già in lista e non è
 * ancora stato preso, non viene duplicato (al massimo si arricchisce la
 * provenienza). Se era già spuntato, torna da prendere.
 */
export function addShopping(names: string[], from = ""): ShoppingItem[] {
  const current = loadShopping();
  names = filterShoppingMissing(names);
  const byName = new Map(current.map((i) => [norm(i.name), i]));

  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const key = norm(name);
    if (!key) continue;

    const existing = byName.get(key);
    if (existing) {
      existing.done = false;
      if (from && !existing.from.split(" · ").includes(from)) {
        existing.from = existing.from ? `${existing.from} · ${from}` : from;
      }
      continue;
    }
    byName.set(key, {
      id: crypto.randomUUID(),
      name,
      from,
      done: false,
      at: Date.now(),
    });
  }

  const next = [...byName.values()].slice(0, MAX);
  return save(next);
}

export function toggleShopping(id: string): ShoppingItem[] {
  return save(loadShopping().map((i) => (i.id === id ? { ...i, done: !i.done } : i)));
}

export function removeShopping(id: string): ShoppingItem[] {
  return save(loadShopping().filter((i) => i.id !== id));
}

export function clearDoneShopping(): ShoppingItem[] {
  return save(loadShopping().filter((i) => !i.done));
}
