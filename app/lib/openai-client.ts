import OpenAI from "openai";

export function createClient(apiKey: string) {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

export type PromptMode = "default" | "researcher" | "stepwise";

export async function validateKeyInBrowser(apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  try {
    const client = createClient(apiKey);
    // Cheap test call; list a single model
    await client.models.list({ limit: 1 });
    return true;
  } catch (err: any) {
    if (err?.status === 401 || err?.status === 403) return false;
    return false;
  }
}

export function buildMessagesForInterviewInsights(params: {
  promptMode: PromptMode;
  studyTitle: string;
  persona: string;
  objective?: string;
  snippet: string;
}) {
  const {
    promptMode,
    studyTitle,
    persona,
    objective = "Not specified",
    snippet,
  } = params;

  const baseSystem = `
You are a UX researcher helping a product team analyze qualitative user interview snippets.
The product area is: ${studyTitle}.
The target persona is: ${persona}.
The study objective is: ${objective}.
Always respond in strict JSON with this shape:
{
  "summary": "2 sentence high-level summary",
  "themes": [
    { "title": "Short theme title", "description": "1-2 sentence explanation" },
    { "title": "...", "description": "..." },
    { "title": "...", "description": "..." }
  ]
}
`.trim();

  if (promptMode === "default") {
    return [
      { role: "system" as const, content: baseSystem },
      {
        role: "user" as const,
        content: `
Here is the raw interview snippet from a single participant:

"""${snippet}"""

Summarize the main points and extract three key themes.
        `.trim(),
      },
    ];
  }

  if (promptMode === "researcher") {
    return [
      {
        role: "system" as const,
        content: `
${baseSystem}

Behave like a senior UX researcher.
Prioritize:
- Faithfulness to what the participant actually said.
- Concrete, actionable themes phrased as opportunities or risks.
- Mentioning the persona and study objective when relevant.
`.trim(),
      },
      {
        role: "user" as const,
        content: `
Analyze this interview snippet and produce a concise, decision-ready insight summary for the product team.

Snippet:
"""${snippet}"""

Guidelines:
- Summary: 2 sentences, one for overall sentiment and one for the main problems or opportunities.
- Themes: exactly three. Each should be specific enough to inform a product change (avoid generic "UX improvements").
        `.trim(),
      },
    ];
  }

  // stepwise
  return [
    { role: "system" as const, content: baseSystem },
    {
      role: "user" as const,
      content: `
You will analyze an interview snippet in two steps.

1) List 5-8 bullet observations, very close to the participant's actual words.
2) From those observations, derive exactly three themes and fill the JSON shape described in the system prompt.

Important:
- Do not include the observations in the final JSON, only use them as internal reasoning.
- The final answer must be valid JSON only.

Here is the snippet:
"""${snippet}"""
      `.trim(),
    },
  ];
}


