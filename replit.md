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

## Fixes Applied
1. **Login**: Added `loading` state — button disables, inputs lock, shows "// authenticating..." during request. Prevents double-submit and race conditions. Error only shows after full API response.
2. **Settings**: Fixed runtime crash — `setErr` was called but only `setSaveErr` exists. Now correctly resets error state before saving.
3. **Studio**: Added `loadingAgents` state so the page shows "// loading agents..." while the API fetch is in flight instead of instantly showing the "no agents" empty screen. Also added a proper error state for failed fetches.
4. **General**: Added `import React` default import so `React.useState` / `React.useRef` inside StudioPage resolves correctly.
