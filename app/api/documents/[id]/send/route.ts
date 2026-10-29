import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { Doc } from "@/lib/types";
import { addActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

// "Send" a document. It only flips the status and returns the link.
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const doc = (db.documents as Doc[]).find((d) => d.id === id);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (doc.signers.length === 0) {
    return NextResponse.json({ error: "Add at least one signer first." }, { status: 400 });
  }
  if (doc.status === "Draft") doc.status = "Sent";
  addActivity(doc, "sent", "You");
  await writeDb(db);

  // ZOMBIE: no email is sent. The signer never hears about it. Add an email service (Resend, Postmark...) and send each signer their link.
  const origin = new URL(req.url).origin;
  return NextResponse.json({ status: doc.status, link: `${origin}/sign/${doc.id}`, emailSent: false });
}
