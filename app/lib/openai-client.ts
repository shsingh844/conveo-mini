import OpenAI from "openai";

export function createClient(apiKey: string) {
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
}

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
