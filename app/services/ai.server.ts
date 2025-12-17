import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type InsightResult = {
  summary: string;
  themes: string[];
};

export async function generateInsightsFromSnippet(
  studyTitle: string,
  persona: string,
  snippet: string,
): Promise<InsightResult> {
  const prompt = `
You are an expert research analyst helping product teams interpret user interviews.

Study: ${studyTitle}
Persona: ${persona}

Interview snippet:
"""
${snippet}
"""

1) Summarize this snippet in 2 concise sentences.
2) Extract 3 key themes or insights as bullet points.

Return JSON:
{
  "summary": "...",
  "themes": ["...", "...", "..."]
}
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const text = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(text);

  return {
    summary: parsed.summary ?? "",
    themes: Array.isArray(parsed.themes) ? parsed.themes : [],
  };
}
