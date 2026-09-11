import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChefHat,
  ChevronDown,
  Clock3,
  Home,
  Cake,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createRecipes, organizeFridgePlan, readFridgePhoto } from "@/lib/analyze";
import { artForRecipe, catalogBySection, FOOD_ART, matchCookbook, popularRecipes } from "@/lib/cookbook";
import { ingredientLabel, type FridgeOrganization } from "@/lib/recipe-ai";
import { clearHistory, loadHistory, pushHistory } from "@/lib/history";
import {
  addShopping,
  clearDoneShopping,
  loadShopping,
  removeShopping,
  toggleShopping,
} from "@/lib/shopping";
import { compressImage } from "@/lib/image";
import { cn } from "@/lib/utils";
import {
  DEFAULT_PREFS,
  type Analysis,
  type Diet,
  type HistoryEntry,
  type Prefs,
  type Recipe,
  type ShoppingItem,
} from "@/lib/types";

type Phase = "idle" | "analyzing" | "thinking" | "ready";
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
  const [prefsDirty, setPrefsDirty] = useState(false);
  const [extraIngredient, setExtraIngredient] = useState("");
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState("");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  /** Sezione aperta nel tab Ricette (catalogo a fisarmonica). */
  const [openCatalogId, setOpenCatalogId] = useState<string | null>(null);
  const [fridgePlan, setFridgePlan] = useState<FridgeOrganization | null>(null);
  const [organizing, setOrganizing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  useEffect(() => {
    setHistory(loadHistory());
    setShopping(loadShopping());
  }, []);
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && !localStorage.getItem("frigochef_onboarding_v1")) {
        setShowOnboarding(true);
      }
    } catch {
      /* private mode */
    }
  }, []);


  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const toBuy = shopping.filter((i) => !i.done).length;

  const addMissing = (recipe: Recipe) => {
    if (!recipe.missing.length) return;
    setShopping(addShopping(recipe.missing, recipe.title));
    setToast(
      recipe.missing.length === 1
        ? "1 ingrediente aggiunto alla spesa"
        : `${recipe.missing.length} ingredienti aggiunti alla spesa`,
    );
  };

  const updatePrefs = (patch: Partial<Prefs>) => {
    setPrefs((p) => ({ ...p, ...patch }));
    if (analysis?.recipes?.length) setPrefsDirty(true);
  };

  const popular = useMemo(() => popularRecipes({ ...prefs, maxMinutes: prefs.diet === "fast" ? 15 : prefs.maxMinutes }), [prefs]);


  const cookRecipe = (recipe: Recipe) => {
    setHistory(pushHistory(recipe));
  };

  const toggleIngredient = (name: string) => {
    setAnalysis((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: prev.ingredients.map((i) =>
          i.name === name ? { ...i, have: !i.have } : i,
        ),
      };
    });
  };

  const selectedLabels = (): string[] => {
    const fromFridge = (analysis?.ingredients ?? [])
      .filter((i) => i.have)
      .map((i) => ingredientLabel(i));
    const extra = [
      ...manual.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
      ...extraIngredient.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean),
    ];
    return [...fromFridge, ...extra];
  };

  const runCreateRecipes = async (opts?: { avoidTitles?: string[]; append?: boolean }) => {
    const ingredients = selectedLabels();
    if (!ingredients.length) {
      setError("Seleziona o aggiungi almeno un ingrediente.");
      return;
    }
    setPhase("thinking");
    setError(null);
    setPrefsDirty(false);
    try {
      const res = await createRecipes({
        data: {
          ingredients,
          prefs,
          avoidTitles: opts?.avoidTitles,
          count: 4,
        },
      });
      if (res.ok) {
        setAnalysis((prev) => ({
          ingredients: prev?.ingredients ?? ingredients.map((name) => ({ name, have: true })),
          notes: res.notes || prev?.notes || "",
          recipes: opts?.append
            ? [...(prev?.recipes ?? []), ...res.recipes].slice(0, 12)
            : res.recipes,
          source: "ai",
        }));
        setError(null);
      } else {
        setAnalysis((prev) => ({
          ingredients: prev?.ingredients ?? ingredients.map((name) => ({ name, have: true })),
          notes: prev?.notes || "",
          recipes: opts?.append
            ? [...(prev?.recipes ?? []), ...res.recipes].slice(0, 12)
            : res.recipes,
          source: "book",
        }));
        setError(res.message);
      }
      setPhase("ready");
      setTab("home");
    } catch (e) {
      console.error(e);
      setError("Connessione al servizio AI non riuscita. Puoi riprovare o usare il ricettario.");
      setPhase("ready");
    }
  };

  const runCookbookRecipes = () => {
    const ingredients = selectedLabels();
    if (!ingredients.length) {
      setError("Seleziona o aggiungi almeno un ingrediente.");
      return;
    }
    const names = ingredients.map((label) => label.replace(/\s*\([^)]*\)\s*$/, "").trim());
    const recipes = matchCookbook(names, {
      ...prefs,
      maxMinutes: prefs.diet === "fast" ? Math.min(15, prefs.maxMinutes) : prefs.maxMinutes,
    });
    setPrefsDirty(false);
    setAnalysis((prev) => ({
      ingredients: prev?.ingredients ?? names.map((name) => ({ name, have: true })),
      notes: prev?.notes || "",
      recipes,
      source: "book",
    }));
    setError(null);
    setPhase("ready");
    setTab("home");
  };

  const runOrganizeFridge = async () => {
    const items = (analysis?.ingredients ?? []).filter((i) => i.have);
    if (!items.length) {
      setError("Seleziona almeno un alimento da organizzare.");
      return;
    }
    setOrganizing(true);
    setError(null);
    try {
      const res = await organizeFridgePlan({
        data: {
          ingredients: items.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            confidence: i.confidence,
          })),
        },
      });
      if (res.ok) {
        setFridgePlan(res.plan);
      } else {
        setError(res.message);
      }
    } catch (e) {
      console.error(e);
      setError("Non riesco a organizzare il frigo in questo momento. Riprova.");
    } finally {
      setOrganizing(false);
    }
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setPhase("analyzing");
    setTab("home");
    setError(null);
    setSelected(null);
    setPrefsDirty(false);
    try {
      const dataUrl = await compressImage(file);
      setPhoto(dataUrl);
      const res = await readFridgePhoto({ data: { image: dataUrl } });
      if (!res.ok) {
        setError(res.message);
        setAnalysis({
          ingredients: [],
          notes: "",
          recipes: [],
          source: undefined,
        });
        setPhase("ready");
        return;
      }
      setAnalysis({
        ingredients: res.ingredients,
        notes: res.notes,
        recipes: [],
        source: undefined,
      });
      setError(null);
      setPhase("ready");
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
    setAnalysis({
      ingredients: extra.map((name) => ({ name, have: true })),
      notes: "",
      recipes: [],
      source: undefined,
    });
    setPhoto(null);
    setPrefsDirty(false);
    await runCreateRecipes();
  };

  const dismissOnboarding = () => {
    try {
      localStorage.setItem("frigochef_onboarding_v1", "1");
    } catch {
      /* ignore */
    }
    setShowOnboarding(false);
    setOnboardingStep(0);
  };

  const reset = () => {
    setPhase("idle");
    setAnalysis(null);
    setPhoto(null);
    setError(null);
    setSelected(null);
    setPrefsDirty(false);
    setExtraIngredient("");
    setFridgePlan(null);
    setTab("home");
  };

  const filteredPopular = popular.filter((r) => !query || r.title.toLowerCase().includes(query.toLowerCase()));
  const catalogSections = useMemo(
    () =>
      catalogBySection(
        { ...prefs, maxMinutes: prefs.diet === "fast" ? 15 : prefs.maxMinutes },
        query,
      ),
    [prefs, query],
  );
  const shownRecipes = (analysis?.recipes ?? filteredPopular).filter(
    (r) => !query || r.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-bg text-fg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,#1a2430,transparent_60%)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 pb-28 pt-6">
        <header className="relative z-10 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LeafMark className="size-11" />
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">Dal frigo al piatto</p>
              <h1 className="text-xl font-semibold tracking-tight">FrigoChef</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShoppingOpen(true)}
              className="glass relative grid size-11 place-items-center rounded-full"
              aria-label={toBuy ? `Lista della spesa, ${toBuy} da prendere` : "Lista della spesa"}
            >
              <ShoppingCart className="size-5" />
              {toBuy > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
                  {toBuy}
                </span>
              )}
            </button>
            <div className="glass flex items-center gap-2 rounded-full px-2 py-1">
              <button
                type="button"
                className="grid size-8 place-items-center rounded-full text-muted"
                onClick={() => updatePrefs({ servings: Math.max(1, prefs.servings - 1) })}
                aria-label="Meno porzioni"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="min-w-8 text-center text-sm font-semibold">{prefs.servings}</span>
              <button
                type="button"
                className="grid size-8 place-items-center rounded-full text-muted"
                onClick={() => updatePrefs({ servings: Math.min(8, prefs.servings + 1) })}
                aria-label="Più porzioni"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
        </header>

        <div className={cn("relative mb-6", tab !== "home" && tab !== "recipes" && "hidden")}>
          {/* Decorative floats: always behind interactive UI */}
          <div className="pointer-events-none absolute inset-0 -z-0 overflow-visible" aria-hidden>
            <img src={FOOD_ART.avocado} alt="" className="food-float float-a absolute -left-6 -top-7 w-24 opacity-50" />
            <img src={FOOD_ART.tomato} alt="" className="food-float float-b absolute -right-2 -top-8 w-20 opacity-50" />
            <img src={FOOD_ART.lettuce} alt="" className="food-float float-c absolute -right-7 top-9 w-28 opacity-40" />
            <img src={FOOD_ART.onion} alt="" className="food-float float-b absolute -left-7 top-20 w-20 opacity-45" />
          </div>

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
            "relative z-10 mb-5 flex gap-2 overflow-x-auto pb-1",
            tab !== "home" && tab !== "recipes" && "hidden",
          )}
        >
          {DIETS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => updatePrefs({ diet: d.id, maxMinutes: d.id === "fast" ? 15 : 40 })}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
                prefs.diet === d.id ? "bg-accent text-accent-fg" : "glass text-fg",
              )}
            >
              {d.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() =>
              updatePrefs({
                course: prefs.course === "dessert" ? "main" : "dessert",
              })
            }
            className={cn(
              "flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
              prefs.course === "dessert" ? "bg-accent text-accent-fg" : "glass text-fg",
            )}
          >
            <Cake className="size-4" />
            Dessert
          </button>
        </div>

        {tab === "home" && phase === "idle" && (
          <section className="relative z-10 space-y-5">
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
          </section>
        )}

        {tab === "home" && phase === "analyzing" && (
          <section className="relative z-10 glass flex flex-col items-center gap-4 rounded-[32px] px-6 py-16 text-center">
            <img src={FOOD_ART.hero} alt="" className="h-28 w-40 object-contain" />
            <p className="text-lg font-semibold">Sto guardando nel frigo</p>
            <p className="text-sm text-muted">Riconosco gli alimenti nella foto.</p>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-fg/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
            </div>
          </section>
        )}

        {tab === "home" && phase === "thinking" && (
          <section className="relative z-10 glass flex flex-col items-center gap-4 rounded-[32px] px-6 py-16 text-center">
            <img src={FOOD_ART.hero} alt="" className="h-28 w-40 object-contain" />
            <p className="text-lg font-semibold">Sto pensando alle ricette</p>
            <p className="text-sm text-muted">Scelgo piatti adatti a quello che hai.</p>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-fg/10">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-accent" />
            </div>
          </section>
        )}

        {tab === "home" && phase === "ready" && analysis && (
          <section className="relative z-10 space-y-5">
            {photo && (
              <div className="overflow-hidden rounded-[28px]">
                <img src={photo} alt="Il tuo frigo" className="h-40 w-full object-cover" />
              </div>
            )}
            {error && (
              <p className="glass rounded-2xl px-4 py-3 text-sm text-muted" role="status">
                {error}
              </p>
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
                  <button
                    key={ing.name}
                    type="button"
                    onClick={() => toggleIngredient(ing.name)}
                    aria-pressed={ing.have}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm transition-colors",
                      ing.have ? "bg-accent text-accent-fg" : "glass text-muted line-through",
                    )}
                  >
                    {ing.name}
                    {ing.quantity ? ` (${ing.quantity})` : ""}
                    {ing.confidence === "bassa" ? " ?" : ""}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={extraIngredient}
                  onChange={(e) => setExtraIngredient(e.target.value)}
                  placeholder="Aggiungi altri ingredienti"
                  className="h-11 flex-1 rounded-full bg-fg/8 px-4 text-sm outline-none placeholder:text-muted"
                />
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="lime"
                    size="sm"
                    onClick={() => void runCreateRecipes()}
                  >
                    <Sparkles className="size-4" />
                    Crea ricette
                  </Button>
                  <Button
                    variant="yellow"
                    size="sm"
                    onClick={() => runCookbookRecipes()}
                  >
                    Ricettario Classico
                  </Button>
                  <Button
                    variant="sky"
                    size="sm"
                    disabled={organizing}
                    onClick={() => void runOrganizeFridge()}
                  >
                    {organizing ? "Organizzo…" : "Organizza frigo"}
                  </Button>
                  {prefsDirty && analysis.recipes.length > 0 && (
                    <Button size="sm" onClick={() => void runCreateRecipes()}>
                      Aggiorna ricette con i nuovi filtri
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {fridgePlan && (
              <FridgePlanPanel plan={fridgePlan} onClose={() => setFridgePlan(null)} />
            )}

            {analysis.recipes.length > 0 && (
              <>
                {analysis.notes ? (
                  <p className="text-sm text-muted">{analysis.notes}</p>
                ) : null}
                <RecipeGrid
                  title={analysis.source === "book" ? "Dal ricettario di riserva" : "Cosa cucini ora"}
                  recipes={shownRecipes}
                  source={analysis.source}
                  onOpen={setSelected}
                />
                {analysis.recipes.length < 12 && (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      void runCreateRecipes({
                        avoidTitles: analysis.recipes.map((r) => r.title),
                        append: true,
                      })
                    }
                  >
                    Altre idee
                  </Button>
                )}
              </>
            )}
          </section>
        )}

        {tab === "recipes" && (
          <section className="relative z-10 space-y-5">
            {analysis && analysis.recipes.length > 0 && (
              <RecipeGrid
                title={analysis.source === "book" ? "Dal ricettario (frigo)" : "Dal tuo frigo"}
                recipes={analysis.recipes}
                source={analysis.source}
                onOpen={setSelected}
              />
            )}
            <div>
              <h2 className="mb-1 text-lg font-semibold">Ricettario classico</h2>
              <p className="mb-3 text-sm text-muted">
                Tocca una categoria per vedere i piatti. Filtra con dieta, tempo e ricerca.
              </p>
            </div>
            <div className="space-y-2">
              {catalogSections.map((section) => {
                const open = openCatalogId === section.id;
                return (
                  <div key={section.id} className="glass overflow-hidden rounded-[24px]">
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenCatalogId(open ? null : section.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{section.title}</span>
                        <span className="text-xs text-muted">
                          {section.recipes.length}{" "}
                          {section.recipes.length === 1 ? "ricetta" : "ricette"}
                        </span>
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-5 shrink-0 text-muted transition-transform",
                          open && "rotate-180",
                        )}
                      />
                    </button>
                    {open && (
                      <div className="border-t border-fg/10 px-3 pb-3 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                          {section.recipes.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setSelected(r)}
                              className="overflow-hidden rounded-[20px] bg-fg/5 text-left"
                            >
                              <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                  src={artForRecipe(r.title, r.art)}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                                <span className="absolute left-2 top-2 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-semibold text-stone-900">
                                  Classico
                                </span>
                              </div>
                              <div className="space-y-1 p-2.5">
                                <p className="line-clamp-2 text-sm font-semibold leading-snug">
                                  {r.title}
                                </p>
                                <p className="text-[11px] text-muted">{r.minutes} min</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {catalogSections.length === 0 && (
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
                    onClick={() => updatePrefs({ diet: d.id, maxMinutes: d.id === "fast" ? 15 : 40 })}
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
                <p className="text-sm font-semibold">Solo dessert</p>
                <p className="text-xs text-muted">Mostra solo dolci e dessert</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  updatePrefs({
                    course: prefs.course === "dessert" ? "main" : "dessert",
                  })
                }
                className={cn(
                  "flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
                  prefs.course === "dessert" ? "bg-accent text-accent-fg" : "bg-fg/8 text-fg",
                )}
              >
                <Cake className="size-4" />
                {prefs.course === "dessert" ? "Attivo" : "Off"}
              </button>
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
                  onClick={() => updatePrefs({ servings: Math.max(1, prefs.servings - 1) })}
                  aria-label="Meno porzioni"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">{prefs.servings}</span>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full bg-fg/8"
                  onClick={() => updatePrefs({ servings: Math.min(8, prefs.servings + 1) })}
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
                  onClick={() => updatePrefs({ maxMinutes: Math.max(10, prefs.maxMinutes - 5) })}
                  aria-label="Meno minuti"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-12 text-center text-sm font-semibold">{prefs.maxMinutes} min</span>
                <button
                  type="button"
                  className="grid size-9 place-items-center rounded-full bg-fg/8"
                  onClick={() => updatePrefs({ maxMinutes: Math.min(90, prefs.maxMinutes + 5) })}
                  aria-label="Più minuti"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {showOnboarding && (
        <OnboardingOverlay
          step={onboardingStep}
          onNext={() => {
            if (onboardingStep >= 2) dismissOnboarding();
            else setOnboardingStep((s) => s + 1);
          }}
          onSkip={dismissOnboarding}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-fg/10 bg-bg/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[430px] items-center justify-around px-2 py-2">
          <NavBtn active={tab === "home"} onClick={() => { setTab("home"); if (phase !== "ready") setPhase("idle"); }} icon={Home} label="Home" />
          <NavBtn active={tab === "recipes"} onClick={() => setTab("recipes")} icon={ChefHat} label="Ricette" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="grid size-14 -translate-y-3 place-items-center rounded-full bg-accent text-accent-fg shadow-lg shadow-accent/30"
            aria-label="Scatta foto"
          >
            <Camera className="size-6" />
          </button>
          <NavBtn active={tab === "history"} onClick={() => setTab("history")} icon={Clock3} label="Storia" />
          <NavBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={UserRound} label="Profilo" />
        </div>
      </nav>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg shadow-lg">
          {toast}
        </div>
      )}

      {selected && (
        <RecipeSheet
          recipe={selected}
          servings={prefs.servings}
          onClose={() => setSelected(null)}
          onCook={cookRecipe}
          onAddMissing={addMissing}
        />
      )}

      {shoppingOpen && (
        <ShoppingSheet
          items={shopping}
          onClose={() => setShoppingOpen(false)}
          onToggle={(id) => setShopping(toggleShopping(id))}
          onRemove={(id) => setShopping(removeShopping(id))}
          onClearDone={() => setShopping(clearDoneShopping())}
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
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]", active ? "text-accent" : "text-muted")}
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
  source,
}: {
  title: string;
  recipes: Recipe[];
  onOpen: (r: Recipe) => void;
  source?: "ai" | "book";
}) {
  if (!recipes.length) return null;
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {recipes.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onOpen(r)}
            className="glass overflow-hidden rounded-[24px] text-left"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={artForRecipe(r.title, r.art)}
                alt=""
                className="h-full w-full object-cover"
              />
              {source === "ai" && (
                <span className="absolute left-2 top-2 rounded-full bg-accent/95 px-2 py-0.5 text-[10px] font-semibold text-accent-fg">
                  Chef AI
                </span>
              )}
              {source === "book" && (
                <span className="absolute left-2 top-2 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-semibold text-stone-900">
                  Classico
                </span>
              )}
            </div>
            <div className="space-y-1 p-3">
              <p className="line-clamp-2 text-sm font-semibold leading-snug">{r.title}</p>
              {r.description ? (
                <p className="line-clamp-2 text-xs leading-relaxed text-muted">{r.description}</p>
              ) : null}
              <p className="text-[11px] text-muted">{r.minutes} min</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RecipeSheet({
  recipe,
  servings,
  onClose,
  onCook,
  onAddMissing,
}: {
  recipe: Recipe;
  servings: number;
  onClose: () => void;
  onCook: (r: Recipe) => void;
  onAddMissing: (r: Recipe) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4">
      <div className="relative flex max-h-[92dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[32px] bg-bg sm:rounded-[32px]">
        <div className="relative h-48 shrink-0">
          <img src={artForRecipe(recipe.title, recipe.art)} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur"
            aria-label="Chiudi"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <h2 className="text-xl font-semibold">{recipe.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {recipe.minutes} min · {servings} porzioni ·{" "}
            {recipe.diet === "vegan" ? "vegano" : recipe.diet === "vegetarian" ? "vegetariano" : "classico"}
          </p>
          {recipe.description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">{recipe.description}</p>
          ) : null}

          {recipe.missing.length > 0 && (
            <div className="mt-4 rounded-2xl bg-fg/8 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Ti manca</p>
              <p className="mt-1 text-sm">{recipe.missing.join(", ")}</p>
              <Button size="sm" className="mt-2" onClick={() => onAddMissing(recipe)}>
                Aggiungi alla spesa
              </Button>
            </div>
          )}

          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold">Ingredienti</h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing) => (
                <li key={ing} className="text-sm text-muted">
                  · {ing}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold">Preparazione</h3>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-accent-fg">
                    {i + 1}
                  </span>
                  <span className="text-muted">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.tip ? (
            <div className="mt-5 rounded-2xl bg-accent/15 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-accent">Consiglio</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{recipe.tip}</p>
            </div>
          ) : null}
        </div>
        <div className="shrink-0 border-t border-fg/10 p-4">
          <Button
            variant="lime"
            size="lg"
            className="w-full"
            onClick={() => {
              onCook(recipe);
              onClose();
            }}
          >
            <Check className="size-5" />
            Ho cucinato questo
          </Button>
        </div>
      </div>
    </div>
  );
}

function ShoppingSheet({
  items,
  onClose,
  onToggle,
  onRemove,
  onClearDone,
}: {
  items: ShoppingItem[];
  onClose: () => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onClearDone: () => void;
}) {
  const toBuy = items.filter((i) => !i.done);
  const done = items.filter((i) => i.done);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <div className="relative flex max-h-[85dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[32px] bg-bg sm:rounded-[32px]">
        <div className="flex items-center justify-between border-b border-fg/10 px-5 py-4">
          <h2 className="text-lg font-semibold">Lista della spesa</h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full bg-fg/8" aria-label="Chiudi">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">La lista è vuota. Aggiungi ingredienti dalle ricette.</p>
          ) : (
            <div className="space-y-5">
              {toBuy.length > 0 && (
                <ul className="space-y-2">
                  {toBuy.map((item) => (
                    <ShoppingRow key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
                  ))}
                </ul>
              )}
              {done.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">Presi</p>
                    <button type="button" className="text-xs text-muted" onClick={onClearDone}>
                      Rimuovi presi
                    </button>
                  </div>
                  <ul className="space-y-2 opacity-60">
                    {done.map((item) => (
                      <ShoppingRow key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShoppingRow({
  item,
  onToggle,
  onRemove,
}: {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <li className="glass flex items-center gap-3 rounded-2xl px-3 py-2.5">
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className={cn(
          "grid size-6 shrink-0 place-items-center rounded-full border",
          item.done ? "border-accent bg-accent text-accent-fg" : "border-fg/20",
        )}
        aria-label={item.done ? `Segna ${item.name} da prendere` : `Segna ${item.name} preso`}
      >
        {item.done && <Check className="size-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium", item.done && "line-through")}>{item.name}</p>
        {item.from ? <p className="text-[11px] text-muted">da {item.from}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="grid size-8 place-items-center rounded-full text-muted"
        aria-label={`Rimuovi ${item.name}`}
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}


const FRIDGE_ZONE_ORDER = [
  { key: "porta", label: "Porta", match: /porta/i },
  { key: "superiore", label: "Ripiano superiore", match: /superior/i },
  { key: "centrali", label: "Ripiani centrali", match: /central/i },
  { key: "inferiore", label: "Ripiano inferiore", match: /inferior/i },
  { key: "cassetti", label: "Cassetti", match: /casset/i },
] as const;

function FridgePlanPanel({
  plan,
  onClose,
}: {
  plan: FridgeOrganization;
  onClose: () => void;
}) {
  const [active, setActive] = useState(0);

  const ordered = (() => {
    const used = new Set<number>();
    const result: { label: string; items: { food: string; reason: string }[] }[] = [];
    for (const slot of FRIDGE_ZONE_ORDER) {
      const idx = plan.fridge_organization.findIndex(
        (z, i) => !used.has(i) && slot.match.test(z.zone),
      );
      if (idx >= 0) {
        used.add(idx);
        result.push({
          label: plan.fridge_organization[idx].zone || slot.label,
          items: plan.fridge_organization[idx].items,
        });
      } else {
        result.push({ label: slot.label, items: [] });
      }
    }
    plan.fridge_organization.forEach((z, i) => {
      if (!used.has(i)) result.push({ label: z.zone, items: z.items });
    });
    return result.filter((z) => z.items.length > 0 || FRIDGE_ZONE_ORDER.some((s) => s.label === z.label));
  })();

  const safeActive = Math.min(active, Math.max(0, ordered.length - 1));
  const current = ordered[safeActive];

  return (
    <div className="glass space-y-3 rounded-[24px] p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Come organizzare il frigo</h2>
        <button type="button" className="text-sm text-muted" onClick={onClose}>
          Chiudi
        </button>
      </div>
      {plan.general_tip ? <p className="text-sm text-muted">{plan.general_tip}</p> : null}
      {plan.priority_actions?.length > 0 && (
        <ul className="space-y-1.5">
          {plan.priority_actions.map((a, i) => (
            <li key={i} className="rounded-2xl bg-sky-400/15 px-3 py-2 text-sm">
              {a}
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-3">
        {/* Mini schema verticale del frigo */}
        <div className="flex w-16 shrink-0 flex-col gap-1 rounded-2xl border border-fg/15 bg-fg/5 p-1.5">
          {ordered.map((z, i) => {
            const count = z.items.length;
            const selected = i === safeActive;
            return (
              <button
                key={z.label + i}
                type="button"
                onClick={() => setActive(i)}
                className={cn(
                  "flex min-h-10 flex-1 flex-col items-center justify-center rounded-xl px-1 py-1.5 text-center transition",
                  selected ? "bg-sky-400 text-sky-950" : "bg-fg/5 text-muted hover:bg-fg/10",
                  count === 0 && !selected && "opacity-40",
                )}
                aria-label={z.label}
              >
                <span className="text-[9px] font-semibold leading-tight">{z.label.replace(/^Ripiano /i, "")}</span>
                {count > 0 && (
                  <span className={cn("text-[10px] font-bold", selected ? "text-sky-950" : "text-fg")}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="min-w-0 flex-1 rounded-[20px] bg-fg/5 p-3">
          {current ? (
            <>
              <p className="mb-2 text-sm font-semibold">{current.label}</p>
              {current.items.length === 0 ? (
                <p className="text-sm text-muted">Niente in questa zona.</p>
              ) : (
                <ul className="space-y-2">
                  {current.items.map((it, idx) => (
                    <li key={it.food + idx} className="text-sm">
                      <span className="font-medium">{it.food}</span>
                      <span className="text-muted"> — {it.reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const ONBOARDING_STEPS = [
  {
    title: "Scatta il frigo",
    body: "Fotografa il contenuto del frigorifero: FrigoChef riconosce gli alimenti e te li mostra come chip da confermare.",
  },
  {
    title: "Scegli il percorso",
    body: "Crea ricette (AI), Ricettario Classico (ricette collaudate) oppure Organizza frigo (dove mettere ogni alimento).",
  },
  {
    title: "Filtra e cucina",
    body: "Usa dieta, tempo e porzioni prima di generare. Apri una ricetta, cuocila o aggiungi i mancanti alla lista della spesa.",
  },
] as const;

function OnboardingOverlay({
  step,
  onNext,
  onSkip,
}: {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const s = ONBOARDING_STEPS[Math.min(step, ONBOARDING_STEPS.length - 1)];
  const last = step >= ONBOARDING_STEPS.length - 1;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-[400px] rounded-[28px] bg-bg p-5 shadow-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          Benvenuto · {step + 1}/{ONBOARDING_STEPS.length}
        </p>
        <h2 className="mt-2 text-xl font-semibold">{s.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
        <div className="mt-5 flex items-center gap-2">
          <Button variant="lime" className="flex-1" onClick={onNext}>
            {last ? "Inizia" : "Avanti"}
          </Button>
          {!last && (
            <button type="button" className="px-3 text-sm text-muted" onClick={onSkip}>
              Salta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
