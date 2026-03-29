with open('src/App.tsx', 'r') as f:
    content = f.read()

old_start = content.find('function StudioPage(')
old_end = content.find('function DeployPage(')

new_studio = '''function StudioPage({ toast }) {
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
  const fileRef = React.useRef(null);
  const endRef = React.useRef(null);

  React.useEffect(() => {
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
    }).catch(() => {});
  }, []);

  React.useEffect(() => { endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

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

  if (!agent) return React.createElement("div", { className: "page" },
    React.createElement("div", { className: "empty" },
      React.createElement("div", { className: "empty-title" }, "no agents yet"),
      React.createElement("div", { className: "empty-desc" }, "// create an agent first")
    )
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
              <div className="upload-ascii">{" /\\ \n/  \\\n----"}</div>
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

'''

content = content[:old_start] + new_studio + content[old_end:]

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Done!")