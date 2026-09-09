export type Diet = "any" | "vegetarian" | "vegan" | "fast";

export type Prefs = {
  diet: Diet;
  maxMinutes: number;
  servings: number;
};

export type Ingredient = {
  name: string;
  have: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  minutes: number;
  diet: "omnivore" | "vegetarian" | "vegan";
  servings: number;
  missing: string[];
  ingredients: string[];
  steps: string[];
  art: string;
};

export type Analysis = {
  ingredients: Ingredient[];
  notes: string;
  recipes: Recipe[];
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
  maxMinutes: 40,
  servings: 2,
};
