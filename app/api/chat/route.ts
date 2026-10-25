import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_ORIGIN = "https://agent.sparkagent.in.net";
const encoder = new TextEncoder();
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

type ChatMessage = { role: "user" | "assistant"; content: string };

function cors(headers: Record<string, string> = {}) {
  return {
    ...headers,
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
}

function jsonError(message: string, status: number, extra: Record<string, string> = {}) {
  return Response.json({ error: message }, { status, headers: cors(extra) });
}

function detectMode(messages: ChatMessage[], requestedMode: unknown): "coding" | "general" | "quick" {
  if (requestedMode === "coding" || requestedMode === "general" || requestedMode === "quick") return requestedMode;
  const last = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  if (/\b(code|coding|program|programming|debug|bug|stack trace|typescript|javascript|python|java|rust|golang|sql|html|css|react|next\.js|node\.js|api|function|class|component|compile|compiler|refactor|repository|repo|github|pull request|unit test|test suite|terminal|command line|algorithm|database schema|supabase|deployment|deploy|error log|website|web app|webpage|frontend|backend|script|plugin|discord bot|minecraft plugin|landing page)\b/i.test(last)) {
    return "coding";
  }
  if (/\b(quick|brief|short answer|in one sentence|simple answer|just tell me|tl;dr|summarize in|fast answer)\b/i.test(last) ||
      /^(what is|who is|when is|where is|define|meaning of|translate|convert|how much|how many)\b/i.test(last.trim()) ||
      last.trim().length < 55) {
    return "quick";
  }
  return "general";
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
    return jsonError("This app origin is not allowed.", 403);
  }

  const now = Date.now();
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim().slice(0, 80);
  const bucket = rateBuckets.get(ip);
  if (bucket && bucket.resetAt > now && bucket.count >= 18) {
    return jsonError("You're sending messages too quickly. Please wait a minute and try again.", 429, {
      "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)),
    });
  }
  if (!bucket || bucket.resetAt <= now) rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
  else bucket.count += 1;
  if (rateBuckets.size > 5000) {
    for (const [key, value] of rateBuckets) if (value.resetAt <= now) rateBuckets.delete(key);
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return jsonError("The AI service is not configured yet. Add OPENROUTER_API_KEY to the server environment and redeploy.", 503);
  }

  let body: { messages?: unknown; mode?: unknown };
  try { body = await request.json(); }
  catch { return jsonError("The request body must be valid JSON.", 400); }

  if (!Array.isArray(body.messages)) return jsonError("Send a list of chat messages.", 400);

  const messages: ChatMessage[] = body.messages
    .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m: any) => ({ role: m.role, content: m.content.trim().slice(0, 10000) }))
    .filter((m: ChatMessage) => m.content.length > 0);

  if (!messages.length || !messages.some((m) => m.role === "user")) {
    return jsonError("Write a message before sending.", 400);
  }
  if (messages.reduce((n, m) => n + m.content.length, 0) > 60000) {
    return jsonError("This conversation is too long. Start a new chat and try again.", 413);
  }

  const mode = detectMode(messages, body.mode);
  const model = mode === "coding"
    ? (process.env.OPENROUTER_CLAUDE_MODEL || "anthropic/claude-sonnet-4")
    : mode === "quick"
      ? (process.env.OPENROUTER_OPENAI_MODEL || "openai/gpt-4o-mini")
      : (process.env.OPENROUTER_GEMINI_MODEL || "google/gemini-2.5-flash");
  const systemPrompt = mode === "coding"
    ? "You are SparkAgent, an expert software engineer powered by Claude. Help with programming, debugging, architecture, code review, tests, and deployment. Give correct, complete, maintainable solutions. When asked for code, provide runnable code and clearly identify filenames and setup steps when relevant. Do not claim you edited a repository, ran code, or deployed anything unless a tool actually did so. Explain assumptions and security implications. Use Markdown and fenced code blocks."
    : mode === "quick"
      ? "You are SparkAgent, powered by an OpenAI GPT model optimized for fast, clear answers. Respond directly and intelligently, prioritize the answer first, keep simple questions concise, and expand when the user asks for detail. Do not claim to browse, run code, or complete external actions unless you actually did."
      : "You are SparkAgent, a general-purpose AI assistant powered by Gemini. Help with everyday questions, learning, writing, planning, analysis, creativity, and problem solving. Be accurate, thoughtful, and friendly. Explain complex topics clearly without unnecessary verbosity. Do not claim to browse, run code, or complete external actions unless you actually did. Use Markdown when helpful.";

  let upstream: Response;
  try {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "https://agent.sparkagent.in.net",
        "X-Title": process.env.OPENROUTER_APP_NAME || "SparkAgent",
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: mode === "coding" ? 0.25 : 0.65,
        max_tokens: 4096,
      }),
      cache: "no-store",
      signal: request.signal,
    });
  } catch {
    return jsonError("Couldn't reach OpenRouter. Check the connection and try again.", 502);
  }

  if (!upstream.ok || !upstream.body) {
    let providerMessage = "";
    try {
      const data = await upstream.json();
      providerMessage = typeof data?.error?.message === "string" ? data.error.message : "";
    } catch {}
    if (upstream.status === 401 || upstream.status === 403) {
      return jsonError("OpenRouter rejected the API key. Check OPENROUTER_API_KEY in your server environment.", 502);
    }
    if (upstream.status === 402) {
      return jsonError("OpenRouter needs available credits for this model. Check your account balance and model access.", 402);
    }
    if (upstream.status === 429) {
      return jsonError("OpenRouter is rate-limiting requests. Wait a moment and retry.", 429);
    }
    return jsonError(providerMessage || "The selected AI model is temporarily unavailable.", 502);
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
              const delta = data.choices?.[0]?.delta?.content;
              const text = typeof delta === "string"
                ? delta
                : Array.isArray(delta)
                  ? delta.map((part: { text?: string }) => part?.text || "").join("")
                  : "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch {}
          }
        }
        if (buffer.startsWith("data:")) {
          const raw = buffer.slice(5).trim();
          if (raw && raw !== "[DONE]") {
            try {
              const data = JSON.parse(raw);
              const delta = data.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta) controller.enqueue(encoder.encode(delta));
            } catch {}
          }
        }
        controller.close();
      } catch {
        try { controller.close(); } catch {}
      } finally {
        reader.releaseLock();
      }
    },
    cancel() { void upstream.body?.cancel(); },
  });

  return new Response(stream, {
    headers: cors({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "X-SparkAgent-Mode": mode,
      "X-SparkAgent-Model": model,
    }),
  });
}
