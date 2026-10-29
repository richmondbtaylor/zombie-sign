"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Signer } from "@/lib/types";

type Row = { id: string; title: string; status: string; createdAt: string; signers: Signer[] };

const FILTERS = ["All", "Draft", "Sent", "Signed"];
const pillClass = (status: string) => (status === "Signed" ? "pill ok" : status === "Sent" ? "pill warn" : "pill");

export default function Documents() {
  const [docs, setDocs] = useState<Row[] | null>(null);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/documents").then((r) => r.json()).then(setDocs);
  }, []);

  const shown = (docs ?? []).filter((d) => filter === "All" || d.status === filter);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Documents</h1>
          <p className="sub">All your documents in one list.</p>
        </div>
        <Link href="/new" className="btn">New document</Link>
      </div>

      <div className="row" style={{ marginBottom: 14 }}>
        {FILTERS.map((f) => (
          <button key={f} className={f === filter ? "btn-sm" : "btn-sm ghost"} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {!docs ? <p className="muted">Loading...</p> : shown.length === 0 ? (
        <div className="empty"><strong>No documents here</strong>Nothing matches this filter yet.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Title</th><th>Status</th><th>Signed</th><th>Created</th></tr>
            </thead>
            <tbody>
              {shown.map((d) => (
                <tr key={d.id}>
                  <td><Link href={`/documents/${d.id}`}>{d.title}</Link></td>
                  <td><span className={pillClass(d.status)}>{d.status}</span></td>
                  <td>{d.signers.filter((s) => s.signedAt).length} of {d.signers.length}</td>
                  <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
