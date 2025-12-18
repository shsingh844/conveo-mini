# Conveo Mini – AI Interview Insight Demo

Conveo Mini is a small demo inspired by Conveo’s AI-led research platform. It showcases a production-style React Router v7 + TypeScript + Tailwind app that turns interview snippets into structured insights using the OpenAI API.

## Tech stack

- React Router framework v7 (file-based routes via `app/routes.ts`)  
- TypeScript  
- Tailwind CSS v3  
- Vite (via React Router dev tooling)  
- OpenAI JavaScript SDK (client-side, user-provided API key)  

## Core features implemented

### 1. Study selection

- Landing page listing a few predefined “studies” (e.g., checkout experience, B2B onboarding).  
- Each study has a title, description, and target persona.  
- Clicking “Open study” navigates to `/studies/:id` using React Router’s framework routing.

### 2. User-provided OpenAI API key

- Setup panel on the home page where users paste their own OpenAI key.  
- Key is validated in the browser via a lightweight OpenAI request.  
- Valid keys are cached in `localStorage` under `conveo-openai-key`, so returning users do not have to re-enter it.  
- The key is used only from the browser; it is not stored on or logged by any server.

### 3. AI-powered insights (per study)

- Study detail page at `/studies/:id`.  
- Users paste an interview snippet for the selected study/persona.  
- On “Generate insights”, the app calls OpenAI’s Chat Completions API to:  
  - Summarize the snippet in two sentences.  
  - Extract three key themes or insights.  
- The response is parsed as JSON and rendered as a short summary plus bullet-point themes.

### 4. Prompt engineering

This demo intentionally explores multiple prompt strategies for the same UX research task:

- Default prompt: Direct, compact template for quick interview summarization and theme extraction.
- Researcher-grade prompt: Longer, structured template that frames insights as decision-ready opportunities and risks for PMs and UX teams.
- Step-by-step prompt: A two-step template that first asks the model to reason in observations, then derive themes, to encourage more faithful and structured outputs.

These prompt modes are selectable in the UI, so you can see how different templates change summaries and themes for the same interview snippet.

## Security and privacy notes

- This is a portfolio/demo project, not a production system.  
- The OpenAI API key is provided by the user and stored only in the browser (localStorage).  
- All OpenAI calls are made from the client using that key.  
- For a real production application, keys should be kept server-side with proper secret management, rate limiting, and abuse protection.

## Project structure (high level)

- `app/root.tsx` – app shell, layout, error boundary, Tailwind import.  
- `app/routes.ts` – central route config for the React Router framework.  
- `app/routes/home.tsx` – home page with API key setup and study list.  
- `app/routes/studies.$id.tsx` – study detail screen and AI insight generation.  
- `app/data/studies.ts` – in-memory study definitions.  
- `app/hooks/useLocalStorage.ts` – small hook for localStorage-backed state.  
- `app/lib/openai-client.ts` – helper for creating a browser OpenAI client and validating keys.  
- `app/app.css` – Tailwind entrypoint and global styles.  
- `app/lib/openai-client.ts` - helper for creating a browser OpenAI client, validating keys, and building prompt templates.

## What is left / future scope

These are logical next steps if the project is extended:

- Add persistent storage for studies and insights (PostgreSQL) and show history per study.  
- Add input validation, character limits, and basic rate limiting on insight generation.  
- Introduce a richer UI component library (e.g., shadcn/ui) to better match Conveo’s stack.  
- Implement a small Node/server route to proxy OpenAI calls instead of calling from the browser (for stronger key security).  
- Add tests for loaders/actions and key-handling logic.  

### Fine-tune readiness

Although this project currently uses prompt engineering only (no fine-tuning), the design is intentionally fine-tune-ready:

- Each generation run could log: the study, persona, raw snippet, selected prompt mode, AI-generated summary and themes, and a human researcher score.
- That dataset could later be used to fine-tune an LLM specifically on Conveo-style interview data, improving consistency and domain alignment beyond what prompts alone can do.

This makes it straightforward to evolve the demo from a prompt-only prototype into a fine-tuned, production-grade model if needed.

## Running locally

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open the app at the printed localhost URL, paste an OpenAI API key on the home page, and start generating insights from interview snippets.

## Deployment 
To be continued...