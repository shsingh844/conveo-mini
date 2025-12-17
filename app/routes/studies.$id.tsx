import { useLoaderData } from "react-router";
import { useState } from "react";
import { studies, type Study } from "../data/studies";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { createClient } from "../lib/openai-client";

type LoaderArgs = { params: { id?: string } };
type LoaderData = { study: Study };

export async function loader({ params }: LoaderArgs): Promise<LoaderData> {
  const study = studies.find((s) => s.id === params.id);
  if (!study) throw new Response("Study not found", { status: 404 });
  return { study };
}

type InsightResult = { summary: string; themes: string[] };

export default function StudyDetail() {
  const { study } = useLoaderData() as LoaderData;
  const [apiKey] = useLocalStorage("conveo-openai-key", "");
  const [snippet, setSnippet] = useState("");
  const [insights, setInsights] = useState<InsightResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

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
      const prompt = `
You are a senior user researcher.

Study: ${study.title}
Persona: ${study.persona}

Interview snippet:
"""
${snippet}
"""

1) Summarize the snippet in 2 concise sentences.
2) Extract 3 key themes or insights as bullet points.

Return JSON:
{
  "summary": "...",
  "themes": ["...", "...", "..."]
}
`;

      const completion = await client.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.2,
      });

      const raw = completion.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw);

      const result: InsightResult = {
        summary: parsed.summary ?? "",
        themes: Array.isArray(parsed.themes) ? parsed.themes : [],
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
          <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
            <h2 className="text-base font-semibold">Interview snippet</h2>
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

          <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
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
                      <li key={i}>{t}</li>
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
