import type { Recipe } from "./types";

type BookRecipe = Omit<Recipe, "missing" | "servings"> & {
  tags: string[];
  baseServings: number;
};

export const RECIPES_DESSERT: BookRecipe[] = [
  {
    id: "mousse-limone",
    title: "Mousse al limone con yogurt",
    description:
      "Yogurt, limone e un filo di miele: dessert fresco, leggero e pronto in cinque minuti. Ideale a fine pasto quando vuoi qualcosa di dolce senza accendere il forno.",
    minutes: 5,
    diet: "vegetarian",
    tags: ["yogurt", "limone", "miele", "dessert"],
    ingredients: [
      "250 g di yogurt greco o bianco",
      "succo e scorza di 1 limone",
      "2 cucchiai di miele o zucchero",
      "un pizzico di vaniglia (opzionale)",
    ],
    steps: [
      "In una ciotola mescola yogurt, succo di limone, scorza e miele.",
      "Assaggia e regola di dolcezza o acidità.",
      "Dividi in due coppette e lascia in frigo almeno 15 minuti se puoi.",
      "Servi fresco, eventualmente con una grattugiata di scorza sopra.",
    ],
    tip: "Con yogurt greco resta più densa e setosa; con quello classico è più leggera.",
    art: "/graphics/lemon.jpg",
    baseServings: 2,
  },
  {
    id: "crepes",
    title: "Crêpes semplici",
    description:
      "Pastella leggera di uova, latte e farina: crêpes sottili da farcire con zucchero, limone, nutella o marmellata. Un dessert (o colazione) versatile e sempre gradito.",
    minutes: 25,
    diet: "vegetarian",
    tags: ["uova", "latte", "dessert"],
    ingredients: [
      "2 uova",
      "200 ml di latte",
      "100 g di farina",
      "1 cucchiaio di zucchero",
      "un noce di burro per la padella",
      "ripieno a piacere",
    ],
    steps: [
      "Sbatti uova, latte, farina e zucchero fino a una pastella liscia. Lascia riposare 5 minuti.",
      "Scalda una padella antiaderente con un filo di burro. Versa un mestolino di pastella e inclina per stenderla.",
      "Cuoci 1 minuto per lato fino a dorata. Ripeti con il resto.",
      "Farcisci a piacere e servi calde.",
    ],
    tip: "La prima crêpe spesso viene male: non scoraggiarti, serve a regolare la temperatura della padella.",
    art: "/graphics/lemon.jpg",
    baseServings: 2,
  },
  {
    id: "budino-latte",
    title: "Budino al latte in padella",
    description:
      "Latte, zucchero e amido: budino cremoso cotto in padella senza forno. Un dolce della tradizione semplice, economico e consolante.",
    minutes: 15,
    diet: "vegetarian",
    tags: ["latte", "dessert"],
    ingredients: [
      "500 ml di latte",
      "60 g di zucchero",
      "40 g di amido di mais (maizena)",
      "scorza di limone o vaniglia",
      "un pizzico di sale",
    ],
    steps: [
      "In una ciotola mescola amido, zucchero e un filo di latte freddo fino a sciogliere i grumi.",
      "Porta a bollore il resto del latte con la scorza. Versa il composto di amido mescolando.",
      "Cuoci a fuoco medio mescolando finché si addensa (3–4 minuti).",
      "Versa in stampini o coppette. Lascia intiepidire e poi in frigo.",
    ],
    tip: "Mescola sempre sul fondo: l'amido attacca facilmente. Se si formano grumi, passa al setaccio.",
    art: "/graphics/lemon.jpg",
    baseServings: 2,
  },
  {
    id: "tiramisu-express",
    title: "Tiramisù express in coppa",
    description:
      "Versione lampo del tiramisù: savoiardi, caffè, mascarpone (o yogurt greco) e cacao. Niente uova crude, pronto in dieci minuti e da lasciare in frigo.",
    minutes: 15,
    diet: "vegetarian",
    tags: ["mascarpone", "caffè", "dessert"],
    ingredients: [
      "8–10 savoiardi",
      "200 g di mascarpone o yogurt greco",
      "2 cucchiai di zucchero",
      "1 tazzina di caffè freddo",
      "cacao amaro q.b.",
    ],
    steps: [
      "Mescola mascarpone e zucchero fino a una crema liscia.",
      "Inzuppa i savoiardi nel caffè (pochi secondi) e disponili sul fondo di due coppette.",
      "Copri con la crema. Ripeti se hai strati.",
      "Spolvera di cacao e metti in frigo almeno 30 minuti.",
    ],
    tip: "Non inzuppare troppo i savoiardi: devono restare umidi ma non sfaldarsi.",
    art: "/graphics/hero.jpg",
    baseServings: 2,
  },
  {
    id: "frutta-yogurt",
    title: "Coppa di frutta e yogurt",
    description:
      "Yogurt, frutta di stagione e un filo di miele: dessert (o colazione) fresco, colorato e bilanciato. Il modo più semplice per chiudere un pasto in modo leggero.",
    minutes: 5,
    diet: "vegetarian",
    tags: ["yogurt", "frutta", "dessert"],
    ingredients: [
      "250 g di yogurt bianco o greco",
      "frutta a piacere (mela, banana, frutti di bosco, arancia)",
      "1 cucchiaio di miele",
      "noci o mandorle sbriciolate (opzionale)",
    ],
    steps: [
      "Taglia la frutta a pezzi o fette.",
      "Disponi lo yogurt nelle coppette, aggiungi la frutta.",
      "Condisci con miele e, se vuoi, la frutta secca.",
      "Servi subito.",
    ],
    tip: "Se usi banana, aggiungila all'ultimo momento per non farla annerire.",
    art: "/graphics/lettuce.jpg",
    baseServings: 2,
  },
];
