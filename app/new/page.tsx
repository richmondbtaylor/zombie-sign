"use client";
import { useEffect, useState } from "react";
import type { Template } from "@/lib/types";
import { useRouter } from "next/navigation";

type SignerInput = { name: string; email: string };

export default function NewDocument() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pdf, setPdf] = useState<{ name: string; data: string } | null>(null);
  const [signers, setSigners] = useState<SignerInput[]>([{ name: "", email: "" }]);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");

  // Load the templates. If the link has ?template=<id> (from the Templates page), fill the form with it.
  useEffect(() => {
    fetch("/api/templates").then((r) => r.json()).then((list: Template[]) => {
      setTemplates(list);
      const wanted = new URLSearchParams(window.location.search).get("template");
      const found = list.find((t) => t.id === wanted);
      if (found) pickTemplate(found.id, list);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function pickTemplate(id: string, list = templates) {
    setTemplateId(id);
    const t = list.find((x) => x.id === id);
    if (t) { setTitle(t.title); setBody(t.body); }
  }

  // Read the chosen PDF as base64 so it can be saved in the JSON database.
  function pickPdf(file?: File) {
    if (!file) return setPdf(null);
    const reader = new FileReader();
    reader.onload = () => setPdf({ name: file.name, data: String(reader.result).split(",")[1] });
    reader.readAsDataURL(file);
  }

  function updateSigner(i: number, key: keyof SignerInput, value: string) {
    setSigners(signers.map((s, n) => (n === i ? { ...s, [key]: value } : s)));
  }

  async function save() {
    setError("");
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        pdfName: pdf?.name,
        pdfData: pdf?.data,
        signers: signers.filter((s) => s.name && s.email),
      }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error ?? "Could not save.");
    router.push(`/documents/${data.id}`);
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>New document</h1>
          <p className="sub">Type or paste the text, or attach a PDF. Then add who needs to sign.</p>
        </div>
      </div>
      <div className="card stack">
        {templates.length > 0 && (
          <label>Start from a template
            <select value={templateId} onChange={(e) => pickTemplate(e.target.value)}>
              <option value="">Blank document</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </label>
        )}
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
        <label>Text<textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} /></label>
        <label>Or attach a PDF<input type="file" accept="application/pdf" onChange={(e) => pickPdf(e.target.files?.[0])} /></label>
        <h2 style={{ margin: "8px 0 0" }}>Signers</h2>
        {signers.map((s, i) => (
          <div className="form-row" key={i}>
            <input placeholder="Name" value={s.name} onChange={(e) => updateSigner(i, "name", e.target.value)} />
            <input placeholder="Email" value={s.email} onChange={(e) => updateSigner(i, "email", e.target.value)} />
          </div>
        ))}
        <div className="row">
          <button className="ghost" onClick={() => setSigners([...signers, { name: "", email: "" }])}>Add another signer</button>
        </div>
        {error && <p className="error">{error}</p>}
        <div><button onClick={save}>Save as draft</button></div>
      </div>
    </>
  );
}
