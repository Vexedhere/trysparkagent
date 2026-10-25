import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "The AI service isn't configured yet. Add GEMINI_API_KEY to your server environment, then redeploy." },
      { status: 503 }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await request.json();
    if (!Array.isArray(body.messages)) return Response.json({ error: "Send a valid list of messages." }, { status: 400 });
    messages = body.messages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-24)
      .map((m: any) => ({ role: m.role, content: m.content.trim().slice(0, 12000) }));
  } catch {
    return Response.json({ error: "The request wasn't valid JSON." }, { status: 400 });
  }

  if (!messages.length || !messages.some(m => m.role === "user" && m.content)) {
    return Response.json({ error: "Write a message first." }, { status: 400 });
  }
  if (messages.some(m => !m.content)) {
    messages = messages.filter(m => m.content);
  }

  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: "You are SparkAgent V-II, a capable, practical AI agent. Be clear, thoughtful, reliable, and action-oriented. Help users design, plan, write, debug, and build projects. Never claim you ran code, changed files, browsed websites, or completed an external action unless a connected tool actually did it. If a request needs access or tools you do not have, explain the limitation and give the next useful step. Use readable Markdown, concise by default, and ask a question only when a missing detail blocks progress." }]
          },
          contents,
          generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
        }),
        signal: request.signal,
        cache: "no-store"
      }
    );
  } catch {
    return Response.json({ error: "Couldn't reach the AI provider. Check the server connection and try again." }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    const status = upstream.status;
    let providerMessage = "";
    try {
      const data = await upstream.json();
      providerMessage = data?.error?.message || "";
    } catch {}
    if (status === 429) return Response.json({ error: "The AI service is busy or its quota is used up. Wait a moment and try again." }, { status: 429 });
    if (status === 400 || status === 403) return Response.json({ error: "The AI provider rejected the request. Check that GEMINI_API_KEY is valid and the selected model is available." }, { status: 502 });
    return Response.json({ error: providerMessage || "The AI provider is temporarily unavailable. Please try again." }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
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
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;
            try {
              const data = JSON.parse(payload);
              const text = (data.candidates?.[0]?.content?.parts || []).map((part: { text?: string }) => part.text || "").join("");
              if (text) controller.enqueue(encoder.encode(text));
              const reason = data.candidates?.[0]?.finishReason;
              if (reason === "SAFETY") controller.enqueue(encoder.encode("\n\nI couldn't complete that response because it was blocked by the provider's safety filters."));
            } catch {}
          }
        }
        if (buffer.startsWith("data:")) {
          try {
            const data = JSON.parse(buffer.slice(5).trim());
            const text = (data.candidates?.[0]?.content?.parts || []).map((part: { text?: string }) => part.text || "").join("");
            if (text) controller.enqueue(encoder.encode(text));
          } catch {}
        }
        controller.close();
      } catch {
        try { controller.error(new Error("The AI response stream ended unexpectedly.")); } catch {}
      } finally {
        reader.releaseLock();
      }
    },
    cancel() { upstream.body?.cancel(); }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
