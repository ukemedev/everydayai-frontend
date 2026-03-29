import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

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
  }

  html { background: var(--black); }
  body { font-family: var(--font-mono); background: var(--black); color: var(--gray-100); min-height: 100vh; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--black); }
  ::-webkit-scrollbar-thumb { background: var(--black-700); }
  ::-webkit-scrollbar-thumb:hover { background: var(--orange-500); }

  .scanlines { position: fixed; inset: 0; z-index: 0; pointer-events: none; background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px); }
  .app { position: relative; z-index: 1; min-height: 100vh; }

  @keyframes termLoad { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes typeBlink { 0%,60%,100%{opacity:0.2;transform:scale(0.8)} 30%{opacity:1;transform:scale(1)} }

  .auth-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .auth-card { width: 100%; max-width: 420px; background: var(--black-900); border: 1px solid var(--black-700); border-top: 2px solid var(--orange-500); animation: termLoad 0.4s ease; border-radius: var(--radius-md); overflow: hidden; }
  .auth-titlebar { background: var(--black-800); padding: 10px 16px; display: flex; align-items: center; gap: 8px; border-bottom: var(--border); }
  .titlebar-dot { width: 10px; height: 10px; border-radius: 50%; }
  .dot-red { background: #ff5f57; } .dot-yellow { background: #ffbd2e; } .dot-green { background: #28ca42; }
  .titlebar-text { font-size: 11px; color: var(--gray-400); margin-left: 8px; letter-spacing: 0.05em; }
  .auth-body { padding: 32px; }
  .auth-prompt { font-size: 11px; color: var(--orange-500); margin-bottom: 24px; letter-spacing: 0.05em; }
  .auth-title { font-family: var(--font-sans); font-size: 24px; font-weight: 700; margin-bottom: 6px; color: var(--white); }
  .auth-sub { font-size: 11px; color: var(--gray-400); margin-bottom: 28px; }
  .auth-switch { text-align: center; margin-top: 20px; font-size: 11px; color: var(--gray-600); }
  .auth-switch a { color: var(--orange-400); cursor: pointer; }
  .auth-switch a:hover { color: var(--orange-300); }
  .error-msg { background: rgba(255,51,51,0.08); border: 1px solid rgba(255,51,51,0.25); color: var(--red); padding: 10px 14px; font-size: 11px; margin-bottom: 18px; border-radius: var(--radius); }

  .field { margin-bottom: 18px; }
  .field label { display: block; font-size: 10px; color: var(--orange-400); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 8px; }
  .input { width: 100%; padding: 10px 14px; background: var(--black); border: var(--border); color: var(--gray-100); font-family: var(--font-mono); font-size: 13px; outline: none; transition: var(--transition); border-radius: var(--radius); }
  .input:focus { border-color: var(--orange-500); box-shadow: 0 0 0 2px var(--orange-glow); }
  .input::placeholder { color: var(--gray-600); }
  textarea.input { resize: vertical; min-height: 120px; line-height: 1.7; }
  select.input { cursor: pointer; }

  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 18px; border: none; font-family: var(--font-mono); font-size: 12px; font-weight: 500; cursor: pointer; transition: var(--transition); letter-spacing: 0.04em; border-radius: var(--radius); white-space: nowrap; }
  .btn-primary { background: var(--orange-500); color: var(--black); width: 100%; font-weight: 700; }
  .btn-primary:hover { background: var(--orange-400); box-shadow: 0 0 20px var(--orange-glow-strong); }
  .btn-primary:active { transform: scale(0.99); }
  .btn-ghost { background: transparent; color: var(--gray-400); border: var(--border); }
  .btn-ghost:hover { border-color: var(--gray-600); color: var(--gray-100); }
  .btn-danger { background: rgba(255,51,51,0.1); color: var(--red); border: 1px solid rgba(255,51,51,0.25); }
  .btn-danger:hover { background: rgba(255,51,51,0.2); }
  .btn-term { background: rgba(0,255,136,0.08); color: var(--green-term); border: 1px solid rgba(0,255,136,0.25); }
  .btn-term:hover { background: rgba(0,255,136,0.15); box-shadow: 0 0 12px rgba(0,255,136,0.15); }
  .btn-sm { padding: 7px 14px; font-size: 11px; }
  .btn-icon { padding: 8px; width: 34px; height: 34px; }

  .layout { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; min-height: 100vh; flex-shrink: 0; background: var(--black-950); border-right: var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; }
  .sidebar-header { padding: 20px 16px 16px; border-bottom: var(--border); }
  .logo-row { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
  .logo-bracket { color: var(--orange-500); font-size: 22px; font-weight: 700; line-height: 1; }
  .logo-name { font-family: var(--font-sans); font-size: 16px; font-weight: 700; color: var(--white); letter-spacing: -0.02em; }
  .logo-tag { font-size: 9px; color: var(--gray-600); letter-spacing: 0.1em; padding-left: 2px; }
  .sidebar-nav { padding: 12px 10px; flex: 1; }
  .nav-label { font-size: 9px; color: var(--gray-600); letter-spacing: 0.14em; text-transform: uppercase; padding: 8px 8px 4px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: var(--radius); cursor: pointer; transition: var(--transition); color: var(--gray-400); font-size: 12px; border: 1px solid transparent; margin-bottom: 2px; }
  .nav-item:hover { color: var(--gray-100); background: var(--black-800); }
  .nav-item.active { color: var(--orange-400); background: rgba(255,85,0,0.08); border-color: rgba(255,85,0,0.2); }
  .nav-prefix { color: var(--gray-600); font-size: 11px; width: 14px; flex-shrink: 0; transition: var(--transition); }
  .nav-item.active .nav-prefix { color: var(--orange-500); }
  .sidebar-footer { padding: 12px 10px; border-top: var(--border); }
  .user-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: var(--radius); background: var(--black-800); border: var(--border); }
  .user-avatar { width: 28px; height: 28px; border-radius: var(--radius); background: var(--orange-500); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--black); font-family: var(--font-sans); flex-shrink: 0; }
  .user-email { font-size: 10px; color: var(--gray-400); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .logout-btn { background: none; border: none; color: var(--gray-600); cursor: pointer; font-size: 12px; font-family: var(--font-mono); padding: 2px 4px; transition: var(--transition); flex-shrink: 0; }
  .logout-btn:hover { color: var(--orange-400); }

  .main { margin-left: 220px; flex: 1; min-height: 100vh; }
  .topbar { height: 48px; padding: 0 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: var(--border); background: rgba(8,8,8,0.9); backdrop-filter: blur(8px); position: sticky; top: 0; z-index: 50; }
  .topbar-left { display: flex; align-items: center; gap: 8px; }
  .topbar-prompt { color: var(--orange-500); font-size: 11px; }
  .topbar-title { font-family: var(--font-sans); font-size: 14px; font-weight: 600; color: var(--white); }
  .topbar-meta { font-size: 10px; color: var(--gray-600); }
  .page { padding: 28px; }
  .page-enter { animation: termLoad 0.25s ease; }

  .term-line { font-size: 9px; color: var(--gray-600); letter-spacing: 0.1em; text-transform: uppercase; display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
  .term-line::before { content: '//'; color: var(--orange-500); flex-shrink: 0; }
  .term-line::after { content: ''; flex: 1; height: 1px; background: var(--black-800); }

  .card { background: var(--black-900); border: var(--border); border-radius: var(--radius-md); padding: 20px; transition: var(--transition); }
  .card:hover { border-color: var(--black-600); }
  .card-hl { border-left: 2px solid var(--orange-500); }

  .stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card { padding: 18px 20px; position: relative; overflow: hidden; }
  .stat-card::after { content: ''; position: absolute; top: 0; right: 0; width: 40px; height: 40px; background: radial-gradient(circle at top right, var(--orange-glow), transparent); }
  .stat-label { font-size: 9px; color: var(--gray-600); letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
  .stat-value { font-family: var(--font-sans); font-size: 36px; font-weight: 700; color: var(--white); line-height: 1; margin-bottom: 6px; }
  .stat-value.green { color: var(--green-term); }
  .stat-value.orange { color: var(--orange-500); }
  .stat-sub { font-size: 10px; color: var(--gray-600); }

  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 16px; }
  .agent-card { cursor: pointer; }
  .agent-card:hover { border-color: rgba(255,85,0,0.3); }
  .agent-card:hover .agent-name { color: var(--orange-400); }
  .agent-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
  .agent-id { font-size: 9px; color: var(--gray-600); letter-spacing: 0.06em; }
  .agent-name { font-family: var(--font-sans); font-size: 15px; font-weight: 600; color: var(--white); margin-bottom: 6px; transition: var(--transition); }
  .agent-desc { font-size: 11px; color: var(--gray-400); line-height: 1.7; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .agent-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: var(--border); }
  .status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 2px; text-transform: uppercase; font-weight: 500; }
  .status-live { background: rgba(0,255,136,0.08); color: var(--green-term); border: 1px solid rgba(0,255,136,0.2); }
  .status-draft { background: var(--black-800); color: var(--gray-600); border: var(--border); }
  .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
  .status-live .status-dot { animation: pulse 2s ease-in-out infinite; }
  .model-tag { font-size: 10px; color: var(--gray-600); }

  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-title { font-family: var(--font-sans); font-size: 16px; font-weight: 600; color: var(--white); }
  .section-meta { font-size: 10px; color: var(--gray-600); margin-top: 2px; }

  .empty { text-align: center; padding: 64px 24px; border: 1px dashed var(--black-700); border-radius: var(--radius-md); }
  .empty-ascii { font-size: 11px; color: var(--black-700); margin-bottom: 20px; line-height: 1.6; white-space: pre; font-family: var(--font-mono); }
  .empty-title { font-family: var(--font-sans); font-size: 16px; font-weight: 600; color: var(--gray-400); margin-bottom: 6px; }
  .empty-desc { font-size: 11px; color: var(--gray-600); margin-bottom: 24px; }

  .overlay { position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 24px; animation: fadeIn 0.1s ease; }
  .modal { background: var(--black-900); border: var(--border); border-top: 2px solid var(--orange-500); width: 100%; max-width: 500px; animation: termLoad 0.2s ease; border-radius: var(--radius-md); overflow: hidden; }
  .modal-bar { background: var(--black-800); padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: var(--border); }
  .modal-bar-title { font-size: 11px; color: var(--gray-400); }
  .modal-close { background: none; border: none; color: var(--gray-600); cursor: pointer; font-size: 14px; font-family: var(--font-mono); transition: var(--transition); }
  .modal-close:hover { color: var(--orange-400); }
  .modal-body { padding: 28px; }
  .modal-title { font-family: var(--font-sans); font-size: 18px; font-weight: 700; color: var(--white); margin-bottom: 4px; }
  .modal-sub { font-size: 11px; color: var(--gray-600); margin-bottom: 24px; }
  .modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; }

  .tabs { display: flex; gap: 0; margin-bottom: 24px; border-bottom: var(--border); }
  .tab { padding: 10px 18px; font-size: 11px; cursor: pointer; transition: var(--transition); color: var(--gray-600); border-bottom: 2px solid transparent; margin-bottom: -1px; font-family: var(--font-mono); letter-spacing: 0.04em; background: none; border-top: none; border-left: none; border-right: none; }
  .tab:hover { color: var(--gray-200); }
  .tab.active { color: var(--orange-400); border-bottom-color: var(--orange-500); }

  .file-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; border-radius: var(--radius); background: var(--black); border: var(--border); margin-bottom: 8px; font-size: 11px; }
  .file-info { display: flex; align-items: center; gap: 8px; color: var(--gray-400); }
  .file-prefix { color: var(--orange-500); }
  .upload-zone { border: 1px dashed var(--black-700); border-radius: var(--radius-md); padding: 36px; text-align: center; cursor: pointer; transition: var(--transition); }
  .upload-zone:hover { border-color: var(--orange-500); background: rgba(255,85,0,0.03); }
  .upload-ascii { font-size: 11px; color: var(--black-700); margin-bottom: 12px; line-height: 1.6; transition: var(--transition); white-space: pre; font-family: var(--font-mono); }
  .upload-zone:hover .upload-ascii { color: var(--orange-500); }
  .upload-text { font-size: 12px; color: var(--gray-600); }
  .upload-sub { font-size: 10px; color: var(--black-700); margin-top: 4px; }

  .chat-wrap { height: 500px; display: flex; flex-direction: column; }
  .chat-log { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 14px; }
  .msg-row { display: flex; gap: 10px; }
  .msg-row.user { flex-direction: row-reverse; }
  .msg-label { font-size: 10px; font-family: var(--font-mono); flex-shrink: 0; padding-top: 3px; }
  .msg-label.agent-lbl { color: var(--orange-500); }
  .msg-label.user-lbl { color: var(--gray-600); }
  .msg-bubble { max-width: 78%; padding: 10px 14px; font-size: 12px; line-height: 1.7; border-radius: var(--radius); }
  .msg-bubble.agent { background: var(--black-800); border: var(--border); color: var(--gray-200); border-left: 2px solid var(--orange-500); }
  .msg-bubble.user { background: rgba(255,85,0,0.1); border: 1px solid rgba(255,85,0,0.25); color: var(--gray-100); }
  .typing { display: flex; gap: 3px; align-items: center; padding: 10px 14px; background: var(--black-800); border: var(--border); border-left: 2px solid var(--orange-500); border-radius: var(--radius); width: fit-content; }
  .t-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--orange-500); animation: typeBlink 1.2s ease-in-out infinite; }
  .t-dot:nth-child(2){animation-delay:0.2s} .t-dot:nth-child(3){animation-delay:0.4s}
  .chat-input-row { display: flex; gap: 8px; padding: 12px 16px; border-top: var(--border); align-items: center; }
  .chat-prompt-sym { font-size: 11px; color: var(--orange-500); flex-shrink: 0; }
  .chat-input { flex: 1; background: none; border: none; color: var(--gray-100); font-family: var(--font-mono); font-size: 12px; outline: none; }
  .chat-input::placeholder { color: var(--gray-600); }
  .chat-send { background: var(--orange-500); color: var(--black); border: none; width: 28px; height: 28px; border-radius: var(--radius); cursor: pointer; font-size: 12px; font-weight: 700; flex-shrink: 0; transition: var(--transition); }
  .chat-send:hover { background: var(--orange-400); box-shadow: 0 0 12px var(--orange-glow-strong); }

  .code-block { background: var(--black); border: var(--border); border-left: 2px solid var(--orange-500); padding: 18px 20px; font-family: var(--font-mono); font-size: 12px; color: var(--green-term); line-height: 1.8; position: relative; word-break: break-all; border-radius: var(--radius); margin: 14px 0; }
  .copy-btn { position: absolute; top: 10px; right: 10px; background: rgba(255,85,0,0.1); border: 1px solid rgba(255,85,0,0.25); color: var(--orange-400); padding: 4px 10px; border-radius: var(--radius); font-size: 10px; cursor: pointer; font-family: var(--font-mono); transition: var(--transition); }
  .copy-btn:hover { background: rgba(255,85,0,0.2); }
  .step-row { display: flex; gap: 14px; padding: 14px 0; border-bottom: var(--border); }
  .step-row:last-child { border-bottom: none; }
  .step-num { font-size: 10px; color: var(--orange-500); width: 24px; flex-shrink: 0; font-weight: 700; padding-top: 2px; }
  .step-text { font-size: 12px; color: var(--gray-400); line-height: 1.7; }
  .step-text strong { color: var(--gray-100); display: block; margin-bottom: 2px; }
  .token-box { background: var(--black); border: var(--border); padding: 12px 16px; font-family: var(--font-mono); font-size: 11px; color: var(--gray-400); border-radius: var(--radius); word-break: break-all; line-height: 1.7; }
  .token-prefix { color: var(--orange-500); }
  .alert-box { border-left: 2px solid; padding: 12px 16px; border-radius: var(--radius); font-size: 11px; line-height: 1.7; margin-bottom: 20px; }
  .alert-warn { background: rgba(255,189,0,0.06); border-color: #ffbd00; color: #ffbd00; }
  .alert-ok { background: rgba(0,255,136,0.06); border-color: var(--green-term); color: var(--green-term); }

  .settings-block { margin-bottom: 24px; }
  .settings-block-title { font-family: var(--font-sans); font-size: 13px; font-weight: 600; color: var(--white); margin-bottom: 4px; }
  .settings-block-desc { font-size: 11px; color: var(--gray-600); margin-bottom: 16px; line-height: 1.7; }
  .input-row { display: flex; gap: 8px; }
  .input-row .input { flex: 1; }

  .toast { position: fixed; bottom: 20px; right: 20px; z-index: 999; background: var(--black-900); border: var(--border); border-left: 2px solid var(--orange-500); padding: 12px 18px; font-size: 11px; color: var(--gray-200); animation: termLoad 0.25s ease; display: flex; align-items: center; gap: 8px; border-radius: var(--radius); }
  .toast-prefix { color: var(--orange-500); }
  .divider { height: 1px; background: var(--black-800); margin: 20px 0; }
  .studio-wrap { max-width: 700px; }
  .deploy-wrap { max-width: 660px; }
  .settings-wrap { max-width: 540px; }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-220px); transition: transform 0.3s ease; z-index: 100; }
    .sidebar.open { transform: translateX(0); }
    .main { margin-left: 0; }
    .topbar { padding: 0 16px; }
    .page { padding: 16px; }
    .stats-row { grid-template-columns: 1fr; }
    .card-grid { grid-template-columns: 1fr; }
    .auth-card { max-width: 100%; }
    .studio-wrap { max-width: 100%; }
    .deploy-wrap { max-width: 100%; }
    .settings-wrap { max-width: 100%; }
    .modal { max-width: calc(100vw - 32px); }
    .topbar-meta { display: none; }
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

interface Message {
  role: "agent" | "user";
  text: string;
}

function useAgents(refreshKey = 0) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    axios
      .get("https://everydayai-backend-production.up.railway.app/agents/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(res => {
        setAgents(Array.isArray(res.data) ? res.data : res.data?.agents ?? []);
      })
      .catch(() => setError("Failed to load agents."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return { agents, loading, error };
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="toast">
      <span className="toast-prefix">&gt;&gt;</span>
      {msg}
    </div>
  );
}

function AuthPage({ onAuth }: { onAuth: (email: string) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setErr("");
    if (!email || !pass) { setErr("All fields required."); return; }
    if (pass.length < 6) { setErr("Password must be 6+ characters."); return; }
    const url = mode === "login"
      ? "https://everydayai-backend-production.up.railway.app/auth/login"
      : "https://everydayai-backend-production.up.railway.app/auth/register";
    setLoading(true);
    try {
      const res = await axios.post(url, { email, password: pass });
      const token = res.data?.access_token;
      if (!token) throw new Error("No access token returned.");
      localStorage.setItem("token", token);
      onAuth(email);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setErr(err.response.data.message);
      } else {
        setErr(mode === "login"
          ? "Login failed. Please check your credentials."
          : "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-titlebar">
          <span className="titlebar-dot dot-red" />
          <span className="titlebar-dot dot-yellow" />
          <span className="titlebar-dot dot-green" />
          <span className="titlebar-text">everydayai — {mode === "login" ? "authenticate" : "register"}</span>
        </div>
        <div className="auth-body">
          <div className="auth-prompt">$ {mode === "login" ? "session --login" : "session --new"}</div>
          <div className="auth-title">{mode === "login" ? "Welcome back" : "Create account"}</div>
          <div className="auth-sub">{mode === "login" ? "Sign in to your workspace." : "Set up your agent workspace."}</div>
          {err && <div className="error-msg">{err}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} disabled={loading} onChange={e => { setEmail(e.target.value); setErr(""); }} />
            </div>
            <div className="field">
              <label>password</label>
              <input className="input" type="password" placeholder="••••••••" value={pass} disabled={loading} onChange={e => { setPass(e.target.value); setErr(""); }} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? (mode === "login" ? "// authenticating..." : "// registering...") : (mode === "login" ? "Sign in" : "Create account")}
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login" ? <>No account? <a onClick={() => { if (!loading) { setMode("signup"); setErr(""); } }}>Register</a></> : <>Have an account? <a onClick={() => { if (!loading) { setMode("login"); setErr(""); } }}>Sign in</a></>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, email, onLogout }: { page: Page; setPage: (p: Page) => void; email: string; onLogout: () => void }) {
  const nav: { id: Page; label: string; prefix: string }[] = [
    { id: "dashboard", label: "Dashboard", prefix: "~" },
    { id: "agents", label: "Agents", prefix: ">" },
    { id: "studio", label: "Studio", prefix: "#" },
    { id: "deploy", label: "Deploy", prefix: "$" },
    { id: "settings", label: "Settings", prefix: "@" },
  ];
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <aside className="sidebar">
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
          <div key={n.id} className={`nav-item${page === n.id ? " active" : ""}`} onClick={() => setPage(n.id)}>
            <span className="nav-prefix">{n.prefix}</span>
            {n.label}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar">{initials}</div>
          <div className="user-email">{email}</div>
          <button className="logout-btn" onClick={onLogout}>↩</button>
        </div>
      </div>
    </aside>
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
          <div className="stat-value">1,204</div>
          <div className="stat-sub">+18% vs yesterday</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">success rate</div>
          <div className="stat-value green">98.2%</div>
          <div className="stat-sub">last 24 hours</div>
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

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="card agent-card">
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
      </div>
    </div>
  );
}

function AgentsPage({ onNew, refreshKey }: { onNew: () => void; refreshKey: number }) {
  const { agents, loading, error } = useAgents(refreshKey);

  return (
    <div className="page page-enter">
      <div className="term-line">agent registry</div>
      <div className="section-header">
        <div>
          <div className="section-title">All Agents</div>
          <div className="section-meta">{loading ? "Loading..." : `${agents.length} agents configured`}</div>
        </div>
        <button className="btn btn-term btn-sm" onClick={onNew}>+ New Agent</button>
      </div>
      {loading && <div className="term-line">fetching agents...</div>}
      {error && <div className="error-msg">{error}</div>}
      <div className="card-grid">
        {agents.map(a => <AgentCard key={a.id} agent={a} />)}
      </div>
    </div>
  );
}

function StudioPage({ toast }) {
  const [tab, setTab] = React.useState(0);
  const [agent, setAgent] = React.useState(null);
  const [agents, setAgents] = React.useState([]);
  const [prompt, setPrompt] = React.useState("");
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [files, setFiles] = React.useState([]);
  const [msgs, setMsgs] = React.useState([]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loadingAgents, setLoadingAgents] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const fileRef = React.useRef(null);
  const endRef = React.useRef(null);

  React.useEffect(() => {
    setLoadingAgents(true);
    setLoadError("");
    const token = localStorage.getItem("token");
    fetch("https://everydayai-backend-production.up.railway.app/agents/", {
      headers: { Authorization: "Bearer " + token }
    }).then(r => r.json()).then(data => {
      const list = Array.isArray(data) ? data : (data.agents || []);
      setAgents(list);
      if (list.length > 0) {
        setAgent(list[0]);
        setPrompt(list[0].system_prompt || "");
        setModel(list[0].model || "gpt-4o-mini");
        setMsgs([{ role: "agent", text: "[" + list[0].name + "] online. How can I assist?" }]);
      }
    }).catch(() => {
      setLoadError("Failed to load agents. Please refresh and try again.");
    }).finally(() => {
      setLoadingAgents(false);
    });
  }, []);

  React.useEffect(() => { endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  if (loadingAgents) return (
    <div className="page page-enter">
      <div className="term-line">agent studio</div>
      <div style={{ color: "var(--gray-600)", fontSize: 12, padding: "40px 0" }}>// loading agents...</div>
    </div>
  );

  if (loadError) return (
    <div className="page page-enter">
      <div className="term-line">agent studio</div>
      <div className="error-msg">{loadError}</div>
    </div>
  );

  const savePrompt = async () => {
    if (!agent) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    await fetch("https://everydayai-backend-production.up.railway.app/agents/" + agent.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ system_prompt: prompt, model })
    }).catch(() => {});
    setSaving(false);
    toast("Prompt saved successfully");
  };

  const send = async () => {
    if (!input.trim() || !agent) return;
    const m = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: m }]);
    setTyping(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://everydayai-backend-production.up.railway.app/agents/" + agent.id + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
        body: JSON.stringify({ message: m })
      });
      const data = await res.json();
      setTyping(false);
      setMsgs(p => [...p, { role: "agent", text: data.reply || "No response." }]);
    } catch(e) {
      setTyping(false);
      setMsgs(p => [...p, { role: "agent", text: "Connection error. Please try again." }]);
    }
  };

  const tabs = ["// prompt", "// knowledge", "// tools", "// chat"];

  if (!agent) return (
    <div className="page page-enter">
      <div className="term-line">agent studio</div>
      <div className="empty">
        <div className="empty-title">No agents yet</div>
        <div className="empty-desc">// create an agent first before using studio</div>
      </div>
    </div>
  );

  return (
    <div className="page page-enter">
      <div className="section-header" style={{ marginBottom: 16 }}>
        <div>
          <div className="term-line" style={{ marginBottom: 4 }}>agent studio</div>
          <div className="section-title">{agent.name}</div>
          <div className="section-meta">// model: {agent.model}</div>
        </div>
        <select className="input" style={{ width: "auto", fontSize: 11 }} value={agent.id} onChange={e => {
          const a = agents.find(x => String(x.id) === e.target.value);
          if (a) { setAgent(a); setPrompt(a.system_prompt || ""); setModel(a.model || "gpt-4o-mini"); setMsgs([{ role: "agent", text: "[" + a.name + "] online." }]); }
        }}>
          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>
      <div className="tabs">
        {tabs.map((t, i) => <button key={t} className={"tab" + (tab === i ? " active" : "")} onClick={() => setTab(i)}>{t}</button>)}
      </div>
      {tab === 0 && (
        <div className="studio-wrap page-enter">
          <div className="card card-hl">
            <div className="field">
              <label>// system_prompt</label>
              <textarea className="input" value={prompt} onChange={e => setPrompt(e.target.value)} style={{ minHeight: 240 }} placeholder="You are a helpful assistant..." />
            </div>
            <div className="field">
              <label>// model</label>
              <select className="input" value={model} onChange={e => setModel(e.target.value)}>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4o">gpt-4o</option>
              </select>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-primary" style={{ width: "auto", padding: "9px 22px" }} onClick={savePrompt} disabled={saving}>
                {saving ? "// saving..." : "> save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
      {tab === 1 && (
        <div className="studio-wrap page-enter">
          <div className="card card-hl">
            <div style={{ fontSize: 11, color: "var(--gray-600)", marginBottom: 16, lineHeight: 1.8 }}>
              // upload documents to agent knowledge base
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.txt,.docx,.md" style={{ display: "none" }} onChange={e => {
              const f = e.target.files && e.target.files[0];
              if (f) { setFiles(p => [...p, f.name]); toast(f.name + " uploaded"); }
            }} />
            <div className="upload-zone" onClick={() => fileRef.current && fileRef.current.click()}>
              <div className="upload-ascii">{"⬆"}</div>
              <div className="upload-text">// click to upload file</div>
              <div className="upload-sub">PDF, TXT, DOCX, MD</div>
            </div>
            {files.length > 0 && files.map((f, i) => (
              <div key={i} className="file-row">
                <div className="file-info"><span className="file-prefix">{">"}</span>{f}</div>
                <button className="btn btn-danger btn-sm" onClick={() => setFiles(p => p.filter((_, j) => j !== i))}>rm</button>
              </div>
            ))}
            {files.length === 0 && <div style={{ textAlign: "center", padding: "20px 0", fontSize: 10, color: "var(--gray-600)" }}>// no files indexed</div>}
          </div>
        </div>
      )}
      {tab === 2 && (
        <div className="studio-wrap page-enter">
          <div className="card card-hl">
            <div style={{ fontSize: 10, color: "var(--orange-500)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>// tools — coming in v2</div>
            <div style={{ fontSize: 11, color: "var(--gray-600)", lineHeight: 1.8, marginBottom: 24 }}>// connect your agent to external tools and apis</div>
            {[
              { name: "Airtable", desc: "Save leads to Airtable bases", icon: "📊" },
              { name: "WhatsApp", desc: "Deploy agent to WhatsApp Business", icon: "💬" },
              { name: "Webhook", desc: "Send data to any HTTP endpoint", icon: "🔗" },
              { name: "Google Sheets", desc: "Write data to Google Sheets", icon: "📋" },
            ].map(tool => (
              <div key={tool.name} className="card" style={{ marginBottom: 10, opacity: 0.5, display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{ fontSize: 20 }}>{tool.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--white)" }}>{tool.name}</div>
                  <div style={{ fontSize: 10, color: "var(--gray-600)" }}>{tool.desc}</div>
                </div>
                <div style={{ marginLeft: "auto", fontSize: 9, color: "var(--orange-500)", background: "rgba(255,85,0,0.08)", border: "1px solid rgba(255,85,0,0.2)", padding: "3px 8px", borderRadius: 2 }}>v2</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 3 && (
        <div className="studio-wrap page-enter">
          <div className="card card-hl chat-wrap" style={{ padding: 0 }}>
            <div style={{ padding: "10px 16px", borderBottom: "var(--border)", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green-term)" }} />
              <span style={{ fontSize: 10, color: "var(--gray-400)" }}>// studio_preview — {agent.name}</span>
            </div>
            <div className="chat-log">
              {msgs.map((m, i) => (
                <div key={i} className={"msg-row " + m.role}>
                  <div className={"msg-label " + (m.role === "agent" ? "agent-lbl" : "user-lbl")}>{m.role === "agent" ? "[bot]" : "[usr]"}</div>
                  <div className={"msg-bubble " + m.role}>{m.text}</div>
                </div>
              ))}
              {typing && <div className="msg-row"><div className="msg-label agent-lbl">[bot]</div><div className="typing"><div className="t-dot" /><div className="t-dot" /><div className="t-dot" /></div></div>}
              <div ref={endRef} />
            </div>
            <div className="chat-input-row">
              <span className="chat-prompt-sym">{">"}_ </span>
              <input className="chat-input" placeholder="type message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} />
              <button className="chat-send" onClick={send}>↑</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeployPage({ toast, refreshKey }: { toast: (m: string) => void; refreshKey: number }) {
  const { agents, loading, error } = useAgents(refreshKey);
  const [publishing, setPublishing] = useState<Record<string, boolean>>({});
  const [widgetTokens, setWidgetTokens] = useState<Record<string, string>>({});
  const [publishErrors, setPublishErrors] = useState<Record<string, string>>({});

  async function publish(agentId: string) {
    setPublishing(p => ({ ...p, [agentId]: true }));
    setPublishErrors(e => { const next = { ...e }; delete next[agentId]; return next; });
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `https://everydayai-backend-production.up.railway.app/agents/${agentId}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const widgetToken = res.data?.widget_token ?? res.data?.token ?? res.data?.access_token ?? JSON.stringify(res.data);
      setWidgetTokens(t => ({ ...t, [agentId]: widgetToken }));
      toast("Agent published!");
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e) && e.response?.data?.message
        ? e.response.data.message
        : "Publish failed. Please try again.";
      setPublishErrors(err => ({ ...err, [agentId]: msg }));
      toast("Publish failed.");
    } finally {
      setPublishing(p => ({ ...p, [agentId]: false }));
    }
  }

  return (
    <div className="page page-enter deploy-wrap">
      <div className="term-line">deployment</div>
      <div className="section-title" style={{ marginBottom: 20 }}>Deploy Agents</div>

      {loading && <div className="term-line">loading agents...</div>}
      {error && <div className="error-msg">{error}</div>}

      {!loading && !error && agents.length === 0 && (
        <div className="empty">
          <div className="empty-title">No agents yet</div>
          <div className="empty-desc">Create an agent first before deploying.</div>
        </div>
      )}

      {agents.map(agent => (
        <div key={agent.id} className="card card-hl" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div className="agent-name" style={{ marginBottom: 2 }}>{agent.name}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="agent-id">{agent.id}</span>
                <span className={`status-badge ${agent.status === "live" ? "status-live" : "status-draft"}`}>
                  <span className="status-dot" />{agent.status}
                </span>
              </div>
            </div>
            <button
              className="btn btn-term btn-sm"
              onClick={() => publish(agent.id)}
              disabled={!!publishing[agent.id]}
            >
              {publishing[agent.id] ? "Publishing..." : "Publish"}
            </button>
          </div>

          {publishErrors[agent.id] && (
            <div className="error-msg" style={{ marginBottom: 0 }}>{publishErrors[agent.id]}</div>
          )}

          {widgetTokens[agent.id] && (
            <div>
              <div style={{ fontSize: 10, color: "var(--orange-400)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Widget Token</div>
              <div className="token-box">
                <span className="token-prefix">Bearer </span>{widgetTokens[agent.id]}
              </div>
              <button
                className="copy-btn"
                style={{ position: "static", marginTop: 8 }}
                onClick={() => { navigator.clipboard.writeText(widgetTokens[agent.id]); toast("Token copied!"); }}
              >
                copy token
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="card" style={{ marginTop: 8 }}>
        <div className="settings-block-title" style={{ marginBottom: 16 }}>Deploy Steps</div>
        <div className="step-row"><div className="step-num">01</div><div className="step-text"><strong>Configure environment</strong>Set your API keys and environment variables in Settings.</div></div>
        <div className="step-row"><div className="step-num">02</div><div className="step-text"><strong>Upload context files</strong>Add knowledge files in Studio to ground your agent.</div></div>
        <div className="step-row"><div className="step-num">03</div><div className="step-text"><strong>Test in Studio</strong>Chat with your agent to validate behavior before going live.</div></div>
        <div className="step-row"><div className="step-num">04</div><div className="step-text"><strong>Publish</strong>Click the Publish button above to push your agent to production and get its widget token.</div></div>
      </div>
    </div>
  );
}

function SettingsPage({ email, toast }: { email: string; toast: (m: string) => void }) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [saveOk, setSaveOk] = useState(false);

  async function submitApiKey(e: React.FormEvent) {
    e.preventDefault();
    setSaveErr("");
    if (!openaiKey.trim()) { setSaveErr("Please enter your OpenAI API key."); return; }
    setSaving(true);
    setSaveErr("");
    setSaveOk(false);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        "https://everydayai-backend-production.up.railway.app/auth/api-key",
        { openai_api_key: openaiKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveOk(true);
      toast("API key saved.");
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e) && e.response?.data?.message
        ? e.response.data.message
        : "Failed to save API key. Please try again.";
      setSaveErr(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page page-enter settings-wrap">
      <div className="term-line">settings</div>
      <div className="section-title" style={{ marginBottom: 24 }}>Workspace Settings</div>

      <div className="settings-block">
        <div className="settings-block-title">Account</div>
        <div className="settings-block-desc">Your workspace identity.</div>
        <div className="field"><label>Email</label><input className="input" value={email} readOnly /></div>
      </div>

      <div className="divider" />

      <div className="settings-block">
        <div className="settings-block-title">OpenAI API Key</div>
        <div className="settings-block-desc">Your key is stored securely and used to power your agents. It is never exposed to the client after saving.</div>
        {saveOk && <div className="alert-box alert-ok" style={{ marginBottom: 14 }}>✓ API key saved successfully.</div>}
        {saveErr && <div className="error-msg">{saveErr}</div>}
        <form onSubmit={submitApiKey}>
          <div className="field" style={{ marginBottom: 12 }}>
            <label>OpenAI API Key</label>
            <div className="input-row">
              <input
                className="input"
                type="password"
                placeholder="sk-••••••••••••••••••••••••••••••••"
                value={openaiKey}
                onChange={e => { setOpenaiKey(e.target.value); setSaveErr(""); setSaveOk(false); }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ width: "auto", flexShrink: 0 }}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
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
    setErr("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://everydayai-backend-production.up.railway.app/agents/",
        { name, description: desc, system_prompt: systemPrompt, model },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCreated();
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data?.message) {
        setErr(e.response.data.message);
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
                <option value="claude-3.5">claude-3.5</option>
              </select>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost btn-sm" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm" style={{ width: "auto" }} disabled={submitting}>
                {submitting ? "Creating..." : "Create agent"}
              </button>
            </div>
          </form>
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
  const [user, setUser] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function toast(msg: string) {
    setToastMsg(msg);
  }

  function onAgentCreated() {
    setModal(false);
    setRefreshKey(k => k + 1);
    toast("Agent created.");
  }

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  if (!user) return <div className="app"><AuthPage onAuth={setUser} /></div>;

  return (
    <div className="app">
      <div className="scanlines" />
      <div className="layout">
        <Sidebar page={page} setPage={setPage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} email={user} onLogout={() => setUser(null)} />
        <main className="main">
          <div className="topbar">
            <div className="topbar-left"><button className="hamburger" onClick={() => setSidebarOpen(p => !p)} style={{background:"none",border:"none",color:"var(--orange-500)",fontSize:"18px",cursor:"pointer",marginRight:"8px",display:"none"}}>☰</button>
              <span className="topbar-prompt">$</span>
              <span className="topbar-title">{PAGE_TITLES[page]}</span>
            </div>
            <span className="topbar-meta">{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>
          {page === "dashboard" && <Dashboard setPage={setPage} refreshKey={refreshKey} />}
          {page === "agents" && <AgentsPage onNew={() => setModal(true)} refreshKey={refreshKey} />}
          {page === "studio" && <StudioPage toast={toast} />}
          {page === "deploy" && <DeployPage toast={toast} refreshKey={refreshKey} />}
          {page === "settings" && <SettingsPage email={user} toast={toast} />}
        </main>
      </div>
      {modal && <NewAgentModal onClose={() => setModal(false)} onCreated={onAgentCreated} />}
      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>
  );
}
