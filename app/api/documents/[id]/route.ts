import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { Doc } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// ZOMBIE: no login. Anyone who knows the id can read the full document and every signer's email.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { pdfData, ...rest } = doc;
  return NextResponse.json({ ...rest, hasPdf: !!pdfData });
}

// Edit the title or text.
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => ({}));
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // ZOMBIE: signed documents can still be edited. Once everyone has signed, block edits (return 409) and keep a hash of the signed text.
  if (typeof input.title === "string") doc.title = input.title;
  if (typeof input.body === "string") doc.body = input.body;
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
