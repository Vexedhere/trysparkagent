# SparkAgent — try.sparkagent.in.net

The public landing + authentication website for SparkAgent. This site's
only job is to introduce SparkAgent and authenticate users — after signing
in, users are sent to the app at **https://agent.sparkagent.in.net**.

There is no dashboard, no chat UI, and no "you're all set" page here.

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Supabase Auth (`@supabase/supabase-js` + `@supabase/ssr`, cookie-based sessions)
- Deployed on Netlify (`main` branch auto-deploys)

## Local setup

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your Supabase project's URL + anon key
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Variable | Where it's used | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server | The anon/publishable key only. Never set a service-role key here. |

Set both in **Netlify → Site settings → Environment variables** for
production. `.env.local` is git-ignored and must never be committed.

## Auth flow

- **Email/password sign in** → Supabase → redirect to `https://agent.sparkagent.in.net`.
- **Email/password sign up** → confirmation email → `/auth/callback` → redirect to the SparkAgent app.
- **Google / GitHub** → OAuth → `/auth/callback` → redirect to the SparkAgent app.

The callback redirect destination is hardcoded so it cannot be used as an open redirect.

## Project structure

```
app/
  page.tsx
  layout.tsx
  globals.css
  auth/callback/route.ts
components/
  Header.tsx, Hero.tsx, BrowserMockup.tsx, Features.tsx,
  AuthCard.tsx, Footer.tsx, icons.tsx
lib/supabase/
  client.ts
  server.ts
  middleware.ts
middleware.ts
supabase/schema.sql
```

## Deployment

Connect the `main` branch of `github.com/Vexedhere/trysparkagent` to Netlify,
set the two public Supabase environment variables, and deploy.
