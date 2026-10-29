import { NextResponse } from "next/server";
import { readDb, writeDb, newId } from "@/lib/db";
import type { Doc } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// Add a signer. Body: { name, email }
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => null);
  if (!input?.name || !input?.email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  doc.signers.push({
    id: newId() + Math.floor(Math.random() * 1000),
    name: String(input.name),
    email: String(input.email),
    signature: "",
    signedAt: "",
  });
  await writeDb(db);
  return NextResponse.json({ ok: true }, { status: 201 });
}
