import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ORIGIN = "https://agent.sparkagent.in.net";
const encoder = new TextEncoder();

function cors(headers: HeadersInit = {}) {
  return {
    ...headers,
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
}

export async function OPTIONS(request: NextRequest) {
  if (request.headers.get("origin") !== ALLOWED_ORIGIN) return new Response(null, { status: 403 });
  return new Response(null, { status: 204, headers: cors({
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  }) });
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== ALLOWED_ORIGIN) {
    return Response.json({ error: "This app origin is not allowed." }, { status: 403 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "The AI service is not configured yet. Add GEMINI_API_KEY to the server environment and redeploy." }, { status: 503, headers: cors() });
  }

  let body: { messages?: unknown };
  try { body = await request.json(); }
  catch { return Response.json({ error: "The request body must be valid JSON." }, { status: 400, headers: cors() }); }

  if (!Array.isArray(body.messages)) {
    return Response.json({ error: "Send a list of chat messages." }, { status: 400, headers: cors() });
  }

  const messages = body.messages
    .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m: any) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content.trim().slice(0, 10000) }] }))
    .filter(m => m.parts[0].text.length > 0);

  if (!messages.length || !messages.some(m => m.role === "user")) {
    return Response.json({ error: "Write a message before sending." }, { status: 400, headers: cors() });
  }
  if (messages.reduce((n, m) => n + m.parts[0].text.length, 0) > 60000) {
    return Response.json({ error: "This conversation is too long. Start a new chat and try again." }, { status: 413, headers: cors() });
  }

  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  let upstream: Response;
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: "You are SparkAgent, a capable and practical AI agent. Help users reason, write, learn, plan, design, and build software. Be accurate, direct, friendly, and useful. Never claim you browsed, ran code, changed files, or completed an external action unless you actually did. Explain limitations honestly. Use clear Markdown and ask follow-up questions only when needed." }] },
          contents: messages,
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
        }),
        cache: "no-store",
        signal: request.signal
      }
    );
  } catch {
    return Response.json({ error: "Couldn't reach the AI provider. Please check your connection and retry." }, { status: 502, headers: cors() });
  }

  if (!upstream.ok || !upstream.body) {
    let providerMessage = "";
    try { const data = await upstream.json(); providerMessage = data?.error?.message || ""; } catch {}
    const status = upstream.status === 429 ? 429 : 502;
    const message = upstream.status === 429
      ? "The AI provider is busy or the quota has been reached. Wait a moment and retry."
      : (upstream.status === 400 || upstream.status === 403)
        ? "The AI provider rejected the request. Check the server's GEMINI_API_KEY and GEMINI_MODEL settings."
        : providerMessage || "The AI provider is temporarily unavailable.";
    return Response.json({ error: message }, { status, headers: cors() });
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const raw = line.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;
            try {
              const data = JSON.parse(raw);
              const text = (data.candidates?.[0]?.content?.parts || []).map((part: { text?: string }) => part.text || "").join("");
              if (text) controller.enqueue(encoder.encode(text));
            } catch {}
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      } finally { reader.releaseLock(); }
    },
    cancel() { void upstream.body?.cancel(); }
  });

  return new Response(stream, {
    headers: cors({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no"
    })
  });
}
