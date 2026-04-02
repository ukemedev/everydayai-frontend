import React, { useState, useEffect, useRef, useCallback, useContext, createContext } from "react";
import axios from "axios";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { crashed: boolean; msg: string }> {
  constructor(props: any) { super(props); this.state = { crashed: false, msg: "" }; }
  static getDerivedStateFromError(e: any) { return { crashed: true, msg: e?.message || "Unknown error" }; }
  componentDidCatch() {}
  render() {
    if (this.state.crashed) {
      return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0d0d0d", color: "#fff", fontFamily: "monospace", gap: 16, padding: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#ff5500" }}>[EverydayAI]</div>
          <div style={{ fontSize: 12, color: "#aaa" }}>// something went wrong. please refresh the page.</div>
          <div style={{ fontSize: 10, color: "#555", maxWidth: 400, textAlign: "center" }}>{this.state.msg}</div>
          <button onClick={() => window.location.reload()} style={{ marginTop: 8, padding: "8px 20px", background: "#ff5500", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ── SPINNER CONFIG ─────────────────────────────────────────────────
   MIN_SPINNER_MS: minimum time (ms) the spinner stays visible.
   Adjust based on typical backend response times:
     • Fast ops (local saves, copy):  400ms
     • Normal API calls:              800ms  ← default
     • Heavy ops (agent publish, AI): 1200ms
──────────────────────────────────────────────────────────────────── */
const MIN_SPINNER_MS = 800;

interface SpinnerCtx { run: <T>(fn: () => Promise<T>, minMs?: number) => Promise<T> }
const SpinnerContext = createContext<SpinnerCtx>({ run: fn => fn() });
const useSpinner = () => useContext(SpinnerContext);

function GlobalSpinner({ visible, fading }: { visible: boolean; fading: boolean }) {
  if (!visible) return null;
  return (
    <div className={`gs-overlay${fading ? " gs-fading" : ""}`} aria-live="polite" aria-label="Loading">
      <div className="gs-box">
        <div className="gs-ring" />
        <div className="gs-label">// processing...</div>
      </div>
    </div>
  );
}

function BtnSpinner() {
  return <span className="btn-spinner" aria-hidden="true" />;
}

function SpinnerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  const run = useCallback(async <T,>(fn: () => Promise<T>, minMs: number = MIN_SPINNER_MS): Promise<T> => {
    setFading(false);
    setVisible(true);
    const start = Date.now();
    try {
      const result = await fn();
      const wait = minMs - (Date.now() - start);
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      setFading(true);
      await new Promise(r => setTimeout(r, 300));
      setVisible(false);
      setFading(false);
      return result;
    } catch (err) {
      const wait = Math.min(minMs, 500) - (Date.now() - start);
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
      setFading(true);
      await new Promise(r => setTimeout(r, 300));
      setVisible(false);
      setFading(false);
      throw err;
    }
  }, []);

  return (
    <SpinnerContext.Provider value={{ run }}>
      {children}
      <GlobalSpinner visible={visible} fading={fading} />
    </SpinnerContext.Provider>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;0,700;1,300&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #000000;
    --black-950: #080808;
    --black-900: #111111;
    --black-800: #1a1a1a;
    --black-700: #242424;
    --black-600: #2e2e2e;
    --orange-500: #ff5500;
    --orange-400: #ff6a1a;
    --orange-300: #ff8c4a;
    --orange-glow: rgba(255,85,0,0.15);
    --orange-glow-strong: rgba(255,85,0,0.35);
    --green-term: #00ff88;
    --white: #ffffff;
    --gray-100: #e8e8e8;
    --gray-200: #c8c8c8;
    --gray-400: #888888;
    --gray-600: #555555;
    --red: #ff3333;
    --font-mono: 'JetBrains Mono', monospace;
    --font-sans: 'Space Grotesk', sans-serif;
    --radius: 4px;
    --radius-md: 8px;
    --border: 1px solid #222222;
    --transition: all 0.15s ease;
    /* semantic */
    --bg: var(--black);
    --surface-0: var(--black-950);
    --surface-1: var(--black-900);
    --surface-2: var(--black-800);
    --surface-3: var(--black-700);
    --text-primary: var(--gray-100);
    --text-secondary: var(--gray-400);
    --text-muted: var(--gray-600);
    --border-color: #222222;
    --topbar-bg: rgba(8,8,8,0.92);
  }

  [data-theme="light"] {
    --black: #f5f5f0;
    --black-950: #f0f0eb;
    --black-900: #e8e8e2;
    --black-800: #ddddd6;
    --black-700: #d0d0c8;
    --black-600: #c0c0b8;
    --orange-500: #d94400;
    --orange-400: #e05500;
    --orange-300: #e86600;
    --orange-glow: rgba(217,68,0,0.12);
    --orange-glow-strong: rgba(217,68,0,0.25);
    --green-term: #007a40;
    --white: #1a1a1a;
    --gray-100: #1a1a1a;
    --gray-200: #2e2e2e;
    --gray-400: #555555;
    --gray-600: #888888;
    --red: #cc2200;
    --border: 1px solid #ccccc4;
    --bg: #f5f5f0;
    --surface-0: #f0f0eb;
    --surface-1: #e8e8e2;
    --surface-2: #ddddd6;
    --surface-3: #d0d0c8;
    --text-primary: #1a1a1a;
    --text-secondary: #555555;
    --text-muted: #888888;
    --border-color: #ccccc4;
    --topbar-bg: rgba(240,240,235,0.95);
  }

  html { background: var(--bg); }
  body { font-family: var(--font-mono); background: var(--bg); color: var(--text-primary); min-height: 100vh; overflow-x: hidden; transition: background 0.2s ease, color 0.2s ease; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--surface-0); }
  ::-webkit-scrollbar-thumb { background: var(--surface-3); }
  ::-webkit-scrollbar-thumb:hover { background: var(--orange-500); }

  .scanlines { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px); }
  [data-theme="light"] .scanlines { display: none; }
  .app { position: relative; z-index: 1; min-height: 100vh; }

  @keyframes termLoad { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes typeBlink { 0%,60%,100%{opacity:0.2;transform:scale(0.8)} 30%{opacity:1;transform:scale(1)} }

  /* ── AUTH ── */
  .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .auth-card { width: 100%; max-width: 420px; background: var(--surface-1); border: var(--border); border-top: 2px solid var(--orange-500); animation: termLoad 0.4s ease; border-radius: var(--radius-md); overflow: hidden; }
  .auth-titlebar { background: var(--surface-2); padding: 10px 16px; display: flex; align-items: center; gap: 8px; border-bottom: var(--border); }
  .titlebar-dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-red { background: #ff5f57; } .dot-yellow { background: #ffbd2e; } .dot-green { background: #28ca42; }
  .titlebar-text { font-size: 11px; color: var(--text-muted); margin-left: 8px; letter-spacing: 0.05em; }
  .auth-body { padding: 32px; }
  .auth-prompt { font-size: 11px; color: var(--orange-500); margin-bottom: 24px; letter-spacing: 0.05em; }
  .auth-title { font-family: var(--font-sans); font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--white); }
  .auth-sub { font-size: 11px; color: var(--text-muted); margin-bottom: 28px; }
  .auth-switch { text-align: center; margin-top: 20px; font-size: 11px; color: var(--text-muted); }
  .auth-switch a { color: var(--orange-400); cursor: pointer; }
  .auth-switch a:hover { color: var(--orange-300); }
  .error-msg { background: rgba(255,51,51,0.08); border: 1px solid rgba(255,51,51,0.25); color: var(--red); padding: 10px 14px; font-size: 11px; margin-bottom: 18px; border-radius: var(--radius); }
  .info-msg { background: rgba(0,200,100,0.07); border: 1px solid rgba(0,200,100,0.25); color: var(--green-term); padding: 10px 14px; font-size: 11px; margin-bottom: 18px; border-radius: var(--radius); }
  .auth-link-sm { font-size: 10px; color: var(--text-muted); cursor: pointer; transition: var(--transition); }
  .auth-link-sm:hover { color: var(--orange-400); }
  .auth-verify-wrap { text-align: center; }
  .auth-verify-icon { font-size: 48px; margin-bottom: 16px; display: block; }
  .auth-verify-email { font-family: var(--font-mono); font-size: 12px; color: var(--orange-400); background: var(--surface-2); padding: 8px 12px; border-radius: var(--radius); border: var(--border); margin: 16px 0; word-break: break-all; display: inline-block; }
  .auth-verify-steps { list-style: none; margin: 0 0 24px; padding: 0; text-align: left; }
  .auth-verify-steps li { font-size: 11px; color: var(--text-muted); padding: 5px 0; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
  .auth-verify-steps li::before { content: "›"; color: var(--orange-400); flex-shrink: 0; margin-top: 1px; }
  .auth-verify-resend { font-size: 10px; color: var(--text-muted); margin-top: 16px; }
  .auth-verify-resend a { color: var(--orange-400); cursor: pointer; }
  .auth-verify-resend a:hover { color: var(--orange-300); }

  /* ── FORM ── */
  .field { margin-bottom: 18px; }
  .field label { display: block; font-size: 10px; color: var(--orange-400); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
  .input { width: 100%; padding: 10px 14px; background: var(--surface-0); border: var(--border); color: var(--text-primary); font-family: var(--font-mono); font-size: 13px; outline: none; transition: var(--transition); border-radius: var(--radius); }
  .input:focus { border-color: var(--orange-500); box-shadow: 0 0 0 2px var(--orange-glow); }
  .input::placeholder { color: var(--text-muted); }
  textarea.input { resize: vertical; min-height: 120px; line-height: 1.7; }
  select.input { cursor: pointer; }

  /* ── BUTTONS ── */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 18px; border: none; font-family: var(--font-mono); font-size: 12px; font-weight: 500; cursor: pointer; transition: var(--transition); letter-spacing: 0.04em; border-radius: var(--radius); white-space: nowrap; }
  .btn-primary { background: var(--orange-500); color: #ffffff; width: 100%; font-weight: 700; }
  .btn-primary:hover { background: var(--orange-400); box-shadow: 0 0 20px var(--orange-glow-strong); }
  .btn-primary:active { transform: scale(0.99); }
  .btn-ghost { background: transparent; color: var(--text-secondary); border: var(--border); }
  .btn-ghost:hover { border-color: var(--text-muted); color: var(--text-primary); }
  .btn-danger { background: rgba(255,51,51,0.08); color: var(--red); border: 1px solid rgba(255,51,51,0.25); }
  .btn-danger:hover { background: rgba(255,51,51,0.15); }
  .btn-term { background: rgba(0,200,100,0.08); color: var(--green-term); border: 1px solid rgba(0,200,100,0.25); }
  .btn-term:hover { background: rgba(0,200,100,0.15); }
  .btn-sm { padding: 7px 14px; font-size: 11px; }
  .btn-icon { padding: 8px; width: 34px; height: 34px; }

  /* ── LAYOUT ── */
  .layout { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; min-height: 100vh; flex-shrink: 0; background: var(--surface-0); border-right: var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; transition: transform 0.25s ease; }
  .sidebar-header { padding: 20px 16px 16px; border-bottom: var(--border); }
  .logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .logo-bracket { color: var(--orange-500); font-size: 22px; font-weight: 700; line-height: 1; }
  .logo-name { font-family: var(--font-sans); font-size: 16px; font-weight: 700; color: var(--white); letter-spacing: -0.02em; }
  .logo-tag { font-size: 9px; color: var(--text-muted); letter-spacing: 0.1em; padding-left: 2px; }
  .sidebar-nav { padding: 12px 10px; flex: 1; }
  .nav-label { font-size: 9px; color: var(--text-muted); letter-spacing: 0.14em; text-transform: uppercase; padding: 8px 8px 4px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: var(--radius); cursor: pointer; transition: var(--transition); color: var(--text-secondary); font-size: 12px; border: 1px solid transparent; margin-bottom: 2px; }
  .nav-item:hover { color: var(--text-primary); background: var(--surface-2); }
  .nav-item.active { color: var(--orange-400); background: rgba(255,85,0,0.08); border-color: rgba(255,85,0,0.2); }
  .nav-prefix { color: var(--text-muted); font-size: 11px; width: 14px; flex-shrink: 0; transition: var(--transition); }
  .nav-item.active .nav-prefix { color: var(--orange-500); }
  .sidebar-footer { padding: 12px 10px; border-top: var(--border); }
  .user-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius); background: var(--surface-2); border: var(--border); }
  .user-avatar { width: 28px; height: 28px; border-radius: var(--radius); background: var(--orange-500); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #ffffff; font-family: var(--font-sans); flex-shrink: 0; }
  .user-email { font-size: 10px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .logout-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 12px; font-family: var(--font-mono); padding: 2px 4px; transition: var(--transition); flex-shrink: 0; }
  .logout-btn:hover { color: var(--orange-400); }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }

  /* ── MAIN ── */
  .main { margin-left: 220px; flex: 1; min-height: 100vh; }
  .topbar { height: 52px; padding: 0 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: var(--border); background: var(--topbar-bg); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 50; }
  .topbar-left { display: flex; align-items: center; gap: 8px; }
  .topbar-prompt { color: var(--orange-500); font-size: 11px; }
  .topbar-title { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--white); }
  .topbar-meta { font-size: 10px; color: var(--text-muted); }
  .topbar-actions { display: flex; align-items: center; gap: 8px; }
  .page { padding: 28px; }
  .page-enter { animation: termLoad 0.25s ease; }

  /* hamburger */
  .hamburger { background: none; border: none; color: var(--orange-500); font-size: 18px; cursor: pointer; padding: 4px 6px; border-radius: var(--radius); transition: var(--transition); display: none; }
  .hamburger:hover { background: var(--orange-glow); }

  /* theme toggle */
  .theme-toggle { background: var(--surface-2); border: var(--border); color: var(--text-secondary); font-size: 14px; cursor: pointer; padding: 5px 9px; border-radius: var(--radius); transition: var(--transition); line-height: 1; }
  .theme-toggle:hover { border-color: var(--orange-500); color: var(--orange-400); }

  .term-line { font-size: 9px; color: var(--text-muted); letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
  .term-line::before { content: '//'; color: var(--orange-500); flex-shrink: 0; }
  .term-line::after { content: ''; flex: 1; height: 1px; background: var(--surface-2); }

  /* ── CARDS ── */
  .card { background: var(--surface-1); border: var(--border); border-radius: var(--radius-md); padding: 20px; transition: var(--transition); }
  .card:hover { border-color: var(--surface-3); }
  .card-hl { border-left: 2px solid var(--orange-500); }

  /* ── STATS ── */
  .stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card { padding: 18px 20px; position: relative; overflow: hidden; }
  .stat-card::after { content: ''; position: absolute; top: 0; right: 0; width: 40px; height: 40px; background: radial-gradient(circle at top right, var(--orange-glow), transparent); }
  .stat-label { font-size: 9px; color: var(--text-muted); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
  .stat-value { font-family: var(--font-sans); font-size: 36px; font-weight: 700; color: var(--white); line-height: 1; margin-bottom: 6px; }
  .stat-value.green { color: var(--green-term); }
  .stat-value.orange { color: var(--orange-500); }
  .stat-sub { font-size: 10px; color: var(--text-muted); }

  /* ── AGENT CARDS ── */
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px; }
  .agent-card { cursor: pointer; }
  .agent-card:hover { border-color: rgba(255,85,0,0.3); }
  .agent-card:hover .agent-name { color: var(--orange-400); }
  .agent-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .agent-id { font-size: 9px; color: var(--text-muted); letter-spacing: 0.06em; }
  .agent-name { font-family: var(--font-sans); font-size: 15px; font-weight: 600; color: var(--white); margin-bottom: 6px; transition: var(--transition); }
  .agent-desc { font-size: 11px; color: var(--text-secondary); line-height: 1.7; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .agent-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: var(--border); }
  .status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 2px; text-transform: uppercase; font-weight: 500; }
  .status-live { background: rgba(0,200,100,0.08); color: var(--green-term); border: 1px solid rgba(0,200,100,0.2); }
  .status-draft { background: var(--surface-2); color: var(--text-muted); border: var(--border); }
  .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .status-live .status-dot { animation: pulse 2s ease-in-out infinite; }
  .model-tag { font-size: 10px; color: var(--text-muted); }

  /* ── SECTION HEADER ── */
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .section-title { font-family: var(--font-sans); font-size: 16px; font-weight: 600; color: var(--white); }
  .section-meta { font-size: 10px; color: var(--text-muted); margin-top: 2px; }

  .empty { text-align: center; padding: 64px 24px; border: 1px dashed var(--surface-3); border-radius: var(--radius-md); }
  .empty-ascii { font-size: 11px; color: var(--surface-3); margin-bottom: 20px; line-height: 1.6; white-space: pre; font-family: var(--font-mono); }
  .empty-title { font-family: var(--font-sans); font-size: 16px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
  .empty-desc { font-size: 11px; color: var(--text-muted); margin-bottom: 24px; }

  /* ── MODAL ── */
  .overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: fadeIn 0.1s ease; }
  .modal { background: var(--surface-1); border: var(--border); border-top: 2px solid var(--orange-500); width: 100%; max-width: 500px; animation: termLoad 0.2s ease; border-radius: var(--radius-md); overflow: hidden; max-height: 90vh; overflow-y: auto; }
  .modal-bar { background: var(--surface-2); padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: var(--border); position: sticky; top: 0; }
  .modal-bar-title { font-size: 11px; color: var(--text-secondary); }
  .modal-close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 14px; font-family: var(--font-mono); transition: var(--transition); }
  .modal-close:hover { color: var(--orange-400); }
  .modal-body { padding: 24px; }
  .modal-title { font-family: var(--font-sans); font-size: 18px; font-weight: 700; color: var(--white); margin-bottom: 4px; }
  .modal-sub { font-size: 11px; color: var(--text-muted); margin-bottom: 24px; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; flex-wrap: wrap; }

  /* ── TABS ── */
  .tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: var(--border); overflow-x: auto; }
  .tab { padding: 10px 14px; font-size: 10px; cursor: pointer; transition: var(--transition); color: var(--text-muted); border-bottom: 2px solid transparent; margin-bottom: -1px; font-family: var(--font-mono); letter-spacing: 0.04em; background: none; border-top: none; border-left: none; border-right: none; white-space: nowrap; flex-shrink: 0; }
  .tab:hover { color: var(--text-secondary); }
  .tab.active { color: var(--orange-400); border-bottom-color: var(--orange-500); }

  /* ── FILES ── */
  .file-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: var(--radius); background: var(--surface-0); border: var(--border); margin-bottom: 8px; font-size: 11px; }
  .file-info { display: flex; align-items: center; gap: 8px; color: var(--text-secondary); }
  .file-prefix { color: var(--orange-500); }
  .upload-zone { border: 1px dashed var(--surface-3); border-radius: var(--radius-md); padding: 36px; text-align: center; cursor: pointer; transition: var(--transition); }
  .upload-zone:hover { border-color: var(--orange-500); background: var(--orange-glow); }
  .upload-ascii { font-size: 11px; color: var(--surface-3); margin-bottom: 12px; line-height: 1.6; transition: var(--transition); white-space: pre; font-family: var(--font-mono); }
  .upload-zone:hover .upload-ascii { color: var(--orange-500); }
  .upload-text { font-size: 12px; color: var(--text-muted); }
  .upload-sub { font-size: 10px; color: var(--surface-3); margin-top: 4px; }

  /* ── CHAT ── */
  .chat-wrap { height: 500px; display: flex; flex-direction: column; }
  .chat-log { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  .msg-row { display: flex; gap: 10px; }
  .msg-row.user { flex-direction: row-reverse; }
  .msg-label { font-size: 10px; font-family: var(--font-mono); flex-shrink: 0; padding-top: 3px; }
  .msg-label.agent-lbl { color: var(--orange-500); }
  .msg-label.user-lbl { color: var(--text-muted); }
  .msg-bubble { max-width: 78%; padding: 10px 14px; font-size: 12px; line-height: 1.7; border-radius: var(--radius); }
  .msg-bubble.agent { background: var(--surface-2); border: var(--border); color: var(--text-secondary); border-left: 2px solid var(--orange-500); }
  .msg-bubble.user { background: rgba(255,85,0,0.1); border: 1px solid rgba(255,85,0,0.25); color: var(--text-primary); }
  .typing { display: flex; gap: 3px; align-items: center; padding: 10px 14px; background: var(--surface-2); border: var(--border); border-left: 2px solid var(--orange-500); border-radius: var(--radius); width: fit-content; }
  .t-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--orange-500); animation: typeBlink 1.2s ease-in-out infinite; }
  .t-dot:nth-child(2){animation-delay:0.2s} .t-dot:nth-child(3){animation-delay:0.4s}
  .chat-input-row { display: flex; gap: 8px; padding: 12px 16px; border-top: var(--border); align-items: center; }
  .chat-prompt-sym { font-size: 11px; color: var(--orange-500); flex-shrink: 0; }
  .chat-input { flex: 1; background: none; border: none; color: var(--text-primary); font-family: var(--font-mono); font-size: 12px; outline: none; }
  .chat-input::placeholder { color: var(--text-muted); }
  .chat-send { background: var(--orange-500); color: #ffffff; border: none; width: 28px; height: 28px; border-radius: var(--radius); cursor: pointer; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: var(--transition); }
  .chat-send:hover { background: var(--orange-400); box-shadow: 0 0 12px var(--orange-glow-strong); }

  /* ── CODE / DEPLOY ── */
  .code-block { background: var(--surface-0); border: var(--border); border-left: 2px solid var(--orange-500); padding: 18px 20px; font-family: var(--font-mono); font-size: 12px; color: var(--green-term); line-height: 1.8; position: relative; word-break: break-all; border-radius: var(--radius); margin: 14px 0; }
  .copy-btn { position: absolute; top: 10px; right: 10px; background: rgba(255,85,0,0.1); border: 1px solid rgba(255,85,0,0.25); color: var(--orange-400); padding: 4px 10px; border-radius: var(--radius); font-size: 10px; cursor: pointer; font-family: var(--font-mono); transition: var(--transition); }
  .copy-btn:hover { background: rgba(255,85,0,0.2); }
  .step-row { display: flex; gap: 14px; padding: 14px 0; border-bottom: var(--border); }
  .step-row:last-child { border-bottom: none; }
  .step-num { font-size: 10px; color: var(--orange-500); width: 24px; flex-shrink: 0; font-weight: 700; padding-top: 2px; }
  .step-text { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
  .step-text strong { color: var(--text-primary); display: block; margin-bottom: 2px; }
  .token-box { background: var(--surface-0); border: var(--border); padding: 12px 16px; font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); border-radius: var(--radius); word-break: break-all; line-height: 1.7; }
  .token-prefix { color: var(--orange-500); }
  .alert-box { border-left: 2px solid; padding: 12px 16px; border-radius: var(--radius); font-size: 11px; line-height: 1.7; margin-bottom: 20px; }
  .alert-warn { background: rgba(255,189,0,0.06); border-color: #ffbd00; color: #ffbd00; }
  .alert-ok { background: rgba(0,200,100,0.06); border-color: var(--green-term); color: var(--green-term); }

  /* ── SETTINGS ── */
  .settings-block { margin-bottom: 24px; }
  .settings-block-title { font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--white); margin-bottom: 4px; }
  .settings-block-desc { font-size: 11px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.7; }
  .input-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .input-row .input { flex: 1; min-width: 180px; }

  /* ── TOAST ── */
  .toast { position: fixed; bottom: 20px; right: 20px; z-index: 999; background: var(--surface-1); border: var(--border); border-left: 2px solid var(--orange-500); padding: 12px 18px; font-size: 11px; color: var(--text-secondary); animation: termLoad 0.25s ease; display: flex; align-items: center; gap: 8px; border-radius: var(--radius); max-width: calc(100vw - 40px); }
  .toast-prefix { color: var(--orange-500); }

  .divider { height: 1px; background: var(--surface-2); margin: 20px 0; }
  .deploy-wrap { max-width: 660px; }

  /* ── GLOBAL SPINNER ── */
  @keyframes gs-spin { to { transform: rotate(360deg); } }
  @keyframes gs-fadein { from { opacity: 0; } to { opacity: 1; } }
  @keyframes gs-fadeout { from { opacity: 1; } to { opacity: 0; } }
  @keyframes gs-pulse-glow { 0%,100%{box-shadow:0 0 18px var(--orange-glow-strong)} 50%{box-shadow:0 0 36px rgba(255,85,0,0.55)} }

  .gs-overlay {
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(0,0,0,0.62); backdrop-filter: blur(5px);
    display: flex; align-items: center; justify-content: center;
    animation: gs-fadein 0.15s ease;
  }
  .gs-overlay.gs-fading { animation: gs-fadeout 0.3s ease forwards; }
  .gs-box {
    display: flex; flex-direction: column; align-items: center; gap: 18px;
    background: var(--surface-1); border: var(--border);
    border-top: 2px solid var(--orange-500);
    padding: 32px 40px; border-radius: var(--radius-md);
    animation: gs-fadein 0.2s ease;
  }
  .gs-ring {
    width: 44px; height: 44px; border-radius: 50%;
    border: 2px solid var(--surface-3);
    border-top-color: var(--orange-500);
    animation: gs-spin 0.75s linear infinite, gs-pulse-glow 1.8s ease-in-out infinite;
  }
  .gs-label {
    font-family: var(--font-mono); font-size: 10px;
    color: var(--orange-400); letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn-spinner {
    display: inline-block; width: 12px; height: 12px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: currentColor;
    animation: gs-spin 0.65s linear infinite;
    flex-shrink: 0;
  }
  .btn-inner { display: inline-flex; align-items: center; gap: 7px; justify-content: center; }
  .settings-wrap { max-width: 540px; }

  /* ── STUDIO ── */
  .studio-split { display: flex; height: calc(100vh - 52px); overflow: hidden; }
  .studio-left { width: 380px; min-width: 280px; flex-shrink: 0; border-right: var(--border); display: flex; flex-direction: column; overflow: hidden; background: var(--surface-0); }
  .studio-left-header { padding: 16px 16px 0; flex-shrink: 0; }
  .studio-left-body { flex: 1; overflow-y: auto; padding: 0 16px 24px; }
  .studio-right { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; background: var(--bg); }
  .studio-chat-header { padding: 12px 16px; border-bottom: var(--border); flex-shrink: 0; display: flex; align-items: center; gap: 10px; background: var(--surface-0); }
  .studio-chat-log { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }

  /* ── CHAT INPUT BAR ── */
  .studio-chat-input { padding: 14px 16px; border-top: 2px solid var(--border-color); display: flex; gap: 8px; align-items: center; flex-shrink: 0; background: var(--surface-1); }
  .studio-chat-input-field { flex: 1; padding: 10px 14px; background: var(--surface-0); border: var(--border); border-radius: var(--radius); color: var(--text-primary); font-family: var(--font-mono); font-size: 13px; outline: none; transition: var(--transition); }
  .studio-chat-input-field:focus { border-color: var(--orange-500); box-shadow: 0 0 0 2px var(--orange-glow); }
  .studio-chat-input-field::placeholder { color: var(--text-muted); }
  .studio-chat-input-field:disabled { opacity: 0.5; cursor: not-allowed; }
  .studio-chat-send { background: var(--orange-500); color: #ffffff; border: none; height: 40px; padding: 0 16px; border-radius: var(--radius); cursor: pointer; font-size: 13px; font-weight: 700; flex-shrink: 0; transition: var(--transition); font-family: var(--font-mono); }
  .studio-chat-send:hover:not(:disabled) { background: var(--orange-400); box-shadow: 0 0 14px var(--orange-glow-strong); }
  .studio-chat-send:disabled { opacity: 0.4; cursor: not-allowed; }

  .tools-table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .tools-table th { text-align: left; color: var(--orange-400); font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 8px; border-bottom: var(--border); font-weight: 500; }
  .tools-table td { padding: 9px 8px; border-bottom: var(--border); color: var(--text-secondary); vertical-align: middle; }
  .tools-table tbody tr:last-child td { border-bottom: none; }
  .method-badge { font-size: 9px; padding: 2px 7px; border-radius: 2px; font-weight: 700; letter-spacing: 0.06em; font-family: var(--font-mono); }
  .method-get { background: rgba(0,200,100,0.08); color: var(--green-term); border: 1px solid rgba(0,200,100,0.2); }
  .method-post { background: rgba(255,85,0,0.08); color: var(--orange-400); border: 1px solid rgba(255,85,0,0.2); }
  .method-put { background: rgba(255,189,0,0.08); color: #c49000; border: 1px solid rgba(255,189,0,0.2); }
  .method-delete { background: rgba(255,51,51,0.08); color: var(--red); border: 1px solid rgba(255,51,51,0.2); }

  .studio-no-agent { display: flex; align-items: center; gap: 8px; font-size: 11px; color: var(--text-muted); margin-bottom: 14px; padding: 10px 12px; background: var(--surface-1); border: var(--border); border-radius: 6px; }
  .studio-no-agent-btn { background: none; border: 1px solid var(--orange-500); color: var(--orange-400); font-size: 10px; padding: 3px 10px; border-radius: 4px; cursor: pointer; font-family: var(--font-mono); letter-spacing: 0.05em; transition: all 0.15s; }
  .studio-no-agent-btn:hover { background: var(--orange-500); color: #fff; }
  .studio-deploy-card { background: var(--surface-1); border: var(--border); border-radius: 8px; padding: 24px; text-align: center; }
  .studio-deploy-icon { font-size: 28px; color: var(--orange-400); font-family: var(--font-mono); margin-bottom: 14px; }
  .studio-deploy-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; letter-spacing: 0.02em; }
  .studio-deploy-desc { font-size: 11px; color: var(--text-muted); line-height: 1.8; }

  /* ── KNOWLEDGE SAVE STATUS ── */
  .kb-save-status { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; padding: 4px 10px; border-radius: 3px; font-family: var(--font-mono); margin-bottom: 10px; }
  .kb-save-status.saved { color: var(--green-term); background: rgba(0,200,100,0.07); border: 1px solid rgba(0,200,100,0.2); }
  .kb-save-status.saving { color: var(--orange-400); background: var(--orange-glow); border: 1px solid rgba(255,85,0,0.2); }
  .kb-save-status.unsaved { color: var(--text-muted); background: var(--surface-2); border: var(--border); }
  .kb-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .kb-save-status.saved .kb-dot { animation: pulse 2s ease-in-out infinite; }

  /* ── RESPONSIVE ── */
  /* ── DEPLOY DESTINATIONS ── */
  .deploy-page { max-width: 720px; }
  .deploy-agent-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--surface-1); border: var(--border); border-radius: var(--radius-md); padding: 14px 18px; margin-bottom: 24px; flex-wrap: wrap; }
  .deploy-agent-info { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
  .deploy-agent-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .deploy-agent-name { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .deploy-agent-id { font-size: 10px; color: var(--text-muted); margin-top: 1px; }

  .deploy-dest-label { font-size: 10px; color: var(--text-muted); letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 12px; }
  .deploy-dest-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 28px; }
  .deploy-dest-tab { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px; border-radius: var(--radius-md); border: var(--border); background: var(--surface-1); cursor: pointer; transition: var(--transition); color: var(--text-secondary); font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em; }
  .deploy-dest-tab:hover { border-color: var(--orange-500); color: var(--text-primary); background: var(--orange-glow); }
  .deploy-dest-tab.active { border-color: var(--orange-500); background: rgba(255,85,0,0.08); color: var(--orange-400); }
  .deploy-dest-icon { font-size: 22px; line-height: 1; }
  .deploy-dest-tab.active .deploy-dest-icon { filter: none; }

  .social-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; }
  .social-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 18px 12px; border-radius: var(--radius-md); border: var(--border); background: var(--surface-1); cursor: pointer; transition: var(--transition); font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); }
  .social-btn:hover { border-color: var(--text-muted); background: var(--surface-2); color: var(--text-primary); }
  .social-btn.selected { border-color: var(--orange-500); background: rgba(255,85,0,0.07); color: var(--orange-400); }
  .social-icon { font-size: 24px; line-height: 1; }
  .social-help { font-size: 11px; color: var(--text-muted); margin-bottom: 16px; line-height: 1.7; }
  .social-help a { color: var(--orange-400); cursor: pointer; text-decoration: none; }
  .social-help a:hover { color: var(--orange-300); text-decoration: underline; }
  .social-mock-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; color: var(--text-muted); background: var(--surface-2); border: var(--border); padding: 2px 8px; border-radius: 2px; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 14px; font-family: var(--font-mono); }
  .wa-connect-form { display: flex; flex-direction: column; gap: 14px; }
  .wa-connect-title { font-family: var(--font-sans); font-size: 15px; font-weight: 700; color: var(--white); }
  .wa-connect-desc { font-size: 11px; color: var(--text-muted); line-height: 1.7; }
  .wa-connected-card { background: rgba(37,211,102,0.05); border: 1px solid rgba(37,211,102,0.22); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column; gap: 12px; }
  .wa-status-row { display: flex; align-items: center; gap: 8px; }
  .wa-dot { width: 9px; height: 9px; border-radius: 50%; background: #25d366; flex-shrink: 0; box-shadow: 0 0 6px rgba(37,211,102,0.6); }
  .wa-status-label { font-size: 13px; font-weight: 700; color: #25d366; font-family: var(--font-sans); }
  .wa-info-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 12px; border-top: 1px solid rgba(37,211,102,0.1); padding-top: 10px; }
  .wa-info-key { color: var(--text-muted); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; flex-shrink: 0; }
  .wa-info-val { color: var(--text-primary); font-weight: 500; text-align: right; word-break: break-all; }
  .wa-webhook-hint { background: var(--surface-1); border: var(--border); border-radius: var(--radius); padding: 12px 14px; margin-top: 4px; }
  .wa-webhook-hint-title { font-size: 9px; color: var(--orange-400); font-family: var(--font-mono); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 6px; }
  .wa-webhook-hint-url { font-size: 10px; font-family: var(--font-mono); color: var(--text-secondary); word-break: break-all; line-height: 1.6; }

  .custom-code-panel { }
  .snippet-label { font-size: 9px; color: var(--orange-400); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
  .snippet-block { background: var(--surface-0); border: var(--border); border-left: 2px solid var(--orange-500); border-radius: var(--radius); padding: 18px 20px; font-family: var(--font-mono); font-size: 12px; color: var(--green-term); line-height: 1.9; position: relative; word-break: break-all; margin-bottom: 14px; overflow-x: auto; }
  .snippet-copy { position: absolute; top: 10px; right: 10px; background: rgba(255,85,0,0.1); border: 1px solid rgba(255,85,0,0.25); color: var(--orange-400); padding: 4px 10px; border-radius: var(--radius); font-size: 10px; cursor: pointer; font-family: var(--font-mono); transition: var(--transition); }
  .snippet-copy:hover { background: rgba(255,85,0,0.2); }
  .snippet-copy.copied { color: var(--green-term); border-color: rgba(0,200,100,0.3); background: rgba(0,200,100,0.07); }
  .install-steps { margin-top: 20px; }
  .install-step { display: flex; gap: 14px; padding: 14px 0; border-bottom: var(--border); }
  .install-step:last-child { border-bottom: none; }
  .install-step-num { font-size: 10px; color: var(--orange-500); width: 22px; flex-shrink: 0; font-weight: 700; padding-top: 1px; font-family: var(--font-mono); }
  .install-step-body { font-size: 12px; color: var(--text-secondary); line-height: 1.7; }
  .install-step-body strong { color: var(--text-primary); display: block; margin-bottom: 2px; font-family: var(--font-sans); font-size: 13px; }
  .website-mock { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; border: 1px dashed var(--surface-3); border-radius: var(--radius-md); }
  .website-mock-icon { font-size: 36px; margin-bottom: 16px; }
  .website-mock-title { font-family: var(--font-sans); font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
  .website-mock-desc { font-size: 12px; color: var(--text-muted); line-height: 1.7; max-width: 320px; }
  .coming-soon-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; background: rgba(255,189,0,0.08); color: #c49000; border: 1px solid rgba(255,189,0,0.2); padding: 3px 10px; border-radius: 2px; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 14px; font-family: var(--font-mono); }

  .deploy-no-token { background: var(--surface-2); border: var(--border); border-radius: var(--radius); padding: 14px 16px; font-size: 11px; color: var(--text-muted); line-height: 1.7; margin-bottom: 16px; }
  .deploy-no-token strong { color: var(--orange-400); }
  .deploy-no-agent-banner { background: var(--surface-1); border: var(--border); border-left: 3px solid var(--orange-500); border-radius: var(--radius-md); padding: 20px 22px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .deploy-no-agent-banner-text { flex: 1; min-width: 0; }
  .deploy-no-agent-banner-title { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--white); margin-bottom: 4px; }
  .deploy-no-agent-banner-sub { font-size: 11px; color: var(--text-muted); line-height: 1.6; }
  .deploy-how-it-works { background: var(--surface-1); border: var(--border); border-radius: var(--radius-md); padding: 18px 20px; margin-bottom: 24px; }
  .deploy-how-steps { display: flex; gap: 0; }
  .deploy-how-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 8px; position: relative; }
  .deploy-how-step:not(:last-child)::after { content: '→'; position: absolute; right: -8px; top: 14px; font-size: 14px; color: var(--text-muted); }
  .deploy-how-num { width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--text-muted); font-family: var(--font-mono); margin-bottom: 8px; background: var(--surface-2); transition: var(--transition); }
  .deploy-how-step.done .deploy-how-num { border-color: var(--green-term); color: var(--green-term); background: rgba(0,200,100,0.07); }
  .deploy-how-step.active .deploy-how-num { border-color: var(--orange-500); color: var(--orange-500); background: rgba(255,85,0,0.08); }
  .deploy-how-label { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); line-height: 1.4; }
  .deploy-how-step.done .deploy-how-label { color: var(--green-term); }
  .deploy-how-step.active .deploy-how-label { color: var(--orange-400); }
  @media (max-width: 480px) { .deploy-how-steps { gap: 4px; } .deploy-how-step { padding: 0 4px; } .deploy-how-step:not(:last-child)::after { display: none; } }

  /* ── F1: AGENT TEMPLATES ── */
  .template-step-title { font-size: 9px; color: var(--orange-400); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 14px; font-family: var(--font-mono); }
  .template-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
  .template-card { border: var(--border); border-radius: var(--radius-md); padding: 14px 12px; cursor: pointer; transition: var(--transition); background: var(--surface-1); text-align: left; width: 100%; }
  .template-card:hover { border-color: var(--orange-400); background: var(--orange-glow); }
  .template-card-icon { font-size: 20px; margin-bottom: 8px; }
  .template-card-name { font-size: 11px; font-weight: 700; color: var(--white); margin-bottom: 3px; font-family: var(--font-sans); }
  .template-card-desc { font-size: 9px; color: var(--text-muted); line-height: 1.5; }
  .template-scratch { width: 100%; padding: 10px 14px; background: transparent; border: 1px dashed var(--border-color); border-radius: var(--radius); font-size: 11px; color: var(--text-muted); cursor: pointer; font-family: var(--font-mono); transition: var(--transition); text-align: left; }
  .template-scratch:hover { border-color: var(--text-muted); color: var(--text-secondary); }

  /* ── F2: AGENT CARD ACTIONS ── */
  .agent-card-actions { display: flex; gap: 6px; margin-top: 12px; padding-top: 10px; border-top: var(--border); }
  .agent-action-btn { flex: 1; padding: 5px 8px; font-size: 9px; font-family: var(--font-mono); letter-spacing: 0.06em; background: transparent; border: var(--border); border-radius: var(--radius); color: var(--text-muted); cursor: pointer; transition: var(--transition); }
  .agent-action-btn:hover { border-color: var(--orange-400); color: var(--orange-400); }
  .agent-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ── F3: WIDGET PREVIEW ── */
  .widget-preview-outer { position: fixed; bottom: 24px; right: 24px; z-index: 800; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; pointer-events: none; }
  .widget-preview-outer > * { pointer-events: all; }
  .widget-bubble { width: 340px; height: 480px; background: var(--surface-0); border: var(--border); border-radius: 16px; box-shadow: 0 12px 48px rgba(0,0,0,0.7); display: flex; flex-direction: column; overflow: hidden; animation: bootFadeIn 0.25s ease; }
  .widget-bubble-hdr { background: var(--orange-500); padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-shrink: 0; }
  .widget-bubble-hdr-title { font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: white; }
  .widget-bubble-hdr-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.4); }
  .widget-bubble-hdr-x { background: transparent; border: none; cursor: pointer; color: rgba(255,255,255,0.8); font-size: 16px; line-height: 1; padding: 0; }
  .widget-bubble-msgs { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
  .widget-msg-bot { align-self: flex-start; background: var(--surface-2); border-radius: 0 10px 10px 10px; padding: 8px 12px; font-size: 11px; color: var(--text-primary); max-width: 80%; line-height: 1.5; }
  .widget-msg-user { align-self: flex-end; background: var(--orange-500); border-radius: 10px 10px 0 10px; padding: 8px 12px; font-size: 11px; color: white; max-width: 80%; line-height: 1.5; }
  .widget-bubble-input { padding: 10px 12px; border-top: var(--border); display: flex; gap: 8px; flex-shrink: 0; }
  .widget-bubble-input input { flex: 1; background: var(--surface-2); border: var(--border); border-radius: 20px; padding: 7px 14px; font-size: 11px; color: var(--text-primary); font-family: var(--font-mono); outline: none; }
  .widget-bubble-input button { background: var(--orange-500); border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; color: white; font-size: 14px; flex-shrink: 0; transition: var(--transition); }
  .widget-bubble-input button:hover { background: var(--orange-400); }
  .widget-fab { width: 52px; height: 52px; border-radius: 50%; background: var(--orange-500); border: none; cursor: pointer; font-size: 22px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(255,85,0,0.45); transition: var(--transition); }
  .widget-fab:hover { background: var(--orange-400); transform: scale(1.08); }
  .widget-preview-btn { font-family: var(--font-mono); font-size: 9px; background: transparent; border: var(--border); border-radius: var(--radius); padding: 4px 10px; color: var(--text-muted); cursor: pointer; transition: var(--transition); letter-spacing: 0.08em; }
  .widget-preview-btn:hover, .widget-preview-btn.active { border-color: var(--orange-400); color: var(--orange-400); }

  /* ── F4: ANALYTICS DASHBOARD ── */
  .analytics-wrap { margin-top: 32px; }
  .mini-chart-row { display: flex; align-items: flex-end; gap: 5px; height: 64px; }
  .mini-bar { flex: 1; border-radius: 2px 2px 0 0; background: var(--orange-500); opacity: 0.55; min-height: 4px; transition: opacity 0.2s; position: relative; }
  .mini-bar:hover { opacity: 1; }
  .mini-bar-labels { display: flex; gap: 5px; margin-top: 5px; }
  .mini-bar-lbl { flex: 1; text-align: center; font-size: 8px; color: var(--text-muted); font-family: var(--font-mono); }
  .agent-perf-list { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
  .agent-perf-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: var(--surface-1); border: var(--border); border-radius: var(--radius); }
  .agent-perf-name { font-size: 11px; color: var(--text-primary); font-family: var(--font-sans); font-weight: 500; min-width: 100px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .agent-perf-bar-bg { flex: 1; height: 4px; background: var(--surface-3); border-radius: 2px; overflow: hidden; }
  .agent-perf-bar-fill { height: 100%; background: var(--orange-500); border-radius: 2px; transition: width 0.8s ease; }
  .agent-perf-count { font-family: var(--font-mono); font-size: 10px; color: var(--orange-400); min-width: 48px; text-align: right; flex-shrink: 0; }

  /* ── F5: CONVERSATION HISTORY DRAWER ── */
  .history-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 500; }
  .history-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(460px, 100vw); background: var(--surface-0); border-left: var(--border); z-index: 501; display: flex; flex-direction: column; animation: slideInRight 0.22s ease; }
  @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  .history-drawer-hdr { padding: 20px; border-bottom: var(--border); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-shrink: 0; }
  .history-drawer-title { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--white); margin-bottom: 2px; }
  .history-drawer-sub { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); }
  .history-drawer-body { flex: 1; overflow-y: auto; padding: 16px 20px; }
  .conv-thread { border: var(--border); border-radius: var(--radius-md); margin-bottom: 10px; overflow: hidden; cursor: pointer; transition: var(--transition); }
  .conv-thread:hover { border-color: var(--orange-400); }
  .conv-thread-hdr { padding: 11px 14px; background: var(--surface-1); display: flex; align-items: center; gap: 10px; }
  .conv-thread-preview { font-size: 11px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .conv-thread-time { font-size: 9px; color: var(--text-muted); font-family: var(--font-mono); flex-shrink: 0; }
  .conv-thread-msgs { padding: 10px 14px; background: var(--surface-2); display: flex; flex-direction: column; gap: 8px; }
  .conv-msg { font-size: 11px; line-height: 1.6; display: flex; gap: 8px; }
  .conv-msg-who { font-family: var(--font-mono); font-size: 9px; padding-top: 2px; flex-shrink: 0; }
  .conv-msg-who.user { color: var(--orange-400); }
  .conv-msg-who.bot { color: var(--green-term); }
  .conv-msg-text { color: var(--text-secondary); }

  /* ── F6: CLIENT SHARE LINK ── */
  .share-link-card { background: var(--surface-1); border: var(--border); border-radius: var(--radius-md); padding: 16px 18px; margin-top: 16px; }
  .share-link-url-row { display: flex; align-items: center; gap: 8px; background: var(--surface-2); border: var(--border); border-radius: var(--radius); padding: 8px 12px; margin: 8px 0; }
  .share-link-text { flex: 1; font-family: var(--font-mono); font-size: 10px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  /* ── BOOT LOADER ── */
  @keyframes bootFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes bootFadeOut { from { opacity: 1; } to { opacity: 0; pointer-events: none; } }
  @keyframes progressFill { from { width: 0%; } to { width: 100%; } }
  @keyframes cursorBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes bootGlow { 0%,100% { text-shadow: 0 0 8px rgba(255,85,0,0.6); } 50% { text-shadow: 0 0 20px rgba(255,85,0,1), 0 0 40px rgba(255,85,0,0.4); } }

  .boot-screen {
    position: fixed; inset: 0; z-index: 9999;
    background: #000000;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 24px;
    transition: opacity 0.6s ease;
  }
  .boot-screen.fading { opacity: 0; pointer-events: none; }

  .boot-logo-wrap { margin-bottom: 48px; text-align: center; animation: bootFadeIn 0.5s ease; }
  .boot-logo-text {
    font-family: var(--font-sans); font-size: clamp(28px, 6vw, 44px); font-weight: 700;
    color: #ffffff; letter-spacing: -0.02em;
    animation: bootGlow 2.5s ease-in-out infinite;
  }
  .boot-logo-bracket { color: #ff5500; }
  .boot-logo-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #555555; letter-spacing: 0.12em; margin-top: 6px; }

  .boot-terminal { width: 100%; max-width: 480px; margin-bottom: 36px; }
  .boot-line {
    font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 2;
    display: flex; align-items: center; gap: 10px;
    animation: bootFadeIn 0.3s ease both;
  }
  .boot-line-prefix { color: #ff5500; flex-shrink: 0; }
  .boot-line-text { color: #555555; }
  .boot-line-text.ok { color: #00cc66; }
  .boot-line-text.active { color: #888888; }
  .boot-cursor { display: inline-block; width: 8px; height: 14px; background: #ff5500; margin-left: 4px; animation: cursorBlink 0.9s step-end infinite; vertical-align: middle; }

  .boot-progress-wrap { width: 100%; max-width: 480px; }
  .boot-progress-bar-bg { height: 2px; background: #1a1a1a; border-radius: 1px; overflow: hidden; margin-bottom: 10px; }
  .boot-progress-bar-fill { height: 100%; background: #ff5500; border-radius: 1px; box-shadow: 0 0 8px rgba(255,85,0,0.6); transition: width 0.4s ease; }
  .boot-progress-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #333333; letter-spacing: 0.1em; text-align: right; }

  /* UPGRADE MODAL */
  .upgrade-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 900; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .upgrade-modal { background: var(--surface-0); border: var(--border); border-radius: 14px; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
  .upgrade-modal-hdr { padding: 22px 24px 18px; border-bottom: var(--border); display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  .upgrade-modal-title { font-family: var(--font-sans); font-size: 18px; font-weight: 700; color: white; margin-bottom: 4px; }
  .upgrade-modal-sub { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); line-height: 1.6; }
  .upgrade-modal-body { padding: 18px 24px; display: flex; flex-direction: column; gap: 10px; }
  .upgrade-plan-row { border: var(--border); border-radius: var(--radius-md); padding: 14px 16px; display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; transition: border-color 0.15s; }
  .upgrade-plan-row:hover { border-color: var(--orange-400); }
  .upgrade-plan-row.popular { border-color: var(--orange-500); background: rgba(255,85,0,0.04); }
  .upgrade-plan-info { flex: 1; min-width: 0; }
  .upgrade-plan-name { font-weight: 600; font-size: 13px; color: white; margin-bottom: 6px; font-family: var(--font-sans); }
  .upgrade-plan-feats { font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); display: flex; flex-direction: column; gap: 5px; }
  .feat-core { color: #aaa; letter-spacing: 0.02em; }
  .feat-group { display: flex; flex-direction: column; gap: 2px; }
  .feat-group-label { color: var(--orange-500); font-size: 9px; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 3px; }
  .feat-item { color: var(--text-muted); padding-left: 2px; }
  .upgrade-plan-price { font-size: 20px; font-weight: 800; color: var(--orange-400); font-family: var(--font-sans); flex-shrink: 0; white-space: nowrap; }
  .upgrade-btn { padding: 8px 18px; background: var(--orange-500); color: white; border: none; border-radius: var(--radius); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s ease; white-space: nowrap; }
  .upgrade-btn:hover { background: var(--orange-400); }
  .upgrade-modal-footer { padding: 0 24px 20px; font-size: 10px; color: var(--text-muted); font-family: var(--font-mono); line-height: 1.8; }

  @media (max-width: 1024px) {
    .stats-row { grid-template-columns: repeat(2,1fr); }
    .studio-left { width: 320px; }
  }

  @media (max-width: 900px) {
    .studio-split { flex-direction: column; height: auto; overflow: visible; }
    .studio-left { width: 100%; min-width: unset; border-right: none; border-bottom: var(--border); max-height: 55vh; }
    .studio-right { height: 60vh; min-height: 400px; }
  }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-220px); }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay { display: block; }
    .main { margin-left: 0; }
    .topbar { padding: 0 14px; }
    .hamburger { display: flex !important; }
    .page { padding: 14px; }
    .stats-row { grid-template-columns: 1fr; }
    .card-grid { grid-template-columns: 1fr; }
    .auth-card { max-width: 100%; }
    .auth-body { padding: 20px; }
    .deploy-wrap { max-width: 100%; }
    .settings-wrap { max-width: 100%; }
    .modal { max-width: calc(100vw - 32px); }
    .topbar-meta { display: none; }
    .tabs { gap: 0; }
    .tab { padding: 10px 10px; font-size: 9px; }
    .studio-split { height: auto; }
    .studio-left { max-height: none; }
    .studio-right { height: 70vh; min-height: 360px; }
    .stat-value { font-size: 28px; }
    .modal-footer { flex-direction: column-reverse; }
    .modal-footer .btn { width: 100%; }
  }

  @media (max-width: 480px) {
    .topbar-title { font-size: 13px; }
    .page { padding: 12px; }
    .card { padding: 14px; }
    .auth-body { padding: 16px; }
    .auth-title { font-size: 20px; }
    .section-header { flex-direction: column; align-items: flex-start; }
    .studio-chat-input { padding: 10px 12px; }
    .studio-chat-input-field { font-size: 12px; }
    .msg-bubble { max-width: 90%; font-size: 11px; }
  }
`;

type Page = "dashboard" | "agents" | "studio" | "deploy" | "settings";

interface Agent {
  id: string;
  name: string;
  desc: string;
  model: string;
  status: "live" | "draft";
}

function useAgents(refreshKey = 0) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    axios
      .get("https://everydayai-backend-production.up.railway.app/agents/", {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
      .then(res => {
        const raw: any[] = Array.isArray(res.data)
          ? res.data
          : res.data?.agents ?? res.data?.data ?? res.data?.results ?? [];
        setAgents(raw.map(a => ({
          id: String(a.id ?? a._id ?? ""),
          name: a.name || "Untitled Agent",
          desc: a.description || a.desc || "",
          model: a.model || "gpt-4o-mini",
          status: a.status || "draft",
        })));
      })
      .catch(err => {
        if (!axios.isCancel(err)) {
          if (axios.isAxiosError(err)) {
            const d = err.response?.data;
            setError(d?.detail || d?.message || `Failed to load agents (${err.response?.status ?? "network error"}).`);
          } else {
            setError("Failed to load agents. Check your connection.");
          }
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [refreshKey]);

  return { agents, loading, error };
}

const BOOT_STEPS = [
  { text: "initializing everydayai runtime...", delay: 0 },
  { text: "loading workspace modules...", delay: 380 },
  { text: "connecting to agent network...", delay: 760 },
  { text: "verifying session credentials...", delay: 1080 },
  { text: "ready.", delay: 1400 },
];

function BootLoader({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => {
        setStep(i + 1);
        setProgress(Math.round(((i + 1) / BOOT_STEPS.length) * 100));
      }, s.delay));
    });

    timers.push(setTimeout(() => setFading(true), 1900));
    timers.push(setTimeout(() => onDone(), 2500));

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const visibleSteps = BOOT_STEPS.slice(0, step);
  const isDone = step >= BOOT_STEPS.length;

  return (
    <div className={`boot-screen${fading ? " fading" : ""}`}>
      <div className="boot-logo-wrap">
        <div className="boot-logo-text">
          <span className="boot-logo-bracket">[</span>
          EverydayAI
          <span className="boot-logo-bracket">]</span>
        </div>
        <div className="boot-logo-tag">// no-code ai agent platform</div>
      </div>

      <div className="boot-terminal">
        {visibleSteps.map((s, i) => {
          const isLast = i === visibleSteps.length - 1;
          const done = !isLast || isDone;
          return (
            <div
              key={i}
              className="boot-line"
              style={{ animationDelay: "0ms" }}
            >
              <span className="boot-line-prefix">&gt;</span>
              <span className={`boot-line-text${done ? " ok" : " active"}`}>
                {s.text}
                {isLast && !isDone && <span className="boot-cursor" />}
              </span>
            </div>
          );
        })}
      </div>

      <div className="boot-progress-wrap">
        <div className="boot-progress-bar-bg">
          <div className="boot-progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="boot-progress-label">{progress}%</div>
      </div>
    </div>
  );
}

/* ─── PLAN DATA ─── */
const PLAN_LIMITS: Record<string, number> = { free: 1, starter: 5, pro: 12, agency: Infinity };

interface PlanDef {
  id: string; tier: string; name: string; price: number; period: string; priceNote: string;
  agentLabel: string; msgLabel: string;
  deployFeatures: string[]; social?: string[]; tools?: string[];
  ctaLabel: string; ctaClass: string; popular?: boolean;
  paystackAmount: number;
}

const PLANS: PlanDef[] = [
  {
    id: "free", tier: "// free", name: "Free", price: 0, period: "", priceNote: "forever",
    agentLabel: "1 agent", msgLabel: "100 messages/mo",
    deployFeatures: ["Widget deployment", "Knowledge base upload", "Studio chat testing", "EverydayAI badge (shows)"],
    ctaLabel: "Get Free", ctaClass: "plan-cta-ghost", paystackAmount: 0,
  },
  {
    id: "starter", tier: "// starter", name: "Starter", price: 9, period: "/month", priceNote: "billed monthly",
    agentLabel: "5 agents", msgLabel: "Unlimited messages",
    deployFeatures: ["Widget deployment", "Knowledge base upload", "Studio chat testing", "Badge removed"],
    ctaLabel: "Get Starter", ctaClass: "plan-cta-ghost", paystackAmount: 1440000,
  },
  {
    id: "pro", tier: "// pro", name: "Pro", price: 22, period: "/month", priceNote: "most popular",
    agentLabel: "12 agents", msgLabel: "Unlimited messages",
    deployFeatures: ["Widget deployment", "Knowledge base upload", "Studio chat testing", "Badge removed"],
    social: ["WhatsApp deployment", "Instagram DMs", "Facebook Messenger"],
    tools: ["Lead capture"],
    ctaLabel: "Get Pro", ctaClass: "plan-cta-primary", popular: true, paystackAmount: 3520000,
  },
  {
    id: "agency", tier: "// agency", name: "Agency", price: 75, period: "/month", priceNote: "billed monthly",
    agentLabel: "Unlimited agents", msgLabel: "Unlimited messages",
    deployFeatures: ["Widget deployment", "Knowledge base upload", "Studio chat testing", "Badge removed"],
    social: ["WhatsApp + IG + Messenger", "Future channels (early access)"],
    tools: ["Lead capture", "AI Voice calls", "Human escalation", "Appointment booking", "Client sub-accounts"],
    ctaLabel: "Get Agency", ctaClass: "plan-cta-ghost", paystackAmount: 12000000,
  },
];

/* ─── UPGRADE MODAL ─── */
function UpgradeModal({
  currentPlan, email, onClose, onSuccess,
}: {
  currentPlan: string; email: string; onClose: () => void; onSuccess: (plan: string) => void;
}) {
  const [paying, setPaying] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const currentIdx = PLANS.findIndex(p => p.id === currentPlan);
  const upgradePlans = PLANS.filter((_, i) => i > currentIdx);

  async function payWithPaystack(plan: PlanDef) {
    setPayError(null);
    setPaying(plan.id);
    try {
      const token = localStorage.getItem("token");
      const callbackUrl = `${window.location.origin}/?plan=${plan.id}`;
      const res = await fetch("https://everydayai-backend-production.up.railway.app/billing/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: plan.id, email, callback_url: callbackUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.detail || err?.message || "Failed to initialize payment.");
      }
      const data = await res.json();
      if (!data.authorization_url) throw new Error("No payment URL returned from server.");
      window.location.href = data.authorization_url;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to start payment. Please try again.";
      setPayError(msg);
      setPaying(null);
    }
  }

  return (
    <div className="upgrade-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="upgrade-modal">
        <div className="upgrade-modal-hdr">
          <div>
            <div className="upgrade-modal-title">Upgrade your plan</div>
            <div className="upgrade-modal-sub">
              You've reached the limit of your <strong style={{ color: "var(--orange-400)" }}>{currentPlan}</strong> plan.
              Upgrade to unlock more agents and features.
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
        {payError && (
          <div className="error-msg" style={{ margin: "0 20px 0 20px" }}>{payError}</div>
        )}
        <div className="upgrade-modal-body">
          {upgradePlans.map(plan => (
            <div key={plan.id} className={`upgrade-plan-row${plan.popular ? " popular" : ""}`}>
              <div className="upgrade-plan-info">
                <div className="upgrade-plan-name">{plan.name} {plan.popular && "⭐"}</div>
                <div className="upgrade-plan-feats">
                  <span className="feat-core">{plan.agentLabel} · {plan.msgLabel}</span>
                  {plan.deployFeatures && plan.deployFeatures.length > 0 && (
                    <span className="feat-group">
                      <span className="feat-group-label">// deployment</span>
                      {plan.deployFeatures.map(f => <span key={f} className="feat-item">› {f}</span>)}
                    </span>
                  )}
                  {plan.social && plan.social.length > 0 && (
                    <span className="feat-group">
                      <span className="feat-group-label">// social channels</span>
                      {plan.social.map(f => <span key={f} className="feat-item">› {f}</span>)}
                    </span>
                  )}
                  {plan.tools && plan.tools.length > 0 && (
                    <span className="feat-group">
                      <span className="feat-group-label">// tools</span>
                      {plan.tools.map(f => <span key={f} className="feat-item">› {f}</span>)}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                <div className="upgrade-plan-price">${plan.price}<span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>/mo</span></div>
                <button className="upgrade-btn" onClick={() => payWithPaystack(plan)} disabled={paying === plan.id}>
                  <span className="btn-inner">
                    {paying === plan.id && <BtnSpinner />}
                    {paying === plan.id ? "Redirecting..." : plan.ctaLabel}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="upgrade-modal-footer">
          // powered by Paystack — supports cards, bank transfers, USSD and more.
        </div>
      </div>
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => onDoneRef.current(), 2800);
    return () => clearTimeout(t);
  }, []); // runs once on mount only — timer won't reset on re-renders
  return (
    <div className="toast">
      <span className="toast-prefix">&gt;&gt;</span>
      {msg}
    </div>
  );
}

function AuthPage({ onAuth }: { onAuth: (email: string) => void }) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "verify">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { run } = useSpinner();

  function switchMode(m: "login" | "signup" | "forgot") {
    setMode(m); setErr(""); setInfo("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErr(""); setInfo("");
    setLoading(true);
    try {
      if (mode === "forgot") {
        await axios.post(
          "https://everydayai-backend-production.up.railway.app/auth/forgot-password",
          { email }
        );
        setInfo("Password reset email sent. Check your inbox.");
        setLoading(false);
        return;
      }
      if (mode === "signup") {
        await run(async () => {
          await axios.post(
            "https://everydayai-backend-production.up.railway.app/auth/signup",
            { email, password: pass }
          );
        });
        // Show email verification screen instead of auto-login
        setMode("verify");
        setErr("");
        setLoading(false);
        return;
      }
      // Login flow
      await run(async () => {
        const res = await axios.post(
          "https://everydayai-backend-production.up.railway.app/auth/login",
          { email, password: pass }
        );
        const token = res.data?.access_token || res.data?.token;
        if (!token) throw new Error("No token received from server. Please try again.");
        localStorage.setItem("token", token);
        setErr(""); // Clear any residual error state before transitioning
        onAuth(email);
      });
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const d = e.response?.data;
        setErr(d?.detail || d?.message || (typeof d === "string" ? d : null) || "Login failed. Please check your credentials.");
      } else if (e instanceof Error) {
        setErr(e.message);
      } else {
        setErr("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    if (resendLoading) return;
    setResendLoading(true);
    setErr(""); setInfo("");
    try {
      await axios.post(
        "https://everydayai-backend-production.up.railway.app/auth/resend-verification",
        { email }
      );
      setInfo("Verification email resent. Check your inbox.");
    } catch {
      setInfo("Couldn't resend — check your inbox, the original email may still be valid.");
    } finally {
      setResendLoading(false);
    }
  }

  const titles: Record<string, string> = {
    login: "Welcome back",
    signup: "Create account",
    forgot: "Reset password",
    verify: "Verify your email",
  };
  const subs: Record<string, string> = {
    login: "Sign in to your workspace.",
    signup: "Set up your EverydayAI account.",
    forgot: "Enter your email and we'll send a reset link.",
    verify: "One more step — confirm your email address.",
  };
  const prompts: Record<string, string> = {
    login: "login",
    signup: "signup",
    forgot: "forgot",
    verify: "verify",
  };

  // Verify email screen
  if (mode === "verify") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-titlebar">
            <div className="titlebar-dot dot-red" />
            <div className="titlebar-dot dot-yellow" />
            <div className="titlebar-dot dot-green" />
            <div className="titlebar-text">everydayai — verify</div>
          </div>
          <div className="auth-body">
            <div className="auth-prompt">$ session --verify</div>
            <div className="auth-verify-wrap">
              <span className="auth-verify-icon">📬</span>
              <div className="auth-title" style={{ textAlign: "center" }}>Check your inbox</div>
              <div className="auth-sub" style={{ textAlign: "center", marginBottom: 8 }}>
                We sent a verification link to
              </div>
              <div className="auth-verify-email">{email || "your email"}</div>
            </div>
            {err && <div className="error-msg">{err}</div>}
            {info && <div className="info-msg">{info}</div>}
            <ul className="auth-verify-steps">
              <li>Open the email from EverydayAI in your inbox (check spam too).</li>
              <li>Click the verification link inside the email.</li>
              <li>Come back here and sign in with your credentials.</li>
            </ul>
            <button className="btn btn-primary" onClick={() => switchMode("login")}>
              Go to Sign in
            </button>
            <div className="auth-verify-resend">
              Didn't receive it?{" "}
              <a onClick={resendVerification}>
                {resendLoading ? "Sending..." : "Resend verification email"}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-titlebar">
          <div className="titlebar-dot dot-red" />
          <div className="titlebar-dot dot-yellow" />
          <div className="titlebar-dot dot-green" />
          <div className="titlebar-text">everydayai — authenticate</div>
        </div>
        <div className="auth-body">
          <div className="auth-prompt">$ session --{prompts[mode]}</div>
          <div className="auth-title">{titles[mode]}</div>
          <div className="auth-sub">{subs[mode]}</div>
          {err && <div className="error-msg">{err}</div>}
          {info && <div className="info-msg">{info}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            {mode !== "forgot" && (
              <div className="field">
                <label>Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                />
              </div>
            )}
            {mode === "login" && (
              <div style={{ textAlign: "right", marginTop: -10, marginBottom: 16 }}>
                <a className="auth-link-sm" onClick={() => switchMode("forgot")}>Forgot password?</a>
              </div>
            )}
            <button type="submit" className="btn btn-primary" disabled={loading}>
              <span className="btn-inner">
                {loading && <BtnSpinner />}
                {loading
                  ? mode === "login" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Sending..."
                  : mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              </span>
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login" ? (
              <>No account? <a onClick={() => switchMode("signup")}>Register</a></>
            ) : mode === "signup" ? (
              <>Already have an account? <a onClick={() => switchMode("login")}>Sign in</a></>
            ) : (
              <><a onClick={() => switchMode("login")}>← Back to sign in</a></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  page, setPage, sidebarOpen, setSidebarOpen, email, onLogout
}: {
  page: Page; setPage: (p: Page) => void; sidebarOpen: boolean; setSidebarOpen: (v: boolean) => void; email: string; onLogout: () => void;
}) {
  const nav: { id: Page; label: string; prefix: string }[] = [
    { id: "dashboard", label: "Dashboard", prefix: "~" },
    { id: "agents", label: "Agents", prefix: ">" },
    { id: "studio", label: "Studio", prefix: "#" },
    { id: "deploy", label: "Deploy", prefix: "$" },
    { id: "settings", label: "Settings", prefix: "@" },
  ];
  const initials = email.slice(0, 2).toUpperCase();

  const navigate = (p: Page) => {
    setPage(p);
    setSidebarOpen(false);
  };

  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-row">
            <span className="logo-bracket">[</span>
            <span className="logo-name">EverydayAI</span>
            <span className="logo-bracket">]</span>
          </div>
          <div className="logo-tag">v1.0.0-beta</div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-label">navigation</div>
          {nav.map(n => (
            <div key={n.id} className={`nav-item${page === n.id ? " active" : ""}`} onClick={() => navigate(n.id)}>
              <span className="nav-prefix">{n.prefix}</span>
              {n.label}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-row">
            <div className="user-avatar">{initials}</div>
            <div className="user-email">{email}</div>
            <button className="logout-btn" onClick={onLogout} title="Logout">↩</button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Dashboard({ setPage, refreshKey }: { setPage: (p: Page) => void; refreshKey: number }) {
  const { agents, loading, error } = useAgents(refreshKey);
  const liveCount = agents.filter(a => a.status === "live").length;

  return (
    <div className="page page-enter">
      <div className="term-line">system overview</div>
      <div className="stats-row">
        <div className="card stat-card">
          <div className="stat-label">active agents</div>
          <div className="stat-value orange">{loading ? "—" : liveCount}</div>
          <div className="stat-sub">of {agents.length} total</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">requests today</div>
          <div className="stat-value">—</div>
          <div className="stat-sub">coming soon</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">success rate</div>
          <div className="stat-value">—</div>
          <div className="stat-sub">coming soon</div>
        </div>
      </div>
      <div className="section-header">
        <div>
          <div className="section-title">Recent Agents</div>
          <div className="section-meta">Your last deployed agents</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setPage("agents")}>View all</button>
      </div>
      {loading && <div className="term-line">fetching agents...</div>}
      {error && <div className="error-msg">{error}</div>}
      <div className="card-grid">
        {agents.slice(0, 2).map(a => <AgentCard key={a.id} agent={a} />)}
      </div>
    </div>
  );
}

function AgentCard({ agent, onOpenStudio }: { agent: Agent; onOpenStudio?: () => void }) {
  return (
    <div className="card agent-card" onClick={onOpenStudio} style={{ cursor: onOpenStudio ? "pointer" : "default" }}>
      <div className="agent-card-top">
        <div className="agent-id">{agent.id}</div>
        <span className={`status-badge ${agent.status === "live" ? "status-live" : "status-draft"}`}>
          <span className="status-dot" />{agent.status}
        </span>
      </div>
      <div className="agent-name">{agent.name}</div>
      <div className="agent-desc">{agent.desc}</div>
      <div className="agent-footer">
        <span className="model-tag">{agent.model}</span>
        {onOpenStudio && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ marginLeft: "auto", fontSize: 10, padding: "3px 10px" }}
            onClick={e => { e.stopPropagation(); onOpenStudio(); }}
          >
            Open in Studio →
          </button>
        )}
      </div>
    </div>
  );
}

function AgentsPage({ onNew, refreshKey, setPage }: { onNew: (count: number) => void; refreshKey: number; setPage: (p: Page) => void }) {
  const { agents, loading, error } = useAgents(refreshKey);

  return (
    <div className="page page-enter">
      <div className="term-line">agent registry</div>
      <div className="section-header">
        <div>
          <div className="section-title">All Agents</div>
          <div className="section-meta">{loading ? "Loading..." : `${agents.length} agents configured`}</div>
        </div>
        <button className="btn btn-term btn-sm" onClick={() => onNew(agents.length)}>+ New Agent</button>
      </div>
      {loading && <div className="term-line">fetching agents...</div>}
      {error && <div className="error-msg">{error}</div>}
      <div className="card-grid">
        {agents.map(a => <AgentCard key={a.id} agent={a} onOpenStudio={() => setPage("studio")} />)}
      </div>
    </div>
  );
}

function StudioPage({ toast, setPage }: { toast: (m: string) => void; setPage: (p: Page) => void }) {
  const { run } = useSpinner();
  const [tab, setTab] = React.useState(0);
  const [agent, setAgent] = React.useState<any>(null);
  const [agents, setAgents] = React.useState<any[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [knowledge, setKnowledge] = React.useState("");
  const [kbSaving, setKbSaving] = React.useState(false);
  const [kbLoading, setKbLoading] = React.useState(false);
  const [tools, setTools] = React.useState<{ id: number; name: string; method: string; endpoint: string }[]>([]);
  const [newTool, setNewTool] = React.useState({ name: "", method: "GET", endpoint: "" });
  const [msgs, setMsgs] = React.useState([{ role: "agent", text: "Studio ready. Configure your agent on the left, then test it here." }]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loadingAgents, setLoadingAgents] = React.useState(true);
  const [studioErr, setStudioErr] = React.useState<string | null>(null);
  const endRef = React.useRef<any>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoadingAgents(true);
    setStudioErr(null);
    const token = localStorage.getItem("token");
    fetch("https://everydayai-backend-production.up.railway.app/agents/", {
      headers: { Authorization: "Bearer " + token },
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then(async data => {
        const raw: any[] = Array.isArray(data)
          ? data
          : data.agents ?? data.data ?? data.results ?? [];
        setAgents(raw);
        if (raw.length > 0) {
          setAgent(raw[0]);
          setPrompt(raw[0].system_prompt || "");
          setModel(raw[0].model || "gpt-4o-mini");
          setMsgs([{ role: "agent", text: "[" + raw[0].name + "] loaded. Configure it on the left, then test it here." }]);
          setKbLoading(true);
          const kb = await loadKbFromBackend(String(raw[0].id)).catch(() => "");
          setKnowledge(kb);
          setKbLoading(false);
        }
      })
      .catch(err => {
        if (err.name !== "AbortError") {
          setStudioErr("Could not load agents. Check your connection and refresh.");
        }
      })
      .finally(() => setLoadingAgents(false));
    return () => controller.abort();
  }, []);

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const API = "https://everydayai-backend-production.up.railway.app";

  const loadKbFromBackend = async (agentId: string): Promise<string> => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/agents/${agentId}/files`, {
        headers: { Authorization: "Bearer " + token },
      });
      if (!res.ok) return "";
      const rawData = await res.json();
      const files: any[] = Array.isArray(rawData)
        ? rawData
        : rawData.files ?? rawData.data ?? rawData.results ?? [];
      // Try to find knowledge_base file first, fall back to first text file
      const kb =
        files.find((f: any) => (f.name || f.filename || f.original_name || "").toLowerCase().includes("knowledge_base")) ||
        files.find((f: any) => (f.name || f.filename || f.original_name || "").toLowerCase().endsWith(".txt"));
      if (!kb) return "";
      if (kb.content) return kb.content;
      const fileUrl = kb.url || kb.file_url || kb.download_url;
      if (fileUrl) {
        const r = await fetch(fileUrl, { headers: { Authorization: "Bearer " + token } });
        if (r.ok) return await r.text();
      }
      return "";
    } catch { return ""; }
  };

  const saveKbToBackend = async (agentId: string, content: string) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    const blob = new Blob([content], { type: "text/plain" });
    formData.append("file", blob, "knowledge_base.txt");
    const res = await fetch(`${API}/agents/${agentId}/files`, {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const msg = errData?.detail || errData?.message || `Upload failed (${res.status})`;
      throw new Error(msg);
    }
  };

  const saveKb = async () => {
    if (!agent || !knowledge.trim()) return;
    setKbSaving(true);
    try {
      await saveKbToBackend(String(agent.id), knowledge);
      toast("Knowledge base saved to vector store.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save knowledge base.";
      toast(msg);
    } finally {
      setKbSaving(false);
    }
  };

  const selectAgent = async (id: string) => {
    const a = agents.find((x: any) => String(x.id) === id);
    if (a) {
      setAgent(a);
      setPrompt(a.system_prompt || "");
      setModel(a.model || "gpt-4o-mini");
      setKnowledge("");
      setMsgs([{ role: "agent", text: "[" + a.name + "] loaded. Test it in the chat." }]);
      setKbLoading(true);
      const kb = await loadKbFromBackend(String(a.id));
      setKnowledge(kb);
      setKbLoading(false);
    }
  };

  const save = async () => {
    if (!agent) return;
    setSaving(true);
    try {
      await run(async () => {
        const token = localStorage.getItem("token");
        await fetch("https://everydayai-backend-production.up.railway.app/agents/" + agent.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
          body: JSON.stringify({ system_prompt: prompt, model })
        });
        toast("Configuration saved");
      }, 900);
    } catch {
      toast("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const send = async () => {
    if (!input.trim() || !agent) return;
    const m = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: m }]);
    setTyping(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/agents/${agent.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ message: m }),
      });
      const data = await res.json();
      const reply = data?.response || data?.message || data?.reply || data?.content || data?.answer || (typeof data === "string" ? data : "No response received.");
      setMsgs(p => [...p, { role: "agent", text: reply }]);
    } catch {
      setMsgs(p => [...p, { role: "agent", text: "Error: could not reach the agent. Check your backend connection." }]);
    } finally {
      setTyping(false);
    }
  };

  const addTool = () => {
    if (!newTool.name.trim() || !newTool.endpoint.trim()) return;
    setTools((p: any[]) => [...p, { ...newTool, id: Date.now() }]);
    setNewTool({ name: "", method: "GET", endpoint: "" });
  };

  const methodCls = (m: string) => ({ GET: "method-get", POST: "method-post", PUT: "method-put", DELETE: "method-delete" }[m] || "method-get");

  const TABS = ["// prompt", "// knowledge", "// tools", "// deploy"];


  return (
    <div className="studio-split">

      {/* ── LEFT: CONFIG PANEL ── */}
      <div className="studio-left">
        <div className="studio-left-header">

          {loadingAgents ? (
            <div className="studio-no-agent" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="btn-spinner" style={{ borderColor: "rgba(255,85,0,0.2)", borderTopColor: "var(--orange-400)", flexShrink: 0 }} />
              <span>// loading agents...</span>
            </div>
          ) : studioErr ? (
            <div>
              <div className="error-msg" style={{ margin: "0 0 12px" }}>{studioErr}</div>
              <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={() => window.location.reload()}>
                ↺ Retry
              </button>
            </div>
          ) : agents.length === 0 ? (
            <div className="studio-no-agent">
              <span>No agent selected —</span>
              <button className="studio-no-agent-btn" onClick={() => setPage("agents")}>+ create one</button>
            </div>
          ) : (
            <select
              className="input"
              style={{ marginBottom: 14, fontSize: 12 }}
              value={agent?.id ?? ""}
              onChange={e => selectAgent(e.target.value)}
            >
              {agents.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          )}

          <div className="tabs" style={{ marginBottom: 0 }}>
            {TABS.map((t, i) => (
              <button key={t} className={"tab" + (tab === i ? " active" : "")} onClick={() => setTab(i)}>{t}</button>
            ))}
          </div>
        </div>

        <div className="studio-left-body">

          {/* PROMPT TAB */}
          {tab === 0 && (
            <div style={{ paddingTop: 20 }} className="page-enter">
              <div className="field">
                <label>// system_prompt</label>
                <textarea
                  className="input"
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="You are a helpful assistant that..."
                  style={{ minHeight: 200, lineHeight: 1.7 }}
                  disabled={!agent}
                />
              </div>
              <div className="field">
                <label>// model</label>
                <select className="input" value={model} onChange={e => setModel(e.target.value)} disabled={!agent}>
                  <option value="gpt-4o-mini">gpt-4o-mini</option>
                  <option value="gpt-4o">gpt-4o</option>
                </select>
              </div>
              <button className="btn btn-primary" onClick={save} disabled={saving || !agent}>
                <span className="btn-inner">
                  {saving && <BtnSpinner />}
                  {saving ? "Saving..." : "> save config"}
                </span>
              </button>
            </div>
          )}

          {/* KNOWLEDGE TAB */}
          {tab === 1 && (
            <div style={{ paddingTop: 20 }} className="page-enter">
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 14, lineHeight: 1.8 }}>
                // type or paste your knowledge base below. click save to upload it to your agent's vector store.
              </div>

              {kbLoading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginBottom: 10 }}>
                  <span className="btn-spinner" style={{ width: 10, height: 10, borderWidth: 1.5, borderColor: "rgba(255,85,0,0.2)", borderTopColor: "var(--orange-400)", flexShrink: 0 }} />
                  // loading knowledge base...
                </div>
              )}

              <div className="field">
                <label>// knowledge base</label>
                <textarea
                  className="input"
                  value={knowledge}
                  onChange={e => setKnowledge(e.target.value)}
                  placeholder={"Q: What is your return policy?\nA: We offer 30-day returns.\n\nQ: How do I contact support?\nA: Email support@example.com"}
                  style={{ minHeight: 300, lineHeight: 1.7 }}
                  disabled={!agent || kbLoading}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                  {knowledge.trim()
                    ? `// ${knowledge.split("\n").filter(l => l.trim()).length} lines · saved as knowledge_base.txt`
                    : "// no content yet — chat will use system prompt only"}
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: "auto" }}
                  onClick={saveKb}
                  disabled={kbSaving || kbLoading || !agent || !knowledge.trim()}
                >
                  <span className="btn-inner">
                    {kbSaving && <BtnSpinner />}
                    {kbSaving ? "Saving..." : "> save knowledge base"}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TOOLS TAB */}
          {tab === 2 && (
            <div style={{ paddingTop: 20 }} className="page-enter">
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.8 }}>
                // mock tool endpoints your agent can reference.
              </div>
              {tools.length > 0 && (
                <table className="tools-table">
                  <thead>
                    <tr><th>name</th><th>method</th><th>endpoint</th><th></th></tr>
                  </thead>
                  <tbody>
                    {tools.map((tool: any) => (
                      <tr key={tool.id}>
                        <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{tool.name}</td>
                        <td><span className={"method-badge " + methodCls(tool.method)}>{tool.method}</span></td>
                        <td style={{ color: "var(--text-muted)" }}>{tool.endpoint}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" style={{ padding: "4px 8px", fontSize: 10 }}
                            onClick={() => setTools((p: any[]) => p.filter((t: any) => t.id !== tool.id))}>rm</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 9, color: "var(--orange-400)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>// add tool</div>
                <div className="field" style={{ marginBottom: 10 }}>
                  <label>name</label>
                  <input className="input" placeholder="createLead" value={newTool.name} onChange={e => setNewTool(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: "0 0 100px" }}>
                    <div style={{ fontSize: 10, color: "var(--orange-400)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>method</div>
                    <select className="input" value={newTool.method} onChange={e => setNewTool(p => ({ ...p, method: e.target.value }))}>
                      <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <div style={{ fontSize: 10, color: "var(--orange-400)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>endpoint</div>
                    <input className="input" placeholder="/path/{id}" value={newTool.endpoint} onChange={e => setNewTool(p => ({ ...p, endpoint: e.target.value }))} />
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={addTool}>+ add tool</button>
              </div>
            </div>
          )}

          {/* DEPLOY TAB */}
          {tab === 3 && (
            <div style={{ paddingTop: 20 }} className="page-enter">
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.9 }}>
                // when you're happy with your agent, publish it to get a widget embed code.
              </div>
              <div className="studio-deploy-card">
                <div className="studio-deploy-icon">{"</>"}</div>
                <div className="studio-deploy-title">Ready to go live?</div>
                <div className="studio-deploy-desc">Head to the Deploy page to publish your agent, grab your embed snippet, and drop it into any website in seconds.</div>
                <button className="btn btn-primary" style={{ marginTop: 20, width: "100%" }} onClick={() => setPage("deploy")}>
                  Go to Deploy →
                </button>
              </div>
              <div style={{ marginTop: 20, padding: "14px 16px", background: "var(--surface-1)", borderRadius: 6, border: "var(--border)" }}>
                <div style={{ fontSize: 9, color: "var(--orange-400)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>// checklist</div>
                {[
                  { label: "System prompt configured", done: !!prompt.trim() },
                  { label: "Knowledge base added", done: !!knowledge.trim() },
                  { label: "Agent selected", done: !!agent },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: 11 }}>
                    <span style={{ color: item.done ? "var(--green-term)" : "var(--text-muted)", fontSize: 13 }}>{item.done ? "✓" : "○"}</span>
                    <span style={{ color: item.done ? "var(--text-primary)" : "var(--text-muted)" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── RIGHT: CHAT TEST BOX ── */}
      <div className="studio-right">
        <div className="studio-chat-header">
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: agent ? "var(--green-term)" : "var(--text-muted)", flexShrink: 0 }} />
          <span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
            {agent ? `// test — ${agent.name}` : "// test — no agent selected"}
          </span>
          {agent && <span style={{ marginLeft: "auto", fontSize: 9, color: "var(--text-muted)" }}>{model}</span>}
        </div>
        <div className="studio-chat-log">
          {msgs.map((m, i) => (
            <div key={i} className={"msg-row " + m.role}>
              <div className={"msg-label " + (m.role === "agent" ? "agent-lbl" : "user-lbl")}>
                {m.role === "agent" ? "[bot]" : "[you]"}
              </div>
              <div className={"msg-bubble " + m.role}>{m.text}</div>
            </div>
          ))}
          {typing && (
            <div className="msg-row">
              <div className="msg-label agent-lbl">[bot]</div>
              <div className="typing"><div className="t-dot" /><div className="t-dot" /><div className="t-dot" /></div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Chat input — prominent & clear */}
        <div className="studio-chat-input">
          <input
            className="studio-chat-input-field"
            placeholder={agent ? "Type a message to test your agent... (Enter to send)" : "Select or create an agent above to start chatting..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            disabled={!agent}
          />
          <button className="studio-chat-send" onClick={send} disabled={!agent || !input.trim()}>
            Send ↑
          </button>
        </div>
      </div>

    </div>
  );
}

type DeployDest = "socials" | "custom" | "website";
type SocialPlatform = "whatsapp" | "instagram" | "messenger";

const BASE = "https://everydayai-backend-production.up.railway.app";

interface WaStatus { connected: boolean; phone_number: string | null; phone_number_id: string | null; }

function WhatsAppPanel({ agent, toast }: { agent: Agent | null; toast: (m: string) => void }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectedInfo, setConnectedInfo] = useState<{ phone_number: string; phone_number_id: string } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [waToken, setWaToken] = useState("");
  const [phoneNumId, setPhoneNumId] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectErr, setConnectErr] = useState("");

  useEffect(() => {
    if (!agent) { setIsConnected(false); setConnectedInfo(null); return; }
    setCheckingStatus(true);
    const authTok = localStorage.getItem("token");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    fetch(`${BASE}/agents/${agent.id}/whatsapp/status`, {
      headers: { Authorization: `Bearer ${authTok}` },
      signal: controller.signal,
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        clearTimeout(timer);
        if (d?.connected && d.phone_number) {
          setIsConnected(true);
          setConnectedInfo({ phone_number: d.phone_number, phone_number_id: d.phone_number_id ?? "" });
        }
      })
      .catch(() => { /* not connected — stay on form */ })
      .finally(() => setCheckingStatus(false));
    return () => { controller.abort(); clearTimeout(timer); };
  }, [agent?.id]);

  async function connect() {
    if (!agent || !waToken.trim() || !phoneNumId.trim() || !phoneNum.trim()) return;
    setConnecting(true); setConnectErr("");
    try {
      const authTok = localStorage.getItem("token");
      const res = await fetch(`${BASE}/agents/${agent.id}/whatsapp/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${authTok}` },
        body: JSON.stringify({ phone_number_id: phoneNumId.trim(), phone_number: phoneNum.trim(), whatsapp_token: waToken.trim() }),
      });
      if (!res.ok) {
        let err = "Failed to connect WhatsApp.";
        try {
          const d = await res.json();
          const raw = d?.detail ?? d?.message ?? null;
          if (typeof raw === "string") err = raw;
          else if (Array.isArray(raw)) err = raw.map((e: any) => e?.msg || String(e)).join(", ");
        } catch { /* ignore */ }
        setConnectErr(err);
      } else {
        setIsConnected(true);
        setConnectedInfo({ phone_number: phoneNum.trim(), phone_number_id: phoneNumId.trim() });
        setWaToken(""); setPhoneNumId(""); setPhoneNum("");
        toast("WhatsApp connected successfully!");
      }
    } catch { setConnectErr("Connection failed. Check your internet."); }
    finally { setConnecting(false); }
  }

  async function disconnect() {
    if (!agent) return;
    setDisconnecting(true);
    try {
      const authTok = localStorage.getItem("token");
      const res = await fetch(`${BASE}/agents/${agent.id}/whatsapp/disconnect`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authTok}` },
      });
      if (res.ok) {
        setIsConnected(false); setConnectedInfo(null);
        toast("WhatsApp disconnected.");
      } else { toast("Failed to disconnect. Try again."); }
    } catch { toast("Failed to disconnect. Check your connection."); }
    finally { setDisconnecting(false); }
  }

  if (isConnected && connectedInfo) return (
    <div className="wa-connected-card page-enter">
      <div className="wa-status-row">
        <span className="wa-dot" />
        <span className="wa-status-label">WhatsApp Deployment Active</span>
      </div>
      <div className="wa-info-row">
        <span className="wa-info-key">Phone Number</span>
        <span className="wa-info-val">{connectedInfo.phone_number}</span>
      </div>
      <div className="wa-info-row">
        <span className="wa-info-key">Agent</span>
        <span className="wa-info-val">{agent.name}</span>
      </div>
      <div className="wa-info-row">
        <span className="wa-info-key">Phone Number ID</span>
        <span className="wa-info-val" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{connectedInfo.phone_number_id}</span>
      </div>
      <button type="button" className="btn btn-danger btn-sm" style={{ marginTop: 4, width: "auto" }} onClick={disconnect} disabled={disconnecting}>
        <span className="btn-inner">{disconnecting && <BtnSpinner />}{disconnecting ? "Disconnecting..." : "Disconnect"}</span>
      </button>
    </div>
  );

  return (
    <div className="wa-connect-form page-enter">
      <div className="wa-connect-title">Connect WhatsApp Business</div>
      <div className="wa-connect-desc">
        You will need a Meta WhatsApp Business API token and Phone Number ID.{" "}
        <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" style={{ color: "var(--orange-400)" }}>
          Get these from the Meta Developer Dashboard →
        </a>
      </div>

      {!agent && (
        <div className="alert-box" style={{ borderColor: "var(--orange-500)", color: "var(--orange-400)", background: "var(--orange-glow)" }}>
          ⚠ No agent selected — create an agent first, then come back to connect WhatsApp.
        </div>
      )}

      {checkingStatus && (
        <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>// checking existing connection...</div>
      )}
      {connectErr && (
        <div className="alert-box" style={{ borderColor: "#ff4444", color: "#ff4444", background: "rgba(255,68,68,0.06)" }}>
          ✗ {connectErr}
        </div>
      )}
      <div className="field">
        <label>WhatsApp Token</label>
        <input className="input" type="password" placeholder="Permanent access token from Meta dashboard"
          value={waToken} onChange={e => { setWaToken(e.target.value); setConnectErr(""); }} disabled={connecting || !agent} />
      </div>
      <div className="field">
        <label>Phone Number ID</label>
        <input className="input" type="text" placeholder="e.g. 1234567890123456"
          value={phoneNumId} onChange={e => { setPhoneNumId(e.target.value); setConnectErr(""); }} disabled={connecting || !agent} />
      </div>
      <div className="field">
        <label>Phone Number</label>
        <input className="input" type="text" placeholder="e.g. +234 801 234 5678"
          value={phoneNum} onChange={e => { setPhoneNum(e.target.value); setConnectErr(""); }} disabled={connecting || !agent} />
      </div>
      <button type="button" className="btn btn-primary" style={{ width: "auto" }}
        onClick={connect} disabled={!agent || connecting || !waToken.trim() || !phoneNumId.trim() || !phoneNum.trim()}>
        <span className="btn-inner">{connecting && <BtnSpinner />}{connecting ? "Connecting..." : "Connect WhatsApp"}</span>
      </button>
      <div className="wa-webhook-hint">
        <div className="wa-webhook-hint-title">// Webhook URL — paste this in your Meta App Dashboard</div>
        <div className="wa-webhook-hint-url">{BASE}/webhook/whatsapp</div>
      </div>
    </div>
  );
}

function DeployPage({ toast, refreshKey, setPage }: { toast: (m: string) => void; refreshKey: number; setPage: (p: Page) => void }) {
  const { run } = useSpinner();
  const { agents, loading, error } = useAgents(refreshKey);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [widgetToken, setWidgetToken] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [dest, setDest] = useState<DeployDest>("custom");
  const [social, setSocial] = useState<SocialPlatform>("whatsapp");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgent) setSelectedAgent(agents[0]);
  }, [agents]);

  async function publish() {
    if (!selectedAgent) return;
    setPublishing(true);
    setPublishError(null);
    try {
      await run(async () => {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `https://everydayai-backend-production.up.railway.app/agents/${selectedAgent.id}/publish`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const wt = res.data?.widget_token ?? res.data?.token ?? res.data?.access_token ?? JSON.stringify(res.data);
        setWidgetToken(wt);
        setSelectedAgent(prev => prev ? { ...prev, status: "live" } : null);
        toast("Agent published!");
      }, 1200);
    } catch (e: unknown) {
      const d = axios.isAxiosError(e) ? e.response?.data : null;
      const msg = d?.detail || d?.message || (typeof d === "string" ? d : null) || "Publish failed. Please try again.";
      setPublishError(msg);
      toast("Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  function copyText(text: string, key: string) {
    const doFallback = () => {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      } catch {}
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(doFallback);
    } else {
      doFallback();
    }
    setCopied(key);
    toast("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  }

  const widgetSnippet = widgetToken
    ? `<!-- EverydayAI Widget -->\n<script>\n  window.EverydayAIConfig = {\n    token: "${widgetToken}",\n    position: "bottom-right",\n    theme: "dark"\n  };\n</script>\n<script src="https://everydayai-backend-production.up.railway.app/widget.js" async></script>`
    : null;

  const SOCIALS: { id: SocialPlatform; label: string; icon: string; color: string; helpText: string; btnLabel: string }[] = [
    { id: "whatsapp",  label: "WhatsApp",  icon: "💬", color: "#25d366", helpText: "Connect your WhatsApp Business number to deploy your agent directly in WhatsApp conversations.", btnLabel: "Connect WhatsApp" },
    { id: "instagram", label: "Instagram", icon: "📷", color: "#e1306c", helpText: "Deploy your agent to handle Instagram DMs and comments automatically.", btnLabel: "Connect Instagram" },
    { id: "messenger", label: "Messenger", icon: "💭", color: "#0084ff", helpText: "Integrate your agent into Facebook Messenger to chat with your page visitors.", btnLabel: "Connect Messenger" },
  ];

  const activeSocial = SOCIALS.find(s => s.id === social)!;

  return (
    <div className="page page-enter deploy-page">
      <div className="term-line">deployment</div>

      {/* ── HOW IT WORKS — progress tracker ── */}
      {!loading && (
        <div className="deploy-how-it-works">
          <div style={{ fontSize: 9, color: "var(--orange-400)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14, fontFamily: "var(--font-mono)" }}>// how it works</div>
          <div className="deploy-how-steps">
            {[
              { num: "1", label: "Create\nan agent", done: agents.length > 0, active: agents.length === 0 },
              { num: "2", label: "Select &\nPublish", done: !!widgetToken, active: agents.length > 0 && !widgetToken },
              { num: "3", label: "Copy embed\ncode", done: false, active: !!widgetToken },
            ].map(s => (
              <div key={s.num} className={`deploy-how-step${s.done ? " done" : s.active ? " active" : ""}`}>
                <div className="deploy-how-num">{s.done ? "✓" : s.num}</div>
                <div className="deploy-how-label" style={{ whiteSpace: "pre" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── NO AGENTS BANNER — only when truly empty, not when API failed ── */}
      {!loading && !error && agents.length === 0 && (
        <div className="deploy-no-agent-banner">
          <div className="deploy-no-agent-banner-text">
            <div className="deploy-no-agent-banner-title">You need an agent first</div>
            <div className="deploy-no-agent-banner-sub">Create your first agent, then come back here to publish it and get your embed code.</div>
          </div>
          <button className="btn btn-primary" style={{ width: "auto", flexShrink: 0 }} onClick={() => setPage("agents")}>
            + Create Agent
          </button>
        </div>
      )}

      {/* ── AGENT SELECTOR BAR — only when agents exist ── */}
      {loading && <div className="term-line">loading agents...</div>}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div className="error-msg" style={{ flex: 1, margin: 0 }}>{error}</div>
          <button className="btn btn-ghost btn-sm" onClick={() => window.location.reload()}>↺ Retry</button>
        </div>
      )}

      {!loading && agents.length > 0 && (
        <div className="deploy-agent-bar">
          <div className="deploy-agent-info">
            <div
              className="deploy-agent-dot"
              style={{ background: selectedAgent?.status === "live" ? "var(--green-term)" : "var(--text-muted)" }}
            />
            <div style={{ minWidth: 0 }}>
              <select
                className="input"
                style={{ background: "none", border: "none", padding: "0", fontSize: 14, fontFamily: "var(--font-sans)", fontWeight: 600, color: "var(--white)", cursor: "pointer", outline: "none" }}
                value={selectedAgent?.id ?? ""}
                onChange={e => {
                  const a = agents.find(x => String(x.id) === e.target.value) ?? null;
                  setSelectedAgent(a);
                  setWidgetToken(null);
                  setPublishError(null);
                }}
              >
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <div className="deploy-agent-id">{selectedAgent?.id}</div>
            </div>
          </div>
          <button className="btn btn-term btn-sm" onClick={publish} disabled={publishing || !selectedAgent}>
            <span className="btn-inner">
              {publishing && <BtnSpinner />}
              {publishing ? "Publishing..." : selectedAgent?.status === "live" ? "Re-publish" : "Publish Agent"}
            </span>
          </button>
        </div>
      )}

      {publishError && <div className="error-msg">{publishError}</div>}

      {/* ── DESTINATION SELECTOR — always visible ── */}
      {!loading && (
        <>
          <div className="deploy-dest-label">Select a Deployment Destination</div>
          <div className="deploy-dest-tabs">
            {([
              { id: "socials" as DeployDest, icon: "📱", label: "Socials" },
              { id: "custom"  as DeployDest, icon: "</>", label: "Custom Code" },
              { id: "website" as DeployDest, icon: "🌐", label: "Website" },
            ] as const).map(d => (
              <div
                key={d.id}
                className={`deploy-dest-tab${dest === d.id ? " active" : ""}`}
                onClick={() => setDest(d.id)}
              >
                <span className="deploy-dest-icon">{d.icon}</span>
                {d.label}
              </div>
            ))}
          </div>

          {/* ── SOCIALS PANEL ── */}
          {dest === "socials" && (
            <div className="page-enter">
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>Select Social Deployment</div>
              <div style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--orange-400)", marginBottom: 8, opacity: 0.7 }}>
                // active: {social}
              </div>

              <div className="social-grid">
                {SOCIALS.map(s => (
                  <div
                    key={s.id}
                    className={`social-btn${social === s.id ? " selected" : ""}`}
                    onClick={() => {
                      console.log("[EverydayAI] Social tab clicked:", s.id);
                      setSocial(s.id);
                    }}
                  >
                    <span className="social-icon">{s.icon}</span>
                    {s.label}
                    {s.id === "whatsapp" && (
                      <span style={{ fontSize: 8, background: "rgba(37,211,102,0.15)", color: "#25d366", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 3, padding: "1px 5px", marginTop: 3, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>LIVE</span>
                    )}
                  </div>
                ))}
              </div>

              {social === "whatsapp" && (
                <WhatsAppPanel agent={selectedAgent} toast={toast} />
              )}

              {social !== "whatsapp" && (
                <div className="page-enter">
                  <div className="social-help">
                    {activeSocial.helpText}
                  </div>
                  <div className="social-mock-badge">// coming soon</div>
                </div>
              )}
            </div>
          )}

          {/* ── CUSTOM CODE PANEL ── */}
          {dest === "custom" && (
            <div className="custom-code-panel page-enter">
              {agents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{"</>"}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--white)", marginBottom: 6 }}>No agent to deploy yet</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 20, lineHeight: 1.7 }}>You need at least one agent before you can generate an embed code.</div>
                  <button className="btn btn-primary" style={{ width: "auto", margin: "0 auto" }} onClick={() => setPage("agents")}>+ Create Your First Agent</button>
                </div>
              ) : !widgetToken ? (
                <div className="deploy-no-token">
                  <strong>// publish first</strong> — Click "Publish Agent" above to generate your widget token, then your embed snippet will appear here ready to copy.
                </div>
              ) : (
                <>
                  <div className="snippet-label">// 1. widget token</div>
                  <div className="snippet-block">
                    <button className={`snippet-copy${copied === "token" ? " copied" : ""}`} onClick={() => copyText(widgetToken, "token")}>
                      {copied === "token" ? "✓ copied" : "copy"}
                    </button>
                    <span style={{ color: "var(--text-muted)" }}>Bearer </span>{widgetToken}
                  </div>

                  <div className="snippet-label">// 2. embed snippet — paste before &lt;/body&gt;</div>
                  <div className="snippet-block" style={{ whiteSpace: "pre" }}>
                    <button className={`snippet-copy${copied === "snippet" ? " copied" : ""}`} onClick={() => copyText(widgetSnippet!, "snippet")}>
                      {copied === "snippet" ? "✓ copied" : "copy"}
                    </button>
                    {widgetSnippet}
                  </div>
                </>
              )}

              <div className="install-steps">
                <div style={{ fontSize: 9, color: "var(--orange-400)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 4 }}>// how to embed</div>
                {[
                  { num: "01", title: "Publish your agent", body: "Click \"Publish Agent\" at the top to generate your unique widget token." },
                  { num: "02", title: "Copy the snippet", body: "Use the copy button above to grab the full embed code." },
                  { num: "03", title: "Paste into your website", body: "Drop the snippet before the closing </body> tag on any HTML page — works with any website builder." },
                  { num: "04", title: "Your widget goes live", body: "The chat bubble appears instantly on your site. Visitors can chat with your agent right away." },
                ].map(s => (
                  <div key={s.num} className="install-step">
                    <div className="install-step-num">{s.num}</div>
                    <div className="install-step-body"><strong>{s.title}</strong>{s.body}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── WEBSITE PANEL ── */}
          {dest === "website" && (
            <div className="website-mock page-enter">
              <div className="website-mock-icon">🌐</div>
              <div className="website-mock-title">Website Builder Integration</div>
              <div className="website-mock-desc">
                One-click deployment to popular website builders like Webflow, Squarespace, Wix, and WordPress — no code required.
              </div>
              <div className="coming-soon-badge">// coming soon</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SettingsPage({ email, toast, plan, onUpgrade }: {
  email: string; toast: (m: string) => void; plan: string; onUpgrade: () => void;
}) {
  const [apiKey, setApiKey] = useState("");
  const [keyStatus, setKeyStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [keyMsg, setKeyMsg] = useState("");

  const saveKey = async () => {
    if (!apiKey.trim() || keyStatus === "saving") return;
    const trimmed = apiKey.trim();
    if (!trimmed.startsWith("sk-") || trimmed.length < 20) {
      setKeyStatus("error");
      setKeyMsg("Invalid key format. OpenAI keys start with 'sk-' and are at least 20 characters.");
      return;
    }
    setKeyStatus("saving");
    setKeyMsg("");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://everydayai-backend-production.up.railway.app/auth/api-key", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ openai_api_key: trimmed }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        let errMsg = "Failed to save API key.";
        try {
          const d = await res.json();
          const raw = d?.detail ?? d?.message ?? null;
          if (typeof raw === "string") errMsg = raw;
          else if (Array.isArray(raw)) errMsg = raw.map((e: any) => e?.msg || e?.message || String(e)).join(", ");
          else if (raw && typeof raw === "object") errMsg = raw.msg || raw.message || errMsg;
        } catch { /* ignore */ }
        setKeyStatus("error");
        setKeyMsg(errMsg);
      } else {
        setKeyStatus("success");
        setKeyMsg("API key saved successfully.");
      }
    } catch (e: any) {
      clearTimeout(timer);
      const isTimeout = e?.name === "AbortError";
      setKeyStatus("error");
      setKeyMsg(isTimeout ? "Request timed out. Check your connection." : "Failed to save API key. Check your connection.");
    }
  };

  const currentPlan = PLANS.find(p => p.id === plan) || PLANS[0];
  const agentLimit = PLAN_LIMITS[plan] ?? 1;
  const isAgency = plan === "agency";

  return (
    <div className="page page-enter settings-wrap">
      <div className="term-line">workspace settings</div>

      <div className="settings-block">
        <div className="settings-block-title">Account</div>
        <div className="settings-block-desc">Your account details and workspace info.</div>
        <div className="field">
          <label>Email</label>
          <input className="input" value={email} disabled />
        </div>
      </div>

      <div className="divider" />

      <div className="settings-block">
        <div className="settings-block-title">Billing & Plan</div>
        <div className="settings-block-desc">Manage your subscription and usage limits.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, background: "rgba(255,85,0,0.06)", border: "1px solid rgba(255,85,0,0.18)", borderRadius: 6, padding: "14px 16px" }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--orange-400)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                {currentPlan.tier}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
                {currentPlan.name}
                {currentPlan.price > 0 && (
                  <span style={{ fontWeight: 400, fontSize: 12, color: "var(--text-muted)", marginLeft: 6 }}>
                    ${currentPlan.price}/mo
                  </span>
                )}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                {isAgency ? "Unlimited agents" : `Up to ${agentLimit} agent${agentLimit > 1 ? "s" : ""}`} · {currentPlan.msgLabel}
              </div>
            </div>
            {plan !== "agency" && (
              <button type="button" className="btn btn-primary btn-sm" style={{ flexShrink: 0, whiteSpace: "nowrap" }} onClick={onUpgrade}>
                Upgrade plan
              </button>
            )}
          </div>
          {plan !== "agency" && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
              // upgrade unlocks more agents, social channels, and advanced tools.
            </div>
          )}
        </div>
      </div>

      <div className="divider" />

      <div className="settings-block">
        <div className="settings-block-title">OpenAI API Key</div>
        <div className="settings-block-desc">Connect your OpenAI key to power agents in your workspace.</div>
        {keyStatus === "success" && (
          <div className="alert-box alert-ok" style={{ marginBottom: 12 }}>
            ✓ {keyMsg}
          </div>
        )}
        {keyStatus === "error" && (
          <div className="alert-box" style={{ borderColor: "#ff4444", color: "#ff4444", background: "rgba(255,68,68,0.06)", marginBottom: 12 }}>
            ✗ {keyMsg}
          </div>
        )}
        <div className="input-row">
          <input
            className="input"
            type="password"
            placeholder="sk-..."
            value={apiKey}
            onChange={e => { setApiKey(e.target.value); if (keyStatus !== "idle") setKeyStatus("idle"); }}
            disabled={keyStatus === "saving"}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ flexShrink: 0, minWidth: 80 }}
            onClick={saveKey}
            disabled={keyStatus === "saving" || !apiKey.trim()}
          >
            <span className="btn-inner">
              {keyStatus === "saving" && <BtnSpinner />}
              {keyStatus === "saving" ? "Saving..." : "Save Key"}
            </span>
          </button>
        </div>
      </div>

      <div className="divider" />

      <div className="settings-block">
        <div className="settings-block-title">Danger Zone</div>
        <div className="settings-block-desc">Irreversible actions. Proceed with caution.</div>
        <button className="btn btn-danger btn-sm" onClick={() => toast("Action blocked in demo mode.")}>Delete workspace</button>
      </div>
    </div>
  );
}

function NewAgentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { run } = useSpinner();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!name.trim()) { setErr("Agent name is required."); return; }
    setSubmitting(true);
    try {
      await run(async () => {
        const token = localStorage.getItem("token");
        await axios.post(
          "https://everydayai-backend-production.up.railway.app/agents/",
          { name, description: desc, system_prompt: systemPrompt, model },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        onCreated();
      }, 1000);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        if (!e.response) {
          setErr("Cannot reach the server. Please check your connection.");
        } else {
          const d = e.response.data;
          const msg = d?.detail || d?.message || (typeof d === "string" ? d : null) || "Failed to create agent.";
          setErr(typeof msg === "object" ? JSON.stringify(msg) : msg);
        }
      } else {
        setErr("Failed to create agent. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-bar">
          <span className="modal-bar-title">new-agent.config</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-title">New Agent</div>
          <div className="modal-sub">Configure a new agent for your workspace.</div>
          {err && <div className="error-msg">{err}</div>}
          <form onSubmit={submit}>
            <div className="field"><label>Agent name</label><input className="input" placeholder="e.g. SupportBot" value={name} onChange={e => { setName(e.target.value); setErr(""); }} /></div>
            <div className="field"><label>Description</label><textarea className="input" placeholder="What does this agent do?" value={desc} onChange={e => setDesc(e.target.value)} style={{ minHeight: 70 }} /></div>
            <div className="field"><label>System prompt</label><textarea className="input" placeholder="You are a helpful assistant that..." value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} style={{ minHeight: 90 }} /></div>
            <div className="field">
              <label>Model</label>
              <select className="input" value={model} onChange={e => setModel(e.target.value)}>
                <option value="gpt-4o">gpt-4o</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ width: "auto" }} disabled={submitting}>
                <span className="btn-inner">
                  {submitting && <BtnSpinner />}
                  {submitting ? "Creating..." : "Create agent"}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ─── PAYMENT CALLBACK HANDLER ─── */
function PaymentCallback({ reference, plan, onDone }: {
  reference: string; plan: string | null; onDone: (plan: string) => void;
}) {
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [confirmedPlan, setConfirmedPlan] = useState<string | null>(plan);

  useEffect(() => {
    async function verify() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://everydayai-backend-production.up.railway.app/auth/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ reference, plan }),
        });
        if (!res.ok) throw new Error("Verification failed");
        const data = await res.json();
        const resolved = data.plan || plan || "starter";
        setConfirmedPlan(resolved);
        setStatus("success");
        window.history.replaceState({}, "", window.location.pathname);
        setTimeout(() => onDone(resolved), 2200);
      } catch {
        setStatus("failed");
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    verify();
  }, []);

  return (
    <div className="overlay" style={{ zIndex: 9999 }}>
      <div className="modal">
        <div className="modal-bar">
          <span className="modal-bar-title">payment-verification.log</span>
        </div>
        <div className="modal-body" style={{ padding: "36px 24px", textAlign: "center" }}>
          {status === "verifying" && (
            <>
              <div className="gs-ring" style={{ margin: "0 auto 18px" }} />
              <div className="modal-title">Verifying payment...</div>
              <div className="modal-sub">Please wait while we confirm your transaction.</div>
            </>
          )}
          {status === "success" && (
            <>
              <div style={{ fontSize: 36, marginBottom: 14, color: "var(--orange-400)" }}>✓</div>
              <div className="modal-title">Payment confirmed!</div>
              <div className="modal-sub">
                Your plan has been upgraded to{" "}
                <strong style={{ color: "var(--orange-400)" }}>{confirmedPlan}</strong>.{" "}
                Taking you back...
              </div>
            </>
          )}
          {status === "failed" && (
            <>
              <div style={{ fontSize: 36, marginBottom: 14, color: "#ff4444" }}>✕</div>
              <div className="modal-title">Verification failed</div>
              <div className="modal-sub" style={{ marginBottom: 8 }}>
                We could not verify your payment automatically. Please contact support with this reference:
              </div>
              <code style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 4, display: "inline-block", marginBottom: 18, wordBreak: "break-all" }}>
                {reference}
              </code>
              <br />
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onDone("")}
              >
                Continue to dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  agents: "Agents",
  studio: "Studio",
  deploy: "Deploy",
  settings: "Settings",
};

export default function App() {
  const [booting, setBooting] = useState(true);

  const [user, setUser] = useState<string | null>(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    return token && email ? email : null;
  });
  const [userPlan, setUserPlan] = useState("free");
  const [upgradeModal, setUpgradeModal] = useState(false);

  // Detect Paystack redirect-back params on page load
  const [paymentRef, setPaymentRef] = useState<string | null>(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("reference") || p.get("trxref") || null;
  });
  const [paymentCallbackPlan, setPaymentCallbackPlan] = useState<string | null>(() => {
    const p = new URLSearchParams(window.location.search);
    return p.get("plan") || null;
  });
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  // Fetch user plan from backend
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    fetch("https://everydayai-backend-production.up.railway.app/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.plan) setUserPlan(data.plan); })
      .catch(() => {});
  }, [user]);


  function toast(msg: string) { setToastMsg(msg); }

  function onAgentCreated() {
    setModal(false);
    setRefreshKey(k => k + 1);
    toast("Agent created.");
  }

  const agentLimit = PLAN_LIMITS[userPlan] ?? 1;

  // Called when user clicks "+ New Agent" — checks plan limit first
  function handleNewAgent(currentAgentCount: number) {
    if (currentAgentCount >= agentLimit) {
      setUpgradeModal(true);
    } else {
      setModal(true);
    }
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "everydayai-css";
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    axios.defaults.timeout = 12000;
    const id = axios.interceptors.response.use(
      r => r,
      err => {
        if (axios.isAxiosError(err) && err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userEmail");
          setUser(null);
        }
        return Promise.reject(err);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  function handleAuth(email: string) {
    localStorage.setItem("userEmail", email);
    setUser(email);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
  }

  if (!user) return (
    <ErrorBoundary>
      <SpinnerProvider>
        {booting && <BootLoader onDone={() => setBooting(false)} />}
        <div className="app" data-theme={theme} style={{ visibility: booting ? "hidden" : "visible" }}>
          <AuthPage onAuth={handleAuth} />
        </div>
      </SpinnerProvider>
    </ErrorBoundary>
  );

  return (
    <ErrorBoundary>
    <SpinnerProvider>
      {booting && <BootLoader onDone={() => setBooting(false)} />}
      <div className="app" data-theme={theme} style={{ visibility: booting ? "hidden" : "visible" }}>
      <div className="scanlines" />
      <div className="layout">
        <Sidebar
          page={page}
          setPage={setPage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          email={user}
          onLogout={handleLogout}
        />
        <main className="main">
          <div className="topbar">
            <div className="topbar-left">
              <button className="hamburger" onClick={() => setSidebarOpen(p => !p)} aria-label="Menu">☰</button>
              <span className="topbar-prompt">$</span>
              <span className="topbar-title">{PAGE_TITLES[page]}</span>
            </div>
            <div className="topbar-actions">
              <span
                style={{ fontSize: 9, fontFamily: "var(--font-mono)", color: "var(--orange-400)", background: "rgba(255,85,0,0.08)", border: "1px solid rgba(255,85,0,0.2)", borderRadius: 3, padding: "3px 9px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                onClick={() => setUpgradeModal(true)}
                title="Click to upgrade"
              >
                {userPlan}
              </span>
              <span className="topbar-meta">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </div>
          {page === "dashboard" && <Dashboard setPage={setPage} refreshKey={refreshKey} />}
          {page === "agents" && <AgentsPage onNew={handleNewAgent} refreshKey={refreshKey} setPage={setPage} />}
          {page === "studio" && <StudioPage toast={toast} setPage={setPage} />}
          {page === "deploy" && <DeployPage toast={toast} refreshKey={refreshKey} setPage={setPage} />}
          {page === "settings" && <SettingsPage email={user} toast={toast} plan={userPlan} onUpgrade={() => setUpgradeModal(true)} />}
        </main>
      </div>
      {modal && <NewAgentModal onClose={() => setModal(false)} onCreated={onAgentCreated} />}
      {upgradeModal && (
        <UpgradeModal
          currentPlan={userPlan}
          email={user}
          onClose={() => setUpgradeModal(false)}
          onSuccess={(plan) => {
            setUserPlan(plan);
            setUpgradeModal(false);
            setModal(true);
            toast(`Upgraded to ${plan}!`);
          }}
        />
      )}
      {paymentRef && (
        <PaymentCallback
          reference={paymentRef}
          plan={paymentCallbackPlan}
          onDone={(resolvedPlan) => {
            if (resolvedPlan) {
              setUserPlan(resolvedPlan);
              toast(`Plan upgraded to ${resolvedPlan}!`);
            }
            setPaymentRef(null);
            setPaymentCallbackPlan(null);
          }}
        />
      )}
      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>
    </SpinnerProvider>
    </ErrorBoundary>
  );
}
