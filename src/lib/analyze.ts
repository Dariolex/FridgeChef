import { createServerFn } from "@tanstack/react-start";
import { matchCookbook, sampleAnalysis } from "./cookbook";
import type { Analysis, Ingredient, Prefs, Recipe } from "./types";

type CookInput = {
  image?: string;
  ingredients?: string[];
  prefs: Prefs;
  demo?: boolean;
};

function safeParse<T>(raw: string): T | null {
  const trimmed = raw.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

function asAnalysis(parsed: Partial<Analysis> | null, prefs: Prefs, fallbackHave: string[]): Analysis {
  const have =
    parsed?.ingredients?.map((i) => ({
      name: String(i.name ?? "").trim(),
      have: i.have !== false,
    })).filter((i) => i.name) ?? fallbackHave.map((name) => ({ name, have: true }));

  const names = have.filter((i) => i.have).map((i) => i.name);
  const book = matchCookbook(names, prefs);
  const aiRecipes = Array.isArray(parsed?.recipes) ? parsed!.recipes! : [];
  const merged: Recipe[] = [];
  const seen = new Set<string>();

  for (const r of [...aiRecipes, ...book]) {
    const title = String(r.title ?? "").trim();
    if (!title) continue;
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push({
      id: String(r.id ?? key.replace(/\s+/g, "-")),
      title,
      minutes: Number(r.minutes) || 20,
      diet: r.diet === "vegan" || r.diet === "vegetarian" || r.diet === "omnivore" ? r.diet : "vegetarian",
      servings: prefs.servings,
      missing: Array.isArray(r.missing) ? r.missing.map(String) : [],
      ingredients: Array.isArray(r.ingredients) ? r.ingredients.map(String) : [],
      steps: Array.isArray(r.steps) ? r.steps.map(String) : [],
      art: typeof r.art === "string" ? r.art : "",
    });
  }

  return {
    ingredients: have.length ? have : fallbackHave.map((name) => ({ name, have: true })),
    notes: String(parsed?.notes ?? ""),
    recipes: merged.slice(0, 6),
  };
}

export const cookFromFridge = createServerFn({ method: "POST" })
  .validator((input: CookInput) => input)
  .handler(async ({ data }): Promise<{ ok: true; analysis: Analysis } | { ok: false; error: string; analysis?: Analysis }> => {
    const prefs = data.prefs;
    if (data.demo) {
      return { ok: true, analysis: sampleAnalysis(prefs) };
    }

    const manual = (data.ingredients ?? []).map((s) => s.trim()).filter(Boolean);
    if (manual.length && !data.image) {
      return { ok: true, analysis: asAnalysis(null, prefs, manual) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || !data.image) {
      if (manual.length) return { ok: true, analysis: asAnalysis(null, prefs, manual) };
      return {
        ok: false,
        error: "Vision non disponibile. Aggiungi gli ingredienti a mano o usa il frigo demo.",
        analysis: asAnalysis(null, prefs, manual),
      };
    }

    const dietHint =
      prefs.diet === "vegan"
        ? "solo ricette vegane"
        : prefs.diet === "vegetarian"
          ? "solo ricette vegetariane"
          : prefs.diet === "fast"
            ? "ricette veloci sotto i 15 minuti"
            : "qualsiasi dieta";

    const prompt = `Sei un chef italiano. Analizza la foto del frigo.
Rispondi SOLO con JSON valido, senza markdown:
{
  "ingredients": [{"name":"string in italiano minuscolo","have":true}],
  "notes": "una riga",
  "recipes": [{
    "id": "slug",
    "title": "nome italiano",
    "minutes": 20,
    "diet": "vegetarian|vegan|omnivore",
    "missing": ["cose mancanti"],
    "ingredients": ["lista"],
    "steps": ["passo 1","passo 2","passo 3"]
  }]
}
Regole: 4-6 ricette ${dietHint}, porzioni ${prefs.servings}, max ${prefs.maxMinutes} minuti.
Usa soprattutto gli ingredienti visibili.`;

    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash-lite",
          max_tokens: 1400,
          temperature: 0.3,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: data.image } },
              ],
            },
          ],
        }),
      });

      if (!res.ok) {
        const book = matchCookbook(manual, prefs);
        const analysis: Analysis = {
          ingredients: (manual.length ? manual : []).map((name) => ({ name, have: true })),
          notes: "",
          recipes: book,
        };
        return {
          ok: false,
          error: `Lettura automatica non disponibile (${res.status}). Uso il ricettario di riserva.`,
          analysis,
        };
      }

      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content ?? "";
      const parsed = safeParse<Analysis>(text);
      return { ok: true, analysis: asAnalysis(parsed, prefs, manual) };
    } catch {
      return {
        ok: false,
        error: "Rete occupata. Prova il frigo demo o aggiungi gli ingredienti.",
        analysis: asAnalysis(null, prefs, manual),
      };
    }
  });

export type { Ingredient };
