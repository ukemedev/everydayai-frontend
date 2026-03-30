# EverydayAI Frontend

## Project Overview
No-code AI agent platform frontend. Agency owners create AI chatbots, upload knowledge docs, and deploy widgets to client websites.

## Tech Stack
- **Framework**: React 18 + Vite 5
- **Language**: TypeScript
- **HTTP Client**: Axios + native fetch
- **Package Manager**: npm
- **Payments**: Paystack (inline JS loaded dynamically)

## Architecture
- Single-page React application
- Connects to a remote FastAPI backend on Railway: `https://everydayai-backend-production.up.railway.app`
- Authentication via JWT tokens stored in localStorage
- All CSS is a single template literal constant in `src/App.tsx` injected via useEffect

## Key Files
- `src/App.tsx` — Everything: CSS, all page components, auth, routing (~2100 lines)
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

## Features Implemented
1. Boot loader with terminal animation
2. Landing page with hero + 4 pricing cards (Free/Starter/Pro/Agency)
3. Auth modal overlay on landing page (close button included)
4. Plan badge in topbar (clickable to open upgrade modal)
5. `handleNewAgent` — checks plan limit before allowing agent creation
6. `UpgradeModal` — shows plans above current, triggers Paystack payment
7. Paystack script loaded dynamically on app start
8. `/auth/me` fetched on login to hydrate user plan (graceful fallback = free)
9. Light/dark theme toggle
10. Mobile responsive (hamburger menu, breakpoints at 480/768/900/1024px)
11. Knowledge base auto-save indicator (debounced)
12. Deploy page with destination tabs (Socials/Custom Code/Website)
13. Deploy page step-by-step how-it-works tracker

## Backend Endpoints (Remote — Railway)
- `POST /auth/login` — Login
- `POST /auth/signup` — Register
- `GET /auth/me` — Get user info + plan (returns `{ plan: "free"|"starter"|"pro"|"agency" }`)
- `POST /auth/verify-payment` — Verify Paystack payment, update plan `{ reference, plan }`
- `GET /agents/` — List agents
- `POST /agents/` — Create agent
- `PUT /agents/{id}` — Update agent
- `POST /agents/{id}/publish` — Publish agent, returns `{ widget_token }`

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
