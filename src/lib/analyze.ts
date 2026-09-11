import { createServerFn } from "@tanstack/react-start";
import { matchCookbook } from "./cookbook";
import type { Analysis, Ingredient, Prefs, Recipe } from "./types";

type CookInput = {
  image?: string;
  ingredients?: string[];
  prefs: Prefs;
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
    parsed?.ingredients
      ?.map((i) => ({
        name: String(i.name ?? "").trim(),
        have: i.have !== false,
      }))
      .filter((i) => i.name) ?? fallbackHave.map((name) => ({ name, have: true }));

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
    const steps = Array.isArray(r.steps) ? r.steps.map(String).filter(Boolean) : [];
    const ingredients = Array.isArray(r.ingredients) ? r.ingredients.map(String).filter(Boolean) : [];
    merged.push({
      id: String(r.id ?? key.replace(/\s+/g, "-")),
      title,
      description: String((r as Recipe).description ?? "").trim(),
      minutes: Number(r.minutes) || 20,
      diet: r.diet === "vegan" || r.diet === "vegetarian" || r.diet === "omnivore" ? r.diet : "vegetarian",
      servings: prefs.servings,
      missing: Array.isArray(r.missing) ? r.missing.map(String) : [],
      ingredients,
      steps,
      tip: String((r as Recipe).tip ?? "").trim() || undefined,
      art: typeof r.art === "string" && r.art.startsWith("/graphics/") ? r.art : "",
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
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; analysis: Analysis } | { ok: false; error: string; analysis?: Analysis }> => {
      const prefs = data.prefs;

      const manual = (data.ingredients ?? []).map((s) => s.trim()).filter(Boolean);
      if (manual.length && !data.image) {
        return { ok: true, analysis: asAnalysis(null, prefs, manual) };
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || !data.image) {
        if (manual.length) return { ok: true, analysis: asAnalysis(null, prefs, manual) };
        return {
          ok: false,
          error: "Vision non disponibile. Aggiungi gli ingredienti a mano.",
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

      const courseHint =
        prefs.course === "dessert"
          ? "SOLO dessert e dolci (mousse, budini, crêpes, coppe di yogurt/frutta, tiramisù, ecc.). Niente piatti salati."
          : "SOLO piatti salati (primi, secondi, contorni). Niente dessert né dolci.";

      const prompt = `Sei uno chef italiano di cucina casalinga contemporanea, con stile chiaro e appetitoso. Analizza la foto del frigo e proponi ricette realistiche, buone da cucinare stasera.

Rispondi SOLO con JSON valido, senza markdown:
{
  "ingredients": [{"name":"string in italiano minuscolo","have":true}],
  "notes": "una riga sul frigo",
  "recipes": [{
    "id": "slug-corto",
    "title": "nome appetitoso e specifico in italiano",
    "description": "2-4 frasi sensoriali: gusto, texture, profumo e perché funziona con questi ingredienti. Evita frasi generiche.",
    "minutes": 20,
    "diet": "vegetarian|vegan|omnivore",
    "missing": ["solo ciò che davvero manca"],
    "ingredients": ["quantità + ingrediente, es. 320 g di pasta corta", "2 cucchiai di olio extravergine"],
    "steps": ["passo dettagliato con tempi e fuoco", "passo 2", "passo 3", "passo 4", "passo 5"],
    "tip": "un consiglio pratico di cottura o di tecnica"
  }]
}

Regole di qualità obbligatorie:
- 4-6 ricette ${dietHint}, per ${prefs.servings} porzioni, massimo ${prefs.maxMinutes} minuti
- ${courseHint}
- Usa soprattutto gli ingredienti visibili; non inventare una dispensa piena
- Titoli specifici e invitanti, non generici ("Pasta al pomodoro semplice", non "Pasta")
- description: linguaggio concreto e sensoriale (es. "setoso", "dorato", "acidulo", "lucido"), spiega texture e perché il piatto funziona
- ingredients: sempre con quantità o pezzi (g, cucchiai, n. pezzi)
- steps: 4-6 passi precisi con tempi, tipo di fuoco e quando salare; includi mantecatura o riposo se serve
- tip: un solo consiglio utile e pratico (tecnica, errore da evitare, variante)
- missing: lista breve; se non manca nulla usa []`;

      try {
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gemini-2.5-flash-lite",
            max_tokens: 2200,
            temperature: 0.45,
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
          error: "Rete occupata. Riprova o aggiungi gli ingredienti a mano.",
          analysis: asAnalysis(null, prefs, manual),
        };
      }
    },
  );

export type { Ingredient };
