import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGIN = "https://agent.sparkagent.in.net";
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const lockedModes = new Set(["writer", "research", "deep", "strategist", "creative"]);
const freeBuildBuckets = new Map<string, { day: string; count: number }>();
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

type Message = { role: "user" | "assistant"; content: string };
type Mode = "auto" | "quick" | "chat" | "friendly" | "explain" | "brainstorm" | "study" | "coding" | "writer" | "research" | "deep" | "strategist" | "creative";

function cors(extra: Record<string, string> = {}) {
  return {
    ...extra,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
}
function error(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: cors({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }),
  });
}
function detectMode(messages: Message[], requested: unknown): Mode {
  const valid: Mode[] = ["auto", "quick", "chat", "friendly", "explain", "brainstorm", "study", "coding", "writer", "research", "deep", "strategist", "creative"];
  if (typeof requested === "string" && valid.includes(requested as Mode)) return requested as Mode;
  const last = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  if (/^(what is|who is|when is|where is|define|meaning of|translate|convert|how much|how many)\b/i.test(last.trim()) || last.trim().length < 55) return "quick";
  return "auto";
}
function promptFor(mode: Mode) {
  const prompts: Record<Mode, string> = {
    auto: "You are SparkAgent Spark 2.1 Swift, a capable general-purpose AI assistant. Be useful, thoughtful, clear and naturally conversational. Adapt length to the task, ask a brief clarifying question only when essential, and never claim tools or actions you do not have.",
    quick: "You are SparkAgent Spark 2.1 Snap. Answer directly, put the main answer first, and keep simple questions concise. Expand when needed for correctness.",
    chat: "You are SparkAgent Spark 2.1 Orbit, a general conversation companion. Talk naturally about everyday life, interests, hobbies, ideas, entertainment and questions. Be relaxed and engaging without pretending to be human. Follow the user's conversational lead and avoid turning every reply into a long guide.",
    friendly: "You are SparkAgent Spark 2.1 Cozy. Respond warmly, casually and respectfully, like a helpful conversation partner. Be empathetic without overdoing praise, don't force advice when the user just wants to chat, and keep the flow natural.",
    explain: "You are SparkAgent Spark 2.2 Clearview. Explain any topic in plain language, define unfamiliar terms, use concrete examples and analogies, and scale detail to the user's level. Do not talk down to the user.",
    brainstorm: "You are SparkAgent Spark 2.2 IdeaFlow. Brainstorm collaboratively, produce varied and specific ideas, explain the strongest options briefly, and help the user build on an idea instead of repeating generic suggestions.",
    study: "You are SparkAgent Spark 2.2 Scholaris. Teach patiently with clear explanations, examples, checkpoints, and hints that help the learner understand rather than merely memorize.",
    coding: "You are SparkAgent Spark 2.4 Forge. Help with programming, debugging, architecture, code review, tests, and deployment. Provide complete, maintainable code with filenames and setup steps when relevant. Never claim you edited or deployed anything unless you actually did.",
    writer: "You are SparkAgent Spark 2.4 Quill. Help create polished, original drafts, improve clarity, adapt tone, and explain important edits when useful.",
    research: "You are SparkAgent Spark 3.0 Atlas. Structure the problem, distinguish established facts from uncertainty, and never invent citations or claim to have browsed.",
    deep: "You are SparkAgent Spark 3.0 Synapse. Work carefully through complex trade-offs, surface assumptions and alternatives, and deliver a clear, well-structured conclusion.",
    strategist: "You are SparkAgent Spark 3.2 Parallax. Help prioritize goals, compare options, assess risks, and turn ideas into practical plans with milestones.",
    creative: "You are SparkAgent Spark 3.2 Dreamweave. Generate fresh ideas, story concepts, naming directions, and creative approaches while respecting the user's constraints."
  };
  return prompts[mode];
}
function modelFor(mode: Mode) {
  if (mode === "quick" || mode === "chat" || mode === "friendly" || mode === "explain" || mode === "brainstorm") return Deno.env.get("OPENROUTER_OPENAI_MODEL") || "openai/gpt-4o-mini";
  if (mode === "coding" || mode === "deep" || mode === "research") return Deno.env.get("OPENROUTER_CLAUDE_MODEL") || "anthropic/claude-sonnet-4";
  return Deno.env.get("OPENROUTER_GEMINI_MODEL") || "google/gemini-2.5-flash";
}

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors() });
  }
  if (request.method !== "POST") return error("Use POST to send a chat message.", 405);

  const now = Date.now();
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim().slice(0, 80);
  const bucket = rateBuckets.get(ip);
  if (bucket && bucket.resetAt > now && bucket.count >= 60) return error("You're sending messages too quickly. Please wait a minute and try again.", 429);
  if (!bucket || bucket.resetAt <= now) rateBuckets.set(ip, { count: 1, resetAt: now + 60_000 });
  else bucket.count++;
  if (rateBuckets.size > 5000) for (const [key, value] of rateBuckets) if (value.resetAt <= now) rateBuckets.delete(key);

  let body: { messages?: unknown; mode?: unknown };
  try { body = await request.json(); } catch { return error("The request body must be valid JSON.", 400); }
  if (!Array.isArray(body.messages)) return error("Send a list of chat messages.", 400);
  const messages: Message[] = body.messages
    .filter((m: unknown): m is Message => !!m && typeof m === "object" &&
      (((m as Message).role === "user") || ((m as Message).role === "assistant")) &&
      typeof (m as Message).content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 10000) }))
    .filter((m) => m.content.length > 0);
  if (!messages.length || !messages.some((m) => m.role === "user")) return error("Write a message before sending.", 400);
  if (messages.reduce((n, m) => n + m.content.length, 0) > 60000) return error("This conversation is too long. Start a new chat and try again.", 413);

  const mode = detectMode(messages, body.mode);
  // Paid modes remain server-blocked until SparkAgent's subscription entitlement
  // lookup is connected. A browser-only disabled option is not access control.
  if (lockedModes.has(mode)) {
    const tier = ["coding", "writer", "research", "deep"].includes(mode) ? "Spark Pro" : "Spark MAX";
    return error(`This mode requires ${tier}. Sign-in and subscription verification will unlock paid modes once billing entitlements are connected.`, 403);
  }

  const apiKey = Deno.env.get("OPENROUTER_API_KEY");
  if (!apiKey) return error("The AI service is not configured. Add OPENROUTER_API_KEY to Supabase Edge Function secrets.", 503);

  if (mode === "coding") {
    const day = new Date().toISOString().slice(0, 10);
    const current = freeBuildBuckets.get(ip);
    if (current && current.day === day && current.count >= 3) {
      return error("You've used the 3 free Forge builds available today. Regular chat is still available; Forge builds reset at 00:00 UTC.", 429);
    }
    if (!current || current.day !== day) freeBuildBuckets.set(ip, { day, count: 1 });
    else current.count++;
    if (freeBuildBuckets.size > 5000) for (const [key, value] of freeBuildBuckets) if (value.day !== day) freeBuildBuckets.delete(key);
  }
  const model = modelFor(mode);
  let upstream: Response;
  try {
    upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": Deno.env.get("OPENROUTER_SITE_URL") || ALLOWED_ORIGIN,
        "X-Title": Deno.env.get("OPENROUTER_APP_NAME") || "SparkAgent",
      },
      body: JSON.stringify({
        model, stream: true, messages: [{ role: "system", content: promptFor(mode) }, ...messages],
        temperature: mode === "study" ? 0.45 : 0.65, max_tokens: mode === "strategist" || mode === "creative" || mode === "deep" ? 8192 : 4096,
      }),
      signal: AbortSignal.timeout(120_000),
    });
  } catch {
    return error("Couldn't reach the AI provider. Check the connection and try again.", 502);
  }
  if (!upstream.ok || !upstream.body) {
    let message = "";
    try { const data = await upstream.json(); message = typeof data?.error?.message === "string" ? data.error.message : ""; } catch {}
    if (upstream.status === 401 || upstream.status === 403) return error("The AI provider rejected its server key. Check the OPENROUTER_API_KEY secret.", 502);
    if (upstream.status === 402) return error("The AI provider needs available credits for this model.", 402);
    if (upstream.status === 429) return error("The AI provider is rate-limiting requests. Wait a moment and retry.", 429);
    return error(message || "The selected AI service is temporarily unavailable.", 502);
  }

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
            const raw = line.slice(5).trim();
            if (!raw || raw === "[DONE]") continue;
            try {
              const data = JSON.parse(raw);
              const delta = data.choices?.[0]?.delta?.content;
              const text = typeof delta === "string" ? delta : Array.isArray(delta) ? delta.map((p: { text?: string }) => p?.text || "").join("") : "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch {}
          }
        }
        controller.close();
      } catch {
        try { controller.close(); } catch {}
      } finally { reader.releaseLock(); }
    },
    cancel() { void upstream.body?.cancel(); }
  });
  return new Response(stream, {
    headers: cors({
      "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no", "X-SparkAgent-Mode": mode,
    })
  });
});
