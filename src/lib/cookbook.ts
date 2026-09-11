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
  "parmigiano", "insalata", "yogurt", "carote", "zucchine", "pasta", "cipolla", "olio extravergine",
].map((name) => ({ name, have: true }));

type BookRecipe = Omit<Recipe, "missing" | "servings"> & { tags: string[]; baseServings: number };

const BOOK: BookRecipe[] = [
  {
    id: "pesto",
    title: "Pasta al pesto cremosa",
    description: "Un classico ligure reso setoso con acqua di cottura e un filo d'olio a crudo: profumo di basilico, morso al dente, formaggio appena fuso.",
    minutes: 20,
    diet: "vegetarian",
    tags: ["pasta", "pesto", "parmigiano", "basilico"],
    ingredients: ["320 g di pasta corta (trofie, penne o fusilli)", "3–4 cucchiai di pesto genovese", "40 g di parmigiano grattugiato", "1 cucchiaio di olio extravergine", "sale grosso per l'acqua"],
    steps: [
      "Porta a bollore una pentola abbondante d'acqua, sala e tuffa la pasta. Cuoci 1 minuto in meno rispetto al tempo indicato sulla confezione.",
      "In una ciotola larga stempera il pesto con l'olio e 2–3 cucchiai di acqua di cottura calda, fino a una salsa fluida e brillante.",
      "Scola la pasta tenendo da parte un mestolo d'acqua. Trasferiscila nella ciotola e manteca energicamente.",
      "Aggiungi il parmigiano e, se serve, ancora un filo d'acqua per legare. Non far bollire il pesto: deve restare tiepido.",
      "Assaggia, regola di sale e servi subito con una grattugiata di formaggio a piacere.",
    ],
    tip: "Se il pesto è molto denso, allungalo solo con acqua di cottura: l'amido lega meglio dell'olio da solo.",
    art: FOOD_ART.avocado,
    baseServings: 2,
  },
  {
    id: "caprese",
    title: "Caprese al pomodoro maturo",
    description: "Pochi ingredienti, massima qualità: mozzarella fredda, pomodori sodi e un filo d'olio intenso. Ideale come antipasto o pranzo leggero.",
    minutes: 10,
    diet: "vegetarian",
    tags: ["mozzarella", "pomodori", "basilico", "olio"],
    ingredients: ["250 g di mozzarella (o fior di latte)", "2–3 pomodori maturi ma sodi", "2 cucchiai di olio extravergine", "sale fino e pepe nero", "qualche foglia di basilico (se ce l'hai)"],
    steps: [
      "Scola bene la mozzarella e lasciala 5 minuti su carta assorbente: così non allaga il piatto.",
      "Affetta mozzarella e pomodori a dischi spessi circa 1 cm, scartando i pezzi troppo acquosi.",
      "Alterna i dischi sul piatto, leggermente sovrapposti. Sali e pepa con mano leggera.",
      "Condisci con l'olio a filo e, se presente, il basilico spezzettato a mano.",
      "Lascia riposare 2–3 minuti a temperatura ambiente e servi fresco, non di frigo.",
    ],
    tip: "Sala i pomodori un attimo prima di servire: se li sali troppo presto rilasciano acqua.",
    art: FOOD_ART.tomato,
    baseServings: 2,
  },
  {
    id: "frittata",
    title: "Frittata alta di zucchine",
    description: "Frittata dorata e soffice, con zucchine rosate e parmigiano. Perfetta tiepida o fredda, anche da asporto.",
    minutes: 25,
    diet: "vegetarian",
    tags: ["uova", "zucchine", "parmigiano", "cipolla"],
    ingredients: ["4 uova medie", "2 zucchine medie", "1/2 cipolla", "40 g di parmigiano grattugiato", "2 cucchiai di olio extravergine", "sale e pepe"],
    steps: [
      "Taglia la cipolla a fettine sottili e le zucchine a rondelle. Scalda l'olio in una padella antiaderente da 22–24 cm.",
      "Rosola la cipolla 2 minuti, poi aggiungi le zucchine. Cuoci 8–10 minuti a fuoco medio fino a tenere e leggermente dorate. Sali a metà cottura.",
      "In una ciotola sbatti le uova con parmigiano, un pizzico di sale e pepe abbondante.",
      "Distribuisci le verdure, versa le uova e livella. Cuoci coperto a fuoco basso 6–7 minuti, finché i bordi sono presi.",
      "Con un piatto gira la frittata e cuoci altri 3–4 minuti, oppure finisci 2 minuti sotto il grill.",
      "Lascia intiepidire 5 minuti prima di tagliare: si assesta e resta più umida al centro.",
    ],
    tip: "Fuoco basso e padella antiaderente evitano il fondo bruciato e un cuore ancora liquido.",
    art: FOOD_ART.onion,
    baseServings: 2,
  },
  {
    id: "insalata",
    title: "Insalata croccante al limone",
    description: "Insalata fresca e acidula, con carote croccanti e un condimento al limone che sveglia il palato in pochi minuti.",
    minutes: 8,
    diet: "vegan",
    tags: ["insalata", "limone", "olio", "carote"],
    ingredients: ["1 cespo di insalata (lattuga, iceberg o misticanza)", "1 carota media", "succo di 1/2 limone", "2 cucchiai di olio extravergine", "sale fino"],
    steps: [
      "Lava l'insalata in acqua fredda e asciugala bene: l'acqua residua diluisce il condimento.",
      "Sbuccia la carota e tagliala a julienne fine o grattugiala a fori larghi.",
      "In una ciotola emulsiona limone, olio e un pizzico di sale con una forchetta.",
      "Unisci insalata e carote, condisci e mescola delicatamente.",
      "Assaggia e servi subito per mantenere il croccante.",
    ],
    tip: "Condici solo al momento di portare in tavola, altrimenti l'insalata si affloscia.",
    art: FOOD_ART.lettuce,
    baseServings: 2,
  },
  {
    id: "pomodoro",
    title: "Pasta al pomodoro semplice",
    description: "Sugo corto, dolce e lucido: cipolla soffritta, pomodori e pasta mantecata in padella. Comfort food italiano.",
    minutes: 25,
    diet: "vegan",
    tags: ["pasta", "pomodori", "cipolla", "olio"],
    ingredients: ["320 g di pasta", "400 g di pomodori maturi (o pelati)", "1 cipolla piccola", "2 cucchiai di olio extravergine", "sale e pepe", "basilico fresco (opzionale)"],
    steps: [
      "Trita la cipolla e soffriggila nell'olio a fuoco medio-basso 4–5 minuti, senza bruciarla.",
      "Aggiungi i pomodori spezzettati, sala e lascia sobbollire 12–15 minuti finché il sugo si restringe e diventa lucido.",
      "Cuoci la pasta in acqua salata e scolala molto al dente (1–2 minuti prima).",
      "Trasferisci la pasta nel sugo con un mestolo d'acqua di cottura e manteca 1–2 minuti a fuoco vivo.",
      "Spegni, aggiungi pepe e basilico se ce l'hai. Servi subito.",
    ],
    tip: "Un pizzico di zucchero serve solo se i pomodori sono acidi: assaggia prima.",
    art: FOOD_ART.tomato,
    baseServings: 2,
  },
  {
    id: "funghi",
    title: "Funghi saltati all'aglio",
    description: "Funghi rosati a fiamma viva, aglio e prezzemolo: contorno saporito o base per crostini e pasta.",
    minutes: 15,
    diet: "vegan",
    tags: ["funghi", "aglio", "prezzemolo", "olio"],
    ingredients: ["400 g di funghi champignon (o misti)", "1 spicchio d'aglio", "2 cucchiai di olio extravergine", "prezzemolo tritato", "sale e pepe"],
    steps: [
      "Pulisci i funghi con un panno umido, senza immergerli. Tagliali a fette regolari.",
      "Scalda bene la padella con l'olio. Aggiungi l'aglio schiacciato 30 secondi senza bruciarlo.",
      "Tuffa i funghi e non mescolare per 1–2 minuti: devono rosolare e perdere l'acqua.",
      "Quando l'acqua è evaporata, mescola e cuoci ancora 4–5 minuti a fuoco medio-alto.",
      "Sali, pepa, togli l'aglio se preferisci e completa con prezzemolo. Servi caldi.",
    ],
    tip: "Padella spaziosa e fuoco alto: se li sovrapponi, i funghi lessano invece di saltare.",
    art: FOOD_ART.mushrooms,
    baseServings: 2,
  },
  {
    id: "peperoni",
    title: "Peperoni stufati in padella",
    description: "Peperoni dolci e cipolla cotti lentamente fino a diventare morbidi e caramellati. Ottimi anche il giorno dopo.",
    minutes: 25,
    diet: "vegan",
    tags: ["peperoni", "cipolla", "olio"],
    ingredients: ["3 peperoni (rossi o misti)", "1 cipolla", "2 cucchiai di olio extravergine", "sale", "origano o pepe (opzionale)"],
    steps: [
      "Mondate i peperoni: togli picciolo, semi e filamenti. Tagliali a strisce non troppo sottili.",
      "Affetta la cipolla e mettila in padella con l'olio. Quando traspare, unisci i peperoni.",
      "Sala, copri e cuoci 15 minuti mescolando ogni tanto.",
      "Scopri e alza il fuoco 5 minuti per far restringere i succhi.",
      "Regola di sale e servi caldi, tiepidi o freddi.",
    ],
    tip: "Un cucchiaio d'aceto o un goccio di limone a fine cottura bilancia la dolcezza.",
    art: FOOD_ART.pepper,
    baseServings: 2,
  },
  {
    id: "uova-strapazzate",
    title: "Uova cremose al parmigiano",
    description: "Uova strapazzate lente e cremose, arricchite di parmigiano e un filo di latte. Colazione o cena lampo.",
    minutes: 8,
    diet: "vegetarian",
    tags: ["uova", "parmigiano", "latte"],
    ingredients: ["3 uova", "2 cucchiai di latte", "30 g di parmigiano grattugiato", "un noce di burro (o 1 cucchiaio d'olio)", "sale e pepe"],
    steps: [
      "Sbatti uova, latte, parmigiano, sale e pepe fino a un composto omogeneo.",
      "Scalda una padella antiaderente a fuoco basso con il burro: deve fondere senza sfrigolare forte.",
      "Versa le uova e mescola in continuazione con una spatola, dal bordo verso il centro.",
      "Quando sono ancora lucide e cremose, spegni: finiscono di cuocere col calore residuo.",
      "Servi subito su pane tostato o da sole.",
    ],
    tip: "Il segreto è il fuoco bassissimo: a fiamma alta diventano secche in pochi secondi.",
    art: FOOD_ART.lemon,
    baseServings: 1,
  },
  {
    id: "pasta-limone",
    title: "Pasta al limone e parmigiano",
    description: "Salsa al limone setosa, burro e parmigiano: piatto luminoso e veloce quando in frigo c'è solo un agrume.",
    minutes: 18,
    diet: "vegetarian",
    tags: ["pasta", "limone", "parmigiano", "burro"],
    ingredients: ["320 g di pasta lunga o corta", "1 limone non trattato (scorza e succo)", "40 g di burro", "50 g di parmigiano grattugiato", "sale e pepe nero"],
    steps: [
      "Metti a bollire l'acqua. Grattugia la scorza del limone e spremine metà, filtrando i semi.",
      "In una padella sciogli il burro a fuoco basso con la scorza, senza far colorire.",
      "Cuoci la pasta e scolala al dente, tenendo da parte un mestolo d'acqua di cottura.",
      "Trasferisci la pasta in padella con succo di limone, un po' d'acqua e il parmigiano. Manteca energicamente.",
      "Regola la densità con altra acqua: la salsa deve avvolgere la pasta. Pepa e servi subito.",
    ],
    tip: "Se la salsa si spezza, togli dal fuoco e manteca con un cucchiaio d'acqua fredda.",
    art: FOOD_ART.lemon,
    baseServings: 2,
  },
  {
    id: "carote-yogurt",
    title: "Insalata di carote allo yogurt",
    description: "Carote grattugiate in una salsa allo yogurt e limone: contorno fresco, leggero e pronto in pochi minuti.",
    minutes: 12,
    diet: "vegetarian",
    tags: ["carote", "yogurt", "limone"],
    ingredients: ["3 carote medie", "150 g di yogurt bianco", "succo di 1/2 limone", "1 cucchiaio di olio extravergine", "sale e pepe"],
    steps: [
      "Sbuccia le carote e grattugiale a fori medi.",
      "Mescola yogurt, limone, olio, sale e pepe fino a una salsa cremosa ma fluida.",
      "Unisci le carote e amalgama bene.",
      "Lascia riposare 5 minuti in frigo: i sapori si bilanciano.",
      "Assaggia, regola di limone o sale e servi fresco.",
    ],
    tip: "Con yogurt greco denso, allunga con un cucchiaio d'acqua per non avere un composto pastoso.",
    art: FOOD_ART.lettuce,
    baseServings: 2,
  },
  {
    id: "zucchine",
    title: "Zucchine trifolate in padella",
    description: "Zucchine saltate con aglio e olio, tenere fuori e ancora con morso. Contorno veloce o condimento per pasta.",
    minutes: 15,
    diet: "vegan",
    tags: ["zucchine", "aglio", "olio"],
    ingredients: ["3 zucchine medie", "1 spicchio d'aglio", "2 cucchiai di olio extravergine", "sale e pepe", "prezzemolo (opzionale)"],
    steps: [
      "Taglia le zucchine a rondelle di 4–5 mm o a bastoncini.",
      "Scalda l'olio con l'aglio schiacciato. Quando profuma, togli l'aglio se preferisci un gusto delicato.",
      "Aggiungi le zucchine e fallole saltare 8–10 minuti a fuoco medio-alto.",
      "Sala a metà cottura: così non rilasciano troppa acqua subito.",
      "Pepa, completa con prezzemolo se ce l'hai e servi.",
    ],
    tip: "Non coprire la padella: il vapore le rende mollicce invece che rosate.",
    art: FOOD_ART.onion,
    baseServings: 2,
  },
  {
    id: "mozza-pesto",
    title: "Mozzarella tiepida al pesto",
    description: "Antipasto lampo: mozzarella scolata, un velo di pesto e olio a crudo. Ideale con pane croccante.",
    minutes: 6,
    diet: "vegetarian",
    tags: ["mozzarella", "pesto", "olio"],
    ingredients: ["200 g di mozzarella", "2 cucchiai di pesto", "1 cucchiaio di olio extravergine", "pepe nero", "pane tostato per servire"],
    steps: [
      "Scola e asciuga la mozzarella. Tagliala a fette spesse o a cubetti grossi.",
      "Disponila sul piatto e spalma un velo sottile di pesto su ogni pezzo.",
      "Completa con un filo d'olio e una macinata di pepe.",
      "Servi subito con pane tostato o crostini caldi.",
    ],
    tip: "Se la mozzarella è di frigo, lasciala 10 minuti a temperatura ambiente: il sapore si apre.",
    art: FOOD_ART.avocado,
    baseServings: 1,
  },
];

const ALIASES: Record<string, string[]> = {
  pasta: ["spaghetti", "penne", "fusilli", "trofie", "pasta avanzata"],
  pomodori: ["pomodoro", "pomodorini", "pelati"],
  uova: ["uovo", "eggs"],
  mozzarella: ["fior di latte"],
  parmigiano: ["parmigiano reggiano", "grana"],
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
    id: r.id,
    title: r.title,
    description: r.description,
    minutes: r.minutes,
    diet: r.diet,
    servings,
    missing,
    ingredients: r.ingredients,
    steps: r.steps,
    tip: r.tip,
    art: r.art,
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
    notes: "Demo del frigo italiano: latticini, verdure e basilico.",
    recipes: matchCookbook(SAMPLE_INGREDIENTS.map((i) => i.name), prefs),
  };
}

export function artForRecipe(title: string, fallback?: string) {
  const t = norm(title);
  if (t.includes("pesto") || t.includes("avocado")) return FOOD_ART.avocado;
  if (t.includes("pomodor") || t.includes("caprese")) return FOOD_ART.tomato;
  if (t.includes("insalat") || t.includes("lattuga") || t.includes("carot")) return FOOD_ART.lettuce;
  if (t.includes("cipoll") || t.includes("zucchini") || t.includes("frittata") || t.includes("zucchin")) return FOOD_ART.onion;
  if (t.includes("limon")) return FOOD_ART.lemon;
  if (t.includes("peperon")) return FOOD_ART.pepper;
  if (t.includes("fungh")) return FOOD_ART.mushrooms;
  return fallback || FOOD_ART.hero;
}
