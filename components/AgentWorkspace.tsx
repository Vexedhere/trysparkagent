"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUp, AudioLines, Bot, Check, Copy, Menu, Mic, Plus, RotateCcw, Sparkles, Square, Volume2, VolumeX, X } from "lucide-react";

type Message = { id: string; role: "user" | "assistant"; content: string };
const STARTERS = [
  { icon: "⌘", title: "Build something", prompt: "Help me plan and build a polished web app. Ask only the essential questions, then give me a practical implementation plan." },
  { icon: "✳", title: "Solve a problem", prompt: "Help me break down a difficult problem into clear steps and explain the reasoning." },
  { icon: "⌁", title: "Write & create", prompt: "Help me write something clear, original, and useful. Start by suggesting a strong first draft." },
  { icon: "↗", title: "Learn a topic", prompt: "Teach me a topic from the basics, with examples and a short practical exercise." },
];

export default function AgentWorkspace() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sidebar, setSidebar] = useState(true);
  const [voiceOn, setVoiceOn] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sparkagent-v2-chat");
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("sparkagent-v2-chat", JSON.stringify(messages)); } catch {}
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  function newChat() {
    abortRef.current?.abort();
    setBusy(false); setError(""); setMessages([]); setInput("");
    if (typeof window !== "undefined") window.localStorage.removeItem("sparkagent-v2-chat");
    window.speechSynthesis?.cancel(); setSpeaking(false);
    inputRef.current?.focus();
  }

  async function send(text = input) {
    const prompt = text.trim();
    if (!prompt || busy) return;
    setError("");
    const userMessage: Message = { id: crypto.randomUUID(), role: "user", content: prompt };
    const assistantMessage: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
    const next = [...messages, userMessage];
    setMessages([...next, assistantMessage]); setInput(""); setBusy(true);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content }) => ({ role, content })) }),
        signal: controller.signal,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "I couldn't connect right now. Please try again.");
      }
      if (!response.body) throw new Error("Your browser couldn't open the response stream. Please try again.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages(current => current.map(m => m.id === assistantMessage.id ? { ...m, content: answer } : m));
      }
      if (!answer.trim()) throw new Error("The model returned an empty response. Please try again.");
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return;
      const message = e instanceof Error ? e.message : "Something went wrong.";
      setError(message);
      setMessages(current => current.filter(m => m.id !== assistantMessage.id || m.content.trim()));
    } finally { setBusy(false); abortRef.current = null; }
  }

  function listen() {
    const w = window as Window & { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const Speech = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Speech) { setError("Voice input isn't supported in this browser. Try Chrome or Edge."); return; }
    const recognition = new Speech();
    recognition.lang = navigator.language || "en-US"; recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) transcript += event.results[i][0].transcript;
      setInput(transcript);
    };
    recognition.onerror = () => setError("Couldn't hear that clearly. Please try again.");
    recognition.start();
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) { setError("Voice playback isn't supported in this browser."); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeaking(true); utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  async function copy(text: string, id: string) {
    try { await navigator.clipboard.writeText(text); setCopied(id); window.setTimeout(() => setCopied(""), 1500); } catch { setError("Clipboard access was blocked by your browser."); }
  }

  function onSubmit(e: FormEvent) { e.preventDefault(); void send(); }

  return (
    <div className="agent-shell">
      <aside className={`agent-sidebar ${sidebar ? "is-open" : "is-closed"}`}>
        <a className="brand" href="/" aria-label="SparkAgent home"><span className="brand-mark"><Sparkles size={18} /></span><span>SparkAgent</span><span className="brand-v">V-II</span></a>
        <button className="new-chat" onClick={newChat}><Plus size={17} /> New chat <span>⌘ K</span></button>
        <div className="side-label">YOUR WORKSPACE</div>
        <button className="side-item active"><AudioLines size={17} /> AI assistant</button>
        <div className="sidebar-note"><div className="note-icon"><Bot size={17}/></div><strong>Ready when you are.</strong><p>No account needed to start. Your recent conversation stays in this browser.</p></div>
        <div className="sidebar-bottom"><span className="status-dot" /> AI service <span className="status-text">available when configured</span></div>
      </aside>

      <main className="agent-main">
        <header className="topbar">
          <button className="icon-button menu-toggle" aria-label="Toggle sidebar" onClick={() => setSidebar(!sidebar)}>{sidebar ? <X size={18}/> : <Menu size={18}/>}</button>
          <div className="crumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>AI assistant</strong></div>
          <div className="top-actions"><span className="private-pill"><span/> No sign-in</span><button className="icon-button" title="New chat" onClick={newChat}><Plus size={18}/></button></div>
        </header>

        <section className={`conversation ${messages.length ? "has-messages" : "is-empty"}`} ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome-kicker"><span className="welcome-spark"><Sparkles size={14}/></span> YOUR IDEAS, IN MOTION</div>
              <h1>What can we <em>make</em><br className="desktop-break"/> happen today?</h1>
              <p className="welcome-copy">Think it through. Build it out. Get unstuck.<br/>Your AI workspace starts with a single message.</p>
              <div className="starter-grid">
                {STARTERS.map((item) => <button className="starter-card" key={item.title} onClick={() => { setInput(item.prompt); inputRef.current?.focus(); }}><span className="starter-icon">{item.icon}</span><strong>{item.title}</strong><span className="starter-arrow">↗</span></button>)}
              </div>
              <div className="welcome-foot"><span className="tiny-shield">◈</span> No account required <span className="foot-dot">·</span> Your chat stays in this browser</div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((m) => <article className={`message ${m.role}`} key={m.id}>
                <div className={`message-avatar ${m.role}`}>{m.role === "assistant" ? <Sparkles size={16}/> : "Y"}</div>
                <div className="message-body"><div className="message-name">{m.role === "assistant" ? "SparkAgent" : "You"}</div>
                  {m.content ? <div className="message-text">{m.content}</div> : <div className="typing"><i/><i/><i/><span>Thinking</span></div>}
                  {m.role === "assistant" && m.content && <div className="message-tools"><button onClick={() => void copy(m.content, m.id)}>{copied === m.id ? <Check size={14}/> : <Copy size={14}/>} {copied === m.id ? "Copied" : "Copy"}</button><button onClick={() => speak(m.content)}><Volume2 size={14}/> Read aloud</button></div>}
                </div>
              </article>)}
              {error && <div className="inline-error">{error} <button onClick={() => void send(messages.filter(m=>m.role==="user").at(-1)?.content || "")}><RotateCcw size={13}/> Retry</button></div>}
            </div>
          )}
        </section>

        {error && messages.length === 0 && <div className="error-banner">{error}</div>}
        <div className="composer-wrap">
          <form className="composer" onSubmit={onSubmit}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask anything, or tell me what you want to build…" rows={1} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} aria-label="Message SparkAgent" />
            <div className="composer-bottom"><span className="composer-hint">↵ send <span>·</span> shift + ↵ new line</span><div className="composer-actions"><button type="button" className="icon-button voice-button" title="Speak your prompt" onClick={listen}><Mic size={17}/></button>{busy ? <button type="button" className="send-button stop-button" title="Stop generating" onClick={() => abortRef.current?.abort()}><Square size={14} fill="currentColor"/></button> : <button type="submit" className="send-button" disabled={!input.trim()} aria-label="Send message"><ArrowUp size={19}/></button>}</div></div>
          </form>
          <p className="disclaimer">SparkAgent can make mistakes. Check important details before acting.</p>
        </div>
      </main>
    </div>
  );
}
