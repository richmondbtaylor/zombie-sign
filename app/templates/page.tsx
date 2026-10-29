"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Template } from "@/lib/types";

export default function Templates() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setTemplates(await fetch("/api/templates").then((r) => r.json()));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function add() {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setTitle(""); setBody(""); setMessage("");
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Templates</h1>
          <p className="sub">Reusable documents. Start a new one in one click.</p>
        </div>
      </div>

      {!templates ? <p className="muted">Loading...</p> : templates.length === 0 ? (
        <div className="empty"><strong>No templates yet</strong>Save any document as a template, or add one below.</div>
      ) : (
        <div className="grid">
          {templates.map((t) => (
            <div key={t.id} className="card stack">
              <strong>{t.title}</strong>
              <div className="muted" style={{ fontSize: 14 }}>{t.body.slice(0, 110)}{t.body.length > 110 ? "..." : ""}</div>
              <div className="row">
                <Link href={`/new?template=${t.id}`} className="btn btn-sm">Use template</Link>
                <button className="ghost btn-sm" onClick={() => remove(t.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>Add a template</h2>
      <div className="card stack">
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label>Text<textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        {message && <p className="error">{message}</p>}
        <div><button onClick={add}>Save template</button></div>
      </div>
    </>
  );
}
