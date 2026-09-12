"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon, GitHubIcon } from "./icons";

type Tab = "signin" | "signup";

const APP_URL = "https://agent.sparkagent.in.net";
const CALLBACK_URL = "https://try.sparkagent.in.net/auth/callback";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest<HTMLElement>("[data-auth-intent]");
      const intent = target?.dataset.authIntent;
      if (intent === "signin" || intent === "signup") setTab(intent);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault(); setSignInError(null);
    if (!EMAIL_RE.test(signInEmail)) { setSignInError("Enter a valid email address."); return; }
    if (signInPassword.length === 0) { setSignInError("Enter your password."); return; }
    setSignInLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: signInEmail, password: signInPassword });
      if (error) { setSignInError(friendlyAuthError(error.message)); setSignInLoading(false); return; }
      window.location.href = APP_URL;
    } catch { setSignInError("Couldn't reach the server. Check your connection and try again."); setSignInLoading(false); }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault(); setSignUpError(null);
    if (!EMAIL_RE.test(signUpEmail)) { setSignUpError("Enter a valid email address."); return; }
    if (signUpPassword.length < 8) { setSignUpError("Password must be at least 8 characters."); return; }
    if (signUpPassword !== signUpConfirm) { setSignUpError("Passwords don't match."); return; }
    setSignUpLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({ email: signUpEmail, password: signUpPassword, options: { emailRedirectTo: CALLBACK_URL } });
      if (error) { setSignUpError(friendlyAuthError(error.message)); setSignUpLoading(false); return; }
      setSignUpSuccess(true);
    } catch { setSignUpError("Couldn't reach the server. Check your connection and try again."); }
    finally { setSignUpLoading(false); }
  }

  async function handleOAuth(provider: "google" | "github") {
    setOauthLoading(provider);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: CALLBACK_URL } });
      if (error) { setOauthLoading(null); if (tab === "signin") setSignInError(friendlyAuthError(error.message)); else setSignUpError(friendlyAuthError(error.message)); }
    } catch { setOauthLoading(null); }
  }

  const busy = signInLoading || signUpLoading || oauthLoading !== null;

  return (
    <section id="auth" className="relative px-6 pb-28 pt-6 scroll-mt-24">
      <div className="mx-auto max-w-[440px]">
        <div className="glass-surface animate-fade-up rounded-2xl p-7 shadow-card sm:p-8">
          <div className="mb-6 flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button type="button" onClick={() => setTab("signin")} className={`flex-1 rounded-full py-2 font-body text-[14px] font-medium transition-colors ${tab === "signin" ? "bg-spark-gradient text-white" : "text-ink-muted hover:text-ink"}`} aria-pressed={tab === "signin"}>Sign in</button>
            <button type="button" onClick={() => setTab("signup")} className={`flex-1 rounded-full py-2 font-body text-[14px] font-medium transition-colors ${tab === "signup" ? "bg-spark-gradient text-white" : "text-ink-muted hover:text-ink"}`} aria-pressed={tab === "signup"}>Create account</button>
          </div>
          <h2 className="mb-1 font-heading text-[20px] font-semibold text-ink">{tab === "signin" ? "Welcome back" : "Create your account"}</h2>
          <p className="mb-6 font-body text-[13.5px] text-ink-muted">{tab === "signin" ? "Sign in to continue to your SparkAgent workspace." : "Start your first SparkAgent session in minutes."}</p>
          <div className="mb-5 flex flex-col gap-3">
            <button type="button" onClick={() => handleOAuth("google")} disabled={busy} className="flex items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] py-2.5 font-body text-[14px] font-medium text-ink transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50">{oauthLoading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon className="h-4 w-4" />}Continue with Google</button>
            <button type="button" onClick={() => handleOAuth("github")} disabled={busy} className="flex items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] py-2.5 font-body text-[14px] font-medium text-ink transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50">{oauthLoading === "github" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GitHubIcon className="h-4 w-4" />}Continue with GitHub</button>
          </div>
          <div className="mb-5 flex items-center gap-3"><span className="h-px flex-1 bg-white/10" /><span className="font-body text-[12px] text-ink-faint">or</span><span className="h-px flex-1 bg-white/10" /></div>
          {tab === "signin" ? (
            <form onSubmit={handleSignIn} noValidate className="flex flex-col gap-4">
              <div><label htmlFor="signin-email" className="mb-1.5 block font-body text-[13px] text-ink-muted">Email</label><input id="signin-email" type="email" autoComplete="email" value={signInEmail} onChange={(e) => setSignInEmail(e.target.value)} disabled={signInLoading} placeholder="you@company.com" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 font-body text-[14.5px] text-ink outline-none transition-colors focus:border-spark-indigo/60 disabled:opacity-50" /></div>
              <div><div className="mb-1.5 flex items-center justify-between"><label htmlFor="signin-password" className="block font-body text-[13px] text-ink-muted">Password</label></div><div className="relative"><input id="signin-password" type={showSignInPassword ? "text" : "password"} autoComplete="current-password" value={signInPassword} onChange={(e) => setSignInPassword(e.target.value)} disabled={signInLoading} placeholder="••••••••" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 pr-11 font-body text-[14.5px] text-ink outline-none transition-colors focus:border-spark-indigo/60 disabled:opacity-50" /><button type="button" onClick={() => setShowSignInPassword((v) => !v)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-faint hover:text-ink-muted" aria-label={showSignInPassword ? "Hide password" : "Show password"} tabIndex={-1}>{showSignInPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
              {signInError && <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" /><p className="font-body text-[13px] leading-snug text-red-300">{signInError}</p></div>}
              <button type="submit" disabled={signInLoading} className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-spark-gradient py-2.5 font-body text-[14.5px] font-semibold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100">{signInLoading && <Loader2 className="h-4 w-4 animate-spin" />}{signInLoading ? "Signing in…" : "Sign in"}</button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-4">
              {signUpSuccess ? <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-3"><CheckCircle2 className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-emerald-400" /><div><p className="font-body text-[13.5px] font-medium text-ink">Check your email</p><p className="mt-0.5 font-body text-[13px] leading-relaxed text-ink-muted">We sent a confirmation link to <span className="text-ink">{signUpEmail}</span>. Click it to verify your account and continue to SparkAgent.</p></div></div> : <>
                <div><label htmlFor="signup-email" className="mb-1.5 block font-body text-[13px] text-ink-muted">Email</label><input id="signup-email" type="email" autoComplete="email" value={signUpEmail} onChange={(e) => setSignUpEmail(e.target.value)} disabled={signUpLoading} placeholder="you@company.com" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 font-body text-[14.5px] text-ink outline-none transition-colors focus:border-spark-indigo/60 disabled:opacity-50" /></div>
                <div><label htmlFor="signup-password" className="mb-1.5 block font-body text-[13px] text-ink-muted">Password</label><div className="relative"><input id="signup-password" type={showSignUpPassword ? "text" : "password"} autoComplete="new-password" value={signUpPassword} onChange={(e) => setSignUpPassword(e.target.value)} disabled={signUpLoading} placeholder="At least 8 characters" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 pr-11 font-body text-[14.5px] text-ink outline-none transition-colors focus:border-spark-indigo/60 disabled:opacity-50" /><button type="button" onClick={() => setShowSignUpPassword((v) => !v)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-faint hover:text-ink-muted" aria-label={showSignUpPassword ? "Hide password" : "Show password"} tabIndex={-1}>{showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                <div><label htmlFor="signup-confirm" className="mb-1.5 block font-body text-[13px] text-ink-muted">Confirm password</label><div className="relative"><input id="signup-confirm" type={showSignUpConfirm ? "text" : "password"} autoComplete="new-password" value={signUpConfirm} onChange={(e) => setSignUpConfirm(e.target.value)} disabled={signUpLoading} placeholder="Re-enter your password" className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 pr-11 font-body text-[14.5px] text-ink outline-none transition-colors focus:border-spark-indigo/60 disabled:opacity-50" /><button type="button" onClick={() => setShowSignUpConfirm((v) => !v)} className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-ink-faint hover:text-ink-muted" aria-label={showSignUpConfirm ? "Hide password" : "Show password"} tabIndex={-1}>{showSignUpConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                {signUpError && <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.06] px-3 py-2.5"><AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400" /><p className="font-body text-[13px] leading-snug text-red-300">{signUpError}</p></div>}
                <button type="submit" disabled={signUpLoading} className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-spark-gradient py-2.5 font-body text-[14.5px] font-semibold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100">{signUpLoading && <Loader2 className="h-4 w-4 animate-spin" />}{signUpLoading ? "Creating account…" : "Create account"}</button>
              </>}
            </form>
          )}
          <p className="mt-6 text-center font-body text-[12.5px] leading-relaxed text-ink-faint">By continuing, you agree to SparkAgent&rsquo;s Terms of Service and Privacy Policy.</p>
        </div>
      </div>
    </section>
  );
}
