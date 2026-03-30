EverydayAI — Project Context

## What it is
No-code AI agent platform. Agency owners create AI chatbots, 
upload knowledge docs, deploy widget to client websites.

## Live URLs
- Frontend: https://everydayai-frontend-4v2t.vercel.app
- Backend: https://everydayai-backend-production.up.railway.app
- Landing: https://everydayai-landing.vercel.app
- API Docs: https://everydayai-backend-production.up.railway.app/docs

## GitHub Repos
- Backend: github.com/ukemedev/everydayai-backend
- Frontend: github.com/ukemedev/everydayai-frontend
- Landing: github.com/ukemedev/everydayai-landing

## Tech Stack
- Backend: Python FastAPI on Railway
- Database: PostgreSQL on Neon
- Frontend: React + Vite on Vercel
- AI: OpenAI Assistants API
- Widget: vanilla JS served from backend

## Current Bugs to Fix
1. Studio page blank on load — StudioPage component broken
2. Login shows "Login failed" flash before succeeding
3. File upload in studio not connected to real backend
4. Deploy page shows "No agents yet" even with agents

## Frontend file location
artifacts/web-app/src/App.tsx in Replit

## Backend endpoints
POST /auth/register
POST /auth/login  
PUT  /auth/api-key
GET /auth/me                   — returns { plan: "free"|"starter"|"pro"|"agency" }
POST /auth/verify-payment      — body: { reference, plan }, returns { plan }
GET/POST/PUT/DELETE /agents/
POST /agents/{id}/publish
POST/GET/DELETE /agents/{id}/files
POST /agents/{id}/chat
POST /widget/{token}/chat

## Billing endpoints (needed for subscription flow)
POST /billing/initialize       — body: { plan, email, callback_url }, returns { authorization_url, reference }
POST /billing/webhook          — Paystack webhook receiver (charge.success, subscription.disable, invoice.payment_failed)
