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
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/signup";
      await axios.post(
        `https://everydayai-backend-production.up.railway.app${endpoint}`,
        { email, password: pass }
      );
      if (mode === "signup") {
        setMode("login");
        setErr("");
        setLoading(false);
        return;
      }
      const res = await axios.post(
        "https://everydayai-backend-production.up.railway.app/auth/login",
        { email, password: pass }
      );
      const token = res.data?.access_token || res.data?.token;
      if (token) localStorage.setItem("token", token);
      onAuth(email);
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const d = e.response?.data;
        setErr(d?.detail || d?.message || (typeof d === "string" ? d : null) || "Something went wrong.");
      } else {
        setErr("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
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
          <div className="auth-prompt">$ session --{mode}</div>
          <div className="auth-title">{mode === "login" ? "Welcome back" : "Create account"}</div>
          <div className="auth-sub">{mode === "login" ? "Sign in to your workspace." : "Set up your EverydayAI account."}</div>
          {err && <div className="error-msg">{err}</div>}
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          <div className="auth-switch">
            {mode === "login" ? (
              <>No account? <a onClick={() => { setMode("signup"); setErr(""); }}>Register</a></>
            ) : (
              <>Already have an account? <a onClick={() => { setMode("login"); setErr(""); }}>Sign in</a></>
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

type KbStatus = "saved" | "saving" | "unsaved";

function StudioPage({ toast, setPage }: { toast: (m: string) => void; setPage: (p: Page) => void }) {
  const [tab, setTab] = React.useState(0);
  const [agent, setAgent] = React.useState<any>(null);
  const [agents, setAgents] = React.useState<any[]>([]);
  const [prompt, setPrompt] = React.useState("");
  const [model, setModel] = React.useState("gpt-4o-mini");
  const [knowledge, setKnowledge] = React.useState("");
  const [kbStatus, setKbStatus] = React.useState<KbStatus>("saved");
  const [tools, setTools] = React.useState([
    { id: 1, name: "createLead", method: "POST", endpoint: "/leads" },
    { id: 2, name: "getContact", method: "GET", endpoint: "/contacts/{id}" },
  ]);
  const [newTool, setNewTool] = React.useState({ name: "", method: "GET", endpoint: "" });
  const [msgs, setMsgs] = React.useState([{ role: "agent", text: "Studio ready. Configure your agent on the left, then test it here." }]);
  const [input, setInput] = React.useState("");
  const [typing, setTyping] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [loadingAgents, setLoadingAgents] = React.useState(true);
  const endRef = React.useRef<any>(null);
  const kbTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    setLoadingAgents(true);
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
        setMsgs([{ role: "agent", text: "[" + list[0].name + "] loaded. Configure it on the left, then test it here." }]);
      }
    }).catch(() => {}).finally(() => setLoadingAgents(false));
  }, []);

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  const handleKnowledgeChange = (val: string) => {
    setKnowledge(val);
    setKbStatus("unsaved");
    if (kbTimerRef.current) clearTimeout(kbTimerRef.current);
    kbTimerRef.current = setTimeout(() => {
      setKbStatus("saving");
      setTimeout(() => setKbStatus("saved"), 600);
    }, 1200);
  };

  React.useEffect(() => () => { if (kbTimerRef.current) clearTimeout(kbTimerRef.current); }, []);

  const selectAgent = (id: string) => {
    const a = agents.find((x: any) => String(x.id) === id);
    if (a) {
      setAgent(a);
      setPrompt(a.system_prompt || "");
      setModel(a.model || "gpt-4o-mini");
      setMsgs([{ role: "agent", text: "[" + a.name + "] loaded. Test it in the chat." }]);
    }
  };

  const save = async () => {
    if (!agent) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    await fetch("https://everydayai-backend-production.up.railway.app/agents/" + agent.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ system_prompt: prompt, model })
    }).catch(() => {});
    setSaving(false);
    toast("Configuration saved");
  };

  const simulateResponse = (userMsg: string) => {
    const words = userMsg.toLowerCase().split(/\s+/);
    if (knowledge.trim()) {
      const lines = knowledge.split("\n").filter(l => l.trim());
      const hit = lines.find(l => words.some(w => w.length > 3 && l.toLowerCase().includes(w)));
      if (hit) return `Based on my knowledge base: "${hit.trim()}" — anything else?`;
      return `I have ${lines.length} knowledge entries but couldn't find a direct match. Could you be more specific?`;
    }
    if (prompt.trim()) {
      return `[Acting as: "${prompt.slice(0, 80)}${prompt.length > 80 ? "…" : ""}"] — Simulated preview response.`;
    }
    return `Got your message. Add a system prompt under the Prompt tab to define my behavior.`;
  };

  const send = async () => {
    if (!input.trim()) return;
    const m = input.trim();
    setInput("");
    setMsgs(p => [...p, { role: "user", text: m }]);
    setTyping(true);
    await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
    setTyping(false);
    setMsgs(p => [...p, { role: "agent", text: simulateResponse(m) }]);
  };

  const addTool = () => {
    if (!newTool.name.trim() || !newTool.endpoint.trim()) return;
    setTools((p: any[]) => [...p, { ...newTool, id: Date.now() }]);
    setNewTool({ name: "", method: "GET", endpoint: "" });
  };

  const methodCls = (m: string) => ({ GET: "method-get", POST: "method-post", PUT: "method-put", DELETE: "method-delete" }[m] || "method-get");

  const TABS = ["// prompt", "// knowledge", "// tools", "// deploy"];

  const kbStatusLabel = kbStatus === "saved" ? "// auto-saved" : kbStatus === "saving" ? "// saving..." : "// unsaved changes";

  return (
    <div className="studio-split">

      {/* ── LEFT: CONFIG PANEL ── */}
      <div className="studio-left">
        <div className="studio-left-header">

          {loadingAgents ? (
            <div className="studio-no-agent">// loading agents...</div>
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
                {saving ? "// saving..." : "> save config"}
              </button>
            </div>
          )}

          {/* KNOWLEDGE TAB */}
          {tab === 1 && (
            <div style={{ paddingTop: 20 }} className="page-enter">
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.8 }}>
                // type or paste your knowledge base below. changes are saved automatically.
              </div>

              <div className={`kb-save-status ${kbStatus}`}>
                <span className="kb-dot" />
                {kbStatusLabel}
              </div>

              <div className="field">
                <label>// knowledge base</label>
                <textarea
                  className="input"
                  value={knowledge}
                  onChange={e => handleKnowledgeChange(e.target.value)}
                  placeholder={"Q: What is your return policy?\nA: We offer 30-day returns.\n\nQ: How do I contact support?\nA: Email support@example.com"}
                  style={{ minHeight: 280, lineHeight: 1.7 }}
                />
              </div>
              <div style={{ fontSize: 10, color: "var(--text-muted)" }}>
                {knowledge.trim()
                  ? `// ${knowledge.split("\n").filter(l => l.trim()).length} lines indexed — used live in chat preview`
                  : "// no content yet — chat will use system prompt only"}
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

function DeployPage({ toast, refreshKey }: { toast: (m: string) => void; refreshKey: number }) {
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
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `https://everydayai-backend-production.up.railway.app/agents/${selectedAgent.id}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const wt = res.data?.widget_token ?? res.data?.token ?? res.data?.access_token ?? JSON.stringify(res.data);
      setWidgetToken(wt);
      toast("Agent published!");
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
    navigator.clipboard.writeText(text);
    setCopied(key);
    toast("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  }

  const widgetSnippet = widgetToken
    ? `<!-- EverydayAI Widget -->\n<script>\n  window.EverydayAIConfig = {\n    token: "${widgetToken}",\n    position: "bottom-right",\n    theme: "dark"\n  };\n</script>\n<script src="https://cdn.everydayai.app/widget.js" async></script>`
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

      {/* ── AGENT SELECTOR BAR ── */}
      {loading && <div className="term-line">loading agents...</div>}
      {error && <div className="error-msg">{error}</div>}
      {!loading && !error && agents.length === 0 && (
        <div className="empty">
          <div className="empty-title">No agents yet</div>
          <div className="empty-desc">Create an agent first before deploying.</div>
        </div>
      )}

      {!loading && agents.length > 0 && (
        <>
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
              {publishing ? "Publishing..." : selectedAgent?.status === "live" ? "Re-publish" : "Publish Agent"}
            </button>
          </div>

          {publishError && <div className="error-msg">{publishError}</div>}

          {/* ── DESTINATION SELECTOR ── */}
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
              <div className="social-mock-badge">// mock — coming soon</div>
              <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase" }}>Select Social Deployment</div>
              <div className="social-grid">
                {SOCIALS.map(s => (
                  <div
                    key={s.id}
                    className={`social-btn${social === s.id ? " selected" : ""}`}
                    onClick={() => setSocial(s.id)}
                  >
                    <span className="social-icon">{s.icon}</span>
                    {s.label}
                  </div>
                ))}
              </div>
              <div className="social-help">
                // Need help? <a onClick={() => toast("Tutorial coming soon!")}>Watch our {activeSocial.label} Deployment tutorial</a>
              </div>
              <button
                className="btn btn-primary"
                style={{ width: "auto", paddingLeft: 24, paddingRight: 24 }}
                onClick={() => toast(`${activeSocial.label} integration coming soon!`)}
              >
                {activeSocial.btnLabel}
              </button>
            </div>
          )}

          {/* ── CUSTOM CODE PANEL ── */}
          {dest === "custom" && (
            <div className="custom-code-panel page-enter">
              {!widgetToken ? (
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

function SettingsPage({ email, toast }: { email: string; toast: (m: string) => void }) {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  const saveKey = () => {
    if (!apiKey.trim()) return;
    setSaved(true);
    toast("API key saved.");
    setTimeout(() => setSaved(false), 3000);
  };

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
        <div className="settings-block-title">OpenAI API Key</div>
        <div className="settings-block-desc">Connect your OpenAI key to power agents in your workspace.</div>
        {saved && <div className="alert-box alert-ok">// key saved successfully.</div>}
        <div className="input-row">
          <input className="input" type="password" placeholder="sk-..." value={apiKey} onChange={e => setApiKey(e.target.value)} />
          <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }} onClick={saveKey}>Save</button>
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
      const token = localStorage.getItem("token");
      await axios.post(
        "https://everydayai-backend-production.up.railway.app/agents/",
        { name, description: desc, system_prompt: systemPrompt, model },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onCreated();
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
  const [user, setUser] = useState<string | null>(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    return token && email ? email : null;
  });
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("theme") as "dark" | "light") || "dark";
  });

  function toast(msg: string) { setToastMsg(msg); }

  function onAgentCreated() {
    setModal(false);
    setRefreshKey(k => k + 1);
    toast("Agent created.");
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
    <div className="app" data-theme={theme}>
      <AuthPage onAuth={handleAuth} />
    </div>
  );

  return (
    <div className="app">
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
          {page === "agents" && <AgentsPage onNew={() => setModal(true)} refreshKey={refreshKey} />}
          {page === "studio" && <StudioPage toast={toast} setPage={setPage} />}
          {page === "deploy" && <DeployPage toast={toast} refreshKey={refreshKey} />}
          {page === "settings" && <SettingsPage email={user} toast={toast} />}
        </main>
      </div>
      {modal && <NewAgentModal onClose={() => setModal(false)} onCreated={onAgentCreated} />}
      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>
  );
}
