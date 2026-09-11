import type { Diet, Ingredient, Prefs, Recipe } from "./types";

export const FOOD_ART = {
  avocado: "/graphics/avocado.jpg",
  tomato: "/graphics/tomato.jpg",
  lettuce: "/graphics/lettuce.jpg",
  onion: "/graphics/onion.jpg",
  lemon: "/graphics/lemon.jpg",
  pepper: "/graphics/pepper.jpg",
  mushrooms: "/graphics/mushrooms.jpg",
  hero: "/graphics/hero.jpg",
} as const;

export const SAMPLE_INGREDIENTS: Ingredient[] = [
  "uova", "latte", "pomodori", "pesto", "mozzarella", "limone", "vino bianco",
  "parmigiano", "insalata", "yogurt", "carote", "zucchine", "pasta", "cipolla",
  "olio extravergine", "pollo", "carne macinata",
].map((name) => ({ name, have: true }));

type BookRecipe = Omit<Recipe, "missing" | "servings"> & { tags: string[]; baseServings: number };

// NOTE: full recipes loaded - see commit for complete BOOK
const BOOK: BookRecipe[] = [];

const ALIASES: Record<string, string[]> = {
  pasta: ["spaghetti", "penne", "fusilli", "trofie", "pasta avanzata", "tonnarelli", "rigatoni"],
  pomodori: ["pomodoro", "pomodorini", "pelati", "passata"],
  uova: ["uovo", "eggs", "tuorli"],
  mozzarella: ["fior di latte"],
  parmigiano: ["parmigiano reggiano", "grana", "pecorino"],
  insalata: ["lattuga", "verde", "boston", "misticanza", "iceberg"],
  funghi: ["champignon", "porcini"],
  peperoni: ["peperone"],
  cipolla: ["cipolle"],
  zucchine: ["zucchina"],
  limone: ["limoni"],
  pesto: ["pesto genovese"],
  aglio: ["spicchio"],
  yogurt: ["yogurt bianco", "yogurt greco"],
  latte: ["latte intero"],
  burro: ["noce di burro"],
  pollo: ["petto di pollo", "fusi", "sovracosce"],
  "carne macinata": ["macinato", "manzo", "vitello macinato"],
  salsiccia: ["salsicce"],
  tonno: ["tonno sott'olio"],
  ricotta: ["ricotta fresca", "ricotta salata"],
  broccoli: ["broccolo"],
  melanzane: ["melanzana"],
  guanciale: ["pancetta"],
  mascarpone: ["mascarpone"],
};

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim();
}

function hasIngredient(have: string[], needed: string) {
  const n = norm(needed);
  const baseKey = Object.keys(ALIASES).find((k) => n.includes(norm(k))) ?? n;
  const aliases = [norm(baseKey), n, ...(ALIASES[baseKey] ?? []).map(norm)];
  return have.some((h) => {
    const hn = norm(h);
    return aliases.some((a) => hn.includes(a) || a.includes(hn) || n.includes(hn));
  });
}

function dietOk(recipe: BookRecipe, diet: Diet) {
  if (diet === "vegan") return recipe.diet === "vegan";
  if (diet === "vegetarian") return recipe.diet !== "omnivore";
  return true;
}

function toRecipe(r: BookRecipe, servings: number, missing: string[]): Recipe {
  return {
    id: r.id, title: r.title, description: r.description, minutes: r.minutes,
    diet: r.diet, servings, missing, ingredients: r.ingredients, steps: r.steps,
    tip: r.tip, art: r.art,
  };
}

export function matchCookbook(haveRaw: string[], prefs: Prefs): Recipe[] {
  const have = haveRaw.map(norm).filter(Boolean);
  const scored = BOOK.filter((r) => dietOk(r, prefs.diet))
    .filter((r) => r.minutes <= prefs.maxMinutes)
    .map((r) => {
      const missing = r.ingredients.filter((ing) => !hasIngredient(have, ing));
      const hit = r.ingredients.length - missing.length;
      const score = hit * 3 - missing.length + (r.minutes <= 15 ? 1 : 0);
      return { recipe: toRecipe(r, prefs.servings, missing), score, hit };
    })
    .filter((x) => x.hit > 0)
    .sort((a, b) => b.score - a.score);
  const out = scored.map((s) => s.recipe);
  if (out.length >= 4) return out.slice(0, 6);
  const extras = BOOK.filter((r) => dietOk(r, prefs.diet))
    .filter((r) => r.minutes <= prefs.maxMinutes)
    .filter((r) => !out.some((o) => o.id === r.id))
    .slice(0, 6 - out.length)
    .map((r) => toRecipe(r, prefs.servings, r.ingredients.filter((ing) => !hasIngredient(have, ing))));
  return [...out, ...extras].slice(0, 6);
}

export function popularRecipes(prefs: Prefs): Recipe[] {
  return BOOK.filter((r) => dietOk(r, prefs.diet))
    .filter((r) => (prefs.diet === "fast" ? r.minutes <= 15 : r.minutes <= prefs.maxMinutes))
    .slice(0, 6)
    .map((r) => toRecipe(r, prefs.servings, []));
}

export function sampleAnalysis(prefs: Prefs) {
  return {
    ingredients: SAMPLE_INGREDIENTS,
    notes: "Demo del frigo italiano: latticini, verdure, pollo e basilico.",
    recipes: matchCookbook(SAMPLE_INGREDIENTS.map((i) => i.name), prefs),
  };
}

export function artForRecipe(title: string, fallback?: string) {
  const t = norm(title);
  if (t.includes("pesto") || t.includes("avocado")) return FOOD_ART.avocado;
  if (t.includes("pomodor") || t.includes("caprese") || t.includes("purgatorio") || t.includes("sugo") || t.includes("norma") || t.includes("ragu")) return FOOD_ART.tomato;
  if (t.includes("insalat") || t.includes("lattuga") || t.includes("carot") || t.includes("frutta") || t.includes("broccoli")) return FOOD_ART.lettuce;
  if (t.includes("cipoll") || t.includes("zucchini") || t.includes("frittata") || t.includes("zucchin") || t.includes("carbonara") || t.includes("hamburger") || t.includes("aglio")) return FOOD_ART.onion;
  if (t.includes("limon") || t.includes("cacio") || t.includes("crepes") || t.includes("mousse") || t.includes("budino") || t.includes("scaloppine")) return FOOD_ART.lemon;
  if (t.includes("peperon") || t.includes("salsiccia")) return FOOD_ART.pepper;
  if (t.includes("fungh")) return FOOD_ART.mushrooms;
  return fallback || FOOD_ART.hero;
}
