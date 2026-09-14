export type Locale = "it" | "en" | "pl";

export const LOCALES: { id: Locale; label: string; short: string }[] = [
  { id: "it", label: "Italiano", short: "IT" },
  { id: "en", label: "English", short: "EN" },
  { id: "pl", label: "Polski", short: "PL" },
];

const STORAGE_KEY = "frigochef_locale";

export function loadLocale(): Locale {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "en" || v === "it" || v === "pl") return v;
  } catch {
    /* ignore */
  }
  return "it";
}

export function saveLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

type Dict = Record<string, string>;

const it: Dict = {
  tagline: "Dal frigo al piatto",
  searchPlaceholder: "Cerca una ricetta",
  dietAny: "Qualsiasi",
  dietVegetarian: "Vegetariano",
  dietVegan: "Vegano",
  dietFast: "Veloce",
  dessert: "Dessert",
  shootPhoto: "Scatta una foto",
  shootPhotoAria: "Scatta foto",
  orType: "Oppure scrivi cosa hai",
  manualPlaceholder: "uova, pomodori, pasta",
  go: "Vai",
  analyzing: "Sto guardando il frigo…",
  thinking: "Sto pensando alle ricette…",
  inFridge: "Nel frigo",
  extraPlaceholder: "Aggiungi altri ingredienti",
  createRecipes: "Crea ricette",
  classicCookbook: "Ricettario Classico",
  organizeFridge: "Organizza frigo",
  organizing: "Organizzo…",
  updateWithFilters: "Aggiorna ricette con i nuovi filtri",
  moreIdeas: "Altre idee",
  cookingNow: "Cosa cucini ora",
  fromReserve: "Dal ricettario di riserva",
  fromFridge: "Dal tuo frigo",
  fromBookFridge: "Dal ricettario (frigo)",
  classicTitle: "Ricettario classico",
  classicHint: "Tocca una categoria per vedere i piatti. Filtra con dieta, tempo e ricerca.",
  recipesCount1: "ricetta",
  recipesCountN: "ricette",
  noRecipesSearch: "Nessun piatto per questa ricerca. Prova a cambiare filtro o parola.",
  historyTitle: "Piatti cucinati",
  clearAll: "Svuota",
  historyEmpty: "Ancora nessun piatto. Apri una ricetta e tocca “Ho cucinato questo” per ritrovarla qui.",
  profileTitle: "Preferenze",
  portions: "Porzioni",
  maxTime: "Tempo massimo",
  minutes: "min",
  onlyDessert: "Solo dessert",
  onlyDessertHint: "Mostra solo dolci e dessert",
  on: "Attivo",
  off: "Off",
  lessPortions: "Meno porzioni",
  morePortions: "Più porzioni",
  shoppingAria: "Lista della spesa",
  shoppingAriaN: "Lista della spesa, {n} da prendere",
  shoppingTitle: "Lista della spesa",
  shoppingEmpty: "La lista è vuota. Aggiungi ingredienti dalle ricette.",
  clearDone: "Rimuovi fatti",
  missingLabel: "Ti manca",
  addToShopping: "Aggiungi a lista spesa",
  cookedThis: "Ho cucinato questo",
  tip: "Consiglio",
  ingredients: "Ingredienti",
  steps: "Preparazione",
  servingsWord: "porzioni",
  dietOmnivore: "classico",
  dietVegetarianShort: "vegetariano",
  dietVeganShort: "vegano",
  navHome: "Home",
  navRecipes: "Ricette",
  navHistory: "Storia",
  navProfile: "Profilo",
  chefAI: "Chef AI",
  classic: "Classico",
  organizeTitle: "Come organizzare il frigo",
  close: "Chiudi",
  nothingInZone: "Niente in questa zona.",
  welcome: "Benvenuto",
  start: "Inizia",
  next: "Avanti",
  skip: "Salta",
  onboarding1Title: "Scatta il frigo",
  onboarding1Body:
    "Fotografa il contenuto del frigorifero: FrigoChef riconosce gli alimenti e te li mostra come chip da confermare.",
  onboarding2Title: "Scegli il percorso",
  onboarding2Body:
    "Crea ricette (AI), Ricettario Classico (ricette collaudate) oppure Organizza frigo (dove mettere ogni alimento).",
  onboarding3Title: "Filtra e cucina",
  onboarding3Body:
    "Usa dieta, tempo e porzioni prima di generare. Apri una ricetta, cuocila o aggiungi i mancanti alla lista della spesa.",
  errSelectIngredient: "Seleziona o aggiungi almeno un ingrediente.",
  errSelectFood: "Seleziona almeno un alimento da organizzare.",
  errAiConnection: "Connessione al servizio AI non riuscita. Puoi riprovare o usare il ricettario.",
  errOrganize: "Non riesco a organizzare il frigo in questo momento. Riprova.",
  errGeneric: "Qualcosa è andato storto. Riprova o aggiungi gli ingredienti a mano.",
  toastNothing: "Niente da aggiungere: hai già tutto (o solo dispensa base).",
  toastOne: "1 ingrediente aggiunto alla spesa",
  toastMany: "{n} ingredienti aggiunti alla spesa",
  language: "Lingua",
  sectionPrimi: "Primi",
  sectionSecondi: "Secondi",
  sectionUova: "Uova e frittate",
  sectionContorni: "Contorni e freschi",
  sectionDessert: "Dessert",
};

const en: Dict = {
  tagline: "From fridge to plate",
  searchPlaceholder: "Search a recipe",
  dietAny: "Any",
  dietVegetarian: "Vegetarian",
  dietVegan: "Vegan",
  dietFast: "Quick",
  dessert: "Dessert",
  shootPhoto: "Take a photo",
  shootPhotoAria: "Take photo",
  orType: "Or type what you have",
  manualPlaceholder: "eggs, tomatoes, pasta",
  go: "Go",
  analyzing: "Looking at your fridge…",
  thinking: "Thinking up recipes…",
  inFridge: "In the fridge",
  extraPlaceholder: "Add more ingredients",
  createRecipes: "Create recipes",
  classicCookbook: "Classic cookbook",
  organizeFridge: "Organize fridge",
  organizing: "Organizing…",
  updateWithFilters: "Update recipes with new filters",
  moreIdeas: "More ideas",
  cookingNow: "Cook this now",
  fromReserve: "From the backup cookbook",
  fromFridge: "From your fridge",
  fromBookFridge: "From the cookbook (fridge)",
  classicTitle: "Classic cookbook",
  classicHint: "Tap a category to see dishes. Filter by diet, time and search.",
  recipesCount1: "recipe",
  recipesCountN: "recipes",
  noRecipesSearch: "No dishes for this search. Try changing the filter or keyword.",
  historyTitle: "Dishes cooked",
  clearAll: "Clear",
  historyEmpty: 'No dishes yet. Open a recipe and tap “I cooked this” to find it here.',
  profileTitle: "Preferences",
  portions: "Servings",
  maxTime: "Max time",
  minutes: "min",
  onlyDessert: "Desserts only",
  onlyDessertHint: "Show only sweets and desserts",
  on: "On",
  off: "Off",
  lessPortions: "Fewer servings",
  morePortions: "More servings",
  shoppingAria: "Shopping list",
  shoppingAriaN: "Shopping list, {n} to buy",
  shoppingTitle: "Shopping list",
  shoppingEmpty: "The list is empty. Add ingredients from recipes.",
  clearDone: "Remove done",
  missingLabel: "You're missing",
  addToShopping: "Add to shopping list",
  cookedThis: "I cooked this",
  tip: "Tip",
  ingredients: "Ingredients",
  steps: "Steps",
  servingsWord: "servings",
  dietOmnivore: "classic",
  dietVegetarianShort: "vegetarian",
  dietVeganShort: "vegan",
  navHome: "Home",
  navRecipes: "Recipes",
  navHistory: "History",
  navProfile: "Profile",
  chefAI: "Chef AI",
  classic: "Classic",
  organizeTitle: "How to organize the fridge",
  close: "Close",
  nothingInZone: "Nothing in this zone.",
  welcome: "Welcome",
  start: "Get started",
  next: "Next",
  skip: "Skip",
  onboarding1Title: "Snap your fridge",
  onboarding1Body:
    "Photograph what’s inside: FrigoChef spots the foods and shows them as chips you can confirm.",
  onboarding2Title: "Pick a path",
  onboarding2Body:
    "Create recipes (AI), Classic cookbook (tried-and-true dishes), or Organize fridge (where each item goes).",
  onboarding3Title: "Filter and cook",
  onboarding3Body:
    "Set diet, time and servings before generating. Open a recipe, cook it, or add missing items to the shopping list.",
  errSelectIngredient: "Select or add at least one ingredient.",
  errSelectFood: "Select at least one food to organize.",
  errAiConnection: "Couldn’t reach the AI service. Try again or use the cookbook.",
  errOrganize: "Can’t organize the fridge right now. Try again.",
  errGeneric: "Something went wrong. Try again or add ingredients manually.",
  toastNothing: "Nothing to add: you already have everything (or only pantry staples).",
  toastOne: "1 ingredient added to the list",
  toastMany: "{n} ingredients added to the list",
  language: "Language",
  sectionPrimi: "Mains / pasta",
  sectionSecondi: "Mains / protein",
  sectionUova: "Eggs & frittatas",
  sectionContorni: "Sides & fresh",
  sectionDessert: "Dessert",
};


const pl: Dict = {
  tagline: "Z lodówki na talerz",
  searchPlaceholder: "Szukaj przepisu",
  dietAny: "Wszystkie",
  dietVegetarian: "Wegetariańskie",
  dietVegan: "Wegańskie",
  dietFast: "Szybkie",
  dessert: "Deser",
  shootPhoto: "Zrób zdjęcie",
  shootPhotoAria: "Zrób zdjęcie",
  orType: "Albo wpisz, co masz",
  manualPlaceholder: "jajka, pomidory, makaron",
  go: "Dalej",
  analyzing: "Przeglądam lodówkę…",
  thinking: "Wymyślam przepisy…",
  inFridge: "W lodówce",
  extraPlaceholder: "Dodaj kolejne składniki",
  createRecipes: "Utwórz przepisy",
  classicCookbook: "Książka kucharska",
  organizeFridge: "Uporządkuj lodówkę",
  organizing: "Organizuję…",
  updateWithFilters: "Zaktualizuj przepisy według filtrów",
  moreIdeas: "Więcej pomysłów",
  cookingNow: "Co ugotować teraz",
  fromReserve: "Z zapasowej książki przepisów",
  fromFridge: "Z Twojej lodówki",
  fromBookFridge: "Z książki (lodówka)",
  classicTitle: "Klasyczna książka kucharska",
  classicHint: "Dotknij kategorii, by zobaczyć dania. Filtruj dietą, czasem i wyszukiwaniem.",
  recipesCount1: "przepis",
  recipesCountN: "przepisów",
  noRecipesSearch: "Brak dań dla tego wyszukiwania. Zmień filtr lub słowo kluczowe.",
  historyTitle: "Ugotowane dania",
  clearAll: "Wyczyść",
  historyEmpty: "Jeszcze nic tu nie ma. Otwórz przepis i dotknij „Ugotowałem to”, by znaleźć go tutaj.",
  profileTitle: "Preferencje",
  portions: "Porcje",
  maxTime: "Maksymalny czas",
  minutes: "min",
  onlyDessert: "Tylko desery",
  onlyDessertHint: "Pokaż tylko słodkości i desery",
  on: "Wł.",
  off: "Wył.",
  lessPortions: "Mniej porcji",
  morePortions: "Więcej porcji",
  shoppingAria: "Lista zakupów",
  shoppingAriaN: "Lista zakupów, {n} do kupienia",
  shoppingTitle: "Lista zakupów",
  shoppingEmpty: "Lista jest pusta. Dodaj składniki z przepisów.",
  clearDone: "Usuń zrobione",
  missingLabel: "Brakuje Ci",
  addToShopping: "Dodaj do listy zakupów",
  cookedThis: "Ugotowałem to",
  tip: "Wskazówka",
  ingredients: "Składniki",
  steps: "Przygotowanie",
  servingsWord: "porcje",
  dietOmnivore: "klasyczne",
  dietVegetarianShort: "wegetariańskie",
  dietVeganShort: "wegańskie",
  navHome: "Start",
  navRecipes: "Przepisy",
  navHistory: "Historia",
  navProfile: "Profil",
  chefAI: "Szef AI",
  classic: "Klasyczny",
  organizeTitle: "Jak uporządkować lodówkę",
  close: "Zamknij",
  nothingInZone: "Nic w tej strefie.",
  welcome: "Witaj",
  start: "Zaczynamy",
  next: "Dalej",
  skip: "Pomiń",
  onboarding1Title: "Zrób zdjęcie lodówki",
  onboarding1Body:
    "Sfotografuj zawartość lodówki: FrigoChef rozpozna produkty i pokaże je jako chipy do potwierdzenia.",
  onboarding2Title: "Wybierz ścieżkę",
  onboarding2Body:
    "Utwórz przepisy (AI), książka klasyczna (sprawdzone dania) albo uporządkuj lodówkę (gdzie położyć każdy produkt).",
  onboarding3Title: "Filtruj i gotuj",
  onboarding3Body:
    "Ustaw dietę, czas i porcje przed generowaniem. Otwórz przepis, ugotuj go lub dodaj braki do listy zakupów.",
  errSelectIngredient: "Wybierz lub dodaj co najmniej jeden składnik.",
  errSelectFood: "Wybierz co najmniej jeden produkt do uporządkowania.",
  errAiConnection: "Nie udało się połączyć z AI. Spróbuj ponownie lub użyj książki przepisów.",
  errOrganize: "Nie mogę teraz uporządkować lodówki. Spróbuj ponownie.",
  errGeneric: "Coś poszło nie tak. Spróbuj ponownie lub dodaj składniki ręcznie.",
  toastNothing: "Nic do dodania: masz już wszystko (albo tylko podstawy z spiżarni).",
  toastOne: "1 składnik dodany do listy",
  toastMany: "{n} składników dodanych do listy",
  language: "Język",
  sectionPrimi: "Dania pierwsze",
  sectionSecondi: "Dania główne",
  sectionUova: "Jajka i frittaty",
  sectionContorni: "Dodatki i świeże",
  sectionDessert: "Deser",
};

const tables: Record<Locale, Dict> = { it, en, pl };

export function t(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  const raw = tables[locale][key] ?? tables.it[key] ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    raw,
  );
}

export function dietLabel(locale: Locale, id: string): string {
  switch (id) {
    case "vegetarian":
      return t(locale, "dietVegetarian");
    case "vegan":
      return t(locale, "dietVegan");
    case "fast":
      return t(locale, "dietFast");
    default:
      return t(locale, "dietAny");
  }
}

export function catalogSectionTitle(locale: Locale, id: string, fallback: string): string {
  switch (id) {
    case "primi":
      return t(locale, "sectionPrimi");
    case "secondi":
      return t(locale, "sectionSecondi");
    case "uova":
      return t(locale, "sectionUova");
    case "contorni":
      return t(locale, "sectionContorni");
    case "dolci":
      return t(locale, "sectionDessert");
    default:
      return fallback;
  }
}
