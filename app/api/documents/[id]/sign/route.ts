import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { Doc } from "@/lib/types";
import { addActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

// Sign a document. Body: { signerId, signature }
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const input = await req.json().catch(() => null);
  if (!input?.signerId || !input?.signature) {
    return NextResponse.json({ error: "Pick a signer and type your name." }, { status: 400 });
  }
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.status === "Draft") {
    return NextResponse.json({ error: "This document has not been sent yet." }, { status: 400 });
  }
  const signer = doc.signers.find((s) => s.id === input.signerId);
  if (!signer) return NextResponse.json({ error: "Signer not found." }, { status: 404 });

  // ZOMBIE: anyone with the link can sign as anyone. There is no check that the person is the signer (no email link token, no code).
  // ZOMBIE: no audit trail and no consent. E-SIGN and UETA need the time, IP address, consent to sign electronically, and a log of every step. Only signedAt is saved here.
  signer.signature = String(input.signature);
  signer.signedAt = new Date().toISOString();
  signer.declinedAt = "";
  signer.declineReason = "";
  addActivity(doc, "signed", signer.name);

  // ZOMBIE: signing order is ignored and the document is marked Signed after the FIRST signer. It should wait until every signer has signed, in order.
  doc.status = "Signed";

  await writeDb(db);
  return NextResponse.json({ status: doc.status });
}
