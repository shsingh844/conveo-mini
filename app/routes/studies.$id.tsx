import { useLoaderData } from "react-router";
import { useState } from "react";
import { studies, type Study } from "../data/studies";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { createClient } from "../lib/openai-client";
import type { PromptMode } from "../lib/openai-client";
import { buildMessagesForInterviewInsights } from "../lib/openai-client";

type LoaderArgs = { params: { id?: string } };
type LoaderData = { study: Study };

export async function loader({ params }: LoaderArgs): Promise<LoaderData> {
  const study = studies.find((s) => s.id === params.id);
  if (!study) throw new Response("Study not found", { status: 404 });
  return { study };
}

type Theme = { title: string; description: string };

type InsightResult = { summary: string; themes: Theme[] };

export default function StudyDetail() {
  const { study } = useLoaderData() as LoaderData;
  const [apiKey] = useLocalStorage("conveo-openai-key", "");
  const [snippet, setSnippet] = useState("");
  const [insights, setInsights] = useState<InsightResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [promptMode, setPromptMode] = useState<PromptMode>("default");

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();

    if (!apiKey) {
      setStatus("error");
      setMessage("Please set your OpenAI key on the home page first.");
      return;
    }
    if (!snippet.trim()) {
      setStatus("error");
      setMessage("Please paste an interview snippet.");
      return;
    }

    setStatus("loading");
    setMessage("Generating insights…");

    try {
      const client = createClient(apiKey);

      const messages = buildMessagesForInterviewInsights({
        promptMode,
        studyTitle: study.title,
        persona: study.persona,
        snippet,
      });

      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw);

      const parsedThemes = Array.isArray(parsed.themes) ? parsed.themes : [];

      const result: InsightResult = {
        summary: parsed.summary ?? "",
        themes: parsedThemes.map((t: any) => ({
          title: t.title ?? String(t),
          description: t.description ?? "",
        })),
      };


      setInsights(result);
      setStatus("idle");
      setMessage("");
    } catch (err: any) {
      console.error("OpenAI error", err);
      setStatus("error");
      setMessage(
        err?.message ?? "Failed to generate insights. Please try again."
      );
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <button
          type="button"
          onClick={() => history.back()}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          ← Back to studies
        </button>

        <header>
          <h1 className="text-2xl font-semibold">{study.title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            Persona: {study.persona}
          </p>
          <p className="mt-2 text-sm text-slate-100">{study.description}</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-base font-semibold">Interview snippet</h2>
            <p className="text-xs text-rose-400">DEBUG: new StudyDetail component</p>
            <p className="text-xs text-slate-400">
              Paste a short excerpt from a customer interview.
            </p>

            <form onSubmit={handleGenerate} className="space-y-3">
              <textarea
                value={snippet}
                onChange={(e) => setSnippet(e.target.value)}
                className="min-h-[140px] w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                placeholder="“I love the product, but the checkout always times out on mobile…”"
              />

              <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <h3 className="text-xs font-semibold text-slate-900">
                  Prompt mode
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  Switch between different prompt strategies to see how the AI output changes.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPromptMode("default")}
                    className={
                      "rounded-full border px-3 py-1 text-xs " +
                      (promptMode === "default"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-300 bg-white text-slate-700")
                    }
                  >
                    Default
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptMode("researcher")}
                    className={
                      "rounded-full border px-3 py-1 text-xs " +
                      (promptMode === "researcher"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-300 bg-white text-slate-700")
                    }
                  >
                    Researcher-grade
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromptMode("stepwise")}
                    className={
                      "rounded-full border px-3 py-1 text-xs " +
                      (promptMode === "stepwise"
                        ? "border-sky-600 bg-sky-600 text-white"
                        : "border-slate-300 bg-white text-slate-700")
                    }
                  >
                    Step-by-step
                  </button>
                </div>
              </section>

              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-xs font-medium text-black hover:bg-emerald-400 disabled:opacity-60"
              >
                {status === "loading" ? "Generating…" : "Generate insights"}
              </button>

              {message && (
                <p
                  className={`text-xs ${
                    status === "error" ? "text-rose-400" : "text-slate-400"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </article>

          <article className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <h2 className="text-base font-semibold">AI insights</h2>
            <p className="text-xs text-slate-400">
              Summary and key themes extracted from the snippet.
            </p>

            <div className="mt-2 text-sm">
              {status === "loading" && (
                <p className="text-slate-400">Analyzing interview snippet…</p>
              )}

              {!insights && status !== "loading" && (
                <p className="text-slate-500">
                  Insights will appear here after you submit a snippet.
                </p>
              )}

              {insights && (
                <>
                  <p className="mb-2">{insights.summary}</p>
                  <ul className="ml-4 list-disc space-y-1">
                    {insights.themes.map((t, i) => (
                      <li key={i}>
                        <span className="font-medium">{t.title}</span>
                        {t.description && (
                          <span className="ml-1 text-slate-300">– {t.description}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
