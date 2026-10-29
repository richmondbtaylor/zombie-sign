"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Signer = { id: string; name: string; email: string; signedAt: string; declinedAt?: string };
type Doc = { id: string; title: string; body: string; status: string; signers: Signer[] };

// The page a signer opens from the share link.
export default function SignPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [signerId, setSignerId] = useState("");
  const [signature, setSignature] = useState("");
  const [consent, setConsent] = useState(false);
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");
  const [declining, setDeclining] = useState(false);

  async function load() {
    const res = await fetch(`/api/documents/${id}`);
    if (!res.ok) return setMessage("Document not found.");
    const d: Doc = await res.json();
    setDoc(d);
    setSignerId((cur) => cur || d.signers[0]?.id || "");
  }
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sign() {
    setMessage("");
    // ZOMBIE: the consent box is only a visual. It is not required and not saved. E-SIGN and UETA need recorded consent to sign electronically.
    const res = await fetch(`/api/documents/${id}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signerId, signature }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setMessage("Thank you. Your signature was saved.");
    load();
  }

  async function decline() {
    setMessage("");
    const res = await fetch(`/api/documents/${id}/decline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signerId, reason }),
    });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error);
    setMessage("Thank you. Your answer was saved. You declined to sign.");
    setDeclining(false);
    setReason("");
    load();
  }

  if (!doc) return <p className="muted">{message || "Loading..."}</p>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{doc.title}</h1>
          <p className="sub">Status: <span className="pill">{doc.status}</span></p>
        </div>
      </div>
      <div className="card" style={{ whiteSpace: "pre-wrap" }}>{doc.body}</div>

      <h2>Sign here</h2>
      <div className="card stack">
        {/* ZOMBIE: any visitor can pick any signer from this list. Identity is never checked. */}
        <label>I am signing as
          <select value={signerId} onChange={(e) => setSignerId(e.target.value)}>
            {doc.signers.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.email}){s.signedAt ? " - signed" : s.declinedAt ? " - declined" : ""}</option>)}
          </select>
        </label>
        <label>Type your full name
          <input value={signature} onChange={(e) => setSignature(e.target.value)} />
        </label>
        {signature && <div style={{ fontFamily: "cursive", fontSize: 32 }}>{signature}</div>}
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" style={{ width: "auto" }} checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          I agree to sign this document electronically.
        </label>
        <div className="row">
          <button onClick={sign} disabled={!signature}>Sign document</button>
          <button className="ghost danger" onClick={() => setDeclining(!declining)}>Decline to sign</button>
        </div>
        {declining && (
          <div className="stack">
            <label>Why are you declining?
              <textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
            <div><button className="danger" onClick={decline} disabled={!reason}>Confirm decline</button></div>
          </div>
        )}
        {message && <p className={message.startsWith("Thank") ? "muted" : "error"}>{message}</p>}
      </div>
    </>
  );
}
