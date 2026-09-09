import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  ChefHat,
  Clock3,
  Home,
  Minus,
  Plus,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cookFromFridge } from "@/lib/analyze";
import { artForRecipe, FOOD_ART, popularRecipes } from "@/lib/cookbook";
import { clearHistory, loadHistory, pushHistory } from "@/lib/history";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PREFS,
  type Analysis,
  type Diet,
  type HistoryEntry,
  type Prefs,
  type Recipe,
} from "@/lib/types";

type Phase = "idle" | "analyzing" | "ready";
type Tab = "home" | "recipes" | "camera" | "history" | "profile";

const DIETS: { id: Diet; label: string }[] = [
  { id: "any", label: "Qualsiasi" },
  { id: "vegetarian", label: "Vegetariano" },
  { id: "vegan", label: "Vegano" },
  { id: "fast", label: "Veloce" },
];

function LeafMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#C6F53D" />
      <path
        d="M16.2 7.2c4.8 1.4 8 5.4 8.3 10.4-3.6-.2-7.2-2.2-9-5.8-1.7 3.4-4.9 5.4-8.5 5.8C7.4 12.4 11 8.6 16.2 7.2Z"
        fill="#10140A"
      />
      <path d="M16 13.2v11.2" stroke="#10140A" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function FrigoChef() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [tab, setTab] = useState<Tab>("home");
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [photo, setPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState("");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const popular = useMemo(() => popularRecipes({ ...prefs, maxMinutes: prefs.diet === "fast" ? 15 : prefs.maxMinutes }), [prefs]);

  const persist = async (dataUrl: string, next: Analysis) => {
    setPhoto(dataUrl);
    setAnalysis(next);
    setPhase("ready");
    setTab("home");
  };

  const cookRecipe = (recipe: Recipe) => {
    setHistory(pushHistory(recipe));
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setPhase("analyzing");
    setTab("home");
    setError(null);
    setSelected(null);
    try {
      const dataUrl = await compressImage(file);
      setPhoto(dataUrl);
      const extra = manual
        .split(/[,;\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await cookFromFridge({ data: { image: dataUrl, ingredients: extra, prefs } });
      if (res.ok) {
        setError(null);
        await persist(dataUrl, res.analysis);
        return;
      }
      if (res.analysis && res.analysis.recipes.length) {
        setError(null);
        await persist(dataUrl, res.analysis);
        return;
      }
      const fallback = await cookFromFridge({ data: { ingredients: extra, prefs } });
      if (fallback.ok && fallback.analysis.recipes.length) {
        setError("Non riesco a leggere la foto in automatico. Ho usato gli ingredienti inseriti.");
        await persist(dataUrl, fallback.analysis);
        return;
      }
      setError("Non riesco a leggere la foto in automatico. Aggiungi gli ingredienti che vedi.");
      await persist(dataUrl, {
        ingredients: extra.map((name) => ({ name, have: true })),
        notes: "",
        recipes: [],
      });
    } catch {
      setError("Qualcosa è andato storto. Riprova o aggiungi gli ingredienti a mano.");
      setPhase("idle");
    }
  };


  const addManual = async () => {
    const extra = manual
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!extra.length) return;
    setPhase("analyzing");
    setTab("home");
    setError(null);
    const res = await cookFromFridge({ data: { ingredients: extra, prefs } });
    if (res.ok || res.analysis) {
      setAnalysis((res.ok ? res.analysis : res.analysis) ?? null);
      setPhase("ready");
    } else {
      setError(res.error);
      setPhase("idle");
    }
  };

  const reset = () => {
    setPhase("idle");
    setAnalysis(null);
    setPhoto(null);
    setError(null);
    setSelected(null);
    setTab("home");
  };

  const filteredPopular = popular.filter((r) => !query || r.title.toLowerCase().includes(query.toLowerCase()));
  const shownRecipes = (analysis?.recipes ?? filteredPopular).filter(
    (r) => !query || r.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-bg text-fg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,#1a2430,transparent_60%)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 pb-28 pt-6">
        <header className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LeafMark className="size-11" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Dal frigo al piatto</p>
              <h1 className="text-xl font-semibold tracking-tight">FrigoChef</h1>
            </div>
          </div>
          <div className="glass flex items-center gap-2 rounded-full px-2 py-1">
            <button
              type="button"
              className="grid size-8 place-items-center rounded-full text-muted"
              onClick={() => setPrefs((p) => ({ ...p, servings: Math.max(1, p.servings - 1) }))}
              aria-label="Meno porzioni"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="min-w-8 text-center text-sm font-semibold">{prefs.servings}</span>
            <button
              type="button"
              className="grid size-8 place-items-center rounded-full text-muted"
              onClick={() => setPrefs((p) => ({ ...p, servings: Math.min(8, p.servings + 1) }))}
              aria-label="Più porzioni"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        </header>

        <div className={cn("relative mb-6", tab !== "home" && tab !== "recipes" && "hidden")}>
          <img src={FOOD_ART.avocado} alt="" className="food-float float-a absolute -left-6 -top-7 z-20 w-24" />
          <img src={FOOD_ART.tomato} alt="" className="food-float float-b absolute -right-2 -top-8 z-20 w-20" />
          <img src={FOOD_ART.lettuce} alt="" className="food-float float-c absolute -right-7 top-9 z-0 w-28 opacity-90" />
          <img src={FOOD_ART.onion} alt="" className="food-float float-b absolute -left-7 top-20 z-0 w-20" />

          <label className="glass relative z-10 flex h-14 items-center gap-3 rounded-full px-5">
            <Search className="size-5 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca una ricetta"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </label>
        </div>

        <div
          className={cn(
            "mb-5 flex gap-2 overflow-x-auto pb-1",
            tab !== "home" && tab !== "recipes" && "hidden",
          )}
        >
          {DIETS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setPrefs((p) => ({ ...p, diet: d.id, maxMinutes: d.id === "fast" ? 15 : 40 }))}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
                prefs.diet === d.id ? "bg-accent text-accent-fg" : "glass text-fg",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        {tab === "home" && phase === "idle" && (
          <section className="space-y-5">
            <Button variant="lime" size="lg" className="w-full" onClick={() => fileRef.current?.click()}>
              <Camera className="size-5" />
              Scatta una foto
            </Button>
            <div className="glass rounded-[28px] p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Oppure scrivi cosa hai</p>
              <div className="flex gap-2">
                <input
                  value={manual}
                  onChange={(e) => setManual(e.target.value)}
                  placeholder="uova, pomodori, pasta"
                  className="h-11 flex-1 rounded-full bg-fg/8 px-4 text-sm outline-none placeholder:text-muted"
                />
                <Button size="sm" onClick={addManual}>
                  Vai
                </Button>
              </div>
            </div>
            <RecipeGrid
              title="Popolari oggi"
              recipes={filteredPopular}
              onOpen={setSelected}
            />
          </section>
        )}

        {tab === "home" && phase === "analyzing" && (
          <section className="glass flex flex-col items-center gap-4 rounded-[32px] px-6 py-16 text-center">
            <img src={FOOD_ART.hero} alt="" className="h-28 w-40 object-contain" />
            <p className="text-lg font-semibold">Sto guardando nel frigo</p>
            <p className="text-sm text-muted">Riconosco gli ingredienti e scelgo le ricette.</p>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-fg/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
            </div>
          </section>
        )}

        {tab === "home" && phase === "ready" && analysis && (
          <section className="space-y-5">
            {photo && (
              <div className="overflow-hidden rounded-[28px]">
                <img src={photo} alt="Il tuo frigo" className="h-40 w-full object-cover" />
              </div>
            )}
            {error && (!analysis.recipes.length) && (
              <p className="glass rounded-2xl px-4 py-3 text-sm text-muted">{error}</p>
            )}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Nel frigo</h2>
                <button type="button" className="text-sm text-muted" onClick={reset}>
                  Nuova foto
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.ingredients.map((ing) => (
                  <span key={ing.name} className="glass rounded-full px-3 py-1.5 text-sm">
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
            <RecipeGrid title="Cosa cucini ora" recipes={shownRecipes} onOpen={setSelected} />
          </section>
        )}

        {tab === "recipes" && (
          <section className="space-y-5">
            {analysis && analysis.recipes.length > 0 && (
              <RecipeGrid title="Dal tuo frigo" recipes={analysis.recipes} onOpen={setSelected} />
            )}
            <RecipeGrid title="Tutti i piatti" recipes={filteredPopular} onOpen={setSelected} />
            {filteredPopular.length === 0 && (
              <p className="glass rounded-2xl px-4 py-3 text-sm text-muted">
                Nessun piatto per questa ricerca. Prova a cambiare filtro o parola.
              </p>
            )}
          </section>
        )}

        {tab === "history" && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Piatti cucinati</h2>
              {history.length > 0 && (
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-sm text-muted"
                  onClick={() => {
                    clearHistory();
                    setHistory([]);
                  }}
                >
                  <Trash2 className="size-4" />
                  Svuota
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <div className="glass flex flex-col items-center gap-3 rounded-[32px] px-6 py-14 text-center">
                <img src={FOOD_ART.hero} alt="" className="h-24 w-36 object-contain" />
                <p className="text-sm text-muted">
                  Ancora nessun piatto. Apri una ricetta e tocca “Ho cucinato questo” per ritrovarla qui.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {history.map((h) => (
                  <li key={h.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(h.recipe)}
                      className="glass flex w-full gap-3 overflow-hidden rounded-[24px] p-3 text-left"
                    >
                      <img
                        src={artForRecipe(h.recipe.title, h.recipe.art)}
                        alt=""
                        className="size-20 shrink-0 rounded-2xl object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="text-xs text-muted">
                          {new Date(h.at).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="line-clamp-2 text-sm font-semibold leading-snug">{h.recipe.title}</p>
                        <p className="text-xs text-muted">
                          {h.recipe.minutes} min · {h.recipe.ingredients.length} ingredienti
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {tab === "profile" && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Le tue preferenze</h2>

            <div className="glass space-y-3 rounded-[28px] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Dieta</p>
              <div className="flex flex-wrap gap-2">
                {DIETS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setPrefs((p) => ({ ...p, diet: d.id, maxMinutes: d.id === "fast" ? 15 : 40 }))}
                    className={cn(
                      "h-10 rounded-full px-4 text-sm font-medium transition-colors",
                      prefs.diet === d.id ? "bg-accent text-accent-fg" : "bg-fg/8 text-fg",
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass flex items-center justify-between rounded-[28px] p-4">
              <div>
                <p className="text-sm font-semibold">Porzioni</p>
                <p className="text-xs text-muted">Per quante persone cucini</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full bg-fg/8"
                  onClick={() => setPrefs((p) => ({ ...p, servings: Math.max(1, p.servings - 1) }))}
                  aria-label="Meno porzioni"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">{prefs.servings}</span>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full bg-fg/8"
                  onClick={() => setPrefs((p) => ({ ...p, servings: Math.min(8, p.servings + 1) }))}
                  aria-label="Più porzioni"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div className="glass flex items-center justify-between rounded-[28px] p-4">
              <div>
                <p className="text-sm font-semibold">Tempo massimo</p>
                <p className="text-xs text-muted">Quanto vuoi stare ai fornelli</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full bg-fg/8"
                  onClick={() => setPrefs((p) => ({ ...p, maxMinutes: Math.max(10, p.maxMinutes - 5) }))}
                  aria-label="Meno minuti"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-12 text-center text-sm font-semibold">{prefs.maxMinutes} min</span>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full bg-fg/8"
                  onClick={() => setPrefs((p) => ({ ...p, maxMinutes: Math.min(90, p.maxMinutes + 5) }))}
                  aria-label="Più minuti"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div className="glass rounded-[28px] p-4 text-sm text-muted">
              <p className="mb-1 font-semibold text-fg">FrigoChef</p>
              <p>
                Le foto vengono analizzate solo per riconoscere gli ingredienti. La storia resta salvata su questo
                dispositivo.
              </p>
            </div>
          </section>
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] px-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="glass relative grid h-[72px] grid-cols-5 items-center rounded-full px-2">
          <NavBtn active={tab === "home"} onClick={() => { setTab("home"); if (phase !== "ready") setPhase("idle"); }} icon={Home} label="Home" />
          <NavBtn active={tab === "recipes"} onClick={() => setTab("recipes")} icon={ChefHat} label="Piatti" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="-mt-8 grid size-16 place-items-center rounded-full bg-accent text-accent-fg shadow-[0_10px_30px_rgba(198,245,61,0.35)]"
            aria-label="Apri fotocamera"
          >
            <Camera className="size-6" />
          </button>
          <NavBtn active={tab === "history"} onClick={() => setTab("history")} icon={Clock3} label="Storia" />
          <NavBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={UserRound} label="Tu" />
        </div>
      </nav>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {selected && (
        <RecipeSheet
          recipe={selected}
          onClose={() => setSelected(null)}
          servings={prefs.servings}
          onCook={cookRecipe}
          cooked={history.some((h) => h.recipe.title === selected.title)}
        />
      )}
    </main>
  );
}

function NavBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Home;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex flex-col items-center gap-1 text-[10px] font-medium", active ? "text-accent" : "text-muted")}
    >
      <Icon className="size-5" />
      {label}
    </button>
  );
}

function RecipeGrid({
  title,
  recipes,
  onOpen,
}: {
  title: string;
  recipes: Recipe[];
  onOpen: (r: Recipe) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Sparkles className="size-4 text-accent" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {recipes.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onOpen(r)}
            className="glass overflow-hidden rounded-[28px] text-left"
          >
            <div className="relative h-36 bg-elevated">
              <img
                src={artForRecipe(r.title, r.art)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
            <div className="space-y-2 p-3">
              <p className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug">{r.title}</p>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{r.minutes} min</span>
                <span className="rounded-full bg-accent px-2.5 py-1 font-semibold text-accent-fg">Apri</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecipeSheet({
  recipe,
  onClose,
  servings,
  onCook,
  cooked,
}: {
  recipe: Recipe;
  onClose: () => void;
  servings: number;
  onCook: (r: Recipe) => void;
  cooked: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-black/55 p-0 sm:place-items-center sm:p-6">
      <div className="relative max-h-[92dvh] w-full max-w-[430px] overflow-y-auto rounded-t-[36px] bg-surface sm:rounded-[36px]">
        <div className="relative h-56 overflow-hidden">
          <img src={artForRecipe(recipe.title, recipe.art)} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-bg/70 text-fg"
            aria-label="Chiudi"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="space-y-5 px-5 pb-10 pt-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">
              {recipe.minutes} min · {servings} porzioni · {recipe.diet === "vegan" ? "vegano" : recipe.diet === "vegetarian" ? "vegetariano" : "classico"}
            </p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight">{recipe.title}</h3>
          </div>
          {recipe.missing.length > 0 && (
            <p className="text-sm text-muted">Ti manca: {recipe.missing.join(", ")}</p>
          )}
          <div>
            <h4 className="mb-2 text-sm font-semibold">Ingredienti</h4>
            <ul className="space-y-1.5 text-sm text-muted">
              {recipe.ingredients.map((ing) => (
                <li key={ing}>· {ing}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Passi</h4>
            <ol className="space-y-3 text-sm leading-relaxed text-muted">
              {recipe.steps.map((step, i) => (
                <li key={i}>
                  <span className="mr-2 font-semibold text-accent">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <Button
            variant="lime"
            size="lg"
            className="w-full"
            onClick={() => {
              onCook(recipe);
              onClose();
            }}
          >
            <ChefHat className="size-5" />
            {cooked ? "Ho cucinato di nuovo" : "Ho cucinato questo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
