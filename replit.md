# EverydayAI Frontend

## Project Overview
No-code AI agent platform frontend. Agency owners create AI chatbots, upload knowledge docs, and deploy widgets to client websites.

## Tech Stack
- **Framework**: React 18 + Vite 5
- **Language**: TypeScript
- **HTTP Client**: Axios + native fetch
- **Package Manager**: npm
- **Payments**: Paystack (redirect/subscription flow — no inline JS)

## Architecture
- Single-page React application
- Connects to a remote FastAPI backend on Railway: `https://everydayai-backend-production.up.railway.app`
- Authentication via JWT tokens stored in localStorage
- All CSS is a single template literal constant in `src/App.tsx` injected via useEffect

## Key Files
- `src/App.tsx` — Everything: CSS, all page components, auth, routing (~2515 lines)
- `vite.config.ts` — Port 5000, host 0.0.0.0

## Pricing Plans (PLANS constant)
| Plan    | Price  | Agents   | Paystack (kobo) |
|---------|--------|----------|-----------------|
| free    | $0     | 1        | 0               |
| starter | $9/mo  | 5        | 1,440,000       |
| pro     | $22/mo | 12       | 3,520,000       |
| agency  | $75/mo | Unlimited| 12,000,000      |

## Plan Limits (PLAN_LIMITS constant)
```js
{ free: 1, starter: 5, pro: 12, agency: Infinity }
```

## Auth & Routing Flow
1. **Boot loader** — animated terminal sequence (~2.5s)
2. **Not logged in** → `LandingPage` (marketing + pricing) → click any CTA → `AuthPage` modal overlay
3. **Logged in** → full app with sidebar (dashboard/agents/studio/deploy/settings)

## Paystack Billing Flow (Redirect Method)
1. User clicks upgrade in `UpgradeModal` or Settings page
2. Frontend calls `POST /billing/initialize` with `{ plan, email, callback_url }`
3. Backend creates Paystack transaction/subscription, returns `{ authorization_url, reference }`
4. Frontend redirects user to `authorization_url` (Paystack hosted page)
5. After payment, Paystack redirects to `callback_url` (the app URL + `?plan=X&reference=Y&trxref=Y`)
6. App detects `?reference=` on load → shows `PaymentCallback` overlay
7. `PaymentCallback` calls `POST /auth/verify-payment` with `{ reference, plan }` to verify + update plan
8. On success, plan badge updates and user sees confirmation

### Backend endpoints needed for billing (in `everydayai-backend`):
- `POST /billing/initialize` — Create Paystack transaction. Body: `{ plan, email, callback_url }`. Returns: `{ authorization_url, reference }`
- `POST /billing/webhook` — Handle Paystack webhook events: `charge.success`, `subscription.disable`, `invoice.payment_failed`. Updates user plan in DB accordingly.
- Existing `POST /auth/verify-payment` — Already handles verification. Should return `{ plan }` in response.

## Features Implemented
1. Boot loader with terminal animation
2. Landing page with hero + 4 pricing cards (Free/Starter/Pro/Agency)
3. Auth modal overlay on landing page (close button included)
4. Plan badge in topbar (clickable to open upgrade modal)
5. `handleNewAgent` — checks plan limit before allowing agent creation
6. `UpgradeModal` — shows plans above current, triggers Paystack redirect flow
7. `PaymentCallback` — handles Paystack redirect return, verifies payment, updates plan
8. `/auth/me` fetched on login to hydrate user plan (graceful fallback = free)
9. Billing & Plan section in Settings page — shows current plan, limits, and upgrade CTA
10. Light/dark theme toggle
11. Mobile responsive (hamburger menu, breakpoints at 480/768/900/1024px)
11. Knowledge base saves to backend via `POST /agents/{id}/files` (debounced, 1.2s)
12. Knowledge base loads from backend on agent select (looks for `knowledge_base.txt`)
13. Deploy page with destination tabs (Socials/Custom Code/Website)
14. Deploy page step-by-step how-it-works tracker
15. Forgot password flow on auth page (calls `POST /auth/forgot-password`)
16. Studio chat wired to real `POST /agents/{id}/chat` backend endpoint
17. Widget embed snippet points to backend (`/widget.js`) instead of CDN
18. Email verification screen shown after signup — prompts user to check inbox before logging in; includes resend button (`POST /auth/resend-verification`)

## Backend Endpoints (Remote — Railway)
- `POST /auth/login` — Login
- `POST /auth/signup` — Register
- `POST /auth/forgot-password` — Send password reset email `{ email }`
- `GET /auth/me` — Get user info + plan (returns `{ plan: "free"|"starter"|"pro"|"agency" }`)
- `POST /auth/verify-payment` — Verify Paystack payment, update plan `{ reference, plan }`
- `GET /agents/` — List agents
- `POST /agents/` — Create agent
- `PUT /agents/{id}` — Update agent (system_prompt, model)
- `POST /agents/{id}/publish` — Publish agent, returns `{ widget_token }`
- `POST /agents/{id}/chat` — Send message, returns `{ response }` (or message/reply/content)
- `GET /agents/{id}/files` — List uploaded files (array or `{ files: [] }`)
- `POST /agents/{id}/files` — Upload file (multipart/form-data, field: `file`)
- `PUT /auth/api-key` — Save user's OpenAI API key `{ api_key }`

## Environment Variables Needed
- `VITE_PAYSTACK_PUBLIC_KEY` — Paystack public key (pk_live_... or pk_test_...) — set in Replit Secrets

## GitHub
- Repo: `https://github.com/ukemedev/everydayai-frontend`
- Push: `git push "https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/ukemedev/everydayai-frontend.git" HEAD:main`
- Vercel auto-deploys from GitHub main branch

## Notes
- Token stored in `localStorage.getItem("token")`
- User email in `localStorage.getItem("userEmail")`
- Theme in `localStorage.getItem("theme")`
- The 401 interceptor clears token and returns user to landing page
