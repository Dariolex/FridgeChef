export type Diet = "any" | "vegetarian" | "vegan" | "fast";

export type Course = "main" | "dessert";

export type Prefs = {
  diet: Diet;
  course: Course;
  maxMinutes: number;
  servings: number;
};

export type Ingredient = {
  name: string;
  have: boolean;
  quantity?: string;
  confidence?: "alta" | "media" | "bassa";
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  minutes: number;
  diet: "omnivore" | "vegetarian" | "vegan";
  servings: number;
  missing: string[];
  ingredients: string[];
  steps: string[];
  tip?: string;
  art: string;
};

export type Analysis = {
  ingredients: Ingredient[];
  notes: string;
  recipes: Recipe[];
  /** Origine delle ricette mostrate: AI o ricettario di riserva. */
  source?: "ai" | "book";
};

export type HistoryEntry = {
  id: string;
  at: number;
  recipe: Recipe;
};

export type ShoppingItem = {
  id: string;
  name: string;
  from: string;
  done: boolean;
  at: number;
};

export const DEFAULT_PREFS: Prefs = {
  diet: "any",
  course: "main",
  maxMinutes: 40,
  servings: 2,
};
