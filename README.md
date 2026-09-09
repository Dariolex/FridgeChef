# FrigoChef

App italiana: scatti una foto del frigo e ottieni ricette su misura.

## Cosa fa

- Carica o scatta una foto del contenuto del frigo
- Riconosce gli ingredienti (vision AI + ricettario di riserva)
- Filtra per dieta: qualsiasi, vegetariano, vegano, veloce
- Mostra ricette con tempi, ingredienti mancanti e passi
- Include un **frigo demo** se non vuoi usare la fotocamera

## Avvio

```bash
npm install
npm run dev
```

Imposta `GEMINI_API_KEY` nell’ambiente per la lettura automatica delle foto (chiave gratuita da [Google AI Studio](https://aistudio.google.com/apikey)). Senza chiave, il ricettario locale e il frigo demo restano usabili.

## Stack

React 19, TanStack Start, Tailwind v4, Google Gemini vision (livello gratuito, via endpoint OpenAI-compatibile).
