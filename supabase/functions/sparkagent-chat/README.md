# SparkAgent chat Edge Function

This function is the server-side chat endpoint for the static SparkAgent workspace.

## Required production secret

Add `OPENROUTER_API_KEY` under Supabase Dashboard → Edge Functions → Secrets. Never put it in `index.html`, a `NEXT_PUBLIC_*` variable, or a committed file.

Optional model variables:
- `OPENROUTER_GEMINI_MODEL` — default `google/gemini-2.5-flash`
- `OPENROUTER_OPENAI_MODEL` — default `openai/gpt-4o-mini`
- `OPENROUTER_CLAUDE_MODEL` — default `anthropic/claude-sonnet-4`
- `OPENROUTER_SITE_URL` — default `https://agent.sparkagent.in.net`
- `OPENROUTER_APP_NAME` — default `SparkAgent`

## Deploy

Deploy `sparkagent-chat` to the existing Supabase project after it is active. The function uses streaming responses and only permits the free modes until subscription entitlements are connected. It intentionally rejects paid-mode API requests on the server; hiding a menu item in the browser alone is not access control.

The frontend is configured to call:
`https://cvzvpgwovqkplntfztsk.supabase.co/functions/v1/sparkagent-chat`

If the project is paused/inactive, restore it first. Verify the deployed function and its secrets before expecting chat requests to work.
