/**
 * Server functions FrigoChef — inventario foto + generazione ricette.
 * Usa recipe-ai.ts (due chiamate Gemini separate, errori espliciti, ripiego dichiarato).
 */
import { createServerFn } from "@tanstack/react-start";
import { matchCookbook } from "./cookbook";
import {
  AI_FAILURE_MESSAGE,
  detectIngredients,
  generateRecipes,
  ingredientLabel,
  organizeFridge,
  toAppIngredients,
  type AiRecipe,
  type AppIngredient,
  type FridgeOrganization,
} from "./recipe-ai";
import type { Analysis, Prefs, Recipe } from "./types";

export type ReadFridgeOk = {
  ok: true;
  ingredients: AppIngredient[];
  notes: string;
};

export type ReadFridgeErr = {
  ok: false;
  message: string;
};

export type CreateRecipesOk = {
  ok: true;
  source: "ai";
  recipes: AiRecipe[];
  notes: string;
};

export type CreateRecipesFallback = {
  ok: false;
  source: "book";
  message: string;
  recipes: Recipe[];
};

export type OrganizeFridgeOk = {
  ok: true;
  plan: FridgeOrganization;
};

export type OrganizeFridgeErr = {
  ok: false;
  message: string;
};

/** Inventario dalla foto: solo riconoscimento, nessuna ricetta. */
export const readFridgePhoto = createServerFn({ method: "POST" })
  .validator((data: { image: string }) => data)
  .handler(async ({ data }): Promise<ReadFridgeOk | ReadFridgeErr> => {
    const res = await detectIngredients(data.image);
    if (!res.ok) {
      console.error("[readFridgePhoto]", res.reason, res.detail);
      return { ok: false, message: AI_FAILURE_MESSAGE[res.reason] };
    }
    return {
      ok: true,
      ingredients: toAppIngredients(res.data.ingredients),
      notes: res.data.notes,
    };
  });

/** Generazione ricette da ingredienti confermati. In errore: ricettario + messaggio. */
export const createRecipes = createServerFn({ method: "POST" })
  .validator(
    (data: {
      ingredients: string[];
      prefs: Prefs;
      avoidTitles?: string[];
      count?: number;
    }) => data,
  )
  .handler(async ({ data }): Promise<CreateRecipesOk | CreateRecipesFallback> => {
    const { ingredients, prefs, avoidTitles, count } = data;
    const res = await generateRecipes({
      ingredients,
      prefs,
      avoidTitles,
      count,
    });

    if (res.ok) {
      return {
        ok: true,
        source: "ai",
        recipes: res.data.recipes,
        notes: res.data.notes,
      };
    }

    console.error("[createRecipes]", res.reason, res.detail);
    const names = ingredients.map((label) => label.replace(/\s*\([^)]*\)\s*$/, "").trim());
    const bookRecipes = matchCookbook(names, {
      ...prefs,
      maxMinutes: prefs.diet === "fast" ? Math.min(15, prefs.maxMinutes) : prefs.maxMinutes,
    });
    return {
      ok: false,
      source: "book",
      message: AI_FAILURE_MESSAGE[res.reason],
      recipes: bookRecipes,
    };
  });

type CookInput = {
  image?: string;
  ingredients?: string[];
  prefs: Prefs;
};

/** Disposizione ottimale degli alimenti nei ripiani del frigo. */
export const organizeFridgePlan = createServerFn({ method: "POST" })
  .validator(
    (data: { ingredients: { name: string; quantity?: string; confidence?: string }[] }) => data,
  )
  .handler(async ({ data }): Promise<OrganizeFridgeOk | OrganizeFridgeErr> => {
    const res = await organizeFridge(data.ingredients ?? []);
    if (!res.ok) {
      console.error("[organizeFridgePlan]", res.reason, res.detail);
      return { ok: false, message: AI_FAILURE_MESSAGE[res.reason] };
    }
    return { ok: true, plan: res.data };
  });

/**
 * @deprecated Preferire readFridgePhoto + createRecipes.
 * Lasciata per compatibilità; il componente non deve più usarla.
 */
export const cookFromFridge = createServerFn({ method: "POST" })
  .validator((input: CookInput) => input)
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; analysis: Analysis } | { ok: false; error: string; analysis?: Analysis }> => {
      const prefs = data.prefs;
      const manual = (data.ingredients ?? []).map((s) => s.trim()).filter(Boolean);

      if (data.image) {
        const inv = await detectIngredients(data.image);
        if (!inv.ok) {
          console.error("[cookFromFridge/vision]", inv.reason, inv.detail);
          const book = matchCookbook(manual, prefs);
          return {
            ok: false,
            error: AI_FAILURE_MESSAGE[inv.reason],
            analysis: {
              ingredients: manual.map((name) => ({ name, have: true })),
              notes: "",
              recipes: book,
              source: "book",
            },
          };
        }
        const appIngredients = toAppIngredients(inv.data.ingredients);
        const labels = [
          ...appIngredients.filter((i) => i.have).map(ingredientLabel),
          ...manual,
        ];
        const gen = await generateRecipes({ ingredients: labels, prefs });
        if (gen.ok) {
          return {
            ok: true,
            analysis: {
              ingredients: appIngredients,
              notes: gen.data.notes || inv.data.notes,
              recipes: gen.data.recipes,
              source: "ai",
            },
          };
        }
        console.error("[cookFromFridge/recipes]", gen.reason, gen.detail);
        const names = labels.map((l) => l.replace(/\s*\([^)]*\)\s*$/, "").trim());
        return {
          ok: false,
          error: AI_FAILURE_MESSAGE[gen.reason],
          analysis: {
            ingredients: appIngredients,
            notes: inv.data.notes,
            recipes: matchCookbook(names, prefs),
            source: "book",
          },
        };
      }

      // Solo testo → passa comunque da generateRecipes (non più solo ricettario)
      if (!manual.length) {
        return {
          ok: false,
          error: "Aggiungi gli ingredienti a mano.",
          analysis: { ingredients: [], notes: "", recipes: [], source: "book" },
        };
      }
      const gen = await generateRecipes({ ingredients: manual, prefs });
      if (gen.ok) {
        return {
          ok: true,
          analysis: {
            ingredients: manual.map((name) => ({ name, have: true })),
            notes: gen.data.notes,
            recipes: gen.data.recipes,
            source: "ai",
          },
        };
      }
      console.error("[cookFromFridge/manual]", gen.reason, gen.detail);
      return {
        ok: false,
        error: AI_FAILURE_MESSAGE[gen.reason],
        analysis: {
          ingredients: manual.map((name) => ({ name, have: true })),
          notes: "",
          recipes: matchCookbook(manual, prefs),
          source: "book",
        },
      };
    },
  );

export type { Ingredient } from "./types";
