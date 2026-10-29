import { NextResponse } from "next/server";

// ZOMBIE: "download signed copy" is not built. Make a PDF with the document text, each signature, the times, and the audit trail.
export async function GET() {
  return NextResponse.json({ error: "Not built yet, see ZOMBIE.md" }, { status: 501 });
}
