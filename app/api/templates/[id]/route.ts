import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import type { Template } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  const template = ((db.templates ?? []) as Template[]).find((t) => t.id === id);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}

// ZOMBIE: deletes right away. No confirmation, no undo, and anyone can delete.
export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const db = await readDb();
  db.templates = ((db.templates ?? []) as Template[]).filter((t) => t.id !== id) as typeof db.templates;
  await writeDb(db);
  return NextResponse.json({ ok: true });
}
