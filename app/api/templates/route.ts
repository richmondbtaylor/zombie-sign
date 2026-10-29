import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import type { Doc, Template } from "@/lib/types";

// List templates.
// ZOMBIE: no login. Every visitor sees every template.
export async function GET() {
  const db = await readDb();
  return NextResponse.json(db.templates ?? []);
}

// Save a template. Body: { documentId } to copy a document, or { title, body }.
export async function POST(req: Request) {
  const input = await req.json().catch(() => null);
  const db = await readDb();
  let title = String(input?.title ?? "");
  let body = String(input?.body ?? "");
  if (input?.documentId) {
    const doc = (db.documents as Doc[]).find((d) => d.id === input.documentId);
    if (!doc) return NextResponse.json({ error: "Document not found." }, { status: 404 });
    title = title || doc.title;
    body = body || doc.body;
  }
  if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });
  const template: Template = { id: newId(), title, body, createdAt: new Date().toISOString() };
  const list = (db.templates ?? []) as Template[];
  list.unshift(template);
  db.templates = list;
  await writeDb(db);
  return NextResponse.json(template, { status: 201 });
}
