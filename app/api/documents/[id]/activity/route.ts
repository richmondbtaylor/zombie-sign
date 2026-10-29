import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import type { Doc } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// ZOMBIE: the activity list is NOT a tamper-proof audit trail. These routes let anyone add, change or delete
// any line, with no login. A real audit trail is append-only, hashed, and stores the IP address and the consent.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc.activity ?? []);
}

// Add a line. Body: { type, who, note? }
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => null);
  if (!input?.type || !input?.who) return NextResponse.json({ error: "type and who are required." }, { status: 400 });
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!doc.activity) doc.activity = [];
  const line = { id: newId() + Math.floor(Math.random() * 1000), type: input.type, who: String(input.who), at: input.at ?? new Date().toISOString(), note: input.note };
  doc.activity.push(line);
  await writeDb(db);
  return NextResponse.json(line, { status: 201 });
}

// Change a line. Body: { lineId, type?, who?, at?, note? }
export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => null);
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  const line = doc?.activity?.find((a) => a.id === input?.lineId);
  if (!doc || !line) return NextResponse.json({ error: "Not found" }, { status: 404 });
  for (const key of ["type", "who", "at", "note"] as const) {
    if (typeof input[key] === "string") (line as Record<string, unknown>)[key] = input[key];
  }
  await writeDb(db);
  return NextResponse.json(line);
}

// Delete a line. Body: { lineId }
export async function DELETE(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => null);
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  doc.activity = (doc.activity ?? []).filter((a) => a.id !== input?.lineId);
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
