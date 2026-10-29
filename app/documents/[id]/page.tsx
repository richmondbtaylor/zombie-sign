"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { signerStatus } from "@/lib/types";
import type { Activity, Signer } from "@/lib/types";

type Doc = { id: string; title: string; body: string; status: string; signers: Signer[]; activity?: Activity[]; pdfName?: string; hasPdf?: boolean };

const statusPill = { signed: "pill ok", declined: "pill bad", waiting: "pill warn" };
const docPill = (status: string) => (status === "Signed" ? "pill ok" : status === "Sent" ? "pill warn" : "pill");

// Turn an activity line into a sentence.
function describe(a: Activity) {
  if (a.type === "created") return "Document created";
  if (a.type === "sent") return "Sent for signing";
  if (a.type === "signed") return `${a.who} signed`;
  return `${a.who} declined to sign${a.note ? `: "${a.note}"` : ""}`;
}

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [link, setLink] = useState("");
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) return setMessage("Document not found.");
    const d: Doc = await res.json();
    setDoc(d);
    setTitle(d.title);
    setBody(d.body);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function addSigner() {
    const res = await fetch(`/api/documents/${id}/signers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setName(""); setEmail(""); setMessage("");
    load();
  }

  async function send() {
    const res = await fetch(`/api/documents/${id}/send`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setLink(data.link);
    setMessage("");
    load();
  }

  async function saveEdit() {
    await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setEditing(false);
    load();
  }

  async function saveAsTemplate() {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: id }),
    });
    setNotice(res.ok ? "Saved as a template." : "Could not save the template.");
  }

  if (!doc) return <p className="muted">{message || "Loading..."}</p>;
  const activity = [...(doc.activity ?? [])].sort((a, b) => a.at.localeCompare(b.at));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{doc.title}</h1>
          <p className="sub">Status: <span className={docPill(doc.status)}>{doc.status}</span></p>
        </div>
        <div className="row">
          <button className="ghost" onClick={saveAsTemplate}>Save as template</button>
          <Link href="/documents" className="btn ghost">All documents</Link>
        </div>
      </div>
      {notice && <p className="muted">{notice} <Link href="/templates">See templates</Link></p>}

      <div className="card stack">
        {editing ? (
          <>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="row"><button onClick={saveEdit}>Save</button><button className="ghost" onClick={() => setEditing(false)}>Cancel</button></div>
          </>
        ) : (
          <>
            <div style={{ whiteSpace: "pre-wrap" }}>{doc.body || <span className="muted">No text.</span>}</div>
            {doc.hasPdf && <p className="muted">Attached PDF: {doc.pdfName}</p>}
            <div><button className="ghost" onClick={() => setEditing(true)}>Edit</button></div>
          </>
        )}
      </div>

      <h2>Signers</h2>
      {doc.signers.length === 0 ? (
        <div className="empty"><strong>No signers yet</strong>Add at least one person below before you send.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Details</th></tr></thead>
            <tbody>
              {doc.signers.map((s) => {
                const st = signerStatus(s);
                return (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td><span className={statusPill[st]}>{st}</span></td>
                    <td className="wrap">
                      {st === "signed" && <span style={{ fontFamily: "cursive", fontSize: 18 }}>{s.signature}</span>}
                      {st === "declined" && <span className="muted">{s.declineReason}</span>}
                      {st === "waiting" && <span className="muted">Has not responded</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="form-row" style={{ marginTop: 12 }}>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="ghost" onClick={addSigner}>Add signer</button>
      </div>

      <h2>Send</h2>
      <div className="card stack">
        <p className="muted" style={{ margin: 0 }}>This does not email anyone yet. Copy the link and send it yourself.</p>
        <div className="row">
          <button onClick={send}>Send</button>
          <button className="ghost" onClick={() => setMessage("Not built yet, see ZOMBIE.md")}>Download signed copy</button>
        </div>
        {link && <input readOnly value={link} onFocus={(e) => e.target.select()} />}
        {message && <p className="error">{message}</p>}
      </div>

      <h2>Activity</h2>
      {activity.length === 0 ? (
        <div className="empty"><strong>No activity yet</strong>Created, sent and signed steps show up here.</div>
      ) : (
        <div className="card">
          <ul className="timeline">
            {activity.map((a) => (
              <li key={a.id}>
                <span className={`dot ${a.type}`} />
                <div>
                  <div>{describe(a)}</div>
                  <div className="when">{new Date(a.at).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
