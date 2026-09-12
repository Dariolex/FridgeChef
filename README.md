# FrigoChef

An Italian-language recipe app: snap a photo of your fridge and get recipe suggestions tailored to what you actually have on hand.

## What it does

- Take or upload a photo of your fridge contents
- AI vision (Google Gemini) identifies the ingredients in the photo
- Review and adjust the detected ingredients before generating recipes
- Or skip the photo entirely and type ingredients in by hand
- Filter by diet: Any, Vegetarian, Vegan, or Fast (≤15 minutes)
- Toggle a dedicated Desserts mode
- Adjust servings (1–8) and get recipes scaled accordingly
- AI-generated recipes tailored to your ingredients, with automatic fallback to a built-in classic Italian cookbook if the AI call fails
- Browse the classic cookbook by category (Primi, Secondi, Eggs & frittatas, Sides, Desserts)
- Get an AI-suggested fridge organization plan (where to place each item on the shelves)
- Automatic shopping list: missing ingredients from recipes are collected for you, with common pantry staples (salt, sugar, oil, pepper, chili) excluded
- Cooking history: the last 30 dishes you've cooked, stored locally on your device
- Installable as a Progressive Web App (add to home screen on iOS/Android)

## Getting started

```bash
npm install
npm run dev
```

Set `GEMINI_API_KEY` in your environment for automatic photo recognition (a free key is available from [Google AI Studio](https://aistudio.google.com/apikey)). Without a key, the local cookbook and manual ingredient entry still work.

Optional environment variables:
- `GEMINI_VISION_MODEL` (default: `gemini-3.5-flash-lite`) — model used to read ingredients from the photo
- `GEMINI_RECIPE_MODEL` (default: `gemini-3.5-flash`) — model used to generate recipes

`GEMINI_API_KEY` must be an **auth**-type key from [Google AI Studio](https://aistudio.google.com/apikey).

## Stack

React 19, TanStack Start, Tailwind v4, Google Gemini vision and text models (free tier, via an OpenAI-compatible endpoint). The shopping list and cooking history are stored locally in the browser — no server-side database is used.
