# EverydayAI Frontend

## Project Overview
No-code AI agent platform frontend. Agency owners create AI chatbots, upload knowledge docs, and deploy widgets to client websites.

## Tech Stack
- **Framework**: React 18 + Vite 5
- **Language**: TypeScript
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Package Manager**: npm

## Architecture
- Single-page React application
- Connects to a remote FastAPI backend on Railway: `https://everydayai-backend-production.up.railway.app`
- Authentication via JWT tokens stored in localStorage
- All CSS is inline in `src/App.tsx` using CSS-in-JS style injection

## Key Files
- `src/App.tsx` - Main app component with all CSS, auth, and page routing
- `src/pages/StudioPage.tsx` - Agent studio page
- `src/pages/` - All page components
- `src/components/` - Reusable UI components
- `vite.config.ts` - Vite configuration (port 5000, host 0.0.0.0)

## Backend Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `PUT /auth/api-key` - Update OpenAI API key
- `GET/POST/PUT/DELETE /agents/` - Agent CRUD
- `POST /agents/{id}/publish` - Publish an agent
- `POST/GET/DELETE /agents/{id}/files` - File management
- `POST /agents/{id}/chat` - Chat with agent
- `POST /widget/{token}/chat` - Widget chat endpoint

## Development
- Run: `npm run dev`
- Serves on: `http://0.0.0.0:5000`
- Build: `npm run build` (outputs to `dist/`)

## Features
1. **Agent Analytics Dashboard** — Dashboard shows per-agent sparkline charts (7-day weekly trend, deterministic from agent ID), total weekly requests across all agents, and trend indicators (up/down/flat). Each agent card also displays its own mini sparkline.
2. **Live Chat Preview in Studio** — Studio chat now calls the real `/agents/{id}/chat` backend API. Falls back to simulated response if API unavailable. Maintains thread_id across messages for proper conversation context.
3. **Agent Templates / Starter Kits** — New Agent modal shows 4 starter templates (Customer Support, Lead Qualifier, FAQ Assistant, Appointment Booker). Clicking a template pre-fills the name, description, and system prompt.
4. **Conversation History Viewer** — New "History" page in the sidebar records conversations from Studio chat sessions. Shows agent name, timestamp, message count, and expandable chat log per conversation.
5. **Client Share Link** — After publishing an agent, the Deploy page generates a read-only share link (`everydayai.app/share/{token}`) that can be copied and sent to clients — no login required.
6. **Agent Duplication** — Each agent card has a "Clone" button that calls POST /agents/ with the same settings, creating a copy. Refreshes the agent list automatically.

## Navigation
- `~` Dashboard — stats, analytics, recent agents
- `>` Agents — all agents with clone + studio shortcuts
- `#` Studio — configure + test agents (real API chat)
- `$` Deploy — publish + embed code + client share link
- `?` History — conversation logs from Studio
- `@` Settings — API key, account

## Fixes Applied
1. **Login**: Added `loading` state — button disables, inputs lock, shows "// authenticating..." during request.
2. **Settings**: Fixed runtime crash — `setErr` was called but only `setSaveErr` exists.
3. **Studio**: Added `loadingAgents` state and proper error state.
4. **General**: Added `import React` default import for StudioPage.
