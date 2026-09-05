import type { Analysis, Diet, Ingredient, Prefs, Recipe } from "./types";

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
  "uova",
  "latte",
  "pomodori",
  "pesto",
  "mozzarella",
  "limone",
  "vino bianco",
  "parmigiano",
  "insalata",
  "yogurt",
  "carote",
  "zucchine",
  "pasta",
  "cipolla",
  "olio extravergine",
].map((name) => ({ name, have: true }));

type BookRecipe = Omit<Recipe, "missing" | "servings"> & {
  tags: string[];
  baseServings: number;
};

const BOOK: BookRecipe[] = [
  {
    id: "pesto",
    title: "Pasta al pesto",
    minutes: 20,
    diet: "vegetarian",
    tags: ["pasta", "pesto", "parmigiano", "basilico"],
    ingredients: ["pasta", "pesto", "parmigiano", "olio extravergine"],
    steps: [
      "Porta a ebollizione acqua salata e cuoci la pasta al dente.",
      "In una ciotola sciogli il pesto con un filo d'olio e un mestolo di acqua di cottura.",
      "Scola la pasta, manteca con pesto e parmigiano. Servi subito.",
    ],
    art: FOOD_ART.avocado,
    baseServings: 2,
  },
  {
    id: "caprese",
    title: "Caprese lampo",
    minutes: 10,
    diet: "vegetarian",
    tags: ["mozzarella", "pomodori", "basilico", "olio"],
    ingredients: ["mozzarella", "pomodori", "olio extravergine", "sale"],
    steps: [
      "Affetta mozzarella e pomodori.",
      "Alterna i dischi nel piatto, condisci con olio, sale e pepe.",
      "Lascia riposare due minuti e servi fresco.",
    ],
    art: FOOD_ART.tomato,
    baseServings: 2,
  },
  {
    id: "frittata",
    title: "Frittata di zucchine",
    minutes: 25,
    diet: "vegetarian",
    tags: ["uova", "zucchine", "parmigiano", "cipolla"],
    ingredients: ["uova", "zucchine", "parmigiano", "cipolla", "olio extravergine"],
    steps: [
      "Rosola cipolla e zucchine a fette in padella.",
      "Sbatti le uova con parmigiano, sale e pepe.",
      "Versa sulle verdure e cuoci a fuoco medio coperta, poi girala.",
    ],
    art: FOOD_ART.onion,
    baseServings: 2,
  },
  {
    id: "insalata",
    title: "Insalata Boston al limone",
    minutes: 8,
    diet: "vegan",
    tags: ["insalata", "limone", "olio", "carote"],
    ingredients: ["insalata", "limone", "olio extravergine", "carote"],
    steps: [
      "Lava e asciuga l'insalata.",
      "Condisci con succo di limone, olio e un pizzico di sale.",
      "Aggiungi carote a julienne e servi subito.",
    ],
    art: FOOD_ART.lettuce,
    baseServings: 2,
  },
  {
    id: "pomodoro",
    title: "Pasta al pomodoro",
    minutes: 25,
    diet: "vegan",
    tags: ["pasta", "pomodori", "cipolla", "olio"],
    ingredients: ["pasta", "pomodori", "cipolla", "olio extravergine"],
    steps: [
      "Soffriggi la cipolla, aggiungi i pomodori spezzettati.",
      "Lascia restringere 12 minuti con sale.",
      "Cuoci la pasta e mantecala nel sugo.",
    ],
    art: FOOD_ART.tomato,
    baseServings: 2,
  },
  {
    id: "funghi",
    title: "Funghi saltati",
    minutes: 15,
    diet: "vegan",
    tags: ["funghi", "aglio", "prezzemolo", "olio"],
    ingredients: ["funghi", "aglio", "olio extravergine", "prezzemolo"],
    steps: [
      "Pulisci i funghi e tagliali a fette.",
      "Rosolali a fiamma viva con aglio e olio, senza mescolare troppo.",
      "Sali, spegni e completa con prezzemolo.",
    ],
    art: FOOD_ART.mushrooms,
    baseServings: 2,
  },
  {
    id: "peperoni",
    title: "Peperoni in padella",
    minutes: 20,
    diet: "vegan",
    tags: ["peperoni", "cipolla", "olio"],
    ingredients: ["peperoni", "cipolla", "olio extravergine"],
    steps: [
      "Taglia i peperoni a strisce e la cipolla a fettine.",
      "Cuoci coperti 15 minuti con olio, poi scopri per far evaporare.",
      "Regola di sale e servi tiepidi o freddi.",
    ],
    art: FOOD_ART.pepper,
    baseServings: 2,
  },
  {
    id: "uova-strapazzate",
    title: "Uova al parmigiano",
    minutes: 8,
    diet: "vegetarian",
    tags: ["uova", "parmigiano", "latte"],
    ingredients: ["uova", "parmigiano", "latte", "burro"],
    steps: [
      "Sbatti le uova con un cucchiaio di latte e parmigiano.",
      "Cuoci a fuoco bassissimo mescolando in continuazione.",
      "Spegni cremose e servi sul pane.",
    ],
    art: FOOD_ART.lemon,
    baseServings: 1,
  },
  {
    id: "pasta-limone",
    title: "Pasta al limone",
    minutes: 18,
    diet: "vegetarian",
    tags: ["pasta", "limone", "parmigiano", "burro"],
    ingredients: ["pasta", "limone", "parmigiano", "burro"],
    steps: [
      "Cuoci la pasta. Nel frattempo sciogli burro e zest di limone.",
      "Aggiungi succo, un mestolo d'acqua e parmigiano.",
      "Manteca la pasta fino a una salsa setosa.",
    ],
    art: FOOD_ART.lemon,
    baseServings: 2,
  },
  {
    id: "carote-yogurt",
    title: "Carote allo yogurt",
    minutes: 12,
    diet: "vegetarian",
    tags: ["carote", "yogurt", "limone"],
    ingredients: ["carote", "yogurt", "limone", "olio extravergine"],
    steps: [
      "Grattugia le carote.",
      "Condisci con yogurt, limone, olio e sale.",
      "Lascia riposare 5 minuti in frigo.",
    ],
    art: FOOD_ART.lettuce,
    baseServings: 2,
  },
  {
    id: "zucchine",
    title: "Zucchine trifolate",
    minutes: 15,
    diet: "vegan",
    tags: ["zucchine", "aglio", "olio"],
    ingredients: ["zucchine", "aglio", "olio extravergine"],
    steps: [
      "Taglia le zucchine a rondelle.",
      "Saltale in padella con aglio e olio 8–10 minuti.",
      "Sali e servi come contorno o su pasta.",
    ],
    art: FOOD_ART.onion,
    baseServings: 2,
  },
  {
    id: "mozza-pesto",
    title: "Mozzarella al pesto",
    minutes: 6,
    diet: "vegetarian",
    tags: ["mozzarella", "pesto", "olio"],
    ingredients: ["mozzarella", "pesto", "olio extravergine"],
    steps: [
      "Scola e affetta la mozzarella.",
      "Spalma un velo di pesto, un filo d'olio.",
      "Servi con pane tostato.",
    ],
    art: FOOD_ART.avocado,
    baseServings: 1,
  },
];

const ALIASES: Record<string, string[]> = {
  pasta: ["spaghetti", "penne", "fusilli", "trofie", "pasta avanzata"],
  pomodori: ["pomodoro", "pomodorini"],
  uova: ["uovo", "eggs"],
  mozzarella: ["fior di latte"],
  parmigiano: ["parmigiano reggiano", "grana"],
  insalata: ["lattuga", "verde", "boston"],
  funghi: ["champignon", "porcini"],
  peperoni: ["peperone"],
  cipolla: ["cipolle"],
  zucchine: ["zucchina"],
  limone: ["limoni"],
  pesto: ["pesto genovese"],
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

function hasIngredient(have: string[], needed: string) {
  const n = norm(needed);
  const aliases = [n, ...(ALIASES[needed] ?? []).map(norm)];
  return have.some((h) => {
    const hn = norm(h);
    return aliases.some((a) => hn.includes(a) || a.includes(hn));
  });
}

function dietOk(recipe: BookRecipe, diet: Diet) {
  if (diet === "vegan") return recipe.diet === "vegan";
  if (diet === "vegetarian") return recipe.diet !== "omnivore";
  return true;
}

function scaleList(items: string[], from: number, to: number) {
  if (from === to) return items;
  return items.map((line) => line);
}

export function matchCookbook(haveRaw: string[], prefs: Prefs): Recipe[] {
  const have = haveRaw.map(norm).filter(Boolean);
  const scored = BOOK.filter((r) => dietOk(r, prefs.diet))
    .filter((r) => r.minutes <= prefs.maxMinutes)
    .map((r) => {
      const missing = r.ingredients.filter((ing) => !hasIngredient(have, ing));
      const hit = r.ingredients.length - missing.length;
      const score = hit * 3 - missing.length + (r.minutes <= 15 ? 1 : 0);
      const servings = prefs.servings;
      const recipe: Recipe = {
        id: r.id,
        title: r.title,
        minutes: r.minutes,
        diet: r.diet,
        servings,
        missing,
        ingredients: scaleList(r.ingredients, r.baseServings, servings),
        steps: r.steps,
        art: r.art,
      };
      return { recipe, score, hit };
    })
    .filter((x) => x.hit > 0)
    .sort((a, b) => b.score - a.score);

  const out = scored.map((s) => s.recipe);
  if (out.length >= 4) return out.slice(0, 6);

  const extras = BOOK.filter((r) => dietOk(r, prefs.diet))
    .filter((r) => r.minutes <= prefs.maxMinutes)
    .filter((r) => !out.some((o) => o.id === r.id))
    .slice(0, 6 - out.length)
    .map((r) => ({
      id: r.id,
      title: r.title,
      minutes: r.minutes,
      diet: r.diet,
      servings: prefs.servings,
      missing: r.ingredients.filter((ing) => !hasIngredient(have, ing)),
      ingredients: r.ingredients,
      steps: r.steps,
      art: r.art,
    }));
  return [...out, ...extras].slice(0, 6);
}

export function popularRecipes(prefs: Prefs): Recipe[] {
  return BOOK.filter((r) => dietOk(r, prefs.diet))
    .filter((r) => (prefs.diet === "fast" ? r.minutes <= 15 : r.minutes <= prefs.maxMinutes))
    .slice(0, 6)
    .map((r) => ({
      id: r.id,
      title: r.title,
      minutes: r.minutes,
      diet: r.diet,
      servings: prefs.servings,
      missing: [],
      ingredients: r.ingredients,
      steps: r.steps,
      art: r.art,
    }));
}

export function sampleAnalysis(prefs: Prefs): Analysis {
  const recipes = matchCookbook(
    SAMPLE_INGREDIENTS.map((i) => i.name),
    prefs,
  );
  return {
    ingredients: SAMPLE_INGREDIENTS,
    notes: "Demo del frigo italiano: uova, latticini, verdure e pesto.",
    recipes,
  };
}

export function artForRecipe(title: string, fallback?: string) {
  const t = norm(title);
  if (t.includes("pesto") || t.includes("avocado")) return FOOD_ART.avocado;
  if (t.includes("pomodor") || t.includes("caprese")) return FOOD_ART.tomato;
  if (t.includes("insalat") || t.includes("lattuga") || t.includes("carot")) return FOOD_ART.lettuce;
  if (t.includes("cipoll") || t.includes("zucchini") || t.includes("frittata")) return FOOD_ART.onion;
  if (t.includes("limon")) return FOOD_ART.lemon;
  if (t.includes("peperon")) return FOOD_ART.pepper;
  if (t.includes("fungh")) return FOOD_ART.mushrooms;
  return fallback ?? FOOD_ART.hero;
}
