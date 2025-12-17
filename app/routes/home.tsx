import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "../+types/home";
import { studies, type Study } from "../data/studies";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { validateKeyInBrowser } from "../lib/openai-client";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Conveo Mini – Studies" }];
}

export default function Home() {
  const [storedKey, setStoredKey] = useLocalStorage("conveo-openai-key", "");
  const [inputKey, setInputKey] = useState(storedKey);
  const [status, setStatus] = useState<"idle" | "validating" | "ok" | "error">(
    storedKey ? "ok" : "idle",
  );
  const [message, setMessage] = useState("");

  async function handleValidate(e: React.FormEvent) {
    e.preventDefault();
    const key = inputKey.trim();
    if (!key) {
      setStatus("error");
      setMessage("Please enter an API key.");
      return;
    }
    setStatus("validating");
    setMessage("Validating key…");

    const ok = await validateKeyInBrowser(key);
    if (!ok) {
      setStatus("error");
      setMessage("API key appears invalid. Please check and try again.");
      return;
    }

    setStoredKey(key);
    setStatus("ok");
    setMessage("API key validated and saved in your browser.");
  }

  function handleClear() {
    setStoredKey("");
    setInputKey("");
    setStatus("idle");
    setMessage("Key cleared from this browser.");
  }

  const statusText =
    status === "ok" || storedKey
      ? "OpenAI key is set and ready."
      : "No API key set yet.";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* API key panel */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <h2 className="text-base font-semibold">OpenAI API key</h2>
          <p className="text-xs text-slate-400">
            Paste your OpenAI API key. It is stored only in this browser
            (localStorage) and used directly from your device; it is not sent to
            any external server except OpenAI.
          </p>
          <p className="text-xs text-slate-300">{statusText}</p>

          <form onSubmit={handleValidate} className="space-y-2">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm"
              placeholder="sk-..."
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={status === "validating"}
                className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-60"
              >
                {status === "validating" ? "Validating…" : "Validate & Save"}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Clear from browser
              </button>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-sky-400 hover:underline"
              >
                Get an API key
              </a>
            </div>
            {message && (
              <p
                className={`text-xs ${
                  status === "error" ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {message}
              </p>
            )}
          </form>
        </section>

        {/* Studies list */}
        <section className="space-y-4">
          <header>
            <h1 className="text-2xl font-semibold">Conveo Mini – AI Studies</h1>
            <p className="mt-1 text-sm text-slate-400">
              Select a study, paste an interview snippet, and generate instant AI insights.
            </p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {studies.map((study: Study) => (
              <article
                key={study.id}
                className="rounded-xl border border-slate-800 bg-slate-900/80 p-4"
              >
                <h2 className="text-base font-semibold">{study.title}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Persona: {study.persona}
                </p>
                <p className="mt-2 text-sm text-slate-100">{study.description}</p>
                <div className="mt-3">
                  <Link
                    to={`/studies/${study.id}`}
                    className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-black hover:bg-emerald-400"
                  >
                    Open study
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
