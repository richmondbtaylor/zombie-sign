import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { addActivity } from "@/lib/activity";
import type { Doc } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// A signer says no. Body: { signerId, reason }
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => null);
  if (!input?.signerId || !input?.reason) {
    return NextResponse.json({ error: "Pick a signer and give a reason." }, { status: 400 });
  }
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.status === "Draft") {
    return NextResponse.json({ error: "This document has not been sent yet." }, { status: 400 });
  }
  const signer = doc.signers.find((s) => s.id === input.signerId);
  if (!signer) return NextResponse.json({ error: "Signer not found." }, { status: 404 });
  if (signer.signedAt) return NextResponse.json({ error: "This person already signed." }, { status: 400 });

  // ZOMBIE: same as signing, anyone with the link can decline as anyone. The sender is not told, and a decline does not stop the document.
  signer.declinedAt = new Date().toISOString();
  signer.declineReason = String(input.reason);
  addActivity(doc, "declined", signer.name, signer.declineReason);

  await writeDb(db);
  return NextResponse.json({ ok: true });
}
