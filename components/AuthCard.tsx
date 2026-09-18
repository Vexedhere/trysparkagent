"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon, GitHubIcon } from "./icons";

type Tab = "signin" | "signup";
const DEFAULT_HOME_URL = "https://try.sparkagent.in.net/home";
const CALLBACK_URL = "https://try.sparkagent.in.net/auth/callback";
const ALLOWED_HOSTS = ["try.sparkagent.in.net", "agent.sparkagent.in.net", "tiers.sparkagent.in.net"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getNextUrl(): string {
  if (typeof window === "undefined") return DEFAULT_HOME_URL;
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next) return DEFAULT_HOME_URL;
  try {
    const url = new URL(next);
    if (url.protocol === "https:" && ALLOWED_HOSTS.includes(url.hostname)) return url.toString();
  } catch {}
  return DEFAULT_HOME_URL;
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password. Please try again.";
  if (m.includes("email not confirmed")) return "Please verify your email before signing in — check your inbox for the confirmation link.";
  if (m.includes("user already registered") || m.includes("already registered")) return "An account with this email already exists. Try signing in instead.";
  if (m.includes("password should be at least")) return "Your password is too short. Use at least 8 characters.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a moment and try again.";
  return "Something went wrong. Please try again in a moment.";
}

export function AuthCard() {
  const [tab, setTab] = useState<Tab>("signin");
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirm, setSignUpConfirm] = useState("");
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirm, setShowSignUpConfirm] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const next = getNextUrl();

    // If the visitor is already authenticated and arrived with a destination,
    // don't make them sign in again. Continue straight to the requested page.
    if (next !== DEFAULT_HOME_URL) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) window.location.replace(next);
      });
    }

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-auth-intent]");
      const intent = target?.dataset.authIntent;
      if (intent === "signin" || intent === "signup") setTab(intent);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setSignInError(null);
    if (!EMAIL_RE.test(signInEmail)) { setSignInError("Enter a valid email address."); return; }
    if (!signInPassword.length) { setSignInError("Enter your password."); return; }
    setSignInLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email: signInEmail, password: signInPassword });
      if (error) { setSignInError(friendlyAuthError(error.message)); setSignInLoading(false); return; }
      redirectWithSession(getNextUrl(), data.session);
    } catch { setSignInError("Couldn't reach the server. Check your connection and try again."); setSignInLoading(false); }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setSignUpError(null);
    if (!EMAIL_RE.test(signUpEmail)) { setSignUpError("Enter a valid email address."); return; }
    if (signUpPassword.length < 8) { setSignUpError("Password must be at least 8 characters."); return; }
    if (signUpPassword !== signUpConfirm) { setSignUpError("Passwords don't match."); return; }
    setSignUpLoading(true);
    try {
      const supabase = createClient();
      const emailRedirectTo = `${CALLBACK_URL}?next=${encodeURIComponent(getNextUrl())}`;
      const { error } = await supabase.auth.signUp({ email: signUpEmail, password: signUpPassword, options: { emailRedirectTo } });
      if (error) { setSignUpError(friendlyAuthError(error.message)); setSignUpLoading(false); return; }
      setSignUpSuccess(true);
    } catch { setSignUpError("Couldn't reach the server. Check your connection and try again."); }
    finally { setSignUpLoading(false); }
  }

  function redirectWithSession(destination: string, session: { access_token: string; refresh_token: string } | null | undefined) {
    if (!session) {
      window.location.assign(destination);
      return;
    }
    const target = new URL(destination);
    target.hash = new URLSearchParams({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }).toString();
    window.location.assign(target.toString());
  }

async function handleOAuth(provider: "google" | "github") {
    setOauthLoading(provider);
    try {
      const supabase = createClient();
      const redirectTo = `${CALLBACK_URL}?next=${encodeURIComponent(getNextUrl())}`;
      const options = provider === "google"
        ? { redirectTo, scopes: "openid email profile" }
        : { redirectTo, scopes: "read:user user:email" };
      const { error } = await supabase.auth.signInWithOAuth({ provider, options });
      if (error) {
        setOauthLoading(null);
        if (tab === "signin") setSignInError(friendlyAuthError(error.message));
        else setSignUpError(friendlyAuthError(error.message));
      }
    } catch { setOauthLoading(null); }
  }

  const busy = signInLoading || signUpLoading || oauthLoading !== null;

  return <section id="auth" className="relative px-6 pb-28 pt-6 scroll-mt-24"><div className="mx-auto max-w-[440px]"><div className="glass-surface animate-fade-up rounded-2xl p-7 shadow-card sm:p-8"><div className="mb-6 flex rounded-full border border-white/10 bg-white/[0.03] p-1"><button type="button" onClick={() => setTab("signin")} className={`flex-1 rounded-full py-2 font-body text-[14px] font-medium transition-colors ${tab === "signin" ? "bg-spark-gradient text-white" : "text-ink-muted hover:text-ink"}`}>Sign in</button><button type="button" onClick={() => setTab("signup")} className={`flex-1 rounded-full py-2 font-body text-[14px] font-medium transition-colors ${tab === "signup" ? "bg-spark-gradient text-white" : "text-ink-muted hover:text-ink"}`}>Create account</button></div><h2 className="mb-1 font-heading text-[20px] font-semibold text-ink">{tab === "signin" ? "Welcome back" : "Create your account"}</h2><p className="mb-6 font-body text-[13.5px] text-ink-muted">{tab === "signin" ? "Sign in to continue to your SparkAgent workspace." : "Start your first SparkAgent session in minutes."}</p><div className="mb-5 flex flex-col gap-3"><button type="button" onClick={() => handleOAuth("google")} disabled={busy} className="flex items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] py-2.5 font-body text-[14px] font-medium text-ink hover:bg-white/[0.07] disabled:opacity-50">{oauthLoading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />}Continue with Google</button><button type="button" onClick={() => handleOAuth("github")} disabled={busy} className="flex items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] py-2.5 font-body text-[14px] font-medium text-ink hover:bg-white/[0.07] disabled:opacity-50">{oauthLoading === "github" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitHubIcon className="h-4 w-4" />}Continue with GitHub</button></div><div className="mb-5 flex items-center gap-3"><span className="h-px flex-1 bg-white/10"/><span className="font-body text-[12px] text-ink-faint">or</span><span className="h-px flex-1 bg-white/10"/></div>{tab === "signin" ? <form onSubmit={handleSignIn} className="flex flex-col gap-4"><div><label htmlFor="signin-email" className="mb-1.5 block font-body text-[13px] text-ink-muted">Email</label><input id="signin-email" type="email" autoComplete="email" value={signInEmail} onChange={e => setSignInEmail(e.target.value)} disabled={signInLoading} placeholder="you@company.com" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-[14.5px] text-ink outline-none"/></div><div><label htmlFor="signin-password" className="mb-1.5 block font-body text-[13px] text-ink-muted">Password</label><div className="relative"><input id="signin-password" type={showSignInPassword ? "text" : "password"} autoComplete="current-password" value={signInPassword} onChange={e => setSignInPassword(e.target.value)} disabled={signInLoading} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 pr-11 text-[14.5px] text-ink outline-none"/><button type="button" onClick={() => setShowSignInPassword(v => !v)} className="absolute inset-y-0 right-0 w-11 text-ink-faint">{showSignInPassword ? <EyeOff className="mx-auto h-4 w-4"/> : <Eye className="mx-auto h-4 w-4"/>}</button></div></div>{signInError && <div className="rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5 text-[13px] text-red-300"><AlertCircle className="mr-2 inline h-4 w-4"/>{signInError}</div>}<button type="submit" disabled={signInLoading} className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-spark-gradient py-2.5 text-[14.5px] font-semibold text-white disabled:opacity-60">{signInLoading && <Loader2 className="h-4 w-4 animate-spin"/>}{signInLoading ? "Signing in…" : "Sign in"}</button></form> : <form onSubmit={handleSignUp} className="flex flex-col gap-4">{signUpSuccess ? <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-3 text-sm text-ink"><CheckCircle2 className="mr-2 inline h-4 w-4 text-emerald-400"/>Check your email to verify your account and continue.</div> : <><input aria-label="Email" type="email" autoComplete="email" value={signUpEmail} onChange={e => setSignUpEmail(e.target.value)} placeholder="you@company.com" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-ink"/><input aria-label="Password" type={showSignUpPassword ? "text" : "password"} value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} placeholder="At least 8 characters" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-ink"/><input aria-label="Confirm password" type={showSignUpConfirm ? "text" : "password"} value={signUpConfirm} onChange={e => setSignUpConfirm(e.target.value)} placeholder="Re-enter your password" className="w-full rounded-xl border border-white/10 bg-white/[0.03] text-ink"/>{signUpError && <div className="text-[13px] text-red-300">{signUpError}</div>}<button type="submit" disabled={signUpLoading} className="rounded-xl bg-spark-gradient py-2.5 text-[14.5px] font-semibold text-white">{signUpLoading ? "Creating account…" : "Create account"}</button></>}</form>}<p className="mt-6 text-center text-[12.5px] text-ink-faint">By continuing, you agree to SparkAgent&rsquo;s Terms of Service and Privacy Policy.</p></div></div></section>;
}
