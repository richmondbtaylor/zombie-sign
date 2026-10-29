"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signerStatus } from "@/lib/types";
import type { Signer } from "@/lib/types";

type Row = { id: string; title: string; status: string; createdAt: string; signers: Signer[] };

const pillClass = (status: string) => (status === "Signed" ? "pill ok" : status === "Sent" ? "pill warn" : "pill");

export default function Dashboard() {
  const [docs, setDocs] = useState<Row[] | null>(null);

  useEffect(() => {
    fetch("/api/documents").then((r) => r.json()).then(setDocs);
  }, []);

  const count = (status: string) => (docs ?? []).filter((d) => d.status === status).length;
  // "Waiting on others" = sent documents where at least one person has not signed or declined yet.
  const waiting = (docs ?? []).filter(
    (d) => d.status !== "Draft" && d.signers.some((s) => signerStatus(s) === "waiting"),
  ).length;
  const recent = [...(docs ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="sub">Every document and where it stands.</p>
        </div>
        <Link href="/new" className="btn">New document</Link>
      </div>

      {!docs ? <p className="muted">Loading...</p> : (
        <>
          <div className="stats">
            <div className="stat"><div className="num">{count("Draft")}</div><div className="label">Draft</div></div>
            <div className="stat"><div className="num">{count("Sent")}</div><div className="label">Sent</div></div>
            <div className="stat"><div className="num">{count("Signed")}</div><div className="label">Signed</div></div>
            <div className="stat"><div className="num">{waiting}</div><div className="label">Waiting on others</div></div>
          </div>

          <div className="section-head">
            <h2>Recent documents</h2>
            <Link href="/documents">See all</Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty">
              <strong>No documents yet</strong>
              Create your first document and send it for signing.
              <div style={{ marginTop: 12 }}><Link href="/new" className="btn">New document</Link></div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Title</th><th>Status</th><th>Signed</th><th>Created</th></tr>
                </thead>
                <tbody>
                  {recent.map((d) => (
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
      )}
    </>
  );
}
