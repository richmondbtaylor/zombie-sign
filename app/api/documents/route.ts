import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import type { Doc } from "@/lib/types";
import { addActivity } from "@/lib/activity";

// List all documents (without the big PDF data).
export async function GET() {
  const db = await readDb();
  const docs = (db.documents as Doc[]).map(({ pdfData, ...rest }) => ({ ...rest, hasPdf: !!pdfData }));
  return NextResponse.json(docs);
}

// Create a document. Body: { title, body, signers?: [{name, email}], pdfName?, pdfData? }
export async function POST(req: Request) {
  const input = await req.json().catch(() => null);
  // ZOMBIE: weak validation. Only checks that a title exists. No size limit on PDFs, no email check. Validate on the server.
  if (!input?.title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const db = await readDb();
  const doc: Doc = {
    id: newId(),
    title: String(input.title),
    body: String(input.body ?? ""),
    status: "Draft",
    createdAt: new Date().toISOString(),
    signers: (input.signers ?? []).map((s: { name: string; email: string }) => ({
      id: newId() + Math.floor(Math.random() * 1000),
      name: s.name,
      email: s.email,
      signature: "",
      signedAt: "",
    })),
    pdfName: input.pdfName,
    pdfData: input.pdfData, // base64 stored right in the JSON file. Fine for a demo, bad for real files.
  };
  addActivity(doc, "created", "You");
  (db.documents as Doc[]).unshift(doc);
  await writeDb(db);
  return NextResponse.json({ id: doc.id }, { status: 201 });
}
